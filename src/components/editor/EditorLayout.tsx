
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import MetadataEditor from '@/components/editor/MetadataEditor';
import ReferencesEditor from '@/components/editor/ReferencesEditor';
import LivePreview from '@/components/editor/LivePreview';
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
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'metadata' | 'references'>('preview');
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setActiveTab('editor');
    } else {
      setActiveTab('preview');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile View Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant={isEditMode ? 'default' : 'outline'}
          size="sm"
          onClick={toggleEditMode}
          className="w-full"
        >
          {isEditMode ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Switch to Preview
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Manuscript
            </>
          )}
        </Button>
      </div>

      {/* Desktop and Mobile Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className={`${!isEditMode && 'hidden lg:block'}`}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="preview" className="lg:block hidden">Preview</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-1 min-h-0 mt-4 gap-4">
            {/* Main Content Area */}
            <div className="flex-1 min-h-0">
              <TabsContent value="preview" className="h-full m-0">
                <LivePreview
                  markdown={markdown}
                  metadata={metadata}
                  references={references}
                />
              </TabsContent>
              
              <TabsContent value="editor" className="h-full m-0">
                <MarkdownEditor
                  initialValue={markdown}
                  onChange={onMarkdownChange}
                  onSave={onManualSave}
                />
              </TabsContent>

              <TabsContent value="metadata" className="h-full m-0">
                <MetadataEditor
                  metadata={metadata}
                  onChange={onMetadataChange}
                  onSave={onManualSave}
                />
              </TabsContent>

              <TabsContent value="references" className="h-full m-0">
                <ReferencesEditor
                  references={references}
                  onChange={onReferencesChange}
                  onSave={onManualSave}
                />
              </TabsContent>
            </div>

            {/* Sidebar for Metadata/References when not active */}
            {(activeTab === 'preview' || activeTab === 'editor') && (
              <div className="w-96 min-h-0 space-y-4">
                <div className="h-1/2">
                  <MetadataEditor
                    metadata={metadata}
                    onChange={onMetadataChange}
                    onSave={onManualSave}
                  />
                </div>
                <div className="h-1/2">
                  <ReferencesEditor
                    references={references}
                    onChange={onReferencesChange}
                    onSave={onManualSave}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex-1 min-h-0 mt-4">
            {!isEditMode ? (
              <LivePreview
                markdown={markdown}
                metadata={metadata}
                references={references}
              />
            ) : (
              <>
                <TabsContent value="editor" className="h-full m-0">
                  <MarkdownEditor
                    initialValue={markdown}
                    onChange={onMarkdownChange}
                    onSave={onManualSave}
                  />
                </TabsContent>

                <TabsContent value="metadata" className="h-full m-0">
                  <MetadataEditor
                    metadata={metadata}
                    onChange={onMetadataChange}
                    onSave={onManualSave}
                  />
                </TabsContent>

                <TabsContent value="references" className="h-full m-0">
                  <ReferencesEditor
                    references={references}
                    onChange={onReferencesChange}
                    onSave={onManualSave}
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default EditorLayout;
