'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'

/* ─── Circular SVG Rest Timer ─────────────────────────────────
   Ring depletes from full → empty over `initialSeconds`.
   Colors: green (>50%) → orange (20–50%) → red (<20%) → "GO!" pulse
   ──────────────────────────────────────────────────────────── */
function RestTimer({ timer, initialSeconds }) {
  const R = 20
  const CIRC = 2 * Math.PI * R
  const ratio = initialSeconds > 0 ? Math.max(0, timer) / initialSeconds : 0
  const offset = CIRC * (1 - ratio)

  const stroke =
    ratio > 0.5 ? 'var(--success)' :
    ratio > 0.2 ? 'var(--warning)' :
    timer > 0   ? 'var(--danger)' :
                  'var(--brand)'

  if (timer === null) return null

  return (
    <div className="timer-container">
      <div className="timer-ring-wrap">
        <svg className="timer-ring" viewBox="0 0 48 48">
          <circle className="timer-ring-bg" cx="24" cy="24" r={R} />
          <circle
            className="timer-ring-fg"
            cx="24" cy="24" r={R}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            stroke={stroke}
          />
        </svg>
      </div>
      {timer > 0 ? (
        <span className="timer-text" style={{ color: stroke }}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </span>
      ) : (
        <span className="timer-text timer-text--go">GO!</span>
      )}
    </div>
  )
}

/* ─── PR Modal ─────────────────────────────────────────────────
   Cosmetic overlay only. router.refresh() has already fired.
   ──────────────────────────────────────────────────────────── */
function PRModal({ prs, onDismiss }) {
  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🏆 New PR!</div>
        <p className="modal-subtitle">You set a new personal record on:</p>
        <ul className="modal-pr-list">
          {prs.map(p => (
            <li key={p.exerciseName} className="modal-pr-item">{p.exerciseName}</li>
          ))}
        </ul>
        <button className="btn btn-primary w-full" onClick={onDismiss}>
          Let&apos;s Go! 💪
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────*/
export default function JournalRunner({ sessionLog, isWeekComplete }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(null)
  const [prModalData, setPrModalData] = useState(null)
  const initialTimerRef = useRef(null)

  const [actualReps, setActualReps] = useState(() => {
    const state = {}
    sessionLog?.exercises?.forEach(ex => {
      let parsed = []
      try { parsed = JSON.parse(ex.actualReps) } catch (e) {}
      state[ex.id] = Array(ex.prescribedSets).fill(null).map((_, i) => parsed[i] ?? null)
    })
    return state
  })

  /* Timer countdown */
  useEffect(() => {
    let interval = null
    if (timer !== null) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  /* Unsaved-reps guard */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!actualReps) return
      const hasUnsaved = Object.values(actualReps).some(arr => arr.some(r => r !== null))
      if (hasUnsaved && sessionLog && !sessionLog.completed) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [actualReps, sessionLog])

  const triggerConfetti = () => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })

  const handleTapSet = (exerciseId, setIndex, prescribedReps, restSeconds) => {
    if (sessionLog.completed) return
    setActualReps(prev => {
      const current = prev[exerciseId][setIndex]
      const nextArr = [...prev[exerciseId]]
      if (current === null) {
        nextArr[setIndex] = prescribedReps
        const secs = restSeconds || 90
        initialTimerRef.current = secs
        setTimer(secs)
      } else {
        nextArr[setIndex] = null
      }
      return { ...prev, [exerciseId]: nextArr }
    })
  }

  const handleInputChange = (exerciseId, setIndex, val) => {
    if (sessionLog.completed) return
    const num = parseInt(val)
    setActualReps(prev => {
      const nextArr = [...prev[exerciseId]]
      nextArr[setIndex] = isNaN(num) ? null : num
      return { ...prev, [exerciseId]: nextArr }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        sessionLogId: sessionLog.id,
        exercises: Object.entries(actualReps).map(([id, reps]) => ({
          id,
          reps: reps.map(r => r === null ? 0 : r)
        }))
      }

      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      /* Always refresh immediately — modal is cosmetic only */
      router.refresh()

      if (data.newPRs?.length > 0) {
        triggerConfetti()
        setPrModalData(data.newPRs)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteWeek = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/week', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed generating week')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* Derived: how many exercises has the user tapped at least one set on? */
  const completedExCount = Object.values(actualReps).filter(
    arr => arr.some(r => r !== null)
  ).length
  const totalExCount = sessionLog?.exercises?.length ?? 0

  /* ── Week Complete Screen ── */
  if (isWeekComplete) {
    return (
      <div className="card card-success-border week-complete animate-fade-in">
        <div className="week-complete-title">🎉 Week Done!</div>
        <p className="text-muted mb-4">You crushed every session this week. Ready to step up?</p>
        {error && <div className="error-badge mb-2">{error}</div>}
        <button
          onClick={handleCompleteWeek}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? 'Generating...' : 'Start Next Week →'}
        </button>
      </div>
    )
  }

  /* ── Main Workout Screen ── */
  return (
    <div>
      {/* Sticky header: day name + progress + timer */}
      <div className="sticky-header">
        <span className="sticky-header-title">{sessionLog.trainingDay?.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!sessionLog.completed && totalExCount > 0 && (
            <span className="badge badge-progress">
              {completedExCount}/{totalExCount}
            </span>
          )}
          <RestTimer timer={timer} initialSeconds={initialTimerRef.current} />
        </div>
      </div>

      {/* Error */}
      {error && <div className="error-badge mb-2">{error}</div>}

      {/* Exercise cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(() => {
          // Pre-index training day exercises to avoid O(N*M) lookup inside the loop
          const sourceExMap = Object.fromEntries(
            (sessionLog.trainingDay?.exercises || []).map(e => [e.id, e])
          )

          return sessionLog.exercises.map(ex => {
            const sourceEx = sourceExMap[ex.exerciseId]
            const exerciseName = sourceEx?.name || 'Exercise'

            return (
              <div key={ex.id} className="exercise-card">
                <div className="exercise-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="exercise-name">{exerciseName}</span>
                  <span className="badge-weight">{ex.prescribedWeight}kg</span>
                </div>
                <span className="exercise-prescription">
                  {ex.prescribedSets} × {ex.prescribedReps}
                </span>
              </div>

              <div className="sets-grid">
                {actualReps[ex.id]?.map((rep, idx) => {
                  let btnClass = 'set-btn'
                  if (sessionLog.completed) {
                    if (rep >= ex.prescribedReps) btnClass += ' set-btn--success'
                    else if (rep > 0)             btnClass += ' set-btn--warning'
                    else                           btnClass += ' set-btn--miss'
                  } else if (rep !== null) {
                    btnClass += ' set-btn--filled'
                  }

                  return (
                    <div key={idx} className="set-col">
                      <span className="set-label">Set {idx + 1}</span>
                      <input
                        type="number"
                        className={btnClass}
                        value={rep === null ? '' : rep}
                        onChange={(e) => handleInputChange(ex.id, idx, e.target.value)}
                        onClick={() => {
                          if (rep === null && !sessionLog.completed) {
                            handleTapSet(ex.id, idx, ex.prescribedReps, sourceEx?.restSeconds)
                          }
                        }}
                        disabled={sessionLog.completed || loading}
                        placeholder="—"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })})()}
      </div>

      {/* Finish button — fixed bottom */}
      {!sessionLog.completed && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary btn-finish"
        >
          {loading ? 'Saving... do not close' : 'Finish Workout 💪'}
        </button>
      )}

      {/* PR Modal — cosmetic overlay, refresh already fired */}
      {prModalData && (
        <PRModal prs={prModalData} onDismiss={() => setPrModalData(null)} />
      )}
    </div>
  )
}
