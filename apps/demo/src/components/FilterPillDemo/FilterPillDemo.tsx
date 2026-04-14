'use client';

import { FilterPillDefaultSection } from './FilterPillDefaultSection/FilterPillDefaultSection';
import { FilterPillCustomTriggerSection } from './FilterPillCustomTriggerSection/FilterPillCustomTriggerSection';
import { FilterPillCustomValueSection } from './FilterPillCustomValueSection/FilterPillCustomValueSection';
import './FilterPillDemo.css';

export function FilterPillDemo() {
  return (
    <div className="filter-pill-demo">
      <h1 className="filter-pill-demo__title">Filter Pill</h1>
      <p className="filter-pill-demo__subtitle">
        <code>FilterPill</code> is the building block behind every filter in the bar.
        Use <code>renderTriggerLabel</code> and <code>renderActiveValue</code> to replace the
        default trigger content and active-state display with anything you like.
      </p>
      <FilterPillDefaultSection />
      <FilterPillCustomTriggerSection />
      <FilterPillCustomValueSection />
    </div>
  );
}
