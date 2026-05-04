'use client'

import type { UserCard, UsageEntry, OfferUpdate, CardSettingsMap } from './types'
import { SEED_OFFER_UPDATES } from './data'

const KEYS = {
  userCards:    'perkpulse_user_cards',
  usageLog:     'perkpulse_usage_log',
  offerUpdates: 'perkpulse_offer_updates',
  cardSettings: 'perkpulse_card_settings',
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUserCards(): UserCard[] {
  return safeGet<UserCard[]>(KEYS.userCards, [])
}

export function saveUserCards(cards: UserCard[]) {
  safeSet(KEYS.userCards, cards)
}

export function getUsageLog(): UsageEntry[] {
  return safeGet<UsageEntry[]>(KEYS.usageLog, [])
}

export function saveUsageLog(log: UsageEntry[]) {
  safeSet(KEYS.usageLog, log)
}

export function getOfferUpdates(): OfferUpdate[] {
  const stored = safeGet<OfferUpdate[] | null>(KEYS.offerUpdates, null)
  if (stored === null) {
    safeSet(KEYS.offerUpdates, SEED_OFFER_UPDATES)
    return SEED_OFFER_UPDATES
  }
  return stored
}

export function saveOfferUpdates(updates: OfferUpdate[]) {
  safeSet(KEYS.offerUpdates, updates)
}

export function addUsageEntry(entry: UsageEntry) {
  const log = getUsageLog()
  log.push(entry)
  saveUsageLog(log)
}

export function clearUsageForBenefit(benefit_id: string, periodStart: string, periodEnd: string) {
  const log = getUsageLog()
  const filtered = log.filter(e => {
    if (e.benefit_id !== benefit_id) return true
    return e.usage_date < periodStart || e.usage_date > periodEnd
  })
  saveUsageLog(filtered)
}

export function getCardSettings(): CardSettingsMap {
  return safeGet<CardSettingsMap>(KEYS.cardSettings, {})
}

export function saveCardSettings(settings: CardSettingsMap) {
  safeSet(KEYS.cardSettings, settings)
}

export function updateCardSetting(card_id: string, key: string, value: string): CardSettingsMap {
  const settings = getCardSettings()
  settings[card_id] = { ...(settings[card_id] ?? {}), [key]: value }
  saveCardSettings(settings)
  return settings
}
