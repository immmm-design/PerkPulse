import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PerkPulse AI — Stop Losing Credit Card Benefits',
  description: 'Track your card credits, deadlines, and perks so you know exactly what to use before they expire. Free 30-day trial.',
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const FEATURES = [
  'Track monthly, quarterly, and annual credits',
  'Deadline-aware reminders before benefits expire',
  'AI action plans for your specific cards',
  'Purchase advisor — know which card to swipe',
  'AI benefit parser — paste any benefit text',
  'Works on mobile — installable PWA',
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Add your cards',     body: 'Search by bank and pick the exact cards in your wallet. No card numbers required.' },
  { step: '2', title: 'Track deadlines',     body: 'PerkPulse shows every benefit with its reset date, what you have used, and what is still available.' },
  { step: '3', title: 'Get AI action plans', body: 'Each month, get a prioritized list of benefits to use before they expire, powered by OpenAI.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="3"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
                <line x1="6" y1="15" x2="9" y2="15"/>
                <line x1="12" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <span className="text-base font-bold">PerkPulse</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">Pricing</Link>
            <Link href="/login"   className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/login"   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Start free</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white pt-20 pb-28 px-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Free for 30 days — no credit card required
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
              Stop losing credit card benefits.
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              PerkPulse AI tracks your card credits, deadlines, and perks so you know exactly what to use before they expire.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base transition-colors shadow-lg">
                Start free for 30 days
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-base transition-colors">
                See pricing
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-5">Then $1.99/month. Cancel anytime.</p>
          </div>
        </section>

        {/* Feature chips */}
        <section className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card-md p-6 grid sm:grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-sm text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="max-w-5xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">The problem</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Card benefits are a maze</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
              Premium credit cards offer hundreds of dollars in annual credits — split across different apps, fine print, and expiry dates most people never track.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { q: 'Different apps per issuer', a: 'Chase, Amex, Capital One — each has their own portal. Benefits are buried.' },
              { q: 'Complex reset rules',       a: 'Some reset monthly, some quarterly, some on your anniversary. Easy to miss.' },
              { q: 'Merchant restrictions',     a: 'Benefits only apply at specific partners. The details are hidden in fine print.' },
              { q: 'Forgotten value',           a: 'The average cardholder loses hundreds of dollars per year in unclaimed credits.' },
            ].map(p => (
              <div key={p.q} className="p-5 rounded-xl border border-slate-200 bg-white">
                <div className="text-sm font-bold text-slate-900 mb-1">{p.q}</div>
                <p className="text-sm text-slate-500 leading-relaxed">{p.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">How it works</p>
              <h2 className="text-3xl font-bold text-slate-900">Simple. Automatic. Effective.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map(h => (
                <div key={h.step} className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-card">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4">{h.step}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{h.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, honest pricing</h2>
          <p className="text-slate-500 mb-10">No tiers. No feature confusion. One plan that unlocks everything.</p>
          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-card-md p-8">
            <div className="text-4xl font-bold text-slate-900 mb-1">$1.99<span className="text-lg text-slate-400 font-normal">/month</span></div>
            <p className="text-slate-500 text-sm mb-6">After a 30-day free trial. Cancel anytime.</p>
            <div className="space-y-2 text-left mb-8">
              {FEATURES.map(f => (
                <div key={f} className="flex items-start gap-2.5"><CheckIcon /><span className="text-sm text-slate-700">{f}</span></div>
              ))}
            </div>
            <Link href="/login" className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm text-center transition-colors">
              Start free for 30 days
            </Link>
            <p className="text-xs text-slate-400 mt-3">No credit card required to start trial</p>
          </div>
        </section>

        {/* Trust */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Security and privacy</p>
            <h2 className="text-2xl font-bold mb-8">Built for trust</h2>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              {[
                { title: 'No card numbers, ever',  body: 'PerkPulse only knows your card names and benefit usage. We never ask for account numbers or credentials.' },
                { title: 'Stripe handles payments', body: 'Subscriptions are processed by Stripe. PerkPulse never sees or stores your payment details.' },
                { title: 'Your data, protected',   body: 'All data is protected by Supabase Row Level Security. Only you can access your benefit records.' },
              ].map(t => (
                <div key={t.title} className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm font-bold text-white mb-2">{t.title}</div>
                  <p className="text-sm text-slate-400 leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-8 max-w-lg mx-auto">
              Always verify benefit eligibility directly with your card issuer. PerkPulse AI provides informational tracking only.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center bg-white">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Stop leaving money on the table.</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Start your 30-day free trial today. No credit card required.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-colors shadow-lg">
            Get started free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-white font-bold mb-1">PerkPulse AI</div>
            <p className="text-xs leading-relaxed max-w-xs">Credit card benefit tracking. No card numbers. No sensitive data. Just perks.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login"   className="hover:text-white transition-colors">Sign in</Link>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 text-xs text-slate-600">
          PerkPulse AI is not affiliated with any card issuer. Benefit data is for informational purposes only. Payments via Stripe.
        </div>
      </footer>
    </div>
  )
}
