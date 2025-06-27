import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  generateUserBranch,
  generateDirectoryName,
  createMergeRequest
} from '@/utils/github/core';
import { saveFileToGitHub } from '@/utils/github/fileOperations';
import { Github, Save, GitMerge, ExternalLink } from 'lucide-react';
import { ExtendedMetadata } from '@/types/metadata';
import { type RepositoryConfig } from './GitHubRepositorySelector';

interface GitHubSaveButtonProps {
  markdown: string;
  metadata: ExtendedMetadata;
  bibContent?: string;
  disabled?: boolean;
  onSaveSuccess?: () => void;
  onConnectRepository: () => void; // New prop to open the connection modal
  isGitHubConnected: boolean;
  repositoryConfig: RepositoryConfig | null;
  onLocalSave: () => void;
  lastLocalSave: string | null;
}

const GitHubSaveButton: React.FC<GitHubSaveButtonProps> = ({
  markdown,
  metadata,
  bibContent = '',
  disabled = false,
  onSaveSuccess,
  onConnectRepository,
  isGitHubConnected,
  repositoryConfig,
  onLocalSave,
  lastLocalSave
}) => {
 const { user, github } = useAuth();
 const { toast } = useToast();
  
  const [showSelector, setShowSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [lastSyncUrl, setLastSyncUrl] = useState<string | null>(null);

  const handleRepositorySelected = async (config: RepositoryConfig) => {
    if (!github?.token || !user?.name) return;
    
    setIsLoading(true);
    try {
      // The repository structure is now handled by GitHubConnectionModal
      // No need to call setupRepositoryStructure here
      
      // setRepositoryConfig(config); // Removed, now passed as prop
      setShowSelector(false);
      
      toast({
        title: "Repository Connected",
        description: `Connected to ${config.owner}/${config.repo}`,
      });
      
      // Auto-save current content
      await handleSaveToGitHub(config);
      
    } catch (error) {
      console.error('Repository setup error:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup repository",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGitHub = async (config?: RepositoryConfig) => {
    const activeConfig = config || repositoryConfig;
    if (!github?.token || !user?.name || !activeConfig) {
      onConnectRepository(); // Open connection modal if no active config
      return;
    }

    if (!metadata.title || !markdown.trim()) {
      toast({
        title: "Content Required",
        description: "Please add a title and some content before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      onLocalSave(); // Save locally first
      const firstName = user.name.split(' ')[0];
      const commitMessage = `Update manuscript: ${metadata.title}`;

      // Save markdown file
      await saveFileToGitHub({
        owner: activeConfig.owner,
        repo: activeConfig.repo,
        path: activeConfig.markdownFile,
        content: markdown,
        message: commitMessage,
        branch: activeConfig.branch,
        token: github.token
      });

      // Save bibliography content if it exists
      if (bibContent.trim()) {
        const bibFilePath = activeConfig.markdownFile.replace('pubcraft-manuscript.md', 'pubcraft-reference.bib');
        await saveFileToGitHub({
          owner: activeConfig.owner,
          repo: activeConfig.repo,
          path: bibFilePath,
          content: bibContent,
          message: commitMessage,
          branch: activeConfig.branch,
          token: github.token
        });
      }

      const repoUrl = `https://github.com/${activeConfig.owner}/${activeConfig.repo}/tree/${activeConfig.branch}`;
      setLastSyncUrl(repoUrl);

      toast({
        title: "Synced to GitHub",
        description: `Changes saved to ${activeConfig.branch} branch`,
      });

      onSaveSuccess?.();

    } catch (error) {
      console.error('GitHub save error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync to GitHub",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeToPublish = async () => {
    if (!github?.token || !user?.name || !repositoryConfig) return;

    setIsMerging(true);
    try {
      const firstName = user.name.split(' ')[0];
      
      const pullRequest = await createMergeRequest({
        owner: repositoryConfig.owner,
        repo: repositoryConfig.repo,
        userFirstName: firstName,
        manuscriptTitle: metadata.title,
        token: github.token
      });

      toast({
        title: "Merge Request Created",
        description: "Your manuscript has been submitted for publishing!",
      });

      window.open(pullRequest.html_url, '_blank');

    } catch (error) {
      console.error('Merge error:', error);
      toast({
        title: "Merge Failed",
        description: error instanceof Error ? error.message : "Failed to create merge request",
        variant: "destructive"
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleSaveButtonClick = () => {
    if (isGitHubConnected && repositoryConfig) {
      handleSaveToGitHub();
    } else {
      onLocalSave();
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        {isGitHubConnected && repositoryConfig && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMergeToPublish}
              disabled={disabled || isMerging}
            >
              <GitMerge className="h-4 w-4 mr-2" />
              {isMerging ? 'Merging...' : 'Merge'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveButtonClick}
              disabled={disabled || isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            {lastSyncUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(lastSyncUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        {!isGitHubConnected && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveButtonClick}
            disabled={disabled || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </>
  );
};

export default GitHubSaveButton;
