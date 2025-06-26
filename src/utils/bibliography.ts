import { Reference } from '@/types/metadata';

export function generateBibContent(references: Reference[]): string {
  if (!references || references.length === 0) {
    return '';
  }

  return references
    .map((ref) => {
      const { id, type, title, author, year, journal, volume, pages, doi, url } = ref;
      
      let bibEntry = `@${type || 'article'}{${id},\n`;
      
      if (title) bibEntry += `  title={${title}},\n`;
      if (author) bibEntry += `  author={${author}},\n`;
      if (year) bibEntry += `  year={${year}},\n`;
      if (journal) bibEntry += `  journal={${journal}},\n`;
      if (volume) bibEntry += `  volume={${volume}},\n`;
      if (pages) bibEntry += `  pages={${pages}},\n`;
      if (doi) bibEntry += `  doi={${doi}},\n`;
      if (url) bibEntry += `  url={${url}},\n`;
      
      bibEntry += '}\n\n';
      
      return bibEntry;
    })
    .join('');
}

export const parseBibEntry = (entry: string): Reference | null => {
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

export const parseBibTeX = (bibtex: string): Reference[] => {
  const entries = bibtex.split('@').filter(entry => entry.trim());
  const references: Reference[] = [];

  entries.forEach(entry => {
    const ref = parseBibEntry('@' + entry);
    if (ref) references.push(ref);
  });

  return references;
};
