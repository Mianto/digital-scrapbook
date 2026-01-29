# Storage Abstraction Layer

This directory contains the storage abstraction layer for the digital scrapbook app. It provides a clean interface for storing and retrieving scrapbook entries and photos, with support for multiple storage backends.

## Architecture

```
lib/storage/
├── interface.ts        # StorageAdapter interface definition
├── local.ts           # Local filesystem implementation
├── vercel-blob.ts     # Vercel Blob Storage implementation
├── index.ts           # Factory function to get adapter
└── README.md          # This file
```

## Supported Storage Backends

### 1. Local Filesystem (`local.ts`)
- **Use case**: Local development
- **Entries**: Stored as JSON files in `/data/entries/`
- **Photos**: Stored in `/public/uploads/`
- **Pros**: Simple, no setup required, works offline
- **Cons**: Doesn't work on serverless platforms (Vercel, AWS Lambda)

### 2. Vercel Blob (`vercel-blob.ts`)
- **Use case**: Production deployment on Vercel
- **Entries**: Stored as JSON blobs with `entries/` prefix
- **Photos**: Stored as image blobs
- **Pros**: Works on serverless, CDN, scalable, free tier
- **Cons**: Requires Vercel account and Blob setup

## How It Works

### Automatic Adapter Selection

The system automatically chooses the right adapter based on your environment:

```typescript
import { getStorageAdapter } from '@/lib/storage';

const storage = getStorageAdapter();
// Uses Vercel Blob if BLOB_READ_WRITE_TOKEN exists
// Uses Local filesystem otherwise
```

### Manual Override

You can force a specific adapter using the `STORAGE_ADAPTER` environment variable:

```bash
# Force local filesystem
STORAGE_ADAPTER=local npm run dev

# Force Vercel Blob
STORAGE_ADAPTER=vercel npm run dev
```

## Adding a New Storage Backend

Want to add support for AWS S3, Cloudflare R2, or another platform? Here's how:

### Step 1: Create Your Adapter

Create a new file `lib/storage/your-adapter.ts`:

```typescript
import { StorageAdapter } from './interface';
import { ScrapbookEntry } from '@/types';

export class YourStorageAdapter implements StorageAdapter {
  async listEntries(): Promise<ScrapbookEntry[]> {
    // Implement: List all entries
  }

  async getEntry(date: string): Promise<ScrapbookEntry | null> {
    // Implement: Get single entry by date
  }

  async createEntry(entry: ScrapbookEntry): Promise<void> {
    // Implement: Create new entry
  }

  async deleteEntry(date: string): Promise<void> {
    // Implement: Delete entry and its photos
  }

  async uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    // Implement: Upload photo, return URL
  }

  async deletePhoto(url: string): Promise<void> {
    // Implement: Delete photo
  }
}
```

### Step 2: Update the Factory

Edit `lib/storage/index.ts`:

```typescript
import { YourStorageAdapter } from './your-adapter';

export function getStorageAdapter(): StorageAdapter {
  const forceAdapter = process.env.STORAGE_ADAPTER;

  if (forceAdapter === 'your-adapter') {
    console.log('Using Your Storage Adapter');
    return new YourStorageAdapter();
  }

  // ... existing code
}
```

### Step 3: Install Dependencies

```bash
pnpm add your-storage-sdk
```

### Step 4: Configure Environment Variables

Add required tokens/keys to `.env.local`:

```bash
YOUR_STORAGE_TOKEN=your-token-here
```

### Step 5: Test

```bash
STORAGE_ADAPTER=your-adapter npm run dev
```

## StorageAdapter Interface

All adapters must implement this interface:

```typescript
interface StorageAdapter {
  // Entry operations
  listEntries(): Promise<ScrapbookEntry[]>;
  getEntry(date: string): Promise<ScrapbookEntry | null>;
  createEntry(entry: ScrapbookEntry): Promise<void>;
  deleteEntry(date: string): Promise<void>;

  // Photo operations
  uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string>;
  deletePhoto(url: string): Promise<void>;
}
```

### Method Details

#### `listEntries()`
- Returns all scrapbook entries
- Should be sorted by date (newest first)
- Returns empty array on error

#### `getEntry(date: string)`
- Gets a single entry by date (YYYY-MM-DD format)
- Returns `null` if not found

#### `createEntry(entry: ScrapbookEntry)`
- Creates a new entry
- Should throw on error

#### `deleteEntry(date: string)`
- Deletes an entry and all its associated photos
- Should handle missing photos gracefully
- Should throw if entry doesn't exist

#### `uploadPhoto(buffer, filename, contentType)`
- Uploads a photo
- Returns the public URL to access the photo
- Should throw on error

#### `deletePhoto(url: string)`
- Deletes a photo by URL
- Should handle missing photos gracefully

## Examples

### AWS S3 Adapter (Hypothetical)

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { StorageAdapter } from './interface';
import { ScrapbookEntry } from '@/types';

export class S3StorageAdapter implements StorageAdapter {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
    this.bucket = process.env.S3_BUCKET!;
  }

  async listEntries(): Promise<ScrapbookEntry[]> {
    const result = await this.s3.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: 'entries/',
    }));

    const entries = await Promise.all(
      (result.Contents || []).map(async (obj) => {
        const data = await this.s3.send(new GetObjectCommand({
          Bucket: this.bucket,
          Key: obj.Key!,
        }));
        const body = await data.Body?.transformToString();
        return JSON.parse(body!) as ScrapbookEntry;
      })
    );

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async uploadPhoto(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: `photos/${filename}`,
      Body: buffer,
      ContentType: contentType,
    }));
    return `https://${this.bucket}.s3.amazonaws.com/photos/${filename}`;
  }

  // ... implement other methods
}
```

### Cloudflare R2 Adapter (Hypothetical)

```typescript
import { R2 } from '@cloudflare/workers-types';
import { StorageAdapter } from './interface';

export class R2StorageAdapter implements StorageAdapter {
  // Similar to S3, as R2 uses S3-compatible API
  // ...
}
```

## Environment Variable Reference

### Local Filesystem
No environment variables required.

### Vercel Blob
- `BLOB_READ_WRITE_TOKEN` - Auto-added when you connect Vercel Blob to your project

### Force Specific Adapter
- `STORAGE_ADAPTER=local` - Force local filesystem
- `STORAGE_ADAPTER=vercel` - Force Vercel Blob
- `STORAGE_ADAPTER=your-adapter` - Force your custom adapter

## Migration Between Adapters

To migrate data between storage backends:

1. Export data from old adapter
2. Import to new adapter
3. Switch `STORAGE_ADAPTER` env variable

We'll create migration scripts in the future as needed.

## Testing

To test your adapter:

1. Create a test entry
2. Upload photos
3. List entries
4. Delete entry
5. Verify cascade deletion of photos

```bash
# Test with local
STORAGE_ADAPTER=local npm run dev

# Test with Vercel Blob
STORAGE_ADAPTER=vercel npm run dev
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Log operations for debugging
3. **Cleanup**: Delete cascade (entry → photos)
4. **Idempotency**: Operations should be safe to retry
5. **Performance**: Use parallel operations where possible
6. **Security**: Never expose credentials in code

## Questions?

Check the main documentation or open an issue on GitHub.
