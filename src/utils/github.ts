
import { Octokit } from 'octokit';

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

// Create or update file in GitHub repository
export async function commitFile({
  owner,
  repo,
  path,
  content,
  message,
  branch = 'main',
  token
}: CommitFileParams & { token: string }): Promise<void> {
  const octokit = new Octokit({ auth: token });
  
  try {
    // Try to get existing file to get its SHA (required for updates)
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({ 
        owner, 
        repo, 
        path,
        ref: branch 
      });
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine for new files
      console.log('File does not exist, creating new file');
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: btoa(unescape(encodeURIComponent(content))), // Safe UTF-8 encoding
      branch,
      ...(sha && { sha }) // Include SHA only if file exists
    });
  } catch (error) {
    console.error('GitHub commit error:', error);
    throw new Error(`Failed to commit file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create a new branch
export async function createBranch({
  owner,
  repo,
  branchName,
  fromBranch = 'main',
  token
}: {
  owner: string;
  repo: string;
  branchName: string;
  fromBranch?: string;
  token: string;
}): Promise<void> {
  const octokit = new Octokit({ auth: token });
  
  try {
    // Get the SHA of the source branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    });

    // Create new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create pull request
export async function createPullRequest({
  owner,
  repo,
  head,
  base = 'main',
  title,
  body,
  token
}: CreatePullRequestParams & { token: string }) {
  const octokit = new Octokit({ auth: token });
  
  try {
    const response = await octokit.rest.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      body,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating pull request:', error);
    throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate file path for submission
export function getSubmissionPath(orcid: string, date = new Date()): string {
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
  return `submissions/${orcid}-${dateString}.md`;
}

// Generate branch name for submission
export function getSubmissionBranch(orcid: string, date = new Date()): string {
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
  return `submission/${orcid}-${dateString}`;
}

// Merge metadata with markdown using frontmatter
export function generateMarkdownWithFrontmatter(metadata: Metadata, markdown: string): string {
  const yaml = `---
title: ${metadata.title}
author: ${metadata.author}
abstract: |
  ${metadata.abstract}
---

`;
  return yaml + markdown;
}

// Generate pull request body using metadata
export function generatePRBody(metadata: Metadata): string {
  return `**Title**: ${metadata.title}
**Author**: ${metadata.author}

**Abstract**:
${metadata.abstract}

---

This is an automated submission created via the PubCraft editor.`;
}

// Validate GitHub repository access
export async function validateRepository({
  owner,
  repo,
  token
}: {
  owner: string;
  repo: string;
  token: string;
}): Promise<boolean> {
  const octokit = new Octokit({ auth: token });
  
  try {
    await octokit.rest.repos.get({ owner, repo });
    return true;
  } catch (error) {
    console.error('Repository validation failed:', error);
    return false;
  }
}
