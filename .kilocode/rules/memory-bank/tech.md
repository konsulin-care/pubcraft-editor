## Environment Configuration Architecture

### Runtime Environment Variable Injection
- **Mechanism:** Dynamic `env.js` generation at container startup
- **Location:** `entrypoint.sh`
- **Key Features:**
  - Sanitizes input to prevent script injection (note: previously too aggressive, now refined)
  - Validates environment variables
  - Provides fallback and error handling

### Environment Configuration Utility
- **Location:** `src/utils/env-config.ts`
- **Technologies:**
  - Zod for type-safe validation
  - TypeScript for type checking
- **Configuration Sources:**
  1. Runtime injected variables (`window.ENV`)
  2. Vite build-time environment variables
  3. Fallback default values

### Security Considerations
- Input sanitization
- Strict variable validation
- Prevention of script injection
- Comprehensive error logging

### Deployment Flexibility
- Supports multiple configuration methods:
  - Docker environment variables
  - Docker Compose
  - Kubernetes Secrets
  - Local `.env` files

### Debug and Logging
- Debug mode with detailed configuration warnings
- Console logging for missing or default configurations
- Runtime error tracking

## Configuration Management Constraints
- Sensitive variables must not be baked into the image
- Support for runtime configuration injection
- Maintain consistent configuration across environments

## Technical Dependencies
- Runtime Configuration:
  - Zod (v3.x)
  - TypeScript (v5.x)
- Deployment Tools:
  - Docker
  - Kubernetes
  - Docker Compose

## Performance Considerations
- Minimal overhead for environment variable parsing
- Lazy loading of configuration
- Cached configuration singleton

## Technologies Used

- **Frontend Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Component Library**: Shadcn UI (confirmed from `/src/components/ui/` directory structure)
- **Authentication**: ORCID OAuth 2.0
- **Offline Persistence**: `localStorage` (for PWA) with race condition prevention
- **Version Control Integration**: GitHub API
- **Markdown Rendering**: `react-markdown` with `remark-math` and `rehype-katex`
- **Mathematical Equation Rendering**: KaTeX
- **Package Manager**: npm (inferred from `package-lock.json`)
- **Cross-Reference System**: Custom implementation using React components and `findReferenceByKey` utility.

## Development Setup

- Node.js environment (implied by React/TypeScript/Vite)
- npm as package manager

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