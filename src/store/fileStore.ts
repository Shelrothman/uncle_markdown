import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId?: string;
}

interface FileStore {
  files: FileNode[];
  activeFileId: string | null;
  expandedFolders: string[]; // Changed from Set to array for persistence
  
  // File operations
  addFile: (parentId: string | null, name: string) => void;
  addFolder: (parentId: string | null, name: string) => void;
  deleteNode: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFile: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  
  // Getters
  getActiveFile: () => FileNode | null;
  getNodeById: (id: string) => FileNode | null;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const addNodeToTree = (
  nodes: FileNode[],
  parentId: string | null,
  newNode: FileNode
): FileNode[] => {
  if (parentId === null) {
    return [...nodes, newNode];
  }

  return nodes.map(node => {
    if (node.id === parentId && node.type === 'folder') {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addNodeToTree(node.children, parentId, newNode)
      };
    }
    return node;
  });
};

const deleteNodeFromTree = (nodes: FileNode[], id: string): FileNode[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: node.children ? deleteNodeFromTree(node.children, id) : undefined
    }));
};

const updateNodeInTree = (
  nodes: FileNode[],
  id: string,
  updater: (node: FileNode) => FileNode
): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) return updater(node);
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, updater)
      };
    }
    return node;
  });
};

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [
        {
          id: 'welcome',
          name: 'Welcome.md',
          type: 'file',
          content: '# Welcome to Uncle Markdown\n\nStart editing to see the magic happen!\n\n## Features\n- VSCode-like interface\n- Auto-save\n- GitHub integration\n- Markdown preview\n\nCreate new files and folders using the sidebar.'
        }
      ],
      activeFileId: 'welcome',
      expandedFolders: [] as string[],

      addFile: (parentId, name) => {
        const newFile: FileNode = {
          id: generateId(),
          name: name.endsWith('.md') ? name : `${name}.md`,
          type: 'file',
          content: '',
          parentId: parentId || undefined
        };
        set(state => ({
          files: addNodeToTree(state.files, parentId, newFile),
          activeFileId: newFile.id
        }));
      },

      addFolder: (parentId, name) => {
        const newFolder: FileNode = {
          id: generateId(),
          name,
          type: 'folder',
          children: [],
          parentId: parentId || undefined
        };
        set(state => ({
          files: addNodeToTree(state.files, parentId, newFolder),
          expandedFolders: [...state.expandedFolders, newFolder.id]
        }));
      },

      deleteNode: (id) => {
        set(state => ({
          files: deleteNodeFromTree(state.files, id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId
        }));
      },

      updateFileContent: (id, content) => {
        set(state => ({
          files: updateNodeInTree(state.files, id, node => ({
            ...node,
            content
          }))
        }));
      },

      setActiveFile: (id) => {
        set({ activeFileId: id });
      },

      toggleFolder: (id) => {
        set(state => {
          const isExpanded = state.expandedFolders.includes(id);
          return {
            expandedFolders: isExpanded
              ? state.expandedFolders.filter(folderId => folderId !== id)
              : [...state.expandedFolders, id]
          };
        });
      },

      renameNode: (id, newName) => {
        set(state => ({
          files: updateNodeInTree(state.files, id, node => ({
            ...node,
            name: node.type === 'file' && !newName.endsWith('.md') 
              ? `${newName}.md` 
              : newName
          }))
        }));
      },

      getActiveFile: () => {
        const state = get();
        if (!state.activeFileId) return null;
        return findNodeById(state.files, state.activeFileId);
      },

      getNodeById: (id) => {
        return findNodeById(get().files, id);
      }
    }),
    {
      name: 'uncle-markdown-storage',
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        expandedFolders: Array.isArray(state.expandedFolders) 
          ? state.expandedFolders 
          : []
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        expandedFolders: Array.isArray(persistedState?.expandedFolders)
          ? persistedState.expandedFolders
          : []
      })
    }
  )
);
