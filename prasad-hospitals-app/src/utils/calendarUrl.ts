import type { Slot, Doctor, Department, Branch } from '../types'

function timeToHHMM(time12: string): string {
  const [timePart, meridiem] = time12.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`
}

function addThirtyMinutes(hhmmss: string): string {
  const hours = parseInt(hhmmss.slice(0, 2), 10)
  const minutes = parseInt(hhmmss.slice(2, 4), 10)
  const totalMinutes = hours * 60 + minutes + 30
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}${String(newMinutes).padStart(2, '0')}00`
}

export function buildCalendarUrl(
  slot: Slot,
  doctor: Doctor,
  department: Department,
  branch: Branch
): string {
  const dateCompact = slot.date.replace(/-/g, '')
  const startTime = timeToHHMM(slot.time)
  const endTime = addThirtyMinutes(startTime)
  const dates = `${dateCompact}T${startTime}/${dateCompact}T${endTime}`

  const text = encodeURIComponent(`Appointment at ${branch.name}`)
  const details = encodeURIComponent(`${doctor.name} | ${department.name}`)
  const location = encodeURIComponent(branch.address)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${dates}`
}
