
export interface AuthorMetadata {
  name: string;
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
  journal?: string;
  volume?: string;
  number?: string; // Added for BibTeX @article
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
  // type field is already present
  raw?: string; // Added raw field to store original BibTeX string
}
