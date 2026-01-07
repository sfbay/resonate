'use client';

/**
 * GrowthBadge Component
 *
 * Displays a growth badge with tier indicator and hover details.
 */

import type { Badge, BadgeType, BadgeTier } from '@/types';
import { useState } from 'react';

interface GrowthBadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const BADGE_CONFIG: Record<
  BadgeType,
  { name: string; icon: string; description: string; color: string }
> = {
  rising_star: {
    name: 'Rising Star',
    icon: '⭐',
    description: 'Rapid audience growth in the last 30 days',
    color: 'from-amber-400 to-orange-500',
  },
  growth_champion: {
    name: 'Growth Champion',
    icon: '🏆',
    description: 'Sustained 50%+ growth over 90 days',
    color: 'from-yellow-400 to-amber-500',
  },
  engagement_leader: {
    name: 'Engagement Leader',
    icon: '💬',
    description: 'Top 10% engagement rate among publishers',
    color: 'from-pink-400 to-rose-500',
  },
  verified_publisher: {
    name: 'Verified Publisher',
    icon: '✓',
    description: 'All platforms connected and verified',
    color: 'from-emerald-400 to-teal-500',
  },
  emerging_channel: {
    name: 'Emerging Channel',
    icon: '📱',
    description: 'Active on messaging platforms (WhatsApp, Telegram, etc.)',
    color: 'from-sky-400 to-blue-500',
  },
  community_builder: {
    name: 'Community Builder',
    icon: '🤝',
    description: 'Strong local community engagement',
    color: 'from-violet-400 to-purple-500',
  },
};

const TIER_CONFIG: Record<BadgeTier, { label: string; ring: string }> = {
  bronze: { label: 'Bronze', ring: 'ring-amber-600' },
  silver: { label: 'Silver', ring: 'ring-slate-400' },
  gold: { label: 'Gold', ring: 'ring-yellow-400' },
};

const SIZE_CONFIG = {
  sm: {
    container: 'w-8 h-8',
    icon: 'text-sm',
    ring: 'ring-2',
  },
  md: {
    container: 'w-12 h-12',
    icon: 'text-xl',
    ring: 'ring-2',
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'text-2xl',
    ring: 'ring-3',
  },
};

export function GrowthBadge({ badge, size = 'md', showDetails = true }: GrowthBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const config = BADGE_CONFIG[badge.type];
  const tier = badge.tier ? TIER_CONFIG[badge.tier] : null;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Circle */}
      <div
        className={`
          ${sizeConfig.container}
          rounded-full
          bg-gradient-to-br ${config.color}
          flex items-center justify-center
          shadow-lg
          ${tier ? `${sizeConfig.ring} ${tier.ring} ring-offset-2` : ''}
          transition-transform hover:scale-110
          cursor-pointer
        `}
      >
        <span className={sizeConfig.icon}>{config.icon}</span>
      </div>

      {/* Tier indicator for gold */}
      {badge.tier === 'gold' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow">
          <span className="text-[10px]">★</span>
        </div>
      )}

      {/* Hover tooltip */}
      {showDetails && isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl border border-slate-100 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <span className="font-semibold text-charcoal text-sm">{config.name}</span>
          </div>
          {tier && (
            <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mb-2">
              {tier.label}
            </span>
          )}
          <p className="text-xs text-slate-600">{config.description}</p>

          {badge.criteriaMet && badge.criteriaMet.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                {badge.criteriaMet[0].metric}: {badge.criteriaMet[0].value}
                {badge.criteriaMet[0].threshold && ` (threshold: ${badge.criteriaMet[0].threshold})`}
              </p>
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-3 h-3 bg-white border-r border-b border-slate-100 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Badge collection display
 */
interface BadgeCollectionProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

export function BadgeCollection({
  badges,
  size = 'md',
  maxDisplay = 5,
}: BadgeCollectionProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  if (badges.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">
        No badges earned yet. Keep growing!
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {displayBadges.map((badge, index) => (
        <GrowthBadge key={`${badge.type}-${index}`} badge={badge} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-sm text-slate-500 font-medium">+{remaining} more</span>
      )}
    </div>
  );
}

/**
 * Rising Star badge (featured variant)
 */
interface RisingStarBadgeProps {
  growthRate: number;
  tier: BadgeTier;
}

export function RisingStarBadge({ growthRate, tier }: RisingStarBadgeProps) {
  const tierColors = {
    bronze: 'from-amber-500 to-orange-600',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-300 to-amber-500',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        bg-gradient-to-r ${tierColors[tier]}
        text-white font-semibold text-sm
        rounded-full shadow-lg
      `}
    >
      <span>⭐</span>
      <span>Rising Star</span>
      <span className="text-xs opacity-90">+{growthRate.toFixed(0)}%</span>
    </div>
  );
}
