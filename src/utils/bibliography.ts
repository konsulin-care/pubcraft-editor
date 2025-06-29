import { Reference } from '@/types/metadata';

/**
 * Generates BibTeX content from an array of references
 * 
 * @function
 * @param {Reference[]} references - Array of references to convert to BibTeX
 * @returns {string} BibTeX formatted string of references
 * @description Converts an array of Reference objects into a BibTeX formatted string
 * Handles various reference fields like title, author, year, journal, etc.
 * Returns an empty string if no references are provided
 * 
 * @example
 * const refs = [
 *   {
 *     id: 'smith2020',
 *     type: 'article',
 *     title: 'Research Findings',
 *     author: 'John Smith',
 *     year: '2020',
 *     journal: 'Journal of Research'
 *   }
 * ];
 * const bibContent = generateBibContent(refs);
 */
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

/**
 * Parses a single BibTeX entry into a Reference object
 * 
 * @function
 * @param {string} entry - A single BibTeX entry to parse
 * @returns {Reference | null} Parsed Reference object or null if parsing fails
 * @description Extracts various fields from a BibTeX entry using regex
 * Supports parsing of multiple BibTeX entry types
 * 
 * @example
 * const bibEntry = '@article{smith2020, title={Research Paper}, author={John Smith}, year={2020}}';
 * const reference = parseBibEntry(bibEntry);
 */
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

/**
 * Parses a BibTeX string into an array of Reference objects
 * 
 * @function
 * @param {string} bibtex - BibTeX formatted string containing multiple entries
 * @returns {Reference[]} Array of parsed Reference objects
 * @description Splits a BibTeX string into individual entries and parses each entry
 * Filters out any entries that cannot be parsed
 * 
 * @example
 * const bibTexString = `
 *   @article{smith2020, title={Research Paper}, author={John Smith}, year={2020}}
 *   @book{jones2019, title={Another Book}, author={Jane Jones}, year={2019}}
 * `;
 * const references = parseBibTeX(bibTexString);
 */
export const parseBibTeX = (bibtex: string): Reference[] => {
  const entries = bibtex.split('@').filter(entry => entry.trim());
  const references: Reference[] = [];

  entries.forEach(entry => {
    const ref = parseBibEntry('@' + entry);
    if (ref) references.push(ref);
  });

  return references;
};

/**
 * Find a reference by its citation key
 * 
 * @function
 * @param {string} citationKey - The citation key to search for
 * @param {Reference[]} references - Array of references to search in
 * @returns {Reference | undefined} The matching reference or undefined
 * 
 * @description 
 * Matching strategies:
 * 1. Exact case-insensitive match on reference ID
 * 2. Partial matching considering author and year components
 * 
 * Supports citation keys with/without brackets, e.g.:
 * - Smith2020
 * - [Smith2020]
 * - {Smith2020}
 * 
 * @example
 * const references = [
 *   { id: 'smith2020', title: 'Research Paper', author: 'John Smith', year: '2020' }
 * ];
 * const reference = findReferenceByKey('Smith2020', references);
 */
export function findReferenceByKey(citationKey: string, references: Reference[]): Reference | undefined {
  // Normalize the citation key by removing brackets and converting to lowercase
  const normalizedKey = citationKey
    .replace(/^[\[\{]|[\]\}]$/g, '')  // Remove leading/trailing brackets
    .toLowerCase()
    .trim();

  // Try exact match first (case-insensitive)
  const exactMatch = references.find(ref =>
    ref.id.toLowerCase() === normalizedKey
  );

  if (exactMatch) return exactMatch;

  // Try matching with potential year variations
  const yearMatch = normalizedKey.match(/^(.+?)(\d{4})?$/);
  if (yearMatch) {
    const [, authorPart, yearPart] = yearMatch;
    
    const candidateMatches = references.filter(ref => {
      const refAuthorPart = ref.id.toLowerCase().replace(/\d{4}$/, '');
      const refYearPart = ref.id.toLowerCase().match(/\d{4}$/)?.[0];
      
      const authorMatch = refAuthorPart === authorPart;
      const yearMatch = !yearPart || refYearPart === yearPart;
      
      return authorMatch && yearMatch;
    });

    // If only one match found, return it
    if (candidateMatches.length === 1) {
      return candidateMatches[0];
    }
  }

  // No match found
  return undefined;
}
