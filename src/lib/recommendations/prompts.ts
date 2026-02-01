/**
 * AI Prompt Templates for Recommendation Generation
 *
 * Contains system and user prompts used by the AI recommendation service.
 * Prompts are designed to generate structured, actionable recommendations
 * based on social media performance data.
 */

import type { PlatformType, RecommendationType } from '@/lib/db/types';

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

export const SYSTEM_PROMPT = `You are an expert social media analytics consultant specializing in helping content creators and publishers grow their audience. You analyze performance data and provide specific, actionable recommendations.

Your recommendations should be:
1. DATA-DRIVEN: Based on the actual metrics provided, not generic advice
2. SPECIFIC: Include concrete actions, not vague suggestions
3. PRIORITIZED: Focus on high-impact opportunities first
4. REALISTIC: Achievable within the creator's current capacity

When analyzing data, consider:
- Content format performance (video vs images vs carousels)
- Posting time patterns and audience activity
- Engagement quality (comments vs likes ratio)
- Growth trajectory and momentum
- Hashtag and mention effectiveness
- Platform-specific best practices

You MUST respond with valid JSON only. Do not include any text before or after the JSON.`;

// =============================================================================
// OUTPUT FORMAT SPECIFICATION
// =============================================================================

export const OUTPUT_FORMAT = `
Respond with a JSON object containing an array of recommendations. Each recommendation must have:

{
  "recommendations": [
    {
      "type": "content_format" | "content_timing" | "hashtag_strategy" | "audience_growth" | "engagement_boost" | "cross_platform",
      "priority": "high" | "medium" | "low",
      "title": "Short, action-oriented title (max 60 chars)",
      "summary": "2-3 sentence explanation of the insight and why it matters",
      "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "basedOn": "Brief description of the data this is based on",
      "confidence": 0.0-1.0
    }
  ]
}

Generate 2-4 recommendations, prioritizing the most impactful insights. Do not generate more than 4 recommendations.`;

// =============================================================================
// USER PROMPT BUILDER
// =============================================================================

export interface PerformanceDataForPrompt {
  platform: PlatformType;
  followerCount: number;
  avgEngagementRate: number;
  growthRate30d: number;
  posts: Array<{
    contentType: string;
    publishedAt: Date;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    impressions?: number;
    reach?: number;
    hashtags?: string[];
  }>;
}

/**
 * Build the user prompt with performance data
 */
export function buildUserPrompt(data: PerformanceDataForPrompt): string {
  const postSummaries = data.posts.slice(0, 30).map((post, index) => {
    const engagementScore = post.likes + (post.comments * 3) + (post.shares * 5) + (post.saves || 0) * 2;
    const dayOfWeek = post.publishedAt.toLocaleDateString('en-US', { weekday: 'short' });
    const hour = post.publishedAt.getHours();
    const timeStr = `${hour}:00`;

    return `Post ${index + 1}: ${post.contentType} on ${dayOfWeek} at ${timeStr}
  - Likes: ${post.likes}, Comments: ${post.comments}, Shares: ${post.shares}${post.saves ? `, Saves: ${post.saves}` : ''}
  - Engagement Score: ${engagementScore}${post.impressions ? `, Impressions: ${post.impressions}` : ''}${post.reach ? `, Reach: ${post.reach}` : ''}${post.hashtags?.length ? `\n  - Hashtags: #${post.hashtags.slice(0, 5).join(' #')}` : ''}`;
  }).join('\n\n');

  // Calculate content type distribution
  const contentTypes = data.posts.reduce((acc, post) => {
    acc[post.contentType] = (acc[post.contentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contentMix = Object.entries(contentTypes)
    .map(([type, count]) => `${type}: ${count} (${Math.round(count / data.posts.length * 100)}%)`)
    .join(', ');

  // Calculate posting time distribution
  const hourBuckets: Record<string, number> = {};
  data.posts.forEach((post) => {
    const hour = post.publishedAt.getHours();
    const bucket = hour < 6 ? 'Night (12am-6am)' :
                   hour < 12 ? 'Morning (6am-12pm)' :
                   hour < 18 ? 'Afternoon (12pm-6pm)' : 'Evening (6pm-12am)';
    hourBuckets[bucket] = (hourBuckets[bucket] || 0) + 1;
  });

  const timingDistribution = Object.entries(hourBuckets)
    .map(([bucket, count]) => `${bucket}: ${count} posts`)
    .join(', ');

  // Find top hashtags
  const hashtagCounts: Record<string, number> = {};
  data.posts.forEach((post) => {
    post.hashtags?.forEach((tag) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => `#${tag} (${count}x)`)
    .join(', ');

  return `Analyze this ${data.platform} account's performance and provide recommendations.

## Account Overview
- Platform: ${data.platform}
- Followers: ${data.followerCount.toLocaleString()}
- Average Engagement Rate: ${data.avgEngagementRate.toFixed(2)}%
- 30-Day Growth Rate: ${data.growthRate30d >= 0 ? '+' : ''}${data.growthRate30d.toFixed(1)}%
- Posts Analyzed: ${data.posts.length}

## Content Mix
${contentMix}

## Posting Time Distribution
${timingDistribution}

## Top Hashtags Used
${topHashtags || 'No hashtags data available'}

## Recent Post Performance
${postSummaries}

${OUTPUT_FORMAT}`;
}

// =============================================================================
// RECOMMENDATION TYPE DESCRIPTIONS
// =============================================================================

export const RECOMMENDATION_TYPES: Record<RecommendationType, string> = {
  content_format: 'Recommendations about video vs image vs carousel content',
  content_timing: 'Optimal posting times and scheduling',
  hashtag_strategy: 'Hashtag optimization and discovery',
  audience_growth: 'Strategies to accelerate follower growth',
  engagement_boost: 'Ways to increase comments, shares, and saves',
  cross_platform: 'Expanding to or leveraging other platforms',
  trending_topic: 'Current trends to leverage in content',
  competitor_insight: 'What similar publishers do well',
  web_traffic: 'Driving traffic from social to website',
  monetization: 'Revenue optimization strategies',
};
