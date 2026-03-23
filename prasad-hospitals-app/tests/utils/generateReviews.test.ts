import { generateReviews } from '../../src/utils/generateReviews'

const input = {
  visitType: 'Consultation',
  department: 'Cardiology',
  experienceTone: 'Very Satisfied',
  whoAreYou: 'Patient',
  whyChose: "Doctor's reputation",
  likedMost: "Doctor's expertise",
  outcome: 'Got accurate diagnosis',
  staffName: 'Dr. Rajesh Kumar',
  additionalNotes: '',
  branchName: 'Prasad Hospitals Kukatpally',
}

describe('generateReviews', () => {
  it('returns exactly 3 variations', () => {
    const reviews = generateReviews(input)
    expect(reviews).toHaveLength(3)
  })

  it('each variation has label and text', () => {
    const reviews = generateReviews(input)
    reviews.forEach(r => {
      expect(r.label).toBeTruthy()
      expect(r.text).toBeTruthy()
      expect(r.text.length).toBeGreaterThan(20)
    })
  })

  it('includes the branch name in each variation', () => {
    const reviews = generateReviews(input)
    reviews.forEach(r => {
      expect(r.text).toContain('Prasad Hospitals Kukatpally')
    })
  })

  it('includes the staff name when provided', () => {
    const reviews = generateReviews(input)
    reviews.forEach(r => {
      expect(r.text).toContain('Dr. Rajesh Kumar')
    })
  })

  it('works without staffName and additionalNotes', () => {
    const reviews = generateReviews({ ...input, staffName: '', additionalNotes: '' })
    expect(reviews).toHaveLength(3)
    reviews.forEach(r => expect(r.text.length).toBeGreaterThan(20))
  })

  it('variations differ from each other', () => {
    const reviews = generateReviews(input)
    expect(reviews[0].text).not.toBe(reviews[1].text)
    expect(reviews[1].text).not.toBe(reviews[2].text)
  })
})
