'use client';

/**
 * Ad Builder — AI-Powered Creative Generation
 *
 * Workspace for generating ad creative across formats:
 * social posts, display ads, newsletter copy, text ads, story/reel scripts.
 *
 * Supports multilingual variants with cultural adaptation.
 * Uses real AI generation via the existing AI provider factory.
 *
 * DEMO: Falls back to mock creative data if AI provider is not configured.
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { getDemoCreative, getDemoLanguageVariants, getDemoCreativeSet } from '@/lib/demo/creative-data';
import { FORMAT_LABELS, FORMAT_CONSTRAINTS, type CreativeFormat, type CreativeTone, type CreativeOutput, type LanguageVariant } from '@/lib/ai/creative/types';
import type { Language } from '@/types';

const TONE_OPTIONS: { value: CreativeTone; label: string; desc: string }[] = [
  { value: 'informational', label: 'Informational', desc: 'Neutral, factual' },
  { value: 'urgent', label: 'Urgent', desc: 'Time-sensitive' },
  { value: 'celebratory', label: 'Celebratory', desc: 'Positive, upbeat' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Compassionate' },
  { value: 'conversational', label: 'Conversational', desc: 'Casual, relatable' },
  { value: 'authoritative', label: 'Authoritative', desc: 'Official' },
  { value: 'inspiring', label: 'Inspiring', desc: 'Motivational' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'chinese_cantonese', label: 'Cantonese' },
  { value: 'chinese_mandarin', label: 'Mandarin' },
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'korean', label: 'Korean' },
  { value: 'russian', label: 'Russian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'arabic', label: 'Arabic' },
];

const FORMAT_OPTIONS: CreativeFormat[] = ['social_post', 'display_ad', 'newsletter_copy', 'text_ad', 'story_script', 'reel_script'];

export default function AdBuilderPage() {
  // Brief form state
  const [campaignName, setCampaignName] = useState('Flu Shot Awareness 2026');
  const [description, setDescription] = useState('Promote free flu vaccination clinics across SF neighborhoods');
  const [audience, setAudience] = useState('Latino, Chinese, and Filipino families in Mission, Bayview, and Chinatown');
  const [keyMessages, setKeyMessages] = useState('Free, No insurance needed, Walk-in, Neighborhood clinics');
  const [cta, setCta] = useState('Visit sf.gov/flushots');
  const [tone, setTone] = useState<CreativeTone>('empathetic');
  const [format, setFormat] = useState<CreativeFormat>('social_post');
  const [languages, setLanguages] = useState<Language[]>(['english', 'spanish']);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [creative, setCreative] = useState<CreativeOutput | null>(null);
  const [variants, setVariants] = useState<LanguageVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState<Language>('english');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Try real AI generation first
      const response = await fetch('/api/creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          description,
          audience,
          keyMessages: keyMessages.split(',').map(s => s.trim()),
          callToAction: cta,
          tone,
          format,
          languages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.creative) {
          setCreative(data.creative);
          setVariants(data.variants || []);
          setActiveVariant(languages[0]);
          setIsGenerating(false);
          return;
        }
      }

      // Fallback to demo data
      const demoCreative = getDemoCreative(format);
      const demoVariants = getDemoLanguageVariants();
      setCreative(demoCreative);
      setVariants(demoVariants);
      setActiveVariant('english');
    } catch {
      // Use demo data on any error
      const demoCreative = getDemoCreative(format);
      const demoVariants = getDemoLanguageVariants();
      setCreative(demoCreative);
      setVariants(demoVariants);
      setActiveVariant('english');
    } finally {
      setIsGenerating(false);
    }
  }, [campaignName, description, audience, keyMessages, cta, tone, format, languages]);

  const toggleLanguage = (lang: Language) => {
    setLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const currentVariant = variants.find(v => v.language === activeVariant);
  const displayCreative = currentVariant?.creative || creative;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/publisher/dashboard" className="text-sm text-slate-400 hover:text-coral-500">Dashboard</Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-700">Ad Builder</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] font-[family-name:var(--font-display)]">
            AI Creative Studio
          </h1>
          <p className="text-slate-500 mt-1">Generate culturally adapted ad creative in multiple languages and formats.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Brief Form (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-[var(--color-charcoal)] mb-4">Campaign Brief</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Campaign Name</label>
                  <input
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Target Audience</label>
                  <textarea
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Key Messages (comma-separated)</label>
                  <input
                    value={keyMessages}
                    onChange={e => setKeyMessages(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Call to Action</label>
                  <input
                    value={cta}
                    onChange={e => setCta(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Tone */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-[var(--color-charcoal)] mb-3">Tone</h2>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tone === opt.value
                        ? 'bg-coral-500 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Format */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-[var(--color-charcoal)] mb-3">Format</h2>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map(f => {
                  const constraints = FORMAT_CONSTRAINTS[f];
                  return (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`p-3 rounded-lg text-left transition-colors border ${
                        format === f
                          ? 'border-coral-500 bg-coral-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <p className={`text-sm font-medium ${format === f ? 'text-coral-600' : 'text-[var(--color-charcoal)]'}`}>
                        {FORMAT_LABELS[f]}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Max {constraints.maxCharacters} chars</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-[var(--color-charcoal)] mb-3">Languages</h2>
              <p className="text-xs text-slate-400 mb-3">Select languages for culturally adapted variants</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => toggleLanguage(lang.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      languages.includes(lang.value)
                        ? 'bg-coral-500 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn btn-coral py-3 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating creative...
                </span>
              ) : (
                'Generate Creative'
              )}
            </button>
          </div>

          {/* RIGHT: Preview (3 cols) */}
          <div className="lg:col-span-3">
            {displayCreative ? (
              <div className="space-y-4">
                {/* Language Variant Tabs */}
                {variants.length > 1 && (
                  <div className="flex gap-2">
                    {variants.map(v => {
                      const langLabel = LANGUAGE_OPTIONS.find(l => l.value === v.language)?.label || v.language;
                      return (
                        <button
                          key={v.language}
                          onClick={() => setActiveVariant(v.language)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeVariant === v.language
                              ? 'bg-coral-500 text-white'
                              : 'bg-white border border-gray-200 text-slate-600 hover:border-gray-300'
                          }`}
                        >
                          {langLabel}
                          {v.isOriginal && <span className="ml-1 text-xs opacity-70">(original)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Creative Preview Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--color-charcoal)]">
                        {FORMAT_LABELS[displayCreative.format]} Preview
                      </h3>
                      <p className="text-xs text-slate-400">
                        {displayCreative.characterCount} characters · {displayCreative.wordCount} words
                      </p>
                    </div>
                    <button className="text-sm text-coral-500 hover:text-coral-600 font-medium">
                      Copy to clipboard
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Headline */}
                    {displayCreative.headline && (
                      <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-2 font-[family-name:var(--font-display)]">
                        {displayCreative.headline}
                      </h2>
                    )}

                    {/* Subheadline */}
                    {displayCreative.subheadline && (
                      <p className="text-lg text-slate-600 mb-3">{displayCreative.subheadline}</p>
                    )}

                    {/* Preheader */}
                    {displayCreative.preheader && (
                      <p className="text-sm text-slate-400 italic mb-3">{displayCreative.preheader}</p>
                    )}

                    {/* Body */}
                    <div className="text-[var(--color-charcoal)] whitespace-pre-wrap leading-relaxed">
                      {displayCreative.body}
                    </div>

                    {/* Scenes (for story/reel scripts) */}
                    {displayCreative.scenes && displayCreative.scenes.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Scenes</p>
                        {displayCreative.scenes.map(scene => (
                          <div key={scene.order} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 bg-coral-500/10 text-coral-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {scene.order}
                              </span>
                              <span className="text-xs text-slate-400">{scene.duration}s</span>
                              {scene.transition && <span className="text-xs text-slate-400">· {scene.transition}</span>}
                            </div>
                            <p className="text-sm text-slate-600">{scene.visual}</p>
                            {scene.text && <p className="text-sm font-medium text-[var(--color-charcoal)] mt-1">{scene.text}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {displayCreative.callToAction && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="inline-block px-4 py-2 bg-coral-500 text-white rounded-full text-sm font-medium">
                          {displayCreative.callToAction}
                        </span>
                      </div>
                    )}

                    {/* Hashtags */}
                    {displayCreative.hashtags && displayCreative.hashtags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {displayCreative.hashtags.map(tag => (
                          <span key={tag} className="text-sm text-blue-500">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cultural Adaptation Notes */}
                {currentVariant && !currentVariant.isOriginal && (
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                    <h4 className="font-medium text-amber-800 mb-2">Cultural Adaptation Notes</h4>
                    <p className="text-sm text-amber-700">{currentVariant.culturalAdaptation}</p>
                  </div>
                )}

                {/* Cultural Notes from AI */}
                {displayCreative.culturalNotes && displayCreative.culturalNotes.length > 0 && (
                  <div className="bg-teal-50 rounded-xl border border-teal-200 p-5">
                    <h4 className="font-medium text-teal-800 mb-2">Cultural Context</h4>
                    <ul className="space-y-1">
                      {displayCreative.culturalNotes.map((note, i) => (
                        <li key={i} className="text-sm text-teal-700 flex items-start gap-2">
                          <span className="text-teal-400 mt-0.5">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Image Prompt */}
                {displayCreative.imagePrompt && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h4 className="font-medium text-slate-700 mb-2">Suggested Image</h4>
                    <p className="text-sm text-slate-600">{displayCreative.imagePrompt}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-coral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-charcoal)]">Ready to create</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Fill in your campaign brief, select a format and languages, then click Generate to create AI-powered ad creative with cultural adaptations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
