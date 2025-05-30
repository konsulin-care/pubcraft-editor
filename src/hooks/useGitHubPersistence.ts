
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GitHubConnection {
  owner: string;
  repo: string;
  branch: string;
  markdownFile: string;
  lastSync: string;
}

export const useGitHubPersistence = () => {
  const { user, github } = useAuth();
  const [connection, setConnection] = useState<GitHubConnection | null>(null);

  const STORAGE_KEY = `github_connection_${user?.id || 'anonymous'}`;

  // Load persisted connection
  useEffect(() => {
    if (user && github) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setConnection(parsed);
        }
      } catch (error) {
        console.error('Failed to load GitHub connection:', error);
      }
    }
  }, [user, github, STORAGE_KEY]);

  const saveConnection = (connectionData: Omit<GitHubConnection, 'lastSync'>) => {
    const fullConnection: GitHubConnection = {
      ...connectionData,
      lastSync: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConnection));
      setConnection(fullConnection);
    } catch (error) {
      console.error('Failed to save GitHub connection:', error);
    }
  };

  const clearConnection = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setConnection(null);
    } catch (error) {
      console.error('Failed to clear GitHub connection:', error);
    }
  };

  const updateLastSync = () => {
    if (connection) {
      const updated = {
        ...connection,
        lastSync: new Date().toISOString()
      };
      saveConnection(updated);
    }
  };

  return {
    connection,
    saveConnection,
    clearConnection,
    updateLastSync,
    hasConnection: !!connection
  };
};
