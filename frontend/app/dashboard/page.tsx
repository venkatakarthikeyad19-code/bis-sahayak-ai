'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Info,
  Laptop,
  Zap,
  CookingPot,
  Lightbulb,
  HardHat,
  Fan,
  Cpu,
  Plug,
  BadgeCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw,
  AlertCircle,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  sendChatMessage,
  fetchRoadmap,
  updateRoadmapStep,
  reevaluateRoadmap,
  type ChatResponse,
  type ChatMessage,
  type RoadmapStep,
} from '@/lib/api'
import { useReadiness } from '@/lib/readiness-context'

type Message = {
  id: number
  role: 'assistant' | 'user'
  text: string
  data?: ChatResponse
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hello! I am **BIS Sahayak AI**, your authoritative compliance and standards assistant for the Bureau of Indian Standards.\n\nAsk me about required standards, testing clauses, QCO mandates, or certification roadmaps for any product.',
  },
]

const QUICK_REPLIES = [
  'I want to manufacture an electric kettle',
  'Which standard applies to a laptop?',
  'What are the requirements for pressure cookers?',
  'How do I certify LED lamps under CRS?',
]

const PRODUCTS = [
  { label: 'Laptop Computer', code: 'IS 13252', query: 'What standards and certification apply to Laptop / Notebook Computer?', icon: Laptop },
  { label: 'Electric Kettle', code: 'IS 302-2-15', query: 'I want to manufacture an electric kettle for Indian market', icon: Zap },
  { label: 'Pressure Cooker', code: 'IS 2347', query: 'What are the mandatory BIS standards for domestic pressure cooker?', icon: CookingPot },
  { label: 'LED Lamp', code: 'IS 16102', query: 'What are the safety and performance standards for Self-Ballasted LED Lamp?', icon: Lightbulb },
  { label: 'Safety Helmet', code: 'IS 2925', query: 'What are the BIS requirements for Industrial Safety Helmet?', icon: HardHat },
  { label: 'Mobile Phone', code: 'IS 13252 & 16333', query: 'What are the CRS registration requirements for Mobile Handset?', icon: Cpu },
  { label: 'Ceiling Fan', code: 'IS 374', query: 'What are the BIS requirements and BEE Star rating for Electric Ceiling Fan?', icon: Fan },
  { label: 'Packaged Water', code: 'IS 14543', query: 'What are the mandatory ISI certification requirements for Packaged Drinking Water?', icon: Plug },
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeData, setActiveData] = useState<ChatResponse | null>(null)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'standards' | 'roadmap' | 'checklist'>('standards')
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'workspace'>('chat')
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { setScore, setProductName } = useReadiness()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Calculate readiness score whenever checklist state or activeData updates
  useEffect(() => {
    if (activeData?.checklist && activeData.checklist.length > 0) {
      const total = activeData.checklist.length
      const completed = activeData.checklist.filter((item) => checklistState[item.id]).length
      const calculatedScore = Math.round((completed / total) * 100)
      setScore(calculatedScore)
      if (activeData.product_profile?.product) {
        setProductName(activeData.product_profile.product)
      }
    }
  }, [checklistState, activeData, setScore, setProductName])

  // Dynamic Roadmap State
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([])
  const [updatingStepId, setUpdatingStepId] = useState<number | null>(null)
  const [evaluatingRoadmap, setEvaluatingRoadmap] = useState(false)
  const [roadmapError, setRoadmapError] = useState<string | null>(null)
  const [roadmapSuccess, setRoadmapSuccess] = useState<string | null>(null)

  // Sync roadmap steps when activeData changes
  useEffect(() => {
    if (activeData?.readiness_roadmap && activeData.readiness_roadmap.length > 0) {
      setRoadmapSteps(activeData.readiness_roadmap)
    }
  }, [activeData])

  // Initial load of roadmap if not yet populated (default to Laptop Computer)
  useEffect(() => {
    if (roadmapSteps.length === 0) {
      fetchRoadmap('Laptop / Notebook Computer')
        .then((data) => {
          if (data && data.steps && data.steps.length > 0) {
            setRoadmapSteps(data.steps)
          }
        })
        .catch((e) => {
          console.log('Initial roadmap load note:', e)
        })
    }
  }, [roadmapSteps.length])

  async function handleCompleteStep(step: RoadmapStep) {
    setRoadmapError(null)
    setRoadmapSuccess(null)
    setUpdatingStepId(step.id)
    try {
      const targetStatus = step.status === 'completed' ? 'pending' : 'completed'
      const updated = await updateRoadmapStep(step.id, targetStatus)
      setRoadmapSteps((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
      )
      setActiveData((prev) => {
        if (!prev || !prev.readiness_roadmap) return prev
        return {
          ...prev,
          readiness_roadmap: prev.readiness_roadmap.map((s) =>
            s.id === updated.id ? { ...s, ...updated } : s
          ),
        }
      })
      if (targetStatus === 'completed') {
        setRoadmapSuccess(`Step ${step.step_number || step.id} marked as completed.`)
      } else {
        setRoadmapSuccess(`Step ${step.step_number || step.id} status reset.`)
      }
    } catch (err: any) {
      setRoadmapError(err.message || 'Failed to update step status.')
    } finally {
      setUpdatingStepId(null)
    }
  }

  async function handleReevaluateRoadmap() {
    setRoadmapError(null)
    setRoadmapSuccess(null)
    setEvaluatingRoadmap(true)
    try {
      const product = activeData?.product_profile?.product || 'Laptop / Notebook Computer'
      const standard = activeData?.potential_standards?.[0]?.standard_number || 'IS 13252'
      const data = await reevaluateRoadmap(product, standard)
      if (data && data.steps && data.steps.length > 0) {
        setRoadmapSteps(data.steps)
        setActiveData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            readiness_roadmap: data.steps,
          }
        })
        setRoadmapSuccess('Roadmap re-evaluated against latest BIS standards. Completed progress retained.')
      }
    } catch (err: any) {
      setRoadmapError(err.message || 'Failed to re-evaluate roadmap.')
    } finally {
      setEvaluatingRoadmap(false)
    }
  }

  async function handleSendMessage(value?: string) {
    const trimmed = (value ?? input).trim()
    if (!trimmed || loading) return

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
    }

    const userMessage: Message = { id: Date.now(), role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history: ChatMessage[] = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const response = await sendChatMessage(trimmed, history)

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.answer,
        data: response,
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (response.product_profile || (response.potential_standards && response.potential_standards.length > 0)) {
        setActiveData(response)

        // Initialize checklist state with completed items from backend
        if (response.checklist) {
          const initialChecks: Record<string, boolean> = {}
          response.checklist.forEach((item) => {
            initialChecks[item.id] = item.status === 'completed'
          })
          setChecklistState(initialChecks)
        }
      }
    } catch (err: any) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Unable to reach the BIS knowledge service. Please ensure the backend server is running on port 8000, or check your internet connection.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function toggleListen() {
    if (typeof window === 'undefined') return
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognition.start()
    } catch (e) {
      setIsListening(false)
    }
  }

  function speakText(text: string, id: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#_`>]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  function toggleChecklistItem(id: string) {
    setChecklistState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const showQuickReplies = messages.length <= 2 && !loading

  return (
    <div className="flex h-full flex-col bg-background p-3 sm:p-4 lg:p-5">
      {/* Slim top bar */}
      <header className="mb-3 md:mb-4 flex min-h-12 sm:min-h-14 items-center gap-2.5 sm:gap-3 rounded-xl border border-border bg-card px-3 sm:px-4 py-2 shadow-[var(--shadow-card)]">
        <span className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full gradient-primary">
          <Sparkles className="size-4 sm:size-[18px] text-primary-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground">BIS Sahayak AI</h1>
          <p className="truncate text-[10px] sm:text-[11px] text-text-secondary">
            Authoritative Bureau of Indian Standards Decision Support • Powered by Gemini
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeData?.product_profile && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary max-w-[140px]">
              <Sparkles className="size-3 shrink-0" />
              <span className="truncate">{activeData.product_profile.product}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>API Online</span>
          </span>
        </div>
      </header>

      {/* Mobile View Switcher (< md) */}
      <div className="flex md:hidden rounded-lg border border-border bg-secondary/80 p-1 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setMobilePanel('chat')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            mobilePanel === 'chat'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          )}
        >
          <Send className="size-3.5" />
          <span>AI Chat</span>
          {messages.length > 2 && (
            <span className="size-1.5 rounded-full bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('workspace')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            mobilePanel === 'workspace'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          )}
        >
          <FileText className="size-3.5" />
          <span>Compliance Workspace</span>
          {activeData && (
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Two-pane layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[6fr_4fr]">
        {/* LEFT: Chat panel */}
        <section className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]",
          mobilePanel === 'chat' ? 'flex' : 'hidden md:flex'
        )}>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onSpeak={() => speakText(m.text, m.id)}
                isSpeaking={speakingId === m.id}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="flex size-7 items-center justify-center rounded-full gradient-primary">
                  <Sparkles className="size-3.5 text-primary-foreground animate-spin" />
                </span>
                <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs shadow-[var(--shadow-card)] flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Searching BIS standards &amp; synthesizing compliance evidence...</span>
                </div>
              </div>
            )}

            {/* Suggested quick-reply chips */}
            {showQuickReplies ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pl-0 sm:pl-[38px] pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="rounded-full border border-border bg-card px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-medium text-text-secondary transition-all hover:-translate-y-px hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {/* Input pill */}
          <div className="px-3 pb-3 pt-1 sm:px-5 sm:pb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-secondary p-1 sm:p-1.5 transition-colors focus-within:border-primary/60">
              <button
                type="button"
                onClick={toggleListen}
                aria-label="Use microphone"
                className={cn(
                  'flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-text-secondary hover:bg-accent hover:text-primary'
                )}
                title={isListening ? 'Listening... click to stop' : 'Click to speak'}
              >
                {isListening ? <MicOff className="size-4 sm:size-[18px]" /> : <Mic className="size-4 sm:size-[18px]" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={loading}
                placeholder="Ask about BIS certification, standards, or products..."
                className="h-9 sm:h-10 min-w-0 flex-1 bg-transparent px-2 text-xs sm:text-sm text-foreground placeholder:text-text-muted focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Send className="size-3.5 sm:size-[16px]" aria-hidden="true" />
              </button>
            </div>

            {/* Disclaimer strip */}
            <div className="mt-2.5 flex items-center gap-1.5 px-2 text-[11px] text-text-muted">
              <Info className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                AI guidance grounded on authoritative BIS records. Always verify Gazette mandates on{' '}
                <a
                  href="https://www.bis.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  bis.gov.in
                </a>
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT: Standards & Compliance Workspace panel */}
        <aside className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]",
          mobilePanel === 'workspace' ? 'flex' : 'hidden md:flex'
        )}>
          {/* Header & Tabs */}
          <div className="border-b border-border px-3 sm:px-5 py-3 sm:py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Compliance Workspace</h2>
                <p className="text-[11px] text-text-secondary truncate">
                  {activeData?.product_profile ? activeData.product_profile.product : 'Suggested Standards & Quick Scenarios'}
                </p>
              </div>
              {activeData && (
                <div className="flex shrink-0 rounded-lg border border-border bg-secondary p-0.5 text-xs">
                  <button
                    onClick={() => setActiveTab('standards')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTab === 'standards' ? 'bg-card text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                    )}
                  >
                    Standards
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTab === 'roadmap' ? 'bg-card text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                    )}
                  >
                    Roadmap
                  </button>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTab === 'checklist' ? 'bg-card text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                    )}
                  >
                    Checklist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
            {activeData ? (
              <>
                {/* TAB 1: STANDARDS & EVIDENCE */}
                {activeTab === 'standards' && (
                  <div className="space-y-4">
                    {/* Product Profile Overview */}
                    {activeData.product_profile && (
                      <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-primary" />
                            {activeData.product_profile.product}
                          </span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {activeData.product_profile.category || 'BIS Regulated'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div>
                            <span className="text-text-muted block">Intended Use:</span>
                            <span className="font-medium text-foreground">{activeData.product_profile.intended_use || 'Domestic / Commercial'}</span>
                          </div>
                          <div>
                            <span className="text-text-muted block">Jurisdiction:</span>
                            <span className="font-medium text-foreground">India (BIS Jurisdiction)</span>
                          </div>
                          {activeData.product_profile.material && (
                            <div className="sm:col-span-2">
                              <span className="text-text-muted block">Materials:</span>
                              <span className="font-medium text-foreground">{activeData.product_profile.material}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommended Standards */}
                    {activeData.potential_standards && activeData.potential_standards.length > 0 ? (
                      activeData.potential_standards.map((std, idx) => (
                        <div key={idx} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                {std.standard_number}
                              </span>
                              <h3 className="text-xs font-semibold text-foreground mt-1.5">{std.title}</h3>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              {std.relevance} Match
                            </span>
                          </div>

                          <p className="text-xs text-text-secondary leading-relaxed bg-secondary/50 p-2.5 rounded-lg">
                            {std.why}
                          </p>

                          {/* Official Evidence Snippet */}
                          {activeData.evidence && activeData.evidence[idx] && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5 text-xs">
                              <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                                <FileText className="size-3.5" />
                                Official Evidence Clauses:
                              </div>
                              {activeData.evidence[idx].section && (
                                <p className="font-medium text-foreground text-[11px]">{activeData.evidence[idx].section}</p>
                              )}
                              <blockquote className="border-l-2 border-primary/50 pl-2 italic text-text-secondary text-[11px] leading-relaxed">
                                &ldquo;{activeData.evidence[idx].snippet}&rdquo;
                              </blockquote>
                            </div>
                          )}

                          {/* Applicable BIS Scheme & Portal */}
                          {activeData.bis_services && activeData.bis_services[0] && (
                            <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                              <div>
                                <span className="text-text-muted text-[10px] block">Applicable BIS Scheme:</span>
                                <span className="font-semibold text-foreground text-[11px]">{activeData.bis_services[0].name}</span>
                              </div>
                              <a
                                href={`https://${activeData.bis_services[0].portal.replace(/.*\(|\).*/g, '').trim()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                {activeData.bis_services[0].portal}
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-border p-4 text-center text-xs text-text-secondary">
                        General inquiry — check the AI answer for specific guidance.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: READINESS ROADMAP */}
                {activeTab === 'roadmap' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-text-secondary">
                        Follow these sequential compliance stages from product idea to official BIS certification:
                      </p>
                      <button
                        type="button"
                        onClick={handleReevaluateRoadmap}
                        disabled={evaluatingRoadmap}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      >
                        <RefreshCw className={cn('size-3', evaluatingRoadmap && 'animate-spin text-primary')} />
                        {evaluatingRoadmap ? 'Evaluating...' : 'Re-evaluate'}
                      </button>
                    </div>

                    {roadmapError && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/80 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                        <AlertCircle className="size-4 shrink-0 text-red-500" />
                        <span className="flex-1 font-medium">{roadmapError}</span>
                      </div>
                    )}

                    {roadmapSuccess && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span className="flex-1 font-medium">{roadmapSuccess}</span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {((roadmapSteps && roadmapSteps.length > 0) ? roadmapSteps : (activeData.readiness_roadmap || [])).length > 0 ? (
                        ((roadmapSteps && roadmapSteps.length > 0) ? roadmapSteps : (activeData.readiness_roadmap || [])).map((step) => {
                          const isComplete = step.status === 'completed'
                          const isWarning = step.status === 'warning'
                          const isInProgress = step.status === 'in_progress'
                          const isBlocked = step.status === 'blocked'
                          const isUpdating = updatingStepId === step.id

                          return (
                            <div
                              key={step.id}
                              className={cn(
                                'flex items-start gap-3 rounded-xl border p-3 text-xs transition-colors',
                                isComplete
                                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                                  : isWarning
                                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                                  : isInProgress
                                  ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20'
                                  : isBlocked
                                  ? 'border-border/60 bg-secondary/30 opacity-70'
                                  : 'border-border bg-card'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                  isComplete
                                    ? 'bg-emerald-500 text-white'
                                    : isWarning
                                    ? 'bg-amber-500 text-white'
                                    : isInProgress
                                    ? 'bg-blue-500 text-white'
                                    : isBlocked
                                    ? 'bg-secondary text-text-muted'
                                    : 'bg-secondary text-text-secondary'
                                )}
                              >
                                {step.step_number || step.id}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                                  <span
                                    className={cn(
                                      'text-[10px] font-bold uppercase tracking-wider',
                                      isComplete
                                        ? 'text-emerald-600'
                                        : isWarning
                                        ? 'text-amber-600'
                                        : isInProgress
                                        ? 'text-blue-600'
                                        : isBlocked
                                        ? 'text-text-muted'
                                        : 'text-text-muted'
                                    )}
                                  >
                                    {step.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{step.description}</p>

                                {/* Meaningful Warning Reason */}
                                {step.reason && (
                                  <div className="mt-2 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-500/10 p-2 text-[11px] text-amber-800 dark:text-amber-200 leading-snug">
                                    <span className="font-semibold">Attention: </span>
                                    {step.reason}
                                  </div>
                                )}

                                {/* Requirements note */}
                                {step.requirements && (
                                  <p className="mt-1.5 text-[10px] text-text-muted">
                                    <span className="font-medium">Requirements: </span>
                                    {step.requirements}
                                  </p>
                                )}

                                {/* Action Buttons / Completion state */}
                                <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                                  <span className="text-[10px] text-text-muted">
                                    {step.standard_reference ? `Ref: ${step.standard_reference}` : ''}
                                  </span>
                                  {isComplete ? (
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteStep(step)}
                                      disabled={isUpdating}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="size-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                      )}
                                      Completed
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteStep(step)}
                                      disabled={isUpdating || isBlocked}
                                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="size-3 animate-spin" />
                                      ) : (
                                        <CheckSquare className="size-3" />
                                      )}
                                      Mark as Completed
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs text-text-muted text-center py-4">No roadmap generated for this query.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: SMART CHECKLIST */}
                {activeTab === 'checklist' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Interactive Compliance Checklist:</span>
                      <span className="font-bold text-primary">
                        {activeData.checklist ? Object.values(checklistState).filter(Boolean).length : 0} /{' '}
                        {activeData.checklist?.length || 0} completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeData.checklist && activeData.checklist.length > 0 ? (
                        activeData.checklist.map((item) => {
                          const checked = !!checklistState[item.id]
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklistItem(item.id)}
                              className={cn(
                                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all hover:-translate-y-px text-xs',
                                checked
                                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                                  : 'border-border bg-card hover:bg-accent'
                              )}
                            >
                              <span className="mt-0.5 shrink-0 text-primary">
                                {checked ? (
                                  <CheckSquare className="size-4 text-emerald-600" />
                                ) : (
                                  <Square className="size-4 text-text-muted" />
                                )}
                              </span>
                              <span className={cn('flex-1 text-[11px] leading-relaxed', checked ? 'line-through text-text-muted' : 'text-foreground font-medium')}>
                                {item.task}
                              </span>
                            </button>
                          )
                        })
                      ) : (
                        <p className="text-xs text-text-muted text-center py-4">No checklist available for this query.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* EMPTY STATE: Quick product lookup chips */
              <div className="space-y-4">
                <div className="text-xs text-text-secondary">
                  Tap any common product below to instantly analyze its mandatory BIS standards, clauses, and laboratory readiness:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {PRODUCTS.map((p) => {
                    const Icon = p.icon
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleSendMessage(p.query)}
                        disabled={loading}
                        className="group flex h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-3 text-left transition-all hover:-translate-y-px hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-foreground">{p.label}</p>
                          <p className="truncate text-[10px] text-text-muted">{p.code}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
                  <BadgeCheck className="size-7 text-primary/60" aria-hidden="true" />
                  <p className="text-xs font-semibold text-foreground">AI Compliance Ready</p>
                  <p className="max-w-xs text-[11px] text-text-muted leading-relaxed">
                    Ask any question in the chat or pick a product chip to inspect verified clauses, roadmaps, and certification schemes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onSpeak,
  isSpeaking,
}: {
  message: Message
  onSpeak?: () => void
  isSpeaking?: boolean
}) {
  const isAssistant = message.role === 'assistant'
  return (
    <div className={cn('flex gap-2.5', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant ? (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full gradient-primary">
          <Sparkles className="size-3.5 text-primary-foreground" aria-hidden="true" />
        </span>
      ) : null}
      <div
        className={cn(
          'max-w-[88%] sm:max-w-[78%] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs leading-relaxed space-y-2',
          isAssistant
            ? 'rounded-tl-sm border border-border bg-card text-foreground shadow-[var(--shadow-card)]'
            : 'rounded-tr-sm bg-accent text-foreground'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>

        {isAssistant && onSpeak && (
          <div className="flex items-center justify-end pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={onSpeak}
              className={cn(
                'flex items-center gap-1 text-[10px] font-medium transition-colors',
                isSpeaking ? 'text-primary font-bold' : 'text-text-muted hover:text-foreground'
              )}
              title={isSpeaking ? 'Stop speaking' : 'Listen to response'}
            >
              {isSpeaking ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
              <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
