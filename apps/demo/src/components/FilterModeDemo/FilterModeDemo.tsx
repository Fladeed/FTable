'use client';

import { useState } from 'react';
import { FilterModeTable } from './FilterModeTable/FilterModeTable';
import './FilterModeDemo.css';

type TabId = 'commit' | 'live';

export function FilterModeDemo() {
  const [activeTab, setActiveTab] = useState<TabId>('commit');

  return (
    <main className="fmd-page demo-page-shell">
      <h1 className="fmd-title">Filter Mode</h1>
      <p className="fmd-subtitle">
        The <code>filterMode</code> prop controls when filter changes are committed.
        In <strong>commit</strong> mode (default) the request fires only when you close the pill —
        by pressing Enter, Escape, or clicking away.
        In <strong>live</strong> mode the request fires on every keystroke (debounced 300 ms).
        The global search pill is always live regardless of this setting.
      </p>

      <div className="fmd-tabs" role="tablist" aria-label="Filter mode">
        {(['commit', 'live'] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            className={`fmd-tab${activeTab === id ? ' fmd-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {id === 'commit' ? 'Commit Mode' : 'Live Mode'}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        <p className="fmd-tab-desc">
          {activeTab === 'commit'
            ? 'Type in a filter pill then close it (Enter / Escape / click away) to fire the request. The counter increments once per close.'
            : 'Type in a filter pill and watch the counter increment ~300 ms after each keystroke pause.'}
        </p>
        <FilterModeTable key={activeTab} mode={activeTab} />
      </div>
    </main>
  );
}
