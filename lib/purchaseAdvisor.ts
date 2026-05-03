import type { PurchaseCategory } from './types'
import { CARDS, PURCHASE_CATEGORIES } from './data'

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  dining: ['restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee', 'pizza', 'sushi', 'burger', 'taco', 'bar', 'grill', 'bistro', 'eatery', 'food', 'dine'],
  groceries: ['grocery', 'groceries', 'supermarket', 'whole foods', 'trader joe', 'kroger', 'safeway', 'publix', 'costco', 'walmart', 'target', 'market'],
  entertainment: ['concert', 'movie', 'theater', 'theatre', 'ticket', 'show', 'event', 'festival', 'sport', 'game', 'museum', 'zoo', 'amusement'],
  streaming: ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'apple tv', 'peacock', 'paramount', 'youtube premium', 'amazon prime', 'streaming'],
  'online shopping': ['amazon', 'online', 'ebay', 'etsy', 'shopify', 'shop online', 'internet', 'website', 'delivery'],
  gas: ['gas', 'fuel', 'ev', 'electric', 'charging', 'shell', 'bp', 'exxon', 'mobil', 'chevron', 'station'],
  travel: ['hotel', 'flight', 'airline', 'airbnb', 'vrbo', 'travel', 'trip', 'vacation', 'cruise', 'resort', 'airport', 'uber', 'lyft', 'taxi', 'rental car'],
}

export function detectPurchaseCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category
    }
  }
  return 'general'
}

export function recommendCard(
  category: string,
  userCardIds: string[]
): { primary: PurchaseCategory | null; alternatives: PurchaseCategory[] } {
  const match = PURCHASE_CATEGORIES.find(c => c.category === category)
  if (!match) return { primary: null, alternatives: [] }

  const userOwnsPreferred = userCardIds.includes(match.preferred_card_id)
  if (userOwnsPreferred) {
    const alts = PURCHASE_CATEGORIES.filter(
      c => c.category === category && c.preferred_card_id !== match.preferred_card_id && userCardIds.includes(c.preferred_card_id)
    )
    return { primary: match, alternatives: alts }
  }

  const userMatch = PURCHASE_CATEGORIES.find(
    c => c.category === category && userCardIds.includes(c.preferred_card_id)
  )
  return {
    primary: userMatch ?? null,
    alternatives: [],
  }
}

export function getCardName(card_id: string): string {
  return CARDS.find(c => c.card_id === card_id)?.card_name ?? card_id
}
