import type { ReactNode } from 'react';
import { cx } from '../../../../utils/cx';
import './FilterPillReveal.css';

interface FilterPillRevealProps {
  shown: boolean;
  children: ReactNode;
  className?: string;
}

/** Animates its content's width between 0 and its natural size. Hidden content is `inert` and `aria-hidden`. */
export function FilterPillReveal({ shown, children, className }: FilterPillRevealProps) {
  return (
    <span
      className={cx('flotable-filter-pill__reveal', shown && 'flotable-filter-pill__reveal--shown')}
      aria-hidden={!shown}
      inert={!shown}
    >
      <span className={cx('flotable-filter-pill__reveal-inner', className)}>{children}</span>
    </span>
  );
}
