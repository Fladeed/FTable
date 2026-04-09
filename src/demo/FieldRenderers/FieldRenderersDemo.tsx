'use client';

import { useState, useMemo } from 'react';
import FTable from '@/components/FTable/FTable';
import type { ColumnDef } from '@/components/FTable/FTable.types';
import Link from 'next/link';
import './FieldRenderersDemo.css';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  releaseDate: string;
  inStock: boolean;
  status: string;
  website: string | { href: string; label: string };
  score: number;
}

const COLUMNS: ColumnDef<Product>[] = [
  {
    key: 'id',
    header: 'ID',
    type: 'number',
  },
  {
    key: 'name',
    header: 'Name (text)',
    type: 'text',
  },
  {
    key: 'stock',
    header: 'Stock (number)',
    type: 'number',
  },
  {
    key: 'price',
    header: 'Price (currency)',
    type: 'currency',
    currency: 'EUR',
    locale: 'de-DE',
  },
  {
    key: 'releaseDate',
    header: 'Released (date)',
    type: 'date',
    locale: 'en-GB',
  },
  {
    key: 'inStock',
    header: 'Available (boolean)',
    type: 'boolean',
  },
  {
    key: 'status',
    header: 'Status (badge)',
    type: 'badge',
    badgeColors: {
      Active: '#d1fae5',
      Discontinued: '#fee2e2',
      'Coming Soon': '#dbeafe',
      Draft: '#f3f4f6',
    },
  },
  {
    key: 'website',
    header: 'Website (link)',
    type: 'link',
  },
  {
    key: 'score',
    header: 'Score (custom render)',
    render: (value) => {
      const score = Number(value);
      const filled = Math.round(score / 20); // 0–100 → 0–5 stars
      return (
        <span title={`${score}/100`} style={{ letterSpacing: '0.1em' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              style={{ color: i < filled ? '#f59e0b' : '#d1d5db' }}
            >
              ★
            </span>
          ))}
        </span>
      );
    },
  },
];

const DATA: Product[] = [
  {
    id: 1,
    name: 'Pro Keyboard X1',
    category: 'Peripherals',
    stock: 142,
    price: 129.99,
    releaseDate: '2023-06-15',
    inStock: true,
    status: 'Active',
    website: { href: 'https://example.com/x1', label: 'example.com/x1' },
    score: 88,
  },
  {
    id: 2,
    name: 'Wireless Mouse M5',
    category: 'Peripherals',
    stock: 0,
    price: 49.95,
    releaseDate: '2022-11-01',
    inStock: false,
    status: 'Discontinued',
    website: 'https://example.com/m5',
    score: 60,
  },
  {
    id: 3,
    name: 'Ultra Monitor 4K',
    category: 'Displays',
    stock: 37,
    price: 899.0,
    releaseDate: '2024-02-20',
    inStock: true,
    status: 'Active',
    website: { href: 'https://example.com/4k', label: 'example.com/4k' },
    score: 95,
  },
  {
    id: 4,
    name: 'Portable SSD 1TB',
    category: 'Storage',
    stock: 280,
    price: 109.9,
    releaseDate: '2023-09-05',
    inStock: true,
    status: 'Active',
    website: 'https://example.com/ssd1tb',
    score: 82,
  },
  {
    id: 5,
    name: 'Gaming Headset Z9',
    category: 'Audio',
    stock: 0,
    price: 199.0,
    releaseDate: '2021-04-18',
    inStock: false,
    status: 'Discontinued',
    website: { href: 'https://example.com/z9', label: 'example.com/z9' },
    score: 45,
  },
  {
    id: 6,
    name: 'Compact Hub USB-C',
    category: 'Accessories',
    stock: 512,
    price: 34.5,
    releaseDate: '2024-07-01',
    inStock: true,
    status: 'Coming Soon',
    website: 'https://example.com/hub',
    score: 70,
  },
  {
    id: 7,
    name: 'Ergonomic Stand Pro',
    category: 'Furniture',
    stock: 88,
    price: 249.0,
    releaseDate: '2023-12-10',
    inStock: true,
    status: 'Active',
    website: { href: 'https://example.com/stand', label: 'example.com/stand' },
    score: 77,
  },
  {
    id: 8,
    name: 'Webcam FHD 60fps',
    category: 'Peripherals',
    stock: 5,
    price: 79.99,
    releaseDate: '2025-01-15',
    inStock: true,
    status: 'Draft',
    website: 'https://example.com/webcam',
    score: 55,
  },
];

const PAGE_SIZE = 8;

export function FieldRenderersDemo() {
  const [page, setPage] = useState(1);

  const pageData = useMemo(
    () => DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page],
  );

  return (
    <main className="demo-page">
      <nav className="demo-nav">
        <Link href="/" className="demo-nav__link">← Back to main demo</Link>
      </nav>

      <h1 className="demo-page__title">Field Renderers Demo</h1>
      <p className="demo-page__subtitle">
        Each column exercises a different renderer:{' '}
        <code>text</code>, <code>number</code>, <code>currency</code>,{' '}
        <code>date</code>, <code>boolean</code>, <code>badge</code>,{' '}
        <code>link</code>, and a <strong>custom render</strong> function (star rating).
      </p>

      <FTable
        columns={COLUMNS}
        data={pageData}
        totalRows={DATA.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </main>
  );
}
