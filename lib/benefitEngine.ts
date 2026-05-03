import { format, endOfMonth, parseISO, differenceInDays } from 'date-fns'
import type { Benefit, UsageEntry, BenefitStatus, BenefitStatusType } from './types'

export function getMonthEnd(today: Date): string {
  return format(endOfMonth(today), 'yyyy-MM-dd')
}

export function getSemiannualDeadline(today: Date): string {
  const month = today.getMonth() + 1
  const year = today.getFullYear()
  if (month <= 6) {
    return `${year}-06-30`
  }
  return `${year}-12-31`
}

export function getDeadline(benefit: Benefit, today: Date): string {
  if (benefit.frequency === 'monthly' || benefit.reset_rule === 'calendar_month') {
    return getMonthEnd(today)
  }
  if (benefit.frequency === 'semiannual' || benefit.reset_rule === 'jan_jun_and_jul_dec') {
    return getSemiannualDeadline(today)
  }
  if (benefit.custom_deadline) {
    return benefit.custom_deadline
  }
  return getMonthEnd(today)
}

export function getPeriodStart(benefit: Benefit, today: Date): string {
  if (benefit.frequency === 'monthly' || benefit.reset_rule === 'calendar_month') {
    return format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
  }
  if (benefit.frequency === 'semiannual' || benefit.reset_rule === 'jan_jun_and_jul_dec') {
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    if (month <= 6) return `${year}-01-01`
    return `${year}-07-01`
  }
  return format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
}

export function parseValueAmount(value_amount: string): number | null {
  if (value_amount === 'varies' || value_amount === '0') return null
  const n = parseFloat(value_amount)
  return isNaN(n) ? null : n
}

export function calculateUsedAmount(
  benefit_id: string,
  periodStart: string,
  periodEnd: string,
  usageLog: UsageEntry[]
): number {
  return usageLog
    .filter(e =>
      e.benefit_id === benefit_id &&
      e.usage_date >= periodStart &&
      e.usage_date <= periodEnd
    )
    .reduce((sum, e) => sum + e.amount_used, 0)
}

export function getBenefitStatus(
  benefit: Benefit,
  usedAmount: number,
  today: Date,
  usageLog: UsageEntry[]
): BenefitStatus {
  const deadline = getDeadline(benefit, today)
  const periodStart = getPeriodStart(benefit, today)
  const todayStr = format(today, 'yyyy-MM-dd')
  const daysLeft = differenceInDays(parseISO(deadline), parseISO(todayStr))
  const valueAmount = parseValueAmount(benefit.value_amount)

  let status: BenefitStatusType

  if (daysLeft < 0) {
    const hasUsage = usageLog.some(e =>
      e.benefit_id === benefit.benefit_id &&
      e.usage_date >= periodStart &&
      e.usage_date <= deadline
    )
    status = hasUsage ? 'used' : 'missed'
  } else if (valueAmount === null) {
    status = 'unused'
  } else if (usedAmount >= valueAmount) {
    status = 'used'
  } else if (usedAmount > 0) {
    status = daysLeft <= 10 ? 'expiring_soon' : 'partially_used'
  } else {
    status = daysLeft <= 10 ? 'expiring_soon' : 'unused'
  }

  const remaining = valueAmount !== null ? Math.max(0, valueAmount - usedAmount) : null

  return {
    benefit_id: benefit.benefit_id,
    status,
    used_amount: usedAmount,
    remaining_value: remaining,
    deadline,
    days_left: daysLeft,
  }
}

export function getDaysLeft(deadline: string, today: Date): number {
  const todayStr = format(today, 'yyyy-MM-dd')
  return differenceInDays(parseISO(deadline), parseISO(todayStr))
}

export function getTotalAvailableValue(benefits: Benefit[]): number {
  return benefits.reduce((sum, b) => {
    const v = parseValueAmount(b.value_amount)
    return sum + (v ?? 0)
  }, 0)
}

export function getTotalUsedValue(
  benefits: Benefit[],
  today: Date,
  usageLog: UsageEntry[]
): number {
  return benefits.reduce((sum, b) => {
    const periodStart = getPeriodStart(b, today)
    const deadline = getDeadline(b, today)
    return sum + calculateUsedAmount(b.benefit_id, periodStart, deadline, usageLog)
  }, 0)
}
