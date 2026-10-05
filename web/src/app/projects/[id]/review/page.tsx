import { ProjectScreen } from '@/project';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectScreen projectId={id} tab="review" />;
}
