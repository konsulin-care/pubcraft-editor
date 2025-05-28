
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  setupRepositoryStructure,
  commitManuscriptFiles,
  createMergeRequest,
  generateUserBranch
} from '@/utils/github';
import { Github, Save, GitMerge, ExternalLink } from 'lucide-react';
import { ExtendedMetadata } from '@/types/metadata';
import GitHubRepositorySelector, { type RepositoryConfig } from './GitHubRepositorySelector';

interface GitHubSaveButtonProps {
  markdown: string;
  metadata: ExtendedMetadata;
  bibContent?: string;
  disabled?: boolean;
  onSaveSuccess?: () => void;
}

const GitHubSaveButton: React.FC<GitHubSaveButtonProps> = ({ 
  markdown, 
  metadata, 
  bibContent = '',
  disabled = false,
  onSaveSuccess 
}) => {
  const { user, github, isGitHubLinked } = useAuth();
  const { toast } = useToast();
  
  const [showSelector, setShowSelector] = useState(false);
  const [repositoryConfig, setRepositoryConfig] = useState<RepositoryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [lastSyncUrl, setLastSyncUrl] = useState<string | null>(null);
  const previousTitleRef = useRef<string>('');

  const handleRepositorySelected = async (config: RepositoryConfig) => {
    if (!github?.token || !user?.name) return;
    
    setIsLoading(true);
    try {
      const firstName = user.name.split(' ')[0];
      
      await setupRepositoryStructure({
        owner: config.owner,
        repo: config.repo,
        userFirstName: firstName,
        manuscriptTitle: metadata.title,
        token: github.token,
        createRepo: config.mode === 'new'
      });
      
      setRepositoryConfig(config);
      setShowSelector(false);
      previousTitleRef.current = metadata.title;
      
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
      setShowSelector(true);
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
      const firstName = user.name.split(' ')[0];
      const commitMessage = `Update manuscript: ${metadata.title}`;

      await commitManuscriptFiles({
        owner: activeConfig.owner,
        repo: activeConfig.repo,
        manuscriptTitle: metadata.title,
        markdownContent: markdown,
        bibContent,
        userFirstName: firstName,
        commitMessage,
        token: github.token,
        previousTitle: previousTitleRef.current !== metadata.title ? previousTitleRef.current : undefined
      });

      previousTitleRef.current = metadata.title;
      const userBranch = generateUserBranch(firstName);
      const repoUrl = `https://github.com/${activeConfig.owner}/${activeConfig.repo}/tree/${userBranch}`;
      setLastSyncUrl(repoUrl);

      toast({
        title: "Synced to GitHub",
        description: `Changes saved to ${userBranch} branch`,
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

      // Open the pull request URL
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

  if (!isGitHubLinked) {
    return null;
  }

  return (
    <>
      <div className="flex space-x-2">
        {repositoryConfig && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMergeToPublish}
            disabled={disabled || isMerging}
          >
            <GitMerge className="h-4 w-4 mr-2" />
            {isMerging ? 'Merging...' : 'Merge'}
          </Button>
        )}
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => repositoryConfig ? handleSaveToGitHub() : setShowSelector(true)}
          disabled={disabled || isLoading}
        >
          <Github className="h-4 w-4 mr-2" />
          {isLoading ? 'Syncing...' : repositoryConfig ? 'Sync' : 'Connect Repository'}
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
      </div>

      <GitHubRepositorySelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onRepositorySelected={handleRepositorySelected}
      />
    </>
  );
};

export default GitHubSaveButton;
