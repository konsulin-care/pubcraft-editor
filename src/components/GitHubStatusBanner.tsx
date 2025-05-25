
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Github, X, Info, Shield, Save, Share2 } from 'lucide-react';
import LinkGitHubButton from './LinkGitHubButton';

const GitHubStatusBanner: React.FC = () => {
  const { isGitHubLinked } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  if (isGitHubLinked || !isVisible) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <Github className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Connect your GitHub account</h3>
              <p className="text-sm text-blue-700 mt-1">
                Link GitHub to save your work, create repositories, and collaborate with others.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <LinkGitHubButton variant="default" size="sm" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <Info className="h-4 w-4 mr-1" />
                      Why GitHub?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Github className="h-5 w-5 mr-2" />
                        Why Connect GitHub?
                      </DialogTitle>
                      <DialogDescription asChild>
                        <div className="space-y-4 text-sm">
                          <div className="flex items-start space-x-3">
                            <Save className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Save Your Work</p>
                              <p className="text-gray-600">Automatically backup your manuscripts to GitHub repositories.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Share2 className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Collaborate</p>
                              <p className="text-gray-600">Share your work with co-authors and reviewers.</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Secure & Private</p>
                              <p className="text-gray-600">Your tokens are stored securely and only in memory during your session.</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">
                              <strong>Permissions:</strong> We request access to create repositories and read your profile. 
                              You can revoke access anytime from your GitHub settings.
                            </p>
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubStatusBanner;
