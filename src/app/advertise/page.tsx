'use client';

/**
 * Advertise Landing Page
 *
 * The third portal — for businesses, nonprofits, foundations, and anyone
 * who wants to advertise with (and support) community/ethnic media.
 * Marigold theme. Dual value prop: marketing ROI + community impact.
 */

import Link from "next/link";
import { Nav, Testimonial, Footer } from "@/components/shared";
import { SFMapTexture } from "@/components/SFMapTexture";
import { ResonanceBeacon } from "@/components/ResonanceBeacon";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Nav variant="advertise" />

      {/* Hero - Marigold themed */}
      <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden">
        {/* Beacon elements */}
        <ResonanceBeacon color="marigold" size="xl" intensity="subtle" className="bottom-10 right-10 z-0" delay={0} />
        <ResonanceBeacon color="coral" size="lg" intensity="whisper" className="top-32 left-1/4 z-0" delay={2000} />

        {/* Marigold accent background with Thomas Bros map texture */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(135deg, var(--color-marigold) 0%, var(--color-marigold-dark) 100%)',
            clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 50% 100%)',
          }}
        />
        <div className="absolute inset-0 z-[1]" style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 50% 100%)' }}>
          <SFMapTexture variant="marigold" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left: Text */}
            <div className="relative z-10">
              <div className="label text-[var(--color-marigold-dark)] mb-4 animate-fade-in-up">
                For Businesses &amp; Organizations
              </div>
              <h1 className="display-xl font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-6 animate-fade-in-up stagger-1">
                Amplify your message.
                <span className="block text-[var(--color-marigold-dark)]">Strengthen communities.</span>
              </h1>
              <p className="body-lg text-[var(--color-slate)] max-w-lg mb-8 animate-fade-in-up stagger-2">
                Reach the customers you want through the local media they trust.
                Every ad placed supports the community journalism that keeps
                neighborhoods informed and connected.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Link href="/sf/advertise" className="btn btn-marigold">
                  Start Advertising
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="#how-it-works" className="btn btn-outline text-[var(--color-charcoal)]">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right: Visual card stack */}
            <div className="relative z-10 order-first lg:order-last">
              <div className="animate-float">
                {/* Impact preview card */}
                <div className="bg-white rounded-2xl p-8 shadow-float max-w-sm mx-auto">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-marigold-dark)] mb-4">
                    Your Impact
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-slate)]">Impressions</span>
                      <span className="font-bold text-[var(--color-charcoal)]">24,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-slate)]">Engagement Rate</span>
                      <span className="font-bold text-[var(--color-charcoal)]">4.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-slate)]">Publishers Supported</span>
                      <span className="font-bold text-[var(--color-marigold-dark)]">3</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-slate)]">Community Impact</span>
                        <span className="font-bold text-[var(--color-teal)]">$2,400 to journalism</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Secondary floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg animate-float-delayed max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-coral)]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-charcoal)]">El Tecolote</div>
                    <div className="text-xs text-[var(--color-slate)]">Your ad supports bilingual journalism</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Prop */}
      <section className="bg-[var(--color-navy)] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Marketing Value */}
            <div className="bg-white/10 backdrop-blur-sm rounded-l-2xl p-10 border border-white/10">
              <div className="label text-[var(--color-marigold)] mb-4">Marketing Value</div>
              <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-white mb-4">
                Better than platform ads
              </h3>
              <div className="space-y-4">
                {[
                  { num: '4.8%', label: 'Avg. engagement rate (vs. 0.9% on Meta)' },
                  { num: '89%', label: 'Trust score for community media' },
                  { num: '3x', label: 'Higher recall vs. display ads' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-[var(--color-marigold)] font-[family-name:var(--font-fraunces)]">
                      {stat.num}
                    </span>
                    <span className="text-white/70 text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Community Value */}
            <div className="bg-[var(--color-teal)] rounded-r-2xl p-10">
              <div className="label text-white/60 mb-4">Community Value</div>
              <h3 className="display-sm font-[family-name:var(--font-fraunces)] text-white mb-4">
                Every dollar sustains journalism
              </h3>
              <div className="space-y-4">
                {[
                  { num: '100%', label: 'Of ad spend goes directly to publishers' },
                  { num: '13', label: 'Community publishers in the SF coalition' },
                  { num: '8', label: 'Languages served across the network' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-white font-[family-name:var(--font-fraunces)]">
                      {stat.num}
                    </span>
                    <span className="text-white/70 text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-marigold-dark)] mb-4">Why Resonate</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Advertising that does more
            </h2>
            <p className="text-[var(--color-slate)] mt-4 max-w-2xl mx-auto text-lg">
              Community publishers have audiences that major platforms can&apos;t reach.
              When you advertise through them, you get both results and impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Hyperlocal Reach',
                desc: 'Target by neighborhood, language, community, and culture. Reach the Mission District, Chinatown, or Bayview with precision no platform ad can match.',
                color: 'bg-[var(--color-marigold)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Trusted Voices',
                desc: 'Your message is delivered by publishers these communities already trust. Not as an interrupting ad, but as content their audience wants to see.',
                color: 'bg-[var(--color-teal)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Meaningful Impact',
                desc: 'See exactly how your investment supports community journalism. Track marketing ROI and community impact from the same dashboard.',
                color: 'bg-[var(--color-coral)]',
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

      {/* Who This Is For */}
      <section className="py-24 px-6 bg-[var(--color-cream)] bg-dots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-marigold-dark)] mb-4">Who It&apos;s For</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Built for organizations that care about community
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '🏪',
                title: 'Local Businesses',
                desc: 'Restaurants, shops, services — reach the neighbors who become regulars.',
                examples: 'Cafes, bookstores, law offices, clinics',
              },
              {
                emoji: '🏢',
                title: 'Regional Brands',
                desc: 'Bay Area companies looking for authentic local presence in diverse communities.',
                examples: 'Credit unions, healthcare, real estate',
              },
              {
                emoji: '🤝',
                title: 'Nonprofits',
                desc: 'Get your programs in front of the exact communities you serve.',
                examples: 'Legal aid, youth programs, food banks',
              },
              {
                emoji: '🎓',
                title: 'Foundations',
                desc: 'Support community journalism directly while promoting grants and initiatives.',
                examples: 'Community foundations, arts funders',
              },
            ].map((type) => (
              <div key={type.title} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="text-4xl mb-4">{type.emoji}</div>
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[var(--color-charcoal)] mb-2">
                  {type.title}
                </h3>
                <p className="text-[var(--color-slate)] text-sm mb-3">{type.desc}</p>
                <p className="text-xs text-[var(--color-slate)]/70 italic">{type.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="label text-[var(--color-marigold-dark)] mb-4">Getting Started</div>
            <h2 className="display-md font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Three steps to community-powered advertising
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                num: 1,
                title: 'Choose Your Goal',
                desc: 'Tell us what you want to achieve — reach nearby customers, promote an event, build brand awareness, or support community journalism. We\'ll recommend the right publishers and formats.',
              },
              {
                num: 2,
                title: 'Review Your Matches',
                desc: 'See publishers matched to your goals, budget, and target community. View their audience demographics, engagement rates, and pricing. Select the ones that fit.',
              },
              {
                num: 3,
                title: 'Launch & Track Impact',
                desc: 'Your campaign goes live through trusted community channels. Track both your marketing performance and the community journalism your investment supports.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-8 items-start">
                <div className="w-14 h-14 bg-[var(--color-marigold)] rounded-2xl flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-fraunces)] flex-shrink-0">
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
            quote="Our ads through Resonate didn't just perform — they built real relationships with communities we'd been trying to reach for years."
            author="James Park"
            role="Marketing Director"
            org="Bay Area Credit Union"
            variant="marigold"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--color-navy)] relative overflow-hidden">
        <ResonanceBeacon color="marigold" size="xl" intensity="subtle" className="-top-20 -right-20 z-0" delay={500} />
        <ResonanceBeacon color="coral" size="lg" intensity="whisper" className="-bottom-10 -left-10 z-0" delay={1500} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="display-lg font-[family-name:var(--font-fraunces)] text-white mb-6">
            Ready to reach your community?
          </h2>
          <p className="body-lg text-white/70 mb-10">
            Start a campaign that delivers results for your business while investing
            in the community journalism that keeps neighborhoods strong.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sf/advertise" className="btn btn-marigold text-lg">
              Start a Campaign
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/sf/government" className="btn btn-outline text-white border-white/30 hover:bg-white hover:text-[var(--color-navy)]">
              Government Campaigns
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
