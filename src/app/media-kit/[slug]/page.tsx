/**
 * Media Kit Page
 *
 * Public-facing media kit / sell sheet for publishers.
 * Designed to be shareable, printable, and impressive for city departments.
 */

import { notFound } from 'next/navigation';
import { getMediaKitDataBySlug } from '@/lib/media-kit';
import { MediaKitView } from './MediaKitView';

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
    title: `${data.publisher.name} - Media Kit | Resonate`,
    description: data.publisher.tagline || `Media kit for ${data.publisher.name}`,
    openGraph: {
      title: `${data.publisher.name} Media Kit`,
      description: data.publisher.tagline || `Partner with ${data.publisher.name} to reach their audience`,
      images: data.publisher.coverImageUrl ? [data.publisher.coverImageUrl] : [],
    },
  };
}

export default async function MediaKitPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getMediaKitDataBySlug(slug);

  if (!data) {
    notFound();
  }

  return <MediaKitView data={data} />;
}
