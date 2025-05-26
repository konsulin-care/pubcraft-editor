
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import GitHubStatusBanner from '@/components/GitHubStatusBanner';
import MarkdownEditor from '@/components/MarkdownEditor';
import MetadataEditor from '@/components/MetadataEditor';
import LivePreview from '@/components/LivePreview';
import GitHubSaveButton from '@/components/GitHubSaveButton';
import { Button } from '@/components/ui/button';
import { useAutosave, loadDraft, clearDraft, type Draft } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Clock } from 'lucide-react';

const Editor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [markdown, setMarkdown] = useState('');
  const [metadata, setMetadata] = useState<Draft['metadata']>({
    title: '',
    author: user?.name || '',
    abstract: ''
  });
  const [lastSaved, setLastSaved] = useState<string>('');

  // Auto-save hook
  useAutosave(markdown, metadata);

  // Load draft on component mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setMarkdown(draft.markdown);
      setMetadata(draft.metadata);
      setLastSaved(draft.updatedAt);
      toast({
        title: "Draft Loaded",
        description: "Your previous work has been restored.",
      });
    }
  }, [toast]);

  // Update author when user data changes
  useEffect(() => {
    if (user?.name && !metadata.author) {
      setMetadata(prev => ({ ...prev, author: user.name }));
    }
  }, [user?.name, metadata.author]);

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your draft? This action cannot be undone.')) {
      clearDraft();
      setMarkdown('');
      setMetadata({
        title: '',
        author: user?.name || '',
        abstract: ''
      });
      setLastSaved('');
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
                </div>
              )}
              <GitHubSaveButton 
                markdown={markdown}
                metadata={metadata}
              />
              <Button variant="outline" onClick={handleClearDraft}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Draft
              </Button>
            </div>
          </div>
          
          <GitHubStatusBanner />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Markdown Editor - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MarkdownEditor
              initialValue={markdown}
              onChange={setMarkdown}
              onSave={handleManualSave}
            />
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
          />
        </div>
      </main>
    </div>
  );
};

export default Editor;
