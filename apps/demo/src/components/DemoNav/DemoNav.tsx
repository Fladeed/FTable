'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './DemoNav.css';

const TABS = [
  { href: '/', label: 'Demo' },
  { href: '/field-renderers', label: 'Field Renderers' },
  { href: '/style-customization', label: 'Style Customization' },
] as const;

export function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" role="navigation" aria-label="Demo pages">
      {TABS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`site-nav__tab${isActive ? ' site-nav__tab--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
