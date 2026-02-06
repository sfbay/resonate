/**
 * Next.js Middleware
 *
 * Handles route redirects to city-scoped versions:
 * - /publisher/* → /sf/publisher/*
 * - /government/* → /sf/government/*
 * - /advertise/* → /sf/advertise/*
 *
 * This allows top-level portal links to route to the
 * correct city-scoped pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Portal routes that redirect to city-scoped versions
const PORTAL_ROUTES = [
  '/publisher',
  '/government',
  '/advertise',
];

// Default city
const DEFAULT_CITY = 'sf';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a portal route that needs city-scoping
  for (const route of PORTAL_ROUTES) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      const newPath = `/${DEFAULT_CITY}${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = newPath;

      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/publisher/:path*',
    '/government/:path*',
    '/advertise/:path*',
  ],
};
