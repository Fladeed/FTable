import { useEffect, useState } from 'react';

/**
 * Returns true when the viewport width is at or below `maxWidthPx`.
 *
 * SSR-safe: returns `false` until the component mounts, then subscribes to
 * `matchMedia` for live updates.
 */
export function useMediaBreakpoint(maxWidthPx: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    setMatches(mql.matches);

    function listener(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [maxWidthPx]);

  return matches;
}
