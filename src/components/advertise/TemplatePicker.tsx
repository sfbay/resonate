'use client';

const TEMPLATES = [
  {
    id: 'social-post',
    name: 'Social Post',
    desc: 'Instagram, Facebook, TikTok',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
    ),
  },
  {
    id: 'newsletter',
    name: 'Newsletter Ad',
    desc: 'Email newsletter placement',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
    ),
  },
  {
    id: 'display',
    name: 'Display Banner',
    desc: 'Website banner ads',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
    ),
  },
  {
    id: 'blank',
    name: 'Start Blank',
    desc: 'Build from scratch',
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
  },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function TemplatePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((t) => {
        const isSelected = selected === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`group relative p-5 rounded-xl text-left transition-all duration-200 border-2 ${
              isSelected
                ? 'border-marigold-500 bg-marigold-500/5 ring-glow-marigold'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isSelected ? 'bg-marigold-500/10 text-marigold-600' : `${t.iconBg} ${t.iconColor}`
            }`}>
              {t.icon}
            </div>
            <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-marigold-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
