# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy your Digital Scrapbook to Vercel with cloud storage.

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at https://vercel.com - free tier available)
- 10 minutes of your time

## 🎯 Quick Overview

The deployment process:
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Create Vercel Blob Storage
5. Connect Blob to project
6. Redeploy and test

---

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already initialized)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/digital-scrapbook.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to **https://vercel.com/new**
2. **Sign in** with your GitHub account
3. **Import** your `digital-scrapbook` repository
4. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm run build` (default)
   - **Output Directory**: `.next` (default)

**Don't click Deploy yet!** First, add environment variables.

### Step 3: Add Environment Variables

Click **Environment Variables** and add these:

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `SCRAPBOOK_PASSWORD` | `your-secure-password` | Choose a strong password for login |
| `NEXTAUTH_SECRET` | `abc123...` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL (update after first deploy) |

**Note**: `NEXTAUTH_URL` can be a placeholder for now - we'll update it after deployment.

Now click **Deploy** and wait 2-3 minutes for the build to complete.

### Step 4: Create Vercel Blob Storage

**⚠️ CRITICAL**: The app won't work without Blob Storage. All photos and entries are stored in the cloud.

1. Go to your **project dashboard** in Vercel
2. Click the **Storage** tab
3. Click **Create Database**
4. Select **Blob** storage
5. Click **Continue**
6. Name it: `digital-scrapbook-storage` (or any name)
7. Click **Create**

### Step 5: Connect Blob Storage to Project

1. After creating the Blob store, click **Connect Project**
2. Select your `digital-scrapbook` project
3. Select environments:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
4. Click **Connect**

This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

### Step 6: Update NEXTAUTH_URL

1. Copy your **deployment URL** (e.g., `https://digital-scrapbook-abc123.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **Edit**
4. Update the value to your actual deployment URL
5. Click **Save**

### Step 7: Redeploy

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots** (...) menu
4. Click **Redeploy**
5. Click **Redeploy** again to confirm
6. Wait 2-3 minutes for redeployment

### Step 8: Test Your Deployment ✅

1. Visit your Vercel URL
2. You should see the scrapbook homepage
3. Navigate to `/admin` (should redirect to `/login`)
4. **Login** with your `SCRAPBOOK_PASSWORD`
5. **Create a test entry**:
   - Upload photos (try HEIC if you have an iPhone)
   - Add title and description
   - Click "Preview Entry" to check
   - Click "Create Entry" to save
6. **Verify** the entry appears on the homepage
7. **Check photos** display correctly with vintage effects

**🎉 Congratulations!** Your digital scrapbook is now live!

---

## 🏗️ Architecture Overview

### Data Storage

All data is stored in **Vercel Blob Storage**:

- **Photos**: Image blobs (JPEG, PNG, WebP)
- **Entries**: JSON blobs (under `entries/` prefix)
- **No Local Filesystem**: Everything is in the cloud

### Vercel Blob Pricing (Free Tier)

- **Storage**: 1 GB
- **Bandwidth**: 100 GB/month
- **Requests**: Unlimited

**Perfect for personal use!** Can store ~200-500 photos depending on size.

### How It Works

When you deploy to Vercel:
1. Code runs as serverless functions (read-only filesystem)
2. Photos uploaded to Vercel Blob Storage
3. Entries saved as JSON blobs
4. CDN serves photos globally for fast loading

---

## 🔧 Environment Variables Reference

### Production (Vercel Dashboard)

```bash
SCRAPBOOK_PASSWORD=YourSecurePassword123
NEXTAUTH_SECRET=abc123randomsecret456def789
NEXTAUTH_URL=https://your-app.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_rga_xxx  # Auto-added by Vercel
```

### Local Development (.env.local)

```bash
SCRAPBOOK_PASSWORD=YourSecurePassword123
NEXTAUTH_SECRET=abc123randomsecret456def789
NEXTAUTH_URL=http://localhost:3000
# BLOB_READ_WRITE_TOKEN=vercel_blob_rga_xxx  # Optional: for testing Blob locally
```

**To get Blob token for local development:**
1. Vercel Dashboard → Storage → Blob
2. Click your blob store name
3. Go to Settings tab
4. Copy "Read Write Token"
5. Add to `.env.local`

---

## 🔄 Continuous Deployment

### Automatic Deployments

Every push to `main` branch triggers automatic deployment:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs tests (if configured)
# 3. Builds the project
# 4. Deploys to production
# 5. Updates your live site (2-3 minutes)
```

### Preview Deployments

Vercel creates preview deployments for pull requests:
- Each PR gets a unique preview URL
- Test changes before merging to production
- Automatic cleanup after PR is closed

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Settings** → **Domains**
2. Enter your domain name (e.g., `ourscrapbook.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy the project

### SSL Certificate

- Automatically provisioned by Vercel
- Free Let's Encrypt certificate
- Renews automatically

---

## 🐛 Troubleshooting

### "No token found" Error

**Symptom**: App crashes with `BLOB_READ_WRITE_TOKEN` error

**Solution**:
1. Ensure Vercel Blob Storage is created (Step 4)
2. Verify Blob is connected to project (Step 5)
3. Check Environment Variables has `BLOB_READ_WRITE_TOKEN`
4. Redeploy the project

### "EROFS: read-only file system" Error

**Symptom**: Photos or entries fail to save

**Solution**:
- This means Blob Storage isn't set up
- Follow Steps 4-5 to create and connect Blob Storage
- The app uses cloud storage, not the filesystem

### Login Not Working

**Symptom**: Can't login or redirected incorrectly

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set in environment variables
2. Verify `NEXTAUTH_URL` matches your actual deployment URL (no trailing slash)
3. Clear browser cookies and try again
4. Check browser console for errors

### Photos Not Uploading

**Symptom**: Upload fails or images don't appear

**Solution**:
1. Check `BLOB_READ_WRITE_TOKEN` exists in environment variables
2. Go to Deployments → Logs to see error details
3. Ensure Blob Store is connected to the correct project
4. Try uploading a different image format (JPEG instead of HEIC)

### Build Fails

**Symptom**: Deployment fails during build

**Solution**:
1. Check build logs in Vercel Deployments tab
2. Ensure all dependencies are in `package.json`
3. Verify `pnpm-lock.yaml` is committed to git
4. Try building locally: `pnpm run build`
5. Check for TypeScript errors: `pnpm run lint`

### HEIC Images Not Converting

**Symptom**: HEIC uploads fail

**Solution**:
- HEIC conversion works automatically server-side
- Ensure latest code is deployed
- Check function logs for conversion errors
- Try uploading JPEG/PNG as alternative

### Slow Performance

**Symptom**: Site loads slowly

**Solution**:
- Vercel CDN should be fast globally
- Check image sizes (optimize large photos before upload)
- Verify Blob Storage is in same region
- Consider upgrading to Vercel Pro for faster builds

---

## 📊 Monitoring & Logs

### View Logs

1. Go to your project in Vercel
2. Click **Deployments**
3. Click on a deployment
4. Click **Function Logs** to see server-side logs

### Usage Metrics

1. Go to **Storage** tab
2. Click on your Blob store
3. View storage usage and bandwidth

### Performance Monitoring

- **Analytics** tab shows page views and performance
- **Speed Insights** shows Core Web Vitals
- Free on Pro plan

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use strong, unique passwords
- ✅ Rotate `NEXTAUTH_SECRET` periodically
- ✅ Use Vercel's secure environment variable storage

### Access Control

- 🔐 Protected routes via NextAuth middleware
- 🔐 Admin panel requires authentication
- 🔐 API routes validate sessions

### Data Privacy

- All data stored in your Vercel account
- You control all photos and entries
- Can export or delete data anytime

---

## 🆘 Getting Help

### Documentation

- **This App**: See [README.md](README.md)
- **Vercel**: https://vercel.com/docs
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob
- **Next.js**: https://nextjs.org/docs

### Common Resources

- **Vercel Status**: https://www.vercel-status.com
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Next.js Discord**: https://nextjs.org/discord

### Support Channels

- **GitHub Issues**: Report bugs or request features
- **Vercel Support**: support@vercel.com (Pro users)
- **Documentation**: Check README and this guide first

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] App loads at Vercel URL
- [ ] Homepage displays timeline
- [ ] Can navigate to `/admin` and login
- [ ] Can create new entry with photos
- [ ] Photos display with vintage effects
- [ ] Entry appears on homepage
- [ ] Can delete entries (cascade deletes photos)
- [ ] Photo reordering works
- [ ] Preview modal works
- [ ] HEIC photos convert automatically
- [ ] Mobile responsive design works

---

## 🎉 You're Done!

Your Digital Scrapbook is now live and ready to preserve your memories!

**Share your URL** with your partner and start documenting your journey together.

**Need help?** Check the troubleshooting section or open an issue on GitHub.
