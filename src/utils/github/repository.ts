
import { Octokit } from 'octokit';
import { Repository, Organization } from './types';

// List user repositories
export async function listRepositories(token: string): Promise<Repository[]> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    
    return data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      default_branch: repo.default_branch
    }));
  } catch (error) {
    console.error('Error listing repositories:', error);
    throw new Error(`Failed to list repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// List user organizations
export async function listUserOrganizations(token: string): Promise<Organization[]> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data } = await octokit.rest.orgs.listForAuthenticatedUser({
      per_page: 100
    });
    
    return data.map(org => ({
      login: org.login,
      avatar_url: org.avatar_url
    }));
  } catch (error) {
    console.error('Error listing organizations:', error);
    throw new Error(`Failed to list organizations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create new repository
export async function createRepository({
  owner,
  repo,
  token,
  isPrivate = false
}: {
  owner: string;
  repo: string;
  token: string;
  isPrivate?: boolean;
}): Promise<Repository> {
  const octokit = new Octokit({ auth: token });
  
  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    let repoData;
    if (owner === user.login) {
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: isPrivate,
        auto_init: true
      });
      repoData = data;
    } else {
      const { data } = await octokit.rest.repos.createInOrg({
        org: owner,
        name: repo,
        private: isPrivate,
        auto_init: true
      });
      repoData = data;
    }
    
    return {
      name: repoData.name,
      full_name: repoData.full_name,
      private: repoData.private,
      default_branch: repoData.default_branch
    };
  } catch (error) {
    console.error('Error creating repository:', error);
    throw new Error(`Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
