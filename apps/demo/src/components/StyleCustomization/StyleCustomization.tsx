'use client';

import { useState } from 'react';
import { DemoNav } from '../DemoNav/DemoNav';
import type { ThemeConfig } from './StyleCustomizationDemoData';
import { ShadcnTheme, SHADCN_CONFIG } from './themes/ShadcnTheme/ShadcnTheme';
import { AntdTheme, ANTD_CONFIG } from './themes/AntdTheme/AntdTheme';
import { MuiTheme, MUI_CONFIG } from './themes/MuiTheme/MuiTheme';
import { RetroTheme, RETRO_CONFIG } from './themes/RetroTheme/RetroTheme';
import './StyleCustomization.css';

type ThemeId = 'shadcn' | 'antd' | 'mui' | 'retro';

const THEMES: Record<ThemeId, ThemeConfig> = {
  shadcn: SHADCN_CONFIG,
  antd: ANTD_CONFIG,
  mui: MUI_CONFIG,
  retro: RETRO_CONFIG,
};

const THEME_IDS: ThemeId[] = ['shadcn', 'antd', 'mui', 'retro'];

export function StyleCustomization() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>('shadcn');
  const theme = THEMES[activeTheme];

  return (
    <main className="sc-page demo-page-shell">
      <DemoNav />
      <h1 className="sc-title">Style Customization</h1>

      <p className="sc-intro">
        FTable exposes two props &mdash;{' '}
        <code className="sc-code">classNames</code> and{' '}
        <code className="sc-code">styles</code> &mdash; that let you restyle every part of
        the table without touching the component source. The examples below recreate
        popular design systems and a fully custom theme using only those two props.
      </p>

      {/* Tab bar */}
      <div
        className="sc-tabs"
        role="tablist"
        aria-label="Style themes"
        data-active-theme={activeTheme}
      >
        {THEME_IDS.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTheme === id}
            className={`sc-tab${activeTheme === id ? ' sc-tab--active' : ''}`}
            onClick={() => setActiveTheme(id)}
          >
            {THEMES[id].label}
          </button>
        ))}
      </div>

      {/* Theme info */}
      <div className="sc-info" role="tabpanel">
        <p className="sc-info__desc">{theme.description}</p>
        <div className="sc-info__overrides">
          <span className="sc-info__label">Key overrides:</span>
          {theme.overrides.map((o) => (
            <code key={o} className="sc-override-tag">{o}</code>
          ))}
        </div>
      </div>

      {/* Each theme component manages its own page / sort / filter state */}
      {activeTheme === 'shadcn' && <ShadcnTheme />}
      {activeTheme === 'antd' && <AntdTheme />}
      {activeTheme === 'mui' && <MuiTheme />}
      {activeTheme === 'retro' && <RetroTheme />}
    </main>
  );
}


