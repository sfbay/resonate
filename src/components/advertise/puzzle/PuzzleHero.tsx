'use client';

import { motion } from 'framer-motion';
import { useCityOptional } from '@/lib/geo/city-context';
import { PuzzlePiece } from './PuzzlePiece';
import { PUZZLE_PIECES, BACKDROP_PIECES, S_CURVE_PATH } from './puzzle-paths';

// Entrance directions for each piece (spring in from different corners)
const PIECE_ENTRANCES = [
  { x: -120, y: -80, rotate: -25 },  // Create: from top-left
  { x: 120, y: -80, rotate: 20 },    // Select: from top-right
  { x: -120, y: 80, rotate: 15 },    // Amplify: from bottom-left
  { x: 120, y: 80, rotate: -20 },    // Validate: from bottom-right
];

// Final resting rotations for each piece
const PIECE_ROTATIONS = [-8, 5, -3, 10];

// Final positions (offset from center of the container)
// Clustered slightly left-of-center for compositional balance with S-curve
const PIECE_POSITIONS = [
  { x: -130, y: -55 },   // Create: top-left
  { x: 80, y: -45 },     // Select: top-right
  { x: -90, y: 75 },     // Amplify: bottom-left
  { x: 110, y: 65 },     // Validate: bottom-right
];

const PIECE_SIZE = 170;
const HALF = PIECE_SIZE / 2;

export function PuzzleHero() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="relative bg-radiance hero-texture overflow-hidden">
      {/* ── Backdrop: scattered keyline puzzle pieces ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BACKDROP_PIECES.map((bp, i) => (
          <motion.svg
            key={i}
            className="absolute"
            style={{
              left: bp.x,
              top: bp.y,
              width: 260 * bp.scale,
              height: 260 * bp.scale,
            }}
            viewBox="0 0 260 260"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            transition={{ delay: 0.3 + i * 0.03, duration: 1.2 }}
          >
            <path
              d={PUZZLE_PIECES[bp.pathIndex].path}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              transform={`rotate(${bp.rotate} 130 130)`}
            />
          </motion.svg>
        ))}
      </div>

      {/* ── Foreground content ── */}
      <div className="relative z-10 pt-28 md:pt-36 pb-36 md:pb-44 px-4">
        {/* Headline */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.1 }}
        >
          <p className="label text-marigold-400 mb-5">Resonate Advertise</p>
          <h1 className="display-xl mb-6">
            Reach your community.{' '}
            <br className="hidden md:block" />
            <em className="text-gradient-marigold not-italic">Your way.</em>
          </h1>
          <p className="body-lg text-gray-400 max-w-xl mx-auto">
            Four steps. One platform. Whether you&apos;re boosting a weekend market
            or launching a citywide campaign, start wherever makes sense.
          </p>
        </motion.div>

        {/* ── Four puzzle pieces ── */}
        <div className="relative max-w-2xl mx-auto h-[320px] md:h-[360px]">
          {PUZZLE_PIECES.map((piece, i) => (
            <a
              key={piece.key}
              href={`${prefix}${piece.href}`}
              className="absolute block"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <PuzzlePiece
                piece={piece}
                size={PIECE_SIZE}
                rotation={PIECE_ROTATIONS[i]}
                initial={{
                  opacity: 0,
                  x: PIECE_ENTRANCES[i].x + PIECE_POSITIONS[i].x - HALF,
                  y: PIECE_ENTRANCES[i].y + PIECE_POSITIONS[i].y - HALF,
                  rotate: PIECE_ENTRANCES[i].rotate,
                }}
                animate={{
                  opacity: 1,
                  x: PIECE_POSITIONS[i].x - HALF,
                  y: PIECE_POSITIONS[i].y - HALF,
                  rotate: 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 80,
                  delay: 0.5 + i * 0.15,
                }}
              />
            </a>
          ))}
        </div>

        {/* Quick-start CTA */}
        <motion.div
          className="max-w-md mx-auto text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <a
            href={`${prefix}/advertise/select`}
            className="group inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-marigold-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
            Need something quick? Buy an ad in under 60 seconds.
          </a>
        </motion.div>
      </div>

      {/* ── S-curve bottom edge ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-[60px] md:h-[90px] block"
          fill="var(--color-cream)"
        >
          <path d={S_CURVE_PATH} />
        </svg>
      </div>
    </section>
  );
}
