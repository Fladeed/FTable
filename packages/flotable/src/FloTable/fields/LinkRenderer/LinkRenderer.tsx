import './LinkRenderer.css';

export interface LinkValue {
  href: string;
  label?: string;
}

export type LinkRendererValue = LinkValue | string | null | undefined;

interface LinkRendererProps {
  value: LinkRendererValue;
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
      className="flotable-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
