
import React from 'react';
import Header from '@/components/Header';
import GitHubStatusBanner from '@/components/GitHubStatusBanner';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import EditorHeader from '@/components/EditorHeader';
import EditorLayout from '@/components/EditorLayout';
import { useEditorState } from '@/hooks/useEditorState';

const Editor = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <EditorHeader
            lastSaved={lastSaved}
            hasUnsyncedChanges={hasUnsyncedChanges}
            markdown={markdown}
            metadata={metadata}
            isOnline={isOnline}
            onClearDraft={handleClearDraft}
            onGitHubSaveSuccess={handleGitHubSaveSuccess}
          />
          
          <InstallPrompt />
          <OfflineIndicator />
          <GitHubStatusBanner />
        </div>

        <EditorLayout
          markdown={markdown}
          metadata={metadata}
          references={references}
          onMarkdownChange={setMarkdown}
          onMetadataChange={setMetadata}
          onReferencesChange={setReferences}
          onManualSave={handleManualSave}
        />
      </main>
    </div>
  );
};

export default Editor;
