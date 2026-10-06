import type { ReactNode } from 'react';

import { ProjectScreen } from '@/project';
import { ReviewTab } from '@/review';

interface ReviewLayoutProps {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

export default async function ReviewLayout({ params, children }: ReviewLayoutProps) {
  const { id } = await params;
  return (
    <>
      <ProjectScreen projectId={id} tab="review" reviewTab={<ReviewTab />} />
      {children}
    </>
  );
}
