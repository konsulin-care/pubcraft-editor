
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface Repository {
  name: string;
  full_name: string;
  private: boolean;
}

interface RepositorySelectorProps {
  repositories: Repository[];
  filteredRepositories: Repository[];
  repoSearchTerm: string;
  onSearchChange: (term: string) => void;
  onRepositorySelect: (repoName: string) => void;
  loading: boolean;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  filteredRepositories,
  repoSearchTerm,
  onSearchChange,
  onRepositorySelect,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="repo-search">Search Repository</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            id="repo-search"
            placeholder="Type to search repositories..."
            value={repoSearchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="repository">Repository</Label>
        <Select onValueChange={onRepositorySelect} disabled={loading}>
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
    </div>
  );
};

export default RepositorySelector;
