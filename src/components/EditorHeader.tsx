
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';
import GitHubSaveButton from './GitHubSaveButton';
import LinkGitHubButton from './LinkGitHubButton';
import { useAuth } from '@/contexts/AuthContext';
import { ExtendedMetadata, Reference } from '@/types/metadata';

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

// Convert references to BibTeX format
const convertReferenceTosBibTeX = (references: Reference[]): string => {
  if (!references || references.length === 0) return '';
  
  return references.map(ref => {
    const bibKey = ref.id || `ref${Date.now()}`;
    const type = ref.type || 'article';
    
    let bibEntry = `@${type}{${bibKey},\n`;
    bibEntry += `  title={${ref.title}},\n`;
    bibEntry += `  author={${ref.author}},\n`;
    bibEntry += `  year={${ref.year}}`;
    
    if (ref.journal) {
      bibEntry += `,\n  journal={${ref.journal}}`;
    }
    
    if (ref.url) {
      bibEntry += `,\n  url={${ref.url}}`;
    }
    
    bibEntry += '\n}\n';
    return bibEntry;
  }).join('\n');
};

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
  const { isGitHubLinked } = useAuth();
  
  const bibContent = convertReferenceTosBibTeX(references);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">Article Editor</h1>
        
        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
              {hasUnsyncedChanges && (
                <span className="ml-2 text-orange-600 font-medium">
                  • Unsynced changes
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {!isGitHubLinked && <LinkGitHubButton />}
        
        <GitHubSaveButton
          markdown={markdown}
          metadata={metadata}
          bibContent={bibContent}
          disabled={!isOnline}
          onSaveSuccess={onGitHubSaveSuccess}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onClearDraft}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Draft
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
