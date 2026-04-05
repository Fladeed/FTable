'use client';

import { useState } from 'react';
import type { FTableProps } from './FTable.types';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import './FTable.css';

const DEFAULT_PAGE_SIZE = 10;

export default function FTable<T extends object>({
  columns,
  data,
  pageSize = DEFAULT_PAGE_SIZE,
}: FTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = data.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <div>
      <div className="ftable-wrapper">
        <table className="ftable">
          <TableHeader columns={columns} />
          <TableBody columns={columns} rows={paginatedData} />
        </table>
      </div>

      <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage((p) => p - 1)}
          onNext={() => setCurrentPage((p) => p + 1)}
        />
    </div>
  );
}
