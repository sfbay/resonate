'use client';

/**
 * CityNeighborhoodMap - City-aware map wrapper
 *
 * Dispatches to the correct city-specific neighborhood map based on
 * the current CityProvider context. This is the key flexibility layer
 * for multi-city expansion (e.g., Chicago).
 *
 * Uses dynamic imports so each city's map + GeoJSON is only loaded when needed.
 */

import dynamic from 'next/dynamic';
import { useCity } from '@/lib/geo/city-context';
import { isActiveCity } from '@/lib/geo/types';
import type { SFNeighborhoodMapProps } from './SFNeighborhoodMap';

// Lazy-load city-specific maps
const SFNeighborhoodMap = dynamic(
  () => import('./SFNeighborhoodMap').then(mod => ({ default: mod.SFNeighborhoodMap })),
  { ssr: false }
);

// Future: const ChicagoNeighborhoodMap = dynamic(...)

type CityNeighborhoodMapProps = Omit<SFNeighborhoodMapProps, 'onNeighborhoodClick' | 'onNeighborhoodHover'>;

export function CityNeighborhoodMap(props: CityNeighborhoodMapProps) {
  const { city } = useCity();

  if (!isActiveCity(city) || !city.hasGeoJSON) {
    return null; // No map for coming-soon cities
  }

  if (city.slug === 'sf') {
    return <SFNeighborhoodMap {...props} />;
  }

  // Future: if (city.slug === 'chicago') return <ChicagoNeighborhoodMap {...props} />;

  return null;
}
