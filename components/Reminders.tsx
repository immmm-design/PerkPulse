'use client'

import type { Reminder } from '@/lib/types'

interface RemindersProps {
  reminders: Reminder[]
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-800 text-sm">{reminder.benefit_name}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{reminder.card_name}</p>
          <p className="text-sm text-slate-700">{reminder.message}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className={`text-2xl font-bold ${
            reminder.days_until <= 0 ? 'text-red-600' :
            reminder.days_until <= 5 ? 'text-red-500' :
            reminder.days_until <= 10 ? 'text-amber-500' :
            'text-blue-500'
          }`}>
            {reminder.days_until <= 0 ? '0' : reminder.days_until}
          </div>
          <div className="text-xs text-slate-400">
            {reminder.days_until <= 0 ? 'today' : `day${reminder.days_until !== 1 ? 's' : ''} left`}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="p-4 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
      <p className="text-sm">No {label.toLowerCase()} reminders right now.</p>
    </div>
  )
}

export default function Reminders({ reminders }: RemindersProps) {
  const highUrgency = reminders.filter(r => r.urgency === 'high')
  const mediumUrgency = reminders.filter(r => r.urgency === 'medium')
  const lowUrgency = reminders.filter(r => r.urgency === 'low')

  // Deduplicate by benefit_id (show one reminder per benefit)
  const dedupeByBenefit = (list: Reminder[]) => {
    const seen = new Set<string>()
    return list.filter(r => {
      if (seen.has(r.benefit_id)) return false
      seen.add(r.benefit_id)
      return true
    })
  }

  const highList = dedupeByBenefit(highUrgency)
  const mediumList = dedupeByBenefit(mediumUrgency)
  const lowList = dedupeByBenefit(lowUrgency)

  if (reminders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 text-center">
        <div className="text-4xl mb-3">🔔</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No reminders</h3>
        <p className="text-slate-500 text-sm">Add cards and their benefits will appear here with upcoming expiration reminders.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* High Urgency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <h2 className="text-base font-semibold text-red-700">High Urgency</h2>
          {highList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
              {highList.length}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-1">expires within 5 days</span>
        </div>
        {highList.length > 0 ? (
          <div className="space-y-2">
            {highList.map(r => <ReminderCard key={r.reminder_id} reminder={r} />)}
          </div>
        ) : (
          <EmptySection label="high urgency" />
        )}
      </div>

      {/* Medium Urgency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <h2 className="text-base font-semibold text-amber-700">Medium Urgency</h2>
          {mediumList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              {mediumList.length}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-1">expires in 6–10 days</span>
        </div>
        {mediumList.length > 0 ? (
          <div className="space-y-2">
            {mediumList.map(r => <ReminderCard key={r.reminder_id} reminder={r} />)}
          </div>
        ) : (
          <EmptySection label="medium urgency" />
        )}
      </div>

      {/* Low Urgency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <h2 className="text-base font-semibold text-blue-700">Low Urgency</h2>
          {lowList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {lowList.length}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-1">more than 10 days away</span>
        </div>
        {lowList.length > 0 ? (
          <div className="space-y-2">
            {lowList.map(r => <ReminderCard key={r.reminder_id} reminder={r} />)}
          </div>
        ) : (
          <EmptySection label="low urgency" />
        )}
      </div>

      <p className="text-xs text-slate-400 italic text-center">
        Reminders are based on benefit deadlines for your tracked cards. Verify expiration rules in your issuer portal.
      </p>
    </div>
  )
}
