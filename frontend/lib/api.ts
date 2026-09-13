const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Recommendation {
  standard_number: string;
  title: string;
  relevance: string;
  why: string;
  evidence_id?: number;
}

export interface Evidence {
  standard_number: string;
  title: string;
  section?: string;
  snippet: string;
  source_url?: string;
  relevance_score?: number;
}

export interface ProductProfile {
  product: string;
  intended_use?: string;
  category?: string;
  material?: string;
  capacity?: string;
  market?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  status: string;
}

export interface RoadmapStep {
  id: number;
  step_number: number;
  title: string;
  status: 'completed' | 'warning' | 'in_progress' | 'pending' | 'blocked';
  description: string;
  reason?: string;
  requirements?: string;
  standard_reference?: string;
  completed_at?: string;
}

export interface RoadmapData {
  id: number;
  user_id: string;
  product: string;
  standard?: string;
  steps: RoadmapStep[];
}

export interface BisService {
  name: string;
  type: string;
  portal: string;
  description: string;
}

export interface ChatResponse {
  answer: string;
  product_profile?: ProductProfile;
  potential_standards?: Recommendation[];
  evidence?: Evidence[];
  readiness_roadmap?: RoadmapStep[];
  checklist?: ChecklistItem[];
  bis_services?: BisService[];
  warnings?: string[];
  sources?: string[];
}

export interface OCRVerificationResult {
  product: string;
  manufacturer: string;
  is_number: string;
  licence_information: string;
  standard_title?: string;
  verification_status: 'verified' | 'requires_verification' | 'conflict';
  confidence_level: 'High' | 'Moderate' | 'Needs Verification';
  message: string;
  compliance_details?: {
    scheme?: string;
    portal?: string;
    portal_name?: string;
    mandatory_qco?: boolean;
    testing_clauses?: string;
    fraud_alert?: boolean;
    action?: string;
  };
}

export async function sendChatMessage(query: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history })
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function analyzeLabelFile(file: File): Promise<OCRVerificationResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/ocr/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`OCR Analyze error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function verifyLabelText(rawText: string, productHint?: string): Promise<OCRVerificationResult> {
  const res = await fetch(`${API_BASE}/api/ocr/verify-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText, product_hint: productHint })
  });

  if (!res.ok) {
    throw new Error(`Verify text error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchRoadmap(product?: string): Promise<RoadmapData> {
  const url = product
    ? `${API_BASE}/api/roadmap/?product=${encodeURIComponent(product)}`
    : `${API_BASE}/api/roadmap/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Roadmap fetch error: ${res.status}`);
  }
  return res.json();
}

export async function updateRoadmapStep(stepId: number, status: string, reason?: string): Promise<RoadmapStep> {
  const res = await fetch(`${API_BASE}/api/roadmap/${stepId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Update step error: ${res.status}`);
  }
  return res.json();
}

export async function reevaluateRoadmap(product: string, standard?: string): Promise<RoadmapData> {
  const res = await fetch(`${API_BASE}/api/roadmap/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, standard })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Re-evaluate error: ${res.status}`);
  }
  return res.json();
}

