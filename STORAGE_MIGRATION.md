# Storage Migration Summary

## What Changed

Your digital scrapbook has been migrated from local filesystem storage to **Vercel Blob Storage** to work on Vercel's serverless platform.

### Before (Local Development)
```
/public/uploads/          → Photos stored as files
/data/entries/            → Entries stored as JSON files
```

### After (Cloud Storage)
```
Vercel Blob Storage:
  - Photos stored as image blobs
  - Entries stored as JSON blobs (entries/*.json)
```

## Why This Change?

Vercel's serverless functions have **read-only filesystems**. You cannot write to:
- `/public/uploads/` for photos
- `/data/entries/` for JSON entries

The solution: **Vercel Blob Storage** - a cloud storage service that:
- ✅ Works on serverless platforms
- ✅ Free tier: 1GB storage, 100GB bandwidth/month
- ✅ Automatic CDN distribution
- ✅ Fast and reliable
- ✅ No additional setup beyond connecting it

## What You Need to Do

### 1. Set Up Vercel Blob Storage (REQUIRED)

In your Vercel dashboard:

1. Go to your project → **Storage** tab
2. Click **Create Database** → Select **Blob**
3. Name it: `digital-scrapbook-storage`
4. Click **Create**
5. Click **Connect Project**
6. Select: Production, Preview, Development
7. Click **Connect**

This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables.

### 2. Redeploy Your App

After connecting Blob storage:

1. Go to **Deployments** tab
2. Click **three dots** (...) on latest deployment
3. Click **Redeploy**
4. Wait for completion (~2-3 minutes)

### 3. Push Your Code

```bash
git push origin main
```

Your latest code with Blob storage support will auto-deploy.

## Testing

After deployment, test:

1. ✅ Login to `/admin`
2. ✅ Create a new entry with photos
3. ✅ View entry on homepage
4. ✅ View individual entry page
5. ✅ Delete an entry (should delete photos too)

## Backwards Compatibility

The code still supports legacy local files for development:
- Photos: Checks if URL starts with `https://` (Blob) or `/uploads/` (local)
- Entries: Blob storage only (no filesystem fallback)

For **local development**, you'll need:
- `BLOB_READ_WRITE_TOKEN` in `.env.local`
- Get it from: Vercel Dashboard → Storage → Blob → Settings → Copy Token

## Files Changed

- `app/api/upload/route.ts` - Upload photos to Blob instead of filesystem
- `lib/entries.ts` - Store entries in Blob instead of JSON files
- `next.config.js` - Allow Blob URLs in Next.js Image component
- `VERCEL_DEPLOYMENT.md` - Updated deployment instructions

## Cost

**Free Tier Limits:**
- 1 GB storage (~200-500 photos)
- 100 GB bandwidth/month
- Unlimited requests

Perfect for personal use. Monitor usage in Vercel Dashboard → Storage.

## Troubleshooting

### "No token found" Error
- Blob Storage not connected to project
- Solution: Follow Step 1 above, then redeploy

### "EROFS: read-only file system" Error
- Old code trying to write to filesystem
- Solution: Ensure latest code is deployed (`git push origin main`)

### Photos Not Loading
- Blob URLs not allowed in next.config.js
- Solution: Verify `next.config.js` has remotePatterns for `**.public.blob.vercel-storage.com`

### Local Development Not Working
- Missing BLOB_READ_WRITE_TOKEN
- Solution: Copy token from Vercel Dashboard to `.env.local`

## Need Help?

See `VERCEL_DEPLOYMENT.md` for complete deployment guide.
