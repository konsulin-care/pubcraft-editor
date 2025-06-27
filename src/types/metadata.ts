export interface AuthorMetadata {
  name?: string;
  corresponding?: boolean;
  email?: string;
  affiliations?: { ref: string }[];
  roles?: string[];
}

export interface AffiliationMetadata {
  id: string;
  name: string;
  city?: string;
  country?: string;
}

export interface ExtendedMetadata {
  title: string;
  subtitle?: string;
  author: string | AuthorMetadata[];
  abstract: string;
  funding?: string;
  keywords?: string[];
  affiliations?: AffiliationMetadata[];
}

export interface Reference {
  id: string;
  type: string;
  title: string;
  author: string;
  year: string;
  key?: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  booktitle?: string;
  editor?: string;
  series?: string;
  address?: string;
  month?: string;
  note?: string;
  organization?: string;
  school?: string;
  institution?: string;
  chapter?: string;
  edition?: string;
  howpublished?: string;
  raw?: string;
}

export interface CitationKeyManagement {
  /**
   * Extracts unique citation keys from references
   * @param references Array of references to extract keys from
   * @returns Array of unique citation keys
   */
  extractCitationKeys(references: Reference[]): string[];

  /**
   * Validates a citation key
   * @param key Citation key to validate
   * @returns Boolean indicating if the key is valid
   */
  validateCitationKey(key: string): boolean;

  /**
   * Generates a unique citation key based on reference details
   * @param reference Reference to generate a key for
   * @returns A unique, valid citation key
   */
  generateUniqueCitationKey(reference: Reference): string;

  /**
   * Renders a citation in markdown format
   * @param key Citation key to render
   * @returns Markdown-formatted citation
   */
  renderCitation(key: string): string;

  /**
   * Finds a reference by its citation key
   * @param references Array of references to search
   * @param key Citation key to find
   * @returns The matching reference or null
   */
  findReferenceByCitationKey(references: Reference[], key: string): Reference | null;

  /**
   * Generates a formatted reference entry for display
   * @param reference Reference to format
   * @returns Formatted reference string
   */
  formatReferenceEntry(reference: Reference): string;
}
