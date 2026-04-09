import './BadgeRenderer.css';

export type BadgeRendererValue = string | null | undefined;

interface BadgeRendererProps {
  value: BadgeRendererValue;
  badgeColors?: Record<string, string>;
}

export function BadgeRenderer({ value, badgeColors }: BadgeRendererProps) {
  const label = value == null ? '' : String(value);
  const bg = badgeColors?.[label] ?? 'var(--ftable-badge-default-bg, #e5e7eb)';

  return (
    <span className="ftable-badge" style={{ backgroundColor: bg }}>
      {label}
    </span>
  );
}
