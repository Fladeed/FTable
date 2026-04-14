import type { ReactNode } from 'react';
import type { ColumnDef } from '../FloTable.types';
import { TextRenderer, type TextRendererValue } from './TextRenderer/TextRenderer';
import { NumberRenderer, type NumberRendererValue } from './NumberRenderer/NumberRenderer';
import { DateRenderer, type DateRendererValue } from './DateRenderer/DateRenderer';
import { BooleanRenderer, type BooleanRendererValue } from './BooleanRenderer/BooleanRenderer';
import { BadgeRenderer, type BadgeRendererValue } from './BadgeRenderer/BadgeRenderer';
import { CurrencyRenderer, type CurrencyRendererValue } from './CurrencyRenderer/CurrencyRenderer';
import { LinkRenderer, type LinkRendererValue } from './LinkRenderer/LinkRenderer';

export function renderCell<T extends object>(col: ColumnDef<T>, row: T): ReactNode {
  const value = (row as Record<string, unknown>)[col.key];

  if (col.render) {
    return col.render(value as T[keyof T], row);
  }

  switch (col.type) {
    case 'number':
      return <NumberRenderer value={value as NumberRendererValue} locale={col.locale} />;
    case 'date':
      return <DateRenderer value={value as DateRendererValue} locale={col.locale} />;
    case 'boolean':
      return <BooleanRenderer value={value as BooleanRendererValue} />;
    case 'badge':
      return <BadgeRenderer value={value as BadgeRendererValue} badgeColors={col.badgeColors} />;
    case 'currency':
      return <CurrencyRenderer value={value as CurrencyRendererValue} currency={col.currency} locale={col.locale} />;
    case 'link':
      return <LinkRenderer value={value as LinkRendererValue} />;
    case 'text':
    default:
      return <TextRenderer value={value as TextRendererValue} />;
  }
}
