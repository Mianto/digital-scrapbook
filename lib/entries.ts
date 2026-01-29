import { ScrapbookEntry } from '@/types';
import { list, put, del, head } from '@vercel/blob';

const ENTRY_PREFIX = 'entries/';

export async function getAllEntries(): Promise<ScrapbookEntry[]> {
  try {
    // List all blobs with the entries prefix
    const { blobs } = await list({ prefix: ENTRY_PREFIX });

    // Fetch and parse each entry
    const entries = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        const entry = await response.json() as ScrapbookEntry;
        return entry;
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
    const pathname = `${ENTRY_PREFIX}${date}.json`;

    // Check if entry exists
    const blob = await head(pathname);

    if (!blob) {
      return null;
    }

    // Fetch and parse the entry
    const response = await fetch(blob.url);
    const entry = await response.json() as ScrapbookEntry;
    return entry;
  } catch (error) {
    console.error(`Error reading entry for date ${date}:`, error);
    return null;
  }
}

export async function createEntry(entry: ScrapbookEntry): Promise<void> {
  try {
    const pathname = `${ENTRY_PREFIX}${entry.date}.json`;
    const content = JSON.stringify(entry, null, 2);

    await put(pathname, content, {
      access: 'public',
      contentType: 'application/json',
    });

    console.log(`Created entry: ${pathname}`);
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
          }
        } catch (photoError) {
          // Log but don't throw - continue deleting other photos
          console.warn(`Failed to delete photo ${photo.url}:`, photoError);
        }
      });

      // Wait for all photo deletions to complete
      await Promise.allSettled(deletePhotoPromises);
    }

    // Delete the entry JSON blob
    const pathname = `${ENTRY_PREFIX}${date}.json`;
    await del(pathname);
    console.log(`Deleted entry: ${pathname}`);
  } catch (error) {
    console.error(`Error deleting entry for date ${date}:`, error);
    throw error;
  }
}
