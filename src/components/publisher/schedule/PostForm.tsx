'use client';

/**
 * PostForm
 *
 * Create/edit form for scheduled posts.
 * Uses the coral publisher theme.
 */

import { useState } from 'react';
import type { ScheduledPost } from './ScheduledPostCard';

interface PostFormProps {
  post?: ScheduledPost | null;
  onSubmit: (data: {
    platform: string;
    content: string;
    scheduled_for: string;
    status: string;
  }) => void;
  onCancel: () => void;
}

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'mailchimp', label: 'Newsletter' },
  { value: 'twitter', label: 'Twitter/X' },
];

function toLocalDatetime(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [platform, setPlatform] = useState(post?.platform || 'instagram');
  const [content, setContent] = useState(post?.content || '');
  const [scheduledFor, setScheduledFor] = useState(toLocalDatetime(post?.scheduled_for));
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published' | 'failed'>(post?.status || 'draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform,
      content,
      scheduled_for: new Date(scheduledFor).toISOString(),
      status,
    });
  };

  const charCount = content.length;
  const maxChars = platform === 'twitter' ? 280 : 2200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Platform
        </label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlatform(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                platform === p.value
                  ? 'bg-coral-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none text-sm"
          placeholder="Write your post content..."
          required
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${charCount > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      {/* Schedule date/time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Schedule for
        </label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-sm"
          required
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Status
        </label>
        <div className="flex gap-3">
          {['draft', 'scheduled'].map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s as 'draft' | 'scheduled')}
                className="text-coral-500 focus:ring-coral-500"
              />
              <span className="text-sm capitalize text-gray-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 px-4 bg-coral-500 text-white rounded-lg font-medium hover:bg-coral-600 transition-colors text-sm"
        >
          {post ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
