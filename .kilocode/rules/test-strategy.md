# Pubcraft Editor Test Strategy

## Overview
This document outlines the comprehensive testing strategy for the Pubcraft Editor, a Progressive Web App (PWA) for scientific markdown editing.

## Recommended Dependencies

To implement the testing strategy, the following dependencies should be added to the project:

### Testing Framework and Libraries

- `vitest`: Vite-native test runner
- `@testing-library/react`: React component testing utilities
- `@testing-library/user-event`: Simulate user interactions
- `@testing-library/jest-dom`: Additional DOM matchers
- `jsdom`: Simulate browser environment for testing
- `@types/testing-library__react`: TypeScript type definitions

### Installation Command

```bash
bun add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### Recommended Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Framework and Tools
- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Assertion Library**: Vitest's built-in assertions
- **Mocking**: Vitest's mocking capabilities
- **Coverage**: Built-in Vitest coverage reporting

## Test Categories

### 1. Unit Tests
Focus on testing individual functions and utilities in isolation.

**Locations**: 
- Co-located with source files (e.g., `src/utils/bibliography.test.ts`)
- Test files named `[originalFileName].test.ts`

**Key Areas**:
- Utility functions in `src/utils/`
  - `bibliography.ts`: BibTeX parsing, entry generation
  - `github.ts`: GitHub API interaction helpers
  - `storage.ts`: localStorage management
  - `orcidAuth.ts`: Authentication utilities

- Custom Hooks in `src/hooks/`
  - `useEditorState.ts`: Editor state management
  - `useGitHubPersistence.ts`: GitHub sync logic

### 2. Component Tests
Verify React components render correctly and interact as expected.

**Locations**:
- Co-located with component files (e.g., `src/components/MetadataEditor.test.tsx`)
- Test files named `[componentName].test.tsx`

**Testing Approach**:
- Render components in isolation
- Test prop handling
- Verify event interactions
- Check conditional rendering
- Snapshot testing for UI consistency

**Key Components to Test**:
- `MetadataEditor`
- `BibliographyManager`
- `MarkdownEditor`
- `LivePreview`
- `GitHubSaveButton`
- Authentication and GitHub connection components

### 3. Integration Tests
Validate complex workflows and interactions between components.

**Locations**:
- `src/integration/`
- Test files named with workflow description (e.g., `AuthWorkflow.test.ts`)

**Key Workflows**:
- Authentication flow
- GitHub repository connection
- Offline editing and synchronization
- Metadata and bibliography management
- Markdown editing and preview

## Test Configuration

### Vitest Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: ['src/**/*.d.ts', 'src/components/ui/**']
    }
  }
})
```

### Test Setup

Create `vitest.setup.ts` for global test configurations:

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock other browser APIs as needed
```

## Best Practices
- Aim for 80%+ test coverage
- Write tests before or alongside feature implementation
- Keep tests simple and focused
- Mock external dependencies
- Use meaningful test descriptions

## Continuous Integration
Integrate tests into GitHub Actions workflow:
- Run on every pull request
- Enforce coverage thresholds
- Block merging if tests fail

## Incremental Adoption
1. Start with utility function tests
2. Add component tests for critical UI components
3. Implement integration tests for key workflows
4. Gradually increase test coverage

## Tools and Commands

```bash
# Run tests
bun test

# Run tests with watch mode
bun test:watch

# Generate coverage report
bun test:coverage
```