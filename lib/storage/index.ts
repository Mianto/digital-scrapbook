import { StorageAdapter } from './interface';
import { LocalStorageAdapter } from './local';
import { VercelBlobAdapter } from './vercel-blob';

/**
 * Get the appropriate storage adapter based on environment
 *
 * Strategy:
 * - If BLOB_READ_WRITE_TOKEN exists: Use Vercel Blob (production/Vercel)
 * - Otherwise: Use Local filesystem (development)
 *
 * You can override by setting STORAGE_ADAPTER env variable:
 * - STORAGE_ADAPTER=local   → Force local filesystem
 * - STORAGE_ADAPTER=vercel  → Force Vercel Blob
 */
export function getStorageAdapter(): StorageAdapter {
  const forceAdapter = process.env.STORAGE_ADAPTER;

  if (forceAdapter === 'local') {
    console.log('Using Local Storage Adapter (forced)');
    return new LocalStorageAdapter();
  }

  if (forceAdapter === 'vercel') {
    console.log('Using Vercel Blob Storage Adapter (forced)');
    return new VercelBlobAdapter();
  }

  // Auto-detect based on environment
  const hasVercelBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (hasVercelBlobToken) {
    console.log('Using Vercel Blob Storage Adapter (auto-detected)');
    return new VercelBlobAdapter();
  }

  console.log('Using Local Storage Adapter (auto-detected)');
  return new LocalStorageAdapter();
}

// Export the interface for type safety
export type { StorageAdapter } from './interface';
