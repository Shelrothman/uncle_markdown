# Uncle Markdown - AI Agent Onboarding Guide

## Project Overview

Uncle Markdown is a modern, VSCode-inspired markdown editor built with React, TypeScript, and Vite. It features a file tree sidebar, live markdown preview, auto-save functionality, and GitHub integration for automatic repository creation and syncing.

## Technology Stack

- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.6
- **Package Manager**: pnpm
- **State Management**: Zustand with persistence
- **Markdown Rendering**: react-markdown with remark-gfm, rehype-raw, and rehype-sanitize
- **GitHub Integration**: @octokit/rest
- **Styling**: Pure CSS with VSCode-inspired dark theme

## Project Structure

```
uncle_markdown/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top navigation with GitHub login
│   │   ├── Header.css
│   │   ├── Sidebar.tsx         # File tree and folder management
│   │   ├── Sidebar.css
│   │   ├── Editor.tsx          # Split-pane markdown editor & preview
│   │   └── Editor.css
│   ├── store/
│   │   ├── fileStore.ts        # File/folder state management
│   │   └── authStore.ts        # GitHub authentication state
│   ├── App.tsx                 # Main app layout
│   ├── App.css
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example                # Environment variables template
```

## Recent Updates (December 2025)

- ✅ **GitHub OAuth & Sync**: Fully implemented with Vercel serverless backend
- ✅ **Auto-Sync**: Files automatically sync to GitHub every 10 seconds with retry logic
- ✅ **File Deletions**: Deletions are now properly synced to GitHub repository
- ✅ **Line-by-Line WYSIWYG Editor**: MarkText-style editing where clicking a line shows raw markdown
- ✅ **Line Numbers**: Editor displays line numbers like VSCode
- ✅ **Keyboard Navigation**: Enter (new line), Backspace (merge), Arrow keys (navigate), Escape (exit edit)
- ✅ **Inline Code Styling**: VSCode-style inline code with amber color (#e8ab53)
- ✅ **Color Highlights**: Support for `red:text`, `blue:text`, etc. syntax
- ✅ **Blockquote Styling**: GitHub-style blockquotes with left border and proper spacing
- ✅ **Footer Status Bar**: VSCode-style footer showing sync status
- ✅ **Code Block Headers**: Gradient headers with language labels and copy buttons

## Core Features

### 1. File Management (fileStore.ts)
- **State**: Manages hierarchical file/folder structure using tree data structure
- **Operations**:
  - `addFile(parentId, name)`: Create new markdown file
  - `addFolder(parentId, name)`: Create new folder
  - `deleteNode(id)`: Remove file or folder
  - `updateFileContent(id, content)`: Update file content (triggers auto-save)
  - `setActiveFile(id)`: Set currently editing file
  - `toggleFolder(id)`: Expand/collapse folders
  - `renameNode(id, newName)`: Rename files/folders
- **Persistence**: Uses Zustand's persist middleware with localStorage key `uncle-markdown-storage`

### 2. Authentication (authStore.ts)
- **GitHub OAuth Flow**:
  1. User clicks "Login with GitHub" → redirects to GitHub OAuth
  2. GitHub redirects back with `code` parameter
  3. Exchange code for access token via `/api/auth` serverless function
  4. Store token and initialize Octokit client
- **Auto-Repository Creation**: Automatically creates a GitHub repo named `uncle-markdown-notes` when user logs in
- **Auto-Sync**: Files automatically sync to GitHub every 10 seconds (with debounce)
- **Sync Status**: Footer displays sync status (syncing, synced, error, idle)
- **Persistence**: Stores auth state in localStorage key `uncle-markdown-auth`

### 3. UI Components

#### Sidebar (Sidebar.tsx)
- Recursive file tree rendering
- Context menu (right-click) for operations
- Icons: 📁 (folder closed), 📂 (folder open), 📄 (file)
- Inline renaming with input field
- Modal dialogs for new file/folder creation

#### Editor (Editor.tsx)
- **Line-by-Line WYSIWYG**: MarkText-style editing where each line can be edited independently
  - Click on a line to edit raw markdown
  - Click away or blur to render the preview
  - Line numbers displayed on the left (50px width, gray color)
- **Keyboard Navigation**:
  - Enter: Create new line below and focus it
  - Backspace (at line start): Merge with previous line
  - Arrow Up/Down: Navigate between lines
  - Escape: Exit edit mode and return to preview
- **Performance Optimizations**:
  - Memoized LinePreview component with React.memo
  - useCallback for all event handlers
  - useMemo for lines array
  - requestAnimationFrame for smooth focus transitions
  - CSS contain and will-change properties
- **Auto-save**: 500ms debounce after typing stops
- **Markdown Features**:
  - Inline code rendering: VSCode-style with amber color (#e8ab53)
  - Color highlight syntax: `red:text`, `blue:text`, `green:text`, etc.
  - Code blocks: Gradient headers with language labels and copy buttons
  - Blockquotes: GitHub-style with left border (#4ec9b0) and italic text
  - Syntax highlighting and sanitization for security

#### Header (Header.tsx)
- App title branding
- GitHub login/logout
- User avatar and username display

#### Footer (Footer.tsx)
- VSCode-style status bar (22px height)
- Sync status indicators:
  - 🔄 Syncing... (blue)
  - ✓ Synced (green)
  - ✗ Error (red)
  - ⊙ Idle (gray)

### 4. Design System

**Color Palette** (VSCode Dark Theme):
- Background: `#1e1e1e`
- Secondary BG: `#252526`, `#2d2d2d`
- Borders: `#2d2d2d`, `#3c3c3c`, `#454545`
- Primary Green: `#4ec9b0` (headings, accents, highlights)
- Text: `#d4d4d4` (primary), `#cccccc` (secondary), `#9d9d9d` (muted)
- Code: `#ce9178`
- Danger: `#f48771`

**Typography**:
- UI: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'...`
- Code/Editor: `'Consolas', 'Monaco', 'Courier New', monospace`

## Development Workflow

### Setup
```bash
cd /path/to/uncle_markdown
pnpm install
pnpm dev  # Starts dev server at http://localhost:5173
```

### Build
```bash
pnpm build    # Production build
pnpm preview  # Preview production build
```

### Key Files to Edit
- **Adding new features**: Start with store if state is needed, then create/modify components
- **Styling changes**: Each component has its own CSS file
- **Adding dependencies**: `pnpm add <package>` (use `pnpm add -D` for dev dependencies)

## GitHub OAuth Setup

**✅ FULLY IMPLEMENTED**:

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `Uncle Markdown`
   - Homepage URL: Your production URL (e.g., `https://uncle-markdown.vercel.app`)
   - Authorization callback URL: Same as homepage URL
   - Click "Register application"
   - Copy the Client ID and generate Client Secret

2. **Set Environment Variables**:
   ```bash
   # For local development (.env.local)
   VITE_GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   
   # For Vercel (via dashboard or CLI)
   vercel env add VITE_GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   ```

3. **Backend (Vercel Serverless)**:
   - Already implemented in `/api/auth.js`
   - Exchanges code for token using Client Secret
   - Returns access token and user data to frontend
   - Endpoint: `POST /api/auth`

4. **Auto-Sync Implementation**:
   - Files sync automatically every 10 seconds (debounced)
   - Handles file additions, updates, and deletions
   - Retry logic with exponential backoff for race conditions
   - Status displayed in footer

## Common Development Tasks

### Add a New Menu Item to Sidebar Context Menu
1. Open `src/components/Sidebar.tsx`
2. Find the `context-menu` div
3. Add new menu item:
   ```tsx
   <div className="context-menu-item" onClick={() => yourHandler()}>
     Your Action
   </div>
   ```
4. Implement handler function

### Add a New File Operation
1. Open `src/store/fileStore.ts`
2. Add operation to interface:
   ```typescript
   interface FileStore {
     yourOperation: (params) => void;
   }
   ```
3. Implement in store:
   ```typescript
   yourOperation: (params) => {
     set(state => ({
       files: updateNodeInTree(state.files, id, node => ({
         ...node,
         // your changes
       }))
     }));
   }
   ```
4. Use in component: `const { yourOperation } = useFileStore();`

### Customize Markdown Styling
1. Open `src/components/Editor.css`
2. Find `.preview-content` selectors
3. Modify styles for specific markdown elements (h1, h2, code, etc.)

### Add New Markdown Plugin
1. Find plugin on npm (e.g., `remark-math`)
2. Install: `pnpm add remark-math`
3. Import in `Editor.tsx`: `import remarkMath from 'remark-math'`
4. Add to ReactMarkdown: `remarkPlugins={[remarkGfm, remarkMath]}`

### Change Auto-Save Delay
1. Open `src/components/Editor.tsx`
2. Find: `setTimeout(() => { ... }, 500)` (line ~25)
3. Change `500` to desired milliseconds (e.g., `1000` for 1 second)

## Testing the App

### Manual Testing Checklist
- [ ] Create new file (sidebar button & context menu)
- [ ] Create new folder (sidebar button & context menu)
- [ ] Rename file/folder (right-click → rename)
- [ ] Delete file/folder (right-click → delete)
- [ ] Type markdown and verify live preview updates
- [ ] Verify auto-save (refresh page, content should persist)
- [ ] Test folder expand/collapse
- [ ] Test nested folders (folder inside folder)
- [ ] Test markdown features (headers, lists, code, links, images, tables)
- [ ] Test GitHub login (after OAuth setup)

### Known Limitations
1. **WYSIWYG Mode**: Line-by-line editing implemented, but some markdown syntax still visible (e.g., headers show `#`)
2. **File Upload**: No image upload functionality yet
3. **Search**: No file search or content search yet
4. **Sync Direction**: Push-only to GitHub (no pull/sync-down yet)
5. **Conflict Resolution**: No handling for concurrent edits from multiple devices
6. **Large Files**: Line-by-line rendering may impact performance with files >1000 lines

## Future Enhancements (TODO)

### Priority 1: Core Functionality
- [ ] Implement sync-down from GitHub (currently push-only)
- [ ] Add conflict resolution for concurrent edits
- [ ] Enhance WYSIWYG editor (hide more syntax like `#` for headers, `**` for bold)
- [ ] Add keyboard shortcuts (Cmd+S to save, Cmd+N for new file, etc.)
- [ ] Optimize line-by-line rendering for large files (virtual scrolling)

### Priority 2: User Experience
- [ ] File search functionality (Cmd+P)
- [ ] Content search across files (Cmd+Shift+F)
- [ ] Drag-and-drop file reorganization
- [ ] Image upload and embedding
- [ ] Export functionality (download as .md, PDF, HTML)
- [ ] Dark/Light theme toggle (currently dark only)

### Priority 3: Advanced Features
- [ ] Real-time collaboration (WebSockets)
- [ ] Version history (Git integration)
- [ ] Markdown templates
- [ ] Split editor mode (edit two files side-by-side)
- [ ] Vim/Emacs keybindings
- [ ] Spell checker
- [ ] Custom CSS themes

## Troubleshooting

### "Module not found" errors
- Run `pnpm install` to ensure all dependencies are installed
- Check import paths are correct (use absolute paths from `src/`)

### Auto-save not working
- Check browser console for errors
- Verify Zustand persist middleware is working (check localStorage in DevTools)
- Ensure you're typing in the active file (check if file is highlighted in sidebar)

### Styling issues
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)
- Check CSS class names match between TSX and CSS files
- Verify CSS import statements in component files

### GitHub login not working
- Verify `.env.local` exists with correct `VITE_GITHUB_CLIENT_ID`
- Check GitHub OAuth app callback URL matches your dev server URL
- Implement backend token exchange endpoint (currently just logs code)

## Architecture Decisions

### Why Zustand over Redux?
- Simpler API, less boilerplate
- Built-in persistence middleware
- Better TypeScript support
- Smaller bundle size

### Why react-markdown over custom parser?
- Battle-tested, secure (sanitization built-in)
- Supports GitHub Flavored Markdown (GFM)
- Extensible plugin system
- Active maintenance

### Why not use VSCode Extension API?
- Standalone web app requirement
- No VSCode installation needed
- Better cross-platform support
- Easier deployment (static hosting)

### File Storage Strategy
- **Current**: localStorage (5-10MB limit)
- **Future**: GitHub as backend storage
- **Alternative**: IndexedDB for larger storage (50MB+)

## Performance Considerations

- **Large Files**: Editor may lag with files >10,000 lines (consider virtualization)
- **Many Files**: Tree rendering is recursive (could optimize with React.memo)
- **Auto-Save**: Debounced to prevent excessive updates (500ms)
- **Preview Rendering**: react-markdown re-renders on every keystroke (consider debouncing)

## Security Notes

- **XSS Prevention**: rehype-sanitize prevents malicious HTML injection
- **GitHub Token**: Stored in localStorage (vulnerable to XSS) - consider HttpOnly cookies for production
- **Content Security Policy**: Should be added for production deployment

## Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)
```bash
pnpm build
# Deploy the `dist/` folder
```

### Environment Variables
- Set `VITE_GITHUB_CLIENT_ID` in hosting platform settings
- Update GitHub OAuth app callback URL to production URL

### Backend Required
- Deploy token exchange endpoint separately
- Configure CORS to allow requests from frontend domain
- Use environment variables for GitHub Client Secret

## Contributing Guidelines for AI Agents

When modifying this codebase:

1. **Maintain TypeScript Strictness**: Don't use `any` unless absolutely necessary
2. **Follow Naming Conventions**: 
   - Components: PascalCase (e.g., `Sidebar.tsx`)
   - Utilities/Stores: camelCase (e.g., `fileStore.ts`)
   - CSS classes: kebab-case (e.g., `file-tree`)
3. **Keep Components Focused**: Each component should have one primary responsibility
4. **Update This Guide**: If you add major features, document them here
5. **Test Thoroughly**: Manually test changes before considering task complete
6. **Preserve VSCode Aesthetic**: Keep dark theme colors consistent with VSCode

## Contact & Resources

- **Vite Documentation**: https://vite.dev/
- **React Documentation**: https://react.dev/
- **Zustand Documentation**: https://github.com/pmndrs/zustand
- **react-markdown**: https://github.com/remarkjs/react-markdown
- **GitHub Octokit**: https://octokit.github.io/rest.js/

---

**Last Updated**: December 3, 2025
**Version**: 1.2.0
**Status**: Production Ready - Full GitHub integration with line-by-line WYSIWYG editor
