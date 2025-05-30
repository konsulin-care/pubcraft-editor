
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
  pages?: string;
  doi?: string;
  url?: string;
}
