# Pubcraft Editor

## Overview

Pubcraft is a WYSIWYG markdown editor designed for decentralized scientific publishing, with advanced features for academic writing and collaboration.

## Cross-Reference System

### Interactive Citations

Pubcraft introduces an advanced cross-reference system that transforms traditional markdown citations into interactive, informative elements.

#### Key Features

- **Dynamic Citation Rendering**: Convert `[@citation-key]` into interactive elements
- **Hover Tooltips**: Display full reference details on hover
- **Accessibility-First Design**: Keyboard and screen reader compatible

#### Citation Interaction Modes

1. **Hover Interaction**
   - Displays full reference details
   - Provides context without leaving the current view
   - Supports all reference types (article, book, conference, etc.)

2. **Click Interaction**
   - Optional deep dive into reference details
   - Potential future expansion for more comprehensive reference exploration

#### Technical Implementation

- **Parsing Strategy**: 
  - Uses regex `\[@([^\]]+)\]` to identify citation keys
  - Supports flexible citation key formats
  - Fallback mechanism for unmatched references

- **Reference Lookup**
  - Advanced matching strategies
  - Case-insensitive lookup
  - Partial key matching
  - Handles variations in citation key formats

#### Accessibility Considerations

- Keyboard navigable citations
- Screen reader compatible
- WCAG 2.1 AA compliance
- Semantic HTML roles
- Descriptive `aria-label` attributes

#### Performance Optimizations

- `React.memo()` for preventing unnecessary re-renders
- Conditional tooltip rendering
- Lazy loading of reference details
- Minimal computational overhead

### Supported Reference Types

- Academic Articles
- Books
- Conference Papers
- Technical Reports
- Preprints
- Theses and Dissertations

## Future Enhancements

- Multiple citation style support (APA, MLA, Chicago)
- Advanced reference preview
- External link validation
- Comprehensive reference management

## Technical Stack

- React with TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- KaTeX for equation rendering

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- ORCID Account

### Installation

```bash
git clone https://github.com/yourusername/pubcraft-editor.git
cd pubcraft-editor
npm install
npm run dev
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
