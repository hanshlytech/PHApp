// src/pages/BookingFlow.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBranch } from '../context/BranchContext'
import { getDepartmentsByBranch, getDoctorsByDepartment, getSlotsByDoctor } from '../data/mockData'
import StepIndicator from '../components/StepIndicator'
import DepartmentGrid from '../components/DepartmentGrid'
import DoctorCard from '../components/DoctorCard'
import SlotPicker from '../components/SlotPicker'
import PatientForm from '../components/PatientForm'
import ConfirmationScreen from '../components/ConfirmationScreen'
import type { BookingState, Department, Doctor, Slot } from '../types'

const STEP_LABELS = ['Department', 'Doctor', 'Time Slot', 'Your Details', 'Confirmed']
const TOTAL_STEPS = 5

const INITIAL_STATE: BookingState = {
  department: null,
  doctor: null,
  slot: null,
  patientName: '',
  patientPhone: '',
  patientReason: '',
}

export default function BookingFlow() {
  const { branch } = useBranch()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE)

  if (!branch) return null

  const departments = getDepartmentsByBranch(branch.id)
  const doctors = booking.department ? getDoctorsByDepartment(booking.department.id) : []
  const slots = booking.doctor ? getSlotsByDoctor(booking.doctor.id) : []

  function handleBack() {
    if (step === 1) {
      navigate('/home')
    } else {
      setStep(s => s - 1)
    }
  }

  function selectDepartment(dept: Department) {
    setBooking(b => ({ ...b, department: dept, doctor: null, slot: null }))
    setStep(2)
  }

  function selectDoctor(doctor: Doctor) {
    setBooking(b => ({ ...b, doctor, slot: null }))
    setStep(3)
  }

  function selectSlot(slot: Slot) {
    setBooking(b => ({ ...b, slot }))
  }

  function handlePatientChange(field: 'name' | 'phone' | 'reason', value: string) {
    if (field === 'name') setBooking(b => ({ ...b, patientName: value }))
    else if (field === 'phone') setBooking(b => ({ ...b, patientPhone: value }))
    else setBooking(b => ({ ...b, patientReason: value }))
  }

  function canProceedStep3() {
    return booking.slot !== null
  }

  function canProceedStep4() {
    return booking.patientName.trim().length > 0 && booking.patientPhone.trim().length > 0
  }

  const isConfirmed = step === TOTAL_STEPS

  return (
    <div className="min-h-screen bg-surface page-enter">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-900">
            {isConfirmed ? 'Booking Confirmed' : 'Book Appointment'}
          </h1>
        </div>
        {!isConfirmed && (
          <StepIndicator current={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />
        )}
      </div>

      {/* Step content */}
      <div className="pb-8">
        {step === 1 && (
          <>
            <p className="px-4 pt-4 text-sm text-muted">Select a department</p>
            <DepartmentGrid departments={departments} onSelect={selectDepartment} />
          </>
        )}

        {step === 2 && (
          <>
            <p className="px-4 pt-4 pb-2 text-sm text-muted">
              {booking.department?.name} — choose your doctor
            </p>
            <div className="px-4 space-y-3">
              {doctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onSelect={selectDoctor} />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="px-4 pt-4 pb-2 text-sm text-muted">
              {booking.doctor?.name} — pick a time slot
            </p>
            <SlotPicker
              key={booking.doctor?.id}
              slots={slots}
              selectedSlot={booking.slot}
              onSelect={selectSlot}
            />
            <div className="px-4 pt-2">
              <button
                disabled={!canProceedStep3()}
                onClick={() => setStep(4)}
                className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <PatientForm
              name={booking.patientName}
              phone={booking.patientPhone}
              reason={booking.patientReason}
              onChange={handlePatientChange}
            />
            <div className="px-4 pt-2">
              <button
                disabled={!canProceedStep4()}
                onClick={() => setStep(5)}
                className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </>
        )}

        {step === 5 && booking.department && booking.doctor && booking.slot && (
          <ConfirmationScreen
            booking={{
              department: booking.department,
              doctor: booking.doctor,
              slot: booking.slot,
              patientName: booking.patientName,
              patientPhone: booking.patientPhone,
              patientReason: booking.patientReason,
            }}
            branch={branch}
            onDone={() => navigate('/home')}
          />
        )}
      </div>
    </div>
  )
}
