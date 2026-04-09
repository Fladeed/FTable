import './BooleanRenderer.css';

export type BooleanRendererValue = boolean | string | number | null | undefined;

interface BooleanRendererProps {
  value: BooleanRendererValue;
}

export function BooleanRenderer({ value }: BooleanRendererProps) {
  const bool =
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1';

  return (
    <span className={`ftable-boolean ftable-boolean--${bool ? 'true' : 'false'}`}>
      {bool ? 'Yes' : 'No'}
    </span>
  );
}
