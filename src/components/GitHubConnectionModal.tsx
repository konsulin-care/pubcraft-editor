
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, X, Settings, Loader2 } from 'lucide-react';
import LinkGitHubButton from './LinkGitHubButton';
import RepositorySelector from './github/RepositorySelector';
import NewRepositoryForm from './github/NewRepositoryForm';
import BranchSelector from './github/BranchSelector';
import FileSelector from './github/FileSelector';
import { useAuth } from '@/contexts/AuthContext';
import { listRepositories, listUserOrganizations, createRepository, listBranches, createBranch, Repository, Organization } from '@/utils/github/repository';
import { listMarkdownFilesInDirectory, createRepositoryStructure } from '@/utils/github/fileOperations';
import { type RepositoryConfig } from '@/components/GitHubRepositorySelector'; // Re-using the type from the old component

interface GitHubConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositorySelected: (config: RepositoryConfig) => void;
}

type ConnectionStep = 'initial' | 'choose_repo_action' | 'select_existing_repo' | 'create_new_repo';

const GitHubConnectionModal: React.FC<GitHubConnectionModalProps> = ({
  isOpen,
  onClose,
  onRepositorySelected
}) => {
  const { isGitHubLinked, github, user } = useAuth(); // Added user
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('initial');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [repoSearchTerm, setRepoSearchTerm] = useState('');
  const [selectedRepoFullName, setSelectedRepoFullName] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [markdownFiles, setMarkdownFiles] = useState<string[]>([]);
  const [selectedMarkdownFile, setSelectedMarkdownFile] = useState('');

  useEffect(() => {
    if (isOpen && isGitHubLinked && github?.token && connectionStep === 'choose_repo_action') {
      const fetchGitHubData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [repos, orgs] = await Promise.all([
            listRepositories(github.token),
            listUserOrganizations(github.token)
          ]);
          setRepositories(repos);
          setOrganizations([{ login: user?.login || '', avatar_url: user?.avatar_url || '' }, ...orgs]);
          setSelectedOwner(user?.login || ''); // Default to user's own account
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data.');
        } finally {
          setLoading(false);
        }
      };
      fetchGitHubData();
    }
  }, [isOpen, isGitHubLinked, github?.token, user?.login, user?.avatar_url, connectionStep]);

  useEffect(() => {
    if (isOpen && isGitHubLinked && connectionStep === 'initial') {
      setConnectionStep('choose_repo_action');
    } else if (!isOpen) {
      // Reset state when modal closes
      setConnectionStep('initial');
      setRepositories([]);
      setOrganizations([]);
      setRepoSearchTerm('');
      setSelectedRepoFullName('');
      setSelectedOwner('');
      setNewRepoName('');
      setLoading(false);
      setError(null);
      setBranches([]);
      setSelectedBranch('');
      setMarkdownFiles([]);
      setSelectedMarkdownFile('');
    }
  }, [isOpen, isGitHubLinked]);

  // Effect to fetch branches when a repository is selected
  useEffect(() => {
    if (selectedRepoFullName && github?.token) {
      const fetchBranches = async () => {
        setLoading(true);
        setError(null);
        try {
          const [owner, repo] = selectedRepoFullName.split('/');
          const fetchedBranches = await listBranches({ owner, repo, token: github.token });
          setBranches(fetchedBranches);
          setSelectedBranch(fetchedBranches[0] || ''); // Select the first branch by default
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch branches.');
        } finally {
          setLoading(false);
        }
      };
      fetchBranches();
    } else {
      setBranches([]);
      setSelectedBranch('');
    }
  }, [selectedRepoFullName, github?.token]);

  // Effect to fetch markdown files when a branch is selected
  useEffect(() => {
    if (selectedRepoFullName && selectedBranch && github?.token) {
      const fetchMarkdownFiles = async () => {
        setLoading(true);
        setError(null);
        try {
          const [owner, repo] = selectedRepoFullName.split('/');
          const fetchedFiles = await listMarkdownFilesInDirectory({
            owner,
            repo,
            path: '', // Search root for now, can be extended later
            branch: selectedBranch,
            token: github.token
          });
          setMarkdownFiles(fetchedFiles);
          setSelectedMarkdownFile(fetchedFiles[0] || ''); // Select the first markdown file by default
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch markdown files.');
        } finally {
          setLoading(false);
        }
      };
      fetchMarkdownFiles();
    } else {
      setMarkdownFiles([]);
      setSelectedMarkdownFile('');
    }
  }, [selectedRepoFullName, selectedBranch, github?.token]);

  const handleGitHubLinked = () => {
    setConnectionStep('choose_repo_action');
  };

  const handleRepositorySelectedInternal = (config: RepositoryConfig) => {
    onRepositorySelected(config);
    onClose();
  };

  const handleCreateRepository = async () => {
    if (!newRepoName || !selectedOwner || !github?.token) {
      setError('Repository name and owner are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newRepo = await createRepository({
        owner: selectedOwner,
        repo: newRepoName,
        token: github.token,
        isPrivate: false // Assuming public for now, can add option later
      });

      // Create publish and draft branches
      const defaultBranchSha = newRepo.default_branch; // Assuming default branch exists
      const draftBranch = `draft-${user?.login || 'default'}`;

      await Promise.all([
        createBranch({
          owner: selectedOwner,
          repo: newRepo.name,
          branch: 'publish',
          sha: defaultBranchSha,
          token: github.token
        }),
        createBranch({
          owner: selectedOwner,
          repo: newRepo.name,
          branch: draftBranch,
          sha: defaultBranchSha,
          token: github.token
        })
      ]);

      // Create repository structure
      await createRepositoryStructure({
        owner: selectedOwner,
        repo: newRepo.name,
        branch: draftBranch,
        token: github.token,
        manuscriptTitle: newRepoName // Use new repo name as manuscript title
      });

      handleRepositorySelectedInternal({
        mode: 'new', // Added mode
        owner: selectedOwner,
        repo: newRepo.name,
        branch: draftBranch, // Use draft branch for new repo
        markdownFile: `draft/${newRepoName}/pubcraft-manuscript.md` // Default markdown file name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository or branches.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSync = () => {
    setConnectionStep('initial');
    onClose();
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.full_name.toLowerCase().includes(repoSearchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Github className="h-5 w-5 mr-2" />
            {isGitHubLinked ? 'Configure GitHub Repository' : 'Connect GitHub to Continue'}
          </DialogTitle>
          <DialogDescription>
            {isGitHubLinked ? 'Select an existing repository or create a new one for your manuscript.' : 'Connect your GitHub account to enable saving and version control.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!isGitHubLinked ? (
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelSync}
                className="w-full"
              >
                Cancel Syncing
              </Button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Privacy:</strong> We only request the minimum permissions needed
                to create repositories and manage your manuscript files. You can revoke
                access anytime from your GitHub settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {connectionStep === 'choose_repo_action' && (
              <div className="flex flex-col space-y-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setConnectionStep('select_existing_repo')}
                  disabled={loading}
                >
                  Use Existing Repository
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setConnectionStep('create_new_repo')}
                  disabled={loading}
                >
                  Create New Repository
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSync}
                  className="w-full"
                >
                  Cancel Syncing
                </Button>
              </div>
            )}

            {connectionStep === 'select_existing_repo' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading repositories...</span>
                  </div>
                ) : (
                  <>
                    <RepositorySelector
                      repositories={repositories}
                      filteredRepositories={filteredRepositories}
                      repoSearchTerm={repoSearchTerm}
                      onSearchChange={setRepoSearchTerm}
                      onRepositorySelect={setSelectedRepoFullName}
                      loading={loading}
                    />
                    {selectedRepoFullName && (
                      <>
                        <BranchSelector
                          branches={branches}
                          selectedBranch={selectedBranch}
                          onBranchSelect={setSelectedBranch}
                          loading={loading}
                        />
                        {selectedBranch && (
                          <FileSelector
                            markdownFiles={markdownFiles}
                            selectedFile={selectedMarkdownFile}
                            onFileSelect={setSelectedMarkdownFile}
                            loading={loading}
                          />
                        )}
                      </>
                    )}
                    <Button
                      onClick={async () => {
                        setLoading(true);
                        setError(null);
                        try {
                          if (selectedRepoFullName && selectedBranch && selectedMarkdownFile) {
                            const [owner, repo] = selectedRepoFullName.split('/');
                            const draftBranch = `draft-${user?.login || 'default'}`;

                            // Create publish and draft branches if they don't exist
                            const existingBranches = await listBranches({ owner, repo, token: github.token });
                            const selectedRepo = repositories.find(r => r.full_name === selectedRepoFullName);
                            const defaultBranchSha = selectedRepo?.default_branch;

                            if (!existingBranches.includes('publish')) {
                              if (!defaultBranchSha) {
                                throw new Error(`Default branch for selected repository ${selectedRepoFullName} not found.`);
                              }

                              await Promise.all([
                                createBranch({
                                  owner,
                                  repo,
                                  branch: 'publish',
                                  sha: defaultBranchSha,
                                  token: github.token
                                }),
                                createBranch({
                                  owner,
                                  repo,
                                  branch: draftBranch,
                                  sha: defaultBranchSha,
                                  token: github.token
                                })
                              ]);

                              // Create repository structure if branches were just created
                              await createRepositoryStructure({
                                owner,
                                repo,
                                branch: draftBranch,
                                token: github.token,
                                manuscriptTitle: selectedRepoFullName.split('/')[1] // Use repo name as manuscript title
                              });
                            }

                            handleRepositorySelectedInternal({
                              mode: 'existing',
                              owner,
                              repo,
                              branch: draftBranch, // Use draft branch for existing repo
                              markdownFile: selectedMarkdownFile
                            });
                          } else {
                            setError('Please select a repository, branch, and markdown file.');
                          }
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to create branches or repository structure.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={!selectedRepoFullName || !selectedBranch || !selectedMarkdownFile || loading}
                      className="w-full"
                    >
                      Select Repository
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectionStep('choose_repo_action')}
                  className="w-full"
                  disabled={loading}
                >
                  Select a different repository
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSync}
                  className="w-full"
                  disabled={loading}
                >
                  Cancel Syncing
                </Button>
              </div>
            )}

            {connectionStep === 'create_new_repo' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading organizations...</span>
                  </div>
                ) : (
                  <NewRepositoryForm
                    organizations={organizations}
                    selectedOwner={selectedOwner}
                    newRepoName={newRepoName}
                    onOwnerChange={setSelectedOwner}
                    onRepoNameChange={setNewRepoName}
                    loading={loading}
                  />
                )}
                <Button
                  onClick={handleCreateRepository}
                  disabled={!newRepoName || !selectedOwner || loading}
                  className="w-full"
                >
                  Create Repository
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectionStep('choose_repo_action')}
                  className="w-full"
                  disabled={loading}
                >
                  Select a different option
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSync}
                  className="w-full"
                  disabled={loading}
                >
                  Cancel Syncing
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubConnectionModal;
