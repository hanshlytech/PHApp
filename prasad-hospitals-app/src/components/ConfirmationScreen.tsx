// src/components/ConfirmationScreen.tsx
import { Calendar, MessageCircle, CheckCircle } from 'lucide-react'
import { buildCalendarUrl } from '../utils/calendarUrl'
import { buildWhatsAppUrl } from '../utils/whatsappUrl'
import type { Branch, Department, Doctor, Slot } from '../types'

interface ConfirmationScreenProps {
  booking: {
    department: Department
    doctor: Doctor
    slot: Slot
    patientName: string
    patientPhone: string
    patientReason: string
  }
  branch: Branch
  onDone: () => void
}

export default function ConfirmationScreen({ booking, branch, onDone }: ConfirmationScreenProps) {
  const calendarUrl = buildCalendarUrl(booking.slot, booking.doctor, booking.department, branch)
  const whatsappUrl = buildWhatsAppUrl(booking.slot, booking.doctor, branch)

  return (
    <div className="px-4 py-8 flex flex-col items-center text-center page-enter">
      {/* Success icon */}
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={44} className="text-success" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1">Appointment Booked!</h2>
      <p className="text-sm text-muted mb-6">Your slot has been reserved. See you soon!</p>

      {/* Summary card */}
      <div className="w-full bg-surface border border-gray-200 rounded-2xl p-5 text-left space-y-3 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Patient</span>
          <span className="font-medium text-gray-800">{booking.patientName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Doctor</span>
          <span className="font-medium text-gray-800">{booking.doctor.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Department</span>
          <span className="font-medium text-gray-800">{booking.department.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Date</span>
          <span className="font-medium text-gray-800">{booking.slot.date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Time</span>
          <span className="font-medium text-gray-800">{booking.slot.time}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Branch</span>
          <span className="font-medium text-gray-800">{branch.area}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        <a
          href={calendarUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          <Calendar size={18} />
          Add to Google Calendar
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#20B858] transition-colors"
        >
          <MessageCircle size={18} />
          Share via WhatsApp
        </a>
        <button
          onClick={onDone}
          className="w-full py-3 text-sm font-medium text-muted hover:text-gray-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
