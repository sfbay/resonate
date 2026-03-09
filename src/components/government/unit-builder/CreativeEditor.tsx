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
