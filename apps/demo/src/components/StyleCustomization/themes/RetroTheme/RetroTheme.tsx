'use client';

import type { FloTableStyleValue } from 'flotable';
import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './RetroTheme.css';

export const RETRO_CONFIG: ThemeConfig = {
  label: 'Retro Terminal',
  description:
    'A CRT-inspired table with phosphor-green text on a pitch-black background, monospace font, ' +
    'glowing neon borders, a scanline overlay, and a subtle flicker animation. ' +
    'Filter pills go full terminal: black background, green text, zero border-radius, ' +
    'neon border glow on the active state — all via --flotable-pill-* CSS variables on styles.root.',
  overrides: [
    'root: fontFamily monospace + pill vars',
    'wrapper: boxShadow glow + scanline overlay',
    '--flotable-bg: #0a0a0a',
    '--flotable-color: #33ff33',
    '--flotable-border-color: #1a3a1a',
    '--flotable-header-bg: #0d1a0d',
    '--flotable-sort-active-color: #66ff66',
    'classNames.wrapper: scanline + flicker',
    'classNames.row: neon hover glow',
    'classNames.paginationButton: glow hover',
    '--flotable-pill-active-color: #66ff66',
    '--flotable-pill-active-border-color: #33ff33',
    '--flotable-pill-radius: 0',
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
      '--flotable-pill-bg': '#0a0a0a',
      '--flotable-pill-border-color': '#1a3a1a',
      '--flotable-pill-color': '#33ff33',
      '--flotable-pill-radius': '0',
      '--flotable-pill-active-color': '#66ff66',
      '--flotable-pill-active-bg': '#0f1e0f',
      '--flotable-pill-active-border-color': '#33ff33',
      '--flotable-focus-ring': 'rgba(51,255,51,0.2)',
      '--flotable-pill-placeholder-color': '#1a5c1a',
      '--flotable-pill-separator-color': '#33ff33',
      '--flotable-pill-close-color': '#33ff33',
      '--flotable-pill-close-hover-color': '#66ff66',
      '--flotable-pill-clear-color': '#33ff33',
      '--flotable-pill-clear-hover-color': '#66ff66',
    } as FloTableStyleValue,
    wrapper: {
      border: '1px solid #1a3a1a',
      borderRadius: '0',
      overflow: 'hidden',
      boxShadow: '0 0 12px rgba(51,255,51,0.15), inset 0 0 60px rgba(51,255,51,0.03)',
      '--flotable-border-color': '#1a3a1a',
      '--flotable-header-bg': '#0d1a0d',
      '--flotable-header-hover-bg': '#142814',
      '--flotable-bg': '#0a0a0a',
      '--flotable-color': '#33ff33',
      '--flotable-muted-color': '#1a8c1a',
      '--flotable-font-size': '0.8125rem',
      '--flotable-sort-active-color': '#66ff66',
      '--flotable-row-hover-bg': '#0f1e0f',
    } as FloTableStyleValue,
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
