
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import MetadataEditor from '@/components/editor/MetadataEditor';
import LivePreview from '@/components/editor/LivePreview';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import { Eye, Edit, FileText, Settings } from 'lucide-react';

interface EditorLayoutProps {
  markdown: string;
  metadata: ExtendedMetadata;
  references: Reference[];
  onMarkdownChange: (markdown: string) => void;
  onMetadataChange: (metadata: ExtendedMetadata) => void;
  onReferencesChange: (references: Reference[]) => void;
  onManualSave: () => void;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  markdown,
  metadata,
  references,
  onMarkdownChange,
  onMetadataChange,
  onReferencesChange,
  onManualSave
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'edit' | 'metadata'>('preview');
  const [isMobileMetadataOpen, setIsMobileMetadataOpen] = useState(false);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* View Toggle Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={activeView === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={activeView === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('edit')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={activeView === 'metadata' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('metadata')}
            className="lg:hidden"
          >
            <FileText className="h-4 w-4 mr-2" />
            Metadata
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          {activeView === 'preview' && (
            <LivePreview
              markdown={markdown}
              metadata={metadata}
              references={references}
            />
          )}
          
          {activeView === 'edit' && (
            <MarkdownEditor
              initialValue={markdown}
              onChange={onMarkdownChange}
              onSave={onManualSave}
            />
          )}
          
          {activeView === 'metadata' && (
            <div className="lg:hidden h-full">
              <MetadataEditor
                metadata={metadata}
                onChange={onMetadataChange}
                references={references}
                onReferencesChange={onReferencesChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Metadata Sidebar */}
      <div className="hidden lg:block w-80 min-h-0">
        <MetadataEditor
          metadata={metadata}
          onChange={onMetadataChange}
          references={references}
          onReferencesChange={onReferencesChange}
        />
      </div>
    </div>
  );
};

export default EditorLayout;
