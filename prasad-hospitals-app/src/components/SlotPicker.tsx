// src/components/SlotPicker.tsx
import { useState } from 'react'
import type { Slot } from '../types'

interface SlotPickerProps {
  slots: Slot[]
  selectedSlot: Slot | null
  onSelect: (slot: Slot) => void
}

const SESSION_LABELS: Record<Slot['session'], string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function SlotPicker({ slots, selectedSlot, onSelect }: SlotPickerProps) {
  const dates = [...new Set(slots.map(s => s.date))].sort()
  const [activeDate, setActiveDate] = useState(dates[0] ?? '')

  const slotsForDate = slots.filter(s => s.date === activeDate)
  const sessions: Slot['session'][] = ['morning', 'afternoon', 'evening']

  return (
    <div className="px-4 py-2">
      {/* Date tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setActiveDate(date)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeDate === date
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* Session groups */}
      {sessions.map(session => {
        const sessionSlots = slotsForDate.filter(s => s.session === session)
        if (sessionSlots.length === 0) return null
        return (
          <div key={session} className="mb-4">
            <h4 className="text-xs font-medium text-muted mb-2">{SESSION_LABELS[session]}</h4>
            <div className="flex flex-wrap gap-2">
              {sessionSlots.map(slot => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => onSelect(slot)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    !slot.available
                      ? 'bg-gray-100 text-disabled cursor-not-allowed'
                      : selectedSlot?.id === slot.id
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
