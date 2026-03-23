'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SplitSelector from './SplitSelector'
import DayBuilder from './DayBuilder'
import FailureConfig from './FailureConfig'

const LOCAL_STORAGE_KEY = 'liftscript_wizard_state'

export default function ProgramWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [programData, setProgramData] = useState({
    name: 'My Program',
    cycleDays: 7,
    trainingDays: [],
    globalFailureAction: 'MORE_SETS',
    globalFailureValue: null
  })

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.trainingDays) setProgramData(parsed)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(programData))
  }, [programData])

  const nextStep = () => {
    setError('')
    if (step === 2) {
      if (programData.trainingDays.length === 0) {
        setError('Please add at least one training day.')
        return
      }
      for (const day of programData.trainingDays) {
        if (day.exercises.length === 0) {
          setError(`Training day "${day.name}" must have at least one exercise.`)
          return
        }
        if (day.exercises.length > 20) {
          setError(`Training day "${day.name}" has too many exercises (max 20).`)
          return
        }
      }
    }
    setStep(s => s + 1)
  }

  const prevStep = () => { setError(''); setStep(s => s - 1) }

  const submitProgram = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData)
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to create program')
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      router.push('/journal')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress bar + back */}
      <div className="wizard-header">
        <div className="progress-bar" style={{ flex: 1 }}>
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`progress-segment ${step >= n ? 'progress-segment--active' : ''}`}
            />
          ))}
        </div>
        {step > 1 && (
          <button onClick={prevStep} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            ← Back
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {step === 1 && <SplitSelector programData={programData} setProgramData={setProgramData} onNext={nextStep} />}
      {step === 2 && <DayBuilder programData={programData} setProgramData={setProgramData} onNext={nextStep} />}
      {step === 3 && <FailureConfig programData={programData} setProgramData={setProgramData} onFinish={submitProgram} loading={loading} />}
    </div>
  )
}
