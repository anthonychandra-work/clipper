import Link from 'next/link';

import { Icon, type IconName } from '@/shared/ui';

export type Section = 'library' | 'settings';

interface Tab {
  section: Section;
  label: string;
  icon: IconName;
  href: string;
}

const TABS: Tab[] = [
  { section: 'library', label: 'Library', icon: 'library', href: '/' },
  { section: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

export function TabBar({ current }: { current: Section }) {
  return (
    <nav className="tab-bar" aria-label="Sections">
      <div className="tab-bar__pill">
        {TABS.map((tab) => (
          <Link
            key={tab.section}
            className="tab-bar__tab"
            id={`tab-bar-${tab.section}`}
            href={tab.href}
            aria-current={tab.section === current ? 'page' : 'false'}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
