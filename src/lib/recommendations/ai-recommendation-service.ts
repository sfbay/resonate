/**
 * AI Recommendation Service
 *
 * Generates AI-powered recommendations using the configured AI provider.
 * Falls back to template-based recommendations if AI is unavailable.
 */

import { createClient } from '@supabase/supabase-js';
import {
  generateCompletion,
  isAIEnabled,
  getAIProviderName,
  getAIModelName,
} from '@/lib/ai';
import type { AIRecommendationOutput } from '@/lib/ai/types';
import type {
  PlatformType,
  RecommendationType,
  RecommendationPriority,
  RecommendationActionItem,
} from '@/lib/db/types';
import { SYSTEM_PROMPT, buildUserPrompt, type PerformanceDataForPrompt } from './prompts';
import { generateRecommendations, type PerformanceData } from './template-engine';

// =============================================================================
// TYPES
// =============================================================================

export interface GrowthMetrics {
  totalFollowers: number;
  avgEngagementRate: number;
  growth30d: {
    absolute: number;
    growthRate: number;
  };
}

export interface ContentPerformance {
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
  hashtags?: string[];
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  summary: string;
  actionItems: string[];
  platform?: PlatformType;
  basedOn: string;
  confidence: number;
  isAIGenerated: boolean;
  aiModel?: string;
  aiProvider?: string;
}

export interface GenerateRecommendationsResult {
  recommendations: AIRecommendation[];
  source: 'ai' | 'template' | 'hybrid';
  aiModel?: string;
  aiProvider?: string;
  promptTokens?: number;
  completionTokens?: number;
  error?: string;
}

// =============================================================================
// AI RECOMMENDATION GENERATION
// =============================================================================

/**
 * Generate AI-powered recommendations from performance data
 */
export async function generateAIRecommendations(
  publisherId: string,
  posts: ContentPerformance[],
  metrics: GrowthMetrics,
  primaryPlatform?: PlatformType
): Promise<GenerateRecommendationsResult> {
  // Determine primary platform from posts if not specified
  const platform = primaryPlatform || determinePrimaryPlatform(posts);

  // Check if AI is enabled
  if (!isAIEnabled()) {
    console.log('AI not enabled, falling back to template recommendations');
    return generateTemplateRecommendations(posts, metrics, platform);
  }

  try {
    // Build prompt data
    const promptData: PerformanceDataForPrompt = {
      platform,
      followerCount: metrics.totalFollowers,
      avgEngagementRate: metrics.avgEngagementRate,
      growthRate30d: metrics.growth30d.growthRate,
      posts: posts.map((post) => ({
        contentType: post.contentType,
        publishedAt: post.publishedAt,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
        impressions: post.impressions,
        reach: post.reach,
        hashtags: post.hashtags,
      })),
    };

    // Generate AI completion
    const userPrompt = buildUserPrompt(promptData);
    const response = await generateCompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 2048,
      temperature: 0.7,
    });

    // Parse AI response
    const aiRecommendations = parseAIResponse(response.content);
    const aiProvider = getAIProviderName();
    const aiModel = getAIModelName();

    // Convert to AIRecommendation format
    const recommendations: AIRecommendation[] = aiRecommendations.map((rec, index) => ({
      id: `ai-${platform}-${Date.now()}-${index}`,
      type: validateRecommendationType(rec.type),
      priority: validatePriority(rec.priority),
      title: rec.title,
      summary: rec.summary,
      actionItems: rec.actionItems,
      platform,
      basedOn: rec.basedOn,
      confidence: Math.min(1, Math.max(0, rec.confidence)),
      isAIGenerated: true,
      aiModel,
      aiProvider,
    }));

    return {
      recommendations,
      source: 'ai',
      aiModel,
      aiProvider,
      promptTokens: response.usage?.inputTokens,
      completionTokens: response.usage?.outputTokens,
    };
  } catch (error) {
    console.error('AI recommendation generation failed:', error);

    // Fall back to template recommendations
    const templateResult = generateTemplateRecommendations(posts, metrics, platform);
    return {
      ...templateResult,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate template-based recommendations (fallback)
 */
function generateTemplateRecommendations(
  posts: ContentPerformance[],
  metrics: GrowthMetrics,
  platform: PlatformType
): GenerateRecommendationsResult {
  const performanceData: PerformanceData = {
    platform,
    posts: posts.map((post) => ({
      id: post.id,
      platform: post.platform,
      contentType: post.contentType,
      publishedAt: post.publishedAt,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      saves: post.saves,
      impressions: post.impressions,
      reach: post.reach,
      hashtags: post.hashtags,
    })),
    followerCount: metrics.totalFollowers,
    avgEngagementRate: metrics.avgEngagementRate,
    growthRate30d: metrics.growth30d.growthRate,
  };

  const templateRecs = generateRecommendations(performanceData);

  const recommendations: AIRecommendation[] = templateRecs.map((rec) => ({
    ...rec,
    isAIGenerated: false,
  }));

  return {
    recommendations,
    source: 'template',
  };
}

/**
 * Generate hybrid recommendations (AI + template)
 */
export async function generateHybridRecommendations(
  publisherId: string,
  posts: ContentPerformance[],
  metrics: GrowthMetrics,
  primaryPlatform?: PlatformType
): Promise<GenerateRecommendationsResult> {
  const platform = primaryPlatform || determinePrimaryPlatform(posts);

  // Get template recommendations
  const templateResult = generateTemplateRecommendations(posts, metrics, platform);

  // Try to get AI recommendations
  if (!isAIEnabled()) {
    return templateResult;
  }

  try {
    const aiResult = await generateAIRecommendations(publisherId, posts, metrics, platform);

    // Combine, preferring AI recommendations but including unique template ones
    const aiTypes = new Set(aiResult.recommendations.map((r) => r.type));
    const uniqueTemplateRecs = templateResult.recommendations.filter(
      (r) => !aiTypes.has(r.type)
    );

    return {
      recommendations: [...aiResult.recommendations, ...uniqueTemplateRecs],
      source: 'hybrid',
      aiModel: aiResult.aiModel,
      aiProvider: aiResult.aiProvider,
      promptTokens: aiResult.promptTokens,
      completionTokens: aiResult.completionTokens,
    };
  } catch (error) {
    console.error('Hybrid generation AI portion failed:', error);
    return {
      ...templateResult,
      error: error instanceof Error ? error.message : 'AI portion failed',
    };
  }
}

// =============================================================================
// DATABASE STORAGE
// =============================================================================

/**
 * Store AI recommendations in the database
 */
export async function storeRecommendations(
  publisherId: string,
  result: GenerateRecommendationsResult
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, skipping recommendation storage');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // First, expire old active recommendations for this publisher
  await supabase
    .from('ai_recommendations')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('publisher_id', publisherId)
    .eq('status', 'active');

  // Insert new recommendations
  const rows = result.recommendations.map((rec) => ({
    publisher_id: publisherId,
    recommendation_type: rec.type,
    priority: rec.priority,
    title: rec.title,
    summary: rec.summary,
    action_items: rec.actionItems.map((text) => ({ text, completed: false })),
    context: {
      basedOn: rec.basedOn,
      confidenceScore: rec.confidence,
    },
    platform: rec.platform,
    is_ai_generated: rec.isAIGenerated,
    ai_model: rec.aiModel || (rec.isAIGenerated ? null : 'template-engine'),
    ai_provider: rec.aiProvider || null,
    status: 'active',
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  }));

  const { error } = await supabase.from('ai_recommendations').insert(rows);

  if (error) {
    console.error('Failed to store recommendations:', error);
    throw error;
  }
}

/**
 * Fetch active recommendations for a publisher
 */
export async function fetchActiveRecommendations(
  publisherId: string
): Promise<AIRecommendation[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('publisher_id', publisherId)
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.recommendation_type as RecommendationType,
    priority: row.priority as RecommendationPriority,
    title: row.title,
    summary: row.summary,
    actionItems: (row.action_items as RecommendationActionItem[] || []).map((item) => item.text),
    platform: row.platform as PlatformType | undefined,
    basedOn: (row.context as { basedOn?: string })?.basedOn || '',
    confidence: (row.context as { confidenceScore?: number })?.confidenceScore || 0.5,
    isAIGenerated: row.is_ai_generated,
    aiModel: row.ai_model || undefined,
    aiProvider: row.ai_provider || undefined,
  }));
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determine primary platform from posts
 */
function determinePrimaryPlatform(posts: ContentPerformance[]): PlatformType {
  const counts: Record<string, number> = {};
  posts.forEach((post) => {
    counts[post.platform] = (counts[post.platform] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as PlatformType) || 'instagram';
}

/**
 * Parse AI response JSON
 */
function parseAIResponse(content: string): AIRecommendationOutput[] {
  // Try to extract JSON from the response
  let jsonStr = content.trim();

  // Handle potential markdown code blocks
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonStr = objMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Handle both { recommendations: [...] } and direct array
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations;

    if (!Array.isArray(recommendations)) {
      throw new Error('Expected recommendations array');
    }

    return recommendations.map((rec: unknown) => {
      const r = rec as Record<string, unknown>;
      return {
        type: String(r.type || 'engagement_boost'),
        priority: (r.priority as 'high' | 'medium' | 'low') || 'medium',
        title: String(r.title || 'Recommendation'),
        summary: String(r.summary || ''),
        actionItems: Array.isArray(r.actionItems) ? r.actionItems.map(String) : [],
        basedOn: String(r.basedOn || 'Performance analysis'),
        confidence: typeof r.confidence === 'number' ? r.confidence : 0.7,
      };
    });
  } catch (error) {
    console.error('Failed to parse AI response:', error, 'Content:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Validate recommendation type
 */
function validateRecommendationType(type: string): RecommendationType {
  const validTypes: RecommendationType[] = [
    'content_format',
    'content_timing',
    'hashtag_strategy',
    'audience_growth',
    'engagement_boost',
    'cross_platform',
    'trending_topic',
    'competitor_insight',
    'web_traffic',
    'monetization',
    'neighborhood_expansion',
    'demographic_reach',
    'social_media_timing',
    'content_series',
    'platform_recommendation',
    'community_landscape',
  ];

  return validTypes.includes(type as RecommendationType)
    ? (type as RecommendationType)
    : 'engagement_boost';
}

/**
 * Validate priority
 */
function validatePriority(priority: string): RecommendationPriority {
  const validPriorities: RecommendationPriority[] = ['high', 'medium', 'low'];
  return validPriorities.includes(priority as RecommendationPriority)
    ? (priority as RecommendationPriority)
    : 'medium';
}
