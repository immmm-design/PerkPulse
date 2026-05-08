import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — PerkPulse AI' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-slate-500 text-sm">Last updated: May 2026</p>

      <h2>Acceptance of Terms</h2>
      <p>By creating an account and using PerkPulse AI, you agree to these Terms of Service. If you do not agree, do not use the service.</p>

      <h2>The Service</h2>
      <p>
        PerkPulse AI is a credit card benefit tracking tool. It helps users organize and track the credits and perks offered by their credit cards.
        PerkPulse AI is for informational purposes only and does not provide financial advice.
      </p>

      <h2>Important Disclaimers</h2>
      <ul>
        <li>PerkPulse AI does not guarantee any specific financial savings or outcomes.</li>
        <li>Benefit information in the app is for reference only. Always verify current terms, eligibility, and restrictions directly with your card issuer.</li>
        <li>Card benefit terms change frequently. PerkPulse AI may not reflect the most current issuer terms at all times.</li>
        <li>AI-generated outputs (action plans, benefit parsing) may contain errors. Always verify AI recommendations with your issuer before acting on them.</li>
      </ul>

      <h2>Account and Security</h2>
      <p>You are responsible for keeping your account credentials secure. You must not share your account or use it on behalf of others without permission.</p>

      <h2>Prohibited Uses</h2>
      <p>You may not use PerkPulse AI to:</p>
      <ul>
        <li>Attempt to access other users&apos; data</li>
        <li>Reverse-engineer, scrape, or automate access to the service in bulk</li>
        <li>Violate any applicable laws</li>
      </ul>

      <h2>Subscription and Billing</h2>
      <p>
        After the 30-day free trial, a subscription of $1.99/month is required to access premium features.
        Payments are processed by Stripe. Subscriptions renew automatically until canceled.
        You can cancel at any time through the billing portal — access continues until the end of your paid period.
      </p>

      <h2>Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms.
        You may delete your account at any time through account settings.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        PerkPulse AI is provided &quot;as is&quot; without warranties of any kind.
        We are not liable for any financial loss, missed benefits, or decisions made based on information displayed in the app.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms occasionally. Continued use of the service after changes constitutes acceptance of the new terms.</p>
    </div>
  )
}
