import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle } from 'lucide-react';
import { Reference } from '@/types/metadata';

interface BibliographyManagerProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
  onAddReference: () => void; // New prop for adding reference
  onImportBibTeX: (content: string) => void; // New prop for importing BibTeX
}

const BibliographyManager: React.FC<BibliographyManagerProps> = ({ references, onChange, onAddReference, onImportBibTeX }) => {
  const [bibText, setBibText] = useState('');
  const [showBibInput, setShowBibInput] = useState(false);

  const parseBibEntry = (entry: string): Reference | null => {
    const typeMatch = entry.match(/@(\w+)\s*\{([^,]+),/);
    const titleMatch = entry.match(/title\s*=\s*[{"](.*?)["}]/i);
    const authorMatch = entry.match(/author\s*=\s*[{"](.*?)["}]/i);
    const yearMatch = entry.match(/year\s*=\s*[{"]*(\d{4})["}]*/i);
    const journalMatch = entry.match(/journal\s*=\s*[{"](.*?)["}]/i);
    const volumeMatch = entry.match(/volume\s*=\s*[{"](.*?)["}]/i);
    const numberMatch = entry.match(/number\s*=\s*[{"](.*?)["}]/i);
    const pagesMatch = entry.match(/pages\s*=\s*[{"](.*?)["}]/i);
    const doiMatch = entry.match(/doi\s*=\s*[{"](.*?)["}]/i);
    const urlMatch = entry.match(/url\s*=\s*[{"](.*?)["}]/i);
    const publisherMatch = entry.match(/publisher\s*=\s*[{"](.*?)["}]/i);
    const booktitleMatch = entry.match(/booktitle\s*=\s*[{"](.*?)["}]/i);
    const editorMatch = entry.match(/editor\s*=\s*[{"](.*?)["}]/i);
    const seriesMatch = entry.match(/series\s*=\s*[{"](.*?)["}]/i);
    const addressMatch = entry.match(/address\s*=\s*[{"](.*?)["}]/i);
    const monthMatch = entry.match(/month\s*=\s*[{"](.*?)["}]/i);
    const noteMatch = entry.match(/note\s*=\s*[{"](.*?)["}]/i);
    const organizationMatch = entry.match(/organization\s*=\s*[{"](.*?)["}]/i);
    const schoolMatch = entry.match(/school\s*=\s*[{"](.*?)["}]/i);
    const institutionMatch = entry.match(/institution\s*=\s*[{"](.*?)["}]/i);
    const chapterMatch = entry.match(/chapter\s*=\s*[{"](.*?)["}]/i);
    const editionMatch = entry.match(/edition\s*=\s*[{"](.*?)["}]/i);
    const howpublishedMatch = entry.match(/howpublished\s*=\s*[{"](.*?)["}]/i);


    if (!typeMatch || !titleMatch || !authorMatch) return null;

    return {
      id: typeMatch[2].trim(),
      type: typeMatch[1],
      title: titleMatch[1],
      author: authorMatch[1],
      year: yearMatch?.[1] || '',
      journal: journalMatch?.[1],
      volume: volumeMatch?.[1],
      number: numberMatch?.[1],
      pages: pagesMatch?.[1],
      doi: doiMatch?.[1],
      url: urlMatch?.[1],
      publisher: publisherMatch?.[1],
      booktitle: booktitleMatch?.[1],
      editor: editorMatch?.[1],
      series: seriesMatch?.[1],
      address: addressMatch?.[1],
      month: monthMatch?.[1],
      note: noteMatch?.[1],
      organization: organizationMatch?.[1],
      school: schoolMatch?.[1],
      institution: institutionMatch?.[1],
      chapter: chapterMatch?.[1],
      edition: editionMatch?.[1],
      howpublished: howpublishedMatch?.[1],
    };
  };

  const handleBibImportInternal = () => {
    const entries = bibText.split('@').filter(entry => entry.trim());
    const newReferences: Reference[] = [];

    entries.forEach(entry => {
      const ref = parseBibEntry('@' + entry);
      if (ref) newReferences.push(ref);
    });

    onImportBibTeX(bibText); // Pass the raw BibTeX content up
    onChange([...references, ...newReferences]); // Update references state
    setBibText('');
    setShowBibInput(false);
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteReference = (index: number) => {
    onChange(references.filter((_, i) => i !== index));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
          {showBibInput && (
            <div className="space-y-2">
              <Textarea
                value={bibText}
                onChange={(e) => setBibText(e.target.value)}
                placeholder="Paste BibTeX entries here..."
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleBibImportInternal} size="sm">
                  Import
                </Button>
                <Button variant="outline" onClick={() => setShowBibInput(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onAddReference}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Reference
            </Button>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {references.map((ref, index) => (
              <div key={ref.id} className="border rounded p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <Input
                    value={ref.id}
                    onChange={(e) => updateReference(index, 'id', e.target.value)}
                    placeholder="Reference ID"
                    className="text-sm font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReference(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={ref.type}
                  onChange={(e) => updateReference(index, 'type', e.target.value)}
                  placeholder="Type (e.g., article, book)"
                />
                <Input
                  value={ref.title}
                  onChange={(e) => updateReference(index, 'title', e.target.value)}
                  placeholder="Title"
                />
                <Input
                  value={ref.author}
                  onChange={(e) => updateReference(index, 'author', e.target.value)}
                  placeholder="Author(s)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={ref.year}
                    onChange={(e) => updateReference(index, 'year', e.target.value)}
                    placeholder="Year"
                  />
                  <Input
                    value={ref.journal || ''}
                    onChange={(e) => updateReference(index, 'journal', e.target.value)}
                    placeholder="Journal"
                  />
                  <Input
                    value={ref.volume || ''}
                    onChange={(e) => updateReference(index, 'volume', e.target.value)}
                    placeholder="Volume"
                  />
                  <Input
                    value={ref.number || ''}
                    onChange={(e) => updateReference(index, 'number', e.target.value)}
                    placeholder="Number"
                  />
                  <Input
                    value={ref.pages || ''}
                    onChange={(e) => updateReference(index, 'pages', e.target.value)}
                    placeholder="Pages"
                  />
                  <Input
                    value={ref.doi || ''}
                    onChange={(e) => updateReference(index, 'doi', e.target.value)}
                    placeholder="DOI"
                  />
                  <Input
                    value={ref.url || ''}
                    onChange={(e) => updateReference(index, 'url', e.target.value)}
                    placeholder="URL"
                  />
                  <Input
                    value={ref.publisher || ''}
                    onChange={(e) => updateReference(index, 'publisher', e.target.value)}
                    placeholder="Publisher"
                  />
                  <Input
                    value={ref.booktitle || ''}
                    onChange={(e) => updateReference(index, 'booktitle', e.target.value)}
                    placeholder="Booktitle"
                  />
                  <Input
                    value={ref.editor || ''}
                    onChange={(e) => updateReference(index, 'editor', e.target.value)}
                    placeholder="Editor"
                  />
                  <Input
                    value={ref.series || ''}
                    onChange={(e) => updateReference(index, 'series', e.target.value)}
                    placeholder="Series"
                  />
                  <Input
                    value={ref.address || ''}
                    onChange={(e) => updateReference(index, 'address', e.target.value)}
                    placeholder="Address"
                  />
                  <Input
                    value={ref.month || ''}
                    onChange={(e) => updateReference(index, 'month', e.target.value)}
                    placeholder="Month"
                  />
                  <Input
                    value={ref.note || ''}
                    onChange={(e) => updateReference(index, 'note', e.target.value)}
                    placeholder="Note"
                  />
                  <Input
                    value={ref.organization || ''}
                    onChange={(e) => updateReference(index, 'organization', e.target.value)}
                    placeholder="Organization"
                  />
                  <Input
                    value={ref.school || ''}
                    onChange={(e) => updateReference(index, 'school', e.target.value)}
                    placeholder="School"
                  />
                  <Input
                    value={ref.institution || ''}
                    onChange={(e) => updateReference(index, 'institution', e.target.value)}
                    placeholder="Institution"
                  />
                  <Input
                    value={ref.chapter || ''}
                    onChange={(e) => updateReference(index, 'chapter', e.target.value)}
                    placeholder="Chapter"
                  />
                  <Input
                    value={ref.edition || ''}
                    onChange={(e) => updateReference(index, 'edition', e.target.value)}
                    placeholder="Edition"
                  />
                  <Input
                    value={ref.howpublished || ''}
                    onChange={(e) => updateReference(index, 'howpublished', e.target.value)}
                    placeholder="How Published"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BibliographyManager;
