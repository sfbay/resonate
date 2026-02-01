/**
 * Template Recommendation Engine
 *
 * Generates actionable recommendations based on content performance patterns.
 * Uses template-based rules before AI enhancement in Week 3.
 */

import type { PlatformType, RecommendationType, RecommendationPriority } from '@/lib/db/types';

// =============================================================================
// TYPES
// =============================================================================

export interface PerformanceData {
  platform: PlatformType;
  posts: PostMetrics[];
  followerCount: number;
  avgEngagementRate: number;
  growthRate30d: number;
}

export interface PostMetrics {
  id: string;
  platform: PlatformType;
  contentType: string;
  publishedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  impressions?: number;
  reach?: number;
  videoViews?: number;
  hashtags?: string[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  summary: string;
  actionItems: string[];
  platform?: PlatformType;
  basedOn: string;
  confidence: number; // 0-1
}

// =============================================================================
// TEMPLATE RULES
// =============================================================================

interface Rule {
  id: string;
  type: RecommendationType;
  check: (data: PerformanceData) => RuleResult | null;
}

interface RuleResult {
  priority: RecommendationPriority;
  title: string;
  summary: string;
  actionItems: string[];
  basedOn: string;
  confidence: number;
}

const RULES: Rule[] = [
  // ===========================================
  // CONTENT TIMING RULES
  // ===========================================
  {
    id: 'optimal-posting-time',
    type: 'content_timing',
    check: (data) => {
      if (data.posts.length < 10) return null;

      // Group posts by hour and calculate avg engagement
      const byHour = new Map<number, { count: number; totalEngagement: number }>();

      data.posts.forEach((post) => {
        const hour = post.publishedAt.getHours();
        const engagement = post.likes + post.comments * 3 + post.shares * 5;

        if (!byHour.has(hour)) {
          byHour.set(hour, { count: 0, totalEngagement: 0 });
        }
        const entry = byHour.get(hour)!;
        entry.count++;
        entry.totalEngagement += engagement;
      });

      // Find best and worst hours
      let bestHour = 0;
      let bestAvg = 0;
      let worstHour = 0;
      let worstAvg = Infinity;

      byHour.forEach((stats, hour) => {
        if (stats.count >= 2) {
          const avg = stats.totalEngagement / stats.count;
          if (avg > bestAvg) {
            bestAvg = avg;
            bestHour = hour;
          }
          if (avg < worstAvg) {
            worstAvg = avg;
            worstHour = hour;
          }
        }
      });

      if (bestAvg === 0 || worstAvg === Infinity) return null;
      if (bestAvg / worstAvg < 1.3) return null; // Not significant difference

      const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}${ampm}`;
      };

      return {
        priority: 'medium' as const,
        title: 'Optimize Your Posting Schedule',
        summary: `Posts published around ${formatHour(bestHour)} get ${Math.round(
          (bestAvg / worstAvg - 1) * 100
        )}% more engagement than those at ${formatHour(worstHour)}.`,
        actionItems: [
          `Schedule your most important content for ${formatHour(bestHour - 1)}-${formatHour(bestHour + 1)}`,
          `Avoid posting during ${formatHour(worstHour)} when your audience is less active`,
          'Use scheduling tools to maintain consistency',
        ],
        basedOn: `Analyzed ${data.posts.length} posts over time`,
        confidence: Math.min(0.9, 0.5 + data.posts.length / 50),
      };
    },
  },

  // ===========================================
  // CONTENT FORMAT RULES
  // ===========================================
  {
    id: 'video-performance',
    type: 'content_format',
    check: (data) => {
      const videos = data.posts.filter((p) =>
        ['video', 'reel'].includes(p.contentType.toLowerCase())
      );
      const images = data.posts.filter((p) =>
        ['post', 'image', 'carousel'].includes(p.contentType.toLowerCase())
      );

      if (videos.length < 3 || images.length < 3) return null;

      const avgVideoEngagement =
        videos.reduce((sum, p) => sum + p.likes + p.comments * 3, 0) / videos.length;
      const avgImageEngagement =
        images.reduce((sum, p) => sum + p.likes + p.comments * 3, 0) / images.length;

      const ratio = avgVideoEngagement / avgImageEngagement;

      if (ratio > 1.5) {
        return {
          priority: 'high' as const,
          title: 'Double Down on Video Content',
          summary: `Your video content gets ${Math.round(
            (ratio - 1) * 100
          )}% more engagement than static posts. Your audience clearly prefers video.`,
          actionItems: [
            'Create more short-form video content (Reels, TikToks)',
            'Repurpose your best-performing static posts as videos',
            'Aim for 60% video content in your mix',
          ],
          basedOn: `Compared ${videos.length} videos vs ${images.length} image posts`,
          confidence: Math.min(0.95, 0.6 + (videos.length + images.length) / 40),
        };
      }

      if (ratio < 0.7) {
        return {
          priority: 'medium' as const,
          title: 'Focus on Your Visual Strengths',
          summary: `Your image posts outperform videos by ${Math.round(
            (1 / ratio - 1) * 100
          )}%. Your audience connects more with static visuals.`,
          actionItems: [
            'Invest in high-quality photography and graphics',
            'Use carousel posts to tell longer stories',
            'Save video for announcements and behind-the-scenes content',
          ],
          basedOn: `Compared ${images.length} images vs ${videos.length} video posts`,
          confidence: Math.min(0.9, 0.5 + (videos.length + images.length) / 40),
        };
      }

      return null;
    },
  },

  // ===========================================
  // HASHTAG STRATEGY RULES
  // ===========================================
  {
    id: 'hashtag-optimization',
    type: 'hashtag_strategy',
    check: (data) => {
      const postsWithHashtags = data.posts.filter((p) => p.hashtags && p.hashtags.length > 0);

      if (postsWithHashtags.length < 5) return null;

      // Analyze hashtag impact
      const hashtagPerformance = new Map<string, { count: number; totalEngagement: number }>();

      postsWithHashtags.forEach((post) => {
        const engagement = post.likes + post.comments * 3 + post.shares * 5;

        post.hashtags?.forEach((tag) => {
          if (!hashtagPerformance.has(tag)) {
            hashtagPerformance.set(tag, { count: 0, totalEngagement: 0 });
          }
          const entry = hashtagPerformance.get(tag)!;
          entry.count++;
          entry.totalEngagement += engagement;
        });
      });

      // Find top performing hashtags
      const topHashtags = Array.from(hashtagPerformance.entries())
        .filter(([, stats]) => stats.count >= 2)
        .map(([tag, stats]) => ({
          tag,
          avgEngagement: stats.totalEngagement / stats.count,
          count: stats.count,
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 5);

      if (topHashtags.length < 3) return null;

      return {
        priority: 'medium' as const,
        title: 'Use Your Winning Hashtags',
        summary: `Your top-performing hashtags drive ${Math.round(
          topHashtags[0].avgEngagement
        )} avg engagement. Keep using what works.`,
        actionItems: [
          `Always include: #${topHashtags.slice(0, 3).map((h) => h.tag).join(', #')}`,
          `Rotate in these high performers: #${topHashtags.slice(3, 5).map((h) => h.tag).join(', #') || 'explore new tags'}`,
          'Limit to 8-12 hashtags per post for best results',
        ],
        basedOn: `Analyzed ${postsWithHashtags.length} posts with hashtags`,
        confidence: 0.7,
      };
    },
  },

  // ===========================================
  // AUDIENCE GROWTH RULES
  // ===========================================
  {
    id: 'growth-momentum',
    type: 'audience_growth',
    check: (data) => {
      if (data.growthRate30d > 10) {
        return {
          priority: 'high' as const,
          title: 'Capitalize on Your Growth Momentum',
          summary: `You're growing at ${data.growthRate30d.toFixed(1)}% per month - that's exceptional! Now's the time to accelerate.`,
          actionItems: [
            'Increase posting frequency by 20-30%',
            'Launch a collaboration with a similar-sized creator',
            'Create a signature content series to retain new followers',
            'Cross-promote on other platforms',
          ],
          basedOn: 'Last 30 days growth analysis',
          confidence: 0.85,
        };
      }

      if (data.growthRate30d < -5) {
        return {
          priority: 'high' as const,
          title: 'Address Your Audience Decline',
          summary: `Your audience has declined ${Math.abs(data.growthRate30d).toFixed(
            1
          )}% this month. Let's turn this around.`,
          actionItems: [
            'Review your last 10 posts - what changed?',
            'Ask your audience directly what they want to see',
            'Revisit your most successful content from 3 months ago',
            'Consider a fresh content angle or format',
          ],
          basedOn: 'Last 30 days growth analysis',
          confidence: 0.9,
        };
      }

      if (data.growthRate30d >= 0 && data.growthRate30d < 2) {
        return {
          priority: 'medium' as const,
          title: 'Break Through Your Growth Plateau',
          summary: `Your growth has stabilized at ${data.growthRate30d.toFixed(
            1
          )}%. Try something new to reignite momentum.`,
          actionItems: [
            'Experiment with a new content format (Lives, Stories, Threads)',
            'Partner with creators in adjacent niches',
            'Launch a weekly series or challenge',
            'Engage more in comments and community spaces',
          ],
          basedOn: 'Last 30 days growth analysis',
          confidence: 0.75,
        };
      }

      return null;
    },
  },

  // ===========================================
  // ENGAGEMENT BOOST RULES
  // ===========================================
  {
    id: 'comments-engagement',
    type: 'engagement_boost',
    check: (data) => {
      if (data.posts.length < 5) return null;

      const avgComments = data.posts.reduce((sum, p) => sum + p.comments, 0) / data.posts.length;
      const avgLikes = data.posts.reduce((sum, p) => sum + p.likes, 0) / data.posts.length;

      const commentToLikeRatio = avgComments / (avgLikes || 1);

      if (commentToLikeRatio < 0.02) {
        return {
          priority: 'medium' as const,
          title: 'Spark More Conversations',
          summary: `Your posts get likes but few comments (${Math.round(
            commentToLikeRatio * 100
          )}% ratio). Comments signal deeper engagement.`,
          actionItems: [
            'End every post with a specific question',
            'Use "This or That" and "Fill in the blank" formats',
            'Respond to every comment within the first hour',
            'Share controversial or opinion-based content',
          ],
          basedOn: `Analyzed comment patterns across ${data.posts.length} posts`,
          confidence: 0.8,
        };
      }

      if (commentToLikeRatio > 0.1) {
        return {
          priority: 'low' as const,
          title: 'Your Community is Engaged',
          summary: `Amazing! Your ${Math.round(
            commentToLikeRatio * 100
          )}% comment-to-like ratio shows a highly engaged audience.`,
          actionItems: [
            'Feature user comments in your Stories',
            'Create content based on frequently asked questions',
            'Consider launching a community group or newsletter',
          ],
          basedOn: `Analyzed engagement across ${data.posts.length} posts`,
          confidence: 0.85,
        };
      }

      return null;
    },
  },

  // ===========================================
  // CROSS-PLATFORM RULES
  // ===========================================
  {
    id: 'single-platform-risk',
    type: 'cross_platform',
    check: (data) => {
      // This rule fires when analyzing a single platform
      if (data.followerCount > 1000) {
        return {
          priority: 'low' as const,
          title: 'Diversify Your Platform Presence',
          summary: `With ${data.followerCount.toLocaleString()} followers on ${data.platform}, consider expanding to protect and grow your reach.`,
          actionItems: [
            'Repurpose top content for a secondary platform',
            'Start with the platform your audience uses second-most',
            'Maintain 80% focus on primary platform while testing',
            'Link your profiles to create a connected presence',
          ],
          basedOn: `Based on your ${data.platform} audience size`,
          confidence: 0.65,
        };
      }

      return null;
    },
  },
];

// =============================================================================
// RECOMMENDATION ENGINE
// =============================================================================

/**
 * Generate recommendations based on performance data
 */
export function generateRecommendations(data: PerformanceData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const rule of RULES) {
    try {
      const result = rule.check(data);
      if (result) {
        recommendations.push({
          id: `${rule.id}-${Date.now()}`,
          type: rule.type,
          priority: result.priority,
          title: result.title,
          summary: result.summary,
          actionItems: result.actionItems,
          platform: data.platform,
          basedOn: result.basedOn,
          confidence: result.confidence,
        });
      }
    } catch (error) {
      console.warn(`Rule ${rule.id} failed:`, error);
    }
  }

  // Sort by priority (high > medium > low)
  const priorityOrder: Record<RecommendationPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Generate recommendations for multiple platforms
 */
export function generateMultiPlatformRecommendations(
  platformData: PerformanceData[]
): Recommendation[] {
  const allRecommendations: Recommendation[] = [];

  for (const data of platformData) {
    const recs = generateRecommendations(data);
    allRecommendations.push(...recs);
  }

  // Dedupe similar recommendations, keeping highest priority
  const seen = new Map<string, Recommendation>();
  for (const rec of allRecommendations) {
    const key = rec.type;
    if (!seen.has(key) || priorityCompare(rec.priority, seen.get(key)!.priority) < 0) {
      seen.set(key, rec);
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => priorityCompare(a.priority, b.priority)
  );
}

function priorityCompare(a: RecommendationPriority, b: RecommendationPriority): number {
  const order: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
  return order[a] - order[b];
}
