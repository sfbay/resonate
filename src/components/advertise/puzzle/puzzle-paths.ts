/**
 * SVG path data for four interlocking jigsaw puzzle pieces.
 *
 * Coordinate system: each piece occupies a ~200x200 box within a 260x260 viewBox.
 * Tabs bump outward ~30px, blanks indent ~30px.
 * Pieces tile in a 2x2 grid:
 *   [Create ] [Select  ]
 *   [Amplify] [Validate]
 *
 * Edge assignments:
 *   Create (TL):   top=flat, right=tab,   bottom=tab,  left=flat
 *   Select (TR):   top=flat, right=flat,  bottom=blank, left=blank
 *   Amplify (BL):  top=blank, right=blank, bottom=flat, left=flat
 *   Validate (BR): top=tab,  right=flat,  bottom=flat, left=tab
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

export const PUZZLE_PIECES: PuzzlePieceDef[] = [
  {
    key: 'create',
    label: 'Create',
    sublabel: 'Build your message',
    // flat top, tab right, tab bottom, flat left
    path: `M 30,30
      L 230,30
      L 230,80 C 230,93 250,100 250,105 C 250,110 230,117 230,130 L 230,230
      L 180,230 C 167,230 160,250 155,250 C 150,250 143,230 130,230 L 30,230
      L 30,30 Z`,
    gradient: ['#F7B32B', '#E09D0E'],
    colorClass: 'marigold',
    href: '/advertise/create',
  },
  {
    key: 'select',
    label: 'Select',
    sublabel: 'Choose your channels',
    // flat top, flat right, blank bottom, blank left
    path: `M 30,30
      L 230,30
      L 230,230
      L 180,230 C 167,230 160,210 155,210 C 150,210 143,230 130,230 L 30,230
      L 30,130 C 30,117 10,110 10,105 C 10,100 30,93 30,80 L 30,30 Z`,
    gradient: ['#14919B', '#0B525B'],
    colorClass: 'teal',
    href: '/advertise/select',
  },
  {
    key: 'amplify',
    label: 'Amplify',
    sublabel: 'Set budget & launch',
    // blank top, blank right, flat bottom, flat left
    path: `M 30,30
      L 80,30 C 93,30 100,10 105,10 C 110,10 117,30 130,30 L 230,30
      L 230,80 C 230,93 210,100 210,105 C 210,110 230,117 230,130 L 230,230
      L 30,230
      L 30,30 Z`,
    gradient: ['#F15152', '#D93E3F'],
    colorClass: 'coral',
    href: '/advertise/amplify',
  },
  {
    key: 'validate',
    label: 'Validate',
    sublabel: 'Track what landed',
    // tab top, flat right, flat bottom, tab left
    path: `M 30,30
      L 130,30 C 143,30 150,50 155,50 C 160,50 167,30 180,30 L 230,30
      L 230,230
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
 * Inflection point at ~37% from left. Left side dips deeper.
 * ViewBox: 0 0 1440 120
 */
export const S_CURVE_PATH =
  'M0,0 L0,60 C180,100 360,110 530,80 C700,50 900,20 1100,35 C1300,50 1400,40 1440,30 L1440,0 Z';
