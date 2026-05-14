'use client';

import { FloTable } from 'flotable';
import type { ColumnDef, FilterDef, FloTableRequestFn } from 'flotable';
import { simulateFetch } from '../../utils/demoUtils';
import './ApiDataSourceDemo.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

const COLUMNS: ColumnDef<Product>[] = [
  { key: 'id', header: 'ID', type: 'number', sortable: true },
  { key: 'name', header: 'Product', type: 'text', sortable: true, filterable: true },
  { key: 'category', header: 'Category', type: 'text', sortable: true, filterable: true },
  { key: 'price', header: 'Price', type: 'currency', sortable: true },
  { key: 'inStock', header: 'In Stock', type: 'boolean', filterable: true },
];

const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: 'Wireless Keyboard',      category: 'Electronics',   price: 79.99,  inStock: true  },
  { id: 2,  name: 'Ergonomic Mouse',         category: 'Electronics',   price: 49.99,  inStock: true  },
  { id: 3,  name: 'Standing Desk',           category: 'Furniture',     price: 549.00, inStock: false },
  { id: 4,  name: 'Monitor 27"',             category: 'Electronics',   price: 399.00, inStock: true  },
  { id: 5,  name: 'USB-C Hub',               category: 'Accessories',   price: 39.99,  inStock: true  },
  { id: 6,  name: 'Webcam HD',               category: 'Electronics',   price: 89.99,  inStock: false },
  { id: 7,  name: 'Desk Lamp',               category: 'Furniture',     price: 34.99,  inStock: true  },
  { id: 8,  name: 'Noise-Cancelling Headset',category: 'Electronics',   price: 199.99, inStock: true  },
  { id: 9,  name: 'Laptop Stand',            category: 'Accessories',   price: 59.99,  inStock: true  },
  { id: 10, name: 'Cable Management Kit',    category: 'Accessories',   price: 19.99,  inStock: true  },
  { id: 11, name: 'Mechanical Keyboard',     category: 'Electronics',   price: 149.99, inStock: false },
  { id: 12, name: 'Office Chair',            category: 'Furniture',     price: 399.00, inStock: true  },
  { id: 13, name: 'Monitor Arm',             category: 'Accessories',   price: 74.99,  inStock: true  },
  { id: 14, name: 'Portable SSD 1TB',        category: 'Storage',       price: 109.99, inStock: true  },
  { id: 15, name: 'Trackpad',                category: 'Electronics',   price: 129.00, inStock: false },
  { id: 16, name: 'Desk Organiser',          category: 'Furniture',     price: 24.99,  inStock: true  },
  { id: 17, name: 'HDMI Cable 2m',           category: 'Accessories',   price: 12.99,  inStock: true  },
  { id: 18, name: 'Microphone USB',          category: 'Electronics',   price: 89.00,  inStock: true  },
  { id: 19, name: 'Charging Pad',            category: 'Accessories',   price: 29.99,  inStock: false },
  { id: 20, name: 'Bookshelf',               category: 'Furniture',     price: 119.00, inStock: true  },
];

const FILTER_DEFS: FilterDef[] = [
  { key: 'inStock', label: 'In Stock', type: 'boolean', options: ['true', 'false'] },
];

// Defined outside the component so the reference is stable
// (prevents FloTable from re-fetching on every render).
const fetchProducts: FloTableRequestFn<Product> = simulateFetch(ALL_PRODUCTS, 1000);

// A request that always rejects — used to demonstrate the error + retry UI.
const fetchWithError: FloTableRequestFn<Product> = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  throw new Error('Network error: connection refused');
};

export function ApiDataSourceDemo() {
  return (
    <main className="demo-shell demo-page-shell">
      <h1 className="demo-shell__title">FloTable — API Data Source</h1>

      <section className="api-demo__section">
        <h2 className="api-demo__section-title">Request mode</h2>
        <p className="api-demo__description">
          Pass a <code>request</code> prop instead of <code>data</code>. FloTable manages its own
          page, sort, and filter state and calls the async function automatically — including on
          mount. Sorting, filtering, and pagination all trigger a new call.
        </p>
        <FloTable
          columns={COLUMNS}
          request={fetchProducts}
          pageSize={5}
          autoFilters={true}
          showSearch={true}
        />
      </section>

      <section className="api-demo__section">
        <h2 className="api-demo__section-title">Error state</h2>
        <p className="api-demo__description">
          When the <code>request</code> promise rejects, FloTable displays the error message and a
          <strong> Retry</strong> button that re-invokes the function.
        </p>
        <FloTable columns={COLUMNS} request={fetchWithError} pageSize={5} />
      </section>

      <section className="api-demo__section">
        <h2 className="api-demo__section-title">Initial filters</h2>
        <p className="api-demo__description">
          Pass <code>initialQuickFilters</code> to seed the internal filter state on mount.
          The first request fires with those filters already applied and the pill renders
          pre-populated. The user can change or clear it freely, and the state resets back
          to the initial value if the component is remounted via a <code>key</code> change.
        </p>
        <FloTable
          columns={COLUMNS}
          request={fetchProducts}
          pageSize={5}
          filterDefs={FILTER_DEFS}
          initialQuickFilters={{ inStock: 'true' }}
        />
      </section>

      <section className="api-demo__section">
        <h2 className="api-demo__section-title">Initial sort</h2>
        <p className="api-demo__description">
          Pass <code>initialSort</code> to seed the internal sort state on mount.
          The column header renders the sort arrow on first paint, the first
          request fires with the seeded sort already applied, and the user can
          click any sortable header to override it. The state resets back to the
          initial value if the component is remounted via a <code>key</code>{' '}
          change.
        </p>
        <FloTable
          columns={COLUMNS}
          request={fetchProducts}
          pageSize={5}
          initialSort={{ key: 'price', direction: 'desc' }}
        />
      </section>
    </main>
  );
}
