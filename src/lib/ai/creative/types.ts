/**
 * AI Creative Generation Types
 *
 * Types for the Ad Builder feature: AI-powered creative generation
 * for text ads, social posts, display banners, and newsletter copy.
 *
 * Supports multilingual variants and themed publisher branding.
 */

import type { Language, DeliverableType, SocialPlatform } from '@/types';

// =============================================================================
// CREATIVE BRIEF (input)
// =============================================================================

export interface CreativeBrief {
  /** Campaign context */
  campaignName: string;
  campaignDescription: string;
  objectives: string[];

  /** Target audience description */
  audienceDescription: string;
  targetLanguages: Language[];
  targetNeighborhoods?: string[];
  targetCommunities?: string[];

  /** Creative direction */
  tone: CreativeTone;
  keyMessages: string[];
  callToAction: string;
  constraints?: string[];         // Things to avoid or be careful about

  /** Output format */
  format: CreativeFormat;
  platform?: SocialPlatform;

  /** Publisher context (for themed variants) */
  publisherName?: string;
  publisherVoice?: string;        // e.g., "Warm, community-focused, bilingual"
  publisherAudience?: string;     // e.g., "Latino families in the Mission"
}

export type CreativeTone =
  | 'informational'    // Neutral, factual (government default)
  | 'urgent'           // Time-sensitive action needed
  | 'celebratory'      // Positive community event
  | 'empathetic'       // Sensitive topic, compassionate
  | 'conversational'   // Casual, relatable
  | 'authoritative'    // Official, institutional
  | 'inspiring';       // Motivational, aspirational

export type CreativeFormat =
  | 'social_post'      // Short-form social media post
  | 'display_ad'       // Banner/display ad (headline + body + CTA)
  | 'newsletter_copy'  // Newsletter article or feature
  | 'text_ad'          // Short text ad (Google-style)
  | 'story_script'     // Instagram/TikTok story script
  | 'reel_script';     // Short-form video script

// =============================================================================
// CREATIVE OUTPUT (AI response)
// =============================================================================

export interface CreativeOutput {
  id: string;
  format: CreativeFormat;
  language: Language;

  /** Generated content */
  headline?: string;           // For display ads, newsletters
  body: string;                // Main copy
  callToAction?: string;       // CTA text
  hashtags?: string[];         // For social posts
  imagePrompt?: string;        // AI-generated image description

  /** Format-specific fields */
  subheadline?: string;        // Display ads
  preheader?: string;          // Newsletter email preheader
  scenes?: StoryScene[];       // Story/reel scripts

  /** Metadata */
  characterCount: number;
  wordCount: number;
  estimatedReadTime?: number;  // Seconds
  culturalNotes?: string[];    // Notes about cultural adaptation
  generatedAt: Date;
}

export interface StoryScene {
  order: number;
  visual: string;              // What to show
  text?: string;               // Overlay text
  duration: number;            // Seconds
  transition?: string;         // e.g., "fade", "swipe"
}

// =============================================================================
// MULTILINGUAL VARIANT
// =============================================================================

export interface LanguageVariant {
  language: Language;
  creative: CreativeOutput;
  isOriginal: boolean;         // true for the primary language
  culturalAdaptation: string;  // How it was adapted (not just translated)
}

export interface CreativeSet {
  id: string;
  brief: CreativeBrief;
  variants: LanguageVariant[];
  primaryLanguage: Language;
  createdAt: Date;
}

// =============================================================================
// THEMED LAYOUT
// =============================================================================

export interface ThemedLayout {
  publisherName: string;
  colors: {
    primary: string;       // Publisher's brand primary
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logo?: string;           // Publisher logo URL
  fontFamily?: string;     // Publisher's preferred font
}

// =============================================================================
// FORMAT CONSTRAINTS
// =============================================================================

export interface FormatConstraints {
  maxCharacters: number;
  maxHashtags?: number;
  maxLines?: number;
  aspectRatio?: string;        // For display ads
  dimensions?: { width: number; height: number };
}

export const FORMAT_CONSTRAINTS: Record<CreativeFormat, FormatConstraints> = {
  social_post: {
    maxCharacters: 2200,       // Instagram caption limit
    maxHashtags: 30,
    maxLines: 20,
  },
  display_ad: {
    maxCharacters: 150,        // Headline + body combined
    maxLines: 4,
    aspectRatio: '16:9',
    dimensions: { width: 1200, height: 628 },
  },
  newsletter_copy: {
    maxCharacters: 3000,
    maxLines: 50,
  },
  text_ad: {
    maxCharacters: 270,        // Google text ad limits
    maxLines: 4,
  },
  story_script: {
    maxCharacters: 500,
    maxLines: 10,
  },
  reel_script: {
    maxCharacters: 1000,
    maxLines: 15,
  },
};

/** Human-readable format labels */
export const FORMAT_LABELS: Record<CreativeFormat, string> = {
  social_post: 'Social Post',
  display_ad: 'Display Ad',
  newsletter_copy: 'Newsletter Copy',
  text_ad: 'Text Ad',
  story_script: 'Story Script',
  reel_script: 'Reel / Video Script',
};

/** Format icons (emoji placeholders — replace with actual icons in UI) */
export const FORMAT_ICONS: Record<CreativeFormat, string> = {
  social_post: 'MessageSquare',
  display_ad: 'Image',
  newsletter_copy: 'Mail',
  text_ad: 'Type',
  story_script: 'PlayCircle',
  reel_script: 'Video',
};
