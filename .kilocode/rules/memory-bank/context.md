**Current work focus:** Implemented and documented the cross-reference system for cited items in the live preview, including interactive citation elements and hover tooltips.

**Recent changes:**
- Investigated and fixed blank white screen issue on deployment due to environment variable configuration errors.
- Identified that the `sanitize_input` function in `entrypoint.sh` was too aggressive, stripping essential characters (like `&`) from environment variables, leading to `undefined` values during Zod validation in `src/utils/env-config.ts`.
- Modified `entrypoint.sh` to relax the sanitization of environment variables, allowing valid characters in URLs and other complex strings.
- Verified that `index.html` correctly loads `env.js`.

**Previous work on Bibliography:**
- Implemented two-way synchronization between the form view and BibTeX view in the Bibliography tab
- Updated the BibTeX import functionality
- Modified `generateBibText` to accept `references` as an argument
- Added `useEffect` hook to synchronize `bibText` with `references`
- Added `handleBibTextChange` to parse BibTeX and update `references`
- Updated `handleImportBibTeXFile` to use `handleBibTextChange`
- Updated `addManualReference` to add new references at the top of the list
- Moved `parseBibEntry` and `parseBibTeX` functions to `src/utils/bibliography.ts`
- Removed one "Add Reference" button from the Bibliography tab

**Next steps:**
- Conduct thorough testing of the cross-reference system to ensure full functionality and stability.
- Verify the functionality of the Bibliography tab and ensure BibTeX import and export are working correctly.
- Consider adding unit tests for the bibliography functionality.