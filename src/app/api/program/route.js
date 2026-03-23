import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const data = await req.json()
    
    // Safety check against repeat creation
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user?.setupDone) {
      return Response.json({ error: "Setup already completed" }, { status: 400 })
    }

    if (!data.trainingDays || data.trainingDays.length === 0) {
      return Response.json({ error: "Program requires at least one training day" }, { status: 400 })
    }

    const { program } = await db.$transaction(async (tx) => {
      // Create Core Program + Definitions
      const p = await tx.program.create({
        data: {
          userId,
          name: data.name || "My Program",
          cycleDays: data.cycleDays || 7,
          trainingDays: {
            create: data.trainingDays.map((day, i) => ({
              name: day.name,
              dayIndex: i,
              dayOfWeek: day.dayOfWeek || null,
              exercises: {
                create: day.exercises.map((ex, j) => ({
                  name: ex.name,
                  order: j,
                  currentWeight: ex.currentWeight || 0,
                  targetSets: ex.targetSets || 3,
                  targetReps: ex.targetReps || 10,
                  weightIncrement: ex.weightIncrement || 2.5,
                  restSeconds: ex.restSeconds || 90,
                  failureAction: data.globalFailureAction || "MORE_SETS",
                  failureValue: data.globalFailureValue || null
                }))
              }
            }))
          }
        },
        include: {
          trainingDays: {
            include: { exercises: true }
          }
        }
      })

      // Generate Week 1 Baseline SessionLogs
      await tx.weekLog.create({
        data: {
          programId: p.id,
          weekNumber: 1,
          startDate: new Date(),
          sessionLogs: {
            create: p.trainingDays.map((td) => ({
              trainingDayId: td.id,
              date: new Date(), // Using today for sequential generation. For Weekly tabs will offset by dayOfWeek matching algorithm
              exercises: {
                create: td.exercises.map((ex) => ({
                  exerciseId: ex.id,
                  order: ex.order,
                  prescribedWeight: ex.currentWeight,
                  prescribedSets: ex.targetSets,
                  prescribedReps: ex.targetReps,
                  actualReps: "[]"
                }))
              }
            }))
          }
        }
      })

      // Mark user as active globally
      await tx.user.update({
        where: { id: userId },
        data: { setupDone: true }
      })

      return { program: p }
    })

    return Response.json({ success: true, programId: program.id })
  } catch (error) {
    console.error("Program create error:", error)
    return Response.json({ error: "Failed to create program" }, { status: 500 })
  }
}
