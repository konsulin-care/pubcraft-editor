
import React, { useState } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorLayout from '@/components/editor/EditorLayout';
import { useEditorState } from '@/hooks/useEditorState';

const Editor: React.FC = () => {
  const {
    markdown,
    metadata,
    references,
    setMarkdown,
    setMetadata,
    setReferences,
    handleManualSave,
  } = useEditorState();

  const [activeView, setActiveView] = useState<'preview' | 'manuscript' | 'metadata' | 'bibliography'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    // Logic to actually go fullscreen will be handled by the component that renders the editor (e.g., MarkdownEditor)
  };

  // Removed handleSyncWithGitHub and handleMergeToPublish as they are now handled by GitHubSaveButton

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <EditorHeader
            markdown={markdown}
            metadata={metadata}
            references={references}
            activeView={activeView}
            setActiveView={setActiveView}
            onManualSave={handleManualSave}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            bibContent={references.map(ref => ref.raw).join('\n\n')} // Pass bibContent
          />
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="container mx-auto px-4 py-6 h-full">
          <EditorLayout
            markdown={markdown}
            metadata={metadata}
            references={references}
            onMarkdownChange={setMarkdown}
            onMetadataChange={setMetadata}
            onReferencesChange={setReferences}
            onManualSave={handleManualSave}
            activeView={activeView}
            setActiveView={setActiveView}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
