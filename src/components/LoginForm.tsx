
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Shield, Users, Zap } from 'lucide-react';
import { initiateOrcidLogin } from '@/utils/orcidAuth';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOrcidLogin = async () => {
    setIsLoading(true);
    try {
      await initiateOrcidLogin();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "There was an error connecting to ORCID. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">PubCraft</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted companion for scholarly writing. Connect with ORCID to access 
            your personalized writing environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Secure Authentication
                </CardTitle>
                <CardDescription>
                  Login securely with your ORCID iD to access your scholarly profile 
                  and maintain research integrity.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Connected</h3>
                <p className="text-sm text-gray-600">Research community</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Productive</h3>
                <p className="text-sm text-gray-600">Writing tools</p>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Connect with ORCID to access your writing workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleOrcidLogin}
                disabled={isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting to ORCID...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <img 
                      src="https://orcid.org/sites/default/files/images/orcid_16x16.png" 
                      alt="ORCID" 
                      className="mr-2"
                    />
                    Login with ORCID iD
                  </div>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                By logging in, you agree to our Terms of Service and Privacy Policy. 
                We use ORCID OAuth 2.0 for secure authentication.
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What is ORCID?</h4>
                <p className="text-sm text-blue-800">
                  ORCID provides a persistent digital identifier that distinguishes you 
                  from other researchers and connects you to your scholarly work.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
