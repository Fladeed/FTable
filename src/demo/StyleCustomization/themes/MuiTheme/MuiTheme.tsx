'use client';

import type { FTableStyleValue } from '@/components/FTable/FTable.types';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './MuiTheme.css';

export const MUI_CONFIG: ThemeConfig = {
  label: 'Material UI',
  description:
    'Material UI Paper-elevated table. No outer border — just a subtle elevation shadow on ' +
    'the wrapper and 1px row dividers (rgba(224,224,224,1)). ' +
    'Column headers are bold. The MUI primary blue (#1976d2) highlights sorted columns and active filters. ' +
    'Filter pills use MUI chip style: filled #e0e0e0 background, pill-shaped (border-radius 1rem), ' +
    'blue active state — all via --ftable-pill-* on styles.root.',
  overrides: [
    'wrapper: boxShadow (MUI elevation-1)',
    '--ftable-border-color: rgba(224,224,224,1)',
    '--ftable-sort-active-color: #1976d2',
    '--ftable-row-hover-bg: rgba(0,0,0,0.04)',
    'headerCell: fontWeight 700',
    'classNames.paginationButton: theme-mui__btn',
    '--ftable-pill-bg: #e0e0e0',
    '--ftable-pill-radius: 1rem',
    '--ftable-pill-active-color: #1976d2',
    '--ftable-pill-active-bg: rgba(25,118,210,0.1)',
  ],
  classNames: {
    wrapper: 'theme-mui__wrapper',
    paginationButton: 'theme-mui__btn',
  },
  styles: {
    root: {
      '--ftable-pill-bg': '#e0e0e0',
      '--ftable-pill-border-color': 'transparent',
      '--ftable-pill-color': 'rgba(0,0,0,0.87)',
      '--ftable-pill-radius': '1rem',
      '--ftable-pill-active-color': '#1976d2',
      '--ftable-pill-active-bg': 'rgba(25,118,210,0.1)',
      '--ftable-pill-active-border-color': 'transparent',
      '--ftable-focus-ring': 'rgba(25,118,210,0.12)',
    } as FTableStyleValue,
    wrapper: {
      boxShadow:
        '0px 2px 1px -1px rgba(0,0,0,0.2),' +
        '0px 1px 1px 0px rgba(0,0,0,0.14),' +
        '0px 1px 3px 0px rgba(0,0,0,0.12)',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      '--ftable-border-color': 'rgba(224,224,224,1)',
      '--ftable-header-bg': '#ffffff',
      '--ftable-header-hover-bg': 'rgba(0,0,0,0.04)',
      '--ftable-bg': '#ffffff',
      '--ftable-color': 'rgba(0,0,0,0.87)',
      '--ftable-muted-color': 'rgba(0,0,0,0.6)',
      '--ftable-font-size': '0.875rem',
      '--ftable-sort-active-color': '#1976d2',
      '--ftable-row-hover-bg': 'rgba(0,0,0,0.04)',
    } as FTableStyleValue,
    headerCell: {
      padding: '1rem',
      fontWeight: '700',
      fontSize: '0.875rem',
      color: 'rgba(0,0,0,0.87)',
    },
    cell: {
      padding: '1rem',
    },
    pagination: {
      padding: '0.75rem 0.25rem',
      color: 'rgba(0,0,0,0.6)',
      fontSize: '0.875rem',
    },
    paginationButton: {
      border: 'none',
      borderRadius: '0.25rem',
      backgroundColor: 'transparent',
      color: '#1976d2',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
  },
};

export function MuiTheme() {
  return <ThemePreview config={MUI_CONFIG} previewClass="sc-preview sc-preview--mui" />;
}
