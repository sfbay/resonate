import Link from "next/link";
import { Footer } from "@/components/shared";
import { SFMapTexture } from "@/components/SFMapTexture";
import { ResonanceBeacon } from "@/components/ResonanceBeacon";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">

      {/* ============================================================
          BRANDING BAR — Consistent with /sf city page
          ============================================================ */}
      <header className="sticky top-0 z-50 bg-[var(--color-charcoal)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <circle cx="13" cy="13" r="4" fill="var(--color-coral)" />
              <path d="M13 5a8 8 0 010 16" stroke="var(--color-teal-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M13 2a11 11 0 010 22" stroke="var(--color-marigold)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            </svg>
            <span className="text-xl font-bold font-serif text-white tracking-tight">
              Resonate
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/publisher" className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all">
              Publishers
            </Link>
            <Link href="/government" className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all">
              Government
            </Link>
            <Link href="/advertise" className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all">
              Advertise
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO — Bright teal gradient, editorial serif, cleaner
          ============================================================ */}
      <section className="relative min-h-[70vh] pt-20 pb-16 overflow-hidden bg-gradient-to-br from-[var(--color-teal)] via-[#0d5c66] to-[var(--color-charcoal)]">
        <SFMapTexture variant="teal" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/60 via-transparent to-transparent z-[1]" />

        <ResonanceBeacon color="coral" size="lg" intensity="subtle" className="top-[8%] left-[6%] z-[2]" />
        <ResonanceBeacon color="marigold" size="md" intensity="subtle" className="top-[20%] right-[10%] z-[2]" delay={2500} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold tracking-widest uppercase text-[var(--color-coral-light)] mb-5 animate-fade-in-up">
              Community Media Marketplace
            </div>
            <h1
              className="font-serif text-white mb-6 animate-fade-in-up stagger-1"
              style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              Messages that
              <span className="block" style={{ color: 'var(--color-marigold)' }}>Resonate</span>
            </h1>
            <p className="text-xl text-white/75 max-w-lg mb-10 animate-fade-in-up stagger-2 leading-relaxed">
              Amplify your message through community publishers. Reach real audiences through voices they know and trust.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-3">
              <Link href="/publisher" className="group px-6 py-3 rounded-full bg-[var(--color-coral)] text-white font-semibold text-sm transition-all duration-300 hover:bg-[var(--color-coral-dark)] hover:scale-105 hover:shadow-lg hover:shadow-[rgba(241,81,82,0.3)]">
                I&apos;m a Publisher
                <svg className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/advertise" className="group px-6 py-3 rounded-full bg-[var(--color-marigold)] text-[var(--color-charcoal)] font-semibold text-sm transition-all duration-300 hover:bg-[var(--color-marigold-dark)] hover:scale-105 hover:shadow-lg hover:shadow-[rgba(247,179,43,0.3)]">
                Advertise
                <svg className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/government" className="group px-6 py-3 rounded-full bg-white/15 text-white font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:scale-105">
                Government
                <svg className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS — Teal bar with real numbers
          ============================================================ */}
      <section className="bg-[var(--color-teal)] py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { value: '13', label: 'Community Publishers', sub: 'And growing' },
            { value: '19', label: 'Languages Served', sub: 'Across SF communities', accent: true },
            { value: '41', label: 'Neighborhoods', sub: 'Full city coverage' },
            { value: '100%', label: 'To Publishers', sub: 'Of their listed rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-serif font-bold leading-none mb-1"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: stat.accent ? 'var(--color-marigold)' : 'white',
                }}
              >
                {stat.value}
              </div>
              <div className="text-white/85 font-medium text-sm">{stat.label}</div>
              <div className="text-white/50 text-xs mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          THREE PATHS — Cards for all three portals
          ============================================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-[var(--color-charcoal)] mb-3" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, lineHeight: 1.15 }}>
              Three paths, one mission
            </h2>
            <p className="text-[var(--color-slate)] max-w-2xl mx-auto text-lg leading-relaxed">
              Whether you&apos;re a community voice, a government agency, or a business — Resonate connects you with the communities that matter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Publisher Card */}
            <Link
              href="/publisher"
              className="group relative bg-[var(--color-cream)] rounded-2xl p-7 overflow-hidden card-hover border border-transparent hover:border-[var(--color-coral)]/20"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-coral)] rounded-bl-[60px] opacity-15 group-hover:opacity-30 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[var(--color-coral)] rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-2">
                  For Publishers
                </h3>
                <p className="text-[var(--color-slate)] text-sm leading-relaxed mb-5">
                  You&apos;ve built trust with your audience. Turn that into sustainable revenue by connecting with campaigns that match your community.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Analytics dashboard', 'Campaign matching', 'Rate card builder'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal)]">
                      <span className="w-5 h-5 bg-[var(--color-coral)]/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[var(--color-coral)] font-semibold text-sm group-hover:gap-3 transition-all">
                  Get started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Government Card */}
            <Link
              href="/government"
              className="group relative bg-[var(--color-cream)] rounded-2xl p-7 overflow-hidden card-hover border border-transparent hover:border-[var(--color-teal)]/20"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-teal)] rounded-bl-[60px] opacity-15 group-hover:opacity-30 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[var(--color-teal)] rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-2">
                  For Government
                </h3>
                <p className="text-[var(--color-slate)] text-sm leading-relaxed mb-5">
                  Reach residents through community publishers whose audiences match exactly who you need — by language, neighborhood, and culture.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Audience matching', 'Campaign management', 'Compliance reporting'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal)]">
                      <span className="w-5 h-5 bg-[var(--color-teal)]/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[var(--color-teal)] font-semibold text-sm group-hover:gap-3 transition-all">
                  Create a campaign
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Advertise Card */}
            <Link
              href="/advertise"
              className="group relative bg-[var(--color-cream)] rounded-2xl p-7 overflow-hidden card-hover border border-transparent hover:border-[var(--color-marigold)]/20"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-marigold)] rounded-bl-[60px] opacity-15 group-hover:opacity-30 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[var(--color-marigold)] rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-2">
                  For Businesses
                </h3>
                <p className="text-[var(--color-slate)] text-sm leading-relaxed mb-5">
                  Every ad dollar placed through Resonate sustains the community journalism that keeps neighborhoods informed and connected.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Publisher matching', 'Creative brief tools', 'Impact reporting'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal)]">
                      <span className="w-5 h-5 bg-[var(--color-marigold)]/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[var(--color-marigold-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[var(--color-marigold-dark)] font-semibold text-sm group-hover:gap-3 transition-all">
                  Start a campaign
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — Cleaner, brighter
          ============================================================ */}
      <section className="py-20 px-6 bg-[var(--color-cream)] bg-dots">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-teal)] mb-3">Simple Process</div>
            <h2 className="font-serif text-[var(--color-charcoal)]" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600 }}>
              How Resonate Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                num: 1,
                title: 'Match',
                desc: 'Publishers define their audiences. Advertisers define who they need to reach. Our algorithm connects the dots.',
                color: 'bg-[var(--color-coral)]',
              },
              {
                num: 2,
                title: 'Scope',
                desc: 'Define campaign parameters, agree on deliverables and pricing. Everything stays procurement-compliant.',
                color: 'bg-[var(--color-marigold)]',
              },
              {
                num: 3,
                title: 'Resonate',
                desc: 'Campaigns run through trusted community voices. Track delivery and measure real community impact.',
                color: 'bg-[var(--color-teal)]',
              },
            ].map((step) => (
              <div key={step.num}>
                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <span className="text-white text-xl font-bold font-serif">{step.num}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--color-slate)] leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          KICKER — Matching the /sf city page kicker
          ============================================================ */}
      <section className="relative py-24 bg-[var(--color-charcoal)] overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[120px]"
          style={{ background: 'var(--color-teal)', opacity: 0.08 }}
        />
        <ResonanceBeacon color="coral" size="lg" intensity="whisper" className="-top-10 -right-10 z-0" />
        <ResonanceBeacon color="teal" size="md" intensity="whisper" className="-bottom-10 -left-10 z-0" delay={3000} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p
            className="font-serif text-white leading-[1.45]"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)' }}
          >
            In a city of{' '}
            <span className="font-bold" style={{ color: 'var(--color-coral)' }}>41 neighborhoods</span>,{' '}
            <span className="font-bold" style={{ color: 'var(--color-marigold)' }}>19 languages</span>,{' '}
            and millions of stories — make your message{' '}
            <span className="font-bold italic" style={{ color: 'var(--color-teal-light)' }}>Resonate</span>.
          </p>

          <p className="mt-5 text-white/50 max-w-xl mx-auto leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)' }}>
            Reach the people and communities through trusted, authentic voices and publications.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/publisher" className="px-6 py-2.5 rounded-full bg-[var(--color-coral)] text-white font-semibold text-sm transition-all hover:bg-[var(--color-coral-dark)] hover:scale-105">
              I&apos;m a Publisher
            </Link>
            <Link href="/government/onboarding" className="px-6 py-2.5 rounded-full bg-[var(--color-teal)] text-white font-semibold text-sm transition-all hover:bg-[var(--color-teal-dark)] hover:scale-105">
              Start a Campaign
            </Link>
            <Link href="/advertise" className="px-6 py-2.5 rounded-full bg-[var(--color-marigold)] text-[var(--color-charcoal)] font-semibold text-sm transition-all hover:bg-[var(--color-marigold-dark)] hover:scale-105">
              Advertise
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-white/35 text-sm">
            <svg width="18" height="18" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <circle cx="13" cy="13" r="4" fill="var(--color-coral)" opacity="0.6" />
              <path d="M13 5a8 8 0 010 16" stroke="var(--color-teal-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
              <path d="M13 2a11 11 0 010 22" stroke="var(--color-marigold)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
            </svg>
            <span>Resonate &middot; Community Media Marketplace</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
