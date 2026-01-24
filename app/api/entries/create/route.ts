import { NextRequest, NextResponse } from 'next/server';
import { createEntry } from '@/lib/entries';
import { ScrapbookEntry } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const entry: ScrapbookEntry = await request.json();

    // Validate required fields
    if (!entry.date || !entry.title || !entry.photos || entry.photos.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: date, title, and at least one photo' },
        { status: 400 }
      );
    }

    // Add timestamps
    const now = new Date().toISOString();
    entry.createdAt = now;
    entry.updatedAt = now;

    await createEntry(entry);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
