import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ExerciseRow from './ExerciseRow'
import { Plus, Trash2 } from 'lucide-react'

export default function DayBuilder({ programData, setProgramData, onNext }) {

  const addDay = () => {
    const newDay = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Day ${programData.trainingDays.length + 1}`,
      dayOfWeek: 'Monday',
      exercises: []
    }
    setProgramData({ ...programData, trainingDays: [...programData.trainingDays, newDay] })
  }

  const removeDay = (dayId) => {
    setProgramData({ ...programData, trainingDays: programData.trainingDays.filter(d => d.id !== dayId) })
  }

  const handleDragEnd = (event, dayId) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const dayIndex = programData.trainingDays.findIndex(d => d.id === dayId)
      const day = programData.trainingDays[dayIndex]
      const oldIndex = day.exercises.findIndex(e => e.id === active.id)
      const newIndex = day.exercises.findIndex(e => e.id === over.id)
      const newExercises = arrayMove(day.exercises, oldIndex, newIndex)
      const newDays = [...programData.trainingDays]
      newDays[dayIndex] = { ...day, exercises: newExercises }
      setProgramData({ ...programData, trainingDays: newDays })
    }
  }

  const updateDayField = (dayId, field, value) => {
    setProgramData({
      ...programData,
      trainingDays: programData.trainingDays.map(d => d.id === dayId ? { ...d, [field]: value } : d)
    })
  }

  const addExercise = (dayId) => {
    const newExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Exercise',
      targetSets: 3,
      targetReps: 10,
      currentWeight: 20,
      weightIncrement: 2.5,
      restSeconds: 90
    }
    const dayIndex = programData.trainingDays.findIndex(d => d.id === dayId)
    const newDays = [...programData.trainingDays]
    newDays[dayIndex].exercises.push(newExercise)
    setProgramData({ ...programData, trainingDays: newDays })
  }

  const updateExercise = (dayId, exerciseId, updater) => {
    setProgramData({
      ...programData,
      trainingDays: programData.trainingDays.map(d => {
        if (d.id !== dayId) return d
        return { ...d, exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, ...updater } : e) }
      })
    })
  }

  const removeExercise = (dayId, exerciseId) => {
    setProgramData({
      ...programData,
      trainingDays: programData.trainingDays.map(d => {
        if (d.id !== dayId) return d
        return { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
      })
    })
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-center" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Build Your Days</h1>
      <p className="text-muted text-center mb-4">Name each day and add your exercises.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {programData.trainingDays.length === 0 && (
          <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No days yet — add one below.</p>
        )}

        {programData.trainingDays.map(day => (
          <div key={day.id} className="day-card">
            {/* Day header */}
            <div className="flex justify-between items-center mb-2" style={{ gap: '0.75rem' }}>
              <input
                type="text"
                value={day.name}
                onChange={(e) => updateDayField(day.id, 'name', e.target.value)}
                className="day-name-input"
                placeholder="Day Name (e.g. Push)"
              />
              <button
                onClick={() => removeDay(day.id)}
                className="btn-icon-danger"
                title="Remove Day"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, day.id)}>
              <SortableContext items={day.exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div style={{ marginBottom: '0.75rem' }}>
                  {day.exercises.length === 0 && (
                    <p className="text-muted" style={{ fontSize: '0.875rem', fontStyle: 'italic', padding: '0.5rem 0' }}>No exercises yet.</p>
                  )}
                  {day.exercises.map(ex => (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex}
                      onUpdate={(updates) => updateExercise(day.id, ex.id, updates)}
                      onRemove={() => removeExercise(day.id, ex.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button onClick={() => addExercise(day.id)} className="btn btn-dashed flex items-center gap-1">
              <Plus size={15} /> Add Exercise
            </button>
          </div>
        ))}

        <div className="flex justify-between items-center" style={{ paddingTop: '0.5rem' }}>
          <button onClick={addDay} className="btn btn-ghost flex items-center gap-1">
            <Plus size={16} /> Add Day
          </button>
          <button onClick={onNext} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
