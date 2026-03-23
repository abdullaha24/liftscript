import { calculateNextPrescription } from "../src/lib/progression"
import { describe, it, expect } from "vitest"

describe("Progression Engine Math", () => {
  const baseConfig = {
    targetSets: 4,
    targetReps: 8,
    currentWeight: 60,
    weightIncrement: 2.5,
    failureAction: "MORE_SETS",
    failureValue: null
  }

  it("should incrementally bump weight purely on full sets completion", () => {
    const next = calculateNextPrescription(baseConfig, [8, 8, 8, 8])
    expect(next.prescribedWeight).toBe(62.5)
    expect(next.prescribedSets).toBe(4)
    expect(next.prescribedReps).toBe(8)
  })

  it("should fail gracefully if fewer sets recorded than target", () => {
    const next = calculateNextPrescription(baseConfig, [8, 8])
    // Handled by MORE_SETS logic
    expect(next.prescribedWeight).toBe(60) // no bump
    expect(next.prescribedSets).toBe(5)
    expect(next.prescribedReps).toBe(7) // 32 volume / 5 = 6.4 => ceil(7)
  })

  it("should recalculate MORE_SETS logic accurately on missed rep", () => {
    const next = calculateNextPrescription(baseConfig, [8, 8, 8, 7])
    // failed: MORE_SETS triggers.
    // volume = 32. sets = 5. volume/sets = 6.4 => ceil => 7
    expect(next.prescribedWeight).toBe(60)
    expect(next.prescribedSets).toBe(5)
    expect(next.prescribedReps).toBe(7)
  })

  it("should strictly limit MORE_SETS to 10 sets max", () => {
    const highSetCfg = { ...baseConfig, targetSets: 10, targetReps: 4 }
    const next = calculateNextPrescription(highSetCfg, [4, 4, 4, 3, 3, 3, 3, 3, 3, 3])
    expect(next.prescribedSets).toBe(10) // Cannot exceed 10
    expect(next.prescribedReps).toBe(4) // 40 / 10 = 4
  })

  it("should statically rerun requirements on RETRY action", () => {
    const retryCfg = { ...baseConfig, failureAction: "RETRY" }
    const next = calculateNextPrescription(retryCfg, [7, 8, 8, 8])
    expect(next.prescribedWeight).toBe(60)
    expect(next.prescribedSets).toBe(4)
    expect(next.prescribedReps).toBe(8)
  })

  it("should DELOAD exact percentage and map to discrete bounds", () => {
    const deloadCfg = { ...baseConfig, currentWeight: 100, failureAction: "DELOAD", failureValue: 12.5 }
    // 12.5% of 100 is 12.5. Leaves 87.5. Increment is 2.5. 87.5 is multiple of 2.5.
    const next = calculateNextPrescription(deloadCfg, [8, 7, 6, 5])
    expect(next.prescribedWeight).toBe(87.5)
  })

  it("should DELOAD strictly down to the baseline increment, never 0 or negative", () => {
    const lightWeight = { ...baseConfig, currentWeight: 5, failureAction: "DELOAD", failureValue: 50, weightIncrement: 2.5 }
    // 50% of 5 is 2.5.
    const next = calculateNextPrescription(lightWeight, [0, 0, 0, 0])
    expect(next.prescribedWeight).toBe(2.5)

    const lighterWeight = { ...baseConfig, currentWeight: 2.5, failureAction: "DELOAD", failureValue: 50, weightIncrement: 2.5 }
    // 50% of 2.5 = 1.25. Bounds to minimum 2.5.
    const next2 = calculateNextPrescription(lighterWeight, [0, 0, 0, 0])
    expect(next2.prescribedWeight).toBe(2.5)
  })
})
