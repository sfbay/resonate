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
