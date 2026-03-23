'use client'

export default function FailureConfig({ programData, setProgramData, onFinish, loading }) {

  const handleActionChange = (e) => {
    const val = e.target.value
    let nv = null
    if (val === 'DELOAD') nv = 10
    setProgramData({ ...programData, globalFailureAction: val, globalFailureValue: nv })
  }

  const handleValueChange = (e) => {
    setProgramData({ ...programData, globalFailureValue: parseFloat(e.target.value) || 0 })
  }

  const options = [
    {
      value: 'MORE_SETS',
      title: 'Maintain Volume',
      desc: 'Auto-rebalance sets to preserve total reps. Example: miss 4×8 → try 5×6 next time.'
    },
    {
      value: 'RETRY',
      title: 'Static Retry',
      desc: 'Keep the exact same weight, sets, and reps. Try to conquer it again.'
    },
    {
      value: 'DELOAD',
      title: 'Deload Weight',
      desc: 'Drop the weight by a percentage, keep sets and reps the same.'
    }
  ]

  return (
    <div className="animate-fade-in text-center">
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>What happens when you fail?</h1>
      <p className="text-muted mb-4">
        Liftscript auto-progresses weight on success. When you miss reps, what should happen next session?
      </p>

      <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={`failure-option ${programData.globalFailureAction === opt.value ? 'failure-option--active' : ''}`}
          >
            <div className="flex items-center gap-1 mb-1">
              <input
                type="radio"
                name="failureAction"
                value={opt.value}
                checked={programData.globalFailureAction === opt.value}
                onChange={handleActionChange}
                style={{ accentColor: 'var(--brand)', width: '16px', height: '16px' }}
              />
              <span className="failure-option-title">{opt.title}</span>
            </div>
            <p className="failure-option-desc" style={{ paddingLeft: '1.5rem' }}>{opt.desc}</p>

            {opt.value === 'DELOAD' && programData.globalFailureAction === 'DELOAD' && (
              <div className="flex items-center gap-1 mt-2" style={{ paddingLeft: '1.5rem' }}>
                <input
                  type="number"
                  min="1" max="50"
                  value={programData.globalFailureValue || 10}
                  onChange={handleValueChange}
                  className="num-input"
                  style={{ width: '72px' }}
                />
                <span className="text-muted">%</span>
              </div>
            )}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={onFinish}
          disabled={loading}
          style={{ minWidth: '220px' }}
        >
          {loading ? 'Creating Journal...' : 'Finish & Create Journal 🚀'}
        </button>
      </div>
    </div>
  )
}
