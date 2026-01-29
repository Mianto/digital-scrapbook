import { StorageAdapter } from './interface';
import { ScrapbookEntry } from '@/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Local filesystem storage adapter
 * Stores entries as JSON files and photos in public/uploads
 */
export class LocalStorageAdapter implements StorageAdapter {
  private entriesDir: string;
  private uploadsDir: string;

  constructor() {
    this.entriesDir = path.join(process.cwd(), 'data', 'entries');
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  }

  async listEntries(): Promise<ScrapbookEntry[]> {
    try {
      await fs.mkdir(this.entriesDir, { recursive: true });
      const files = await fs.readdir(this.entriesDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const entries = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(this.entriesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content) as ScrapbookEntry;
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
      const filePath = path.join(this.entriesDir, `${date}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as ScrapbookEntry;
    } catch (error) {
      console.error(`Error reading entry for date ${date}:`, error);
      return null;
    }
  }

  async createEntry(entry: ScrapbookEntry): Promise<void> {
    try {
      await fs.mkdir(this.entriesDir, { recursive: true });
      const filePath = path.join(this.entriesDir, `${entry.date}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
      console.log(`Created entry: ${entry.date}.json`);
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

      const filePath = path.join(this.entriesDir, `${date}.json`);
      await fs.unlink(filePath);
      console.log(`Deleted entry: ${date}.json`);
    } catch (error) {
      console.error(`Error deleting entry for date ${date}:`, error);
      throw error;
    }
  }

  async uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      const filepath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filepath, buffer);
      console.log(`Uploaded photo: ${filename}`);
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async deletePhoto(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (filename) {
        const filepath = path.join(this.uploadsDir, filename);
        await fs.unlink(filepath);
        console.log(`Deleted photo: ${filename}`);
      }
    } catch (error) {
      console.error(`Error deleting photo ${url}:`, error);
      throw error;
    }
  }
}
