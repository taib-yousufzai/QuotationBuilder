/**
 * Selective Section Rendering Utilities
 * Optimizes PDF export by rendering only visible sections and excluding hidden elements
 */

/**
 * Analyze which sections are visible in the preview area
 * @param {HTMLElement} previewElement - The preview area element
 * @returns {Object} Object containing visibility status of each section
 */
export const analyzeSectionVisibility = (previewElement) => {
  if (!previewElement) {
    throw new Error('Preview element is required')
  }

  const visibilityMap = {
    materialDescription: false,
    paymentSchedule: false,
    warranty: false,
    bankDetails: false,
    quotationTable: true, // Always visible
    summary: true, // Always visible
    header: true, // Always visible
    signature: true // Always visible
  }

  try {
    // Check for material description section
    const materialSection = previewElement.querySelector('.specifications-section')
    visibilityMap.materialDescription = materialSection && 
      materialSection.offsetHeight > 0 && 
      getComputedStyle(materialSection).display !== 'none'

    // Check for payment schedule section
    const paymentSection = previewElement.querySelector('.payment-section')
    visibilityMap.paymentSchedule = paymentSection && 
      paymentSection.offsetHeight > 0 && 
      getComputedStyle(paymentSection).display !== 'none'

    // Check for warranty section
    const warrantySection = previewElement.querySelector('.warranty-section')
    visibilityMap.warranty = warrantySection && 
      warrantySection.offsetHeight > 0 && 
      getComputedStyle(warrantySection).display !== 'none'

    // Check for bank details section
    const bankSection = previewElement.querySelector('.bank-section')
    visibilityMap.bankDetails = bankSection && 
      bankSection.offsetHeight > 0 && 
      getComputedStyle(bankSection).display !== 'none'

  } catch (error) {
    console.warn('Error analyzing section visibility:', error)
  }

  return visibilityMap
}

/**
 * Create an optimized DOM clone with only visible sections
 * @param {HTMLElement} previewElement - The original preview element
 * @param {Object} visibilityOptions - Options for section visibility
 * @returns {HTMLElement} Optimized clone with only visible sections
 */
export const createOptimizedClone = (previewElement, visibilityOptions = {}) => {
  if (!previewElement) {
    throw new Error('Preview element is required')
  }

  const {
    includeHiddenSections = false,
    excludeInteractiveElements = true,
    optimizeImages = true,
    removeAnimations = true
  } = visibilityOptions

  // Create a deep clone of the preview element
  const clone = previewElement.cloneNode(true)

  try {
    // Remove elements that should never be in PDF
    const elementsToRemove = [
      '.no-print',
      '.section-controls',
      'button',
      '.delete-btn',
      '.duplicate-btn'
    ]

    elementsToRemove.forEach(selector => {
      clone.querySelectorAll(selector).forEach(element => element.remove())
    })

    // Remove hidden sections if not explicitly included
    if (!includeHiddenSections) {
      const sectionsToCheck = [
        { selector: '.specifications-section', visible: visibilityOptions.materialDescription },
        { selector: '.payment-section', visible: visibilityOptions.paymentSchedule },
        { selector: '.warranty-section', visible: visibilityOptions.warranty },
        { selector: '.bank-section', visible: visibilityOptions.bankDetails }
      ]

      sectionsToCheck.forEach(({ selector, visible }) => {
        if (!visible) {
          const section = clone.querySelector(selector)
          if (section) {
            section.remove()
          }
        }
      })
    }

    // Remove interactive elements if requested
    if (excludeInteractiveElements) {
      const interactiveSelectors = [
        'input[type="checkbox"]',
        'input[type="radio"]',
        'select',
        'textarea',
        '.interactive',
        '[contenteditable]'
      ]

      interactiveSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(element => {
          // For contenteditable elements, just remove the attribute
          if (element.hasAttribute('contenteditable')) {
            element.removeAttribute('contenteditable')
            element.removeAttribute('suppressContentEditableWarning')
          } else {
            element.remove()
          }
        })
      })
    }

    // Optimize images if requested
    if (optimizeImages) {
      clone.querySelectorAll('img').forEach(img => {
        // Add loading optimization attributes
        img.setAttribute('loading', 'eager')
        img.setAttribute('decoding', 'sync')
        
        // Remove any lazy loading attributes that might interfere
        img.removeAttribute('data-src')
        img.removeAttribute('data-lazy')
      })
    }

    // Remove animations and transitions if requested
    if (removeAnimations) {
      clone.querySelectorAll('*').forEach(element => {
        const style = element.style
        style.animation = 'none'
        style.transition = 'none'
        style.transform = 'none'
      })

      // Add a style element to disable all animations
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
      clone.appendChild(styleElement)
    }

  } catch (error) {
    console.warn('Error optimizing clone:', error)
  }

  return clone
}

/**
 * Calculate rendering complexity based on visible sections
 * @param {Object} visibilityMap - Map of section visibility
 * @returns {Object} Complexity analysis for rendering optimization
 */
export const calculateRenderingComplexity = (visibilityMap) => {
  let complexityScore = 0
  let sectionCount = 0
  const complexSections = []

  // Base complexity for always-visible sections
  complexityScore += 3 // header, table, summary, signature

  // Add complexity for optional sections
  if (visibilityMap.materialDescription) {
    complexityScore += 2 // Complex table structure
    sectionCount++
    complexSections.push('materialDescription')
  }

  if (visibilityMap.paymentSchedule) {
    complexityScore += 1 // Simple table
    sectionCount++
    complexSections.push('paymentSchedule')
  }

  if (visibilityMap.warranty) {
    complexityScore += 2 // Long text content
    sectionCount++
    complexSections.push('warranty')
  }

  if (visibilityMap.bankDetails) {
    complexityScore += 1 // Simple grid
    sectionCount++
    complexSections.push('bankDetails')
  }

  return {
    complexityScore,
    sectionCount: sectionCount + 4, // +4 for always-visible sections
    complexSections,
    estimatedRenderTime: complexityScore * 200, // ms
    recommendedScale: Math.max(1, 2 - (complexityScore * 0.1))
  }
}

/**
 * Apply section-specific optimization strategies
 * @param {HTMLElement} clone - Cloned element to optimize
 * @param {Object} visibilityMap - Map of section visibility
 * @returns {HTMLElement} Optimized clone with section-specific strategies
 */
export const applySectionOptimizations = (clone, visibilityMap) => {
  try {
    // Optimize material description table if visible
    if (visibilityMap.materialDescription) {
      const specTable = clone.querySelector('.specifications-table')
      if (specTable) {
        // Simplify table structure for better rendering
        specTable.style.borderCollapse = 'collapse'
        specTable.style.tableLayout = 'fixed'
        
        // Optimize cell content
        specTable.querySelectorAll('td').forEach(cell => {
          cell.style.wordWrap = 'break-word'
          cell.style.overflow = 'hidden'
        })
      }
    }

    // Optimize warranty section if visible
    if (visibilityMap.warranty) {
      const warrantySection = clone.querySelector('.warranty-section')
      if (warrantySection) {
        // Optimize text rendering
        warrantySection.querySelectorAll('.term-item').forEach(item => {
          item.style.pageBreakInside = 'avoid'
          item.style.breakInside = 'avoid'
        })
      }
    }

    // Optimize payment section if visible
    if (visibilityMap.paymentSchedule) {
      const paymentSection = clone.querySelector('.payment-section')
      if (paymentSection) {
        // Ensure payment table renders cleanly
        const paymentTable = paymentSection.querySelector('.payment-table')
        if (paymentTable) {
          paymentTable.style.width = '100%'
          paymentTable.style.tableLayout = 'fixed'
        }
      }
    }

    // Optimize bank details if visible
    if (visibilityMap.bankDetails) {
      const bankSection = clone.querySelector('.bank-section')
      if (bankSection) {
        // Optimize grid layout for PDF rendering
        const bankGrid = bankSection.querySelector('.bank-details-grid')
        if (bankGrid) {
          bankGrid.style.display = 'block'
          
          // Convert grid items to simple block layout
          bankGrid.querySelectorAll('.bank-item').forEach(item => {
            item.style.display = 'block'
            item.style.marginBottom = '8px'
          })
        }
      }
    }

    // Optimize main quotation table
    const mainTable = clone.querySelector('table')
    if (mainTable) {
      mainTable.style.borderCollapse = 'collapse'
      mainTable.style.width = '100%'
      
      // Optimize table cells
      mainTable.querySelectorAll('td, th').forEach(cell => {
        cell.style.border = '1px solid #ddd'
        cell.style.padding = '8px'
        cell.style.verticalAlign = 'top'
      })
    }

    // Optimize summary section
    const summarySection = clone.querySelector('.quotation-summary')
    if (summarySection) {
      // Simplify grid layout for PDF
      const summaryGrid = summarySection.querySelector('.summary-grid')
      if (summaryGrid) {
        summaryGrid.style.display = 'block'
      }
    }

  } catch (error) {
    console.warn('Error applying section optimizations:', error)
  }

  return clone
}

/**
 * Create a selective render wrapper with only visible content
 * @param {HTMLElement} previewElement - Original preview element
 * @param {Object} renderOptions - Rendering options
 * @returns {HTMLElement} Wrapper element ready for canvas rendering
 */
export const createSelectiveRenderWrapper = (previewElement, renderOptions = {}) => {
  const {
    visibilityMap = null,
    includeHiddenSections = false,
    optimizeForPDF = true
  } = renderOptions

  // Analyze visibility if not provided
  const actualVisibilityMap = visibilityMap || analyzeSectionVisibility(previewElement)

  // Create optimized clone
  const optimizedClone = createOptimizedClone(previewElement, {
    ...actualVisibilityMap,
    includeHiddenSections,
    excludeInteractiveElements: optimizeForPDF,
    optimizeImages: optimizeForPDF,
    removeAnimations: optimizeForPDF
  })

  // Apply section-specific optimizations
  const finalClone = applySectionOptimizations(optimizedClone, actualVisibilityMap)

  // Create wrapper with PDF-optimized styling
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    padding: 10px;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    line-height: 1.4;
    color: #000;
  `

  wrapper.appendChild(finalClone)

  return {
    wrapper,
    visibilityMap: actualVisibilityMap,
    complexity: calculateRenderingComplexity(actualVisibilityMap)
  }
}