/**
 * Wizard Template Rules
 *
 * 10 rules for the Growth Opportunities wizard, organized by category.
 * Each rule checks publisher data + census/civic data to generate
 * supportive, suggestive recommendations.
 *
 * Design principles:
 * - Suggestive, not prescriptive — "You might consider..." not "You should..."
 * - Editorial is sacred — focus on social media strategy, never editorial direction
 * - Community-sensitive — recommendations respect ethnic/community media's role
 */

import type { SFNeighborhood } from '@/types';
import type { PlatformType } from '@/lib/db/types';
import type { WizardRule, WizardRuleContext, WizardRuleResult } from './wizard-types';

// =============================================================================
// AUDIENCE GROWTH RULES (3)
// =============================================================================

const neighborhoodGap: WizardRule = {
  id: 'neighborhood-gap',
  type: 'neighborhood_expansion',
  category: 'audience_growth',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { censusData, publisherNeighborhoods, allNeighborhoods } = wizardData;

    if (publisherNeighborhoods.length === 0) return null;

    // Find neighborhoods the publisher doesn't cover, sorted by population
    const uncoveredWithPop: Array<{ name: string; population: number }> = [];

    for (const hood of allNeighborhoods) {
      if (publisherNeighborhoods.includes(hood)) continue;
      const census = censusData[hood];
      if (census) {
        uncoveredWithPop.push({ name: hood, population: census.population.total });
      }
    }

    if (uncoveredWithPop.length === 0) return null;

    // Sort by population descending
    uncoveredWithPop.sort((a, b) => b.population - a.population);
    const top3 = uncoveredWithPop.slice(0, 3);
    const totalReach = top3.reduce((sum, n) => sum + n.population, 0);

    const neighborhoodNames = top3.map((n) => formatNeighborhoodName(n.name)).join(', ');

    return {
      priority: 'medium',
      title: 'Nearby Neighborhoods to Explore',
      summary: `${neighborhoodNames} have sizable populations that may overlap with your existing audience. You might consider expanding your social media reach into these areas.`,
      detail: top3
        .map((n) => `${formatNeighborhoodName(n.name)}: ~${n.population.toLocaleString()} residents`)
        .join('\n'),
      potentialReach: totalReach,
      basedOn: 'Census population data vs. your current coverage areas',
      confidence: 0.7,
    };
  },
};

const languageReach: WizardRule = {
  id: 'language-reach',
  type: 'demographic_reach',
  category: 'audience_growth',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { censusData, publisherNeighborhoods, audienceProfile } = wizardData;

    if (publisherNeighborhoods.length === 0) return null;

    // Get publisher's languages
    const publisherLanguages = audienceProfile?.languages || [];

    // Calculate LEP rate in coverage areas
    let totalLepPct = 0;
    let count = 0;

    for (const hood of publisherNeighborhoods) {
      const census = censusData[hood];
      if (census) {
        totalLepPct += census.language.limitedEnglishProficiency;
        count++;
      }
    }

    if (count === 0) return null;
    const avgLep = totalLepPct / count;

    // Find dominant non-English languages in coverage area
    const langTotals: Record<string, number> = {};
    for (const hood of publisherNeighborhoods) {
      const census = censusData[hood];
      if (!census) continue;
      const langs = census.language.languagesSpoken;
      for (const [lang, pct] of Object.entries(langs)) {
        if (lang === 'english') continue;
        langTotals[lang] = (langTotals[lang] || 0) + pct;
      }
    }

    // Average the percentages
    const avgLangs = Object.entries(langTotals)
      .map(([lang, total]) => ({ lang, avgPct: total / count }))
      .sort((a, b) => b.avgPct - a.avgPct);

    // Find languages publisher doesn't already serve
    const unserved = avgLangs.filter(
      (l) => l.avgPct > 5 && !publisherLanguages.includes(l.lang)
    );

    if (unserved.length === 0 && avgLep < 15) return null;

    if (unserved.length > 0) {
      const topLang = unserved[0];
      return {
        priority: avgLep > 25 ? 'high' : 'medium',
        title: `${formatLanguageName(topLang.lang)}-Speaking Community Opportunity`,
        summary: `Your coverage areas have a significant ${formatLanguageName(topLang.lang)}-speaking population (~${Math.round(topLang.avgPct)}%). You might consider social media content in ${formatLanguageName(topLang.lang)} to connect with this community.`,
        supportingData: `Average LEP rate in your areas: ${Math.round(avgLep)}%`,
        basedOn: 'Census language data for your coverage neighborhoods',
        confidence: 0.75,
      };
    }

    return {
      priority: 'low',
      title: 'Multilingual Audience in Your Areas',
      summary: `About ${Math.round(avgLep)}% of residents in your coverage areas have limited English proficiency. Your multilingual content may already be reaching this community well.`,
      basedOn: 'Census LEP data for your coverage neighborhoods',
      confidence: 0.6,
    };
  },
};

const ageDemographicGap: WizardRule = {
  id: 'age-demographic-gap',
  type: 'demographic_reach',
  category: 'audience_growth',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { censusData, publisherNeighborhoods, audienceProfile } = wizardData;

    if (publisherNeighborhoods.length === 0) return null;

    // Get publisher's stated age ranges
    const publisherAgeRanges = audienceProfile?.age_ranges || [];

    // Calculate age distribution in coverage areas
    // Census data uses: under18, seniors (65+), and distribution: { '18-24', '25-34', '35-44', '45-54', '55-64' }
    const ageBuckets = {
      'Under 18': 0,
      '18-34': 0,
      '35-54': 0,
      '55+': 0,
    };
    let count = 0;

    for (const hood of publisherNeighborhoods) {
      const census = censusData[hood];
      if (!census?.age) continue;
      count++;
      const age = census.age;
      ageBuckets['Under 18'] += age.under18 || 0;
      ageBuckets['18-34'] += (age.distribution?.['18-24'] || 0) + (age.distribution?.['25-34'] || 0);
      ageBuckets['35-54'] += (age.distribution?.['35-44'] || 0) + (age.distribution?.['45-54'] || 0);
      ageBuckets['55+'] += (age.distribution?.['55-64'] || 0) + (age.seniors || 0);
    }

    if (count === 0) return null;

    // Average
    for (const key of Object.keys(ageBuckets) as Array<keyof typeof ageBuckets>) {
      ageBuckets[key] = ageBuckets[key] / count;
    }

    // Find the largest age group not already in publisher's audience
    const ageMapping: Record<string, string[]> = {
      'Under 18': ['under_18', 'youth', 'teens'],
      '18-34': ['18-24', '25-34', '18-34', 'young_adult'],
      '35-54': ['35-44', '45-54', '35-54', 'middle_aged'],
      '55+': ['55-64', '65+', '55+', 'senior', 'seniors'],
    };

    const gaps: Array<{ range: string; pct: number }> = [];
    for (const [range, pct] of Object.entries(ageBuckets)) {
      const aliases = ageMapping[range] || [];
      const isServed = publisherAgeRanges.some((r) =>
        aliases.some((a) => r.toLowerCase().includes(a))
      );
      if (!isServed && pct > 15) {
        gaps.push({ range, pct });
      }
    }

    if (gaps.length === 0) return null;

    gaps.sort((a, b) => b.pct - a.pct);
    const topGap = gaps[0];

    return {
      priority: topGap.pct > 25 ? 'medium' : 'low',
      title: `Reaching the ${topGap.range} Age Group`,
      summary: `About ${Math.round(topGap.pct)}% of residents in your coverage areas are ${topGap.range}. You might consider tailoring some social media content to engage this demographic.`,
      basedOn: 'Census age data vs. your audience profile',
      confidence: 0.65,
    };
  },
};

// =============================================================================
// SOCIAL MEDIA STRATEGY RULES (3)
// =============================================================================

const postingCadence: WizardRule = {
  id: 'posting-cadence',
  type: 'social_media_timing',
  category: 'social_strategy',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { performanceData } = ctx;
    if (!performanceData || performanceData.posts.length < 5) return null;

    // Group posts by platform
    const platformCounts: Record<string, number> = {};
    const platformDates: Record<string, Date[]> = {};

    for (const post of performanceData.posts) {
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
      if (!platformDates[post.platform]) platformDates[post.platform] = [];
      platformDates[post.platform].push(post.publishedAt);
    }

    // Calculate average posting frequency per platform
    const insights: string[] = [];
    let hasGap = false;

    for (const [platform, dates] of Object.entries(platformDates)) {
      if (dates.length < 2) continue;
      dates.sort((a, b) => a.getTime() - b.getTime());

      const daySpan = Math.max(1, (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24));
      const postsPerWeek = (dates.length / daySpan) * 7;

      if (postsPerWeek < 2) {
        insights.push(`${platform}: ~${postsPerWeek.toFixed(1)} posts/week`);
        hasGap = true;
      }
    }

    if (!hasGap) return null;

    return {
      priority: 'medium',
      title: 'Posting Consistency Opportunity',
      summary: `Some of your platforms have a lighter posting cadence. Consistent posting — even 3-4 times per week — often helps maintain audience engagement and algorithmic visibility.`,
      detail: insights.join('\n'),
      basedOn: `Analyzed posting frequency across ${Object.keys(platformCounts).length} platform(s)`,
      confidence: 0.7,
    };
  },
};

const engagementTimePatterns: WizardRule = {
  id: 'engagement-time-patterns',
  type: 'social_media_timing',
  category: 'social_strategy',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { performanceData } = ctx;
    if (!performanceData || performanceData.posts.length < 10) return null;

    // Group by day-of-week and calculate engagement
    const dayStats: Record<string, { count: number; totalEng: number }> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const post of performanceData.posts) {
      const day = days[post.publishedAt.getDay()];
      if (!dayStats[day]) dayStats[day] = { count: 0, totalEng: 0 };
      dayStats[day].count++;
      dayStats[day].totalEng += post.likes + post.comments * 3 + post.shares * 5;
    }

    // Find best days (at least 2 posts to be meaningful)
    const rankedDays = Object.entries(dayStats)
      .filter(([, stats]) => stats.count >= 2)
      .map(([day, stats]) => ({ day, avgEng: stats.totalEng / stats.count }))
      .sort((a, b) => b.avgEng - a.avgEng);

    if (rankedDays.length < 2) return null;

    const best = rankedDays[0];
    const worst = rankedDays[rankedDays.length - 1];

    if (best.avgEng / worst.avgEng < 1.3) return null;

    return {
      priority: 'medium',
      title: 'Your Best Days for Engagement',
      summary: `Your posts on ${best.day}s tend to get more engagement. You might consider scheduling your most important social media content for ${best.day}s when your community is most active.`,
      supportingData: `${best.day}: ${Math.round(best.avgEng)} avg engagement vs ${worst.day}: ${Math.round(worst.avgEng)}`,
      basedOn: `Engagement patterns from ${performanceData.posts.length} posts`,
      confidence: Math.min(0.85, 0.5 + performanceData.posts.length / 50),
    };
  },
};

const platformContentMix: WizardRule = {
  id: 'platform-content-mix',
  type: 'content_series',
  category: 'social_strategy',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { performanceData } = ctx;
    if (!performanceData || performanceData.posts.length < 8) return null;

    // Analyze content type distribution
    const typeStats: Record<string, { count: number; totalEng: number }> = {};

    for (const post of performanceData.posts) {
      const type = post.contentType.toLowerCase();
      if (!typeStats[type]) typeStats[type] = { count: 0, totalEng: 0 };
      typeStats[type].count++;
      typeStats[type].totalEng += post.likes + post.comments * 3 + post.shares * 5;
    }

    const total = performanceData.posts.length;
    const types = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      pct: (stats.count / total) * 100,
      avgEng: stats.totalEng / stats.count,
    }));

    // Check if one type dominates (>70%)
    const dominant = types.find((t) => t.pct > 70);
    if (!dominant) return null;

    const underused = types
      .filter((t) => t.type !== dominant.type && t.avgEng > dominant.avgEng * 0.8)
      .sort((a, b) => b.avgEng - a.avgEng);

    if (underused.length === 0) {
      return {
        priority: 'low',
        title: 'Content Format Variety',
        summary: `Your social media content is mostly ${dominant.type}s (${Math.round(dominant.pct)}%). You might consider experimenting with other formats — recurring social media series in different formats can help keep your audience engaged.`,
        basedOn: `Content type distribution across ${total} posts`,
        confidence: 0.6,
      };
    }

    return {
      priority: 'medium',
      title: 'Social Media Content Mix Opportunity',
      summary: `${Math.round(dominant.pct)}% of your content is ${dominant.type}s, but your ${underused[0].type} posts perform well too. A recurring social media series mixing formats could help diversify your reach.`,
      basedOn: `Content type performance across ${total} posts`,
      confidence: 0.7,
    };
  },
};

// =============================================================================
// PLATFORM EXPANSION RULES (2)
// =============================================================================

const missingPlatform: WizardRule = {
  id: 'missing-platform',
  type: 'platform_recommendation',
  category: 'platform_expansion',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { publisherPlatforms, audienceProfile } = wizardData;

    // Common platforms community publishers could use
    const commonPlatforms = ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'whatsapp'];
    const missing = commonPlatforms.filter((p) => !publisherPlatforms.includes(p as PlatformType));

    if (missing.length === 0) return null;

    // Prioritize based on audience demographics
    const ageRanges = audienceProfile?.age_ranges || [];
    const hasYouthAudience = ageRanges.some((r) =>
      r.toLowerCase().includes('18') || r.toLowerCase().includes('25') || r.toLowerCase().includes('youth')
    );

    let suggested: string;
    let reason: string;

    if (missing.includes('tiktok') && hasYouthAudience) {
      suggested = 'TikTok';
      reason = 'Your audience skews younger, and TikTok has strong reach with 18-34 year olds.';
    } else if (missing.includes('whatsapp')) {
      suggested = 'WhatsApp';
      reason = 'WhatsApp is widely used in many immigrant and multilingual communities for sharing news and updates.';
    } else if (missing.includes('instagram')) {
      suggested = 'Instagram';
      reason = 'Instagram remains a strong platform for visual storytelling and community engagement.';
    } else if (missing.includes('facebook')) {
      suggested = 'Facebook';
      reason = 'Facebook Groups and Pages are popular for community news sharing, especially with 35+ audiences.';
    } else {
      suggested = formatNeighborhoodName(missing[0]);
      reason = `This platform could help you reach audiences you're not yet connecting with.`;
    }

    return {
      priority: 'low',
      title: `Consider Expanding to ${suggested}`,
      summary: `You might consider ${suggested} as an additional channel. ${reason}`,
      basedOn: 'Your connected platforms vs. audience profile',
      confidence: 0.6,
    };
  },
};

const platformGrowthMomentum: WizardRule = {
  id: 'platform-growth-momentum',
  type: 'platform_recommendation',
  category: 'platform_expansion',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { performanceData } = ctx;
    if (!performanceData || performanceData.posts.length < 10) return null;

    // Group by platform and check engagement trends
    const platformEngagement: Record<string, Array<{ date: Date; eng: number }>> = {};

    for (const post of performanceData.posts) {
      if (!platformEngagement[post.platform]) platformEngagement[post.platform] = [];
      platformEngagement[post.platform].push({
        date: post.publishedAt,
        eng: post.likes + post.comments * 3 + post.shares * 5,
      });
    }

    // Find platforms with rising engagement
    const rising: Array<{ platform: string; trend: number }> = [];

    for (const [platform, posts] of Object.entries(platformEngagement)) {
      if (posts.length < 5) continue;

      posts.sort((a, b) => a.date.getTime() - b.date.getTime());
      const mid = Math.floor(posts.length / 2);
      const firstHalf = posts.slice(0, mid);
      const secondHalf = posts.slice(mid);

      const avgFirst = firstHalf.reduce((s, p) => s + p.eng, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, p) => s + p.eng, 0) / secondHalf.length;

      if (avgFirst > 0) {
        const trend = (avgSecond - avgFirst) / avgFirst;
        if (trend > 0.2) {
          rising.push({ platform, trend });
        }
      }
    }

    if (rising.length === 0) return null;

    rising.sort((a, b) => b.trend - a.trend);
    const top = rising[0];

    return {
      priority: 'medium',
      title: `${formatNeighborhoodName(top.platform)} Engagement is Growing`,
      summary: `Your engagement on ${formatNeighborhoodName(top.platform)} has increased ~${Math.round(top.trend * 100)}% recently. This momentum suggests your content is resonating — you might consider investing more effort there.`,
      basedOn: `Engagement trend analysis on ${formatNeighborhoodName(top.platform)}`,
      confidence: 0.75,
    };
  },
};

// =============================================================================
// COMMUNITY LANDSCAPE RULES (2)
// =============================================================================

const evictionHotspot: WizardRule = {
  id: 'eviction-hotspot',
  type: 'community_landscape',
  category: 'community_landscape',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { evictionStats, publisherNeighborhoods } = wizardData;

    if (!evictionStats || publisherNeighborhoods.length === 0) return null;

    // Check eviction rates in publisher's coverage areas
    const hotspots: Array<{ name: string; rate: number; total: number }> = [];

    for (const hood of publisherNeighborhoods) {
      const data = evictionStats.byNeighborhood[hood as SFNeighborhood];
      if (data && data.rate > evictionStats.averageRate * 1.3) {
        hotspots.push({
          name: hood,
          rate: data.rate,
          total: data.total,
        });
      }
    }

    if (hotspots.length === 0) return null;

    hotspots.sort((a, b) => b.rate - a.rate);
    const top = hotspots[0];

    return {
      priority: hotspots.length >= 2 ? 'high' : 'medium',
      title: 'Eviction Activity in Your Coverage Areas',
      summary: `${formatNeighborhoodName(top.name)} has an eviction rate of ${top.rate} per 1,000 rental units — ${Math.round((top.rate / evictionStats.averageRate) * 100 - 100)}% above the city average. This may be a community issue your audience cares about.`,
      detail: hotspots
        .map((h) => `${formatNeighborhoodName(h.name)}: ${h.rate}/1K units (${h.total} notices)`)
        .join('\n'),
      supportingData: `City average: ${evictionStats.averageRate}/1K units`,
      basedOn: 'DataSF eviction notices (last 12 months)',
      confidence: 0.85,
    };
  },
};

const civicDataSignal: WizardRule = {
  id: 'civic-data-signal',
  type: 'community_landscape',
  category: 'community_landscape',
  check: (ctx: WizardRuleContext): WizardRuleResult | null => {
    const { wizardData } = ctx;
    const { censusData, publisherNeighborhoods } = wizardData;

    if (publisherNeighborhoods.length === 0) return null;

    // Look for notable census signals in coverage areas
    // Uses fields available in NeighborhoodCensusData:
    //   economic.medianHouseholdIncome, economic.amiDistribution
    //   housing.renterOccupied, language.limitedEnglishProficiency
    const signals: string[] = [];
    let lowIncome = false;
    let highRenters = false;
    let highLep = false;

    for (const hood of publisherNeighborhoods) {
      const census = censusData[hood];
      if (!census) continue;

      // Low income signal: median income below $60k or high extremely-low AMI
      const extremelyLowAmi = census.economic?.amiDistribution?.extremelyLow || 0;
      if (extremelyLowAmi > 25) {
        signals.push(`${formatNeighborhoodName(hood)}: ${Math.round(extremelyLowAmi)}% extremely low-income households`);
        lowIncome = true;
      } else if (census.economic?.medianHouseholdIncome && census.economic.medianHouseholdIncome < 60000) {
        signals.push(`${formatNeighborhoodName(hood)}: Median income $${Math.round(census.economic.medianHouseholdIncome / 1000)}K`);
        lowIncome = true;
      }

      // High renter signal: >80% renter-occupied
      if (census.housing?.renterOccupied && census.housing.renterOccupied > 80) {
        signals.push(`${formatNeighborhoodName(hood)}: ${Math.round(census.housing.renterOccupied)}% renter-occupied`);
        highRenters = true;
      }

      if (census.language?.limitedEnglishProficiency && census.language.limitedEnglishProficiency > 30) {
        signals.push(`${formatNeighborhoodName(hood)}: ${Math.round(census.language.limitedEnglishProficiency)}% limited English proficiency`);
        highLep = true;
      }
    }

    if (signals.length === 0) return null;

    let title = 'Community Data Signals';
    if (lowIncome) title = 'Economic Vulnerability in Coverage Areas';
    else if (highRenters) title = 'Renter-Heavy Coverage Areas';
    else if (highLep) title = 'Language Access Needs in Coverage Areas';

    return {
      priority: signals.length >= 3 ? 'high' : 'medium',
      title,
      summary: `Census data reveals notable community indicators in your coverage areas. These data points may point to topics your audience is experiencing.`,
      detail: signals.join('\n'),
      basedOn: 'ACS Census data for your coverage neighborhoods',
      confidence: 0.8,
    };
  },
};

// =============================================================================
// ALL RULES
// =============================================================================

export const WIZARD_RULES: WizardRule[] = [
  // Audience Growth
  neighborhoodGap,
  languageReach,
  ageDemographicGap,
  // Social Media Strategy
  postingCadence,
  engagementTimePatterns,
  platformContentMix,
  // Platform Expansion
  missingPlatform,
  platformGrowthMomentum,
  // Community Landscape
  evictionHotspot,
  civicDataSignal,
];

// =============================================================================
// HELPERS
// =============================================================================

function formatNeighborhoodName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatLanguageName(lang: string): string {
  const names: Record<string, string> = {
    chinese: 'Chinese',
    spanish: 'Spanish',
    tagalog: 'Tagalog',
    vietnamese: 'Vietnamese',
    korean: 'Korean',
    russian: 'Russian',
    english: 'English',
  };
  return names[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}
