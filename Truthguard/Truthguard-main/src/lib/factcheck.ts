import type { FactCheckResult } from '@/types';

const GOOGLE_FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY || '';

export async function checkFactCheck(query: string): Promise<FactCheckResult[]> {
  if (!GOOGLE_FACT_CHECK_API_KEY) {
    console.warn('Google Fact Check API key not configured, skipping');
    return [];
  }

  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encoded}&key=${GOOGLE_FACT_CHECK_API_KEY}&languageCode=en`
    );

    if (!response.ok) {
      console.error(`Google Fact Check API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.claims || data.claims.length === 0) {
      return [];
    }

    return data.claims.map((claim: Record<string, unknown>) => ({
      text: claim.text || '',
      claimant: claim.claimant || undefined,
      claimReview: (claim.claimReview as Record<string, unknown>[] || []).map((review: Record<string, unknown>) => ({
        publisher: {
          name: (review.publisher as Record<string, unknown>)?.name || 'Unknown',
          site: (review.publisher as Record<string, unknown>)?.site || '',
        },
        url: review.url || '',
        title: review.title || '',
        textualRating: review.textualRating || 'Unknown',
        languageCode: review.languageCode || 'en',
      })),
    }));
  } catch (error) {
    console.error('Google Fact Check API error:', error);
    return [];
  }
}
