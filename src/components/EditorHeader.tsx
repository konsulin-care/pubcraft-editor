
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { GitBranchPlus, Save, Maximize2, Minimize2, Eye, Edit, LogOut } from 'lucide-react';
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
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  // onSyncWithGitHub: () => void; // Removed, handled internally
  // onMergeToPublish: () => void; // Removed, handled internally
  bibContent: string; // Added bibContent
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  markdown,
  metadata,
  references,
  activeView,
  setActiveView,
  onManualSave,
  onToggleFullscreen,
  isFullscreen,
  bibContent, // Added bibContent
}) => {
  const { user, logout } = useAuth();
  const [showGitHubConnectionModal, setShowGitHubConnectionModal] = React.useState(false);
  const [repositoryConfig, setRepositoryConfig] = React.useState<RepositoryConfig | null>(null);

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

        {/* GitHub Sync Button (now part of GitHubSaveButton) */}
        {/* Merge Button (now part of GitHubSaveButton) */}
      </div>

      {/* Right Corner: Save, Fullscreen, User Profile */}
      <div className="flex items-center space-x-2">
        <GitHubSaveButton
          markdown={markdown}
          metadata={metadata}
          bibContent={bibContent}
          onConnectRepository={() => setShowGitHubConnectionModal(true)}
          // onSaveSuccess will be handled by Editor.tsx if needed
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onManualSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

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
