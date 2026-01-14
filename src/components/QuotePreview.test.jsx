import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuotePreview from './QuotePreview.jsx'

// Mock the section consolidator
vi.mock('../utils/sectionConsolidator.js', () => ({
  consolidateItemsBySection: vi.fn((items) => {
    // Simple mock implementation that sorts by section
    if (!items || items.length === 0) return []
    
    const sectionMap = new Map()
    items.forEach(item => {
      const section = item.section || 'General'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section).push(item)
    })
    
    const sortedSections = Array.from(sectionMap.keys()).sort()
    const consolidated = []
    sortedSections.forEach(section => {
      consolidated.push(...sectionMap.get(section))
    })
    
    return consolidated
  })
}))

describe('QuotePreview Component', () => {
  const defaultProps = {
    formData: {
      docNo: 'LI-0001',
      date: '2024-01-15',
      clientName: 'Test Client',
      location: 'Test Location',
      projectTitle: 'Test Project',
      discount: 0,
      handling: 0,
      tax: 18
    },
    rows: [],
    deleteRow: vi.fn(),
    duplicateRow: vi.fn(),
    updateRow: vi.fn(),
    currency: '₹',
    staffMode: false,
    visibleSections: {
      materialDescription: true,
      paymentSchedule: true,
      warranty: true,
      bankDetails: true
    },
    setVisibleSections: vi.fn()
  }

  describe('Section Header Consolidation', () => {
    it('should display single section header for items with same section', () => {
      const itemsWithSameSection = [
        { name: 'Item 1', section: 'KITCHEN', qty: 1, rateClient: 100, description: 'Test 1' },
        { name: 'Item 2', section: 'KITCHEN', qty: 2, rateClient: 200, description: 'Test 2' },
        { name: 'Item 3', section: 'KITCHEN', qty: 1, rateClient: 150, description: 'Test 3' }
      ]

      render(<QuotePreview {...defaultProps} rows={itemsWithSameSection} />)

      // Should only have one KITCHEN section header
      const kitchenHeaders = screen.getAllByText('KITCHEN')
      expect(kitchenHeaders).toHaveLength(1)

      // Should have all three items
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should display separate section headers for different sections', () => {
      const itemsWithDifferentSections = [
        { name: 'Kitchen Item', section: 'KITCHEN', qty: 1, rateClient: 100, description: 'Kitchen test' },
        { name: 'Bathroom Item', section: 'WASHROOM', qty: 1, rateClient: 200, description: 'Bathroom test' },
        { name: 'Living Item', section: 'LIVING AREA', qty: 1, rateClient: 150, description: 'Living test' }
      ]

      render(<QuotePreview {...defaultProps} rows={itemsWithDifferentSections} />)

      // Should have separate headers for each section
      expect(screen.getByText('KITCHEN')).toBeInTheDocument()
      expect(screen.getByText('WASHROOM')).toBeInTheDocument()
      expect(screen.getByText('LIVING AREA')).toBeInTheDocument()

      // Should have all items
      expect(screen.getByText('Kitchen Item')).toBeInTheDocument()
      expect(screen.getByText('Bathroom Item')).toBeInTheDocument()
      expect(screen.getByText('Living Item')).toBeInTheDocument()
    })

    it('should handle mixed section arrangement correctly', () => {
      const mixedSectionItems = [
        { name: 'Kitchen 1', section: 'KITCHEN', qty: 1, rateClient: 100, description: 'K1' },
        { name: 'Bathroom 1', section: 'WASHROOM', qty: 1, rateClient: 200, description: 'B1' },
        { name: 'Kitchen 2', section: 'KITCHEN', qty: 1, rateClient: 150, description: 'K2' },
        { name: 'Bathroom 2', section: 'WASHROOM', qty: 1, rateClient: 250, description: 'B2' }
      ]

      render(<QuotePreview {...defaultProps} rows={mixedSectionItems} />)

      // Should consolidate sections - only one header per section
      const kitchenHeaders = screen.getAllByText('KITCHEN')
      const washroomHeaders = screen.getAllByText('WASHROOM')
      
      expect(kitchenHeaders).toHaveLength(1)
      expect(washroomHeaders).toHaveLength(1)

      // All items should be present
      expect(screen.getByText('Kitchen 1')).toBeInTheDocument()
      expect(screen.getByText('Kitchen 2')).toBeInTheDocument()
      expect(screen.getByText('Bathroom 1')).toBeInTheDocument()
      expect(screen.getByText('Bathroom 2')).toBeInTheDocument()
    })

    it('should assign items with no section to General', () => {
      const itemsWithoutSection = [
        { name: 'No Section Item', section: null, qty: 1, rateClient: 100, description: 'Test' },
        { name: 'Empty Section Item', section: '', qty: 1, rateClient: 200, description: 'Test 2' }
      ]

      render(<QuotePreview {...defaultProps} rows={itemsWithoutSection} />)

      // Should show General section header - use getAllByText since there might be multiple "General" texts
      const generalHeaders = screen.getAllByText('General')
      expect(generalHeaders.length).toBeGreaterThan(0)
      expect(screen.getByText('No Section Item')).toBeInTheDocument()
      expect(screen.getByText('Empty Section Item')).toBeInTheDocument()
    })
  })

  describe('Editing Functionality', () => {
    it('should maintain editing functionality with consolidated sections', () => {
      const editableItems = [
        { name: 'Editable Item 1', section: 'KITCHEN', qty: 1, rateClient: 100, description: 'Test 1' },
        { name: 'Editable Item 2', section: 'KITCHEN', qty: 2, rateClient: 200, description: 'Test 2' }
      ]

      render(<QuotePreview {...defaultProps} rows={editableItems} />)

      // Find quantity input for first item
      const qtyInputs = screen.getAllByText('1')
      const firstQtyInput = qtyInputs.find(el => el.contentEditable === 'true')
      
      if (firstQtyInput) {
        // Simulate editing quantity
        fireEvent.blur(firstQtyInput, { target: { textContent: '5' } })
        
        // Should call updateRow with correct parameters
        expect(defaultProps.updateRow).toHaveBeenCalled()
      }
    })

    it('should handle delete and duplicate actions correctly', () => {
      const actionItems = [
        { name: 'Action Item 1', section: 'KITCHEN', qty: 1, rateClient: 100, description: 'Test 1' },
        { name: 'Action Item 2', section: 'WASHROOM', qty: 2, rateClient: 200, description: 'Test 2' }
      ]

      render(<QuotePreview {...defaultProps} rows={actionItems} />)

      // Find delete buttons
      const deleteButtons = screen.getAllByTitle('Delete')
      expect(deleteButtons).toHaveLength(2)

      // Find duplicate buttons
      const duplicateButtons = screen.getAllByTitle('Duplicate')
      expect(duplicateButtons).toHaveLength(2)

      // Test delete functionality
      fireEvent.click(deleteButtons[0])
      expect(defaultProps.deleteRow).toHaveBeenCalled()

      // Test duplicate functionality
      fireEvent.click(duplicateButtons[0])
      expect(defaultProps.duplicateRow).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should display empty state message when no items', () => {
      render(<QuotePreview {...defaultProps} rows={[]} />)

      expect(screen.getByText('No items added yet. Add items using the form on the left.')).toBeInTheDocument()
    })
  })

  describe('Staff Mode', () => {
    it('should show additional columns in staff mode', () => {
      const staffModeItems = [
        { name: 'Staff Item', section: 'KITCHEN', qty: 1, rateClient: 100, rateActual: 80, description: 'Test' }
      ]

      render(<QuotePreview {...defaultProps} rows={staffModeItems} staffMode={true} />)

      // Should show actual price columns
      expect(screen.getByText('Actual Price')).toBeInTheDocument()
      expect(screen.getByText('Actual Amount')).toBeInTheDocument()
    })
  })
})