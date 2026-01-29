import { ScrapbookEntry } from '@/types';

/**
 * Storage adapter interface for scrapbook data
 * Implement this interface to support different storage backends
 */
export interface StorageAdapter {
  // Entry operations
  listEntries(): Promise<ScrapbookEntry[]>;
  getEntry(date: string): Promise<ScrapbookEntry | null>;
  createEntry(entry: ScrapbookEntry): Promise<void>;
  deleteEntry(date: string): Promise<void>;

  // Photo operations
  uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string>;
  deletePhoto(url: string): Promise<void>;
}
