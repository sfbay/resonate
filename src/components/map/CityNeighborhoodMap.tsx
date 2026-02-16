'use client';

/**
 * CityNeighborhoodMap - City-aware map wrapper
 *
 * Dispatches to the correct city-specific neighborhood map based on
 * the current CityProvider context. This is the key flexibility layer
 * for multi-city expansion.
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

const ChicagolandMap = dynamic(
  () => import('./ChicagolandMap').then(mod => ({ default: mod.ChicagolandMap })),
  { ssr: false }
);

type CityNeighborhoodMapProps = Omit<SFNeighborhoodMapProps, 'onNeighborhoodClick' | 'onNeighborhoodHover'> & {
  className?: string;
};

export function CityNeighborhoodMap(props: CityNeighborhoodMapProps) {
  const { city } = useCity();

  if (!isActiveCity(city) || !city.hasGeoJSON) {
    return null; // No map for coming-soon cities
  }

  if (city.slug === 'sf') {
    return <SFNeighborhoodMap {...props} />;
  }

  if (city.slug === 'chicago') {
    return <ChicagolandMap className={props.className} height={props.height} />;
  }

  return null;
}
