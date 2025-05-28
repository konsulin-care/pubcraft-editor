
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownEditor from '@/components/MarkdownEditor';
import MetadataEditor from '@/components/MetadataEditor';
import LivePreview from '@/components/LivePreview';
import BibliographyManager from '@/components/BibliographyManager';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import { Eye, Edit } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* Main Content Area - Takes 2 columns */}
      <div className="lg:col-span-2 flex flex-col">
        {/* View Toggle Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={viewMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {viewMode === 'preview' ? (
            <LivePreview
              markdown={markdown}
              metadata={metadata}
              references={references}
            />
          ) : (
            <Tabs defaultValue="markdown" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              <TabsContent value="markdown" className="mt-4 h-full">
                <MarkdownEditor
                  initialValue={markdown}
                  onChange={onMarkdownChange}
                  onSave={onManualSave}
                />
              </TabsContent>
              <TabsContent value="references" className="mt-4 h-full">
                <BibliographyManager
                  references={references}
                  onChange={onReferencesChange}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Metadata Sidebar - Takes 1 column */}
      <div>
        <MetadataEditor
          metadata={metadata}
          onChange={onMetadataChange}
        />
      </div>
    </div>
  );
};

export default EditorLayout;
