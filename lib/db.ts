'use client'

// Supabase-backed data layer with localStorage fallback (no-auth/offline mode)
// All functions are async; components use useEffect to load data

import { getSupabase } from './supabase'
import type { UserCard, UsageEntry, CardSettingsMap } from './types'

// ── Helpers ─────────────────────────────────────────────────────────────────

function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function lsSet(key: string, v: unknown) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(v))
}

// ── User Cards ───────────────────────────────────────────────────────────────

export async function getUserCards(): Promise<UserCard[]> {
  const sb = getSupabase()
  if (!sb) return ls<UserCard[]>('perkpulse_user_cards', [])
  const { data } = await sb.auth.getUser()
  if (!data.user) return ls<UserCard[]>('perkpulse_user_cards', [])
  const { data: rows } = await sb.from('user_cards').select('*').eq('user_id', data.user.id).order('added_at')
  return (rows ?? []).map((r: any) => ({
    user_card_id: r.user_card_id,
    card_id:      r.card_id,
    nickname:     r.nickname ?? undefined,
    active:       r.active,
    added_at:     r.added_at,
  }))
}

export async function addUserCard(card: UserCard): Promise<void> {
  const sb = getSupabase()
  if (!sb) { const c = ls<UserCard[]>('perkpulse_user_cards', []); lsSet('perkpulse_user_cards', [...c, card]); return }
  const { data } = await sb.auth.getUser()
  if (!data.user) { const c = ls<UserCard[]>('perkpulse_user_cards', []); lsSet('perkpulse_user_cards', [...c, card]); return }
  await sb.from('user_cards').upsert({ ...card, user_id: data.user.id })
}

export async function updateUserCard(user_card_id: string, patch: Partial<UserCard>): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    const c = ls<UserCard[]>('perkpulse_user_cards', [])
    lsSet('perkpulse_user_cards', c.map(uc => uc.user_card_id === user_card_id ? { ...uc, ...patch } : uc))
    return
  }
  await sb.from('user_cards').update(patch).eq('user_card_id', user_card_id)
}

export async function removeUserCard(user_card_id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    const c = ls<UserCard[]>('perkpulse_user_cards', [])
    lsSet('perkpulse_user_cards', c.filter(uc => uc.user_card_id !== user_card_id))
    return
  }
  await sb.from('user_cards').delete().eq('user_card_id', user_card_id)
}

// ── Usage Log ────────────────────────────────────────────────────────────────

export async function getUsageLog(): Promise<UsageEntry[]> {
  const sb = getSupabase()
  if (!sb) return ls<UsageEntry[]>('perkpulse_usage_log', [])
  const { data } = await sb.auth.getUser()
  if (!data.user) return ls<UsageEntry[]>('perkpulse_usage_log', [])
  const { data: rows } = await sb.from('usage_log').select('*').eq('user_id', data.user.id).order('usage_date')
  return (rows ?? []).map((r: any) => ({
    usage_id:    r.usage_id,
    benefit_id:  r.benefit_id,
    card_id:     r.card_id,
    usage_date:  r.usage_date,
    amount_used: r.amount_used,
    user_note:   r.user_note ?? undefined,
  }))
}

export async function addUsageEntry(entry: UsageEntry): Promise<void> {
  const sb = getSupabase()
  if (!sb) { const l = ls<UsageEntry[]>('perkpulse_usage_log', []); lsSet('perkpulse_usage_log', [...l, entry]); return }
  const { data } = await sb.auth.getUser()
  if (!data.user) { const l = ls<UsageEntry[]>('perkpulse_usage_log', []); lsSet('perkpulse_usage_log', [...l, entry]); return }
  await sb.from('usage_log').upsert({ ...entry, user_id: data.user.id })
}

export async function clearUsageForBenefit(benefit_id: string, periodStart: string, periodEnd: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    const l = ls<UsageEntry[]>('perkpulse_usage_log', [])
    lsSet('perkpulse_usage_log', l.filter(e => {
      if (e.benefit_id !== benefit_id) return true
      return e.usage_date < periodStart || e.usage_date > periodEnd
    }))
    return
  }
  const { data } = await sb.auth.getUser()
  if (!data.user) return
  await sb.from('usage_log')
    .delete()
    .eq('user_id', data.user.id)
    .eq('benefit_id', benefit_id)
    .gte('usage_date', periodStart)
    .lte('usage_date', periodEnd)
}

// ── Card Settings ─────────────────────────────────────────────────────────────

export async function getCardSettings(): Promise<CardSettingsMap> {
  const sb = getSupabase()
  if (!sb) return ls<CardSettingsMap>('perkpulse_card_settings', {})
  const { data } = await sb.auth.getUser()
  if (!data.user) return ls<CardSettingsMap>('perkpulse_card_settings', {})
  const { data: rows } = await sb.from('card_settings').select('*').eq('user_id', data.user.id)
  const map: CardSettingsMap = {}
  for (const r of (rows ?? [])) {
    if (!map[r.card_id]) map[r.card_id] = {}
    map[r.card_id][r.setting_key] = r.value
  }
  return map
}

export async function upsertCardSetting(card_id: string, key: string, value: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    const s = ls<CardSettingsMap>('perkpulse_card_settings', {})
    s[card_id] = { ...(s[card_id] ?? {}), [key]: value }
    lsSet('perkpulse_card_settings', s)
    return
  }
  const { data } = await sb.auth.getUser()
  if (!data.user) {
    const s = ls<CardSettingsMap>('perkpulse_card_settings', {})
    s[card_id] = { ...(s[card_id] ?? {}), [key]: value }
    lsSet('perkpulse_card_settings', s)
    return
  }
  await sb.from('card_settings').upsert(
    { user_id: data.user.id, card_id, setting_key: key, value, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,card_id,setting_key' }
  )
}
