'use client';

/**
 * Government Campaign Builder
 *
 * Guided wizard for SF departments to create community media campaigns.
 * Three steps: Campaign Brief → Audience Targeting → Publisher Matches
 *
 * Design: "Civic Intelligence" — teal-accented editorial feel with
 * progressive disclosure and a persistent campaign summary rail.
 * After matching, links to campaign management & detail views.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

type WizardStep = 'brief' | 'audience' | 'match';

interface CampaignFormData {
  department: string;
  campaignName: string;
  campaignDescription: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  budgetRange: string;
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
  metrics: { followers: number; engagement: number };
}

// ─────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────

const BUDGET_RANGES: Record<string, { min: number; max: number; label: string }> = {
  '500-2000': { min: 500, max: 2000, label: '$500 – $2,000' },
  '2000-5000': { min: 2000, max: 5000, label: '$2,000 – $5,000' },
  '5000-10000': { min: 5000, max: 10000, label: '$5,000 – $10,000' },
  '10000-25000': { min: 10000, max: 25000, label: '$10,000 – $25,000' },
  '25000+': { min: 25000, max: 100000, label: '$25,000+' },
};

const DEPARTMENTS = [
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

const INITIAL_FORM: CampaignFormData = {
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

const STEPS: { id: WizardStep; num: number; label: string; subtitle: string }[] = [
  { id: 'brief', num: 1, label: 'Campaign Brief', subtitle: 'Department & goals' },
  { id: 'audience', num: 2, label: 'Audience', subtitle: 'Who to reach' },
  { id: 'match', num: 3, label: 'Publishers', subtitle: 'Find matches' },
];

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────

export default function GovernmentOnboarding() {
  const [step, setStep] = useState<WizardStep>('brief');
  const [form, setForm] = useState<CampaignFormData>(INITIAL_FORM);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedPublisher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set());

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const update = useCallback((u: Partial<CampaignFormData>) => {
    setForm(prev => ({ ...prev, ...u }));
  }, []);

  const toggle = useCallback((field: keyof CampaignFormData, item: string) => {
    setForm(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item] };
    });
  }, []);

  // Audience summary for the sidebar
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

  // Create campaign + fetch matches
  const createAndMatch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const budget = BUDGET_RANGES[form.budgetRange] || { min: 0, max: 0 };
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.campaignName,
          description: form.campaignDescription,
          department: form.department,
          targetNeighborhoods: form.citywide ? [] : form.targetNeighborhoods,
          targetLanguages: form.targetLanguages,
          targetCommunities: form.targetCommunities,
          targetAgeRanges: form.targetAgeRanges,
          budgetMin: budget.min,
          budgetMax: budget.max,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
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
  }, [form]);

  useEffect(() => {
    if (step === 'match' && !campaignId) {
      createAndMatch();
    }
  }, [step, campaignId, createAndMatch]);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  const togglePublisher = (id: string) => {
    setSelectedPublishers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deptName = DEPARTMENTS.find(d => d.code === form.department)?.name;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* ── Header ─────────────────────────────── */}
      <header className="bg-[var(--color-teal)] hero-texture">
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/government" className="text-white/70 hover:text-white text-sm transition-colors">
                Government
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white text-sm font-medium">New Campaign</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/government/campaigns"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                View All Campaigns
              </Link>
              <Link
                href="/government"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Save & Exit
              </Link>
            </div>
          </div>

          <div className="mt-6 mb-2">
            <h1 className="font-[family-name:var(--font-fraunces)] text-white text-2xl md:text-3xl font-semibold">
              Create a Campaign
            </h1>
            <p className="text-white/70 mt-1 max-w-lg">
              Define who you need to reach, and we&apos;ll match you with community publishers whose audiences align.
            </p>
          </div>

          {/* ── Step Indicator ─────────────────── */}
          <div className="flex items-center gap-2 mt-6 mb-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => {
                    // Allow navigating back to completed steps
                    if (i < stepIndex) setStep(s.id);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i === stepIndex
                      ? 'bg-white text-[var(--color-teal)]'
                      : i < stepIndex
                      ? 'bg-white/20 text-white cursor-pointer hover:bg-white/30'
                      : 'bg-white/5 text-white/40 cursor-default'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < stepIndex
                      ? 'bg-white/30 text-white'
                      : i === stepIndex
                      ? 'bg-[var(--color-teal)] text-white'
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

      {/* ── Main Content ───────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">

          {/* ── Left: Form Steps ───────────────── */}
          <div>
            {step === 'brief' && (
              <StepBrief form={form} update={update} />
            )}
            {step === 'audience' && (
              <StepAudience form={form} update={update} toggle={toggle} />
            )}
            {step === 'match' && (
              <StepMatch
                form={form}
                matches={matches}
                isLoading={isLoading}
                error={error}
                campaignId={campaignId}
                selectedPublishers={selectedPublishers}
                togglePublisher={togglePublisher}
              />
            )}

            {/* ── Navigation ─────────────────── */}
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

              {step === 'match' ? (
                <div className="flex items-center gap-3">
                  {campaignId && (
                    <Link
                      href={`/government/campaigns/${campaignId}`}
                      className="btn bg-[var(--color-teal)] text-white text-sm px-6 py-2.5 hover:bg-[var(--color-teal-dark)]"
                    >
                      View Campaign Detail
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href="/government/campaigns"
                    className="btn bg-white text-[var(--color-teal)] border border-[var(--color-teal)]/20 text-sm px-6 py-2.5 hover:bg-[var(--color-cream)]"
                  >
                    All Campaigns
                  </Link>
                </div>
              ) : (
                <button
                  onClick={goNext}
                  className="btn bg-[var(--color-teal)] text-white text-sm px-6 py-2.5 hover:bg-[var(--color-teal-dark)]"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Campaign Summary Rail ──── */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Summary header */}
                <div className="bg-[var(--color-teal)] px-5 py-4">
                  <p className="text-xs font-semibold tracking-wider uppercase text-white/60">Campaign Summary</p>
                  <p className="text-white font-[family-name:var(--font-fraunces)] text-lg mt-1 leading-tight">
                    {form.campaignName || 'Untitled Campaign'}
                  </p>
                </div>

                <div className="px-5 py-4 space-y-4 text-sm">
                  {/* Department */}
                  <SummaryRow label="Department" value={deptName || '—'} />
                  <SummaryRow label="Budget" value={form.budgetRange ? BUDGET_RANGES[form.budgetRange]?.label : '—'} />

                  {/* Dates */}
                  {(form.startDate || form.endDate) && (
                    <SummaryRow
                      label="Timeline"
                      value={[
                        form.startDate && new Date(form.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        form.endDate && new Date(form.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      ].filter(Boolean).join(' – ') || '—'}
                    />
                  )}

                  {/* Audience chips */}
                  {(audienceSummary.geo || audienceSummary.langs || audienceSummary.ages || audienceSummary.comms) && (
                    <>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Target Audience</p>
                        <div className="flex flex-wrap gap-1.5">
                          {audienceSummary.geo && <SummaryChip label={audienceSummary.geo} color="teal" />}
                          {audienceSummary.langs && <SummaryChip label={audienceSummary.langs} color="teal" />}
                          {audienceSummary.ages && <SummaryChip label={audienceSummary.ages} color="slate" />}
                          {audienceSummary.comms && <SummaryChip label={audienceSummary.comms} color="slate" />}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Match results */}
                  {step === 'match' && matches.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Matches</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[var(--color-teal)] font-[family-name:var(--font-fraunces)]">
                          {matches.length}
                        </span>
                        <span className="text-slate-500">publishers found</span>
                      </div>
                      {selectedPublishers.size > 0 && (
                        <p className="text-xs text-[var(--color-teal)] font-medium mt-1">
                          {selectedPublishers.size} selected for campaign
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100">
                  <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Quick Links</p>
                  <div className="space-y-1.5">
                    <Link href="/government/discover" className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Browse Publisher Map
                    </Link>
                    <Link href="/government/campaigns" className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Campaign Dashboard
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

function SummaryChip({ label, color }: { label: string; color: 'teal' | 'slate' }) {
  const styles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────
// STEP 1: CAMPAIGN BRIEF
// ─────────────────────────────────────────────────

function StepBrief({
  form,
  update,
}: {
  form: CampaignFormData;
  update: (u: Partial<CampaignFormData>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Section: Campaign Details */}
      <FormSection title="Campaign Details" subtitle="What are you trying to communicate?">
        <div className="space-y-5">
          <FormField label="Department" required>
            <select
              value={form.department}
              onChange={e => update({ department: e.target.value })}
              className="form-select"
            >
              <option value="">Select your department...</option>
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="Campaign Name" required>
            <input
              type="text"
              value={form.campaignName}
              onChange={e => update({ campaignName: e.target.value })}
              placeholder="e.g., Flu Shot Outreach 2026, Summer Jobs Program"
              className="form-input"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              rows={3}
              value={form.campaignDescription}
              onChange={e => update({ campaignDescription: e.target.value })}
              placeholder="What message do you want to get out? What action should people take?"
              className="form-input resize-none"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Section: Contact */}
      <FormSection title="Campaign Contact" subtitle="Who should publishers reach out to?">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input
                type="text"
                value={form.contactName}
                onChange={e => update({ contactName: e.target.value })}
                placeholder="Full name"
                className="form-input"
              />
            </FormField>
            <FormField label="Title">
              <input
                type="text"
                value={form.contactTitle}
                onChange={e => update({ contactTitle: e.target.value })}
                placeholder="e.g., Communications Manager"
                className="form-input"
              />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => update({ contactEmail: e.target.value })}
              placeholder="your.name@sfgov.org"
              className="form-input"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Section: Timeline & Budget */}
      <FormSection title="Timeline & Budget" subtitle="When and how much?">
        <div className="space-y-5">
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
          <FormField label="Estimated Budget">
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
// STEP 2: AUDIENCE TARGETING
// ─────────────────────────────────────────────────

function StepAudience({
  form,
  update,
  toggle,
}: {
  form: CampaignFormData;
  update: (u: Partial<CampaignFormData>) => void;
  toggle: (field: keyof CampaignFormData, item: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Geographic */}
      <FormSection title="Geography" subtitle="Which neighborhoods should this reach?">
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
              className="rounded border-slate-300 text-[var(--color-teal)] focus:ring-[var(--color-teal)]"
            />
            Citywide (all neighborhoods)
          </label>
        </div>
      </FormSection>

      {/* Languages */}
      <FormSection title="Languages" subtitle="What languages does your audience speak?">
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

      {/* Free-form */}
      <FormSection title="Audience Description" subtitle="Help publishers understand your goals.">
        <textarea
          rows={4}
          value={form.audienceDescription}
          onChange={e => update({ audienceDescription: e.target.value })}
          placeholder="Be specific. Example: 'Spanish-speaking parents of school-age children in the Mission and Excelsior who may not be aware of free summer programs.'"
          className="form-input resize-none"
        />
        <p className="text-xs text-slate-400 mt-2">
          This description is shared with publishers to help them create authentic content.
        </p>
      </FormSection>
    </div>
  );
}

// ─────────────────────────────────────────────────
// STEP 3: PUBLISHER MATCHES
// ─────────────────────────────────────────────────

function StepMatch({
  form,
  matches,
  isLoading,
  error,
  campaignId,
  selectedPublishers,
  togglePublisher,
}: {
  form: CampaignFormData;
  matches: MatchedPublisher[];
  isLoading: boolean;
  error: string | null;
  campaignId: string | null;
  selectedPublishers: Set<string>;
  togglePublisher: (id: string) => void;
}) {
  const formatReach = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      {/* Campaign summary banner */}
      <div className="bg-[var(--color-teal)]/5 border border-[var(--color-teal)]/15 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-fraunces)] text-lg text-[var(--color-charcoal)] font-semibold">
              {form.campaignName || 'Your Campaign'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {form.citywide ? 'Citywide' : `${form.targetNeighborhoods.length} neighborhoods`}
              {form.targetLanguages.length > 0 && ` · ${form.targetLanguages.length} languages`}
              {form.targetCommunities.length > 0 && ` · ${form.targetCommunities.length} communities`}
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
          <div className="w-10 h-10 border-3 border-[var(--color-teal)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
          <p className="text-sm text-slate-400 mt-1">Try broadening your target criteria — fewer filters means more matches.</p>
        </div>
      )}

      {/* Match results header */}
      {!isLoading && matches.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-fraunces)] text-xl text-[var(--color-charcoal)] font-semibold">
              {matches.length} Publisher{matches.length !== 1 ? 's' : ''} Matched
            </h3>
            <p className="text-sm text-slate-500">Ranked by audience overlap with your campaign targets</p>
          </div>
          {selectedPublishers.size > 0 && (
            <span className="bg-[var(--color-teal)] text-white text-sm font-medium px-4 py-1.5 rounded-full">
              {selectedPublishers.size} selected
            </span>
          )}
        </div>
      )}

      {/* Match cards */}
      {!isLoading && matches.map(match => {
        const isSelected = selectedPublishers.has(match.publisher.id);
        return (
          <div
            key={match.publisher.id}
            className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${
              isSelected
                ? 'border-[var(--color-teal)] shadow-md'
                : 'border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {/* Score badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-[family-name:var(--font-fraunces)] flex-shrink-0 ${
                    match.score >= 80 ? 'bg-emerald-50 text-emerald-600' :
                    match.score >= 60 ? 'bg-teal-50 text-teal-600' :
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
                <button
                  onClick={() => togglePublisher(match.publisher.id)}
                  className={`flex-shrink-0 ml-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[var(--color-teal)] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-[var(--color-teal)]/10 hover:text-[var(--color-teal)]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Selected
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </>
                  )}
                </button>
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
                  <span key={lang} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
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
                        className="h-full bg-[var(--color-teal)] rounded-full transition-all"
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
                    <span key={i} className="text-xs text-[var(--color-teal)] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with link */}
            {match.publisher.website && (
              <div className="px-6 py-3 border-t border-gray-50 bg-slate-50/50 flex items-center justify-between">
                <a
                  href={match.publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-[var(--color-teal)] transition-colors"
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
        );
      })}

      {/* Next steps CTA */}
      {!isLoading && matches.length > 0 && (
        <div className="bg-[var(--color-teal)] rounded-2xl p-6 text-white">
          <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold mb-3">Next Steps</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/90">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p>Select publishers above to add to your campaign</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p>Define deliverables and timeline per publisher</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p>Submit — publishers respond within 2-3 business days</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <p>Once accepted, procurement docs generate automatically</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            {campaignId && (
              <Link
                href={`/government/campaigns/${campaignId}`}
                className="inline-flex items-center gap-2 bg-white text-[var(--color-teal)] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                View Campaign Detail
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href="/government/campaigns"
              className="inline-flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/25 transition-colors"
            >
              Campaign Dashboard
            </Link>
            <Link
              href="/government/discover"
              className="inline-flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/25 transition-colors"
            >
              Browse Publisher Map
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
          ? 'border-[var(--color-teal)] bg-teal-50 text-teal-700'
          : isDisabled
          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
          : 'border-slate-200 text-slate-600 hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] hover:bg-teal-50/50'
      }`}
    >
      {label}
    </button>
  );
}
