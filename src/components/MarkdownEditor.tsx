
import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Save } from 'lucide-react';
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
  const { toast } = useToast();

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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Edit3 className="h-5 w-5 mr-2" />
            Markdown Editor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save (⌘S)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px]">
          <MDEditor
            value={markdown}
            onChange={handleChange}
            height={600}
            preview="edit"
            hideToolbar={false}
            visibleDragBar={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;
