
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleOrcidCallback } from '@/utils/orcidAuth';
import { handleGitHubCallback } from '@/utils/githubAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, linkGitHub, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        return;
      }

      // Wait for auth context to initialize
      if (authLoading) {
        return;
      }

      hasProcessed.current = true;

      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('Processing callback with:', { code: !!code, state: !!state, error });

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Check if this is a GitHub callback (GitHub state is stored in sessionStorage)
        const githubState = sessionStorage.getItem('github_state');
        const orcidState = localStorage.getItem('orcid_state');

        console.log('State validation:', { 
          receivedState: state, 
          githubState, 
          orcidState,
          isGitHubMatch: githubState === state,
          isOrcidMatch: orcidState === state,
          currentUser: !!user
        });

        if (githubState && state === githubState) {
          // Handle GitHub OAuth callback
          console.log('Processing GitHub callback, current user:', user);
          
          if (!user) {
            throw new Error('You must be logged in with ORCID to link GitHub');
          }

          setMessage('Linking GitHub account...');
          const githubData = await handleGitHubCallback(code, state);
          
          linkGitHub(githubData);
          setMessage('GitHub account linked successfully!');
          setStatus('success');
          
          toast({
            title: "GitHub Linked!",
            description: `Successfully linked GitHub account @${githubData.username}`,
          });

          // Redirect back to editor
          setTimeout(() => {
            navigate('/editor', { replace: true });
          }, 2000);

        } else if (orcidState) {
          // Handle ORCID OAuth callback
          setMessage('Exchanging authorization code...');
          const userData = await handleOrcidCallback(code, state);

          setMessage('Login successful! Redirecting...');
          setStatus('success');
          
          login(userData);
          
          toast({
            title: "Welcome!",
            description: `Successfully logged in as ${userData.name}`,
          });

          // Redirect to editor after successful login
          setTimeout(() => {
            navigate('/editor', { replace: true });
          }, 2000);
        } else {
          throw new Error('No valid authentication state found');
        }

      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        toast({
          title: "Authentication Failed",
          description: "There was an error processing your authentication. Please try again.",
          variant: "destructive"
        });

        // Redirect back to appropriate page after error
        setTimeout(() => {
          if (user) {
            navigate('/editor', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, login, linkGitHub, user, authLoading, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {status === 'loading' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">
              Please wait while we securely process your authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
