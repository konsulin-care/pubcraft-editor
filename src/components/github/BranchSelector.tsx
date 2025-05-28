
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BranchSelectorProps {
  branches: string[];
  selectedBranch: string;
  onBranchSelect: (branch: string) => void;
  loading: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onBranchSelect,
  loading
}) => {
  return (
    <div>
      <Label htmlFor="branch">Branch</Label>
      <Select onValueChange={onBranchSelect} disabled={loading} value={selectedBranch}>
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
  );
};

export default BranchSelector;
