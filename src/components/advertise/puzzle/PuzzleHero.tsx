'use client';

import { motion } from 'framer-motion';
import { useCityOptional } from '@/lib/geo/city-context';
import { PuzzlePiece } from './PuzzlePiece';
import { PUZZLE_PIECES, BACKDROP_PIECES, S_CURVE_PATH, PUZZLE_VIEWBOX } from './puzzle-paths';

// Entrance directions for each piece (spring in from different corners)
const PIECE_ENTRANCES = [
  { x: -160, y: -120, rotate: -25 },
  { x: 160, y: -120, rotate: 20 },
  { x: -160, y: 120, rotate: 15 },
  { x: 160, y: 120, rotate: -20 },
];

// Final resting rotations — subtle tilts for organic feel
const PIECE_ROTATIONS = [-6, 4, -3, 8];

// Final positions (offset from center) — tighter grouping
const PIECE_POSITIONS = [
  { x: -140, y: -75 },   // Create: top-left
  { x: 100, y: -65 },    // Select: top-right
  { x: -100, y: 80 },    // Amplify: bottom-left
  { x: 130, y: 70 },     // Validate: bottom-right
];

const PIECE_SIZE = 240;
const HALF = PIECE_SIZE / 2;
const VB = PUZZLE_VIEWBOX;
const VB_CENTER = VB / 2;

export function PuzzleHero() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="relative bg-radiance overflow-hidden">
      {/* ── Backdrop: scattered keyline puzzle pieces ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BACKDROP_PIECES.map((bp, i) => (
          <motion.svg
            key={i}
            className="absolute"
            style={{
              left: bp.x,
              top: bp.y,
              width: VB * bp.scale,
              height: VB * bp.scale,
            }}
            viewBox={`0 0 ${VB} ${VB}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ delay: 0.3 + i * 0.03, duration: 1.2 }}
          >
            <path
              d={PUZZLE_PIECES[bp.pathIndex].path}
              fill="none"
              stroke="white"
              strokeWidth="2"
              transform={`rotate(${bp.rotate} ${VB_CENTER} ${VB_CENTER})`}
            />
          </motion.svg>
        ))}
      </div>

      {/* ── Foreground content ── */}
      <div className="relative z-10 pt-24 md:pt-28 pb-20 md:pb-28 px-4">
        {/* Headline */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.1 }}
        >
          <p className="label text-marigold-400 mb-4 tracking-widest">Resonate Advertise</p>
          <h1 className="display-xl text-white mb-4">
            Reach your community.{' '}
            <br className="hidden md:block" />
            <em className="text-gradient-marigold not-italic">Your way.</em>
          </h1>
          <p className="body-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Four steps. One platform. Whether you&apos;re boosting a weekend market
            or launching a citywide campaign, start wherever makes sense.
          </p>
        </motion.div>

        {/* ── Four puzzle pieces ── */}
        <div className="relative max-w-3xl mx-auto h-[360px] md:h-[400px]">
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
          className="max-w-md mx-auto text-center mt-6"
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
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20">
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
