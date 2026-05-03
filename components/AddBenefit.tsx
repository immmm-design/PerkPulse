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

function ConfidenceBadge({ confidence }: { confidence: string }) {
  switch (confidence) {
    case 'high':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">High confidence</span>
    case 'medium':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Medium confidence</span>
    default:
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Low confidence</span>
  }
}

function FieldRow({ label, value }: { label: string; value: string | boolean | null }) {
  const display = value === null ? '—' : value === true ? 'Yes' : value === false ? 'No' : String(value)
  return (
    <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="w-40 shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-700 break-words">{display}</span>
    </div>
  )
}

export default function AddBenefit({ onBenefitAdded }: AddBenefitProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParsedBenefit | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/ai-parse', {
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

  function handleUseExample(example: string) {
    setText(example)
    setResult(null)
    setSaved(false)
  }

  function handleSave() {
    // In this app, saving stores the parsed result to localStorage as a custom note
    if (!result) return
    const saved_benefits = JSON.parse(localStorage.getItem('perkpulse_parsed_benefits') ?? '[]')
    saved_benefits.push({ ...result, saved_at: new Date().toISOString() })
    localStorage.setItem('perkpulse_parsed_benefits', JSON.stringify(saved_benefits))
    setSaved(true)
    if (onBenefitAdded) onBenefitAdded()
  }

  return (
    <div className="space-y-5">
      {/* Demo mode warning */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <div className="text-xl">ℹ️</div>
        <div>
          <p className="text-amber-800 font-semibold text-sm">AI Parsing Mode</p>
          <p className="text-amber-700 text-xs mt-0.5">
            If no OpenAI API key is configured, the app runs in <strong>demo mode</strong> with placeholder responses.
            Set <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> in your <code className="bg-amber-100 px-1 rounded">.env.local</code> file to enable real AI parsing.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Parse Benefit Language</h2>
        <p className="text-sm text-slate-500 mb-4">
          Paste benefit terms from your card's website, app, or welcome email. AI will extract structured data.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Benefit Text</label>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); setSaved(false) }}
              placeholder="Paste benefit language here..."
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">{text.length} characters</p>
          </div>

          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Parsing...
              </>
            ) : (
              '🤖 Parse with AI'
            )}
          </button>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Example Texts */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-2">Try an example:</div>
          <div className="space-y-2">
            {EXAMPLE_TEXTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleUseExample(ex)}
                className="w-full text-left text-xs text-slate-500 hover:text-purple-700 p-2 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
              >
                {ex.substring(0, 100)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800">Parsed Result</h3>
              <ConfidenceBadge confidence={result.confidence} />
              {isDemo && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Demo mode</span>
              )}
            </div>
          </div>

          <div className="p-5">
            {/* Plain English */}
            <div className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-1">Plain English</div>
              <p className="text-sm text-slate-700">{result.plain_english}</p>
            </div>

            {/* Risk Flags */}
            {result.risk_flags.length > 0 && (
              <div className="mb-4 space-y-1">
                {result.risk_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <span className="text-amber-500 text-xs mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-700">{flag}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Fields */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Extracted Data</div>
              <div>
                <FieldRow label="Issuer" value={result.issuer} />
                <FieldRow label="Card" value={result.card_name} />
                <FieldRow label="Benefit Name" value={result.benefit_name} />
                <FieldRow label="Type" value={result.benefit_type} />
                <FieldRow label="Value" value={result.value_amount} />
                <FieldRow label="Frequency" value={result.frequency} />
                <FieldRow label="Reset Rule" value={result.reset_rule} />
                <FieldRow label="Deadline" value={result.deadline} />
                <FieldRow label="Where to Use" value={result.merchant_restriction} />
                <FieldRow label="Enrollment Required" value={result.requires_enrollment} />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {saved ? '✓ Saved to My Notes' : 'Save Parsed Benefit'}
              </button>
              <button
                onClick={() => { setResult(null); setText(''); setSaved(false) }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear
              </button>
            </div>
            {saved && (
              <p className="text-xs text-green-600 mt-2">
                Saved to localStorage under <code>perkpulse_parsed_benefits</code>. Future versions will import this directly.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">
          🔒 Benefit text you paste is sent to OpenAI for parsing. Do not include account numbers, SSNs, or other sensitive personal data. Only paste benefit description language from your card issuer.
        </p>
      </div>
    </div>
  )
}
