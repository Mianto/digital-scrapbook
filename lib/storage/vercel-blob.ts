import { StorageAdapter } from './interface';
import { ScrapbookEntry } from '@/types';
import { list, put, del, head } from '@vercel/blob';

/**
 * Vercel Blob storage adapter
 * Stores both entries and photos in Vercel Blob Storage
 */
export class VercelBlobAdapter implements StorageAdapter {
  private readonly ENTRY_PREFIX = 'entries/';

  async listEntries(): Promise<ScrapbookEntry[]> {
    try {
      const { blobs } = await list({ prefix: this.ENTRY_PREFIX });

      const entries = await Promise.all(
        blobs.map(async (blob) => {
          const response = await fetch(blob.url);
          const entry = await response.json() as ScrapbookEntry;
          return entry;
        })
      );

      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error reading entries:', error);
      return [];
    }
  }

  async getEntry(date: string): Promise<ScrapbookEntry | null> {
    try {
      const pathname = `${this.ENTRY_PREFIX}${date}.json`;
      const blob = await head(pathname);

      if (!blob) {
        return null;
      }

      const response = await fetch(blob.url);
      const entry = await response.json() as ScrapbookEntry;
      return entry;
    } catch (error) {
      console.error(`Error reading entry for date ${date}:`, error);
      return null;
    }
  }

  async createEntry(entry: ScrapbookEntry): Promise<void> {
    try {
      const pathname = `${this.ENTRY_PREFIX}${entry.date}.json`;
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

  async deleteEntry(date: string): Promise<void> {
    try {
      const entry = await this.getEntry(date);

      if (entry && entry.photos && entry.photos.length > 0) {
        const deletePhotoPromises = entry.photos.map(async (photo) => {
          try {
            await this.deletePhoto(photo.url);
          } catch (photoError) {
            console.warn(`Failed to delete photo ${photo.url}:`, photoError);
          }
        });
        await Promise.allSettled(deletePhotoPromises);
      }

      const pathname = `${this.ENTRY_PREFIX}${date}.json`;
      await del(pathname);
      console.log(`Deleted entry: ${pathname}`);
    } catch (error) {
      console.error(`Error deleting entry for date ${date}:`, error);
      throw error;
    }
  }

  async uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    try {
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType,
      });
      console.log(`Uploaded photo to Blob: ${filename}`);
      return blob.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async deletePhoto(url: string): Promise<void> {
    try {
      await del(url);
      console.log(`Deleted blob: ${url}`);
    } catch (error) {
      console.error(`Error deleting photo ${url}:`, error);
      throw error;
    }
  }
}
