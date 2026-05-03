# PerkPulse AI

An AI-powered credit card benefit tracker that helps you maximize your card perks without missing monthly credits, expiring offers, or better purchase options.

## What it does
- Tracks monthly, semiannual, and offer-based credit card benefits
- Shows unused value and days remaining before credits expire
- Generates AI monthly action plans
- Recommends which card to use for each purchase
- Parses new benefit language into structured data with AI

## What it does NOT do
- Never asks for credit card numbers
- Never connects to bank accounts
- Never imports real transactions
- No sensitive financial data required

## Privacy
You only enter card names. All data stays in your browser (localStorage). No server-side storage of personal data.

## Setup

```bash
npm install
npm run dev
```

## AI Features (optional)
Create a `.env.local` file:
```
OPENAI_API_KEY=your_key_here
```
Without an API key, the app runs in demo mode with deterministic placeholder responses.

## Disclaimer
Benefit data is seeded for prototype/demonstration purposes. Always verify benefit eligibility and current rules in your issuer portal. This app does not guarantee statement credits.

## Deploy to Vercel
```bash
vercel
```
Set `OPENAI_API_KEY` in Vercel environment variables for AI features.
