import '@/shared/styles/tokens.css';
import '@/shared/styles/base.css';
import '@/shared/styles/controls.css';
import '@/shared/styles/lists.css';
import '@/shared/styles/shell.css';
import '@/shared/styles/pages.css';
import '@/shared/styles/app.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AppShell } from '@/shell';

export const metadata: Metadata = { title: 'Clipper' };

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell sidebar={null} sidebarFoot={null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
