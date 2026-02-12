import Link from 'next/link';
import React from 'react';

// =============================================================================
// NAVIGATION
// =============================================================================

interface NavProps {
  variant?: 'default' | 'publisher' | 'government' | 'advertise';
}

export function Nav({ variant = 'default' }: NavProps) {
  const accentClass =
    variant === 'publisher' ? 'text-[#c45a3b]' :
    variant === 'government' ? 'text-[var(--color-teal)]' :
    variant === 'advertise' ? 'text-[var(--color-marigold-dark)]' :
    '';

  const portalLabel =
    variant === 'publisher' ? 'Publishers' :
    variant === 'government' ? 'Government' :
    variant === 'advertise' ? 'Advertise' :
    null;

  const btnClass =
    variant === 'publisher' ? 'btn-coral' :
    variant === 'government' ? 'btn-teal' :
    variant === 'advertise' ? 'btn-marigold' :
    'btn-coral';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-sm border border-[var(--color-mist)]">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
            Resonate
          </span>
          {portalLabel && (
            <>
              <span className="text-[var(--color-mist)]">|</span>
              <span className={`text-sm font-bold tracking-wide uppercase ${accentClass}`}>
                {portalLabel}
              </span>
            </>
          )}
        </Link>
        <div className="flex items-center gap-4">
          {variant === 'default' ? (
            <>
              <Link href="/publisher" className="text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors">
                For Publishers
              </Link>
              <Link href="/government" className="text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors">
                For Government
              </Link>
              <Link href="/advertise" className="text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors">
                Advertise
              </Link>
            </>
          ) : (
            <>
              {variant === 'publisher' && (
                <Link href="/publisher/dashboard" className="text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors">
                  Dashboard
                </Link>
              )}
              <Link
                href={`/${variant}/onboarding`}
                className={`btn ${btnClass} text-sm py-2 px-4`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// =============================================================================
// BUTTONS
// =============================================================================

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'coral' | 'teal' | 'marigold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function Button({ children, variant = 'coral', size = 'md', href, className = '', onClick }: ButtonProps) {
  const baseClasses = 'btn';
  const variantClasses = {
    coral: 'btn-coral',
    teal: 'btn-teal',
    marigold: 'btn-marigold',
    outline: 'btn-outline text-[var(--color-charcoal)]',
    ghost: 'bg-transparent hover:bg-[var(--color-cream-dark)] text-[var(--color-charcoal)]',
  };
  const sizeClasses = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-lg py-4 px-8',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button className={classes} onClick={onClick}>{children}</button>;
}

// =============================================================================
// STAT BLOCK
// =============================================================================

interface StatBlockProps {
  number: string;
  label: string;
  sublabel?: string;
  color?: 'coral' | 'teal' | 'marigold' | 'default';
}

export function StatBlock({ number, label, sublabel, color = 'default' }: StatBlockProps) {
  const colorClasses = {
    coral: 'text-[var(--color-coral)]',
    teal: 'text-[var(--color-teal)]',
    marigold: 'text-[var(--color-marigold)]',
    default: 'text-[var(--color-charcoal)]',
  };

  return (
    <div className="text-center md:text-left">
      <div className={`stat-number ${colorClasses[color]}`}>{number}</div>
      <div className="text-[var(--color-charcoal)] font-medium mt-1">{label}</div>
      {sublabel && <div className="text-sm text-[var(--color-slate)]">{sublabel}</div>}
    </div>
  );
}

// =============================================================================
// TESTIMONIAL
// =============================================================================

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  org: string;
  variant?: 'coral' | 'teal' | 'marigold';
}

const testimonialColor = {
  coral: 'text-[var(--color-coral)]',
  teal: 'text-[var(--color-teal)]',
  marigold: 'text-[var(--color-marigold-dark)]',
};

export function Testimonial({ quote, author, role, org, variant = 'coral' }: TestimonialProps) {
  return (
    <div className="relative">
      <div className={`quote-mark absolute -top-4 -left-2 ${testimonialColor[variant]}`}>
        &ldquo;
      </div>
      <blockquote className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-[var(--color-charcoal)] leading-snug pl-8">
        {quote}
      </blockquote>
      <div className="mt-6 pl-8">
        <div className="font-semibold text-[var(--color-charcoal)]">{author}</div>
        <div className="text-[var(--color-slate)]">{role}</div>
        <div className={`text-sm font-medium ${testimonialColor[variant]}`}>{org}</div>
      </div>
    </div>
  );
}

// =============================================================================
// FEATURE CARD
// =============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: 'coral' | 'teal' | 'marigold';
}

export function FeatureCard({ icon, title, description, color = 'coral' }: FeatureCardProps) {
  const bgColors = {
    coral: 'bg-[var(--color-coral)]',
    teal: 'bg-[var(--color-teal)]',
    marigold: 'bg-[var(--color-marigold)]',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-mist)] card-hover">
      <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[var(--color-charcoal)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-slate)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// =============================================================================
// STEP BLOCK
// =============================================================================

interface StepBlockProps {
  number: number;
  title: string;
  description: string;
  color?: 'coral' | 'teal';
}

export function StepBlock({ number, title, description, color = 'coral' }: StepBlockProps) {
  const bgColor = color === 'teal' ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-coral)]';

  return (
    <div className="flex gap-5">
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {number}
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[var(--color-charcoal)] mb-1">
          {title}
        </h3>
        <p className="text-[var(--color-slate)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// PUBLISHER CARD (for matching display)
// =============================================================================

interface PublisherCardProps {
  name: string;
  description: string;
  platforms: string[];
  reach: string;
  matchScore: number;
  matchReasons: string[];
  priceRange: string;
}

export function PublisherCard({ name, description, platforms, reach, matchScore, matchReasons, priceRange }: PublisherCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--color-mist)] card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-[var(--color-charcoal)]">{name}</h4>
          <p className="text-sm text-[var(--color-slate)] mt-1">{description}</p>
        </div>
        <div className="bg-[var(--color-teal)] text-white px-3 py-1 rounded-full text-sm font-semibold">
          {matchScore}% match
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {platforms.map(p => (
          <span key={p} className="text-xs bg-[var(--color-cream)] text-[var(--color-slate)] px-2 py-1 rounded-full">
            {p}
          </span>
        ))}
        <span className="text-xs bg-[var(--color-marigold-light)] text-[var(--color-charcoal)] px-2 py-1 rounded-full font-medium">
          {reach}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[var(--color-slate)] mb-2 uppercase tracking-wide font-medium">Why this match:</p>
        <ul className="space-y-1">
          {matchReasons.map((reason, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-charcoal)]">
              <span className="text-[var(--color-teal)]">✓</span> {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-mist)]">
        <span className="text-sm text-[var(--color-slate)]">{priceRange}</span>
        <button className="btn btn-teal text-sm py-2 px-4">
          Add to Campaign
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// SECTION WRAPPER
// =============================================================================

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  bg?: 'cream' | 'white' | 'teal' | 'coral' | 'navy';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({ children, className = '', bg = 'cream', padding = 'lg' }: SectionProps) {
  const bgColors = {
    cream: 'bg-[var(--color-cream)]',
    white: 'bg-white',
    teal: 'bg-[var(--color-teal)]',
    coral: 'bg-[var(--color-coral)]',
    navy: 'bg-[var(--color-navy)]',
  };

  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32',
  };

  return (
    <section className={`${bgColors[bg]} ${paddingClasses[padding]} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}

// =============================================================================
// FLOATING UI MOCKUP
// =============================================================================

interface MockupProps {
  variant: 'dashboard' | 'analytics' | 'matching';
  className?: string;
}

export function FloatingMockup({ variant, className = '' }: MockupProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-4 bg-gradient-to-br from-[var(--color-coral-light)]/20 to-[var(--color-marigold-light)]/20 rounded-3xl blur-xl" />
      <div className="relative bg-white rounded-2xl shadow-float border border-[var(--color-mist)] overflow-hidden">
        {variant === 'dashboard' && <DashboardMockup />}
        {variant === 'analytics' && <AnalyticsMockup />}
        {variant === 'matching' && <MatchingMockup />}
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full max-w-md">
      {/* Window Chrome */}
      <div className="bg-[var(--color-cream)] px-4 py-3 flex items-center gap-2 border-b border-[var(--color-mist)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-coral)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-marigold)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-teal)]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-md px-3 py-1 text-xs text-[var(--color-slate)]">resonate.local/dashboard</div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-[var(--color-charcoal)]">Active Campaigns</div>
          <span className="bg-[var(--color-teal)] text-white text-xs px-2 py-1 rounded-full">3 Live</span>
        </div>
        <div className="space-y-2">
          {['Flu Shot Outreach', 'Summer Jobs Program', 'Housing Assistance'].map((name, i) => (
            <div key={name} className="flex items-center gap-3 p-2 bg-[var(--color-cream)] rounded-lg">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[var(--color-teal)]' : i === 1 ? 'bg-[var(--color-marigold)]' : 'bg-[var(--color-coral)]'}`} />
              <span className="text-sm text-[var(--color-charcoal)]">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="w-full max-w-sm p-4">
      <div className="text-sm font-medium text-[var(--color-slate)] mb-3">Audience Demographics</div>
      <div className="space-y-3">
        {[
          { label: 'Mission District', value: 45 },
          { label: 'Excelsior', value: 28 },
          { label: 'Bayview', value: 18 },
          { label: 'Other', value: 9 },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--color-charcoal)]">{label}</span>
              <span className="text-[var(--color-slate)]">{value}%</span>
            </div>
            <div className="h-2 bg-[var(--color-cream)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-marigold)] rounded-full"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchingMockup() {
  return (
    <div className="w-full max-w-xs p-4">
      <div className="text-sm font-medium text-[var(--color-slate)] mb-3">Top Matches</div>
      <div className="space-y-2">
        {[
          { name: 'Mission Local', score: 94, color: 'bg-[var(--color-teal)]' },
          { name: 'El Tecolote', score: 91, color: 'bg-[var(--color-teal)]' },
          { name: 'Bay Area Reporter', score: 85, color: 'bg-[var(--color-marigold)]' },
        ].map(({ name, score, color }) => (
          <div key={name} className="flex items-center justify-between p-2 bg-[var(--color-cream)] rounded-lg">
            <span className="text-sm text-[var(--color-charcoal)]">{name}</span>
            <span className={`${color} text-white text-xs px-2 py-0.5 rounded-full`}>{score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export function Footer({ variant = 'default' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="bg-[var(--color-charcoal)] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/60">
            Resonate - A project of the San Francisco Independent Media Coalition
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Contact</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[var(--color-charcoal)] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="font-[family-name:var(--font-fraunces)] text-2xl font-bold mb-4">Resonate</div>
            <p className="text-white/70 max-w-md leading-relaxed">
              A community media marketplace connecting advertisers with trusted local publishers. Amplify your message while strengthening community journalism.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-4">Publishers</div>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/publisher" className="hover:text-white transition-colors">Why Resonate</Link></li>
              <li><Link href="/publisher/onboarding" className="hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Government</div>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/government" className="hover:text-white transition-colors">Why Resonate</Link></li>
              <li><Link href="/government/onboarding" className="hover:text-white transition-colors">Create Campaign</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Advertise</div>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/advertise" className="hover:text-white transition-colors">Why Resonate</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/50">
            A project of the San Francisco Independent Media Coalition
          </div>
          <div className="flex gap-6 text-sm text-white/50">
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
