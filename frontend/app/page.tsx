import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function Page() {
  redirect('/dashboard')

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <p>Redirecting to <Link href="/dashboard" className="text-primary underline">Dashboard</Link>...</p>
    </div>
  )
}
