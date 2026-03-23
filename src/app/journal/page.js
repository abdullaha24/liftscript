import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import JournalRunner from "@/components/Journal/JournalRunner"

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      programs: {
        include: {
          weekLogs: {
            orderBy: { weekNumber: 'desc' },
            take: 1,
            include: {
              sessionLogs: {
                orderBy: { date: 'asc' },
                include: {
                  exercises: { orderBy: { order: 'asc' } },
                  trainingDay: { include: { exercises: { orderBy: { order: 'asc' } } } }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user?.setupDone || !user.programs || user.programs.length === 0) {
    redirect("/setup")
  }

  const activeProgram = user.programs[0]
  const currentWeek = activeProgram.weekLogs[0]

  if (!currentWeek) {
    return (
      <div className="journal-layout text-center" style={{ paddingTop: '4rem' }}>
        <p className="text-muted">No active week found. Failed to compile schedule.</p>
      </div>
    )
  }

  let targetSession = currentWeek.sessionLogs.find(s => !s.completed)
  const isWeekComplete = !targetSession
  if (isWeekComplete) {
    targetSession = currentWeek.sessionLogs[currentWeek.sessionLogs.length - 1]
  }

  return (
    <div className="journal-layout animate-fade-in">
      {/* Program name header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          {activeProgram.name}
        </h1>
        <span className="badge badge-progress" style={{ marginTop: '0.25rem' }}>
          Week {currentWeek.weekNumber}
        </span>
      </div>

      <JournalRunner
        sessionLog={targetSession}
        isWeekComplete={isWeekComplete}
      />
    </div>
  )
}
