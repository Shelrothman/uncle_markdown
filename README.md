# Uncle Markdown - Quick Start Guide

## What is Uncle Markdown?

A modern, VSCode-inspired markdown editor with GitHub integration. Create, edit, and organize your markdown files with a beautiful dark theme interface, live preview, and auto-save functionality.

## Features

- 📁 **File Tree Sidebar**: Organize files and folders just like VSCode
- ✏️ **Live Preview**: See markdown rendered in real-time as you type
- 💾 **Auto-Save**: Your work is automatically saved every 500ms
- 🎨 **VSCode Dark Theme**: Classic green and black color scheme
- 🔐 **GitHub Integration**: Login with GitHub to auto-create a repository for your notes
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
4. Your changes are auto-saved after 500ms of inactivity

### File Operations

- **Rename**: Right-click on a file/folder → Rename
- **Delete**: Right-click on a file/folder → Delete
- **Create nested items**: Right-click on a folder → New File/Folder

### GitHub Integration

1. Click "Login with GitHub" in the header
2. Authorize the application
3. A repository named `uncle-markdown-notes` will be automatically created
4. (Future) Your files will be synced to this repository

> **Note**: GitHub OAuth requires additional setup. See `AI_AGENT_GUIDE.md` for detailed instructions.

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

See `DEPLOYMENT.md` for detailed deployment instructions.

## Technologies Used

- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
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
