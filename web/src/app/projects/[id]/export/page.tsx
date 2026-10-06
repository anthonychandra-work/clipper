import { ExportTab } from '@/export';
import { ProjectScreen } from '@/project';

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectScreen projectId={id} tab="export" exportTab={<ExportTab />} />;
}
