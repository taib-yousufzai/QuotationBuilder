/**
 * Content Analysis Utilities for PDF Export Optimization
 * Analyzes quotation content to determine optimal rendering settings
 */

/**
 * Analyzes the content complexity of a quotation preview element
 * @param {HTMLElement} previewElement - The preview area element to analyze
 * @returns {Object} Content analysis result with complexity metrics
 */
export const analyzeContent = (previewElement) => {
  if (!previewElement) {
    throw new Error('Preview element is required for content analysis')
  }

  const analysis = {
    itemCount: 0,
    sectionCount: 0,
    complexityScore: 1,
    hasImages: false,
    hasGradients: false,
    hasTransparency: false,
    textDensity: 0,
    tableCount: 0,
    estimatedSize: 0,
    recommendedSettings: {}
  }

  // Count quotation items (rows in tables)
  const itemRows = previewElement.querySelectorAll('tbody tr')
  analysis.itemCount = itemRows.length

  // Count sections (major content blocks)
  const sections = previewElement.querySelectorAll('.section, .quotation-section, .header-section, .items-section, .footer-section')
  analysis.sectionCount = Math.max(sections.length, 1) // At least 1 section

  // Count tables
  const tables = previewElement.querySelectorAll('table')
  analysis.tableCount = tables.length

  // Check for images
  const images = previewElement.querySelectorAll('img')
  analysis.hasImages = images.length > 0

  // Analyze visual complexity
  analysis.complexityScore = calculateComplexityScore(previewElement, analysis)

  // Check for gradients and transparency
  analysis.hasGradients = hasGradientElements(previewElement)
  analysis.hasTransparency = hasTransparentElements(previewElement)

  // Calculate text density
  analysis.textDensity = calculateTextDensity(previewElement)

  // Estimate file size based on analysis
  analysis.estimatedSize = estimateFileSize(analysis)

  // Generate recommended settings
  analysis.recommendedSettings = recommendSettings(analysis)

  return analysis
}

/**
 * Calculates a complexity score from 1-10 based on content characteristics
 * @param {HTMLElement} element - Element to analyze
 * @param {Object} baseAnalysis - Basic analysis metrics
 * @returns {number} Complexity score (1-10)
 */
const calculateComplexityScore = (element, baseAnalysis) => {
  let score = 1

  // Item count factor (more items = higher complexity)
  if (baseAnalysis.itemCount > 50) score += 3
  else if (baseAnalysis.itemCount > 20) score += 2
  else if (baseAnalysis.itemCount > 10) score += 1

  // Table complexity
  if (baseAnalysis.tableCount > 3) score += 2
  else if (baseAnalysis.tableCount > 1) score += 1

  // Visual elements
  if (baseAnalysis.hasImages) score += 1

  // Check for complex styling
  const styledElements = element.querySelectorAll('[style*="gradient"], [style*="shadow"], [style*="transform"]')
  if (styledElements.length > 10) score += 2
  else if (styledElements.length > 5) score += 1

  // Check for nested structures
  const nestedElements = element.querySelectorAll('div > div > div')
  if (nestedElements.length > 20) score += 1

  // Color complexity
  const coloredElements = element.querySelectorAll('[style*="color"], [style*="background"]')
  if (coloredElements.length > 15) score += 1

  return Math.min(score, 10) // Cap at 10
}

/**
 * Checks if the element contains gradient styling
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if gradients are detected
 */
const hasGradientElements = (element) => {
  const gradientElements = element.querySelectorAll('[style*="gradient"]')
  if (gradientElements.length > 0) return true

  // Check computed styles for gradients
  const allElements = element.querySelectorAll('*')
  for (const el of allElements) {
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.background && computedStyle.background.includes('gradient')) {
      return true
    }
  }

  return false
}

/**
 * Checks if the element contains transparent elements
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if transparency is detected
 */
const hasTransparentElements = (element) => {
  const transparentElements = element.querySelectorAll('[style*="opacity"], [style*="rgba"]')
  if (transparentElements.length > 0) return true

  // Check for elements with transparency in computed styles
  const allElements = element.querySelectorAll('*')
  for (const el of allElements) {
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.opacity && parseFloat(computedStyle.opacity) < 1) {
      return true
    }
  }

  return false
}

/**
 * Calculates text density as a ratio of text content to total content
 * @param {HTMLElement} element - Element to analyze
 * @returns {number} Text density ratio (0-1)
 */
const calculateTextDensity = (element) => {
  const textContent = element.textContent || ''
  const totalElements = element.querySelectorAll('*').length
  
  if (totalElements === 0) return 0
  
  // Simple heuristic: text length per element
  const textPerElement = textContent.length / totalElements
  
  // Normalize to 0-1 scale (assuming 50 chars per element is high density)
  return Math.min(textPerElement / 50, 1)
}

/**
 * Estimates the final PDF file size based on content analysis
 * @param {Object} analysis - Content analysis result
 * @returns {number} Estimated file size in KB
 */
export const estimateFileSize = (analysis) => {
  // Base size for minimal content
  let estimatedKB = 50

  // Item count factor (each item adds complexity)
  estimatedKB += analysis.itemCount * 15

  // Section complexity
  estimatedKB += analysis.sectionCount * 25

  // Table complexity
  estimatedKB += analysis.tableCount * 40

  // Visual complexity multiplier
  const complexityMultiplier = 1 + (analysis.complexityScore - 1) * 0.3
  estimatedKB *= complexityMultiplier

  // Image penalty
  if (analysis.hasImages) {
    estimatedKB *= 1.5
  }

  // Gradient and transparency penalty
  if (analysis.hasGradients) {
    estimatedKB *= 1.3
  }

  if (analysis.hasTransparency) {
    estimatedKB *= 1.2
  }

  // Text density factor (more text = larger file)
  estimatedKB *= (1 + analysis.textDensity * 0.5)

  return Math.round(estimatedKB)
}

/**
 * Recommends optimal rendering settings based on content analysis
 * @param {Object} analysis - Content analysis result
 * @returns {Object} Recommended settings for PDF generation
 */
export const recommendSettings = (analysis) => {
  const settings = {
    scale: 2, // Default scale
    format: 'png', // Default format
    quality: 0.8, // JPEG quality (if applicable)
    compression: false,
    priority: 'balanced' // 'speed', 'size', 'quality', 'balanced'
  }

  // Adjust scale based on complexity and item count
  if (analysis.complexityScore <= 3 && analysis.itemCount <= 10) {
    settings.scale = 2.5 // High quality for simple content
    settings.priority = 'quality'
  } else if (analysis.complexityScore >= 7 || analysis.itemCount > 30) {
    settings.scale = 1.5 // Lower scale for complex content
    settings.priority = 'size'
  } else {
    settings.scale = 2 // Standard scale
    settings.priority = 'balanced'
  }

  // Format selection based on content characteristics
  if (analysis.hasGradients || analysis.complexityScore > 6) {
    settings.format = 'jpeg'
    settings.quality = analysis.complexityScore > 8 ? 0.6 : 0.7
    settings.compression = true
  } else if (analysis.hasTransparency) {
    settings.format = 'png'
    settings.compression = false
  } else if (analysis.itemCount > 20) {
    settings.format = 'jpeg'
    settings.quality = 0.75
    settings.compression = true
  }

  // Adjust quality based on estimated size
  if (analysis.estimatedSize > 2000) { // > 2MB estimated
    settings.quality = Math.max(0.4, settings.quality - 0.2)
    settings.compression = true
    settings.priority = 'size'
  }

  return settings
}

/**
 * Gets a human-readable complexity assessment
 * @param {number} complexityScore - Complexity score (1-10)
 * @returns {string} Complexity level description
 */
export const getComplexityLevel = (complexityScore) => {
  if (complexityScore <= 3) return 'Low'
  if (complexityScore <= 6) return 'Medium'
  if (complexityScore <= 8) return 'High'
  return 'Very High'
}

/**
 * Validates content analysis results
 * @param {Object} analysis - Analysis result to validate
 * @returns {boolean} True if analysis is valid
 */
export const validateAnalysis = (analysis) => {
  const requiredFields = [
    'itemCount', 'sectionCount', 'complexityScore', 
    'hasImages', 'hasGradients', 'estimatedSize', 'recommendedSettings'
  ]

  for (const field of requiredFields) {
    if (analysis[field] === undefined || analysis[field] === null) {
      return false
    }
  }

  // Validate ranges
  if (analysis.complexityScore < 1 || analysis.complexityScore > 10) {
    return false
  }

  if (analysis.itemCount < 0 || analysis.sectionCount < 0) {
    return false
  }

  return true
}
/*
*
 * Quick analysis function for getting just the complexity score
 * Useful for components that need a simple complexity assessment
 * @param {HTMLElement} previewElement - The preview area element
 * @returns {number} Complexity score (1-10)
 */
export const getComplexityScore = (previewElement) => {
  try {
    const analysis = analyzeContent(previewElement)
    return analysis.complexityScore
  } catch (error) {
    console.warn('Error calculating complexity score:', error)
    return 5 // Default medium complexity
  }
}

/**
 * Quick function to get recommended settings without full analysis
 * @param {HTMLElement} previewElement - The preview area element
 * @returns {Object} Recommended settings
 */
export const getRecommendedSettings = (previewElement) => {
  try {
    const analysis = analyzeContent(previewElement)
    return analysis.recommendedSettings
  } catch (error) {
    console.warn('Error getting recommended settings:', error)
    return {
      scale: 2,
      format: 'png',
      quality: 0.8,
      compression: false,
      priority: 'balanced'
    }
  }
}

/**
 * Utility function to format file size estimates for display
 * @param {number} sizeInKB - Size in kilobytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (sizeInKB) => {
  if (sizeInKB < 1024) {
    return `${Math.round(sizeInKB)} KB`
  } else {
    const sizeInMB = sizeInKB / 1024
    return `${sizeInMB.toFixed(1)} MB`
  }
}

/**
 * Generates a summary report of the content analysis
 * @param {Object} analysis - Content analysis result
 * @returns {Object} Summary report
 */
export const generateAnalysisReport = (analysis) => {
  return {
    summary: {
      complexity: getComplexityLevel(analysis.complexityScore),
      estimatedSize: formatFileSize(analysis.estimatedSize),
      recommendedFormat: analysis.recommendedSettings.format.toUpperCase(),
      priority: analysis.recommendedSettings.priority
    },
    details: {
      items: analysis.itemCount,
      sections: analysis.sectionCount,
      tables: analysis.tableCount,
      hasImages: analysis.hasImages,
      hasGradients: analysis.hasGradients,
      hasTransparency: analysis.hasTransparency,
      textDensity: Math.round(analysis.textDensity * 100) + '%'
    },
    recommendations: {
      scale: analysis.recommendedSettings.scale,
      format: analysis.recommendedSettings.format,
      quality: analysis.recommendedSettings.quality,
      useCompression: analysis.recommendedSettings.compression
    }
  }
}