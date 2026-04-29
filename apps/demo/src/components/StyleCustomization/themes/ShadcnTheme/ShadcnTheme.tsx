'use client';

import type { ThemeConfig } from '../../StyleCustomizationDemoData';
import { ThemePreview } from '../../ThemePreview/ThemePreview';
import './ShadcnTheme.css';

export const SHADCN_CONFIG: ThemeConfig = {
  label: 'shadcn/ui',
  description:
    'Clean and minimal. Implementation note: the entire colour palette comes from shadcn-style tokens ' +
    '(--background, --foreground, --primary, --border, --muted, --accent, --ring, --radius) defined on the ' +
    'preview wrapper — FloTable’s alias chain picks them up with zero --flotable-* mapping. Only structural ' +
    'choices (rounded outer border, refined typography, outlined pagination buttons) live in the styles prop.',
  overrides: [
    'CSS: --background, --foreground, --primary, --border, --muted, --accent, --ring, --radius',
    'wrapper: border + borderRadius',
    'headerCell: fontWeight 500',
    'paginationButton: outlined',
  ],
  classNames: {},
  styles: {
    wrapper: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    },
    headerCell: {
      height: '2.75rem',
      padding: '0 1rem',
      fontWeight: '500',
      fontSize: '0.8125rem',
    },
    cell: {
      padding: '0.875rem 1rem',
    },
    pagination: {
      padding: '0.875rem 0.25rem',
      fontSize: '0.8125rem',
    },
    paginationButton: {
      padding: '0.375rem 0.875rem',
    },
  },
};

export function ShadcnTheme() {
  return <ThemePreview config={SHADCN_CONFIG} previewClass="sc-preview sc-preview--shadcn" />;
}
