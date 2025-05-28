
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface FileSelectorProps {
  markdownFiles: string[];
  selectedFile: string;
  onFileSelect: (file: string) => void;
  loading: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  markdownFiles,
  selectedFile,
  onFileSelect,
  loading
}) => {
  return (
    <div>
      <Label htmlFor="file">Markdown File</Label>
      <Select onValueChange={onFileSelect} disabled={loading} value={selectedFile}>
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
  );
};

export default FileSelector;
