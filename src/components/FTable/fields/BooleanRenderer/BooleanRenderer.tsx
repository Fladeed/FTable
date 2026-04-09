import './BooleanRenderer.css';

interface BooleanRendererProps {
  value: unknown;
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
