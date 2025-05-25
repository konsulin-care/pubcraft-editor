
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { handleOrcidCallback } from '@/utils/orcidAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

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

      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        toast({
          title: "Authentication Failed",
          description: "There was an error processing your ORCID login. Please try again.",
          variant: "destructive"
        });

        // Redirect back to login after error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, login, toast]);

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
              Please wait while we securely process your ORCID authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
