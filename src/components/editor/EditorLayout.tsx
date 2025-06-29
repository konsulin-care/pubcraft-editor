
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import MetadataEditor from '@/components/editor/MetadataEditor';
import { LivePreview } from '@/components/editor/LivePreview';
import ReferencesEditor from '@/components/editor/ReferencesEditor'; // Ensure this is imported
import { ExtendedMetadata, Reference } from '@/types/metadata';

interface EditorLayoutProps {
  markdown: string;
  metadata: ExtendedMetadata;
  references: Reference[];
  onMarkdownChange: (markdown: string) => void;
  onMetadataChange: (metadata: ExtendedMetadata) => void;
  onReferencesChange: (references: Reference[]) => void;
  onManualSave: () => void; // Still needed for MarkdownEditor's internal save logic if any
  activeView: 'preview' | 'manuscript' | 'metadata' | 'bibliography';
  setActiveView: (view: 'preview' | 'manuscript' | 'metadata' | 'bibliography') => void;
  isFullscreen: boolean;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  markdown,
  metadata,
  references,
  onMarkdownChange,
  onMetadataChange,
  onReferencesChange,
  onManualSave,
  activeView,
  setActiveView,
  isFullscreen,
}) => {
  return (
    <div className="h-full flex flex-col">
      {activeView === 'preview' ? (
        <LivePreview
          markdown={markdown}
          metadata={metadata}
          references={references}
        />
      ) : (
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'manuscript' | 'metadata' | 'bibliography')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manuscript">Manuscript</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="bibliography">Bibliography</TabsTrigger>
          </TabsList>
          <TabsContent value="manuscript" className="flex-1 min-h-0 mt-0">
            <MarkdownEditor
              initialValue={markdown}
              onChange={onMarkdownChange}
              onSave={onManualSave} // Keep onSave for internal MarkdownEditor logic if needed
              isFullscreen={isFullscreen}
            />
          </TabsContent>
          <TabsContent value="metadata" className="flex-1 min-h-0 mt-0">
            <MetadataEditor
              metadata={metadata}
              onChange={onMetadataChange}
              references={references}
              onReferencesChange={onReferencesChange}
            />
          </TabsContent>
          <TabsContent value="bibliography" className="flex-1 min-h-0 mt-0">
            <ReferencesEditor
              references={references}
              onChange={onReferencesChange}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EditorLayout;
