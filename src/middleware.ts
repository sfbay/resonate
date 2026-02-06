/**
 * Next.js Middleware
 *
 * Handles route redirects for backward compatibility:
 * - /publisher/* → /sf/publisher/*
 * - /advertiser/* → /sf/advertiser/*
 *
 * This allows existing links to continue working while
 * transitioning to the multi-city URL structure.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that should be redirected to city-scoped versions
const LEGACY_ROUTES = [
  '/publisher',
  '/advertiser',
];

// Default city for legacy routes
const DEFAULT_CITY = 'sf';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a legacy route that needs redirecting
  for (const route of LEGACY_ROUTES) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      // Build the new city-scoped URL
      const newPath = `/${DEFAULT_CITY}${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = newPath;

      // Use 307 Temporary Redirect to preserve method and body
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these routes
  matcher: [
    '/publisher/:path*',
    '/advertiser/:path*',
  ],
};
