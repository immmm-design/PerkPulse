'use client'

import { useState } from 'react'
import { signInWithEmail } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'

function LogoMark() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="3" ry="3"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <line x1="6" y1="15" x2="9" y2="15"/>
        <line x1="12" y1="15" x2="15" y2="15"/>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  const configured = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !configured) return
    setLoading(true)
    setError('')
    const { error: err } = await signInWithEmail(email.trim())
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <LogoMark />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PerkPulse</h1>
            <p className="text-sm text-slate-500 mt-1">Track every credit card benefit, automatically.</p>
          </div>
        </div>

        {/* Demo mode notice */}
        {!configured && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Supabase not configured</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Set <code className="bg-amber-100 px-1 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="bg-amber-100 px-1 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth.
                The app works in demo mode without logging in.
              </p>
            </div>
          </div>
        )}

        {/* Login card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Check your email</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  We sent a magic link to <span className="font-medium text-slate-700">{email}</span>.
                  Click the link to sign in — no password required.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-slate-900 mb-1">Sign in</h2>
              <p className="text-sm text-slate-500 mb-5">
                Enter your email and we&apos;ll send you a magic link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={!configured}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-600 font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !configured}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending…
                    </>
                  ) : 'Send Magic Link'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Privacy */}
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          No card numbers ever required. All benefit data stays in your browser.
        </p>
      </div>
    </div>
  )
}
