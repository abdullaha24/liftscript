import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req) {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        programs: {
          include: {
            trainingDays: { include: { exercises: { orderBy: { order: 'asc' } } } },
            weekLogs: { orderBy: { weekNumber: 'desc' }, take: 1, include: { sessionLogs: true } }
          }
        }
      }
    })

    if (!user || user.programs.length === 0) {
      return Response.json({ error: "No active program exists." }, { status: 400 })
    }

    const activeProgram = user.programs[0]
    const lastWeek = activeProgram.weekLogs[0]

    if (lastWeek && lastWeek.sessionLogs.some(s => !s.completed)) {
      return Response.json({ error: "Current week is not fully completed." }, { status: 409 })
    }

    const nextWeekNumber = lastWeek ? lastWeek.weekNumber + 1 : 1

    const newWeek = await db.$transaction(async (tx) => {
      return await tx.weekLog.create({
        data: {
          programId: activeProgram.id,
          weekNumber: nextWeekNumber,
          startDate: new Date(),
          sessionLogs: {
            create: activeProgram.trainingDays.map((td) => ({
              trainingDayId: td.id,
              date: new Date(),
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
    })

    return Response.json({ success: true, weekLogId: newWeek.id })
  } catch (error) {
    console.error("Week generation error:", error)
    return Response.json({ error: "Compiling the new week failed" }, { status: 500 })
  }
}
