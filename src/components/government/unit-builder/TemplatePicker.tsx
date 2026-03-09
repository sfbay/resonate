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
