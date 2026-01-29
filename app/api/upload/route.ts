import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import convert from 'heic-convert';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get file extension
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    const isHeic = originalExt === 'heic' || originalExt === 'heif';

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let finalExt = originalExt;

    // Convert HEIC to JPEG
    if (isHeic) {
      try {
        console.log('Converting HEIC to JPEG...');
        const outputBuffer = await convert({
          buffer,
          format: 'JPEG',
          quality: 0.9,
        });
        buffer = Buffer.from(outputBuffer);
        finalExt = 'jpg';
        console.log('HEIC conversion successful');
      } catch (conversionError) {
        console.error('HEIC conversion failed:', conversionError);
        return NextResponse.json(
          { error: 'Failed to convert HEIC image. Please try a different format.' },
          { status: 500 }
        );
      }
    }

    // Generate filename and upload to Vercel Blob
    const filename = `${uuidv4()}.${finalExt}`;
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: isHeic ? 'image/jpeg' : file.type,
    });

    return NextResponse.json({
      url: blob.url,
      width: 800,
      height: 600,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
