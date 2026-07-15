import { NextRequest, NextResponse } from 'next/server';
import { searchTavily } from '@/lib/tavily';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxResults = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchTavily(query, maxResults);
    return NextResponse.json({ results, query });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
