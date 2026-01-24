import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get file extension
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Get image dimensions (simplified - in production you might use sharp library)
    // For now, return default dimensions
    const url = `/uploads/${filename}`;

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
