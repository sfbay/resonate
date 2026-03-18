/**
 * SVG path data for four interlocking jigsaw puzzle pieces.
 *
 * ViewBox: 440×440
 * Body:    (120,120) to (320,320) — 200×200 square
 * Padding: 120px on each side for large tab protrusion
 *
 * Tab anatomy (classic "mushroom" connector):
 *   narrow neck → shoulder → round bulbous head → shoulder → neck
 * Each tab uses 4 cubic bézier segments for smooth, realistic shapes.
 *
 * Tabs are 35% of body width — bold, unmistakable jigsaw silhouette.
 *
 * Grid layout:
 *   [Create ] [Select  ]    marigold   teal
 *   [Amplify] [Validate]    coral      violet
 */

export interface PuzzlePieceDef {
  key: 'create' | 'select' | 'amplify' | 'validate';
  label: string;
  sublabel: string;
  /** SVG path string for clipPath. ViewBox is 440×440. */
  path: string;
  /** Gradient colors [from, to] */
  gradient: [string, string];
  /** CSS color class prefix */
  colorClass: string;
  /** Link path */
  href: string;
}

// ─── Geometry constants ──────────────────────────────────────────────
const B0 = 120;  // body start (top / left)
const B1 = 320;  // body end (bottom / right)

// Tab proportions — BIG, bold mushroom connectors
const HW = 38;   // head half-width  (head ⌀ = 76px, 38% of body)
const NW = 13;   // neck half-width  (neck w = 26px, head:neck = 2.9:1)
const TD = 76;   // tab depth        (protrusion = 76px, 38% of body)

/** ViewBox size for all puzzle piece SVGs */
export const PUZZLE_VIEWBOX = 440;

// ─── Tab / blank path builders ───────────────────────────────────────

/**
 * Horizontal tab along edge y, from x1 toward x2.
 * dir = +1 → protrudes downward;  dir = -1 → protrudes upward
 */
function hTab(x1: number, x2: number, y: number, dir: number): string {
  const mx = (x1 + x2) / 2;
  const d = dir;

  const yNeck = y + d * 16;           // end of neck / start of shoulder
  const yWide = y + d * TD * 0.50;    // widest part of head
  const yTip  = y + d * TD;           // bottommost point of head

  return [
    `L ${mx - NW},${y}`,
    // 1. Neck left → head left  (S-curve: narrow → wide)
    `C ${mx - NW},${yNeck} ${mx - HW},${yNeck} ${mx - HW},${yWide}`,
    // 2. Head left → head bottom center (quarter-circle)
    `C ${mx - HW},${y + d * TD * 0.80} ${mx - HW * 0.5},${yTip} ${mx},${yTip}`,
    // 3. Head bottom center → head right (quarter-circle)
    `C ${mx + HW * 0.5},${yTip} ${mx + HW},${y + d * TD * 0.80} ${mx + HW},${yWide}`,
    // 4. Head right → neck right (S-curve: wide → narrow)
    `C ${mx + HW},${yNeck} ${mx + NW},${yNeck} ${mx + NW},${y}`,
    `L ${x2},${y}`,
  ].join(' ');
}

/**
 * Vertical tab along edge x, from y1 toward y2.
 * dir = +1 → protrudes rightward;  dir = -1 → protrudes leftward
 */
function vTab(x: number, y1: number, y2: number, dir: number): string {
  const my = (y1 + y2) / 2;
  const d = dir;

  const xNeck = x + d * 16;
  const xWide = x + d * TD * 0.50;
  const xTip  = x + d * TD;

  return [
    `L ${x},${my - NW}`,
    `C ${xNeck},${my - NW} ${xNeck},${my - HW} ${xWide},${my - HW}`,
    `C ${x + d * TD * 0.80},${my - HW} ${xTip},${my - HW * 0.5} ${xTip},${my}`,
    `C ${xTip},${my + HW * 0.5} ${x + d * TD * 0.80},${my + HW} ${xWide},${my + HW}`,
    `C ${xNeck},${my + HW} ${xNeck},${my + NW} ${x},${my + NW}`,
    `L ${x},${y2}`,
  ].join(' ');
}

/**
 * Horizontal blank (concavity) — indentation receiving a neighbor's tab.
 *
 * Direction is NEGATED: the caller passes the "away from body" direction
 * (e.g., -1 = up for a top edge), but the blank needs to dip INTO the body
 * (downward) to create the concavity. Negating achieves this.
 */
function hBlank(x1: number, x2: number, y: number, dir: number): string {
  return hTab(x1, x2, y, -dir);
}

/**
 * Vertical blank (concavity) — indentation receiving a neighbor's tab.
 * Direction is negated so the indent goes INTO the piece body.
 */
function vBlank(x: number, y1: number, y2: number, dir: number): string {
  return vTab(x, y1, y2, -dir);
}

/** Straight edge segment */
function flat(_x1: number, _y1: number, x2: number, y2: number): string {
  return `L ${x2},${y2}`;
}

// ─── Piece definitions ───────────────────────────────────────────────
// Paths drawn clockwise: M top-left → top → right → bottom → left → Z
//
// Tab directions (away from body):
//   top edge:    -1 (up)      bottom edge: +1 (down)
//   left edge:   -1 (left)    right edge:  +1 (right)
//
// Blank directions (also away from body — same as the tab they receive):
//   top blank:   -1 (up)      bottom blank: +1 (down)
//   left blank:  -1 (left)    right blank:  +1 (right)

export const PUZZLE_PIECES: PuzzlePieceDef[] = [
  {
    // CREATE: top-left — flat top, tab→right, tab→down, flat left
    key: 'create',
    label: 'Create',
    sublabel: 'Build your message',
    path: [
      `M ${B0},${B0}`,
      flat(B0, B0, B1, B0),           // top: flat
      vTab(B1, B0, B1, +1),           // right: tab protrudes right
      hTab(B1, B0, B1, +1),           // bottom: tab protrudes down (drawn R→L)
      flat(B0, B1, B0, B0),           // left: flat
      'Z',
    ].join(' '),
    gradient: ['#F7B32B', '#E09D0E'],
    colorClass: 'marigold',
    href: '/advertise/create',
  },
  {
    // SELECT: top-right — flat top, flat right, tab→down, blank←left
    key: 'select',
    label: 'Select',
    sublabel: 'Choose your channels',
    path: [
      `M ${B0},${B0}`,
      flat(B0, B0, B1, B0),           // top: flat
      flat(B1, B0, B1, B1),           // right: flat
      hTab(B1, B0, B1, +1),           // bottom: tab protrudes down (R→L)
      vBlank(B0, B1, B0, -1),         // left: blank indents LEFT (away from body)
      'Z',
    ].join(' '),
    gradient: ['#14919B', '#0B525B'],
    colorClass: 'teal',
    href: '/advertise/select',
  },
  {
    // AMPLIFY: bottom-left — blank↑top, tab→right, flat bottom, flat left
    key: 'amplify',
    label: 'Amplify',
    sublabel: 'Set budget & launch',
    path: [
      `M ${B0},${B0}`,
      hBlank(B0, B1, B0, -1),         // top: blank indents UP (away from body)
      vTab(B1, B0, B1, +1),           // right: tab protrudes right
      flat(B1, B1, B0, B1),           // bottom: flat
      flat(B0, B1, B0, B0),           // left: flat
      'Z',
    ].join(' '),
    gradient: ['#F15152', '#D93E3F'],
    colorClass: 'coral',
    href: '/advertise/amplify',
  },
  {
    // VALIDATE: bottom-right — blank↑top, flat right, flat bottom, blank←left
    key: 'validate',
    label: 'Validate',
    sublabel: 'Track what landed',
    path: [
      `M ${B0},${B0}`,
      hBlank(B0, B1, B0, -1),         // top: blank indents UP (away from body)
      flat(B1, B0, B1, B1),           // right: flat
      flat(B1, B1, B0, B1),           // bottom: flat
      vBlank(B0, B1, B0, -1),         // left: blank indents LEFT (away from body)
      'Z',
    ].join(' '),
    gradient: ['#7C3AED', '#6D28D9'],
    colorClass: 'violet',
    href: '/advertise/validate',
  },
];

// ─── Backdrop keyline pieces ─────────────────────────────────────────
export const BACKDROP_PIECES: Array<{
  x: string; y: string; rotate: number; scale: number; pathIndex: number;
}> = [
  { x: '5%',  y: '10%', rotate: 25,  scale: 0.35, pathIndex: 0 },
  { x: '85%', y: '5%',  rotate: -15, scale: 0.4,  pathIndex: 1 },
  { x: '15%', y: '70%', rotate: 45,  scale: 0.3,  pathIndex: 2 },
  { x: '90%', y: '65%', rotate: -35, scale: 0.45, pathIndex: 3 },
  { x: '45%', y: '85%', rotate: 12,  scale: 0.25, pathIndex: 0 },
  { x: '70%', y: '15%', rotate: -50, scale: 0.3,  pathIndex: 2 },
  { x: '25%', y: '40%', rotate: 70,  scale: 0.35, pathIndex: 1 },
  { x: '60%', y: '50%', rotate: -20, scale: 0.28, pathIndex: 3 },
  { x: '3%',  y: '45%', rotate: 38,  scale: 0.4,  pathIndex: 0 },
  { x: '78%', y: '80%', rotate: -8,  scale: 0.32, pathIndex: 2 },
  { x: '50%', y: '20%', rotate: 55,  scale: 0.3,  pathIndex: 1 },
  { x: '35%', y: '60%', rotate: -42, scale: 0.38, pathIndex: 3 },
  { x: '92%', y: '35%', rotate: 18,  scale: 0.25, pathIndex: 0 },
  { x: '12%', y: '90%', rotate: -60, scale: 0.35, pathIndex: 2 },
  { x: '65%', y: '75%', rotate: 30,  scale: 0.28, pathIndex: 1 },
];

// ─── Single puzzle piece path for small decorative use ───────────────
// Standalone piece with tabs on all 4 sides, for badges/icons.
export const SINGLE_PIECE_PATH = [
  `M ${B0},${B0}`,
  hTab(B0, B1, B0, -1),   // top: tab up
  vTab(B1, B0, B1, +1),   // right: tab right
  hTab(B1, B0, B1, +1),   // bottom: tab down
  vTab(B0, B1, B0, -1),   // left: tab left
  'Z',
].join(' ');

// ─── S-curve path ────────────────────────────────────────────────────
export const S_CURVE_PATH =
  'M0,90 C200,110 400,100 540,60 C700,15 950,5 1100,30 C1250,55 1380,45 1440,35 L1440,120 L0,120 Z';
