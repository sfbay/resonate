'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ORG_TYPES = [
  { value: 'publisher', label: 'Community Media Publisher', description: 'Newspaper, radio, digital outlet, newsletter, podcast' },
  { value: 'government', label: 'Government Department', description: 'City, county, state, or federal agency' },
  { value: 'advertiser', label: 'Business, Nonprofit, or Foundation', description: 'Organization seeking community outreach' },
] as const;

const CITIES = [
  { value: 'sf', label: 'San Francisco' },
  { value: 'chicago', label: 'Chicago' },
] as const;

export default function ApplyPage() {
  const { user } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    orgName: '',
    orgType: '' as string,
    website: '',
    city: 'sf',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          contactName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      router.push('/onboarding/pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl font-bold text-charcoal-900">
            Join Resonate
          </h1>
          <p className="text-slate-600 mt-2">
            Tell us about your organization. We review every application personally.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-md border border-gray-100 space-y-6">
          {/* Org Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              required
              value={form.orgName}
              onChange={e => update('orgName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Your organization's name"
            />
          </div>

          {/* Org Type */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-900 mb-2">
              Organization Type
            </label>
            <div className="space-y-2">
              {ORG_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.orgType === type.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="orgType"
                    value={type.value}
                    required
                    checked={form.orgType === type.value}
                    onChange={e => update('orgType', e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-charcoal-900">{type.label}</div>
                    <div className="text-sm text-slate-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={e => update('website', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="https://yoursite.com"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Market / City
            </label>
            <select
              id="city"
              value={form.city}
              onChange={e => update('city', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>{city.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-charcoal-900 mb-1">
              Brief Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Tell us about your audience, mission, or what you're looking for"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
