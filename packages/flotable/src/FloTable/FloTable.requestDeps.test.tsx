import { createRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import FloTable from './FloTable';
import type {
  ColumnDef,
  FloTableHandle,
  FloTableRequestFn,
  FloTableRequestResult,
  RequestDeps,
} from './FloTable.types';

interface Refund {
  id: string;
  label: string;
  amount: number;
}

const columns: ColumnDef<Refund>[] = [
  { key: 'label', header: 'Label' },
  { key: 'amount', header: 'Amount', type: 'number', sortable: true },
];

function rows(label: string): FloTableRequestResult<Refund> {
  return { data: [{ id: label, label, amount: 1 }], totalRows: 50 };
}

function mockRequest(label = 'row') {
  return vi.fn<FloTableRequestFn<Refund>>(async () => rows(label));
}

function deferred<V>() {
  let resolve!: (value: V) => void;
  const promise = new Promise<V>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function Table(props: {
  request: FloTableRequestFn<Refund>;
  requestDeps?: RequestDeps;
  tableRef?: React.Ref<FloTableHandle<Refund>>;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  initialSort?: { key: keyof Refund & string; direction: 'asc' | 'desc' };
  initialQuickFilters?: Record<string, string>;
}) {
  const { tableRef, ...rest } = props;
  return <FloTable<Refund> ref={tableRef} columns={columns} pageSize={10} {...rest} />;
}

afterEach(cleanup);

describe('FloTable request mode — requestDeps', () => {
  it('re-fetches exactly once with page 1 when requestDeps changes', async () => {
    const request = mockRequest();
    const { rerender } = render(<Table request={request} requestDeps={['7d']} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    rerender(<Table request={request} requestDeps={['year']} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await act(async () => {});

    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 10,
      sortState: null,
      quickFilters: {},
    });
  });

  it('keeps the current sort and quick filters (including search) on re-fetch', async () => {
    const request = mockRequest();
    const sort = { key: 'amount' as const, direction: 'desc' as const };
    const filters = { __search__: 'abc', status: 'paid' };
    const { rerender } = render(
      <Table request={request} requestDeps={['7d']} initialSort={sort} initialQuickFilters={filters} />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    rerender(
      <Table request={request} requestDeps={['year']} initialSort={sort} initialQuickFilters={filters} />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    expect(request.mock.calls[1][0]).toEqual({
      page: 1,
      pageSize: 10,
      sortState: sort,
      quickFilters: filters,
    });
  });

  it('does not re-fetch for a new array literal holding the same values', async () => {
    const request = mockRequest();
    const { rerender } = render(<Table request={request} requestDeps={['7d', 3]} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    rerender(<Table request={request} requestDeps={['7d', 3]} />);
    await act(async () => {});

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('never loops with an inline request arrow and stable requestDeps', async () => {
    const spy = mockRequest();
    const { rerender } = render(<Table request={(p) => spy(p)} requestDeps={['7d']} />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    for (let i = 0; i < 5; i++) {
      rerender(<Table request={(p) => spy(p)} requestDeps={['7d']} />);
      await act(async () => {});
    }

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('resets to page 1 when requestDeps changes on page 3', async () => {
    const request = mockRequest();
    const { rerender } = render(<Table request={request} requestDeps={['7d']} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    expect(request.mock.calls[2][0].page).toBe(3);

    rerender(<Table request={request} requestDeps={['year']} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(4));
    await act(async () => {});

    expect(request).toHaveBeenCalledTimes(4);
    expect(request.mock.calls[3][0].page).toBe(1);
    expect(screen.getByText('Page 1 of 5')).toBeTruthy();
  });

  it('drops a slow response from the old query that lands after the new one', async () => {
    const slow = deferred<FloTableRequestResult<Refund>>();
    const request = vi
      .fn<FloTableRequestFn<Refund>>()
      .mockImplementationOnce(() => slow.promise)
      .mockImplementation(async () => rows('NEW'));
    const { rerender } = render(<Table request={request} requestDeps={['7d']} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    rerender(<Table request={request} requestDeps={['year']} />);
    await screen.findByText('NEW');

    await act(async () => {
      slow.resolve(rows('OLD'));
    });

    expect(screen.getByText('NEW')).toBeTruthy();
    expect(screen.queryByText('OLD')).toBeNull();
  });

  it('calls the new request function when requestDeps and request change together', async () => {
    const oldRequest = mockRequest();
    const newRequest = mockRequest();
    const { rerender } = render(<Table request={oldRequest} requestDeps={['7d']} />);
    await waitFor(() => expect(oldRequest).toHaveBeenCalledTimes(1));

    rerender(<Table request={newRequest} requestDeps={['year']} />);
    await waitFor(() => expect(newRequest).toHaveBeenCalledTimes(1));
    await act(async () => {});

    expect(oldRequest).toHaveBeenCalledTimes(1);
    expect(newRequest).toHaveBeenCalledTimes(1);
  });

  it('ref.refresh() uses the latest request function', async () => {
    const tableRef = createRef<FloTableHandle<Refund>>();
    const oldRequest = mockRequest();
    const newRequest = mockRequest();
    const { rerender } = render(
      <Table tableRef={tableRef} request={oldRequest} requestDeps={['7d']} />,
    );
    await waitFor(() => expect(oldRequest).toHaveBeenCalledTimes(1));

    rerender(<Table tableRef={tableRef} request={newRequest} requestDeps={['7d']} />);
    await act(async () => {
      await tableRef.current!.refresh();
    });

    expect(oldRequest).toHaveBeenCalledTimes(1);
    expect(newRequest).toHaveBeenCalledTimes(1);
    expect(newRequest).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortState: null,
      quickFilters: {},
    });
  });

  it('clears the row selection when requestDeps changes', async () => {
    const request = mockRequest();
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <Table
        request={request}
        requestDeps={['7d']}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkbox = await screen.findByRole('checkbox', { name: 'Select row' });
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    onSelectionChange.mockClear();

    rerender(
      <Table
        request={request}
        requestDeps={['year']}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    expect(onSelectionChange).toHaveBeenCalledWith([]);
    const after = await screen.findByRole('checkbox', { name: 'Select row' });
    expect((after as HTMLInputElement).checked).toBe(false);
  });

  it('without requestDeps, a new request function does not re-fetch (0.2.1 behaviour)', async () => {
    const oldRequest = mockRequest();
    const newRequest = mockRequest();
    const { rerender } = render(<Table request={oldRequest} />);
    await waitFor(() => expect(oldRequest).toHaveBeenCalledTimes(1));

    rerender(<Table request={newRequest} />);
    await act(async () => {});

    expect(oldRequest).toHaveBeenCalledTimes(1);
    expect(newRequest).not.toHaveBeenCalled();
  });
});

describe('FloTable data mode', () => {
  it('renders new data without fetching or changing page', async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <FloTable<Refund>
        columns={columns}
        data={rows('A').data}
        totalRows={1}
        page={1}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText('A')).toBeTruthy();

    rerender(
      <FloTable<Refund>
        columns={columns}
        data={rows('B').data}
        totalRows={1}
        page={1}
        onPageChange={onPageChange}
      />,
    );
    await act(async () => {});

    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.queryByText('A')).toBeNull();
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
