import { createContext, useContext } from 'react';

export interface FloTableThemeContextValue {
  /** Mirrors the `inheritTheme` prop so portaled sub-components (outside `.flotable-root`) can apply the modifier class. */
  inheritTheme: boolean;
}

export const FloTableThemeContext = createContext<FloTableThemeContextValue>({ inheritTheme: false });

export function useFloTableTheme(): FloTableThemeContextValue {
  return useContext(FloTableThemeContext);
}
