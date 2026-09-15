'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ScanLine, Building2, ShieldCheck, Menu, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReadinessIndicator } from './readiness-indicator'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'AI Assistant', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'Scan & Verify', icon: ScanLine },
  { href: '/dashboard/services', label: 'BIS Services', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MOBILE TOP BAR (visible on < md)                       */}
      {/* ========================================================= */}
      <header className="flex md:hidden items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg gradient-primary shadow-[var(--shadow-card)]">
            <ShieldCheck className="size-4 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[14px] font-bold leading-tight text-foreground">BIS Sahayak</p>
            <p className="text-[10px] text-text-muted leading-tight">Compliance Assistant</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary active:scale-95"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* ========================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY & PANEL (< md)                   */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[82vw] bg-sidebar border-r border-sidebar-border p-4 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg gradient-primary shadow-xs">
                  <ShieldCheck className="size-4 text-white" />
                </span>
                <div>
                  <p className="text-[14px] font-bold leading-tight text-foreground">BIS Sahayak</p>
                  <p className="text-[10px] text-text-muted">Compliance Assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-1 flex-col gap-1.5 py-4">
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Menu
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
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'gradient-primary text-white shadow-xs'
                        : 'text-text-secondary hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Readiness Indicator */}
            <div className="pt-2 border-t border-sidebar-border">
              <ReadinessIndicator value={68} />
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DESKTOP SIDEBAR (hidden on < md, visible on md+)       */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-full">
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
                    : 'text-text-secondary hover:bg-secondary hover:text-foreground'
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

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (< md)                    */}
      {/* ========================================================= */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
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
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors min-w-[60px] sm:min-w-[70px]',
                active ? 'text-primary font-semibold' : 'text-text-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('size-5 transition-transform', active && 'scale-110 text-primary')} />
              <span className="text-[10px] sm:text-[11px] leading-none whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
