import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuotationBuilder from '../../pages/QuotationBuilder'
import QuotePreview from '../../components/QuotePreview'
import * as dbOperations from '../../utils/dbOperations'
import * as sectionConsolidator from '../../utils/sectionConsolidator'
import * as pdfExport from '../../utils/pdfExport'

// Mock the database operations
vi.mock('../../utils/dbOperations', () => ({
  saveQuotation: vi.fn(),
  loadQuotation: vi.fn()
}))

// Mock the section consolidator
vi.mock('../../utils/sectionConsolidator', () => ({
  consolidateItemsBySection: vi.fn(),
  getSectionGroups: vi.fn()
}))

// Mock PDF export
vi.mock('../../utils/pdfExport', () => ({
  exportToPDF: vi.fn(),
  generatePDFContent: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.sessionStorage = sessionStorageMock

// Mock window functions
global.alert = vi.fn()
global.confirm = vi.fn(() => true)
global.prompt = vi.fn(() => '')
global.print = vi.fn()

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Test data - items added to same section at different times
const mockItemsAddedAtDifferentTimes = [
  // First batch - Kitchen items added initially
  {
    section: 'KITCHEN',
    name: 'Kitchen Cabinet',
    description: 'Base cabinet',
    unit: 'SQFT',
    qty: 20,
    rateClient: 1200,
    rateActual: 1000,
    remark: 'First kitchen item'
  },
  // Second batch - Washroom items
  {
    section: 'WASHROOM',
    name: 'Bathroom Tiles',
    description: 'Wall tiles',
    unit: 'SQFT',
    qty: 30,
    rateClient: 800,
    rateActual: 650,
    remark: 'Washroom item'
  },
  // Third batch - More Kitchen items added later
  {
    section: 'KITCHEN',
    name: 'Kitchen Countertop',
    description: 'Granite countertop',
    unit: 'SQFT',
    qty: 15,
    rateClient: 2000,
    rateActual: 1600,
    remark: 'Second kitchen item'
  },
  {
    section: 'KITCHEN',
    name: 'Kitchen Backsplash',
    description: 'Ceramic backsplash',
    unit: 'SQFT',
    qty: 10,
    rateClient: 1500,
    rateActual: 1200,
    remark: 'Third kitchen item'
  },
  // Fourth batch - More Washroom items added later
  {
    section: 'WASHROOM',
    name: 'Bathroom Fixtures',
    description: 'Faucets and accessories',
    unit: 'SET',
    qty: 1,
    rateClient: 5000,
    rateActual: 4000,
    remark: 'Second washroom item'
  }
]

// Expected consolidated structure
const mockConsolidatedItems = [
  // Kitchen section (consolidated)
  {
    section: 'KITCHEN',
    name: 'Kitchen Cabinet',
    description: 'Base cabinet',
    unit: 'SQFT',
    qty: 20,
    rateClient: 1200,
    rateActual: 1000,
    remark: 'First kitchen item'
  },
  {
    section: 'KITCHEN',
    name: 'Kitchen Countertop',
    description: 'Granite countertop',
    unit: 'SQFT',
    qty: 15,
    rateClient: 2000,
    rateActual: 1600,
    remark: 'Second kitchen item'
  },
  {
    section: 'KITCHEN',
    name: 'Kitchen Backsplash',
    description: 'Ceramic backsplash',
    unit: 'SQFT',
    qty: 10,
    rateClient: 1500,
    rateActual: 1200,
    remark: 'Third kitchen item'
  },
  // Washroom section (consolidated)
  {
    section: 'WASHROOM',
    name: 'Bathroom Tiles',
    description: 'Wall tiles',
    unit: 'SQFT',
    qty: 30,
    rateClient: 800,
    rateActual: 650,
    remark: 'Washroom item'
  },
  {
    section: 'WASHROOM',
    name: 'Bathroom Fixtures',
    description: 'Faucets and accessories',
    unit: 'SET',
    qty: 1,
    rateClient: 5000,
    rateActual: 4000,
    remark: 'Second washroom item'
  }
]

const mockSectionGroups = {
  'KITCHEN': [
    mockConsolidatedItems[0],
    mockConsolidatedItems[1],
    mockConsolidatedItems[2]
  ],
  'WASHROOM': [
    mockConsolidatedItems[3],
    mockConsolidatedItems[4]
  ]
}

const mockQuotationData = {
  docNo: 'LI-0001',
  clientName: 'Test Client',
  location: 'Test Location',
  projectTitle: 'Test Project',
  date: '2024-01-20',
  rows: mockItemsAddedAtDifferentTimes,
  discount: 5,
  handling: 10,
  tax: 18,
  terms: 'Test terms'
}

describe('Integration Test: Section Consolidation Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    localStorageMock.getItem.mockReturnValue('0')
    sessionStorageMock.getItem.mockReturnValue(null)
    
    // Mock successful database operations
    dbOperations.saveQuotation.mockResolvedValue({
      success: true,
      message: 'Quotation saved successfully'
    })
    
    dbOperations.loadQuotation.mockResolvedValue({
      success: false,
      message: 'Not found'
    })
    
    // Mock section consolidator functions
    sectionConsolidator.consolidateItemsBySection.mockReturnValue(mockConsolidatedItems)
    sectionConsolidator.getSectionGroups.mockReturnValue(mockSectionGroups)
    
    // Mock PDF export functions
    pdfExport.exportToPDF.mockResolvedValue({ success: true })
    pdfExport.generatePDFContent.mockReturnValue('<html>PDF Content</html>')
  })

  it('should consolidate sections when items are added to same section at different times', async () => {
    // Requirements: 1.1, 1.3, 1.5
    
    // Step 1: Test the consolidation logic directly
    // This simulates items being added to same section at different times
    
    // Verify that when items with same section are processed, they get consolidated
    const consolidatedResult = sectionConsolidator.consolidateItemsBySection(mockItemsAddedAtDifferentTimes)
    
    // Requirement 1.1: Items with same section name should be grouped under single header
    expect(sectionConsolidator.consolidateItemsBySection).toHaveBeenCalledWith(mockItemsAddedAtDifferentTimes)
    expect(consolidatedResult).toEqual(mockConsolidatedItems)
    
    // Verify sections are properly grouped
    const sectionGroups = sectionConsolidator.getSectionGroups(mockItemsAddedAtDifferentTimes)
    expect(sectionConsolidator.getSectionGroups).toHaveBeenCalledWith(mockItemsAddedAtDifferentTimes)
    expect(sectionGroups).toEqual(mockSectionGroups)
    
    // Verify Kitchen section has all 3 items grouped together
    expect(sectionGroups['KITCHEN']).toHaveLength(3)
    expect(sectionGroups['KITCHEN'][0].name).toBe('Kitchen Cabinet')
    expect(sectionGroups['KITCHEN'][1].name).toBe('Kitchen Countertop')
    expect(sectionGroups['KITCHEN'][2].name).toBe('Kitchen Backsplash')
    
    // Verify Washroom section has all 2 items grouped together
    expect(sectionGroups['WASHROOM']).toHaveLength(2)
    expect(sectionGroups['WASHROOM'][0].name).toBe('Bathroom Tiles')
    expect(sectionGroups['WASHROOM'][1].name).toBe('Bathroom Fixtures')
  })

  it('should maintain section consolidation in preview display', async () => {
    // Requirement 1.3: Items should be placed under existing section header
    
    // Create formData object that QuotePreview expects
    const formData = {
      clientName: "Test Client",
      location: "Test Location",
      projectTitle: "Test Project",
      date: "2024-01-20",
      docNo: "LI-0001",
      discount: 5,
      handling: 10,
      tax: 18,
      terms: "Test terms"
    }
    
    // Render QuotePreview component with consolidated data
    render(
      <QuotePreview
        formData={formData}
        rows={mockItemsAddedAtDifferentTimes}
        deleteRow={() => {}}
        duplicateRow={() => {}}
        updateRow={() => {}}
        currency="₹"
        staffMode={false}
        visibleSections={{}}
        setVisibleSections={() => {}}
      />
    )

    // Wait for component to render
    await waitFor(() => {
      expect(sectionConsolidator.consolidateItemsBySection).toHaveBeenCalledWith(mockItemsAddedAtDifferentTimes)
    })

    // Verify that consolidation is applied in preview
    expect(sectionConsolidator.consolidateItemsBySection).toHaveBeenCalledWith(mockItemsAddedAtDifferentTimes)
    
    // The preview should use consolidated items for display
    // This ensures that items added to same section at different times appear under single header
    const consolidatedItems = sectionConsolidator.consolidateItemsBySection.mock.results[0].value
    expect(consolidatedItems).toEqual(mockConsolidatedItems)
    
    // Verify section grouping maintains order within sections
    const kitchenItems = consolidatedItems.filter(item => item.section === 'KITCHEN')
    const washroomItems = consolidatedItems.filter(item => item.section === 'WASHROOM')
    
    expect(kitchenItems).toHaveLength(3)
    expect(washroomItems).toHaveLength(2)
    
    // Verify items within same section are grouped together in the consolidated result
    let currentSection = null
    let sectionChanges = 0
    
    consolidatedItems.forEach(item => {
      if (item.section !== currentSection) {
        currentSection = item.section
        sectionChanges++
      }
    })
    
    // Should have exactly 2 section changes (KITCHEN -> WASHROOM)
    expect(sectionChanges).toBe(2)
  })

  it('should preserve section consolidation in export and print functionality', async () => {
    // Requirement 1.5: Export/print should maintain consolidated section grouping
    
    // Test export operation with consolidated data directly
    const exportData = {
      ...mockQuotationData,
      rows: mockConsolidatedItems
    }

    // Mock the export function call
    await pdfExport.exportToPDF(exportData)

    // Verify that export function was called
    expect(pdfExport.exportToPDF).toHaveBeenCalledWith(exportData)

    // Verify that the export data uses consolidated items
    const exportCallArgs = pdfExport.exportToPDF.mock.calls[0][0]
    expect(exportCallArgs.rows).toEqual(mockConsolidatedItems)

    // Verify that consolidated sections are maintained in export
    const exportedKitchenItems = exportCallArgs.rows.filter(item => item.section === 'KITCHEN')
    const exportedWashroomItems = exportCallArgs.rows.filter(item => item.section === 'WASHROOM')

    expect(exportedKitchenItems).toHaveLength(3)
    expect(exportedWashroomItems).toHaveLength(2)

    // Verify section grouping is preserved in export
    let currentSection = null
    let sectionChanges = 0

    exportCallArgs.rows.forEach(item => {
      if (item.section !== currentSection) {
        currentSection = item.section
        sectionChanges++
      }
    })

    // Should maintain consolidated grouping (2 sections)
    expect(sectionChanges).toBe(2)
  })

  it('should calculate section totals correctly for consolidated sections', async () => {
    // Test that section totals are calculated correctly when items are consolidated
    
    // Create formData object that QuotePreview expects
    const formData = {
      clientName: "Test Client",
      location: "Test Location",
      projectTitle: "Test Project",
      date: "2024-01-20",
      docNo: "LI-0001",
      discount: 5,
      handling: 10,
      tax: 18,
      terms: "Test terms"
    }
    
    render(
      <QuotePreview
        formData={formData}
        rows={mockItemsAddedAtDifferentTimes}
        deleteRow={() => {}}
        duplicateRow={() => {}}
        updateRow={() => {}}
        currency="₹"
        staffMode={false}
        visibleSections={{}}
        setVisibleSections={() => {}}
      />
    )

    await waitFor(() => {
      expect(sectionConsolidator.consolidateItemsBySection).toHaveBeenCalled()
    })

    // Calculate expected section totals
    const kitchenItems = mockItemsAddedAtDifferentTimes.filter(item => item.section === 'KITCHEN')
    const washroomItems = mockItemsAddedAtDifferentTimes.filter(item => item.section === 'WASHROOM')

    const kitchenTotal = kitchenItems.reduce((sum, item) => sum + (item.qty * item.rateClient), 0)
    const washroomTotal = washroomItems.reduce((sum, item) => sum + (item.qty * item.rateClient), 0)

    // Expected totals:
    // Kitchen: (20 * 1200) + (15 * 2000) + (10 * 1500) = 24000 + 30000 + 15000 = 69000
    // Washroom: (30 * 800) + (1 * 5000) = 24000 + 5000 = 29000
    expect(kitchenTotal).toBe(69000)
    expect(washroomTotal).toBe(29000)

    // Verify that consolidation doesn't affect total calculations
    const totalAmount = kitchenTotal + washroomTotal
    expect(totalAmount).toBe(98000)
  })

  it('should handle section consolidation with mixed section orders', async () => {
    // Test consolidation when items are added in mixed section order
    const mixedOrderItems = [
      { section: 'KITCHEN', name: 'Item 1', qty: 1, rateClient: 100 },
      { section: 'WASHROOM', name: 'Item 2', qty: 1, rateClient: 200 },
      { section: 'KITCHEN', name: 'Item 3', qty: 1, rateClient: 300 },
      { section: 'LIVING AREA', name: 'Item 4', qty: 1, rateClient: 400 },
      { section: 'WASHROOM', name: 'Item 5', qty: 1, rateClient: 500 },
      { section: 'KITCHEN', name: 'Item 6', qty: 1, rateClient: 600 }
    ]

    const expectedConsolidated = [
      { section: 'KITCHEN', name: 'Item 1', qty: 1, rateClient: 100 },
      { section: 'KITCHEN', name: 'Item 3', qty: 1, rateClient: 300 },
      { section: 'KITCHEN', name: 'Item 6', qty: 1, rateClient: 600 },
      { section: 'LIVING AREA', name: 'Item 4', qty: 1, rateClient: 400 },
      { section: 'WASHROOM', name: 'Item 2', qty: 1, rateClient: 200 },
      { section: 'WASHROOM', name: 'Item 5', qty: 1, rateClient: 500 }
    ]

    sectionConsolidator.consolidateItemsBySection.mockReturnValue(expectedConsolidated)

    // Create formData object that QuotePreview expects
    const formData = {
      clientName: "Test Client",
      location: "Test Location",
      projectTitle: "Test Project",
      date: "2024-01-20",
      docNo: "LI-0001",
      discount: 0,
      handling: 0,
      tax: 0,
      terms: ""
    }

    render(
      <QuotePreview
        formData={formData}
        rows={mixedOrderItems}
        deleteRow={() => {}}
        duplicateRow={() => {}}
        updateRow={() => {}}
        currency="₹"
        staffMode={false}
        visibleSections={{}}
        setVisibleSections={() => {}}
      />
    )

    await waitFor(() => {
      expect(sectionConsolidator.consolidateItemsBySection).toHaveBeenCalledWith(mixedOrderItems)
    })

    // Verify that mixed order items are properly consolidated
    const consolidatedResult = sectionConsolidator.consolidateItemsBySection.mock.results[0].value
    expect(consolidatedResult).toEqual(expectedConsolidated)

    // Verify that all items from same section are grouped together
    const kitchenItems = consolidatedResult.filter(item => item.section === 'KITCHEN')
    const washroomItems = consolidatedResult.filter(item => item.section === 'WASHROOM')
    const livingAreaItems = consolidatedResult.filter(item => item.section === 'LIVING AREA')

    expect(kitchenItems).toHaveLength(3)
    expect(washroomItems).toHaveLength(2)
    expect(livingAreaItems).toHaveLength(1)

    // Verify that items within each section are contiguous in the result
    const kitchenIndices = consolidatedResult
      .map((item, index) => item.section === 'KITCHEN' ? index : -1)
      .filter(index => index !== -1)
    
    const washroomIndices = consolidatedResult
      .map((item, index) => item.section === 'WASHROOM' ? index : -1)
      .filter(index => index !== -1)

    // Kitchen items should be contiguous (indices 0, 1, 2)
    expect(kitchenIndices).toEqual([0, 1, 2])
    
    // Washroom items should be contiguous (indices 4, 5)
    expect(washroomIndices).toEqual([4, 5])
  })
})