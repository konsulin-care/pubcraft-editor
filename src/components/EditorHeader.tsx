import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Edit, LogOut } from 'lucide-react';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import GitHubSaveButton from './GitHubSaveButton';
import GitHubConnectionModal from './GitHubConnectionModal';
import { RepositoryConfig } from '@/components/GitHubRepositorySelector'; // Import RepositoryConfig

interface EditorHeaderProps {
  markdown: string;
  metadata: ExtendedMetadata;
  references: Reference[];
  activeView: 'preview' | 'manuscript' | 'metadata' | 'bibliography';
  setActiveView: (view: 'preview' | 'manuscript' | 'metadata' | 'bibliography') => void;
  onManualSave: () => void;
  bibContent: string; // Added bibContent
  isGitHubConnected: boolean;
  repositoryConfig: RepositoryConfig | null;
  setRepositoryConfig: (config: RepositoryConfig | null) => void; // Add setRepositoryConfig
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  markdown,
  metadata,
  references,
  activeView,
  setActiveView,
  onManualSave,
  bibContent,
  isGitHubConnected,
  repositoryConfig,
  setRepositoryConfig, // Add setRepositoryConfig
}) => {
  const { user, logout } = useAuth();
  const [showGitHubConnectionModal, setShowGitHubConnectionModal] = useState(false);
  const [lastLocalSave, setLastLocalSave] = useState<string | null>(null);

  const handleLocalSave = () => {
    const now = new Date().toLocaleTimeString();
    setLastLocalSave(now);
    onManualSave();
  };

  const handleLogout = () => {
    // No unsynced changes check here, as save is now explicit and separate
    logout();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left Corner: Toggle Editor Mode, Sync, Merge */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveView(activeView === 'preview' ? 'manuscript' : 'preview')}
        >
          {activeView === 'preview' ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
        <GitHubSaveButton
          markdown={markdown}
          metadata={metadata}
          bibContent={bibContent}
          onConnectRepository={() => setShowGitHubConnectionModal(true)}
          isGitHubConnected={isGitHubConnected}
          repositoryConfig={repositoryConfig}
          onLocalSave={handleLocalSave}
          lastLocalSave={lastLocalSave}
        />
      </div>

      {/* Right Corner: User Profile */}
      <div className="flex items-center space-x-2">
        {lastLocalSave && (
          <span className="text-sm text-muted-foreground mr-2 flex items-center">
            Last saved: {lastLocalSave}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "UN"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {user?.orcid && (
                  <p className="text-xs leading-none text-muted-foreground">
                    ORCID: {user.orcid}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GitHubConnectionModal
        isOpen={showGitHubConnectionModal}
        onClose={() => setShowGitHubConnectionModal(false)}
        onRepositorySelected={(config) => {
          setRepositoryConfig(config);
          setShowGitHubConnectionModal(false);
        }}
      />
    </div>
  );
};

export default EditorHeader;
