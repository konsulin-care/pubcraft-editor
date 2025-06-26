Pubcraft is a WYSIWYG markdown editor designed for decentralized scientific publishing. It authenticates users via ORCID login and connects directly to a GitHub repository to enable decentralized publication.

**Core Requirements:**
- Build a Progressive Web App (PWA) that supports offline editing by storing all data in `localStorage`.
- When an internet connection is available, the app should automatically sync changes to a connected GitHub repository.

**Goals:**
- Allow users to log in using their ORCID account.
- Enable users to connect to a GitHub repository and persist this connection across sessions, so they do not need to reconnect on each login.
- Allow users to sync their markdown documents to the selected GitHub repository.
