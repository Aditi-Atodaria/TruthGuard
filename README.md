# TruthGuard

**Know what's real before you share it.**

TruthGuard is an AI-powered, real-time misinformation detection tool. Paste in a claim, a piece of text, or a URL (even a screenshot of a social post) and get back an evidence-backed verdict — TRUE, FALSE, MISLEADING, UNVERIFIED, SATIRE, or TOO RECENT — along with a confidence score and the sources behind the decision.

## Why

Misinformation spreads faster than fact-checkers can keep up with it. TruthGuard shortens that gap by combining an LLM's reasoning with live web search and established fact-checking databases, so anyone can get a sourced credibility check in seconds instead of digging through search results themselves.

## How It Works

1. **Input** — Submit a claim as raw text, a URL, or a screenshot (social post / article).
2. **Extraction** — For URLs, the article body is scraped and cleaned (via Cheerio); for images, text is extracted with OCR.
3. **Claim identification** — The core factual claims are pulled out and ranked by importance.
4. **Evidence gathering** — Each claim is checked against:
   - **Tavily** web search for current, relevant sources (with a DuckDuckGo fallback)
   - **Google Fact Check Tools API** for existing fact-checks from known publishers
5. **Verdict & scoring** — An LLM weighs the supporting and contradicting evidence and produces a verdict, a confidence score, and a plain-language summary. Sources are weighted by a built-in publisher credibility model (e.g. wire services and scientific journals score higher than partisan outlets).
6. **Result** — A shareable result card shows the verdict, confidence meter, reasoning, and every source used, split into "supports" and "contradicts."
7. **History** — Past checks are cached (24-hour claim cache) and stored so recent checks can be revisited instantly.

## Features

- **Multi-input support** — text, URL, or social media screenshot
- **OCR** for extracting claims from images
- **Live web search** grounding via Tavily, with fallback search
- **Cross-reference** against the Google Fact Check Tools database
- **Confidence scoring** with a transparent, publisher-weighted credibility model
- **Source breakdown** — see exactly which sources support or contradict a claim
- **Recent checks / history** — powered by Supabase, with claim-level caching to avoid re-verifying the same claim twice
- **Shareable result cards** for individual verdicts
- **Light/dark theme**

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript |
| Styling / UI | Tailwind CSS, shadcn/ui, Framer Motion, Lucide icons |
| LLM reasoning & OCR | Groq (Llama 3.3 70B) |
| Web search | Tavily Search API |
| Fact-check database | Google Fact Check Tools API |
| Scraping | Cheerio |
| Database / cache | Supabase (Postgres) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── verify/     # main claim-verification endpoint
│   │   ├── ocr/        # image  text extraction
│   │   ├── search/     # source lookup
│   │   └── history/    # recent checks
│   ├── dashboard/      # history / stats view
│   ├── result/[id]/    # shareable result page
│   └── page.tsx        # landing / input page
├── components/          # UI components (VerdictCard, ConfidenceMeter, SourceList, etc.)
├── lib/                 # claude.ts, tavily.ts, factcheck.ts, scraper.ts, scorer.ts, supabase.ts
└── types/                # shared TypeScript types
supabase/
└── migration.sql         # database schema (checks, cached_claims)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- API keys for Groq, Tavily, and (optionally) Google Fact Check Tools

### 1. Clone and install

```bash
git clone <repo-url>
cd Truthguard
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```bash
# Groq (LLM reasoning + OCR)
GROQ_API_KEY=your_groq_api_key

# Tavily (web search)
TAVILY_API_KEY=your_tavily_api_key

# Google Fact Check Tools (optional but recommended)
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set up the database

Run `supabase/migration.sql` in your Supabase project's SQL editor. This creates the `checks` and `cached_claims` tables along with the necessary enums and indexes.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Deployment

TruthGuard is a standard Next.js app and deploys cleanly to [Vercel](https://vercel.com) — connect the repo, add the environment variables above in the project settings, and deploy.

## Disclaimer

TruthGuard is an AI-assisted tool intended to support media literacy, not to serve as a final legal or journalistic authority. Always use your own judgment and consult primary sources for high-stakes decisions.
