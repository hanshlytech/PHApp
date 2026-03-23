import { buildWhatsAppUrl } from '../../src/utils/whatsappUrl'
import type { Slot, Doctor, Branch } from '../../src/types'

const branch: Branch = { id: 'kukatpally', name: 'Prasad Hospitals Kukatpally', area: '', address: '', phone: '', googleMapsReviewUrl: '' }
const doctor: Doctor = { id: 'dr1', departmentId: 'd1', name: 'Dr. Rajesh Kumar', qualification: '', photoUrl: '', nextAvailable: '' }
const slot: Slot = { id: 's1', doctorId: 'dr1', date: '2026-03-14', time: '10:00 AM', session: 'morning', available: true }

describe('buildWhatsAppUrl', () => {
  it('returns a wa.me URL', () => {
    const url = buildWhatsAppUrl(slot, doctor, branch)
    expect(url).toContain('wa.me')
  })

  it('includes appointment details in the message', () => {
    const url = buildWhatsAppUrl(slot, doctor, branch)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Prasad Hospitals Kukatpally')
    expect(decoded).toContain('2026-03-14')
    expect(decoded).toContain('10:00 AM')
    expect(decoded).toContain('Dr. Rajesh Kumar')
  })
})
