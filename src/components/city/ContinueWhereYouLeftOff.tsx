'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLastVisited, clearLastVisited, portalForPath, type LastVisited } from '@/lib/navigation/last-visited';

/**
 * Slim banner that shows "Continue where you left off: [Page] →"
 * when the user has a recorded last-visited functional page.
 * Dismissible via X button. Themed to the portal color.
 */
export function ContinueWhereYouLeftOff() {
  const [entry, setEntry] = useState<LastVisited | null>(null);

  useEffect(() => {
    setEntry(getLastVisited());
  }, []);

  if (!entry) return null;

  const portal = portalForPath(entry.path);
  const accentClass =
    portal === 'publisher' ? 'border-[var(--color-coral)]/30 text-[var(--color-coral)]' :
    portal === 'government' ? 'border-[var(--color-teal)]/30 text-[var(--color-teal)]' :
    'border-[var(--color-marigold)]/30 text-[var(--color-marigold-dark)]';

  const bgClass =
    portal === 'publisher' ? 'bg-[var(--color-coral)]/5' :
    portal === 'government' ? 'bg-[var(--color-teal)]/5' :
    'bg-[var(--color-marigold)]/5';

  return (
    <div className={`max-w-6xl mx-auto px-6 mb-6`}>
      <div className={`flex items-center justify-between rounded-xl border ${accentClass} ${bgClass} px-5 py-3`}>
        <Link
          href={entry.path}
          className={`flex items-center gap-2 text-sm font-semibold ${accentClass} hover:opacity-80 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Continue where you left off: {entry.label}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <button
          onClick={() => { clearLastVisited(); setEntry(null); }}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
