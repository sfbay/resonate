'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/lib/auth';

interface Application {
  id: string;
  clerk_user_id: string;
  clerk_org_id: string;
  org_type: string;
  city_slug: string;
  status: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const user = useCurrentUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    const res = await fetch('/api/admin/approvals');
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  if (user.orgType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Access denied.</p>
      </div>
    );
  }

  const orgTypeLabel: Record<string, string> = {
    publisher: 'Publisher',
    government: 'Government',
    advertiser: 'Business / Nonprofit',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-6">
          Pending Applications
        </h1>

        {loading && <p className="text-slate-500">Loading...</p>}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
            <p className="text-slate-500">No pending applications.</p>
          </div>
        )}

        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                      {orgTypeLabel[app.org_type] || app.org_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {app.city_slug.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(app.id, 'approve')}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'reject')}
                    className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
