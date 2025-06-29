# Cross-Reference System Architecture

## Overview

The Pubcraft Cross-Reference System is a sophisticated markdown citation management and rendering mechanism designed to enhance academic writing and research documentation. It transforms traditional static citations into interactive, informative elements that provide rich context and improve user experience.

## System Components

### 1. Citation Parsing Engine

#### Parsing Strategies
- **Regex-based Extraction**:
  ```typescript
  const CITATION_REGEX = /\[@([^\]]+)\]/g;
  ```
- Supports multiple citation key formats
- Handles variations in bracketing and formatting

#### Key Parsing Functions
- `parseCitationKeys(markdown: string): string[]`
- `normalizeCitationKey(key: string): string`

### 2. Reference Lookup Mechanism

#### Matching Strategies
1. **Exact Match**
   - Case-insensitive ID comparison
   - Primary lookup method

2. **Partial Matching**
   - Author name and year-based matching
   - Handles variations in citation key formats

```typescript
function findReferenceByKey(
  citationKey: string,
  references: Reference[]
): Reference | undefined {
  // Exact match logic
  // Partial match fallback
}
```

### 3. Interactive Citation Component

#### Technical Specifications
- **Framework**: React with TypeScript
- **UI Library**: Shadcn UI Popover
- **Styling**: Tailwind CSS

#### Component Structure
```typescript
interface CitationProps {
  citationKey: string;
  reference: Reference;
  referenceIndex: number;
}

function InteractiveCitation({
  citationKey,
  reference,
  referenceIndex
}: CitationProps) {
  // ... (implementation details for popover, trigger, content)
}
```

#### Implementation Details
- **File**: `src/components/ui/interactive-citation.tsx`
- **Key Features**:
  - Renders a clickable `<span>` element for the citation.
  - Uses Shadcn UI `Popover` for displaying reference details on click.
  - Manages popover visibility state internally.
  - Displays reference index `[${referenceIndex + 1}]` for resolved citations.
  - Includes `tabIndex={0}` for keyboard focusability.
  - Handles `Enter` and `Space` key presses to toggle popover.
  - Applies `role="button"`, `aria-describedby`, and `aria-label` for accessibility.
  - Displays full reference details (title, author, year, journal, volume, pages, doi, url) within the popover.
  - Popover content is responsive with `w-full max-w-xs sm:max-w-sm md:max-w-md`.

### 4. Accessibility Architecture

#### WCAG 2.1 AA Compliance Features
- Keyboard navigable citations (`tabIndex={0}`, `onKeyDown` for `Enter`/`Space`).
- Screen reader compatibility (`role="button"`, `aria-describedby`, `aria-label`).
- Semantic HTML roles.
- Descriptive `aria-label` attributes for citation elements and popover content.

#### Implementation Details
- **Interactive Citation**: `src/components/ui/interactive-citation.tsx`
  - `tabIndex={0}` on the citation `<span>`.
  - `role="button"` for semantic meaning.
  - `aria-label` dynamically set to describe the citation.
  - `aria-describedby` links to the popover content for screen readers.
- **Popover Content**:
  - `role="tooltip"` for semantic meaning.
  - Unique `id` for `aria-describedby` linkage.

### 5. Performance Optimization Techniques

#### Rendering Strategies
- `React.memo()` for preventing unnecessary re-renders of the `InteractiveCitation` component.
- Conditional rendering of tooltip content (Shadcn UI `Popover` handles this efficiently).
- `useMemo` hook in `LivePreview.tsx` for `customComponents` to prevent re-creation on every render.

#### Implementation Details
- `InteractiveCitation` is wrapped with `React.memo`.
- `LivePreview` uses `useMemo` for its `customComponents` prop passed to `ReactMarkdown`.

### 6. Error Handling and Fallback Mechanisms

#### Citation Resolution Workflow
1. Attempt exact match using `findReferenceByKey`.
2. Try partial matching using `findReferenceByKey`.
3. Fallback to unresolved citation display.

#### Implementation Details
- **Unresolved Citations**: In `src/components/editor/LivePreview.tsx`, citations that do not find a match are rendered as:
  ```html
  <span data-unknown-citation-key="${citationKey}" class="text-red-500 cursor-help" title="Reference not found: ${citationKey}">[@${citationKey}]</span>
  ```
  This provides a visual cue (red text, help cursor) and a native tooltip (`title` attribute) to inform the user that the reference was not found.

## Advanced Features

### Planned Enhancements
- Multiple citation style support (e.g., APA, MLA, Chicago).
- External link validation for DOIs and URLs within references.
- Comprehensive reference preview with more detailed bibliographic information.
- Advanced reference management features (e.g., direct editing from popover).

## Technical Constraints

- Client-side rendering limitations.
- Browser `localStorage` size restrictions (though not directly impacted by this feature).
- Markdown parsing complexity.
- Performance with very large reference collections (addressed with memoization).

## Best Practices

- Lightweight reference data.
- Optimized regex and lookup algorithms.
- Accessibility-first design.
- Comprehensive error handling for unresolved citations.

## Integration Points

- Markdown Rendering Pipeline (`LivePreview.tsx`).
- Bibliography Management System (`src/utils/bibliography.ts`).
- Metadata Extraction.

## Monitoring and Logging

```typescript
interface CitationResolutionLog {
  citationKey: string;
  resolutionStatus: 'resolved' | 'partial' | 'unresolved';
  timestamp: Date;
}

function logCitationResolution(log: CitationResolutionLog) {
  // Implementation for tracking citation resolution performance
}
```

## Conclusion

The Pubcraft Cross-Reference System represents a sophisticated approach to academic citation management, balancing technical complexity with user-centric design and accessibility. The current implementation provides a robust foundation for interactive citations, with clear pathways for future enhancements.