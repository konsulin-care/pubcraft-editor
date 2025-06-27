import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { FileText, User, BookOpen, Code, PlusCircle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import * as yaml from 'js-yaml';
import { ExtendedMetadata, Reference, AuthorMetadata, AffiliationMetadata } from '@/types/metadata';

const roles: Option[] = [
  { label: "Conceptualization", value: "conceptualization" },
  { label: "Data curation", value: "data-curation" },
  { label: "Formal Analysis", value: "formal-analysis" },
  { label: "Funding acquisition", value: "funding-acquisition" },
  { label: "Investigation", value: "investigation" },
  { label: "Methodology", value: "methodology" },
  { label: "Project administration", value: "project-administration" },
  { label: "Resources", value: "resources" },
  { label: "Software", value: "software" },
  { label: "Supervision", value: "supervision" },
  { label: "Validation", value: "validation" },
  { label: "Visualization", value: "visualization" },
  { label: "Writing – original draft", value: "writing-original-draft" },
  { label: "Writing – review & editing", value: "writing-review-editing" },
];

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
  onReferencesChange,
}) => {
  const [showYamlView, setShowYamlView] = useState(false);
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState('');
  const [hasUserModifiedYaml, setHasUserModifiedYaml] = useState(false);
  const [authorRoles, setAuthorRoles] = useState<{ [key: number]: string[] }>({});

  const handleFieldChange = (field: keyof ExtendedMetadata, value: any) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  const handleAuthorChange = (index: number, field: keyof AuthorMetadata, value: any) => {
    let updatedAuthors = (Array.isArray(metadata.author) ? [...metadata.author] : []) as AuthorMetadata[];

    if (field === 'corresponding' && value === true) {
      // If this author is set to corresponding, uncheck others
      updatedAuthors = updatedAuthors.map((author, i) => ({
        ...author,
        corresponding: i === index ? true : false
      }));
    } else {
      updatedAuthors[index] = {
        ...updatedAuthors[index],
        [field]: value
      };
    }
    
    // Update local state for roles if needed
    if (field === 'roles') {
      setAuthorRoles(prev => ({
        ...prev,
        [index]: value
      }));
    }
    
    onChange({ ...metadata, author: updatedAuthors });
  };

  const addAuthor = () => {
    const updatedAuthors = (Array.isArray(metadata.author) ? [...metadata.author] : []) as AuthorMetadata[];
    const newAuthorIndex = updatedAuthors.length;
    
    // Initialize roles for new author
    setAuthorRoles(prev => ({
      ...prev,
      [newAuthorIndex]: []
    }));
    
    onChange({
      ...metadata,
      author: updatedAuthors ? [...updatedAuthors, { name: '', corresponding: false, email: '', affiliations: [], roles: [] }] : [{ name: '', corresponding: false, email: '', affiliations: [], roles: [] }]
    });
  };

  const removeAuthor = (index: number) => {
    const updatedAuthors = (Array.isArray(metadata.author) ? [...metadata.author] : []) as AuthorMetadata[];
    updatedAuthors.splice(index, 1);
    
    // Clean up roles state
    setAuthorRoles(prev => {
      const newRoles = { ...prev };
      delete newRoles[index];
      // Reindex remaining authors
      const reindexed: { [key: number]: string[] } = {};
      Object.keys(newRoles).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexed[keyNum - 1] = newRoles[keyNum];
        } else if (keyNum < index) {
          reindexed[keyNum] = newRoles[keyNum];
        }
      });
      return reindexed;
    });
    
    onChange({ ...metadata, author: updatedAuthors });
  };

  const handleAffiliationChange = (index: number, field: keyof AffiliationMetadata, value: any) => {
    const updatedAffiliations = (Array.isArray(metadata.affiliations) ? [...metadata.affiliations] : []) as AffiliationMetadata[];
    updatedAffiliations[index] = {
      ...updatedAffiliations[index],
      [field]: value
    };
    onChange({ ...metadata, affiliations: updatedAffiliations });
  };

  const addAffiliation = () => {
    const updatedAffiliations = (Array.isArray(metadata.affiliations) ? [...metadata.affiliations] : []) as AffiliationMetadata[];
    // Generate the next sequential ID based on the current length
    const newId = (updatedAffiliations.length + 1).toString();
    onChange({
      ...metadata,
      affiliations: [...updatedAffiliations, { id: newId, name: '', city: '', country: '' }]
    });
  };

  const removeAffiliation = (index: number) => {
    const updatedAffiliations = (Array.isArray(metadata.affiliations) ? [...metadata.affiliations] : []) as AffiliationMetadata[];
    const removedAffiliationId = updatedAffiliations[index]?.id;
    
    // Create a mapping from old IDs to new IDs before modifying the array
    const oldToNewIdMapping: { [oldId: string]: string } = {};
    updatedAffiliations.forEach((affiliation, currentIndex) => {
      if (currentIndex < index) {
        // Affiliations before the removed one keep their current ID
        oldToNewIdMapping[affiliation.id] = (currentIndex + 1).toString();
      } else if (currentIndex > index) {
        // Affiliations after the removed one get shifted down by 1
        oldToNewIdMapping[affiliation.id] = currentIndex.toString();
      }
      // The removed affiliation (at index) is not included in the mapping
    });
    
    // Remove the affiliation at the specified index
    updatedAffiliations.splice(index, 1);
    
    // Reorder affiliation IDs to be sequential
    const reorderedAffiliations = updatedAffiliations.map((affiliation, newIndex) => ({
      ...affiliation,
      id: (newIndex + 1).toString()
    }));
    
    // Update author affiliations to reflect the new IDs
    let updatedAuthors = (Array.isArray(metadata.author) ? [...metadata.author] : []) as AuthorMetadata[];
    if (removedAffiliationId) {
      updatedAuthors = updatedAuthors.map(author => ({
        ...author,
        affiliations: author.affiliations?.filter(aff => aff.ref !== removedAffiliationId).map(aff => {
          // Update references to reflect new sequential IDs using the mapping
          const newId = oldToNewIdMapping[aff.ref];
          if (newId) {
            return { ...aff, ref: newId };
          }
          return aff;
        }) || []
      }));
    }
    
    onChange({
      ...metadata,
      affiliations: reorderedAffiliations,
      author: updatedAuthors
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

  // Initialize author roles from metadata when component mounts or metadata changes
  useEffect(() => {
    if (Array.isArray(metadata.author)) {
      const initialRoles: { [key: number]: string[] } = {};
      metadata.author.forEach((author, index) => {
        initialRoles[index] = author.roles || [];
      });
      setAuthorRoles(initialRoles);
    }
  }, [metadata.author]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Metadata Editor</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleYamlView}
              >
                <Code className="h-4 w-4 mr-2" />
                {showYamlView ? 'Form View' : 'YAML View'}
              </Button>
            </div>

            {showYamlView ? (
              <div className="space-y-2">
                <Label htmlFor="yaml-editor">YAML Header</Label>
                <Textarea
                  id="yaml-editor"
                  value={yamlText}
                  onChange={(e) => handleYamlChange(e.target.value)}
                  className="min-h-[500px] font-mono text-sm resize-none"
                  placeholder={generateDefaultYaml()}
                />
                {yamlError && (
                  <p className="text-sm text-red-600">{yamlError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={metadata.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={metadata.subtitle || ''}
                    onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    value={metadata.abstract || ''}
                    onChange={(e) => handleFieldChange('abstract', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Author(s)</Label>
                    <Button variant="outline" size="sm" onClick={addAuthor}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Author
                    </Button>
                  </div>
                  {(Array.isArray(metadata.author) ? metadata.author : []).map((author, index) => {
                    const selectedRoles = authorRoles[index] || author.roles || [];

                    return (
                      <div key={index} className="border p-4 rounded-md mb-4 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeAuthor(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`author-name-${index}`}>Name</Label>
                            <Input
                              id={`author-name-${index}`}
                              value={author.name || ''}
                              onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`author-email-${index}`}>Email</Label>
                            <Input
                              id={`author-email-${index}`}
                              value={author.email || ''}
                              onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`author-corresponding-${index}`}
                              checked={author.corresponding || false}
                              onCheckedChange={(checked) => handleAuthorChange(index, 'corresponding', checked)}
                            />
                            <Label htmlFor={`author-corresponding-${index}`}>Corresponding author</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`author-affiliations-${index}`}>Affiliations</Label>
                            <MultiSelect
                              options={(Array.isArray(metadata.affiliations) ? metadata.affiliations : []).map(aff => ({
                                label: aff.name || '',
                                value: aff.id || ''
                              }))}
                              selected={author.affiliations?.map(aff => aff.ref) || []}
                              onChange={(selectedIds) => {
                                const selectedAffiliations = selectedIds.map(id => ({ ref: id }));
                                handleAuthorChange(index, 'affiliations', selectedAffiliations);
                              }}
                              placeholder="Select affiliations..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`author-roles-${index}`}>Roles</Label>
                            <MultiSelect
                              options={roles}
                              selected={selectedRoles}
                              onChange={(newRoles) => {
                                handleAuthorChange(index, "roles", newRoles);
                              }}
                              placeholder="Select roles..."
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Affiliations</Label>
                    <Button variant="outline" size="sm" onClick={addAffiliation}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Affiliation
                    </Button>
                  </div>
                  {(Array.isArray(metadata.affiliations) ? metadata.affiliations : []).map((affiliation, index) => (
                    <div key={index} className="border p-4 rounded-md mb-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeAffiliation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="space-y-2">
                        {/* Hidden ID field */}
                        <Input type="hidden" id={`affiliation-id-${index}`} value={affiliation.id || ''} />
                        <div>
                          <Label htmlFor={`affiliation-name-${index}`}>Name</Label>
                          <Input
                            id={`affiliation-name-${index}`}
                            value={affiliation.name || ''}
                            onChange={(e) => handleAffiliationChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`affiliation-city-${index}`}>City</Label>
                          <Input
                            id={`affiliation-city-${index}`}
                            value={affiliation.city || ''}
                            onChange={(e) => handleAffiliationChange(index, 'city', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`affiliation-country-${index}`}>Country</Label>
                          <Input
                            id={`affiliation-country-${index}`}
                            value={affiliation.country || ''}
                            onChange={(e) => handleAffiliationChange(index, 'country', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="funding">Funding</Label>
                  <Input
                    id="funding"
                    value={metadata.funding || ''}
                    onChange={(e) => handleFieldChange('funding', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={(metadata.keywords || []).join(', ')}
                    onChange={(e) => handleFieldChange('keywords', e.target.value.split(',').map((k: string) => k.trim()))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Separate keywords with commas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MetadataEditor;
