
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { initiateGitHubLogin } from '@/utils/githubAuth';
import { useToast } from '@/hooks/use-toast';
import { Github, Link, CheckCircle } from 'lucide-react';

interface LinkGitHubButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

const LinkGitHubButton: React.FC<LinkGitHubButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  showText = true 
}) => {
  const { isGitHubLinked, github, unlinkGitHub } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLinkGitHub = async () => {
    setIsLoading(true);
    try {
      await initiateGitHubLogin();
    } catch (error) {
      console.error('GitHub linking error:', error);
      toast({
        title: "GitHub Link Failed",
        description: "There was an error connecting to GitHub. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleUnlinkGitHub = () => {
    unlinkGitHub();
    toast({
      title: "GitHub Unlinked",
      description: "Your GitHub account has been disconnected.",
    });
  };

  if (isGitHubLinked && github) {
    return (
      <Button 
        variant={variant} 
        size={size}
        onClick={handleUnlinkGitHub}
        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {showText && `GitHub: @${github.username}`}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLinkGitHub}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      ) : (
        <Github className="h-4 w-4 mr-2" />
      )}
      {showText && (isLoading ? 'Connecting...' : 'Link GitHub')}
    </Button>
  );
};

export default LinkGitHubButton;
