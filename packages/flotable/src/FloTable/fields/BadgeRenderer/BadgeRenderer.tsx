import type { CSSProperties } from 'react';
import './BadgeRenderer.css';

export type BadgeRendererValue = string | null | undefined;

interface BadgeRendererProps {
  value: BadgeRendererValue;
  badgeColors?: Record<string, string>;
}

export function BadgeRenderer({ value, badgeColors }: BadgeRendererProps) {
  const label = value == null ? '' : String(value);
  const bg = badgeColors?.[label];

  // Pipe the consumer colour through a CSS var so the stylesheet can reshape it for dark mode.
  const style = bg ? ({ '--_flotable-badge-bg': bg } as CSSProperties) : undefined;

  return (
    <span className="flotable-badge" style={style}>
      {label}
    </span>
  );
}
