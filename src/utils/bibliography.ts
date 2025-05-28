
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
