/**
 * Canvas Optimizer - Handles dynamic scaling and optimization for PDF export
 */

/**
 * Calculate optimal canvas scale based on content complexity
 * @param {Object} contentAnalysis - Analysis result from contentAnalyzer
 * @param {Object} renderingComplexity - Optional rendering complexity from section analysis
 * @returns {number} Optimal scale factor (1.0 - 3.0)
 */
export const calculateOptimalScale = (contentAnalysis, renderingComplexity = null) => {
  // Base scale factor
  const baseScale = 1.5
  
  // Adjust based on complexity score (1-10 scale)
  const complexityFactor = contentAnalysis.complexityScore / 10
  
  // Adjust based on item count (more items = lower scale to manage memory)
  const itemCountFactor = Math.min(contentAnalysis.itemCount / 20, 1)
  
  // Additional adjustment based on rendering complexity if available
  let renderingFactor = 0
  if (renderingComplexity) {
    // More sections = lower scale to manage memory
    const sectionFactor = Math.min(renderingComplexity.sectionCount / 8, 1)
    // Higher rendering complexity = lower scale
    const renderComplexityFactor = renderingComplexity.complexityScore / 10
    renderingFactor = (sectionFactor + renderComplexityFactor) / 2 * 0.2
  }
  
  // Calculate optimal scale
  let optimalScale = baseScale - (complexityFactor * 0.5) - (itemCountFactor * 0.3) - renderingFactor
  
  // Apply validation limits
  optimalScale = validateScaleFactor(optimalScale)
  
  return optimalScale
}

/**
 * Get fallback scaling for memory-constrained scenarios
 * @param {number} originalScale - The originally calculated scale
 * @param {number} memoryLevel - Memory constraint level (1=low, 2=medium, 3=high)
 * @returns {number} Fallback scale factor
 */
export const getFallbackScale = (originalScale, memoryLevel = 1) => {
  const reductionFactors = {
    1: 0.3, // Low memory - reduce by 30%
    2: 0.5, // Medium memory - reduce by 50%
    3: 0.7  // High memory - reduce by 70%
  }
  
  const reductionFactor = reductionFactors[memoryLevel] || reductionFactors[1]
  const fallbackScale = originalScale * (1 - reductionFactor)
  
  return validateScaleFactor(fallbackScale)
}

/**
 * Validate scale factor limits
 * @param {number} scale - Scale factor to validate
 * @returns {number} Validated scale factor within acceptable limits
 */
export const validateScaleFactor = (scale) => {
  const MIN_SCALE = 1.0
  const MAX_SCALE = 3.0
  
  if (scale < MIN_SCALE) {
    console.warn(`Scale factor ${scale} below minimum, using ${MIN_SCALE}`)
    return MIN_SCALE
  }
  
  if (scale > MAX_SCALE) {
    console.warn(`Scale factor ${scale} above maximum, using ${MAX_SCALE}`)
    return MAX_SCALE
  }
  
  return Math.round(scale * 10) / 10 // Round to 1 decimal place
}

/**
 * Get scale recommendations based on device capabilities
 * @returns {Object} Scale recommendations for different scenarios
 */
export const getScaleRecommendations = () => {
  // Estimate available memory (rough approximation)
  const navigatorMemory = navigator.deviceMemory || 4 // Default to 4GB if not available
  const isLowMemory = navigatorMemory < 4
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return {
    optimal: isLowMemory || isMobile ? 1.2 : 1.5,
    fallback: isLowMemory || isMobile ? 1.0 : 1.2,
    minimum: 1.0,
    maximum: isLowMemory || isMobile ? 2.0 : 3.0
  }
}

/**
 * Smart image format selection based on content type
 * @param {Object} contentAnalysis - Analysis result from contentAnalyzer
 * @param {string} userPreference - User's format preference ('auto', 'jpeg', 'png')
 * @returns {string} Optimal image format ('jpeg' or 'png')
 */
export const selectOptimalFormat = (contentAnalysis, userPreference = 'auto') => {
  // Honor explicit user preference
  if (userPreference !== 'auto') {
    return validateImageFormat(userPreference)
  }
  
  // Auto-selection logic based on content analysis
  const { hasGradients, complexityScore, hasImages, itemCount } = contentAnalysis
  
  // Use JPEG for complex content with gradients or many items
  if (hasGradients || complexityScore > 7 || itemCount > 15) {
    return 'jpeg'
  }
  
  // Use PNG for simple content to preserve quality
  if (complexityScore < 4 && itemCount < 10 && !hasImages) {
    return 'png'
  }
  
  // Default to JPEG for better compression
  return 'jpeg'
}

/**
 * Calculate compression quality for JPEG format
 * @param {Object} contentAnalysis - Analysis result from contentAnalyzer
 * @param {string} qualityPreset - Quality preset ('compressed', 'standard', 'high')
 * @returns {number} JPEG quality (0.1 - 1.0)
 */
export const calculateCompressionQuality = (contentAnalysis, qualityPreset = 'standard') => {
  const { complexityScore, hasImages, itemCount } = contentAnalysis
  
  // Base quality levels for presets
  const baseQualities = {
    compressed: 0.6,
    standard: 0.8,
    high: 0.9
  }
  
  let quality = baseQualities[qualityPreset] || baseQualities.standard
  
  // Adjust quality based on content complexity
  if (complexityScore > 8) {
    quality = Math.min(quality + 0.1, 1.0) // Increase quality for complex content
  } else if (complexityScore < 4) {
    quality = Math.max(quality - 0.1, 0.4) // Decrease quality for simple content
  }
  
  // Adjust for content with images
  if (hasImages) {
    quality = Math.min(quality + 0.05, 1.0)
  }
  
  // Adjust for item count
  if (itemCount > 20) {
    quality = Math.max(quality - 0.05, 0.4)
  }
  
  return Math.round(quality * 100) / 100 // Round to 2 decimal places
}

/**
 * Validate image format
 * @param {string} format - Format to validate
 * @returns {string} Valid format ('jpeg' or 'png')
 */
export const validateImageFormat = (format) => {
  const validFormats = ['jpeg', 'jpg', 'png']
  const normalizedFormat = format.toLowerCase()
  
  if (!validFormats.includes(normalizedFormat)) {
    console.warn(`Invalid format ${format}, defaulting to jpeg`)
    return 'jpeg'
  }
  
  // Normalize jpg to jpeg
  return normalizedFormat === 'jpg' ? 'jpeg' : normalizedFormat
}

/**
 * Get format recommendations with fallback options
 * @param {Object} contentAnalysis - Analysis result from contentAnalyzer
 * @returns {Object} Format recommendations with fallback options
 */
export const getFormatRecommendations = (contentAnalysis) => {
  const primary = selectOptimalFormat(contentAnalysis, 'auto')
  const fallback = primary === 'jpeg' ? 'png' : 'jpeg'
  
  return {
    primary: {
      format: primary,
      quality: primary === 'jpeg' ? calculateCompressionQuality(contentAnalysis, 'standard') : 1.0
    },
    fallback: {
      format: fallback,
      quality: fallback === 'jpeg' ? calculateCompressionQuality(contentAnalysis, 'compressed') : 1.0
    },
    compressed: {
      format: 'jpeg',
      quality: calculateCompressionQuality(contentAnalysis, 'compressed')
    }
  }
}
/**

 * Progressive compression with fallback options
 * @param {HTMLCanvasElement} canvas - Canvas element to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} Compressed image data with metadata
 */
export const compressCanvasProgressive = async (canvas, options = {}) => {
  const {
    targetSizeKB = 500, // Target file size in KB
    maxAttempts = 3,
    initialQuality = 0.8,
    progressCallback = null
  } = options
  
  const targetSizeBytes = targetSizeKB * 1024
  
  // Define compression strategies in order of preference
  const strategies = [
    { format: 'jpeg', quality: initialQuality },
    { format: 'jpeg', quality: initialQuality * 0.75 },
    { format: 'jpeg', quality: initialQuality * 0.5 },
    { format: 'jpeg', quality: 0.3 }
  ]
  
  let bestResult = null
  let compressionRatio = 0
  
  for (let i = 0; i < Math.min(strategies.length, maxAttempts); i++) {
    const strategy = strategies[i]
    
    try {
      if (progressCallback) {
        progressCallback({
          stage: 'compression',
          attempt: i + 1,
          totalAttempts: maxAttempts,
          strategy: strategy
        })
      }
      
      const result = await compressCanvas(canvas, strategy.format, strategy.quality)
      
      // Calculate compression ratio
      const originalSize = getCanvasSize(canvas, 'png', 1.0)
      compressionRatio = originalSize > 0 ? (originalSize - result.size) / originalSize : 0
      
      // Store the best result so far
      if (!bestResult || result.size < bestResult.size) {
        bestResult = {
          ...result,
          compressionRatio,
          strategy
        }
      }
      
      // If we've reached the target size, use this result
      if (result.size <= targetSizeBytes) {
        break
      }
      
    } catch (error) {
      console.warn(`Compression attempt ${i + 1} failed:`, error)
      continue
    }
  }
  
  // If no compression worked, fall back to PNG
  if (!bestResult) {
    console.warn('All compression attempts failed, falling back to PNG')
    bestResult = await compressCanvas(canvas, 'png', 1.0)
    bestResult.compressionRatio = 0
    bestResult.strategy = { format: 'png', quality: 1.0 }
  }
  
  return bestResult
}

/**
 * Compress canvas to specific format and quality
 * @param {HTMLCanvasElement} canvas - Canvas to compress
 * @param {string} format - Image format ('jpeg' or 'png')
 * @param {number} quality - Compression quality (0.1 - 1.0)
 * @returns {Promise<Object>} Compressed image data
 */
export const compressCanvas = async (canvas, format, quality) => {
  return new Promise((resolve, reject) => {
    try {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      const dataURL = canvas.toDataURL(mimeType, quality)
      
      // Calculate approximate file size (base64 encoding adds ~33% overhead)
      const base64Length = dataURL.split(',')[1].length
      const sizeBytes = Math.round(base64Length * 0.75) // Approximate actual size
      
      resolve({
        dataURL,
        format,
        quality,
        size: sizeBytes,
        sizeKB: Math.round(sizeBytes / 1024 * 10) / 10
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get estimated canvas size for a given format and quality
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format
 * @param {number} quality - Compression quality
 * @returns {number} Estimated size in bytes
 */
export const getCanvasSize = (canvas, format, quality) => {
  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataURL = canvas.toDataURL(mimeType, quality)
    const base64Length = dataURL.split(',')[1].length
    return Math.round(base64Length * 0.75)
  } catch (error) {
    console.warn('Error calculating canvas size:', error)
    return 0
  }
}

/**
 * Validate file size and suggest adjustments
 * @param {number} fileSizeBytes - Current file size in bytes
 * @param {number} targetSizeBytes - Target file size in bytes
 * @returns {Object} Validation result with suggestions
 */
export const validateFileSize = (fileSizeBytes, targetSizeBytes) => {
  const fileSizeKB = Math.round(fileSizeBytes / 1024 * 10) / 10
  const targetSizeKB = Math.round(targetSizeBytes / 1024 * 10) / 10
  const ratio = fileSizeBytes / targetSizeBytes
  
  const result = {
    isValid: fileSizeBytes <= targetSizeBytes,
    currentSizeKB: fileSizeKB,
    targetSizeKB: targetSizeKB,
    ratio: Math.round(ratio * 100) / 100,
    suggestions: []
  }
  
  if (!result.isValid) {
    if (ratio > 2) {
      result.suggestions.push('Consider using JPEG format with lower quality')
      result.suggestions.push('Reduce canvas scale factor')
    } else if (ratio > 1.5) {
      result.suggestions.push('Try JPEG format with medium quality')
    } else {
      result.suggestions.push('Slightly reduce compression quality')
    }
  }
  
  return result
}

/**
 * Monitor compression ratio and performance
 * @param {Object} compressionResult - Result from compression operation
 * @returns {Object} Performance metrics
 */
export const monitorCompressionRatio = (compressionResult) => {
  const { size, compressionRatio, strategy } = compressionResult
  
  const metrics = {
    finalSizeKB: Math.round(size / 1024 * 10) / 10,
    compressionRatio: Math.round(compressionRatio * 100),
    strategy: strategy,
    efficiency: 'unknown'
  }
  
  // Determine compression efficiency
  if (compressionRatio > 0.8) {
    metrics.efficiency = 'excellent'
  } else if (compressionRatio > 0.6) {
    metrics.efficiency = 'good'
  } else if (compressionRatio > 0.4) {
    metrics.efficiency = 'fair'
  } else {
    metrics.efficiency = 'poor'
  }
  
  return metrics
}