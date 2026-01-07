# Supabase Migrations

## Migration Files

| Order | File | Description |
|-------|------|-------------|
| 1 | `20250106000001_create_publishers.sql` | Publishers table with RLS policies |
| 2 | `20250106000002_create_platform_connections.sql` | OAuth tokens and platform connections |
| 3 | `20250106000003_create_metrics_snapshots.sql` | Point-in-time metrics from APIs |
| 4 | `20250106000004_create_growth_snapshots.sql` | Aggregated growth data by period |
| 5 | `20250106000005_create_growth_badges.sql` | Achievement badges for publishers |
| 6 | `20250106000006_create_audience_profiles.sql` | Audience demographics for matching |
| 7 | `20250106000007_create_badge_functions.sql` | Badge calculation functions |

## Running Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### Option 2: Manual via Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file in order (001 → 007)
3. Verify tables are created in Table Editor

## Schema Overview

```
publishers
├── platform_connections (1:many)
├── metrics_snapshots (1:many)
├── growth_snapshots (1:many)
├── growth_badges (1:many)
└── audience_profiles (1:1)
```

## Enum Types

- `publisher_status`: pending_review, active, suspended, archived
- `vendor_status`: not_registered, pending, registered, expired
- `platform_type`: instagram, facebook, tiktok, mailchimp, substack, whatsapp, telegram, signal, sms, weibo
- `connection_status`: active, expired, revoked, error
- `growth_period_type`: daily, weekly, monthly
- `badge_type`: rising_star, growth_champion, engagement_leader, verified_publisher, emerging_channel, community_builder
- `badge_tier`: bronze, silver, gold
- `badge_status`: active, expired, revoked
- `verification_level`: self_reported, partial, verified

## Key Views

- `public_publisher_metrics` - Advertiser-facing metrics (limited fields)
- `growth_leaderboard_30d` - Top growing publishers
- `active_publisher_badges` - All active badges
- `rising_star_publishers` - Publishers with Rising Star badge
- `matchable_publishers` - Full data for matching algorithm

## Database Functions

- `calculate_growth_rate(start, end)` - Calculate percentage growth
- `calculate_rising_star_tier(followers, growth)` - Determine badge tier
- `award_rising_star_badge(publisher_id, platform)` - Award Rising Star
- `award_verified_publisher_badge(publisher_id)` - Award Verified badge
- `award_emerging_channel_badge(publisher_id)` - Award Emerging Channel
- `recalculate_publisher_badges(publisher_id)` - Recalculate all badges
- `expire_badges()` - Expire outdated badges

## Row Level Security

All tables have RLS enabled with policies for:
- Publishers viewing/managing their own data
- Advertisers viewing active publisher data
- Service role having full access

## Environment Variables

After setup, add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
