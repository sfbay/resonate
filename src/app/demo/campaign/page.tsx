import Link from 'next/link';

export default function DemoCampaignPage() {
  const steps = [
    {
      number: 1,
      title: 'Campaign Brief',
      description: 'Name your campaign, set goals, define your target audience by neighborhood, language, and community.',
    },
    {
      number: 2,
      title: 'Audience Targeting',
      description: 'Fine-tune geographic, demographic, and cultural targeting. Set budget range and flight dates.',
    },
    {
      number: 3,
      title: 'Publisher Matching',
      description: 'Our algorithm matches your campaign to community media publishers who reach your target audience. Select publishers to work with.',
    },
    {
      number: 4,
      title: 'Unit Builder',
      description: 'Build production-ready creative units for social media, display ads, newsletters, and more. Upload your own or use our templates.',
    },
    {
      number: 5,
      title: 'Review & Submit',
      description: 'Review all campaign details, creative units, and publisher assignments. Submit to send orders to publishers.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium">
        Campaign Walkthrough &mdash; <Link href="/sign-up" className="underline">Join Resonate</Link> to create real campaigns
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-10">
          <h1 className="font-fraunces text-3xl font-bold text-charcoal-900 mb-3">
            How Campaigns Work
          </h1>
          <p className="text-slate-600">
            From brief to delivery in five steps. Resonate connects your message
            with the communities that matter most.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map(step => (
            <div key={step.number} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-teal-700">{step.number}</span>
              </div>
              <div>
                <h2 className="font-semibold text-charcoal-900 mb-1">{step.title}</h2>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/sign-up"
            className="inline-block px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
