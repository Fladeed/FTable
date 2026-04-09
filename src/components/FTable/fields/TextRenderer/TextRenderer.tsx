interface TextRendererProps {
  value: unknown;
}

export function TextRenderer({ value }: TextRendererProps) {
  return <>{value == null ? '' : String(value)}</>;
}
