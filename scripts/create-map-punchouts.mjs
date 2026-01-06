#!/usr/bin/env node
/**
 * Thomas Bros. Map Punch-out Generator
 *
 * Creates cropped sections of the 1938 Thomas Bros. SF map for use as hero textures.
 * Each punch-out shows a block-level view of a different SF neighborhood.
 *
 * Source: David Rumsey Map Collection - Thomas Bros. Map of San Francisco (1938)
 * Original dimensions: 17382 x 11404 pixels
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source map path
const SOURCE_MAP = join(__dirname, '../../map/0994014.jpg');

// Output directory for punch-outs
const OUTPUT_DIR = join(__dirname, '../public/images/map-textures');

// Output dimensions for web-optimized images
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 800;

/**
 * Neighborhood punch-out regions
 * Coordinates are estimates based on typical 1938 SF map layout
 * Format: { name, x, y, width, height } - crop region in original pixels
 *
 * The 1938 Thomas Bros map layout (oriented North up):
 * - Top edge: Northern waterfront, Presidio, Marina
 * - Right edge: Bay, Embarcadero, waterfront
 * - Bottom edge: Southern neighborhoods, Ocean Beach area
 * - Left edge: Pacific Ocean, Sunset, Richmond
 * - Center: Downtown, Mission, etc.
 */
const PUNCHOUT_REGIONS = [
  {
    name: 'downtown',
    description: 'Downtown / Financial District',
    // Northeast area of map - dense grid pattern
    x: 11000,
    y: 2500,
    width: 3500,
    height: 2400
  },
  {
    name: 'mission',
    description: 'Mission District',
    // East-central area - grid with Mission St diagonal
    x: 10000,
    y: 5500,
    width: 3500,
    height: 2400
  },
  {
    name: 'chinatown',
    description: 'Chinatown / North Beach',
    // Northeast near waterfront
    x: 11500,
    y: 1800,
    width: 3500,
    height: 2400
  },
  {
    name: 'haight',
    description: 'Haight-Ashbury / Cole Valley',
    // Central-west area near Golden Gate Park
    x: 6500,
    y: 5000,
    width: 3500,
    height: 2400
  },
  {
    name: 'marina',
    description: 'Marina / Cow Hollow',
    // North-central waterfront
    x: 8000,
    y: 1000,
    width: 3500,
    height: 2400
  },
  {
    name: 'sunset',
    description: 'Sunset District',
    // Western area - avenues grid
    x: 2500,
    y: 6000,
    width: 3500,
    height: 2400
  },
  {
    name: 'richmond',
    description: 'Richmond District',
    // Northwest area - avenues grid
    x: 2500,
    y: 3000,
    width: 3500,
    height: 2400
  },
  {
    name: 'soma',
    description: 'South of Market (SOMA)',
    // East-central below Market
    x: 11000,
    y: 4000,
    width: 3500,
    height: 2400
  },
  {
    name: 'presidio',
    description: 'Presidio Area',
    // Northwest corner
    x: 4500,
    y: 800,
    width: 3500,
    height: 2400
  },
  {
    name: 'golden-gate-park',
    description: 'Golden Gate Park',
    // Central-west horizontal rectangle
    x: 3000,
    y: 4500,
    width: 4000,
    height: 2400
  }
];

async function createPunchouts() {
  console.log('🗺️  Thomas Bros. Map Punch-out Generator\n');

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  // Load source image metadata
  const metadata = await sharp(SOURCE_MAP).metadata();
  console.log(`📐 Source map: ${metadata.width} x ${metadata.height} pixels\n`);

  // Process each region
  for (const region of PUNCHOUT_REGIONS) {
    console.log(`✂️  Cropping: ${region.description}...`);

    // Ensure crop region is within bounds
    const safeRegion = {
      left: Math.max(0, Math.min(region.x, metadata.width - region.width)),
      top: Math.max(0, Math.min(region.y, metadata.height - region.height)),
      width: Math.min(region.width, metadata.width - region.x),
      height: Math.min(region.height, metadata.height - region.y)
    };

    const outputPath = join(OUTPUT_DIR, `${region.name}.jpg`);

    await sharp(SOURCE_MAP)
      .extract(safeRegion)
      .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 75,
        progressive: true
      })
      .toFile(outputPath);

    // Get output file size
    const outputMeta = await sharp(outputPath).metadata();
    const stats = await import('fs').then(fs => fs.promises.stat(outputPath));

    console.log(`   ✅ ${region.name}.jpg (${Math.round(stats.size / 1024)}KB)`);
  }

  // Also create a manifest for the component to use
  const manifest = {
    source: 'Thomas Bros. Map of San Francisco, 1938',
    attribution: 'David Rumsey Map Collection',
    punchouts: PUNCHOUT_REGIONS.map(r => ({
      name: r.name,
      description: r.description,
      path: `/images/map-textures/${r.name}.jpg`
    }))
  };

  const manifestPath = join(OUTPUT_DIR, 'manifest.json');
  await import('fs').then(fs =>
    fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  );

  console.log(`\n📋 Manifest written to: manifest.json`);
  console.log(`\n🎉 Done! Created ${PUNCHOUT_REGIONS.length} punch-outs.`);
}

createPunchouts().catch(console.error);
