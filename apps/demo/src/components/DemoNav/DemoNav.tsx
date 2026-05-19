'use client';

import { useEffect, useState } from 'react';
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
  { href: '/responsive', label: 'Responsive' },
] as const;

export function DemoNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="site-mobile-toggle"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        aria-controls="site-sidebar"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="site-mobile-toggle__bar" />
        <span className="site-mobile-toggle__bar" />
        <span className="site-mobile-toggle__bar" />
      </button>
      {isOpen && (
        <div
          className="site-mobile-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="site-sidebar"
        className={`site-sidebar${isOpen ? ' site-sidebar--open' : ''}`}
        aria-label="Demo navigation"
      >
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
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
