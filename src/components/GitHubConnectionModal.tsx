
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, X, Settings } from 'lucide-react';
import LinkGitHubButton from './LinkGitHubButton';
import GitHubRepositorySelector, { type RepositoryConfig } from './GitHubRepositorySelector';
import { useAuth } from '@/contexts/AuthContext';

interface GitHubConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositorySelected: (config: RepositoryConfig) => void;
}

const GitHubConnectionModal: React.FC<GitHubConnectionModalProps> = ({
  isOpen,
  onClose,
  onRepositorySelected
}) => {
  const { isGitHubLinked } = useAuth();
  const [showRepositorySelector, setShowRepositorySelector] = useState(false);

  const handleGitHubLinked = () => {
    // Once GitHub is linked, show repository selector
    setShowRepositorySelector(true);
  };

  const handleRepositorySelected = (config: RepositoryConfig) => {
    onRepositorySelected(config);
    onClose();
  };

  const handleCancelSync = () => {
    onClose();
  };

  if (showRepositorySelector || isGitHubLinked) {
    return (
      <GitHubRepositorySelector
        isOpen={isOpen}
        onClose={onClose}
        onRepositorySelected={handleRepositorySelected}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Github className="h-5 w-5 mr-2" />
            Connect GitHub to Continue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-blue-900">
                <Github className="h-5 w-5 mr-2" />
                GitHub Integration Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">
                To use the Pubcraft editor, you need to connect your GitHub account. 
                This allows you to save your manuscripts, collaborate with others, and 
                maintain version control of your work.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-blue-900">What you'll get:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Automatic backup of your manuscripts</li>
                  <li>• Version control and collaboration features</li>
                  <li>• Structured repository organization</li>
                  <li>• Export to multiple academic formats</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col space-y-3">
            <LinkGitHubButton 
              variant="default" 
              size="lg" 
              showText={true}
            />
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRepositorySelector(true)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Select Repository
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelSync}
                className="flex-1"
              >
                Cancel Syncing
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Privacy:</strong> We only request the minimum permissions needed 
              to create repositories and manage your manuscript files. You can revoke 
              access anytime from your GitHub settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubConnectionModal;
