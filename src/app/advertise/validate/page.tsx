'use client';

import { useState, useEffect } from 'react';
import { Nav, Footer } from '@/components/shared';
import { StepProgress } from '@/components/advertise/StepProgress';
import { useCityOptional } from '@/lib/geo/city-context';
import { useRecordVisit } from '@/lib/navigation/use-record-visit';
import { useCurrentUserOptional } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/db/supabase';

interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  source: string;
  budget_min: number;
  budget_max: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function ValidatePage() {
  useRecordVisit();
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const user = useCurrentUserOptional();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    supabase
      .from('campaigns')
      .select('id, name, status, source, budget_min, budget_max, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCampaigns(data || []);
        setLoading(false);
      });
  }, [user]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed');

  return (
    <div className="min-h-screen bg-warm-page">
      <Nav variant="advertise" />

      {/* Page header */}
      <div className="relative bg-radiance hero-texture overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16 text-white">
          <StepProgress current="validate" />
          <h1 className="display-md mb-3">Campaign Performance</h1>
          <p className="text-gray-400 text-lg max-w-lg">
            Track what landed across all your campaigns.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {!user ? (
          /* Sign-in prompt */
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm border-glow">
            <div className="w-14 h-14 rounded-2xl bg-marigold-500/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-marigold-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              View your campaign performance, track engagement, and manage your advertising portfolio.
            </p>
            <a
              href="/sign-in"
              className="inline-flex items-center gap-2 bg-marigold-500 text-white font-bold px-7 py-3 rounded-xl hover:bg-marigold-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign In
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        ) : loading ? (
          /* Loading skeleton */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[0,1,2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                  <div className="h-8 w-16 bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-20 bg-gray-50 rounded" />
                </div>
              ))}
            </div>
            {[0,1,2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="h-5 w-48 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm border-glow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-marigold-500/10 to-coral-500/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-marigold-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">No campaigns yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start by creating your first ad. It takes less than a minute.
            </p>
            <a
              href={`${prefix}/advertise/create`}
              className="inline-flex items-center gap-2 bg-marigold-500 text-white font-bold px-7 py-3 rounded-xl hover:bg-marigold-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Create Your First Ad
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { value: campaigns.length, label: 'Total Campaigns', color: 'text-gray-900', bg: 'bg-white' },
                { value: activeCampaigns.length, label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                { value: completedCampaigns.length, label: 'Completed', color: 'text-gray-500', bg: 'bg-gray-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-6 border border-gray-100 text-center shadow-sm animate-fade-in-up stagger-${i + 1}`} style={{ opacity: 0 }}>
                  <div className={`stat-number text-3xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Campaign list */}
            <h2 className="font-heading text-lg font-bold text-gray-900 mb-4">All Campaigns</h2>
            <div className="flex flex-col gap-3">
              {campaigns.map((c, i) => (
                <a
                  key={c.id}
                  href={`${prefix}/advertise/validate/${c.id}`}
                  className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 0.08, 0.5)}s`, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-marigold-600 transition-colors">{c.name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[c.status] || STATUS_STYLES.completed}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {c.source} · Created {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-marigold-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
