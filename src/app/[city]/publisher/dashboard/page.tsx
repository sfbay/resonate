/**
 * Publisher Dashboard Page (City-Scoped)
 *
 * Re-exports the main publisher dashboard.
 * The dashboard uses Supabase data which is not yet city-filtered.
 */

// Re-export the original dashboard page
// In production, this would filter by city
export { default } from '@/app/publisher/dashboard/page';
