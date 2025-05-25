
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  orcid: string;
  email?: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
const STORAGE_KEYS = {
  USER: 'orcid_user',
  LOGIN_TIME: 'orcid_login_time',
  CODE_VERIFIER: 'orcid_code_verifier'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);

      if (storedUser && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        
        if (timeDiff < SESSION_TIMEOUT) {
          setUser(JSON.parse(storedUser));
        } else {
          // Session expired
          logout();
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
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
    // Clear code verifier after successful login
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Check for session timeout every minute
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
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
