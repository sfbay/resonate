'use client';

/**
 * Advertise Portal — Onboarding Wizard
 *
 * 4-step marigold-themed wizard for businesses, nonprofits, and foundations
 * to create community media campaigns with goal-based matching.
 *
 * Steps:
 *   1. About You — org type, details, campaign basics
 *   2. Choose Your Goal — goal preset cards filtered by org type
 *   3. Refine Audience — optional neighborhood/language/age/community targeting
 *   4. Your Matches — create campaign, show matched publishers
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  getPresetsForSource,
  getGoalPreset,
  type CampaignSource,
  type CampaignGoalPreset,
} from '@/lib/campaigns/goal-presets';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

type WizardStep = 'about' | 'goal' | 'audience' | 'matches';

type OrgType = 'business' | 'nonprofit' | 'foundation';

interface FormData {
  // Step 1
  orgType: OrgType | '';
  orgName: string;
  contactName: string;
  contactEmail: string;
  campaignName: string;
  campaignDescription: string;
  startDate: string;
  endDate: string;
  budgetRange: string;
  // Business-specific
  industry: string;
  businessSize: string;
  // Nonprofit-specific
  mission: string;
  focusAreas: string;
  // Foundation-specific
  grantAreas: string;
  // Step 2
  goalId: string;
  // Step 3
  targetNeighborhoods: string[];
  citywide: boolean;
  targetLanguages: string[];
  targetAgeRanges: string[];
  targetCommunities: string[];
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
  metrics: { followers: number; engagement: number };
}

// ─────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────

const BUDGET_RANGES: Record<string, { min: number; max: number; label: string }> = {
  '500-2000': { min: 500, max: 2000, label: '$500 – $2,000' },
  '2000-5000': { min: 2000, max: 5000, label: '$2,000 – $5,000' },
  '5000-10000': { min: 5000, max: 10000, label: '$5,000 – $10,000' },
  '10000-25000': { min: 10000, max: 25000, label: '$10,000 – $25,000' },
  '25000+': { min: 25000, max: 100000, label: '$25,000+' },
};

const INDUSTRIES = [
  'Restaurant / Food & Beverage',
  'Retail / Shopping',
  'Professional Services',
  'Healthcare / Wellness',
  'Real Estate',
  'Education',
  'Technology',
  'Arts & Entertainment',
  'Financial Services',
  'Other',
];

const NEIGHBORHOODS: { id: string; label: string }[] = [
  { id: 'mission', label: 'Mission' },
  { id: 'castro', label: 'Castro' },
  { id: 'chinatown', label: 'Chinatown' },
  { id: 'tenderloin', label: 'Tenderloin' },
  { id: 'soma', label: 'SoMa' },
  { id: 'financial-district', label: 'Financial District' },
  { id: 'bayview-hunters-point', label: 'Bayview-Hunters Point' },
  { id: 'excelsior', label: 'Excelsior' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'richmond', label: 'Richmond' },
  { id: 'noe-valley', label: 'Noe Valley' },
  { id: 'bernal-heights', label: 'Bernal Heights' },
  { id: 'potrero-hill', label: 'Potrero Hill' },
  { id: 'marina', label: 'Marina' },
  { id: 'north-beach', label: 'North Beach' },
  { id: 'haight-ashbury', label: 'Haight-Ashbury' },
  { id: 'outer-mission', label: 'Outer Mission' },
  { id: 'visitacion-valley', label: 'Visitacion Valley' },
];

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'spanish', label: 'Spanish' },
  { code: 'chinese-cantonese', label: 'Cantonese' },
  { code: 'chinese-mandarin', label: 'Mandarin' },
  { code: 'tagalog', label: 'Tagalog' },
  { code: 'vietnamese', label: 'Vietnamese' },
  { code: 'russian', label: 'Russian' },
  { code: 'korean', label: 'Korean' },
  { code: 'japanese', label: 'Japanese' },
  { code: 'arabic', label: 'Arabic' },
];

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

const COMMUNITIES = [
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

const INITIAL_FORM: FormData = {
  orgType: '',
  orgName: '',
  contactName: '',
  contactEmail: '',
  campaignName: '',
  campaignDescription: '',
  startDate: '',
  endDate: '',
  budgetRange: '',
  industry: '',
  businessSize: '',
  mission: '',
  focusAreas: '',
  grantAreas: '',
  goalId: '',
  targetNeighborhoods: [],
  citywide: false,
  targetLanguages: [],
  targetAgeRanges: [],
  targetCommunities: [],
};

const STEPS: { id: WizardStep; num: number; label: string; subtitle: string }[] = [
  { id: 'about', num: 1, label: 'About You', subtitle: 'Your organization' },
  { id: 'goal', num: 2, label: 'Your Goal', subtitle: 'What to achieve' },
  { id: 'audience', num: 3, label: 'Audience', subtitle: 'Who to reach' },
  { id: 'matches', num: 4, label: 'Matches', subtitle: 'Publisher results' },
];

const ORG_TYPES: { id: OrgType; label: string; icon: string; desc: string }[] = [
  { id: 'business', label: 'Business', icon: '🏪', desc: 'Local shops, restaurants, services, regional brands' },
  { id: 'nonprofit', label: 'Nonprofit', icon: '🤝', desc: 'Community organizations, legal aid, youth programs' },
  { id: 'foundation', label: 'Foundation', icon: '🏛️', desc: 'Foundations, grant-makers, institutional funders' },
];

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────

export default function AdvertiseOnboarding() {
  const [step, setStep] = useState<WizardStep>('about');
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedPublisher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const update = useCallback((u: Partial<FormData>) => {
    setForm(prev => ({ ...prev, ...u }));
  }, []);

  const toggle = useCallback((field: keyof FormData, item: string) => {
    setForm(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item] };
    });
  }, []);

  // Build advertiser profile based on org type
  const buildAdvertiserProfile = useCallback(() => {
    const base = { orgName: form.orgName, contactName: form.contactName, contactEmail: form.contactEmail };
    switch (form.orgType) {
      case 'business':
        return { ...base, industry: form.industry, businessSize: form.businessSize };
      case 'nonprofit':
        return { ...base, mission: form.mission, focusAreas: form.focusAreas };
      case 'foundation':
        return { ...base, grantAreas: form.grantAreas };
      default:
        return base;
    }
  }, [form]);

  // Create campaign + fetch matches
  const createAndMatch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const budget = BUDGET_RANGES[form.budgetRange] || { min: 0, max: 0 };
      const goalPreset = getGoalPreset(form.goalId);
      const weights = goalPreset?.weights || { geographic: 25, demographic: 20, economic: 20, cultural: 20, reach: 15 };

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.campaignName,
          description: form.campaignDescription,
          department: form.orgName,
          source: form.orgType || 'business',
          goal: form.goalId || null,
          advertiserProfile: buildAdvertiserProfile(),
          targetNeighborhoods: form.citywide ? [] : form.targetNeighborhoods,
          targetLanguages: form.targetLanguages,
          targetCommunities: form.targetCommunities,
          targetAgeRanges: form.targetAgeRanges,
          budgetMin: budget.min,
          budgetMax: budget.max,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          weightGeographic: weights.geographic,
          weightDemographic: weights.demographic,
          weightEconomic: weights.economic,
          weightCultural: weights.cultural,
          weightReach: weights.reach,
          citySlug: 'sf',
        }),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      const data = await res.json();
      const newId = data.campaign.id;
      setCampaignId(newId);

      const matchRes = await fetch(`/api/campaigns/${newId}/matches?limit=10`);
      if (!matchRes.ok) throw new Error('Failed to fetch matching publishers');
      const matchData = await matchRes.json();
      setMatches(matchData.matches || []);
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [form, buildAdvertiserProfile]);

  useEffect(() => {
    if (step === 'matches' && !campaignId) {
      createAndMatch();
    }
  }, [step, campaignId, createAndMatch]);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  // Audience summary for sidebar
  const audienceSummary = useMemo(() => {
    const geo = form.citywide
      ? 'Citywide'
      : form.targetNeighborhoods.length > 0
      ? `${form.targetNeighborhoods.length} neighborhood${form.targetNeighborhoods.length > 1 ? 's' : ''}`
      : null;
    const langs = form.targetLanguages.length > 0
      ? form.targetLanguages.map(l => LANGUAGES.find(la => la.code === l)?.label || l).join(', ')
      : null;
    const ages = form.targetAgeRanges.length > 0
      ? form.targetAgeRanges.join(', ')
      : null;
    const comms = form.targetCommunities.length > 0
      ? `${form.targetCommunities.length} communit${form.targetCommunities.length > 1 ? 'ies' : 'y'}`
      : null;
    return { geo, langs, ages, comms };
  }, [form]);

  const goalPreset = form.goalId ? getGoalPreset(form.goalId) : null;
  const orgLabel = ORG_TYPES.find(o => o.id === form.orgType)?.label;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-[var(--color-marigold)]">
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/advertise" className="text-white/70 hover:text-white text-sm transition-colors">
                Advertise
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white text-sm font-medium">New Campaign</span>
            </div>
            <Link
              href="/advertise"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Save & Exit
            </Link>
          </div>

          <div className="mt-6 mb-2">
            <h1 className="font-[family-name:var(--font-fraunces)] text-white text-2xl md:text-3xl font-semibold">
              Start Your Campaign
            </h1>
            <p className="text-white/70 mt-1 max-w-lg">
              Tell us about your organization and goals, and we&apos;ll match you with community publishers.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6 mb-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => { if (i < stepIndex) setStep(s.id); }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i === stepIndex
                      ? 'bg-white text-[var(--color-marigold-dark)]'
                      : i < stepIndex
                      ? 'bg-white/20 text-white cursor-pointer hover:bg-white/30'
                      : 'bg-white/5 text-white/40 cursor-default'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < stepIndex
                      ? 'bg-white/30 text-white'
                      : i === stepIndex
                      ? 'bg-[var(--color-marigold)] text-white'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {i < stepIndex ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-1 ${i < stepIndex ? 'bg-white/40' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Left: Form Steps */}
          <div>
            {step === 'about' && <StepAbout form={form} update={update} />}
            {step === 'goal' && <StepGoal form={form} update={update} />}
            {step === 'audience' && <StepAudience form={form} update={update} toggle={toggle} />}
            {step === 'matches' && (
              <StepMatches
                form={form}
                matches={matches}
                isLoading={isLoading}
                error={error}
                campaignId={campaignId}
              />
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={stepIndex === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  stepIndex === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {step === 'matches' ? (
                <div className="flex items-center gap-3">
                  {campaignId && (
                    <Link
                      href={`/advertise/campaigns/${campaignId}`}
                      className="btn bg-[var(--color-marigold)] text-white text-sm px-6 py-2.5 hover:bg-[var(--color-marigold-dark)]"
                    >
                      View Campaign Detail
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href="/advertise/dashboard"
                    className="btn bg-white text-[var(--color-marigold-dark)] border border-[var(--color-marigold)]/20 text-sm px-6 py-2.5 hover:bg-[var(--color-cream)]"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <button
                  onClick={goNext}
                  className="btn bg-[var(--color-marigold)] text-white text-sm px-6 py-2.5 hover:bg-[var(--color-marigold-dark)]"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right: Campaign Summary Rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[var(--color-marigold)] px-5 py-4">
                  <p className="text-xs font-semibold tracking-wider uppercase text-white/60">Campaign Summary</p>
                  <p className="text-white font-[family-name:var(--font-fraunces)] text-lg mt-1 leading-tight">
                    {form.campaignName || 'Untitled Campaign'}
                  </p>
                </div>

                <div className="px-5 py-4 space-y-4 text-sm">
                  <SummaryRow label="Organization" value={form.orgName || '—'} />
                  {orgLabel && <SummaryRow label="Type" value={orgLabel} />}
                  <SummaryRow label="Budget" value={form.budgetRange ? BUDGET_RANGES[form.budgetRange]?.label : '—'} />

                  {(form.startDate || form.endDate) && (
                    <SummaryRow
                      label="Timeline"
                      value={[
                        form.startDate && new Date(form.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        form.endDate && new Date(form.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      ].filter(Boolean).join(' – ') || '—'}
                    />
                  )}

                  {goalPreset && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Goal</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{goalPreset.icon}</span>
                        <span className="text-[var(--color-charcoal)] font-medium">{goalPreset.label}</span>
                      </div>
                    </div>
                  )}

                  {(audienceSummary.geo || audienceSummary.langs || audienceSummary.ages || audienceSummary.comms) && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Target Audience</p>
                      <div className="flex flex-wrap gap-1.5">
                        {audienceSummary.geo && <SummaryChip label={audienceSummary.geo} />}
                        {audienceSummary.langs && <SummaryChip label={audienceSummary.langs} />}
                        {audienceSummary.ages && <SummaryChip label={audienceSummary.ages} />}
                        {audienceSummary.comms && <SummaryChip label={audienceSummary.comms} />}
                      </div>
                    </div>
                  )}

                  {step === 'matches' && matches.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Matches</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[var(--color-marigold-dark)] font-[family-name:var(--font-fraunces)]">
                          {matches.length}
                        </span>
                        <span className="text-slate-500">publishers found</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100">
                  <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Quick Links</p>
                  <div className="space-y-1.5">
                    <Link href="/advertise/dashboard" className="flex items-center gap-2 text-sm text-[var(--color-marigold-dark)] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Campaign Dashboard
                    </Link>
                    <Link href="/advertise" className="flex items-center gap-2 text-sm text-[var(--color-marigold-dark)] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" />
                      </svg>
                      Advertise Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SIDEBAR HELPERS
// ─────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-[var(--color-charcoal)] font-medium mt-0.5">{value}</p>
    </div>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-amber-50 text-amber-700 border-amber-100">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────
// STEP 1: ABOUT YOU
// ─────────────────────────────────────────────────

function StepAbout({
  form,
  update,
}: {
  form: FormData;
  update: (u: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Org Type Selector */}
      <FormSection title="Organization Type" subtitle="What kind of organization are you?">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ORG_TYPES.map(org => (
            <button
              key={org.id}
              type="button"
              onClick={() => update({ orgType: org.id, goalId: '' })}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                form.orgType === org.id
                  ? 'border-[var(--color-marigold)] bg-amber-50 shadow-sm'
                  : 'border-gray-200 hover:border-[var(--color-marigold)]/50 hover:bg-amber-50/30'
              }`}
            >
              <div className="text-3xl mb-3">{org.icon}</div>
              <h3 className="font-semibold text-[var(--color-charcoal)]">{org.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{org.desc}</p>
            </button>
          ))}
        </div>
      </FormSection>

      {/* Org Details — conditional fields by type */}
      {form.orgType && (
        <FormSection title="Organization Details" subtitle="Tell us about your organization.">
          <div className="space-y-5">
            <FormField label="Organization Name" required>
              <input
                type="text"
                value={form.orgName}
                onChange={e => update({ orgName: e.target.value })}
                placeholder={form.orgType === 'business' ? 'e.g., Bi-Rite Market' : form.orgType === 'nonprofit' ? 'e.g., Bay Area Legal Aid' : 'e.g., SF Foundation'}
                className="form-input"
              />
            </FormField>

            {form.orgType === 'business' && (
              <>
                <FormField label="Industry">
                  <select
                    value={form.industry}
                    onChange={e => update({ industry: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select an industry...</option>
                    {INDUSTRIES.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Business Size">
                  <select
                    value={form.businessSize}
                    onChange={e => update({ businessSize: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select size...</option>
                    <option value="solo">Solo / Freelancer</option>
                    <option value="small">Small (1–10 employees)</option>
                    <option value="medium">Medium (11–50 employees)</option>
                    <option value="large">Large (50+ employees)</option>
                  </select>
                </FormField>
              </>
            )}

            {form.orgType === 'nonprofit' && (
              <>
                <FormField label="Mission">
                  <textarea
                    rows={2}
                    value={form.mission}
                    onChange={e => update({ mission: e.target.value })}
                    placeholder="Briefly describe your organization's mission..."
                    className="form-input resize-none"
                  />
                </FormField>
                <FormField label="Focus Areas">
                  <input
                    type="text"
                    value={form.focusAreas}
                    onChange={e => update({ focusAreas: e.target.value })}
                    placeholder="e.g., Legal services, youth development, food security"
                    className="form-input"
                  />
                </FormField>
              </>
            )}

            {form.orgType === 'foundation' && (
              <FormField label="Grant / Focus Areas">
                <input
                  type="text"
                  value={form.grantAreas}
                  onChange={e => update({ grantAreas: e.target.value })}
                  placeholder="e.g., Arts funding, community development, education"
                  className="form-input"
                />
              </FormField>
            )}
          </div>
        </FormSection>
      )}

      {/* Contact */}
      <FormSection title="Contact Info" subtitle="Who should publishers reach out to?">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Your Name" required>
              <input
                type="text"
                value={form.contactName}
                onChange={e => update({ contactName: e.target.value })}
                placeholder="Full name"
                className="form-input"
              />
            </FormField>
            <FormField label="Email" required>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => update({ contactEmail: e.target.value })}
                placeholder="you@example.com"
                className="form-input"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Campaign Basics */}
      <FormSection title="Campaign Basics" subtitle="Name your campaign and set a budget.">
        <div className="space-y-5">
          <FormField label="Campaign Name" required>
            <input
              type="text"
              value={form.campaignName}
              onChange={e => update({ campaignName: e.target.value })}
              placeholder="e.g., Spring Grand Opening, Summer Program Launch"
              className="form-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={3}
              value={form.campaignDescription}
              onChange={e => update({ campaignDescription: e.target.value })}
              placeholder="What message do you want to get out? What should people do?"
              className="form-input resize-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={e => update({ startDate: e.target.value })}
                className="form-input"
              />
            </FormField>
            <FormField label="End Date">
              <input
                type="date"
                value={form.endDate}
                onChange={e => update({ endDate: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Budget Range">
            <select
              value={form.budgetRange}
              onChange={e => update({ budgetRange: e.target.value })}
              className="form-select"
            >
              <option value="">Select a range...</option>
              {Object.entries(BUDGET_RANGES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}

// ─────────────────────────────────────────────────
// STEP 2: CHOOSE YOUR GOAL
// ─────────────────────────────────────────────────

function StepGoal({
  form,
  update,
}: {
  form: FormData;
  update: (u: Partial<FormData>) => void;
}) {
  const source = (form.orgType || 'business') as CampaignSource;
  const presets = getPresetsForSource(source);

  return (
    <div className="space-y-6">
      <FormSection
        title="What do you want to achieve?"
        subtitle="Select a goal and we'll automatically configure the best matching strategy for your campaign."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {presets.map(preset => (
            <GoalCard
              key={preset.id}
              preset={preset}
              isSelected={form.goalId === preset.id}
              onClick={() => update({ goalId: preset.id })}
            />
          ))}
        </div>
      </FormSection>

      {form.goalId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getGoalPreset(form.goalId)?.icon}</span>
            <div>
              <h3 className="font-semibold text-[var(--color-charcoal)]">
                {getGoalPreset(form.goalId)?.label}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {getGoalPreset(form.goalId)?.description}
              </p>
              <div className="mt-3">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Matching Weights</p>
                <WeightsBar weights={getGoalPreset(form.goalId)!.weights} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ preset, isSelected, onClick }: { preset: CampaignGoalPreset; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-[var(--color-marigold)] bg-amber-50 shadow-sm'
          : 'border-gray-200 hover:border-[var(--color-marigold)]/50 hover:bg-amber-50/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{preset.icon}</span>
        <div>
          <h3 className="font-semibold text-[var(--color-charcoal)] leading-tight">{preset.label}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{preset.description}</p>
        </div>
      </div>
    </button>
  );
}

function WeightsBar({ weights }: { weights: CampaignGoalPreset['weights'] }) {
  const dims = [
    { key: 'geographic', label: 'Geo', color: 'bg-blue-400' },
    { key: 'demographic', label: 'Demo', color: 'bg-purple-400' },
    { key: 'economic', label: 'Econ', color: 'bg-green-400' },
    { key: 'cultural', label: 'Cultural', color: 'bg-orange-400' },
    { key: 'reach', label: 'Reach', color: 'bg-pink-400' },
  ] as const;

  return (
    <div className="flex gap-1 items-end h-8">
      {dims.map(d => {
        const val = weights[d.key];
        return (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-sm ${d.color}`}
              style={{ height: `${Math.max(4, val * 0.7)}px` }}
            />
            <span className="text-[9px] text-slate-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────
// STEP 3: REFINE AUDIENCE
// ─────────────────────────────────────────────────

function StepAudience({
  form,
  update,
  toggle,
}: {
  form: FormData;
  update: (u: Partial<FormData>) => void;
  toggle: (field: keyof FormData, item: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-2">
        <p className="text-sm text-amber-800">
          <strong>Optional step.</strong> Your goal already configures the matching weights. Add audience filters here to narrow your results to specific neighborhoods, languages, or communities.
        </p>
      </div>

      {/* Geographic */}
      <FormSection title="Neighborhoods" subtitle="Which neighborhoods should this campaign reach?">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {NEIGHBORHOODS.map(n => (
              <PillButton
                key={n.id}
                label={n.label}
                isSelected={form.targetNeighborhoods.includes(n.id)}
                isDisabled={form.citywide}
                onClick={() => toggle('targetNeighborhoods', n.id)}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 mt-2">
            <input
              type="checkbox"
              checked={form.citywide}
              onChange={e => update({ citywide: e.target.checked, targetNeighborhoods: [] })}
              className="rounded border-slate-300 text-[var(--color-marigold)] focus:ring-[var(--color-marigold)]"
            />
            Citywide (all neighborhoods)
          </label>
        </div>
      </FormSection>

      {/* Languages */}
      <FormSection title="Languages" subtitle="What languages does your target audience speak?">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <PillButton
              key={l.code}
              label={l.label}
              isSelected={form.targetLanguages.includes(l.code)}
              onClick={() => toggle('targetLanguages', l.code)}
            />
          ))}
        </div>
      </FormSection>

      {/* Age */}
      <FormSection title="Age Groups" subtitle="Select target age ranges.">
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map(a => (
            <PillButton
              key={a}
              label={a}
              isSelected={form.targetAgeRanges.includes(a)}
              onClick={() => toggle('targetAgeRanges', a)}
            />
          ))}
        </div>
      </FormSection>

      {/* Communities */}
      <FormSection title="Communities" subtitle="Who are you trying to reach?">
        <div className="flex flex-wrap gap-2">
          {COMMUNITIES.map(c => (
            <PillButton
              key={c.code}
              label={c.label}
              isSelected={form.targetCommunities.includes(c.code)}
              onClick={() => toggle('targetCommunities', c.code)}
            />
          ))}
        </div>
      </FormSection>
    </div>
  );
}

// ─────────────────────────────────────────────────
// STEP 4: YOUR MATCHES
// ─────────────────────────────────────────────────

function StepMatches({
  form,
  matches,
  isLoading,
  error,
  campaignId,
}: {
  form: FormData;
  matches: MatchedPublisher[];
  isLoading: boolean;
  error: string | null;
  campaignId: string | null;
}) {
  const formatReach = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const goalPreset = form.goalId ? getGoalPreset(form.goalId) : null;

  return (
    <div className="space-y-6">
      {/* Campaign summary banner */}
      <div className="bg-[var(--color-marigold)]/5 border border-[var(--color-marigold)]/15 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-fraunces)] text-lg text-[var(--color-charcoal)] font-semibold">
              {form.campaignName || 'Your Campaign'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {form.orgName && `${form.orgName} · `}
              {goalPreset ? goalPreset.label : 'Custom goal'}
              {form.citywide ? ' · Citywide' : form.targetNeighborhoods.length > 0 ? ` · ${form.targetNeighborhoods.length} neighborhoods` : ''}
            </p>
          </div>
          {campaignId && (
            <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
              {campaignId.slice(0, 12)}...
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl p-16 border border-gray-100 text-center">
          <div className="w-10 h-10 border-3 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Finding matching publishers...</p>
          <p className="text-sm text-slate-400 mt-1">Analyzing audience overlap across our network</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* No matches */}
      {!isLoading && !error && matches.length === 0 && (
        <div className="bg-white rounded-xl p-16 border border-gray-100 text-center">
          <p className="text-slate-600 font-medium">No matching publishers found</p>
          <p className="text-sm text-slate-400 mt-1">Try broadening your audience criteria.</p>
        </div>
      )}

      {/* Match results header */}
      {!isLoading && matches.length > 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-fraunces)] text-xl text-[var(--color-charcoal)] font-semibold">
            {matches.length} Publisher{matches.length !== 1 ? 's' : ''} Matched
          </h3>
          <p className="text-sm text-slate-500">Ranked by audience overlap with your campaign goals</p>
        </div>
      )}

      {/* Match cards */}
      {!isLoading && matches.map(match => (
        <div
          key={match.publisher.id}
          className="bg-white rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-[family-name:var(--font-fraunces)] flex-shrink-0 ${
                  match.score >= 80 ? 'bg-emerald-50 text-emerald-600' :
                  match.score >= 60 ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {match.score}
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--color-charcoal)] text-lg leading-tight">
                    {match.publisher.name}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{match.publisher.description}</p>
                </div>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                {formatReach(match.metrics.followers)} reach
              </span>
              {match.metrics.engagement > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {match.metrics.engagement.toFixed(1)}% engagement
                </span>
              )}
              {match.matchingLanguages.map(lang => (
                <span key={lang} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  {lang}
                </span>
              ))}
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {[
                { label: 'Geographic', score: match.breakdown.geographic },
                { label: 'Demographic', score: match.breakdown.demographic },
                { label: 'Economic', score: match.breakdown.economic },
                { label: 'Cultural', score: match.breakdown.cultural },
                { label: 'Reach', score: match.breakdown.reach },
              ].map(dim => (
                <div key={dim.label} className="text-center">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-marigold)] rounded-full transition-all"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{dim.label}</span>
                </div>
              ))}
            </div>

            {/* Why this match */}
            {match.keyStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {match.keyStrengths.slice(0, 3).map((reason, i) => (
                  <span key={i} className="text-xs text-[var(--color-marigold-dark)] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </div>

          {match.publisher.website && (
            <div className="px-6 py-3 border-t border-gray-50 bg-slate-50/50 flex items-center justify-between">
              <a
                href={match.publisher.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-[var(--color-marigold-dark)] transition-colors"
              >
                {match.publisher.website.replace(/^https?:\/\//, '')}
              </a>
              {match.matchingNeighborhoods.length > 0 && (
                <span className="text-xs text-slate-400">
                  {match.matchingNeighborhoods.slice(0, 3).join(', ')}
                  {match.matchingNeighborhoods.length > 3 && ` +${match.matchingNeighborhoods.length - 3}`}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Next steps CTA */}
      {!isLoading && matches.length > 0 && (
        <div className="bg-[var(--color-marigold)] rounded-2xl p-6 text-white">
          <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold mb-3">Next Steps</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/90">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p>View your campaign detail to see all matched publishers</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p>Choose deliverables and place orders with publishers</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p>Publishers create authentic content for their audiences</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <p>Track your impact — marketing results + journalism support</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            {campaignId && (
              <Link
                href={`/advertise/campaigns/${campaignId}`}
                className="inline-flex items-center gap-2 bg-white text-[var(--color-marigold-dark)] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                View Campaign Detail
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href="/advertise/dashboard"
              className="inline-flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/25 transition-colors"
            >
              Campaign Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────

function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-[var(--color-charcoal)] font-semibold">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
        {label}{required && <span className="text-[var(--color-coral)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function PillButton({
  label,
  isSelected,
  isDisabled,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`px-3.5 py-1.5 text-sm border rounded-full transition-all font-medium ${
        isSelected
          ? 'border-[var(--color-marigold)] bg-amber-50 text-amber-700'
          : isDisabled
          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
          : 'border-slate-200 text-slate-600 hover:border-[var(--color-marigold)] hover:text-[var(--color-marigold-dark)] hover:bg-amber-50/50'
      }`}
    >
      {label}
    </button>
  );
}
