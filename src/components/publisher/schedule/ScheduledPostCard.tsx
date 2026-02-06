'use client';

/**
 * ScheduledPostCard
 *
 * Displays a single scheduled post with platform, status, and content preview.
 */

export interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  media_urls: string[] | null;
  scheduled_for: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  created_at: string;
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onEdit?: (post: ScheduledPost) => void;
}

const platformIcons: Record<string, string> = {
  instagram: 'IG',
  facebook: 'FB',
  tiktok: 'TT',
  mailchimp: 'NL',
  substack: 'SB',
  twitter: 'TW',
};

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  tiktok: 'bg-gray-900',
  mailchimp: 'bg-yellow-500',
  substack: 'bg-orange-500',
  twitter: 'bg-sky-500',
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600 bg-gray-100', dot: 'bg-gray-400' },
  scheduled: { label: 'Scheduled', color: 'text-blue-700 bg-blue-50', dot: 'bg-blue-500' },
  published: { label: 'Published', color: 'text-green-700 bg-green-50', dot: 'bg-green-500' },
  failed: { label: 'Failed', color: 'text-red-700 bg-red-50', dot: 'bg-red-500' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateFormatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (days === 0) return `Today at ${timeStr}`;
  if (days === 1) return `Tomorrow at ${timeStr}`;
  if (days === -1) return `Yesterday at ${timeStr}`;
  if (days < -1) return `${dateFormatted} at ${timeStr}`;
  return `${dateFormatted} at ${timeStr}`;
}

export function ScheduledPostCard({ post, onEdit }: ScheduledPostCardProps) {
  const status = statusConfig[post.status] || statusConfig.draft;
  const platformColor = platformColors[post.platform] || 'bg-gray-500';
  const platformIcon = platformIcons[post.platform] || post.platform.slice(0, 2).toUpperCase();

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onEdit?.(post)}
    >
      <div className="flex items-start gap-3">
        {/* Platform icon */}
        <div className={`w-10 h-10 rounded-lg ${platformColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {platformIcon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: platform + status */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 capitalize">
              {post.platform}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Content preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {post.content}
          </p>

          {/* Media indicator + date */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatDate(post.scheduled_for)}</span>
            {post.media_urls && post.media_urls.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {post.media_urls.length} media
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
