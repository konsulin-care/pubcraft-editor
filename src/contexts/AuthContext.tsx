import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  orcid: string;
  email?: string;
  accessToken: string;
  login?: string;
  avatar_url?: string;
  profilePicture?: string; // Added profilePicture
}

interface GitHubAccount {
  username: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  github: GitHubAccount | null;
  isAuthenticated: boolean;
  isGitHubLinked: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  linkGitHub: (githubData: GitHubAccount) => void;
  unlinkGitHub: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
const STORAGE_KEYS = {
  USER: 'orcid_user',
  GITHUB: 'github_account',
  LOGIN_TIME: 'orcid_login_time',
  CODE_VERIFIER: 'orcid_code_verifier'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [github, setGitHub] = useState<GitHubAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedGitHub = localStorage.getItem(STORAGE_KEYS.GITHUB);
      const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);

      if (storedUser && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        
        if (timeDiff < SESSION_TIMEOUT) {
          const userData = JSON.parse(storedUser);
          // Add missing properties for GitHub integration
          if (userData && !userData.login) {
            userData.login = userData.name?.split(' ')[0]?.toLowerCase() || userData.id;
          }
          setUser(userData);
          
          // Always restore GitHub account if it exists
          if (storedGitHub) {
            setGitHub(JSON.parse(storedGitHub));
          }
        } else {
          // Session expired
          logout();
        }
      } else {
        // Check if GitHub is still connected even if user session expired
        if (storedGitHub) {
          setGitHub(JSON.parse(storedGitHub));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    // Ensure GitHub-compatible properties
    if (!userData.login) {
      userData.login = userData.name?.split(' ')[0]?.toLowerCase() || userData.id;
    }
    
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
    // Clear code verifier after successful login
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  };

  const logout = () => {
    setUser(null);
    // Don't remove GitHub connection on logout - persist it
    // setGitHub(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // localStorage.removeItem(STORAGE_KEYS.GITHUB); // Keep GitHub connection
    localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  };

  const linkGitHub = (githubData: GitHubAccount) => {
    setGitHub(githubData);
    localStorage.setItem(STORAGE_KEYS.GITHUB, JSON.stringify(githubData));
    console.log('GitHub account linked and persisted:', githubData.username);
  };

  const unlinkGitHub = () => {
    setGitHub(null);
    localStorage.removeItem(STORAGE_KEYS.GITHUB);
    console.log('GitHub account unlinked');
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Check for session timeout every minute
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = !!user;
  const isGitHubLinked = !!github;

  return (
    <AuthContext.Provider
      value={{
        user,
        github,
        isAuthenticated,
        isGitHubLinked,
        isLoading,
        login,
        logout,
        linkGitHub,
        unlinkGitHub,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
