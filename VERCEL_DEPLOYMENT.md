# Vercel Deployment Guide

## Prerequisites
- GitHub account with `digital-scrapbook` repository pushed
- Vercel account (sign up at https://vercel.com)

## Step-by-Step Deployment

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository `Mianto/digital-scrapbook`
3. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)

### 2. Add Environment Variables

Before clicking "Deploy", add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `SCRAPBOOK_PASSWORD` | Your shared password | Choose a secure password |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Random secret for JWT |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Update after first deploy |

Click **Deploy** and wait for build to complete (2-3 minutes).

### 3. Set Up Vercel Blob Storage

**CRITICAL**: App won't work until you set this up. All data (photos + entries) is stored in Blob.

1. Go to your project dashboard in Vercel
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Blob** storage
5. Click **Continue**
6. Name it: `digital-scrapbook-storage`
7. Click **Create**

### 4. Connect Blob Store to Project

1. After creating Blob store, click **Connect Project**
2. Select `digital-scrapbook`
3. Select environments: **Production**, **Preview**, **Development**
4. Click **Connect**

This automatically adds `BLOB_READ_WRITE_TOKEN` environment variable.

### 5. Update NEXTAUTH_URL

1. Copy your deployment URL (e.g., `https://digital-scrapbook-abc123.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **Edit**
4. Update to your actual deployment URL
5. Save changes

### 6. Redeploy

1. Go to **Deployments** tab
2. Click **three dots** (...) on latest deployment
3. Click **Redeploy**
4. Wait for redeployment to complete

### 7. Test Your Deployment

1. Visit your Vercel URL
2. Navigate to `/admin` (should redirect to login)
3. Login with your `SCRAPBOOK_PASSWORD`
4. Create a test entry with photos
5. Verify photos upload and display correctly
6. Check that entry appears on homepage

## Data Storage Architecture

All data is stored in **Vercel Blob Storage**:

- **Photos**: Stored as image blobs (JPEG, PNG, etc.)
- **Entries**: Stored as JSON blobs under `entries/` prefix
- **No local filesystem**: Everything is in the cloud

### Vercel Blob Pricing (Free Tier)

- **Storage**: 1 GB
- **Bandwidth**: 100 GB/month
- **Requests**: Unlimited

Perfect for personal scrapbook use. You can store ~200-500 photos depending on size, plus all entry metadata.

## Environment Variables Summary

### Production Environment Variables

```bash
SCRAPBOOK_PASSWORD=your-shared-password
NEXTAUTH_SECRET=random-32-character-string
NEXTAUTH_URL=https://your-project.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_token (auto-added)
```

### Local Development (.env.local)

```bash
SCRAPBOOK_PASSWORD=your-shared-password
NEXTAUTH_SECRET=random-32-character-string
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=your-local-token-from-vercel
```

To get `BLOB_READ_WRITE_TOKEN` for local development:
1. Vercel Dashboard → Storage → Blob
2. Click your blob store
3. Settings tab → Copy "Read Write Token"

## Automatic Deployments

Every push to `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically build and deploy in ~2-3 minutes.

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain
4. Redeploy

## Troubleshooting

### "No token found" error
- Ensure Vercel Blob is created and connected to your project
- Redeploy after connecting Blob storage

### "EROFS: read-only file system" error
- This means Blob storage isn't set up yet
- Follow Step 3-4 above to create and connect Blob storage

### Login not working
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check browser console for errors

### Photos not uploading
- Verify `BLOB_READ_WRITE_TOKEN` exists in environment variables
- Check Vercel function logs for errors
- Ensure Blob store is connected to correct project

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `pnpm-lock.yaml` is committed

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- Next.js Docs: https://nextjs.org/docs
