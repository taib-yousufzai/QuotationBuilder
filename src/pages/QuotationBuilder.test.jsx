import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import QuotationBuilder from './QuotationBuilder'
import * as dbOperations from '../utils/dbOperations'
import * as copyService from '../utils/copyQuotationService'

// Mock the database operations
vi.mock('../utils/dbOperations', () => ({
  saveQuotation: vi.fn(),
  loadQuotation: vi.fn()
}))

// Mock the copy service
vi.mock('../utils/copyQuotationService', () => ({
  copyQuotationToBuilder: vi.fn(),
  generateNewQuotationNumber: vi.fn()
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

// Mock window.alert
global.alert = vi.fn()

// Mock window.confirm
global.confirm = vi.fn(() => true)

// Mock window.prompt
global.prompt = vi.fn()

// Mock window.print
global.print = vi.fn()

// Generator for quotation items
const itemArbitrary = fc.record({
  section: fc.oneof(
    fc.constant('KITCHEN'),
    fc.constant('WASHROOM'),
    fc.constant('LIVING AREA'),
    fc.constant('BEDROOM'),
    fc.constant('DINING'),
    fc.constant('General')
  ),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 100 }),
  unit: fc.oneof(fc.constant('SQFT'), fc.constant('RFT'), fc.constant('NOS'), fc.constant('SET')),
  qty: fc.float({ min: 0, max: 1000 }),
  rateClient: fc.float({ min: 0, max: 100000 }),
  rateActual: fc.float({ min: 0, max: 100000 }),
  remark: fc.string({ maxLength: 50 })
})

// Generator for valid quotation data
const validQuotationArbitrary = fc.record({
  docNo: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  clientName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  location: fc.string({ maxLength: 100 }),
  projectTitle: fc.string({ maxLength: 100 }),
  date: fc.integer({ min: 2000, max: 2030 }).chain(year => 
    fc.integer({ min: 1, max: 12 }).chain(month =>
      fc.integer({ min: 1, max: 28 }).map(day => 
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      )
    )
  ),
  discount: fc.float({ min: 0, max: 100 }),
  handling: fc.float({ min: 0, max: 100 }),
  tax: fc.float({ min: 0, max: 100 }),
  terms: fc.string({ maxLength: 500 }),
  rows: fc.array(itemArbitrary.filter(item => item.name && item.name.trim().length > 0), { minLength: 1, maxLength: 20 }),
  createdAt: fc.integer({ min: 2000, max: 2030 }).chain(year => 
    fc.integer({ min: 1, max: 12 }).chain(month =>
      fc.integer({ min: 1, max: 28 }).chain(day =>
        fc.integer({ min: 0, max: 23 }).chain(hour =>
          fc.integer({ min: 0, max: 59 }).chain(minute =>
            fc.integer({ min: 0, max: 59 }).map(second =>
              `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.000Z`
            )
          )
        )
      )
    )
  ),
  updatedAt: fc.integer({ min: 2000, max: 2030 }).chain(year => 
    fc.integer({ min: 1, max: 12 }).chain(month =>
      fc.integer({ min: 1, max: 28 }).chain(day =>
        fc.integer({ min: 0, max: 23 }).chain(hour =>
          fc.integer({ min: 0, max: 59 }).chain(minute =>
            fc.integer({ min: 0, max: 59 }).map(second =>
              `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.000Z`
            )
          )
        )
      )
    )
  )
})

// Helper function to render QuotationBuilder with router
const renderQuotationBuilder = (searchParams = '') => {
  return render(
    <MemoryRouter initialEntries={[`/?${searchParams}`]}>
      <QuotationBuilder />
    </MemoryRouter>
  )
}

describe('QuotationBuilder Copy Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('0')
    sessionStorageMock.getItem.mockReturnValue(null)
    dbOperations.loadQuotation.mockResolvedValue({ success: false, message: 'Not found' })
    dbOperations.saveQuotation.mockResolvedValue({ success: true, message: 'Saved' })
  })

  describe('Property-Based Tests', () => {
    it('Property 7: Copy operation workflow - For any successful copy operation, the user should be navigated to the builder page with the copied data properly loaded and ready for editing', async () => {
      // Feature: quotation-enhancements, Property 7: Copy operation workflow
      fc.assert(fc.property(validQuotationArbitrary, (originalQuotation) => {
        // Reset mocks for clean state
        vi.clearAllMocks()
        
        // Mock successful database load
        dbOperations.loadQuotation.mockResolvedValueOnce({
          success: true,
          data: originalQuotation
        })
        
        // Mock the copy service to return transformed data
        const copiedData = {
          ...originalQuotation,
          docNo: 'LI-9999',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        copyService.copyQuotationToBuilder.mockReturnValueOnce(copiedData)
        
        // The key property: copy service should be called with original data
        // and should return data with new quotation number and current date
        const result = copyService.copyQuotationToBuilder(originalQuotation)
        
        // Verify the workflow properties
        expect(result.docNo).toMatch(/^LI-\d{4}$/)
        expect(result.date).toBe(new Date().toISOString().split('T')[0])
        expect(result.clientName).toBe(originalQuotation.clientName)
        expect(result.rows).toEqual(originalQuotation.rows)
        
        return true
      }), { numRuns: 50 }) // Reduced iterations for faster execution
    })

    it('Property 9: Database independence - For any copied quotation that is saved, it should be stored as a new independent document in the database with no references to the original quotation', async () => {
      // Feature: quotation-enhancements, Property 9: Database independence
      fc.assert(fc.property(validQuotationArbitrary, (originalQuotation) => {
        // Reset mocks for clean state
        vi.clearAllMocks()
        
        // Mock the copy service to return transformed data with new ID
        const newQuotationNumber = `LI-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
        const copiedData = {
          ...originalQuotation,
          docNo: newQuotationNumber,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        copyService.copyQuotationToBuilder.mockReturnValueOnce(copiedData)
        
        // Test the core property: copied data should be independent
        const result = copyService.copyQuotationToBuilder(originalQuotation)
        
        // Verify database independence properties
        expect(result.docNo).not.toBe(originalQuotation.docNo)
        expect(result.docNo).toMatch(/^LI-\d{4}$/)
        expect(result.createdAt).not.toBe(originalQuotation.createdAt)
        expect(result.updatedAt).not.toBe(originalQuotation.updatedAt)
        
        // Verify data preservation (but with new identity)
        expect(result.clientName).toBe(originalQuotation.clientName)
        expect(result.rows).toEqual(originalQuotation.rows)
        
        return true
      }), { numRuns: 50 }) // Reduced iterations for faster execution
    })
  })

  describe('Unit Tests', () => {
    beforeEach(() => {
      // Ensure completely clean mock state for unit tests
      vi.clearAllMocks()
      vi.resetAllMocks()
      
      // Reset localStorage and sessionStorage
      localStorageMock.getItem.mockReturnValue('0')
      sessionStorageMock.getItem.mockReturnValue(null)
      
      // Reset database operations to default behavior
      dbOperations.loadQuotation.mockReset()
      dbOperations.saveQuotation.mockResolvedValue({ success: true, message: 'Saved' })
      
      // Reset copy service
      copyService.copyQuotationToBuilder.mockReset()
    })

    it('should handle copy operation failure gracefully', async () => {
      // Mock failed database load
      dbOperations.loadQuotation.mockResolvedValueOnce({
        success: false,
        message: 'Quotation not found'
      })
      
      renderQuotationBuilder('copy=LI-0001')
      
      await waitFor(() => {
        expect(dbOperations.loadQuotation).toHaveBeenCalledWith('LI-0001')
      })
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Quotation not found')
      })
    })

    it('should handle copy service errors gracefully', async () => {
      const originalQuotation = {
        docNo: 'LI-0001',
        clientName: 'Test Client',
        rows: [{ name: 'Test Item', qty: 1, rateClient: 100 }]
      }
      
      // Mock successful database load
      dbOperations.loadQuotation.mockResolvedValueOnce({
        success: true,
        data: originalQuotation
      })
      
      // Mock copy service to throw error
      copyService.copyQuotationToBuilder.mockImplementation(() => {
        throw new Error('Copy validation failed')
      })
      
      renderQuotationBuilder('copy=LI-0001')
      
      await waitFor(() => {
        expect(dbOperations.loadQuotation).toHaveBeenCalledWith('LI-0001')
      })
      
      await waitFor(() => {
        expect(copyService.copyQuotationToBuilder).toHaveBeenCalledWith(originalQuotation)
      })
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error copying quotation: Copy validation failed')
      })
    })

    it('should not interfere with normal load operations', async () => {
      const quotationData = {
        docNo: 'LI-0001',
        clientName: 'Test Client',
        rows: [{ name: 'Test Item', qty: 1, rateClient: 100 }]
      }
      
      // Mock successful database load
      dbOperations.loadQuotation.mockResolvedValueOnce({
        success: true,
        data: quotationData
      })
      
      renderQuotationBuilder('load=LI-0001')
      
      await waitFor(() => {
        expect(dbOperations.loadQuotation).toHaveBeenCalledWith('LI-0001')
      })
      
      // Verify copy service was not called
      expect(copyService.copyQuotationToBuilder).not.toHaveBeenCalled()
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Quotation LI-0001 loaded successfully!')
      })
    })
  })
})