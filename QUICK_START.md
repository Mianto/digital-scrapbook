# 🚀 Quick Start Guide

## ⚡ Get Running in 3 Steps

### 1️⃣ Set Your Password

Edit `.env.local`:
```bash
SCRAPBOOK_PASSWORD=YourPassword123
```

Generate and set the NextAuth secret:
```bash
# Run this in terminal:
openssl rand -base64 32

# Copy the output and paste in .env.local:
NEXTAUTH_SECRET=paste_here
```

### 2️⃣ Start the Server

```bash
npm run dev
```

### 3️⃣ Open the App

Visit: **http://localhost:3000**

---

## 🎯 Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Home timeline (public) |
| `http://localhost:3000/admin` | Admin dashboard (requires login) |
| `http://localhost:3000/login` | Login page |

---

## 🔑 First Time Setup

1. **Start server**: `npm run dev`
2. **Visit**: http://localhost:3000/admin
3. **Login** with your password from `.env.local`
4. **Create** your first entry!

---

## 📋 Essential Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Run production build
npm run lint        # Check code quality

# Git
git add .           # Stage all changes
git commit -m "msg" # Commit changes
git push            # Push to GitHub
```

---

## 📸 Creating Your First Entry

1. Go to http://localhost:3000/admin
2. Click "Create New Entry"
3. Fill in:
   - **Date**: Pick a date
   - **Title**: e.g., "Sunday Brunch"
   - **Description**: Write about the memory
   - **Photos**: Drag & drop images
4. Click "Create Entry"

---

## 🎨 What You'll See

### Home Page
- Beautiful vintage timeline
- Polaroid-style photo cards
- Random rotations
- Sepia filters

### Entry Page
- All photos in Polaroid frames
- Full description
- Date display

### Admin Panel
- Entry list
- Create new entries
- Protected by password

---

## 🚢 Deploy to Vercel

```bash
# 1. Push to GitHub
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 2. Import in Vercel
# - Go to vercel.com
# - Click "Import Project"
# - Select your repo
# - Add environment variables
# - Deploy!
```

---

## ⚠️ Important Notes

- **Password**: Set in `.env.local` before starting
- **Photos**: Stored in `public/uploads/`
- **Entries**: Stored as JSON in `data/entries/`
- **One entry per date**: Files named `YYYY-MM-DD.json`

---

## 📚 Need More Help?

- **Setup details**: Read `SETUP.md`
- **Full implementation**: See `IMPLEMENTATION_SUMMARY.md`
- **Project overview**: Check `README.md`

---

## ✅ Quick Test Checklist

- [ ] Server starts without errors
- [ ] Home page loads
- [ ] Can see sample entry
- [ ] Can login at `/admin`
- [ ] Can create new entry
- [ ] Photos upload successfully
- [ ] New entry appears on timeline

---

**You're ready to start! 🎉**

Run `npm run dev` and visit http://localhost:3000
