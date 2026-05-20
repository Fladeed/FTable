'use client';

import { useState } from 'react';
import { PrioritySection } from './sections/PrioritySection/PrioritySection';
import { CardSection } from './sections/CardSection/CardSection';
import { StickyToolbarSection } from './sections/StickyToolbarSection/StickyToolbarSection';
import { InfiniteScrollSection } from './sections/InfiniteScrollSection/InfiniteScrollSection';
import './ResponsiveDemo.css';

type TabId = 'priority' | 'card' | 'sticky' | 'infinite';

interface TabConfig {
  id: TabId;
  label: string;
  description: string;
  props: string[];
}

const TABS: TabConfig[] = [
  {
    id: 'priority',
    label: 'Column priority',
    description:
      'Below the configurable mobileBreakpoint (default 640px), columns whose priority is strictly less than mobileColumnPriority (default 2) are hidden. Resize the window to watch low-priority columns drop out and reappear.',
    props: ['mobileBreakpoint', 'mobileColumnPriority', 'ColumnDef.priority'],
  },
  {
    id: 'card',
    label: 'Card view',
    description:
      'Switch row rendering to a stacked card layout on mobile. The default card auto-derives header: value rows from the visible columns; pass renderCard for full control. showViewToggle adds a toolbar icon so the user can flip table ↔ cards at any width.',
    props: ['mobileVariant="card"', 'renderCard', 'showViewToggle'],
  },
  {
    id: 'sticky',
    label: 'Sticky toolbar',
    description:
      'Pin the toolbar (filter bar + bulk-action bar + view toggle) to the top of the nearest scrolling parent. Scroll inside the bordered area below — the toolbar stays visible.',
    props: ['stickyToolbar'],
  },
  {
    id: 'infinite',
    label: 'Infinite scroll',
    description:
      'In request mode, mobile pagination is automatically replaced by sentinel-driven infinite scroll. Rows accumulate as you scroll; sort/filter changes reset to page 1. Resize narrow and scroll inside the area below — 120 sample orders, 10 per page.',
    props: ['request', 'infiniteScrollLabels', 'renderInfiniteScrollLoading'],
  },
];

const SECTIONS: Record<TabId, () => React.ReactElement> = {
  priority: PrioritySection,
  card: CardSection,
  sticky: StickyToolbarSection,
  infinite: InfiniteScrollSection,
};

export function ResponsiveDemo() {
  const [activeTab, setActiveTab] = useState<TabId>('priority');
  const tab = TABS.find((t) => t.id === activeTab)!;
  const ActiveSection = SECTIONS[activeTab];

  return (
    <main className="rd-page demo-page-shell">
      <h1 className="rd-title">Responsive Primitives</h1>
      <p className="rd-intro">
        Opt-in primitives for phone-width screens: column priority, stacked card view, sticky
        toolbar, mobile filters sheet, infinite scroll, view toggle, and 44 px touch targets.
        All defaults are backward-compatible — existing consumers see no change.
      </p>

      <div className="rd-tabs" role="tablist" aria-label="Responsive primitives">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            className={`rd-tab${activeTab === id ? ' rd-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rd-info" role="tabpanel">
        <p className="rd-info__desc">{tab.description}</p>
        <div className="rd-info__props">
          <span className="rd-info__label">Props:</span>
          {tab.props.map((p) => (
            <code key={p} className="rd-info__prop">{p}</code>
          ))}
        </div>
      </div>

      <ActiveSection />
    </main>
  );
}
