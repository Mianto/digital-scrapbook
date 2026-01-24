# Digital Scrapbook - Setup Guide

## Quick Start

### 1. Configure Authentication

The `.env.local` file contains placeholder values. Update them:

```bash
# Set your shared password
SCRAPBOOK_PASSWORD=choose_a_secure_password

# Generate a secret for NextAuth
# Run: openssl rand -base64 32
NEXTAUTH_SECRET=paste_generated_secret_here

# For development
NEXTAUTH_URL=http://localhost:3000
```

### 2. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 3. Test the Application

1. **View Timeline**: Home page shows all entries (public access)
2. **Login**: Click "Admin Panel" → Enter your password
3. **Create Entry**:
   - Click "Create New Entry"
   - Select date, add title and description
   - Upload photos (drag & drop or click)
   - Submit

### 4. First Entry

The app includes a sample entry (`2024-01-15.json`) for demonstration. You can:
- Keep it to see how entries look
- Delete it from `data/entries/`
- Create your own first entry via the admin panel

## Project Features Implemented

✅ **Authentication System**
- Shared password login via NextAuth.js
- Protected admin routes with middleware
- Session management

✅ **Entry Management**
- Create entries with multiple photos
- File-based JSON storage
- Date-based organization

✅ **Photo Uploads**
- Drag & drop interface with react-dropzone
- Multiple file support (JPG, PNG, HEIC, WebP)
- Automatic file handling and storage

✅ **Vintage Aesthetic**
- Polaroid-style photo frames
- Sepia filters and paper textures
- Handwritten fonts (Caveat)
- Random photo rotations
- Hover animations

✅ **Public Frontend**
- Timeline view of all entries
- Individual entry pages
- Responsive design
- No authentication required for viewing

✅ **Admin Panel**
- Entry creation form
- Dashboard with entry list
- Protected routes

## File Structure

```
digital-scrapbook/
├── app/                        # Next.js 14 App Router
│   ├── api/                   # API Routes
│   │   ├── auth/[...nextauth]/ # NextAuth endpoints
│   │   ├── entries/create/    # Create entry API
│   │   └── upload/            # Photo upload API
│   ├── admin/                 # Admin panel (protected)
│   │   ├── page.tsx          # Dashboard
│   │   └── new-entry/        # Create entry form
│   ├── entries/[date]/       # Individual entry view
│   ├── login/                # Login page
│   └── page.tsx              # Home timeline
├── components/                # React components
│   ├── EntryCard.tsx         # Polaroid-style entry card
│   ├── PhotoUpload.tsx       # Drag-drop uploader
│   ├── Providers.tsx         # Session provider
│   └── Timeline.tsx          # Entry grid layout
├── lib/                      # Utilities
│   ├── auth.ts              # NextAuth configuration
│   └── entries.ts           # Entry CRUD operations
├── types/                    # TypeScript definitions
│   ├── index.ts             # Entry & Photo types
│   └── next-auth.d.ts       # NextAuth type extensions
├── data/entries/            # JSON entry files
├── public/uploads/          # Uploaded photos
└── middleware.ts            # Route protection
```

## Key Components

### Authentication Flow
1. User visits `/admin` or `/admin/new-entry`
2. Middleware redirects to `/login` if not authenticated
3. Login page validates against `SCRAPBOOK_PASSWORD`
4. On success, creates JWT session
5. User can access admin routes

### Entry Creation Flow
1. Admin fills form at `/admin/new-entry`
2. Photos uploaded to `/api/upload` → saved to `public/uploads/`
3. Entry data posted to `/api/entries/create`
4. Server validates and writes JSON to `data/entries/{date}.json`
5. User redirected to new entry page

### Display Flow
1. Home page calls `getAllEntries()` → reads all JSON files
2. Sorts by date (newest first)
3. Timeline component renders EntryCard for each
4. Each card shows first photo with random rotation
5. Click card → navigate to full entry view

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SCRAPBOOK_PASSWORD` | Shared login password | `mySecretPass123` |
| `NEXTAUTH_SECRET` | JWT signing secret | `base64-encoded-string` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment Checklist

Before deploying to Vercel:

- [ ] Update `SCRAPBOOK_PASSWORD` in Vercel environment variables
- [ ] Generate and set `NEXTAUTH_SECRET` (run `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to production URL (e.g., `https://yourapp.vercel.app`)
- [ ] Initialize git and push to GitHub
- [ ] Import project in Vercel
- [ ] Verify all environment variables are set
- [ ] Deploy and test login flow

## Troubleshooting

### "Unable to find entry" error
- Ensure `data/entries/` directory exists
- Check JSON file naming: `{date}.json` (e.g., `2024-01-15.json`)
- Verify JSON is valid (no syntax errors)

### Photos not displaying
- Check photos exist in `public/uploads/`
- Verify URL format in JSON: `/uploads/filename.jpg`
- Ensure Next.js Image domains configured if using external URLs

### Login not working
- Verify `SCRAPBOOK_PASSWORD` is set in `.env.local`
- Check `NEXTAUTH_SECRET` is generated and set
- Ensure `NEXTAUTH_URL` matches your current URL
- Clear browser cookies and try again

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify all imports are correct

## Storage Limits

**Current Setup (File-based)**:
- Suitable for ~100 photos
- Limited by git repository size
- Works well for personal use

**When to Upgrade**:
- More than 100 photos → Consider Vercel Blob
- Need CDN delivery → Use Vercel Blob or Cloudinary
- Want image optimization → Add Sharp library

## Next Steps

1. Update `.env.local` with your password and secret
2. Run `npm run dev` to start the server
3. Create your first entry via the admin panel
4. Customize the styling in `tailwind.config.ts` and `globals.css`
5. Deploy to Vercel when ready

Enjoy documenting your memories! 💕
