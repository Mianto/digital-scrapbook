import { ScrapbookEntry } from '@/types';
import fs from 'fs/promises';
import path from 'path';

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
    const filePath = path.join(DATA_DIR, `${date}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting entry for date ${date}:`, error);
    throw error;
  }
}
