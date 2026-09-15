'use client'

import { useRef, useState } from 'react'
import {
  Upload,
  ScanLine,
  Laptop,
  Zap,
  CookingPot,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  FileText,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { cn } from '@/lib/utils'
import { analyzeLabelFile, verifyLabelText, type OCRVerificationResult } from '@/lib/api'

const SAMPLE_SCENARIOS = [
  {
    label: 'Electric Kettle (ISI Mark)',
    icon: Zap,
    hint: 'electric kettle',
    sampleText: 'AquaHeater Electric Kettle 1.5L | 230V AC 50Hz 1500W | IS 302 (Part 2/Sec 15) | CM/L-1234567 | Boil-Dry Protected',
  },
  {
    label: 'HP Laptop (CRS Scheme)',
    icon: Laptop,
    hint: 'laptop',
    sampleText: 'HP Laptop 15s-eq2144AU | Input: 19.5V 3.33A 65W | IS 13252 (Part 1) / IEC 60950-1 | R-41008765 | Made in India by HP India',
  },
  {
    label: 'Prestige Pressure Cooker',
    icon: CookingPot,
    hint: 'pressure cooker',
    sampleText: 'Prestige Deluxe Alpha Stainless Steel Cooker 5.5L | IS 2347 : 2017 | CM/L-8765432 | Max Working Pressure 100 kPa | TTK Prestige',
  },
  {
    label: 'Philips LED Lamp',
    icon: Lightbulb,
    hint: 'led bulb',
    sampleText: 'Philips Stellar Bright 9W B22 LED Bulb | 220-240V 50Hz 85mA | IS 16102 (Part 1) : 2012 | R-93010030 | Signify Innovations India',
  },
  {
    label: '🚨 Counterfeit Label (Fraud Demo)',
    icon: ShieldAlert,
    hint: 'laptop',
    sampleText: 'TechBrand Laptop Computer | IS 13252 (Part 1) | R-93010030 | Forged Label Test Scenario',
  },
]

export default function ScanPage() {
  const [dragging, setDragging] = useState(false)
  const [text, setText] = useState('')
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<OCRVerificationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(file: File) {
    if (!file) return
    setFileName(file.name)
    setScanning(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const data = await analyzeLabelFile(file)
      setResult(data)
    } catch (err: any) {
      console.error(err)
      // Fallback to text verification using file name
      try {
        const data = await verifyLabelText(file.name, file.name)
        setResult(data)
      } catch (fallbackErr) {
        setErrorMsg('Failed to process image. Ensure backend server is running on port 8000.')
      }
    } finally {
      setScanning(false)
    }
  }

  async function handleAnalyzeText(customText?: string, hint?: string) {
    const raw = (customText ?? text).trim()
    if (!raw) return

    setScanning(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const data = await verifyLabelText(raw, hint)
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Failed to connect to backend OCR verification API. Ensure backend is running.')
    } finally {
      setScanning(false)
    }
  }

  function handleSelectScenario(scenario: typeof SAMPLE_SCENARIOS[0]) {
    setActiveScenario(scenario.label)
    setText(scenario.sampleText)
    setFileName(null)
    handleAnalyzeText(scenario.sampleText, scenario.hint)
  }

  return (
    <div className="flex h-full flex-col gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="Scan & Verify"
        subtitle="Upload a product rating label or paste regulatory specifications to cross-reference authentic BIS licenses, detect counterfeit markings, and confirm quality control orders."
      />

      {/* Live demo scenarios */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Quick Verification Scenarios (Click to test)
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {SAMPLE_SCENARIOS.map((s) => {
            const Icon = s.icon
            const active = activeScenario === s.label
            const isFraud = s.label.includes('Counterfeit')
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSelectScenario(s)}
                disabled={scanning}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-[12px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
                  active
                    ? isFraud
                      ? 'border-rose-500 bg-rose-600 text-white shadow-md'
                      : 'border-transparent gradient-primary text-white shadow-md'
                    : isFraud
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100/60'
                    : 'border-border bg-card text-text-secondary hover:-translate-y-px hover:border-primary/50 hover:text-foreground'
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* LEFT: upload + OR + textarea */}
        <div className="flex flex-col gap-4">
          {/* Drag & drop box */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0])
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[160px]',
              dragging ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {fileName ? `Selected: ${fileName}` : 'Drag & drop label image or document'}
              </p>
              <p className="text-xs text-text-muted">
                or <span className="text-primary font-medium">browse files</span> · PNG, JPG, WebP up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0])
                }
              }}
              className="sr-only"
              aria-label="Upload document"
            />
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Text input box */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <label htmlFor="paste-text" className="mb-2 block text-xs font-semibold text-foreground">
              Paste product rating plate or regulatory label text
            </label>
            <textarea
              id="paste-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="e.g. Havells Kettle | IS 302 (Part 2/Sec 15) | CM/L-1234567 | 230V 1500W..."
              className="w-full resize-none rounded-lg border border-border bg-secondary p-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
            />
            <button
              type="button"
              onClick={() => handleAnalyzeText()}
              disabled={scanning || !text.trim()}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg gradient-primary text-xs font-semibold text-white transition-transform hover:-translate-y-px disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {scanning ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing with Gemini Vision &amp; BIS Knowledge Base...
                </>
              ) : (
                <>
                  <ScanLine className="size-4" aria-hidden="true" />
                  Analyze &amp; Verify Label
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Results panel */}
        <div className="flex flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="border-b border-border px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Verification Results</h2>
              <p className="text-[11px] text-text-secondary">
                Authenticity check against indexed BIS Standards &amp; Registries
              </p>
            </div>
            {result && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  result.verification_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : result.verification_status === 'conflict'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                )}
              >
                {result.verification_status}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5 overflow-y-auto">
            {scanning ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-xs font-semibold text-foreground">Processing Label Regulatory Markings...</p>
                <p className="text-[11px] text-text-muted max-w-xs">
                  Extracting IS Standard codes, R-Numbers, and verifying against DPIIT/MeitY Quality Control Orders.
                </p>
              </div>
            ) : errorMsg ? (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            ) : result ? (
              <div className="space-y-4 text-xs">
                {/* Status Hero Card */}
                <div
                  className={cn(
                    'rounded-xl border p-4 space-y-2',
                    result.verification_status === 'verified'
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : result.verification_status === 'conflict'
                      ? 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {result.verification_status === 'verified' ? (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : result.verification_status === 'conflict' ? (
                      <ShieldAlert className="size-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <h3
                      className={cn(
                        'text-sm font-bold',
                        result.verification_status === 'verified'
                          ? 'text-emerald-900 dark:text-emerald-200'
                          : result.verification_status === 'conflict'
                          ? 'text-rose-900 dark:text-rose-200'
                          : 'text-amber-900 dark:text-amber-200'
                      )}
                    >
                      {result.standard_title || (result.verification_status === 'verified' ? 'Verified Authentic Mark' : 'Verification Required')}
                    </h3>
                  </div>

                  <p className="text-[11px] leading-relaxed text-foreground/90 font-medium">
                    {result.message}
                  </p>
                </div>

                {/* Extracted Attributes Grid */}
                <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2">
                  <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Extracted Regulatory Entities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[10px] text-text-muted block">Product Name</span>
                      <span className="font-semibold text-foreground text-xs">{result.product}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[10px] text-text-muted block">Manufacturer / Brand</span>
                      <span className="font-semibold text-foreground text-xs">{result.manufacturer}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[10px] text-text-muted block">Indian Standard (IS)</span>
                      <span className="font-mono font-bold text-primary text-xs">{result.is_number || 'Not Detected'}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[10px] text-text-muted block">Licence / Registration</span>
                      <span className="font-mono font-bold text-foreground text-xs">{result.licence_information || 'Not Detected'}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance & Fraud Advice */}
                {result.compliance_details && (
                  <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
                    <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      Regulatory Pathway &amp; Action
                    </h4>
                    {result.compliance_details.scheme && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted">Scheme:</span>
                        <span className="font-semibold text-foreground">{result.compliance_details.scheme}</span>
                      </div>
                    )}
                    {result.compliance_details.portal && (
                      <div className="flex justify-between items-center text-xs border-t border-border pt-1.5">
                        <span className="text-text-muted">Official Portal:</span>
                        <a
                          href={
                            result.compliance_details.portal.startsWith('http')
                              ? result.compliance_details.portal
                              : `https://${result.compliance_details.portal.replace(/.*\(|\).*/g, '').trim()}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {result.compliance_details.portal_name || result.compliance_details.portal}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}
                    {result.compliance_details.testing_clauses && (
                      <div className="border-t border-border pt-1.5 text-[11px]">
                        <span className="text-text-muted block mb-0.5">Mandatory Testing Clauses:</span>
                        <span className="text-foreground leading-relaxed font-medium">
                          {result.compliance_details.testing_clauses}
                        </span>
                      </div>
                    )}
                    {result.compliance_details.fraud_alert && (
                      <div className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 p-2.5 text-[11px] text-rose-800 dark:text-rose-200">
                        <strong>Urgent Action:</strong> {result.compliance_details.action || 'Report forged standard markings through the official BIS Care mobile app or consumer portal.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-12">
                <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-text-muted">
                  <BadgeCheck className="size-7" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">No verification results yet</p>
                  <p className="mx-auto max-w-xs text-xs leading-relaxed text-text-muted">
                    Upload an image or select a quick demo scenario on the left to verify authenticity against BIS databases.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
