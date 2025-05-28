
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Organization {
  login: string;
  avatar_url: string;
}

interface NewRepositoryFormProps {
  organizations: Organization[];
  selectedOwner: string;
  newRepoName: string;
  onOwnerChange: (owner: string) => void;
  onRepoNameChange: (name: string) => void;
  loading: boolean;
}

const NewRepositoryForm: React.FC<NewRepositoryFormProps> = ({
  organizations,
  selectedOwner,
  newRepoName,
  onOwnerChange,
  onRepoNameChange,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="owner">Repository Owner/Organization</Label>
        <Select onValueChange={onOwnerChange} disabled={loading} value={selectedOwner}>
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
          onChange={(e) => onRepoNameChange(e.target.value)}
          placeholder="e.g., my-manuscript"
        />
      </div>
    </div>
  );
};

export default NewRepositoryForm;
