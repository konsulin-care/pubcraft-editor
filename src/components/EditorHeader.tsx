
import React from 'react';
import { Button } from '@/components/ui/button';
import GitHubSaveButton from '@/components/GitHubSaveButton';
import { Clock, Trash2 } from 'lucide-react';
import { ExtendedMetadata } from '@/types/metadata';

interface EditorHeaderProps {
  lastSaved: string;
  hasUnsyncedChanges: boolean;
  markdown: string;
  metadata: ExtendedMetadata;
  isOnline: boolean;
  onClearDraft: () => void;
  onGitHubSaveSuccess: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  lastSaved,
  hasUnsyncedChanges,
  markdown,
  metadata,
  isOnline,
  onClearDraft,
  onGitHubSaveSuccess
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Scholarly Editor
        </h1>
        <p className="text-gray-600">
          Write and preview your research articles with live Markdown rendering
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
            {hasUnsyncedChanges && (
              <span className="ml-2 text-orange-600">
                (Unsynced)
              </span>
            )}
          </div>
        )}
        <GitHubSaveButton 
          markdown={markdown}
          metadata={metadata}
          disabled={!isOnline}
          onSaveSuccess={onGitHubSaveSuccess}
        />
        <Button variant="outline" onClick={onClearDraft}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Draft
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
