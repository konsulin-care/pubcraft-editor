
import React from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorLayout from '@/components/EditorLayout';
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
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4">
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
      
      <div className="flex-1 overflow-hidden">
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
  );
};

export default Editor;
