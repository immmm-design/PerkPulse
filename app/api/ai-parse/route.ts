import { NextRequest, NextResponse } from 'next/server'

const DEMO_RESULT = {
  issuer: 'American Express',
  card_name: 'American Express Gold Card',
  benefit_name: 'Sample Benefit',
  benefit_type: 'statement_credit',
  value_amount: '10',
  frequency: 'monthly',
  reset_rule: 'calendar_month',
  deadline: null,
  merchant_restriction: 'Eligible merchants',
  requires_enrollment: true,
  plain_english: 'Use your card at eligible merchants once per month to receive up to $10 back as a statement credit.',
  risk_flags: ['Demo mode — AI parsing not active. Set OPENAI_API_KEY for real parsing.'],
  confidence: 'low' as const,
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ result: DEMO_RESULT, demo: true })
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const schema = {
      type: 'object',
      properties: {
        issuer: { type: 'string' },
        card_name: { type: 'string' },
        benefit_name: { type: 'string' },
        benefit_type: { type: 'string', enum: ['statement_credit', 'merchant_offer', 'reward_multiplier', 'subscription_credit', 'category_optimization', 'other'] },
        value_amount: { type: 'string' },
        frequency: { type: 'string', enum: ['monthly', 'semiannual', 'annual', 'quarterly', 'offer_based', 'one_time', 'unknown'] },
        reset_rule: { type: 'string' },
        deadline: { type: ['string', 'null'] },
        merchant_restriction: { type: 'string' },
        requires_enrollment: { type: 'boolean' },
        plain_english: { type: 'string' },
        risk_flags: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      },
      required: ['issuer', 'card_name', 'benefit_name', 'benefit_type', 'value_amount', 'frequency', 'reset_rule', 'deadline', 'merchant_restriction', 'requires_enrollment', 'plain_english', 'risk_flags', 'confidence'],
      additionalProperties: false,
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a credit card benefit parser. Extract structured information from credit card benefit descriptions.
Always add a risk_flag noting "Confirm eligibility in your issuer portal. This app does not guarantee credits."
Never make guaranteed financial promises in plain_english.`,
        },
        { role: 'user', content: `Parse this credit card benefit text:\n\n${text}` },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'benefit_parse', strict: true, schema },
      },
    })

    const result = JSON.parse(response.choices[0].message.content ?? '{}')
    return NextResponse.json({ result, demo: false })
  } catch (err) {
    console.error('AI parse error:', err)
    return NextResponse.json({ result: DEMO_RESULT, demo: true, error: 'AI call failed' })
  }
}
