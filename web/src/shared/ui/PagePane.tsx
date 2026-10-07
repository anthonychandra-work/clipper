import type { ReactNode } from 'react';

export function PagePane({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="pane pane--page" data-keep-scroll={name}>
      <div className="page-column">{children}</div>
    </div>
  );
}
