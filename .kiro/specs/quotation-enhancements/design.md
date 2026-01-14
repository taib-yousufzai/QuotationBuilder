# Design Document: Quotation Enhancements

## Overview

This design document outlines the implementation approach for two key enhancements to the quotation builder application:

1. **Section Consolidation**: Automatically group items with the same section name under a single header, eliminating duplicate section headers when items are added to the same room at different times.

2. **Copy to Builder Feature**: Allow users to duplicate existing quotations into the builder for editing, enabling efficient creation of similar quotations.

The solution maintains the existing React architecture, Firebase integration, and user interface patterns while adding these new capabilities seamlessly.

## Architecture

### Current Architecture Analysis

The application follows a React-based architecture with:
- **Frontend**: React with functional components and hooks
- **State Management**: Local component state using useState
- **Routing**: React Router for navigation
- **Database**: Firebase Firestore for quotation persistence
- **Data Flow**: Props drilling for component communication

### Enhanced Architecture

The enhancements will integrate into the existing architecture by:
- Adding utility functions for section consolidation
- Extending the QuotationList component with copy functionality
- Enhancing the QuotationBuilder component to handle copied data
- Maintaining existing Firebase operations with new copy logic

## Components and Interfaces

### 1. Section Consolidation System

#### SectionConsolidator Utility
```javascript
// Location: src/utils/sectionConsolidator.js
export const consolidateItemsBySection = (items) => {
  // Groups items by section and maintains order within sections
  // Returns consolidated array with proper section grouping
}

export const getSectionGroups = (items) => {
  // Returns map of section names to their items
  // Used for section-based operations and display
}
```

#### Enhanced QuotePreview Component
- **Modified rendering logic**: Use consolidated items for display
- **Section header logic**: Show single header per unique section
- **Maintained functionality**: All existing features preserved

### 2. Copy to Builder Feature

#### CopyQuotationService
```javascript
// Location: src/utils/copyQuotationService.js
export const copyQuotationToBuilder = (quotationData) => {
  // Creates a copy of quotation with new ID and current date
  // Preserves all item and configuration data
  // Returns formatted data for builder consumption
}

export const generateNewQuotationNumber = () => {
  // Generates new quotation number following existing pattern
  // Increments counter and formats as LI-XXXX
}
```

#### Enhanced QuotationList Component
- **New Copy Button**: Added alongside existing action buttons
- **Copy Handler**: Implements copy logic and navigation
- **Loading States**: Shows progress during copy operation
- **Error Handling**: Displays appropriate error messages

#### Enhanced QuotationBuilder Component
- **Copy Data Handler**: Processes copied quotation data
- **State Initialization**: Loads copied data into component state
- **URL Parameter Support**: Handles copy operation via URL parameters

## Data Models

### Quotation Data Structure (Existing)
```javascript
{
  docNo: string,           // Quotation number (e.g., "LI-0001")
  clientName: string,      // Client name
  location: string,        // Project location
  projectTitle: string,    // Project title
  date: string,           // Date in YYYY-MM-DD format
  discount: number,       // Discount percentage
  handling: number,       // Handling charges percentage
  tax: number,           // Tax percentage
  terms: string,          // Terms and conditions
  rows: Array<Item>,      // Array of quotation items
  createdAt: string,      // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

### Item Data Structure (Existing)
```javascript
{
  section: string,        // Section name (e.g., "KITCHEN", "WASHROOM")
  name: string,          // Item name
  description: string,   // Item description
  unit: string,         // Unit of measurement
  qty: number,          // Quantity
  rateClient: number,   // Client-facing price
  rateActual: number,   // Actual cost (staff mode only)
  remark: string        // Additional remarks
}
```

### Consolidated Section Structure (New)
```javascript
{
  sectionName: string,           // Section identifier
  items: Array<Item>,           // Items in this section
  totalItems: number,           // Count of items in section
  sectionTotal: number,         // Total value for section
  displayOrder: number          // Order for display purposes
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

**Consolidation Opportunities:**
- Properties 2.2, 2.6, and 2.7 all test data preservation during copy - these can be combined into one comprehensive property
- Properties 2.3 and 2.4 both test quotation initialization during copy - these can be combined
- Properties 4.3 and 4.4 both test data relationship preservation - these can be combined with the main data preservation property
- Properties 3.3, 3.4, and 3.5 are all UI feedback examples that don't need separate properties

**Final Property Set:**
The following properties provide comprehensive coverage without redundancy:

### Section Consolidation Properties

**Property 1: Section consolidation consistency**
*For any* list of items with section names, when displayed in the quotation preview, all items with the same section name should appear under a single section header regardless of the order they were added.
**Validates: Requirements 1.1, 1.3**

**Property 2: Section-based sorting**
*For any* list of quotation items, when displayed in the preview, items should be sorted first by section name alphabetically, then by the order they were added within each section.
**Validates: Requirements 1.2**

**Property 3: Section total calculation**
*For any* quotation with items in the same section, the section total should equal the sum of all item amounts in that section regardless of when the items were added.
**Validates: Requirements 1.4**

**Property 4: Export consolidation preservation**
*For any* quotation with consolidated sections, when exported or printed, the output should maintain the same section grouping as displayed in the preview.
**Validates: Requirements 1.5**

### Copy to Builder Properties

**Property 5: Complete data preservation during copy**
*For any* valid quotation, when copied to the builder, all quotation data including client details, items, sections, descriptions, quantities, prices, and calculation settings should be preserved exactly.
**Validates: Requirements 2.2, 2.6, 2.7, 4.3, 4.4**

**Property 6: Copy initialization**
*For any* quotation being copied, the copy should receive a new unique quotation number and today's date while preserving all other data.
**Validates: Requirements 2.3, 2.4**

**Property 7: Copy operation workflow**
*For any* successful copy operation, the user should be navigated to the builder page with the copied data properly loaded and ready for editing.
**Validates: Requirements 2.5**

**Property 8: Copy validation**
*For any* quotation copy attempt, if required data is missing, the operation should fail with a descriptive error message and no partial copy should be created.
**Validates: Requirements 4.1, 4.2**

**Property 9: Database independence**
*For any* copied quotation that is saved, it should be stored as a new independent document in the database with no references to the original quotation.
**Validates: Requirements 4.5**

**Property 10: UI button presence**
*For any* quotation displayed in the quotation list, a "Copy to Builder" button should be visible and functional alongside other action buttons.
**Validates: Requirements 2.1, 3.2**

## Error Handling

### Section Consolidation Error Handling

1. **Invalid Section Names**: Handle null, undefined, or empty section names by assigning items to a default "General" section
2. **Malformed Item Data**: Validate item structure and provide default values for missing properties
3. **Sorting Failures**: Implement fallback sorting by item index if section-based sorting fails

### Copy Operation Error Handling

1. **Network Failures**: Display user-friendly error messages for Firebase connection issues
2. **Data Validation Failures**: Provide specific error messages for missing or invalid quotation data
3. **Navigation Failures**: Handle routing errors gracefully and provide alternative navigation options
4. **Quota Number Generation Failures**: Implement retry logic and fallback number generation

### User Experience Error Handling

1. **Loading States**: Show appropriate loading indicators during long operations
2. **Success Feedback**: Provide clear confirmation messages for successful operations
3. **Error Recovery**: Offer users options to retry failed operations or return to previous state

## Testing Strategy

### Dual Testing Approach

The implementation will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will focus on:
- Specific examples of section consolidation with known data sets
- Copy operation success and failure scenarios
- UI component rendering and interaction
- Error handling edge cases
- Integration points between components

**Property-Based Tests** will focus on:
- Universal properties that hold for all valid inputs
- Section consolidation behavior across random item combinations
- Data preservation during copy operations with generated quotations
- Validation logic with various data configurations

### Property-Based Testing Configuration

- **Testing Library**: Use `fast-check` for JavaScript property-based testing
- **Test Iterations**: Minimum 100 iterations per property test
- **Test Tagging**: Each property test will reference its design document property
- **Tag Format**: `// Feature: quotation-enhancements, Property {number}: {property_text}`

### Testing Coverage Areas

1. **Section Consolidation Testing**:
   - Generate random item arrays with various section combinations
   - Test consolidation logic with edge cases (empty sections, special characters)
   - Verify sorting behavior with different item orders and section names

2. **Copy Operation Testing**:
   - Generate random quotation data structures
   - Test copy operations with various data completeness levels
   - Verify data integrity through copy and save operations

3. **Integration Testing**:
   - Test complete user workflows from list to copy to builder
   - Verify Firebase operations with test data
   - Test navigation and state management integration

4. **UI Testing**:
   - Test component rendering with various data states
   - Verify user interaction flows and feedback mechanisms
   - Test responsive behavior and accessibility features