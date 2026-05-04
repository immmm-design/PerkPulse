import type { PurchaseCategory, CardSettingsMap } from './types'
import { CARDS, PURCHASE_CATEGORIES } from './data'

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  dining:            ['restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee', 'pizza', 'sushi', 'burger', 'taco', 'bar', 'grill', 'bistro', 'eatery', 'food', 'dine'],
  groceries:         ['grocery', 'groceries', 'supermarket', 'whole foods', 'trader joe', 'kroger', 'safeway', 'publix', 'costco', 'walmart', 'target', 'market'],
  entertainment:     ['concert', 'movie', 'theater', 'theatre', 'ticket', 'show', 'event', 'festival', 'sport', 'game', 'museum', 'zoo', 'amusement'],
  streaming:         ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'apple tv', 'peacock', 'paramount', 'youtube premium', 'amazon prime', 'streaming'],
  'online shopping': ['amazon', 'online', 'ebay', 'etsy', 'shopify', 'shop online', 'internet', 'website', 'delivery'],
  gas:               ['gas', 'fuel', 'ev', 'electric', 'charging', 'shell', 'bp', 'exxon', 'mobil', 'chevron', 'station'],
  travel:            ['hotel', 'flight', 'airline', 'airbnb', 'vrbo', 'travel', 'trip', 'vacation', 'cruise', 'resort', 'airport', 'uber', 'lyft', 'taxi', 'rental car'],
  drugstores:        ['pharmacy', 'drugstore', 'walgreens', 'cvs', 'rite aid', 'prescription'],
}

const BOA_CATEGORY_TO_PURCHASE: Record<string, string> = {
  gas:              'gas',
  online_shopping:  'online shopping',
  dining:           'dining',
  travel:           'travel',
  drug_stores:      'drugstores',
  home_improvement: 'home improvement',
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
  userCardIds: string[],
  cardSettings: CardSettingsMap = {}
): {
  primary: PurchaseCategory | null
  alternatives: PurchaseCategory[]
  boaSetupWarning: boolean
} {
  const boaOwned = userCardIds.includes('boa_customized_cash')
  const boaCategory = cardSettings['boa_customized_cash']?.selected_category
  const boaSetupWarning = boaOwned && !boaCategory

  const matchingPurchaseCategory = boaCategory
    ? BOA_CATEGORY_TO_PURCHASE[boaCategory]
    : null

  function isBoaEligible(rec: PurchaseCategory): boolean {
    if (rec.preferred_card_id !== 'boa_customized_cash') return true
    if (!boaOwned) return false
    if (!boaCategory) return false
    return matchingPurchaseCategory === rec.category
  }

  const eligible = PURCHASE_CATEGORIES.filter(
    c => c.category === category && userCardIds.includes(c.preferred_card_id) && isBoaEligible(c)
  )

  if (eligible.length === 0) return { primary: null, alternatives: [], boaSetupWarning }

  const [primary, ...rest] = eligible
  return { primary, alternatives: rest, boaSetupWarning }
}

export function getCardName(card_id: string): string {
  return CARDS.find(c => c.card_id === card_id)?.card_name ?? card_id
}
