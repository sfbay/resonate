'use client';

/**
 * ChicagolandMap - Interactive Chicagoland community area map
 *
 * Displays Chicago's 77 community areas with choropleth coloring,
 * plus 6-county metro outlines as reference boundaries.
 *
 * Follows the same architecture as SFNeighborhoodMap:
 * - Hover: Visual highlight
 * - Click: Calls parent callback with area ID + position
 * - Choropleth coloring by demographic/coverage data
 *
 * Zoom-aware labeling:
 * - zoom < 10: County labels visible
 * - zoom >= 10: Community area labels visible
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, type MapRef, type LayerProps } from 'react-map-gl/mapbox';
import type { MapMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import { getChicagolandGeoJSON } from '@/lib/geo/chicagoland-boundaries.geojson';

import 'mapbox-gl/dist/mapbox-gl.css';

type MapLayerMouseEvent = MapMouseEvent & { features?: MapboxGeoJSONFeature[] };

// =============================================================================
// CONSTANTS
// =============================================================================

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const CHICAGO_CENTER = {
  longitude: -87.75,
  latitude: 41.85,
  zoom: 9.5,
};

// =============================================================================
// TYPES
// =============================================================================

export type ChicagolandMapColorBy = 'none' | 'audience' | 'coverage';

export interface ChicagolandMapProps {
  colorBy?: ChicagolandMapColorBy;
  highlightedAreas?: string[];
  selectedAreas?: string[];
  coverageData?: Record<string, number>; // area ID → 0-100 value
  onAreaClick?: (areaId: string, position: { x: number; y: number }) => void;
  onAreaHover?: (areaId: string | null) => void;
  className?: string;
  height?: string | number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChicagolandMap({
  colorBy = 'none',
  highlightedAreas = [],
  selectedAreas = [],
  coverageData = {},
  onAreaClick,
  onAreaHover,
  className = '',
  height = 500,
}: ChicagolandMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // Load GeoJSON data
  const geojson = useMemo(() => getChicagolandGeoJSON(), []);

  // Separate community areas and county outlines
  const communityAreaData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: geojson.features.filter(f => f.properties.type === 'community_area'),
  }), [geojson]);

  const countyData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: geojson.features.filter(f => f.properties.type === 'county'),
  }), [geojson]);

  // Build fill color expression based on colorBy mode
  const fillColor = useMemo((): LayerProps['paint'] => {
    if (colorBy === 'coverage' && Object.keys(coverageData).length > 0) {
      // Build a match expression for coverage choropleth
      const matchExpr: (string | number | string[])[] = ['match', ['get', 'id']];
      for (const [id, value] of Object.entries(coverageData)) {
        matchExpr.push(id);
        if (value >= 80) matchExpr.push('#0d9488'); // teal-600
        else if (value >= 60) matchExpr.push('#14b8a6'); // teal-500
        else if (value >= 40) matchExpr.push('#5eead4'); // teal-300
        else if (value >= 20) matchExpr.push('#99f6e4'); // teal-200
        else matchExpr.push('#ccfbf1'); // teal-100
      }
      matchExpr.push('#f1f5f9'); // default: slate-100

      return {
        'fill-color': matchExpr as unknown as string,
        'fill-opacity': [
          'case',
          ['in', ['get', 'id'], ['literal', highlightedAreas]],
          0.8,
          ['==', ['get', 'id'], hoveredArea ?? ''],
          0.7,
          0.5,
        ],
      } as LayerProps['paint'];
    }

    if (colorBy === 'audience' && highlightedAreas.length > 0) {
      return {
        'fill-color': [
          'case',
          ['in', ['get', 'id'], ['literal', selectedAreas]],
          '#0d9488', // teal-600 for selected
          ['in', ['get', 'id'], ['literal', highlightedAreas]],
          '#14b8a6', // teal-500 for highlighted
          '#e2e8f0', // slate-200 default
        ],
        'fill-opacity': [
          'case',
          ['==', ['get', 'id'], hoveredArea ?? ''],
          0.8,
          0.5,
        ],
      } as LayerProps['paint'];
    }

    // Default: flat fill
    return {
      'fill-color': [
        'case',
        ['in', ['get', 'id'], ['literal', selectedAreas]],
        '#0d9488',
        ['==', ['get', 'id'], hoveredArea ?? ''],
        '#99f6e4',
        '#e2e8f0',
      ],
      'fill-opacity': 0.5,
    } as LayerProps['paint'];
  }, [colorBy, coverageData, highlightedAreas, selectedAreas, hoveredArea]);

  // Event handlers
  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const areaId = e.features[0].properties?.id;
      if (areaId && areaId !== hoveredArea) {
        setHoveredArea(areaId);
        onAreaHover?.(areaId);
      }
    }
  }, [hoveredArea, onAreaHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredArea(null);
    onAreaHover?.(null);
  }, [onAreaHover]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const areaId = e.features[0].properties?.id;
      if (areaId) {
        onAreaClick?.(areaId, { x: e.point.x, y: e.point.y });
      }
    }
  }, [onAreaClick]);

  return (
    <div className={className} style={{ height }}>
      <Map
        ref={mapRef}
        initialViewState={CHICAGO_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['community-areas-fill']}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        cursor={hoveredArea ? 'pointer' : 'grab'}
      >
        <NavigationControl position="top-right" />

        {/* County outlines (reference layer — dotted stroke, no fill) */}
        <Source id="county-boundaries" type="geojson" data={countyData}>
          <Layer
            id="county-outline"
            type="line"
            paint={{
              'line-color': '#94a3b8',
              'line-width': 2,
              'line-dasharray': [4, 3],
            }}
          />
          <Layer
            id="county-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 14,
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
              'text-anchor': 'center',
            }}
            paint={{
              'text-color': '#64748b',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.5,
            }}
            maxzoom={10}
          />
        </Source>

        {/* Community areas (interactive choropleth) */}
        <Source id="community-areas" type="geojson" data={communityAreaData}>
          <Layer
            id="community-areas-fill"
            type="fill"
            paint={fillColor as Record<string, unknown>}
          />
          <Layer
            id="community-areas-outline"
            type="line"
            paint={{
              'line-color': '#94a3b8',
              'line-width': [
                'case',
                ['==', ['get', 'id'], hoveredArea ?? ''],
                2,
                0.5,
              ],
            }}
          />
          <Layer
            id="community-areas-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-font': ['DIN Offc Pro Regular', 'Arial Unicode MS Regular'],
              'text-anchor': 'center',
              'text-max-width': 8,
            }}
            paint={{
              'text-color': '#334155',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1,
            }}
            minzoom={10}
          />
        </Source>
      </Map>
    </div>
  );
}
