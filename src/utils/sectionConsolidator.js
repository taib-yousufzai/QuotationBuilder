/**
 * Section Consolidation Utilities
 * 
 * This module provides functions to group and sort quotation items by section,
 * eliminating duplicate section headers and maintaining proper ordering.
 */

/**
 * Consolidates items by section, grouping items with the same section name
 * and maintaining the order they were added within each section.
 * 
 * @param {Array} items - Array of quotation items
 * @returns {Array} - Consolidated array with items grouped by section
 */
export const consolidateItemsBySection = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  // Create a map to track sections and their items
  const sectionMap = new Map()
  const sectionOrder = []

  // Group items by section while preserving order within sections
  items.forEach((item, index) => {
    const sectionName = item.section || 'General'
    
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, [])
      sectionOrder.push(sectionName)
    }
    
    // Add item with its original index for maintaining order within section
    sectionMap.get(sectionName).push({
      ...item,
      originalIndex: index
    })
  })

  // Sort sections alphabetically
  const sortedSections = sectionOrder.sort((a, b) => a.localeCompare(b))

  // Flatten the consolidated items
  const consolidatedItems = []
  sortedSections.forEach(sectionName => {
    const sectionItems = sectionMap.get(sectionName)
    // Sort items within section by their original order
    sectionItems.sort((a, b) => a.originalIndex - b.originalIndex)
    
    // Remove the originalIndex property before adding to result
    sectionItems.forEach(item => {
      const { originalIndex, ...cleanItem } = item
      consolidatedItems.push(cleanItem)
    })
  })

  return consolidatedItems
}

/**
 * Returns a mapping of section names to their items for section-based operations.
 * 
 * @param {Array} items - Array of quotation items
 * @returns {Map} - Map with section names as keys and arrays of items as values
 */
export const getSectionGroups = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return new Map()
  }

  const sectionGroups = new Map()

  items.forEach((item, index) => {
    const sectionName = item.section || 'General'
    
    if (!sectionGroups.has(sectionName)) {
      sectionGroups.set(sectionName, [])
    }
    
    sectionGroups.get(sectionName).push({
      ...item,
      originalIndex: index
    })
  })

  return sectionGroups
}

/**
 * Calculates the total amount for a specific section.
 * 
 * @param {Array} items - Array of items in the section
 * @returns {number} - Total amount for the section
 */
export const calculateSectionTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0
  }

  return items.reduce((total, item) => {
    const qty = parseFloat(item.qty) || 0
    const rate = parseFloat(item.rateClient) || 0
    return total + (qty * rate)
  }, 0)
}

/**
 * Gets section totals for all sections in the items array.
 * 
 * @param {Array} items - Array of quotation items
 * @returns {Map} - Map with section names as keys and total amounts as values
 */
export const getSectionTotals = (items) => {
  const sectionGroups = getSectionGroups(items)
  const sectionTotals = new Map()

  sectionGroups.forEach((sectionItems, sectionName) => {
    const total = calculateSectionTotal(sectionItems)
    sectionTotals.set(sectionName, total)
  })

  return sectionTotals
}

/**
 * Checks if items need consolidation (i.e., if there are duplicate sections).
 * 
 * @param {Array} items - Array of quotation items
 * @returns {boolean} - True if consolidation is needed, false otherwise
 */
export const needsConsolidation = (items) => {
  if (!Array.isArray(items) || items.length <= 1) {
    return false
  }

  const seenSections = new Set()
  let lastSection = null

  for (const item of items) {
    const sectionName = item.section || 'General'
    
    if (seenSections.has(sectionName) && lastSection !== sectionName) {
      return true
    }
    
    seenSections.add(sectionName)
    lastSection = sectionName
  }

  return false
}