
import React, { useState, useEffect } from 'react';
import EditorHeader from '@/components/EditorHeader';
import EditorLayout from '@/components/editor/EditorLayout';
import GitHubConnectionModal from '@/components/GitHubConnectionModal';
import { useEditorState } from '@/hooks/useEditorState';
import { useAuth } from '@/contexts/AuthContext';
import { type RepositoryConfig } from '@/components/GitHubRepositorySelector';

const Editor: React.FC = () => {
  const { isGitHubLinked } = useAuth();
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [repositoryConfig, setRepositoryConfig] = useState<RepositoryConfig | null>(null);

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

  // Show GitHub connection modal if not connected
  useEffect(() => {
    if (!isGitHubLinked) {
      setShowGitHubModal(true);
    }
  }, [isGitHubLinked]);

  const handleRepositorySelected = (config: RepositoryConfig) => {
    setRepositoryConfig(config);
    setShowGitHubModal(false);
  };

  const handleCloseGitHubModal = () => {
    // Allow closing modal but show warning about limited functionality
    setShowGitHubModal(false);
  };

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

      <GitHubConnectionModal
        isOpen={showGitHubModal}
        onClose={handleCloseGitHubModal}
        onRepositorySelected={handleRepositorySelected}
      />
    </div>
  );
};

export default Editor;
