
import React, { useState, useEffect, useRef, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CitationKeyManager } from '@/utils/bibliography';
import { Reference } from '@/types/metadata';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (markdown: string) => void;
  isFullscreen: boolean;
  references?: Reference[];
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  onChange,
  isFullscreen,
  references = []
}) => {
  const [markdown, setMarkdown] = useState(initialValue);
  const [citationTriggerPosition, setCitationTriggerPosition] = useState<{ line: number; ch: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableCitationKeys = useMemo(() =>
    CitationKeyManager.extractCitationKeys(references),
    [references]
  );

  const handleChange = (value?: string) => {
    const newValue = value || '';
    setMarkdown(newValue);
    onChange(newValue);

    // Check for citation trigger
    const lastChar = newValue.slice(-1);
    if (lastChar === '@') {
      // Trigger citation autocomplete
      setCitationTriggerPosition({ line: 0, ch: newValue.length });
    }
  };

  const handleCitationSelect = (key: string) => {
    if (textareaRef.current) {
      const currentValue = markdown;
      const citationText = CitationKeyManager.renderCitation(key);
      
      // Replace the last two characters (@) with the full citation
      const newValue = currentValue.slice(0, -1) + citationText;
      
      setMarkdown(newValue);
      onChange(newValue);
      setCitationTriggerPosition(null);
    }
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
        <div className="h-full relative">
          <MDEditor
            value={markdown}
            onChange={handleChange}
            height="100%" // Fill parent height
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            data-color-mode="light"
            textareaProps={{
              ref: textareaRef,
            }}
          />
          {citationTriggerPosition && (
            <Popover open={true} onOpenChange={(open) => !open && setCitationTriggerPosition(null)}>
              <PopoverTrigger asChild>
                <div
                  className="absolute"
                  style={{
                    top: `${citationTriggerPosition.line * 20}px`,
                    left: `${citationTriggerPosition.ch * 10}px`
                  }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <h4 className="font-medium leading-none">Citation Keys</h4>
                  <div className="grid gap-2">
                    {availableCitationKeys.map((key) => (
                      <Button
                        key={key}
                        variant="outline"
                        onClick={() => handleCitationSelect(key)}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;
