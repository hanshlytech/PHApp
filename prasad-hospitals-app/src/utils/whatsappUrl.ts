import type { Slot, Doctor, Branch } from '../types'

export function buildWhatsAppUrl(slot: Slot, doctor: Doctor, branch: Branch): string {
  const message = `I have an appointment at ${branch.name} on ${slot.date} at ${slot.time} with ${doctor.name}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
