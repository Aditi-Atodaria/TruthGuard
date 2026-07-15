import { NextRequest, NextResponse } from 'next/server';

// Needs Vercel Pro; on Hobby the hard cap is 10s and you'll still see 504s on slow queries
export const maxDuration = 60;

import { extractClaims, verifyClaims } from '@/lib/claude';
import { searchTavily } from '@/lib/tavily';
import { checkFactCheck } from '@/lib/factcheck';
import { scrapeUrl } from '@/lib/scraper';
import { calculateCredibilityScore, enrichSources, normalizeVerdict } from '@/lib/scorer';
import { supabaseAdmin } from '@/lib/supabase';
import CryptoJS from 'crypto-js';
import type { VerifyRequest, TavilySearchResult } from '@/types';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 checks per hour for anonymous users.' },
        { status: 429 }
      );
    }

    const body: VerifyRequest = await request.json();

    if (!body.input || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: input and type' },
        { status: 400 }
      );
    }

    // Step 1: Get content
    let content = body.input;
    if (body.type === 'url') {
      try {
        content = await scrapeUrl(body.input);
      } catch {
        return NextResponse.json(
          { error: 'Failed to extract content from the provided URL. Please try pasting the text directly.' },
          { status: 422 }
        );
      }
    }

    // Step 2: Extract claims
    const claims = await extractClaims(content);

    if (claims.length === 0) {
      return NextResponse.json(
        { error: 'No verifiable claims could be extracted from the provided content.' },
        { status: 422 }
      );
    }

    // Step 3: Check cache
    const mainClaim = claims[0].claim;
    const claimHash = CryptoJS.SHA256(mainClaim.toLowerCase().trim()).toString();

    try {
      const { data: cached } = await supabaseAdmin
        .from('cached_claims')
        .select('*')
        .eq('claim_hash', claimHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        // Cache hit — return cached result
        const checkId = crypto.randomUUID();
        await supabaseAdmin.from('checks').insert({
          id: checkId,
          user_id: null,
          input_type: body.type,
          raw_input: body.input,
          extracted_claims: claims,
          verdict: cached.verdict,
          confidence_score: cached.confidence_score,
          sources: cached.sources,
          summary: cached.summary || 'Cached result',
          created_at: new Date().toISOString(),
        });

        return NextResponse.json({
          id: checkId,
          verdict: cached.verdict,
          confidence_score: cached.confidence_score,
          summary: cached.summary || 'This result was retrieved from our cache.',
          sources: cached.sources,
          extracted_claims: claims,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Cache miss or table doesn't exist yet — continue
    }

    // Step 4: Search for evidence using Tavily
    const searchPromises = claims.slice(0, 3).map((claim) =>
      searchTavily(`fact check: ${claim.claim}`, 5)
    );
    const searchResultArrays = await Promise.all(searchPromises);
    const allSearchResults: TavilySearchResult[] = searchResultArrays.flat();

    // Deduplicate by URL
    const uniqueResults = allSearchResults.filter(
      (result, index, self) => self.findIndex((r) => r.url === result.url) === index
    );

    console.log('=== DEBUG ===');
    console.log('Claims extracted:', claims.length, claims.map(c => c.claim));
    console.log('Tavily results:', uniqueResults.length, uniqueResults.map(r => r.url));

    // Step 5: Call Google Fact Check API
    const factCheckResults = await checkFactCheck(mainClaim);
    console.log('Fact check results:', factCheckResults.length);

    // Step 6: Send everything to Claude for verification
    const claudeResponse = await verifyClaims(claims, uniqueResults, factCheckResults);
    console.log('Claude verdict:', claudeResponse.verdict, '| Confidence:', claudeResponse.confidence);
    console.log('Claude summary:', claudeResponse.summary);
    console.log('=== END DEBUG ===');

    // Step 7: Calculate final credibility score
    const enrichedSources = enrichSources(claudeResponse);
    const finalScore = calculateCredibilityScore(claudeResponse, enrichedSources);
    const finalVerdict = normalizeVerdict(claudeResponse.verdict);

    // Step 8: Save to database
    const checkId = crypto.randomUUID();
    try {
      await supabaseAdmin.from('checks').insert({
        id: checkId,
        user_id: null,
        input_type: body.type,
        raw_input: body.input,
        extracted_claims: claims,
        verdict: finalVerdict,
        confidence_score: finalScore,
        sources: enrichedSources,
        summary: claudeResponse.summary,
        created_at: new Date().toISOString(),
      });

      // Cache the result for 24 hours
      await supabaseAdmin.from('cached_claims').upsert({
        claim_hash: claimHash,
        verdict: finalVerdict,
        confidence_score: finalScore,
        sources: enrichedSources,
        summary: claudeResponse.summary,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (dbError) {
      console.error('Database error (non-fatal):', dbError);
      // Continue even if DB fails — the verification result is still valid
    }

    // Step 9: Return result
    return NextResponse.json({
      id: checkId,
      verdict: finalVerdict,
      confidence_score: finalScore,
      summary: claudeResponse.summary,
      sources: enrichedSources,
      extracted_claims: claims,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification. Please try again.' },
      { status: 500 }
    );
  }
}
