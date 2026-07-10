import type { ExtractedClaim, ClaudeVerificationResponse, TavilySearchResult, FactCheckResult } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function groqChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024,
  jsonMode: boolean = false
): Promise<string> {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  };
  // Force the model to return a valid JSON object (Groq / OpenAI-compatible).
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJSON(raw: string): string {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Find start of first JSON object or array
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');
  const isArray = arrStart !== -1 && (arrStart < objStart || objStart === -1);
  const start = isArray ? arrStart : objStart;
  if (start === -1) return cleaned;
  // Walk forward counting balanced braces to find the true end
  const open = isArray ? '[' : '{';
  const close = isArray ? ']' : '}';
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === open) depth++;
    if (ch === close) { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return cleaned.slice(start);
}

const CLAIM_EXTRACTION_SYSTEM = `You are an expert claim extractor for a fact-checking platform called TruthGuard.
Given a piece of text (news article, social media post, or general claim), extract 3-5 specific,
verifiable factual claims. Each claim should be a standalone statement that can be independently verified.

Return your response as a JSON array:
[
  { "claim": "specific verifiable statement", "importance": "high" | "medium" | "low" }
]

Rules:
- Extract FACTUAL claims only, not opinions
- Each claim should be specific and searchable
- Rank importance based on how central the claim is to the overall message
- If the text is too vague, extract what you can and note it
- ALWAYS return valid JSON with no markdown or code blocks`;

const VERIFICATION_SYSTEM = `You are a professional fact-checker for TruthGuard, a misinformation detection platform.
You will be given a claim and real search results from the live web, plus optional fact-check results.

Based ONLY on the evidence provided, determine if the claim is:
- TRUE: The claim is accurate and supported by credible sources
- FALSE: The claim has been debunked or contradicted by credible evidence
- MISLEADING: Contains true elements but the framing, context, or conclusion is wrong
- UNVERIFIED: No sufficient evidence found either way to make a determination
- SATIRE: The content appears to be satirical, parody, or comedic
- TOO_RECENT: This is very recent breaking news with insufficient verification available

CRITICAL RULES:
- Never guess or use your training knowledge alone
- Always cite which sources support your verdict
- Be conservative — if evidence is mixed, lean toward UNVERIFIED or MISLEADING
- Consider source credibility (Reuters, AP, BBC, NYT = high; unknown blogs = low)

Return ONLY valid JSON with no markdown or code blocks:
{
  "verdict": "true|false|misleading|unverified|satire|too_recent",
  "confidence": 0-100,
  "reasoning": "detailed step-by-step reasoning",
  "supporting_sources": [{"title": "", "url": "", "publisher": "", "credibility_score": 0-100, "supports_claim": true, "snippet": ""}],
  "contradicting_sources": [{"title": "", "url": "", "publisher": "", "credibility_score": 0-100, "supports_claim": false, "snippet": ""}],
  "summary": "2-3 sentence plain English summary for the user"
}`;

export async function extractClaims(text: string): Promise<ExtractedClaim[]> {
  try {
    const raw = await groqChat(
      CLAIM_EXTRACTION_SYSTEM,
      `Extract verifiable claims from the following text:\n\n${text.slice(0, 4000)}`,
      1024
    );
    return JSON.parse(extractJSON(raw));
  } catch (error) {
    console.error('Error extracting claims:', error);
    return [{ claim: text.substring(0, 500), importance: 'high' }];
  }
}

export async function verifyClaims(
  claims: ExtractedClaim[],
  searchResults: TavilySearchResult[],
  factCheckResults: FactCheckResult[]
): Promise<ClaudeVerificationResponse> {
  try {
    const claimsText = claims.map((c, i) => `${i + 1}. [${c.importance}] ${c.claim}`).join('\n');

    // Keep the prompt within Groq's tokens-per-minute limit:
    // use the 6 most relevant sources and trim each snippet.
    const trimmedResults = [...searchResults]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 6);

    const searchContext = trimmedResults
      .map(
        (r, i) =>
          `SOURCE ${i + 1}:\nTitle: ${r.title}\nURL: ${r.url}\nContent: ${(r.content || '').slice(0, 400)}`
      )
      .join('\n\n');

    const factCheckContext =
      factCheckResults.length > 0
        ? factCheckResults
            .map(
              (fc) =>
                `FACT CHECK: "${fc.text}"\nRating: ${fc.claimReview.map((r) => `${r.publisher.name}: ${r.textualRating}`).join(', ')}`
            )
            .join('\n')
        : 'No existing fact-checks found for these claims.';

    const raw = await groqChat(
      VERIFICATION_SYSTEM,
      `CLAIMS TO VERIFY:\n${claimsText}\n\nWEB SEARCH RESULTS:\n${searchContext}\n\nEXISTING FACT-CHECKS:\n${factCheckContext}`,
      2048,
      true // force JSON object output
    );

    const parsed = JSON.parse(extractJSON(raw));
    // Normalise — Groq sometimes uses different field names
    return {
      verdict: parsed.verdict || parsed.result || 'unverified',
      confidence: parsed.confidence ?? parsed.confidence_score ?? 0,
      reasoning: parsed.reasoning || parsed.explanation || '',
      supporting_sources: Array.isArray(parsed.supporting_sources) ? parsed.supporting_sources : [],
      contradicting_sources: Array.isArray(parsed.contradicting_sources) ? parsed.contradicting_sources : [],
      summary: parsed.summary || parsed.conclusion || 'Verification complete.',
    };
  } catch (error) {
    console.error('Error verifying claims:', error);
    return {
      verdict: 'unverified',
      confidence: 0,
      reasoning: 'An error occurred during verification. Unable to determine claim accuracy.',
      supporting_sources: [],
      contradicting_sources: [],
      summary: 'We were unable to verify this claim due to a processing error. Please try again.',
    };
  }
}

export async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    // Groq supports vision with llama-4-scout
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${imageBase64}` },
              },
              {
                type: 'text',
                text: 'Extract ALL text visible in this image. Return ONLY the extracted text, nothing else.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
}
