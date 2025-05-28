
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { ExtendedMetadata, Reference, AuthorMetadata } from '@/types/metadata';
import 'katex/dist/katex.min.css';

interface LivePreviewProps {
  markdown: string;
  metadata: ExtendedMetadata;
  references?: Reference[];
}

const LivePreview: React.FC<LivePreviewProps> = ({ markdown, metadata, references = [] }) => {
  const renderAuthor = (author: string | AuthorMetadata[]) => {
    if (typeof author === 'string') {
      return <span>{author}</span>;
    }
    
    if (Array.isArray(author)) {
      return (
        <div className="space-y-2">
          {author.map((auth, index) => (
            <div key={index} className="text-base">
              <span className="font-medium">{auth.name}</span>
              {auth.corresponding && <sup className="text-blue-600 ml-1">*</sup>}
              {auth.affiliations && (
                <sup className="ml-1">
                  {auth.affiliations.map(aff => aff.ref).join(',')}
                </sup>
              )}
              {auth.email && auth.corresponding && (
                <span className="text-sm text-gray-600 block">
                  Email: {auth.email}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(author)}</span>;
  };

  const renderAffiliations = () => {
    if (!metadata.affiliations || metadata.affiliations.length === 0) return null;
    
    return (
      <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Affiliations:</h4>
        {metadata.affiliations.map((aff, index) => (
          <div key={aff.id} className="mb-1">
            <sup>{aff.id}</sup> {aff.name}
            {aff.city && aff.country && `, ${aff.city}, ${aff.country}`}
          </div>
        ))}
      </div>
    );
  };

  const renderReferences = () => {
    if (!references || references.length === 0) return null;

    return (
      <div className="mt-8 pt-6 border-t">
        <h2 className="text-2xl font-bold mb-4">References</h2>
        <div className="space-y-3">
          {references.map((ref, index) => (
            <div key={ref.id} className="text-sm">
              <span className="font-medium">[{index + 1}]</span> {ref.author} ({ref.year}). 
              <em className="ml-1">{ref.title}</em>
              {ref.journal && <span>. {ref.journal}</span>}
              {ref.url && (
                <span>. Available at: <a href={ref.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{ref.url}</a></span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Process markdown to handle citations
  const processMarkdownWithCitations = (text: string) => {
    return text.replace(/\[@([^\]]+)\]/g, (match, citationKey) => {
      const refIndex = references.findIndex(ref => ref.id === citationKey);
      return refIndex !== -1 ? `[${refIndex + 1}]` : match;
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Eye className="h-5 w-5 mr-2" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="max-w-none overflow-y-auto max-h-[70vh]">
        {/* Metadata Section */}
        {(metadata.title || metadata.author || metadata.abstract) && (
          <div className="border-b pb-6 mb-6">
            {metadata.title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {metadata.title}
              </h1>
            )}
            {metadata.subtitle && (
              <h2 className="text-xl text-gray-700 mb-4">
                {metadata.subtitle}
              </h2>
            )}
            {metadata.author && (
              <div className="text-lg text-gray-600 mb-4">
                <strong>Authors:</strong>
                <div className="mt-2">
                  {renderAuthor(metadata.author)}
                </div>
              </div>
            )}
            {renderAffiliations()}
            {metadata.abstract && (
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{metadata.abstract}</p>
              </div>
            )}
            {metadata.keywords && metadata.keywords.length > 0 && (
              <div className="mt-4">
                <strong className="text-gray-900">Keywords:</strong>
                <span className="ml-2 text-gray-600">
                  {metadata.keywords.join(', ')}
                </span>
              </div>
            )}
            {metadata.funding && (
              <div className="mt-4 text-sm text-gray-600">
                <strong>Funding:</strong> {metadata.funding}
              </div>
            )}
          </div>
        )}

        {/* Markdown Content */}
        {markdown ? (
          <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-strong:text-gray-900 prose-strong:font-semibold">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-semibold text-gray-900 mt-5 mb-3">{children}</h3>,
                h4: ({children}) => <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h4>,
                h5: ({children}) => <h5 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h5>,
                h6: ({children}) => <h6 className="text-sm font-semibold text-gray-900 mt-3 mb-2">{children}</h6>,
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({children}) => <ul className="list-disc ml-6 mb-4 text-gray-700">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal ml-6 mb-4 text-gray-700">{children}</ol>,
                li: ({children}) => <li className="mb-1">{children}</li>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
              }}
            >
              {processMarkdownWithCitations(markdown)}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Start writing to see your content preview here...
          </p>
        )}

        {/* References Section */}
        {renderReferences()}
      </CardContent>
    </Card>
  );
};

export default LivePreview;
