# Uncle Markdown - Deployment Guide

## Deploy to Vercel (Recommended)

Vercel provides both static hosting AND serverless functions for the OAuth flow - everything in one place!

### Quick Start

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   cd /path/to/uncle_markdown
   vercel
   ```

2. **Add Environment Variables**
   ```bash
   vercel env add VITE_GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   ```
   Select all environments (Production, Preview, Development) for each.

3. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

4. **Update GitHub OAuth App Settings**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Update Authorization callback URL to your Vercel URL (e.g., `https://uncle-markdown.vercel.app`)

### Alternative: Via Vercel Dashboard

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
     - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
   - Select all environments for each

4. **Redeploy**
   - Vercel auto-deploys on every push to main branch

5. **Update GitHub OAuth App**
   - Set Authorization callback URL to: `https://your-app.vercel.app`

## Environment Variables

### For Local Development (.env.local)
```env
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
VITE_API_URL=
VITE_APP_URL=http://localhost:5173
```

### For Vercel Production
Set in Vercel dashboard or CLI:
```env
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
# VITE_API_URL not needed - uses relative /api/auth
# VITE_APP_URL not needed - Vercel auto-detects
```

## GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Uncle Markdown
   - **Homepage URL**: Your Vercel URL (e.g., `https://uncle-markdown.vercel.app`)
   - **Authorization callback URL**: Same as homepage URL
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a **Client Secret**
7. Add both to Vercel environment variables

## What Gets Deployed

- ✅ Static React app (Vite build)
- ✅ Serverless OAuth function (`/api/auth.js`)
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Free tier (generous limits)

## Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update GitHub OAuth App callback URL to custom domain
