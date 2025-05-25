
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import GitHubStatusBanner from '@/components/GitHubStatusBanner';
import LinkGitHubButton from '@/components/LinkGitHubButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Save, Download, Share2, BookOpen } from 'lucide-react';

const Editor = () => {
  const { user, isGitHubLinked } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Writing Workspace, {user?.name}
          </h1>
          <p className="text-gray-600">
            Your secure, ORCID-authenticated environment for scholarly writing.
          </p>
        </div>

        <GitHubStatusBanner />

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Document Editor
                    </CardTitle>
                    <CardDescription>
                      Create and edit your scholarly manuscripts
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Document title..."
                  className="text-lg font-medium"
                />
                <Textarea
                  placeholder="Start writing your scholarly work here..."
                  className="min-h-[500px] resize-none"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Author Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ORCID iD</label>
                    <div className="flex items-center text-sm text-gray-900">
                      <img 
                        src="https://orcid.org/sites/default/files/images/orcid_16x16.png" 
                        alt="ORCID" 
                        className="mr-1"
                      />
                      {user?.orcid}
                    </div>
                  </div>
                  {user?.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">GitHub</label>
                    <div className="mt-1">
                      <LinkGitHubButton size="sm" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  New Document
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!isGitHubLinked}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isGitHubLinked ? 'Collaborate' : 'Link GitHub to Collaborate'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Options
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Word count:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reading time:</span>
                    <span className="font-medium">0 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
