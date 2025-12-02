# Uncle Markdown - Deployment Guide

## Deployment Options

Uncle Markdown can be deployed in two ways:

### Option 1: GitHub Pages (Free, Recommended for Public Projects)

**Automated deployment via GitHub Actions** - see `.github/PAGES_SETUP.md` for detailed setup.

Quick start:
1. Enable GitHub Pages in repository settings (Source: GitHub Actions)
2. Add `VITE_GITHUB_CLIENT_ID` to GitHub Secrets
3. Deploy OAuth backend to Vercel (see below)
4. Push to main branch - auto-deploys!

**Result**: `https://YOUR_USERNAME.github.io/uncle_markdown`

### Option 2: Vercel (Easiest - includes OAuth backend)

Vercel provides both static hosting AND serverless functions for the OAuth flow.

1. **Fork/Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/uncle-markdown.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     - `VITE_GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
     - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
     - `VITE_APP_URL`: Your Vercel deployment URL (e.g., `https://uncle-markdown.vercel.app`)

4. **Update GitHub OAuth App Settings**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Update Authorization callback URL to: `https://your-app.vercel.app`

5. **Redeploy**
   - Vercel will auto-deploy on every push to main branch

### Option 2: GitHub Pages (Static only - OAuth requires separate backend)

GitHub Pages can host the static site, but you'll need to deploy the OAuth backend separately to Vercel or another serverless platform.

1. **Create GitHub Pages Deployment Action** (see next task)

2. **Deploy OAuth Backend to Vercel**
   - Create a separate repository with just the `api/` folder
   - Deploy to Vercel
   - Set `VITE_API_URL` environment variable to point to your Vercel function URL

3. **Update GitHub OAuth App**
   - Set Authorization callback URL to: `https://YOUR_USERNAME.github.io/uncle-markdown`

## Environment Variables

### For Local Development (.env.local)
```env
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
VITE_API_URL=http://localhost:3001/api/auth/github
VITE_APP_URL=http://localhost:5173
```

### For Vercel Production
```env
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
# Leave VITE_API_URL empty - it will use relative path /api/auth
VITE_APP_URL=https://your-app.vercel.app
```

### For GitHub Pages (if using separate backend)
```env
VITE_GITHUB_CLIENT_ID=your_client_id
# GITHUB_CLIENT_SECRET goes in Vercel, not GitHub Pages
VITE_API_URL=https://your-oauth-backend.vercel.app/api/auth
VITE_APP_URL=https://YOUR_USERNAME.github.io/uncle-markdown
```

## GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Uncle Markdown
   - **Homepage URL**: Your deployment URL
   - **Authorization callback URL**: Your deployment URL (same as homepage)
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a **Client Secret**
7. Add both to your environment variables

## Recommended: Use Vercel

The easiest path is to deploy everything to Vercel:
- ✅ Static site hosting
- ✅ Serverless OAuth backend
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Free tier is generous

GitHub Pages is great for static sites, but requires extra setup for the OAuth backend.
