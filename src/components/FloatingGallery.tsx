'use client';

import { useState, useEffect } from 'react';

/**
 * FloatingGallery — Rounded photo bubbles that drift left-to-right
 * across the hero section. Reads from a city-specific gallery folder.
 *
 * Usage:
 *   <FloatingGallery city="sf" />
 *
 * Images go in: public/images/gallery/{city}/
 * Any image format works (jpg, png, webp, svg).
 * The component auto-discovers images via a manifest.
 *
 * Props:
 * - city: folder name under public/images/gallery/
 * - count: number of bubbles visible at a time (default 5)
 * - className: additional CSS classes for positioning
 */

// Gallery manifest — maps city slugs to their image lists.
// To add images: drop files into public/images/gallery/{city}/
// then add filenames here. This avoids runtime filesystem access.
const GALLERY_MANIFEST: Record<string, string[]> = {
  sf: [
    'placeholder-1.svg',
    'placeholder-2.svg',
    'placeholder-3.svg',
    'placeholder-4.svg',
    'placeholder-5.svg',
    'placeholder-6.svg',
  ],
};

interface BubbleConfig {
  id: number;
  image: string;
  y: number;       // vertical position (% from top)
  size: number;    // diameter in px
  duration: number; // animation duration in seconds
  delay: number;   // initial delay in seconds
  opacity: number;
}

interface FloatingGalleryProps {
  city: string;
  count?: number;
  className?: string;
}

export function FloatingGallery({ city, count = 5, className = '' }: FloatingGalleryProps) {
  const [bubbles, setBubbles] = useState<BubbleConfig[]>([]);
  const images = GALLERY_MANIFEST[city] || [];

  useEffect(() => {
    if (images.length === 0) return;

    const configs: BubbleConfig[] = [];
    for (let i = 0; i < count; i++) {
      configs.push({
        id: i,
        image: images[i % images.length],
        y: 10 + Math.random() * 55,        // 10-65% from top (stays in upper zone)
        size: 70 + Math.random() * 50,      // 70-120px diameter
        duration: 18 + Math.random() * 14,  // 18-32s to cross
        delay: -(Math.random() * 20),       // staggered starts (negative = already in motion)
        opacity: 0.25 + Math.random() * 0.2, // 0.25-0.45 — subtle, atmospheric
      });
    }
    setBubbles(configs);
  }, [images.length, count]);

  if (images.length === 0) return null;

  const basePath = `/images/gallery/${city}/`;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full overflow-hidden"
          style={{
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animation: `float-across ${b.duration}s linear ${b.delay}s infinite`,
          }}
        >
          {/* object-fit: cover ensures no stretching/distortion */}
          <div
            className="w-full h-full bg-center bg-cover rounded-full"
            style={{
              backgroundImage: `url(${basePath}${b.image})`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
