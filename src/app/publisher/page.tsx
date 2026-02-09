'use client';

import Link from "next/link";
import { Nav, Testimonial, FloatingMockup, Footer } from "@/components/shared";
import { SFMapTexture } from "@/components/SFMapTexture";
import { ResonanceBeacon } from "@/components/ResonanceBeacon";

export default function PublisherPortal() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Nav variant="publisher" />

      {/* Hero - Coral themed */}
      <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden">
        {/* Animated beacon elements - behind map layer */}
        <ResonanceBeacon color="marigold" size="xl" intensity="subtle" className="bottom-10 right-10 z-0" delay={0} />
        <ResonanceBeacon color="coral" size="lg" intensity="whisper" className="top-32 right-1/3 z-0" delay={2000} />
        {/* Full coral background on left - above beacons */}
        <div className="absolute inset-0 z-[1] bg-[var(--color-coral)]" style={{ clipPath: 'polygon(0 0, 65% 0, 55% 100%, 0 100%)' }} />
        <div className="absolute inset-0 z-[1]" style={{ clipPath: 'polygon(0 0, 65% 0, 55% 100%, 0 100%)' }}>
          <SFMapTexture variant="coral" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[5fr_4fr] gap-8 items-center min-h-[70vh]">
            {/* Left: Text on coral bg */}
            <div className="relative z-10">
              <div className="text-sm font-semibold tracking-widest uppercase text-white/80 mb-4 animate-fade-in-up">
                For Community Publishers
              </div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-white mb-6 animate-fade-in-up stagger-1" style={{ fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05 }}>
                Transform reach
                <span className="block text-[var(--color-marigold)]">into revenue</span>
              </h1>
              <p className="text-2xl font-medium text-white/90 max-w-xl mb-8 animate-fade-in-up stagger-2 leading-relaxed">
                You&apos;ve built trust within your community. City departments need to reach them. Resonate connects you with paid campaign opportunities that serve your audience.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/publisher/onboarding" className="btn bg-white text-[var(--color-coral)] hover:bg-[var(--color-cream)]">
                  Register Your Publication
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="#how-it-works" className="btn btn-outline text-white border-white/50 hover:bg-white hover:text-[var(--color-coral)]">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right: Floating Analytics Mockup */}
            <div className="relative z-10">
              <div className="animate-float">
                <FloatingMockup variant="analytics" className="ml-auto" />
              </div>
              {/* Floating stat cards */}
              <div className="absolute -bottom-4 left-0 bg-white rounded-xl p-4 shadow-float animate-float-delayed">
                <div className="text-xs text-[var(--color-slate)] mb-1">This Month</div>
                <div className="text-2xl font-bold font-[family-name:var(--font-fraunces)] text-[var(--color-coral)]">$2,400</div>
                <div className="text-sm text-[var(--color-teal)]">+24% from campaigns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[var(--color-charcoal)] py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '13', label: 'Active Publishers', color: 'text-[var(--color-coral)]' },
            { num: '$27K+', label: 'Paid to Publishers', color: 'text-[var(--color-marigold)]' },
            { num: '98%', label: 'Campaign Satisfaction', color: 'text-[var(--color-teal-light)]' },
            { num: '< 24h', label: 'Avg. Match Time', color: 'text-white' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className={`stat-number ${stat.color}`}>{stat.num}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-coral)] mb-4">What You Get</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Tools to grow and monetize
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Audience Analytics',
                desc: 'Understand who your followers are. Demographics, geography, interests—data that proves your value to advertisers.',
                color: 'bg-[var(--color-coral)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Campaign Matching',
                desc: 'Get notified when city departments launch campaigns targeting your audience. No cold outreach needed.',
                color: 'bg-[var(--color-marigold)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Vendor Streamlining',
                desc: 'We help you become a registered city vendor. Once approved, getting paid is straightforward.',
                color: 'bg-[var(--color-teal)]',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-[var(--color-cream)] rounded-2xl p-8 card-hover">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-slate)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--color-cream)] bg-dots">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-coral)] mb-4">Your Journey</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              How it works for publishers
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                num: 1,
                title: 'Create Your Profile',
                desc: 'Tell us about your publication, your platforms, and the communities you serve. Connect your social accounts for audience verification.',
              },
              {
                num: 2,
                title: 'Define Your Audience',
                desc: 'Describe who follows you: neighborhoods, languages, demographics, interests. This is how campaigns find you.',
              },
              {
                num: 3,
                title: 'Set Your Rates',
                desc: 'Establish pricing for different campaign types: sponsored posts, story takeovers, newsletter features, and more.',
              },
              {
                num: 4,
                title: 'Receive & Accept Campaigns',
                desc: "When a city department launches a campaign targeting your audience, you'll be notified. Review, negotiate, accept—and deliver.",
              },
            ].map((step, i) => (
              <div key={step.num} className="flex gap-8 items-start">
                <div className="w-14 h-14 bg-[var(--color-coral)] rounded-2xl flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-fraunces)] flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-slate)] leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-24 px-6 bg-[var(--color-coral)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="display-md font-[family-name:var(--font-fraunces)] text-white mb-6">
            Built for community media
          </h2>
          <p className="body-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Whether you&apos;re a neighborhood newspaper, a community radio station&apos;s Instagram, a hyperlocal blog, or a cultural organization with a following—if you have an audience that trusts you, you belong here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Neighborhood newspapers',
              'Community radio',
              'Local blogs',
              'Cultural organizations',
              'Neighborhood groups',
              'Faith communities',
              'Ethnic media',
              'Youth programs',
            ].map((type) => (
              <span
                key={type}
                className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Testimonial
            quote="Resonate connected us with campaigns we never would have found on our own. Our community trusts us, and now agencies trust us too."
            author="Ana Montes"
            role="Editor-in-Chief"
            org="El Tecolote"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--color-charcoal)] relative overflow-hidden">
        <ResonanceBeacon color="coral" size="xl" intensity="subtle" className="-top-20 -right-20 z-0" delay={500} />
        <ResonanceBeacon color="marigold" size="lg" intensity="whisper" className="-bottom-10 -left-10 z-0" delay={1500} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="display-lg font-[family-name:var(--font-fraunces)] text-white mb-6">
            Ready to get started?
          </h2>
          <p className="body-lg text-white/70 mb-10">
            Registration takes about 10 minutes. You&apos;ll need access to your social media accounts and basic information about your publication.
          </p>
          <Link href="/publisher/onboarding" className="btn btn-coral text-lg">
            Start Registration
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
