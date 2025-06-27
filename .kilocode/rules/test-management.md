# Test File Management Rules

## Overview
Every feature or utility in the Pubcraft Editor MUST have accompanying test files to ensure code quality, reliability, and maintainability.

## Test File Location and Naming Conventions

### Utility Functions
- Location: Co-located with the source file
- Naming Pattern: `[originalFileName].test.ts`
- Example: 
  - Source: `src/utils/bibliography.ts`
  - Test: `src/utils/bibliography.test.ts`

### Components
- Location: Co-located with the component file
- Naming Pattern: `[ComponentName].test.tsx`
- Example:
  - Source: `src/components/MetadataEditor.tsx`
  - Test: `src/components/MetadataEditor.test.tsx`

### Hooks
- Location: Co-located with the hook file
- Naming Pattern: `[hookName].test.ts`
- Example:
  - Source: `src/hooks/useEditorState.ts`
  - Test: `src/hooks/useEditorState.test.ts`

## Test Coverage Requirements

### Utility Functions
- Test all public methods
- Cover edge cases and error scenarios
- Validate input parsing
- Test boundary conditions

### Components
- Render testing
- Prop handling
- Event interaction
- Conditional rendering
- Snapshot testing for UI consistency

### Hooks
- State management
- Side effect handling
- Integration with React lifecycle

## Test Writing Guidelines

1. **Isolation**: Test each unit in isolation
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert** pattern
4. **Mock External Dependencies**
5. **Cover Happy Paths and Error Scenarios**

## Continuous Integration

- All tests must pass before merging
- Aim for 80%+ test coverage
- Automatically run on every pull request
- Block merging if tests fail or coverage drops below threshold

## Example Test Structure

```typescript
describe('Bibliography Utility', () => {
  it('should parse valid BibTeX entry', () => {
    // Arrange
    const bibEntry = '@article{key,title="Test Title"}';
    
    // Act
    const result = parseBibEntry(bibEntry);
    
    // Assert
    expect(result).toEqual({
      type: 'article',
      key: 'key',
      title: 'Test Title'
    });
  });

  it('should handle parsing errors gracefully', () => {
    // Arrange
    const invalidEntry = 'Invalid BibTeX';
    
    // Act & Assert
    expect(() => parseBibEntry(invalidEntry)).toThrow();
  });
});
```

## Workflow Integration

- New features must include corresponding test files
- Tests are automatically discovered and run by Vitest
- Coverage reports generated on each test run