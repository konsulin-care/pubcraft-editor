**Current work focus:** Designing and implementing the cross-reference system for cited items in the live preview, with a focus on interactive citation elements and hover tooltips.

**Recent changes:**
- Investigated and fixed issues with `VITE_BYPASS_AUTH=true` environment variable
- Modified `src/utils/env-config.ts` to handle authentication bypass more robustly
- Updated `src/contexts/AuthContext.tsx` to implement immediate user state update when bypass is enabled
- Removed hardcoded `<script src="/env.js">` tag from `index.html`
- Verified local deployment authentication bypass using `serve -s dist -l 8080`

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
- Implement the interactive citation elements with hover tooltips in `LivePreview.tsx`.
- Ensure proper parsing and lookup of references.
- Address accessibility considerations for the new interactive elements.
- Conduct thorough testing of the cross-reference system.
- Verify the functionality of the Bibliography tab and ensure BibTeX import and export are working correctly.
- Consider adding unit tests for the bibliography functionality.
- Conduct thorough testing of the new authentication bypass mechanism.
- Review environment configuration management for potential improvements in security and flexibility.