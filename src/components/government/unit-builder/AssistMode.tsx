'use client';

import { useState } from 'react';

interface AssistResult {
  recommendedTemplateId: string | null;
  headline: string;
  bodyText: string;
  ctaText: string;
  hashtags: string[];
  reasoning: string;
  aiGenerated: boolean;
}

interface AssistModeProps {
  campaignId: string;
  formatKey: string;
  platform: string;
  placement: string;
  onResult: (result: AssistResult) => void;
}

export function AssistMode({ campaignId, formatKey, platform, placement, onResult }: AssistModeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!campaignId) {
      setError('Campaign context not available. Save your campaign brief first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/units/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formatKey, platform, placement }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const result: AssistResult = await res.json();
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6 text-center">
      <div className="text-3xl mb-3">✨</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI-Assisted Creative</h3>
      <p className="text-sm text-gray-600 mb-1">
        Generate headlines, body copy, and CTA from your campaign brief.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        We&apos;ll also recommend the best template for your audience.
      </p>

      <div className="text-xs text-gray-500 bg-white/60 rounded-lg p-3 mb-4 text-left">
        <p><span className="font-medium">Format:</span> {formatKey.replace(/_/g, ' ')}</p>
        <p><span className="font-medium">Platform:</span> {platform}</p>
        <p><span className="font-medium">Placement:</span> {placement.replace(/_/g, ' ')}</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Generating...
          </span>
        ) : (
          'Generate Creative'
        )}
      </button>
    </div>
  );
}
