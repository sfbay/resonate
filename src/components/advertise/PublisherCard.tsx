'use client';

import { formatCents } from '@/lib/transactions/pricing';

export interface PublisherCardData {
  id: string;
  name: string;
  neighborhoods: string[];
  reach: number;
  languages: string[];
  startingPrice: number; // cents
}

function formatReach(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n);
}

interface Props {
  publisher: PublisherCardData;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function PublisherCard({ publisher, selected, onToggle }: Props) {
  return (
    <button
      onClick={() => onToggle(publisher.id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border-2 ${
        selected
          ? 'border-teal-500 bg-teal-50'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
        {publisher.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{publisher.name}</div>
        <div className="text-xs text-gray-500 truncate">
          {publisher.neighborhoods.join(', ')} · {formatReach(publisher.reach)} reach
          {publisher.languages.length > 1 && ` · ${publisher.languages.join('/')}`}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-teal-600">{formatCents(publisher.startingPrice)}</div>
      </div>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${
        selected ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-300'
      }`}>
        {selected && '✓'}
      </div>
    </button>
  );
}
