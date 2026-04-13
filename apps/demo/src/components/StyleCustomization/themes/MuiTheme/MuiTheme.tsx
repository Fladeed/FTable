'use client';

import type { FloTableStyleValue } from 'flotable';
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
    'blue active state — all via --flotable-pill-* on styles.root.',
  overrides: [
    'wrapper: boxShadow (MUI elevation-1)',
    '--flotable-border-color: rgba(224,224,224,1)',
    '--flotable-sort-active-color: #1976d2',
    '--flotable-row-hover-bg: rgba(0,0,0,0.04)',
    'headerCell: fontWeight 700',
    'classNames.paginationButton: theme-mui__btn',
    '--flotable-pill-bg: #e0e0e0',
    '--flotable-pill-radius: 1rem',
    '--flotable-pill-active-color: #1976d2',
    '--flotable-pill-active-bg: rgba(25,118,210,0.1)',
  ],
  classNames: {
    wrapper: 'theme-mui__wrapper',
    paginationButton: 'theme-mui__btn',
  },
  styles: {
    root: {
      '--flotable-pill-bg': '#e0e0e0',
      '--flotable-pill-border-color': 'transparent',
      '--flotable-pill-color': 'rgba(0,0,0,0.87)',
      '--flotable-pill-radius': '1rem',
      '--flotable-pill-active-color': '#1976d2',
      '--flotable-pill-active-bg': 'rgba(25,118,210,0.1)',
      '--flotable-pill-active-border-color': 'transparent',
      '--flotable-focus-ring': 'rgba(25,118,210,0.12)',
    } as FloTableStyleValue,
    wrapper: {
      boxShadow:
        '0px 2px 1px -1px rgba(0,0,0,0.2),' +
        '0px 1px 1px 0px rgba(0,0,0,0.14),' +
        '0px 1px 3px 0px rgba(0,0,0,0.12)',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      '--flotable-border-color': 'rgba(224,224,224,1)',
      '--flotable-header-bg': '#ffffff',
      '--flotable-header-hover-bg': 'rgba(0,0,0,0.04)',
      '--flotable-bg': '#ffffff',
      '--flotable-color': 'rgba(0,0,0,0.87)',
      '--flotable-muted-color': 'rgba(0,0,0,0.6)',
      '--flotable-font-size': '0.875rem',
      '--flotable-sort-active-color': '#1976d2',
      '--flotable-row-hover-bg': 'rgba(0,0,0,0.04)',
    } as FloTableStyleValue,
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
