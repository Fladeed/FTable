import type { ColumnDef } from 'flotable';

export interface Variant {
  id: string;
  option: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  status: string;
  /** Base price — also used as the sortable parent value. */
  price: number;
  /** Precomputed children count (kept in sync with variants.length). */
  variantCount: number;
  variants: Variant[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'p7',
    name: 'Logo Sticker Pack',
    category: 'Accessories',
    status: 'Active',
    price: 3,
    variantCount: 16,
    variants: Array.from({ length: 16 }, (_, i) => ({
      id: `p7-v${i + 1}`,
      option: `Design #${i + 1}`,
      sku: `SKU-7${String(i + 1).padStart(2, '0')}`,
      price: 3 + (i % 4),
      stock: (i * 7) % 25,
    })),
  },
  {
    id: 'p1',
    name: 'T-Shirt Classic',
    category: 'Apparel',
    status: 'Active',
    price: 20,
    variantCount: 3,
    variants: [
      { id: 'p1-v1', option: 'Red / M', sku: 'SKU-001', price: 20, stock: 12 },
      { id: 'p1-v2', option: 'Red / L', sku: 'SKU-002', price: 22, stock: 4 },
      { id: 'p1-v3', option: 'Blue / M', sku: 'SKU-003', price: 25, stock: 0 },
    ],
  },
  {
    id: 'p2',
    name: 'Coffee Beans 1kg',
    category: 'Grocery',
    status: 'Active',
    price: 15,
    variantCount: 0,
    variants: [],
  },
  {
    id: 'p3',
    name: 'Running Shoes',
    category: 'Footwear',
    status: 'Active',
    price: 60,
    variantCount: 4,
    variants: [
      { id: 'p3-v1', option: 'Black / 41', sku: 'SKU-101', price: 60, stock: 8 },
      { id: 'p3-v2', option: 'Black / 42', sku: 'SKU-102', price: 60, stock: 5 },
      { id: 'p3-v3', option: 'White / 41', sku: 'SKU-103', price: 65, stock: 2 },
      { id: 'p3-v4', option: 'White / 43', sku: 'SKU-104', price: 65, stock: 0 },
    ],
  },
  {
    id: 'p4',
    name: 'Ceramic Mug',
    category: 'Home',
    status: 'Draft',
    price: 8,
    variantCount: 2,
    variants: [
      { id: 'p4-v1', option: 'Matte White', sku: 'SKU-201', price: 8, stock: 30 },
      { id: 'p4-v2', option: 'Gloss Black', sku: 'SKU-202', price: 9, stock: 18 },
    ],
  },
  {
    id: 'p5',
    name: 'Notebook A5',
    category: 'Stationery',
    status: 'Active',
    price: 5,
    variantCount: 0,
    variants: [],
  },
  {
    id: 'p6',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    status: 'Active',
    price: 90,
    variantCount: 2,
    variants: [
      { id: 'p6-v1', option: 'Charcoal', sku: 'SKU-301', price: 90, stock: 14 },
      { id: 'p6-v2', option: 'Ivory', sku: 'SKU-302', price: 95, stock: 6 },
    ],
  },
];

export const STATUS_COLORS: Record<string, string> = {
  Active: '#dcfce7',
  Draft: '#f3f4f6',
};

/** Formats the min–max price range of a product's variants (or "—" when none). */
function priceRange(children: Variant[]): string {
  if (children.length === 0) return '—';
  const prices = children.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min}` : `$${min}–$${max}`;
}

export const PARENT_COLUMNS: ColumnDef<Product, Variant>[] = [
  { key: 'name', header: 'Name' },
  { key: 'category', header: 'Category' },
  {
    key: 'variantCount',
    header: 'Variants',
    sortable: false,
    aggregate: (children) => (children.length ? `${children.length} variants` : '—'),
  },
  {
    key: 'price',
    header: 'Price',
    type: 'currency',
    aggregate: (children) => priceRange(children),
  },
  { key: 'status', header: 'Status', type: 'badge', badgeColors: STATUS_COLORS },
];

// Child columns are positioned to line up under the parent columns:
// Name → option, Category → SKU, Variants → (blank), Price → price, Status → stock.
export const CHILD_COLUMNS: ColumnDef<Variant>[] = [
  { key: 'option', header: 'Option', sortable: false },
  { key: 'sku', header: 'SKU', sortable: false },
  { key: 'id', header: '', sortable: false, render: () => '' },
  { key: 'price', header: 'Price', type: 'currency', sortable: false },
  {
    key: 'stock',
    header: 'Stock',
    sortable: false,
    render: (value) => `${value as number} in stock`,
  },
];
