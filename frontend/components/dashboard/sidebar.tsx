'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ScanLine, Building2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReadinessIndicator } from './readiness-indicator'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'AI Assistant', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'Scan & Verify', icon: ScanLine },
  { href: '/dashboard/services', label: 'BIS Services', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo + name */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg gradient-primary shadow-[var(--shadow-card)]">
          <ShieldCheck className="size-5 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-tight text-foreground">BIS Sahayak</p>
          <p className="truncate text-[11px] text-text-muted">Compliance Assistant</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                active
                  ? 'gradient-primary text-white shadow-[var(--shadow-card)]'
                  : 'text-text-secondary hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Readiness indicator pinned to bottom */}
      <div className="p-3">
        <ReadinessIndicator value={68} />
      </div>
    </aside>
  )
}
