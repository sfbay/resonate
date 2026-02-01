/**
 * Media Kit Slides View
 *
 * Presentation-ready slide deck format for the media kit.
 * Designed to be printed or presented full-screen.
 */

import { notFound } from 'next/navigation';
import { getMediaKitDataBySlug } from '@/lib/media-kit';
import { SlidesView } from './SlidesView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getMediaKitDataBySlug(slug);

  if (!data) {
    return { title: 'Media Kit Not Found' };
  }

  return {
    title: `${data.publisher.name} - Presentation | Resonate`,
    description: `Presentation deck for ${data.publisher.name}`,
  };
}

export default async function SlidesPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getMediaKitDataBySlug(slug);

  if (!data) {
    notFound();
  }

  return <SlidesView data={data} />;
}
