export function calculateNextPrescription(exerciseConfig, actualRepsArray) {
  const {
    targetSets,
    targetReps,
    currentWeight,
    weightIncrement,
    failureAction,
    failureValue
  } = exerciseConfig

  let success = true
  let totalAchievedReps = 0
  
  if (actualRepsArray.length < targetSets) {
    success = false
  }
  
  for (let i = 0; i < targetSets; i++) {
    const reps = actualRepsArray[i] || 0
    totalAchievedReps += reps
    if (reps < targetReps) success = false
  }

  if (success) {
    return {
      prescribedWeight: currentWeight + weightIncrement,
      prescribedSets: targetSets,
      prescribedReps: targetReps,
      updatedCurrentWeight: currentWeight + weightIncrement
    }
  }

  // Handle Failures
  switch (failureAction) {
    case 'RETRY':
      return {
        prescribedWeight: currentWeight,
        prescribedSets: targetSets,
        prescribedReps: targetReps,
        updatedCurrentWeight: currentWeight
      }

    case 'DELOAD':
      const pct = (failureValue || 10) / 100
      let newWeight = currentWeight * (1 - pct)
      
      // strictly round to nearest discrete increment
      if (weightIncrement > 0) {
        newWeight = Math.round(newWeight / weightIncrement) * weightIncrement
      }
      
      if (newWeight < weightIncrement) newWeight = weightIncrement
        
      return {
        prescribedWeight: newWeight,
        prescribedSets: targetSets,
        prescribedReps: targetReps,
        updatedCurrentWeight: newWeight
      }

    case 'MORE_SETS':
    default:
      const targetVolume = targetSets * targetReps
      const maxSets = 10
      let nextSets = targetSets + 1
      if (nextSets > maxSets) nextSets = maxSets
      
      let nextReps = Math.ceil(targetVolume / nextSets)
      if (nextReps < 1) nextReps = 1
      
      return {
        prescribedWeight: currentWeight,
        prescribedSets: nextSets,
        prescribedReps: nextReps,
        updatedCurrentWeight: currentWeight
      }
  }
}
