import type { TavilySearchResult } from '@/types';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

export async function searchTavily(query: string, maxResults: number = 5): Promise<TavilySearchResult[]> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        max_results: maxResults,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.results || []).map((r: Record<string, unknown>) => ({
      title: r.title || '',
      url: r.url || '',
      content: r.content || '',
      score: r.score || 0,
      published_date: r.published_date || undefined,
    }));
  } catch (error) {
    console.error('Tavily search error:', error);
    // Fallback: try DuckDuckGo scraping
    return await fallbackSearch(query);
  }
}

async function fallbackSearch(query: string): Promise<TavilySearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const results: TavilySearchResult[] = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '',
        content: data.AbstractText,
        score: 0.8,
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.substring(0, 100),
            url: topic.FirstURL,
            content: topic.Text,
            score: 0.5,
          });
        }
      }
    }

    return results;
  } catch {
    console.error('DuckDuckGo fallback also failed');
    return [];
  }
}
