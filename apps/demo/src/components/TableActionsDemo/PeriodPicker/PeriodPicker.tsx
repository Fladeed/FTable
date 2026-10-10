'use client';

import { useState } from 'react';
import { LABELS } from '../TableActionsDemoData';
import type { Direction } from '../TableActionsDemoData';
import './PeriodPicker.css';

interface PeriodPickerProps {
  direction: Direction;
  onChange: (period: string) => void;
}

export function PeriodPicker({ direction, onChange }: PeriodPickerProps) {
  const labels = LABELS[direction];
  const [period, setPeriod] = useState(labels.periods[0]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <select
        className="period-picker__select"
        aria-label={labels.period}
        value={period}
        onChange={(e) => {
          setPeriod(e.target.value);
          onChange(e.target.value);
        }}
      >
        {labels.periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="period-picker__toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {labels.periodDetails}
      </button>
      {open && (
        <div className="period-picker__panel" role="dialog" aria-label={labels.periodDetails}>
          {labels.periodPanel(period)}
        </div>
      )}
    </>
  );
}
