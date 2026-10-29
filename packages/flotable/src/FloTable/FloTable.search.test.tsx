import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import FloTable from './FloTable';
import type { ColumnDef, FilterDef, FloTableRequestFn, TableAction } from './FloTable.types';

interface Refund {
  id: string;
  label: string;
}

const columns: ColumnDef<Refund>[] = [{ key: 'label', header: 'Label' }];
const data: Refund[] = [{ id: '1', label: 'one' }];
const filterDefs: FilterDef[] = [{ key: 'status', label: 'Status', type: 'text' }];
const tableActions: TableAction[] = [{ key: 'export', label: 'Export', onClick: () => {} }];

function precedes(a: Element, b: Element) {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('FloTable search placement', () => {
  it('renders search in the end group, before table actions, outside the filter bar', () => {
    const { container } = render(
      <FloTable<Refund>
        columns={columns}
        data={data}
        totalRows={1}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        showSearch
        filterDefs={filterDefs}
        tableActions={tableActions}
      />,
    );
    const search = screen.getByRole('searchbox');
    const endGroup = container.querySelector('.flotable-toolbar__end-group')!;
    const actions = container.querySelector('.flotable-table-actions')!;
    expect(endGroup.contains(search)).toBe(true);
    expect(container.querySelector('.flotable-filter-bar')!.contains(search)).toBe(false);
    expect(precedes(search, actions)).toBe(true);
  });

  it('renders search before toolbarEnd content', () => {
    const { container } = render(
      <FloTable<Refund>
        columns={columns}
        data={data}
        totalRows={1}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        showSearch
        toolbarEnd={<span>Picker</span>}
      />,
    );
    const toolbarEnd = container.querySelector('.flotable__toolbar-end')!;
    expect(precedes(screen.getByRole('searchbox'), toolbarEnd)).toBe(true);
  });

  it('renders the toolbar with only the searchbox when nothing else is configured', () => {
    const { container } = render(
      <FloTable<Refund>
        columns={columns}
        data={data}
        totalRows={1}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        showSearch
      />,
    );
    const toolbar = container.querySelector('.flotable-toolbar')!;
    expect(toolbar.contains(screen.getByRole('searchbox'))).toBe(true);
    expect(container.querySelector('.flotable-filter-bar')).toBeNull();
  });

  it('data mode: debounced search merges into quick filters and resets the page', () => {
    vi.useFakeTimers();
    const onFilterChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <FloTable<Refund>
        columns={columns}
        data={data}
        totalRows={1}
        page={3}
        pageSize={10}
        onPageChange={onPageChange}
        showSearch
        quickFilters={{ status: 'paid' }}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } });
    expect(onFilterChange).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'paid', __search__: 'x' });
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('request mode: typing a word sends a single request', async () => {
    const request = vi.fn<FloTableRequestFn<Refund>>(async () => ({ data, totalRows: 1 }));
    render(<FloTable<Refund> columns={columns} pageSize={10} request={request} showSearch />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    vi.useFakeTimers();
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    await act(async () => { vi.advanceTimersByTime(300); });
    vi.useRealTimers();

    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await act(async () => {});
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0].quickFilters.__search__).toBe('abc');
  });
});
