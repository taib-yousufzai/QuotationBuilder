/**
 * Quality Presets for PDF Export
 * Defines predefined quality settings and user preference management
 */

/**
 * Predefined quality presets for PDF export
 */
export const QUALITY_PRESETS = {
  compressed: {
    id: 'compressed',
    name: 'Compressed',
    description: 'Smallest file size, good for sharing',
    icon: '📦',
    settings: {
      quality: 'compressed',
      format: 'jpeg',
      scale: 1.2,
      targetSizeKB: 300,
      compressionLevel: 'high'
    },
    benefits: [
      'Smallest file size (typically < 500KB)',
      'Fast email sharing',
      'Quick upload/download'
    ],
    tradeoffs: [
      'Slightly reduced image quality',
      'May lose fine details'
    ],
    recommendedFor: [
      'Email attachments',
      'Quick sharing',
      'Large quotations (20+ items)'
    ]
  },

  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced quality and file size',
    icon: '⚖️',
    settings: {
      quality: 'standard',
      format: 'auto',
      scale: 'auto',
      targetSizeKB: 800,
      compressionLevel: 'medium'
    },
    benefits: [
      'Good balance of quality and size',
      'Suitable for most use cases',
      'Automatic optimization'
    ],
    tradeoffs: [
      'Moderate file size',
      'Some compression artifacts possible'
    ],
    recommendedFor: [
      'General use',
      'Client presentations',
      'Most quotations'
    ]
  },

  high: {
    id: 'high',
    name: 'High Quality',
    description: 'Best visual quality, larger files',
    icon: '✨',
    settings: {
      quality: 'high',
      format: 'png',
      scale: 2.5,
      targetSizeKB: 2000,
      compressionLevel: 'low'
    },
    benefits: [
      'Maximum visual quality',
      'Crisp text and graphics',
      'Professional appearance'
    ],
    tradeoffs: [
      'Larger file sizes',
      'Slower generation',
      'May exceed email limits'
    ],
    recommendedFor: [
      'Final client deliverables',
      'Print-ready documents',
      'Important presentations'
    ]
  }
}

/**
 * Get quality preset by ID
 * @param {string} presetId - Preset identifier
 * @returns {Object|null} Quality preset object or null if not found
 */
export const getQualityPreset = (presetId) => {
  return QUALITY_PRESETS[presetId] || null
}

/**
 * Get all available quality presets
 * @returns {Array} Array of quality preset objects
 */
export const getAllQualityPresets = () => {
  return Object.values(QUALITY_PRESETS)
}

/**
 * Get quality preset settings for PDF export
 * @param {string} presetId - Preset identifier
 * @returns {Object} Settings object for PDF export
 */
export const getPresetSettings = (presetId) => {
  const preset = getQualityPreset(presetId)
  return preset ? preset.settings : QUALITY_PRESETS.standard.settings
}

/**
 * User preference storage keys
 */
const STORAGE_KEYS = {
  PREFERRED_QUALITY: 'pdf_export_preferred_quality',
  QUALITY_HISTORY: 'pdf_export_quality_history',
  USER_SETTINGS: 'pdf_export_user_settings'
}

/**
 * Save user's preferred quality setting
 * @param {string} presetId - Preferred quality preset ID
 */
export const savePreferredQuality = (presetId) => {
  try {
    if (!QUALITY_PRESETS[presetId]) {
      console.warn(`Invalid quality preset: ${presetId}`)
      return
    }

    localStorage.setItem(STORAGE_KEYS.PREFERRED_QUALITY, presetId)
    
    // Update usage history
    updateQualityHistory(presetId)
  } catch (error) {
    console.warn('Error saving preferred quality:', error)
  }
}

/**
 * Get user's preferred quality setting
 * @returns {string} Preferred quality preset ID
 */
export const getPreferredQuality = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERRED_QUALITY)
    return saved && QUALITY_PRESETS[saved] ? saved : 'standard'
  } catch (error) {
    console.warn('Error loading preferred quality:', error)
    return 'standard'
  }
}

/**
 * Update quality usage history
 * @param {string} presetId - Quality preset ID that was used
 */
const updateQualityHistory = (presetId) => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.QUALITY_HISTORY)
    const history = historyJson ? JSON.parse(historyJson) : {}
    
    // Increment usage count
    history[presetId] = (history[presetId] || 0) + 1
    
    // Store timestamp of last use
    history[`${presetId}_lastUsed`] = Date.now()
    
    localStorage.setItem(STORAGE_KEYS.QUALITY_HISTORY, JSON.stringify(history))
  } catch (error) {
    console.warn('Error updating quality history:', error)
  }
}

/**
 * Get quality usage statistics
 * @returns {Object} Usage statistics for each quality preset
 */
export const getQualityUsageStats = () => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.QUALITY_HISTORY)
    const history = historyJson ? JSON.parse(historyJson) : {}
    
    const stats = {}
    
    Object.keys(QUALITY_PRESETS).forEach(presetId => {
      stats[presetId] = {
        usageCount: history[presetId] || 0,
        lastUsed: history[`${presetId}_lastUsed`] || null,
        lastUsedFormatted: history[`${presetId}_lastUsed`] 
          ? new Date(history[`${presetId}_lastUsed`]).toLocaleDateString()
          : 'Never'
      }
    })
    
    return stats
  } catch (error) {
    console.warn('Error loading quality usage stats:', error)
    return {}
  }
}

/**
 * Get recommended quality preset based on content analysis
 * @param {Object} contentAnalysis - Content analysis result
 * @returns {string} Recommended quality preset ID
 */
export const getRecommendedQuality = (contentAnalysis) => {
  if (!contentAnalysis) return 'standard'
  
  const { complexityScore, itemCount, estimatedSize, hasImages, hasGradients } = contentAnalysis
  
  // Recommend compressed for large/complex content
  if (itemCount > 30 || estimatedSize > 2000 || complexityScore > 8) {
    return 'compressed'
  }
  
  // Recommend high quality for simple, important content
  if (itemCount < 10 && complexityScore < 4 && !hasImages && !hasGradients) {
    return 'high'
  }
  
  // Default to standard for most cases
  return 'standard'
}

/**
 * Save custom user settings
 * @param {Object} settings - Custom settings object
 */
export const saveUserSettings = (settings) => {
  try {
    const currentSettings = getUserSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings))
  } catch (error) {
    console.warn('Error saving user settings:', error)
  }
}

/**
 * Get user's custom settings
 * @returns {Object} User settings object
 */
export const getUserSettings = () => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
    return settingsJson ? JSON.parse(settingsJson) : {}
  } catch (error) {
    console.warn('Error loading user settings:', error)
    return {}
  }
}

/**
 * Reset all user preferences to defaults
 */
export const resetUserPreferences = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERRED_QUALITY)
    localStorage.removeItem(STORAGE_KEYS.QUALITY_HISTORY)
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS)
  } catch (error) {
    console.warn('Error resetting user preferences:', error)
  }
}

/**
 * Create quality preset options for UI components
 * @param {Object} contentAnalysis - Optional content analysis for recommendations
 * @returns {Array} Array of preset options with UI-friendly properties
 */
export const createQualityOptions = (contentAnalysis = null) => {
  const recommended = contentAnalysis ? getRecommendedQuality(contentAnalysis) : null
  const preferred = getPreferredQuality()
  const stats = getQualityUsageStats()
  
  return getAllQualityPresets().map(preset => ({
    ...preset,
    isRecommended: preset.id === recommended,
    isPreferred: preset.id === preferred,
    usageCount: stats[preset.id]?.usageCount || 0,
    lastUsed: stats[preset.id]?.lastUsedFormatted || 'Never',
    estimatedSize: estimatePresetFileSize(preset, contentAnalysis),
    estimatedTime: estimatePresetTime(preset, contentAnalysis)
  }))
}

/**
 * Estimate file size for a quality preset
 * @param {Object} preset - Quality preset
 * @param {Object} contentAnalysis - Content analysis result
 * @returns {string} Estimated file size string
 */
const estimatePresetFileSize = (preset, contentAnalysis) => {
  if (!contentAnalysis) return 'Unknown'
  
  const baseSize = contentAnalysis.estimatedSize || 500
  const multipliers = {
    compressed: 0.3,
    standard: 0.6,
    high: 1.2
  }
  
  const multiplier = multipliers[preset.id] || 0.6
  const estimatedKB = Math.round(baseSize * multiplier)
  
  if (estimatedKB < 1024) {
    return `~${estimatedKB} KB`
  } else {
    return `~${(estimatedKB / 1024).toFixed(1)} MB`
  }
}

/**
 * Estimate generation time for a quality preset
 * @param {Object} preset - Quality preset
 * @param {Object} contentAnalysis - Content analysis result
 * @returns {string} Estimated time string
 */
const estimatePresetTime = (preset, contentAnalysis) => {
  if (!contentAnalysis) return 'Unknown'
  
  const baseTime = 3 // seconds
  const itemFactor = (contentAnalysis.itemCount || 10) * 0.1
  const complexityFactor = (contentAnalysis.complexityScore || 5) * 0.2
  
  const timeMultipliers = {
    compressed: 0.8,
    standard: 1.0,
    high: 1.5
  }
  
  const multiplier = timeMultipliers[preset.id] || 1.0
  const estimatedSeconds = Math.round((baseTime + itemFactor + complexityFactor) * multiplier)
  
  if (estimatedSeconds < 60) {
    return `~${estimatedSeconds}s`
  } else {
    const minutes = Math.floor(estimatedSeconds / 60)
    const seconds = estimatedSeconds % 60
    return seconds > 0 ? `~${minutes}m ${seconds}s` : `~${minutes}m`
  }
}

/**
 * Validate quality preset settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validated settings with corrections applied
 */
export const validatePresetSettings = (settings) => {
  const validated = { ...settings }
  
  // Validate quality
  if (!['compressed', 'standard', 'high'].includes(validated.quality)) {
    validated.quality = 'standard'
  }
  
  // Validate format
  if (!['auto', 'jpeg', 'png'].includes(validated.format)) {
    validated.format = 'auto'
  }
  
  // Validate scale
  if (validated.scale !== 'auto' && (typeof validated.scale !== 'number' || validated.scale < 1 || validated.scale > 3)) {
    validated.scale = 'auto'
  }
  
  // Validate target size
  if (typeof validated.targetSizeKB !== 'number' || validated.targetSizeKB < 100 || validated.targetSizeKB > 5000) {
    validated.targetSizeKB = 800
  }
  
  return validated
}

/**
 * Export quality preset for sharing or backup
 * @param {string} presetId - Preset ID to export
 * @returns {Object} Exportable preset configuration
 */
export const exportPresetConfig = (presetId) => {
  const preset = getQualityPreset(presetId)
  if (!preset) return null
  
  return {
    id: preset.id,
    name: preset.name,
    settings: preset.settings,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
}

/**
 * Import quality preset configuration
 * @param {Object} config - Preset configuration to import
 * @returns {boolean} True if import was successful
 */
export const importPresetConfig = (config) => {
  try {
    if (!config || !config.id || !config.settings) {
      return false
    }
    
    const validatedSettings = validatePresetSettings(config.settings)
    
    // For now, we only support importing as user preferences
    // In the future, this could support custom presets
    saveUserSettings({
      customPreset: {
        ...config,
        settings: validatedSettings,
        importedAt: new Date().toISOString()
      }
    })
    
    return true
  } catch (error) {
    console.warn('Error importing preset config:', error)
    return false
  }
}