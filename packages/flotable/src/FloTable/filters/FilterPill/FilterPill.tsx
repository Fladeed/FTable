import type { ReactNode } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import { FilterPillTrigger } from './FilterPillTrigger/FilterPillTrigger';
import { FilterPillField } from './FilterPillField/FilterPillField';
import { FilterPillClear } from './FilterPillClear/FilterPillClear';
import { FilterPillToggle } from './FilterPillToggle/FilterPillToggle';
import { FilterPillReveal } from './FilterPillReveal/FilterPillReveal';
import './FilterPill.css';

export interface FilterPillProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  /** @deprecated Ignored. Pills now close instantly; kept so existing callers still compile. */
  isClosing?: boolean;
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
  /** Built-in text (boolean values, close / clear button labels). */
  labels?: FloTableLabels;
}

export function FilterPill({
  def,
  value,
  isOpen,
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
  labels,
}: FilterPillProps) {
  const isActive = value !== '';

  if (def.type === 'boolean') {
    const toggle = () => onValueChange(def.key, isActive ? '' : 'true');
    return (
      <div
        className={cx(
          'flotable-filter-pill',
          variant && `flotable-filter-pill--${variant}`,
          classNames?.filterPill,
          isActive && 'flotable-filter-pill--active',
        )}
        style={styles?.filterPill}
        onClick={toggle}
      >
        <FilterPillToggle
          def={def}
          value={value}
          onToggle={toggle}
          renderTriggerLabel={renderTriggerLabel}
          renderActiveValue={renderActiveValue}
          classNames={classNames}
          styles={styles}
          ariaLabel={triggerAriaLabel}
          labels={labels}
        />
      </div>
    );
  }

  return (
    <div
      className={cx(
        'flotable-filter-pill',
        variant && `flotable-filter-pill--${variant}`,
        classNames?.filterPill,
        isActive && 'flotable-filter-pill--active',
        isOpen && 'flotable-filter-pill--open',
      )}
      style={styles?.filterPill}
      onClick={!isOpen ? () => onPillClick(def.key) : undefined}
    >
      <FilterPillTrigger
        def={def}
        value={value}
        isOpen={isOpen}
        onClick={onPillClick}
        renderTriggerLabel={renderTriggerLabel}
        renderActiveValue={renderActiveValue}
        classNames={classNames}
        styles={styles}
        ariaLabel={triggerAriaLabel}
        labels={labels}
      />

      <FilterPillField
        def={def}
        value={value}
        isOpen={isOpen}
        onValueChange={onValueChange}
        onClear={onClear}
        onClose={onClose}
        hideSeparator={hideSeparator || def.type === 'select'}
        placeholder={placeholder}
        classNames={classNames}
        styles={styles}
        labels={labels}
      />

      <FilterPillReveal shown={isActive && !isOpen}>
        <FilterPillClear
          filterKey={def.key}
          label={def.label}
          onClear={onClear}
          ariaLabel={labels?.clearFilter}
        />
      </FilterPillReveal>
    </div>
  );
}
