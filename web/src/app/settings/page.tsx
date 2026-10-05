import { PagePane } from '@/shared/ui';
import { ScreenFrame } from '@/shell';

export default function SettingsPage() {
  return (
    <ScreenFrame screenKey="settings" depth={0} section="settings" title="Settings" hasLargeTitle>
      <PagePane name="settings">{null}</PagePane>
    </ScreenFrame>
  );
}
