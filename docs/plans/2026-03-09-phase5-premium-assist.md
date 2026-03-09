# Phase 5: Premium Templates, AI Assist & Performance Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a template library with picker UI to the unit builder, AI-assisted creative generation (copy + template recommendation), and per-unit performance tracking with UTM links and publisher-reported metrics.

**Architecture:** Three layers. Layer 1 seeds templates into `unit_templates`, builds a template browsing/selection UI in CreativeEditor, and adds a live preview panel. Layer 2 adds an AI generation endpoint and "Assist" mode using the existing multi-provider AI factory. Layer 3 adds tracked link generation, expands the publisher delivery form with metrics fields, and builds a campaign performance dashboard.

**Tech Stack:** Next.js App Router, Supabase, existing AI provider factory (`src/lib/ai/`), Tailwind CSS

**Design doc:** `docs/plans/2026-03-09-phase5-premium-assist-design.md`

---

## Layer 1: Template Library + Picker

### Task 1: Seed Unit Templates

**Files:**
- Create: `supabase/migrations/20260309000003_seed_unit_templates.sql`

**Context:** The `unit_templates` table was created in Phase 1 (migration `20260308000004`). It has columns: `id`, `name`, `channel_group`, `format_key`, `tier` (free/premium), `category`, `template_data` (JSONB), `thumbnail_url`, `preview_url`, `sort_order`, `is_active`. We need to seed it with starter templates.

The `template_data` JSONB schema for static templates:
```json
{
  "baseImageUrl": "https://...",
  "textFields": [
    { "key": "headline", "label": "Headline", "x": 20, "y": 40, "fontSize": 24, "color": "#ffffff", "maxWidth": 280 },
    { "key": "body", "label": "Body", "x": 20, "y": 100, "fontSize": 14, "color": "#f0f0f0", "maxWidth": 280 }
  ],
  "logoArea": { "x": 20, "y": 280, "width": 60, "height": 60 },
  "colorScheme": { "primary": "#0d9488", "secondary": "#f0fdfa" }
}
```

**Step 1: Write the seed migration**

Create `supabase/migrations/20260309000003_seed_unit_templates.sql`:

```sql
-- Seed unit templates for the template library
-- Static templates: baseImageUrl + text overlay definitions
-- Categories: general, government, health, events, community

-- =============================================================================
-- SOCIAL: static_image templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Bold Statement',
  'social', 'static_image', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/bold-statement.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 320, "fontSize": 32, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 380, "fontSize": 16, "color": "#e2e8f0", "maxWidth": 560}], "logoArea": {"x": 40, "y": 520, "width": 48, "height": 48}, "colorScheme": {"primary": "#1e293b", "secondary": "#f8fafc"}}',
  '/templates/social/bold-statement-thumb.png'
),
(
  'Community Spotlight',
  'social', 'static_image', 'free', 'community', 2,
  '{"baseImageUrl": "/templates/social/community-spotlight.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 60, "fontSize": 28, "color": "#0f172a", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 120, "fontSize": 15, "color": "#475569", "maxWidth": 560}], "logoArea": {"x": 480, "y": 520, "width": 48, "height": 48}, "colorScheme": {"primary": "#0d9488", "secondary": "#f0fdfa"}}',
  '/templates/social/community-spotlight-thumb.png'
),
(
  'Government Notice',
  'social', 'static_image', 'free', 'government', 3,
  '{"baseImageUrl": "/templates/social/gov-notice.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 280, "fontSize": 26, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 340, "fontSize": 14, "color": "#cbd5e1", "maxWidth": 560}], "logoArea": {"x": 40, "y": 40, "width": 64, "height": 64}, "colorScheme": {"primary": "#1e40af", "secondary": "#dbeafe"}}',
  '/templates/social/gov-notice-thumb.png'
),
(
  'Health Alert',
  'social', 'static_image', 'premium', 'health', 4,
  '{"baseImageUrl": "/templates/social/health-alert.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 60, "fontSize": 30, "color": "#065f46", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 130, "fontSize": 15, "color": "#047857", "maxWidth": 560}], "logoArea": {"x": 480, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#065f46", "secondary": "#d1fae5"}}',
  '/templates/social/health-alert-thumb.png'
),
(
  'Event Promo',
  'social', 'static_image', 'premium', 'events', 5,
  '{"baseImageUrl": "/templates/social/event-promo.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 360, "fontSize": 28, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 420, "fontSize": 14, "color": "#fde68a", "maxWidth": 560}], "logoArea": {"x": 40, "y": 500, "width": 48, "height": 48}, "colorScheme": {"primary": "#d97706", "secondary": "#fffbeb"}}',
  '/templates/social/event-promo-thumb.png'
);

-- =============================================================================
-- SOCIAL: story templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Story Announcement',
  'social', 'story', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/story-announcement.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 480, "fontSize": 28, "color": "#ffffff", "maxWidth": 340}, {"key": "body", "label": "Body", "x": 40, "y": 540, "fontSize": 14, "color": "#e2e8f0", "maxWidth": 340}], "logoArea": {"x": 40, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#7c3aed", "secondary": "#f5f3ff"}}',
  '/templates/social/story-announcement-thumb.png'
),
(
  'Story CTA',
  'social', 'story', 'free', 'general', 2,
  '{"baseImageUrl": "/templates/social/story-cta.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 520, "fontSize": 24, "color": "#ffffff", "maxWidth": 340}, {"key": "body", "label": "Swipe Up Text", "x": 40, "y": 580, "fontSize": 16, "color": "#fbbf24", "maxWidth": 340}], "logoArea": {"x": 300, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#0d9488", "secondary": "#f0fdfa"}}',
  '/templates/social/story-cta-thumb.png'
),
(
  'Story Health',
  'social', 'story', 'premium', 'health', 3,
  '{"baseImageUrl": "/templates/social/story-health.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 200, "fontSize": 26, "color": "#065f46", "maxWidth": 340}, {"key": "body", "label": "Body", "x": 40, "y": 260, "fontSize": 14, "color": "#047857", "maxWidth": 340}], "logoArea": {"x": 40, "y": 560, "width": 48, "height": 48}, "colorScheme": {"primary": "#065f46", "secondary": "#d1fae5"}}',
  '/templates/social/story-health-thumb.png'
);

-- =============================================================================
-- DISPLAY: banner_ad templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Clean Banner',
  'display', 'banner_ad', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/display/clean-banner.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 30, "fontSize": 18, "color": "#0f172a", "maxWidth": 260}, {"key": "body", "label": "CTA", "x": 20, "y": 60, "fontSize": 12, "color": "#0d9488", "maxWidth": 260}], "logoArea": {"x": 220, "y": 180, "width": 60, "height": 40}, "colorScheme": {"primary": "#0d9488", "secondary": "#ffffff"}}',
  '/templates/display/clean-banner-thumb.png'
),
(
  'Government Banner',
  'display', 'banner_ad', 'free', 'government', 2,
  '{"baseImageUrl": "/templates/display/gov-banner.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 20, "fontSize": 16, "color": "#ffffff", "maxWidth": 260}, {"key": "body", "label": "Subtitle", "x": 20, "y": 50, "fontSize": 11, "color": "#bfdbfe", "maxWidth": 260}], "logoArea": {"x": 20, "y": 180, "width": 60, "height": 40}, "colorScheme": {"primary": "#1e3a5f", "secondary": "#dbeafe"}}',
  '/templates/display/gov-banner-thumb.png'
),
(
  'Premium Display',
  'display', 'banner_ad', 'premium', 'general', 3,
  '{"baseImageUrl": "/templates/display/premium-display.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 40, "fontSize": 20, "color": "#0f172a", "maxWidth": 260}, {"key": "body", "label": "Body", "x": 20, "y": 75, "fontSize": 11, "color": "#64748b", "maxWidth": 260}], "logoArea": {"x": 200, "y": 10, "width": 80, "height": 30}, "colorScheme": {"primary": "#0f172a", "secondary": "#f1f5f9"}}',
  '/templates/display/premium-display-thumb.png'
);

-- =============================================================================
-- SOCIAL: newsletter templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Newsletter Block',
  'social', 'newsletter_mention', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/newsletter-block.png", "textFields": [{"key": "headline", "label": "Headline", "x": 24, "y": 24, "fontSize": 20, "color": "#0f172a", "maxWidth": 500}, {"key": "body", "label": "Body", "x": 24, "y": 64, "fontSize": 14, "color": "#475569", "maxWidth": 500}], "logoArea": {"x": 440, "y": 140, "width": 80, "height": 40}, "colorScheme": {"primary": "#0d9488", "secondary": "#f8fafc"}}',
  '/templates/social/newsletter-block-thumb.png'
),
(
  'Newsletter Premium',
  'social', 'newsletter_mention', 'premium', 'general', 2,
  '{"baseImageUrl": "/templates/social/newsletter-premium.png", "textFields": [{"key": "headline", "label": "Headline", "x": 24, "y": 24, "fontSize": 22, "color": "#1e293b", "maxWidth": 500}, {"key": "body", "label": "Body", "x": 24, "y": 64, "fontSize": 14, "color": "#334155", "maxWidth": 500}], "logoArea": {"x": 24, "y": 140, "width": 80, "height": 40}, "colorScheme": {"primary": "#7c3aed", "secondary": "#faf5ff"}}',
  '/templates/social/newsletter-premium-thumb.png'
);
```

**Step 2: Push migration**

Run:
```bash
npx supabase db push
```
Expected: Migration applies successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260309000003_seed_unit_templates.sql
git commit -m "feat: seed unit templates library (13 templates across social, display, newsletter)"
```

---

### Task 2: Templates API Endpoint

**Files:**
- Create: `src/app/api/templates/route.ts`

**Context:** The template picker needs to fetch templates filtered by format_key and/or channel_group. This endpoint returns templates from the `unit_templates` table.

**Step 1: Create the API route**

Create `src/app/api/templates/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';

// GET /api/templates?format=static_image&group=social
export async function GET(request: NextRequest) {
  const formatKey = request.nextUrl.searchParams.get('format');
  const group = request.nextUrl.searchParams.get('group');
  const category = request.nextUrl.searchParams.get('category');

  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('unit_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (formatKey) query = query.eq('format_key', formatKey);
  if (group) query = query.eq('channel_group', group);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    templates: (data || []).map((t: Record<string, unknown>) => ({
      id: t.id,
      name: t.name,
      channelGroup: t.channel_group,
      formatKey: t.format_key,
      tier: t.tier,
      category: t.category,
      templateData: t.template_data,
      thumbnailUrl: t.thumbnail_url,
      previewUrl: t.preview_url,
    })),
  });
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/templates/route.ts
git commit -m "feat: add templates API endpoint with format/group/category filters"
```

---

### Task 3: Template Picker Component

**Files:**
- Create: `src/components/government/unit-builder/TemplatePicker.tsx`

**Context:** Grid of template cards filtered by current format. Shows thumbnail, name, tier badge. Clicking selects a template and loads its data into the creative editor.

**Step 1: Create the TemplatePicker**

Create `src/components/government/unit-builder/TemplatePicker.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  channelGroup: string;
  formatKey: string;
  tier: 'free' | 'premium';
  category: string;
  templateData: {
    baseImageUrl: string;
    textFields: { key: string; label: string; x: number; y: number; fontSize: number; color: string; maxWidth: number }[];
    logoArea: { x: number; y: number; width: number; height: number };
    colorScheme: { primary: string; secondary: string };
  };
  thumbnailUrl: string;
}

interface TemplatePickerProps {
  formatKey: string;
  channelGroup: string;
  selectedTemplateId: string | null;
  onTemplateSelect: (template: Template) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  government: 'Government',
  health: 'Health',
  events: 'Events',
  community: 'Community',
};

export function TemplatePicker({
  formatKey,
  channelGroup,
  selectedTemplateId,
  onTemplateSelect,
}: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/templates?format=${formatKey}&group=${channelGroup}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [formatKey, channelGroup]);

  const categories = [...new Set(templates.map(t => t.category))];
  const filtered = filterCategory
    ? templates.filter(t => t.category === filterCategory)
    : templates;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No templates available for this format yet.</p>
        <p className="text-xs mt-1">Use the Upload tab to add your own creative.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              !filterCategory ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                filterCategory === cat ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(template => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-teal-500 shadow-md ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100 relative">
                {template.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: template.templateData.colorScheme.secondary }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: template.templateData.colorScheme.primary }}
                    >
                      {template.name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Tier badge */}
                {template.tier === 'premium' && (
                  <span className="absolute top-2 right-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              {/* Name + category */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
                <p className="text-xs text-gray-400">{CATEGORY_LABELS[template.category] || template.category}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { Template };
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/government/unit-builder/TemplatePicker.tsx
git commit -m "feat: add TemplatePicker component with category filter and tier badges"
```

---

### Task 4: Add Creation Mode Tabs to CreativeEditor

**Files:**
- Modify: `src/components/government/unit-builder/CreativeEditor.tsx`
- Modify: `src/components/government/unit-builder/UnitBuilder.tsx`

**Context:** Currently CreativeEditor only supports Upload (drag-and-drop). We add a mode selector: **Upload** | **Templates** | **Assist**. The Templates tab shows the TemplatePicker. The Assist tab will be a placeholder for now (built in Layer 2). When a template is selected, its base image is loaded as the creative file and text fields are pre-populated.

**Step 1: Update CreativeEditor to accept creation mode**

Modify `src/components/government/unit-builder/CreativeEditor.tsx`. Add a `creationMode` prop and mode selector tabs. The existing upload UI shows when mode is 'upload'. Template picker shows when mode is 'templates'. Assist placeholder when mode is 'assist'.

Replace the entire file with:

```tsx
'use client';

import { useState, useCallback } from 'react';
import type { ChannelFormat, CreativeAssets } from '@/lib/channels/types';
import { COMPLIANCE_DEFAULTS } from '@/lib/channels';
import { TemplatePicker } from './TemplatePicker';
import type { Template } from './TemplatePicker';

type CreationMode = 'upload' | 'templates' | 'assist';

interface CreativeEditorProps {
  format: ChannelFormat;
  assets: CreativeAssets;
  onAssetsChange: (assets: CreativeAssets) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedPlacement: string;
  onPlacementChange: (placement: string) => void;
  campaignId?: string;
  onTemplateSelect?: (templateId: string) => void;
  selectedTemplateId?: string | null;
}

const MODE_LABELS: Record<CreationMode, { label: string; icon: string }> = {
  upload: { label: 'Upload', icon: '📤' },
  templates: { label: 'Templates', icon: '🎨' },
  assist: { label: 'Assist', icon: '✨' },
};

export function CreativeEditor({
  format,
  assets,
  onAssetsChange,
  selectedPlatform,
  onPlatformChange,
  selectedPlacement,
  onPlacementChange,
  campaignId,
  onTemplateSelect,
  selectedTemplateId,
}: CreativeEditorProps) {
  const [creationMode, setCreationMode] = useState<CreationMode>('upload');
  const [dragOver, setDragOver] = useState(false);

  const complianceNote = COMPLIANCE_DEFAULTS[selectedPlatform] || '';

  const updateField = useCallback(
    (field: keyof CreativeAssets, value: CreativeAssets[keyof CreativeAssets]) => {
      onAssetsChange({ ...assets, [field]: value });
    },
    [assets, onAssetsChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      const newFiles = droppedFiles.map(file => ({
        url: URL.createObjectURL(file),
        filename: file.name,
        mimeType: file.type,
      }));

      updateField('files', [...(assets.files || []), ...newFiles]);
    },
    [assets.files, updateField]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const newFiles = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        filename: file.name,
        mimeType: file.type,
      }));
      updateField('files', [...(assets.files || []), ...newFiles]);
    },
    [assets.files, updateField]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = [...(assets.files || [])];
      updated.splice(index, 1);
      updateField('files', updated);
    },
    [assets.files, updateField]
  );

  const handleTemplateSelected = useCallback(
    (template: Template) => {
      // Load template base image as a creative file
      const templateFile = {
        url: template.templateData.baseImageUrl,
        filename: `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        mimeType: 'image/png',
      };
      onAssetsChange({
        ...assets,
        files: [templateFile],
        headline: assets.headline || '',
        bodyText: assets.bodyText || '',
      });
      onTemplateSelect?.(template.id);
    },
    [assets, onAssetsChange, onTemplateSelect]
  );

  const showImageUpload = !format.spec.scriptRequired;
  const showTextFields = true;
  const showHashtags = format.channelGroup === 'social';
  const showClickThrough = format.channelGroup === 'display' || format.spec.briefRequired;

  const acceptTypes = format.spec.fileTypes
    ? format.spec.fileTypes.map(t => {
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(t)) return `image/${t === 'jpg' ? 'jpeg' : t}`;
        if (['mp4', 'mov'].includes(t)) return `video/${t === 'mov' ? 'quicktime' : t}`;
        if (['mp3', 'wav', 'm4a'].includes(t)) return `audio/${t}`;
        return '';
      }).filter(Boolean).join(',')
    : undefined;

  return (
    <div className="space-y-6">
      {/* Platform & Placement Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={selectedPlatform}
            onChange={e => onPlatformChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {format.platforms.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
          <select
            value={selectedPlacement}
            onChange={e => onPlacementChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {format.placements.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Creation Mode Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(Object.keys(MODE_LABELS) as CreationMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setCreationMode(mode)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
              creationMode === mode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {MODE_LABELS[mode].icon} {MODE_LABELS[mode].label}
          </button>
        ))}
      </div>

      {/* Upload Mode */}
      {creationMode === 'upload' && showImageUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Creative {format.spec.fileTypes && `(${format.spec.fileTypes.join(', ')})`}
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <p className="text-sm text-gray-500">
              Drag & drop files here, or{' '}
              <label className="text-teal-600 cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  accept={acceptTypes}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
            {format.spec.maxFileSizeMb && (
              <p className="text-xs text-gray-400 mt-1">Max {format.spec.maxFileSizeMb}MB per file</p>
            )}
            {format.spec.aspectRatios && (
              <p className="text-xs text-gray-400">Aspect ratios: {format.spec.aspectRatios.join(', ')}</p>
            )}
          </div>

          {assets.files && assets.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {assets.files.map((file, i) => (
                <div key={i} className="relative group bg-gray-100 rounded-lg p-2 flex items-center gap-2">
                  {file.mimeType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt={file.filename} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      {file.mimeType.split('/')[0]}
                    </div>
                  )}
                  <span className="text-xs text-gray-600 max-w-[120px] truncate">{file.filename}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-600 text-xs ml-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Mode */}
      {creationMode === 'templates' && (
        <TemplatePicker
          formatKey={format.formatKey}
          channelGroup={format.channelGroup}
          selectedTemplateId={selectedTemplateId || null}
          onTemplateSelect={handleTemplateSelected}
        />
      )}

      {/* Assist Mode — placeholder for Layer 2 */}
      {creationMode === 'assist' && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-sm font-medium text-gray-700">AI-Assisted Creative</p>
          <p className="text-xs text-gray-500 mt-1">
            Generate headlines, copy, and template recommendations from your campaign brief.
          </p>
          <p className="text-xs text-gray-400 mt-3 italic">Coming soon</p>
        </div>
      )}

      {/* Text Fields (show for all modes when content exists or mode is upload/templates) */}
      {showTextFields && creationMode !== 'assist' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={assets.headline || ''}
              onChange={e => updateField('headline', e.target.value)}
              placeholder="Main headline for your ad"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {format.spec.scriptRequired ? 'Script / Talking Points' : 'Body Text / Caption'}
            </label>
            <textarea
              value={assets.bodyText || ''}
              onChange={e => updateField('bodyText', e.target.value)}
              placeholder={format.spec.scriptRequired ? 'Script for the host to read...' : 'Caption or body text for your ad...'}
              rows={4}
              maxLength={format.spec.maxTextLength || undefined}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {format.spec.maxTextLength && (
              <p className="text-xs text-gray-400 mt-1">
                {(assets.bodyText || '').length} / {format.spec.maxTextLength}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                value={assets.ctaText || ''}
                onChange={e => updateField('ctaText', e.target.value)}
                placeholder="e.g., Learn More"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
              <input
                type="url"
                value={assets.ctaUrl || ''}
                onChange={e => updateField('ctaUrl', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hashtags */}
      {showHashtags && creationMode !== 'assist' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
          <input
            type="text"
            value={(assets.hashtags || []).join(' ')}
            onChange={e => updateField('hashtags', e.target.value.split(/\s+/).filter(Boolean))}
            placeholder="#community #localad #sf"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      )}

      {/* Click-through URL */}
      {showClickThrough && creationMode !== 'assist' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Click-Through URL</label>
          <input
            type="url"
            value={assets.clickThroughUrl || ''}
            onChange={e => updateField('clickThroughUrl', e.target.value)}
            placeholder="https://destination-page.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      )}

      {/* Compliance Notice */}
      {complianceNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-700">Platform Compliance</p>
          <p className="text-xs text-amber-600 mt-1">{complianceNote}</p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update UnitBuilder to pass new props to CreativeEditor**

In `src/components/government/unit-builder/UnitBuilder.tsx`, add `selectedTemplateId` state and pass it through.

Add state at line 52 (after `editingUnitId`):
```tsx
const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
```

Update the `<CreativeEditor>` JSX (around line 222) to pass the new props:
```tsx
<CreativeEditor
  format={selectedFormat}
  assets={currentAssets}
  onAssetsChange={setCurrentAssets}
  selectedPlatform={currentPlatform}
  onPlatformChange={setCurrentPlatform}
  selectedPlacement={currentPlacement}
  onPlacementChange={setCurrentPlacement}
  campaignId={campaignId}
  selectedTemplateId={selectedTemplateId}
  onTemplateSelect={setSelectedTemplateId}
/>
```

Also clear `selectedTemplateId` in `handleFormatSelect` (add after line 88):
```tsx
setSelectedTemplateId(null);
```

And in `handleSaveUnit`, clear it after saving (add after line 120):
```tsx
setSelectedTemplateId(null);
```

**Step 3: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/government/unit-builder/CreativeEditor.tsx src/components/government/unit-builder/UnitBuilder.tsx
git commit -m "feat: add creation mode tabs (Upload/Templates/Assist) to CreativeEditor"
```

---

## Layer 2: AI-Assisted Generation

### Task 5: AI Assist API Endpoint

**Files:**
- Create: `src/app/api/campaigns/[id]/units/assist/route.ts`

**Context:** Takes a campaign ID and format, fetches the campaign brief, finds matching templates, calls the AI provider to generate copy and recommend a template. Uses the existing `generateCompletion()` from `src/lib/ai/`.

**Step 1: Create the assist endpoint**

Create `src/app/api/campaigns/[id]/units/assist/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import { isAIEnabled, generateCompletion } from '@/lib/ai';

interface AssistRequest {
  formatKey: string;
  platform: string;
  placement: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const body = (await request.json()) as AssistRequest;

  if (!body.formatKey || !body.platform) {
    return NextResponse.json(
      { error: 'formatKey and platform are required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  // Fetch campaign brief
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: campaign, error: campaignError } = await (supabase as any)
    .from('campaigns')
    .select('name, description, department, target_neighborhoods, target_languages, target_communities, goal, source')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Fetch matching templates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templates } = await (supabase as any)
    .from('unit_templates')
    .select('id, name, category, tier')
    .eq('format_key', body.formatKey)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const templateList = (templates || []).map((t: Record<string, unknown>) =>
    `- "${t.name}" (${t.category}, ${t.tier})`
  ).join('\n');

  // Check if AI is available
  if (!isAIEnabled()) {
    return NextResponse.json({
      recommendedTemplateId: templates?.[0]?.id || null,
      headline: '',
      bodyText: '',
      ctaText: 'Learn More',
      hashtags: [],
      reasoning: 'AI is not configured. Defaulting to first template.',
      aiGenerated: false,
    });
  }

  // Build prompt
  const systemPrompt = `You are a creative copywriter for Resonate, a community media advertising marketplace. You write compelling, culturally sensitive ad copy for local community outreach campaigns. Your copy should be clear, authentic, and appropriate for the target community.

Return ONLY valid JSON with this exact structure:
{
  "recommendedTemplateName": "exact template name from the list",
  "headline": "compelling headline (max 60 chars)",
  "bodyText": "engaging body copy (max 200 chars)",
  "ctaText": "short CTA (max 20 chars)",
  "hashtags": ["tag1", "tag2", "tag3"],
  "reasoning": "one sentence explaining why you chose this template and approach"
}`;

  const userPrompt = `Campaign: ${campaign.name}
Description: ${campaign.description || 'Not provided'}
Department/Source: ${campaign.department || campaign.source || 'Not specified'}
Goal: ${campaign.goal || 'General outreach'}
Target neighborhoods: ${(campaign.target_neighborhoods || []).join(', ') || 'Citywide'}
Target languages: ${(campaign.target_languages || []).join(', ') || 'English'}
Target communities: ${(campaign.target_communities || []).join(', ') || 'General'}
Format: ${body.formatKey} on ${body.platform} (${body.placement})

Available templates:
${templateList || 'No templates available'}

Generate compelling ad copy for this campaign and recommend the best template.`;

  try {
    const response = await generateCompletion({
      systemPrompt,
      userPrompt,
      maxTokens: 500,
    });

    // Parse AI response
    const text = response.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const generated = JSON.parse(jsonMatch[0]);

    // Match recommended template name to ID
    const recommendedTemplate = (templates || []).find(
      (t: Record<string, unknown>) =>
        (t.name as string).toLowerCase() === (generated.recommendedTemplateName || '').toLowerCase()
    );

    return NextResponse.json({
      recommendedTemplateId: recommendedTemplate?.id || templates?.[0]?.id || null,
      headline: generated.headline || '',
      bodyText: generated.bodyText || '',
      ctaText: generated.ctaText || 'Learn More',
      hashtags: generated.hashtags || [],
      reasoning: generated.reasoning || '',
      aiGenerated: true,
    });
  } catch (err) {
    console.error('AI assist error:', err);
    // Graceful fallback
    return NextResponse.json({
      recommendedTemplateId: templates?.[0]?.id || null,
      headline: '',
      bodyText: '',
      ctaText: 'Learn More',
      hashtags: [],
      reasoning: 'AI generation failed. Please write your own copy or try again.',
      aiGenerated: false,
    });
  }
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/campaigns/[id]/units/assist/route.ts
git commit -m "feat: add AI-assisted creative generation endpoint with template recommendation"
```

---

### Task 6: Wire Assist Mode into CreativeEditor

**Files:**
- Modify: `src/components/government/unit-builder/CreativeEditor.tsx` (replace the Assist placeholder)

**Context:** Replace the "Coming soon" placeholder in the Assist tab with a working UI: shows campaign context, "Generate Creative" button, loading state, and results that pre-fill the editor.

**Step 1: Replace the Assist mode placeholder**

In `src/components/government/unit-builder/CreativeEditor.tsx`, replace the `{/* Assist Mode — placeholder for Layer 2 */}` section (the `creationMode === 'assist'` block) with:

```tsx
{/* Assist Mode */}
{creationMode === 'assist' && (
  <AssistMode
    campaignId={campaignId || ''}
    formatKey={format.formatKey}
    platform={selectedPlatform}
    placement={selectedPlacement}
    onResult={(result) => {
      // Apply generated copy to assets
      onAssetsChange({
        ...assets,
        headline: result.headline || assets.headline,
        bodyText: result.bodyText || assets.bodyText,
        ctaText: result.ctaText || assets.ctaText,
        hashtags: result.hashtags?.length ? result.hashtags : assets.hashtags,
      });
      // Select recommended template
      if (result.recommendedTemplateId) {
        onTemplateSelect?.(result.recommendedTemplateId);
      }
      // Switch to templates mode to show the result
      setCreationMode('templates');
    }}
  />
)}
```

Also add a new AssistMode component inline or as a separate import. Create it as a separate file.

**Step 2: Create AssistMode component**

Create `src/components/government/unit-builder/AssistMode.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface AssistResult {
  recommendedTemplateId: string | null;
  headline: string;
  bodyText: string;
  ctaText: string;
  hashtags: string[];
  reasoning: string;
  aiGenerated: boolean;
}

interface AssistModeProps {
  campaignId: string;
  formatKey: string;
  platform: string;
  placement: string;
  onResult: (result: AssistResult) => void;
}

export function AssistMode({ campaignId, formatKey, platform, placement, onResult }: AssistModeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!campaignId) {
      setError('Campaign context not available. Save your campaign brief first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/units/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formatKey, platform, placement }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const result: AssistResult = await res.json();
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6 text-center">
      <div className="text-3xl mb-3">✨</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI-Assisted Creative</h3>
      <p className="text-sm text-gray-600 mb-1">
        Generate headlines, body copy, and CTA from your campaign brief.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        We&apos;ll also recommend the best template for your audience.
      </p>

      <div className="text-xs text-gray-500 bg-white/60 rounded-lg p-3 mb-4 text-left">
        <p><span className="font-medium">Format:</span> {formatKey.replace(/_/g, ' ')}</p>
        <p><span className="font-medium">Platform:</span> {platform}</p>
        <p><span className="font-medium">Placement:</span> {placement.replace(/_/g, ' ')}</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Generating...
          </span>
        ) : (
          'Generate Creative'
        )}
      </button>
    </div>
  );
}
```

**Step 3: Add import to CreativeEditor**

At the top of `CreativeEditor.tsx`, add:
```tsx
import { AssistMode } from './AssistMode';
```

**Step 4: Update the index barrel export**

In `src/components/government/unit-builder/index.ts`, add:
```tsx
export { AssistMode } from './AssistMode';
```

**Step 5: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/components/government/unit-builder/AssistMode.tsx src/components/government/unit-builder/CreativeEditor.tsx src/components/government/unit-builder/index.ts
git commit -m "feat: wire AI Assist mode into CreativeEditor with generation UI"
```

---

## Layer 3: Performance Tracking

### Task 7: UTM Link Generator Utility

**Files:**
- Create: `src/lib/tracking/utm.ts`

**Context:** Generates tracked CTA URLs by appending UTM parameters. Called when units are created to auto-populate `trackedCtaUrl` in creative assets.

**Step 1: Create the UTM utility**

Create `src/lib/tracking/utm.ts`:

```typescript
interface UTMParams {
  campaignId: string;
  unitId: string;
  format: string;
  source?: string;
}

/**
 * Generate a tracked URL with UTM parameters.
 * Wraps the original destination URL with Resonate tracking params.
 */
export function generateTrackedUrl(destinationUrl: string, params: UTMParams): string {
  try {
    const url = new URL(destinationUrl);
    url.searchParams.set('utm_source', 'resonate');
    url.searchParams.set('utm_medium', params.format.replace(/_/g, '-'));
    url.searchParams.set('utm_campaign', params.campaignId);
    url.searchParams.set('utm_content', params.unitId);
    if (params.source) {
      url.searchParams.set('utm_term', params.source);
    }
    return url.toString();
  } catch {
    // If the URL is malformed, return as-is
    return destinationUrl;
  }
}

/**
 * Extract UTM parameters from a tracked URL.
 */
export function parseTrackedUrl(trackedUrl: string): UTMParams | null {
  try {
    const url = new URL(trackedUrl);
    const campaignId = url.searchParams.get('utm_campaign');
    const unitId = url.searchParams.get('utm_content');
    const format = url.searchParams.get('utm_medium');

    if (!campaignId || !unitId || !format) return null;

    return {
      campaignId,
      unitId,
      format: format.replace(/-/g, '_'),
      source: url.searchParams.get('utm_term') || undefined,
    };
  } catch {
    return null;
  }
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/lib/tracking/utm.ts
git commit -m "feat: add UTM tracked link generator utility"
```

---

### Task 8: Auto-Generate Tracked URLs on Unit Creation

**Files:**
- Modify: `src/app/api/campaigns/[id]/units/route.ts:26-82`

**Context:** When a unit is created via POST, if `creativeAssets.ctaUrl` exists, auto-generate a `trackedCtaUrl` using the UTM utility and include it in the saved assets.

**Step 1: Update the POST handler**

In `src/app/api/campaigns/[id]/units/route.ts`, add the import at the top:

```typescript
import { generateTrackedUrl } from '@/lib/tracking/utm';
```

Then in the POST handler, after extracting body fields and before the insert, add tracked URL generation:

```typescript
// Auto-generate tracked CTA URL
const assets = { ...creativeAssets };
if (assets.ctaUrl) {
  // Generate a temporary unit ID for tracking (will be replaced with real ID after insert)
  const trackingId = `unit-${Date.now()}`;
  assets.trackedCtaUrl = generateTrackedUrl(assets.ctaUrl, {
    campaignId,
    unitId: trackingId,
    format: formatKey,
  });
}
```

And use `assets` instead of `creativeAssets` in the insert:

```typescript
creative_assets: assets,
```

Then after the insert succeeds, update the tracked URL with the real unit ID:

```typescript
// Update tracked URL with real unit ID
if (data.creative_assets?.ctaUrl && data.id) {
  const trackedUrl = generateTrackedUrl(data.creative_assets.ctaUrl, {
    campaignId,
    unitId: data.id,
    format: formatKey,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('campaign_units')
    .update({ creative_assets: { ...data.creative_assets, trackedCtaUrl: trackedUrl } })
    .eq('id', data.id);
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/campaigns/[id]/units/route.ts
git commit -m "feat: auto-generate UTM tracked URLs on unit creation"
```

---

### Task 9: Add Metrics Fields to Publisher Delivery Form

**Files:**
- Modify: `src/components/publisher/orders/UnitCard.tsx:370-393`

**Context:** The delivery proof form currently only has a post URL input. We add optional metrics fields: impressions, reach, engagement, clicks. These are stored in the existing `DeliveryProof.metrics` structure.

**Step 1: Update UnitCard delivery form and callback type**

First update the `onMarkDelivered` prop type to accept metrics:

Change line 23 from:
```tsx
onMarkDelivered: (unitId: string, proof: { postUrl?: string; screenshotUrl?: string }) => Promise<void>;
```
to:
```tsx
onMarkDelivered: (unitId: string, proof: { postUrl?: string; screenshotUrl?: string; metrics?: { impressions?: number; reach?: number; engagement?: number; clicks?: number } }) => Promise<void>;
```

Then add state for metrics fields after the `deliverUrl` state (around line 63):

```tsx
const [deliverImpressions, setDeliverImpressions] = useState('');
const [deliverReach, setDeliverReach] = useState('');
const [deliverEngagement, setDeliverEngagement] = useState('');
const [deliverClicks, setDeliverClicks] = useState('');
```

Replace the deliver form section (lines 370-393) with:

```tsx
{showDeliverForm && (
  <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-200 space-y-3">
    <p className="text-sm font-medium text-emerald-700">Delivery Proof</p>
    <input
      type="url"
      value={deliverUrl}
      onChange={e => setDeliverUrl(e.target.value)}
      placeholder="https://instagram.com/p/... (post URL)"
      className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
    />

    <div>
      <p className="text-xs font-medium text-emerald-600 mb-2">Performance Metrics (optional)</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Impressions</label>
          <input
            type="number"
            min="0"
            value={deliverImpressions}
            onChange={e => setDeliverImpressions(e.target.value)}
            placeholder="0"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Reach</label>
          <input
            type="number"
            min="0"
            value={deliverReach}
            onChange={e => setDeliverReach(e.target.value)}
            placeholder="0"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Engagement</label>
          <input
            type="number"
            min="0"
            value={deliverEngagement}
            onChange={e => setDeliverEngagement(e.target.value)}
            placeholder="0"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Clicks</label>
          <input
            type="number"
            min="0"
            value={deliverClicks}
            onChange={e => setDeliverClicks(e.target.value)}
            placeholder="0"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => {
          const metrics = {
            impressions: deliverImpressions ? parseInt(deliverImpressions) : undefined,
            reach: deliverReach ? parseInt(deliverReach) : undefined,
            engagement: deliverEngagement ? parseInt(deliverEngagement) : undefined,
            clicks: deliverClicks ? parseInt(deliverClicks) : undefined,
          };
          const hasMetrics = Object.values(metrics).some(v => v !== undefined);
          handleAction(() => onMarkDelivered(unitId, {
            postUrl: deliverUrl || undefined,
            metrics: hasMetrics ? metrics : undefined,
          }));
        }}
        disabled={loading}
        className="text-sm px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Submitting...' : 'Confirm Delivery'}
      </button>
      <button
        onClick={() => {
          setShowDeliverForm(false);
          setDeliverUrl('');
          setDeliverImpressions('');
          setDeliverReach('');
          setDeliverEngagement('');
          setDeliverClicks('');
        }}
        className="text-sm text-gray-500 px-3"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/publisher/orders/UnitCard.tsx
git commit -m "feat: add performance metrics fields to publisher delivery form"
```

---

### Task 10: Campaign Performance Dashboard

**Files:**
- Create: `src/components/government/campaigns/PerformanceDashboard.tsx`

**Context:** Shows per-unit performance metrics on the campaign detail page. Displays aggregate stats (total impressions, reach, engagement, clicks) and per-unit cards with publisher name, format, status, and reported metrics.

**Step 1: Create the PerformanceDashboard component**

Create `src/components/government/campaigns/PerformanceDashboard.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import type { UnitStatus, ChannelGroup } from '@/lib/channels/types';
import { UNIT_STATUS_LABELS } from '@/lib/channels';

interface UnitMetrics {
  id: string;
  formatKey: string;
  formatLabel: string;
  channelGroup: ChannelGroup;
  platform: string;
  publisherName: string;
  status: UnitStatus;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
  trackedCtaUrl?: string;
  deliveredAt?: string;
}

interface PerformanceDashboardProps {
  campaignId: string;
}

const GROUP_COLORS: Record<ChannelGroup, string> = {
  social: 'bg-blue-100 text-blue-700',
  display: 'bg-purple-100 text-purple-700',
  audio_video: 'bg-orange-100 text-orange-700',
};

function StatBlock({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export function PerformanceDashboard({ campaignId }: PerformanceDashboardProps) {
  const [units, setUnits] = useState<UnitMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${campaignId}/units`)
      .then(res => res.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map((u: Record<string, unknown>) => ({
          id: u.id as string,
          formatKey: u.format_key as string,
          formatLabel: (u.format_key as string || '').replace(/_/g, ' '),
          channelGroup: u.channel_group as ChannelGroup,
          platform: u.platform as string,
          publisherName: (u.publisher_id as string || '').slice(-4), // Short ID until we join publisher names
          status: u.status as UnitStatus,
          metrics: (u.proof as Record<string, unknown>)?.metrics as UnitMetrics['metrics'],
          trackedCtaUrl: (u.creative_assets as Record<string, unknown>)?.trackedCtaUrl as string,
          deliveredAt: u.delivered_at as string,
        }));
        setUnits(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [campaignId]);

  // Aggregate stats
  const delivered = units.filter(u => u.status === 'delivered');
  const totalImpressions = delivered.reduce((sum, u) => sum + (u.metrics?.impressions || 0), 0);
  const totalReach = delivered.reduce((sum, u) => sum + (u.metrics?.reach || 0), 0);
  const totalEngagement = delivered.reduce((sum, u) => sum + (u.metrics?.engagement || 0), 0);
  const totalClicks = delivered.reduce((sum, u) => sum + (u.metrics?.clicks || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No units in this campaign yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBlock label="Impressions" value={totalImpressions} sublabel="Publisher-reported" />
        <StatBlock label="Reach" value={totalReach} sublabel="Publisher-reported" />
        <StatBlock label="Engagement" value={totalEngagement} sublabel="Publisher-reported" />
        <StatBlock label="Clicks" value={totalClicks} sublabel={totalClicks > 0 ? 'Tracked + reported' : 'No clicks yet'} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Units ({units.length}) &middot; {delivered.length} delivered
        </h3>
      </div>

      {/* Per-unit cards */}
      <div className="space-y-3">
        {units.map(unit => {
          const statusDisplay = UNIT_STATUS_LABELS[unit.status] || { label: unit.status, color: 'gray' };
          const hasMetrics = unit.metrics && Object.values(unit.metrics).some(v => v && v > 0);

          return (
            <div key={unit.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_COLORS[unit.channelGroup]}`}>
                  {unit.channelGroup === 'audio_video' ? 'Audio/Video' : unit.channelGroup.charAt(0).toUpperCase() + unit.channelGroup.slice(1)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {unit.formatLabel}
                </span>
                <span className="text-xs text-gray-400">
                  {unit.platform}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${
                  statusDisplay.color === 'green' ? 'bg-emerald-50 text-emerald-700' :
                  statusDisplay.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {statusDisplay.label}
                </span>
              </div>

              {unit.status === 'delivered' && hasMetrics ? (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Impressions</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.impressions || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reach</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.reach || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Engagement</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.engagement || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Clicks</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.clicks || 0).toLocaleString()}</p>
                  </div>
                </div>
              ) : unit.status === 'delivered' ? (
                <p className="text-xs text-gray-400 mt-2 italic">Delivered — metrics pending</p>
              ) : (
                <p className="text-xs text-gray-400 mt-2 italic">Awaiting delivery</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/government/campaigns/PerformanceDashboard.tsx
git commit -m "feat: add campaign performance dashboard with per-unit metrics"
```

---

## Summary

| Task | Layer | What It Does |
|------|-------|-------------|
| 1 | Templates | Seed 13 templates across social, display, newsletter |
| 2 | Templates | Templates API endpoint with format/group/category filters |
| 3 | Templates | TemplatePicker component with category filter and tier badges |
| 4 | Templates | Creation mode tabs (Upload/Templates/Assist) in CreativeEditor |
| 5 | AI Assist | AI generation endpoint (copy + template recommendation) |
| 6 | AI Assist | AssistMode component wired into CreativeEditor |
| 7 | Performance | UTM tracked link generator utility |
| 8 | Performance | Auto-generate tracked URLs on unit creation |
| 9 | Performance | Metrics fields in publisher delivery form |
| 10 | Performance | Campaign performance dashboard |

**Note on template images:** The seed migration references placeholder image paths (`/templates/social/...`). These need actual template image files placed in `public/templates/`. For initial development, the TemplatePicker renders a color-block fallback when thumbnail images don't exist. Create real template images when designing the visual assets.
