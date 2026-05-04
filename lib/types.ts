export interface Card {
  card_id: string
  issuer: string
  card_name: string
  annual_fee: number
  reward_notes: string
  card_type?: string
  reward_summary?: string
  source_url?: string
  source_checked_at?: string
  requires_user_settings?: boolean
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
  requires_user_setting?: boolean
  user_setting_key?: string
  source_url?: string
  source_checked_at?: string
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

export interface CardSettingsMap {
  [card_id: string]: Record<string, string>
}

export interface CardSettingOption {
  value: string
  label: string
}

export interface CardSettingDefinition {
  card_id: string
  setting_key: string
  label: string
  description: string
  type: 'select' | 'boolean' | 'text'
  required: boolean
  options?: CardSettingOption[]
  reminder_text?: string
}

export interface AuthUser {
  id: string
  email: string
}

export interface Bank {
  name: string
  issuer_key: string
  gradient: string
}
