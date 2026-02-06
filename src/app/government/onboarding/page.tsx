'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type OnboardingStep = 'department' | 'audience' | 'review';

// Budget range mapping
const BUDGET_RANGES: Record<string, { min: number; max: number }> = {
  '500-2000': { min: 500, max: 2000 },
  '2000-5000': { min: 2000, max: 5000 },
  '5000-10000': { min: 5000, max: 10000 },
  '10000-25000': { min: 10000, max: 25000 },
  '25000+': { min: 25000, max: 100000 },
};

// Form data types
interface CampaignFormData {
  // Step 1: Department Info
  department: string;
  campaignName: string;
  campaignDescription: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  budgetRange: string;

  // Step 2: Target Audience
  targetNeighborhoods: string[];
  citywide: boolean;
  targetLanguages: string[];
  targetAgeRanges: string[];
  targetCommunities: string[];
  audienceDescription: string;
}

interface MatchedPublisher {
  publisher: {
    id: string;
    name: string;
    description: string;
    website: string;
    logoUrl?: string;
  };
  score: number;
  breakdown: {
    geographic: number;
    demographic: number;
    economic: number;
    cultural: number;
    reach: number;
  };
  matchingNeighborhoods: string[];
  matchingLanguages: string[];
  keyStrengths: string[];
  metrics: {
    followers: number;
    engagement: number;
  };
}

const initialFormData: CampaignFormData = {
  department: '',
  campaignName: '',
  campaignDescription: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  startDate: '',
  endDate: '',
  budgetRange: '',
  targetNeighborhoods: [],
  citywide: false,
  targetLanguages: [],
  targetAgeRanges: [],
  targetCommunities: [],
  audienceDescription: '',
};

export default function GovernmentOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('department');
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [matchedPublishers, setMatchedPublishers] = useState<MatchedPublisher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: { id: OnboardingStep; label: string }[] = [
    { id: 'department', label: 'Department' },
    { id: 'audience', label: 'Target Audience' },
    { id: 'review', label: 'Find Publishers' },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  // Update form data helper
  const updateFormData = useCallback((updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Toggle array item helper
  const toggleArrayItem = useCallback((field: keyof CampaignFormData, item: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      const newArray = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: newArray };
    });
  }, []);

  // Create campaign and fetch matches when reaching review step
  const createCampaignAndFetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse budget
      const budget = BUDGET_RANGES[formData.budgetRange] || { min: 0, max: 0 };

      // Create campaign via API
      const createResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          description: formData.campaignDescription,
          department: formData.department,
          targetNeighborhoods: formData.citywide ? [] : formData.targetNeighborhoods,
          targetLanguages: formData.targetLanguages,
          targetCommunities: formData.targetCommunities,
          targetAgeRanges: formData.targetAgeRanges,
          budgetMin: budget.min,
          budgetMax: budget.max,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          citySlug: 'sf',
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create campaign');
      }

      const createData = await createResponse.json();
      const newCampaignId = createData.campaign.id;
      setCampaignId(newCampaignId);

      // Fetch matched publishers
      const matchesResponse = await fetch(`/api/campaigns/${newCampaignId}/matches?limit=10`);

      if (!matchesResponse.ok) {
        throw new Error('Failed to fetch matching publishers');
      }

      const matchesData = await matchesResponse.json();
      setMatchedPublishers(matchesData.matches || []);
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Fetch matches when entering review step
  useEffect(() => {
    if (currentStep === 'review' && !campaignId) {
      createCampaignAndFetchMatches();
    }
  }, [currentStep, campaignId, createCampaignAndFetchMatches]);

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/government" className="text-xl font-bold text-slate-900">
            Resonate <span className="text-teal-600 font-normal text-sm ml-2">Government</span>
          </Link>
          <Link href="/government" className="text-sm text-slate-500 hover:text-slate-700">
            Save & Exit
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentIndex
                      ? 'bg-blue-600 text-white'
                      : index === currentIndex
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {index < currentIndex ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 md:w-32 h-1 mx-2 ${
                      index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-24 md:gap-40 mt-2 text-xs text-slate-500">
            {steps.map(step => (
              <span key={step.id}>{step.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {currentStep === 'department' && (
            <StepDepartment formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 'audience' && (
            <StepAudience
              formData={formData}
              updateFormData={updateFormData}
              toggleArrayItem={toggleArrayItem}
            />
          )}
          {currentStep === 'review' && (
            <StepReview
              formData={formData}
              matchedPublishers={matchedPublishers}
              isLoading={isLoading}
              error={error}
              campaignId={campaignId}
            />
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                currentIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Back
            </button>
            {currentStep === 'review' ? (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                View Matching Publishers
              </button>
            ) : (
              <button
                onClick={goNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface StepDepartmentProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
}

function StepDepartment({ formData, updateFormData }: StepDepartmentProps) {
  const departments = [
    { code: 'DPH', name: 'Department of Public Health' },
    { code: 'DEM', name: 'Department of Emergency Management' },
    { code: 'RPD', name: 'Recreation and Parks Department' },
    { code: 'OEWD', name: 'Office of Economic and Workforce Development' },
    { code: 'MOHCD', name: "Mayor's Office of Housing and Community Development" },
    { code: 'SFMTA', name: 'SF Municipal Transportation Agency' },
    { code: 'HSA', name: 'Human Services Agency' },
    { code: 'DCYF', name: 'Department of Children, Youth & Their Families' },
    { code: 'SFPL', name: 'San Francisco Public Library' },
    { code: 'ENV', name: 'Department of the Environment' },
  ];

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Department Information</h2>
      <p className="text-slate-600 mb-8">Tell us about your department and campaign contact.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Department *
          </label>
          <select
            value={formData.department}
            onChange={(e) => updateFormData({ department: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your department...</option>
            {departments.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
            <option value="other">Other (specify below)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => updateFormData({ campaignName: e.target.value })}
            placeholder="e.g., Flu Shot Outreach 2024, Summer Jobs Program"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign Description *
          </label>
          <textarea
            rows={3}
            value={formData.campaignDescription}
            onChange={(e) => updateFormData({ campaignDescription: e.target.value })}
            placeholder="What are you trying to communicate? What action do you want people to take?"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => updateFormData({ contactName: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Title
            </label>
            <input
              type="text"
              value={formData.contactTitle}
              onChange={(e) => updateFormData({ contactTitle: e.target.value })}
              placeholder="e.g., Communications Manager"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateFormData({ contactEmail: e.target.value })}
            placeholder="your.name@sfgov.org"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estimated Budget
          </label>
          <select
            value={formData.budgetRange}
            onChange={(e) => updateFormData({ budgetRange: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a range...</option>
            <option value="500-2000">$500 - $2,000</option>
            <option value="2000-5000">$2,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="10000-25000">$10,000 - $25,000</option>
            <option value="25000+">$25,000+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface StepAudienceProps {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
  toggleArrayItem: (field: keyof CampaignFormData, item: string) => void;
}

function StepAudience({ formData, updateFormData, toggleArrayItem }: StepAudienceProps) {
  const neighborhoods = [
    'mission', 'castro', 'chinatown', 'tenderloin', 'soma', 'financial-district',
    'bayview-hunters-point', 'excelsior', 'sunset', 'richmond', 'noe-valley', 'bernal-heights',
    'potrero-hill', 'marina', 'north-beach', 'haight-ashbury', 'outer-mission', 'visitacion-valley'
  ];

  const neighborhoodLabels: Record<string, string> = {
    'mission': 'Mission',
    'castro': 'Castro',
    'chinatown': 'Chinatown',
    'tenderloin': 'Tenderloin',
    'soma': 'SOMA',
    'financial-district': 'Financial District',
    'bayview-hunters-point': 'Bayview-Hunters Point',
    'excelsior': 'Excelsior',
    'sunset': 'Sunset',
    'richmond': 'Richmond',
    'noe-valley': 'Noe Valley',
    'bernal-heights': 'Bernal Heights',
    'potrero-hill': 'Potrero Hill',
    'marina': 'Marina',
    'north-beach': 'North Beach',
    'haight-ashbury': 'Haight-Ashbury',
    'outer-mission': 'Outer Mission',
    'visitacion-valley': 'Visitacion Valley',
  };

  const languages = [
    { code: 'english', label: 'English' },
    { code: 'spanish', label: 'Spanish' },
    { code: 'chinese-cantonese', label: 'Chinese (Cantonese)' },
    { code: 'chinese-mandarin', label: 'Chinese (Mandarin)' },
    { code: 'tagalog', label: 'Tagalog' },
    { code: 'vietnamese', label: 'Vietnamese' },
    { code: 'russian', label: 'Russian' },
    { code: 'korean', label: 'Korean' },
    { code: 'japanese', label: 'Japanese' },
    { code: 'arabic', label: 'Arabic' },
  ];

  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  const communities = [
    { code: 'families', label: 'Families with children' },
    { code: 'seniors', label: 'Seniors' },
    { code: 'small-business', label: 'Small business owners' },
    { code: 'renters', label: 'Renters' },
    { code: 'homeowners', label: 'Homeowners' },
    { code: 'immigrants', label: 'Immigrants & refugees' },
    { code: 'lgbtq', label: 'LGBTQ+ community' },
    { code: 'students', label: 'Students' },
    { code: 'low-income', label: 'Low-income residents' },
    { code: 'workers', label: 'Workers & employees' },
  ];

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Who do you need to reach?</h2>
      <p className="text-slate-600 mb-8">Define your target audience. The more specific, the better your matches.</p>

      <div className="space-y-8">
        {/* Geographic */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Target Neighborhoods
          </label>
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map(n => {
              const isSelected = formData.targetNeighborhoods.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleArrayItem('targetNeighborhoods', n)}
                  disabled={formData.citywide}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : formData.citywide
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {neighborhoodLabels[n] || n}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={formData.citywide}
                onChange={(e) => updateFormData({ citywide: e.target.checked, targetNeighborhoods: [] })}
                className="rounded border-slate-300"
              />
              Citywide campaign (all neighborhoods)
            </label>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Languages Needed
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map(l => {
              const isSelected = formData.targetLanguages.includes(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => toggleArrayItem('targetLanguages', l.code)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Ranges */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Age Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {ageRanges.map(a => {
              const isSelected = formData.targetAgeRanges.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArrayItem('targetAgeRanges', a)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Communities */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Target Communities
          </label>
          <div className="flex flex-wrap gap-2">
            {communities.map(c => {
              const isSelected = formData.targetCommunities.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleArrayItem('targetCommunities', c.code)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free-form description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Describe Your Target Audience
          </label>
          <textarea
            rows={4}
            value={formData.audienceDescription}
            onChange={(e) => updateFormData({ audienceDescription: e.target.value })}
            placeholder="Be specific about who you're trying to reach. Example: 'Spanish-speaking parents of school-age children in the Mission and Excelsior who may not be aware of free summer programs.'"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-slate-500 mt-2">
            This description helps us find the best matches and helps publishers understand your goals.
          </p>
        </div>
      </div>
    </div>
  );
}

interface StepReviewProps {
  formData: CampaignFormData;
  matchedPublishers: MatchedPublisher[];
  isLoading: boolean;
  error: string | null;
  campaignId: string | null;
}

function StepReview({ formData, matchedPublishers, isLoading, error, campaignId }: StepReviewProps) {
  // Helper to format reach numbers
  const formatReach = (followers: number): string => {
    if (followers >= 1000000) return `${(followers / 1000000).toFixed(1)}M`;
    if (followers >= 1000) return `${(followers / 1000).toFixed(1)}K`;
    return followers.toString();
  };

  // Helper to get neighborhoods display
  const getNeighborhoodsDisplay = (): string => {
    if (formData.citywide) return 'Citywide';
    if (formData.targetNeighborhoods.length === 0) return 'Not specified';
    return formData.targetNeighborhoods.slice(0, 3).join(', ') +
      (formData.targetNeighborhoods.length > 3 ? ` +${formData.targetNeighborhoods.length - 3} more` : '');
  };

  // Helper to get languages display
  const getLanguagesDisplay = (): string => {
    if (formData.targetLanguages.length === 0) return 'Not specified';
    return formData.targetLanguages.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Campaign Summary</h2>
        <p className="text-slate-600 mb-6">Based on your criteria, here are publishers that match your target audience.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Target Audience</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Campaign:</span>
              <p className="text-blue-800">{formData.campaignName || 'Untitled Campaign'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Department:</span>
              <p className="text-blue-800">{formData.department || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Neighborhoods:</span>
              <p className="text-blue-800">{getNeighborhoodsDisplay()}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Languages:</span>
              <p className="text-blue-800">{getLanguagesDisplay()}</p>
            </div>
            {formData.targetCommunities.length > 0 && (
              <div className="col-span-2">
                <span className="text-blue-600 font-medium">Communities:</span>
                <p className="text-blue-800">{formData.targetCommunities.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {campaignId && (
          <div className="text-xs text-slate-400 mb-2">Campaign ID: {campaignId}</div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Matched Publishers</h3>

        {isLoading && (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600">Finding matching publishers...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-red-600 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && matchedPublishers.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
            <p className="text-slate-600">No matching publishers found. Try broadening your target criteria.</p>
          </div>
        )}

        {!isLoading && matchedPublishers.map((match) => (
          <div key={match.publisher.id} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {match.publisher.logoUrl && (
                  <img
                    src={match.publisher.logoUrl}
                    alt={`${match.publisher.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{match.publisher.name}</h4>
                  <p className="text-sm text-slate-600">{match.publisher.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{match.score}% match</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {formatReach(match.metrics.followers)} reach
              </span>
              {match.metrics.engagement > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {match.metrics.engagement.toFixed(1)}% engagement
                </span>
              )}
              {match.matchingLanguages.map(lang => (
                <span key={lang} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  {lang}
                </span>
              ))}
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-5 gap-2 mb-4 text-xs">
              <div className="text-center">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${match.breakdown.geographic}%` }}
                  />
                </div>
                <span className="text-slate-500">Geo {match.breakdown.geographic}</span>
              </div>
              <div className="text-center">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${match.breakdown.demographic}%` }}
                  />
                </div>
                <span className="text-slate-500">Demo {match.breakdown.demographic}</span>
              </div>
              <div className="text-center">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${match.breakdown.economic}%` }}
                  />
                </div>
                <span className="text-slate-500">Econ {match.breakdown.economic}</span>
              </div>
              <div className="text-center">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${match.breakdown.cultural}%` }}
                  />
                </div>
                <span className="text-slate-500">Culture {match.breakdown.cultural}</span>
              </div>
              <div className="text-center">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${match.breakdown.reach}%` }}
                  />
                </div>
                <span className="text-slate-500">Reach {match.breakdown.reach}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Why this match:</p>
              <ul className="text-sm text-slate-600">
                {match.keyStrengths.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {match.publisher.website && (
                <a
                  href={match.publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-blue-600"
                >
                  Visit website
                </a>
              )}
              <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add to Campaign
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="font-medium text-slate-900 mb-2">Next Steps</h3>
        <ol className="text-sm text-slate-600 space-y-2">
          <li>1. Select publishers to add to your campaign</li>
          <li>2. Define deliverables and timeline for each publisher</li>
          <li>3. Review and submit your campaign request</li>
          <li>4. Publishers will respond within 2-3 business days</li>
          <li>5. Once accepted, we&apos;ll generate procurement documentation</li>
        </ol>
      </div>
    </div>
  );
}
