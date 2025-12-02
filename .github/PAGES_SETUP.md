# GitHub Pages Deployment Setup

This repository is configured to automatically deploy to GitHub Pages on every push to the `main` branch.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Configure Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Required:
- **`VITE_GITHUB_CLIENT_ID`**: Your GitHub OAuth App Client ID
  
#### Optional (if using separate OAuth backend):
- **`VITE_API_URL`**: URL to your Vercel OAuth backend (e.g., `https://your-oauth-backend.vercel.app/api/auth`)
- **`VITE_APP_URL`**: Your GitHub Pages URL (e.g., `https://YOUR_USERNAME.github.io/uncle_markdown`)

### 3. Update GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://YOUR_USERNAME.github.io/uncle_markdown
   ```

### 4. Deploy OAuth Backend to Vercel (Required for OAuth to work)

Since GitHub Pages only hosts static files, you need to deploy the OAuth backend separately:

1. Create a new repository or folder with just the `api/` directory
2. Deploy to Vercel:
   ```bash
   # Option 1: Via Vercel CLI
   npm i -g vercel
   vercel
   
   # Option 2: Via Vercel Dashboard
   # Import the repository at vercel.com
   ```

3. Set environment variables in Vercel:
   - `VITE_GITHUB_CLIENT_ID`: Your GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth Client Secret

4. Copy the Vercel deployment URL and add it as `VITE_API_URL` secret in GitHub

### 5. Trigger Deployment

Push to the `main` branch or manually trigger the workflow:

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

Or manually from GitHub:
- Go to **Actions** tab
- Click **Deploy to GitHub Pages**
- Click **Run workflow**

### 6. Access Your Site

After deployment completes (usually 1-2 minutes), your site will be available at:
```
https://YOUR_USERNAME.github.io/uncle_markdown
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│     GitHub Pages (Static Site)      │
│   https://you.github.io/app         │
│                                     │
│  - React app (dist/)                │
│  - All UI components                │
│  - Static assets                    │
└──────────────┬──────────────────────┘
               │
               │ OAuth requests
               ▼
┌─────────────────────────────────────┐
│    Vercel (OAuth Backend)           │
│   https://your-backend.vercel.app   │
│                                     │
│  - /api/auth serverless function    │
│  - Handles GitHub OAuth flow        │
│  - Returns access token             │
└─────────────────────────────────────┘
```

## Troubleshooting

### Build fails with "VITE_GITHUB_CLIENT_ID is not defined"
- Make sure you've added the secret in GitHub Actions secrets
- Secret names must match exactly (case-sensitive)

### OAuth doesn't work / 404 error
- Ensure `VITE_API_URL` is set and points to your Vercel backend
- Verify GitHub OAuth App callback URL matches your GitHub Pages URL
- Check Vercel function logs for errors

### Assets not loading (404 on CSS/JS)
- This is fixed by the `base` setting in `vite.config.ts`
- Make sure the repository name matches the base path

### Manual deployment needed
- Go to Actions tab → Deploy to GitHub Pages → Run workflow

## Development vs Production

- **Local Dev**: `pnpm dev` (no base path)
- **GitHub Pages**: Automatically uses `/uncle_markdown/` base path
- **Environment variables**: Set via GitHub Secrets for production

## Cost

- ✅ **GitHub Pages**: Free
- ✅ **Vercel OAuth Backend**: Free tier (100GB bandwidth, 100 serverless function invocations/day)
- ✅ **Total**: $0/month
