
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BookOpen, Upload, Plus, Trash2 } from 'lucide-react';
import { Reference } from '@/types/metadata';

interface BibliographyManagerProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

const BibliographyManager: React.FC<BibliographyManagerProps> = ({ references, onChange }) => {
  const [bibText, setBibText] = useState('');
  const [showBibInput, setShowBibInput] = useState(false);

  const parseBibEntry = (entry: string): Reference | null => {
    const typeMatch = entry.match(/@(\w+)\s*\{([^,]+),/);
    const titleMatch = entry.match(/title\s*=\s*[{"](.*?)["}]/i);
    const authorMatch = entry.match(/author\s*=\s*[{"](.*?)["}]/i);
    const yearMatch = entry.match(/year\s*=\s*[{"]*(\d{4})["}]*/i);
    const journalMatch = entry.match(/journal\s*=\s*[{"](.*?)["}]/i);
    const urlMatch = entry.match(/url\s*=\s*[{"](.*?)["}]/i);

    if (!typeMatch || !titleMatch || !authorMatch) return null;

    return {
      id: typeMatch[2].trim(),
      type: typeMatch[1],
      title: titleMatch[1],
      author: authorMatch[1],
      year: yearMatch?.[1] || '',
      journal: journalMatch?.[1],
      url: urlMatch?.[1]
    };
  };

  const handleBibImport = () => {
    const entries = bibText.split('@').filter(entry => entry.trim());
    const newReferences: Reference[] = [];

    entries.forEach(entry => {
      const ref = parseBibEntry('@' + entry);
      if (ref) newReferences.push(ref);
    });

    onChange([...references, ...newReferences]);
    setBibText('');
    setShowBibInput(false);
  };

  const addManualReference = () => {
    const newRef: Reference = {
      id: `ref_${Date.now()}`,
      type: 'article',
      title: 'New Reference',
      author: 'Author Name',
      year: new Date().getFullYear().toString()
    };
    onChange([...references, newRef]);
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteReference = (index: number) => {
    onChange(references.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.bib')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBibText(content);
        setShowBibInput(true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BookOpen className="h-5 w-5 mr-2" />
          Bibliography
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBibInput(!showBibInput)}>
            <Upload className="h-4 w-4 mr-2" />
            Import BibTeX
          </Button>
          <Button variant="outline" size="sm" onClick={addManualReference}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
          <Input
            type="file"
            accept=".bib"
            onChange={handleFileUpload}
            className="hidden"
            id="bib-upload"
          />
          <label htmlFor="bib-upload">
            <Button variant="outline" size="sm" asChild>
              <span>Upload .bib</span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showBibInput && (
          <div className="space-y-2">
            <Textarea
              value={bibText}
              onChange={(e) => setBibText(e.target.value)}
              placeholder="Paste BibTeX entries here..."
              className="min-h-[150px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleBibImport} size="sm">
                Import
              </Button>
              <Button variant="outline" onClick={() => setShowBibInput(false)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                value={ref.title}
                onChange={(e) => updateReference(index, 'title', e.target.value)}
                placeholder="Title"
              />
              <Input
                value={ref.author}
                onChange={(e) => updateReference(index, 'author', e.target.value)}
                placeholder="Author(s)"
              />
              <div className="flex gap-2">
                <Input
                  value={ref.year}
                  onChange={(e) => updateReference(index, 'year', e.target.value)}
                  placeholder="Year"
                  className="w-24"
                />
                <Input
                  value={ref.journal || ''}
                  onChange={(e) => updateReference(index, 'journal', e.target.value)}
                  placeholder="Journal (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BibliographyManager;
