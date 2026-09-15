import type { ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ReadinessProvider } from '@/lib/readiness-context'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ReadinessProvider>
      <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 min-w-0">{children}</main>
      </div>
    </ReadinessProvider>
  )
}
