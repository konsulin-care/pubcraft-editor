import { Octokit } from 'octokit';

// Re-export types and functions from refactored modules
export * from './github/types';
export * from './github/repository';

import { 
  CommitFileParams, 
  CreatePullRequestParams, 
  Metadata,
  Repository 
} from './github/types';
import { createRepository } from './github/repository';

// Generate directory name from title
export function generateDirectoryName(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, and dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

// Generate user branch name
export function generateUserBranch(firstName: string): string {
  return `draft-${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

// List repository branches
export async function listBranches({
  owner,
  repo,
  token
}: {
  owner: string;
  repo: string;
  token: string;
}): Promise<string[]> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100
    });
    
    return data.map(branch => branch.name);
  } catch (error) {
    console.error('Error listing branches:', error);
    throw new Error(`Failed to list branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// List repository files
export async function listRepositoryFiles({
  owner,
  repo,
  branch = 'main',
  path = '',
  token
}: {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  token: string;
}): Promise<string[]> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });
    
    if (Array.isArray(data)) {
      const files: string[] = [];
      
      for (const item of data) {
        if (item.type === 'file') {
          files.push(item.path);
        } else if (item.type === 'dir') {
          // Recursively get files from subdirectories
          const subFiles = await listRepositoryFiles({
            owner,
            repo,
            branch,
            path: item.path,
            token
          });
          files.push(...subFiles);
        }
      }
      
      return files;
    }
    
    return [];
  } catch (error) {
    console.error('Error listing repository files:', error);
    throw new Error(`Failed to list repository files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get file content from repository
export async function getFileContent({
  owner,
  repo,
  path,
  branch = 'main',
  token
}: {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
  token: string;
}): Promise<string> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });
    
    if ('content' in data && data.content) {
      return atob(data.content);
    }
    
    throw new Error('File content not found');
  } catch (error) {
    console.error('Error getting file content:', error);
    throw new Error(`Failed to get file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Setup repository structure with required branches
export async function setupRepositoryStructure({
  owner,
  repo,
  userFirstName,
  manuscriptTitle,
  token,
  createRepo = false
}: {
  owner: string;
  repo: string;
  userFirstName: string;
  manuscriptTitle: string;
  token: string;
  createRepo?: boolean;
}): Promise<void> {
  const octokit = new Octokit({ auth: token });
  
  try {
    let repository;
    
    if (createRepo) {
      repository = await createRepository({
        owner,
        repo,
        token,
        isPrivate: false
      });
    } else {
      const { data } = await octokit.rest.repos.get({ owner, repo });
      repository = {
        name: data.name,
        full_name: data.full_name,
        private: data.private,
        default_branch: data.default_branch
      };
    }
    
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${repository.default_branch}`
    });
    
    const baseSha = refData.object.sha;
    
    // Create publish branch
    try {
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: 'refs/heads/publish',
        sha: baseSha
      });
    } catch (error) {
      console.log('Publish branch might already exist');
    }
    
    // Create user draft branch
    const userBranch = generateUserBranch(userFirstName);
    try {
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${userBranch}`,
        sha: baseSha
      });
    } catch (error) {
      console.log('User draft branch might already exist');
    }
    
  } catch (error) {
    console.error('Error setting up repository structure:', error);
    throw new Error(`Failed to setup repository structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create or update manuscript files in structured format
export async function commitManuscriptFiles({
  owner,
  repo,
  manuscriptTitle,
  markdownContent,
  bibContent = '',
  userFirstName,
  commitMessage,
  token
}: {
  owner: string;
  repo: string;
  manuscriptTitle: string;
  markdownContent: string;
  bibContent?: string;
  userFirstName: string;
  commitMessage: string;
  token: string;
}): Promise<void> {
  const userBranch = generateUserBranch(userFirstName);
  const dirName = generateDirectoryName(manuscriptTitle);
  const basePath = `draft/${dirName}`;
  
  // Commit markdown file
  await commitFile({
    owner,
    repo,
    path: `${basePath}/pubcraft-manuscript.md`,
    content: markdownContent,
    message: commitMessage,
    branch: userBranch,
    token
  });
  
  // Commit bib file if content exists
  if (bibContent.trim()) {
    await commitFile({
      owner,
      repo,
      path: `${basePath}/pubcraft-reference.bib`,
      content: bibContent,
      message: commitMessage,
      branch: userBranch,
      token
    });
  }
}

// Create merge request from draft to publish branch
export async function createMergeRequest({
  owner,
  repo,
  userFirstName,
  manuscriptTitle,
  token
}: {
  owner: string;
  repo: string;
  userFirstName: string;
  manuscriptTitle: string;
  token: string;
}) {
  const userBranch = generateUserBranch(userFirstName);
  
  return await createPullRequest({
    owner,
    repo,
    head: userBranch,
    base: 'publish',
    title: `Publish: ${manuscriptTitle}`,
    body: `Merge manuscript "${manuscriptTitle}" from draft to publish branch.`,
    token
  });
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
