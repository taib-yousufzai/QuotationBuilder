# Implementation Plan: Quotation Enhancements

## Overview

This implementation plan breaks down the quotation enhancements into discrete coding tasks that build incrementally. The plan focuses on implementing section consolidation first, followed by the copy to builder feature, with comprehensive testing throughout.

## Tasks

- [x] 1. Create section consolidation utilities
  - Create `src/utils/sectionConsolidator.js` with functions to group and sort items by section
  - Implement `consolidateItemsBySection()` function to group items by section name
  - Implement `getSectionGroups()` function to return section-to-items mapping
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Write property tests for section consolidation utilities
  - **Property 1: Section consolidation consistency**
  - **Property 2: Section-based sorting**
  - **Property 3: Section total calculation**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Update QuotePreview component for section consolidation
  - Modify `src/components/QuotePreview.jsx` to use consolidated items for rendering
  - Update section header rendering logic to show single header per section
  - Ensure existing functionality (editing, calculations) remains intact
  - _Requirements: 1.1, 1.3, 1.5_

- [x] 2.1 Write unit tests for QuotePreview section rendering
  - Test section header consolidation with various item arrangements
  - Test that editing functionality works with consolidated sections
  - _Requirements: 1.1, 1.3_

- [x] 3. Create copy quotation service utilities
  - Create `src/utils/copyQuotationService.js` with copy functionality
  - Implement `copyQuotationToBuilder()` function to create quotation copies
  - Implement `generateNewQuotationNumber()` function for unique ID generation
  - _Requirements: 2.2, 2.3, 2.4, 2.6, 2.7_

- [x] 3.1 Write property tests for copy quotation service
  - **Property 5: Complete data preservation during copy**
  - **Property 6: Copy initialization**
  - **Property 8: Copy validation**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7, 4.1, 4.2**

- [x] 4. Checkpoint - Ensure core utilities pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Add Copy to Builder button to QuotationList
  - Modify `src/pages/QuotationList.jsx` to include "Copy to Builder" button
  - Add copy handler function with loading states and error handling
  - Implement navigation to builder with copied data
  - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.1 Write unit tests for QuotationList copy functionality
  - Test copy button rendering and click handling
  - Test loading states and error handling
  - Test navigation with copied data
  - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Update QuotationBuilder to handle copied data
  - Modify `src/pages/QuotationBuilder.jsx` to process copy URL parameters
  - Add copy data loading logic to component initialization
  - Ensure copied data properly populates all form fields and item list
  - _Requirements: 2.5, 2.6, 2.7, 4.3, 4.4_

- [x] 6.1 Write property tests for QuotationBuilder copy handling
  - **Property 7: Copy operation workflow**
  - **Property 9: Database independence**
  - **Validates: Requirements 2.5, 4.5**

- [x] 7. Update ViewQuotation page with Copy to Builder option
  - Modify `src/pages/ViewQuotation.jsx` to include "Copy to Builder" button
  - Add copy handler that uses the copy service utilities
  - Ensure consistent behavior with QuotationList copy functionality
  - _Requirements: 2.1, 2.5, 3.1, 3.2_

- [x] 7.1 Write unit tests for ViewQuotation copy functionality
  - Test copy button rendering and functionality
  - Test integration with copy service utilities
  - _Requirements: 2.1, 2.5_

- [x] 8. Checkpoint - Ensure copy functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update export and print functionality for section consolidation
  - Modify `src/utils/pdfExport.js` to use consolidated sections
  - Ensure printed quotations maintain section grouping
  - Test PDF export with consolidated sections
  - _Requirements: 1.5_

- [x] 9.1 Write property tests for export consolidation
  - **Property 4: Export consolidation preservation**
  - **Validates: Requirements 1.5**

- [x] 10. Add comprehensive integration tests
  - [x] 10.1 Create integration test for complete copy workflow
    - Test copying from list, editing in builder, and saving as new quotation
    - _Requirements: 2.1, 2.2, 2.5, 4.5_

  - [x] 10.2 Create integration test for section consolidation workflow
    - Test adding items to same section at different times
    - Verify consolidation in preview, export, and print
    - _Requirements: 1.1, 1.3, 1.5_

- [x] 11. Final testing and validation
  - [x] 11.1 Run all property-based tests with increased iterations
    - Ensure all properties pass with 100+ test iterations
    - _Requirements: All requirements_

  - [x] 11.2 Perform manual testing of user workflows
    - Test complete user journeys for both features
    - Verify error handling and edge cases
    - _Requirements: All requirements_

- [x] 12. Final checkpoint - Complete feature validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks include comprehensive testing and validation from the beginning
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests ensure end-to-end functionality works correctly