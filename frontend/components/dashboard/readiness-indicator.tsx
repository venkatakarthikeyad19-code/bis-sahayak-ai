'use client'

import { Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { useReadiness } from '@/lib/readiness-context'
import { cn } from '@/lib/utils'

export function ReadinessIndicator({ value }: { value?: number }) {
  const { score, productName } = useReadiness()
  
  // Use explicit prop value if provided, otherwise dynamic context score
  const displayScore = value !== undefined ? value : score
  const clamped = Math.max(0, Math.min(100, Math.round(displayScore)))
  const hasActiveProduct = Boolean(productName) || clamped > 0

  // Status tiers based on actual progress
  const getStatus = (val: number) => {
    if (!hasActiveProduct) return { label: 'Not Started', color: 'text-text-muted', barColor: 'bg-secondary' }
    if (val >= 80) return { label: 'Ready to File', color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' }
    if (val >= 50) return { label: 'In Progress', color: 'text-primary', barColor: 'gradient-primary' }
    if (val > 0) return { label: 'Early Stage', color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' }
    return { label: 'Pending Checks', color: 'text-text-muted', barColor: 'bg-secondary' }
  }

  const status = getStatus(clamped)

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-[var(--shadow-card)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md gradient-primary">
            <Sparkles className="size-3.5 text-white" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {productName ? productName : 'AI Readiness'}
            </p>
            <p className="text-[10px] text-text-muted truncate">
              {productName ? 'Compliance Profile' : 'Interactive Assessment'}
            </p>
          </div>
        </div>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border shrink-0', status.color)}>
          {status.label}
        </span>
      </div>

      {/* Score number */}
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-foreground">{clamped}%</span>
        <span className="text-[11px] text-text-muted">
          {hasActiveProduct ? `${clamped} / 100 score` : '0 / 100'}
        </span>
      </div>

      {/* Dynamic progress bar */}
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="AI readiness score"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', status.barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Helpful context guidance */}
      <p className="mt-2.5 text-[11px] leading-relaxed text-text-muted">
        {hasActiveProduct ? (
          clamped === 100 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ All prerequisites complete. Ready for official BIS application.
            </span>
          ) : (
            `Toggle checklist items in the workspace to update score dynamically.`
          )
        ) : (
          `Ask AI Assistant about a product to calculate live readiness.`
        )}
      </p>
    </div>
  )
}
