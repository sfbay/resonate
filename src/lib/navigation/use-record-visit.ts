'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordLastVisited } from './last-visited';

/**
 * Hook that records the current page as the last-visited location.
 * Drop this into any functional page to enable "Continue where you left off"
 * on the city landing page.
 *
 * Usage:
 *   useRecordVisit();           // auto-detects label from path
 *   useRecordVisit('My Page');  // custom label
 */
export function useRecordVisit(label?: string): void {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      recordLastVisited(pathname, label);
    }
  }, [pathname, label]);
}
