'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';
import { PublisherCard, PublisherCardData } from '@/components/advertise/PublisherCard';
import { useCityOptional } from '@/lib/geo/city-context';
import { getSupabaseClient } from '@/lib/db/supabase';

export default function SelectPage() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const searchParams = useSearchParams();

  const [publishers, setPublishers] = useState<PublisherCardData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const param = searchParams.get('publishers');
    return param ? new Set(param.split(',')) : new Set();
  });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    // Join publishers with audience_profiles to get neighborhoods and languages
    supabase
      .from('publishers')
      .select('id, name')
      .eq('status', 'active')
      .order('name')
      .then(async ({ data: pubData }) => {
        if (!pubData) return;

        // Fetch audience profiles separately since publishers table
        // doesn't have neighborhoods/languages columns
        const { data: profiles } = await (supabase as any)
          .from('audience_profiles')
          .select('publisher_id, neighborhoods, languages');

        const profileMap = new Map<string, { neighborhoods: string[]; languages: string[] }>();
        if (profiles) {
          for (const p of profiles) {
            profileMap.set(p.publisher_id, {
              neighborhoods: p.neighborhoods || [],
              languages: p.languages || ['english'],
            });
          }
        }

        setPublishers(
          pubData.map((p: any) => {
            const profile = profileMap.get(p.id);
            return {
              id: p.id,
              name: p.name,
              neighborhoods: profile?.neighborhoods || [],
              reach: 0,
              languages: profile?.languages || ['english'],
              startingPrice: 1900, // $19 default
            };
          })
        );
      });
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return publishers;
    const q = filter.toLowerCase();
    return publishers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhoods.some((n) => n.toLowerCase().includes(q))
    );
  }, [publishers, filter]);

  function togglePublisher(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const url = new URL(window.location.href);
      if (next.size > 0) url.searchParams.set('publishers', [...next].join(','));
      else url.searchParams.delete('publishers');
      window.history.replaceState({}, '', url.toString());
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav variant="advertise" />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Choose Your Channels
        </h1>
        <p className="text-gray-500 mb-8">
          Browse publishers by neighborhood, language, and reach. Select the ones that fit your audience.
        </p>
        <input
          type="text"
          placeholder="Filter by name or neighborhood..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
        <div className="flex flex-col gap-3">
          {filtered.map((pub) => (
            <PublisherCard
              key={pub.id}
              publisher={pub}
              selected={selected.has(pub.id)}
              onToggle={togglePublisher}
            />
          ))}
          {filtered.length === 0 && publishers.length > 0 && (
            <p className="text-center text-gray-400 py-8">No publishers match your filter.</p>
          )}
        </div>
        {selected.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-teal-600 text-white px-4 py-3 flex items-center justify-between z-50">
            <span className="font-semibold">
              {selected.size} publisher{selected.size !== 1 ? 's' : ''} selected
            </span>
            <a
              href={`${prefix}/advertise/amplify?publishers=${[...selected].join(',')}`}
              className="bg-white text-teal-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors"
            >
              Continue to Checkout &rarr;
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
