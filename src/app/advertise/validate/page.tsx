'use client';

import { useState, useEffect } from 'react';
import { Nav, Footer, StatBlock } from '@/components/shared';
import { useCityOptional } from '@/lib/geo/city-context';
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

export default function ValidatePage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav variant="advertise" />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Campaign Performance
        </h1>
        <p className="text-gray-500 mb-8">Track what landed across all your campaigns.</p>

        {!user ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500 mb-4">Sign in to view your campaign performance.</p>
            <a
              href="/sign-in"
              className="inline-flex items-center gap-2 bg-marigold-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-marigold-600 transition-colors"
            >
              Sign In →
            </a>
          </div>
        ) : loading ? (
          <p className="text-center text-gray-400 py-12">Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500 mb-4">No campaigns yet. Start by creating your first ad.</p>
            <a
              href={`${prefix}/advertise/create`}
              className="inline-flex items-center gap-2 bg-marigold-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-marigold-600 transition-colors"
            >
              Create Your First Ad →
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatBlock number={String(campaigns.length)} label="Campaigns" />
              <StatBlock
                number={String(campaigns.filter((c) => c.status === 'active').length)}
                label="Active"
              />
              <StatBlock
                number={String(campaigns.filter((c) => c.status === 'completed').length)}
                label="Completed"
              />
            </div>

            <div className="flex flex-col gap-4">
              {campaigns.map((c) => (
                <a
                  key={c.id}
                  href={`${prefix}/advertise/validate/${c.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      c.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {c.source} · Created {new Date(c.created_at).toLocaleDateString()}
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
