
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import GitHubStatusBanner from '@/components/GitHubStatusBanner';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import MarkdownEditor from '@/components/MarkdownEditor';
import MetadataEditor from '@/components/MetadataEditor';
import LivePreview from '@/components/LivePreview';
import BibliographyManager from '@/components/BibliographyManager';
import GitHubSaveButton from '@/components/GitHubSaveButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutosave, loadDraft, clearDraft, markDraftSynced } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Clock } from 'lucide-react';
import { ExtendedMetadata, Reference } from '@/types/metadata';

interface ExtendedDraft {
  markdown: string;
  metadata: ExtendedMetadata;
  references: Reference[];
  updatedAt: string;
  dirty?: boolean;
}

const Editor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [markdown, setMarkdown] = useState('');
  const [metadata, setMetadata] = useState<ExtendedMetadata>({
    title: '',
    author: user?.name || '',
    abstract: ''
  });
  const [references, setReferences] = useState<Reference[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);

  // Auto-save hook (we'll need to update this for the new structure)
  useAutosave(markdown, metadata);

  // Load draft on component mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setMarkdown(draft.markdown);
      // Handle both old and new metadata formats
      if (typeof draft.metadata.author === 'string' || Array.isArray(draft.metadata.author)) {
        setMetadata(draft.metadata as ExtendedMetadata);
      } else {
        // Convert old format to new format
        setMetadata({
          title: draft.metadata.title || '',
          author: draft.metadata.author || user?.name || '',
          abstract: draft.metadata.abstract || ''
        });
      }
      setLastSaved(draft.updatedAt);
      setHasUnsyncedChanges(draft.dirty || false);
      toast({
        title: "Draft Loaded",
        description: "Your previous work has been restored.",
      });
    }
  }, [toast, user?.name]);

  // Update author when user data changes
  useEffect(() => {
    if (user?.name && !metadata.author) {
      setMetadata(prev => ({ ...prev, author: user.name }));
    }
  }, [user?.name, metadata.author]);

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
      setMarkdown('');
      setMetadata({
        title: '',
        author: user?.name || '',
        abstract: ''
      });
      setReferences([]);
      setLastSaved('');
      setHasUnsyncedChanges(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
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
                onSaveSuccess={handleGitHubSaveSuccess}
              />
              <Button variant="outline" onClick={handleClearDraft}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Draft
              </Button>
            </div>
          </div>
          
          <InstallPrompt />
          <OfflineIndicator />
          <GitHubStatusBanner />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Editor Tabs - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="markdown" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              <TabsContent value="markdown" className="mt-4">
                <MarkdownEditor
                  initialValue={markdown}
                  onChange={setMarkdown}
                  onSave={handleManualSave}
                />
              </TabsContent>
              <TabsContent value="references" className="mt-4">
                <BibliographyManager
                  references={references}
                  onChange={setReferences}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Metadata Sidebar - Takes 1 column */}
          <div>
            <MetadataEditor
              metadata={metadata}
              onChange={setMetadata}
            />
          </div>
        </div>

        {/* Live Preview - Full width below */}
        <div className="w-full">
          <LivePreview
            markdown={markdown}
            metadata={metadata}
            references={references}
          />
        </div>
      </main>
    </div>
  );
};

export default Editor;
