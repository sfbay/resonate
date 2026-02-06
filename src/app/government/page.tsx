'use client';

import Link from "next/link";
import { Nav, Testimonial, FloatingMockup, PublisherCard, Footer } from "@/components/shared";
import { SFMapTexture } from "@/components/SFMapTexture";
import { ResonanceBeacon } from "@/components/ResonanceBeacon";

export default function GovernmentPortal() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Nav variant="government" />

      {/* Hero - Teal themed */}
      <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden">
        {/* Animated beacon elements - behind map layer */}
        <ResonanceBeacon color="teal" size="xl" intensity="subtle" className="bottom-10 left-10 z-0" delay={0} />
        <ResonanceBeacon color="marigold" size="lg" intensity="whisper" className="top-32 left-1/3 z-0" delay={2000} />
        {/* Full teal background on right - above beacons */}
        <div className="absolute inset-0 z-[1] bg-[var(--color-teal)]" style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 45% 100%)' }} />
        <div className="absolute inset-0 z-[1]" style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 45% 100%)' }}>
          <SFMapTexture variant="teal" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[4fr_5fr] gap-8 items-center min-h-[70vh]">
            {/* Left: Floating Mockups */}
            <div className="relative z-10 order-2 lg:order-1">
              <div className="animate-float">
                <FloatingMockup variant="matching" className="mx-auto lg:mx-0" />
              </div>
              {/* Campaign preview card */}
              <div className="absolute -bottom-4 right-0 bg-white rounded-xl p-4 shadow-float animate-float-delayed max-w-xs">
                <div className="text-xs text-[var(--color-slate)] mb-2">Active Campaign</div>
                <div className="font-semibold text-[var(--color-charcoal)] mb-1">Flu Shot Outreach</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-teal)]" />
                  <span className="text-sm text-[var(--color-teal)]">4 publishers, 120K reach</span>
                </div>
              </div>
            </div>

            {/* Right: Text */}
            <div className="relative z-10 order-1 lg:order-2 lg:pl-12">
              <div className="label text-white/80 mb-4 animate-fade-in-up">
                For Government Agencies
              </div>
              <h1 className="display-xl font-[family-name:var(--font-fraunces)] text-white mb-6 animate-fade-in-up stagger-1">
                Meet communities
                <span className="block text-[var(--color-marigold)]">where they are</span>
              </h1>
              <p className="body-lg text-white/90 max-w-lg mb-8 animate-fade-in-up stagger-2">
                Stop shouting into the void. Connect with local publishers whose audiences match exactly who you need to reach—from Chinatown elders to Mission District families.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/government/onboarding" className="btn bg-white text-[var(--color-teal)] hover:bg-[var(--color-cream)]">
                  Create Your First Campaign
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/government/discover" className="btn btn-outline text-white border-white/50 hover:bg-white hover:text-[var(--color-teal)]">
                  Browse Publishers
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[var(--color-navy)] py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: 'xx', label: 'City Departments', color: 'text-[var(--color-teal-light)]' },
            { num: 'xx', label: 'Combined Reach', color: 'text-[var(--color-marigold)]' },
            { num: 'xx', label: 'Engagement Rate', color: 'text-white' },
            { num: 'xx', label: 'Local Publishers', color: 'text-[var(--color-coral)]' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className={`stat-number ${stat.color}`}>{stat.num}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem Section */}
      <section id="the-problem" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-teal)] mb-4">The Challenge</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Connecting with San Franciscans isn&apos;t easy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <div className="space-y-6">
              {[
                {
                  title: 'Platform Ads Miss Trust',
                  desc: 'Facebook and Instagram ads reach eyeballs, but don&apos;t build trust. Your public message gets scrolled past like every other ad.',
                },
                {
                  title: 'Broad Demographics Miss Nuance',
                  desc: 'Targeting "Spanish speakers in SF" misses the difference between a Salvadoran family in the Excelsior and a CTO from Madrid.',
                },
                {
                  title: 'Build Local Infrastructure',
                  desc: 'Community media exists and serves the public. Resonate connects you with their audience.',
                },
              ].map((problem, i) => (
                <div key={problem.title} className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[var(--color-coral)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">{problem.title}</h3>
                    <p className="text-[var(--color-slate)]">{problem.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Solution */}
            <div className="bg-[var(--color-teal)] rounded-3xl p-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="display-sm font-[family-name:var(--font-fraunces)] mb-4">
                Resonate solves this
              </h3>
              <p className="text-white/90 leading-relaxed mb-6">
                Pre-vetted community publishers. Verified audiences. Streamlined procurement. Your message through voices the community already trusts.
              </p>
              <ul className="space-y-3">
                {['Audience-verified publishers', 'Neighborhood-level targeting', 'Procurement-compliant workflow'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-[var(--color-cream)] bg-dots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-teal)] mb-4">What You Get</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Tools for effective outreach
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Audience Matching',
                desc: "Tell us who you need to reach. We'll show you publishers whose verified audiences match your target demographics.",
                color: 'bg-[var(--color-teal)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                title: 'Campaign Management',
                desc: 'Plan, launch, and track campaigns across multiple publishers from one dashboard. See what\'s working in real-time.',
                color: 'bg-[var(--color-marigold)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Procurement-Ready',
                desc: 'All publishers are registered city vendors. Orders generate procurement-compliant documentation automatically.',
                color: 'bg-[var(--color-coral)]',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-8 card-hover">
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

      {/* Example Campaigns */}
      <section className="py-24 px-6 bg-[var(--color-teal)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-white/60 mb-4">Real Results</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-white">
              Example campaigns
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                dept: 'Public Health',
                name: 'Flu Shot Campaign - Chinatown',
                target: 'Cantonese-speaking seniors in Chinatown',
                publishers: 'Chinese language community newspaper Instagram, Chinatown community center newsletter',
                result: '3x engagement vs. platform ads',
              },
              {
                dept: 'Emergency Management',
                name: 'Earthquake Preparedness - Citywide',
                target: 'Renters across all SF neighborhoods',
                publishers: '12 neighborhood blogs and community newspapers',
                result: '120K impressions, 89% view rate',
              },
              {
                dept: 'Recreation & Parks',
                name: 'Summer Programs - Bayview',
                target: 'Families with children in Bayview-Hunters Point',
                publishers: 'Bayview community pages, local church bulletins',
                result: '47% increase in program signups',
              },
              {
                dept: 'Small Business',
                name: 'Grant Program - Latino Businesses',
                target: 'Spanish-speaking small business owners in Mission',
                publishers: 'Mission Local, El Tecolote, Latino business newsletters',
                result: '200+ grant applications',
              },
            ].map((campaign) => (
              <div key={campaign.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-sm text-[var(--color-marigold)] font-medium mb-2">{campaign.dept}</div>
                <h3 className="font-[family-name:var(--font-fraunces)] text-xl text-white font-semibold mb-3">
                  {campaign.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-white/80 text-sm">
                    <span className="text-white/50">Target:</span> {campaign.target}
                  </p>
                  <p className="text-white/80 text-sm">
                    <span className="text-white/50">Publishers:</span> {campaign.publishers}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <span className="text-[var(--color-marigold)] font-semibold">{campaign.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-teal)] mb-4">Your Journey</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              How it works for departments
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                num: 1,
                title: 'Define Your Audience',
                desc: 'Tell us who you need to reach: neighborhoods, languages, age groups, communities. Be as specific as you need.',
              },
              {
                num: 2,
                title: 'Review Matched Publishers',
                desc: 'See publishers whose audiences match your targets. View their reach, engagement rates, audience demographics, and pricing.',
              },
              {
                num: 3,
                title: 'Build Your Campaign',
                desc: 'Select publishers, define deliverables, set timelines. Provide creative assets or let publishers create authentic content.',
              },
              {
                num: 4,
                title: 'Place Orders & Track Delivery',
                desc: 'Generate procurement-ready orders. Track when content goes live. Confirm deliverables. Measure impact.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-8 items-start">
                <div className="w-14 h-14 bg-[var(--color-teal)] rounded-2xl flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-fraunces)] flex-shrink-0">
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

      {/* Testimonial */}
      <section className="py-24 px-6 bg-[var(--color-cream)]">
        <div className="max-w-4xl mx-auto">
          <Testimonial
            quote="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."
            author="Placeholder Name"
            role="Role Title"
            org="Organization Name"
            variant="teal"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--color-navy)] relative overflow-hidden">
        <ResonanceBeacon color="teal" size="xl" intensity="subtle" className="-top-20 -left-20 z-0" delay={500} />
        <ResonanceBeacon color="marigold" size="lg" intensity="whisper" className="-bottom-10 -right-10 z-0" delay={1500} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="display-lg font-[family-name:var(--font-fraunces)] text-white mb-6">
            Ready to reach your community?
          </h2>
          <p className="body-lg text-white/70 mb-10">
            Set up your department account and create your first campaign. We&apos;ll walk you through defining your audience and finding the right publishers.
          </p>
          <Link href="/government/onboarding" className="btn btn-teal text-lg">
            Get Started
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
