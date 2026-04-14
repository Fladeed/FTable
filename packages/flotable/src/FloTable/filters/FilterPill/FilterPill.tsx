import type { ReactNode } from 'react';
import type { FilterDef, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import { FilterPillTrigger } from './FilterPillTrigger/FilterPillTrigger';
import { FilterPillField } from './FilterPillField/FilterPillField';
import { FilterPillClear } from './FilterPillClear/FilterPillClear';
import './FilterPill.css';

export interface FilterPillProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  isClosing: boolean;
  onPillClick: (key: string) => void;
  onValueChange: (key: string, value: string) => void;
  onClear: (key: string) => void;
  onClose: (key: string) => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** Replaces the default label span inside the trigger button. */
  renderTriggerLabel?: ReactNode;
  /** Overrides the active-value display when the pill is closed and active. */
  renderActiveValue?: (value: string) => ReactNode;
  /** Hide the ":" separator that normally precedes the inline input. */
  hideSeparator?: boolean;
  /** Placeholder text for text/number/date inputs. Defaults to "…". */
  placeholder?: string;
  /** Adds an `flotable-filter-pill--{variant}` modifier class to the root element. */
  variant?: string;
  /** aria-label for the trigger button. Defaults to undefined (no aria-label). */
  triggerAriaLabel?: string;
}

export function FilterPill({
  def,
  value,
  isOpen,
  isClosing,
  onPillClick,
  onValueChange,
  onClear,
  onClose,
  classNames,
  styles,
  renderTriggerLabel,
  renderActiveValue,
  hideSeparator = false,
  placeholder = '…',
  variant,
  triggerAriaLabel,
}: FilterPillProps) {
  const isActive = value !== '';

  return (
    <div
      className={cx(
        'flotable-filter-pill',
        variant && `flotable-filter-pill--${variant}`,
        classNames?.filterPill,
        isActive && 'flotable-filter-pill--active',
        (isOpen || isClosing) && 'flotable-filter-pill--open',
      )}
      style={styles?.filterPill}
      onClick={!isOpen && !isClosing ? () => onPillClick(def.key) : undefined}
    >
      <FilterPillTrigger
        def={def}
        value={value}
        isOpen={isOpen}
        isClosing={isClosing}
        onClick={onPillClick}
        renderTriggerLabel={renderTriggerLabel}
        renderActiveValue={renderActiveValue}
        classNames={classNames}
        styles={styles}
        ariaLabel={triggerAriaLabel}
      />

      {(isOpen || isClosing) && (
        <FilterPillField
          def={def}
          value={value}
          isOpen={isOpen}
          isClosing={isClosing}
          onValueChange={onValueChange}
          onClose={onClose}
          hideSeparator={hideSeparator}
          placeholder={placeholder}
          classNames={classNames}
          styles={styles}
        />
      )}

      {isActive && !isOpen && !isClosing && (
        <FilterPillClear
          filterKey={def.key}
          label={def.label}
          onClear={onClear}
        />
      )}
    </div>
  );
}
