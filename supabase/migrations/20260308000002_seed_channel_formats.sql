-- Seed channel formats
-- Social group
INSERT INTO channel_formats (channel_group, format_key, label, description, platforms, placements, spec, sort_order) VALUES
  ('social', 'static_image', 'Static Image Post', 'Single image for social feeds', ARRAY['instagram','facebook','tiktok'], ARRAY['feed_post','pin'], '{"aspect_ratios":["1:1","4:5","16:9"],"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 1),
  ('social', 'video_reel', 'Video / Reel', 'Short-form video for social feeds', ARRAY['instagram','tiktok','facebook','youtube'], ARRAY['reel','feed_post'], '{"aspect_ratios":["9:16","1:1"],"max_duration_sec":90,"max_file_size_mb":100,"file_types":["mp4","mov"]}', 2),
  ('social', 'story', 'Story', 'Ephemeral story content', ARRAY['instagram','facebook','tiktok'], ARRAY['story'], '{"aspect_ratios":["9:16"],"max_duration_sec":15,"max_file_size_mb":30,"file_types":["jpg","png","mp4","mov"]}', 3),
  ('social', 'carousel', 'Carousel', 'Multi-image swipeable post', ARRAY['instagram','facebook','tiktok'], ARRAY['feed_post'], '{"aspect_ratios":["1:1","4:5"],"max_slides":10,"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 4),
  ('social', 'text_image', 'Text + Image', 'Text post with image attachment', ARRAY['facebook','twitter'], ARRAY['feed_post'], '{"max_text_length":500,"max_file_size_mb":10,"file_types":["jpg","png","webp"]}', 5),
  ('social', 'newsletter_mention', 'Newsletter Mention', 'Sponsored mention within newsletter', ARRAY['mailchimp','substack'], ARRAY['mention','sponsored_section'], '{"max_text_length":300,"image_optional":true,"file_types":["jpg","png","html"]}', 6),
  ('social', 'newsletter_dedicated', 'Dedicated Newsletter Send', 'Full sponsored newsletter send', ARRAY['mailchimp','substack'], ARRAY['dedicated_send'], '{"html_supported":true,"max_file_size_mb":5,"file_types":["html","jpg","png"]}', 7),
  ('social', 'messaging_broadcast', 'Messaging Broadcast', 'Sponsored message to community channels', ARRAY['whatsapp','telegram','signal','discord'], ARRAY['broadcast','channel_post','group_post'], '{"max_text_length":1000,"image_optional":true,"max_file_size_mb":5,"file_types":["jpg","png","mp4"]}', 8),

  -- Display group
  ('display', 'banner_ad', 'Banner Ad (IAB)', 'Standard IAB display banner', ARRAY['website'], ARRAY['leaderboard','sidebar','interstitial','sticky_footer'], '{"sizes":{"leaderboard":"728x90","sidebar":"300x250","interstitial":"320x480","sticky_footer":"320x50"},"file_types":["jpg","png","gif","html5"],"max_file_size_mb":2}', 1),
  ('display', 'sponsored_article', 'Sponsored Article', 'Publisher writes article in their voice from brand brief', ARRAY['website'], ARRAY['article','advertorial','listicle'], '{"brief_required":true,"brand_assets_optional":true}', 2),

  -- Audio/Video group
  ('audio_video', 'podcast_clip', 'Podcast Audio Clip', 'Pre-produced audio ad for podcast insertion', ARRAY['spotify','apple_podcasts','publisher_feed'], ARRAY['pre_roll','mid_roll','sponsored_segment'], '{"max_duration_sec":60,"file_types":["mp3","wav","m4a"],"max_file_size_mb":20}', 1),
  ('audio_video', 'podcast_script', 'Podcast Talent Read', 'Script/talking points for host-read sponsorship', ARRAY['spotify','apple_podcasts','publisher_feed'], ARRAY['mid_roll','sponsored_segment','talent_read'], '{"script_required":true,"talking_points":true}', 2),
  ('audio_video', 'video_produced', 'Produced Video', 'Long-form or produced video content', ARRAY['youtube','website'], ARRAY['pre_roll','sponsored_content','integration'], '{"aspect_ratios":["16:9","9:16"],"max_file_size_mb":500,"file_types":["mp4","mov"]}', 3);

-- Seed market channels (SF and Chicago)
INSERT INTO market_channels (city_slug, channel_group, enabled) VALUES
  ('sf', 'social', true),
  ('sf', 'display', false),
  ('sf', 'audio_video', true),
  ('chicago', 'social', true),
  ('chicago', 'display', true),
  ('chicago', 'audio_video', true);
