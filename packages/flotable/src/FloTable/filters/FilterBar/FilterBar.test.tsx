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

describe('FilterBar select pill — themed option list', () => {
  function optionLabels() {
    return within(screen.getByRole('listbox')).getAllByRole('option').map((o) => o.textContent);
  }

  it('exposes no listbox while the pill is closed', () => {
    renderBar([status]);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens the option list with the pill and shows translated labels', () => {
    renderBar([status], {}, { labels: { filterAll: 'Tous' } });
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(optionLabels()).toEqual(['Tous', 'Payé', 'Remboursé']);
  });

  it('filters on the option value and closes the pill when an option is clicked', () => {
    const { onFilterChange } = renderBar([status]);
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    fireEvent.click(screen.getByRole('option', { name: 'Remboursé' }));
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'refunded' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('marks the current value as selected', () => {
    renderBar([status], { status: 'paid' });
    fireEvent.click(screen.getByRole('button', { name: /^Statut/ }));
    expect(screen.getByRole('option', { name: 'Payé' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('option', { name: 'Remboursé' }).getAttribute('aria-selected')).toBe('false');
  });

  it('clears the filter when "All" is chosen', () => {
    const { onFilterChange } = renderBar([status], { status: 'paid' });
    fireEvent.click(screen.getByRole('button', { name: /^Statut/ }));
    fireEvent.click(screen.getByRole('option', { name: 'All' }));
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('supports arrow keys and Enter', () => {
    const { onFilterChange } = renderBar([status]);
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    const activeId = combobox.getAttribute('aria-activedescendant');
    expect(activeId).toBe(screen.getByRole('option', { name: 'Payé' }).id);
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'paid' });
  });

  it('supports type-ahead', () => {
    renderBar([status]);
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'r' });
    expect(combobox.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: 'Remboursé' }).id,
    );
  });

  it('shows the option label as the active value when closed', () => {
    renderBar([status], { status: 'refunded' });
    const trigger = screen.getByRole('button', { name: /^Statut/ });
    expect(trigger.textContent).toContain('Remboursé');
    expect(trigger.textContent).not.toContain('refunded');
  });

  it('still accepts plain string options', () => {
    const plain: FilterDef = { key: 'cat', label: 'Category', type: 'select', options: ['A', 'B'] };
    const { onFilterChange } = renderBar([plain]);
    fireEvent.click(screen.getByRole('button', { name: 'Category' }));
    expect(optionLabels()).toEqual(['All', 'A', 'B']);
    fireEvent.click(screen.getByRole('option', { name: 'B' }));
    expect(onFilterChange).toHaveBeenCalledWith({ cat: 'B' });
  });
});

describe('FilterBar number pill', () => {
  const price: FilterDef = { key: 'price', label: 'Price', type: 'number' };

  it('uses a decimal keyboard and commits on Enter', () => {
    const { onFilterChange } = renderBar([price], {}, { filterMode: 'commit' });
    fireEvent.click(screen.getByRole('button', { name: 'Price' }));
    const input = screen.getByRole('spinbutton');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onFilterChange).toHaveBeenCalledWith({ price: '42' });
  });
});

describe('FilterBar pill open/close', () => {
  const name: FilterDef = { key: 'name', label: 'Name', type: 'text' };

  it('opens and closes a text pill instantly', () => {
    renderBar([name]);
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getByRole('textbox')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('commits on outside click in commit mode and closes instantly', () => {
    const { onFilterChange } = renderBar([name], {}, { filterMode: 'commit' });
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bob' } });
    fireEvent.mouseDown(document.body);
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ name: 'bob' });
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('closes and commits when clicking empty space inside the filter bar', () => {
    const { onFilterChange, container } = renderBar([name, status], {}, { filterMode: 'commit' });
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bob' } });
    fireEvent.mouseDown(container.querySelector('.flotable-filter-bar')!);
    expect(onFilterChange).toHaveBeenCalledWith({ name: 'bob' });
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('stays open when clicking inside the open pill', () => {
    renderBar([name]);
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.mouseDown(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('hides the active value and clear button while the pill is open', () => {
    renderBar([name], { name: 'bob' });
    expect(screen.getByRole('button', { name: 'Clear Name' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Name/ }));
    expect(screen.queryByRole('button', { name: 'Clear Name' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Name' })).toBeTruthy();
  });

  it('keeps only one pill open when switching', () => {
    renderBar([name, status]);
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getAllByRole('listbox')).toHaveLength(1);
  });

  it('commits the previous pill when switching in commit mode', () => {
    const { onFilterChange } = renderBar([name, status], {}, { filterMode: 'commit' });
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Statut' }));
    expect(onFilterChange).toHaveBeenCalledWith({ name: 'bob' });
  });

  it('reopens immediately after closing', () => {
    renderBar([name]);
    const trigger = screen.getByRole('button', { name: 'Name' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('never renders a searchbox', () => {
    renderBar([name]);
    expect(screen.queryByRole('searchbox')).toBeNull();
  });
});
