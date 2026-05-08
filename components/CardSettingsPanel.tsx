'use client'

import { useState } from 'react'
import type { CardSettingsMap } from '@/lib/types'
import { CARD_SETTINGS_DEFINITIONS } from '@/lib/data'
import { upsertCardSetting } from '@/lib/db'

interface CardSettingsPanelProps {
  card_id: string
  cardSettings: CardSettingsMap
  onUpdate: (settings: CardSettingsMap) => void
  compact?: boolean
}

export default function CardSettingsPanel({ card_id, cardSettings, onUpdate, compact = false }: CardSettingsPanelProps) {
  const definitions = CARD_SETTINGS_DEFINITIONS.filter(d => d.card_id === card_id)
  const [saved, setSaved] = useState(false)

  if (definitions.length === 0) return null

  const currentSettings = cardSettings[card_id] ?? {}

  function handleChange(key: string, value: string) {
    // Persist to Supabase/localStorage in the background
    upsertCardSetting(card_id, key, value).catch(() => {})
    // Update local state immediately
    const current = cardSettings[card_id] ?? {}
    const updated = { ...cardSettings, [card_id]: { ...current, [key]: value } }
    onUpdate(updated)
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {definitions.map(def => (
        <div key={def.setting_key}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {def.label}
                {def.required && <span className="text-rose-500 ml-0.5">*</span>}
              </label>
              {!compact && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
              )}
            </div>
          </div>

          {def.type === 'select' && def.options && (
            <div className="grid grid-cols-2 gap-2">
              {def.options.map(opt => {
                const selected = currentSettings[def.setting_key] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleChange(def.setting_key, opt.value)}
                    className={[
                      'text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors',
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50',
                    ].join(' ')}
                  >
                    {selected && (
                      <svg className="inline-block w-3 h-3 mr-1 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {def.type === 'boolean' && (
            <button
              onClick={() => {
                const current = currentSettings[def.setting_key]
                handleChange(def.setting_key, current === 'true' ? 'false' : 'true')
              }}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                currentSettings[def.setting_key] === 'true'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <div className={[
                'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                currentSettings[def.setting_key] === 'true'
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'border-slate-300',
              ].join(' ')}>
                {currentSettings[def.setting_key] === 'true' && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              {currentSettings[def.setting_key] === 'true' ? 'Activated' : 'Not activated'}
            </button>
          )}

          {def.reminder_text && !compact && (
            <p className="text-[11px] text-amber-600 mt-1.5 flex items-start gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {def.reminder_text}
            </p>
          )}
        </div>
      ))}

      {!compact && (
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {saved ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </>
          ) : 'Save Settings'}
        </button>
      )}
    </div>
  )
}
