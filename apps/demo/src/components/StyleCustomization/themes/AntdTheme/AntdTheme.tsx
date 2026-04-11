'use client';

import type { FTableStyleValue } from 'ftable';
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
    '--ftable-border-color: #f0f0f0',
    '--ftable-header-bg: #fafafa',
    '--ftable-sort-active-color: #1677ff',
    '--ftable-row-hover-bg: rgba(0,0,0,0.02)',
    'classNames.paginationButton: theme-antd__btn',
    '--ftable-pill-active-color: #1677ff',
    '--ftable-pill-active-bg: #e6f4ff',
    '--ftable-pill-radius: 6px',
  ],
  classNames: {
    wrapper: 'theme-antd__wrapper',
    paginationButton: 'theme-antd__btn',
  },
  styles: {
    root: {
      '--ftable-pill-bg': '#ffffff',
      '--ftable-pill-border-color': '#d9d9d9',
      '--ftable-pill-color': 'rgba(0,0,0,0.88)',
      '--ftable-pill-radius': '6px',
      '--ftable-pill-active-color': '#1677ff',
      '--ftable-pill-active-bg': '#e6f4ff',
      '--ftable-pill-active-border-color': '#91caff',
      '--ftable-focus-ring': 'rgba(22,119,255,0.1)',
    } as FTableStyleValue,
    wrapper: {
      border: '1px solid #f0f0f0',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      '--ftable-border-color': '#f0f0f0',
      '--ftable-header-bg': '#fafafa',
      '--ftable-header-hover-bg': '#f0f0f0',
      '--ftable-bg': '#ffffff',
      '--ftable-color': 'rgba(0,0,0,0.88)',
      '--ftable-muted-color': 'rgba(0,0,0,0.45)',
      '--ftable-font-size': '0.875rem',
      '--ftable-sort-active-color': '#1677ff',
      '--ftable-row-hover-bg': 'rgba(0,0,0,0.02)',
    } as FTableStyleValue,
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
