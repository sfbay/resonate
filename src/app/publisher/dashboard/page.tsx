'use client';

/**
 * Publisher Dashboard Page
 *
 * Displays analytics, connected platforms, and growth badges for publishers.
 * Fetches real data from Supabase.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/publisher/analytics';
import { usePublisherData } from '@/lib/db/use-publisher-data';

export default function PublisherDashboardPage() {
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch real publisher data from Supabase
  const { data, isLoading, error, refetch } = usePublisherData();

  // Check for OAuth callback parameters
  useEffect(() => {
    const connected = searchParams.get('connected');
    const handle = searchParams.get('handle');
    const errorParam = searchParams.get('error');
    const message = searchParams.get('message');

    if (connected) {
      setNotification({
        type: 'success',
        message: `Successfully connected ${connected}${handle ? ` as ${handle}` : ''}!`,
      });
      // Refresh data after connecting a new platform
      refetch();
    } else if (errorParam) {
      setNotification({
        type: 'error',
        message: message || 'Failed to connect platform. Please try again.',
      });
    }
  }, [searchParams, refetch]);

  // Dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-md max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-charcoal mb-2">Unable to Load Dashboard</h1>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no publisher found)
  if (!data && !isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-md max-w-md text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl font-semibold text-charcoal mb-2">No Publisher Profile</h1>
          <p className="text-slate-500 mb-4">
            You don&apos;t have a publisher profile yet. Create one to start tracking your analytics.
          </p>
          <a
            href="/publisher/onboarding"
            className="inline-block px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
          >
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <AnalyticsDashboard
        publisherId={data?.publisherId || ''}
        publisherName={data?.publisherName || 'Loading...'}
        metrics={data?.metrics || null}
        connections={data?.connections || []}
        latestSnapshots={data?.latestSnapshots || {
          instagram: null,
          facebook: null,
          tiktok: null,
          twitter: null,
          youtube: null,
          newsletter: null,
          website: null,
          other: null,
          whatsapp: null,
          telegram: null,
          signal: null,
          sms: null,
          weibo: null,
          mailchimp: null,
          substack: null,
        }}
        badges={data?.badges || []}
        isLoading={isLoading}
      />
    </>
  );
}
