import Link from 'next/link'

function MarketingHeader() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="3"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
              <line x1="6" y1="15" x2="9" y2="15"/>
              <line x1="12" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <span className="text-base font-bold">PerkPulse</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Start free
          </Link>
        </nav>
      </div>
    </header>
  )
}

function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-white font-bold mb-1">PerkPulse AI</div>
            <p className="text-xs leading-relaxed max-w-xs">
              Credit card benefit tracking. No card numbers. No sensitive data. Just perks.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login"   className="hover:text-white transition-colors">Sign in</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-600">
          PerkPulse AI is not affiliated with any card issuer. Benefit data is for informational purposes only.
          Always verify terms with your card issuer. Payments are processed by Stripe.
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
