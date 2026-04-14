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
    <span className={`flotable-boolean flotable-boolean--${bool ? 'true' : 'false'}`}>
      {bool ? 'Yes' : 'No'}
    </span>
  );
}
