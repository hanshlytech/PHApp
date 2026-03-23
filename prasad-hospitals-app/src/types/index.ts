// src/types/index.ts

export interface Branch {
  id: string
  name: string
  area: string
  address: string
  phone: string
  googleMapsReviewUrl: string
}

export interface Department {
  id: string
  branchId: string
  name: string
  icon: string
}

export interface Doctor {
  id: string
  departmentId: string
  name: string
  qualification: string
  photoUrl: string
  nextAvailable: string
}

export interface Slot {
  id: string
  doctorId: string
  date: string
  time: string
  session: 'morning' | 'afternoon' | 'evening'
  available: boolean
}

export interface BookingState {
  department: Department | null
  doctor: Doctor | null
  slot: Slot | null
  patientName: string
  patientPhone: string
  patientReason: string
}

export interface ReviewState {
  rating: number | null
  step: 1 | 2 | 3
  feedbackDepartment: string
  feedbackComments: string
  feedbackPhone: string
}
