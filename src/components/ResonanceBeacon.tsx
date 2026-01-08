'use client';

import { useEffect, useState } from 'react';

type BeaconColor = 'marigold' | 'teal' | 'coral';

interface ResonanceBeaconProps {
  color: BeaconColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'whisper' | 'subtle' | 'medium';
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
}

const colorMap: Record<BeaconColor, { core: string; ring: string }> = {
  marigold: {
    core: 'bg-[var(--color-marigold)]',
    ring: 'border-[var(--color-marigold)]',
  },
  teal: {
    core: 'bg-[var(--color-teal-light)]',
    ring: 'border-[var(--color-teal-light)]',
  },
  coral: {
    core: 'bg-[var(--color-coral)]',
    ring: 'border-[var(--color-coral)]',
  },
};

const sizeMap = {
  sm: { core: 64, container: 160 },
  md: { core: 96, container: 240 },
  lg: { core: 128, container: 320 },
  xl: { core: 160, container: 400 },
};

const intensityMap = {
  whisper: { coreOpacity: 0.15, ringOpacity: 0.08 },
  subtle: { coreOpacity: 0.25, ringOpacity: 0.12 },
  medium: { coreOpacity: 0.35, ringOpacity: 0.18 },
};

export function ResonanceBeacon({
  color,
  size = 'md',
  intensity = 'whisper',
  className = '',
  delay = 0,
}: ResonanceBeaconProps) {
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const colors = colorMap[color];
  const sizes = sizeMap[size];
  const intensities = intensityMap[intensity];

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        width: sizes.container,
        height: sizes.container,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }}
    >
      {/* Liquid rings - glacial, meditative expansion */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute rounded-full ${colors.ring} animate-resonance-ring`}
          style={{
            width: sizes.core,
            height: sizes.core,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderWidth: 1,
            opacity: intensities.ringOpacity,
            animationDelay: `${i * 4.5}s`,
          }}
        />
      ))}

      {/* Core glow - soft, breathing blob */}
      <div
        className={`absolute rounded-full ${colors.core} blur-3xl animate-beacon-breathe`}
        style={{
          width: sizes.core,
          height: sizes.core,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: intensities.coreOpacity,
        }}
      />
    </div>
  );
}
