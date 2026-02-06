/**
 * City Layout
 *
 * Wraps all city-specific routes with the CityProvider context.
 * Validates city slug and shows 404 for invalid cities.
 */

import { notFound } from 'next/navigation';
import { CityProvider } from '@/lib/geo/city-context';
import { getCityConfig, CITY_LIST } from '@/lib/geo/cities';
import { isValidCitySlug } from '@/lib/geo/types';
import type { ReactNode } from 'react';

interface CityLayoutProps {
  children: ReactNode;
  params: Promise<{ city: string }>;
}

/**
 * Generate static params for all supported cities
 * This enables static generation for city routes
 */
export function generateStaticParams() {
  return CITY_LIST.map((city) => ({
    city: city.slug,
  }));
}

/**
 * Generate metadata based on city
 */
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = getCityConfig(citySlug);

  if (!city) {
    return { title: 'City Not Found - Resonate' };
  }

  return {
    title: `${city.name} - Resonate`,
    description: city.tagline || `Community media marketplace for ${city.name}`,
  };
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
  const { city: citySlug } = await params;

  // Validate city slug
  if (!isValidCitySlug(citySlug)) {
    notFound();
  }

  const city = getCityConfig(citySlug);
  if (!city) {
    notFound();
  }

  return (
    <CityProvider slug={citySlug}>
      {children}
    </CityProvider>
  );
}
