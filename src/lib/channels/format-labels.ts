// Static format label map — avoids an API call per card render.
// Keep in sync with seed data in 20260308000002_seed_channel_formats.sql

export const FORMAT_LABELS: Record<string, string> = {
  static_image: 'Static Image Post',
  video_reel: 'Video / Reel',
  story: 'Story',
  carousel: 'Carousel',
  text_image: 'Text + Image',
  newsletter_mention: 'Newsletter Mention',
  newsletter_dedicated: 'Dedicated Newsletter Send',
  messaging_broadcast: 'Messaging Broadcast',
  banner_ad: 'Banner Ad (IAB)',
  sponsored_article: 'Sponsored Article',
  podcast_clip: 'Podcast Audio Clip',
  podcast_script: 'Podcast Talent Read',
  video_produced: 'Produced Video',
};

export function getFormatLabel(formatKey: string): string {
  return FORMAT_LABELS[formatKey] || formatKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
