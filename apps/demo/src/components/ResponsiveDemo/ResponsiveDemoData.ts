import type { ColumnDef, FilterDef } from 'flotable';

export interface Order {
  id: number;
  reference: string;
  customer: string;
  status: string;
  channel: string;
  paymentMethod: string;
  total: number;
  placedAt: string;
}

export const COLUMNS: ColumnDef<Order>[] = [
  { key: 'id', header: 'ID', type: 'number', priority: 3 },
  { key: 'reference', header: 'Reference', type: 'text', priority: 3 },
  { key: 'customer', header: 'Customer', type: 'text', priority: 3 },
  {
    key: 'status',
    header: 'Status',
    type: 'badge',
    badgeColors: {
      Paid: '#dcfce7',
      Pending: '#fef9c3',
      Refunded: '#fee2e2',
      Cancelled: '#e5e7eb',
    },
    priority: 2,
  },
  { key: 'channel', header: 'Channel', type: 'text', priority: 1 },
  { key: 'paymentMethod', header: 'Payment', type: 'text', priority: 1 },
  { key: 'total', header: 'Total', type: 'currency', currency: 'USD', priority: 2 },
  { key: 'placedAt', header: 'Placed', type: 'date', priority: 1 },
];

export const FILTER_DEFS: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Pending', 'Refunded', 'Cancelled'] },
  { key: 'channel', label: 'Channel', type: 'select', options: ['Web', 'POS', 'Marketplace', 'Wholesale'] },
  { key: 'paymentMethod', label: 'Payment', type: 'select', options: ['Card', 'Cash', 'Bank Transfer', 'COD'] },
  { key: 'customer', label: 'Customer', type: 'text' },
  { key: 'total', label: 'Min Total', type: 'number' },
  { key: 'placedAt', label: 'Placed After', type: 'date' },
];

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'James'];
const LAST_NAMES = ['Martin', 'Chen', 'White', 'Park', 'Torres', 'Müller', 'Kim', 'Walsh', 'Nakamura', 'Ford'];
const STATUSES = ['Paid', 'Pending', 'Refunded', 'Cancelled'];
const CHANNELS = ['Web', 'POS', 'Marketplace', 'Wholesale'];
const METHODS = ['Card', 'Cash', 'Bank Transfer', 'COD'];

export function buildOrders(count: number): Order[] {
  const rows: Order[] = [];
  for (let i = 1; i <= count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const month = ((i * 3) % 12) + 1;
    const day = ((i * 11) % 27) + 1;
    rows.push({
      id: 1000 + i,
      reference: `ORD-${(1000 + i).toString().padStart(5, '0')}`,
      customer: `${first} ${last}`,
      status: STATUSES[i % STATUSES.length],
      channel: CHANNELS[(i * 5) % CHANNELS.length],
      paymentMethod: METHODS[(i * 13) % METHODS.length],
      total: 50 + ((i * 137) % 4500),
      placedAt: `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    });
  }
  return rows;
}

export const SAMPLE_ORDERS = buildOrders(24);
