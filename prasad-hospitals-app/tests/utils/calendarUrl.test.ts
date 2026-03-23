import { buildCalendarUrl } from '../../src/utils/calendarUrl'
import type { Slot, Doctor, Department, Branch } from '../../src/types'

const branch: Branch = {
  id: 'kukatpally', name: 'Prasad Hospitals Kukatpally',
  area: '', address: 'KPHB Colony, Kukatpally', phone: '', googleMapsReviewUrl: '',
}
const dept: Department = { id: 'd1', branchId: 'kukatpally', name: 'Cardiology', icon: '🫀' }
const doctor: Doctor = { id: 'dr1', departmentId: 'd1', name: 'Dr. Rajesh Kumar', qualification: '', photoUrl: '', nextAvailable: '' }
const slot: Slot = { id: 's1', doctorId: 'dr1', date: '2026-03-14', time: '10:00 AM', session: 'morning', available: true }

describe('buildCalendarUrl', () => {
  it('returns a valid Google Calendar URL', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
  })

  it('includes the branch name in the event title', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('Prasad Hospitals Kukatpally')
  })

  it('includes the doctor name in details', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('Dr. Rajesh Kumar')
  })

  it('includes the branch address as location', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('KPHB Colony')
  })

  it('correctly converts 10:00 AM on 2026-03-14 to ISO dates', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(url).toContain('20260314T100000')
    expect(url).toContain('20260314T103000')
    expect(url).toContain('20260314T100000/20260314T103000')
  })

  it('handles PM times correctly — 2:00 PM becomes 14:00', () => {
    const pmSlot: Slot = { ...slot, time: '02:00 PM' }
    const url = buildCalendarUrl(pmSlot, doctor, dept, branch)
    expect(url).toContain('20260314T140000')
    expect(url).toContain('20260314T143000')
  })
})
