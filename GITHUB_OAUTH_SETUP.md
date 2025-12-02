# GitHub OAuth Setup Guide

## Overview

To enable GitHub login and automatic repository creation, you need to set up a GitHub OAuth App and create a backend service to exchange authorization codes for access tokens.

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Uncle Markdown` (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Authorization callback URL**: `http://localhost:5173` (same as homepage)
   - **Application description**: (optional) `A VSCode-inspired markdown editor`
4. Click **"Register application"**
5. You'll see your **Client ID** - copy this
6. Click **"Generate a new client secret"** - copy this (you'll only see it once!)

## Step 2: Set Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
```

> **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 3: Create Backend for Token Exchange

GitHub requires a backend service to exchange the authorization code for an access token (for security reasons - the client secret cannot be exposed to the frontend).

### Option A: Simple Express.js Backend

Create a new directory for the backend:

```bash
mkdir backend
cd backend
pnpm init
pnpm add express cors dotenv @octokit/rest
pnpm add -D typescript @types/express @types/cors @types/node tsx
```

Create `backend/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/github/token', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    
    if (data.access_token) {
      // Fetch user data
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      const userData = await userResponse.json();

      res.json({
        access_token: data.access_token,
        user: userData
      });
    } else {
      res.status(400).json({ error: 'Failed to get access token' });
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

Create `backend/.env`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
PORT=3001
```

Create `backend/package.json` script:

```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

Run backend:

```bash
cd backend
pnpm dev
```

### Option B: Serverless Function (Vercel)

Create `api/github-token.ts` in your project root:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    
    if (data.access_token) {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      const userData = await userResponse.json();

      return res.json({
        access_token: data.access_token,
        user: userData
      });
    } else {
      return res.status(400).json({ error: 'Failed to get access token' });
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

Add to `vercel.json`:

```json
{
  "env": {
    "GITHUB_CLIENT_ID": "@github-client-id",
    "GITHUB_CLIENT_SECRET": "@github-client-secret"
  }
}
```

## Step 4: Update Frontend to Use Backend

Update `src/components/Header.tsx`:

```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code && !accessToken) {
    // Exchange code for token via backend
    fetch('http://localhost:3001/api/github/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token && data.user) {
          setAuth(data.access_token, data.user);
          // Remove code from URL
          window.history.replaceState({}, '', '/');
        }
      })
      .catch(error => console.error('Auth error:', error));
  }
}, [accessToken, setAuth]);
```

## Step 5: Test the Flow

1. Start both servers:
   - Frontend: `pnpm dev` (port 5173)
   - Backend: `cd backend && pnpm dev` (port 3001)

2. Open `http://localhost:5173`

3. Click "Login with GitHub"

4. Authorize the app on GitHub

5. You should be redirected back and logged in

6. Check that a repository was created at `https://github.com/YOUR_USERNAME/uncle-markdown-notes`

## Production Deployment

### Frontend (Vercel/Netlify)

1. Update GitHub OAuth App callback URL to your production URL
2. Deploy frontend with `pnpm build`
3. Set environment variable `VITE_GITHUB_CLIENT_ID`

### Backend

**Option 1: Deploy Express backend to Railway/Render**
- Set environment variables: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Update frontend to use production backend URL

**Option 2: Use Vercel Serverless Functions**
- Deploy together with frontend
- Set secrets in Vercel dashboard

## Security Considerations

1. **Never expose Client Secret**: Keep it only on the backend
2. **Use HTTPS in production**: Required for OAuth
3. **Validate redirect URIs**: Ensure they match your OAuth app settings
4. **Consider token expiration**: Implement refresh token logic if needed
5. **Sanitize user input**: Already handled by rehype-sanitize

## Troubleshooting

### "Bad verification code"
- Code has expired (10-minute limit)
- Code already used (can only use once)
- Solution: Try login flow again

### CORS errors
- Backend not allowing frontend origin
- Add CORS configuration to backend

### Token not persisting
- Check browser localStorage (should see `uncle-markdown-auth`)
- Check for errors in console

### Repository not created
- Check token has `repo` scope
- Check Octokit errors in console
- Verify token is valid

## Next Steps

After OAuth is working:

1. Implement file syncing to GitHub repo
2. Add commit functionality
3. Add pull/push for multi-device sync
4. Add conflict resolution
5. Add commit history viewer

## Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Octokit REST API](https://octokit.github.io/rest.js/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
