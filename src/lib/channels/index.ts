import type { ChannelGroupConfig } from './types';
export * from './types';

export const CHANNEL_GROUPS: ChannelGroupConfig[] = [
  {
    key: 'social',
    label: 'Social Advertising',
    description: 'Reach communities through their trusted voices — social media, newsletters, and messaging',
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    key: 'display',
    label: 'Display & Sponsored',
    description: 'Banner ads and sponsored content on local news websites',
    icon: 'ComputerDesktopIcon',
  },
  {
    key: 'audio_video',
    label: 'Audio & Video',
    description: 'Podcast sponsorships, video integrations, and rich media content',
    icon: 'PlayCircleIcon',
  },
];

export const UNIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'gray' },
  ready: { label: 'Ready', color: 'blue' },
  sent: { label: 'Sent', color: 'blue' },
  pending_publisher: { label: 'Pending Review', color: 'yellow' },
  accepted: { label: 'Accepted', color: 'green' },
  revision_requested: { label: 'Revision Requested', color: 'orange' },
  rejected: { label: 'Rejected', color: 'red' },
  in_production: { label: 'In Production', color: 'purple' },
  delivered: { label: 'Delivered', color: 'green' },
};

export const COMPLIANCE_DEFAULTS: Record<string, string> = {
  instagram: 'Use "Paid Partnership" tag. Disclose sponsorship in caption.',
  tiktok: 'Enable "Branded Content" toggle. Include #ad or #sponsored.',
  facebook: 'Use Branded Content tool. Mark as "Paid Partnership."',
  youtube: 'Check "includes paid promotion" in video details. Verbal disclosure required.',
  spotify: 'FTC disclosure: "This episode is sponsored by..." at segment start.',
  apple_podcasts: 'FTC disclosure: "This episode is sponsored by..." at segment start.',
  mailchimp: 'Mark as "Advertisement" or "Sponsored" per CAN-SPAM.',
  substack: 'Label as "Sponsored" in subject line or header.',
  whatsapp: 'Include "Sponsored" label at start of message.',
  telegram: 'Include "Sponsored" or "Ad" label.',
  website: 'Label as "Sponsored Content" or "Advertisement" per FTC guidelines.',
};

export function getChannelGroupConfig(key: string): ChannelGroupConfig | undefined {
  return CHANNEL_GROUPS.find(g => g.key === key);
}
