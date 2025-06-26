## System Architecture

Pubcraft is a client-side Progressive Web Application (PWA) built primarily with React and TypeScript. It follows a component-based architecture, leveraging React Context for global state management and custom hooks for reusable logic.

```mermaid
graph TD
    User --> PWA;
    PWA --> |ORCID OAuth| ORCID_API;
    PWA --> |GitHub API| GitHub_API;
    PWA --> |Offline Storage| localStorage;

    subgraph Frontend (React PWA)
        A[Main Application] --> B(Pages);
        B --> C(Components);
        C --> D(UI Components);
        A --> E(Contexts);
        A --> F(Hooks);
        A --> G(Utilities);
    end

    subgraph Data Flow
        localStorage --> |Offline Data| PWA;
        GitHub_API --> |Sync Data| PWA;
        ORCID_API --> |Auth Data| PWA;
    end

    subgraph Core Modules
        G_Auth[Authentication]
        G_GitHub[GitHub Integration]
        G_Editor[Markdown Editor]
        G_Persistence[Offline Persistence]
        G_Bibliography[Bibliography Management]
    end

    G --> G_Auth;
    G --> G_GitHub;
    G --> G_Editor;
    G --> G_Persistence;
    G --> G_Bibliography;
```

## Source Code Paths

- `/src/`: Root for all application source code.
- `/src/App.tsx`: Main application component.
- `/src/main.tsx`: Entry point for React application.
- `/src/pages/`: Contains top-level page components (e.g., `Editor.tsx`, `Index.tsx`).
- `/src/components/`: Houses reusable UI components.
    - `/src/components/editor/`: Specific components for the markdown editor.
    - `/src/components/github/`: Components related to GitHub integration UI.
    - `/src/components/ui/`: Shared UI components (likely from a library like Shadcn UI).
- `/src/contexts/`: React Context API providers for global state (e.g., `AuthContext.tsx`).
- `/src/hooks/`: Custom React hooks for encapsulating reusable logic (e.g., `useGitHubPersistence.ts`).
- `/src/utils/`: Utility functions and helper modules.
    - `/src/utils/orcidAuth.ts`: ORCID authentication logic.
    - `/src/utils/githubAuth.ts`, `/src/utils/github/`: GitHub authentication and API interaction logic.
    - `/src/utils/storage.ts`: `localStorage` management for PWA offline capabilities.
    - `/src/utils/bibliography.ts`: BibTeX parsing and management.
- `/src/types/`: TypeScript type definitions (e.g., `metadata.ts`).

## Key Technical Decisions

- **Frontend Framework**: React with TypeScript for a robust and scalable single-page application.
- **Build Tool**: Vite for fast development and optimized builds.
- **Styling**: Tailwind CSS for utility-first CSS, enabling rapid UI development and consistency.
- **Authentication**: ORCID OAuth 2.0 for secure and standardized user login.
- **Offline Capabilities**: Progressive Web App (PWA) architecture with `localStorage` for data persistence, ensuring offline editing.
- **GitHub Integration**: Direct interaction with GitHub API for repository management, file syncing, and version control.
- **Markdown Rendering**: Utilizes a markdown parsing library (to be confirmed, but implied by WYSIWYG editor) and KaTeX for mathematical equation rendering.
- **UI Component Library**: Appears to use a component library (e.g., Shadcn UI) for consistent and accessible UI elements.

## Design Patterns in Use

- **Component-Based Architecture**: Encapsulation of UI and logic into reusable components.
- **Context API**: Global state management for authentication and other shared data.
- **Custom Hooks**: Abstraction of stateful logic and side effects.
- **Service Workers**: For PWA offline capabilities and caching.

## Component Relationships

- `App.tsx` serves as the root, routing to different `pages/`.
- `pages/` components compose various `components/` to form views.
- `components/editor/` and `components/github/` are specialized components for core functionalities.
- `contexts/` provide data to components via the Context API.
- `hooks/` are consumed by components and pages for shared logic.
- `utils/` modules provide low-level functionalities used across the application.

## Critical Implementation Paths

- **Authentication Flow**: ORCID login, token management, and persistence across sessions.
- **GitHub Connection & Sync**: Establishing connection, selecting/creating repositories, handling branch strategy (`publish` vs. `draft-{firstname}`), and syncing changes with conflict resolution.
- **Offline Data Management**: Storing and retrieving markdown content and metadata from `localStorage` and syncing with GitHub when online.
- **Markdown Parsing & Rendering**: Correctly interpreting markdown, YAML metadata, BibTeX references, and KaTeX equations for live preview.
- **Repository Structure Enforcement**: Ensuring the correct directory and file naming conventions within the GitHub repository.