'use client'

import { Sparkles } from 'lucide-react'
import { useReadiness } from '@/lib/readiness-context'

export function ReadinessIndicator({ value }: { value?: number }) {
  const { score, productName } = useReadiness()
  const displayScore = value !== undefined ? value : (score > 0 ? score : 65)
  const clamped = Math.max(0, Math.min(100, displayScore))

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md gradient-primary">
          <Sparkles className="size-4 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground">AI Readiness</p>
          <p className="text-[11px] text-text-muted">Compliance profile</p>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-foreground">{clamped}</span>
        <span className="text-[11px] text-text-muted">/ 100</span>
      </div>

      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="AI readiness score"
      >
        <div
          className="h-full rounded-full gradient-primary transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
        Complete a scan to improve your readiness score.
      </p>
    </div>
  )
}
