
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAutosave, loadDraft, clearDraft, markDraftSynced } from '@/utils/storage';
import { ExtendedMetadata, Reference } from '@/types/metadata';

const defaultMarkdown = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

Displaying math equation as follow:

$$\\omega = \\frac{1}{\\frac{\\omega_B}{3} \\sqrt{2 \\pi}} e^{-\\frac{1}{2}\\left(\\frac{DDD - \\omega_B}{\\omega_B/3}\\right)^2}$$`;

const getDefaultMetadata = (userName?: string, userEmail?: string): ExtendedMetadata => ({
  title: 'The title of the manuscript',
  author: [
    {
      name: userName || 'User Name',
      corresponding: true,
      email: userEmail || 'user.email@mail.com',
      affiliations: [{ ref: '1' }],
      roles: ['Conceptualization', 'Methodology', 'Formal analysis', 'Visualization', 'Writing - Original Draft']
    }
  ],
  abstract: 'This is an abstract',
  funding: 'The author(s) received no specific funding for this work.',
  keywords: ['Keyword 1', 'Keyword 2'],
  affiliations: [
    {
      id: '1',
      name: 'University of Somewhere',
      city: 'Somewhere',
      country: 'Someland'
    }
  ]
});

export const useEditorState = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [markdown, setMarkdown] = useState('');
  const [metadata, setMetadata] = useState<ExtendedMetadata>(getDefaultMetadata());
  const [references, setReferences] = useState<Reference[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Auto-save hook
  useAutosave(markdown, metadata, references);

  // Load draft on component mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setMarkdown(draft.markdown);
      setMetadata(draft.metadata);
      setReferences(draft.references || []);
      setLastSaved(draft.updatedAt);
      setHasUnsyncedChanges(draft.dirty || false);
      setDraftLoaded(true);
      toast({
        title: "Draft Loaded",
        description: "Your previous work has been restored.",
      });
    } else {
      // Set default content for new users
      setMarkdown(defaultMarkdown);
      setMetadata(getDefaultMetadata(user?.name, user?.email));
      setDraftLoaded(false);
    }
    setInitialLoadComplete(true);
  }, [toast]);

  // Update author when user data changes (only if no draft was loaded and initial load is complete)
  useEffect(() => {
    if (!initialLoadComplete || draftLoaded) {
      return; // Don't run if initial load isn't complete or if draft was loaded
    }

    if (user?.name && Array.isArray(metadata.author) && metadata.author.length > 0) {
      // Only update if the current author name is the default placeholder
      const currentAuthor = metadata.author[0];
      if (currentAuthor && (currentAuthor.name === 'User Name' || !currentAuthor.name)) {
        const updatedMetadata = { ...metadata };
        if (Array.isArray(updatedMetadata.author)) {
          updatedMetadata.author[0] = {
            ...updatedMetadata.author[0],
            name: user.name,
            email: user.email || updatedMetadata.author[0].email
          };
          setMetadata(updatedMetadata);
        }
      }
    }
  }, [user?.name, user?.email, metadata.author, initialLoadComplete, draftLoaded]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const draft = loadDraft();
      if (draft?.dirty) {
        setHasUnsyncedChanges(true);
        toast({
          title: "Back Online",
          description: "You have unsynced changes. Consider saving to GitHub.",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Your work will be saved locally.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your draft? This action cannot be undone.')) {
      clearDraft();
      setMarkdown(defaultMarkdown);
      setMetadata(getDefaultMetadata(user?.name, user?.email));
      setReferences([]);
      setLastSaved('');
      setHasUnsyncedChanges(false);
      setDraftLoaded(false); // Reset draft loaded flag
      toast({
        title: "Draft Cleared",
        description: "Your draft has been cleared.",
      });
    }
  };

  const handleManualSave = () => {
    const now = new Date().toISOString();
    setLastSaved(now);
  };

  const handleGitHubSaveSuccess = () => {
    markDraftSynced();
    setHasUnsyncedChanges(false);
  };

  return {
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
  };
};
