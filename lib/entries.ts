import { ScrapbookEntry } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import { del } from '@vercel/blob';

const DATA_DIR = path.join(process.cwd(), 'data', 'entries');

export async function getAllEntries(): Promise<ScrapbookEntry[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const entries = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as ScrapbookEntry;
      })
    );

    // Sort by date, newest first
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading entries:', error);
    return [];
  }
}

export async function getEntryByDate(date: string): Promise<ScrapbookEntry | null> {
  try {
    const filePath = path.join(DATA_DIR, `${date}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ScrapbookEntry;
  } catch (error) {
    console.error(`Error reading entry for date ${date}:`, error);
    return null;
  }
}

export async function createEntry(entry: ScrapbookEntry): Promise<void> {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    const filePath = path.join(DATA_DIR, `${entry.date}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
}

export async function deleteEntry(date: string): Promise<void> {
  try {
    // First, read the entry to get photo URLs
    const entry = await getEntryByDate(date);

    if (entry && entry.photos && entry.photos.length > 0) {
      // Delete all associated photos
      const deletePhotoPromises = entry.photos.map(async (photo) => {
        try {
          // Check if it's a Vercel Blob URL (starts with https://)
          if (photo.url.startsWith('https://')) {
            await del(photo.url);
            console.log(`Deleted blob: ${photo.url}`);
          } else {
            // Legacy local file support (for backwards compatibility)
            const filename = photo.url.split('/').pop();
            if (filename) {
              const photoPath = path.join(process.cwd(), 'public', 'uploads', filename);
              await fs.unlink(photoPath);
              console.log(`Deleted local photo: ${filename}`);
            }
          }
        } catch (photoError) {
          // Log but don't throw - continue deleting other photos
          console.warn(`Failed to delete photo ${photo.url}:`, photoError);
        }
      });

      // Wait for all photo deletions to complete
      await Promise.allSettled(deletePhotoPromises);
    }

    // Delete the entry JSON file
    const filePath = path.join(DATA_DIR, `${date}.json`);
    await fs.unlink(filePath);
    console.log(`Deleted entry: ${date}.json`);
  } catch (error) {
    console.error(`Error deleting entry for date ${date}:`, error);
    throw error;
  }
}
