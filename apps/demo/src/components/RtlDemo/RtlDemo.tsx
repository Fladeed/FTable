'use client';

import { FloTable } from 'flotable';
import type { ColumnDef, FilterDef, FloTableRequestFn, RowAction } from 'flotable';
import { simulateFetch } from '../../utils/demoUtils';
import './RtlDemo.css';

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  status: string;
}

const COLUMNS_LTR: ColumnDef<Employee>[] = [
  { key: 'id',         header: 'ID',           type: 'number' },
  { key: 'name',       header: 'Name',          type: 'text',  sortable: true, filterable: true },
  { key: 'department', header: 'Department',    type: 'text',  sortable: true, filterable: true },
  { key: 'role',       header: 'Role',          type: 'text',  sortable: true },
  { key: 'status',     header: 'Status',        type: 'badge', sortable: true, filterable: true,
    badgeColors: { active: '#dcfce7', inactive: '#fee2e2' } },
];

const COLUMNS_RTL: ColumnDef<Employee>[] = [
  { key: 'id',         header: 'الرقم',         type: 'number' },
  { key: 'name',       header: 'الاسم',          type: 'text',  sortable: true, filterable: true },
  { key: 'department', header: 'القسم',          type: 'text',  sortable: true, filterable: true },
  { key: 'role',       header: 'المنصب',         type: 'text',  sortable: true },
  { key: 'status',     header: 'الحالة',         type: 'badge', sortable: true, filterable: true,
    badgeColors: { 'نشط': '#dcfce7', 'غير نشط': '#fee2e2' } },
];

const FILTER_DEFS_LTR: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
];

const FILTER_DEFS_RTL: FilterDef[] = [
  { key: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'غير نشط'] },
];

const ROW_ACTIONS_LTR: RowAction<Employee>[] = [
  { key: 'edit',   label: 'Edit',   onClick: () => {} },
  { key: 'delete', label: 'Delete', onClick: () => {}, danger: true },
];

const ROW_ACTIONS_RTL: RowAction<Employee>[] = [
  { key: 'edit',   label: 'تعديل',  onClick: () => {} },
  { key: 'delete', label: 'حذف',    onClick: () => {}, danger: true },
];

const EMPLOYEES_LTR: Employee[] = [
  { id: 1, name: 'Alice Martin',  department: 'Engineering', role: 'Frontend Dev',    status: 'active'   },
  { id: 2, name: 'Bob Chen',      department: 'Design',      role: 'UI Designer',     status: 'active'   },
  { id: 3, name: 'Carol White',   department: 'Engineering', role: 'Backend Dev',     status: 'inactive' },
  { id: 4, name: 'David Lee',     department: 'Marketing',   role: 'Growth Manager',  status: 'active'   },
  { id: 5, name: 'Eva Rossi',     department: 'Engineering', role: 'DevOps',          status: 'active'   },
  { id: 6, name: 'Frank Kim',     department: 'Design',      role: 'Product Manager', status: 'inactive' },
  { id: 7, name: 'Grace Patel',   department: 'Engineering', role: 'QA Engineer',     status: 'active'   },
  { id: 8, name: 'Hugo Müller',   department: 'Marketing',   role: 'Content Writer',  status: 'active'   },
];

const EMPLOYEES_RTL: Employee[] = [
  { id: 1, name: 'أحمد الخالدي',   department: 'الهندسة',     role: 'مطوّر واجهات',     status: 'نشط'      },
  { id: 2, name: 'فاطمة العمري',   department: 'التصميم',     role: 'مصممة UI',         status: 'نشط'      },
  { id: 3, name: 'يوسف الحسن',     department: 'الهندسة',     role: 'مطوّر خلفية',       status: 'غير نشط'  },
  { id: 4, name: 'مريم التونسي',   department: 'التسويق',     role: 'مديرة نمو',         status: 'نشط'      },
  { id: 5, name: 'عمر بن علي',     department: 'الهندسة',     role: 'DevOps',           status: 'نشط'      },
  { id: 6, name: 'نور الرشيدي',    department: 'التصميم',     role: 'مدير منتج',         status: 'غير نشط'  },
  { id: 7, name: 'سارة المنصوري',  department: 'الهندسة',     role: 'مهندسة جودة',       status: 'نشط'      },
  { id: 8, name: 'خالد الزهراني',  department: 'التسويق',     role: 'كاتب محتوى',        status: 'نشط'      },
];

const fetchLtr: FloTableRequestFn<Employee> = simulateFetch(EMPLOYEES_LTR, 600);
const fetchRtl: FloTableRequestFn<Employee> = simulateFetch(EMPLOYEES_RTL, 600);

export function RtlDemo() {
  return (
    <main className="demo-shell demo-page-shell">
      <h1 className="demo-shell__title">FloTable — RTL Support</h1>

      <section className="rtl-demo__section">
        <h2 className="rtl-demo__section-title">LTR (default)</h2>
        <p className="rtl-demo__description">
          Standard left-to-right layout. No <code>direction</code> prop needed —{' '}
          <code>&apos;ltr&apos;</code> is the default.
        </p>
        <FloTable
          columns={COLUMNS_LTR}
          request={fetchLtr}
          pageSize={5}
          filterDefs={FILTER_DEFS_LTR}
          showSearch={true}
          rowActions={ROW_ACTIONS_LTR}
        />
      </section>

      <section className="rtl-demo__section">
        <h2 className="rtl-demo__section-title" dir="rtl">RTL — العربية</h2>
        <p className="rtl-demo__description">
          Pass <code>direction=&quot;rtl&quot;</code> to flip the layout. The root element receives{' '}
          <code>dir=&quot;rtl&quot;</code> and CSS logical properties handle the rest — column
          order, header alignment, sort indicators, filter pills, dropdown position, and
          pagination all mirror automatically.
        </p>
        <FloTable
          columns={COLUMNS_RTL}
          request={fetchRtl}
          pageSize={5}
          filterDefs={FILTER_DEFS_RTL}
          showSearch={true}
          rowActions={ROW_ACTIONS_RTL}
          rowActionsLabel="الإجراءات"
          paginationLabels={{
            prev: 'السابق',
            next: 'التالي',
            pageInfo: (c, t) => `صفحة ${c} من ${t}`,
          }}
          direction="rtl"
        />
      </section>
    </main>
  );
}
