import type { ReactNode } from 'react';
import type { ColumnDef } from '../FTable.types';
import { TextRenderer } from './TextRenderer/TextRenderer';
import { NumberRenderer } from './NumberRenderer/NumberRenderer';
import { DateRenderer } from './DateRenderer/DateRenderer';
import { BooleanRenderer } from './BooleanRenderer/BooleanRenderer';
import { BadgeRenderer } from './BadgeRenderer/BadgeRenderer';
import { CurrencyRenderer } from './CurrencyRenderer/CurrencyRenderer';
import { LinkRenderer } from './LinkRenderer/LinkRenderer';

export function renderCell<T extends object>(col: ColumnDef<T>, row: T): ReactNode {
  const value = (row as Record<string, unknown>)[col.key];

  if (col.render) {
    return col.render(value, row);
  }

  switch (col.type) {
    case 'number':
      return <NumberRenderer value={value} locale={col.locale} />;
    case 'date':
      return <DateRenderer value={value} locale={col.locale} />;
    case 'boolean':
      return <BooleanRenderer value={value} />;
    case 'badge':
      return <BadgeRenderer value={value} badgeColors={col.badgeColors} />;
    case 'currency':
      return <CurrencyRenderer value={value} currency={col.currency} locale={col.locale} />;
    case 'link':
      return <LinkRenderer value={value} />;
    case 'text':
    default:
      return <TextRenderer value={value} />;
  }
}
