export type ChannelGroup = 'social' | 'display' | 'audio_video';

export interface ChannelGroupConfig {
  key: ChannelGroup;
  label: string;
  description: string;
  icon: string;
}

export interface ChannelFormat {
  formatKey: string;
  channelGroup: ChannelGroup;
  label: string;
  description: string;
  platforms: string[];
  placements: string[];
  spec: FormatSpec;
  sortOrder: number;
}

export interface FormatSpec {
  aspectRatios?: string[];
  maxDurationSec?: number;
  maxFileSizeMb?: number;
  maxSlides?: number;
  maxTextLength?: number;
  fileTypes?: string[];
  sizes?: Record<string, string>;
  htmlSupported?: boolean;
  imageOptional?: boolean;
  briefRequired?: boolean;
  brandAssetsOptional?: boolean;
  scriptRequired?: boolean;
  talkingPoints?: boolean;
}

export type UnitStatus =
  | 'draft'
  | 'ready'
  | 'sent'
  | 'pending_publisher'
  | 'accepted'
  | 'revision_requested'
  | 'rejected'
  | 'in_production'
  | 'delivered';

export type CreativeTier = 'upload' | 'free_template' | 'premium_template' | 'assisted';

export interface CreativeAssets {
  files?: {
    url: string;
    filename: string;
    mimeType: string;
    width?: number;
    height?: number;
  }[];
  headline?: string;
  bodyText?: string;
  ctaText?: string;
  ctaUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  trackingPixelUrl?: string;
  clickThroughUrl?: string;
}

export interface DeliveryProof {
  postUrl?: string;
  screenshotUrl?: string;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
}

export interface CampaignUnit {
  id: string;
  campaignId: string;
  publisherId: string;
  channelGroup: ChannelGroup;
  formatKey: string;
  platform: string;
  placement: string;
  status: UnitStatus;
  tier: CreativeTier;
  creativeAssets: CreativeAssets;
  complianceNotes?: string;
  revisionFeedback?: string;
  proof?: DeliveryProof;
  deadline?: string;
  deliveredAt?: string;
  payoutCents: number;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketChannelConfig {
  citySlug: string;
  channelGroup: ChannelGroup;
  enabled: boolean;
  disabledFormats: string[];
}
