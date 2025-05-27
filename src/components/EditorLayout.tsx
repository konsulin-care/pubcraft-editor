
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownEditor from '@/components/MarkdownEditor';
import MetadataEditor from '@/components/MetadataEditor';
import LivePreview from '@/components/LivePreview';
import BibliographyManager from '@/components/BibliographyManager';
import { ExtendedMetadata, Reference } from '@/types/metadata';

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
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Editor Tabs - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="markdown" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>
            <TabsContent value="markdown" className="mt-4">
              <MarkdownEditor
                initialValue={markdown}
                onChange={onMarkdownChange}
                onSave={onManualSave}
              />
            </TabsContent>
            <TabsContent value="references" className="mt-4">
              <BibliographyManager
                references={references}
                onChange={onReferencesChange}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Metadata Sidebar - Takes 1 column */}
        <div>
          <MetadataEditor
            metadata={metadata}
            onChange={onMetadataChange}
          />
        </div>
      </div>

      {/* Live Preview - Full width below */}
      <div className="w-full">
        <LivePreview
          markdown={markdown}
          metadata={metadata}
          references={references}
        />
      </div>
    </>
  );
};

export default EditorLayout;
