'use client';

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import type { PuzzlePieceDef } from './puzzle-paths';
import { PUZZLE_VIEWBOX } from './puzzle-paths';

interface PuzzlePieceProps {
  piece: PuzzlePieceDef;
  backgroundImage?: string;
  size?: number;
  rotation?: number;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
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
  const sheenId = `puzzle-sheen-${piece.key}`;
  const innerShadowId = `puzzle-inner-${piece.key}`;
  const vb = PUZZLE_VIEWBOX;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={{
        scale: 1.08,
        filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.4))',
        zIndex: 10,
      }}
    >
      <svg
        viewBox={`0 0 ${vb} ${vb}`}
        width={size}
        height={size}
        style={{ transform: `rotate(${rotation}deg)`, overflow: 'visible' }}
        className="drop-shadow-xl"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={piece.path} />
          </clipPath>

          {/* Piece fill gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={piece.gradient[0]} />
            <stop offset="100%" stopColor={piece.gradient[1]} />
          </linearGradient>

          {/* Glossy sheen highlight (top-left to center) */}
          <radialGradient id={sheenId} cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="50%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Inner shadow for depth / bevel */}
          <radialGradient id={innerShadowId} cx="60%" cy="65%" r="60%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="70%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Base fill */}
          {backgroundImage ? (
            <image
              href={backgroundImage}
              x="0" y="0" width={vb} height={vb}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <rect x="0" y="0" width={vb} height={vb} fill={`url(#${gradientId})`} />
          )}

          {/* Glossy sheen overlay */}
          <rect x="0" y="0" width={vb} height={vb} fill={`url(#${sheenId})`} />

          {/* Inner shadow for 3D depth */}
          <rect x="0" y="0" width={vb} height={vb} fill={`url(#${innerShadowId})`} />
        </g>

        {/* Crisp white outline */}
        <path
          d={piece.path}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Label beneath the piece */}
      <div
        className="absolute -bottom-10 left-1/2 text-center whitespace-nowrap pointer-events-none"
        style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
      >
        <div className="text-sm font-bold text-white/90 drop-shadow-md">{piece.label}</div>
        <div className="text-[11px] text-white/50">{piece.sublabel}</div>
      </div>
    </motion.div>
  );
}
