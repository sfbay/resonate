import { SignIn } from '@clerk/nextjs';
import { ResonanceLogo } from '@/components/ResonanceLogo';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-charcoal)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ResonanceLogo size={36} />
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-white">
              Resonate
            </h1>
          </div>
          <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
            Connecting community publishers with the institutions and businesses that need to reach their audiences.
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
