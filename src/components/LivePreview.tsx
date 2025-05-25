
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface Metadata {
  title: string;
  author: string;
  abstract: string;
}

interface LivePreviewProps {
  markdown: string;
  metadata: Metadata;
}

const LivePreview: React.FC<LivePreviewProps> = ({ markdown, metadata }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Eye className="h-5 w-5 mr-2" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-gray max-w-none">
        {/* Metadata Section */}
        {(metadata.title || metadata.author || metadata.abstract) && (
          <div className="border-b pb-6 mb-6 not-prose">
            {metadata.title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {metadata.title}
              </h1>
            )}
            {metadata.author && (
              <p className="text-lg text-gray-600 mb-4">
                <strong>Author:</strong> {metadata.author}
              </p>
            )}
            {metadata.abstract && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{metadata.abstract}</p>
              </div>
            )}
          </div>
        )}

        {/* Markdown Content */}
        {markdown ? (
          <ReactMarkdown>{markdown}</ReactMarkdown>
        ) : (
          <p className="text-gray-500 italic">
            Start writing to see your content preview here...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LivePreview;
