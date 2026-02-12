/**
 * Resonate - Core Type Definitions
 *
 * This file defines the data models for the Resonate platform,
 * a community media marketplace connecting advertisers (government, businesses,
 * nonprofits) with community and ethnic publishers.
 */

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'publisher' | 'government' | 'advertiser' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// PUBLISHER MODELS
// =============================================================================

export interface Publisher {
  id: string;
  userId: string;

  // Basic Info
  name: string;                          // e.g., "Mission Local"
  description: string;                   // About the publication
  website?: string;

  // Vendor Status (for city procurement)
  vendorStatus: VendorStatus;
  vendorId?: string;                     // City vendor ID if registered
  vendorRegistrationDate?: Date;

  // Platforms & Reach
  platforms: PublisherPlatform[];

  // Audience Profile (what makes them matchable)
  audienceProfile: AudienceProfile;

  // Pricing
  rateCard: RateCard;

  // Status
  status: 'pending_review' | 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export type VendorStatus =
  | 'not_registered'          // Not yet a city vendor
  | 'registration_in_progress' // Started vendor registration
  | 'registered'               // Active city vendor
  | 'registration_expired';    // Needs renewal

export interface PublisherPlatform {
  platform: SocialPlatform;
  handle: string;                        // @missionlocal
  url: string;                           // https://instagram.com/missionlocal
  followerCount: number;
  engagementRate?: number;               // Average engagement %
  verified: boolean;                     // Has connected account for verification
  lastVerified?: Date;
}

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'newsletter'
  | 'website'
  | 'other';

// Messaging platforms (emerging channels)
export type MessagingPlatform =
  | 'whatsapp'
  | 'telegram'
  | 'signal'
  | 'sms'
  | 'weibo';

// Combined platform type for all distribution channels
export type Platform = SocialPlatform | MessagingPlatform | 'mailchimp' | 'substack' | 'google';

// =============================================================================
// AUDIENCE PROFILE - The core of matching
// =============================================================================

export interface AudienceProfile {
  // Geographic - where the audience is located
  geographic: GeographicProfile;

  // Demographic - who the audience is
  demographic: DemographicProfile;

  // Economic - financial characteristics
  economic: EconomicProfile;

  // Cultural & Community - identity and affiliations
  cultural: CulturalProfile;

  // Interests & Topics
  interests: string[];                   // e.g., ["Local politics", "Food", "Arts"]

  // Qualitative
  description: string;                   // Free-form description of audience

  // Data quality indicators
  dataSource: AudienceDataSource;
  lastUpdated: Date;
  confidenceScore?: number;              // 0-100, how confident we are in this data
}

// =============================================================================
// GEOGRAPHIC PROFILE
// =============================================================================

export interface GeographicProfile {
  citywide: boolean;                     // Serves all of SF

  // Neighborhood-level (human-friendly)
  neighborhoods: SFNeighborhood[];

  // Precise geographic targeting
  zipCodes?: string[];                   // e.g., ["94110", "94112"]
  censusTract?: string[];                // For precise demographic data alignment
  supervisorialDistricts?: SFDistrict[]; // SF's 11 supervisorial districts

  // Coverage strength per area (optional, for weighted matching)
  coverageByArea?: {
    area: string;                        // Neighborhood or zip
    strength: 'primary' | 'secondary' | 'some'; // How strong is presence here
    estimatedReach?: number;             // Estimated audience in this area
  }[];
}

// San Francisco Neighborhoods (standardized list)
export type SFNeighborhood =
  | 'bayview_hunters_point'
  | 'bernal_heights'
  | 'castro'
  | 'chinatown'
  | 'civic_center'
  | 'cole_valley'
  | 'diamond_heights'
  | 'dogpatch'
  | 'downtown'
  | 'excelsior'
  | 'financial_district'
  | 'glen_park'
  | 'haight_ashbury'
  | 'hayes_valley'
  | 'ingleside'
  | 'inner_richmond'
  | 'inner_sunset'
  | 'japantown'
  | 'lakeshore'
  | 'laurel_heights'
  | 'marina'
  | 'mission'
  | 'mission_bay'
  | 'nob_hill'
  | 'noe_valley'
  | 'north_beach'
  | 'oceanview'
  | 'outer_mission'
  | 'outer_richmond'
  | 'outer_sunset'
  | 'pacific_heights'
  | 'parkside'
  | 'portola'
  | 'potrero_hill'
  | 'presidio'
  | 'russian_hill'
  | 'sea_cliff'
  | 'soma'
  | 'south_beach'
  | 'stonestown'
  | 'tenderloin'
  | 'treasure_island'
  | 'twin_peaks'
  | 'visitacion_valley'
  | 'west_portal'
  | 'western_addition';

// SF Supervisorial Districts (1-11)
export type SFDistrict = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// =============================================================================
// DEMOGRAPHIC PROFILE
// =============================================================================

export interface DemographicProfile {
  // Age distribution
  ageRanges: AgeRange[];
  primaryAgeRange?: AgeRange;            // Dominant age group if known

  // Language
  languages: Language[];
  primaryLanguage?: Language;

  // Gender (if known/relevant)
  genderDistribution?: {
    male?: number;                       // Percentage 0-100
    female?: number;
    nonBinary?: number;
    unknown?: number;
  };

  // Education level
  educationLevels?: EducationLevel[];

  // Family status
  familyStatus?: FamilyStatus[];
}

export type AgeRange =
  | '13-17'                              // Teens (with parental context)
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55-64'
  | '65-74'
  | '75+';

export type Language =
  | 'english'
  | 'spanish'
  | 'chinese_cantonese'
  | 'chinese_mandarin'
  | 'tagalog'
  | 'vietnamese'
  | 'russian'
  | 'korean'
  | 'japanese'
  | 'arabic'
  | 'french'
  | 'portuguese'
  | 'hindi'
  | 'punjabi'
  | 'thai'
  | 'burmese'
  | 'samoan'
  | 'asl'                                // American Sign Language
  | 'other';

export type EducationLevel =
  | 'less_than_high_school'
  | 'high_school'
  | 'some_college'
  | 'associates'
  | 'bachelors'
  | 'graduate'
  | 'professional';

export type FamilyStatus =
  | 'single_no_children'
  | 'single_with_children'
  | 'partnered_no_children'
  | 'partnered_with_children'
  | 'multigenerational_household'
  | 'empty_nesters';

// =============================================================================
// ECONOMIC PROFILE
// =============================================================================

export interface EconomicProfile {
  // Income brackets (HUD AMI-based for SF)
  incomeLevel?: IncomeLevel[];

  // Housing situation
  housingStatus?: HousingStatus[];

  // Employment
  employmentStatus?: EmploymentStatus[];
  industries?: string[];                 // e.g., ["Tech", "Healthcare", "Service"]

  // Business ownership
  businessOwners?: boolean;              // Significant small business owner audience
  businessTypes?: string[];              // e.g., ["Restaurant", "Retail"]

  // Public benefits (relevant for city outreach)
  publicBenefitsRecipients?: boolean;
  benefitPrograms?: BenefitProgram[];

  // Financial characteristics
  bankingStatus?: 'banked' | 'underbanked' | 'unbanked' | 'mixed';
}

// Based on SF Area Median Income levels
export type IncomeLevel =
  | 'extremely_low'                      // ≤30% AMI
  | 'very_low'                           // 31-50% AMI
  | 'low'                                // 51-80% AMI
  | 'moderate'                           // 81-120% AMI
  | 'above_moderate';                    // >120% AMI

export type HousingStatus =
  | 'renter_market_rate'
  | 'renter_rent_controlled'
  | 'renter_subsidized'                  // Section 8, public housing
  | 'homeowner'
  | 'living_with_family'
  | 'unhoused'
  | 'transitional';

export type EmploymentStatus =
  | 'employed_full_time'
  | 'employed_part_time'
  | 'self_employed'
  | 'gig_worker'
  | 'unemployed_seeking'
  | 'unemployed_not_seeking'
  | 'retired'
  | 'student'
  | 'caregiver'
  | 'disabled';

export type BenefitProgram =
  | 'calfresh'                           // Food stamps
  | 'calworks'                           // Cash assistance
  | 'medi_cal'
  | 'wic'
  | 'section_8'
  | 'sfha_public_housing'                // SF Housing Authority
  | 'sfmta_lifeline'                     // Transit discount
  | 'care_fera'                          // Utility discount
  | 'free_reduced_lunch'
  | 'ssi_ssdi'
  | 'unemployment';

// =============================================================================
// CULTURAL PROFILE
// =============================================================================

export interface CulturalProfile {
  // Ethnic/cultural heritage (self-identified)
  ethnicities?: Ethnicity[];
  primaryEthnicity?: Ethnicity;

  // Immigration context
  immigrationGeneration?: ImmigrationGeneration[];

  // Community affiliations
  communityAffiliations?: CommunityAffiliation[];

  // Additional identity factors relevant to outreach
  identityFactors?: IdentityFactor[];
}

export type Ethnicity =
  | 'latino_mexican'
  | 'latino_central_american'
  | 'latino_south_american'
  | 'latino_caribbean'
  | 'latino_other'
  | 'chinese'
  | 'filipino'
  | 'vietnamese'
  | 'korean'
  | 'japanese'
  | 'south_asian'
  | 'southeast_asian_other'
  | 'pacific_islander'
  | 'black_african_american'
  | 'black_african'
  | 'black_caribbean'
  | 'white_european'
  | 'middle_eastern_north_african'
  | 'jewish'
  | 'native_american'
  | 'multiracial'
  | 'other';

export type ImmigrationGeneration =
  | 'first_gen_recent'                   // Immigrated within last 10 years
  | 'first_gen_established'              // Immigrated 10+ years ago
  | 'second_gen'                         // US-born, immigrant parents
  | 'third_gen_plus'                     // US-born, US-born parents
  | 'mixed';

export type CommunityAffiliation =
  | 'faith_catholic'
  | 'faith_protestant'
  | 'faith_buddhist'
  | 'faith_muslim'
  | 'faith_jewish'
  | 'faith_hindu'
  | 'faith_sikh'
  | 'faith_other'
  | 'lgbtq'
  | 'veterans'
  | 'disability_community'
  | 'seniors_community'
  | 'parents_families'
  | 'artists_creatives'
  | 'environmentalists'
  | 'labor_union'
  | 'neighborhood_association'
  | 'merchants_association'
  | 'cultural_org';                      // Cultural heritage organization

export type IdentityFactor =
  | 'new_to_city'                        // Recent transplants
  | 'native_san_franciscan'              // Born/raised in SF
  | 'essential_workers'
  | 'transit_dependent'
  | 'limited_english_proficiency'
  | 'digital_divide'                     // Limited internet/tech access
  | 'health_vulnerable'                  // Chronic conditions, immunocompromised
  | 'justice_involved'                   // Formerly incarcerated, on probation
  | 'undocumented'
  | 'mixed_status_family';

// =============================================================================
// AUDIENCE DATA SOURCE
// =============================================================================

export interface AudienceDataSource {
  // How was this audience data collected?
  methods: DataCollectionMethod[];

  // Platform-connected data (verified through OAuth)
  connectedPlatforms?: PlatformAudienceData[];

  // Self-reported vs verified
  verificationLevel: 'self_reported' | 'partially_verified' | 'verified';
}

export type DataCollectionMethod =
  | 'self_reported'                      // Publisher filled out form
  | 'platform_analytics'                 // From connected Instagram/TikTok/etc.
  | 'audience_survey'                    // Publisher surveyed their audience
  | 'census_overlay'                     // Matched against census data
  | 'engagement_analysis'                // Inferred from content engagement
  | 'third_party';                       // External data provider

export interface PlatformAudienceData {
  platform: SocialPlatform;
  connectedAt: Date;
  lastSynced: Date;

  // Platform-provided demographics (varies by platform)
  demographics?: {
    ageRanges?: { range: AgeRange; percentage: number }[];
    genderSplit?: { male: number; female: number; other: number };
    topCities?: { city: string; percentage: number }[];
    topCountries?: { country: string; percentage: number }[];
  };

  // Engagement patterns
  engagement?: {
    avgEngagementRate: number;
    peakHours?: number[];                // Hours in PT when most active
    peakDays?: number[];                 // Days of week (0=Sunday)
    topContentTypes?: string[];
  };

  // Audience growth
  growth?: {
    followersLast30Days: number;
    followersLast90Days: number;
    growthRate: number;                  // Percentage
  };
}

// =============================================================================
// RATE CARD - Publisher pricing
// =============================================================================

export interface RateCard {
  currency: 'USD';
  rates: Rate[];
  notes?: string;                        // Any pricing notes/caveats
}

export interface Rate {
  deliverableType: DeliverableType;
  platform: SocialPlatform;
  price: number;                         // In cents (e.g., 15000 = $150.00)
  description?: string;                  // e.g., "Includes one round of revisions"
}

export type DeliverableType =
  | 'sponsored_post'          // Single feed post
  | 'story'                   // Story/ephemeral content
  | 'reel'                    // Short-form video
  | 'carousel'                // Multi-image post
  | 'newsletter_feature'      // Featured in newsletter
  | 'newsletter_dedicated'    // Dedicated newsletter send
  | 'live_stream'             // Live video
  | 'custom';                 // Custom deliverable

// =============================================================================
// GOVERNMENT DEPARTMENT MODELS
// =============================================================================

/**
 * Government department advertiser profile.
 * Uses department-specific fields (codes, budget, fiscal year).
 * Future: a broader Advertiser type will encompass government, business,
 * nonprofit, and foundation sources via a `source` discriminator.
 */
export interface Advertiser {
  id: string;
  userId: string;

  // Department Info
  departmentName: string;                // e.g., "Department of Public Health"
  departmentCode?: string;               // Internal department code

  // Contact
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone?: string;

  // Budget Info
  fiscalYear?: string;
  budgetCode?: string;

  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// CAMPAIGN MODELS
// =============================================================================

export interface Campaign {
  id: string;
  advertiserId: string;

  // Campaign Details
  name: string;                          // e.g., "Flu Shot Campaign 2024"
  description: string;
  objectives: string[];                  // What success looks like

  // Target Audience
  targetAudience: TargetAudience;

  // Timing
  startDate: Date;
  endDate: Date;

  // Budget
  totalBudget: number;                   // In cents

  // Creative Assets
  assets: CampaignAsset[];
  keyMessages: string[];

  // Status
  status: CampaignStatus;

  // Orders placed under this campaign
  orders: Order[];

  createdAt: Date;
  updatedAt: Date;
}

export interface TargetAudience {
  // Geographic targeting
  geographic?: {
    citywide?: boolean;
    neighborhoods?: SFNeighborhood[];
    zipCodes?: string[];
    supervisorialDistricts?: SFDistrict[];
  };

  // Demographic targeting
  demographic?: {
    ageRanges?: AgeRange[];
    languages?: Language[];
    educationLevels?: EducationLevel[];
    familyStatus?: FamilyStatus[];
  };

  // Economic targeting
  economic?: {
    incomeLevel?: IncomeLevel[];
    housingStatus?: HousingStatus[];
    employmentStatus?: EmploymentStatus[];
    publicBenefitsRecipients?: boolean;
    benefitPrograms?: BenefitProgram[];
  };

  // Cultural targeting
  cultural?: {
    ethnicities?: Ethnicity[];
    immigrationGeneration?: ImmigrationGeneration[];
    communityAffiliations?: CommunityAffiliation[];
    identityFactors?: IdentityFactor[];
  };

  // Priority weighting (optional - which factors matter most for this campaign)
  priorityWeights?: {
    geographic?: number;                 // 0-100
    demographic?: number;
    economic?: number;
    cultural?: number;
    reach?: number;
  };

  // Free-form description for context
  description: string;
}

export interface CampaignAsset {
  id: string;
  type: 'image' | 'video' | 'copy' | 'document';
  name: string;
  url: string;
  notes?: string;
}

export type CampaignStatus =
  | 'draft'                   // Being created
  | 'matching'                // Looking for publishers
  | 'in_progress'             // Orders placed, campaign running
  | 'completed'               // All deliverables delivered
  | 'cancelled';

// =============================================================================
// ORDER MODELS - The purchasing/procurement layer
// =============================================================================

export interface Order {
  id: string;
  campaignId: string;
  publisherId: string;
  advertiserId: string;

  // What's being ordered
  lineItems: OrderLineItem[];

  // Pricing
  subtotal: number;                      // In cents
  total: number;                         // In cents (after any adjustments)

  // Status
  status: OrderStatus;

  // Procurement
  purchaseOrderNumber?: string;          // City PO number once generated
  procurementStatus: ProcurementStatus;

  // Timing
  deliveryDeadline: Date;

  // Fulfillment
  deliverables: Deliverable[];

  // Audit Trail
  statusHistory: OrderStatusChange[];

  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLineItem {
  id: string;
  deliverableType: DeliverableType;
  platform: SocialPlatform;
  quantity: number;
  unitPrice: number;                     // In cents
  totalPrice: number;                    // In cents
  description?: string;
}

export type OrderStatus =
  | 'draft'                   // Being created
  | 'pending_publisher'       // Sent to publisher for acceptance
  | 'accepted'                // Publisher accepted
  | 'rejected'                // Publisher rejected
  | 'in_progress'             // Work underway
  | 'delivered'               // All deliverables submitted
  | 'completed'               // Advertiser confirmed delivery
  | 'disputed'                // Issue raised
  | 'cancelled';

export type ProcurementStatus =
  | 'not_submitted'           // Order not yet ready for procurement
  | 'pending_approval'        // Awaiting department approval
  | 'approved'                // Approved, PO can be generated
  | 'po_generated'            // Purchase order created
  | 'invoiced'                // Publisher submitted invoice
  | 'paid';                   // Payment complete

export interface Deliverable {
  id: string;
  orderLineItemId: string;

  // What was delivered
  platform: SocialPlatform;
  type: DeliverableType;
  url?: string;                          // Link to the post/content
  screenshot?: string;                   // Screenshot URL for records

  // Metrics (if available)
  metrics?: DeliverableMetrics;

  // Status
  status: 'pending' | 'submitted' | 'approved' | 'revision_requested';
  submittedAt?: Date;
  approvedAt?: Date;

  notes?: string;
}

export interface DeliverableMetrics {
  impressions?: number;
  reach?: number;
  engagement?: number;
  clicks?: number;
  capturedAt: Date;
}

export interface OrderStatusChange {
  from: OrderStatus;
  to: OrderStatus;
  changedAt: Date;
  changedBy: string;                     // User ID
  notes?: string;
}

// =============================================================================
// MATCHING - How we connect advertisers with publishers
// =============================================================================

export interface MatchResult {
  publisherId: string;
  publisher: Publisher;

  // Match Quality
  overallScore: number;                  // 0-100

  // Score Breakdown by Category
  scores: {
    geographic: number;                  // Location overlap (neighborhoods, zip, district)
    demographic: number;                 // Age, language, education, family status
    economic: number;                    // Income, housing, employment, benefits
    cultural: number;                    // Ethnicity, immigration, community affiliation
    reach: number;                       // Audience size and engagement quality
  };

  // Detailed match breakdown (for transparency)
  matchDetails: {
    geographic?: {
      matchedNeighborhoods: SFNeighborhood[];
      matchedDistricts: SFDistrict[];
      coverageStrength: 'strong' | 'moderate' | 'weak';
    };
    demographic?: {
      matchedLanguages: Language[];
      matchedAgeRanges: AgeRange[];
      otherMatches: string[];
    };
    economic?: {
      matchedIncomeLevel: boolean;
      matchedHousingStatus: boolean;
      matchedBenefitPrograms: BenefitProgram[];
    };
    cultural?: {
      matchedEthnicities: Ethnicity[];
      matchedAffiliations: CommunityAffiliation[];
      matchedIdentityFactors: IdentityFactor[];
    };
  };

  // Why this match? (human-readable summary)
  matchReasons: string[];

  // Data quality indicator
  confidenceLevel: 'high' | 'medium' | 'low';
  dataQualityNotes?: string[];           // Any caveats about the match

  // Pricing estimate based on rate card
  estimatedCost: {
    low: number;
    high: number;
    currency: 'USD';
  };

  // Reach estimates
  estimatedReach?: {
    impressions: { low: number; high: number };
    engagements: { low: number; high: number };
  };
}

// =============================================================================
// CITY INTEGRATION TYPES (Stubs for future SF system integration)
// =============================================================================

export interface CityVendorRecord {
  vendorId: string;
  businessName: string;
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: Date;
  expirationDate?: Date;
  // Additional fields TBD based on SF vendor system
}

export interface CityPurchaseOrder {
  poNumber: string;
  vendorId: string;
  departmentCode: string;
  amount: number;
  description: string;
  createdAt: Date;
  // Additional fields TBD based on SF procurement system
}

// =============================================================================
// GROWTH & ANALYTICS TYPES
// =============================================================================

export type BadgeType =
  | 'rising_star'           // Rapid audience growth (20%+ in 30 days)
  | 'growth_champion'       // Sustained growth (50%+ in 90 days)
  | 'engagement_leader'     // Top 10% engagement rate
  | 'verified_publisher'    // All platforms connected
  | 'emerging_channel'      // Active on messaging platforms
  | 'community_builder';    // Strong local community engagement

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface Badge {
  type: BadgeType;
  tier?: BadgeTier;
  awardedAt: Date;
  expiresAt?: Date;
  platform?: Platform;       // Which platform earned this badge
  criteriaMet?: {
    metric: string;
    value: number;
    threshold: number;
  }[];
}

export type GrowthTrend = 'accelerating' | 'steady' | 'declining';

export interface GrowthMetrics {
  // Current snapshot
  totalFollowers: number;
  totalEngagement: number;
  averageEngagementRate: number;

  // Growth over time
  growth7d: {
    followersGained: number;
    growthRate: number;      // Percentage
  };
  growth30d: {
    followersGained: number;
    growthRate: number;
  };
  growth90d: {
    followersGained: number;
    growthRate: number;
  };

  // Trend analysis
  trend: GrowthTrend;
  trendConfidence: number;   // 0-100

  // Platform breakdown
  byPlatform: Record<Platform, {
    followers: number;
    engagementRate: number;
    growth30d: number;
    lastSynced: Date | null;
  }>;

  // Badges earned
  badges: Badge[];

  // Data quality
  verificationLevel: 'self_reported' | 'partial' | 'verified';
  lastUpdated: Date;
}

// =============================================================================
// PLATFORM CONNECTION TYPES
// =============================================================================

export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'pending';

export interface PlatformConnection {
  id: string;
  publisherId: string;
  platform: Platform;

  // Account info
  handle?: string;           // @username
  url?: string;              // Profile URL
  platformUserId?: string;   // Platform's internal user ID

  // OAuth tokens (stored encrypted)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scopes?: string[];

  // Status
  status: ConnectionStatus;
  verified: boolean;
  connectedAt: Date;
  lastSyncedAt?: Date;
}

export interface MetricsSnapshot {
  id: string;
  publisherId: string;
  platform: Platform;
  recordedAt: Date;

  // Core metrics
  followerCount?: number;
  followingCount?: number;
  postCount?: number;

  // Engagement
  engagementRate?: number;
  avgLikes?: number;
  avgComments?: number;
  avgShares?: number;
  avgSaves?: number;

  // Newsletter-specific
  subscriberCount?: number;
  openRate?: number;
  clickRate?: number;

  // Platform-provided demographics
  demographics?: {
    ageRanges?: { range: AgeRange; percentage: number }[];
    genderSplit?: { male: number; female: number; other: number };
    topCities?: { city: string; percentage: number }[];
    topCountries?: { country: string; percentage: number }[];
  };
}

// =============================================================================
// ENHANCED MATCH RESULT (with growth data)
// =============================================================================

export interface EnhancedMatchResult extends MatchResult {
  // Growth trajectory for advertisers
  growthTrajectory: {
    trend: GrowthTrend;
    growthRate30d: number;
    badges: Badge[];
    isRisingStar: boolean;
  };

  // Data quality for advertiser confidence
  dataQuality: 'verified' | 'partial' | 'self_reported';
  verifiedPlatforms: Platform[];
}
