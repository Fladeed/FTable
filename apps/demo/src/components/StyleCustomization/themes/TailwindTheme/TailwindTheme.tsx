'use client';

import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './TailwindTheme.css';

export const TAILWIND_CONFIG: ThemeConfig = {
  label: 'Tailwind CSS',
  description:
    'Pure Tailwind utility classes applied directly to each table slot — no CSS variables, ' +
    'no inline styles. Background, text colour, border, spacing and hover states are all ' +
    'expressed with standard utility classes on the slot that owns the element.',
  overrides: [
    'table: bg-white text-[#1e1b4b] text-sm',
    'header: bg-indigo-50',
    'headerCell: text-indigo-700 border-b-2 border-indigo-200 hover:bg-indigo-100',
    'row: border-b border-indigo-100 hover:bg-indigo-50',
    'wrapper: rounded-xl border-indigo-200 shadow-sm',
    'filterPill: rounded-full border-indigo-200 bg-indigo-50',
    'paginationButton: rounded-full border-indigo-200',
  ],
  classNames: {
    // Scroll wrapper: indigo border, rounded corners, shadow
    wrapper: 'rounded-xl border border-indigo-200 overflow-hidden shadow-sm',
    // Table element: white background, deep indigo text, base font size
    table: 'bg-white text-[#1e1b4b] text-sm',
    // <thead>: indigo-tinted background
    header: 'bg-indigo-50',
    // Each <th>: indigo text, bold uppercase label, indigo bottom border
    headerCell: 'text-indigo-700 text-xs font-semibold uppercase tracking-wide border-b-2 border-indigo-200 hover:bg-indigo-100',
    // Each <tr>: subtle indigo bottom divider + hover highlight
    row: 'border-b border-indigo-100 hover:bg-indigo-50',
    // Pagination container
    pagination: 'text-indigo-400 text-xs',
    // Prev / Next buttons: pill shape, indigo palette
    paginationButton: 'rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50',
    // Filter bar: add some bottom spacing
    filterBar: 'flex flex-wrap gap-2 pb-3',
    // Each pill container: indigo palette, pill shape
    filterPill: 'rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium',
    // Pill trigger button
    filterPillTrigger: 'text-indigo-700 font-medium',
    // Pill input / select: indigo text, transparent background
    filterPillInput: 'text-indigo-900 bg-transparent border-none outline-none text-xs',
  },
  styles: {},
};

export function TailwindTheme() {
  return <ThemePreview config={TAILWIND_CONFIG} previewClass="sc-preview sc-preview--tailwind" />;
}
