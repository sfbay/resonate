'use client';

/**
 * Animated Resonate logo — coral dot center, teal + marigold semicircular arcs
 * rotating slowly in opposite directions at different speeds.
 *
 * Props:
 * - size: pixel dimension (default 40)
 * - animate: enable rotation (default true)
 * - className: additional classes
 */

interface ResonanceLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function ResonanceLogo({ size = 40, animate = true, className = '' }: ResonanceLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Center dot — static */}
      <circle cx="20" cy="20" r="5.5" fill="var(--color-coral)" />

      {/* Inner arc — teal, rotates counter-clockwise */}
      <path
        d="M20 8a12 12 0 010 24"
        stroke="var(--color-teal-light)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        style={{
          transformOrigin: '20px 20px',
          animation: animate ? 'spin-ccw 24s linear infinite' : undefined,
        }}
      />

      {/* Outer arc — marigold, rotates clockwise */}
      <path
        d="M20 3a17 17 0 010 34"
        stroke="var(--color-marigold)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
        style={{
          transformOrigin: '20px 20px',
          animation: animate ? 'spin-cw 36s linear infinite' : undefined,
        }}
      />
    </svg>
  );
}
