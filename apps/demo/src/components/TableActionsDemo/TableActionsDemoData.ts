import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef, FilterDef, SortState, QuickFilterState } from 'flotable';
import { applySorting, applyFilters } from '../../utils/demoUtils';

export type Direction = 'ltr' | 'rtl';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

export const PAGE_SIZE = 5;

export const COLUMNS: Record<Direction, ColumnDef<Product>[]> = {
  ltr: [
    { key: 'id', header: 'ID', type: 'number' },
    { key: 'name', header: 'Name', type: 'text', sortable: true },
    { key: 'category', header: 'Category', type: 'text', sortable: true },
    { key: 'price', header: 'Price', type: 'currency', sortable: true },
    { key: 'inStock', header: 'In stock', type: 'boolean' },
  ],
  rtl: [
    { key: 'id', header: 'الرقم', type: 'number' },
    { key: 'name', header: 'الاسم', type: 'text', sortable: true },
    { key: 'category', header: 'الفئة', type: 'text', sortable: true },
    { key: 'price', header: 'السعر', type: 'currency', currency: 'MAD', sortable: true },
    { key: 'inStock', header: 'متوفر', type: 'boolean' },
  ],
};

export const FILTER_DEFS: Record<Direction, FilterDef[]> = {
  ltr: [{ key: 'category', label: 'Category', type: 'select', options: ['Hardware', 'Software', 'Services'] }],
  rtl: [{ key: 'category', label: 'الفئة', type: 'select', options: ['أجهزة', 'برمجيات', 'خدمات'] }],
};

const SEED: Record<Direction, Product[]> = {
  ltr: [
    { id: 1, name: 'Laptop stand', category: 'Hardware', price: 49, inStock: true },
    { id: 2, name: 'Accounting suite', category: 'Software', price: 299, inStock: true },
    { id: 3, name: 'On-site setup', category: 'Services', price: 150, inStock: false },
    { id: 4, name: 'Barcode scanner', category: 'Hardware', price: 89, inStock: true },
    { id: 5, name: 'Inventory module', category: 'Software', price: 199, inStock: true },
    { id: 6, name: 'Training session', category: 'Services', price: 120, inStock: true },
    { id: 7, name: 'Receipt printer', category: 'Hardware', price: 139, inStock: false },
  ],
  rtl: [
    { id: 1, name: 'حامل حاسوب', category: 'أجهزة', price: 490, inStock: true },
    { id: 2, name: 'برنامج المحاسبة', category: 'برمجيات', price: 2990, inStock: true },
    { id: 3, name: 'تركيب في الموقع', category: 'خدمات', price: 1500, inStock: false },
    { id: 4, name: 'قارئ الباركود', category: 'أجهزة', price: 890, inStock: true },
    { id: 5, name: 'وحدة المخزون', category: 'برمجيات', price: 1990, inStock: true },
    { id: 6, name: 'جلسة تدريب', category: 'خدمات', price: 1200, inStock: true },
    { id: 7, name: 'طابعة الإيصالات', category: 'أجهزة', price: 1390, inStock: false },
  ],
};

export const LABELS: Record<
  Direction,
  {
    addRow: string;
    export: string;
    deleteSelected: string;
    newRowName: (id: number) => string;
    feedback: (action: string) => string;
    idle: string;
    period: string;
    periods: string[];
    periodDetails: string;
    periodPanel: (period: string) => string;
  }
> = {
  ltr: {
    addRow: 'Add row',
    export: 'Export',
    deleteSelected: 'Delete selected',
    newRowName: (id) => `New product #${id}`,
    feedback: (action) => `Last action: ${action}`,
    idle: 'No action clicked yet',
    period: 'Period',
    periods: ['This month', 'Last month', 'This year'],
    periodDetails: 'Period details',
    periodPanel: (period) => `Showing products for: ${period}. This panel is absolutely positioned inside toolbarEnd and overlaps the table without being clipped.`,
  },
  rtl: {
    addRow: 'إضافة صف',
    export: 'تصدير',
    deleteSelected: 'حذف المحدد',
    newRowName: (id) => `منتج جديد #${id}`,
    feedback: (action) => `آخر إجراء: ${action}`,
    idle: 'لم يتم النقر على أي إجراء بعد',
    period: 'الفترة',
    periods: ['هذا الشهر', 'الشهر الماضي', 'هذه السنة'],
    periodDetails: 'تفاصيل الفترة',
    periodPanel: (period) => `عرض المنتجات لـ: ${period}. هذه اللوحة ذات موضع مطلق داخل toolbarEnd وتظهر فوق الجدول دون أن تُقصّ.`,
  },
};

export function useTableState(direction: Direction) {
  const [rows, setRows] = useState<Product[]>(SEED[direction]);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Product> | null>(null);
  const [filterState, setFilterState] = useState<QuickFilterState>({});

  const filteredData = useMemo(() => applyFilters(rows, filterState), [rows, filterState]);
  const sortedData = useMemo(() => applySorting(filteredData, sortState), [filteredData, sortState]);
  const pageData = useMemo(
    () => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedData, page],
  );

  function addRow() {
    setRows((prev) => {
      const id = prev.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      const category = SEED[direction][0].category;
      return [...prev, { id, name: LABELS[direction].newRowName(id), category, price: 0, inStock: true }];
    });
  }

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
  }, [sortedData.length, page]);

  function removeRows(ids: number[]) {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
  }

  return { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData, addRow, removeRows };
}
