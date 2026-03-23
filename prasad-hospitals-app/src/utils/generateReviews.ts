export interface ReviewInput {
  visitType: string
  department: string
  experienceTone: string
  whoAreYou: string
  whyChose: string
  likedMost: string
  outcome: string
  staffName: string
  additionalNotes: string
  branchName: string
}

export interface ReviewVariation {
  label: string
  tone: string
  text: string
}

export function generateReviews(input: ReviewInput): ReviewVariation[] {
  const { visitType, department, experienceTone, whoAreYou, whyChose, likedMost, outcome, staffName, additionalNotes, branchName } = input

  const staffMention = staffName ? ` ${staffName} and the` : ' the'
  const staffCredit = staffName ? ` A special mention to ${staffName} for their exceptional care.` : ''
  const notes = additionalNotes ? ` ${additionalNotes}` : ''
  const whoLabel = whoAreYou === 'Patient' ? 'I visited' : whoAreYou === 'Parent of Patient' ? 'My child visited' : 'My family member visited'

  return [
    {
      label: 'Short & Formal',
      tone: 'formal',
      text: `${whoLabel} ${branchName} for a ${visitType.toLowerCase()} at the ${department} department. The experience was ${experienceTone.toLowerCase()}, with${staffMention} team demonstrating excellent ${likedMost.toLowerCase()}. I ${outcome.toLowerCase()} and would recommend this hospital for quality healthcare.`,
    },
    {
      label: 'Warm & Personal',
      tone: 'warm',
      text: `I chose ${branchName} for my ${department} ${visitType.toLowerCase()} because of their ${whyChose.toLowerCase()}, and I was not disappointed. As a ${whoAreYou.toLowerCase()}, what stood out most was the ${likedMost.toLowerCase()} — it made a real difference.${staffCredit} I ${outcome.toLowerCase()} and left feeling well taken care of. Highly recommend to anyone looking for trusted medical care in Hyderabad.${notes}`,
    },
    {
      label: 'Detailed & Enthusiastic',
      tone: 'enthusiastic',
      text: `Absolutely wonderful experience at ${branchName}! 🌟 ${whoLabel} for a ${visitType.toLowerCase()} in ${department} and I am truly impressed. I chose this hospital because of their ${whyChose.toLowerCase()} — and it lived up to every expectation. The ${likedMost.toLowerCase()} was outstanding, and the entire team was warm and professional throughout.${staffCredit} Most importantly, I ${outcome.toLowerCase()}, which is exactly what matters. The facility is well-maintained and the staff goes above and beyond to ensure patient comfort. If you are looking for top-notch healthcare in Hyderabad, ${branchName} is the place to go! 💯${notes}`,
    },
  ]
}
