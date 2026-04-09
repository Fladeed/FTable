interface CurrencyRendererProps {
  value: unknown;
  currency?: string;
  locale?: string;
}

export function CurrencyRenderer({
  value,
  currency = 'USD',
  locale,
}: CurrencyRendererProps) {
  if (value == null || value === '') return <></>;
  const num = Number(value);
  if (isNaN(num)) return <>{String(value)}</>;
  return (
    <>
      {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num)}
    </>
  );
}
