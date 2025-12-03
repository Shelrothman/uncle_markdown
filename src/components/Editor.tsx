import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useFileStore } from '../store/fileStore';
import CodeBlock from './CodeBlock';
import './Editor.css';

const Editor: React.FC = () => {
  const { getActiveFile, updateFileContent } = useFileStore();
  const activeFile = getActiveFile();
  const [localContent, setLocalContent] = useState(activeFile?.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update local content when active file changes
  useEffect(() => {
    setLocalContent(activeFile?.content || '');
    setIsEditing(false);
    // We intentionally sync state here when file changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id]);

  // Only restore focus, not cursor position (let user click where they want)
  useEffect(() => {
    if (isEditing && textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    setLocalContent(newContent);

    // Auto-save after 500ms of no typing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
      }
    }, 500);
  };

  const handleEditorClick = () => {
    // Only switch to edit mode if clicking the preview itself, not already editing
    if (!isEditing) {
      setIsEditing(true);
      // Don't set cursor position - let user click where they want
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleTextareaBlur = () => {
    // Small delay to allow clicking rendered content
    setTimeout(() => {
      if (!editorRef.current?.contains(document.activeElement)) {
        setIsEditing(false);
      }
    }, 100);
  };

  if (!activeFile) {
    return (
      <div className="editor-container">
        <div className="empty-state">
          <h2>No file selected</h2>
          <p>Select a file from the sidebar or create a new one to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-tab">
          <span className="tab-icon">📄</span>
          <span className="tab-name">{activeFile.name}</span>
        </div>
      </div>
      <div className="editor-content" ref={editorRef}>
        <div className="wysiwyg-editor" onClick={handleEditorClick}>
          {isEditing || !localContent ? (
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onBlur={handleTextareaBlur}
              placeholder="Start typing your markdown..."
              spellCheck={false}
              className="wysiwyg-textarea"
              autoFocus={isEditing}
            />
          ) : (
            <div className="wysiwyg-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                  code: ({ node, inline, className, children, ...props }: any) => {
                    return !inline ? (
                      <CodeBlock className={className}>{children}</CodeBlock>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  }
                }}
              >
                {localContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
