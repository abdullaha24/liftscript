import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"
import { calculateNextPrescription } from "@/lib/progression"
import { detectAndSavePRs } from "@/lib/pr-detector"

export async function POST(req) {
  try {
    const session = await requireAuth()
    const { sessionLogId, exercises } = await req.json()

    // Resource verification
    const slog = await db.sessionLog.findUnique({
      where: { id: sessionLogId },
      include: { weekLog: { include: { program: true } } }
    })
    
    if (!slog) return Response.json({ error: "Not found" }, { status: 404 })
    if (slog.weekLog.program.userId !== session.user.id) return Response.json({ error: "Forbidden" }, { status: 403 })
    if (slog.completed) return Response.json({ error: "Session already completed" }, { status: 409 })

    // PHASE 1: Reliable Mutation Save
    await db.$transaction(async (tx) => {
      for (const ex of exercises) {
        
        // Safety: No nonsensical inputs allowed
        const safeReps = ex.reps.map(r => {
          let num = parseInt(r)
          if (isNaN(num) || num < 0) num = 0
          if (num > 999) num = 999
          return num
        })
        
        await tx.sessionExercise.update({
          where: { id: ex.id },
          data: { actualReps: JSON.stringify(safeReps) }
        })
      }
      
      await tx.sessionLog.update({
        where: { id: sessionLogId },
        data: { completed: true }
      })
    })

    // PHASE 2: Math, progression, and PRs (Guaranteed not to affect Phase 1 on crash)
    let newPRs = []
    try {
      const fullLog = await db.sessionLog.findUnique({
        where: { id: sessionLogId },
        include: { exercises: true }
      })

      newPRs = await detectAndSavePRs(session.user.id, fullLog.exercises)

      await db.$transaction(async (tx) => {
        for (const sessionEx of fullLog.exercises) {
          const blueprint = await tx.exercise.findUnique({ where: { id: sessionEx.exerciseId }})
          if (!blueprint) continue
          
          const actualReps = JSON.parse(sessionEx.actualReps)
          
          const nextConfig = calculateNextPrescription(blueprint, actualReps)
          
          await tx.exercise.update({
            where: { id: blueprint.id },
            data: {
              currentWeight: nextConfig.prescribedWeight,
              targetSets: nextConfig.prescribedSets,
              targetReps: nextConfig.prescribedReps
            }
          })
        }
      })
    } catch (phase2Error) {
      console.error("Progression math phase failed. Data is safe.", phase2Error)
    }

    return Response.json({ success: true, newPRs })

  } catch (error) {
    console.error("Session save error:", error)
    return Response.json({ error: "Failed to save session" }, { status: 500 })
  }
}
