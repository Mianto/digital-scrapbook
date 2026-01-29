import { ScrapbookEntry } from '@/types';
import { getStorageAdapter } from './storage';

// Get the storage adapter (automatically chooses based on environment)
const storage = getStorageAdapter();

/**
 * Get all scrapbook entries, sorted by date (newest first)
 */
export async function getAllEntries(): Promise<ScrapbookEntry[]> {
  return storage.listEntries();
}

/**
 * Get a single entry by date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getEntryByDate(date: string): Promise<ScrapbookEntry | null> {
  return storage.getEntry(date);
}

/**
 * Create a new scrapbook entry
 * @param entry - The entry to create
 */
export async function createEntry(entry: ScrapbookEntry): Promise<void> {
  return storage.createEntry(entry);
}

/**
 * Delete an entry and all its associated photos
 * @param date - Date in YYYY-MM-DD format
 */
export async function deleteEntry(date: string): Promise<void> {
  return storage.deleteEntry(date);
}
