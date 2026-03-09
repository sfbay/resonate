import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-charcoal)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-white">
            Resonate
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Community media marketplace
          </p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#2a9d8f',
              colorText: '#1a1a2e',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'shadow-xl border-0 rounded-xl',
              headerTitle: 'font-[family-name:var(--font-fraunces)]',
              headerSubtitle: 'text-[var(--color-slate)]',
              formButtonPrimary:
                'bg-[#2a9d8f] hover:bg-[#238b7e] text-white rounded-lg',
              footerActionLink: 'text-[#2a9d8f] hover:text-[#238b7e]',
            },
          }}
        />
      </div>
    </div>
  );
}
