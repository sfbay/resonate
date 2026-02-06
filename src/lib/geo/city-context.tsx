'use client';

/**
 * City Context Provider
 *
 * Provides city-specific configuration to all child components.
 * Use the useCity() hook to access city data in components.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CityConfig, CitySlug, CityContextValue } from './types';
import { getCityConfigOrDefault, SF_CONFIG } from './cities';

// =============================================================================
// CONTEXT
// =============================================================================

const CityContext = createContext<CityContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface CityProviderProps {
  children: ReactNode;
  slug: string;
}

/**
 * City Provider Component
 *
 * Wrap your city-specific routes with this provider to give
 * components access to city configuration via useCity() hook.
 *
 * @example
 * ```tsx
 * // In src/app/[city]/layout.tsx
 * export default function CityLayout({ children, params }) {
 *   return (
 *     <CityProvider slug={params.city}>
 *       {children}
 *     </CityProvider>
 *   );
 * }
 * ```
 */
export function CityProvider({ children, slug }: CityProviderProps) {
  const value = useMemo<CityContextValue>(() => {
    const city = getCityConfigOrDefault(slug);

    return {
      city,
      slug: city.slug,
      isActive: city.status === 'active',
      isComingSoon: city.status === 'coming_soon',

      // Path helpers
      getPath: (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `/${city.slug}${cleanPath}`;
      },
      getApiPath: (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `/api${cleanPath}?city=${city.slug}`;
      },
    };
  }, [slug]);

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Access the current city context
 *
 * @throws Error if used outside of CityProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { city, isActive, getPath } = useCity();
 *
 *   return (
 *     <div>
 *       <h1>{city.name}</h1>
 *       <a href={getPath('/publisher/dashboard')}>Dashboard</a>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCity(): CityContextValue {
  const context = useContext(CityContext);

  if (!context) {
    throw new Error(
      'useCity must be used within a CityProvider. ' +
      'Wrap your component tree with <CityProvider slug="...">.'
    );
  }

  return context;
}

/**
 * Optional city context hook that returns null if not in a provider
 * Useful for components that may or may not be in a city context
 */
export function useCityOptional(): CityContextValue | null {
  return useContext(CityContext);
}

/**
 * Get a city config without needing context
 * Useful for static pages or server components
 */
export function useCityConfig(slug: string): CityConfig {
  return getCityConfigOrDefault(slug);
}

// =============================================================================
// SERVER UTILITIES
// =============================================================================

/**
 * Get city config for server components
 * Does not require context - works anywhere
 */
export function getServerCityConfig(slug: string): CityConfig {
  return getCityConfigOrDefault(slug);
}

/**
 * Default city config for fallback scenarios
 */
export const DEFAULT_CITY = SF_CONFIG;
