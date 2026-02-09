'use client';

/**
 * AnalyticsDashboard Component
 *
 * Main dashboard for publishers — editorial "newsroom intelligence" aesthetic.
 * Warm coral accents, Fraunces serif headings, dense but clear information hierarchy.
 */

import { useMemo, useState, useCallback } from 'react';
import { MetricsOverview } from './MetricsOverview';
import { PlatformConnectionCard } from './PlatformConnectionCard';
import { BadgeCollection, RisingStarBadge } from './GrowthBadge';
import { GrowthChart } from './GrowthChart';
import { PostPerformanceTable } from './PostPerformanceTable';
import { RecommendationsPanel, type ExtendedRecommendation } from './RecommendationsPanel';
import { GrowthOpportunitiesSection } from './GrowthOpportunitiesSection';
import { WizardOverlay } from './wizard';
import { generateRecommendations } from '@/lib/recommendations/template-engine';
import type { GrowthMetrics, PlatformConnection, MetricsSnapshot, Badge, Platform } from '@/types';
import type { PostPerformance } from './PostPerformanceTable';
import type { GrowthDataPoint } from './GrowthChart';
import type { Recommendation } from '@/lib/recommendations/template-engine';

interface AnalyticsDashboardProps {
  publisherId: string;
  publisherName: string;
  metrics: GrowthMetrics | null;
  connections: PlatformConnection[];
  latestSnapshots: Record<Platform, MetricsSnapshot | null>;
  badges: Badge[];
  isLoading?: boolean;
  posts?: PostPerformance[];
  growthHistory?: GrowthDataPoint[];
}

const AVAILABLE_PLATFORMS: Platform[] = [
  'instagram', 'facebook', 'tiktok', 'whatsapp', 'telegram', 'mailchimp', 'substack',
];

const PLATFORM_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  instagram: { icon: '📸', label: 'Instagram', color: '#E4405F' },
  facebook: { icon: '📘', label: 'Facebook', color: '#1877F2' },
  tiktok: { icon: '🎵', label: 'TikTok', color: '#000000' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366' },
  telegram: { icon: '✈️', label: 'Telegram', color: '#0088CC' },
  mailchimp: { icon: '🐵', label: 'Mailchimp', color: '#FFE01B' },
  substack: { icon: '📰', label: 'Substack', color: '#FF6719' },
};

export function AnalyticsDashboard({
  publisherId,
  publisherName,
  metrics,
  connections,
  latestSnapshots,
  badges,
  isLoading,
  posts = [],
  growthHistory = [],
}: AnalyticsDashboardProps) {
  const hasRisingStar = badges.some((b) => b.type === 'rising_star');
  const risingStarBadge = badges.find((b) => b.type === 'rising_star');

  const [aiRecommendations, setAiRecommendations] = useState<ExtendedRecommendation[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [contentView, setContentView] = useState<'compact' | 'full'>('compact');

  const activePlatforms = useMemo(
    () => connections.filter((c) => c.status === 'active').map((c) => c.platform),
    [connections]
  );

  const connectedPlatforms = useMemo(
    () => connections.filter((c) => c.status === 'active' || c.status === 'expired'),
    [connections]
  );

  const disconnectedPlatforms = useMemo(
    () => AVAILABLE_PLATFORMS.filter(
      (p) => !connections.some((c) => c.platform === p && (c.status === 'active' || c.status === 'expired'))
    ),
    [connections]
  );

  // AI recommendations
  const handleGenerateAI = useCallback(async () => {
    if (!publisherId) return;
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId, mode: 'hybrid', storeResults: false }),
      });
      if (!response.ok) throw new Error('Failed to generate recommendations');
      const data = await response.json();
      if (data.success && data.recommendations) {
        setAiRecommendations(data.recommendations.map(
          (rec: Recommendation & { isAIGenerated?: boolean }) => ({
            ...rec,
            isAIGenerated: data.source === 'ai' || rec.isAIGenerated,
            aiModel: data.aiModel,
            aiProvider: data.aiProvider,
          })
        ));
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [publisherId]);

  // Template-based recommendations (fallback)
  const templateRecommendations = useMemo<Recommendation[]>(() => {
    if (posts.length === 0 || !metrics) return [];
    const platformPosts = new Map<Platform, PostPerformance[]>();
    posts.forEach((post) => {
      const existing = platformPosts.get(post.platform) || [];
      existing.push(post);
      platformPosts.set(post.platform, existing);
    });
    const primaryPlatform = Array.from(platformPosts.entries())
      .sort((a, b) => b[1].length - a[1].length)[0];
    if (!primaryPlatform) return [];
    const [platform, platformPostList] = primaryPlatform;
    const snapshot = latestSnapshots[platform];
    return generateRecommendations({
      platform,
      posts: platformPostList.map((p) => ({
        id: p.id, platform: p.platform, contentType: p.contentType,
        publishedAt: p.publishedAt, likes: p.likes || 0, comments: p.comments || 0,
        shares: p.shares || 0, saves: p.saves || undefined, impressions: p.impressions || undefined,
        reach: p.reach || undefined, videoViews: p.videoViews || undefined, hashtags: [],
      })),
      followerCount: snapshot?.followerCount || 0,
      avgEngagementRate: snapshot?.engagementRate || 0,
      growthRate30d: metrics.growth30d.growthRate,
    });
  }, [posts, metrics, latestSnapshots]);

  const recommendations: ExtendedRecommendation[] = aiRecommendations.length > 0
    ? aiRecommendations
    : templateRecommendations.map(r => ({ ...r, isAIGenerated: false }));

  // Limit posts in compact view
  const displayPosts = contentView === 'compact' ? posts.slice(0, 10) : posts;

  return (
    <div className="min-h-screen bg-cream-500">
      {/* ── Masthead ──────────────────────────────────────────────── */}
      <header className="relative bg-white border-b border-slate-100 overflow-hidden">
        {/* Coral accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coral-500 via-coral-400 to-marigold-400" />

        <div className="max-w-7xl mx-auto px-6 pt-7 pb-5">
          {/* Top row: name + badges */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-fraunces)] text-charcoal truncate" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 600, lineHeight: 1.15 }}>
                {publisherName}
              </h1>
              <p className="text-sm text-slate-400 tracking-wide mt-0.5">Analytics Dashboard</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {badges.length > 0 && (
                <BadgeCollection badges={badges} size="sm" maxDisplay={4} />
              )}
              {hasRisingStar && risingStarBadge && (
                <RisingStarBadge
                  growthRate={metrics?.growth30d.growthRate || 0}
                  tier={risingStarBadge.tier || 'bronze'}
                />
              )}
            </div>
          </div>

          {/* Platform status strip */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100/80">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Platforms</span>
            {AVAILABLE_PLATFORMS.map((platform) => {
              const conn = connections.find((c) => c.platform === platform);
              const isActive = conn?.status === 'active';
              const isExpired = conn?.status === 'expired';
              const info = PLATFORM_ICONS[platform];
              return (
                <div
                  key={platform}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : isExpired
                      ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                  title={`${info.label}: ${isActive ? 'Connected' : isExpired ? 'Needs reconnection' : 'Not connected'}`}
                >
                  <span className="text-sm">{info.icon}</span>
                  <span className="hidden sm:inline">{info.label}</span>
                  {isActive && (
                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              );
            })}
            <span className="text-xs text-slate-400 ml-auto">
              {activePlatforms.length}/{AVAILABLE_PLATFORMS.length} active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Metrics Overview ────────────────────────────────────── */}
        <section className="mb-8">
          <MetricsOverview metrics={metrics} isLoading={isLoading} />
        </section>

        {/* ── Growth & Trends ─────────────────────────────────────── */}
        {(growthHistory.length > 0 || metrics) && (
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[family-name:var(--font-fraunces)] text-charcoal text-xl font-semibold">
                Growth & Trends
              </h2>
              {metrics && (
                <span className={`text-sm font-medium ${
                  metrics.trend === 'accelerating' ? 'text-emerald-600' :
                  metrics.trend === 'declining' ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {metrics.trend === 'accelerating' ? 'Accelerating' :
                   metrics.trend === 'declining' ? 'Slowing' : 'Steady'} growth
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart */}
              <div className="lg:col-span-2">
                {growthHistory.length > 0 ? (
                  <GrowthChart data={growthHistory} period="30d" height={280} isLoading={isLoading} />
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-charcoal text-lg mb-4">Audience Growth</h3>
                    <div className="h-[200px] flex items-center justify-center text-slate-400">
                      Connect a platform to see your growth chart
                    </div>
                  </div>
                )}
              </div>

              {/* Growth Stats sidebar */}
              {metrics && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-charcoal text-sm uppercase tracking-wider">Growth Periods</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: '7 days', data: metrics.growth7d },
                      { label: '30 days', data: metrics.growth30d },
                      { label: '90 days', data: metrics.growth90d },
                    ].map(({ label, data }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-cream-500/60">
                        <div>
                          <span className="text-sm font-medium text-charcoal">{label}</span>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {data.followersGained > 0 ? '+' : ''}
                            {data.followersGained.toLocaleString()} followers
                          </p>
                        </div>
                        <span className={`text-lg font-bold font-[family-name:var(--font-fraunces)] ${
                          data.growthRate > 0 ? 'text-emerald-600' :
                          data.growthRate < 0 ? 'text-red-500' : 'text-slate-400'
                        }`}>
                          {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Trend footer */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      metrics.trend === 'accelerating' ? 'bg-emerald-500' :
                      metrics.trend === 'declining' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-sm text-slate-600">
                      {metrics.trend === 'accelerating' ? 'Momentum building' :
                       metrics.trend === 'declining' ? 'Growth slowing' : 'Steady pace'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Connected Platform Details ─────────────────────────── */}
        {connectedPlatforms.length > 0 && (
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[family-name:var(--font-fraunces)] text-charcoal text-xl font-semibold">
                Platform Details
              </h2>
              <button
                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                className="text-sm text-coral-500 hover:text-coral-600 font-medium transition-colors"
              >
                {showAllPlatforms ? 'Show connected only' : `Show all ${AVAILABLE_PLATFORMS.length} platforms`}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showAllPlatforms ? AVAILABLE_PLATFORMS : connectedPlatforms.map(c => c.platform)).map((platform) => {
                const connection = connections.find((c) => c.platform === platform) || null;
                const snapshot = latestSnapshots[platform] || null;
                return (
                  <PlatformConnectionCard
                    key={platform}
                    platform={platform}
                    connection={connection}
                    latestMetrics={snapshot}
                    publisherId={publisherId}
                  />
                );
              })}
            </div>

            {/* Compact "connect more" prompt */}
            {!showAllPlatforms && disconnectedPlatforms.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>
                  {disconnectedPlatforms.length} more platform{disconnectedPlatforms.length !== 1 ? 's' : ''} available to connect
                </span>
                <button
                  onClick={() => setShowAllPlatforms(true)}
                  className="text-coral-500 hover:text-coral-600 font-medium ml-1"
                >
                  View
                </button>
              </div>
            )}
          </section>
        )}

        {/* If NO platforms connected, show full grid */}
        {connectedPlatforms.length === 0 && (
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[family-name:var(--font-fraunces)] text-charcoal text-xl font-semibold">
                Connect Your Platforms
              </h2>
              <p className="text-sm text-slate-400">
                0 of {AVAILABLE_PLATFORMS.length} connected
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_PLATFORMS.map((platform) => (
                <PlatformConnectionCard
                  key={platform}
                  platform={platform}
                  connection={null}
                  latestMetrics={null}
                  publisherId={publisherId}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Content & Insights ──────────────────────────────────── */}
        {(posts.length > 0 || recommendations.length > 0) && (
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-[family-name:var(--font-fraunces)] text-charcoal text-xl font-semibold">
                Content & Insights
              </h2>
              {posts.length > 10 && (
                <button
                  onClick={() => setContentView(contentView === 'compact' ? 'full' : 'compact')}
                  className="text-sm text-coral-500 hover:text-coral-600 font-medium transition-colors"
                >
                  {contentView === 'compact' ? `Show all ${posts.length} posts` : 'Show top 10'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Content Performance */}
              <div className="lg:col-span-2">
                <PostPerformanceTable posts={displayPosts} isLoading={isLoading} />
              </div>

              {/* Insights sidebar */}
              <div className="space-y-5">
                <GrowthOpportunitiesSection
                  publisherId={publisherId}
                  publisherName={publisherName}
                  posts={posts}
                  growthRate30d={metrics?.growth30d.growthRate}
                  totalFollowers={metrics?.totalFollowers}
                  avgEngagementRate={metrics?.averageEngagementRate}
                  platforms={activePlatforms}
                  onOpenWizard={() => setIsWizardOpen(true)}
                />
                <RecommendationsPanel
                  recommendations={recommendations}
                  isLoading={isLoading || isGeneratingAI}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Reach CTA ───────────────────────────────────────────── */}
        {disconnectedPlatforms.length > 0 && (
          <section className="mb-8">
            <div className="relative rounded-xl overflow-hidden">
              {/* Background with subtle texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-coral-500 via-coral-500 to-marigold-500" />
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative px-6 py-8 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-fraunces)] text-white text-xl font-semibold mb-1">
                      Expand your reach
                    </h2>
                    <p className="text-white/80 text-sm max-w-lg">
                      Connect more platforms to unlock detailed analytics and earn badges that highlight your growth to advertisers.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {disconnectedPlatforms.slice(0, 4).map((platform) => {
                      const info = PLATFORM_ICONS[platform];
                      return (
                        <button
                          key={platform}
                          onClick={() => {
                            window.location.href = `/api/auth/${platform}?publisherId=${publisherId}&returnUrl=${encodeURIComponent(window.location.pathname)}`;
                          }}
                          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white font-medium transition-colors"
                        >
                          <span>{info?.icon}</span>
                          <span>{info?.label}</span>
                        </button>
                      );
                    })}
                    {disconnectedPlatforms.length > 4 && (
                      <span className="flex items-center text-white/60 text-sm px-2">
                        +{disconnectedPlatforms.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Wizard Overlay */}
      <WizardOverlay
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        publisherId={publisherId}
        publisherName={publisherName}
        posts={posts}
        growthRate30d={metrics?.growth30d.growthRate}
        totalFollowers={metrics?.totalFollowers}
        avgEngagementRate={metrics?.averageEngagementRate}
      />
    </div>
  );
}
