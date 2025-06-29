
import React, { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent } from '@/components/ui/card';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (markdown: string) => void;
  onSave?: () => void;
  isFullscreen: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  onChange,
  isFullscreen
}) => {
  const [markdown, setMarkdown] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleChange = (value?: string) => {
    const newValue = value || '';
    setMarkdown(newValue);
    onChange(newValue);
  };

  // Update internal state when initialValue changes
  useEffect(() => {
    setMarkdown(initialValue);
  }, [initialValue]);

  // Handle fullscreen changes (triggered by parent component)
  useEffect(() => {
    if (isFullscreen && editorRef.current) {
      editorRef.current.requestFullscreen?.();
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  return (
    <Card className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} ref={editorRef}>
      <CardContent className="p-0 flex-1">
        <div className="h-full">
          <MDEditor
            value={markdown}
            onChange={handleChange}
            height="100%" // Fill parent height
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            data-color-mode="light"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;
