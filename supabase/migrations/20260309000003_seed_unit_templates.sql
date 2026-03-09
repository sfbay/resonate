-- Seed unit templates for the template library
-- Static templates: baseImageUrl + text overlay definitions
-- Categories: general, government, health, events, community

-- =============================================================================
-- SOCIAL: static_image templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Bold Statement',
  'social', 'static_image', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/bold-statement.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 320, "fontSize": 32, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 380, "fontSize": 16, "color": "#e2e8f0", "maxWidth": 560}], "logoArea": {"x": 40, "y": 520, "width": 48, "height": 48}, "colorScheme": {"primary": "#1e293b", "secondary": "#f8fafc"}}',
  '/templates/social/bold-statement-thumb.png'
),
(
  'Community Spotlight',
  'social', 'static_image', 'free', 'community', 2,
  '{"baseImageUrl": "/templates/social/community-spotlight.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 60, "fontSize": 28, "color": "#0f172a", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 120, "fontSize": 15, "color": "#475569", "maxWidth": 560}], "logoArea": {"x": 480, "y": 520, "width": 48, "height": 48}, "colorScheme": {"primary": "#0d9488", "secondary": "#f0fdfa"}}',
  '/templates/social/community-spotlight-thumb.png'
),
(
  'Government Notice',
  'social', 'static_image', 'free', 'government', 3,
  '{"baseImageUrl": "/templates/social/gov-notice.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 280, "fontSize": 26, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 340, "fontSize": 14, "color": "#cbd5e1", "maxWidth": 560}], "logoArea": {"x": 40, "y": 40, "width": 64, "height": 64}, "colorScheme": {"primary": "#1e40af", "secondary": "#dbeafe"}}',
  '/templates/social/gov-notice-thumb.png'
),
(
  'Health Alert',
  'social', 'static_image', 'premium', 'health', 4,
  '{"baseImageUrl": "/templates/social/health-alert.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 60, "fontSize": 30, "color": "#065f46", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 130, "fontSize": 15, "color": "#047857", "maxWidth": 560}], "logoArea": {"x": 480, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#065f46", "secondary": "#d1fae5"}}',
  '/templates/social/health-alert-thumb.png'
),
(
  'Event Promo',
  'social', 'static_image', 'premium', 'events', 5,
  '{"baseImageUrl": "/templates/social/event-promo.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 360, "fontSize": 28, "color": "#ffffff", "maxWidth": 560}, {"key": "body", "label": "Body", "x": 40, "y": 420, "fontSize": 14, "color": "#fde68a", "maxWidth": 560}], "logoArea": {"x": 40, "y": 500, "width": 48, "height": 48}, "colorScheme": {"primary": "#d97706", "secondary": "#fffbeb"}}',
  '/templates/social/event-promo-thumb.png'
);

-- =============================================================================
-- SOCIAL: story templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Story Announcement',
  'social', 'story', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/story-announcement.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 480, "fontSize": 28, "color": "#ffffff", "maxWidth": 340}, {"key": "body", "label": "Body", "x": 40, "y": 540, "fontSize": 14, "color": "#e2e8f0", "maxWidth": 340}], "logoArea": {"x": 40, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#7c3aed", "secondary": "#f5f3ff"}}',
  '/templates/social/story-announcement-thumb.png'
),
(
  'Story CTA',
  'social', 'story', 'free', 'general', 2,
  '{"baseImageUrl": "/templates/social/story-cta.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 520, "fontSize": 24, "color": "#ffffff", "maxWidth": 340}, {"key": "body", "label": "Swipe Up Text", "x": 40, "y": 580, "fontSize": 16, "color": "#fbbf24", "maxWidth": 340}], "logoArea": {"x": 300, "y": 40, "width": 48, "height": 48}, "colorScheme": {"primary": "#0d9488", "secondary": "#f0fdfa"}}',
  '/templates/social/story-cta-thumb.png'
),
(
  'Story Health',
  'social', 'story', 'premium', 'health', 3,
  '{"baseImageUrl": "/templates/social/story-health.png", "textFields": [{"key": "headline", "label": "Headline", "x": 40, "y": 200, "fontSize": 26, "color": "#065f46", "maxWidth": 340}, {"key": "body", "label": "Body", "x": 40, "y": 260, "fontSize": 14, "color": "#047857", "maxWidth": 340}], "logoArea": {"x": 40, "y": 560, "width": 48, "height": 48}, "colorScheme": {"primary": "#065f46", "secondary": "#d1fae5"}}',
  '/templates/social/story-health-thumb.png'
);

-- =============================================================================
-- DISPLAY: banner_ad templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Clean Banner',
  'display', 'banner_ad', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/display/clean-banner.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 30, "fontSize": 18, "color": "#0f172a", "maxWidth": 260}, {"key": "body", "label": "CTA", "x": 20, "y": 60, "fontSize": 12, "color": "#0d9488", "maxWidth": 260}], "logoArea": {"x": 220, "y": 180, "width": 60, "height": 40}, "colorScheme": {"primary": "#0d9488", "secondary": "#ffffff"}}',
  '/templates/display/clean-banner-thumb.png'
),
(
  'Government Banner',
  'display', 'banner_ad', 'free', 'government', 2,
  '{"baseImageUrl": "/templates/display/gov-banner.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 20, "fontSize": 16, "color": "#ffffff", "maxWidth": 260}, {"key": "body", "label": "Subtitle", "x": 20, "y": 50, "fontSize": 11, "color": "#bfdbfe", "maxWidth": 260}], "logoArea": {"x": 20, "y": 180, "width": 60, "height": 40}, "colorScheme": {"primary": "#1e3a5f", "secondary": "#dbeafe"}}',
  '/templates/display/gov-banner-thumb.png'
),
(
  'Premium Display',
  'display', 'banner_ad', 'premium', 'general', 3,
  '{"baseImageUrl": "/templates/display/premium-display.png", "textFields": [{"key": "headline", "label": "Headline", "x": 20, "y": 40, "fontSize": 20, "color": "#0f172a", "maxWidth": 260}, {"key": "body", "label": "Body", "x": 20, "y": 75, "fontSize": 11, "color": "#64748b", "maxWidth": 260}], "logoArea": {"x": 200, "y": 10, "width": 80, "height": 30}, "colorScheme": {"primary": "#0f172a", "secondary": "#f1f5f9"}}',
  '/templates/display/premium-display-thumb.png'
);

-- =============================================================================
-- SOCIAL: newsletter templates
-- =============================================================================

INSERT INTO unit_templates (name, channel_group, format_key, tier, category, sort_order, template_data, thumbnail_url) VALUES
(
  'Newsletter Block',
  'social', 'newsletter_mention', 'free', 'general', 1,
  '{"baseImageUrl": "/templates/social/newsletter-block.png", "textFields": [{"key": "headline", "label": "Headline", "x": 24, "y": 24, "fontSize": 20, "color": "#0f172a", "maxWidth": 500}, {"key": "body", "label": "Body", "x": 24, "y": 64, "fontSize": 14, "color": "#475569", "maxWidth": 500}], "logoArea": {"x": 440, "y": 140, "width": 80, "height": 40}, "colorScheme": {"primary": "#0d9488", "secondary": "#f8fafc"}}',
  '/templates/social/newsletter-block-thumb.png'
),
(
  'Newsletter Premium',
  'social', 'newsletter_mention', 'premium', 'general', 2,
  '{"baseImageUrl": "/templates/social/newsletter-premium.png", "textFields": [{"key": "headline", "label": "Headline", "x": 24, "y": 24, "fontSize": 22, "color": "#1e293b", "maxWidth": 500}, {"key": "body", "label": "Body", "x": 24, "y": 64, "fontSize": 14, "color": "#334155", "maxWidth": 500}], "logoArea": {"x": 24, "y": 140, "width": 80, "height": 40}, "colorScheme": {"primary": "#7c3aed", "secondary": "#faf5ff"}}',
  '/templates/social/newsletter-premium-thumb.png'
);
