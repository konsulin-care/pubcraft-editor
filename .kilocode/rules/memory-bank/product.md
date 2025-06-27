Pubcraft is a WYSIWYG markdown editor designed for decentralized scientific publishing. It supports ORCID-based authentication and integrates directly with GitHub for content versioning and publishing.

## Features & Metadata Handling

- Users can add complex YAML metadata as a document header. Metadata includes fields such as `title`, `subtitle`, `abstract`, `author`, `affiliations`, `funding`, and `keywords`.
- Author details (e.g., name and email) are pulled from the user's ORCID profile.
- Each author can have roles and affiliations, and affiliations are uniquely referenced by ID with automatic reordering when affiliations are removed.
- **Enhanced UI**: Affiliations and Roles fields use dropdown multiselect combo boxes for improved user experience.
- **Robust Persistence**: Metadata survives browser refreshes through improved localStorage management with race condition prevention.
- Bibliographies are managed via BibTeX. Users can import `.bib` files or input entries manually.
- All content, including metadata and references, is rendered together in preview mode.
- Math equations are supported via KaTeX.

An example of accepted metadata:

```
title: Title of the manuscript
subtitle: Subtitle of the manuscript
abstract: |
  Abstract content.  

  The abstract may contain several paragraphs.
author:
  - name: Author Name, obtained from ORCID user name
    corresponding: true
    email: Author Email, obtained form ORCID email address
    affiliations:
      - ref: affiliation-1
      - ref: affiliation-2
    roles: [conceptualization, methodology, analysis, visualization, writing-original-draft, writing-review-editing]
affiliations:
  - id: affiliation-1
    name: University of Somewhere
    city: City Name
    country: Country Name
  - id: affiliation-2
    name: Research Institute
    city: Another City
    country: Another Country
funding: "The author(s) received no specific funding for this work."
keywords:
  - Keyword 1
  - Keyword 2
```

### Metadata Management Features

- **Affiliation Management**: Sequential ID numbering (1, 2, 3, etc.) with automatic reordering when affiliations are removed
- **Author Roles**: Predefined academic roles including conceptualization, data-curation, formal-analysis, funding-acquisition, investigation, methodology, project-administration, resources, software, supervision, validation, visualization, writing-original-draft, and writing-review-editing
- **Multiselect Interface**: Both affiliations and roles use dropdown multiselect combo boxes with search functionality and badge display
- **Reference Integrity**: Author affiliation references are automatically updated when affiliations are modified or removed

## App Requirements

- Must be a Progressive Web App (PWA) with offline editing capabilities using `localStorage`.
- **Reliable Persistence**: Enhanced localStorage management prevents data loss on browser refresh through race condition prevention.
- When online, content should automatically sync with a connected GitHub repository.

## GitHub Integration

When connecting a GitHub account, users can:

1. **Use an existing repository**:
   - Select a branch.
   - Select a markdown file to edit.

2. **Create a new repository**:
   - Choose an account/organization.
   - Set a repository name.
   - Initialize the repository with the currently saved file.

### Branch Strategy

Upon connecting to GitHub, ensure two branches exist:

- `publish`: for finalized content.
- `draft-{firstname}`: the working branch, created dynamically using the user's first name.

This prevents conflicting changes by isolating drafts from the published content.

## Repository Structure

If the existing repo already matches the required structure, preserve it. Otherwise, enforce the following structure in new branches:

```
[root]
└── draft
    └── title-of-manuscript
        ├── extra-file
        ├── pubcraft-manuscript.md
        └── pubcraft-reference.bib
```

- `title-of-manuscript`: a slugified, lowercase, dash-separated version of the manuscript title. Replace non-English or accented characters with plain ASCII.
- `pubcraft-manuscript.md`: the main markdown file.
- `pubcraft-reference.bib`: a combined BibTeX file, created by merging all detected `.bib` files.
- `extra-file`: any other original files/directories from the manuscript folder (if using an existing repo). Do not modify them.

If the manuscript title changes, update the directory name accordingly.

## Syncing & Git Rules

- All changes are committed to the `draft-{firstname}` branch.
- A **Merge** button (next to Save) allows users to merge changes into `publish`.
- If no conflicts exist, auto-merge. If conflicts occur, leave the merge request open and notify the user with a GitHub link to resolve manually.

## Persistent GitHub Link

Once a user links their GitHub account, this connection must persist across sessions. Upon re-login, the GitHub integration should remain active without requiring the user to reconnect.
