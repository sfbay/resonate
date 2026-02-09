/**
 * Demo Campaign Data
 *
 * Mock data for government campaign management demonstrations.
 * Includes campaigns at various lifecycle stages with matched publishers,
 * procurement data, and compliance tracking.
 *
 * SWAP: Replace with real Supabase queries when backend is built.
 */

import type { CampaignStatus, OrderStatus, ProcurementStatus } from '@/types';
import type { MandateType } from '@/lib/transactions/procurement';

// =============================================================================
// DEMO CAMPAIGNS
// =============================================================================

export interface DemoCampaign {
  id: string;
  name: string;
  description: string;
  department: string;
  departmentCode: string;
  status: CampaignStatus;
  budget: { min: number; max: number };  // In cents
  startDate: string;
  endDate: string;
  mandates: MandateType[];
  targetNeighborhoods: string[];
  targetLanguages: string[];
  targetCommunities: string[];
  matchCount: number;
  orderCount: number;
  totalSpend: number;  // In cents
  createdAt: string;
}

export function getDemoCampaigns(): DemoCampaign[] {
  return [
    {
      id: 'cmp-demo-001',
      name: 'Flu Shot Awareness 2026',
      description: 'Promote free flu vaccination clinics across SF neighborhoods, with focus on underserved communities and non-English-speaking populations.',
      department: 'Department of Public Health',
      departmentCode: 'DPH',
      status: 'in_progress',
      budget: { min: 500000, max: 1000000 },  // $5K-$10K
      startDate: '2026-01-15',
      endDate: '2026-03-15',
      mandates: ['ab_1511', 'local_law_83'],
      targetNeighborhoods: ['mission', 'chinatown', 'bayview_hunters_point', 'tenderloin', 'excelsior'],
      targetLanguages: ['english', 'spanish', 'chinese_cantonese', 'tagalog', 'vietnamese'],
      targetCommunities: ['latino_mexican', 'chinese', 'filipino', 'vietnamese'],
      matchCount: 8,
      orderCount: 3,
      totalSpend: 187500,  // $1,875
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'cmp-demo-002',
      name: 'Summer Programs Enrollment',
      description: 'Drive enrollment for summer youth programs in parks across the city. Focus on families with children ages 6-17.',
      department: 'Recreation & Parks',
      departmentCode: 'RPD',
      status: 'matching',
      budget: { min: 300000, max: 500000 },  // $3K-$5K
      startDate: '2026-04-01',
      endDate: '2026-06-15',
      mandates: ['ab_1511'],
      targetNeighborhoods: ['mission', 'bayview_hunters_point', 'excelsior', 'visitacion_valley', 'outer_mission'],
      targetLanguages: ['english', 'spanish', 'chinese_cantonese'],
      targetCommunities: ['latino_mexican', 'latino_central_american', 'black_african_american', 'chinese'],
      matchCount: 12,
      orderCount: 0,
      totalSpend: 0,
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'cmp-demo-003',
      name: 'New Muni Routes — Mission',
      description: 'Inform Mission District residents about new Muni route changes, stop relocations, and updated schedules.',
      department: 'SFMTA',
      departmentCode: 'SFMTA',
      status: 'completed',
      budget: { min: 200000, max: 400000 },  // $2K-$4K
      startDate: '2025-12-01',
      endDate: '2026-01-15',
      mandates: ['local_law_83'],
      targetNeighborhoods: ['mission', 'outer_mission', 'bernal_heights'],
      targetLanguages: ['english', 'spanish'],
      targetCommunities: ['latino_mexican', 'latino_central_american'],
      matchCount: 4,
      orderCount: 2,
      totalSpend: 270000,  // $2,700
      createdAt: '2025-11-20T09:00:00Z',
    },
    {
      id: 'cmp-demo-004',
      name: 'Small Business Grants Q2',
      description: 'Promote Q2 small business grant applications for minority-owned businesses in commercial corridors.',
      department: 'Office of Economic & Workforce Dev.',
      departmentCode: 'OEWD',
      status: 'draft',
      budget: { min: 400000, max: 800000 },  // $4K-$8K
      startDate: '2026-03-01',
      endDate: '2026-04-30',
      mandates: ['ab_1511', 'local_law_83', 'eo_13166'],
      targetNeighborhoods: ['chinatown', 'mission', 'bayview_hunters_point', 'tenderloin', 'japantown', 'western_addition'],
      targetLanguages: ['english', 'spanish', 'chinese_cantonese', 'chinese_mandarin', 'vietnamese', 'tagalog'],
      targetCommunities: ['chinese', 'latino_mexican', 'black_african_american', 'filipino', 'vietnamese'],
      matchCount: 0,
      orderCount: 0,
      totalSpend: 0,
      createdAt: '2026-02-05T14:00:00Z',
    },
  ];
}

// =============================================================================
// DEMO MATCHED PUBLISHERS
// =============================================================================

export interface DemoMatch {
  publisherId: string;
  publisherName: string;
  publisherLogo?: string;
  overallScore: number;
  scores: {
    geographic: number;
    demographic: number;
    economic: number;
    cultural: number;
    reach: number;
  };
  matchReasons: string[];
  estimatedCost: { low: number; high: number };  // In cents
  languages: string[];
  neighborhoods: string[];
  hasOrder: boolean;
  orderStatus?: OrderStatus;
}

export function getDemoMatchesForCampaign(campaignId: string): DemoMatch[] {
  if (campaignId === 'cmp-demo-001') {
    return [
      {
        publisherId: '11111111-1111-1111-1111-111111111101',
        publisherName: 'El Tecolote',
        overallScore: 92,
        scores: { geographic: 95, demographic: 90, economic: 85, cultural: 95, reach: 78 },
        matchReasons: ['Serves Mission District', 'Spanish & English content', 'Strong cultural alignment with Latino community'],
        estimatedCost: { low: 30000, high: 90000 },
        languages: ['spanish', 'english'],
        neighborhoods: ['mission', 'outer_mission', 'excelsior'],
        hasOrder: true,
        orderStatus: 'in_progress',
      },
      {
        publisherId: '11111111-1111-1111-1111-111111111103',
        publisherName: 'The Bay View',
        overallScore: 78,
        scores: { geographic: 90, demographic: 70, economic: 80, cultural: 75, reach: 65 },
        matchReasons: ['Serves Bayview-Hunters Point', 'Reaches Black community', 'Strong neighborhood engagement'],
        estimatedCost: { low: 25000, high: 75000 },
        languages: ['english'],
        neighborhoods: ['bayview_hunters_point', 'visitacion_valley'],
        hasOrder: true,
        orderStatus: 'accepted',
      },
      {
        publisherId: '11111111-1111-1111-1111-111111111102',
        publisherName: 'Mission Local',
        overallScore: 85,
        scores: { geographic: 92, demographic: 82, economic: 78, cultural: 88, reach: 82 },
        matchReasons: ['Mission District hyperlocal', 'Bilingual coverage', 'High digital engagement'],
        estimatedCost: { low: 35000, high: 100000 },
        languages: ['english', 'spanish'],
        neighborhoods: ['mission', 'bernal_heights'],
        hasOrder: true,
        orderStatus: 'in_progress',
      },
      {
        publisherId: 'pub-demo-singtao',
        publisherName: 'Sing Tao Daily',
        overallScore: 71,
        scores: { geographic: 60, demographic: 85, economic: 65, cultural: 80, reach: 70 },
        matchReasons: ['Cantonese-speaking audience', 'Chinatown coverage', 'Strong print + digital presence'],
        estimatedCost: { low: 40000, high: 120000 },
        languages: ['chinese_cantonese', 'chinese_mandarin'],
        neighborhoods: ['chinatown', 'inner_richmond'],
        hasOrder: false,
      },
      {
        publisherId: 'pub-demo-inquirer',
        publisherName: 'Philippine News',
        overallScore: 67,
        scores: { geographic: 55, demographic: 80, economic: 60, cultural: 85, reach: 55 },
        matchReasons: ['Tagalog-speaking audience', 'Filipino community focus', 'SoMa/Excelsior coverage'],
        estimatedCost: { low: 20000, high: 60000 },
        languages: ['tagalog', 'english'],
        neighborhoods: ['soma', 'excelsior'],
        hasOrder: false,
      },
    ];
  }

  // Default demo matches for other campaigns
  return [
    {
      publisherId: '11111111-1111-1111-1111-111111111101',
      publisherName: 'El Tecolote',
      overallScore: 85,
      scores: { geographic: 88, demographic: 82, economic: 80, cultural: 90, reach: 75 },
      matchReasons: ['Serves target neighborhoods', 'Language match', 'Cultural alignment'],
      estimatedCost: { low: 30000, high: 90000 },
      languages: ['spanish', 'english'],
      neighborhoods: ['mission', 'outer_mission'],
      hasOrder: false,
    },
    {
      publisherId: '11111111-1111-1111-1111-111111111102',
      publisherName: 'Mission Local',
      overallScore: 80,
      scores: { geographic: 85, demographic: 78, economic: 75, cultural: 82, reach: 80 },
      matchReasons: ['Hyperlocal Mission coverage', 'Bilingual audience'],
      estimatedCost: { low: 35000, high: 100000 },
      languages: ['english', 'spanish'],
      neighborhoods: ['mission', 'bernal_heights'],
      hasOrder: false,
    },
  ];
}

// =============================================================================
// DEMO COMPLIANCE DATA
// =============================================================================

export interface DemoComplianceData {
  campaignId: string;
  totalBudget: number;
  communityMediaSpend: number;
  communityMediaPercent: number;
  languageCoverage: { language: string; spend: number; publisherCount: number }[];
  neighborhoodCoverage: { neighborhood: string; spend: number; publisherCount: number }[];
  mandateStatus: { mandate: MandateType; met: boolean; details: string }[];
}

export function getDemoComplianceData(campaignId: string): DemoComplianceData {
  return {
    campaignId,
    totalBudget: 750000,
    communityMediaSpend: 187500,
    communityMediaPercent: 0.25,
    languageCoverage: [
      { language: 'Spanish', spend: 90000, publisherCount: 2 },
      { language: 'English', spend: 60000, publisherCount: 3 },
      { language: 'Cantonese', spend: 37500, publisherCount: 1 },
    ],
    neighborhoodCoverage: [
      { neighborhood: 'Mission', spend: 90000, publisherCount: 2 },
      { neighborhood: 'Bayview', spend: 37500, publisherCount: 1 },
      { neighborhood: 'Chinatown', spend: 37500, publisherCount: 1 },
      { neighborhood: 'Excelsior', spend: 22500, publisherCount: 1 },
    ],
    mandateStatus: [
      {
        mandate: 'ab_1511',
        met: true,
        details: '25% of advertising budget allocated to community media (threshold: 10%)',
      },
      {
        mandate: 'local_law_83',
        met: false,
        details: 'Missing coverage for: Tagalog, Vietnamese',
      },
    ],
  };
}
