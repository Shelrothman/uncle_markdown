# Project Structure Summary

```
uncle_markdown/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # GitHub login/logout, user info
│   │   ├── Header.css
│   │   ├── Sidebar.tsx         # File tree, folder management, context menu
│   │   ├── Sidebar.css
│   │   ├── Editor.tsx          # Markdown editor + live preview
│   │   └── Editor.css
│   ├── store/
│   │   ├── fileStore.ts        # Zustand store for files/folders
│   │   └── authStore.ts        # Zustand store for GitHub auth
│   ├── App.tsx                 # Main layout (Header + Sidebar + Editor)
│   ├── App.css
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── node_modules/               # Dependencies
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── README.md                   # Quick start guide
├── AI_AGENT_GUIDE.md          # Comprehensive developer documentation
└── GITHUB_OAUTH_SETUP.md      # GitHub OAuth setup instructions
```

## Key Files Created

### Store Layer
- **fileStore.ts**: Complete file system management with tree operations
- **authStore.ts**: GitHub authentication and Octokit client

### Components
- **Header.tsx**: Top bar with branding and auth controls
- **Sidebar.tsx**: File explorer with recursive tree, context menu, dialogs
- **Editor.tsx**: Split-pane editor with auto-save and live markdown preview

### Styling
- **VSCode Dark Theme**: Consistent dark mode with green accents (#4ec9b0)
- **Component-scoped CSS**: Each component has its own stylesheet
- **Global styles**: Dark theme base in index.css

### Documentation
- **README.md**: User-facing quick start guide
- **AI_AGENT_GUIDE.md**: Comprehensive developer documentation for AI agents
- **GITHUB_OAUTH_SETUP.md**: Step-by-step OAuth implementation guide

## Features Implemented

✅ File and folder creation
✅ File tree with expand/collapse
✅ Context menu (right-click operations)
✅ Inline renaming
✅ File deletion
✅ Auto-save (500ms debounce)
✅ Live markdown preview
✅ Persistent storage (localStorage)
✅ GitHub OAuth login flow (frontend)
✅ Auto-repository creation
✅ VSCode-inspired dark theme
✅ Nested folders support

## Features Pending Backend

⏳ GitHub OAuth token exchange (needs backend)
⏳ File syncing to GitHub repository
⏳ Commit functionality
⏳ Multi-device sync

## Next Steps for Development

1. Set up GitHub OAuth App
2. Create backend for token exchange (see GITHUB_OAUTH_SETUP.md)
3. Test login flow
4. Implement file syncing to GitHub
5. Add keyboard shortcuts
6. Add search functionality
7. Implement true WYSIWYG mode (hide markdown syntax)
