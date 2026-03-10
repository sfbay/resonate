# Advertise Landing Page: Launch Visual Language

## Purpose

Define the visual language for the Resonate Advertise portal landing page. This is the **reference implementation** for a launch-grade design system that will later extend to Publisher and Government portals. The page introduces the four-step advertising workflow (Create, Select, Amplify, Validate) through a jigsaw puzzle metaphor — four distinct pieces that clearly belong together.

## Design Principles

1. **The Jigsaw Metaphor** — Four steps, four puzzle pieces, four colors. Distinct but made to fit. The visual system communicates that each step is valuable on its own AND part of a larger whole.
2. **Genuine Photography** — Real faces, real neighborhoods, real community moments. Infrastructure supports photo textures on puzzle pieces and throughout sections. Gradient fills serve as dignified defaults until photography is ready.
3. **Section Diversity** — Every section below the hero uses a *different* layout treatment. Carousels, split-screens, centered cards, animated counters. Unified by color threads and typography, diverse in structure. Reference: hellosunset.com (section variety), mpsystempack.com (unified diversity).
4. **Premium Motion** — Framer Motion for spring-based animations, scroll-triggered reveals, and hover interactions. Choreographed, not scattered. One well-orchestrated entrance > many random micro-interactions.
5. **Warm Confidence** — Not sterile tech, not chaotic startup. Warm palette, serif display headings (Fraunces), generous spacing, rich textures. Trustworthy yet modern.

## Four-Color Step System

Each step has a dedicated color that carries from the hero puzzle piece through to its landing page section and into the actual step page:

| Step | Color Name | Hex Value | Character |
|------|-----------|-----------|-----------|
| Create | Marigold | `#F7B32B` (existing) | Warm, creative, invitation |
| Select | Teal | `#0B525B` (existing) | Grounded, trust, community |
| Amplify | Coral | `#F15152` (existing) | Energy, action, launch |
| Validate | Violet | `~#7C3AED` (new) | Premium, insight, reflection |

**Rhythm**: warm → cool → warm → cool. The palette avoids monotony and creates a satisfying visual journey.

### Violet Addition to Design System

Add to `globals.css` and `@theme`:
- `--color-violet: #7C3AED` (primary)
- `--color-violet-dark: #6D28D9` (hover/dark)
- `--color-violet-light: #A78BFA` (light accent)

Corresponding Tailwind tokens: `violet-500`, `violet-600`, `violet-400`.

## Page Structure

### 1. Hero Section

**Background**: `bg-radiance` (existing warm mesh gradient on charcoal) with `hero-texture` noise overlay.

**Backdrop — Scattered Keyline Puzzle Pieces**:
- 15-20 puzzle piece outlines scattered at varying scales (40px–120px) and rotations
- Keyline only (stroke, no fill), 5-8% opacity white
- Rendered as SVG elements positioned absolutely within the hero
- Creates subtle texture without competing with foreground pieces
- Optional: very slow drift animation (CSS `translate` over 20-30s) for gentle movement

**Foreground — Four Hero Puzzle Pieces**:
- Large (roughly 200-260px), prominent, the visual centerpiece
- Each is a true jigsaw puzzle piece shape via SVG `clip-path` — with tabs and blanks on edges that would interlock if assembled
- Tilted at varying angles (e.g., Create at -8°, Select at 5°, Amplify at -3°, Validate at 10°)
- Slightly overlapping but clearly separate — they *will* fit but aren't connected yet
- Each piece filled with its step color as a gradient, with infrastructure to swap in a `background-image` photograph (CSS `clip-path` masks the photo into the puzzle shape)
- Drop shadows for depth and separation
- Clustered slightly left-of-center for compositional balance with the offset S-curve below

**Entrance Animation** (Framer Motion):
- Pieces drift in from different directions (top-left, top-right, bottom-left, bottom-right)
- Spring physics with slight overshoot for organic feel
- Staggered by 0.15-0.2s
- Settle into final positions with a subtle "landing" bounce

**Hover Interactions**:
- Hovered piece lifts (translateZ/scale), shadow deepens, slight rotation adjustment
- Other pieces dim slightly (opacity 0.7)
- Piece label/step name appears or becomes more prominent
- Smooth spring transitions (not abrupt)

**Scroll Parallax**:
- Pieces move at slightly different rates on scroll (1-3px difference)
- Creates depth without being distracting

**Content Overlay**:
- "Resonate Advertise" label above
- Display headline: "Reach your community. Your way." (or refined version)
- Subhead: brief value prop
- Positioned to coexist with the puzzle pieces, not compete

**Bottom Edge — Offset S-Curve**:
- SVG path creating a subtle S-curve transition from hero to first content section
- Inflection point at ~35-40% from left
- Left side: deeper curve (more hero background visible, creates visual weight/anchor)
- Right side: shallower, lifts into content
- Fills with the hero's dark background color, content section's lighter color below
- Creates the effect of the hero "pouring" into the page

### 2. Step Sections (Below Hero)

Four full-width sections, each corresponding to a puzzle piece. **Each section uses a different layout treatment** — this is critical. No two sections should have the same structure.

Every section carries its puzzle piece's color as the primary accent (borders, highlights, icons, hover states). A small puzzle piece icon or shape in the section corner/margin provides visual continuity with the hero.

#### Section: Create (Marigold)

**Layout: Split-screen, content left + large visual right**
- Left: Bold headline ("Start with what you want to say."), body copy, CTA button
- Right: A rich mock of the ad builder — not browser chrome, but an actual stylized preview showing template cards, a headline input, a body field, and a live preview rendering
- Marigold accents on the mock UI elements
- Entrance: slides in from left (content) and right (visual) simultaneously on scroll

#### Section: Select (Teal)

**Layout: Full-width with horizontal scrolling card carousel**
- Bold headline centered above
- Horizontal scroll of publisher cards (3-4 visible, more on scroll) — each card shows publisher name, gradient avatar, neighborhoods, reach, starting price
- Teal accent on selected/featured card
- A small embedded map preview or geographic indicator
- Entrance: cards fan in from the right, staggered

#### Section: Amplify (Coral)

**Layout: Centered showcase card with radiating details**
- A single prominent "order summary" card centered on the page
- Flanking details: pricing breakdown on one side, timeline/schedule on the other
- Coral accents, gradient glow behind the card
- Entrance: card scales up from center, flanking details fade in after

#### Section: Validate (Violet)

**Layout: Dashboard-style metrics grid with animated counters**
- 2x2 or 3-across metric cards with large animated numbers (count up on scroll)
- Below: a sparkline or area chart that draws/fills on scroll
- Violet accents throughout
- Entrance: metrics count up with spring easing, chart draws left-to-right

### 3. Power Mode Strip

A compact, confident callout — not a philosophical section. Positioned after the four step sections, before the footer.

- Slim horizontal strip or card
- "Know what you want? Skip straight to the builder." or similar
- Two compact CTAs: "Buy an Ad" (direct to select) and "Build a Campaign" (direct to create)
- Subtle, not attention-competing. Serves power users and returning visitors.

### 4. Footer

Existing footer component with advertise-specific links (already implemented).

## Puzzle Piece Technical Spec

### SVG Shape

Each piece is a jigsaw puzzle shape with tabs (bumps out) and blanks (indents in) on its four edges. The four pieces should have complementary edge profiles — if arranged in a 2x2 grid, their tabs and blanks would interlock.

**Piece edge assignments** (tab = bump out, blank = indent):

| Piece | Top | Right | Bottom | Left |
|-------|-----|-------|--------|------|
| Create (top-left) | flat | tab | tab | flat |
| Select (top-right) | flat | flat | blank | blank |
| Amplify (bottom-left) | blank | blank | flat | flat |
| Validate (bottom-right) | tab | flat | flat | tab |

This ensures they tile correctly when assembled.

### Implementation

```tsx
// Component: PuzzlePiece
interface PuzzlePieceProps {
  step: 'create' | 'select' | 'amplify' | 'validate';
  backgroundImage?: string; // URL for photo texture
  className?: string;
}
```

- SVG `<clipPath>` defines the puzzle shape
- Inner `<rect>` or `<image>` fills with gradient or photo
- CSS `filter: drop-shadow(...)` for depth
- Framer Motion `motion.div` wrapper for animations

### Background Keyline Pieces

- Reuse the same SVG paths but render as stroke-only (`fill: none`, `stroke: rgba(255,255,255,0.06)`, `stroke-width: 1.5`)
- Position via `absolute` with random-looking but designed placements
- 15-20 pieces at scales from 0.3x to 0.8x of the foreground piece size
- Various rotations (0-360°)
- Optional: 2-3 pieces partially "off-screen" at edges for depth

## Animation Choreography

### Page Load Sequence

1. **0.0s** — Hero background renders (bg-radiance + texture)
2. **0.1s** — Headline and subhead fade up
3. **0.3s** — Keyline backdrop pieces fade in (all at once, very subtle)
4. **0.5s–1.1s** — Four foreground pieces spring in from different directions, staggered 0.15s each
5. **1.3s** — Any CTA or secondary content fades up

### Scroll-Triggered Reveals

Each section uses Framer Motion's `useInView` or `whileInView`:
- Trigger when 20-30% of section enters viewport
- Spring-based entrance (not linear easing)
- Each section's entrance is unique (see section layouts above)

### Hover States

- Puzzle pieces: lift + shadow + dim siblings
- Section CTAs: standard hover lift
- Cards in sections: lift + accent border glow

## Photography Framework

Every visual slot in the design accepts an optional photograph:

| Location | Photo Type | Default (no photo) |
|----------|-----------|-------------------|
| Create puzzle piece | Hands writing/creating, someone at a desk | Marigold gradient fill |
| Select puzzle piece | Community gathering, neighborhood street | Teal gradient fill |
| Amplify puzzle piece | People in conversation, energy/movement | Coral gradient fill |
| Validate puzzle piece | Person reviewing results, satisfaction | Violet gradient fill |
| Create section visual | Ad builder in use, creative workspace | Stylized mock UI |
| Select section cards | Publisher headshots or masthead imagery | Gradient avatar initials |

Photos must be genuine — real people, real places. No stock photography that reads as generic. AI-generated images of cityscapes may be acceptable; AI-generated people are not.

## Dependencies

### New Package
- `framer-motion` (npm) — animation library for React

### New Design Tokens
- Violet color family (CSS variables + Tailwind tokens)

### New Components
- `PuzzlePiece` — SVG clip-path puzzle shape with gradient/photo fill
- `PuzzleHero` — Hero section with backdrop + foreground pieces + S-curve
- `ScrollReveal` — Framer Motion wrapper for scroll-triggered section entrances
- `AnimatedCounter` — Number that counts up on scroll (for Validate section)

### Modified Components
- `globals.css` — Add violet tokens, S-curve styles
- `src/app/advertise/page.tsx` — Replace current landing page with new design
- `PathwayHero.tsx` — Replace entirely with `PuzzleHero`
- `ModulePreview.tsx` — Replace with four unique section components
- `TwoTracks.tsx` — Replace with compact "Power Mode" strip

## Out of Scope

- Publisher and Government portal landing pages (future, will use this as reference)
- Inner step pages (create, select, amplify, validate) — keep current design
- Authentication/login system
- Actual photo sourcing (infrastructure only; gradients as defaults)
- GSAP/Lenis smooth scroll (Framer Motion only for now)

## Success Criteria

1. The four puzzle pieces are immediately understood as "steps that fit together"
2. Each section below feels like a different, curated experience — not a template repeated 4x
3. Color threads (marigold, teal, coral, violet) are instantly recognizable from hero to section
4. The page feels premium, warm, and distinctly Resonate — not generic SaaS
5. Photography can be dropped in without code changes (prop-driven)
6. Animations enhance understanding, never distract
7. The S-curve hero edge is a subtle "wow" moment, not a gimmick
8. Page loads fast — no layout shift, above-fold content renders in <1s
