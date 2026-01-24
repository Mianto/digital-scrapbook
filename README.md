# Digital Scrapbook

A beautiful, vintage-styled digital scrapbook web application for couples to document their daily memories together.

## Features

- 📸 Photo upload with drag-and-drop support
- 📝 Rich text entries with dates and descriptions
- 🎨 Vintage aesthetic with Polaroid-style frames and sepia filters
- 🔐 Shared password authentication
- 📱 Fully responsive design
- 🎯 Admin panel for easy content management
- 🌐 Optimized for Vercel deployment

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom vintage theme
- **Storage**: File-based (JSON + local uploads)
- **Fonts**: Google Fonts (Caveat, Crimson Text)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and set your values:

```env
# Choose a shared password for both users
SCRAPBOOK_PASSWORD=your_secret_password_here

# Generate a secret for NextAuth (run: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here

# Set to your deployment URL (http://localhost:3000 for development)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Viewing the Timeline

- Visit the home page to see all entries in a vintage polaroid-style timeline
- Click any entry to view full details with all photos and description
- No authentication required for viewing

### Creating New Entries

1. Click "Admin Panel" link or navigate to `/admin`
2. Sign in with your shared password
3. Click "Create New Entry"
4. Fill in:
   - Date (defaults to today)
   - Title
   - Description
   - Upload photos (drag & drop or click to browse)
5. Click "Create Entry"

## Project Structure

```
digital-scrapbook/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── entries/        # Entry creation
│   │   └── upload/         # Photo uploads
│   ├── admin/              # Admin panel pages
│   ├── entries/[date]/     # Individual entry view
│   ├── login/              # Login page
│   └── page.tsx            # Home timeline
├── components/              # React components
├── lib/                     # Utility functions
├── types/                   # TypeScript types
├── data/entries/           # JSON entry files
└── public/uploads/         # Uploaded photos
```

## Deployment to Vercel

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub

Create a new repository on GitHub and push your code:

```bash
git remote add origin https://github.com/yourusername/digital-scrapbook.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Import Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - `SCRAPBOOK_PASSWORD`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (will be your production URL)
5. Deploy!

### 4. Post-Deployment

After first deployment, update `NEXTAUTH_URL` in Vercel to your production URL (e.g., `https://your-app.vercel.app`).

## Storage Considerations

- **Current setup**: Uses local file storage (JSON files + public folder)
- **Works well for**: ~100 photos and dozens of entries
- **For scaling**: Consider upgrading to Vercel Blob Storage when you exceed these limits

## Future Enhancements

- Edit/delete existing entries
- Search and filter entries
- Multiple photo layouts (collage, grid)
- Decorative vintage stickers
- Export to PDF
- Enhanced image optimization with Sharp

## License

MIT

## Contributing

This is a personal project, but feel free to fork and customize for your own use!
