import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GuideDocView from '@/components/guide-doc-view';
import { getGuideDoc, guideDocs } from '@/lib/guides';

export function generateStaticParams() {
  return guideDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getGuideDoc(slug);

  if (!doc) {
    return { title: '공략을 찾을 수 없음 | pokowiki' };
  }

  return {
    title: `${doc.title} | pokowiki`,
    description: doc.shortDescription,
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getGuideDoc(slug);

  if (!doc) {
    notFound();
  }

  return <GuideDocView doc={doc} />;
}
