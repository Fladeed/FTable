import './BooleanRenderer.css';

export type BooleanRendererValue = boolean | string | number | null | undefined;

interface BooleanRendererProps {
  value: BooleanRendererValue;
  /** Text for `true`. Defaults to `'Yes'`. */
  trueLabel?: string;
  /** Text for `false`. Defaults to `'No'`. */
  falseLabel?: string;
}

export function BooleanRenderer({ value, trueLabel = 'Yes', falseLabel = 'No' }: BooleanRendererProps) {
  const bool =
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1';

  return (
    <span className={`flotable-boolean flotable-boolean--${bool ? 'true' : 'false'}`}>
      {bool ? trueLabel : falseLabel}
    </span>
  );
}
