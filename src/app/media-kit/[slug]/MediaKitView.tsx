'use client';

/**
 * Media Kit View Component
 *
 * The main presentation view for a publisher's media kit.
 * Designed to be beautiful, shareable, and print-friendly.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { MediaKitData } from '@/lib/media-kit/types';
import {
  MapPinIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

// Platform icons mapping
const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '👥',
  twitter: '🐦',
  tiktok: '🎵',
  youtube: '📺',
  newsletter: '📧',
  mailchimp: '📧',
  substack: '📝',
  whatsapp: '💬',
  telegram: '✈️',
  website: '🌐',
};

// Badge display config
const BADGE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  rising_star: { label: 'Rising Star', color: 'bg-amber-100 text-amber-800', icon: '⭐' },
  growth_champion: { label: 'Growth Champion', color: 'bg-emerald-100 text-emerald-800', icon: '📈' },
  engagement_leader: { label: 'Engagement Leader', color: 'bg-purple-100 text-purple-800', icon: '🔥' },
  verified_publisher: { label: 'Verified', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  emerging_channel: { label: 'Emerging Channel', color: 'bg-teal-100 text-teal-800', icon: '🌱' },
  community_builder: { label: 'Community Builder', color: 'bg-rose-100 text-rose-800', icon: '🤝' },
};

interface MediaKitViewProps {
  data: MediaKitData;
}

export function MediaKitView({ data }: MediaKitViewProps) {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${data.publisher.name} Media Kit`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const accentColor = data.publisher.accentColor || '#FF6B6B';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Print-friendly styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Action Bar - Fixed at top */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Powered by</span>
            <span className="font-semibold text-slate-700">Resonate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              PDF
            </button>
            <a
              href={`/media-kit/${data.publisher.slug}/slides`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <PresentationChartBarIcon className="w-4 h-4" />
              Slides
            </a>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section
          className="relative py-16 px-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 50%)`,
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              {data.publisher.logoUrl ? (
                <img
                  src={data.publisher.logoUrl}
                  alt={data.publisher.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {data.publisher.name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                  {data.publisher.name}
                </h1>
                {data.publisher.tagline && (
                  <p className="text-xl text-slate-600 mb-4">{data.publisher.tagline}</p>
                )}

                {/* Badges */}
                {data.growth.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.growth.badges.map((badge, i) => {
                      const config = BADGE_CONFIG[badge.type] || {
                        label: badge.type,
                        color: 'bg-slate-100 text-slate-800',
                        icon: '🏆',
                      };
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
                        >
                          <span>{config.icon}</span>
                          {config.label}
                          {badge.tier && badge.tier !== 'bronze' && (
                            <span className="ml-1 opacity-70">
                              {badge.tier === 'gold' ? '🥇' : '🥈'}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {data.growth.verificationLevel === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Verified Metrics
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {data.publisher.description && (
              <p className="mt-6 text-lg text-slate-600 max-w-3xl">{data.publisher.description}</p>
            )}
          </div>
        </section>

        {/* Key Metrics - Hero Stats */}
        <section className="py-12 px-6 border-b border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Reach */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl md:text-5xl font-bold text-slate-900">
                  {formatNumber(data.reach.totalFollowers)}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Total Reach</div>
              </div>

              {/* Platforms */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl md:text-5xl font-bold text-slate-900">
                  {data.reach.platforms.length}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Active Platforms</div>
              </div>

              {/* Engagement Rate */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl md:text-5xl font-bold text-slate-900">
                  {data.engagement.averageRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Avg Engagement</div>
                {data.engagement.rateVsCityAverage === 'above' && (
                  <div className="text-xs text-emerald-600 mt-1">Above average</div>
                )}
              </div>

              {/* Growth */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl md:text-5xl font-bold text-emerald-600">
                  {data.growth.growth30d.percentage > 0 ? '+' : ''}
                  {data.growth.growth30d.percentage.toFixed(0)}%
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">30-Day Growth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Breakdown */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6" style={{ color: accentColor }} />
              Platform Reach
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.reach.platforms.map((platform) => (
                <div
                  key={platform.platform}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="text-3xl">{PLATFORM_ICONS[platform.platform] || '📱'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 capitalize">
                        {platform.platform}
                      </span>
                      {platform.verified && (
                        <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    {platform.handle && (
                      <div className="text-sm text-slate-500">@{platform.handle}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {formatNumber(platform.followers)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {platform.engagementRate.toFixed(1)}% eng
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience Demographics */}
        <section className="py-12 px-6 bg-slate-50 print-break">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6" style={{ color: accentColor }} />
              Audience Demographics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Languages */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Languages</h3>
                <div className="space-y-3">
                  {data.demographics.topLanguages.map((lang) => (
                    <div key={lang.language}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{lang.language}</span>
                        <span className="font-medium text-slate-900">{lang.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: accentColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income Distribution */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Income Levels</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Very Low Income', value: data.demographics.incomeDistribution.veryLow },
                    { label: 'Low Income', value: data.demographics.incomeDistribution.low },
                    { label: 'Moderate Income', value: data.demographics.incomeDistribution.moderate },
                    { label: 'Above Moderate', value: data.demographics.incomeDistribution.aboveModerate },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Distribution */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Age Groups</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Under 25', value: data.demographics.ageDistribution.under25 },
                    { label: '25-44', value: data.demographics.ageDistribution.age25to44 },
                    { label: '45-64', value: data.demographics.ageDistribution.age45to64 },
                    { label: '65+', value: data.demographics.ageDistribution.age65plus },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethnicity */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Communities Served</h3>
                <div className="space-y-3">
                  {data.demographics.topEthnicities.map((eth) => (
                    <div key={eth.ethnicity}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{eth.ethnicity}</span>
                        <span className="font-medium text-slate-900">{eth.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${eth.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Geographic Coverage */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6" style={{ color: accentColor }} />
              Geographic Coverage
            </h2>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              {data.geography.isCitywide ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌉</div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">Citywide Coverage</div>
                  <p className="text-slate-600">
                    Reaches audiences across all San Francisco neighborhoods
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-600 mb-4">
                    Primary coverage in {data.geography.neighborhoods.length} neighborhoods:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.geography.neighborhoods.map((hood) => (
                      <span
                        key={hood}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium capitalize"
                      >
                        {hood.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Growth Proof */}
        <section className="py-12 px-6 bg-slate-50 print-break">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-6 h-6" style={{ color: accentColor }} />
              Growth & Momentum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                <div className="text-sm font-medium text-slate-500 mb-2">30-Day Growth</div>
                <div className="text-4xl font-bold text-emerald-600">
                  +{formatNumber(data.growth.growth30d.followers)}
                </div>
                <div className="text-sm text-slate-500">new followers</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                <div className="text-sm font-medium text-slate-500 mb-2">Growth Rate</div>
                <div className="text-4xl font-bold text-emerald-600">
                  {data.growth.growth30d.percentage > 0 ? '+' : ''}
                  {data.growth.growth30d.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-500">month over month</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                <div className="text-sm font-medium text-slate-500 mb-2">Trend</div>
                <div className="text-4xl font-bold capitalize" style={{ color: accentColor }}>
                  {data.growth.trend === 'accelerating' && '🚀'}
                  {data.growth.trend === 'steady' && '📈'}
                  {data.growth.trend === 'declining' && '📉'}
                  {' '}{data.growth.trend}
                </div>
                <div className="text-sm text-slate-500">momentum</div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Content */}
        {data.topContent.length > 0 && (
          <section className="py-12 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" style={{ color: accentColor }} />
                Top Performing Content
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.topContent.slice(0, 6).map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-4xl">
                        {PLATFORM_ICONS[post.platform] || '📱'}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500 capitalize">
                          {post.platform}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {post.caption && (
                        <p className="text-sm text-slate-600 line-clamp-2">{post.caption}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        {post.impressions && (
                          <span className="text-slate-500">
                            {formatNumber(post.impressions)} views
                          </span>
                        )}
                        <span className="font-medium" style={{ color: accentColor }}>
                          {post.engagementScore.toFixed(0)} score
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 px-6" style={{ backgroundColor: `${accentColor}10` }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Partner with {data.publisher.name}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Reach engaged audiences in San Francisco through authentic community media.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {data.contact.bookingUrl && (
                <a
                  href={data.contact.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  Book a Call
                </a>
              )}
              {data.contact.showEmail && data.contact.email && (
                <a
                  href={`mailto:${data.contact.email}`}
                  className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Email Us
                </a>
              )}
              {!data.contact.bookingUrl && !data.contact.email && (
                <a
                  href="mailto:partnerships@resonatelocal.org"
                  className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  Contact via Resonate
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-200">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>
              Media kit powered by{' '}
              <Link href="/" className="font-medium text-slate-700 hover:underline">
                Resonate
              </Link>
            </div>
            <div>Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</div>
            <div>Views: {data.viewCount.toLocaleString()}</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}
