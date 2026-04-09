export type DateRendererValue = Date | string | number | null | undefined;

interface DateRendererProps {
  value: DateRendererValue;
  locale?: string;
}

export function DateRenderer({ value, locale }: DateRendererProps) {
  if (value == null || value === '') return <></>;
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return <>{String(value)}</>;
  return <>{new Intl.DateTimeFormat(locale).format(date)}</>;
}
