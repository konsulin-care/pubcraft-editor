
import React, { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Save, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (markdown: string) => void;
  onSave?: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  initialValue = '', 
  onChange,
  onSave 
}) => {
  const [markdown, setMarkdown] = useState(initialValue);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  const handleChange = (value?: string) => {
    const newValue = value || '';
    setMarkdown(newValue);
    onChange(newValue);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      toast({
        title: "Draft Saved",
        description: `Saved at ${new Date().toLocaleTimeString()}`,
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && editorRef.current) {
      editorRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Handle Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [onSave]);

  // Update internal state when initialValue changes
  useEffect(() => {
    setMarkdown(initialValue);
  }, [initialValue]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card className={`h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} ref={editorRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Edit3 className="h-5 w-5 mr-2" />
            Markdown Editor
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save (⌘S)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'}`}>
          <MDEditor
            value={markdown}
            onChange={handleChange}
            height={isFullscreen ? window.innerHeight - 120 : 600}
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
