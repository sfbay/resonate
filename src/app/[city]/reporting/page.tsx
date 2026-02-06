'use client';

/**
 * Reporting Dashboard Page
 *
 * Transparency dashboard for coalition administrators and watchdog organizations.
 * Shows aggregated metrics, publisher activity, and data quality indicators.
 */

import { useCity } from '@/lib/geo/city-context';
import { SummaryCards } from '@/components/reporting/SummaryCards';
import { ActivityFeed } from '@/components/reporting/ActivityFeed';
import { PublisherMetricsTable } from '@/components/reporting/PublisherMetricsTable';
import { WatchdogAlerts } from '@/components/reporting/WatchdogAlerts';
import Link from 'next/link';

export default function ReportingPage() {
  const { city, getPath } = useCity();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href={getPath('/')}
                  className="text-slate-500 hover:text-charcoal transition-colors"
                >
                  ← {city.name}
                </Link>
              </div>
              <h1 className="display-sm text-charcoal">Coalition Reporting</h1>
              <p className="text-slate-500">
                Transparency dashboard for {city.name} community media coalition
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleDateString()}
              </span>
              <button className="btn btn-teal text-sm">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <section>
          <h2 className="font-semibold text-charcoal text-lg mb-4">Overview</h2>
          <SummaryCards />
        </section>

        {/* Watchdog Alerts */}
        <section>
          <h2 className="font-semibold text-charcoal text-lg mb-4">
            Data Quality & Watchdog Alerts
          </h2>
          <WatchdogAlerts />
        </section>

        {/* Main Grid: Activity Feed + Publisher Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed - 1 column */}
          <section className="lg:col-span-1">
            <h2 className="font-semibold text-charcoal text-lg mb-4">
              Recent Activity
            </h2>
            <ActivityFeed />
          </section>

          {/* Publisher Metrics Table - 2 columns */}
          <section className="lg:col-span-2">
            <h2 className="font-semibold text-charcoal text-lg mb-4">
              Publisher Leaderboard
            </h2>
            <PublisherMetricsTable />
          </section>
        </div>
      </main>
    </div>
  );
}
