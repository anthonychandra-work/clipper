import type { ReactNode } from 'react';

const SHAPES = {
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  'chevron-right': <path d="M9 5l7 7-7 7" />,
  'chevron-up-down': <path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  checkmark: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  xmark: <path d="M6 6l12 12M18 6L6 18" />,
  sidebar: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3.5" />
      <path d="M9.5 5v14" />
    </>
  ),
  library: (
    <>
      <rect x="4" y="8.5" width="16" height="11.5" rx="3" />
      <path d="M7 4.5h10" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M18 7h2M4 12h2M11 12h9M4 17h7M16 17h4" />
      <circle cx="15.5" cy="7" r="2.2" />
      <circle cx="8.5" cy="12" r="2.2" />
      <circle cx="13.5" cy="17" r="2.2" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5l8.5 14.5h-17z" />
      <path d="M12 10v4" />
      <path d="M12 16.6v.1" />
    </>
  ),
  ellipsis: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="3.2" />,
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5" />
    </>
  ),
  chart: <path d="M5 19v-8M10 19V5M15 19v-6M20 19V8" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof SHAPES;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {SHAPES[name]}
    </svg>
  );
}
