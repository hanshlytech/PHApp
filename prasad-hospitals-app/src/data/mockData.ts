// src/data/mockData.ts
import type { Branch, Department, Doctor, Slot } from '../types'

// Helper to generate slots for a doctor over the next 3 days
function generateSlots(doctorId: string, startDate: Date): Slot[] {
  const sessions: { session: Slot['session']; times: string[] }[] = [
    { session: 'morning',   times: ['09:00 AM', '10:00 AM', '11:00 AM'] },
    { session: 'afternoon', times: ['02:00 PM', '03:00 PM', '04:00 PM'] },
    { session: 'evening',   times: ['06:00 PM', '07:00 PM', '08:00 PM'] },
  ]
  const slots: Slot[] = []
  for (let d = 0; d < 3; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    sessions.forEach(({ session, times }) => {
      times.forEach((time, i) => {
        const idx = slots.length
        slots.push({
          id: `${doctorId}-${dateStr}-${session}-${i}`,
          doctorId,
          date: dateStr,
          time,
          session,
          available: idx % 3 !== 2, // ~33% unavailable
        })
      })
    })
  }
  return slots
}

export const branches: Branch[] = [
  {
    id: 'nacharam',
    name: 'Prasad Hospitals Nacharam',
    area: 'Nacharam, Hyderabad',
    address: '#3-6-289, Nacharam Road, Nacharam, Hyderabad – 500076',
    phone: '+91-40-2304-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ6QM34QWRyzsRcgkV5-ydfWI',
  },
  {
    id: 'pragathi-nagar',
    name: 'Prasad Hospitals Pragathi Nagar',
    area: 'Pragathi Nagar, Hyderabad',
    address: '#2-1-150, Pragathi Nagar, Kukatpally, Hyderabad – 500090',
    phone: '+91-40-2784-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=PLACEHOLDER_pragathi_nagar',
  },
  {
    id: 'manikonda',
    name: 'Prasad Hospitals Manikonda',
    area: 'Manikonda, Hyderabad',
    address: 'Plot No. 47, Manikonda Main Road, Manikonda, Hyderabad – 500089',
    phone: '+91-40-6674-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=PLACEHOLDER_manikonda',
  },
]

const departmentDefs = [
  { id: 'cardiology',      name: 'Cardiology',        icon: '🫀' },
  { id: 'orthopedics',     name: 'Orthopedics',        icon: '🦴' },
  { id: 'pediatrics',      name: 'Pediatrics',         icon: '👶' },
  { id: 'gynecology',      name: 'Gynecology & Obs',   icon: '🤱' },
  { id: 'neurology',       name: 'Neurology',          icon: '🧠' },
  { id: 'general-surgery', name: 'General Surgery',    icon: '🔬' },
  { id: 'ent',             name: 'ENT',                icon: '👂' },
  { id: 'dermatology',     name: 'Dermatology',        icon: '🩺' },
]

export const departments: Department[] = branches.flatMap(branch =>
  departmentDefs.map(d => ({ ...d, id: `${branch.id}-${d.id}`, branchId: branch.id }))
)

interface DoctorTemplate {
  suffix: string
  name: string
  qualification: string
  nextAvailable: string
}

const doctorTemplates: Record<string, DoctorTemplate[]> = {
  cardiology:        [
    { suffix: 'rk', name: 'Dr. Rajesh Kumar',   qualification: 'MBBS, MD, DM (Cardiology)',     nextAvailable: 'Today' },
    { suffix: 'sr', name: 'Dr. Sunitha Reddy',  qualification: 'MBBS, DNB (Cardiology)',         nextAvailable: 'Tomorrow' },
  ],
  orthopedics:       [
    { suffix: 'vs', name: 'Dr. Venkat Sharma',  qualification: 'MBBS, MS (Orthopaedics)',        nextAvailable: 'Today' },
    { suffix: 'pm', name: 'Dr. Priya Mehta',    qualification: 'MBBS, DNB (Orthopaedics)',       nextAvailable: 'Today' },
  ],
  pediatrics:        [
    { suffix: 'ak', name: 'Dr. Anand Kumar',    qualification: 'MBBS, MD (Paediatrics), DCH',    nextAvailable: 'Today' },
    { suffix: 'ln', name: 'Dr. Lakshmi Nair',   qualification: 'MBBS, DNB (Paediatrics)',        nextAvailable: 'Tomorrow' },
    { suffix: 'sv', name: 'Dr. Srinivas Varma', qualification: 'MBBS, MD (Paediatrics)',         nextAvailable: 'Today' },
  ],
  gynecology:        [
    { suffix: 'md', name: 'Dr. Meena Devi',     qualification: 'MBBS, MS (Obs & Gynae), FRCOG', nextAvailable: 'Today' },
    { suffix: 'rp', name: 'Dr. Rekha Prasad',   qualification: 'MBBS, DNB (Obs & Gynae)',       nextAvailable: 'Tomorrow' },
  ],
  neurology:         [
    { suffix: 'kc', name: 'Dr. Kiran Chandra',  qualification: 'MBBS, MD, DM (Neurology)',      nextAvailable: 'Today' },
    { suffix: 'sm', name: 'Dr. Shalini Murthy',  qualification: 'MBBS, MD (Neurology)',          nextAvailable: 'Tomorrow' },
  ],
  'general-surgery': [
    { suffix: 'nr', name: 'Dr. Naresh Rao',     qualification: 'MBBS, MS (General Surgery)',    nextAvailable: 'Today' },
    { suffix: 'bp', name: 'Dr. Bhanu Prakash',  qualification: 'MBBS, DNB (Surgery), FICS',     nextAvailable: 'Today' },
  ],
  ent:               [
    { suffix: 'ps', name: 'Dr. Padma Srinivas', qualification: 'MBBS, MS (ENT), DLO',           nextAvailable: 'Today' },
    { suffix: 'vk', name: 'Dr. Vijay Kumar',    qualification: 'MBBS, DNB (ENT)',               nextAvailable: 'Tomorrow' },
  ],
  dermatology:       [
    { suffix: 'as', name: 'Dr. Aruna Shetty',   qualification: 'MBBS, MD (Dermatology), FRCP',  nextAvailable: 'Today' },
    { suffix: 'rt', name: 'Dr. Ravi Teja',      qualification: 'MBBS, DVD (Dermatology)',       nextAvailable: 'Today' },
  ],
}

export const doctors: Doctor[] = departments.flatMap(dept => {
  const baseKey = dept.id.replace(`${dept.branchId}-`, '')
  const templates = doctorTemplates[baseKey] ?? []
  return templates.map(t => ({
    id: `${dept.id}-${t.suffix}`,
    departmentId: dept.id,
    name: t.name,
    qualification: t.qualification,
    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=1E6FBA&color=fff&size=128`,
    nextAvailable: t.nextAvailable,
  }))
})

const TODAY = new Date()

export const slots: Slot[] = doctors.flatMap(doctor =>
  generateSlots(doctor.id, TODAY)
)

export function getDepartmentsByBranch(branchId: string): Department[] {
  return departments.filter(d => d.branchId === branchId)
}

export function getDoctorsByDepartment(departmentId: string): Doctor[] {
  return doctors.filter(d => d.departmentId === departmentId)
}

export function getSlotsByDoctor(doctorId: string): Slot[] {
  return slots.filter(s => s.doctorId === doctorId)
}
