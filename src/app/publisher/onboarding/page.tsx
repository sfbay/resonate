'use client';

import { useState } from 'react';
import Link from 'next/link';

type OnboardingStep = 'basics' | 'platforms' | 'audience' | 'rates' | 'vendor' | 'review';

export default function PublisherOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basics');

  const steps: { id: OnboardingStep; label: string }[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'platforms', label: 'Platforms' },
    { id: 'audience', label: 'Audience' },
    { id: 'rates', label: 'Rates' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'review', label: 'Review' },
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
          <Link href="/publisher" className="text-xl font-bold text-slate-900">
            Resonate <span className="text-emerald-600 font-normal text-sm ml-2">Publisher</span>
          </Link>
          <Link href="/publisher" className="text-sm text-slate-500 hover:text-slate-700">
            Save & Exit
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentIndex
                      ? 'bg-emerald-600 text-white'
                      : index === currentIndex
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {index < currentIndex ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-2 ${
                      index < currentIndex ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {steps.map(step => (
              <span key={step.id} className="w-8 text-center">{step.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {currentStep === 'basics' && <StepBasics />}
          {currentStep === 'platforms' && <StepPlatforms />}
          {currentStep === 'audience' && <StepAudience />}
          {currentStep === 'rates' && <StepRates />}
          {currentStep === 'vendor' && <StepVendor />}
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
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                Submit for Review
              </button>
            ) : (
              <button
                onClick={goNext}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
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

function StepBasics() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Tell us about your publication</h2>
      <p className="text-slate-600 mb-8">Basic information to set up your profile.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Publication Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Mission Local, El Tecolote"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            rows={4}
            placeholder="Tell us about your publication and the community you serve..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Website (optional)
          </label>
          <input
            type="url"
            placeholder="https://"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function StepPlatforms() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Social Platforms</h2>
      <p className="text-slate-600 mb-8">Add the platforms where you publish content. Connect accounts for audience verification.</p>

      <div className="space-y-4">
        {/* Instagram */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📷</span>
              </div>
              <span className="font-medium text-slate-900">Instagram</span>
            </div>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              + Add Account
            </button>
          </div>
        </div>

        {/* TikTok */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🎵</span>
              </div>
              <span className="font-medium text-slate-900">TikTok</span>
            </div>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              + Add Account
            </button>
          </div>
        </div>

        {/* Facebook */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">f</span>
              </div>
              <span className="font-medium text-slate-900">Facebook</span>
            </div>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              + Add Account
            </button>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📧</span>
              </div>
              <span className="font-medium text-slate-900">Newsletter</span>
            </div>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              + Add Details
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 mt-6">
        Connecting accounts helps verify your audience and improves your match quality with advertisers.
      </p>
    </div>
  );
}

function StepAudience() {
  const neighborhoods = [
    'Mission', 'Castro', 'Chinatown', 'Tenderloin', 'SOMA', 'Financial District',
    'Bayview', 'Excelsior', 'Sunset', 'Richmond', 'Noe Valley', 'Bernal Heights',
    'Potrero Hill', 'Marina', 'North Beach', 'Haight-Ashbury', 'Outer Mission'
  ];

  const languages = ['English', 'Spanish', 'Chinese (Cantonese)', 'Chinese (Mandarin)', 'Tagalog', 'Vietnamese', 'Russian', 'Korean', 'Japanese'];

  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Define Your Audience</h2>
      <p className="text-slate-600 mb-8">This is how campaigns will find you. Be specific about who your audience is.</p>

      <div className="space-y-8">
        {/* Geographic */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Neighborhoods Served
          </label>
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map(n => (
              <button
                key={n}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
              My publication serves all of San Francisco (citywide)
            </label>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Content Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map(l => (
              <button
                key={l}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Age Ranges */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Primary Age Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {ageRanges.map(a => (
              <button
                key={a}
                className="px-3 py-1 text-sm border border-slate-300 rounded-full hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Community Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Describe Your Community
          </label>
          <textarea
            rows={4}
            placeholder="e.g., Latino families in the Mission, young professionals interested in local politics, Cantonese-speaking seniors..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-sm text-slate-500 mt-2">
            Be specific. This description helps campaigns find you when they&apos;re targeting specific communities.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepRates() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Your Rates</h2>
      <p className="text-slate-600 mb-8">Define pricing for different types of content. You can adjust these anytime.</p>

      <div className="space-y-6">
        {/* Instagram */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs">📷</span>
            Instagram
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Feed Post</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="150"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Story</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="75"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Reel</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="250"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Carousel</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="200"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center text-white text-xs">📧</span>
            Newsletter
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Featured Mention</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Dedicated Send</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="350"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Additional Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g., Rates include one round of revisions. Rush delivery available for 25% additional fee."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function StepVendor() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">City Vendor Status</h2>
      <p className="text-slate-600 mb-8">To receive payments from City departments, you need to be a registered vendor.</p>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Why Vendor Registration?</h3>
          <p className="text-sm text-blue-800">
            The City of San Francisco requires all contractors and suppliers to be registered in the
            City&apos;s supplier system. This ensures you can receive payment for campaigns.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Are you currently a registered City vendor?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="vendor" className="text-emerald-600" />
              <div>
                <span className="font-medium text-slate-900">Yes, I have a vendor ID</span>
                <p className="text-sm text-slate-500">I&apos;m already registered in the City supplier system</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="vendor" className="text-emerald-600" />
              <div>
                <span className="font-medium text-slate-900">Registration in progress</span>
                <p className="text-sm text-slate-500">I&apos;ve started but haven&apos;t received my vendor ID yet</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="vendor" className="text-emerald-600" />
              <div>
                <span className="font-medium text-slate-900">Not yet registered</span>
                <p className="text-sm text-slate-500">I need help getting started with registration</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Vendor ID (if you have one)
          </label>
          <input
            type="text"
            placeholder="e.g., V123456"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 mb-2">Need to Register?</h3>
          <p className="text-sm text-slate-600 mb-3">
            We can help you through the process. Registration typically takes 5-10 business days.
          </p>
          <a
            href="https://sfgov.org/oca/supplier-registration"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Start Vendor Registration →
          </a>
        </div>
      </div>
    </div>
  );
}

function StepReview() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Your Profile</h2>
      <p className="text-slate-600 mb-8">Make sure everything looks correct before submitting.</p>

      <div className="space-y-6">
        {/* Summary sections would show the entered data */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">Publication Details</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
          </div>
          <p className="text-sm text-slate-500">[Publication details will appear here]</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">Platforms</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
          </div>
          <p className="text-sm text-slate-500">[Connected platforms will appear here]</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">Audience Profile</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
          </div>
          <p className="text-sm text-slate-500">[Audience details will appear here]</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">Rate Card</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
          </div>
          <p className="text-sm text-slate-500">[Pricing will appear here]</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">Vendor Status</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700">Edit</button>
          </div>
          <p className="text-sm text-slate-500">[Vendor status will appear here]</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-medium text-emerald-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• We&apos;ll review your profile within 2-3 business days</li>
            <li>• You&apos;ll receive an email when your profile is approved</li>
            <li>• Once approved, you&apos;ll start receiving campaign match notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
