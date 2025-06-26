**Current work focus:** Implementing two-way synchronization between the form view and BibTeX view in the Bibliography tab, and updating the BibTeX import functionality.
**Recent changes:**
- Implemented two-way synchronization between the form view and BibTeX view in the Bibliography tab.
- Updated the BibTeX import functionality.
- Modified `generateBibText` to accept `references` as an argument.
- Added `useEffect` hook to synchronize `bibText` with `references`.
- Added `handleBibTextChange` to parse BibTeX and update `references`.
- Updated `handleImportBibTeXFile` to use `handleBibTextChange`.
- Updated `addManualReference` to add new references at the top of the list.
- Moved `parseBibEntry` and `parseBibTeX` functions to `src/utils/bibliography.ts`.
- Removed one "Add Reference" button from the Bibliography tab.
**Next steps:** Verify the functionality of the Bibliography tab and ensure that the BibTeX import and export are working correctly. Consider adding unit tests for the bibliography functionality.