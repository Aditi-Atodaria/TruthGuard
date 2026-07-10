# TruthGuard

TruthGuard is an AI-powered fact-checking web app. Paste a URL, an article, or a social media post, and it extracts the underlying factual claims, gathers evidence from live web search and existing fact-checks, and returns a verdict (True / False / Misleading / Unverified / Satire / Too Recent) with a credibility score and cited sources.

Built with Next.js (App Router), Supabase, and Groq (Llama 3.3 70B).

## How it works

1. **Input** — the user submits a URL, raw text, or a social media post via the input form.
2. **Content extraction** — for URLs, `scraper.ts` fetches the page and pulls the article body using Cheerio (Open Graph tags, common article selectors, then a paragraph fallback).
3. **Claim extraction** — the content is sent to Groq (Llama 3.3 70B) via `lib/claude.ts`, which extracts 3–5 standalone, verifiable factual claims and ranks their importance.
4. **Cache check** — the main claim is hashed (SHA-256) and checked against `cached_claims` in Supabase; cache hits skip the search/verification steps and return instantly.
5. **Evidence gathering** — on a cache miss, the top claims are searched in parallel via the Tavily Search API (`lib/tavily.ts`, with a DuckDuckGo fallback), and cross-referenced against Google's Fact Check Tools API (`lib/factcheck.ts`).
6. **Verification** — claims, search results, and any existing fact-checks are sent back to Groq, which returns a verdict, confidence score, reasoning, and supporting/contradicting sources as structured JSON.
7. **Scoring** — `lib/scorer.ts` computes a final 0–100 credibility score from a weighted blend of source credibility (40%), corroboration ratio (30%), and model confidence (30%), using a built-in table of known publisher credibility ratings.
8. **Persistence** — the result is saved to the `checks` table and cached in `cached_claims` for 24 hours (Supabase).
9. **Output** — the user sees a verdict card, confidence meter, and source list, and can share the result via a shareable result page (`/result/[id]`).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, shadcn/ui, Base UI, Framer Motion, next-themes |
| LLM | Groq API (`llama-3.3-70b-versatile` for text, `llama-4-scout` for image OCR) |
| Web search | Tavily Search API (DuckDuckGo Instant Answer API as fallback) |
| Fact-check lookup | Google Fact Check Tools API |
| Database | Supabase (Postgres) |
| Scraping | Cheerio |

## Project structure

```
src/
├── app/
│   ├── api/verify/route.ts   # Main verification pipeline (POST endpoint)
│   ├── dashboard/             # Dashboard view
│   ├── result/[id]/           # Shareable result page
│   ├── page.tsx               # Landing / input page
│   └── layout.tsx
├── components/                 # UI components (VerdictCard, ConfidenceMeter, SourceList, etc.)
│   └── ui/                     # shadcn/ui primitives
├── lib/
│   ├── claude.ts               # Groq calls: claim extraction, verification, image OCR
│   ├── tavily.ts                # Web search + fallback
│   ├── factcheck.ts             # Google Fact Check Tools integration
│   ├── scraper.ts               # URL → article text extraction
│   ├── scorer.ts                # Credibility scoring + source enrichment
│   ├── supabase.ts              # Supabase client (anon + service role)
│   └── utils.ts
└── types/index.ts              # Shared types + verdict display config
supabase/
└── migration.sql               # `checks` and `cached_claims` tables
```

> **Note:** despite the file name `lib/claude.ts`, the LLM calls in this project go to the **Groq API** (Llama 3.3 70B), not the Anthropic Claude API.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- API keys for [Groq](https://console.groq.com), [Tavily](https://tavily.com), and (optional) [Google Fact Check Tools](https://developers.google.com/fact-check/tools/api)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Groq (LLM for claim extraction & verification)
GROQ_API_KEY=your_groq_api_key

# Tavily (web search)
TAVILY_API_KEY=your_tavily_api_key

# Google Fact Check Tools API (optional — verification degrades gracefully without it)
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set up the database

Run `supabase/migration.sql` in the Supabase SQL Editor to create the `checks` and `cached_claims` tables (with the `verdict_type` and `input_type` enums, and indexes for user, verdict, and cache-expiry lookups).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## API

### `POST /api/verify`

**Request body:**
```json
{
  "input": "https://example.com/article or raw text",
  "type": "url" | "text" | "social"
}
```

**Response:**
```json
{
  "id": "uuid",
  "verdict": "true | false | misleading | unverified | satire | too_recent",
  "confidence_score": 0,
  "summary": "Plain-English summary",
  "sources": [ { "title": "", "url": "", "publisher": "", "credibility_score": 0, "supports_claim": true } ],
  "extracted_claims": [ { "claim": "", "importance": "high | medium | low" } ],
  "created_at": "ISO timestamp"
}
```

Anonymous requests are rate-limited to **10 checks per hour per IP** (in-memory limiter; resets on server restart, so a distributed limiter such as Upstash Redis is recommended for production/multi-instance deployments).

## Deployment

Deploys cleanly to [Vercel](https://vercel.com). Note the `maxDuration = 60` on the verify route — this requires a **Vercel Pro** plan; on the Hobby tier the hard timeout is 10s, and slow searches/scrapes may 504. Remember to add all environment variables from `.env.local` to your Vercel project settings, and to run the Supabase migration against your production database.

## Limitations

- Verdicts are only as good as the search results and fact-check data available at query time — very recent events may correctly return `TOO_RECENT` or `UNVERIFIED`.
- The publisher credibility table in `lib/scorer.ts` is a fixed list of well-known outlets; unlisted domains default to a low baseline score.
- The in-memory rate limiter does not persist across server restarts or scale across multiple instances.
