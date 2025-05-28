
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Wifi, WifiOff, Trash2, LogOut } from 'lucide-react';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import GitHubSaveButton from '@/components/github/GitHubSaveButton';
import { generateBibContent } from '@/utils/bibliography';

interface EditorHeaderProps {
  lastSaved: string;
  hasUnsyncedChanges: boolean;
  markdown: string;
  metadata: ExtendedMetadata;
  references: Reference[];
  isOnline: boolean;
  onClearDraft: () => void;
  onGitHubSaveSuccess: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  lastSaved,
  hasUnsyncedChanges,
  markdown,
  metadata,
  references,
  isOnline,
  onClearDraft,
  onGitHubSaveSuccess
}) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (hasUnsyncedChanges) {
      const confirmed = window.confirm('You have unsynced changes. Are you sure you want to logout?');
      if (!confirmed) return;
    }
    logout();
  };

  const bibContent = generateBibContent(references);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Article Editor</h1>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          
          {lastSaved && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
            </div>
          )}
          
          {hasUnsyncedChanges && (
            <span className="text-orange-600 font-medium">Unsynced changes</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <GitHubSaveButton
          markdown={markdown}
          metadata={metadata}
          bibContent={bibContent}
          onSaveSuccess={onGitHubSaveSuccess}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearDraft}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Draft
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
