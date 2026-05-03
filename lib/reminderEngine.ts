import { format, parseISO, differenceInDays, subDays } from 'date-fns'
import type { Benefit, Reminder } from './types'
import { CARDS } from './data'
import { getDeadline } from './benefitEngine'

function getCardName(card_id: string): string {
  return CARDS.find(c => c.card_id === card_id)?.card_name ?? card_id
}

function getReminderDates(benefit: Benefit, today: Date): string[] {
  const deadline = getDeadline(benefit, today)
  const d = parseISO(deadline)

  if (benefit.frequency === 'monthly' || benefit.reset_rule === 'calendar_month') {
    return [
      format(subDays(d, 10), 'yyyy-MM-dd'),
      format(subDays(d, 5), 'yyyy-MM-dd'),
      format(subDays(d, 1), 'yyyy-MM-dd'),
      deadline,
    ]
  }
  if (benefit.frequency === 'semiannual' || benefit.reset_rule === 'jan_jun_and_jul_dec') {
    return [
      format(subDays(d, 30), 'yyyy-MM-dd'),
      format(subDays(d, 14), 'yyyy-MM-dd'),
      format(subDays(d, 7), 'yyyy-MM-dd'),
      format(subDays(d, 1), 'yyyy-MM-dd'),
    ]
  }
  return [
    format(subDays(d, 10), 'yyyy-MM-dd'),
    format(subDays(d, 5), 'yyyy-MM-dd'),
    format(subDays(d, 1), 'yyyy-MM-dd'),
  ]
}

export function getUrgency(daysUntil: number): 'high' | 'medium' | 'low' {
  if (daysUntil <= 5) return 'high'
  if (daysUntil <= 10) return 'medium'
  return 'low'
}

export function generateRemindersForBenefit(benefit: Benefit, today: Date): Reminder[] {
  const cardName = getCardName(benefit.card_id)
  const deadline = getDeadline(benefit, today)
  const todayStr = format(today, 'yyyy-MM-dd')
  const reminderDates = getReminderDates(benefit, today)
  const reminders: Reminder[] = []

  reminderDates.forEach((rDate) => {
    if (rDate < todayStr) return
    const daysUntilDeadline = differenceInDays(parseISO(deadline), parseISO(todayStr))
    const urgency = getUrgency(daysUntilDeadline)

    const value = benefit.value_amount !== 'varies' ? `$${benefit.value_amount}` : 'variable value'
    const message =
      daysUntilDeadline === 0
        ? `TODAY: ${cardName} ${benefit.benefit_name} (${value}) expires today!`
        : daysUntilDeadline === 1
        ? `TOMORROW: ${cardName} ${benefit.benefit_name} (${value}) expires tomorrow.`
        : `${cardName} ${benefit.benefit_name} (${value}) expires in ${daysUntilDeadline} days on ${deadline}.`

    reminders.push({
      reminder_id: `${benefit.benefit_id}_${rDate}`,
      benefit_id: benefit.benefit_id,
      benefit_name: benefit.benefit_name,
      card_name: cardName,
      reminder_date: rDate,
      message,
      urgency,
      days_until: daysUntilDeadline,
    })
  })

  return reminders
}

export function getAllUpcomingReminders(benefits: Benefit[], today: Date): Reminder[] {
  const all: Reminder[] = []
  benefits.forEach(b => {
    all.push(...generateRemindersForBenefit(b, today))
  })
  return all.sort((a, b) => a.days_until - b.days_until)
}
