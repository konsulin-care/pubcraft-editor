
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateRepository, listRepositories, listBranches, listRepositoryFiles, listUserOrganizations } from '@/utils/github';
import { Folder, GitBranch, FileText, Search } from 'lucide-react';

interface Repository {
  name: string;
  full_name: string;
  private: boolean;
}

interface Organization {
  login: string;
  avatar_url: string;
}

interface GitHubRepositorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositorySelected: (config: RepositoryConfig) => void;
}

export interface RepositoryConfig {
  mode: 'existing' | 'new';
  owner: string;
  repo: string;
  branch?: string;
  markdownFile?: string;
  existingStructure?: boolean;
}

const GitHubRepositorySelector: React.FC<GitHubRepositorySelectorProps> = ({
  isOpen,
  onClose,
  onRepositorySelected
}) => {
  const { github, user } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [markdownFiles, setMarkdownFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [repoSearchTerm, setRepoSearchTerm] = useState('');

  // Load repositories and organizations on mount
  useEffect(() => {
    if (isOpen && github?.token) {
      loadInitialData();
    }
  }, [isOpen, github?.token]);

  // Filter repositories based on search term
  useEffect(() => {
    if (repoSearchTerm) {
      setFilteredRepositories(
        repositories.filter(repo => 
          repo.name.toLowerCase().includes(repoSearchTerm.toLowerCase()) ||
          repo.full_name.toLowerCase().includes(repoSearchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredRepositories(repositories);
    }
  }, [repositories, repoSearchTerm]);

  const loadInitialData = async () => {
    if (!github?.token) return;
    
    setLoading(true);
    try {
      // Load repositories and organizations in parallel
      const [repos, orgs] = await Promise.all([
        listRepositories(github.token),
        listUserOrganizations(github.token)
      ]);
      
      setRepositories(repos);
      setFilteredRepositories(repos);
      setOrganizations([
        // Add user as first option
        { login: user?.login || '', avatar_url: user?.avatar_url || '' },
        ...orgs
      ]);
      
      // Set default owner to current user
      setSelectedOwner(user?.login || '');
    } catch (error) {
      toast({
        title: "Failed to load data",
        description: "Could not fetch your GitHub repositories and organizations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (repo: Repository) => {
    if (!github?.token) return;
    
    setLoading(true);
    try {
      const branchList = await listBranches({
        owner: repo.full_name.split('/')[0],
        repo: repo.name,
        token: github.token
      });
      setBranches(branchList);
      
      // If no branches, this is an empty repo
      if (branchList.length === 0) {
        setSelectedBranch('main'); // We'll create this
        setMarkdownFiles([]);
      }
    } catch (error) {
      toast({
        title: "Failed to load branches",
        description: "Could not fetch repository branches.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMarkdownFiles = async (repo: Repository, branch: string) => {
    if (!github?.token) return;
    
    setLoading(true);
    try {
      const files = await listRepositoryFiles({
        owner: repo.full_name.split('/')[0],
        repo: repo.name,
        branch,
        token: github.token
      });
      
      const mdFiles = files.filter(file => file.endsWith('.md'));
      setMarkdownFiles(mdFiles);
      
      // If no markdown files, we'll create the structure
      if (mdFiles.length === 0) {
        setSelectedFile('pubcraft-manuscript.md'); // We'll create this
      }
    } catch (error) {
      toast({
        title: "Failed to load files",
        description: "Could not fetch repository files.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRepositorySelect = (repoName: string) => {
    const repo = repositories.find(r => r.full_name === repoName);
    if (repo) {
      setSelectedRepo(repo);
      setSelectedBranch('');
      setSelectedFile('');
      setBranches([]);
      setMarkdownFiles([]);
      loadBranches(repo);
    }
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    setSelectedFile('');
    setMarkdownFiles([]);
    if (selectedRepo) {
      loadMarkdownFiles(selectedRepo, branch);
    }
  };

  const handleProceed = () => {
    if (mode === 'existing') {
      if (!selectedRepo || !selectedBranch) {
        toast({
          title: "Missing selection",
          description: "Please select a repository and branch.",
          variant: "destructive"
        });
        return;
      }

      // If no markdown file selected, we'll create the structure
      const markdownFile = selectedFile || 'pubcraft-manuscript.md';

      onRepositorySelected({
        mode: 'existing',
        owner: selectedRepo.full_name.split('/')[0],
        repo: selectedRepo.name,
        branch: selectedBranch,
        markdownFile: markdownFile,
        existingStructure: markdownFiles.length === 0
      });
    } else {
      if (!selectedOwner || !newRepoName) {
        toast({
          title: "Missing information",
          description: "Please select an owner and provide repository name.",
          variant: "destructive"
        });
        return;
      }

      onRepositorySelected({
        mode: 'new',
        owner: selectedOwner,
        repo: newRepoName
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to GitHub Repository</DialogTitle>
          <DialogDescription>
            Choose how you want to sync your manuscript with GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${mode === 'existing' ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => setMode('existing')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  Use Existing Repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  Select an existing repository and markdown file to edit.
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${mode === 'new' ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => setMode('new')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create New Repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  Create a new repository with your current manuscript.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Existing Repository Flow */}
          {mode === 'existing' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="repo-search">Search Repository</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="repo-search"
                    placeholder="Type to search repositories..."
                    value={repoSearchTerm}
                    onChange={(e) => setRepoSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="repository">Repository</Label>
                <Select onValueChange={handleRepositorySelect} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredRepositories.map((repo) => (
                      <SelectItem key={repo.full_name} value={repo.full_name}>
                        <div className="flex items-center">
                          <span>{repo.full_name}</span>
                          {repo.private && <span className="ml-2 text-xs bg-gray-200 px-1 rounded">Private</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRepo && (
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select onValueChange={handleBranchSelect} disabled={loading} value={selectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder={branches.length === 0 ? "Empty repository - will create main branch" : "Select a branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedBranch && (
                <div>
                  <Label htmlFor="file">Markdown File</Label>
                  <Select onValueChange={setSelectedFile} disabled={loading} value={selectedFile}>
                    <SelectTrigger>
                      <SelectValue placeholder={markdownFiles.length === 0 ? "Will create pubcraft-manuscript.md" : "Select a markdown file"} />
                    </SelectTrigger>
                    <SelectContent>
                      {markdownFiles.map((file) => (
                        <SelectItem key={file} value={file}>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {file}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* New Repository Flow */}
          {mode === 'new' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="owner">Repository Owner/Organization</Label>
                <Select onValueChange={setSelectedOwner} disabled={loading} value={selectedOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner/organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.login} value={org.login}>
                        <div className="flex items-center">
                          {org.avatar_url && (
                            <img 
                              src={org.avatar_url} 
                              alt={org.login} 
                              className="w-4 h-4 rounded-full mr-2"
                            />
                          )}
                          <span>{org.login}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Repository Name</Label>
                <Input
                  id="name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="e.g., my-manuscript"
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What will be created:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code>publish</code> branch - Main branch for finalized content</li>
              <li>• <code>draft-{'{firstname}'}</code> branch - Your working branch</li>
              <li>• Structured directory: <code>draft/title-of-manuscript/</code></li>
              <li>• Files: <code>pubcraft-manuscript.md</code> and <code>pubcraft-reference.bib</code></li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleProceed} disabled={loading}>
              {loading ? 'Loading...' : 'Connect Repository'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubRepositorySelector;
