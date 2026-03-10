'use client';

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import type { PuzzlePieceDef } from './puzzle-paths';

interface PuzzlePieceProps {
  piece: PuzzlePieceDef;
  /** Optional photo URL to texture the piece */
  backgroundImage?: string;
  /** Size in px (the piece is square) */
  size?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Framer Motion initial state */
  initial?: TargetAndTransition;
  /** Framer Motion animate target */
  animate?: TargetAndTransition;
  /** Framer Motion transition config */
  transition?: Transition;
  /** Additional className */
  className?: string;
}

export function PuzzlePiece({
  piece,
  backgroundImage,
  size = 220,
  rotation = 0,
  initial,
  animate,
  transition,
  className = '',
}: PuzzlePieceProps) {
  const clipId = `puzzle-clip-${piece.key}`;
  const gradientId = `puzzle-grad-${piece.key}`;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={{
        scale: 1.08,
        filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.35))',
        zIndex: 10,
      }}
    >
      <svg
        viewBox="0 0 260 260"
        width={size}
        height={size}
        style={{ transform: `rotate(${rotation}deg)`, overflow: 'visible' }}
        className="drop-shadow-xl"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={piece.path} />
          </clipPath>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={piece.gradient[0]} />
            <stop offset="100%" stopColor={piece.gradient[1]} />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {backgroundImage ? (
            <image
              href={backgroundImage}
              x="0" y="0" width="260" height="260"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <rect
              x="0" y="0" width="260" height="260"
              fill={`url(#${gradientId})`}
            />
          )}
          {/* Subtle sheen overlay for depth */}
          <rect
            x="0" y="0" width="260" height="260"
            fill="url(#sheen)"
            opacity="0.12"
          />
        </g>

        {/* Piece outline for crisp definition */}
        <path
          d={piece.path}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Label beneath the piece */}
      <div
        className="absolute -bottom-10 left-1/2 text-center whitespace-nowrap pointer-events-none"
        style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
      >
        <div className="text-sm font-bold text-white/90">{piece.label}</div>
        <div className="text-[11px] text-white/40">{piece.sublabel}</div>
      </div>
    </motion.div>
  );
}
