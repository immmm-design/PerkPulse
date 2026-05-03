export interface Card {
  card_id: string
  issuer: string
  card_name: string
  annual_fee: number
  reward_notes: string
}

export interface Benefit {
  benefit_id: string
  card_id: string
  benefit_name: string
  benefit_type: 'statement_credit' | 'merchant_offer' | 'reward_multiplier' | 'subscription_credit' | 'category_optimization' | 'other'
  value_amount: string
  frequency: 'monthly' | 'semiannual' | 'annual' | 'quarterly' | 'offer_based' | 'one_time' | 'unknown'
  reset_rule: string
  deadline_type: string
  merchant_restriction: string
  requires_enrollment: boolean
  source_type: string
  notes: string
  custom_deadline?: string
}

export interface UserCard {
  user_card_id: string
  card_id: string
  nickname?: string
  active: boolean
  added_at: string
}

export interface UsageEntry {
  usage_id: string
  benefit_id: string
  card_id: string
  usage_date: string
  amount_used: number
  user_note?: string
}

export interface OfferUpdate {
  update_id: string
  issuer: string
  card_name: string
  title: string
  description: string
  deadline: string
  requires_enrollment: boolean
  status: 'active' | 'expired'
}

export interface PurchaseCategory {
  category: string
  preferred_card_id: string
  reason: string
}

export type BenefitStatusType = 'unused' | 'partially_used' | 'used' | 'missed' | 'expiring_soon'

export interface BenefitStatus {
  benefit_id: string
  status: BenefitStatusType
  used_amount: number
  remaining_value: number | null
  deadline: string
  days_left: number
}

export interface Reminder {
  reminder_id: string
  benefit_id: string
  benefit_name: string
  card_name: string
  reminder_date: string
  message: string
  urgency: 'high' | 'medium' | 'low'
  days_until: number
}

export interface ActionPlan {
  monthly_summary: string
  priority_actions: Array<{
    action: string
    benefit_id: string
    estimated_value: string
    urgency: 'high' | 'medium' | 'low'
    reason: string
  }>
  missed_value_warning: string
  safe_disclaimer: string
}

export interface ParsedBenefit {
  issuer: string
  card_name: string
  benefit_name: string
  benefit_type: string
  value_amount: string
  frequency: string
  reset_rule: string
  deadline: string | null
  merchant_restriction: string
  requires_enrollment: boolean
  plain_english: string
  risk_flags: string[]
  confidence: 'high' | 'medium' | 'low'
}
