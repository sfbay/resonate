import Link from "next/link";
import { Nav, StatBlock, Testimonial, StepBlock, FloatingMockup, Footer } from "@/components/shared";
import { SFMapTexture } from "@/components/SFMapTexture";
import { ResonanceBeacon } from "@/components/ResonanceBeacon";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Nav />

      {/* Hero Section - Bold, asymmetric */}
      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
        {/* Coral background on right side */}
        <div className="absolute inset-0 bg-[var(--color-coral)]" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 35% 100%)' }} />
        <div className="absolute inset-0" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 35% 100%)' }}>
          <SFMapTexture variant="coral" />
        </div>
        {/* Resonance Beacons - whisper-soft background pulses */}
        <ResonanceBeacon
          color="marigold"
          size="xl"
          intensity="whisper"
          className="bottom-20 -left-20 z-0"
          delay={0}
        />
        <ResonanceBeacon
          color="teal"
          size="md"
          intensity="whisper"
          className="top-40 left-[20%] z-0"
          delay={2000}
        />
        <ResonanceBeacon
          color="coral"
          size="lg"
          intensity="whisper"
          className="bottom-40 left-[8%] z-0"
          delay={4000}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left: Text */}
            <div className="relative z-10">
              <div className="text-sm font-semibold tracking-widest uppercase text-[var(--color-coral)] mb-4 animate-fade-in-up">
                Civic Media Marketplace
              </div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-6 animate-fade-in-up stagger-1" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 700, lineHeight: 1.05 }}>
                Messages that
                <span className="block text-gradient-coral">Resonate</span>
              </h1>
              <p className="text-2xl font-medium text-[var(--color-charcoal)]/75 max-w-xl mb-8 animate-fade-in-up stagger-2 leading-relaxed">
                Connect city departments with community publishers. Reach real audiences through voices they already trust.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/publisher" className="btn btn-coral">
                  I&apos;m a Publisher
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/advertiser" className="btn btn-teal">
                  I&apos;m a Department
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Floating UI Mockups */}
            <div className="relative z-10 lg:pl-12">
              <div className="animate-float">
                <FloatingMockup variant="dashboard" className="ml-auto max-w-md" />
              </div>
              <div className="absolute -bottom-8 -left-8 animate-float-delayed">
                <FloatingMockup variant="matching" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-slate)]">
          <span className="text-sm">Scroll to explore</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section - Color Block */}
      <section className="bg-[var(--color-teal)] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="stat-number text-white">47</div>
            <div className="text-white/80 font-medium mt-1">Community Publishers</div>
            <div className="text-sm text-white/60">And growing weekly</div>
          </div>
          <div className="text-center">
            <div className="stat-number text-[var(--color-marigold)]">850K+</div>
            <div className="text-white/80 font-medium mt-1">Combined Reach</div>
            <div className="text-sm text-white/60">Across San Francisco</div>
          </div>
          <div className="text-center">
            <div className="stat-number text-white">12</div>
            <div className="text-white/80 font-medium mt-1">City Departments</div>
            <div className="text-sm text-white/60">Running campaigns</div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-4">
              Two sides, one mission
            </h2>
            <p className="body-md text-[var(--color-slate)] max-w-2xl mx-auto">
              Whether you&apos;re a community voice looking to grow, or a department trying to reach residents—Resonate connects you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Publisher Card */}
            <Link
              href="/publisher"
              className="group relative bg-[var(--color-cream)] rounded-3xl p-8 overflow-hidden card-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-coral)] rounded-bl-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-marigold)] rounded-tr-[60px] opacity-10 group-hover:opacity-30 transition-opacity" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--color-coral)] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>

                <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-3">
                  For Community Publishers
                </h3>
                <p className="text-[var(--color-slate)] mb-6">
                  You&apos;ve built trust with your audience. Turn that into sustainable revenue by connecting with city departments who need to reach your community.
                </p>

                <ul className="space-y-3 mb-8">
                  {['Audience analytics dashboard', 'Automatic campaign matching', 'Streamlined vendor process'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--color-charcoal)]">
                      <span className="w-6 h-6 bg-[var(--color-coral)]/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-[var(--color-coral)] font-semibold group-hover:gap-4 transition-all">
                  Get started as a publisher
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Advertiser Card */}
            <Link
              href="/advertiser"
              className="group relative bg-[var(--color-cream)] rounded-3xl p-8 overflow-hidden card-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-teal)] rounded-bl-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-teal-light)] rounded-tr-[60px] opacity-10 group-hover:opacity-30 transition-opacity" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--color-teal)] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-3">
                  For City Departments
                </h3>
                <p className="text-[var(--color-slate)] mb-6">
                  Stop shouting into the void. Find community publishers whose audiences match exactly who you need to reach—from Chinatown elders to Mission families.
                </p>

                <ul className="space-y-3 mb-8">
                  {['Audience-based matching', 'Campaign management tools', 'Procurement-ready ordering'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--color-charcoal)]">
                      <span className="w-6 h-6 bg-[var(--color-teal)]/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-[var(--color-teal)] font-semibold group-hover:gap-4 transition-all">
                  Create your first campaign
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[var(--color-cream)] bg-dots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-teal)] mb-4">Simple Process</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              How Resonate Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: 1,
                title: 'Match',
                desc: 'Publishers define their audiences. Departments define who they need to reach. Our algorithm connects the dots.',
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
              <div key={step.num} className="relative">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <span className="text-white text-2xl font-bold font-[family-name:var(--font-fraunces)]">{step.num}</span>
                </div>
                <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--color-slate)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section - Asymmetric */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-[var(--color-coral)] -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image placeholder - would be a real photo */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-coral-light)] to-[var(--color-marigold-light)] rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-white/40">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[var(--color-marigold)] text-[var(--color-charcoal)] px-6 py-3 rounded-xl font-semibold">
                2 weeks. 108% reach.
              </div>
            </div>

            {/* Quote */}
            <div>
              <Testimonial
                quote="Resonate helped us reach families in Excelsior that we'd been trying to connect with for years. The community publishers know their audience—we just needed a way to find them."
                author="Maria Santos"
                role="Communications Manager"
                org="SF Dept of Public Health"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[var(--color-navy)] relative overflow-hidden">
        <div className="absolute inset-0 bg-noise" />
        <ResonanceBeacon
          color="coral"
          size="xl"
          intensity="whisper"
          className="-top-20 -right-20 z-0"
          delay={0}
        />
        <ResonanceBeacon
          color="teal"
          size="lg"
          intensity="whisper"
          className="-bottom-16 -left-16 z-0"
          delay={3000}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="display-lg font-[family-name:var(--font-fraunces)] text-white mb-6">
            Ready to connect communities with messages that matter?
          </h2>
          <p className="body-lg text-white/70 max-w-2xl mx-auto mb-10">
            Whether you&apos;re a community publisher looking to grow, or a city department trying to reach residents—we&apos;re here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/publisher/onboarding" className="btn btn-coral">
              Register as Publisher
            </Link>
            <Link href="/advertiser/onboarding" className="btn bg-white text-[var(--color-charcoal)] hover:bg-[var(--color-cream)]">
              Create a Campaign
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
