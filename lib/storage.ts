// Deprecated: localStorage-based storage replaced by Supabase-backed lib/db.ts
// Re-export the new helpers as legacy aliases so any external code continues to work
export {
  getUserCards,
  getUsageLog,
  addUsageEntry,
  clearUsageForBenefit,
  getCardSettings,
} from './db'
