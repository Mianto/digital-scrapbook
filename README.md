# 📸 Digital Scrapbook

A beautiful, vintage-styled digital scrapbook web application for couples to document daily memories with photos and stories. Features a nostalgic Polaroid aesthetic with automatic HEIC support and cloud storage.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📷 **Photo-First Design** - Upload multiple photos per entry with drag-and-drop
- 🎨 **Vintage Aesthetic** - Polaroid frames, sepia filters, paper textures, handwritten fonts
- 🍎 **HEIC Support** - Automatic conversion of Apple Photos (HEIC/HEIF) to JPEG
- 🔐 **Simple Authentication** - Shared password for both users
- 📱 **Responsive Design** - Works beautifully on mobile and desktop
- 📝 **Rich Entries** - Title, date, description, multiple photos with captions
- ↕️ **Photo Reordering** - Drag-and-drop or arrow buttons to reorder photos
- 👀 **Live Preview** - See how your entry will look before publishing
- 🗑️ **Cascade Deletion** - Deleting an entry automatically removes all photos
- ☁️ **Cloud Storage** - Vercel Blob for production, local filesystem for development
- 🔧 **Storage Abstraction** - Pluggable storage adapters (easy to add S3, R2, etc.)
- ✅ **Tested** - 21 unit tests covering core functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digital-scrapbook.git
cd digital-scrapbook

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
pnpm dev
```

Visit http://localhost:3000

### Environment Variables

Create `.env.local` in the root directory:

```bash
# Authentication
SCRAPBOOK_PASSWORD=your-shared-password
NEXTAUTH_SECRET=your-secret-key  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Storage (optional for local dev)
# BLOB_READ_WRITE_TOKEN=vercel_blob_xxx  # Auto-added by Vercel
```

## 📖 Usage

### Creating an Entry

1. Navigate to `/admin` (you'll be prompted to login)
2. Click "Create New Entry"
3. Select a date and add a title
4. Upload photos (drag-and-drop or click to select)
5. Add captions to photos (optional)
6. Reorder photos by dragging or using arrow buttons
7. Write a description
8. Click "Preview Entry" to see how it looks
9. Click "Create Entry" to save

### Supported Image Formats

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **HEIC/HEIF** (.heic, .heif) - Apple Photos format, auto-converted to JPEG

## 🏗️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom vintage theme
- **NextAuth.js** - Authentication
- **Vercel Blob** - Cloud storage (production)
- **Local Filesystem** - Storage (development)
- **React Dropzone** - File uploads
- **date-fns** - Date formatting
- **heic-convert** - HEIC to JPEG conversion
- **Jest & React Testing Library** - Testing

## 📁 Project Structure

```
digital-scrapbook/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage (timeline)
│   ├── login/                   # Login page
│   ├── admin/                   # Admin dashboard
│   ├── entries/[date]/          # Individual entry pages
│   └── api/                     # API routes
│       ├── auth/                # NextAuth endpoints
│       ├── upload/              # Photo upload
│       └── entries/             # Entry CRUD
├── components/                   # React components
│   ├── EntryCard.tsx            # Polaroid-style card
│   ├── EntryPreview.tsx         # Preview modal
│   ├── PhotoUpload.tsx          # Photo uploader
│   └── ...
├── lib/                         # Business logic
│   ├── storage/                 # Storage abstraction layer
│   │   ├── interface.ts         # StorageAdapter interface
│   │   ├── local.ts             # Local filesystem adapter
│   │   ├── vercel-blob.ts       # Vercel Blob adapter
│   │   └── index.ts             # Auto-detection factory
│   ├── entries.ts               # Entry operations
│   └── auth.ts                  # NextAuth config
├── types/                       # TypeScript types
├── __tests__/                   # Unit tests (21 passing)
├── public/                      # Static assets
├── data/entries/                # Local entry storage (dev only)
└── VERCEL_DEPLOYMENT.md         # Deployment guide
```

## 🎨 Vintage Aesthetic

The app features a carefully crafted vintage scrapbook aesthetic:

- **Polaroid Frames** - White borders with realistic shadows
- **Random Rotations** - Each photo tilts slightly (-4° to +4°)
- **Sepia Filters** - Three variations (light, medium, heavy)
- **Paper Textures** - Aged paper backgrounds with noise
- **Vintage Overlays** - Coffee stains and age spots
- **Decorative Tape** - Translucent tape effects
- **Corner Decorations** - Triangle corner embellishments
- **Handwritten Fonts** - Caveat for titles, Crimson Text for body

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run unit tests (21 passing)
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Verification
pnpm run verify       # Run lint + tests + build (recommended before deploy)
```

### Storage System

The app uses a pluggable storage abstraction that automatically selects the right backend:

**Local Development (Default)**
- No setup required
- Entries stored in `/data/entries/`
- Photos stored in `/public/uploads/`

**Production (Vercel Blob)**
- Automatic when deployed to Vercel
- Cloud storage for entries and photos
- Requires Vercel Blob setup (see deployment guide)

**Manual Override**
```bash
# Force local storage
STORAGE_ADAPTER=local pnpm dev

# Force Vercel Blob (requires token)
STORAGE_ADAPTER=vercel pnpm dev
```

## 🧪 Testing

21 unit tests covering core functionality:

- ✅ **Storage Layer** (13 tests) - Local & Vercel Blob adapters, factory
- ✅ **Entry Operations** (8 tests) - Create, read, update, delete operations

```bash
# Run tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

Tests run automatically on GitHub Actions for every push and pull request.

## 🚢 Deployment

Deploy to Vercel in minutes. See detailed instructions in **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**.

**Quick Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Create Vercel Blob Storage
5. Connect Blob to project
6. Deploy!

Your app will be live at `https://your-app.vercel.app`

## 🐛 Troubleshooting

### Common Issues

**"No token found" error**
- Vercel Blob Storage not set up
- Solution: Follow steps in VERCEL_DEPLOYMENT.md

**"EROFS: read-only file system" error**
- Trying to write to filesystem on serverless platform
- Solution: Ensure Blob Storage is connected (auto-adds token)

**Photos not loading**
- Next.js image domains not configured
- Solution: Check `next.config.js` includes Blob storage pattern

**Login not working**
- Missing environment variables
- Solution: Verify `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SCRAPBOOK_PASSWORD` are set

## 🔒 Security

- Shared password authentication via NextAuth.js
- Protected admin routes with middleware
- CSRF protection built-in
- Secure file uploads with validation
- Environment variables for sensitive data

## 🌟 Key Features Explained

### HEIC Support
Apple devices save photos in HEIC format. The app automatically detects and converts HEIC files to JPEG at 90% quality during upload.

### Photo Reordering
Drag photos to reorder or use ← → arrow buttons. Changes are reflected immediately in the preview.

### Live Preview
Click "Preview Entry" to see exactly how your post will look with all vintage effects applied before saving.

### Cascade Deletion
When you delete an entry, all associated photos are automatically deleted from storage to prevent orphaned files.

### Storage Abstraction
The app uses a pluggable storage system. Easy to add support for AWS S3, Cloudflare R2, or any storage service by implementing the `StorageAdapter` interface.

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and deployed on [Vercel](https://vercel.com/).

---

**Ready to preserve your memories?** Follow the [deployment guide](VERCEL_DEPLOYMENT.md) to get started!
