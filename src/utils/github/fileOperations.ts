
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
