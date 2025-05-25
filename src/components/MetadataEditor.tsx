
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, User, BookOpen, Code } from 'lucide-react';
import * as yaml from 'js-yaml';

interface Metadata {
  title: string;
  author: string;
  abstract: string;
}

interface MetadataEditorProps {
  metadata: Metadata;
  onChange: (metadata: Metadata) => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ metadata, onChange }) => {
  const [showYamlView, setShowYamlView] = useState(false);
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState('');

  const handleFieldChange = (field: keyof Metadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  const toggleYamlView = () => {
    if (!showYamlView) {
      // Convert current metadata to YAML
      try {
        const yamlString = yaml.dump(metadata, { indent: 2 });
        setYamlText(yamlString);
        setYamlError('');
      } catch (error) {
        setYamlError('Error converting to YAML');
      }
    } else {
      // Parse YAML back to metadata
      try {
        const parsed = yaml.load(yamlText) as Metadata;
        if (parsed && typeof parsed === 'object') {
          onChange({
            title: parsed.title || '',
            author: parsed.author || '',
            abstract: parsed.abstract || ''
          });
        }
        setYamlError('');
      } catch (error) {
        setYamlError('Invalid YAML syntax');
        return; // Don't toggle if there's an error
      }
    }
    setShowYamlView(!showYamlView);
  };

  const handleYamlChange = (value: string) => {
    setYamlText(value);
    try {
      yaml.load(value);
      setYamlError('');
    } catch (error) {
      setYamlError('Invalid YAML syntax');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <FileText className="h-5 w-5 mr-2" />
            Article Metadata
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleYamlView}
          >
            <Code className="h-4 w-4 mr-2" />
            {showYamlView ? 'Form View' : 'YAML View'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showYamlView ? (
          <div className="space-y-2">
            <Label>Raw YAML</Label>
            <Textarea
              value={yamlText}
              onChange={(e) => handleYamlChange(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="title: Your Article Title&#10;author: Your Name&#10;abstract: Your abstract here..."
            />
            {yamlError && (
              <p className="text-sm text-red-600">{yamlError}</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Title
              </Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter article title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Author
              </Label>
              <Input
                id="author"
                value={metadata.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                placeholder="Enter author name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                value={metadata.abstract}
                onChange={(e) => handleFieldChange('abstract', e.target.value)}
                placeholder="Enter article abstract..."
                className="min-h-[200px] resize-none"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetadataEditor;
