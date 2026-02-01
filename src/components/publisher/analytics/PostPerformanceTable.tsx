'use client';

/**
 * PostPerformanceTable Component
 *
 * Displays individual post performance metrics in a sortable table.
 * Shows engagement scores, impressions, and platform breakdown.
 */

import { useState, useMemo } from 'react';
import type { PlatformType, ContentType } from '@/lib/db/types';

// =============================================================================
// TYPES
// =============================================================================

export interface PostPerformance {
  id: string;
  platform: PlatformType;
  contentType: ContentType;
  publishedAt: Date;
  captionExcerpt: string | null;
  thumbnailUrl: string | null;
  contentUrl: string | null;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  videoViews: number | null;
  engagementScore: number;
  engagementRate: number | null;
}

interface PostPerformanceTableProps {
  posts: PostPerformance[];
  isLoading?: boolean;
  onPostClick?: (post: PostPerformance) => void;
}

type SortField = 'publishedAt' | 'engagementScore' | 'impressions' | 'reach' | 'likes';
type SortDirection = 'asc' | 'desc';

// =============================================================================
// PLATFORM ICONS & COLORS
// =============================================================================

const PLATFORM_CONFIG: Record<PlatformType, { icon: string; color: string; bgColor: string }> = {
  instagram: { icon: '📸', color: '#E4405F', bgColor: 'bg-pink-50' },
  facebook: { icon: '📘', color: '#1877F2', bgColor: 'bg-blue-50' },
  tiktok: { icon: '🎵', color: '#000000', bgColor: 'bg-gray-50' },
  twitter: { icon: '𝕏', color: '#1DA1F2', bgColor: 'bg-sky-50' },
  youtube: { icon: '▶️', color: '#FF0000', bgColor: 'bg-red-50' },
  mailchimp: { icon: '📧', color: '#FFE01B', bgColor: 'bg-yellow-50' },
  substack: { icon: '📰', color: '#FF6719', bgColor: 'bg-orange-50' },
  whatsapp: { icon: '💬', color: '#25D366', bgColor: 'bg-green-50' },
  telegram: { icon: '✈️', color: '#0088CC', bgColor: 'bg-cyan-50' },
  signal: { icon: '🔒', color: '#3A76F0', bgColor: 'bg-indigo-50' },
  sms: { icon: '💬', color: '#4CAF50', bgColor: 'bg-green-50' },
  weibo: { icon: '🌐', color: '#E6162D', bgColor: 'bg-red-50' },
  newsletter: { icon: '✉️', color: '#6B7280', bgColor: 'bg-gray-50' },
  website: { icon: '🌐', color: '#6B7280', bgColor: 'bg-gray-50' },
  other: { icon: '📱', color: '#6B7280', bgColor: 'bg-gray-50' },
  google: { icon: '📊', color: '#EA4335', bgColor: 'bg-orange-50' },
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
  video: 'Video',
  carousel: 'Carousel',
  article: 'Article',
  newsletter: 'Newsletter',
  broadcast: 'Broadcast',
};

// =============================================================================
// SORT INDICATOR COMPONENT
// =============================================================================

interface SortIndicatorProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}

function SortIndicator({ field, currentField, direction }: SortIndicatorProps) {
  if (currentField !== field) return <span className="text-slate-300 ml-1">↕</span>;
  return <span className="text-coral-500 ml-1">{direction === 'desc' ? '↓' : '↑'}</span>;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PostPerformanceTable({
  posts,
  isLoading,
  onPostClick,
}: PostPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('publishedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [platformFilter, setPlatformFilter] = useState<PlatformType | 'all'>('all');

  // Get unique platforms from posts
  const availablePlatforms = useMemo(() => {
    const platforms = new Set(posts.map((p) => p.platform));
    return Array.from(platforms);
  }, [posts]);

  // Filter and sort posts
  const sortedPosts = useMemo(() => {
    let filtered = posts;

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = posts.filter((p) => p.platform === platformFilter);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal: number | Date = 0;
      let bVal: number | Date = 0;

      switch (sortField) {
        case 'publishedAt':
          aVal = a.publishedAt;
          bVal = b.publishedAt;
          break;
        case 'engagementScore':
          aVal = a.engagementScore;
          bVal = b.engagementScore;
          break;
        case 'impressions':
          aVal = a.impressions || 0;
          bVal = b.impressions || 0;
          break;
        case 'reach':
          aVal = a.reach || 0;
          bVal = b.reach || 0;
          break;
        case 'likes':
          aVal = a.likes || 0;
          bVal = b.likes || 0;
          break;
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'desc'
          ? bVal.getTime() - aVal.getTime()
          : aVal.getTime() - bVal.getTime();
      }

      return sortDirection === 'desc'
        ? (bVal as number) - (aVal as number)
        : (aVal as number) - (bVal as number);
    });
  }, [posts, sortField, sortDirection, platformFilter]);

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format number with K/M suffix
  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Engagement score color
  const getScoreColor = (score: number): string => {
    if (score >= 1000) return 'text-emerald-600 bg-emerald-50';
    if (score >= 500) return 'text-teal-600 bg-teal-50';
    if (score >= 100) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="h-12 bg-slate-100 rounded" />
          <div className="h-12 bg-slate-100 rounded" />
          <div className="h-12 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-charcoal text-lg">Content Performance</h3>
          <p className="text-sm text-slate-500">
            {sortedPosts.length} post{sortedPosts.length !== 1 ? 's' : ''} across{' '}
            {availablePlatforms.length} platform{availablePlatforms.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filter:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PlatformType | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500"
          >
            <option value="all">All Platforms</option>
            {availablePlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_CONFIG[platform]?.icon} {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Content
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-charcoal"
                onClick={() => handleSort('publishedAt')}
              >
                Posted <SortIndicator field="publishedAt" currentField={sortField} direction={sortDirection} />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-charcoal"
                onClick={() => handleSort('engagementScore')}
              >
                Score <SortIndicator field="engagementScore" currentField={sortField} direction={sortDirection} />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-charcoal"
                onClick={() => handleSort('impressions')}
              >
                Impressions <SortIndicator field="impressions" currentField={sortField} direction={sortDirection} />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-charcoal"
                onClick={() => handleSort('reach')}
              >
                Reach <SortIndicator field="reach" currentField={sortField} direction={sortDirection} />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-charcoal"
                onClick={() => handleSort('likes')}
              >
                Likes <SortIndicator field="likes" currentField={sortField} direction={sortDirection} />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Shares
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedPosts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No posts found. Connect a platform to see your content performance.
                </td>
              </tr>
            ) : (
              sortedPosts.map((post) => {
                const platformConfig = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.other;

                return (
                  <tr
                    key={post.id}
                    onClick={() => onPostClick?.(post)}
                    className={`hover:bg-slate-50 transition-colors ${
                      onPostClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {/* Content preview */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${platformConfig.bgColor}`}
                        >
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-xl">{platformConfig.icon}</span>
                          )}
                        </div>

                        {/* Caption & meta */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-charcoal line-clamp-2 font-medium">
                            {post.captionExcerpt || 'No caption'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${platformConfig.color}15`,
                                color: platformConfig.color,
                              }}
                            >
                              {post.platform}
                            </span>
                            <span className="text-xs text-slate-400">
                              {CONTENT_TYPE_LABELS[post.contentType] || post.contentType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(post.publishedAt)}
                    </td>

                    {/* Engagement Score */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                          post.engagementScore
                        )}`}
                      >
                        {formatNumber(post.engagementScore)}
                      </span>
                    </td>

                    {/* Impressions */}
                    <td className="px-4 py-4 text-right text-sm text-charcoal font-medium">
                      {formatNumber(post.impressions)}
                    </td>

                    {/* Reach */}
                    <td className="px-4 py-4 text-right text-sm text-charcoal font-medium">
                      {formatNumber(post.reach)}
                    </td>

                    {/* Likes */}
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      {formatNumber(post.likes)}
                    </td>

                    {/* Comments */}
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      {formatNumber(post.comments)}
                    </td>

                    {/* Shares */}
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      {formatNumber(post.shares)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      {sortedPosts.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>
              Total Impressions:{' '}
              <span className="font-semibold text-charcoal">
                {formatNumber(sortedPosts.reduce((sum, p) => sum + (p.impressions || 0), 0))}
              </span>
            </span>
            <span>
              Total Reach:{' '}
              <span className="font-semibold text-charcoal">
                {formatNumber(sortedPosts.reduce((sum, p) => sum + (p.reach || 0), 0))}
              </span>
            </span>
            <span>
              Avg Score:{' '}
              <span className="font-semibold text-charcoal">
                {Math.round(
                  sortedPosts.reduce((sum, p) => sum + p.engagementScore, 0) / sortedPosts.length
                ).toLocaleString()}
              </span>
            </span>
          </div>

          {sortedPosts[0]?.contentUrl && (
            <a
              href={sortedPosts[0].contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-coral-500 hover:text-coral-600 font-medium"
            >
              View top post →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
