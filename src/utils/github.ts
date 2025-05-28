
// Re-export types and functions from refactored modules
export * from './github/types';
export * from './github/repository';
export * from './github/core';

// Legacy imports for backward compatibility
import { Metadata } from './github/types';

// Generate file path for submission
export function getSubmissionPath(orcid: string, date = new Date()): string {
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
  return `submissions/${orcid}-${dateString}.md`;
}

// Generate branch name for submission
export function getSubmissionBranch(orcid: string, date = new Date()): string {
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
  return `submission/${orcid}-${dateString}`;
}

// Merge metadata with markdown using frontmatter
export function generateMarkdownWithFrontmatter(metadata: Metadata, markdown: string): string {
  const yaml = `---
title: ${metadata.title}
author: ${metadata.author}
abstract: |
  ${metadata.abstract}
---

`;
  return yaml + markdown;
}

// Generate pull request body using metadata
export function generatePRBody(metadata: Metadata): string {
  return `**Title**: ${metadata.title}
**Author**: ${metadata.author}

**Abstract**:
${metadata.abstract}

---

This is an automated submission created via the PubCraft editor.`;
}
