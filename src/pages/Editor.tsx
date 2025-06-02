
import React from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorLayout from '@/components/editor/EditorLayout';
import { useEditorState } from '@/hooks/useEditorState';

const Editor: React.FC = () => {
  const {
    markdown,
    metadata,
    references,
    lastSaved,
    isOnline,
    hasUnsyncedChanges,
    setMarkdown,
    setMetadata,
    setReferences,
    handleClearDraft,
    handleManualSave,
    handleGitHubSaveSuccess
  } = useEditorState();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <EditorHeader
            lastSaved={lastSaved}
            hasUnsyncedChanges={hasUnsyncedChanges}
            markdown={markdown}
            metadata={metadata}
            references={references}
            isOnline={isOnline}
            onClearDraft={handleClearDraft}
            onGitHubSaveSuccess={handleGitHubSaveSuccess}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
