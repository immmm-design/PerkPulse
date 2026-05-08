import { NextRequest, NextResponse } from 'next/server'
import type { Benefit, BenefitStatus, ActionPlan } from '@/lib/types'
import { generateDeterministicActionPlan } from '@/lib/actionPlan'
import { getServerUser } from '@/lib/supabaseServer'
import { isUserPremium } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  // Premium gate
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isUserPremium(user.id))) {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 402 })
  }

  const { benefits, statuses, today: todayStr } = await req.json() as {
    benefits: Benefit[]
    statuses: BenefitStatus[]
    today: string
  }
  const today = new Date(todayStr)

  const deterministicPlan = generateDeterministicActionPlan(benefits, statuses, today)

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ plan: deterministicPlan, demo: true })
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const unusedBenefits = statuses.filter(s => s.status === 'unused' || s.status === 'expiring_soon' || s.status === 'partially_used')

    const prompt = `You are a personal finance assistant helping a user maximize their credit card benefits.

Today is ${todayStr}.

Unused/expiring benefits:
${unusedBenefits.map(s => {
  const b = benefits.find(b => b.benefit_id === s.benefit_id)
  return `- ${b?.benefit_name} (${b?.card_id}): $${s.remaining_value ?? 'varies'} remaining, ${s.days_left} days left, at ${b?.merchant_restriction}`
}).join('\n')}

Generate a monthly action plan. Be concise, practical, and friendly. Include a disclaimer that users should verify eligibility in their issuer portal.`

    const schema = {
      type: 'object',
      properties: {
        monthly_summary: { type: 'string' },
        priority_actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              benefit_id: { type: 'string' },
              estimated_value: { type: 'string' },
              urgency: { type: 'string', enum: ['high', 'medium', 'low'] },
              reason: { type: 'string' },
            },
            required: ['action', 'benefit_id', 'estimated_value', 'urgency', 'reason'],
            additionalProperties: false,
          },
        },
        missed_value_warning: { type: 'string' },
        safe_disclaimer: { type: 'string' },
      },
      required: ['monthly_summary', 'priority_actions', 'missed_value_warning', 'safe_disclaimer'],
      additionalProperties: false,
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'action_plan', strict: true, schema },
      },
    })

    const plan: ActionPlan = JSON.parse(response.choices[0].message.content ?? '{}')
    return NextResponse.json({ plan, demo: false })
  } catch (err) {
    console.error('Action plan AI error:', err)
    return NextResponse.json({ plan: deterministicPlan, demo: true, error: 'AI call failed' })
  }
}
