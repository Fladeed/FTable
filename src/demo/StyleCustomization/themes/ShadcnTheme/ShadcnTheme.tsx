'use client';

import type { FTableStyleValue } from '@/components/FTable/FTable.types';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './ShadcnTheme.css';

export const SHADCN_CONFIG: ThemeConfig = {
  label: 'shadcn/ui',
  description:
    'Clean and minimal. A rounded border wraps the whole table, the header text is muted, ' +
    'and row hover is a soft translucent blue-grey. ' +
    'Filter pills inherit the same slate palette via --ftable-pill-* CSS custom properties on styles.root — ' +
    'indigo active state, soft focus ring, and rounded corners that match the wrapper.',
  overrides: [
    'wrapper: border + borderRadius',
    '--ftable-border-color: #e2e8f0',
    '--ftable-header-bg: transparent',
    '--ftable-row-hover-bg: rgba(241,245,249,0.5)',
    'headerCell: fontWeight 500, muted color',
    'paginationButton: outline style',
    '--ftable-pill-active-color: #2563eb',
    '--ftable-pill-active-bg: #eff6ff',
    '--ftable-pill-radius: 0.375rem',
  ],
  classNames: {
    wrapper: 'theme-shadcn__wrapper',
  },
  styles: {
    root: {
      '--ftable-pill-bg': '#ffffff',
      '--ftable-pill-border-color': '#e2e8f0',
      '--ftable-pill-color': '#374151',
      '--ftable-pill-radius': '0.375rem',
      '--ftable-pill-active-color': '#2563eb',
      '--ftable-pill-active-bg': '#eff6ff',
      '--ftable-pill-active-border-color': '#bfdbfe',
      '--ftable-focus-ring': 'rgba(37,99,235,0.15)',
    } as FTableStyleValue,
    wrapper: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      '--ftable-border-color': '#e2e8f0',
      '--ftable-header-bg': 'transparent',
      '--ftable-header-hover-bg': 'rgba(241,245,249,0.4)',
      '--ftable-bg': '#ffffff',
      '--ftable-color': '#0f172a',
      '--ftable-muted-color': '#64748b',
      '--ftable-font-size': '0.875rem',
      '--ftable-row-hover-bg': 'rgba(241,245,249,0.5)',
    } as FTableStyleValue,
    headerCell: {
      height: '2.75rem',
      padding: '0 1rem',
      fontWeight: '500',
      color: '#64748b',
      fontSize: '0.8125rem',
    },
    cell: {
      padding: '0.875rem 1rem',
    },
    pagination: {
      padding: '0.875rem 0.25rem',
      color: '#64748b',
      fontSize: '0.8125rem',
    },
    paginationButton: {
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      padding: '0.375rem 0.875rem',
    },
  },
};

export function ShadcnTheme() {
  return <ThemePreview config={SHADCN_CONFIG} previewClass="sc-preview sc-preview--shadcn" />;
}
