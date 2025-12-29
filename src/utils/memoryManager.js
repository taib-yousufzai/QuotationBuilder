/**
 * Memory Management Utilities for PDF Export
 * Handles canvas cleanup, memory monitoring, and fallback strategies
 */

/**
 * Memory monitoring class to track usage during PDF generation
 */
export class MemoryMonitor {
  constructor() {
    this.initialMemory = this.getMemoryInfo()
    this.peakMemory = this.initialMemory
    this.memoryHistory = []
    this.isMonitoring = false
    this.monitoringInterval = null
  }

  /**
   * Get current memory information
   * @returns {Object} Memory information object
   */
  getMemoryInfo() {
    const info = {
      timestamp: Date.now(),
      used: 0,
      total: 0,
      available: 0,
      percentage: 0
    }

    try {
      // Use performance.memory if available (Chrome/Edge)
      if (performance.memory) {
        info.used = performance.memory.usedJSHeapSize || 0
        info.total = performance.memory.totalJSHeapSize || 0
        info.available = performance.memory.jsHeapSizeLimit || 0
        
        // Ensure we have valid numbers and avoid division by zero
        if (info.available > 0 && info.used >= 0) {
          info.percentage = Math.min(100, Math.max(0, (info.used / info.available) * 100))
        } else {
          info.percentage = 30 // Safe fallback
        }
      } else {
        // Fallback estimation based on device capabilities
        const deviceMemory = navigator.deviceMemory || 4 // GB
        info.available = deviceMemory * 1024 * 1024 * 1024 // Convert to bytes
        info.used = info.available * 0.3 // Estimate 30% usage
        info.total = info.available * 0.5 // Estimate 50% allocated
        info.percentage = 30
      }
      
      // Final safety check to ensure percentage is a valid number
      if (isNaN(info.percentage) || !isFinite(info.percentage)) {
        info.percentage = 30
      }
    } catch (error) {
      console.warn('Error getting memory info:', error)
      // Set safe fallback values
      info.percentage = 30
    }

    return info
  }

  /**
   * Start monitoring memory usage
   * @param {number} intervalMs - Monitoring interval in milliseconds
   */
  startMonitoring(intervalMs = 1000) {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.memoryHistory = []
    this.initialMemory = this.getMemoryInfo()
    this.peakMemory = this.initialMemory

    this.monitoringInterval = setInterval(() => {
      const currentMemory = this.getMemoryInfo()
      this.memoryHistory.push(currentMemory)

      // Update peak memory
      if (currentMemory.used > this.peakMemory.used) {
        this.peakMemory = currentMemory
      }

      // Keep only last 60 readings (1 minute at 1s intervals)
      if (this.memoryHistory.length > 60) {
        this.memoryHistory.shift()
      }
    }, intervalMs)
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory usage statistics
   */
  getMemoryStats() {
    const current = this.getMemoryInfo()
    const memoryIncrease = current.used - this.initialMemory.used
    
    return {
      initial: this.initialMemory,
      current: current,
      peak: this.peakMemory,
      increase: memoryIncrease,
      increasePercentage: this.initialMemory.used > 0 ? 
        (memoryIncrease / this.initialMemory.used) * 100 : 0,
      isHighUsage: current.percentage > 80,
      isCriticalUsage: current.percentage > 90,
      history: [...this.memoryHistory]
    }
  }

  /**
   * Check if memory usage is approaching limits
   * @returns {Object} Memory status with recommendations
   */
  checkMemoryStatus() {
    const stats = this.getMemoryStats()
    const status = {
      level: 'normal',
      percentage: stats.current.percentage,
      recommendations: []
    }

    if (stats.current.percentage > 90) {
      status.level = 'critical'
      status.recommendations.push('Reduce canvas scale immediately')
      status.recommendations.push('Use lowest quality settings')
      status.recommendations.push('Consider canceling operation')
    } else if (stats.current.percentage > 80) {
      status.level = 'high'
      status.recommendations.push('Reduce canvas scale')
      status.recommendations.push('Use compressed quality settings')
      status.recommendations.push('Clear unused resources')
    } else if (stats.current.percentage > 60) {
      status.level = 'moderate'
      status.recommendations.push('Monitor memory usage closely')
      status.recommendations.push('Consider using JPEG format')
    }

    return status
  }
}

/**
 * Canvas cleanup utilities
 */
export class CanvasCleanup {
  constructor() {
    this.canvasRegistry = new Set()
    this.contextRegistry = new Set()
  }

  /**
   * Register a canvas for cleanup tracking
   * @param {HTMLCanvasElement} canvas - Canvas to register
   */
  registerCanvas(canvas) {
    if (canvas && canvas instanceof HTMLCanvasElement) {
      this.canvasRegistry.add(canvas)
    }
  }

  /**
   * Register a canvas context for cleanup tracking
   * @param {CanvasRenderingContext2D} context - Context to register
   */
  registerContext(context) {
    if (context) {
      this.contextRegistry.add(context)
    }
  }

  /**
   * Clean up a specific canvas and its context
   * @param {HTMLCanvasElement} canvas - Canvas to clean up
   */
  cleanupCanvas(canvas) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      return
    }

    try {
      // Get context before clearing
      const context = canvas.getContext('2d')
      
      // Clear the canvas
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        this.contextRegistry.delete(context)
      }

      // Reset canvas dimensions to free memory
      canvas.width = 1
      canvas.height = 1

      // Remove from registry
      this.canvasRegistry.delete(canvas)

      // Remove from DOM if it's attached
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    } catch (error) {
      console.warn('Error cleaning up canvas:', error)
    }
  }

  /**
   * Clean up all registered canvases
   */
  cleanupAll() {
    // Clean up all registered canvases
    for (const canvas of this.canvasRegistry) {
      this.cleanupCanvas(canvas)
    }

    // Clear registries
    this.canvasRegistry.clear()
    this.contextRegistry.clear()

    // Force garbage collection if available
    this.forceGarbageCollection()
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    try {
      // Force garbage collection in development/testing environments
      if (window.gc && typeof window.gc === 'function') {
        window.gc()
      }
    } catch (error) {
      // Ignore errors - gc() is not always available
    }
  }

  /**
   * Get cleanup statistics
   * @returns {Object} Cleanup statistics
   */
  getCleanupStats() {
    return {
      registeredCanvases: this.canvasRegistry.size,
      registeredContexts: this.contextRegistry.size,
      totalRegistered: this.canvasRegistry.size + this.contextRegistry.size
    }
  }
}

/**
 * Memory-aware fallback strategies
 */
export class FallbackStrategies {
  constructor() {
    this.strategies = [
      {
        name: 'high_quality',
        scale: 2.0,
        format: 'png',
        quality: 1.0,
        memoryThreshold: 60
      },
      {
        name: 'standard_quality',
        scale: 1.5,
        format: 'jpeg',
        quality: 0.8,
        memoryThreshold: 75
      },
      {
        name: 'compressed_quality',
        scale: 1.2,
        format: 'jpeg',
        quality: 0.6,
        memoryThreshold: 85
      },
      {
        name: 'minimal_quality',
        scale: 1.0,
        format: 'jpeg',
        quality: 0.4,
        memoryThreshold: 95
      }
    ]
  }

  /**
   * Get appropriate fallback strategy based on memory usage
   * @param {number} memoryPercentage - Current memory usage percentage
   * @param {Object} currentSettings - Current export settings
   * @returns {Object} Recommended fallback strategy
   */
  getFallbackStrategy(memoryPercentage, currentSettings = {}) {
    // Find the most appropriate strategy
    let selectedStrategy = this.strategies[this.strategies.length - 1] // Default to minimal

    for (const strategy of this.strategies) {
      if (memoryPercentage <= strategy.memoryThreshold) {
        selectedStrategy = strategy
        break
      }
    }

    // Ensure we're actually reducing resource usage
    if (currentSettings.scale && selectedStrategy.scale >= currentSettings.scale) {
      selectedStrategy = {
        ...selectedStrategy,
        scale: Math.max(1.0, currentSettings.scale * 0.8)
      }
    }

    return {
      ...selectedStrategy,
      reason: `Memory usage at ${memoryPercentage}%, using ${selectedStrategy.name} strategy`
    }
  }

  /**
   * Get progressive fallback sequence
   * @param {Object} initialSettings - Initial export settings
   * @returns {Array} Array of fallback strategies in order
   */
  getProgressiveFallbacks(initialSettings = {}) {
    const fallbacks = []
    
    // Start with current settings if they're more aggressive than our strategies
    if (initialSettings.scale && initialSettings.scale < this.strategies[0].scale) {
      fallbacks.push({
        name: 'current_settings',
        ...initialSettings,
        memoryThreshold: 50
      })
    }

    // Add all strategies
    fallbacks.push(...this.strategies)

    return fallbacks
  }

  /**
   * Calculate memory savings for a strategy
   * @param {Object} originalSettings - Original settings
   * @param {Object} fallbackSettings - Fallback settings
   * @returns {Object} Estimated memory savings
   */
  calculateMemorySavings(originalSettings, fallbackSettings) {
    const originalMemory = this.estimateMemoryUsage(originalSettings)
    const fallbackMemory = this.estimateMemoryUsage(fallbackSettings)
    
    const savings = originalMemory - fallbackMemory
    const savingsPercentage = originalMemory > 0 ? (savings / originalMemory) * 100 : 0

    return {
      originalMemoryMB: Math.round(originalMemory / (1024 * 1024)),
      fallbackMemoryMB: Math.round(fallbackMemory / (1024 * 1024)),
      savingsMB: Math.round(savings / (1024 * 1024)),
      savingsPercentage: Math.round(savingsPercentage)
    }
  }

  /**
   * Estimate memory usage for given settings
   * @param {Object} settings - Export settings
   * @returns {number} Estimated memory usage in bytes
   */
  estimateMemoryUsage(settings) {
    const { scale = 1.5, format = 'jpeg' } = settings
    
    // Base estimation: assume 1920x1080 canvas
    const baseWidth = 1920
    const baseHeight = 1080
    
    const scaledWidth = baseWidth * scale
    const scaledHeight = baseHeight * scale
    
    // Canvas memory usage: width * height * 4 bytes per pixel (RGBA)
    const canvasMemory = scaledWidth * scaledHeight * 4
    
    // Additional overhead for processing
    const processingOverhead = canvasMemory * 0.5
    
    // Format-specific overhead
    const formatMultiplier = format === 'png' ? 1.2 : 0.8
    
    return (canvasMemory + processingOverhead) * formatMultiplier
  }
}

/**
 * Main memory manager class that coordinates all memory management features
 */
export class MemoryManager {
  constructor() {
    this.monitor = new MemoryMonitor()
    this.cleanup = new CanvasCleanup()
    this.fallbacks = new FallbackStrategies()
    this.isActive = false
  }

  /**
   * Start memory management for PDF export
   * @param {Object} options - Memory management options
   */
  start(options = {}) {
    const { monitoringInterval = 1000, enableFallbacks = true } = options
    
    this.isActive = true
    this.monitor.startMonitoring(monitoringInterval)
    
    console.log('Memory management started for PDF export')
  }

  /**
   * Stop memory management and cleanup
   */
  stop() {
    this.isActive = false
    this.monitor.stopMonitoring()
    this.cleanup.cleanupAll()
    
    console.log('Memory management stopped and cleanup completed')
  }

  /**
   * Check if memory management should trigger fallback
   * @returns {Object} Memory status and fallback recommendation
   */
  checkMemoryStatus() {
    const memoryStatus = this.monitor.checkMemoryStatus()
    const stats = this.monitor.getMemoryStats()
    
    return {
      ...memoryStatus,
      stats,
      shouldFallback: memoryStatus.level === 'high' || memoryStatus.level === 'critical',
      fallbackStrategy: memoryStatus.level !== 'normal' ? 
        this.fallbacks.getFallbackStrategy(stats.current.percentage) : null
    }
  }

  /**
   * Register resources for cleanup
   * @param {HTMLCanvasElement} canvas - Canvas to register
   */
  registerCanvas(canvas) {
    this.cleanup.registerCanvas(canvas)
  }

  /**
   * Get comprehensive memory report
   * @returns {Object} Complete memory management report
   */
  getMemoryReport() {
    const memoryStats = this.monitor.getMemoryStats()
    const cleanupStats = this.cleanup.getCleanupStats()
    const memoryStatus = this.monitor.checkMemoryStatus()
    
    return {
      timestamp: Date.now(),
      isActive: this.isActive,
      memory: memoryStats,
      cleanup: cleanupStats,
      status: memoryStatus,
      recommendations: memoryStatus.recommendations
    }
  }
}

/**
 * Create a memory-managed PDF export wrapper
 * @param {Function} exportFunction - Original export function
 * @param {Object} memoryOptions - Memory management options
 * @returns {Function} Memory-managed export function
 */
export const createMemoryManagedExport = (exportFunction, memoryOptions = {}) => {
  return async (...args) => {
    const memoryManager = new MemoryManager()
    
    try {
      // Start memory management
      memoryManager.start(memoryOptions)
      
      // Execute the export function
      const result = await exportFunction(...args)
      
      return result
    } catch (error) {
      console.error('Memory-managed export failed:', error)
      throw error
    } finally {
      // Always cleanup, even if export fails
      memoryManager.stop()
    }
  }
}

/**
 * Utility function to check if low memory mode should be enabled
 * @returns {boolean} True if low memory mode should be enabled
 */
export const shouldUseLowMemoryMode = () => {
  try {
    // Check device memory
    const deviceMemory = navigator.deviceMemory || 4
    if (deviceMemory < 4) {
      return true
    }

    // Check if mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      return true
    }

    // Check current memory usage
    if (performance.memory) {
      const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      if (memoryUsage > 70) {
        return true
      }
    }

    return false
  } catch (error) {
    console.warn('Error checking memory conditions:', error)
    return false // Default to normal mode if check fails
  }
}