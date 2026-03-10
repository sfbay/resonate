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

// Deterministic gradient from publisher name
function nameToGradient(name: string): string {
  const gradients = [
    'from-teal-500 to-teal-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-sky-500 to-sky-600',
    'from-emerald-500 to-emerald-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export function PublisherCard({ publisher, selected, onToggle }: Props) {
  const gradient = nameToGradient(publisher.name);

  return (
    <button
      onClick={() => onToggle(publisher.id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 ${
        selected
          ? 'border-teal-500 bg-teal-500/5 ring-glow-teal'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
        {publisher.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{publisher.name}</div>
        <div className="text-xs text-gray-500 truncate mt-0.5">
          {publisher.neighborhoods.length > 0 && <>{publisher.neighborhoods.join(', ')} · </>}
          {publisher.reach > 0 && <>{formatReach(publisher.reach)} reach · </>}
          {publisher.languages.length > 1 ? publisher.languages.join('/') : publisher.languages[0] || 'English'}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-teal-600 text-sm">{formatCents(publisher.startingPrice)}</div>
        <div className="text-[10px] text-gray-400">starting</div>
      </div>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        selected ? 'bg-teal-500 border-teal-500 text-white scale-110' : 'border-gray-300'
      }`}>
        {selected && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        )}
      </div>
    </button>
  );
}
