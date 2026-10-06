import '@/shared/styles/tokens.css';
import '@/shared/styles/base.css';
import '@/shared/styles/controls.css';
import '@/shared/styles/lists.css';
import '@/shared/styles/shell.css';
import '@/shared/styles/review.css';
import '@/shared/styles/player.css';
import '@/shared/styles/pages.css';
import '@/shared/styles/app.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SidebarDiskLine, SidebarProjects } from '@/library';
import { AppShell } from '@/shell';

const INTER_FACE = `
  @font-face {
    font-family: Inter;
    src: url(/fonts/inter/InterVariable.ttf);
    font-weight: 100 900;
    font-display: swap;
  }`;

export const metadata: Metadata = { title: 'Clipper' };

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{INTER_FACE}</style>
      </head>
      <body>
        <AppShell sidebar={<SidebarProjects />} sidebarFoot={<SidebarDiskLine />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
