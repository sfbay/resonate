/**
 * SVG path data for four interlocking jigsaw puzzle pieces.
 *
 * ViewBox: 500×500
 * Body:    (150,150) to (350,350) — 200×200 square
 * Padding: 150px on each side for large tab protrusion
 *
 * Tab proportions modeled from raster-pieces.jpg reference:
 *   - Bulb is ~42% of body width (nearly half!)
 *   - Neck is ~28% of bulb width (very narrow pinch)
 *   - Bulb is nearly circular
 *   - Total protrusion is ~42% of body width
 *
 * Grid layout:
 *   [Create ] [Select  ]    marigold   teal
 *   [Amplify] [Validate]    coral      violet
 */

export interface PuzzlePieceDef {
  key: 'create' | 'select' | 'amplify' | 'validate';
  label: string;
  sublabel: string;
  path: string;
  gradient: [string, string];
  colorClass: string;
  href: string;
}

// ─── Geometry constants ──────────────────────────────────────────────
const B0 = 150;  // body start (top / left)
const B1 = 350;  // body end (bottom / right)

// Tab proportions — matched to raster-pieces.jpg reference
const HW = 42;   // head half-width  (head ⌀ = 84px, 42% of body)
const NW = 12;   // neck half-width  (neck w = 24px, neck:head = 0.29)
const TD = 84;   // tab depth        (protrusion = 84px, 42% of body)

/** ViewBox size for all puzzle piece SVGs */
export const PUZZLE_VIEWBOX = 500;

// ─── Tab / blank path builders ───────────────────────────────────────
// Each tab uses 4 cubic béziers: neck→shoulder, head-left, head-right,
// shoulder→neck. The neck is narrow with a slight concave pinch before
// flaring out to the round bulb.

/**
 * Horizontal tab along edge y, from x1 toward x2.
 * dir = +1 → protrudes downward;  dir = -1 → protrudes upward
 */
function hTab(x1: number, x2: number, y: number, dir: number): string {
  const mx = (x1 + x2) / 2;
  const d = dir;

  // Vertical stations
  const yNeck = y + d * 18;            // neck-to-shoulder junction
  const yWide = y + d * TD * 0.46;     // head widest point
  const yTip  = y + d * TD;            // tip of bulb

  return [
    `L ${mx - NW},${y}`,
    // 1. Neck → head shoulder (narrow pinch widens to bulb)
    `C ${mx - NW},${yNeck} ${mx - HW},${yNeck} ${mx - HW},${yWide}`,
    // 2. Head left → tip (quarter-circle, round bulb)
    `C ${mx - HW},${y + d * TD * 0.78} ${mx - HW * 0.55},${yTip} ${mx},${yTip}`,
    // 3. Tip → head right (quarter-circle)
    `C ${mx + HW * 0.55},${yTip} ${mx + HW},${y + d * TD * 0.78} ${mx + HW},${yWide}`,
    // 4. Head shoulder → neck (bulb narrows to pinch)
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

  const xNeck = x + d * 18;
  const xWide = x + d * TD * 0.46;
  const xTip  = x + d * TD;

  return [
    `L ${x},${my - NW}`,
    `C ${xNeck},${my - NW} ${xNeck},${my - HW} ${xWide},${my - HW}`,
    `C ${x + d * TD * 0.78},${my - HW} ${xTip},${my - HW * 0.55} ${xTip},${my}`,
    `C ${xTip},${my + HW * 0.55} ${x + d * TD * 0.78},${my + HW} ${xWide},${my + HW}`,
    `C ${xNeck},${my + HW} ${xNeck},${my + NW} ${x},${my + NW}`,
    `L ${x},${y2}`,
  ].join(' ');
}

/**
 * Blank (concavity) — direction is NEGATED so the indent cuts INTO
 * the piece body, creating a notch that receives a neighbor's tab.
 */
function hBlank(x1: number, x2: number, y: number, dir: number): string {
  return hTab(x1, x2, y, -dir);
}
function vBlank(x: number, y1: number, y2: number, dir: number): string {
  return vTab(x, y1, y2, -dir);
}

/** Straight edge segment */
function flat(_x1: number, _y1: number, x2: number, y2: number): string {
  return `L ${x2},${y2}`;
}

// ─── Piece definitions ───────────────────────────────────────────────
// Tab = outward protrusion (away from body)
// Blank = inward notch (into body, receives neighbor's tab)
//
// Interlocking pattern:
//   Create's right tab  ↔  Select's left blank
//   Create's bottom tab ↔  Amplify's top blank
//   Select's bottom tab ↔  Validate's top blank
//   Amplify's right tab ↔  Validate's left blank

export const PUZZLE_PIECES: PuzzlePieceDef[] = [
  {
    // CREATE: top-left corner — 2 flat edges, 2 tabs
    key: 'create',
    label: 'Create',
    sublabel: 'Build your message',
    path: [
      `M ${B0},${B0}`,
      flat(B0, B0, B1, B0),           // top: flat (outer edge)
      vTab(B1, B0, B1, +1),           // right: TAB protrudes right →
      hTab(B1, B0, B1, +1),           // bottom: TAB protrudes down ↓ (drawn R→L)
      flat(B0, B1, B0, B0),           // left: flat (outer edge)
      'Z',
    ].join(' '),
    gradient: ['#F7B32B', '#E09D0E'],
    colorClass: 'marigold',
    href: '/advertise/create',
  },
  {
    // SELECT: top-right corner — 2 flat, 1 tab, 1 blank
    key: 'select',
    label: 'Select',
    sublabel: 'Choose your channels',
    path: [
      `M ${B0},${B0}`,
      flat(B0, B0, B1, B0),           // top: flat (outer edge)
      flat(B1, B0, B1, B1),           // right: flat (outer edge)
      hTab(B1, B0, B1, +1),           // bottom: TAB protrudes down ↓ (R→L)
      vBlank(B0, B1, B0, -1),         // left: BLANK notch ← (receives Create's right tab)
      'Z',
    ].join(' '),
    gradient: ['#14919B', '#0B525B'],
    colorClass: 'teal',
    href: '/advertise/select',
  },
  {
    // AMPLIFY: bottom-left corner — 2 flat, 1 tab, 1 blank
    key: 'amplify',
    label: 'Amplify',
    sublabel: 'Set budget & launch',
    path: [
      `M ${B0},${B0}`,
      hBlank(B0, B1, B0, -1),         // top: BLANK notch ↑ (receives Create's bottom tab)
      vTab(B1, B0, B1, +1),           // right: TAB protrudes right →
      flat(B1, B1, B0, B1),           // bottom: flat (outer edge)
      flat(B0, B1, B0, B0),           // left: flat (outer edge)
      'Z',
    ].join(' '),
    gradient: ['#F15152', '#D93E3F'],
    colorClass: 'coral',
    href: '/advertise/amplify',
  },
  {
    // VALIDATE: bottom-right corner — 2 flat, 0 tabs, 2 blanks
    key: 'validate',
    label: 'Validate',
    sublabel: 'Track what landed',
    path: [
      `M ${B0},${B0}`,
      hBlank(B0, B1, B0, -1),         // top: BLANK notch ↑ (receives Select's bottom tab)
      flat(B1, B0, B1, B1),           // right: flat (outer edge)
      flat(B1, B1, B0, B1),           // bottom: flat (outer edge)
      vBlank(B0, B1, B0, -1),         // left: BLANK notch ← (receives Amplify's right tab)
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

// ─── Single puzzle piece path for decorative use ─────────────────────
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
