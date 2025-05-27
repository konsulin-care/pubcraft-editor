
/// <reference types="vite/client" />

declare global {
  interface Window {
    env?: {
      VITE_ORCID_CLIENT_ID?: string;
      VITE_ORCID_REDIRECT_URI?: string;
      VITE_ORCID_SCOPE?: string;
      VITE_ORCID_ENVIRONMENT?: string;
      VITE_GITHUB_CLIENT_ID?: string;
      VITE_GITHUB_REDIRECT_URI?: string;
      VITE_GITHUB_SCOPE?: string;
      VITE_GITHUB_API_URL?: string;
    }
  }
}

export {}
