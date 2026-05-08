import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pricing — PerkPulse AI' }

const ALL_FEATURES = [
  'Unlimited card tracking',
  'All benefit types (monthly, quarterly, annual, semiannual)',
  'Deadline reminders and expiry alerts',
  'AI monthly action plan',
  'AI benefit parser',
  'Purchase advisor — which card to swipe',
  'Bank-first card picker (16+ cards supported)',
  'Card-specific settings (BofA category, Discover activation)',
  'Supabase-backed data across devices',
  'Mobile web app — installable to home screen',
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">One plan. Everything included.</h1>
        <p className="text-slate-500 text-lg">No tiers. No feature confusion. No surprises.</p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-card-md p-8 max-w-md mx-auto mb-12">
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-bold text-slate-900">PerkPulse AI</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">30-day trial</span>
        </div>
        <div className="text-5xl font-bold text-slate-900 mt-4 mb-1">
          $1.99<span className="text-xl text-slate-400 font-normal">/mo</span>
        </div>
        <p className="text-sm text-slate-500 mb-8">Free for 30 days, then $1.99/month. Cancel anytime.</p>

        <div className="space-y-2.5 mb-8">
          {ALL_FEATURES.map(f => (
            <div key={f} className="flex items-start gap-2.5">
              <CheckIcon />
              <span className="text-sm text-slate-700">{f}</span>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm text-center transition-colors"
        >
          Start free trial — 30 days free
        </Link>
        <p className="text-xs text-slate-400 text-center mt-3">No credit card required to start</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { q: 'When do I get charged?',         a: 'Your trial starts the moment you sign up. After 30 days, you are charged $1.99/month via Stripe.' },
          { q: 'How do I cancel?',               a: 'Open the billing portal from your account page. Cancel anytime — access continues until the end of your paid period.' },
          { q: 'What happens after I cancel?',   a: 'Premium features stay active until your billing period ends. After that, you can still log in and upgrade.' },
        ].map(item => (
          <div key={item.q} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-2">{item.q}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 rounded-xl bg-slate-900 text-white text-center">
        <p className="text-sm font-semibold mb-1">Payments are processed by Stripe</p>
        <p className="text-xs text-slate-400">
          PerkPulse AI never stores your payment details. All transactions go through Stripe&apos;s secure checkout.
        </p>
      </div>
    </div>
  )
}
