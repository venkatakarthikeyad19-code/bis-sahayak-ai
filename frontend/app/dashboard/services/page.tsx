import { ExternalLink, ShieldCheck, Award, FileCheck2, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'

const SERVICES = [
  {
    icon: ShieldCheck,
    title: 'ISI Mark Certification',
    description:
      'Mandatory certification scheme for products covered under compulsory registration. Ensures products conform to the relevant Indian Standard.',
    for: 'Manufacturers of domestic & industrial goods',
    href: 'https://www.manakonline.in/MANAK/eBISLogin',
  },
  {
    icon: Award,
    title: 'CRS Registration',
    description:
      'Compulsory Registration Scheme for electronics and IT goods. Self-declaration of conformity backed by testing in BIS-recognized labs.',
    for: 'Electronics & IT product importers',
    href: 'https://www.crsbis.in/BIS/',
  },
  {
    icon: FileCheck2,
    title: 'Hallmarking',
    description:
      'Third-party assurance of the purity of gold and silver articles. Registration for jewellers and assaying & hallmarking centres.',
    for: 'Jewellers & bullion dealers',
    href: 'https://www.manakonline.in/MANAK/HallmarkingHomePage',
  },
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="BIS Services"
        subtitle="Explore Bureau of Indian Standards certification schemes and access the official portals to begin your application."
      />

      {/* Service cards grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-text-secondary">
                {s.description}
              </p>

              <div className="mt-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    For:
                  </span>
                  <span className="text-xs text-foreground">{s.for}</span>
                </div>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <ExternalLink className="size-[18px]" aria-hidden="true" />
                  Visit Official Portal
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Need help deciding — gradient-bordered callout */}
      <div className="rounded-xl gradient-primary p-px shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center gap-4 rounded-[calc(12px-1px)] bg-card px-4 py-8 sm:px-6 sm:py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">Need help deciding?</h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
              Not sure which certification applies to your product? Let our AI assistant analyze your
              requirements and recommend the right path.
            </p>
          </div>
          <a
            href="/dashboard"
            className="flex h-10 items-center gap-2 rounded-lg gradient-primary px-5 text-sm font-medium text-white transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Ask the AI Assistant
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
