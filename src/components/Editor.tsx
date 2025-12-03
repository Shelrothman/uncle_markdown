import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useFileStore } from '../store/fileStore';
import CodeBlock from './CodeBlock';
import './Editor.css';

// Memoized line preview component to prevent unnecessary re-renders
const LinePreview = React.memo(({ line }: { line: string }) => {
  if (line === '') {
    return <span className="empty-line">&nbsp;</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        p: ({ children }) => <>{children}</>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        code: ({ node, inline, className, children, ...props }: any) => {
          const isInline = inline !== false && !className?.includes('language-');
          
          if (!isInline) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
          }
          
          const text = String(children).trim();
          const colorMatch = text.match(/^(red|green|blue|yellow|purple|orange):(.*?)$/);
          
          if (colorMatch) {
            const [, color, content] = colorMatch;
            return (
              <code className={`highlight-${color} ${className || ''}`} {...props}>
                {content}
              </code>
            );
          }
          
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {line}
    </ReactMarkdown>
  );
});

LinePreview.displayName = 'LinePreview';

const Editor: React.FC = () => {
  const { getActiveFile, updateFileContent } = useFileStore();
  const activeFile = getActiveFile();
  const [localContent, setLocalContent] = useState(activeFile?.content || '');
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const blurTimeoutRef = useRef<number | undefined>(undefined);
  const lineRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const editorRef = useRef<HTMLDivElement>(null);

  // Memoize lines array to prevent unnecessary splits
  const lines = useMemo(() => localContent.split('\n'), [localContent]);

  // Update local content when active file changes
  useEffect(() => {
    setLocalContent(activeFile?.content || '');
    setEditingLine(null);
    lineRefs.current = {};
    // We intentionally sync state here when file changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id]);

  // Focus the textarea when editing a line
  useEffect(() => {
    if (editingLine !== null && lineRefs.current[editingLine]) {
      const textarea = lineRefs.current[editingLine];
      if (textarea) {
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        });
      }
    }
  }, [editingLine]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const handleLineChange = useCallback((lineIndex: number, newLineContent: string) => {
    const newLines = [...lines];
    newLines[lineIndex] = newLineContent;
    const newContent = newLines.join('\n');
    
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
  }, [lines, activeFile, updateFileContent]);

  const handleLineClick = useCallback((lineIndex: number, e: React.MouseEvent) => {
    // Only switch if clicking on the preview, not if already editing
    if (editingLine !== lineIndex) {
      e.stopPropagation();
      // Clear any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      setEditingLine(lineIndex);
    }
  }, [editingLine]);

  const handleLineBlur = useCallback((lineIndex: number) => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Use shorter delay and check more carefully
    blurTimeoutRef.current = window.setTimeout(() => {
      if (editingLine === lineIndex) {
        const activeElement = document.activeElement;
        const lineRef = lineRefs.current[lineIndex];
        
        // Only blur if we're not focused on this line's textarea
        if (activeElement !== lineRef) {
          setEditingLine(null);
        }
      }
    }, 50);
  }, [editingLine]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, lineIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newLines = [...lines];
      const currentLine = newLines[lineIndex];
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      
      // Split the line at cursor position
      const beforeCursor = currentLine.substring(0, cursorPos);
      const afterCursor = currentLine.substring(cursorPos);
      
      newLines[lineIndex] = beforeCursor;
      newLines.splice(lineIndex + 1, 0, afterCursor);
      
      const newContent = newLines.join('\n');
      setLocalContent(newContent);
      
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
      }
      
      // Move to next line
      setEditingLine(lineIndex + 1);
    } else if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && lineIndex > 0) {
      e.preventDefault();
      const newLines = [...lines];
      const currentLine = newLines[lineIndex];
      const previousLine = newLines[lineIndex - 1];
      const cursorPos = previousLine.length;
      
      // Merge with previous line
      newLines[lineIndex - 1] = previousLine + currentLine;
      newLines.splice(lineIndex, 1);
      
      const newContent = newLines.join('\n');
      setLocalContent(newContent);
      
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
      }
      
      // Move to previous line
      setEditingLine(lineIndex - 1);
      requestAnimationFrame(() => {
        const textarea = lineRefs.current[lineIndex - 1];
        if (textarea) {
          textarea.setSelectionRange(cursorPos, cursorPos);
        }
      });
    } else if (e.key === 'ArrowUp' && lineIndex > 0) {
      e.preventDefault();
      setEditingLine(lineIndex - 1);
    } else if (e.key === 'ArrowDown' && lineIndex < lines.length - 1) {
      e.preventDefault();
      setEditingLine(lineIndex + 1);
    } else if (e.key === 'Escape') {
      setEditingLine(null);
    }
  }, [lines, activeFile, updateFileContent]);

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
        <div className="wysiwyg-line-editor">
          {lines.length === 0 || (lines.length === 1 && lines[0] === '') ? (
            <div className="editor-line" onClick={(e) => handleLineClick(0, e)}>
              <div className="line-number">1</div>
              <div className="line-content">
                <textarea
                  ref={(el) => { lineRefs.current[0] = el; }}
                  value=""
                  onChange={(e) => handleLineChange(0, e.target.value)}
                  onBlur={() => handleLineBlur(0)}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  placeholder="Start typing your markdown..."
                  className="line-textarea"
                  rows={1}
                />
              </div>
            </div>
          ) : (
            lines.map((line, index) => (
              <div 
                key={index} 
                className="editor-line" 
                onClick={(e) => handleLineClick(index, e)}
              >
                <div className="line-number">{index + 1}</div>
                <div className="line-content">
                  {editingLine === index ? (
                    <textarea
                      ref={(el) => { lineRefs.current[index] = el; }}
                      value={line}
                      onChange={(e) => handleLineChange(index, e.target.value)}
                      onBlur={() => handleLineBlur(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="line-textarea"
                      rows={1}
                    />
                  ) : (
                    <div className="line-preview">
                      <LinePreview line={line} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;

