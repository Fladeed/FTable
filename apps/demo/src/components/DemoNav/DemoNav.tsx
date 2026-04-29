'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './DemoNav.css';

const TABS = [
  { href: '/', label: 'Demo' },
  { href: '/field-renderers', label: 'Field Renderers' },
  { href: '/style-customization', label: 'Style Customization' },
  { href: '/api-data-source', label: 'API Data Source' },
  { href: '/filter-pills', label: 'Filter Pills' },
  { href: '/filter-mode', label: 'Filter Mode' },
  { href: '/row-actions', label: 'Row Actions' },
  { href: '/bulk-actions', label: 'Bulk Actions' },
  { href: '/rtl-support', label: 'RTL Support' },
  { href: '/theming', label: 'Theming' },
] as const;

export function DemoNav() {
  const pathname = usePathname();

  return (
    <aside className="site-sidebar" aria-label="Demo navigation">
      <div className="site-sidebar__logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/FloTable-logo.svg"
          alt="FloTable"
          className="site-sidebar__logo-img"
        />
      </div>
      <nav className="site-nav" role="navigation">
        {TABS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
