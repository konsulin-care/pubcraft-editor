import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, BookOpen, Code, FileReference } from 'lucide-react';
import * as yaml from 'js-yaml';
import { ExtendedMetadata, Reference } from '@/types/metadata';
import BibliographyManager from '@/components/BibliographyManager';

interface MetadataEditorProps {
  metadata: ExtendedMetadata;
  onChange: (metadata: ExtendedMetadata) => void;
  references?: Reference[];
  onReferencesChange?: (references: Reference[]) => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ 
  metadata, 
  onChange, 
  references = [],
  onReferencesChange 
}) => {
  const [showYamlView, setShowYamlView] = useState(false);
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState('');
  const [hasUserModifiedYaml, setHasUserModifiedYaml] = useState(false);

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
    } catch (error) {
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

  // Initialize YAML with default template if metadata is empty
  useEffect(() => {
    if (!hasUserModifiedYaml && (!metadata.title || metadata.title === 'The title of the manuscript')) {
      setYamlText(generateDefaultYaml());
    }
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
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
      
      <CardContent className="flex-1 min-h-0 p-4">
        {onReferencesChange ? (
          <Tabs defaultValue="metadata" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metadata" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-full pr-4">
                {showYamlView ? (
                  <div className="space-y-2">
                    <Label>Extended YAML Metadata</Label>
                    <Textarea
                      value={yamlText}
                      onChange={(e) => handleYamlChange(e.target.value)}
                      className="min-h-[400px] font-mono text-sm resize-none"
                      placeholder={generateDefaultYaml()}
                    />
                    {yamlError && (
                      <p className="text-sm text-red-600">{yamlError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
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

                    {metadata.subtitle !== undefined && (
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={metadata.subtitle || ''}
                          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                          placeholder="Enter subtitle..."
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="author" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Author
                      </Label>
                      <Input
                        id="author"
                        value={getAuthorString()}
                        onChange={(e) => handleFieldChange('author', e.target.value)}
                        placeholder="Enter author name..."
                      />
                      <p className="text-xs text-gray-500">
                        Use YAML view for advanced author metadata with affiliations
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="abstract">Abstract</Label>
                      <Textarea
                        id="abstract"
                        value={metadata.abstract}
                        onChange={(e) => handleFieldChange('abstract', e.target.value)}
                        placeholder="Enter article abstract..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    {metadata.keywords && (
                      <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                          id="keywords"
                          value={metadata.keywords.join(', ')}
                          onChange={(e) => handleFieldChange('keywords', e.target.value.split(', ').filter(k => k.trim()))}
                          placeholder="Enter keywords separated by commas..."
                        />
                      </div>
                    )}

                    {metadata.funding && (
                      <div className="space-y-2">
                        <Label htmlFor="funding">Funding</Label>
                        <Textarea
                          id="funding"
                          value={metadata.funding}
                          onChange={(e) => handleFieldChange('funding', e.target.value)}
                          placeholder="Enter funding information..."
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="references" className="flex-1 min-h-0 mt-4">
              <BibliographyManager
                references={references}
                onChange={onReferencesChange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-full pr-4">
            {showYamlView ? (
              <div className="space-y-2">
                <Label>Extended YAML Metadata</Label>
                <Textarea
                  value={yamlText}
                  onChange={(e) => handleYamlChange(e.target.value)}
                  className="min-h-[400px] font-mono text-sm resize-none"
                  placeholder={generateDefaultYaml()}
                />
                {yamlError && (
                  <p className="text-sm text-red-600">{yamlError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
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

                {metadata.subtitle !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={metadata.subtitle || ''}
                      onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                      placeholder="Enter subtitle..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="author" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={getAuthorString()}
                    onChange={(e) => handleFieldChange('author', e.target.value)}
                    placeholder="Enter author name..."
                  />
                  <p className="text-xs text-gray-500">
                    Use YAML view for advanced author metadata with affiliations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    value={metadata.abstract}
                    onChange={(e) => handleFieldChange('abstract', e.target.value)}
                    placeholder="Enter article abstract..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {metadata.keywords && (
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={metadata.keywords.join(', ')}
                      onChange={(e) => handleFieldChange('keywords', e.target.value.split(', ').filter(k => k.trim()))}
                      placeholder="Enter keywords separated by commas..."
                    />
                  </div>
                )}

                {metadata.funding && (
                  <div className="space-y-2">
                    <Label htmlFor="funding">Funding</Label>
                    <Textarea
                      id="funding"
                      value={metadata.funding}
                      onChange={(e) => handleFieldChange('funding', e.target.value)}
                      placeholder="Enter funding information..."
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MetadataEditor;
