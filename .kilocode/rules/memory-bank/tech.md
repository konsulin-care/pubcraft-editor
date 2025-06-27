## Technologies Used

- **Frontend Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Component Library**: Shadcn UI (confirmed from `/src/components/ui/` directory structure)
- **Authentication**: ORCID OAuth 2.0
- **Offline Persistence**: `localStorage` (for PWA) with race condition prevention
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
- **Race Condition Management**: Critical requirement for localStorage persistence to prevent data loss on refresh.

## PWA Capabilities Enhancement

### Offline Persistence Improvements
- **Advanced Service Worker Caching Strategy**
  - Dynamic cache versioning using daily timestamps
  - Network-First fetch strategy with intelligent caching
  - Automatic cache cleanup mechanism
  - Minimal performance overhead

### Service Worker Technical Implementation
- **Cache Versioning**
  - Daily unique cache generation
  - Prevents accumulation of stale cached resources
  - Ensures up-to-date content delivery

### Offline Experience
- **Fallback Page Design**
  - Custom `/offline.html` with responsive layout
  - Clear user guidance during network disconnection
  - Maintains application context and state

### Performance Considerations
- Immediate service worker activation
- Graceful network failure handling
- Comprehensive asset precaching
- Minimal impact on application load time

## Dependencies

- React
- React Router (inferred from `pages/` and `App.tsx` routing)
- Tailwind CSS
- Shadcn UI components (including MultiSelect component)
- ORCID OAuth client library (or custom implementation)
- GitHub API client library (or custom implementation)
- Markdown parsing library
- KaTeX

## Tool Usage Patterns

- **Vite**: For development server and production builds.
- **ESLint**: For code linting (inferred from `eslint.config.js`).
- **TypeScript Compiler**: For type checking.

## Critical Technical Implementations

### localStorage Persistence Architecture
- **Race Condition Prevention**: Uses `draftLoaded` and `initialLoadComplete` flags in `useEditorState.ts` to prevent competing useEffect hooks from overwriting loaded data
- **State Tracking**: Careful management of loading states to ensure user data updates don't interfere with draft restoration
- **Autosave Logic**: Implemented in `storage.ts` with proper condition checking for metadata changes

### Metadata Management System
- **Affiliation ID Management**: Sequential numbering with automatic reordering when affiliations are removed
- **Reference Integrity**: Automatic updating of author affiliation references when affiliation IDs change
- **Multiselect UI**: Dropdown combo boxes with search functionality and badge display for complex metadata fields

### Component Architecture Patterns
- **Custom Hooks**: `useEditorState.ts` encapsulates complex state management with persistence
- **Controlled Components**: MetadataEditor uses controlled inputs with proper state synchronization
- **Reusable UI Components**: MultiSelect component provides consistent interface for complex selections

### Offline Resilience Patterns
- Intelligent network request handling
- Seamless background updates
- Consistent user experience across connectivity states