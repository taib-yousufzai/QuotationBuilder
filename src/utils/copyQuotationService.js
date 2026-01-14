/**
 * Copy Quotation Service
 * 
 * Provides utilities for copying existing quotations to the builder
 * with proper data transformation and validation.
 */

/**
 * Generate a new quotation number following the existing pattern
 * @returns {string} New quotation number in format LI-XXXX
 */
export const generateNewQuotationNumber = () => {
  let last = localStorage.getItem('qb_last_no') || '0'
  last = parseInt(last) + 1
  localStorage.setItem('qb_last_no', last)
  const num = String(last).padStart(4, '0')
  return `LI-${num}`
}

/**
 * Copy a quotation to the builder with proper data transformation
 * @param {Object} quotationData - The original quotation data
 * @returns {Object} Transformed quotation data ready for builder
 * @throws {Error} If required data is missing or invalid
 */
export const copyQuotationToBuilder = (quotationData) => {
  // Validate input data first
  const validation = validateQuotationForCopy(quotationData)
  if (!validation.success) {
    throw new Error(validation.message)
  }

  // Create a deep copy of the quotation data
  const copiedData = {
    // Generate new quotation number and set current date
    docNo: generateNewQuotationNumber(),
    date: new Date().toISOString().split('T')[0],
    
    // Preserve client details
    clientName: quotationData.clientName || '',
    location: quotationData.location || '',
    projectTitle: quotationData.projectTitle || '',
    
    // Preserve calculation settings
    discount: quotationData.discount !== undefined ? quotationData.discount : 0,
    handling: quotationData.handling !== undefined ? quotationData.handling : 10,
    tax: quotationData.tax !== undefined ? quotationData.tax : 18,
    terms: quotationData.terms !== undefined ? quotationData.terms : '1. 30% advance upon order confirmation.\n2. Balance as per progress milestones.\n3. Delivery and installation as per schedule.\n4. All materials are of approved quality.',
    
    // Deep copy items array with all properties preserved
    rows: quotationData.rows ? quotationData.rows.map(item => ({
      section: item.section || '',
      name: item.name || '',
      description: item.description || '',
      unit: item.unit || '',
      qty: parseFloat(item.qty) || 0,
      rateClient: parseFloat(item.rateClient) || 0,
      rateActual: parseFloat(item.rateActual) || 0,
      remark: item.remark || ''
    })) : [],
    
    // Set timestamps for new quotation
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return copiedData
}

/**
 * Validate quotation data for copy operation
 * @param {Object} quotationData - The quotation data to validate
 * @returns {Object} Validation result with success flag and message
 */
export const validateQuotationForCopy = (quotationData) => {
  try {
    if (!quotationData) {
      return { success: false, message: 'No quotation data provided' }
    }

    // Check for required fields
    if (!quotationData.clientName || quotationData.clientName.trim() === '') {
      return { success: false, message: 'Client name is required' }
    }

    if (!quotationData.rows || !Array.isArray(quotationData.rows)) {
      return { success: false, message: 'Quotation must have items' }
    }

    if (quotationData.rows.length === 0) {
      return { success: false, message: 'Quotation must have at least one item' }
    }

    // Validate each item has required properties
    for (let i = 0; i < quotationData.rows.length; i++) {
      const item = quotationData.rows[i]
      if (!item.name || item.name.trim() === '') {
        return { success: false, message: `Item ${i + 1} is missing a name` }
      }
    }

    return { success: true, message: 'Quotation is valid for copying' }
  } catch (error) {
    return { success: false, message: `Validation error: ${error.message}` }
  }
}

/**
 * Create URL parameters for copy operation
 * @param {string} quotationId - The ID of the quotation to copy
 * @returns {string} URL search parameters for copy operation
 */
export const createCopyUrlParams = (quotationId) => {
  const params = new URLSearchParams()
  params.set('copy', quotationId)
  return params.toString()
}