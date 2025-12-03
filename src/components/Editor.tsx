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
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const lineRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const editorRef = useRef<HTMLDivElement>(null);

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
        textarea.focus();
        // Move cursor to end of line
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }
  }, [editingLine]);

  const handleLineChange = (lineIndex: number, newLineContent: string) => {
    const lines = localContent.split('\n');
    lines[lineIndex] = newLineContent;
    const newContent = lines.join('\n');
    
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

  const handleLineClick = (lineIndex: number) => {
    setEditingLine(lineIndex);
  };

  const handleLineBlur = (lineIndex: number) => {
    // Small delay to allow clicking on other elements
    setTimeout(() => {
      if (editingLine === lineIndex && !lineRefs.current[lineIndex]?.contains(document.activeElement)) {
        setEditingLine(null);
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, lineIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const lines = localContent.split('\n');
      const currentLine = lines[lineIndex];
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      
      // Split the line at cursor position
      const beforeCursor = currentLine.substring(0, cursorPos);
      const afterCursor = currentLine.substring(cursorPos);
      
      lines[lineIndex] = beforeCursor;
      lines.splice(lineIndex + 1, 0, afterCursor);
      
      const newContent = lines.join('\n');
      setLocalContent(newContent);
      
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
      }
      
      // Move to next line
      setEditingLine(lineIndex + 1);
    } else if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && lineIndex > 0) {
      e.preventDefault();
      const lines = localContent.split('\n');
      const currentLine = lines[lineIndex];
      const previousLine = lines[lineIndex - 1];
      const cursorPos = previousLine.length;
      
      // Merge with previous line
      lines[lineIndex - 1] = previousLine + currentLine;
      lines.splice(lineIndex, 1);
      
      const newContent = lines.join('\n');
      setLocalContent(newContent);
      
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
      }
      
      // Move to previous line
      setEditingLine(lineIndex - 1);
      setTimeout(() => {
        const textarea = lineRefs.current[lineIndex - 1];
        if (textarea) {
          textarea.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    } else if (e.key === 'ArrowUp' && lineIndex > 0) {
      e.preventDefault();
      setEditingLine(lineIndex - 1);
    } else if (e.key === 'ArrowDown' && lineIndex < localContent.split('\n').length - 1) {
      e.preventDefault();
      setEditingLine(lineIndex + 1);
    }
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

  const lines = localContent.split('\n');

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
            <div className="editor-line" onClick={() => handleLineClick(0)}>
              <div className="line-number">1</div>
              <div className="line-content">
                <textarea
                  ref={(el) => (lineRefs.current[0] = el)}
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
              <div key={index} className="editor-line" onClick={() => handleLineClick(index)}>
                <div className="line-number">{index + 1}</div>
                <div className="line-content">
                  {editingLine === index ? (
                    <textarea
                      ref={(el) => (lineRefs.current[index] = el)}
                      value={line}
                      onChange={(e) => handleLineChange(index, e.target.value)}
                      onBlur={() => handleLineBlur(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="line-textarea"
                      rows={1}
                    />
                  ) : (
                    <div className="line-preview">
                      {line === '' ? (
                        <span className="empty-line">&nbsp;</span>
                      ) : (
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
                      )}
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

