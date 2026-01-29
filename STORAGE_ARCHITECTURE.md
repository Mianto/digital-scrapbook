# Storage Architecture

## Overview

Your digital scrapbook now uses a **clean storage abstraction layer** with pluggable adapters. This allows you to easily switch between storage backends and add support for new platforms.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (lib/entries.ts, app/api/upload/route.ts)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Storage Abstraction Layer                       │
│                 (lib/storage/)                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         StorageAdapter Interface                   │    │
│  │  - listEntries()                                   │    │
│  │  - getEntry(date)                                  │    │
│  │  - createEntry(entry)                              │    │
│  │  - deleteEntry(date)                               │    │
│  │  - uploadPhoto(buffer, filename, contentType)      │    │
│  │  - deletePhoto(url)                                │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                     │
│         ┌──────────────┴──────────────┐                    │
│         ▼                              ▼                     │
│  ┌─────────────┐              ┌─────────────┐             │
│  │   Local     │              │   Vercel    │             │
│  │  Adapter    │              │    Blob     │             │
│  │             │              │   Adapter   │             │
│  └─────────────┘              └─────────────┘             │
│         │                              │                     │
└─────────┼──────────────────────────────┼─────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────┐          ┌─────────────────────┐
│   Filesystem    │          │   Vercel Blob       │
│                 │          │   Storage (Cloud)   │
│ /data/entries/  │          │                     │
│ /public/uploads/│          │ entries/*.json      │
└─────────────────┘          │ photos/*.jpg        │
                             └─────────────────────┘
```

## How It Works

### 1. Automatic Adapter Selection

The system automatically chooses the right storage backend:

```typescript
import { getStorageAdapter } from '@/lib/storage';

// Automatically chooses:
// - Vercel Blob if BLOB_READ_WRITE_TOKEN exists
// - Local filesystem otherwise
const storage = getStorageAdapter();
```

**Detection Logic:**
- ✅ If `BLOB_READ_WRITE_TOKEN` exists → **Vercel Blob**
- ✅ Otherwise → **Local Filesystem**

### 2. Manual Override

Force a specific adapter with environment variable:

```bash
# Development with local storage
STORAGE_ADAPTER=local npm run dev

# Development with Vercel Blob (requires token)
STORAGE_ADAPTER=vercel npm run dev
```

## Storage Adapters

### Local Filesystem Adapter

**Use Case:** Local development

**Storage:**
- Entries: `/data/entries/*.json`
- Photos: `/public/uploads/*.jpg`

**Pros:**
- ✅ Zero setup required
- ✅ Works offline
- ✅ Fast for development
- ✅ Easy to inspect files

**Cons:**
- ❌ Doesn't work on serverless platforms
- ❌ Not suitable for production

**When Used:**
- Local development (`npm run dev`)
- When `BLOB_READ_WRITE_TOKEN` is not set

### Vercel Blob Adapter

**Use Case:** Production deployment on Vercel

**Storage:**
- Entries: Blob storage with `entries/` prefix
- Photos: Blob storage (image files)

**Pros:**
- ✅ Works on serverless platforms
- ✅ Automatic CDN distribution
- ✅ Scalable and reliable
- ✅ Free tier: 1GB storage + 100GB bandwidth

**Cons:**
- ❌ Requires Vercel account
- ❌ Requires Blob setup

**When Used:**
- Production on Vercel
- When `BLOB_READ_WRITE_TOKEN` is set

## Adding New Storage Backends

The architecture makes it easy to add support for AWS S3, Cloudflare R2, Supabase, or any other storage platform.

### Example: AWS S3 Adapter

1. **Create adapter** (`lib/storage/s3.ts`):
```typescript
import { StorageAdapter } from './interface';
import { S3Client } from '@aws-sdk/client-s3';

export class S3StorageAdapter implements StorageAdapter {
  // Implement all interface methods
  async listEntries() { /* ... */ }
  async getEntry(date) { /* ... */ }
  async createEntry(entry) { /* ... */ }
  async deleteEntry(date) { /* ... */ }
  async uploadPhoto(buffer, filename, contentType) { /* ... */ }
  async deletePhoto(url) { /* ... */ }
}
```

2. **Update factory** (`lib/storage/index.ts`):
```typescript
import { S3StorageAdapter } from './s3';

export function getStorageAdapter(): StorageAdapter {
  if (process.env.STORAGE_ADAPTER === 's3') {
    return new S3StorageAdapter();
  }
  // ... existing code
}
```

3. **Use it:**
```bash
STORAGE_ADAPTER=s3 \
AWS_ACCESS_KEY_ID=xxx \
AWS_SECRET_ACCESS_KEY=yyy \
npm run dev
```

See `lib/storage/README.md` for detailed instructions.

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Business logic doesn't know about storage details
- Easy to test and maintain
- Clean interfaces

### 2. **Flexibility**
- Switch storage backends without changing app code
- Support multiple platforms
- Easy A/B testing

### 3. **Local Development**
- No cloud dependencies for development
- Fast iteration
- No costs during development

### 4. **Production Ready**
- Seamless cloud storage on Vercel
- Scalable and reliable
- Automatic CDN

### 5. **Extensibility**
- Add new adapters easily
- Follow same interface
- Type-safe with TypeScript

### 6. **Migration Path**
- Start with local filesystem
- Deploy to Vercel with Blob
- Migrate to S3/R2 if needed
- Or use multiple adapters for different purposes

## Environment Variables

### For Local Development

```bash
# .env.local
SCRAPBOOK_PASSWORD=your-password
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Force specific adapter
STORAGE_ADAPTER=local
```

### For Vercel Production

```bash
# Set in Vercel Dashboard
SCRAPBOOK_PASSWORD=your-password
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx  # Auto-added by Vercel
```

### Force Adapter Override

```bash
# Force local (even if BLOB_READ_WRITE_TOKEN exists)
STORAGE_ADAPTER=local

# Force Vercel Blob
STORAGE_ADAPTER=vercel

# Use your custom adapter
STORAGE_ADAPTER=s3
```

## File Structure

```
lib/storage/
├── interface.ts          # StorageAdapter interface
├── local.ts             # Local filesystem implementation
├── vercel-blob.ts       # Vercel Blob implementation
├── index.ts             # Factory with auto-detection
└── README.md            # Detailed documentation

lib/
└── entries.ts           # High-level API using storage adapter

app/api/
└── upload/route.ts      # Upload API using storage adapter
```

## Usage Examples

### In Application Code

```typescript
// lib/entries.ts
import { getStorageAdapter } from './storage';

const storage = getStorageAdapter();

export async function getAllEntries() {
  return storage.listEntries();
}

export async function createEntry(entry: ScrapbookEntry) {
  return storage.createEntry(entry);
}
```

### In API Routes

```typescript
// app/api/upload/route.ts
import { getStorageAdapter } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const storage = getStorageAdapter();
  const url = await storage.uploadPhoto(buffer, filename, contentType);
  return NextResponse.json({ url });
}
```

## Testing

### Test with Local Storage

```bash
npm run dev
# Automatically uses local filesystem
```

### Test with Vercel Blob (Local)

```bash
# Get token from Vercel Dashboard → Storage → Blob → Settings
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_xxx" >> .env.local
npm run dev
```

### Test Build

```bash
pnpm build
# Check output: "Using Local Storage Adapter" or "Using Vercel Blob"
```

## Deployment

### To Vercel

1. Set up Vercel Blob Storage (one-time)
2. Connect it to your project
3. Push code: `git push origin main`
4. Vercel automatically uses Blob adapter in production

See `VERCEL_DEPLOYMENT.md` for complete guide.

## Migration Between Adapters

If you need to migrate data from one adapter to another:

1. Export from old adapter
2. Import to new adapter
3. Switch environment variable

We can create migration scripts as needed in the future.

## Monitoring

Each adapter logs its operations:

```
Using Local Storage Adapter (auto-detected)
Created entry: 2026-01-29.json
Uploaded photo: abc123.jpg
Deleted entry: 2026-01-28.json
```

Check your console/logs to see which adapter is being used.

## FAQ

**Q: Which adapter is used by default?**
A: Auto-detected. Vercel Blob if `BLOB_READ_WRITE_TOKEN` exists, otherwise Local filesystem.

**Q: Can I use local storage on Vercel?**
A: No, Vercel has read-only filesystem. You must use Blob or another cloud storage.

**Q: Can I use Vercel Blob locally?**
A: Yes! Add `BLOB_READ_WRITE_TOKEN` to `.env.local` and it will auto-detect.

**Q: How do I add AWS S3 support?**
A: Create `lib/storage/s3.ts` implementing `StorageAdapter`, then add to factory. See `lib/storage/README.md`.

**Q: Can I use different adapters for entries vs photos?**
A: Not currently, but you could extend the architecture to support this.

**Q: Is the data compatible between adapters?**
A: Yes! The `ScrapbookEntry` format is the same. Photo URLs differ (local: `/uploads/x.jpg`, blob: `https://...`).

## Next Steps

1. ✅ Push your code: `git push origin main`
2. ✅ Set up Vercel Blob in dashboard
3. ✅ Deploy and test
4. ✅ (Optional) Add custom storage adapters as needed

## Resources

- `lib/storage/README.md` - Detailed adapter documentation
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `STORAGE_MIGRATION.md` - Migration notes
- TypeScript interfaces for type safety
