
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORCID_CLIENT_ID: string;
  readonly VITE_ORCID_PRODUCTION_URL: string;
  readonly VITE_ORCID_SANDBOX_URL: string;
  readonly VITE_ORCID_TOKEN_URL: string;
  readonly VITE_ORCID_API_URL: string;
  readonly VITE_ORCID_REDIRECT_URI: string;
  readonly VITE_ORCID_SCOPE: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_GITHUB_REDIRECT_URI: string;
  readonly VITE_GITHUB_SCOPE: string;
  readonly VITE_GITHUB_API_URL: string;
  readonly VITE_GITHUB_TOKEN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    env?: {
      VITE_ORCID_CLIENT_ID?: string;
      VITE_ORCID_REDIRECT_URI?: string;
      VITE_ORCID_SCOPE?: string;
      VITE_ORCID_ENVIRONMENT?: string;
      VITE_ORCID_SANDBOX_CLIENT_ID?: string;
      VITE_ORCID_SANDBOX_URL?: string;
      VITE_ORCID_PRODUCTION_URL?: string;
      VITE_ORCID_TOKEN_URL?: string;
      VITE_ORCID_API_URL?: string;
      VITE_GITHUB_CLIENT_ID?: string;
      VITE_GITHUB_REDIRECT_URI?: string;
      VITE_GITHUB_SCOPE?: string;
      VITE_GITHUB_API_URL?: string;
      VITE_GITHUB_TOKEN_URL?: string;
    }
  }
}

export {}
