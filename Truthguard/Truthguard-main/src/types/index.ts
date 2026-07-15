// ========================
// TruthGuard Shared Types
// ========================

export type InputType = 'url' | 'text' | 'social';

export type Verdict = 'true' | 'false' | 'misleading' | 'unverified' | 'satire' | 'too_recent';

export interface Source {
  title: string;
  url: string;
  publisher: string;
  credibility_score: number;
  supports_claim: boolean;
  snippet?: string;
}

export interface ExtractedClaim {
  claim: string;
  importance: 'high' | 'medium' | 'low';
}

export interface ClaudeVerificationResponse {
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  supporting_sources: Source[];
  contradicting_sources: Source[];
  summary: string;
}

export interface Check {
  id: string;
  user_id: string | null;
  input_type: InputType;
  raw_input: string;
  extracted_claims: ExtractedClaim[];
  verdict: Verdict;
  confidence_score: number;
  sources: Source[];
  summary: string;
  created_at: string;
}

export interface CachedClaim {
  claim_hash: string;
  verdict: Verdict;
  confidence_score: number;
  sources: Source[];
  expires_at: string;
}

export interface VerifyRequest {
  input: string;
  type: InputType;
}

export interface VerifyResponse {
  id: string;
  verdict: Verdict;
  confidence_score: number;
  summary: string;
  sources: Source[];
  extracted_claims: ExtractedClaim[];
  created_at: string;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  query: string;
}

export interface FactCheckClaimReview {
  publisher: {
    name: string;
    site: string;
  };
  url: string;
  title: string;
  textualRating: string;
  languageCode: string;
}

export interface FactCheckResult {
  text: string;
  claimant?: string;
  claimReview: FactCheckClaimReview[];
}

export interface VerdictDisplay {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  /** Lucide icon name — render via VERDICT_ICON_MAP */
  iconName: 'CheckCircle2' | 'XCircle' | 'AlertTriangle' | 'HelpCircle' | 'Clock' | 'Drama';
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export const VERDICT_MAP: Record<Verdict, VerdictDisplay> = {
  true: {
    label: 'TRUE',
    color: 'text-[#17191c]',
    bgColor: 'bg-[#d3e3fc]',
    borderColor: 'border-[#d3e3fc]',
    iconName: 'CheckCircle2',
    description: 'This claim checks out',
    gradientFrom: 'from-[#d3e3fc]',
    gradientTo: 'to-[#d3e3fc]/30',
  },
  false: {
    label: 'FALSE',
    color: 'text-[#5d2a1a]',
    bgColor: 'bg-[#fbe1d1]',
    borderColor: 'border-[#fbe1d1]',
    iconName: 'XCircle',
    description: 'This claim has been debunked',
    gradientFrom: 'from-[#fbe1d1]',
    gradientTo: 'to-[#fbe1d1]/30',
  },
  misleading: {
    label: 'MISLEADING',
    color: 'text-[#5d2a1a]',
    bgColor: 'bg-[#fbe1d1]',
    borderColor: 'border-[#fbe1d1]',
    iconName: 'AlertTriangle',
    description: 'True facts, false framing',
    gradientFrom: 'from-[#fbe1d1]',
    gradientTo: 'to-[#fbe1d1]/30',
  },
  unverified: {
    label: 'UNVERIFIED',
    color: 'text-[#777b86]',
    bgColor: 'bg-[#f7f7f8]',
    borderColor: 'border-[#f7f7f8]',
    iconName: 'HelpCircle',
    description: 'No evidence found either way',
    gradientFrom: 'from-[#f7f7f8]',
    gradientTo: 'to-[#f7f7f8]/30',
  },
  too_recent: {
    label: 'TOO RECENT',
    color: 'text-[#17191c]',
    bgColor: 'bg-[#d3e3fc]',
    borderColor: 'border-[#d3e3fc]',
    iconName: 'Clock',
    description: 'Breaking news — too early to verify',
    gradientFrom: 'from-[#d3e3fc]',
    gradientTo: 'to-[#d3e3fc]/30',
  },
  satire: {
    label: 'SATIRE',
    color: 'text-[#777b86]',
    bgColor: 'bg-[#f7f7f8]',
    borderColor: 'border-[#f7f7f8]',
    iconName: 'Drama',
    description: 'This appears to be satire',
    gradientFrom: 'from-[#f7f7f8]',
    gradientTo: 'to-[#f7f7f8]/30',
  },
};
