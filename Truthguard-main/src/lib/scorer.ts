import type { Source, ClaudeVerificationResponse, Verdict } from '@/types';

// Well-known credible publishers and their base credibility scores
const PUBLISHER_CREDIBILITY: Record<string, number> = {
  'reuters.com': 95,
  'apnews.com': 95,
  'bbc.com': 90,
  'bbc.co.uk': 90,
  'nytimes.com': 88,
  'washingtonpost.com': 87,
  'theguardian.com': 86,
  'npr.org': 88,
  'pbs.org': 88,
  'economist.com': 87,
  'nature.com': 95,
  'science.org': 95,
  'who.int': 92,
  'cdc.gov': 92,
  'nih.gov': 92,
  'gov.uk': 85,
  'snopes.com': 90,
  'factcheck.org': 92,
  'politifact.com': 90,
  'fullfact.org': 90,
  'usatoday.com': 78,
  'cnn.com': 75,
  'foxnews.com': 65,
  'nbcnews.com': 78,
  'abcnews.go.com': 80,
  'cbsnews.com': 80,
  'aljazeera.com': 78,
  'france24.com': 80,
  'dw.com': 82,
  'theatlantic.com': 82,
  'newyorker.com': 85,
  'wired.com': 78,
  'arstechnica.com': 80,
};

function getPublisherCredibility(url: string): number {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return PUBLISHER_CREDIBILITY[hostname] || 40; // Default for unknown sources
  } catch {
    return 30;
  }
}

function getPublisherName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    // Format nicely
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return hostname;
  } catch {
    return 'Unknown Source';
  }
}

export function calculateCredibilityScore(
  claudeResponse: ClaudeVerificationResponse,
  allSources: Source[]
): number {
  // Weight: Source credibility 40%, Corroborating sources 30%, Claude confidence 30%

  // 1. Average source credibility (40%)
  const sourceCredibilities = allSources.map((s) => s.credibility_score);
  const avgSourceCredibility =
    sourceCredibilities.length > 0
      ? sourceCredibilities.reduce((a, b) => a + b, 0) / sourceCredibilities.length
      : 0;

  // 2. Corroboration score (30%) - ratio of supporting to total sources
  const supportingCount = allSources.filter((s) => s.supports_claim).length;
  const totalSources = allSources.length;
  const corroborationScore = totalSources > 0 ? (supportingCount / totalSources) * 100 : 0;

  // Adjust corroboration based on verdict
  let adjustedCorroboration = corroborationScore;
  if (claudeResponse.verdict === 'false') {
    // For false claims, high contradiction is good evidence
    adjustedCorroboration = ((totalSources - supportingCount) / Math.max(totalSources, 1)) * 100;
  }

  // 3. Claude's own confidence (30%)
  const claudeConfidence = claudeResponse.confidence;

  // Weighted final score
  const finalScore = Math.round(
    avgSourceCredibility * 0.4 + adjustedCorroboration * 0.3 + claudeConfidence * 0.3
  );

  return Math.max(0, Math.min(100, finalScore));
}

export function enrichSources(
  claudeResponse: ClaudeVerificationResponse
): Source[] {
  const allSources: Source[] = [];

  for (const source of (claudeResponse.supporting_sources || [])) {
    allSources.push({
      ...source,
      publisher: source.publisher || getPublisherName(source.url),
      credibility_score: source.credibility_score || getPublisherCredibility(source.url),
      supports_claim: true,
    });
  }

  for (const source of (claudeResponse.contradicting_sources || [])) {
    allSources.push({
      ...source,
      publisher: source.publisher || getPublisherName(source.url),
      credibility_score: source.credibility_score || getPublisherCredibility(source.url),
      supports_claim: false,
    });
  }

  // Sort by credibility score descending
  allSources.sort((a, b) => b.credibility_score - a.credibility_score);

  return allSources;
}

export function normalizeVerdict(verdict: string): Verdict {
  const normalized = verdict.toLowerCase().trim();
  const validVerdicts: Verdict[] = ['true', 'false', 'misleading', 'unverified', 'satire', 'too_recent'];
  if (validVerdicts.includes(normalized as Verdict)) {
    return normalized as Verdict;
  }
  return 'unverified';
}
