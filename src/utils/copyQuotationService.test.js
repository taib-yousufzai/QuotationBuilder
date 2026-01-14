import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import {
  copyQuotationToBuilder,
  generateNewQuotationNumber,
  validateQuotationForCopy,
  createCopyUrlParams
} from './copyQuotationService.js'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Generator for quotation items
const itemArbitrary = fc.record({
  section: fc.oneof(
    fc.constant('KITCHEN'),
    fc.constant('WASHROOM'),
    fc.constant('LIVING AREA'),
    fc.constant('BEDROOM'),
    fc.constant('DINING'),
    fc.constant('General'),
    fc.constant(''),
    fc.string({ minLength: 1, maxLength: 20 })
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

// Generator for quotation data with potential missing fields
const quotationWithMissingFieldsArbitrary = fc.record({
  docNo: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  clientName: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
  location: fc.option(fc.string({ maxLength: 100 })),
  projectTitle: fc.option(fc.string({ maxLength: 100 })),
  date: fc.option(fc.integer({ min: 2000, max: 2030 }).chain(year => 
    fc.integer({ min: 1, max: 12 }).chain(month =>
      fc.integer({ min: 1, max: 28 }).map(day => 
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      )
    )
  )),
  discount: fc.option(fc.float({ min: 0, max: 100 })),
  handling: fc.option(fc.float({ min: 0, max: 100 })),
  tax: fc.option(fc.float({ min: 0, max: 100 })),
  terms: fc.option(fc.string({ maxLength: 500 })),
  rows: fc.option(fc.array(itemArbitrary, { minLength: 0, maxLength: 20 })),
  createdAt: fc.option(fc.integer({ min: 2000, max: 2030 }).chain(year => 
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
  )),
  updatedAt: fc.option(fc.integer({ min: 2000, max: 2030 }).chain(year => 
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
  ))
})

describe('Copy Quotation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('0')
  })

  describe('Unit Tests', () => {
    it('should generate new quotation numbers in correct format', () => {
      localStorageMock.getItem.mockReturnValue('5')
      const newNumber = generateNewQuotationNumber()
      expect(newNumber).toBe('LI-0006')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('qb_last_no', 6)
    })

    it('should handle missing localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const newNumber = generateNewQuotationNumber()
      expect(newNumber).toBe('LI-0001')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('qb_last_no', 1)
    })

    it('should validate quotation data correctly', () => {
      const validQuotation = {
        clientName: 'Test Client',
        rows: [{ name: 'Test Item', qty: 1, rateClient: 100 }]
      }
      const result = validateQuotationForCopy(validQuotation)
      expect(result.success).toBe(true)
    })

    it('should reject invalid quotation data', () => {
      const invalidQuotation = {
        clientName: '',
        rows: []
      }
      const result = validateQuotationForCopy(invalidQuotation)
      expect(result.success).toBe(false)
    })
  })

  describe('Property-Based Tests', () => {
    it('Property 5: Complete data preservation during copy - For any valid quotation, when copied to the builder, all quotation data including client details, items, sections, descriptions, quantities, prices, and calculation settings should be preserved exactly', () => {
      // Feature: quotation-enhancements, Property 5: Complete data preservation during copy
      fc.assert(fc.property(validQuotationArbitrary, (originalQuotation) => {
        const copiedQuotation = copyQuotationToBuilder(originalQuotation)
        
        // Verify client details are preserved
        expect(copiedQuotation.clientName).toBe(originalQuotation.clientName)
        expect(copiedQuotation.location).toBe(originalQuotation.location)
        expect(copiedQuotation.projectTitle).toBe(originalQuotation.projectTitle)
        
        // Verify calculation settings are preserved
        expect(copiedQuotation.discount).toBe(originalQuotation.discount)
        expect(copiedQuotation.handling).toBe(originalQuotation.handling)
        expect(copiedQuotation.tax).toBe(originalQuotation.tax)
        expect(copiedQuotation.terms).toBe(originalQuotation.terms)
        
        // Verify items are preserved
        expect(copiedQuotation.rows).toHaveLength(originalQuotation.rows.length)
        
        originalQuotation.rows.forEach((originalItem, index) => {
          const copiedItem = copiedQuotation.rows[index]
          expect(copiedItem.section).toBe(originalItem.section)
          expect(copiedItem.name).toBe(originalItem.name)
          expect(copiedItem.description).toBe(originalItem.description)
          expect(copiedItem.unit).toBe(originalItem.unit)
          expect(copiedItem.qty).toBe(parseFloat(originalItem.qty) || 0)
          expect(copiedItem.rateClient).toBe(parseFloat(originalItem.rateClient) || 0)
          expect(copiedItem.rateActual).toBe(parseFloat(originalItem.rateActual) || 0)
          expect(copiedItem.remark).toBe(originalItem.remark)
        })
        
        // Verify that the copy is independent (deep copy)
        copiedQuotation.clientName = 'Modified Client'
        expect(originalQuotation.clientName).not.toBe('Modified Client')
        
        if (copiedQuotation.rows.length > 0) {
          copiedQuotation.rows[0].name = 'Modified Item'
          expect(originalQuotation.rows[0].name).not.toBe('Modified Item')
        }
      }), { numRuns: 100 })
    })

    it('Property 6: Copy initialization - For any quotation being copied, the copy should receive a new unique quotation number and today\'s date while preserving all other data', () => {
      // Feature: quotation-enhancements, Property 6: Copy initialization
      fc.assert(fc.property(validQuotationArbitrary, (originalQuotation) => {
        const todayDate = new Date().toISOString().split('T')[0]
        const copiedQuotation = copyQuotationToBuilder(originalQuotation)
        
        // Verify new quotation number is generated
        expect(copiedQuotation.docNo).not.toBe(originalQuotation.docNo)
        expect(copiedQuotation.docNo).toMatch(/^LI-\d{4}$/)
        
        // Verify today's date is set
        expect(copiedQuotation.date).toBe(todayDate)
        
        // Verify timestamps are set for new quotation
        expect(copiedQuotation.createdAt).toBeDefined()
        expect(copiedQuotation.updatedAt).toBeDefined()
        expect(new Date(copiedQuotation.createdAt)).toBeInstanceOf(Date)
        expect(new Date(copiedQuotation.updatedAt)).toBeInstanceOf(Date)
        
        // Verify all other data is preserved (already tested in Property 5)
        expect(copiedQuotation.clientName).toBe(originalQuotation.clientName)
        expect(copiedQuotation.rows).toHaveLength(originalQuotation.rows.length)
      }), { numRuns: 100 })
    })

    it('Property 8: Copy validation - For any quotation copy attempt, if required data is missing, the operation should fail with a descriptive error message and no partial copy should be created', () => {
      // Feature: quotation-enhancements, Property 8: Copy validation
      fc.assert(fc.property(quotationWithMissingFieldsArbitrary, (quotationData) => {
        const validation = validateQuotationForCopy(quotationData)
        
        // Check if the quotation has required data
        const hasValidClientName = quotationData && quotationData.clientName && quotationData.clientName.trim() !== ''
        const hasValidRows = quotationData && Array.isArray(quotationData.rows) && quotationData.rows.length > 0
        const hasValidItemNames = hasValidRows && quotationData.rows.every(item => item && item.name && item.name.trim() !== '')
        
        const shouldBeValid = hasValidClientName && hasValidRows && hasValidItemNames
        
        if (shouldBeValid) {
          expect(validation.success).toBe(true)
          
          // If validation passes, copy operation should succeed
          expect(() => copyQuotationToBuilder(quotationData)).not.toThrow()
        } else {
          expect(validation.success).toBe(false)
          expect(validation.message).toBeDefined()
          expect(typeof validation.message).toBe('string')
          expect(validation.message.length).toBeGreaterThan(0)
          
          // If validation fails, copy operation should throw
          expect(() => copyQuotationToBuilder(quotationData)).toThrow()
        }
      }), { numRuns: 100 })
    })
  })

  describe('Additional Unit Tests', () => {
    it('should create proper URL parameters', () => {
      const quotationId = 'LI-0001'
      const urlParams = createCopyUrlParams(quotationId)
      expect(urlParams).toBe('copy=LI-0001')
    })

    it('should handle null/undefined quotation data', () => {
      expect(() => copyQuotationToBuilder(null)).toThrow('No quotation data provided')
      expect(() => copyQuotationToBuilder(undefined)).toThrow('No quotation data provided')
    })

    it('should provide default values for optional fields', () => {
      const minimalQuotation = {
        clientName: 'Test Client',
        rows: [{ name: 'Test Item' }]
      }
      
      const copied = copyQuotationToBuilder(minimalQuotation)
      
      expect(copied.location).toBe('')
      expect(copied.projectTitle).toBe('')
      expect(copied.discount).toBe(0)
      expect(copied.handling).toBe(10)
      expect(copied.tax).toBe(18)
      expect(copied.terms).toContain('30% advance')
    })
  })
})