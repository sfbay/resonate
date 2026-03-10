# Advertise Landing Page: Launch Visual Language — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Advertise portal landing page with a jigsaw puzzle hero, four-color step system, diverse section layouts, Framer Motion animations, and an offset S-curve hero edge — establishing the launch visual language.

**Architecture:** The page is a single Next.js client component (`src/app/advertise/page.tsx`) composed of modular section components. The hero uses SVG `clipPath` for puzzle piece shapes with gradient/photo fills, animated via Framer Motion. Four step sections below use distinct layout treatments unified by color threads. An offset S-curve SVG separates hero from content.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion, SVG clipPath

**Spec:** `docs/superpowers/specs/2026-03-10-advertise-landing-visual-language.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/advertise/puzzle/PuzzlePiece.tsx` | SVG clipPath puzzle piece shape with gradient/photo fill, Framer Motion animations |
| `src/components/advertise/puzzle/puzzle-paths.ts` | SVG path data for 4 interlocking puzzle piece shapes + backdrop keyline pieces |
| `src/components/advertise/puzzle/PuzzleHero.tsx` | Full hero section: backdrop keylines, 4 foreground pieces, headline, S-curve bottom |
| `src/components/advertise/sections/CreateSection.tsx` | Step 1 section: split-screen layout, marigold accent |
| `src/components/advertise/sections/SelectSection.tsx` | Step 2 section: horizontal card carousel, teal accent |
| `src/components/advertise/sections/AmplifySection.tsx` | Step 3 section: centered showcase card, coral accent |
| `src/components/advertise/sections/ValidateSection.tsx` | Step 4 section: dashboard metrics grid, violet accent |
| `src/components/advertise/sections/PowerModeStrip.tsx` | Compact "skip to builder" strip for power users |
| `src/components/advertise/ScrollReveal.tsx` | Framer Motion wrapper for scroll-triggered section entrance animations |
| `src/components/advertise/AnimatedCounter.tsx` | Number that counts up when scrolled into view |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/globals.css` | Add violet color tokens, S-curve utility class |
| `src/app/advertise/page.tsx` | Replace with new composition using PuzzleHero + 4 sections + PowerModeStrip |
| `package.json` | Add `framer-motion` dependency |

### Files to Remove (replaced)
| File | Replaced By |
|------|------------|
| `src/components/advertise/PathwayHero.tsx` | `puzzle/PuzzleHero.tsx` |
| `src/components/advertise/ModulePreview.tsx` | Individual section components |
| `src/components/advertise/TwoTracks.tsx` | `sections/PowerModeStrip.tsx` |

---

## Chunk 1: Foundation

### Task 1: Install Framer Motion + Add Violet Tokens

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css:8-94` (CSS variables and @theme block)

- [ ] **Step 1: Install framer-motion**

```bash
npm install framer-motion
```

Expected: Package installs, appears in `dependencies` in package.json.

- [ ] **Step 2: Add violet color tokens to CSS variables**

In `src/app/globals.css`, add after the marigold variables (line ~22):

```css
  --color-violet: #7C3AED;
  --color-violet-dark: #6D28D9;
  --color-violet-light: #A78BFA;
```

- [ ] **Step 3: Add violet to @theme block**

In `src/app/globals.css`, add inside `@theme inline` block (after marigold-400 line ~87):

```css
  --color-violet-500: var(--color-violet);
  --color-violet-600: var(--color-violet-dark);
  --color-violet-400: var(--color-violet-light);
```

- [ ] **Step 4: Add violet utility classes**

In `src/app/globals.css`, add after `.ring-glow-teal` (line ~473):

```css
.ring-glow-violet {
  box-shadow: 0 0 0 3px rgba(124,58,237,0.25), 0 0 20px -4px rgba(124,58,237,0.2);
}

.text-gradient-violet {
  background: linear-gradient(135deg, var(--color-violet) 0%, var(--color-violet-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/app/globals.css
git commit -m "feat: add framer-motion + violet color tokens for advertise visual language"
```

---

### Task 2: SVG Puzzle Piece Paths

**Files:**
- Create: `src/components/advertise/puzzle/puzzle-paths.ts`

This file defines the SVG path data for four interlocking puzzle pieces. Each piece is roughly 200x200 with tabs (bumps out) and blanks (indents) on its edges. The four pieces tile in a 2x2 grid.

- [ ] **Step 1: Create the puzzle paths module**

Create `src/components/advertise/puzzle/puzzle-paths.ts`:

```typescript
/**
 * SVG path data for four interlocking jigsaw puzzle pieces.
 *
 * Coordinate system: each piece occupies a ~200x200 box.
 * Tabs bump outward ~30px, blanks indent ~30px.
 * Pieces tile in a 2x2 grid:
 *   [Create] [Select ]
 *   [Amplify] [Validate]
 *
 * Edge assignments:
 *   Create (TL):   top=flat, right=tab,   bottom=tab,  left=flat
 *   Select (TR):   top=flat, right=flat,  bottom=blank, left=blank
 *   Amplify (BL):  top=blank, right=blank, bottom=flat, left=flat
 *   Validate (BR): top=tab,  right=flat,  bottom=flat, left=tab
 */

// Tab: a bump that protrudes outward from the edge
// Blank: an indent that accepts a tab from the adjacent piece

// Helper: horizontal tab (bumps upward or downward)
// xStart -> curve out -> xEnd
const hTab = (x: number, dir: 1 | -1) =>
  `C ${x + 25},${dir * -15} ${x + 45},${dir * -30} ${x + 50},${dir * -30} ` +
  `C ${x + 55},${dir * -30} ${x + 75},${dir * -15} ${x + 100},0`;

// Helper: vertical tab (bumps left or right)
const vTab = (y: number, dir: 1 | -1) =>
  `C ${dir * -15},${y + 25} ${dir * -30},${y + 45} ${dir * -30},${y + 50} ` +
  `C ${dir * -30},${y + 55} ${dir * -15},${y + 75} 0,${y + 100}`;

export interface PuzzlePieceDef {
  key: 'create' | 'select' | 'amplify' | 'validate';
  label: string;
  sublabel: string;
  /** SVG path string for clipPath. Viewbox is 260x260 to accommodate tabs. */
  path: string;
  /** Gradient colors [from, to] */
  gradient: [string, string];
  /** CSS color class for accents */
  colorClass: string;
  /** Link path */
  href: string;
}

// Paths are drawn in a 260x260 viewBox (200px piece + 30px padding each side for tabs)
// Origin offset: pieces start at (30, 30) to leave room for outward tabs

export const PUZZLE_PIECES: PuzzlePieceDef[] = [
  {
    key: 'create',
    label: 'Create',
    sublabel: 'Build your message',
    path: `M 30,30
      L 80,30 C 93,30 100,10 105,10 C 110,10 117,30 130,30 L 230,30
      L 230,80 C 230,93 250,100 250,105 C 250,110 230,117 230,130 L 230,230
      L 180,230 C 167,230 160,250 155,250 C 150,250 143,230 130,230 L 30,230
      L 30,130 L 30,30 Z`,
    gradient: ['#F7B32B', '#E09D0E'],
    colorClass: 'marigold',
    href: '/advertise/create',
  },
  {
    key: 'select',
    label: 'Select',
    sublabel: 'Choose your channels',
    path: `M 30,30
      L 230,30
      L 230,130 L 230,230
      L 180,230 C 167,230 160,210 155,210 C 150,210 143,230 130,230 L 30,230
      L 30,130 C 30,117 10,110 10,105 C 10,100 30,93 30,80 L 30,30 Z`,
    gradient: ['#0B525B', '#14919B'],
    colorClass: 'teal',
    href: '/advertise/select',
  },
  {
    key: 'amplify',
    label: 'Amplify',
    sublabel: 'Set budget & launch',
    path: `M 30,30
      L 80,30 C 93,30 100,10 105,10 C 110,10 117,30 130,30 L 230,30
      L 230,80 C 230,93 210,100 210,105 C 210,110 230,117 230,130 L 230,230
      L 30,230
      L 30,130 L 30,30 Z`,
    gradient: ['#F15152', '#D93E3F'],
    colorClass: 'coral',
    href: '/advertise/amplify',
  },
  {
    key: 'validate',
    label: 'Validate',
    sublabel: 'Track what landed',
    path: `M 30,30
      L 130,30 C 143,30 150,50 155,50 C 160,50 167,30 180,30 L 230,30
      L 230,130 L 230,230
      L 30,230
      L 30,130 C 30,117 50,110 50,105 C 50,100 30,93 30,80 L 30,30 Z`,
    gradient: ['#7C3AED', '#6D28D9'],
    colorClass: 'violet',
    href: '/advertise/validate',
  },
];

/**
 * Backdrop keyline pieces — simplified outlines for the scattered background.
 * Each has a position (% from left, % from top), rotation, and scale.
 */
export const BACKDROP_PIECES: Array<{
  x: string; y: string; rotate: number; scale: number; path: string;
}> = [
  { x: '5%',  y: '10%', rotate: 25,  scale: 0.35, path: PUZZLE_PIECES[0].path },
  { x: '85%', y: '5%',  rotate: -15, scale: 0.4,  path: PUZZLE_PIECES[1].path },
  { x: '15%', y: '70%', rotate: 45,  scale: 0.3,  path: PUZZLE_PIECES[2].path },
  { x: '90%', y: '65%', rotate: -35, scale: 0.45, path: PUZZLE_PIECES[3].path },
  { x: '45%', y: '85%', rotate: 12,  scale: 0.25, path: PUZZLE_PIECES[0].path },
  { x: '70%', y: '15%', rotate: -50, scale: 0.3,  path: PUZZLE_PIECES[2].path },
  { x: '25%', y: '40%', rotate: 70,  scale: 0.35, path: PUZZLE_PIECES[1].path },
  { x: '60%', y: '50%', rotate: -20, scale: 0.28, path: PUZZLE_PIECES[3].path },
  { x: '3%',  y: '45%', rotate: 38,  scale: 0.4,  path: PUZZLE_PIECES[0].path },
  { x: '78%', y: '80%', rotate: -8,  scale: 0.32, path: PUZZLE_PIECES[2].path },
  { x: '50%', y: '20%', rotate: 55,  scale: 0.3,  path: PUZZLE_PIECES[1].path },
  { x: '35%', y: '60%', rotate: -42, scale: 0.38, path: PUZZLE_PIECES[3].path },
  { x: '92%', y: '35%', rotate: 18,  scale: 0.25, path: PUZZLE_PIECES[0].path },
  { x: '12%', y: '90%', rotate: -60, scale: 0.35, path: PUZZLE_PIECES[2].path },
  { x: '65%', y: '75%', rotate: 30,  scale: 0.28, path: PUZZLE_PIECES[1].path },
];

/**
 * S-curve SVG path for the hero bottom edge.
 * Inflection point at ~37% from left. Left side dips deeper.
 * ViewBox: 0 0 1440 120
 */
export const S_CURVE_PATH =
  'M0,0 L0,60 C180,100 360,110 530,80 C700,50 900,20 1100,35 C1300,50 1400,40 1440,30 L1440,0 Z';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to puzzle-paths.ts.

- [ ] **Step 3: Commit**

```bash
git add src/components/advertise/puzzle/puzzle-paths.ts
git commit -m "feat: SVG puzzle piece path data for 4 interlocking pieces + backdrop"
```

---

### Task 3: PuzzlePiece Component

**Files:**
- Create: `src/components/advertise/puzzle/PuzzlePiece.tsx`

A single puzzle piece rendered as an SVG with clipPath for the puzzle shape, filled with either a gradient or a background image.

- [ ] **Step 1: Create the PuzzlePiece component**

Create `src/components/advertise/puzzle/PuzzlePiece.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import type { PuzzlePieceDef } from './puzzle-paths';

interface PuzzlePieceProps {
  piece: PuzzlePieceDef;
  /** Optional photo URL to texture the piece */
  backgroundImage?: string;
  /** Size in px (the piece is square) */
  size?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Framer Motion animation variants */
  initial?: object;
  animate?: object;
  transition?: object;
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
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={{
        scale: 1.08,
        rotate: rotation + (rotation > 0 ? -3 : 3),
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
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
          {/* Subtle inner shadow overlay for depth */}
          <rect
            x="0" y="0" width="260" height="260"
            fill="url(#inner-shadow)"
            opacity="0.15"
          />
        </g>

        {/* Piece outline for definition */}
        <path
          d={piece.path}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Label below the piece */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
        style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
      >
        <div className={`text-sm font-bold text-${piece.colorClass}-400`}>
          {piece.label}
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/advertise/puzzle/PuzzlePiece.tsx
git commit -m "feat: PuzzlePiece component with SVG clipPath and Framer Motion"
```

---

### Task 4: ScrollReveal + AnimatedCounter Utilities

**Files:**
- Create: `src/components/advertise/ScrollReveal.tsx`
- Create: `src/components/advertise/AnimatedCounter.tsx`

- [ ] **Step 1: Create ScrollReveal wrapper**

Create `src/components/advertise/ScrollReveal.tsx`:

```tsx
'use client';

import { motion, type Variant } from 'framer-motion';
import { type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  /** Fraction of element visible before triggering (0-1) */
  threshold?: number;
}

const offsets: Record<Direction, Variant> = {
  up: { opacity: 0, y: 50 },
  down: { opacity: 0, y: -50 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.85 },
  none: { opacity: 0 },
};

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  threshold = 0.25,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={offsets[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 120,
        delay,
        duration,
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create AnimatedCounter**

Create `src/components/advertise/AnimatedCounter.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  /** Prefix like "$" */
  prefix?: string;
  /** Suffix like "K" or "%" */
  suffix?: string;
  /** Decimal places */
  decimals?: number;
  /** Duration in seconds */
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        setDisplay(v.toFixed(decimals));
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, decimals]);

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/advertise/ScrollReveal.tsx src/components/advertise/AnimatedCounter.tsx
git commit -m "feat: ScrollReveal and AnimatedCounter utilities with Framer Motion"
```

---

## Chunk 2: Puzzle Hero

### Task 5: PuzzleHero Component

**Files:**
- Create: `src/components/advertise/puzzle/PuzzleHero.tsx`

The hero section: bg-radiance backdrop, scattered keyline pieces, four foreground puzzle pieces, headline, and S-curve bottom edge.

- [ ] **Step 1: Create PuzzleHero component**

Create `src/components/advertise/puzzle/PuzzleHero.tsx`:

```tsx
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

// Final positions (offset from center) — clustered slightly left
const PIECE_POSITIONS = [
  { x: -140, y: -60 },   // Create: top-left
  { x: 80, y: -50 },     // Select: top-right
  { x: -100, y: 80 },    // Amplify: bottom-left
  { x: 110, y: 70 },     // Validate: bottom-right
];

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
            transition={{ delay: 0.3 + i * 0.03, duration: 1 }}
          >
            <path
              d={bp.path}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              transform={`rotate(${bp.rotate} 130 130)`}
            />
          </motion.svg>
        ))}
      </div>

      {/* ── Foreground content ── */}
      <div className="relative z-10 pt-28 md:pt-36 pb-32 md:pb-40 px-4">
        {/* Headline */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
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
        <div className="relative max-w-2xl mx-auto h-[340px] md:h-[380px]">
          {PUZZLE_PIECES.map((piece, i) => (
            <a
              key={piece.key}
              href={`${prefix}${piece.href}`}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <PuzzlePiece
                piece={piece}
                size={180}
                rotation={PIECE_ROTATIONS[i]}
                initial={{
                  opacity: 0,
                  x: PIECE_ENTRANCES[i].x + PIECE_POSITIONS[i].x,
                  y: PIECE_ENTRANCES[i].y + PIECE_POSITIONS[i].y,
                  rotate: PIECE_ENTRANCES[i].rotate,
                }}
                animate={{
                  opacity: 1,
                  x: PIECE_POSITIONS[i].x - 90, // offset for centering (half of piece size)
                  y: PIECE_POSITIONS[i].y - 90,
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
          className="max-w-md mx-auto text-center mt-8"
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
          className="w-full h-[60px] md:h-[90px]"
          fill="var(--color-cream)"
        >
          <path d={S_CURVE_PATH} />
        </svg>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/advertise/puzzle/PuzzleHero.tsx
git commit -m "feat: PuzzleHero with jigsaw pieces, keyline backdrop, and S-curve edge"
```

---

## Chunk 3: Step Sections

### Task 6: CreateSection (Marigold — Split Screen)

**Files:**
- Create: `src/components/advertise/sections/CreateSection.tsx`

Split-screen layout: bold copy on the left, stylized builder mock on the right. Marigold accents.

- [ ] **Step 1: Create CreateSection**

Create `src/components/advertise/sections/CreateSection.tsx`:

```tsx
'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function CreateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="create" className="relative bg-warm-page py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Text column */}
        <ScrollReveal direction="left">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-marigold-500/10 text-marigold-500 text-sm font-bold">1</span>
            <span className="label text-marigold-500">Create</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-5">
            Start with what you want to{' '}
            <span className="text-gradient-marigold">say.</span>
          </h2>
          <p className="text-slate-500 body-md leading-relaxed mb-8">
            Pick a template or start blank. Drop in your copy, upload a visual, and
            preview how it&apos;ll look across social, newsletter, and display — before
            you spend a dollar.
          </p>
          <a
            href={`${prefix}/advertise/create`}
            className="inline-flex items-center gap-2 btn btn-marigold"
          >
            Open the Builder
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>

        {/* Builder mock */}
        <ScrollReveal direction="right" delay={0.15}>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
            {/* Mock toolbar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              <div className="ml-3 flex-1 h-5 rounded-full bg-gray-100" />
            </div>
            <div className="p-5 space-y-3">
              {/* Template choices */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '📱', label: 'Social Post', active: true },
                  { icon: '📰', label: 'Newsletter', active: false },
                  { icon: '🖼️', label: 'Display', active: false },
                  { icon: '✨', label: 'Blank', active: false },
                ].map((t) => (
                  <div
                    key={t.label}
                    className={`rounded-lg p-3 text-center text-xs font-medium transition-all ${
                      t.active
                        ? 'bg-marigold-500/10 border-2 border-marigold-500/30 text-marigold-600'
                        : 'bg-gray-50 border-2 border-transparent text-gray-500'
                    }`}
                  >
                    <span className="block text-base mb-1">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>
              {/* Input fields mock */}
              <div className="space-y-2 pt-2">
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-100 px-3 flex items-center text-sm text-gray-400 font-medium">
                  Your headline here...
                </div>
                <div className="h-20 rounded-lg bg-gray-50 border border-gray-100 px-3 pt-2.5 text-xs text-gray-400">
                  Write your message...
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/advertise/sections/CreateSection.tsx
git commit -m "feat: CreateSection with split-screen layout and marigold accents"
```

---

### Task 7: SelectSection (Teal — Card Carousel)

**Files:**
- Create: `src/components/advertise/sections/SelectSection.tsx`

Horizontal scrolling publisher cards with centered headline. Teal accents.

- [ ] **Step 1: Create SelectSection**

Create `src/components/advertise/sections/SelectSection.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

const SAMPLE_PUBLISHERS = [
  { initials: 'ET', name: 'El Tecolote', area: 'Mission', reach: '12.4K', grad: 'from-rose-500 to-rose-600' },
  { initials: 'ML', name: 'Mission Local', area: 'Mission', reach: '8.2K', grad: 'from-sky-500 to-sky-600' },
  { initials: 'BV', name: 'The Bay View', area: 'Bayview', reach: '15.1K', grad: 'from-emerald-500 to-emerald-600' },
  { initials: 'SP', name: 'SF Public Press', area: 'Citywide', reach: '22.0K', grad: 'from-amber-500 to-amber-600' },
  { initials: 'NB', name: 'Nichi Bei', area: 'Japantown', reach: '6.8K', grad: 'from-violet-500 to-violet-600' },
  { initials: 'BA', name: 'Bay Area Reporter', area: 'Castro', reach: '18.5K', grad: 'from-pink-500 to-pink-600' },
];

export function SelectSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="select" className="relative bg-radiance hero-texture text-white py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 text-sm font-bold">2</span>
            <span className="label text-teal-400">Select</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-5">
            Pick the voices your audience{' '}
            <span className="text-teal-400">trusts.</span>
          </h2>
          <p className="text-gray-400 body-md max-w-lg mx-auto">
            Browse local publishers by neighborhood, language, and reach.
            See real-time availability and transparent pricing.
          </p>
        </ScrollReveal>

        {/* Horizontal scroll carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {SAMPLE_PUBLISHERS.map((p, i) => (
              <motion.div
                key={p.initials}
                className="snap-start shrink-0 w-[260px]"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 120,
                  delay: i * 0.08,
                }}
              >
                <div className="glass-card rounded-2xl p-5 h-full hover:-translate-y-1 hover:border-teal-400/30 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.grad} text-white flex items-center justify-center text-sm font-bold shadow-lg mb-4`}>
                    {p.initials}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{p.area} · {p.reach} reach</p>
                  <div className="text-teal-400 text-sm font-bold">From $19</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal className="text-center mt-10" delay={0.3}>
          <a
            href={`${prefix}/advertise/select`}
            className="inline-flex items-center gap-2 btn btn-teal"
          >
            Explore Publishers
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/advertise/sections/SelectSection.tsx
git commit -m "feat: SelectSection with horizontal card carousel and teal accents"
```

---

### Task 8: AmplifySection (Coral — Centered Showcase)

**Files:**
- Create: `src/components/advertise/sections/AmplifySection.tsx`

Centered order summary card with pricing breakdown. Coral accents, gradient glow.

- [ ] **Step 1: Create AmplifySection**

Create `src/components/advertise/sections/AmplifySection.tsx`:

```tsx
'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function AmplifySection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="amplify" className="relative bg-warm-page py-24 md:py-32 px-4 overflow-hidden">
      {/* Decorative coral glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-coral-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-coral-500/10 text-coral-500 text-sm font-bold">3</span>
            <span className="label text-coral-500">Amplify</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-5">
            Set your budget.{' '}
            <span className="text-coral-500">Launch.</span>
          </h2>
          <p className="text-slate-500 body-md max-w-lg mx-auto">
            Review your selections, see bulk pricing, and check out.
            Schedule a single post or a month of placements.
          </p>
        </ScrollReveal>

        {/* Centered showcase card */}
        <ScrollReveal direction="scale" delay={0.1}>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-gray-900">Order Summary</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">2 items</span>
            </div>

            {/* Line items */}
            <div className="divide-y divide-gray-50">
              {[
                { initials: 'ET', name: 'El Tecolote', price: '$19.00', grad: 'from-rose-500 to-rose-600' },
                { initials: 'BV', name: 'The Bay View', price: '$22.00', grad: 'from-emerald-500 to-emerald-600' },
              ].map((item) => (
                <div key={item.initials} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.grad} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {item.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">Social Post × 1</div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 tabular-nums text-sm">{item.price}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="tabular-nums">$41.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Platform fee (15%)</span>
                <span className="tabular-nums">$6.15</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-coral-500">$47.15</span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 py-5">
              <a
                href={`${prefix}/advertise/amplify`}
                className="block w-full text-center bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-500 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Review & Pay
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/advertise/sections/AmplifySection.tsx
git commit -m "feat: AmplifySection with centered showcase card and coral accents"
```

---

### Task 9: ValidateSection (Violet — Dashboard Metrics)

**Files:**
- Create: `src/components/advertise/sections/ValidateSection.tsx`

Animated metric counters + sparkline chart. Violet accents.

- [ ] **Step 1: Create ValidateSection**

Create `src/components/advertise/sections/ValidateSection.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { AnimatedCounter } from '../AnimatedCounter';
import { useCityOptional } from '@/lib/geo/city-context';

const METRICS = [
  { value: 47.2, prefix: '', suffix: 'K', decimals: 1, label: 'Impressions', color: 'text-violet-400' },
  { value: 1842, prefix: '', suffix: '', decimals: 0, label: 'Clicks', color: 'text-teal-400' },
  { value: 3.9, prefix: '', suffix: '%', decimals: 1, label: 'Engagement', color: 'text-coral-400' },
  { value: 1.87, prefix: '$', suffix: '', decimals: 2, label: 'Cost / Click', color: 'text-marigold-400' },
];

// Sparkline data (heights in %)
const SPARKLINE = [30, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90];

export function ValidateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="validate" className="relative bg-radiance hero-texture text-white py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-bold">4</span>
            <span className="label text-violet-400">Validate</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-5">
            See what{' '}
            <span className="text-gradient-violet">landed.</span>
          </h2>
          <p className="text-gray-400 body-md max-w-lg mx-auto">
            Real-time dashboards show impressions, clicks, and engagement across
            every publisher. Duplicate and redeploy winning campaigns.
          </p>
        </ScrollReveal>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {METRICS.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 text-center">
                <AnimatedCounter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  decimals={m.decimals}
                  className={`font-heading text-3xl font-bold ${m.color}`}
                />
                <div className="text-[11px] text-gray-500 mt-2 uppercase tracking-wider font-medium">
                  {m.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sparkline chart */}
        <ScrollReveal delay={0.3}>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-300">Engagement over time</span>
              <span className="text-xs text-gray-500">Last 12 months</span>
            </div>
            <div className="flex items-end gap-1 h-24">
              {SPARKLINE.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm bg-violet-500/40"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 100,
                    delay: 0.5 + i * 0.05,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-0.5">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="text-center mt-10" delay={0.4}>
          <a
            href={`${prefix}/advertise/validate`}
            className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            View Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/advertise/sections/ValidateSection.tsx
git commit -m "feat: ValidateSection with animated counters, sparkline, and violet accents"
```

---

### Task 10: PowerModeStrip

**Files:**
- Create: `src/components/advertise/sections/PowerModeStrip.tsx`

Compact strip for power users to skip to builder or direct purchase.

- [ ] **Step 1: Create PowerModeStrip**

Create `src/components/advertise/sections/PowerModeStrip.tsx`:

```tsx
'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function PowerModeStrip() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="bg-warm-page py-14 px-4">
      <ScrollReveal>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
              Know what you want?
            </h3>
            <p className="text-sm text-slate-500">
              Skip the walkthrough and jump straight in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${prefix}/advertise/select`}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md"
            >
              Buy an Ad
            </a>
            <a
              href={`${prefix}/advertise/create`}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Open Builder
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/advertise/sections/PowerModeStrip.tsx
git commit -m "feat: PowerModeStrip compact shortcut for returning users"
```

---

## Chunk 4: Assembly + Cleanup

### Task 11: Assemble the Landing Page

**Files:**
- Modify: `src/app/advertise/page.tsx` (full rewrite)

Replace the current landing page with the new composition.

- [ ] **Step 1: Rewrite the landing page**

Replace contents of `src/app/advertise/page.tsx` with:

```tsx
'use client';

import { Nav, Footer } from '@/components/shared';
import { PuzzleHero } from '@/components/advertise/puzzle/PuzzleHero';
import { CreateSection } from '@/components/advertise/sections/CreateSection';
import { SelectSection } from '@/components/advertise/sections/SelectSection';
import { AmplifySection } from '@/components/advertise/sections/AmplifySection';
import { ValidateSection } from '@/components/advertise/sections/ValidateSection';
import { PowerModeStrip } from '@/components/advertise/sections/PowerModeStrip';

export default function AdvertiseLanding() {
  return (
    <div className="min-h-screen">
      <Nav variant="advertise" />
      <PuzzleHero />
      <CreateSection />
      <SelectSection />
      <AmplifySection />
      <ValidateSection />
      <PowerModeStrip />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds. The page should load at `/sf/advertise` (or `/advertise`).

- [ ] **Step 3: Visual verification in browser**

Start dev server (`npm run dev`) and navigate to `http://localhost:3002/sf/advertise`.

Verify:
- [ ] Hero loads with dark gradient background
- [ ] Keyline backdrop pieces are visible as faint outlines
- [ ] Four colored puzzle pieces animate in from different directions
- [ ] Puzzle piece hover: lifts, slight rotation, shadow deepens
- [ ] S-curve bottom edge transitions smoothly to cream background
- [ ] Create section: split-screen with builder mock on right
- [ ] Select section: dark background with horizontally scrollable cards
- [ ] Amplify section: centered order card with coral accents
- [ ] Validate section: dark background with animated counters + sparkline
- [ ] Power mode strip: compact white card with two CTAs
- [ ] Colors carry through: marigold → teal → coral → violet
- [ ] All links work (with city prefix)

- [ ] **Step 4: Commit**

```bash
git add src/app/advertise/page.tsx
git commit -m "feat: assemble new advertise landing page with puzzle hero + 4 step sections"
```

---

### Task 12: Remove Replaced Components

**Files:**
- Delete: `src/components/advertise/PathwayHero.tsx`
- Delete: `src/components/advertise/ModulePreview.tsx`
- Delete: `src/components/advertise/TwoTracks.tsx`

- [ ] **Step 1: Verify no other files import the old components**

```bash
grep -r "PathwayHero\|ModulePreview\|TwoTracks" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: Only the files being deleted should appear (plus possibly this plan doc). If any other files import them, update those files first.

- [ ] **Step 2: Delete the old components**

```bash
rm src/components/advertise/PathwayHero.tsx
rm src/components/advertise/ModulePreview.tsx
rm src/components/advertise/TwoTracks.tsx
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -u src/components/advertise/
git commit -m "chore: remove replaced PathwayHero, ModulePreview, TwoTracks components"
```

---

### Task 13: Final Polish + Build Verification

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Clean build with no errors or warnings.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: No lint errors (warnings are acceptable).

- [ ] **Step 3: Visual QA in browser**

Navigate through the full page in Chrome:
- Scroll the entire page top to bottom
- Verify all scroll-triggered animations fire correctly
- Check responsive layout at mobile (375px), tablet (768px), desktop (1280px)
- Verify puzzle pieces don't overflow on mobile
- Check S-curve renders cleanly at all widths

- [ ] **Step 4: Final commit if any polish needed**

```bash
git add -A
git commit -m "style: final polish on advertise landing visual language"
```

- [ ] **Step 5: Push to main**

```bash
git push origin main
```

Expected: Push succeeds, Render auto-deploy triggers.
