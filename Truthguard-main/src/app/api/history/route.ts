import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const verdict = searchParams.get('verdict');

    let query = supabaseAdmin
      .from('checks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (verdict && verdict !== 'all') {
      query = query.eq('verdict', verdict);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, return empty
      console.error('History query error:', error);
      return NextResponse.json({ checks: [], total: 0 });
    }

    return NextResponse.json({
      checks: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ checks: [], total: 0 });
  }
}
