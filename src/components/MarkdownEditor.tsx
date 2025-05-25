
import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@toast-ui/editor/dist/toastui-editor.css';

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
  const editorRef = useRef<Editor>(null);
  const { toast } = useToast();

  const handleChange = () => {
    if (editorRef.current) {
      const markdown = editorRef.current.getInstance().getMarkdown();
      onChange(markdown);
    }
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
          <Editor
            ref={editorRef}
            initialValue={initialValue}
            previewStyle="tab"
            height="600px"
            initialEditType="markdown"
            useCommandShortcut={true}
            onChange={handleChange}
            toolbarItems={[
              ['heading', 'bold', 'italic', 'strike'],
              ['hr', 'quote'],
              ['ul', 'ol', 'task', 'indent', 'outdent'],
              ['table', 'image', 'link'],
              ['code', 'codeblock'],
              ['scrollSync']
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;
