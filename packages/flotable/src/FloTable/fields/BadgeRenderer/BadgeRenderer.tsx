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

  // Pass the consumer's color through a CSS custom property so the
  // stylesheet can reshape it for dark mode (tint + readable text)
  // while still letting the consumer fully override via the default-bg
  // token if they want fixed colors.
  const style = bg ? ({ '--_flotable-badge-bg': bg } as CSSProperties) : undefined;

  return (
    <span className="flotable-badge" style={style}>
      {label}
    </span>
  );
}
