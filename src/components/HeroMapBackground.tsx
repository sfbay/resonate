'use client';

import { useRef, useState, useCallback } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * HeroMapBackground — Atmospheric dark US map with SF beacon.
 *
 * Non-interactive Mapbox GL map using dark-v11 style, centered on the
 * continental US. San Francisco marked with a pulsing coral beacon and
 * resonance rings as the live market.
 *
 * The map canvas is dimmed via an overlay, while the city beacon renders
 * at full brightness on top via z-20 stacking.
 */

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamdhcm5pZXIiLCJhIjoiY21qem1kbnJuMDE0cjNlcHZ6em1tZGNneCJ9.rkWafIhT1k4RHXVRJWoEBw';

// City coordinates — SF only (live market)
const CITIES = [
  {
    name: 'San Francisco',
    lng: -122.4194,
    lat: 37.7749,
    colorRaw: '#F15152',
    size: 'lg' as const,
    live: true,
  },
];

// Continental US center — zoomed to show national context with SF beacon visible
const US_CENTER = { longitude: -96, latitude: 40, zoom: 4.0 };

export default function HeroMapBackground() {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [projected, setProjected] = useState<{ x: number; y: number }[]>([]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    projectCities();
  }, []);

  const projectCities = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const pts = CITIES.map((c) => {
      const p = map.project([c.lng, c.lat]);
      return { x: p.x, y: p.y };
    });
    setProjected(pts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Map canvas — rendered at full opacity, dimmed by overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        <Map
          ref={mapRef}
          initialViewState={US_CENTER}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactive={false}
          attributionControl={false}
          logoPosition="bottom-left"
          onLoad={handleLoad}
          onResize={projectCities}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Subtle overlay to soften the map tiles — beacons render above this */}
        <div className="absolute inset-0 bg-[#0d1b1e]/[0.18]" />
      </div>

      {/* City beacons — rendered OUTSIDE the map at projected screen coords.
          z-20 ensures beacons paint above the vignette overlays in page.tsx,
          which are siblings of this component in the same stacking context. */}
      {loaded && projected.length === CITIES.length && (
        <div className="absolute inset-0 z-20 transition-opacity duration-[2000ms]" style={{ opacity: loaded ? 1 : 0 }}>
          {CITIES.map((city, i) => (
            <div
              key={city.name}
              className="absolute"
              style={{
                left: projected[i].x,
                top: projected[i].y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <CityBeacon
                color={city.colorRaw}
                size={city.size}
                live={city.live}
              />
            </div>
          ))}
        </div>
      )}

      {/* Hide Mapbox logo and attribution */}
      <style>{`
        .mapboxgl-ctrl-bottom-left,
        .mapboxgl-ctrl-bottom-right {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

/**
 * CityBeacon — Animated pulsing glow marker for a city on the map.
 */
function CityBeacon({ color, size, live }: { color: string; size: 'lg' | 'sm'; live: boolean }) {
  const coreSize = size === 'lg' ? 14 : 8;
  const glowSize = size === 'lg' ? 80 : 60;
  const ringSize = size === 'lg' ? 120 : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: glowSize * 2, height: glowSize * 2 }}>
      {/* Outer atmospheric glow */}
      <div
        className="absolute rounded-full animate-beacon-breathe"
        style={{
          width: glowSize,
          height: glowSize,
          background: size === 'lg'
            ? `radial-gradient(circle, ${color}45 0%, ${color}18 40%, transparent 70%)`
            : `radial-gradient(circle, ${color}40 0%, ${color}20 40%, transparent 70%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Resonance rings — only for SF (live) */}
      {live && (
        <>
          {[0, 4.5, 9].map((delay) => (
            <div
              key={delay}
              className="absolute rounded-full animate-resonance-ring"
              style={{
                width: ringSize,
                height: ringSize,
                border: `1px solid ${color}${delay === 0 ? '25' : delay === 4.5 ? '18' : '10'}`,
                left: '50%',
                top: '50%',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Core dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: coreSize,
          height: coreSize,
          backgroundColor: color,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 ${size === 'lg' ? 20 : 12}px ${color}cc, 0 0 ${size === 'lg' ? 40 : 28}px ${color}60`,
        }}
      />

      {/* Inner bright center */}
      <div
        className="absolute rounded-full"
        style={{
          width: coreSize * 0.4,
          height: coreSize * 0.4,
          backgroundColor: 'white',
          opacity: 0.7,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
