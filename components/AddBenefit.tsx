'use client'

import { useState } from 'react'
import type { ParsedBenefit } from '@/lib/types'

interface AddBenefitProps {
  onBenefitAdded?: () => void
}

const EXAMPLE_TEXTS = [
  'Earn up to $10 in monthly statement credits when you use your Amex Gold Card to pay for eligible purchases at Grubhub, The Cheesecake Factory, Goldbelly, Wine.com, and Five Guys.',
  'Get up to $50 in statement credits semi-annually for eligible purchases made at Resy restaurants with your card.',
  'Use your card to earn 5% back on rotating quarterly categories (up to $1,500 per quarter) after activation.',
]

function ConfidencePill({ confidence }: { confidence: string }) {
  switch (confidence) {
    case 'high':   return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">High confidence</span>
    case 'medium': return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">Medium confidence</span>
    default:       return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">Low confidence</span>
  }
}

function FieldRow({ label, value }: { label: string; value: string | boolean | null }) {
  const display =
    value === null    ? '—' :
    value === true    ? 'Yes' :
    value === false   ? 'No' :
    String(value)
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="w-36 shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 break-words leading-relaxed">{display}</span>
    </div>
  )
}

export default function AddBenefit({ onBenefitAdded }: AddBenefitProps) {
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<ParsedBenefit | null>(null)
  const [isDemo,  setIsDemo]  = useState(false)
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(false)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setSaved(false)
    try {
      const res  = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
        setIsDemo(data.demo ?? false)
      } else {
        setError('Failed to parse. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    if (!result) return
    const saved_benefits = JSON.parse(localStorage.getItem('perkpulse_parsed_benefits') ?? '[]')
    saved_benefits.push({ ...result, saved_at: new Date().toISOString() })
    localStorage.setItem('perkpulse_parsed_benefits', JSON.stringify(saved_benefits))
    setSaved(true)
    if (onBenefitAdded) onBenefitAdded()
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* ── AI mode notice ───────────────────────────────────── */}
      <div className="flex items-start gap-4 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">AI Parsing Mode</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Set <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">OPENAI_API_KEY</code> in{' '}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">.env.local</code> to enable real AI parsing.
            Without a key, the app returns a structured demo response.
          </p>
        </div>
      </div>

      {/* ── Input form ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Benefit Parser</h2>
        <p className="text-sm text-slate-500 mb-5">
          Paste benefit language from your card&apos;s website, app, or welcome email.
          The AI extracts structured data you can save and track.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Benefit Text</label>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); setSaved(false) }}
              placeholder="Paste benefit language here…"
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed bg-white"
            />
            <div className="text-[10px] text-slate-400 mt-1 text-right num">{text.length} chars</div>
          </div>

          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Parsing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>
                </svg>
                Parse with AI
              </>
            )}
          </button>

          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        </div>

        {/* Example presets */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Try an example</div>
          <div className="space-y-2">
            {EXAMPLE_TEXTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setText(ex); setResult(null); setSaved(false) }}
                className="w-full text-left text-xs text-slate-500 hover:text-blue-700 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors leading-relaxed"
              >
                {ex.substring(0, 110)}…
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Parsed result ────────────────────────────────────── */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base">Parsed Result</h3>
            <ConfidencePill confidence={result.confidence} />
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                Demo mode
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Plain English */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1.5">Plain English</div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.plain_english}</p>
            </div>

            {/* Risk flags */}
            {result.risk_flags.length > 0 && (
              <div className="space-y-1.5">
                {result.risk_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-xs text-amber-700 leading-relaxed">{flag}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Structured fields */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4 pb-2">
                Extracted Data
              </div>
              <FieldRow label="Issuer"            value={result.issuer} />
              <FieldRow label="Card"              value={result.card_name} />
              <FieldRow label="Benefit Name"      value={result.benefit_name} />
              <FieldRow label="Type"              value={result.benefit_type} />
              <FieldRow label="Value"             value={result.value_amount} />
              <FieldRow label="Frequency"         value={result.frequency} />
              <FieldRow label="Reset Rule"        value={result.reset_rule} />
              <FieldRow label="Deadline"          value={result.deadline} />
              <FieldRow label="Where to Use"      value={result.merchant_restriction} />
              <FieldRow label="Enrollment Req."   value={result.requires_enrollment} />
            </div>

            {/* Save / Clear */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Saved
                  </>
                ) : 'Save Parsed Benefit'}
              </button>
              <button
                onClick={() => { setResult(null); setText(''); setSaved(false) }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {saved && (
              <p className="text-xs text-emerald-600 font-medium">
                Saved to browser storage. Future versions will allow importing directly into tracked benefits.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Privacy note ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p className="text-xs text-slate-500 leading-relaxed">
          Benefit text you paste is sent to OpenAI for parsing. Do not include account numbers, SSNs, or personal financial data — only paste benefit description language from your card issuer.
        </p>
      </div>
    </div>
  )
}
