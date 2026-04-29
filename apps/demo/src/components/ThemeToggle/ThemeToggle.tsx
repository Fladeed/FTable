'use client';

import { useEffect, useState } from 'react';
import './ThemeToggle.css';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'flotable-demo-theme';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  // On mount: read the saved theme from localStorage and apply it.
  useEffect(() => {
    let saved: Theme | null = null;
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') saved = v;
    } catch {
      /* storage may be unavailable */
    }
    const initial: Theme = saved ?? 'light';
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
    setMounted(true);
  }, []);

  // On every change after mount: sync DOM + storage.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable */
    }
  }, [mounted, theme]);

  // Render nothing until we've read localStorage on the client — avoids
  // hydration mismatches between server (theme unknown) and client.
  if (!mounted) return null;

  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span aria-hidden="true" className="theme-toggle__icon">
        {theme === 'dark' ? '☀︎' : '☾'}
      </span>
      <span className="theme-toggle__label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
