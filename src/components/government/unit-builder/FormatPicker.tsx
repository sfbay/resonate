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
