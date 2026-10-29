import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import type { FilterDef, QuickFilterState } from '../../FloTable.types';

const inStock: FilterDef = { key: 'inStock', label: 'In stock', type: 'boolean' };
const status: FilterDef = {
  key: 'status',
  label: 'Statut',
  type: 'select',
  options: [
    { value: 'paid', label: 'Payé' },
    { value: 'refunded', label: 'Remboursé' },
  ],
};

function renderBar(
  filterDefs: FilterDef[],
  activeFilters: QuickFilterState = {},
  extra: Partial<Parameters<typeof FilterBar>[0]> = {},
) {
  const onFilterChange = vi.fn();
  const utils = render(
    <FilterBar
      filterDefs={filterDefs}
      activeFilters={activeFilters}
      onFilterChange={onFilterChange}
      {...extra}
    />,
  );
  return { onFilterChange, ...utils };
}

afterEach(cleanup);

describe('FilterBar boolean pill — toggle button', () => {
  it('renders an unpressed toggle and no dropdown', () => {
    renderBar([inStock]);
    const toggle = screen.getByRole('button', { name: 'In stock' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('applies the filter immediately on click in commit mode', () => {
    const { onFilterChange } = renderBar([inStock], {}, { filterMode: 'commit' });
    fireEvent.click(screen.getByRole('button', { name: 'In stock' }));
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ inStock: 'true' });
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('applies the filter immediately on click in live mode', () => {
    const { onFilterChange } = renderBar([inStock], {}, { filterMode: 'live' });
    fireEvent.click(screen.getByRole('button', { name: 'In stock' }));
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ inStock: 'true' });
  });

  it('renders pressed when active and clears the filter on a second click', () => {
    const { onFilterChange } = renderBar([inStock], { inStock: 'true' });
    const toggle = screen.getByRole('button', { name: 'In stock' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.textContent).toBe('In stock');

    fireEvent.click(toggle);
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('shows the translated "false" label when the filter was set to false programmatically', () => {
    renderBar([inStock], { inStock: 'false' }, { labels: { booleanFalse: 'Non' } });
    const toggle = screen.getByRole('button', { name: /In stock/ });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.textContent).toContain('Non');
  });

  it('keeps other active filters when toggling', () => {
    const { onFilterChange } = renderBar([inStock, status], { status: 'paid' });
    fireEvent.click(screen.getByRole('button', { name: 'In stock' }));
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'paid', inStock: 'true' });
  });
});

describe('FilterBar select pill — option labels', () => {
  it('shows option labels and the translated "All" option', () => {
    renderBar([status], {}, { labels: { filterAll: 'Tous' } });
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    const select = screen.getByRole('combobox');
    const options = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Tous', 'Payé', 'Remboursé']);
  });

  it('filters on the option value, not the label', () => {
    const { onFilterChange } = renderBar([status]);
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'refunded' } });
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'refunded' });
  });

  it('shows the option label as the active value when closed', () => {
    renderBar([status], { status: 'refunded' });
    expect(screen.getByText(/Remboursé/)).toBeTruthy();
    expect(screen.queryByText(/refunded/)).toBeNull();
  });

  it('still accepts plain string options', () => {
    const plain: FilterDef = { key: 'cat', label: 'Category', type: 'select', options: ['A', 'B'] };
    const { onFilterChange } = renderBar([plain]);
    fireEvent.click(screen.getByRole('button', { name: 'Category' }));
    const select = screen.getByRole('combobox');
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['All', 'A', 'B']);
    fireEvent.change(select, { target: { value: 'B' } });
    expect(onFilterChange).toHaveBeenCalledWith({ cat: 'B' });
  });
});
