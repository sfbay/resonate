/**
 * SVG path data for four interlocking jigsaw puzzle pieces.
 *
 * Each piece uses a 200x200 base square with ~25px circular tabs/blanks.
 * ViewBox is 260x260 to accommodate protruding tabs (30px padding each side).
 * The square body spans from (30,30) to (230,230).
 *
 * Pieces tile in a 2x2 grid:
 *   [Create ] [Select  ]
 *   [Amplify] [Validate]
 *
 * Tab = circular bump protruding outward
 * Blank = circular indent cut inward (receives adjacent piece's tab)
 */

export interface PuzzlePieceDef {
  key: 'create' | 'select' | 'amplify' | 'validate';
  label: string;
  sublabel: string;
  /** SVG path string for clipPath. ViewBox is 260x260. */
  path: string;
  /** Gradient colors [from, to] */
  gradient: [string, string];
  /** CSS color class prefix (e.g., 'marigold') */
  colorClass: string;
  /** Link path */
  href: string;
}

// ─── Path building helpers ───────────────────────────────────────────
// Each edge goes from point A to point B. At the midpoint, a circular
// tab (outward bump) or blank (inward notch) is drawn using cubic beziers.
// The tab/blank is ~25px radius, centered on the edge midpoint.

// Horizontal edge (left→right), tab bumps downward (+Y)
function hTabDown(x1: number, x2: number, y: number): string {
  const mx = (x1 + x2) / 2;
  return `L ${mx - 20},${y} C ${mx - 20},${y} ${mx - 25},${y + 30} ${mx},${y + 30} C ${mx + 25},${y + 30} ${mx + 20},${y} ${mx + 20},${y} L ${x2},${y}`;
}

// Horizontal edge (left→right), blank notches upward (-Y)
function hBlankUp(x1: number, x2: number, y: number): string {
  const mx = (x1 + x2) / 2;
  return `L ${mx - 20},${y} C ${mx - 20},${y} ${mx - 25},${y - 30} ${mx},${y - 30} C ${mx + 25},${y - 30} ${mx + 20},${y} ${mx + 20},${y} L ${x2},${y}`;
}

// Horizontal edge (left→right), tab bumps upward (-Y)
function hTabUp(x1: number, x2: number, y: number): string {
  const mx = (x1 + x2) / 2;
  return `L ${mx - 20},${y} C ${mx - 20},${y} ${mx - 25},${y - 30} ${mx},${y - 30} C ${mx + 25},${y - 30} ${mx + 20},${y} ${mx + 20},${y} L ${x2},${y}`;
}

// Horizontal edge (left→right), blank notches downward (+Y)
function hBlankDown(x1: number, x2: number, y: number): string {
  const mx = (x1 + x2) / 2;
  return `L ${mx - 20},${y} C ${mx - 20},${y} ${mx - 25},${y + 30} ${mx},${y + 30} C ${mx + 25},${y + 30} ${mx + 20},${y} ${mx + 20},${y} L ${x2},${y}`;
}

// Vertical edge (top→bottom), tab bumps rightward (+X)
function vTabRight(x: number, y1: number, y2: number): string {
  const my = (y1 + y2) / 2;
  return `L ${x},${my - 20} C ${x},${my - 20} ${x + 30},${my - 25} ${x + 30},${my} C ${x + 30},${my + 25} ${x},${my + 20} ${x},${my + 20} L ${x},${y2}`;
}

// Vertical edge (top→bottom), blank notches leftward (-X)
function vBlankLeft(x: number, y1: number, y2: number): string {
  const my = (y1 + y2) / 2;
  return `L ${x},${my - 20} C ${x},${my - 20} ${x - 30},${my - 25} ${x - 30},${my} C ${x - 30},${my + 25} ${x},${my + 20} ${x},${my + 20} L ${x},${y2}`;
}

// Vertical edge (bottom→top), tab bumps leftward (-X)
function vTabLeft(x: number, y1: number, y2: number): string {
  const my = (y1 + y2) / 2;
  return `L ${x},${my + 20} C ${x},${my + 20} ${x - 30},${my + 25} ${x - 30},${my} C ${x - 30},${my - 25} ${x},${my - 20} ${x},${my - 20} L ${x},${y2}`;
}

// Vertical edge (bottom→top), blank notches rightward (+X)
function vBlankRight(x: number, y1: number, y2: number): string {
  const my = (y1 + y2) / 2;
  return `L ${x},${my + 20} C ${x},${my + 20} ${x + 30},${my + 25} ${x + 30},${my} C ${x + 30},${my - 25} ${x},${my - 20} ${x},${my - 20} L ${x},${y2}`;
}

// Flat edge
function flat(x1: number, y1: number, x2: number, y2: number): string {
  return `L ${x2},${y2}`;
}

// ─── Piece definitions ───────────────────────────────────────────────
// Square body: (30,30) to (230,230)
// Each path drawn clockwise: start top-left → top edge → right edge → bottom edge → left edge

export const PUZZLE_PIECES: PuzzlePieceDef[] = [
  {
    key: 'create',
    label: 'Create',
    sublabel: 'Build your message',
    // Top=flat, Right=tab(right), Bottom=tab(down), Left=flat
    path: [
      'M 30,30',
      flat(30, 30, 230, 30),            // top: flat
      vTabRight(230, 30, 230),           // right: tab bumps right
      hTabDown(230, 30, 230),            // bottom (right→left reversed, so we go left): tab bumps down
      flat(30, 230, 30, 30),             // left: flat
      'Z',
    ].join(' '),
    gradient: ['#F7B32B', '#E09D0E'],
    colorClass: 'marigold',
    href: '/advertise/create',
  },
  {
    key: 'select',
    label: 'Select',
    sublabel: 'Choose your channels',
    // Top=flat, Right=flat, Bottom=blank(up), Left=blank(right — receives Create's right tab)
    path: [
      'M 30,30',
      flat(30, 30, 230, 30),             // top: flat
      flat(230, 30, 230, 230),           // right: flat
      hBlankUp(230, 30, 230),            // bottom (right→left): blank notches up
      vBlankRight(30, 230, 30),          // left (bottom→top): blank notches right (receives Create's tab)
      'Z',
    ].join(' '),
    gradient: ['#14919B', '#0B525B'],
    colorClass: 'teal',
    href: '/advertise/select',
  },
  {
    key: 'amplify',
    label: 'Amplify',
    sublabel: 'Set budget & launch',
    // Top=blank(up — receives Create's bottom tab), Right=blank(left), Bottom=flat, Left=flat
    path: [
      'M 30,30',
      hBlankUp(30, 230, 30),             // top: blank notches up (receives Create's bottom tab)
      vBlankLeft(230, 30, 230),          // right: blank notches left (receives Validate's left tab)
      flat(230, 230, 30, 230),           // bottom: flat
      flat(30, 230, 30, 30),             // left: flat
      'Z',
    ].join(' '),
    gradient: ['#F15152', '#D93E3F'],
    colorClass: 'coral',
    href: '/advertise/amplify',
  },
  {
    key: 'validate',
    label: 'Validate',
    sublabel: 'Track what landed',
    // Top=tab(up — matches Select's bottom blank), Right=flat, Bottom=flat, Left=tab(left)
    path: [
      'M 30,30',
      hTabUp(30, 230, 30),              // top: tab bumps up (fills Select's bottom blank)
      flat(230, 30, 230, 230),           // right: flat
      flat(230, 230, 30, 230),           // bottom: flat
      vTabLeft(30, 230, 30),             // left (bottom→top): tab bumps left (fills Amplify's right blank)
      'Z',
    ].join(' '),
    gradient: ['#7C3AED', '#6D28D9'],
    colorClass: 'violet',
    href: '/advertise/validate',
  },
];

/**
 * Backdrop keyline pieces — simplified outlines for the scattered background.
 */
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

/**
 * S-curve SVG path for the hero bottom edge.
 * This fills the BOTTOM of the SVG with cream color, creating the
 * transition from dark hero above to light content below.
 * The wave top edge: deeper on left (cream starts lower), rises on right.
 * Inflection point at ~37% from left.
 * ViewBox: 0 0 1440 120
 */
export const S_CURVE_PATH =
  'M0,90 C200,110 400,100 540,60 C700,15 950,5 1100,30 C1250,55 1380,45 1440,35 L1440,120 L0,120 Z';
