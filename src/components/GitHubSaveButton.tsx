
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  commitFile, 
  createBranch, 
  createPullRequest, 
  getSubmissionPath, 
  getSubmissionBranch,
  generateMarkdownWithFrontmatter, 
  generatePRBody,
  validateRepository,
  type Metadata 
} from '@/utils/github';
import { Github, Save, Upload, ExternalLink } from 'lucide-react';

interface GitHubSaveButtonProps {
  markdown: string;
  metadata: Metadata;
  disabled?: boolean;
  onSaveSuccess?: () => void;
}

const GitHubSaveButton: React.FC<GitHubSaveButtonProps> = ({ 
  markdown, 
  metadata, 
  disabled = false,
  onSaveSuccess 
}) => {
  const { user, github, isGitHubLinked } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [pullRequestUrl, setPullRequestUrl] = useState<string | null>(null);

  const handleSaveToGitHub = async () => {
    if (!github?.token || !user?.orcid) {
      toast({
        title: "Authentication Required",
        description: "Please link your GitHub account first.",
        variant: "destructive"
      });
      return;
    }

    if (!repoOwner || !repoName) {
      toast({
        title: "Repository Required",
        description: "Please enter repository owner and name.",
        variant: "destructive"
      });
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
      // Validate repository access
      const isValidRepo = await validateRepository({
        owner: repoOwner,
        repo: repoName,
        token: github.token
      });

      if (!isValidRepo) {
        throw new Error('Cannot access repository. Please check the owner/repo names and your permissions.');
      }

      // Generate paths and content
      const submissionPath = getSubmissionPath(user.orcid);
      const branchName = getSubmissionBranch(user.orcid);
      const content = generateMarkdownWithFrontmatter(metadata, markdown);
      const commitMessage = `Add submission: ${metadata.title}`;

      // Create a new branch for the submission
      try {
        await createBranch({
          owner: repoOwner,
          repo: repoName,
          branchName,
          token: github.token
        });
      } catch (error) {
        // Branch might already exist, continue
        console.log('Branch might already exist, continuing...');
      }

      // Commit the file
      await commitFile({
        owner: repoOwner,
        repo: repoName,
        path: submissionPath,
        content,
        message: commitMessage,
        branch: branchName,
        token: github.token
      });

      toast({
        title: "Saved to GitHub",
        description: `File committed to branch: ${branchName}`,
      });

      // Create pull request
      const pullRequest = await createPullRequest({
        owner: repoOwner,
        repo: repoName,
        head: branchName,
        base: 'main',
        title: `Submission: ${metadata.title}`,
        body: generatePRBody(metadata),
        token: github.token
      });

      setPullRequestUrl(pullRequest.html_url);
      
      toast({
        title: "Pull Request Created",
        description: "Your submission has been submitted for review!",
      });

      // Call success callback to mark draft as synced
      onSaveSuccess?.();

    } catch (error) {
      console.error('GitHub save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to GitHub",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGitHubLinked) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={disabled}>
          <Github className="h-4 w-4 mr-2" />
          {disabled ? 'Offline' : 'Save to GitHub'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Save to GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Submit your article to a GitHub repository for review and publication.
          </DialogDescription>
        </DialogHeader>
        
        {pullRequestUrl ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Successfully Submitted!</h3>
              <p className="text-sm text-green-700 mb-3">
                Your article has been submitted as a pull request for review.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(pullRequestUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Pull Request
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsOpen(false);
                setPullRequestUrl(null);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Repository Owner</Label>
              <Input
                id="owner"
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                placeholder="e.g., your-username or organization"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repo">Repository Name</Label>
              <Input
                id="repo"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g., journal-submissions"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>What will happen:</strong><br />
                1. Create a new branch for your submission<br />
                2. Commit your article with metadata<br />
                3. Create a pull request for review
              </p>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveToGitHub} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save & Submit'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubSaveButton;
