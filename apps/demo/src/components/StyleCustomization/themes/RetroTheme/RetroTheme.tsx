'use client';

import type { FTableStyleValue } from 'ftable';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './RetroTheme.css';

export const RETRO_CONFIG: ThemeConfig = {
  label: 'Retro Terminal',
  description:
    'A CRT-inspired table with phosphor-green text on a pitch-black background, monospace font, ' +
    'glowing neon borders, a scanline overlay, and a subtle flicker animation. ' +
    'Filter pills go full terminal: black background, green text, zero border-radius, ' +
    'neon border glow on the active state — all via --ftable-pill-* CSS variables on styles.root.',
  overrides: [
    'root: fontFamily monospace + pill vars',
    'wrapper: boxShadow glow + scanline overlay',
    '--ftable-bg: #0a0a0a',
    '--ftable-color: #33ff33',
    '--ftable-border-color: #1a3a1a',
    '--ftable-header-bg: #0d1a0d',
    '--ftable-sort-active-color: #66ff66',
    'classNames.wrapper: scanline + flicker',
    'classNames.row: neon hover glow',
    'classNames.paginationButton: glow hover',
    '--ftable-pill-active-color: #66ff66',
    '--ftable-pill-active-border-color: #33ff33',
    '--ftable-pill-radius: 0',
  ],
  classNames: {
    root: 'theme-retro__root',
    wrapper: 'theme-retro__wrapper',
    row: 'theme-retro__row',
    paginationButton: 'theme-retro__btn',
  },
  styles: {
    root: {
      fontFamily: "'Courier New', Courier, monospace",
      '--ftable-pill-bg': '#0a0a0a',
      '--ftable-pill-border-color': '#1a3a1a',
      '--ftable-pill-color': '#33ff33',
      '--ftable-pill-radius': '0',
      '--ftable-pill-active-color': '#66ff66',
      '--ftable-pill-active-bg': '#0f1e0f',
      '--ftable-pill-active-border-color': '#33ff33',
      '--ftable-focus-ring': 'rgba(51,255,51,0.2)',
      '--ftable-pill-placeholder-color': '#1a5c1a',
      '--ftable-pill-separator-color': '#33ff33',
      '--ftable-pill-close-color': '#33ff33',
      '--ftable-pill-close-hover-color': '#66ff66',
      '--ftable-pill-clear-color': '#33ff33',
      '--ftable-pill-clear-hover-color': '#66ff66',
    } as FTableStyleValue,
    wrapper: {
      border: '1px solid #1a3a1a',
      borderRadius: '0',
      overflow: 'hidden',
      boxShadow: '0 0 12px rgba(51,255,51,0.15), inset 0 0 60px rgba(51,255,51,0.03)',
      '--ftable-border-color': '#1a3a1a',
      '--ftable-header-bg': '#0d1a0d',
      '--ftable-header-hover-bg': '#142814',
      '--ftable-bg': '#0a0a0a',
      '--ftable-color': '#33ff33',
      '--ftable-muted-color': '#1a8c1a',
      '--ftable-font-size': '0.8125rem',
      '--ftable-sort-active-color': '#66ff66',
      '--ftable-row-hover-bg': '#0f1e0f',
    } as FTableStyleValue,
    headerCell: {
      padding: '0.75rem 1rem',
      fontWeight: '700',
      fontSize: '0.6875rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#1a8c1a',
      borderBottom: '1px solid #1a3a1a',
    },
    cell: {
      padding: '0.625rem 1rem',
      fontSize: '0.8125rem',
    },
    pagination: {
      padding: '0.75rem 0.25rem',
      color: '#1a8c1a',
      fontSize: '0.8125rem',
      fontFamily: "'Courier New', Courier, monospace",
    },
    paginationButton: {
      border: '1px solid #1a3a1a',
      borderRadius: '0',
      backgroundColor: '#0a0a0a',
      color: '#33ff33',
      padding: '0.25rem 0.875rem',
      fontSize: '0.8125rem',
      fontFamily: "'Courier New', Courier, monospace",
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
};

export function RetroTheme() {
  return <ThemePreview config={RETRO_CONFIG} previewClass="sc-preview sc-preview--retro" />;
}
