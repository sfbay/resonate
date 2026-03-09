# Phase 1: Data Foundation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the channel taxonomy, campaign_units table, market gating config, and useCurrentUser stub — the data layer everything else sits on.

**Architecture:** Four new database tables (channel_groups, channel_formats, market_channels, campaign_units) plus a unit_templates table for Phase 2. A TypeScript channel registry provides the buyer-facing labels and format/platform/placement mappings. Market gating is config-driven per city. A useCurrentUser() stub hook returns mock user context, ready for Clerk later.

**Tech Stack:** Supabase (PostgreSQL), TypeScript, Next.js App Router, React 19

---

### Task 1: Channel Taxonomy Migration

Create the database tables for channel groups, formats, and market gating.

**Files:**
- Create: `supabase/migrations/20260308000001_create_channel_taxonomy.sql`

**Step 1: Write the migration**

```sql
-- Channel taxonomy for Resonate ad products
-- Three buyer-facing groups: social, display, audio_video
-- Each group contains formats with platform/placement options

-- Channel group enum
CREATE TYPE channel_group AS ENUM ('social', 'display', 'audio_video');

-- Format registry — all possible creative formats
CREATE TABLE channel_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  placements TEXT[] NOT NULL DEFAULT '{}',
  spec JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market channel gating — which groups/formats are available per city
CREATE TABLE market_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL,
  channel_group channel_group NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_formats TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (city_slug, channel_group)
);

-- RLS
ALTER TABLE channel_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read channel_formats" ON channel_formats;
CREATE POLICY "Public read channel_formats" ON channel_formats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read market_channels" ON market_channels;
CREATE POLICY "Public read market_channels" ON market_channels FOR SELECT USING (true);

-- Service role can manage
DROP POLICY IF EXISTS "Service manage channel_formats" ON channel_formats;
CREATE POLICY "Service manage channel_formats" ON channel_formats
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service manage market_channels" ON market_channels;
CREATE POLICY "Service manage market_channels" ON market_channels
  FOR ALL USING (auth.role() = 'service_role');
```

**Step 2: Push the migration**

Run: `npx supabase db push`
Expected: Migration applied successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000001_create_channel_taxonomy.sql
git commit -m "feat: add channel_formats and market_channels tables"
```

---

### Task 2: Seed Channel Formats

Populate the format registry with all formats from the design doc.

**Files:**
- Create: `supabase/migrations/20260308000002_seed_channel_formats.sql`

**Step 1: Write the seed migration**

```sql
-- Seed channel formats
-- Social group
INSERT INTO channel_formats (channel_group, format_key, label, description, platforms, placements, spec, sort_order) VALUES
  ('social', 'static_image', 'Static Image Post', 'Single image for social feeds', ARRAY['instagram','facebook','tiktok'], ARRAY['feed_post','pin'], '{"aspect_ratios":["1:1","4:5","16:9"],"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 1),
  ('social', 'video_reel', 'Video / Reel', 'Short-form video for social feeds', ARRAY['instagram','tiktok','facebook','youtube'], ARRAY['reel','feed_post'], '{"aspect_ratios":["9:16","1:1"],"max_duration_sec":90,"max_file_size_mb":100,"file_types":["mp4","mov"]}', 2),
  ('social', 'story', 'Story', 'Ephemeral story content', ARRAY['instagram','facebook','tiktok'], ARRAY['story'], '{"aspect_ratios":["9:16"],"max_duration_sec":15,"max_file_size_mb":30,"file_types":["jpg","png","mp4","mov"]}', 3),
  ('social', 'carousel', 'Carousel', 'Multi-image swipeable post', ARRAY['instagram','facebook','tiktok'], ARRAY['feed_post'], '{"aspect_ratios":["1:1","4:5"],"max_slides":10,"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 4),
  ('social', 'text_image', 'Text + Image', 'Text post with image attachment', ARRAY['facebook','twitter'], ARRAY['feed_post'], '{"max_text_length":500,"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 5),
  ('social', 'newsletter_mention', 'Newsletter Mention', 'Sponsored mention within newsletter', ARRAY['mailchimp','substack'], ARRAY['mention','sponsored_section'], '{"max_text_length":300,"image_optional":true,"file_types":["jpg","png","html"]}', 6),
  ('social', 'newsletter_dedicated', 'Dedicated Newsletter Send', 'Full sponsored newsletter send', ARRAY['mailchimp','substack'], ARRAY['dedicated_send'], '{"html_supported":true,"max_file_size_mb":5,"file_types":["html","jpg","png"]}', 7),
  ('social', 'messaging_broadcast', 'Messaging Broadcast', 'Sponsored message to community channels', ARRAY['whatsapp','telegram','signal','discord'], ARRAY['broadcast','channel_post','group_post'], '{"max_text_length":1000,"image_optional":true,"max_file_size_mb":5,"file_types":["jpg","png","mp4"]}', 8),

  -- Display group
  ('display', 'banner_ad', 'Banner Ad (IAB)', 'Standard IAB display banner', ARRAY['website'], ARRAY['leaderboard','sidebar','interstitial','sticky_footer'], '{"sizes":{"leaderboard":"728x90","sidebar":"300x250","interstitial":"320x480","sticky_footer":"320x50"},"file_types":["jpg","png","gif","html5"],"max_file_size_mb":2}', 1),
  ('display', 'sponsored_article', 'Sponsored Article', 'Publisher writes article in their voice from brand brief', ARRAY['website'], ARRAY['article','advertorial','listicle'], '{"brief_required":true,"brand_assets_optional":true}', 2),

  -- Audio/Video group
  ('audio_video', 'podcast_clip', 'Podcast Audio Clip', 'Pre-produced audio ad for podcast insertion', ARRAY['spotify','apple_podcasts','publisher_feed'], ARRAY['pre_roll','mid_roll','sponsored_segment'], '{"max_duration_sec":60,"file_types":["mp3","wav","m4a"],"max_file_size_mb":20}', 1),
  ('audio_video', 'podcast_script', 'Podcast Talent Read', 'Script/talking points for host-read sponsorship', ARRAY['spotify','apple_podcasts','publisher_feed'], ARRAY['mid_roll','sponsored_segment','talent_read'], '{"script_required":true,"talking_points":true}', 2),
  ('audio_video', 'video_produced', 'Produced Video', 'Long-form or produced video content', ARRAY['youtube','website'], ARRAY['pre_roll','sponsored_content','integration'], '{"aspect_ratios":["16:9","9:16"],"max_file_size_mb":500,"file_types":["mp4","mov"]}', 3);

-- Seed market channels (SF and Chicago)
-- SF: social + audio_video enabled, display disabled (coalition partner covers)
-- Chicago: all enabled
INSERT INTO market_channels (city_slug, channel_group, enabled) VALUES
  ('sf', 'social', true),
  ('sf', 'display', false),
  ('sf', 'audio_video', true),
  ('chicago', 'social', true),
  ('chicago', 'display', true),
  ('chicago', 'audio_video', true);
```

**Step 2: Push the migration**

Run: `npx supabase db push`
Expected: 13 channel_formats rows and 6 market_channels rows inserted.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000002_seed_channel_formats.sql
git commit -m "feat: seed channel formats and market channel config for SF/Chicago"
```

---

### Task 3: Campaign Units Migration

Create the `campaign_units` table — the atomic deliverable that connects campaigns to publishers.

**Files:**
- Create: `supabase/migrations/20260308000003_create_campaign_units.sql`

**Step 1: Write the migration**

```sql
-- Campaign units — the atomic deliverable
-- One unit = one thing a publisher produces

CREATE TYPE unit_status AS ENUM (
  'draft',
  'ready',
  'sent',
  'pending_publisher',
  'accepted',
  'revision_requested',
  'rejected',
  'in_production',
  'delivered'
);

CREATE TYPE creative_tier AS ENUM (
  'upload',
  'free_template',
  'premium_template',
  'assisted'
);

CREATE TABLE campaign_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id),
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL REFERENCES channel_formats(format_key),
  platform TEXT NOT NULL,
  placement TEXT NOT NULL,
  status unit_status NOT NULL DEFAULT 'draft',
  tier creative_tier NOT NULL DEFAULT 'upload',

  -- Creative content
  creative_assets JSONB NOT NULL DEFAULT '{}',
  -- Expected shape:
  -- {
  --   "files": [{"url": "...", "filename": "...", "mime_type": "...", "width": N, "height": N}],
  --   "headline": "...",
  --   "body_text": "...",
  --   "cta_text": "...",
  --   "cta_url": "...",
  --   "hashtags": ["..."],
  --   "mentions": ["..."],
  --   "tracking_pixel_url": "...",
  --   "click_through_url": "..."
  -- }

  -- Compliance
  compliance_notes TEXT,

  -- Publisher feedback (for revision_requested status)
  revision_feedback TEXT,

  -- Delivery proof
  proof JSONB,
  -- Expected shape:
  -- {
  --   "post_url": "...",
  --   "screenshot_url": "...",
  --   "metrics": {"impressions": N, "reach": N, "engagement": N, "clicks": N}
  -- }

  -- Scheduling
  deadline TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Financials
  payout_cents INT NOT NULL DEFAULT 0,

  -- Template reference (if built from template)
  template_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_campaign_units_campaign ON campaign_units(campaign_id);
CREATE INDEX idx_campaign_units_publisher ON campaign_units(publisher_id);
CREATE INDEX idx_campaign_units_status ON campaign_units(status);

-- RLS
ALTER TABLE campaign_units ENABLE ROW LEVEL SECURITY;

-- Demo mode: public read/insert/update
DROP POLICY IF EXISTS "Public read campaign_units" ON campaign_units;
CREATE POLICY "Public read campaign_units" ON campaign_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert campaign_units" ON campaign_units;
CREATE POLICY "Public insert campaign_units" ON campaign_units FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update campaign_units" ON campaign_units;
CREATE POLICY "Public update campaign_units" ON campaign_units FOR UPDATE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_campaign_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_units_updated_at
  BEFORE UPDATE ON campaign_units
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_units_updated_at();
```

**Step 2: Push the migration**

Run: `npx supabase db push`
Expected: Table created with indexes, RLS policies, and trigger.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000003_create_campaign_units.sql
git commit -m "feat: add campaign_units table with status lifecycle and creative assets"
```

---

### Task 4: Unit Templates Table

Create the `unit_templates` table for the template library (Phase 2 will populate it, but the schema goes in now).

**Files:**
- Create: `supabase/migrations/20260308000004_create_unit_templates.sql`

**Step 1: Write the migration**

```sql
-- Unit templates — reusable creative templates for the unit builder

CREATE TYPE template_tier AS ENUM ('free', 'premium');

CREATE TABLE unit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL REFERENCES channel_formats(format_key),
  tier template_tier NOT NULL DEFAULT 'free',
  category TEXT NOT NULL DEFAULT 'general',
  -- Categories: general, government, event, health, education, business, nonprofit, seasonal
  template_data JSONB NOT NULL DEFAULT '{}',
  -- Expected shape:
  -- {
  --   "layout": "centered|split|overlay|minimal",
  --   "default_styles": {"bg_color": "#...", "text_color": "#...", "accent_color": "#..."},
  --   "placeholder_content": {"headline": "...", "body": "...", "cta": "..."},
  --   "asset_slots": [{"name": "hero_image", "required": true, "aspect_ratio": "1:1"}]
  -- }
  thumbnail_url TEXT,
  preview_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_unit_templates_group ON unit_templates(channel_group);
CREATE INDEX idx_unit_templates_format ON unit_templates(format_key);
CREATE INDEX idx_unit_templates_tier ON unit_templates(tier);

-- RLS
ALTER TABLE unit_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read unit_templates" ON unit_templates;
CREATE POLICY "Public read unit_templates" ON unit_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service manage unit_templates" ON unit_templates;
CREATE POLICY "Service manage unit_templates" ON unit_templates
  FOR ALL USING (auth.role() = 'service_role');
```

**Step 2: Push the migration**

Run: `npx supabase db push`
Expected: Table created with indexes and RLS.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000004_create_unit_templates.sql
git commit -m "feat: add unit_templates table for creative template library"
```

---

### Task 5: TypeScript Channel Registry

Create the TypeScript types and constants that map buyer-facing labels to the format/platform/placement model. This is the single source of truth for the UI.

**Files:**
- Create: `src/lib/channels/index.ts`
- Create: `src/lib/channels/types.ts`

**Step 1: Write the types**

Create `src/lib/channels/types.ts`:

```typescript
// Channel taxonomy types
// Buyer-facing groups map to format → platform → placement underneath

export type ChannelGroup = 'social' | 'display' | 'audio_video';

export interface ChannelGroupConfig {
  key: ChannelGroup;
  label: string;
  description: string;
  icon: string; // Heroicon name
}

export interface ChannelFormat {
  formatKey: string;
  channelGroup: ChannelGroup;
  label: string;
  description: string;
  platforms: string[];
  placements: string[];
  spec: FormatSpec;
  sortOrder: number;
}

export interface FormatSpec {
  aspectRatios?: string[];
  maxDurationSec?: number;
  maxFileSizeMb?: number;
  maxSlides?: number;
  maxTextLength?: number;
  fileTypes?: string[];
  sizes?: Record<string, string>; // placement → dimensions for IAB
  htmlSupported?: boolean;
  imageOptional?: boolean;
  briefRequired?: boolean;
  brandAssetsOptional?: boolean;
  scriptRequired?: boolean;
  talkingPoints?: boolean;
}

export type UnitStatus =
  | 'draft'
  | 'ready'
  | 'sent'
  | 'pending_publisher'
  | 'accepted'
  | 'revision_requested'
  | 'rejected'
  | 'in_production'
  | 'delivered';

export type CreativeTier = 'upload' | 'free_template' | 'premium_template' | 'assisted';

export interface CreativeAssets {
  files?: {
    url: string;
    filename: string;
    mimeType: string;
    width?: number;
    height?: number;
  }[];
  headline?: string;
  bodyText?: string;
  ctaText?: string;
  ctaUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  trackingPixelUrl?: string;
  clickThroughUrl?: string;
}

export interface DeliveryProof {
  postUrl?: string;
  screenshotUrl?: string;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
}

export interface CampaignUnit {
  id: string;
  campaignId: string;
  publisherId: string;
  channelGroup: ChannelGroup;
  formatKey: string;
  platform: string;
  placement: string;
  status: UnitStatus;
  tier: CreativeTier;
  creativeAssets: CreativeAssets;
  complianceNotes?: string;
  revisionFeedback?: string;
  proof?: DeliveryProof;
  deadline?: string;
  deliveredAt?: string;
  payoutCents: number;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketChannelConfig {
  citySlug: string;
  channelGroup: ChannelGroup;
  enabled: boolean;
  disabledFormats: string[];
}
```

**Step 2: Write the channel registry**

Create `src/lib/channels/index.ts`:

```typescript
import type { ChannelGroupConfig, ChannelGroup } from './types';

export type { ChannelGroup, ChannelFormat, FormatSpec, UnitStatus, CreativeTier, CreativeAssets, DeliveryProof, CampaignUnit, MarketChannelConfig } from './types';
export { CHANNEL_GROUPS, CHANNEL_GROUP_LABELS, getChannelGroupConfig, UNIT_STATUS_LABELS, COMPLIANCE_DEFAULTS } from './registry';

// Re-export for convenience
export { ChannelGroupConfig };
```

Wait — let me keep this simpler. Single file with types and constants together, split if it grows.

Create `src/lib/channels/index.ts`:

```typescript
import type { ChannelGroupConfig } from './types';
export * from './types';

// Buyer-facing group configuration
export const CHANNEL_GROUPS: ChannelGroupConfig[] = [
  {
    key: 'social',
    label: 'Social Advertising',
    description: 'Reach communities through their trusted voices — social media, newsletters, and messaging',
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    key: 'display',
    label: 'Display & Sponsored',
    description: 'Banner ads and sponsored content on local news websites',
    icon: 'ComputerDesktopIcon',
  },
  {
    key: 'audio_video',
    label: 'Audio & Video',
    description: 'Podcast sponsorships, video integrations, and rich media content',
    icon: 'PlayCircleIcon',
  },
];

// Status display labels
export const UNIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'gray' },
  ready: { label: 'Ready', color: 'blue' },
  sent: { label: 'Sent', color: 'blue' },
  pending_publisher: { label: 'Pending Review', color: 'yellow' },
  accepted: { label: 'Accepted', color: 'green' },
  revision_requested: { label: 'Revision Requested', color: 'orange' },
  rejected: { label: 'Rejected', color: 'red' },
  in_production: { label: 'In Production', color: 'purple' },
  delivered: { label: 'Delivered', color: 'green' },
};

// Per-platform compliance defaults
export const COMPLIANCE_DEFAULTS: Record<string, string> = {
  instagram: 'Use "Paid Partnership" tag. Disclose sponsorship in caption.',
  tiktok: 'Enable "Branded Content" toggle. Include #ad or #sponsored.',
  facebook: 'Use Branded Content tool. Mark as "Paid Partnership."',
  youtube: 'Check "includes paid promotion" in video details. Verbal disclosure required.',
  spotify: 'FTC disclosure: "This episode is sponsored by..." at segment start.',
  apple_podcasts: 'FTC disclosure: "This episode is sponsored by..." at segment start.',
  mailchimp: 'Mark as "Advertisement" or "Sponsored" per CAN-SPAM.',
  substack: 'Label as "Sponsored" in subject line or header.',
  whatsapp: 'Include "Sponsored" label at start of message.',
  telegram: 'Include "Sponsored" or "Ad" label.',
  website: 'Label as "Sponsored Content" or "Advertisement" per FTC guidelines.',
};

// Helper: get group config by key
export function getChannelGroupConfig(key: ChannelGroup): ChannelGroupConfig | undefined {
  return CHANNEL_GROUPS.find(g => g.key === key);
}
```

**Step 3: Commit**

```bash
git add src/lib/channels/types.ts src/lib/channels/index.ts
git commit -m "feat: add TypeScript channel taxonomy with types, constants, and compliance defaults"
```

---

### Task 6: Channel Data Fetching Utilities

Create server-side utilities to fetch channel formats and market config from Supabase.

**Files:**
- Create: `src/lib/channels/queries.ts`

**Step 1: Write the queries**

```typescript
import { getSupabaseClient } from '@/lib/db/supabase';
import type { ChannelFormat, ChannelGroup, MarketChannelConfig } from './types';

// Fetch all channel formats
export async function getChannelFormats(): Promise<ChannelFormat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('channel_formats')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch channel formats: ${error.message}`);

  return (data || []).map((row: any) => ({
    formatKey: row.format_key,
    channelGroup: row.channel_group as ChannelGroup,
    label: row.label,
    description: row.description,
    platforms: row.platforms,
    placements: row.placements,
    spec: row.spec,
    sortOrder: row.sort_order,
  }));
}

// Fetch formats for a specific channel group
export async function getChannelFormatsByGroup(group: ChannelGroup): Promise<ChannelFormat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('channel_formats')
    .select('*')
    .eq('channel_group', group)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch channel formats: ${error.message}`);

  return (data || []).map((row: any) => ({
    formatKey: row.format_key,
    channelGroup: row.channel_group as ChannelGroup,
    label: row.label,
    description: row.description,
    platforms: row.platforms,
    placements: row.placements,
    spec: row.spec,
    sortOrder: row.sort_order,
  }));
}

// Fetch market channel config for a city
export async function getMarketChannels(citySlug: string): Promise<MarketChannelConfig[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('market_channels')
    .select('*')
    .eq('city_slug', citySlug);

  if (error) throw new Error(`Failed to fetch market channels: ${error.message}`);

  return (data || []).map((row: any) => ({
    citySlug: row.city_slug,
    channelGroup: row.channel_group as ChannelGroup,
    enabled: row.enabled,
    disabledFormats: row.disabled_formats || [],
  }));
}

// Get enabled channel groups for a city
export async function getEnabledChannelGroups(citySlug: string): Promise<ChannelGroup[]> {
  const configs = await getMarketChannels(citySlug);
  return configs
    .filter(c => c.enabled)
    .map(c => c.channelGroup);
}

// Get available formats for a city (respects market gating)
export async function getAvailableFormats(citySlug: string): Promise<ChannelFormat[]> {
  const [formats, marketConfigs] = await Promise.all([
    getChannelFormats(),
    getMarketChannels(citySlug),
  ]);

  const enabledGroups = new Set(
    marketConfigs.filter(c => c.enabled).map(c => c.channelGroup)
  );
  const disabledFormats = new Set(
    marketConfigs.flatMap(c => c.disabledFormats)
  );

  return formats.filter(f =>
    enabledGroups.has(f.channelGroup) && !disabledFormats.has(f.formatKey)
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/channels/queries.ts
git commit -m "feat: add channel format and market config query utilities"
```

---

### Task 7: Campaign Units API — CRUD

Create the API routes for managing campaign units.

**Files:**
- Create: `src/app/api/campaigns/[id]/units/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import type { UnitStatus } from '@/lib/channels/types';

// GET /api/campaigns/[id]/units — list units for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/campaigns/[id]/units — create a unit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const body = await request.json();
  const supabase = getSupabaseClient();

  const {
    publisherId,
    channelGroup,
    formatKey,
    platform,
    placement,
    tier = 'upload',
    creativeAssets = {},
    complianceNotes,
    deadline,
    payoutCents = 0,
    templateId,
  } = body;

  if (!publisherId || !channelGroup || !formatKey || !platform || !placement) {
    return NextResponse.json(
      { error: 'publisherId, channelGroup, formatKey, platform, and placement are required' },
      { status: 400 }
    );
  }

  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .insert({
      campaign_id: campaignId,
      publisher_id: publisherId,
      channel_group: channelGroup,
      format_key: formatKey,
      platform,
      placement,
      tier,
      creative_assets: creativeAssets,
      compliance_notes: complianceNotes,
      deadline,
      payout_cents: payoutCents,
      template_id: templateId,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

**Step 2: Create the single-unit route for updates**

Create `src/app/api/campaigns/[id]/units/[unitId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';

// GET /api/campaigns/[id]/units/[unitId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/campaigns/[id]/units/[unitId] — update a unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const body = await request.json();
  const supabase = getSupabaseClient();

  // Map camelCase body to snake_case columns
  const updates: Record<string, any> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.tier !== undefined) updates.tier = body.tier;
  if (body.creativeAssets !== undefined) updates.creative_assets = body.creativeAssets;
  if (body.complianceNotes !== undefined) updates.compliance_notes = body.complianceNotes;
  if (body.revisionFeedback !== undefined) updates.revision_feedback = body.revisionFeedback;
  if (body.proof !== undefined) updates.proof = body.proof;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.deliveredAt !== undefined) updates.delivered_at = body.deliveredAt;
  if (body.payoutCents !== undefined) updates.payout_cents = body.payoutCents;
  if (body.templateId !== undefined) updates.template_id = body.templateId;
  if (body.platform !== undefined) updates.platform = body.platform;
  if (body.placement !== undefined) updates.placement = body.placement;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .update(updates)
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/campaigns/[id]/units/[unitId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  const { error } = await (supabase as any)
    .from('campaign_units')
    .delete()
    .eq('id', unitId)
    .eq('campaign_id', campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/campaigns/[id]/units/route.ts src/app/api/campaigns/[id]/units/[unitId]/route.ts
git commit -m "feat: add campaign units CRUD API routes"
```

---

### Task 8: Market Channels API

Create an API route to fetch available channels/formats for a city.

**Files:**
- Create: `src/app/api/channels/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAvailableFormats, getEnabledChannelGroups } from '@/lib/channels/queries';
import { CHANNEL_GROUPS } from '@/lib/channels';
import type { ChannelGroup } from '@/lib/channels/types';

// GET /api/channels?city=sf
export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get('city') || 'sf';

  try {
    const [enabledGroups, availableFormats] = await Promise.all([
      getEnabledChannelGroups(citySlug),
      getAvailableFormats(citySlug),
    ]);

    const enabledSet = new Set(enabledGroups);

    const groups = CHANNEL_GROUPS
      .filter(g => enabledSet.has(g.key))
      .map(g => ({
        ...g,
        formats: availableFormats.filter(f => f.channelGroup === g.key),
      }));

    return NextResponse.json({ citySlug, groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/channels/route.ts
git commit -m "feat: add channels API with market gating per city"
```

---

### Task 9: useCurrentUser Stub Hook

Create the auth stub that returns mock user context. This will be swapped for Clerk later.

**Files:**
- Create: `src/lib/auth/index.ts`

**Step 1: Write the stub**

```typescript
'use client';

import { useMemo } from 'react';

export type OrgType = 'publisher' | 'government' | 'advertiser';
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  orgName: string;
  orgType: OrgType;
  role: UserRole;
}

// Stub: returns a mock user
// TODO: Replace with Clerk integration in Phase 4
// When Clerk is integrated, this hook will read from ClerkProvider context
// and map Clerk's user/org to this interface. No component changes needed.
const MOCK_USER: CurrentUser = {
  userId: 'mock-user-001',
  email: 'demo@resonatelocal.org',
  name: 'Demo User',
  orgId: 'mock-org-001',
  orgName: 'Demo Organization',
  orgType: 'government',
  role: 'admin',
};

export function useCurrentUser(): CurrentUser {
  return useMemo(() => MOCK_USER, []);
}

export function useCurrentUserOptional(): CurrentUser | null {
  return useMemo(() => MOCK_USER, []);
}

// Helper to check permissions
export function canManageCampaigns(user: CurrentUser): boolean {
  return user.orgType === 'government' || user.orgType === 'advertiser';
}

export function canManagePublisher(user: CurrentUser): boolean {
  return user.orgType === 'publisher';
}

export function canReviewUnits(user: CurrentUser): boolean {
  return user.orgType === 'publisher' && (user.role === 'admin' || user.role === 'editor');
}
```

**Step 2: Commit**

```bash
git add src/lib/auth/index.ts
git commit -m "feat: add useCurrentUser stub hook for auth-aware development"
```

---

### Task 10: Update TypeScript DB Types

Add the new table types to the existing type system so the rest of the codebase can reference them.

**Files:**
- Modify: `src/lib/db/types.ts`

**Step 1: Read current types file**

Run: Read `src/lib/db/types.ts` to find the right insertion point (after existing type definitions).

**Step 2: Add new types at the end of the file**

Append to `src/lib/db/types.ts`:

```typescript
// Channel taxonomy types (tables: channel_formats, market_channels, campaign_units, unit_templates)

export type DbChannelGroup = 'social' | 'display' | 'audio_video';

export type DbUnitStatus =
  | 'draft'
  | 'ready'
  | 'sent'
  | 'pending_publisher'
  | 'accepted'
  | 'revision_requested'
  | 'rejected'
  | 'in_production'
  | 'delivered';

export type DbCreativeTier = 'upload' | 'free_template' | 'premium_template' | 'assisted';

export type DbTemplateTier = 'free' | 'premium';

export interface DbChannelFormat {
  id: string;
  channel_group: DbChannelGroup;
  format_key: string;
  label: string;
  description: string | null;
  platforms: string[];
  placements: string[];
  spec: Record<string, any>;
  sort_order: number;
  created_at: string;
}

export interface DbMarketChannel {
  id: string;
  city_slug: string;
  channel_group: DbChannelGroup;
  enabled: boolean;
  disabled_formats: string[];
  created_at: string;
}

export interface DbCampaignUnit {
  id: string;
  campaign_id: string;
  publisher_id: string;
  channel_group: DbChannelGroup;
  format_key: string;
  platform: string;
  placement: string;
  status: DbUnitStatus;
  tier: DbCreativeTier;
  creative_assets: Record<string, any>;
  compliance_notes: string | null;
  revision_feedback: string | null;
  proof: Record<string, any> | null;
  deadline: string | null;
  delivered_at: string | null;
  payout_cents: number;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUnitTemplate {
  id: string;
  name: string;
  channel_group: DbChannelGroup;
  format_key: string;
  tier: DbTemplateTier;
  category: string;
  template_data: Record<string, any>;
  thumbnail_url: string | null;
  preview_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
```

**Step 3: Commit**

```bash
git add src/lib/db/types.ts
git commit -m "feat: add DB types for channel formats, market channels, campaign units, and templates"
```

---

### Task 11: Verification

Verify everything works together.

**Step 1: Build check**

Run: `npx next build`
Expected: Build succeeds with no type errors related to new files.

**Step 2: API smoke test**

Run the dev server and test:

```bash
# Fetch available channels for SF (display should be disabled)
curl http://localhost:3002/api/channels?city=sf | jq '.groups | length'
# Expected: 2 (social + audio_video)

# Fetch available channels for Chicago (all enabled)
curl http://localhost:3002/api/channels?city=chicago | jq '.groups | length'
# Expected: 3 (social + display + audio_video)
```

**Step 3: Verify market gating**

```bash
# SF should NOT have banner_ad format
curl http://localhost:3002/api/channels?city=sf | jq '[.groups[].formats[].formatKey] | contains(["banner_ad"])'
# Expected: false

# Chicago should have banner_ad format
curl http://localhost:3002/api/channels?city=chicago | jq '[.groups[].formats[].formatKey] | contains(["banner_ad"])'
# Expected: true
```

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: Phase 1 verification fixes"
```

**Step 5: Push**

```bash
git push origin main
```

---

## Summary

| Task | What it creates | Depends on |
|------|----------------|------------|
| 1 | `channel_formats` + `market_channels` tables | — |
| 2 | Seed data (13 formats, 6 market configs) | Task 1 |
| 3 | `campaign_units` table | Task 1 |
| 4 | `unit_templates` table | Task 1 |
| 5 | TypeScript channel types + constants | — |
| 6 | Supabase query utilities | Tasks 1-2, 5 |
| 7 | Campaign units CRUD API | Tasks 1, 3, 5 |
| 8 | Channels API with market gating | Tasks 1-2, 5-6 |
| 9 | `useCurrentUser()` stub hook | — |
| 10 | DB types for new tables | — |
| 11 | Build + API verification | All above |
