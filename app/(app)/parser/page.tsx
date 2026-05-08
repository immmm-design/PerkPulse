'use client'

import { useSubscription } from '@/lib/subscriptionContext'
import AddBenefit from '@/components/AddBenefit'
import UpgradeGate from '@/components/UpgradeGate'

export default function ParserPage() {
  const { isPremium, loading } = useSubscription()

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <UpgradeGate feature="AI Benefit Parser" isPremium={isPremium}>
      <AddBenefit />
    </UpgradeGate>
  )
}
