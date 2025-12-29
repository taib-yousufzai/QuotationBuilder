/**
 * Progress Manager for PDF Export Operations
 * Handles progress tracking, user feedback, and cancellation support
 */

/**
 * Progress Manager class for handling PDF generation progress
 */
export class ProgressManager {
  constructor() {
    this.isActive = false
    this.isCancelled = false
    this.currentStage = null
    this.progress = 0
    this.callbacks = []
    this.startTime = null
    this.estimatedDuration = null
  }

  /**
   * Start progress tracking
   * @param {number} estimatedDurationMs - Estimated duration in milliseconds
   */
  start(estimatedDurationMs = 10000) {
    this.isActive = true
    this.isCancelled = false
    this.progress = 0
    this.startTime = Date.now()
    this.estimatedDuration = estimatedDurationMs
    
    this.notifyCallbacks({
      stage: 'started',
      progress: 0,
      message: 'Starting PDF export...',
      isActive: true,
      isCancelled: false
    })
  }

  /**
   * Update progress
   * @param {Object} update - Progress update object
   */
  updateProgress(update) {
    if (!this.isActive || this.isCancelled) return

    const {
      stage,
      progress,
      message,
      ...additionalData
    } = update

    if (stage) this.currentStage = stage
    if (typeof progress === 'number') this.progress = Math.min(100, Math.max(0, progress))

    const timeElapsed = Date.now() - this.startTime
    const estimatedTimeRemaining = this.calculateTimeRemaining(timeElapsed)

    this.notifyCallbacks({
      stage: this.currentStage,
      progress: this.progress,
      message: message || this.getDefaultMessage(this.currentStage),
      timeElapsed,
      estimatedTimeRemaining,
      isActive: this.isActive,
      isCancelled: this.isCancelled,
      ...additionalData
    })
  }

  /**
   * Complete progress tracking
   * @param {Object} completionData - Final completion data
   */
  complete(completionData = {}) {
    if (!this.isActive) return

    this.isActive = false
    this.progress = 100
    
    const totalTime = Date.now() - this.startTime

    this.notifyCallbacks({
      stage: 'complete',
      progress: 100,
      message: 'PDF export completed successfully!',
      totalTime,
      isActive: false,
      isCancelled: false,
      ...completionData
    })
  }

  /**
   * Cancel the operation
   * @param {string} reason - Cancellation reason
   */
  cancel(reason = 'User cancelled') {
    if (!this.isActive) return

    this.isCancelled = true
    this.isActive = false

    this.notifyCallbacks({
      stage: 'cancelled',
      progress: this.progress,
      message: `Operation cancelled: ${reason}`,
      isActive: false,
      isCancelled: true,
      cancellationReason: reason
    })
  }

  /**
   * Handle error during operation
   * @param {Error} error - Error that occurred
   * @param {string} stage - Stage where error occurred
   */
  error(error, stage = null) {
    if (!this.isActive) return

    this.isActive = false

    this.notifyCallbacks({
      stage: 'error',
      progress: this.progress,
      message: `Error: ${error.message}`,
      error: error,
      errorStage: stage || this.currentStage,
      isActive: false,
      isCancelled: false
    })
  }

  /**
   * Add progress callback
   * @param {Function} callback - Callback function to receive progress updates
   */
  addCallback(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
  }

  /**
   * Remove progress callback
   * @param {Function} callback - Callback function to remove
   */
  removeCallback(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks() {
    this.callbacks = []
  }

  /**
   * Check if operation is cancellable
   * @returns {boolean} True if operation can be cancelled
   */
  isCancellable() {
    return this.isActive && !this.isCancelled && this.currentStage !== 'saving'
  }

  /**
   * Get current status
   * @returns {Object} Current status object
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isCancelled: this.isCancelled,
      currentStage: this.currentStage,
      progress: this.progress,
      timeElapsed: this.startTime ? Date.now() - this.startTime : 0,
      estimatedTimeRemaining: this.calculateTimeRemaining(this.startTime ? Date.now() - this.startTime : 0)
    }
  }

  /**
   * Calculate estimated time remaining
   * @param {number} timeElapsed - Time elapsed in milliseconds
   * @returns {number} Estimated time remaining in milliseconds
   */
  calculateTimeRemaining(timeElapsed) {
    if (this.progress === 0) return this.estimatedDuration
    if (this.progress >= 100) return 0

    const progressRatio = this.progress / 100
    const estimatedTotal = timeElapsed / progressRatio
    return Math.max(0, estimatedTotal - timeElapsed)
  }

  /**
   * Get default message for stage
   * @param {string} stage - Current stage
   * @returns {string} Default message
   */
  getDefaultMessage(stage) {
    const messages = {
      started: 'Starting PDF export...',
      analyzing: 'Analyzing content...',
      preparing: 'Preparing content...',
      rendering: 'Rendering to canvas...',
      compressing: 'Optimizing image...',
      compression_complete: 'Compression complete',
      pdf_generation: 'Generating PDF...',
      saving: 'Saving file...',
      complete: 'Export completed!',
      error: 'An error occurred',
      cancelled: 'Operation cancelled'
    }

    return messages[stage] || 'Processing...'
  }

  /**
   * Notify all callbacks with progress update
   * @param {Object} data - Progress data to send to callbacks
   */
  notifyCallbacks(data) {
    this.callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.warn('Progress callback error:', error)
      }
    })
  }
}

/**
 * Create a simple progress callback function for basic progress tracking
 * @param {Function} onUpdate - Function to call with progress updates
 * @param {Function} onComplete - Function to call when complete
 * @param {Function} onError - Function to call on error
 * @returns {Function} Progress callback function
 */
export const createProgressCallback = (onUpdate, onComplete = null, onError = null) => {
  return (progressData) => {
    const { stage, progress, message, error } = progressData

    if (stage === 'complete' && onComplete) {
      onComplete(progressData)
    } else if (stage === 'error' && onError) {
      onError(error, progressData)
    } else if (onUpdate) {
      onUpdate(progressData)
    }
  }
}

/**
 * Format time duration for display
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted time string
 */
export const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) {
    return '< 1s'
  }

  const seconds = Math.floor(milliseconds / 1000)
  
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Format progress percentage for display
 * @param {number} progress - Progress value (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatProgress = (progress) => {
  return `${Math.round(progress)}%`
}

/**
 * Create a cancellable PDF export operation
 * @param {Function} exportFunction - The PDF export function to wrap
 * @param {ProgressManager} progressManager - Progress manager instance
 * @returns {Object} Cancellable operation object
 */
export const createCancellableExport = (exportFunction, progressManager) => {
  let isExecuting = false

  const execute = async (...args) => {
    if (isExecuting) {
      throw new Error('Export operation already in progress')
    }

    isExecuting = true
    
    try {
      // Add progress callback to the export function arguments
      const lastArg = args[args.length - 1]
      const options = typeof lastArg === 'object' && lastArg !== null ? lastArg : {}
      
      // Create progress callback that checks for cancellation
      const progressCallback = (data) => {
        if (progressManager.isCancelled) {
          throw new Error('Operation was cancelled')
        }
        progressManager.updateProgress(data)
      }

      const enhancedOptions = {
        ...options,
        progressCallback
      }

      // Replace or add the options argument
      const finalArgs = typeof lastArg === 'object' && lastArg !== null 
        ? [...args.slice(0, -1), enhancedOptions]
        : [...args, enhancedOptions]

      progressManager.start()
      const result = await exportFunction(...finalArgs)
      progressManager.complete()
      
      return result
    } catch (error) {
      if (error.message.includes('cancelled')) {
        progressManager.cancel()
      } else {
        progressManager.error(error)
      }
      throw error
    } finally {
      isExecuting = false
    }
  }

  const cancel = (reason) => {
    progressManager.cancel(reason)
  }

  return {
    execute,
    cancel,
    getStatus: () => progressManager.getStatus(),
    addProgressCallback: (callback) => progressManager.addCallback(callback),
    removeProgressCallback: (callback) => progressManager.removeCallback(callback)
  }
}

/**
 * Default progress manager instance for simple use cases
 */
export const defaultProgressManager = new ProgressManager()

/**
 * Utility function to create a progress-enabled PDF export
 * @param {Function} exportFunction - Original export function
 * @returns {Function} Enhanced export function with progress support
 */
export const withProgress = (exportFunction) => {
  return async (...args) => {
    const progressManager = new ProgressManager()
    const cancellableExport = createCancellableExport(exportFunction, progressManager)
    
    return cancellableExport.execute(...args)
  }
}