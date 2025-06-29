import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExtendedMetadata, Reference, AuthorMetadata } from '@/types/metadata';
import { findReferenceByKey } from '@/utils/bibliography';
import { InteractiveCitation } from '@/components/ui/interactive-citation';
import 'katex/dist/katex.min.css';

/**
 * Props for the LivePreview component
 * @interface
 */
interface LivePreviewProps {
  /** Markdown content to be rendered */
  markdown: string;
  /** Metadata associated with the document */
  metadata: ExtendedMetadata;
  /** Optional array of references for citations */
  references?: Reference[];
}

/**
 * LivePreview Component
 * 
 * Renders a live preview of markdown content with metadata, 
 * references, and interactive citations
 * 
 * @component
 * @param {LivePreviewProps} props - Component properties
 * @returns {React.ReactElement} Live preview of markdown document
 */
export const LivePreview: React.FC<LivePreviewProps> = ({ markdown, metadata, references = [] }) => {
  /**
   * Renders author information dynamically
   * Supports both string and array of author metadata
   * 
   * @function
   * @param {string | AuthorMetadata[]} author - Author information
   * @returns {React.ReactElement} Rendered author details
   */
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

  /**
   * Renders affiliations from metadata
   * 
   * @function
   * @returns {React.ReactElement | null} Rendered affiliations or null
   */
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

  /**
   * Renders the references section
   * 
   * @function
   * @returns {React.ReactElement | null} Rendered references or null
   */
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
              {ref.volume && <span>, {ref.volume}</span>}
              {ref.pages && <span>, {ref.pages}</span>}
              {ref.doi && <span>. DOI: {ref.doi}</span>}
              {ref.url && (
                <span>. Available at: <a href={ref.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{ref.url}</a></span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Processes markdown text to handle citations
   * Replaces citation keys with interactive citation elements
   * 
   * @function
   * @param {string} text - Markdown text to process
   * @returns {string} Processed markdown with interactive citations
   */
  const processMarkdownWithCitations = (text: string) => {
    const citationRegex = /\[@([^\]]+)\]/g;
    const processedText = text.replace(citationRegex, (match, citationKey) => {
      const reference = findReferenceByKey(citationKey, references);
      const referenceIndex = references.findIndex(ref => ref.id === citationKey);

      return reference && referenceIndex !== -1
        ? `<span data-citation-key="${citationKey}" data-reference-index="${referenceIndex}">[${referenceIndex + 1}]</span>`
        : `<span data-unknown-citation-key="${citationKey}" class="text-red-500 cursor-help" title="Reference not found: ${citationKey}">[@${citationKey}]</span>`;
    });

    return processedText;
  };

  // Memoized custom components for ReactMarkdown rendering
  const customComponents: Components = useMemo(() => ({
    h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
    h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-1">{children}</h2>,
    h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-5 mb-3">{children}</h3>,
    h4: ({children}) => <h4 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h4>,
    h5: ({children}) => <h5 className="text-base font-bold text-gray-900 mt-3 mb-2">{children}</h5>,
    h6: ({children}) => <h6 className="text-sm font-bold text-gray-900 mt-3 mb-2">{children}</h6>,
    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({children}) => <em className="italic text-gray-800">{children}</em>,
    p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
    ul: ({children}) => <ul className="list-disc ml-6 mb-4 text-gray-700">{children}</ul>,
    ol: ({children}) => <ol className="list-decimal ml-6 mb-4 text-gray-700">{children}</ol>,
    li: ({children}) => <li className="mb-1">{children}</li>,
    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-300 bg-blue-50 pl-4 py-2 italic text-gray-700 my-4 rounded-r">{children}</blockquote>,
    code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
    pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4 border">{children}</pre>,
    table: ({children}) => <table className="w-full border-collapse border border-gray-300 my-4">{children}</table>,
    th: ({children}) => <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">{children}</th>,
    td: ({children}) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
    span: ({ node, children, ...props }) => {
      if (node?.properties?.dataCitationKey) {
        const citationKey = node.properties.dataCitationKey as string;
        const referenceIndex = parseInt(node.properties.dataReferenceIndex as string, 10);
        const reference = findReferenceByKey(citationKey, references);

        if (reference) {
          return (
            <InteractiveCitation
              citationKey={citationKey}
              reference={reference}
              referenceIndex={referenceIndex}
            />
          );
        }
      } else if (node?.properties?.dataUnknownCitationKey) {
        const unknownCitationKey = node.properties.dataUnknownCitationKey as string;
        return (
          <span
            className="text-red-500 cursor-help"
            title={`Reference not found: ${unknownCitationKey}`}
          >
            {children}
          </span>
        );
      }
      return <span {...props}>{children}</span>;
    }
  }), [references]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-6 py-4">
          <div className="max-w-none">
            {/* Metadata Section */}
            {(metadata.title || metadata.author || metadata.abstract) && (
              <div className="border-b pb-6 mb-6">
                {metadata.title && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {metadata.title}
                  </h1>
                )}
                {metadata.subtitle && (
                  <h2 className="text-xl text-gray-700 mb-4 leading-relaxed">
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
              <div className="prose prose-gray max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-3 prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2 prose-h5:text-base prose-h5:mt-3 prose-h5:mb-2 prose-h6:text-sm prose-h6:mt-3 prose-h6:mb-2 prose-p:mb-4 prose-p:leading-relaxed prose-strong:font-semibold prose-em:italic prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:mb-4">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                  components={customComponents}
                >
                  {processMarkdownWithCitations(markdown)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 italic text-lg">
                  Start writing to see your content preview here...
                </p>
              </div>
            )}

            {/* References Section */}
            {renderReferences()}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
