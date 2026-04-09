export type TextRendererValue = string | number | boolean | null | undefined;

interface TextRendererProps {
  value: TextRendererValue;
}

export function TextRenderer({ value }: TextRendererProps) {
  return <>{value == null ? '' : String(value)}</>;
}
