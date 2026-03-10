'use client';

const TEMPLATES = [
  { id: 'social-post', icon: '\u{1F4F1}', name: 'Social Post', desc: 'Instagram, Facebook, TikTok' },
  { id: 'newsletter', icon: '\u{1F4F0}', name: 'Newsletter Ad', desc: 'Email newsletter placement' },
  { id: 'display', icon: '\u{1F5BC}\uFE0F', name: 'Display Banner', desc: 'Website banner ads' },
  { id: 'blank', icon: '\u2728', name: 'Start Blank', desc: 'Build from scratch' },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function TemplatePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`p-6 rounded-xl text-center transition-all border-2 ${
            selected === t.id
              ? 'border-marigold-500 bg-marigold-50'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="text-3xl mb-2">{t.icon}</div>
          <div className="font-semibold text-gray-900">{t.name}</div>
          <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
        </button>
      ))}
    </div>
  );
}
