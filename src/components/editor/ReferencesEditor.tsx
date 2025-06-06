
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Code, Save } from 'lucide-react';
import { Reference } from '@/types/metadata';
import BibliographyManager from '@/components/BibliographyManager';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGitHubPersistence } from '@/hooks/useGitHubPersistence';
import { saveFileToGitHub } from '@/utils/github/fileOperations';

interface ReferencesEditorProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
  onSave?: () => void;
}

const ReferencesEditor: React.FC<ReferencesEditorProps> = ({
  references,
  onChange,
  onSave
}) => {
  const [showBibView, setShowBibView] = useState(false);
  const [bibText, setBibText] = useState('');
  const [bibError, setBibError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, github } = useAuth();
  const { connection } = useGitHubPersistence();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to GitHub if connected
      if (github?.token && connection && user?.name) {
        const firstName = user.name.split(' ')[0];
        const branch = `draft-${firstName.toLowerCase()}`;
        const path = `draft/${connection.markdownFile}/pubcraft-reference.bib`;
        const content = showBibView ? bibText : generateBibText();

        await saveFileToGitHub({
          owner: connection.owner,
          repo: connection.repo,
          path,
          content,
          message: 'Update references',
          branch,
          token: github.token
        });

        toast({
          title: "References Saved",
          description: "Synced to GitHub successfully",
        });
      } else {
        toast({
          title: "References Saved",
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
        description: error instanceof Error ? error.message : "Failed to save references",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateBibText = () => {
    return references.map(ref => {
      const bibEntry = `@${ref.type}{${ref.id},
  title={${ref.title}},
  author={${ref.author}},
  year={${ref.year}}`;
      
      const additionalFields = [];
      if (ref.journal) additionalFields.push(`  journal={${ref.journal}}`);
      if (ref.volume) additionalFields.push(`  volume={${ref.volume}}`);
      if (ref.pages) additionalFields.push(`  pages={${ref.pages}}`);
      if (ref.doi) additionalFields.push(`  doi={${ref.doi}}`);
      if (ref.url) additionalFields.push(`  url={${ref.url}}`);
      
      return bibEntry + (additionalFields.length > 0 ? ',\n' + additionalFields.join(',\n') : '') + '\n}';
    }).join('\n\n');
  };

  const toggleBibView = () => {
    if (!showBibView) {
      setBibText(generateBibText());
      setBibError('');
    } else {
      // Parse BibTeX back to references if needed
      // For now, just toggle back to form view
    }
    setShowBibView(!showBibView);
  };

  const handleBibChange = (value: string) => {
    setBibText(value);
    // Basic validation - could be enhanced
    try {
      setBibError('');
    } catch (error) {
      setBibError('Invalid BibTeX format');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [references, bibText, showBibView, github, connection, user]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="h-5 w-5 mr-2" />
            References
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBibView}
            >
              <Code className="h-4 w-4 mr-2" />
              {showBibView ? 'Form View' : 'BibTeX View'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save (⌘S)'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full pr-4">
          {showBibView ? (
            <div className="space-y-2">
              <Label>BibTeX References</Label>
              <Textarea
                value={bibText}
                onChange={(e) => handleBibChange(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none"
                placeholder="@article{example2024,
  title={Example Article},
  author={Author Name},
  year={2024},
  journal={Example Journal},
  volume={1},
  pages={1-10}
}"
              />
              {bibError && (
                <p className="text-sm text-red-600">{bibError}</p>
              )}
            </div>
          ) : (
            <BibliographyManager
              references={references}
              onChange={onChange}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReferencesEditor;
