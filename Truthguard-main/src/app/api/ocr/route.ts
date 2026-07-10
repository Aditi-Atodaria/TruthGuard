import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const text = await extractTextFromImage(image);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from this image' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
