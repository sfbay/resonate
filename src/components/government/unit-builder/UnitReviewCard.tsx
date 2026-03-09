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
