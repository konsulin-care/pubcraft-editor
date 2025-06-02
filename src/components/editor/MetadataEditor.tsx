import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, BookOpen, Code, Save } from 'lucide-react';
import * as yaml from 'js-yaml';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGitHubPersistence } from '@/hooks/useGitHubPersistence';
import { saveFileToGitHub, generateMetadataYaml } from '@/utils/github/fileOperations';

interface MetadataEditorProps {
  metadata: ExtendedMetadata;
  onChange: (metadata: ExtendedMetadata) => void;
  references?: Reference[];
  onReferencesChange?: (references: Reference[]) => void;
  onSave?: () => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ 
  metadata, 
  onChange, 
  references = [],
  onReferencesChange,
  onSave
}) => {
  const [showYamlView, setShowYamlView] = useState(false);
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState('');
  const [hasUserModifiedYaml, setHasUserModifiedYaml] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, github } = useAuth();
  const { connection } = useGitHubPersistence();

  const handleFieldChange = (field: keyof ExtendedMetadata, value: any) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  const generateDefaultYaml = () => {
    const defaultMetadata = {
      title: 'The title of the manuscript',
      author: [{
        name: 'User Name',
        corresponding: true,
        email: 'user.email@mail.com',
        affiliations: [{ ref: '1' }],
        roles: ['conceptualization', 'methodology', 'analysis', 'visualization', 'writing']
      }],
      abstract: 'This is an abstract',
      funding: 'The author(s) received no specific funding for this work.',
      keywords: ['Keyword 1', 'Keyword 2'],
      affiliations: [{
        id: '1',
        name: 'University of Somewhere',
        city: 'Somewhere',
        country: 'Someland'
      }]
    };
    return yaml.dump(defaultMetadata, { indent: 2 });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (github?.token && connection && user?.name) {
        const firstName = user.name.split(' ')[0];
        const branch = `draft-${firstName.toLowerCase()}`;
        const path = `draft/${connection.markdownFile}/metadata.yml`;
        const content = generateMetadataYaml(metadata);

        await saveFileToGitHub({
          owner: connection.owner,
          repo: connection.repo,
          path,
          content,
          message: 'Update metadata',
          branch,
          token: github.token
        });

        toast({
          title: "Metadata Saved",
          description: "Synced to GitHub successfully",
        });
      } else {
        toast({
          title: "Metadata Saved",
          description: `Saved locally at ${new Date().toLocaleTimeString()}`,
        });
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save metadata",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [metadata, github, connection, user]);

  const toggleYamlView = () => {
    if (!showYamlView) {
      try {
        const yamlString = hasUserModifiedYaml ? yamlText : yaml.dump(metadata, { indent: 2 });
        setYamlText(yamlString);
        setYamlError('');
      } catch (error) {
        setYamlError('Error converting to YAML');
      }
    } else {
      try {
        const parsed = yaml.load(yamlText) as ExtendedMetadata;
        if (parsed && typeof parsed === 'object') {
          const processedMetadata: ExtendedMetadata = {
            title: parsed.title || '',
            author: parsed.author || '',
            abstract: parsed.abstract || '',
            subtitle: parsed.subtitle,
            funding: parsed.funding,
            keywords: parsed.keywords,
            affiliations: parsed.affiliations
          };
          onChange(processedMetadata);
          setHasUserModifiedYaml(true);
        }
        setYamlError('');
      } catch (error) {
        setYamlError('Invalid YAML syntax');
        return;
      }
    }
    setShowYamlView(!showYamlView);
  };

  const handleYamlChange = (value: string) => {
    setYamlText(value);
    setHasUserModifiedYaml(true);
    try {
      yaml.load(value);
      setYamlError('');
    } catch {
      setYamlError('Invalid YAML syntax');
    }
  };

  const getAuthorString = () => {
    if (typeof metadata.author === 'string') {
      return metadata.author;
    }
    return Array.isArray(metadata.author) 
      ? metadata.author.map(a => a.name).join(', ')
      : '';
  };

  // UI rendering logic omitted here (identical to your working version)...

  return (
    <Card className="h-full flex flex-col">
      {/* The rest of the JSX rendering logic remains as-is (already complete and structured properly) */}
    </Card>
  );
};

export default MetadataEditor;
