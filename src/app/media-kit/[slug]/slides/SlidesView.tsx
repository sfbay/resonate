'use client';

/**
 * Slides View Component
 *
 * Presentation-ready slide deck format.
 * Each section is a full-screen slide.
 */

import { useState, useEffect, useCallback } from 'react';
import type { MediaKitData } from '@/lib/media-kit/types';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Platform icons mapping
const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '👥',
  twitter: '🐦',
  tiktok: '🎵',
  youtube: '📺',
  newsletter: '📧',
  mailchimp: '📧',
  substack: '📝',
  whatsapp: '💬',
  telegram: '✈️',
  website: '🌐',
};

interface SlidesViewProps {
  data: MediaKitData;
}

export function SlidesView({ data }: SlidesViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const accentColor = data.publisher.accentColor || '#FF6B6B';

  const slides = buildSlides(data, accentColor);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .slide {
            page-break-after: always;
            height: 100vh;
            display: flex !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2">
        <a
          href={`/media-kit/${data.publisher.slug}`}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Exit slides"
        >
          <XMarkIcon className="w-5 h-5" />
        </a>
        <button
          onClick={handlePrint}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Print / Save as PDF"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Toggle fullscreen"
        >
          <ArrowsPointingOutIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Slide navigation */}
      <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Slide counter */}
      <div className="no-print fixed bottom-4 right-4 z-50 text-white/50 text-sm">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Slides */}
      <div className="relative">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`slide min-h-screen flex items-center justify-center p-8 md:p-16 transition-opacity duration-300 ${
              i === currentSlide ? 'block' : 'hidden print:flex'
            }`}
            style={{
              background: slide.background || `linear-gradient(135deg, ${accentColor}30 0%, #1e293b 100%)`,
            }}
          >
            <div className="max-w-5xl w-full">{slide.content}</div>
          </div>
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="no-print fixed bottom-4 left-4 text-white/30 text-xs">
        Use arrow keys to navigate
      </div>
    </div>
  );
}

// Build slides from data
function buildSlides(data: MediaKitData, accentColor: string) {
  const slides: { content: React.ReactNode; background?: string }[] = [];

  // Slide 1: Title
  slides.push({
    content: (
      <div className="text-center">
        {data.publisher.logoUrl ? (
          <img
            src={data.publisher.logoUrl}
            alt={data.publisher.name}
            className="w-32 h-32 rounded-2xl object-cover mx-auto mb-8 shadow-2xl"
          />
        ) : (
          <div
            className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold mx-auto mb-8 shadow-2xl"
            style={{ backgroundColor: accentColor }}
          >
            {data.publisher.name.charAt(0)}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-bold mb-4">{data.publisher.name}</h1>
        {data.publisher.tagline && (
          <p className="text-2xl md:text-3xl text-white/70">{data.publisher.tagline}</p>
        )}
        <div className="mt-12 text-white/50">Media Kit</div>
      </div>
    ),
  });

  // Slide 2: Key Metrics
  slides.push({
    content: (
      <div>
        <h2 className="text-4xl font-bold mb-12 text-center">At a Glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold" style={{ color: accentColor }}>
              {formatNumber(data.reach.totalFollowers)}
            </div>
            <div className="text-xl text-white/70 mt-2">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold" style={{ color: accentColor }}>
              {data.reach.platforms.length}
            </div>
            <div className="text-xl text-white/70 mt-2">Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold" style={{ color: accentColor }}>
              {data.engagement.averageRate.toFixed(1)}%
            </div>
            <div className="text-xl text-white/70 mt-2">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-emerald-400">
              +{data.growth.growth30d.percentage.toFixed(0)}%
            </div>
            <div className="text-xl text-white/70 mt-2">Growth</div>
          </div>
        </div>
      </div>
    ),
  });

  // Slide 3: Platforms
  slides.push({
    content: (
      <div>
        <h2 className="text-4xl font-bold mb-12 text-center">Platform Reach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {data.reach.platforms.map((platform) => (
            <div
              key={platform.platform}
              className="flex items-center gap-6 p-6 bg-white/10 rounded-2xl"
            >
              <div className="text-5xl">{PLATFORM_ICONS[platform.platform] || '📱'}</div>
              <div className="flex-1">
                <div className="text-2xl font-bold capitalize">{platform.platform}</div>
                {platform.handle && <div className="text-white/50">@{platform.handle}</div>}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatNumber(platform.followers)}</div>
                <div className="text-white/50">{platform.engagementRate.toFixed(1)}% eng</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  });

  // Slide 4: Audience Demographics
  slides.push({
    content: (
      <div>
        <h2 className="text-4xl font-bold mb-12 text-center">Our Audience</h2>
        <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Languages */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Languages</h3>
            {data.demographics.topLanguages.map((lang) => (
              <div key={lang.language} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-lg">{lang.language}</span>
                  <span className="font-bold">{lang.percentage}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Communities */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Communities</h3>
            {data.demographics.topEthnicities.map((eth) => (
              <div key={eth.ethnicity} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-lg">{eth.ethnicity}</span>
                  <span className="font-bold">{eth.percentage}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-400"
                    style={{ width: `${eth.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  });

  // Slide 5: Income & Coverage
  slides.push({
    content: (
      <div>
        <h2 className="text-4xl font-bold mb-12 text-center">Income Levels & Coverage</h2>
        <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Income */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Income Distribution</h3>
            {[
              { label: 'Very Low Income', value: data.demographics.incomeDistribution.veryLow },
              { label: 'Low Income', value: data.demographics.incomeDistribution.low },
              { label: 'Moderate', value: data.demographics.incomeDistribution.moderate },
              { label: 'Above Moderate', value: data.demographics.incomeDistribution.aboveModerate },
            ].map((item) => (
              <div key={item.label} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-lg">{item.label}</span>
                  <span className="font-bold">{item.value}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Geographic */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Geographic Coverage</h3>
            {data.geography.isCitywide ? (
              <div className="text-center py-8">
                <div className="text-8xl mb-4">🌉</div>
                <div className="text-2xl font-bold">Citywide</div>
                <p className="text-white/70 mt-2">All SF neighborhoods</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.geography.neighborhoods.slice(0, 8).map((hood) => (
                  <span
                    key={hood}
                    className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium capitalize"
                  >
                    {hood.replace(/_/g, ' ')}
                  </span>
                ))}
                {data.geography.neighborhoods.length > 8 && (
                  <span className="px-4 py-2 text-white/50">
                    +{data.geography.neighborhoods.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
  });

  // Slide 6: Growth
  slides.push({
    content: (
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-12">Growth & Momentum</h2>
        <div className="text-9xl font-bold text-emerald-400 mb-4">
          +{data.growth.growth30d.percentage.toFixed(0)}%
        </div>
        <div className="text-3xl text-white/70 mb-12">30-Day Growth Rate</div>

        <div className="flex justify-center gap-16">
          <div>
            <div className="text-4xl font-bold">+{formatNumber(data.growth.growth30d.followers)}</div>
            <div className="text-white/50">New followers</div>
          </div>
          <div>
            <div className="text-4xl font-bold capitalize flex items-center gap-2">
              {data.growth.trend === 'accelerating' && '🚀'}
              {data.growth.trend === 'steady' && '📈'}
              {data.growth.trend}
            </div>
            <div className="text-white/50">Trend</div>
          </div>
        </div>

        {data.growth.badges.length > 0 && (
          <div className="mt-12 flex justify-center gap-4">
            {data.growth.badges.map((badge, i) => (
              <span
                key={i}
                className="px-6 py-2 bg-white/10 rounded-full text-lg font-medium"
              >
                ⭐ {badge.type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
  });

  // Slide 7: CTA
  slides.push({
    content: (
      <div className="text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-8">
          Partner with {data.publisher.name}
        </h2>
        <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
          Reach engaged audiences in San Francisco through authentic community media.
        </p>

        <div className="flex flex-col items-center gap-4">
          {data.contact.bookingUrl && (
            <a
              href={data.contact.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-4 text-xl font-semibold rounded-xl shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              Book a Call
            </a>
          )}
          {data.contact.email && (
            <a
              href={`mailto:${data.contact.email}`}
              className="text-xl text-white/70 hover:text-white transition-colors"
            >
              {data.contact.email}
            </a>
          )}
        </div>

        <div className="mt-16 text-white/30">
          <img
            src="/resonate-logo-white.svg"
            alt="Resonate"
            className="h-8 mx-auto opacity-50"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="mt-2">Powered by Resonate</div>
        </div>
      </div>
    ),
    background: `linear-gradient(135deg, ${accentColor}40 0%, #1e293b 100%)`,
  });

  return slides;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}
