import React, { useState } from 'react';
import { Reference } from '@/types/metadata';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

/**
 * Props for the InteractiveCitation component
 * @interface
 */
interface InteractiveCitationProps {
  /** Unique key identifying the citation */
  citationKey: string;
  /** Zero-based index of the reference in the references array */
  referenceIndex: number;
  /** The full reference object containing citation details */
  reference: Reference;
}

/**
 * Interactive Citation Component
 * 
 * Renders a clickable/hoverable citation that displays reference details in a tooltip
 * Provides keyboard and screen reader accessibility
 * 
 * @component
 * @param {InteractiveCitationProps} props - Component properties
 * @returns {React.ReactElement} Interactive citation element
 */
export const InteractiveCitation: React.FC<InteractiveCitationProps> = React.memo(({
  citationKey,
  referenceIndex,
  reference
}) => {
  /** State to control tooltip/popover visibility */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggles the visibility of the citation tooltip
   * @function
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handles keyboard events for accessibility
   * Allows opening/closing tooltip with Enter or Space key
   * 
   * @function
   * @param {React.KeyboardEvent<HTMLSpanElement>} event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          aria-describedby={`citation-tooltip-${citationKey}`}
          aria-label={`Citation for ${reference.title}`}
          className="inline-block cursor-pointer group hover:bg-gray-100 rounded px-1 transition-colors"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          [{referenceIndex + 1}]
        </span>
      </PopoverTrigger>
      <PopoverContent 
        id={`citation-tooltip-${citationKey}`}
        role="tooltip"
        className="w-full max-w-xs sm:max-w-sm md:max-w-md p-4 bg-white border rounded-lg shadow-lg"
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-base text-gray-900">{reference.title}</h4>
          
          {reference.author && (
            <p className="text-sm text-gray-700">
              <strong>Authors:</strong> {reference.author}
            </p>
          )}
          
          {reference.year && (
            <p className="text-sm text-gray-700">
              <strong>Year:</strong> {reference.year}
            </p>
          )}
          
          {reference.journal && (
            <p className="text-sm text-gray-700">
              <strong>Journal:</strong> {reference.journal}
            </p>
          )}
          
          {reference.volume && (
            <p className="text-sm text-gray-700">
              <strong>Volume:</strong> {reference.volume}
            </p>
          )}
          
          {reference.pages && (
            <p className="text-sm text-gray-700">
              <strong>Pages:</strong> {reference.pages}
            </p>
          )}
          
          {reference.doi && (
            <a
              href={`https://doi.org/${reference.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline block mt-2"
            >
              DOI: {reference.doi}
            </a>
          )}
          
          {reference.url && !reference.doi && (
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline block mt-2"
            >
              View Full Reference
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

InteractiveCitation.displayName = 'InteractiveCitation';