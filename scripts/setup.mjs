#!/usr/bin/env node
/**
 * PerkPulse AI — One-command setup
 * Run: npm run setup
 *
 * What it does automatically:
 *   ✓ Validates all required env vars
 *   ✓ Creates Stripe product + $1.99/mo price (writes STRIPE_PRICE_ID_MONTHLY back to .env.local)
 *   ✓ Configures Stripe Customer Portal
 *   ✓ Verifies Supabase connection + checks if schema has been applied
 *
 * One step still requires you:
 *   → Stripe webhook secret (needs your live URL first)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ── Colours (no dependencies) ─────────────────────────────────────────────────
const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

const ok   = msg => console.log(`  ${c.green('✓')}  ${msg}`)
const fail = msg => console.log(`  ${c.red('✗')}  ${msg}`)
const warn = msg => console.log(`  ${c.yellow('⚠')}  ${msg}`)
const note = msg => console.log(`     ${c.dim(msg)}`)
const head = msg => console.log(`\n${c.bold(msg)}\n${'─'.repeat(60)}`)

// ── Parse .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local')
  if (!existsSync(envPath)) {
    console.error(c.red('\n  .env.local not found.\n'))
    console.error('  Copy .env.example to .env.local and fill in your values, then re-run.\n')
    process.exit(1)
  }
  const raw = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (val) env[key] = val
  }
  return { env, envPath, raw }
}

// Write or update a single key in .env.local
function setEnvVar(envPath, raw, key, value) {
  const lines   = raw.split('\n')
  let   found   = false
  const updated = lines.map(line => {
    if (line.match(new RegExp(`^${key}\\s*=`))) { found = true; return `${key}=${value}` }
    return line
  })
  if (!found) updated.push(`${key}=${value}`)
  const next = updated.join('\n')
  writeFileSync(envPath, next)
  return next
}

// Is a value "real" (not a placeholder)?
const isSet = v => v && !v.includes('...') && v !== 'change_me'

// ── Stripe helpers (raw fetch, no SDK needed) ─────────────────────────────────
async function stripe(secretKey, method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization:  `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  })
  return res.json()
}

async function ensureStripePrice(key) {
  const product = await stripe(key, 'POST', '/products', {
    name:        'PerkPulse AI Premium',
    description: 'Unlimited benefit tracking + AI features',
  })
  if (product.error) throw new Error(product.error.message)

  const price = await stripe(key, 'POST', '/prices', {
    product:                product.id,
    unit_amount:            '199',
    currency:               'usd',
    'recurring[interval]':  'month',
  })
  if (price.error) throw new Error(price.error.message)
  return price.id
}

async function configurePortal(key, appUrl) {
  // Check if a configuration already exists
  const list = await stripe(key, 'GET', '/billing_portal/configurations?limit=1', null)
  if (list.data && list.data.length > 0) return 'already_configured'

  const cfg = await stripe(key, 'POST', '/billing_portal/configurations', {
    'business_profile[headline]':                    'Manage your PerkPulse AI subscription',
    'business_profile[privacy_policy_url]':          `${appUrl}/privacy`,
    'business_profile[terms_of_service_url]':        `${appUrl}/terms`,
    'features[invoice_history][enabled]':            'true',
    'features[payment_method_update][enabled]':      'true',
    'features[subscription_cancel][enabled]':        'true',
    'features[subscription_cancel][mode]':           'at_period_end',
    'features[subscription_pause][enabled]':         'false',
  })
  if (cfg.error) throw new Error(cfg.error.message)
  return 'created'
}

async function checkWebhook(key, appUrl) {
  const list = await stripe(key, 'GET', '/webhook_endpoints?limit=20', null)
  if (!list.data) return false
  const webhookUrl = `${appUrl}/api/stripe/webhook`
  return list.data.some(wh => wh.url === webhookUrl && wh.status === 'enabled')
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function checkSupabase(url, serviceKey) {
  try {
    const res = await fetch(`${url}/rest/v1/subscriptions?limit=1`, {
      headers: {
        apikey:        serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer:        'count=none',
      },
    })
    if (res.ok) return { ok: true }
    const body = await res.json().catch(() => ({}))
    const msg  = body?.message ?? body?.hint ?? `HTTP ${res.status}`
    return { ok: false, missing: res.status === 404 || msg.includes('relation'), reason: msg }
  } catch (e) {
    return { ok: false, missing: false, reason: e.message }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log()
  console.log(c.bold('  🚀  PerkPulse AI — Setup'))
  console.log()

  let { env, envPath, raw } = loadEnv()

  const issues = []

  // ── 1. Env var check ─────────────────────────────────────────────────────
  head('1 / 4   Environment variables')

  const VARS = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL',           label: 'Supabase URL',            hint: 'Supabase → Settings → API' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',      label: 'Supabase Anon Key',       hint: 'Supabase → Settings → API' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY',          label: 'Supabase Service Role Key',hint: 'Supabase → Settings → API' },
    { key: 'STRIPE_SECRET_KEY',                  label: 'Stripe Secret Key',        hint: 'Stripe → Developers → API Keys' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', label: 'Stripe Publishable Key',   hint: 'Stripe → Developers → API Keys' },
    { key: 'NEXT_PUBLIC_APP_URL',                label: 'App URL',                  hint: 'http://localhost:3000  or  https://your-domain.com' },
  ]
  const OPTIONAL_VARS = [
    { key: 'STRIPE_PRICE_ID_MONTHLY', label: 'Stripe Price ID',  hint: '← auto-created if Stripe key is set' },
    { key: 'STRIPE_WEBHOOK_SECRET',   label: 'Webhook Secret',   hint: '← requires live URL (see step 4)' },
    { key: 'DEEPSEEK_API_KEY',        label: 'DeepSeek API Key', hint: 'Optional — enables AI features' },
  ]

  for (const { key, label, hint } of VARS) {
    if (isSet(env[key])) { ok(label) }
    else { fail(`${label} not set`); note(`Set in .env.local  ←  ${hint}`); issues.push(key) }
  }
  console.log()
  for (const { key, label, hint } of OPTIONAL_VARS) {
    if (isSet(env[key])) { ok(`${label}`) }
    else { warn(`${label} not set  ${c.dim('— ' + hint)}`) }
  }

  // ── 2. Stripe ─────────────────────────────────────────────────────────────
  head('2 / 4   Stripe')

  const stripeKey = env['STRIPE_SECRET_KEY']
  const appUrl    = (env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000').replace(/\/$/, '')

  if (!isSet(stripeKey)) {
    warn('Skipping Stripe checks — STRIPE_SECRET_KEY not set')
  } else {
    // Product + price
    if (isSet(env['STRIPE_PRICE_ID_MONTHLY'])) {
      ok(`Price ID already set  ${c.dim('(' + env['STRIPE_PRICE_ID_MONTHLY'] + ')')}`)
    } else {
      process.stdout.write('  Creating product + $1.99/mo price… ')
      try {
        const priceId = await ensureStripePrice(stripeKey)
        raw = setEnvVar(envPath, raw, 'STRIPE_PRICE_ID_MONTHLY', priceId)
        env['STRIPE_PRICE_ID_MONTHLY'] = priceId
        console.log(c.green('done'))
        ok(`Price created and saved to .env.local  ${c.dim('(' + priceId + ')')}`)
      } catch (e) {
        console.log(c.red('failed'))
        fail(`Could not create Stripe price: ${e.message}`)
        issues.push('STRIPE_PRICE_ID_MONTHLY')
      }
    }

    // Customer Portal
    process.stdout.write('  Configuring Customer Portal… ')
    try {
      const result = await configurePortal(stripeKey, appUrl)
      console.log(c.green('done'))
      ok(result === 'already_configured' ? 'Customer Portal already configured' : 'Customer Portal configured')
    } catch (e) {
      console.log(c.yellow('skipped'))
      warn(`Portal config failed (you may need to activate it manually): ${e.message}`)
    }

    // Webhook check
    const webhookOk = await checkWebhook(stripeKey, appUrl)
    if (webhookOk) {
      ok('Webhook endpoint registered')
    } else if (appUrl.includes('localhost')) {
      warn(`Webhook not configured — expected for local dev`)
      note('For local testing:  stripe listen --forward-to localhost:3000/api/stripe/webhook')
      note('Paste the whsec_... it prints as STRIPE_WEBHOOK_SECRET in .env.local')
    } else {
      fail(`No webhook found pointing to ${appUrl}/api/stripe/webhook`)
      issues.push('STRIPE_WEBHOOK_SECRET')
    }
  }

  // ── 3. Supabase ───────────────────────────────────────────────────────────
  head('3 / 4   Supabase')

  const sbUrl = env['NEXT_PUBLIC_SUPABASE_URL']
  const sbKey = env['SUPABASE_SERVICE_ROLE_KEY']

  if (!isSet(sbUrl) || !isSet(sbKey)) {
    warn('Skipping Supabase checks — keys not set')
  } else {
    process.stdout.write('  Checking database tables… ')
    const result = await checkSupabase(sbUrl, sbKey)
    if (result.ok) {
      console.log(c.green('done'))
      ok('All tables present — schema is applied')
    } else if (result.missing) {
      console.log(c.red('missing'))
      fail('Database tables not found — schema not applied yet')
      note('')
      note('Apply the schema in 3 clicks:')
      note(`  1. Open ${sbUrl.replace('https://', '').split('.')[0]} → SQL Editor in Supabase Dashboard`)
      note('  2. Click "New query", paste the contents of  supabase_schema.sql')
      note('  3. Click Run — then run  npm run setup  again to confirm')
      issues.push('supabase_schema')
    } else {
      console.log(c.red('error'))
      fail(`Could not reach Supabase: ${result.reason}`)
      issues.push('supabase_connection')
    }
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────
  head('4 / 4   Summary')

  if (issues.length === 0) {
    console.log(`  ${c.green(c.bold('✅  Everything is set up — you are ready to launch!'))}`)
    console.log()
    console.log(`  ${c.dim('Start the dev server:')}  npm run dev`)
    console.log(`  ${c.dim('Deploy to Vercel:')}      push to main and import at vercel.com/new`)
  } else {
    console.log(`  ${c.yellow('⚠')}  ${issues.length} thing${issues.length > 1 ? 's' : ''} still need${issues.length === 1 ? 's' : ''} your attention:`)
    console.log()

    const GUIDANCE = {
      STRIPE_WEBHOOK_SECRET: [
        'Set up Stripe webhook:',
        `  a) Stripe Dashboard → Developers → Webhooks → Add endpoint`,
        `  b) URL: ${appUrl}/api/stripe/webhook`,
        '  c) Events: checkout.session.completed, customer.subscription.*,',
        '             invoice.payment_failed, invoice.payment_succeeded',
        '  d) Copy Signing Secret → paste as STRIPE_WEBHOOK_SECRET in .env.local',
      ],
      supabase_schema: [
        'Apply Supabase schema:',
        '  Supabase Dashboard → SQL Editor → New query → paste supabase_schema.sql → Run',
      ],
    }

    let n = 1
    for (const issue of issues) {
      const lines = GUIDANCE[issue]
      if (lines) {
        console.log(`  ${n++}. ${lines[0]}`)
        lines.slice(1).forEach(l => console.log(`     ${c.dim(l)}`))
        console.log()
      } else {
        console.log(`  ${n++}. Set  ${issue}  in .env.local`)
        console.log()
      }
    }

    console.log(`  After fixing, run  ${c.bold('npm run setup')}  again.\n`)
  }
}

main().catch(e => {
  console.error(c.red(`\n  Setup failed: ${e.message}\n`))
  process.exit(1)
})
