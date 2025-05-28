
export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

export interface CommitFileParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export interface CreatePullRequestParams {
  owner: string;
  repo: string;
  head: string;
  base?: string;
  title: string;
  body: string;
}

export interface Metadata {
  title: string;
  author: string;
  abstract: string;
}

export interface Repository {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

export interface Organization {
  login: string;
  avatar_url: string;
}

export interface RepositoryFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
}
