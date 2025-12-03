# Uncle Markdown - Quick Start Guide

## What is Uncle Markdown?

A modern, VSCode-inspired markdown editor with GitHub integration. Create, edit, and organize your markdown files with a beautiful dark theme interface, live preview, and auto-save functionality.

## Features

- 📁 **File Tree Sidebar**: Organize files and folders just like VSCode
- ✏️ **Live Preview**: See markdown rendered in real-time as you type
- 💾 **Local Auto-Save**: Your work is automatically saved to browser storage every 500ms
- ☁️ **GitHub Auto-Sync**: Files automatically sync to GitHub every 10 seconds after changes
- 🎨 **VSCode Dark Theme**: Classic green and black color scheme with gradient code blocks
- 🔐 **GitHub OAuth Integration**: Secure login with GitHub to auto-create a private repository
- 🔄 **Smart Retry Logic**: Automatic retry with exponential backoff for sync conflicts
- 📊 **Sync Status Indicator**: Visual footer showing sync status (VSCode-style)
- ⚡ **Fast & Modern**: Built with Vite, React, and TypeScript

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Usage

### Creating Files and Folders

- Click the 📄 icon in the sidebar header to create a new file
- Click the 📁 icon in the sidebar header to create a new folder
- Right-click anywhere in the sidebar for context menu options

### Editing Markdown

1. Click on a file in the sidebar to open it
2. Type your markdown in the left pane
3. See the live preview in the right pane
4. Your changes are auto-saved to localStorage after 500ms
5. After 10 seconds of inactivity, files sync to GitHub automatically
6. Check the footer for sync status

### File Operations

- **Rename**: Right-click on a file/folder → Rename
- **Delete**: Right-click on a file/folder → Delete
- **Create nested items**: Right-click on a folder → New File/Folder

### GitHub Integration

Uncle Markdown provides seamless GitHub integration with automatic syncing:

1. **Login**: Click "Login with GitHub" in the header
2. **Authorize**: Grant access to the Uncle Markdown application
3. **Auto-Create Repository**: A private repository named `uncle-markdown-notes` is automatically created
4. **Auto-Sync**: Your files automatically sync to GitHub every 10 seconds after you make changes
5. **Monitor Status**: Check the footer at the bottom for real-time sync status

#### How Syncing Works

- **Local Storage First**: All files are saved to your browser's localStorage every 500ms
- **GitHub Sync**: After 10 seconds of inactivity, changed files are synced to your GitHub repository
- **Automatic Retry**: If a sync fails (e.g., network issues), it will automatically retry with exponential backoff
- **Status Indicators**: 
  - `↻ Syncing...` - Upload in progress (blue)
  - `✓ Synced 2m ago` - Successfully synced (green)
  - `✗ Sync failed` - Error occurred (red, hover for details)
  - `○ Not synced` - No sync attempted yet (gray)

#### Repository Structure

Your files are organized in the repository exactly as they appear in the sidebar. For example:
```
uncle-markdown-notes/
├── README.md
├── notes/
│   ├── meeting-notes.md
│   └── ideas.md
└── projects/
    └── project-plan.md
```

> **Note**: The sync is one-way from the app to GitHub. If you edit files directly on GitHub, those changes won't automatically appear in the app. The app is designed as the primary editing interface.

## Project Structure

```
uncle_markdown/
├── src/
│   ├── components/       # React components
│   ├── store/           # Zustand state management
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Dependencies
```

## Development

### Environment Variables

Copy `.env.example` to `.env.local` and add your GitHub OAuth Client ID:

```bash
cp .env.example .env.local
# Edit .env.local and add your GitHub Client ID and Secret
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Deployment

Deploy to Vercel for free hosting with OAuth support:

```bash
npm i -g vercel
vercel login
vercel
```

## Technologies Used

- **Vite** - Build tool and dev server
- **React 19** - UI framework with latest features
- **TypeScript** - Type safety and better DX
- **Zustand** - Lightweight state management with persistence
- **react-markdown** - Markdown rendering with GitHub Flavored Markdown
- **@octokit/rest** - GitHub API integration for repository management
- **Vercel** - Serverless deployment platform for OAuth backend
- **react-markdown** - Markdown rendering
- **@octokit/rest** - GitHub API integration

## For AI Agents & Developers

See `AI_AGENT_GUIDE.md` for comprehensive documentation on:
- Architecture decisions
- Component structure
- State management patterns
- GitHub OAuth setup
- Development workflows
- Future enhancements

## License

MIT

## Support

For detailed documentation and troubleshooting, see `AI_AGENT_GUIDE.md`.
