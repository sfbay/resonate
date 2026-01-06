'use client';

import { useState } from 'react';
import Link from 'next/link';

type OnboardingStep = 'department' | 'audience' | 'review';

export default function AdvertiserOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('department');

  const steps: { id: OnboardingStep; label: string }[] = [
    { id: 'department', label: 'Department' },
    { id: 'audience', label: 'Target Audience' },
    { id: 'review', label: 'Find Publishers' },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

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
          <Link href="/advertiser" className="text-xl font-bold text-slate-900">
            Resonate <span className="text-blue-600 font-normal text-sm ml-2">Departments</span>
          </Link>
          <Link href="/advertiser" className="text-sm text-slate-500 hover:text-slate-700">
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
          {currentStep === 'department' && <StepDepartment />}
          {currentStep === 'audience' && <StepAudience />}
          {currentStep === 'review' && <StepReview />}

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

function StepDepartment() {
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
          <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign End Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estimated Budget
          </label>
          <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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

function StepAudience() {
  const neighborhoods = [
    'Mission', 'Castro', 'Chinatown', 'Tenderloin', 'SOMA', 'Financial District',
    'Bayview-Hunters Point', 'Excelsior', 'Sunset', 'Richmond', 'Noe Valley', 'Bernal Heights',
    'Potrero Hill', 'Marina', 'North Beach', 'Haight-Ashbury', 'Outer Mission', 'Visitacion Valley'
  ];

  const languages = ['English', 'Spanish', 'Chinese (Cantonese)', 'Chinese (Mandarin)', 'Tagalog', 'Vietnamese', 'Russian', 'Korean', 'Japanese', 'Arabic'];

  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  const communities = [
    'Families with children',
    'Seniors',
    'Small business owners',
    'Renters',
    'Homeowners',
    'Immigrants & refugees',
    'LGBTQ+ community',
    'Students',
    'Low-income residents',
    'Workers & employees',
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
            {neighborhoods.map(n => (
              <button
                key={n}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
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
            {languages.map(l => (
              <button
                key={l}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Age Ranges */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Age Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {ageRanges.map(a => (
              <button
                key={a}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Communities */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Target Communities
          </label>
          <div className="flex flex-wrap gap-2">
            {communities.map(c => (
              <button
                key={c}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Free-form description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Describe Your Target Audience
          </label>
          <textarea
            rows={4}
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

function StepReview() {
  // Mock matched publishers for demo
  const mockPublishers = [
    {
      name: 'Mission Local',
      description: 'Hyperlocal news for the Mission District',
      platforms: ['Instagram', 'Newsletter', 'Facebook'],
      followers: '45K total reach',
      matchScore: 94,
      matchReasons: ['Serves Mission District', 'Spanish & English content', 'Strong local families audience'],
      priceRange: '$150 - $450 per deliverable',
    },
    {
      name: 'El Tecolote',
      description: 'Bilingual newspaper serving Latino community since 1970',
      platforms: ['Instagram', 'Newsletter'],
      followers: '28K total reach',
      matchScore: 91,
      matchReasons: ['Spanish-language focus', 'Mission & Excelsior coverage', 'Family audience'],
      priceRange: '$100 - $350 per deliverable',
    },
    {
      name: 'Excelsior Action Group',
      description: 'Community organization for Excelsior neighborhood',
      platforms: ['Instagram', 'Facebook'],
      followers: '12K total reach',
      matchScore: 85,
      matchReasons: ['Excelsior focus', 'Family & community events', 'Multilingual'],
      priceRange: '$75 - $200 per deliverable',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Campaign Summary</h2>
        <p className="text-slate-600 mb-6">Based on your criteria, here are publishers that match your target audience.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Target Audience</h3>
          <p className="text-sm text-blue-800">
            [Your selected criteria will appear here - neighborhoods, languages, communities, etc.]
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Matched Publishers</h3>

        {mockPublishers.map((pub, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{pub.name}</h4>
                <p className="text-sm text-slate-600">{pub.description}</p>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{pub.matchScore}% match</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {pub.platforms.map(p => (
                <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {p}
                </span>
              ))}
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {pub.followers}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Why this match:</p>
              <ul className="text-sm text-slate-600">
                {pub.matchReasons.map((reason, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">{pub.priceRange}</span>
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
