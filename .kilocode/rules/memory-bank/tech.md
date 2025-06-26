## Technologies Used

- **Frontend Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Component Library**: Shadcn UI (inferred from `/src/components/ui/` directory structure)
- **Authentication**: ORCID OAuth 2.0
- **Offline Persistence**: `localStorage` (for PWA)
- **Version Control Integration**: GitHub API
- **Markdown Rendering**: Implied by WYSIWYG editor, likely a markdown parsing library (e.g., `marked`, `remark`)
- **Mathematical Equation Rendering**: KaTeX
- **Package Manager**: Bun (inferred from `bun.lockb`)

## Development Setup

- Node.js environment (implied by React/TypeScript/Vite)
- Bun as package manager

## Technical Constraints

- Client-side PWA, so all operations must be handled in the browser or via external APIs (GitHub, ORCID).
- Reliance on `localStorage` for offline data, which has size limitations.
- GitHub API rate limits need to be considered for frequent syncing.

## Dependencies

- React
- React Router (inferred from `pages/` and `App.tsx` routing)
- Tailwind CSS
- Shadcn UI components
- ORCID OAuth client library (or custom implementation)
- GitHub API client library (or custom implementation)
- Markdown parsing library
- KaTeX

## Tool Usage Patterns

- **Vite**: For development server and production builds.
- **ESLint**: For code linting (inferred from `eslint.config.js`).
- **TypeScript Compiler**: For type checking.