import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';
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
    let contentType = file.type;

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
        contentType = 'image/jpeg';
        console.log('HEIC conversion successful');
      } catch (conversionError) {
        console.error('HEIC conversion failed:', conversionError);
        return NextResponse.json(
          { error: 'Failed to convert HEIC image. Please try a different format.' },
          { status: 500 }
        );
      }
    }

    // Generate filename and upload using storage adapter
    const filename = `${uuidv4()}.${finalExt}`;
    const storage = getStorageAdapter();
    const url = await storage.uploadPhoto(buffer, filename, contentType);

    return NextResponse.json({
      url,
      width: 800,
      height: 600,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
