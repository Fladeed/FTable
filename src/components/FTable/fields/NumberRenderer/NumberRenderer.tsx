export type NumberRendererValue = number | string | null | undefined;

interface NumberRendererProps {
  value: NumberRendererValue;
  locale?: string;
}

export function NumberRenderer({ value, locale }: NumberRendererProps) {
  if (value == null || value === '') return <></>;
  const num = Number(value);
  if (isNaN(num)) return <>{String(value)}</>;
  return <>{new Intl.NumberFormat(locale).format(num)}</>;
}
