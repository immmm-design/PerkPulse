import type { Benefit, BenefitStatus, ActionPlan } from './types'
import { CARDS } from './data'
import { format } from 'date-fns'

function getCardName(card_id: string): string {
  return CARDS.find(c => c.card_id === card_id)?.card_name ?? card_id
}

export function generateDeterministicActionPlan(
  benefits: Benefit[],
  statuses: BenefitStatus[],
  today: Date
): ActionPlan {
  const monthName = format(today, 'MMMM yyyy')

  const urgentBenefits = statuses.filter(
    s => (s.status === 'unused' || s.status === 'expiring_soon') && s.days_left <= 10 && s.days_left >= 0
  )
  const unusedBenefits = statuses.filter(
    s => s.status === 'unused' || s.status === 'partially_used'
  )
  const missedBenefits = statuses.filter(s => s.status === 'missed')

  const totalUnused = unusedBenefits.reduce((sum, s) => sum + (s.remaining_value ?? 0), 0)
  const totalMissed = missedBenefits.reduce((sum, s) => {
    const b = benefits.find(b => b.benefit_id === s.benefit_id)
    return sum + (b && b.value_amount !== 'varies' ? parseFloat(b.value_amount) : 0)
  }, 0)

  const summary =
    totalUnused > 0
      ? `You have $${totalUnused.toFixed(0)} in unused benefits this ${monthName}. ${urgentBenefits.length > 0 ? `${urgentBenefits.length} benefit(s) expire within 10 days.` : 'No urgent expirations.'}`
      : `All tracked benefits have been used this period. Great job maximizing your cards!`

  const priorityActions = unusedBenefits
    .sort((a, b) => a.days_left - b.days_left)
    .slice(0, 5)
    .map(s => {
      const benefit = benefits.find(b => b.benefit_id === s.benefit_id)!
      const cardName = getCardName(benefit.card_id)
      const value = s.remaining_value !== null ? `$${s.remaining_value.toFixed(2)}` : 'varies'
      const urgency: 'high' | 'medium' | 'low' =
        s.days_left <= 5 ? 'high' : s.days_left <= 10 ? 'medium' : 'low'
      return {
        action: `Use ${cardName} ${benefit.benefit_name} at ${benefit.merchant_restriction}`,
        benefit_id: benefit.benefit_id,
        estimated_value: value,
        urgency,
        reason: `${s.days_left} day(s) left. ${benefit.notes}`,
      }
    })

  const missedWarning =
    totalMissed > 0
      ? `You have missed approximately $${totalMissed.toFixed(0)} in benefits this period.`
      : ''

  return {
    monthly_summary: summary,
    priority_actions: priorityActions,
    missed_value_warning: missedWarning,
    safe_disclaimer:
      'Confirm final benefit eligibility in your issuer portal. This app does not guarantee statement credits.',
  }
}
