'use client';

import { useState } from 'react';
import Link from 'next/link';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-teal-50 border-b border-teal-200 px-4 py-2.5 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium text-xs">
          DEMO
        </span>
        <span className="text-teal-800">
          You&apos;re viewing a demo &mdash;{' '}
          <Link href="/sign-in" className="underline font-medium hover:text-teal-900">
            Sign in
          </Link>{' '}
          to access your dashboard
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-teal-500 hover:text-teal-700 ml-4"
        aria-label="Dismiss demo banner"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
