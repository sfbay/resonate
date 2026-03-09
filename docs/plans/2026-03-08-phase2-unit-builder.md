# Phase 2: Unit Builder — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Step 4 to the campaign wizard — a unit builder where advertisers create, upload, or template creative units per format/platform/placement and assign them to selected publishers.

**Architecture:** Step 4 sits after publisher matching (Step 3). It fetches available channels/formats for the current city via `/api/channels`, renders three group tabs (Social / Display & Sponsored / Audio & Video), and provides upload + copy editing per format. Units are saved to the `campaign_units` table via `/api/campaigns/[id]/units`. A review step shows all units grouped by publisher before submission.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, existing `@/lib/channels` types/queries, existing `@/components/shared` components

---

### Task 1: useChannelFormats Hook

Fetch available channel groups and formats for the current city from the `/api/channels` endpoint.

**Files:**
- Create: `src/lib/channels/use-channel-formats.ts`

**Step 1: Write the hook**

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { ChannelGroupConfig, ChannelFormat } from '@/lib/channels/types';

export interface ChannelGroupWithFormats extends ChannelGroupConfig {
  formats: ChannelFormat[];
}

interface UseChannelFormatsResult {
  groups: ChannelGroupWithFormats[];
  isLoading: boolean;
  error: string | null;
}

export function useChannelFormats(citySlug: string): UseChannelFormatsResult {
  const [groups, setGroups] = useState<ChannelGroupWithFormats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChannels() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/channels?city=${encodeURIComponent(citySlug)}`);
        if (!res.ok) throw new Error(`Failed to fetch channels: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setGroups(data.groups || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchChannels();
    return () => { cancelled = true; };
  }, [citySlug]);

  return { groups, isLoading, error };
}
```

**Step 2: Commit**

```bash
git add src/lib/channels/use-channel-formats.ts
git commit -m "feat: add useChannelFormats hook for fetching city-gated channel formats"
```

---

### Task 2: Extend Wizard to Include Step 4

Add a `'units'` step to the existing government onboarding wizard. This task only adds the step definition, navigation, and a placeholder — the actual unit builder UI comes in later tasks.

**Files:**
- Modify: `src/app/government/onboarding/page.tsx`

**Step 1: Update WizardStep type and STEPS array**

Find:
```typescript
type WizardStep = 'brief' | 'audience' | 'match';
```
Replace with:
```typescript
type WizardStep = 'brief' | 'audience' | 'match' | 'units';
```

Find the STEPS array (line ~176):
```typescript
const STEPS: { id: WizardStep; num: number; label: string; subtitle: string }[] = [
  { id: 'brief', num: 1, label: 'Campaign Brief', subtitle: 'Department & goals' },
  { id: 'audience', num: 2, label: 'Audience', subtitle: 'Who to reach' },
  { id: 'match', num: 3, label: 'Publishers', subtitle: 'Find matches' },
```
Add after the match step:
```typescript
  { id: 'units', num: 4, label: 'Creative Units', subtitle: 'Build your ads' },
```

**Step 2: Add the step body rendering**

Find where step === 'match' renders its content (line ~457):
```typescript
{step === 'match' && (
```
After that section's closing, add:
```typescript
{step === 'units' && (
  <div className="text-center py-16 text-gray-400">
    <p className="text-lg font-medium">Unit Builder</p>
    <p className="text-sm mt-1">Coming next — build your creative units here</p>
  </div>
)}
```

**Step 3: Update the "Next" button on Step 3 to navigate to Step 4**

The existing Step 3 (match) has a "Create Campaign" or "Continue" button. Find the button at the bottom of the match step that currently finalizes or navigates. The `handleNext` function already handles step progression via the STEPS array index, so adding step 4 to STEPS should make navigation work automatically.

Verify: the `handleNext` function uses `STEPS[stepIndex + 1].id` — adding the new step to STEPS means clicking Next on step 3 goes to step 4.

However, we need to change the final step logic. Find where it checks if we're on the last step (around the Submit/Create Campaign button at the bottom). The submit button should now only appear on step 4, not step 3. On step 3, show "Continue to Creative Units →" instead.

Find the bottom navigation area (around line ~489):
```typescript
{step === 'match' ? (
```
Change to:
```typescript
{step === 'units' ? (
```
This moves the "Create Campaign" submit action to step 4.

For step 3's bottom, ensure the Next button text says "Continue to Creative Units →" when on the match step. Find the Next button text and add a condition:
```typescript
{step === 'match' ? 'Continue to Creative Units →' : 'Next'}
```

**Step 4: Commit**

```bash
git add src/app/government/onboarding/page.tsx
git commit -m "feat: add Step 4 (units) placeholder to campaign wizard"
```

---

### Task 3: ChannelGroupTabs Component

A reusable tab bar showing the three channel groups (Social / Display & Sponsored / Audio & Video) with only market-enabled tabs active.

**Files:**
- Create: `src/components/government/unit-builder/ChannelGroupTabs.tsx`

**Step 1: Write the component**

```typescript
'use client';

import type { ChannelGroupWithFormats } from '@/lib/channels/use-channel-formats';
import type { ChannelGroup } from '@/lib/channels/types';

// Heroicon-style inline SVGs for each group
const GROUP_ICONS: Record<ChannelGroup, React.ReactNode> = {
  social: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  display: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
  ),
  audio_video: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
  ),
};

interface ChannelGroupTabsProps {
  groups: ChannelGroupWithFormats[];
  activeGroup: ChannelGroup | null;
  onGroupSelect: (group: ChannelGroup) => void;
}

export function ChannelGroupTabs({ groups, activeGroup, onGroupSelect }: ChannelGroupTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {groups.map(group => {
        const isActive = activeGroup === group.key;
        return (
          <button
            key={group.key}
            onClick={() => onGroupSelect(group.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {GROUP_ICONS[group.key]}
            <span>{group.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {group.formats.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/government/unit-builder/ChannelGroupTabs.tsx
git commit -m "feat: add ChannelGroupTabs component for unit builder"
```

---

### Task 4: FormatPicker Component

A grid of visual cards for selecting a creative format within a channel group (e.g., "Instagram Reel", "Newsletter Mention", "300x250 Banner").

**Files:**
- Create: `src/components/government/unit-builder/FormatPicker.tsx`

**Step 1: Write the component**

```typescript
'use client';

import type { ChannelFormat } from '@/lib/channels/types';

interface FormatPickerProps {
  formats: ChannelFormat[];
  selectedFormat: string | null;
  onFormatSelect: (formatKey: string) => void;
}

function formatSpecSummary(format: ChannelFormat): string {
  const parts: string[] = [];
  if (format.spec.aspectRatios) parts.push(format.spec.aspectRatios.join(', '));
  if (format.spec.maxDurationSec) parts.push(`Max ${format.spec.maxDurationSec}s`);
  if (format.spec.maxFileSizeMb) parts.push(`Max ${format.spec.maxFileSizeMb}MB`);
  if (format.spec.sizes) parts.push(Object.values(format.spec.sizes).join(', '));
  if (format.spec.maxTextLength) parts.push(`Max ${format.spec.maxTextLength} chars`);
  return parts.join(' · ') || '';
}

// Map format keys to simple emoji-style indicators
const FORMAT_ICONS: Record<string, string> = {
  static_image: '🖼',
  video_reel: '🎬',
  story: '📱',
  carousel: '🎠',
  text_image: '📝',
  newsletter_mention: '📬',
  newsletter_dedicated: '✉️',
  messaging_broadcast: '💬',
  banner_ad: '🖥',
  sponsored_article: '📰',
  podcast_clip: '🎙',
  podcast_script: '📄',
  video_produced: '🎥',
};

export function FormatPicker({ formats, selectedFormat, onFormatSelect }: FormatPickerProps) {
  if (formats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No formats available for this channel group in your market.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {formats.map(format => {
        const isSelected = selectedFormat === format.formatKey;
        return (
          <button
            key={format.formatKey}
            onClick={() => onFormatSelect(format.formatKey)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-teal-500 bg-teal-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="text-2xl mb-2">{FORMAT_ICONS[format.formatKey] || '📎'}</div>
            <div className="font-medium text-sm text-gray-900">{format.label}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{format.description}</div>
            <div className="text-xs text-gray-400 mt-2 font-mono">
              {format.platforms.join(', ')}
            </div>
            {formatSpecSummary(format) && (
              <div className="text-xs text-gray-400 mt-1">{formatSpecSummary(format)}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/government/unit-builder/FormatPicker.tsx
git commit -m "feat: add FormatPicker grid component for selecting creative formats"
```

---

### Task 5: CreativeEditor Component

The core creative editing panel. Handles file upload (drag-and-drop), copy fields (headline, body, CTA, hashtags), and platform/placement selection. Shows format specs inline.

**Files:**
- Create: `src/components/government/unit-builder/CreativeEditor.tsx`

**Step 1: Write the component**

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { ChannelFormat, CreativeAssets } from '@/lib/channels/types';
import { COMPLIANCE_DEFAULTS } from '@/lib/channels';

interface CreativeEditorProps {
  format: ChannelFormat;
  assets: CreativeAssets;
  onAssetsChange: (assets: CreativeAssets) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedPlacement: string;
  onPlacementChange: (placement: string) => void;
}

export function CreativeEditor({
  format,
  assets,
  onAssetsChange,
  selectedPlatform,
  onPlatformChange,
  selectedPlacement,
  onPlacementChange,
}: CreativeEditorProps) {
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

      // Create preview URLs for display (real upload would go to storage)
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

  // Determine which fields to show based on format
  const showImageUpload = !format.spec.scriptRequired;
  const showTextFields = true; // All formats need some text
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

      {/* File Upload */}
      {showImageUpload && (
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

          {/* Uploaded files preview */}
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

      {/* Text Fields */}
      {showTextFields && (
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
      {showHashtags && (
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

      {/* Click-through URL for display ads */}
      {showClickThrough && (
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

**Step 2: Commit**

```bash
git add src/components/government/unit-builder/CreativeEditor.tsx
git commit -m "feat: add CreativeEditor component with upload, copy fields, and compliance"
```

---

### Task 6: PublisherAssignment Component

Checkboxes to assign a unit to one or more of the selected publishers from Step 3.

**Files:**
- Create: `src/components/government/unit-builder/PublisherAssignment.tsx`

**Step 1: Write the component**

```typescript
'use client';

interface Publisher {
  id: string;
  name: string;
  logoUrl?: string;
}

interface PublisherAssignmentProps {
  publishers: Publisher[];
  selectedIds: Set<string>;
  onToggle: (publisherId: string) => void;
  onSelectAll: () => void;
}

export function PublisherAssignment({ publishers, selectedIds, onToggle, onSelectAll }: PublisherAssignmentProps) {
  const allSelected = publishers.length > 0 && publishers.every(p => selectedIds.has(p.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">Assign to Publishers</label>
        <button
          onClick={onSelectAll}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="space-y-2">
        {publishers.map(pub => (
          <label
            key={pub.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedIds.has(pub.id)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(pub.id)}
              onChange={() => onToggle(pub.id)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            {pub.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pub.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                {pub.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{pub.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/government/unit-builder/PublisherAssignment.tsx
git commit -m "feat: add PublisherAssignment component for unit-to-publisher mapping"
```

---

### Task 7: UnitReviewCard Component

A card showing a completed unit's summary — format, platform, preview thumbnail, copy snippet, assigned publishers. Used in the review section.

**Files:**
- Create: `src/components/government/unit-builder/UnitReviewCard.tsx`

**Step 1: Write the component**

```typescript
'use client';

import type { CreativeAssets, ChannelGroup } from '@/lib/channels/types';

interface UnitReviewCardProps {
  formatLabel: string;
  channelGroup: ChannelGroup;
  platform: string;
  placement: string;
  assets: CreativeAssets;
  publisherNames: string[];
  onEdit: () => void;
  onRemove: () => void;
}

const GROUP_COLORS: Record<ChannelGroup, string> = {
  social: 'bg-blue-100 text-blue-700',
  display: 'bg-purple-100 text-purple-700',
  audio_video: 'bg-orange-100 text-orange-700',
};

export function UnitReviewCard({
  formatLabel,
  channelGroup,
  platform,
  placement,
  assets,
  publisherNames,
  onEdit,
  onRemove,
}: UnitReviewCardProps) {
  const thumbnail = assets.files?.[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {thumbnail && thumbnail.mimeType.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              {thumbnail ? thumbnail.mimeType.split('/')[0] : 'No file'}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_COLORS[channelGroup]}`}>
              {channelGroup === 'audio_video' ? 'Audio/Video' : channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{formatLabel}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {assets.headline || '(No headline)'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {platform} · {placement.replace(/_/g, ' ')}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {publisherNames.map(name => (
              <span key={name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={onEdit} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Edit
          </button>
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-600 font-medium">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/government/unit-builder/UnitReviewCard.tsx
git commit -m "feat: add UnitReviewCard component for unit review summary"
```

---

### Task 8: UnitBuilder Orchestrator Component

The main Step 4 component that ties everything together: channel tabs, format picker, creative editor, publisher assignment, unit list, and "Add another unit" flow.

**Files:**
- Create: `src/components/government/unit-builder/UnitBuilder.tsx`
- Create: `src/components/government/unit-builder/index.ts`

**Step 1: Write the barrel export**

Create `src/components/government/unit-builder/index.ts`:

```typescript
export { UnitBuilder } from './UnitBuilder';
```

**Step 2: Write the orchestrator**

Create `src/components/government/unit-builder/UnitBuilder.tsx`:

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ChannelGroup, ChannelFormat, CreativeAssets } from '@/lib/channels/types';
import { useChannelFormats } from '@/lib/channels/use-channel-formats';
import { ChannelGroupTabs } from './ChannelGroupTabs';
import { FormatPicker } from './FormatPicker';
import { CreativeEditor } from './CreativeEditor';
import { PublisherAssignment } from './PublisherAssignment';
import { UnitReviewCard } from './UnitReviewCard';

interface Publisher {
  id: string;
  name: string;
  logoUrl?: string;
}

// A unit being built (not yet saved)
interface DraftUnit {
  id: string; // client-side ID for tracking
  channelGroup: ChannelGroup;
  formatKey: string;
  formatLabel: string;
  platform: string;
  placement: string;
  assets: CreativeAssets;
  assignedPublisherIds: Set<string>;
}

interface UnitBuilderProps {
  campaignId: string;
  citySlug: string;
  selectedPublishers: Publisher[];
  onUnitsReady: (units: DraftUnit[]) => void;
}

let nextId = 1;
function generateId(): string {
  return `draft-unit-${nextId++}`;
}

export function UnitBuilder({ campaignId, citySlug, selectedPublishers, onUnitsReady }: UnitBuilderProps) {
  const { groups, isLoading, error } = useChannelFormats(citySlug);

  // Builder state
  const [activeGroup, setActiveGroup] = useState<ChannelGroup | null>(null);
  const [selectedFormatKey, setSelectedFormatKey] = useState<string | null>(null);
  const [currentAssets, setCurrentAssets] = useState<CreativeAssets>({});
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [currentPlacement, setCurrentPlacement] = useState('');
  const [currentPublisherIds, setCurrentPublisherIds] = useState<Set<string>>(new Set());
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Completed units
  const [units, setUnits] = useState<DraftUnit[]>([]);

  // Mode: 'pick' (choosing format) or 'edit' (editing creative)
  const [mode, setMode] = useState<'pick' | 'edit'>('pick');

  // Set first group active when data loads
  if (!activeGroup && groups.length > 0) {
    setActiveGroup(groups[0].key);
  }

  const activeGroupData = useMemo(
    () => groups.find(g => g.key === activeGroup),
    [groups, activeGroup]
  );

  const selectedFormat = useMemo(
    () => activeGroupData?.formats.find(f => f.formatKey === selectedFormatKey) || null,
    [activeGroupData, selectedFormatKey]
  );

  const handleFormatSelect = useCallback((formatKey: string) => {
    setSelectedFormatKey(formatKey);
    const format = groups.flatMap(g => g.formats).find(f => f.formatKey === formatKey);
    if (format) {
      setCurrentPlatform(format.platforms[0] || '');
      setCurrentPlacement(format.placements[0] || '');
    }
    setCurrentAssets({});
    setCurrentPublisherIds(new Set(selectedPublishers.map(p => p.id)));
    setEditingUnitId(null);
    setMode('edit');
  }, [groups, selectedPublishers]);

  const handleSaveUnit = useCallback(() => {
    if (!selectedFormat || !currentPlatform || !currentPlacement) return;

    const unit: DraftUnit = {
      id: editingUnitId || generateId(),
      channelGroup: selectedFormat.channelGroup,
      formatKey: selectedFormat.formatKey,
      formatLabel: selectedFormat.label,
      platform: currentPlatform,
      placement: currentPlacement,
      assets: { ...currentAssets },
      assignedPublisherIds: new Set(currentPublisherIds),
    };

    setUnits(prev => {
      const existing = prev.findIndex(u => u.id === unit.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = unit;
        return updated;
      }
      return [...prev, unit];
    });

    // Reset to format picker
    setSelectedFormatKey(null);
    setCurrentAssets({});
    setEditingUnitId(null);
    setMode('pick');
  }, [selectedFormat, currentPlatform, currentPlacement, currentAssets, currentPublisherIds, editingUnitId]);

  const handleEditUnit = useCallback((unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    setActiveGroup(unit.channelGroup);
    setSelectedFormatKey(unit.formatKey);
    setCurrentPlatform(unit.platform);
    setCurrentPlacement(unit.placement);
    setCurrentAssets({ ...unit.assets });
    setCurrentPublisherIds(new Set(unit.assignedPublisherIds));
    setEditingUnitId(unit.id);
    setMode('edit');
  }, [units]);

  const handleRemoveUnit = useCallback((unitId: string) => {
    setUnits(prev => prev.filter(u => u.id !== unitId));
  }, []);

  const handleTogglePublisher = useCallback((publisherId: string) => {
    setCurrentPublisherIds(prev => {
      const next = new Set(prev);
      if (next.has(publisherId)) next.delete(publisherId);
      else next.add(publisherId);
      return next;
    });
  }, []);

  const handleSelectAllPublishers = useCallback(() => {
    const allIds = selectedPublishers.map(p => p.id);
    const allSelected = allIds.every(id => currentPublisherIds.has(id));
    setCurrentPublisherIds(allSelected ? new Set() : new Set(allIds));
  }, [selectedPublishers, currentPublisherIds]);

  const publisherNameMap = useMemo(
    () => Object.fromEntries(selectedPublishers.map(p => [p.id, p.name])),
    [selectedPublishers]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">Failed to load channel formats: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Group Tabs */}
      <ChannelGroupTabs
        groups={groups}
        activeGroup={activeGroup}
        onGroupSelect={group => {
          setActiveGroup(group);
          setSelectedFormatKey(null);
          setMode('pick');
        }}
      />

      {mode === 'pick' && activeGroupData && (
        <>
          {/* Format Picker */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Choose a format from {activeGroupData.label}
            </h3>
            <FormatPicker
              formats={activeGroupData.formats}
              selectedFormat={selectedFormatKey}
              onFormatSelect={handleFormatSelect}
            />
          </div>
        </>
      )}

      {mode === 'edit' && selectedFormat && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creative Editor — 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {editingUnitId ? 'Edit' : 'Create'}: {selectedFormat.label}
              </h3>
              <button
                onClick={() => { setMode('pick'); setSelectedFormatKey(null); setEditingUnitId(null); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                &larr; Back to formats
              </button>
            </div>

            <CreativeEditor
              format={selectedFormat}
              assets={currentAssets}
              onAssetsChange={setCurrentAssets}
              selectedPlatform={currentPlatform}
              onPlatformChange={setCurrentPlatform}
              selectedPlacement={currentPlacement}
              onPlacementChange={setCurrentPlacement}
            />
          </div>

          {/* Publisher Assignment — 1 column */}
          <div className="space-y-4">
            <PublisherAssignment
              publishers={selectedPublishers}
              selectedIds={currentPublisherIds}
              onToggle={handleTogglePublisher}
              onSelectAll={handleSelectAllPublishers}
            />

            <button
              onClick={handleSaveUnit}
              disabled={currentPublisherIds.size === 0}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingUnitId ? 'Update Unit' : 'Add Unit to Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Completed Units Review */}
      {units.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Campaign Units ({units.length})
            </h3>
            {mode === 'edit' && (
              <button
                onClick={() => { setMode('pick'); setSelectedFormatKey(null); }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add another unit
              </button>
            )}
          </div>
          <div className="space-y-3">
            {units.map(unit => (
              <UnitReviewCard
                key={unit.id}
                formatLabel={unit.formatLabel}
                channelGroup={unit.channelGroup}
                platform={unit.platform}
                placement={unit.placement}
                assets={unit.assets}
                publisherNames={Array.from(unit.assignedPublisherIds).map(id => publisherNameMap[id] || id)}
                onEdit={() => handleEditUnit(unit.id)}
                onRemove={() => handleRemoveUnit(unit.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/government/unit-builder/
git commit -m "feat: add UnitBuilder orchestrator component with full creative flow"
```

---

### Task 9: Wire UnitBuilder into Step 4 of the Wizard

Replace the placeholder from Task 2 with the actual UnitBuilder component. Pass campaign ID, city slug, and selected publishers from Step 3.

**Files:**
- Modify: `src/app/government/onboarding/page.tsx`

**Step 1: Add imports**

Add at the top of the file with other imports:

```typescript
import { UnitBuilder } from '@/components/government/unit-builder';
```

**Step 2: Replace the placeholder**

Find the Step 4 placeholder:
```typescript
{step === 'units' && (
  <div className="text-center py-16 text-gray-400">
    <p className="text-lg font-medium">Unit Builder</p>
    <p className="text-sm mt-1">Coming next — build your creative units here</p>
  </div>
)}
```

Replace with:
```typescript
{step === 'units' && (
  <UnitBuilder
    campaignId={campaignId || ''}
    citySlug={cityCtx?.slug || 'sf'}
    selectedPublishers={
      matches
        .filter(m => selectedPublishers.has(m.publisher.id))
        .map(m => ({
          id: m.publisher.id,
          name: m.publisher.name,
          logoUrl: m.publisher.logoUrl,
        }))
    }
    onUnitsReady={() => {}}
  />
)}
```

Note: `cityCtx` comes from the existing `useCityOptional()` call. `matches` and `selectedPublishers` are existing state from Step 3. Verify these variable names match the actual code — read the file first.

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/government/onboarding/page.tsx
git commit -m "feat: wire UnitBuilder into Step 4 of government campaign wizard"
```

---

### Task 10: Wire UnitBuilder into Advertise Portal Wizard

The advertise portal wizard (business/nonprofit/foundation) also needs a unit builder step.

**Files:**
- Modify: `src/app/advertise/onboarding/page.tsx`

**Step 1: Read the current file**

Read `src/app/advertise/onboarding/page.tsx` to understand:
- The current WizardStep type
- The STEPS array
- How matches/publishers are stored
- Variable names for selected publishers

**Step 2: Add the 'units' step**

Follow the same pattern as Task 9:
1. Add `'units'` to the WizardStep type
2. Add the step to the STEPS array
3. Import `UnitBuilder`
4. Add the `{step === 'units' && (...)}` block with UnitBuilder
5. Move the submit/finalize button from the last current step to step 'units'

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/advertise/onboarding/page.tsx
git commit -m "feat: add unit builder step to advertise portal wizard"
```

---

### Task 11: Save Units to Database on Campaign Submit

When the user clicks "Create Campaign" (now on Step 4), save all draft units to the database via POST `/api/campaigns/[id]/units`.

**Files:**
- Modify: `src/app/government/onboarding/page.tsx`

**Step 1: Read the file to find the submit handler**

Find the function that handles "Create Campaign" / submit. It likely calls POST to `/api/campaigns` or PATCH to finalize.

**Step 2: Add unit saving logic**

After the campaign is created/finalized, iterate over draft units and POST each to `/api/campaigns/[id]/units`:

```typescript
// After campaign creation/finalization
for (const unit of draftUnits) {
  for (const publisherId of unit.assignedPublisherIds) {
    await fetch(`/api/campaigns/${campaignId}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publisherId,
        channelGroup: unit.channelGroup,
        formatKey: unit.formatKey,
        platform: unit.platform,
        placement: unit.placement,
        tier: 'upload',
        creativeAssets: unit.assets,
      }),
    });
  }
}
```

This creates one unit per publisher per draft unit (since a single draft unit can be assigned to multiple publishers).

**Step 3: Wire onUnitsReady callback**

The `UnitBuilder` component's `onUnitsReady` prop should update parent state so the submit handler can access draft units. Add state:

```typescript
const [draftUnits, setDraftUnits] = useState<any[]>([]);
```

And pass to UnitBuilder:
```typescript
onUnitsReady={setDraftUnits}
```

Update the UnitBuilder to call `onUnitsReady` whenever its `units` state changes (via useEffect).

**Step 4: Commit**

```bash
git add src/app/government/onboarding/page.tsx
git commit -m "feat: save campaign units to database on campaign submit"
```

---

### Task 12: Build Verification and Push

**Step 1: Build check**

Run: `npx next build`
Expected: Build succeeds with no new errors.

**Step 2: Visual smoke test**

Start dev server, navigate to `/sf/government/onboarding`, complete Steps 1-3, verify Step 4 shows:
- Channel group tabs (Social + Audio/Video for SF, no Display)
- Format cards within each tab
- Creative editor with upload zone and copy fields
- Publisher assignment checkboxes
- Unit review cards after adding a unit
- "Add another unit" flow

**Step 3: Push**

```bash
git push origin main
```

---

## Summary

| Task | What it creates | Depends on |
|------|----------------|------------|
| 1 | `useChannelFormats` hook | Phase 1 channels API |
| 2 | Step 4 placeholder in wizard | — |
| 3 | `ChannelGroupTabs` component | — |
| 4 | `FormatPicker` component | — |
| 5 | `CreativeEditor` component | — |
| 6 | `PublisherAssignment` component | — |
| 7 | `UnitReviewCard` component | — |
| 8 | `UnitBuilder` orchestrator | Tasks 1, 3-7 |
| 9 | Wire into government wizard | Tasks 2, 8 |
| 10 | Wire into advertise wizard | Task 8 |
| 11 | Save units on submit | Tasks 9 |
| 12 | Verification + push | All above |
