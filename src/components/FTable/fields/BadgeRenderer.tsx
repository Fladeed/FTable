import './BadgeRenderer.css';

interface BadgeRendererProps {
  value: unknown;
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
