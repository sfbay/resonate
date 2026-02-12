/**
 * Goal Presets for Advertise Portal
 *
 * Business-friendly campaign goals that auto-configure matching algorithm weights.
 * Each preset maps a human-readable goal to specific weight configurations
 * across the 5 matching dimensions (geographic, demographic, economic, cultural, reach).
 *
 * Source types: business, nonprofit, foundation (some goals available to all).
 */

export type CampaignSource = 'government' | 'business' | 'nonprofit' | 'foundation';

export interface CampaignGoalPreset {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji
  weights: {
    geographic: number;
    demographic: number;
    economic: number;
    cultural: number;
    reach: number;
  };
  availableTo: CampaignSource[];
}

export const GOAL_PRESETS: CampaignGoalPreset[] = [
  {
    id: 'reach_nearby_customers',
    label: 'Reach Nearby Customers',
    description: 'Connect with potential customers in your neighborhood through trusted local media.',
    icon: '📍',
    weights: { geographic: 40, demographic: 15, economic: 15, cultural: 20, reach: 10 },
    availableTo: ['business'],
  },
  {
    id: 'promote_event',
    label: 'Promote an Event',
    description: 'Maximize awareness and attendance for your upcoming event across the community.',
    icon: '🎉',
    weights: { geographic: 35, demographic: 15, economic: 10, cultural: 15, reach: 25 },
    availableTo: ['business', 'nonprofit', 'foundation'],
  },
  {
    id: 'build_brand_awareness',
    label: 'Build Brand Awareness',
    description: 'Get your brand in front of a wide local audience through high-reach community channels.',
    icon: '📣',
    weights: { geographic: 15, demographic: 15, economic: 15, cultural: 15, reach: 40 },
    availableTo: ['business'],
  },
  {
    id: 'reach_specific_community',
    label: 'Reach a Specific Community',
    description: 'Target a particular cultural or demographic community with precision.',
    icon: '🎯',
    weights: { geographic: 20, demographic: 30, economic: 10, cultural: 30, reach: 10 },
    availableTo: ['business', 'nonprofit', 'foundation'],
  },
  {
    id: 'support_local_journalism',
    label: 'Support Local Journalism',
    description: 'Position your ad spend as a direct investment in community journalism and civic infrastructure.',
    icon: '📰',
    weights: { geographic: 10, demographic: 10, economic: 10, cultural: 10, reach: 10 },
    availableTo: ['business', 'nonprofit', 'foundation'],
  },
  {
    id: 'launch_product_locally',
    label: 'Launch a Product Locally',
    description: 'Introduce a new product or service to the right demographic in your target neighborhoods.',
    icon: '🚀',
    weights: { geographic: 30, demographic: 25, economic: 15, cultural: 15, reach: 15 },
    availableTo: ['business'],
  },
  {
    id: 'recruit_local_talent',
    label: 'Recruit Local Talent',
    description: 'Reach qualified candidates in specific communities and neighborhoods.',
    icon: '💼',
    weights: { geographic: 25, demographic: 25, economic: 20, cultural: 15, reach: 15 },
    availableTo: ['business'],
  },
  {
    id: 'nonprofit_program_outreach',
    label: 'Program Outreach',
    description: 'Connect your programs and services with the communities that need them most.',
    icon: '🤝',
    weights: { geographic: 25, demographic: 20, economic: 25, cultural: 20, reach: 10 },
    availableTo: ['nonprofit'],
  },
  {
    id: 'foundation_initiative',
    label: 'Foundation Initiative',
    description: 'Promote grants, initiatives, and community investments to culturally aligned audiences.',
    icon: '🏛️',
    weights: { geographic: 15, demographic: 15, economic: 20, cultural: 35, reach: 15 },
    availableTo: ['foundation'],
  },
];

/**
 * Get a single goal preset by ID
 */
export function getGoalPreset(id: string): CampaignGoalPreset | undefined {
  return GOAL_PRESETS.find(p => p.id === id);
}

/**
 * Get all goal presets available to a given source type
 */
export function getPresetsForSource(source: CampaignSource): CampaignGoalPreset[] {
  return GOAL_PRESETS.filter(p => p.availableTo.includes(source));
}
