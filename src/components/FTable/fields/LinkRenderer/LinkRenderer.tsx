import './LinkRenderer.css';

interface LinkValue {
  href: string;
  label?: string;
}

interface LinkRendererProps {
  value: unknown;
}

export function LinkRenderer({ value }: LinkRendererProps) {
  if (value == null || value === '') return <></>;

  let href: string;
  let label: string;

  if (typeof value === 'object' && value !== null && 'href' in value) {
    const lv = value as LinkValue;
    href = lv.href;
    label = lv.label ?? lv.href;
  } else {
    href = String(value);
    label = String(value);
  }

  return (
    <a
      className="ftable-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
