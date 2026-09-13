import type { ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ReadinessProvider } from '@/lib/readiness-context'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ReadinessProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ReadinessProvider>
  )
}
