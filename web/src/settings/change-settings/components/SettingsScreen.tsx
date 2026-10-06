'use client';

import { PagePane } from '@/shared/ui';
import { ScreenFrame } from '@/shell';

import { useSettings } from '../hooks/use-settings';
import { AiServicesSection } from './AiServicesSection';
import { DefaultsSection } from './DefaultsSection';
import { PhoneAccessSection } from './PhoneAccessSection';
import { SelectorMemorySection } from './SelectorMemorySection';
import { StorageSection } from './StorageSection';

export function SettingsScreen() {
  const { settings, choose, saveKey, removeKey, forgetLearned } = useSettings();
  return (
    <ScreenFrame screenKey="settings" depth={0} section="settings" title="Settings" hasLargeTitle>
      <PagePane name="settings">
        {settings === null ? null : (
          <>
            <AiServicesSection settings={settings} choose={choose} saveKey={saveKey} removeKey={removeKey} />
            <DefaultsSection settings={settings} choose={choose} />
            <StorageSection settings={settings} choose={choose} />
            <PhoneAccessSection phoneAddress={settings.phoneAddress} />
            <SelectorMemorySection rejections={settings.rejections} forgetHistory={forgetLearned} />
          </>
        )}
      </PagePane>
    </ScreenFrame>
  );
}
