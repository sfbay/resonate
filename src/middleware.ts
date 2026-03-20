import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/home(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/media-kit(.*)',
  '/demo(.*)',
  '/api/webhooks(.*)',
  // City landing pages are public
  '/:city',
  // Portal landing pages are public (prospect-facing)
  '/:city/publisher',
  '/:city/government',
  '/:city/advertise',
  // Onboarding flows are public (registration)
  '/:city/publisher/onboarding',
  '/:city/government/onboarding',
  '/:city/advertise/onboarding',
  '/:city/government/discover',
]);

// Portal routes that need city-scoping redirect
const PORTAL_PREFIXES = ['/publisher', '/government', '/advertise'];
const DEFAULT_CITY = 'sf';

// Map org type → allowed portal path segments
const PORTAL_ACCESS: Record<string, string[]> = {
  publisher: ['publisher', 'advertise'],
  government: ['government'],
  advertiser: ['advertise'],
  admin: ['publisher', 'government', 'advertise'],
};

// Map org type → default portal home path
const PORTAL_HOME: Record<string, string> = {
  publisher: '/publisher/dashboard',
  government: '/government/discover',
  advertiser: '/advertise/dashboard',
  admin: '/government/discover',
};

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 1. City-scoping redirect (runs for all users, auth or not)
  for (const prefix of PORTAL_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_CITY}${pathname}`;
      return NextResponse.redirect(url, 307);
    }
  }

  // 2. Public routes — no auth required
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 3. Protected routes — require auth
  const { userId, sessionClaims } = await auth.protect();

  // 4. Portal access control (only for city-scoped portal routes)
  // Match pattern: /[city]/[portal]/...
  const cityPortalMatch = pathname.match(/^\/[^/]+\/(publisher|government|advertise)(\/|$)/);
  if (cityPortalMatch && userId) {
    const portal = cityPortalMatch[1];
    const orgType = (sessionClaims?.metadata as Record<string, string>)?.orgType || 'advertiser';
    const allowedPortals = PORTAL_ACCESS[orgType] || [];

    if (!allowedPortals.includes(portal)) {
      // Redirect to user's home portal
      const homePath = PORTAL_HOME[orgType] || '/advertise/dashboard';
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_CITY}${homePath}`;
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
