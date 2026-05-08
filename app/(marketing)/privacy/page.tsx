import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — PerkPulse AI' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-slate-500 text-sm">Last updated: May 2026</p>

      <h2>What we collect</h2>
      <p>PerkPulse AI collects only what is necessary to provide the service:</p>
      <ul>
        <li><strong>Email address</strong> — used for sign-in via magic link. We never use it for marketing without explicit consent.</li>
        <li><strong>Card names and benefit usage</strong> — you choose which cards to add by name only. We never ask for account numbers, card numbers, or credentials.</li>
        <li><strong>Subscription status</strong> — stored via Stripe customer ID to manage billing. No payment details are stored in our database.</li>
      </ul>

      <h2>What we do not collect</h2>
      <ul>
        <li>Full credit card or debit card numbers</li>
        <li>Bank account credentials or login information</li>
        <li>Social Security Numbers or tax IDs</li>
        <li>Exact transaction data or account balances</li>
      </ul>

      <h2>How your data is stored</h2>
      <p>
        User data is stored in Supabase, a hosted PostgreSQL database. All records are protected by Row Level Security (RLS) policies — your data is only accessible to you.
        Supabase is SOC 2 Type II certified.
      </p>

      <h2>Payments</h2>
      <p>
        Subscription payments are processed by Stripe. PerkPulse AI does not see, store, or have access to your payment card details.
        Stripe&apos;s privacy policy governs payment data. We store only a Stripe customer ID to manage your subscription status.
      </p>

      <h2>AI and OpenAI</h2>
      <p>
        When you use the AI benefit parser, the text you paste is sent to OpenAI for processing. Do not paste account numbers, personal identifiers, or sensitive financial data — only paste benefit description language from your card issuer.
      </p>

      <h2>Third parties</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication</li>
        <li><strong>Stripe</strong> — subscription billing</li>
        <li><strong>OpenAI</strong> — AI parsing (benefit text only, when you opt in)</li>
        <li><strong>Vercel</strong> — hosting</li>
      </ul>

      <h2>Data deletion</h2>
      <p>To delete your account and all associated data, contact us at the email listed in the app. We will process deletion within 30 days.</p>

      <h2>Contact</h2>
      <p>Questions about privacy? Contact us through the account settings in the app.</p>

      <div className="text-xs text-slate-400 mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        PerkPulse AI provides benefit tracking for informational purposes only. Always verify benefit eligibility, terms, and restrictions directly with your card issuer. We do not guarantee any specific financial outcome or savings.
      </div>
    </div>
  )
}
