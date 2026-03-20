/**
 * Last-visited page tracking via localStorage.
 *
 * Records which functional page the user was on so the city landing
 * can offer a "Continue where you left off" shortcut.
 *
 * SSR-safe: all reads/writes guard against missing `window`.
 */

const STORAGE_KEY = 'resonate:lastVisited';

export interface LastVisited {
  path: string;
  label: string;
  timestamp: number;
}

// Map common route segments to human-readable labels
const ROUTE_LABELS: Record<string, string> = {
  '/publisher/dashboard': 'Publisher Dashboard',
  '/publisher/dashboard/orders': 'Orders',
  '/publisher/dashboard/rate-card': 'Rate Card',
  '/publisher/dashboard/guidelines': 'Guidelines',
  '/government/discover': 'Discover Publishers',
  '/government/campaigns': 'Campaigns',
  '/government/onboarding': 'Campaign Builder',
  '/advertise/create': 'Ad Builder',
  '/advertise/select': 'Select Publishers',
  '/advertise/validate': 'Campaigns',
  '/advertise/dashboard': 'Advertise Dashboard',
};

/**
 * Derive a human-readable label from a path.
 * Strips the city prefix (e.g., /sf) before matching.
 */
function labelForPath(path: string): string {
  // Strip leading /city/ segment
  const stripped = path.replace(/^\/[^/]+/, '');
  return ROUTE_LABELS[stripped] || stripped.split('/').filter(Boolean).pop() || 'Dashboard';
}

/**
 * Record the current page as the last-visited location.
 * Call this in useEffect on functional pages (dashboards, campaigns, etc.)
 */
export function recordLastVisited(path: string, label?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: LastVisited = {
      path,
      label: label || labelForPath(path),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Private browsing or storage full — fail silently
  }
}

/** Read the last-visited entry. Returns null if none exists or on SSR. */
export function getLastVisited(): LastVisited | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastVisited;
  } catch {
    return null;
  }
}

/** Clear the last-visited entry (e.g., when user dismisses the banner). */
export function clearLastVisited(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}

/**
 * Detect which portal a path belongs to, for theming the banner.
 * Returns 'publisher' | 'government' | 'advertiser' | null.
 */
export function portalForPath(path: string): 'publisher' | 'government' | 'advertiser' | null {
  if (path.includes('/publisher')) return 'publisher';
  if (path.includes('/government')) return 'government';
  if (path.includes('/advertise')) return 'advertiser';
  return null;
}
