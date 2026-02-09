/**
 * Demo Creative Data
 *
 * Mock ad builder outputs for preview and demonstration.
 * Shows what AI-generated creatives look like across formats and languages.
 *
 * SWAP: Replace with real AI generation calls when demoing with live API keys.
 */

import type { CreativeOutput, CreativeSet, LanguageVariant, CreativeFormat } from '@/lib/ai/creative/types';
import type { Language } from '@/types';

// =============================================================================
// DEMO CREATIVE OUTPUTS
// =============================================================================

export function getDemoCreative(format: CreativeFormat): CreativeOutput {
  switch (format) {
    case 'social_post':
      return getDemoSocialPost();
    case 'display_ad':
      return getDemoDisplayAd();
    case 'newsletter_copy':
      return getDemoNewsletterCopy();
    case 'text_ad':
      return getDemoTextAd();
    case 'story_script':
      return getDemoStoryScript();
    case 'reel_script':
      return getDemoReelScript();
    default:
      return getDemoSocialPost();
  }
}

function getDemoSocialPost(): CreativeOutput {
  return {
    id: 'cr-demo-social-001',
    format: 'social_post',
    language: 'english',
    body: 'Free flu shots are here! 💉 Protect yourself and your familia this season.\n\nNo insurance needed. No appointment needed. No cost.\n\n📍 Mission Neighborhood Health Center\n📍 Southeast Health Center (Bayview)\n📍 Chinatown Public Health Center\n\nWalk in any weekday 9am-5pm through March 15.\n\nYour community. Your health. Your choice.',
    callToAction: 'Find your nearest clinic at sf.gov/flushots',
    hashtags: ['#FluShot', '#SFDPH', '#MissionDistrict', '#FreeVaccines', '#CommunityHealth', '#SaludComunitaria'],
    imagePrompt: 'A diverse group of San Francisco residents smiling in front of a neighborhood health clinic. Warm lighting, community feel. Include visible signage in English and Spanish.',
    characterCount: 398,
    wordCount: 67,
    culturalNotes: [
      'Used "familia" (Spanish) naturally in English text to signal bilingual audience',
      'Listed clinics by neighborhood name rather than address for community recognition',
      'Emphasized "no insurance needed" prominently — critical for undocumented community members',
    ],
    generatedAt: new Date(),
  };
}

function getDemoDisplayAd(): CreativeOutput {
  return {
    id: 'cr-demo-display-001',
    format: 'display_ad',
    language: 'english',
    headline: 'Free Flu Shots. No Insurance Needed.',
    subheadline: 'Walk in to any SF health center through March 15',
    body: 'Protect your family this flu season. Free vaccinations available at neighborhood health centers across San Francisco.',
    callToAction: 'Find a Clinic Near You',
    imagePrompt: 'Clean, modern health-focused graphic with SF skyline silhouette. Blue and white color scheme. Icon of a shield/checkmark. Text overlay area on left third.',
    characterCount: 142,
    wordCount: 24,
    culturalNotes: [
      'Kept headline under 8 words for display ad readability',
      'Used "family" language to resonate across cultures',
    ],
    generatedAt: new Date(),
  };
}

function getDemoNewsletterCopy(): CreativeOutput {
  return {
    id: 'cr-demo-newsletter-001',
    format: 'newsletter_copy',
    language: 'english',
    headline: 'Your Neighborhood Flu Shot Guide',
    preheader: 'Free vaccinations at health centers near you — no appointment or insurance required',
    body: `Flu season is here, and the San Francisco Department of Public Health wants to make sure every resident has access to free protection.

Starting this week, walk-in flu vaccinations are available at neighborhood health centers across the city — no appointment needed, no insurance required, no questions asked.

Here's where to go:

Mission Neighborhood Health Center — 240 Shotwell St.
Open weekdays 9am-5pm, with bilingual staff (English/Spanish)

Southeast Health Center — 2401 Keith St., Bayview
Serving the Bayview and Hunters Point communities

Chinatown Public Health Center — 1490 Mason St.
Cantonese and Mandarin interpretation available

The flu vaccine is safe, effective, and especially important for children, seniors, and people with chronic health conditions. Last year, thousands of San Franciscans were hospitalized with flu complications — most were unvaccinated.

Don't wait for symptoms. Walk in today.`,
    callToAction: 'Visit sf.gov/flushots for all clinic locations and hours',
    characterCount: 842,
    wordCount: 148,
    estimatedReadTime: 45,
    culturalNotes: [
      'Organized by neighborhood to help readers find their nearest clinic',
      'Highlighted language services at each location',
      'Used "no questions asked" to reassure undocumented residents',
      'Included urgency without fear-mongering',
    ],
    generatedAt: new Date(),
  };
}

function getDemoTextAd(): CreativeOutput {
  return {
    id: 'cr-demo-text-001',
    format: 'text_ad',
    language: 'english',
    headline: 'Free Flu Shots in SF',
    body: 'Walk-in vaccinations at neighborhood health centers. No insurance or appointment needed. Protect your family today.',
    callToAction: 'Find Clinics',
    characterCount: 130,
    wordCount: 22,
    generatedAt: new Date(),
  };
}

function getDemoStoryScript(): CreativeOutput {
  return {
    id: 'cr-demo-story-001',
    format: 'story_script',
    language: 'english',
    body: 'A 4-slide story sequence promoting flu vaccinations',
    scenes: [
      { order: 1, visual: 'Bold text on gradient background', text: 'Flu season is HERE 🤧', duration: 3, transition: 'fade' },
      { order: 2, visual: 'Photo of smiling family at health center', text: 'Free shots. No insurance needed.', duration: 4, transition: 'swipe' },
      { order: 3, visual: 'Map showing 3 clinic locations', text: 'Walk in today at a clinic near you', duration: 4, transition: 'swipe' },
      { order: 4, visual: 'CTA with swipe-up link', text: 'Swipe up for clinic hours & locations ☝️', duration: 3, transition: 'fade' },
    ],
    characterCount: 180,
    wordCount: 35,
    estimatedReadTime: 14,
    generatedAt: new Date(),
  };
}

function getDemoReelScript(): CreativeOutput {
  return {
    id: 'cr-demo-reel-001',
    format: 'reel_script',
    language: 'english',
    body: `[0:00-0:03] HOOK: Close-up of someone rolling up their sleeve
Text overlay: "Getting my free flu shot in SF 💉"

[0:03-0:08] Show walking into a bright, welcoming health center
Voiceover: "No appointment. No insurance. Just walk in."

[0:08-0:15] Quick cuts of diverse SF residents getting vaccinated, smiling
Background music: upbeat, community feel

[0:15-0:22] Show a map with clinic locations popping up
Text overlay: "Mission • Bayview • Chinatown • and more"

[0:22-0:28] End on a warm group shot outside the clinic
Text overlay: "Protect your community. Get your free flu shot."
CTA: "Link in bio for all locations"`,
    callToAction: 'Link in bio for clinic locations',
    characterCount: 520,
    wordCount: 92,
    estimatedReadTime: 28,
    culturalNotes: [
      'Opens with relatable personal perspective rather than institutional messaging',
      'Shows diversity of SF residents naturally, not tokenistically',
      'Highlights neighborhoods by name for community connection',
    ],
    generatedAt: new Date(),
  };
}

// =============================================================================
// DEMO LANGUAGE VARIANTS
// =============================================================================

export function getDemoLanguageVariants(): LanguageVariant[] {
  return [
    {
      language: 'english',
      creative: getDemoSocialPost(),
      isOriginal: true,
      culturalAdaptation: 'Original English version',
    },
    {
      language: 'spanish',
      creative: {
        ...getDemoSocialPost(),
        id: 'cr-demo-social-es',
        language: 'spanish' as Language,
        body: '¡Vacunas gratis contra la gripe! 💉 Protege a tu familia esta temporada.\n\nSin seguro médico. Sin cita. Sin costo.\n\n📍 Centro de Salud de la Misión\n📍 Centro de Salud del Sureste (Bayview)\n📍 Centro de Salud Pública de Chinatown\n\nVen de lunes a viernes, 9am-5pm, hasta el 15 de marzo.\n\nTu comunidad. Tu salud. Tu decisión.',
        callToAction: 'Encuentra tu clínica más cercana en sf.gov/flushots',
        hashtags: ['#VacunaGripe', '#SFDPH', '#LaMisión', '#VacunasGratis', '#SaludComunitaria'],
      },
      isOriginal: false,
      culturalAdaptation: 'Full Spanish adaptation using natural Mexican/Central American Spanish common in the Mission. Used "familia" and "comunidad" — values central to Latino culture. Translated clinic names to their commonly-used Spanish equivalents. Maintained warm, inclusive tone.',
    },
    {
      language: 'chinese_cantonese',
      creative: {
        ...getDemoSocialPost(),
        id: 'cr-demo-social-zh',
        language: 'chinese_cantonese' as Language,
        body: '免費流感疫苗接種！💉 保護你同你嘅家人。\n\n唔需要保險。唔需要預約。完全免費。\n\n📍 華埠公共衛生中心\n📍 東南區健康中心（灣景區）\n📍 米慎區健康中心\n\n星期一至五 朝早9點至下晝5點，直到3月15號。\n\n你嘅社區。你嘅健康。你嘅選擇。',
        callToAction: '去 sf.gov/flushots 搵你附近嘅診所',
        hashtags: ['#流感疫苗', '#SFDPH', '#華埠', '#免費疫苗'],
      },
      isOriginal: false,
      culturalAdaptation: 'Adapted to written Cantonese (口語化) rather than formal written Chinese, matching how Chinatown residents actually communicate. Prioritized Chinatown clinic location first. Used colloquial Cantonese particles (嘅, 唔, 同) for authenticity.',
    },
  ];
}

// =============================================================================
// DEMO CREATIVE SET (complete example)
// =============================================================================

export function getDemoCreativeSet(): CreativeSet {
  return {
    id: 'cs-demo-001',
    brief: {
      campaignName: 'Flu Shot Awareness 2026',
      campaignDescription: 'Promote free flu vaccination clinics across SF',
      objectives: ['Drive walk-in visits', 'Reach non-English speakers', 'Build community trust'],
      audienceDescription: 'Latino, Chinese, and Filipino families in Mission, Bayview, and Chinatown',
      targetLanguages: ['english', 'spanish', 'chinese_cantonese'],
      targetNeighborhoods: ['Mission', 'Chinatown', 'Bayview'],
      targetCommunities: ['Latino', 'Chinese', 'Filipino'],
      tone: 'empathetic',
      keyMessages: ['Free', 'No insurance needed', 'Walk-in', 'Neighborhood clinics'],
      callToAction: 'Visit sf.gov/flushots',
      format: 'social_post',
      publisherName: 'El Tecolote',
      publisherVoice: 'Warm, bilingual, community-centered',
      publisherAudience: 'Latino families in the Mission District',
    },
    variants: getDemoLanguageVariants(),
    primaryLanguage: 'english',
    createdAt: new Date(),
  };
}
