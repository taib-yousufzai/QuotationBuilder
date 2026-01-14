import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  consolidateItemsBySection,
  getSectionGroups,
  calculateSectionTotal,
  getSectionTotals,
  needsConsolidation
} from './sectionConsolidator.js'

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
    fc.constant(null),
    fc.constant(undefined)
  ),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 100 }),
  unit: fc.oneof(fc.constant('SQFT'), fc.constant('RFT'), fc.constant('NOS'), fc.constant('SET')),
  qty: fc.float({ min: 0, max: 1000 }),
  rateClient: fc.float({ min: 0, max: 100000 }),
  rateActual: fc.float({ min: 0, max: 100000 }),
  remark: fc.string({ maxLength: 50 })
})

const itemsArrayArbitrary = fc.array(itemArbitrary, { minLength: 0, maxLength: 20 })

describe('Section Consolidation Utilities', () => {
  describe('Unit Tests', () => {
    it('should handle empty arrays', () => {
      expect(consolidateItemsBySection([])).toEqual([])
      expect(getSectionGroups([])).toEqual(new Map())
      expect(calculateSectionTotal([])).toBe(0)
    })

    it('should handle null/undefined inputs', () => {
      expect(consolidateItemsBySection(null)).toEqual([])
      expect(consolidateItemsBySection(undefined)).toEqual([])
      expect(getSectionGroups(null)).toEqual(new Map())
      expect(getSectionGroups(undefined)).toEqual(new Map())
    })

    it('should assign items with no section to General', () => {
      const items = [
        { name: 'Item 1', section: null, qty: 1, rateClient: 100 },
        { name: 'Item 2', section: undefined, qty: 2, rateClient: 200 },
        { name: 'Item 3', section: '', qty: 1, rateClient: 150 }
      ]
      
      const consolidated = consolidateItemsBySection(items)
      expect(consolidated.every(item => item.section === null || item.section === undefined || item.section === '')).toBe(true)
      
      const groups = getSectionGroups(items)
      expect(groups.has('General')).toBe(true)
      expect(groups.get('General')).toHaveLength(3)
    })
  })

  describe('Property-Based Tests', () => {
    it('Property 1: Section consolidation consistency - For any list of items with section names, when displayed in the quotation preview, all items with the same section name should appear under a single section header regardless of the order they were added', () => {
      // Feature: quotation-enhancements, Property 1: Section consolidation consistency
      fc.assert(fc.property(itemsArrayArbitrary, (items) => {
        const consolidated = consolidateItemsBySection(items)
        
        // Track sections as we iterate through consolidated items
        const seenSections = new Set()
        let currentSection = null
        
        for (const item of consolidated) {
          const sectionName = item.section || 'General'
          
          if (currentSection !== sectionName) {
            // We're entering a new section
            expect(seenSections.has(sectionName)).toBe(false) // Should not have seen this section before
            seenSections.add(sectionName)
            currentSection = sectionName
          }
        }
        
        // All items with the same section should be grouped together
        const groups = getSectionGroups(items)
        groups.forEach((sectionItems, sectionName) => {
          const consolidatedSectionItems = consolidated.filter(item => 
            (item.section || 'General') === sectionName
          )
          expect(consolidatedSectionItems).toHaveLength(sectionItems.length)
        })
      }), { numRuns: 100 })
    })

    it('Property 2: Section-based sorting - For any list of quotation items, when displayed in the preview, items should be sorted first by section name alphabetically, then by the order they were added within each section', () => {
      // Feature: quotation-enhancements, Property 2: Section-based sorting
      fc.assert(fc.property(itemsArrayArbitrary, (items) => {
        const consolidated = consolidateItemsBySection(items)
        
        if (consolidated.length <= 1) return true
        
        // Check that sections are in alphabetical order
        const sections = []
        let currentSection = null
        
        for (const item of consolidated) {
          const sectionName = item.section || 'General'
          if (currentSection !== sectionName) {
            sections.push(sectionName)
            currentSection = sectionName
          }
        }
        
        // Verify sections are sorted alphabetically
        for (let i = 1; i < sections.length; i++) {
          expect(sections[i-1].localeCompare(sections[i])).toBeLessThanOrEqual(0)
        }
        
        // Verify items within each section maintain their original relative order
        const originalSectionGroups = getSectionGroups(items)
        originalSectionGroups.forEach((originalItems, sectionName) => {
          const consolidatedSectionItems = consolidated.filter(item => 
            (item.section || 'General') === sectionName
          )
          
          // Check that the relative order is preserved within the section
          for (let i = 1; i < consolidatedSectionItems.length; i++) {
            const currentItemIndex = items.findIndex(item => 
              item.name === consolidatedSectionItems[i].name &&
              (item.section || 'General') === sectionName
            )
            const prevItemIndex = items.findIndex(item => 
              item.name === consolidatedSectionItems[i-1].name &&
              (item.section || 'General') === sectionName
            )
            
            if (currentItemIndex !== -1 && prevItemIndex !== -1) {
              expect(prevItemIndex).toBeLessThan(currentItemIndex)
            }
          }
        })
      }), { numRuns: 100 })
    })

    it('Property 3: Section total calculation - For any quotation with items in the same section, the section total should equal the sum of all item amounts in that section regardless of when the items were added', () => {
      // Feature: quotation-enhancements, Property 3: Section total calculation
      fc.assert(fc.property(itemsArrayArbitrary, (items) => {
        const sectionTotals = getSectionTotals(items)
        const sectionGroups = getSectionGroups(items)
        
        // Verify that each section total matches the manual calculation
        sectionGroups.forEach((sectionItems, sectionName) => {
          const expectedTotal = sectionItems.reduce((sum, item) => {
            const qty = parseFloat(item.qty) || 0
            const rate = parseFloat(item.rateClient) || 0
            return sum + (qty * rate)
          }, 0)
          
          const calculatedTotal = sectionTotals.get(sectionName)
          
          // Use approximate equality for floating point comparison
          expect(Math.abs(calculatedTotal - expectedTotal)).toBeLessThan(0.01)
        })
        
        // Verify that the total of all section totals equals the grand total
        const grandTotal = items.reduce((sum, item) => {
          const qty = parseFloat(item.qty) || 0
          const rate = parseFloat(item.rateClient) || 0
          return sum + (qty * rate)
        }, 0)
        
        const sumOfSectionTotals = Array.from(sectionTotals.values()).reduce((sum, total) => sum + total, 0)
        expect(Math.abs(sumOfSectionTotals - grandTotal)).toBeLessThan(0.01)
      }), { numRuns: 100 })
    })
  })
})