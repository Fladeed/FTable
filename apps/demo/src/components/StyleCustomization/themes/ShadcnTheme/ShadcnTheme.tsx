'use client';

import type { FloTableStyleValue } from 'flotable';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './ShadcnTheme.css';

export const SHADCN_CONFIG: ThemeConfig = {
  label: 'shadcn/ui',
  description:
    'Clean and minimal. A rounded border wraps the whole table, the header text is muted, ' +
    'and row hover is a soft translucent blue-grey. ' +
    'Filter pills inherit the same slate palette via --flotable-pill-* CSS custom properties on styles.root — ' +
    'indigo active state, soft focus ring, and rounded corners that match the wrapper.',
  overrides: [
    'wrapper: border + borderRadius',
    '--flotable-border-color: #e2e8f0',
    '--flotable-header-bg: transparent',
    '--flotable-row-hover-bg: rgba(241,245,249,0.5)',
    'headerCell: fontWeight 500, muted color',
    'paginationButton: outline style',
    '--flotable-pill-active-color: #2563eb',
    '--flotable-pill-active-bg: #eff6ff',
    '--flotable-pill-radius: 0.375rem',
  ],
  classNames: {
    wrapper: 'theme-shadcn__wrapper',
  },
  styles: {
    root: {
      '--flotable-pill-bg': '#ffffff',
      '--flotable-pill-border-color': '#e2e8f0',
      '--flotable-pill-color': '#374151',
      '--flotable-pill-radius': '0.375rem',
      '--flotable-pill-active-color': '#2563eb',
      '--flotable-pill-active-bg': '#eff6ff',
      '--flotable-pill-active-border-color': '#bfdbfe',
      '--flotable-focus-ring': 'rgba(37,99,235,0.15)',
    } as FloTableStyleValue,
    wrapper: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      '--flotable-border-color': '#e2e8f0',
      '--flotable-header-bg': 'transparent',
      '--flotable-header-hover-bg': 'rgba(241,245,249,0.4)',
      '--flotable-bg': '#ffffff',
      '--flotable-color': '#0f172a',
      '--flotable-muted-color': '#64748b',
      '--flotable-font-size': '0.875rem',
      '--flotable-row-hover-bg': 'rgba(241,245,249,0.5)',
    } as FloTableStyleValue,
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
