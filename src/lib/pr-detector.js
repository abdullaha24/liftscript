import { db } from "./db"

export async function detectAndSavePRs(userId, sessionExercisesRaw) {
  const newPRs = []

  // Ensure unique parsing by exId
  for (const sessionEx of sessionExercisesRaw) {
    // Lookup name from actual blueprint
    const exBlueprint = await db.exercise.findUnique({
      where: { id: sessionEx.exerciseId }
    })
    
    if (!exBlueprint) continue
    
    // Check if achieved any reps at all
    const repsArr = typeof sessionEx.actualReps === 'string' 
      ? JSON.parse(sessionEx.actualReps) 
      : sessionEx.actualReps
      
    const validSet = repsArr.some(r => r > 0)
    if (!validSet) continue

    const record = await db.personalRecord.findFirst({
      where: { userId, exerciseName: exBlueprint.name }
    })

    const currentLiftedWeight = sessionEx.prescribedWeight

    if (!record || currentLiftedWeight > record.weight) {
      const maxReps = Math.max(...repsArr)
      
      if (record) {
        await db.personalRecord.update({
          where: { id: record.id },
          data: { weight: currentLiftedWeight, reps: maxReps, achievedAt: new Date() }
        })
      } else {
        await db.personalRecord.create({
          data: { userId, exerciseName: exBlueprint.name, weight: currentLiftedWeight, reps: maxReps }
        })
      }
      
      newPRs.push({ 
        exerciseName: exBlueprint.name, 
        oldWeight: record?.weight || 0, 
        newWeight: currentLiftedWeight 
      })
    }
  }

  return newPRs
}
