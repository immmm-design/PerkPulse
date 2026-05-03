'use client'

import type { Reminder } from '@/lib/types'

interface RemindersProps {
  reminders: Reminder[]
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const isToday  = reminder.days_until === 0
  const critical = reminder.days_until <= 2
  const urgent   = reminder.days_until <= 5

  return (
    <div className={`bg-white rounded-xl border shadow-card overflow-hidden flex ${
      isToday  ? 'border-red-300'  :
      critical ? 'border-rose-200' :
      urgent   ? 'border-amber-200':
                 'border-slate-200'
    }`}>
      {/* Left countdown block */}
      <div className={`shrink-0 w-16 flex flex-col items-center justify-center py-4 ${
        isToday  ? 'bg-red-600'    :
        critical ? 'bg-rose-500'   :
        urgent   ? 'bg-amber-500'  :
                   'bg-sky-500'
      }`}>
        <div className="text-2xl font-bold text-white num leading-none">
          {isToday ? '!' : reminder.days_until}
        </div>
        <div className="text-[9px] font-semibold uppercase tracking-wide text-white/80 mt-0.5">
          {isToday ? 'today' : `day${reminder.days_until !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-sm truncate">{reminder.benefit_name}</div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">{reminder.card_name}</div>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{reminder.message}</p>
      </div>
    </div>
  )
}

function SectionHeader({ label, color, count, description }: {
  label: string; color: string; count: number; description: string
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
      <h2 className="text-sm font-bold text-slate-800">{label}</h2>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          color.includes('red')   ? 'bg-red-50 text-red-700 border-red-200'    :
          color.includes('rose')  ? 'bg-rose-50 text-rose-700 border-rose-200' :
          color.includes('amber') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-sky-50 text-sky-700 border-sky-200'
        }`}>
          {count}
        </span>
      )}
      <span className="text-[11px] text-slate-400">{description}</span>
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-4 py-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
      No {label} reminders right now.
    </div>
  )
}

export default function Reminders({ reminders }: RemindersProps) {
  const dedupeByBenefit = (list: Reminder[]) => {
    const seen = new Set<string>()
    return list.filter(r => {
      if (seen.has(r.benefit_id)) return false
      seen.add(r.benefit_id)
      return true
    })
  }

  const highList   = dedupeByBenefit(reminders.filter(r => r.urgency === 'high'))
  const mediumList = dedupeByBenefit(reminders.filter(r => r.urgency === 'medium'))
  const lowList    = dedupeByBenefit(reminders.filter(r => r.urgency === 'low'))

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">All clear</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          No upcoming reminders. Add cards and track benefits to receive expiration alerts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* High urgency */}
      <div>
        <SectionHeader
          label="Urgent"
          color="bg-rose-500"
          count={highList.length}
          description="expiring within 5 days"
        />
        {highList.length > 0
          ? <div className="space-y-2">{highList.map(r => <ReminderRow key={r.reminder_id} reminder={r} />)}</div>
          : <EmptyRow label="urgent" />
        }
      </div>

      {/* Medium urgency */}
      <div>
        <SectionHeader
          label="Coming Up"
          color="bg-amber-500"
          count={mediumList.length}
          description="6–10 days away"
        />
        {mediumList.length > 0
          ? <div className="space-y-2">{mediumList.map(r => <ReminderRow key={r.reminder_id} reminder={r} />)}</div>
          : <EmptyRow label="medium-urgency" />
        }
      </div>

      {/* Low urgency */}
      <div>
        <SectionHeader
          label="On the Horizon"
          color="bg-sky-400"
          count={lowList.length}
          description="more than 10 days away"
        />
        {lowList.length > 0
          ? <div className="space-y-2">{lowList.map(r => <ReminderRow key={r.reminder_id} reminder={r} />)}</div>
          : <EmptyRow label="low-urgency" />
        }
      </div>

      <p className="text-[11px] text-slate-400 italic text-center">
        Reminders are based on benefit deadlines for your tracked cards. Verify expiration rules in your issuer portal.
      </p>
    </div>
  )
}
