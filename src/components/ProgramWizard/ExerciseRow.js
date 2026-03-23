'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

export default function ExerciseRow({ exercise, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="exercise-row">
      {/* Drag handle */}
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>

      {/* Name */}
      <div className="exercise-row-name">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Exercise name"
          className="num-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Sets */}
      <div className="num-field">
        <span className="num-field-label">Sets</span>
        <input
          type="number"
          value={exercise.targetSets}
          min={1} max={20}
          onChange={(e) => onUpdate({ targetSets: parseInt(e.target.value) || 1 })}
          className="num-input"
        />
      </div>

      {/* Reps */}
      <div className="num-field">
        <span className="num-field-label">Reps</span>
        <input
          type="number"
          value={exercise.targetReps}
          min={1} max={100}
          onChange={(e) => onUpdate({ targetReps: parseInt(e.target.value) || 1 })}
          className="num-input"
        />
      </div>

      {/* Weight */}
      <div className="num-field">
        <span className="num-field-label">kg</span>
        <input
          type="number"
          value={exercise.currentWeight}
          min={0} step={2.5}
          onChange={(e) => onUpdate({ currentWeight: parseFloat(e.target.value) || 0 })}
          className="num-input"
        />
      </div>

      {/* Bump */}
      <div className="num-field">
        <span className="num-field-label">+bump</span>
        <input
          type="number"
          value={exercise.weightIncrement}
          min={0} step={0.5}
          onChange={(e) => onUpdate({ weightIncrement: parseFloat(e.target.value) || 0 })}
          className="num-input"
        />
      </div>

      {/* Remove */}
      <button onClick={onRemove} className="btn-icon-danger" title="Remove">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
