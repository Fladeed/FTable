'use client';

import type { FloTableStyleValue } from 'flotable';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './AntdTheme.css';

export const ANTD_CONFIG: ThemeConfig = {
  label: 'Ant Design',
  description:
    'The classic Ant Design 5 table. A fine 1px border (#f0f0f0) wraps the table and ' +
    'separates every row. The header sits on a light-grey background (#fafafa). ' +
    'The Ant Blue (#1677ff) marks active sort columns and filter pills. ' +
    'Pagination buttons shift border and text to blue on hover — this requires ' +
    'classNames.paginationButton because color + border-color cannot be set via inline styles.',
  overrides: [
    'wrapper: border 1px solid #f0f0f0',
    '--flotable-border-color: #f0f0f0',
    '--flotable-header-bg: #fafafa',
    '--flotable-sort-active-color: #1677ff',
    '--flotable-row-hover-bg: rgba(0,0,0,0.02)',
    'classNames.paginationButton: theme-antd__btn',
    '--flotable-pill-active-color: #1677ff',
    '--flotable-pill-active-bg: #e6f4ff',
    '--flotable-pill-radius: 6px',
  ],
  classNames: {
    wrapper: 'theme-antd__wrapper',
    paginationButton: 'theme-antd__btn',
  },
  styles: {
    root: {
      '--flotable-pill-bg': '#ffffff',
      '--flotable-pill-border-color': '#d9d9d9',
      '--flotable-pill-color': 'rgba(0,0,0,0.88)',
      '--flotable-pill-radius': '6px',
      '--flotable-pill-active-color': '#1677ff',
      '--flotable-pill-active-bg': '#e6f4ff',
      '--flotable-pill-active-border-color': '#91caff',
      '--flotable-focus-ring': 'rgba(22,119,255,0.1)',
    } as FloTableStyleValue,
    wrapper: {
      border: '1px solid #f0f0f0',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      '--flotable-border-color': '#f0f0f0',
      '--flotable-header-bg': '#fafafa',
      '--flotable-header-hover-bg': '#f0f0f0',
      '--flotable-bg': '#ffffff',
      '--flotable-color': 'rgba(0,0,0,0.88)',
      '--flotable-muted-color': 'rgba(0,0,0,0.45)',
      '--flotable-font-size': '0.875rem',
      '--flotable-sort-active-color': '#1677ff',
      '--flotable-row-hover-bg': 'rgba(0,0,0,0.02)',
    } as FloTableStyleValue,
    headerCell: {
      padding: '0.75rem 1rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      color: 'rgba(0,0,0,0.88)',
    },
    cell: {
      padding: '0.75rem 1rem',
    },
    pagination: {
      padding: '1rem 0.25rem',
      color: 'rgba(0,0,0,0.45)',
      fontSize: '0.875rem',
    },
    paginationButton: {
      border: '1px solid #d9d9d9',
      borderRadius: '0.375rem',
      backgroundColor: '#ffffff',
      color: 'rgba(0,0,0,0.88)',
      padding: '0.25rem 0.875rem',
      fontSize: '0.875rem',
      transition: 'color 0.2s, border-color 0.2s',
    },
  },
};

export function AntdTheme() {
  return <ThemePreview config={ANTD_CONFIG} previewClass="sc-preview sc-preview--antd" />;
}
