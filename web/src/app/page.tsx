import { PagePane } from '@/shared/ui';
import { ScreenFrame } from '@/shell';

export default function LibraryPage() {
  return (
    <ScreenFrame screenKey="library" depth={0} section="library" title="Library" hasLargeTitle>
      <PagePane name="library">{null}</PagePane>
    </ScreenFrame>
  );
}
