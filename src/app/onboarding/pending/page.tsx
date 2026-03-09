import { UserButton } from '@clerk/nextjs';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-2">
            Application Under Review
          </h1>
          <p className="text-slate-600 mb-6">
            Thank you for applying to Resonate! We review every application personally
            and will get back to you shortly. Check your email for a confirmation of
            your submission.
          </p>
          <div className="flex justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
}
