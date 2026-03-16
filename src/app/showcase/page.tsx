import type { Metadata } from 'next';
import ShowcaseClient from '@/components/showcase-client';
import showcaseData from '@/data/showcase-data.json';

export const metadata: Metadata = {
  title: '섬 꾸미기 갤러리 | pokowiki',
  description: '포코피아 유저들의 멋진 섬 꾸미기 모음',
};

export default function ShowcasePage() {
  return <ShowcaseClient islands={showcaseData.islands} />;
}
