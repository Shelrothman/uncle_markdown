import React, { useState } from 'react';
import { useFileStore, type FileNode } from '../store/fileStore';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { files, activeFileId, expandedFolders, addFile, addFolder, deleteNode, setActiveFile, toggleFolder, renameNode } = useFileStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);
  const [newItemDialog, setNewItemDialog] = useState<{ type: 'file' | 'folder'; parentId: string | null } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleContextMenu = (e: React.MouseEvent, nodeId: string | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleNewFile = (parentId: string | null) => {
    setNewItemDialog({ type: 'file', parentId });
    setContextMenu(null);
  };

  const handleNewFolder = (parentId: string | null) => {
    setNewItemDialog({ type: 'folder', parentId });
    setContextMenu(null);
  };

  const handleDelete = (id: string) => {
    deleteNode(id);
    setContextMenu(null);
  };

  const handleRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      renameNode(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const confirmNewItem = (name: string) => {
    if (name.trim() && newItemDialog) {
      if (newItemDialog.type === 'file') {
        addFile(newItemDialog.parentId, name.trim());
      } else {
        addFolder(newItemDialog.parentId, name.trim());
      }
    }
    setNewItemDialog(null);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.includes(node.id);
    const isActive = activeFileId === node.id;
    const isRenaming = renamingId === node.id;

    return (
      <div key={node.id} className="file-node">
        <div
          className={`file-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              setActiveFile(node.id);
            } else {
              toggleFolder(node.id);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
        >
          <span className="file-icon">
            {node.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename();
                if (e.key === 'Escape') {
                  setRenamingId(null);
                  setRenameValue('');
                }
              }}
              autoFocus
              className="rename-input"
            />
          ) : (
            <span className="file-name">{node.name}</span>
          )}
        </div>
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="file-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>EXPLORER</h3>
          <div className="sidebar-actions">
            <button onClick={() => handleNewFile(null)} title="New File">📄</button>
            <button onClick={() => handleNewFolder(null)} title="New Folder">📁</button>
          </div>
        </div>
        <div className="file-tree" onContextMenu={(e) => handleContextMenu(e, null)}>
          {files.map(node => renderNode(node))}
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="context-menu-item" onClick={() => handleNewFile(contextMenu.nodeId)}>
            New File
          </div>
          <div className="context-menu-item" onClick={() => handleNewFolder(contextMenu.nodeId)}>
            New Folder
          </div>
          {contextMenu.nodeId && (
            <>
              <div className="context-menu-divider" />
              <div className="context-menu-item" onClick={() => {
                const node = useFileStore.getState().getNodeById(contextMenu.nodeId!);
                if (node) handleRename(contextMenu.nodeId!, node.name);
              }}>
                Rename
              </div>
              <div className="context-menu-item danger" onClick={() => handleDelete(contextMenu.nodeId!)}>
                Delete
              </div>
            </>
          )}
        </div>
      )}

      {newItemDialog && (
        <div className="dialog-overlay" onClick={() => setNewItemDialog(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>New {newItemDialog.type === 'file' ? 'File' : 'Folder'}</h3>
            <input
              type="text"
              placeholder={`Enter ${newItemDialog.type} name...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmNewItem((e.target as HTMLInputElement).value);
                if (e.key === 'Escape') setNewItemDialog(null);
              }}
              autoFocus
            />
            <div className="dialog-actions">
              <button onClick={() => setNewItemDialog(null)}>Cancel</button>
              <button onClick={(e) => {
                const input = e.currentTarget.parentElement?.parentElement?.querySelector('input');
                if (input) confirmNewItem(input.value);
              }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
