
import { GitHubConfig } from './types';

interface SaveFileParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch: string;
  token: string;
}

export async function saveFileToGitHub(params: SaveFileParams): Promise<void> {
  const { owner, repo, path, content, message, branch, token } = params;
  
  try {
    // Get current file SHA if it exists
    let sha: string | undefined;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Create or update the file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          ...(sha && { sha })
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Failed to save file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error saving file to GitHub:', error);
    throw error;
  }
}

interface ListFilesParams {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  token: string;
}

export async function listMarkdownFilesInDirectory(params: ListFilesParams): Promise<string[]> {
  const { owner, repo, path, branch, token } = params;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Directory not found, return empty array
        return [];
      }
      const error = await response.json();
      throw new Error(`Failed to list files: ${error.message}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Expected an array of files/directories from GitHub API.');
    }

    return data
      .filter((item: any) => item.type === 'file' && item.name.endsWith('.md'))
      .map((item: any) => item.path);
  } catch (error) {
    console.error('Error listing markdown files:', error);
    throw error;
  }
}

export function generateManuscriptContent(markdown: string): string {
  // Ensure YAML include header is at the top
  const yamlInclude = '---\ninclude: metadata.yml\n---\n\n';
  
  // Remove existing YAML frontmatter if present
  const cleanedMarkdown = markdown.replace(/^---[\s\S]*?---\n\n?/, '');
  
  return yamlInclude + cleanedMarkdown;
}

export function generateMetadataYaml(metadata: any): string {
  const yaml = require('js-yaml');
  return yaml.dump(metadata, { indent: 2 });
}

interface CreateStructureParams {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  manuscriptTitle: string;
}

export async function createRepositoryStructure(params: CreateStructureParams): Promise<void> {
  const { owner, repo, branch, token, manuscriptTitle } = params;

  const baseDir = `draft/${manuscriptTitle}`;

  const filesToCreate = [
    {
      path: `${baseDir}/pubcraft-manuscript.md`,
      content: generateManuscriptContent('# New Manuscript\n\nThis is your new manuscript.'),
      message: 'Initial manuscript file'
    },
    {
      path: `${baseDir}/metadata.yml`,
      content: generateMetadataYaml({
        title: manuscriptTitle,
        subtitle: '',
        abstract: '',
        author: [],
        affiliations: [],
        funding: '',
        keywords: []
      }),
      message: 'Initial metadata file'
    },
    {
      path: `${baseDir}/pubcraft-reference.bib`,
      content: '',
      message: 'Initial bibliography file'
    },
    {
      path: `${baseDir}/extra-file`,
      content: 'This is an extra file.',
      message: 'Initial extra file'
    }
  ];

  for (const file of filesToCreate) {
    await saveFileToGitHub({
      owner,
      repo,
      path: file.path,
      content: file.content,
      message: file.message,
      branch,
      token
    });
  }
}
