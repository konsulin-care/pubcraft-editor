import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Code, Upload, PlusCircle } from 'lucide-react';
import { Reference } from '@/types/metadata';
import BibliographyManager from '@/components/BibliographyManager';
import { parseBibEntry, parseBibTeX } from '@/utils/bibliography'; // Import parseBibTeX

interface ReferencesEditorProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

const ReferencesEditor: React.FC<ReferencesEditorProps> = ({
  references,
  onChange,
}) => {
  const [showBibView, setShowBibView] = useState(false);
  const [bibText, setBibText] = useState('');
  const [bibError, setBibError] = useState('');

  // Effect to sync references to bibText when references change (Form View -> BibTeX View)
  useEffect(() => {
    try {
      const generatedBib = generateBibText(references);
      if (generatedBib !== bibText) {
        setBibText(generatedBib);
        setBibError('');
      }
    } catch (error) {
      setBibError('Error generating BibTeX from references');
      console.error('Error generating BibTeX:', error);
    }
  }, [references]); // Only re-run if references change

  const generateBibText = (refs: Reference[]) => {
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
      if (ref.publisher) additionalFields.push(`  publisher={${ref.publisher}}`);
      if (ref.booktitle) additionalFields.push(`  booktitle={${ref.booktitle}}`);
      if (ref.editor) additionalFields.push(`  editor={${ref.editor}}`);
      if (ref.series) additionalFields.push(`  series={${ref.series}}`);
      if (ref.address) additionalFields.push(`  address={${ref.address}}`);
      if (ref.month) additionalFields.push(`  month={${ref.month}}`);
      if (ref.note) additionalFields.push(`  note={${ref.note}}`);
      if (ref.organization) additionalFields.push(`  organization={${ref.organization}}`);
      if (ref.school) additionalFields.push(`  school={${ref.school}}`);
      if (ref.institution) additionalFields.push(`  institution={${ref.institution}}`);
      if (ref.chapter) additionalFields.push(`  chapter={${ref.chapter}}`);
      if (ref.edition) additionalFields.push(`  edition={${ref.edition}}`);
      if (ref.howpublished) additionalFields.push(`  howpublished={${ref.howpublished}}`);
      
      return bibEntry + (additionalFields.length > 0 ? ',\n' + additionalFields.join(',\n') : '') + '\n}';
    }).join('\n\n');
  };

  const handleBibTextChange = (value: string) => {
    setBibText(value);
    try {
      const parsedRefs = parseBibTeX(value);
      onChange(parsedRefs);
      setBibError('');
    } catch (error) {
      setBibError('Invalid BibTeX syntax');
      console.error('BibTeX parsing error:', error);
    }
  };

  const addManualReference = () => {
    const newRef: Reference = {
      id: `ref_${Date.now()}`,
      type: 'article',
      title: 'New Reference',
      author: 'Author Name',
      year: new Date().getFullYear().toString(),
    };
    onChange([newRef, ...references]);
  };

  const handleImportBibTeXFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleBibTextChange(content); // Use the new handler to parse and update references
        setShowBibView(true); // Switch to BibTeX view after import
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bibliography Editor</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBibView(!showBibView)}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {showBibView ? 'Form View' : 'BibTeX View'}
                </Button>
                <label htmlFor="bibtex-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import BibTeX
                  <input
                    id="bibtex-upload"
                    type="file"
                    accept=".bib"
                    onChange={handleImportBibTeXFile}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {showBibView ? (
              <div className="space-y-2">
                <Label htmlFor="bibtex-editor">BibTeX References</Label>
                <Textarea
                  id="bibtex-editor"
                  value={bibText}
                  onChange={(e) => handleBibTextChange(e.target.value)}
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
                onAddReference={addManualReference}
                onImportBibTeX={(content) => {
                  // This is where the parsing logic would go if BibliographyManager was not handling it internally
                  // For now, just set the bibText and show the view
                  setBibText(content);
                  setShowBibView(true);
                }}
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReferencesEditor;
