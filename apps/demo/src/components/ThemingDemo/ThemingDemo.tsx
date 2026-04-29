'use client';

import { useState } from 'react';
import { FloTable } from 'flotable';
import type { FloTableRequestParams, FloTableStyleValue } from 'flotable';
import { ALL_DATA, COLUMNS, PAGE_SIZE, type Employee } from '../StyleCustomization/StyleCustomizationDemoData';
import '../StyleCustomization/StyleCustomization.css';
import './ThemingDemo.css';

async function fetchData({ page, pageSize }: FloTableRequestParams<Employee>) {
  const start = (page - 1) * pageSize;
  return { data: ALL_DATA.slice(start, start + pageSize), totalRows: ALL_DATA.length };
}

type TabId = 'plain' | 'shadcn' | 'tailwind' | 'override';

interface TabConfig {
  id: TabId;
  label: string;
  description: string;
  /** Class applied to the wrapper div around the table — sets the host theme tokens. */
  wrapperClass?: string;
  /** Override styles passed directly to FloTable — only used by the "override" tab. */
  flotableStyles?: Record<string, string>;
  /** Optional code preview to show beneath the table. */
  code?: string;
}

const TABS: TabConfig[] = [
  {
    id: 'plain',
    label: 'Plain',
    description:
      'A bare <FloTable> with no styles prop and no parent tokens. The table picks up the demo app’s background/foreground via the alias chain, so toggling the global theme switcher (top right) flips it automatically — Layer 2 in action.',
  },
  {
    id: 'shadcn',
    label: 'shadcn / ui',
    description:
      'A parent div sets shadcn-style tokens (--background, --foreground, --primary, --border, --accent, --muted, --ring, --radius). The <FloTable> inside has zero styles prop — every color comes from those tokens via Layer 1’s alias chain. Dark variants swap automatically with the global toggle.',
    wrapperClass: 'theming-shadcn',
    code: `.theming-shadcn {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.22 260);
  --border: oklch(0.92 0 0);
  --accent: oklch(0.96 0.01 260);
  --muted: oklch(0.97 0 0);
  --ring: oklch(0.55 0.22 260 / 0.25);
  --radius: 0.5rem;
}
[data-theme="dark"] .theming-shadcn {
  --background: oklch(0.18 0 0);
  --foreground: oklch(0.96 0 0);
  --border: oklch(0.32 0 0);
  --accent: oklch(0.28 0.02 260);
  --muted: oklch(0.24 0 0);
}`,
  },
  {
    id: 'tailwind',
    label: 'Tailwind v4',
    description:
      'Same idea, different naming convention. Tailwind v4’s @theme block exposes tokens as --color-background, --color-foreground, etc. The wrapper sets those, the table picks them up. Try toggling dark mode — the alias chain’s dark defaults activate, and any custom dark Tailwind tokens win on top.',
    wrapperClass: 'theming-tailwind',
    code: `.theming-tailwind {
  --color-background: #fdf6ec;
  --color-foreground: #1c1208;
  --color-primary: #c8844a;
  --color-border: #e7d8c3;
  --color-accent: #f3e7d3;
  --color-muted: #f8f1e3;
  --color-ring: rgba(200, 132, 74, 0.3);
  --radius: 0.5rem;
}
[data-theme="dark"] .theming-tailwind {
  --color-background: #1a120b;
  --color-foreground: #f5e9d2;
  --color-border: #4a3520;
  --color-accent: #2d1f12;
  --color-muted: #25190f;
}`,
  },
  {
    id: 'override',
    label: 'Escape hatch',
    description:
      'If you want full control, the existing styles / classNames API still works. Anything you set as --flotable-* beats every entry in the alias chain — no regressions for existing themes.',
    flotableStyles: {
      '--flotable-bg': '#0f172a',
      '--flotable-color': '#e2e8f0',
      '--flotable-border-color': '#334155',
      '--flotable-header-bg': '#1e293b',
      '--flotable-row-hover-bg': '#1e293b',
      '--flotable-link-color': '#60a5fa',
      '--flotable-muted-color': '#94a3b8',
    },
  },
];

export function ThemingDemo() {
  const [activeId, setActiveId] = useState<TabId>('plain');
  const tab = TABS.find((t) => t.id === activeId)!;

  return (
    <main className="theming demo-page-shell">
      <h1 className="theming__title">Theming</h1>

      <p className="theming__intro">
        FloTable adapts to your app&apos;s theme automatically. There are three layers,
        and most of the time you don&apos;t need to write any styling code at all.
      </p>

      <ol className="theming__layers">
        <li>
          <strong>Layer 1 — Ecosystem auto-pickup.</strong> Every core color/typography
          token (background, foreground, border, primary, etc.) resolves through a chain
          that includes well-known names from shadcn (<code>--background</code>,{' '}
          <code>--foreground</code>, <code>--primary</code>…), Tailwind v4 (
          <code>--color-background</code>, <code>--color-foreground</code>…), and MUI
          CSS variables (<code>--mui-palette-*</code>). If your app already defines those,
          the table picks them up — no <code>styles</code> prop needed.
        </li>
        <li>
          <strong>Layer 2 — Built-in dark mode.</strong> The table flips to dark
          automatically when any common selector is present on an ancestor:{' '}
          <code>.dark</code>, <code>[data-theme=&quot;dark&quot;]</code>,{' '}
          <code>[data-mode=&quot;dark&quot;]</code>, or the OS preference. Use the toggle
          in the top right to switch the whole demo app.
        </li>
        <li>
          <strong>Layer 3 — Adapter components</strong> for Antd / MUI when their tokens
          live in JS instead of CSS variables. <em>(Shipping next.)</em>
        </li>
      </ol>

      {/* Tab bar — same shape as StyleCustomization for visual consistency */}
      <div className="sc-tabs" role="tablist" aria-label="Theming examples">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeId === t.id}
            className={`sc-tab${activeId === t.id ? ' sc-tab--active' : ''}`}
            onClick={() => setActiveId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sc-info" role="tabpanel">
        <p className="sc-info__desc">{tab.description}</p>
      </div>

      <div className={`theming__demo${tab.wrapperClass ? ` ${tab.wrapperClass}` : ''}`}>
        <FloTable
          columns={COLUMNS}
          request={fetchData}
          pageSize={PAGE_SIZE}
          styles={tab.flotableStyles ? { wrapper: tab.flotableStyles as FloTableStyleValue } : undefined}
        />
      </div>

      {tab.code && <pre className="theming__code">{tab.code}</pre>}
    </main>
  );
}
