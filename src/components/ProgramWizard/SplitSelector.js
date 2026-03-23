'use client'

const TEMPLATES = [
  {
    id: 'ppl',
    label: '🏋️ Push / Pull / Legs',
    description: '3 or 6 days. Chest/Tris, Back/Bis, Quads/Hams.',
    cycleDays: 7,
    days: [
      { id: '1', name: 'Push', dayOfWeek: 'Monday', exercises: [] },
      { id: '2', name: 'Pull', dayOfWeek: 'Wednesday', exercises: [] },
      { id: '3', name: 'Legs', dayOfWeek: 'Friday', exercises: [] }
    ]
  },
  {
    id: 'upper_lower',
    label: '💪 Upper / Lower',
    description: '4 days. Two upper body, two lower body.',
    cycleDays: 7,
    days: [
      { id: '1', name: 'Upper A', dayOfWeek: 'Monday', exercises: [] },
      { id: '2', name: 'Lower A', dayOfWeek: 'Tuesday', exercises: [] },
      { id: '3', name: 'Upper B', dayOfWeek: 'Thursday', exercises: [] },
      { id: '4', name: 'Lower B', dayOfWeek: 'Friday', exercises: [] }
    ]
  },
  {
    id: 'full_body',
    label: '🔥 Full Body',
    description: '3 days. Hit everything every session.',
    cycleDays: 7,
    days: [
      { id: '1', name: 'Full Body A', dayOfWeek: 'Monday', exercises: [] },
      { id: '2', name: 'Full Body B', dayOfWeek: 'Wednesday', exercises: [] },
      { id: '3', name: 'Full Body C', dayOfWeek: 'Friday', exercises: [] }
    ]
  },
  {
    id: 'bro_split',
    label: '⚡ Bro Split',
    description: '5 days. One muscle group per day.',
    cycleDays: 7,
    days: [
      { id: '1', name: 'Chest', dayOfWeek: 'Monday', exercises: [] },
      { id: '2', name: 'Back', dayOfWeek: 'Tuesday', exercises: [] },
      { id: '3', name: 'Shoulders', dayOfWeek: 'Wednesday', exercises: [] },
      { id: '4', name: 'Arms', dayOfWeek: 'Thursday', exercises: [] },
      { id: '5', name: 'Legs', dayOfWeek: 'Friday', exercises: [] }
    ]
  },
  {
    id: 'custom',
    label: '🛠 Custom',
    description: 'Build your own split from scratch.',
    cycleDays: 7,
    days: []
  }
]

export default function SplitSelector({ programData, setProgramData, onNext }) {
  const handleSelect = (template) => {
    const freshDays = template.days.map(d => ({
      ...d,
      id: Math.random().toString(36).substr(2, 9)
    }))
    setProgramData({
      ...programData,
      name: template.id === 'custom' ? 'My Custom Program' : template.label.split(' ').slice(1).join(' '),
      cycleDays: template.cycleDays,
      trainingDays: freshDays
    })
    onNext()
  }

  return (
    <div className="animate-fade-in text-center">
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>How do you train?</h1>
      <p className="text-muted mb-4">Pick a template — you can edit every detail next.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className="split-card"
          >
            <span className="split-card-label">{t.label}</span>
            <span className="split-card-desc">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
