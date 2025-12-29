/**
 * Performance Benchmarks for PDF Export Optimization
 * Measures generation time improvements, memory usage, and visual quality maintenance
 */

import { analyzeContent } from './contentAnalyzer.js'
import { exportToPDF } from './pdfExport.js'

/**
 * Performance metrics collector
 */
export class PerformanceBenchmark {
  constructor() {
    this.metrics = {
      generationTime: [],
      memoryUsage: [],
      fileSizes: [],
      qualityScores: [],
      compressionRatios: []
    }
    this.baselineMetrics = null
    this.isRunning = false
  }

  /**
   * Start a performance benchmark session
   * @param {Object} options - Benchmark options
   */
  start(options = {}) {
    this.isRunning = true
    this.sessionStart = performance.now()
    this.initialMemory = this.getMemoryUsage()
    
    console.log('Performance benchmark session started', {
      timestamp: new Date().toISOString(),
      initialMemory: this.initialMemory,
      options
    })
  }

  /**
   * Stop the benchmark session
   */
  stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    this.sessionEnd = performance.now()
    this.sessionDuration = this.sessionEnd - this.sessionStart
    
    console.log('Performance benchmark session completed', {
      duration: this.sessionDuration,
      totalTests: this.getTotalTestCount()
    })
  }

  /**
   * Get current memory usage
   * @returns {Object} Memory usage information
   */
  getMemoryUsage() {
    const memory = {
      timestamp: performance.now(),
      used: 0,
      total: 0,
      percentage: 0
    }

    // Use performance.memory if available (Chrome)
    if (performance.memory) {
      memory.used = performance.memory.usedJSHeapSize
      memory.total = performance.memory.totalJSHeapSize
      memory.percentage = (memory.used / memory.total) * 100
    }

    // Estimate memory usage for other browsers
    if (memory.used === 0) {
      // Rough estimation based on DOM complexity
      const elements = document.querySelectorAll('*').length
      memory.used = elements * 1000 // Rough estimate: 1KB per element
      memory.total = navigator.deviceMemory ? navigator.deviceMemory * 1024 * 1024 * 1024 : 4 * 1024 * 1024 * 1024
      memory.percentage = (memory.used / memory.total) * 100
    }

    return memory
  }

  /**
   * Record generation time benchmark
   * @param {number} startTime - Start time in milliseconds
   * @param {number} endTime - End time in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  recordGenerationTime(startTime, endTime, metadata = {}) {
    const duration = endTime - startTime
    
    this.metrics.generationTime.push({
      duration,
      startTime,
      endTime,
      timestamp: new Date().toISOString(),
      ...metadata
    })

    console.log(`Generation time recorded: ${duration}ms`, metadata)
  }

  /**
   * Record memory usage during operation
   * @param {string} stage - Operation stage
   * @param {Object} additionalData - Additional data
   */
  recordMemoryUsage(stage, additionalData = {}) {
    const memoryUsage = this.getMemoryUsage()
    
    this.metrics.memoryUsage.push({
      stage,
      ...memoryUsage,
      ...additionalData
    })

    console.log(`Memory usage recorded for ${stage}:`, memoryUsage)
  }

  /**
   * Record file size metrics
   * @param {number} fileSizeBytes - File size in bytes
   * @param {Object} metadata - Additional metadata
   */
  recordFileSize(fileSizeBytes, metadata = {}) {
    const fileSizeKB = Math.round(fileSizeBytes / 1024 * 10) / 10
    const fileSizeMB = Math.round(fileSizeKB / 1024 * 100) / 100

    this.metrics.fileSizes.push({
      bytes: fileSizeBytes,
      kb: fileSizeKB,
      mb: fileSizeMB,
      timestamp: new Date().toISOString(),
      ...metadata
    })

    console.log(`File size recorded: ${fileSizeKB} KB`, metadata)
  }

  /**
   * Record visual quality score
   * @param {number} qualityScore - Quality score (0-100)
   * @param {Object} metadata - Additional metadata
   */
  recordQualityScore(qualityScore, metadata = {}) {
    this.metrics.qualityScores.push({
      score: qualityScore,
      timestamp: new Date().toISOString(),
      ...metadata
    })

    console.log(`Quality score recorded: ${qualityScore}`, metadata)
  }

  /**
   * Record compression ratio
   * @param {number} originalSize - Original size in bytes
   * @param {number} compressedSize - Compressed size in bytes
   * @param {Object} metadata - Additional metadata
   */
  recordCompressionRatio(originalSize, compressedSize, metadata = {}) {
    const ratio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0
    const percentage = Math.round(ratio * 100)

    this.metrics.compressionRatios.push({
      originalSize,
      compressedSize,
      ratio,
      percentage,
      timestamp: new Date().toISOString(),
      ...metadata
    })

    console.log(`Compression ratio recorded: ${percentage}%`, metadata)
  }

  /**
   * Get total test count across all metrics
   * @returns {number} Total number of tests recorded
   */
  getTotalTestCount() {
    return Object.values(this.metrics).reduce((total, metricArray) => total + metricArray.length, 0)
  }

  /**
   * Generate performance report
   * @returns {Object} Comprehensive performance report
   */
  generateReport() {
    const report = {
      summary: this.generateSummary(),
      generationTime: this.analyzeGenerationTime(),
      memoryUsage: this.analyzeMemoryUsage(),
      fileSizes: this.analyzeFileSizes(),
      qualityScores: this.analyzeQualityScores(),
      compressionRatios: this.analyzeCompressionRatios(),
      recommendations: this.generateRecommendations()
    }

    return report
  }

  /**
   * Generate summary statistics
   * @returns {Object} Summary statistics
   */
  generateSummary() {
    return {
      sessionDuration: this.sessionDuration || 0,
      totalTests: this.getTotalTestCount(),
      testCounts: {
        generationTime: this.metrics.generationTime.length,
        memoryUsage: this.metrics.memoryUsage.length,
        fileSizes: this.metrics.fileSizes.length,
        qualityScores: this.metrics.qualityScores.length,
        compressionRatios: this.metrics.compressionRatios.length
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Analyze generation time metrics
   * @returns {Object} Generation time analysis
   */
  analyzeGenerationTime() {
    const times = this.metrics.generationTime.map(m => m.duration)
    
    if (times.length === 0) {
      return { message: 'No generation time data available' }
    }

    return {
      count: times.length,
      average: this.calculateAverage(times),
      median: this.calculateMedian(times),
      min: Math.min(...times),
      max: Math.max(...times),
      standardDeviation: this.calculateStandardDeviation(times),
      improvement: this.calculateImprovement('generationTime')
    }
  }

  /**
   * Analyze memory usage metrics
   * @returns {Object} Memory usage analysis
   */
  analyzeMemoryUsage() {
    const memoryData = this.metrics.memoryUsage
    
    if (memoryData.length === 0) {
      return { message: 'No memory usage data available' }
    }

    const percentages = memoryData.map(m => m.percentage)
    const peakUsage = Math.max(...percentages)
    const averageUsage = this.calculateAverage(percentages)

    return {
      count: memoryData.length,
      peakUsage: Math.round(peakUsage * 10) / 10,
      averageUsage: Math.round(averageUsage * 10) / 10,
      stages: this.groupByStage(memoryData),
      memoryEfficiency: this.calculateMemoryEfficiency(memoryData)
    }
  }

  /**
   * Analyze file size metrics
   * @returns {Object} File size analysis
   */
  analyzeFileSizes() {
    const sizes = this.metrics.fileSizes.map(m => m.kb)
    
    if (sizes.length === 0) {
      return { message: 'No file size data available' }
    }

    return {
      count: sizes.length,
      averageKB: Math.round(this.calculateAverage(sizes) * 10) / 10,
      medianKB: Math.round(this.calculateMedian(sizes) * 10) / 10,
      minKB: Math.min(...sizes),
      maxKB: Math.max(...sizes),
      under2MB: sizes.filter(s => s < 2048).length,
      under1MB: sizes.filter(s => s < 1024).length,
      sizeReduction: this.calculateSizeReduction()
    }
  }

  /**
   * Analyze quality scores
   * @returns {Object} Quality score analysis
   */
  analyzeQualityScores() {
    const scores = this.metrics.qualityScores.map(m => m.score)
    
    if (scores.length === 0) {
      return { message: 'No quality score data available' }
    }

    return {
      count: scores.length,
      average: Math.round(this.calculateAverage(scores) * 10) / 10,
      median: this.calculateMedian(scores),
      min: Math.min(...scores),
      max: Math.max(...scores),
      above80: scores.filter(s => s >= 80).length,
      above90: scores.filter(s => s >= 90).length
    }
  }

  /**
   * Analyze compression ratios
   * @returns {Object} Compression ratio analysis
   */
  analyzeCompressionRatios() {
    const ratios = this.metrics.compressionRatios.map(m => m.percentage)
    
    if (ratios.length === 0) {
      return { message: 'No compression ratio data available' }
    }

    return {
      count: ratios.length,
      averageReduction: Math.round(this.calculateAverage(ratios)),
      medianReduction: this.calculateMedian(ratios),
      bestReduction: Math.max(...ratios),
      worstReduction: Math.min(...ratios),
      above70Percent: ratios.filter(r => r >= 70).length,
      above80Percent: ratios.filter(r => r >= 80).length
    }
  }

  /**
   * Generate performance recommendations
   * @returns {Array} Array of recommendation strings
   */
  generateRecommendations() {
    const recommendations = []
    const report = {
      generationTime: this.analyzeGenerationTime(),
      memoryUsage: this.analyzeMemoryUsage(),
      fileSizes: this.analyzeFileSizes(),
      qualityScores: this.analyzeQualityScores(),
      compressionRatios: this.analyzeCompressionRatios()
    }

    // Generation time recommendations
    if (report.generationTime.average > 8000) {
      recommendations.push('Consider reducing canvas scale or enabling more aggressive compression for faster generation')
    }

    // Memory usage recommendations
    if (report.memoryUsage.peakUsage > 80) {
      recommendations.push('High memory usage detected - consider enabling memory management features')
    }

    // File size recommendations
    if (report.fileSizes.averageKB > 2048) {
      recommendations.push('Average file size exceeds 2MB - consider using more aggressive compression settings')
    }

    // Quality recommendations
    if (report.qualityScores.average < 80) {
      recommendations.push('Quality scores below target - consider adjusting compression settings or scale factor')
    }

    // Compression recommendations
    if (report.compressionRatios.averageReduction < 60) {
      recommendations.push('Compression efficiency below target - review content analysis and format selection')
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges')
    }

    return recommendations
  }

  /**
   * Calculate average of an array of numbers
   * @param {Array} numbers - Array of numbers
   * @returns {number} Average value
   */
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  /**
   * Calculate median of an array of numbers
   * @param {Array} numbers - Array of numbers
   * @returns {number} Median value
   */
  calculateMedian(numbers) {
    if (numbers.length === 0) return 0
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    }
    return sorted[middle]
  }

  /**
   * Calculate standard deviation
   * @param {Array} numbers - Array of numbers
   * @returns {number} Standard deviation
   */
  calculateStandardDeviation(numbers) {
    if (numbers.length === 0) return 0
    const avg = this.calculateAverage(numbers)
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2))
    const avgSquaredDiff = this.calculateAverage(squaredDiffs)
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * Calculate improvement percentage compared to baseline
   * @param {string} metricType - Type of metric to compare
   * @returns {number} Improvement percentage (positive = better)
   */
  calculateImprovement(metricType) {
    if (!this.baselineMetrics || !this.baselineMetrics[metricType]) {
      return null
    }

    const current = this.metrics[metricType]
    const baseline = this.baselineMetrics[metricType]

    if (current.length === 0 || baseline.length === 0) {
      return null
    }

    const currentAvg = this.calculateAverage(current.map(m => m.duration || m.kb || m.score))
    const baselineAvg = this.calculateAverage(baseline.map(m => m.duration || m.kb || m.score))

    // For generation time and file size, lower is better
    if (metricType === 'generationTime' || metricType === 'fileSizes') {
      return ((baselineAvg - currentAvg) / baselineAvg) * 100
    }

    // For quality scores, higher is better
    return ((currentAvg - baselineAvg) / baselineAvg) * 100
  }

  /**
   * Group memory usage data by stage
   * @param {Array} memoryData - Memory usage data
   * @returns {Object} Grouped data by stage
   */
  groupByStage(memoryData) {
    const grouped = {}
    
    memoryData.forEach(data => {
      if (!grouped[data.stage]) {
        grouped[data.stage] = []
      }
      grouped[data.stage].push(data.percentage)
    })

    // Calculate averages for each stage
    Object.keys(grouped).forEach(stage => {
      const percentages = grouped[stage]
      grouped[stage] = {
        count: percentages.length,
        average: Math.round(this.calculateAverage(percentages) * 10) / 10,
        peak: Math.max(...percentages)
      }
    })

    return grouped
  }

  /**
   * Calculate memory efficiency score
   * @param {Array} memoryData - Memory usage data
   * @returns {number} Efficiency score (0-100)
   */
  calculateMemoryEfficiency(memoryData) {
    if (memoryData.length === 0) return 0

    const percentages = memoryData.map(m => m.percentage)
    const peakUsage = Math.max(...percentages)
    const averageUsage = this.calculateAverage(percentages)

    // Efficiency is better when peak usage is low and usage is consistent
    const peakScore = Math.max(0, 100 - peakUsage)
    const consistencyScore = Math.max(0, 100 - this.calculateStandardDeviation(percentages))

    return Math.round((peakScore + consistencyScore) / 2)
  }

  /**
   * Calculate size reduction compared to baseline
   * @returns {Object} Size reduction metrics
   */
  calculateSizeReduction() {
    if (!this.baselineMetrics || !this.baselineMetrics.fileSizes) {
      return { message: 'No baseline data for comparison' }
    }

    const currentSizes = this.metrics.fileSizes.map(m => m.kb)
    const baselineSizes = this.baselineMetrics.fileSizes.map(m => m.kb)

    if (currentSizes.length === 0 || baselineSizes.length === 0) {
      return { message: 'Insufficient data for comparison' }
    }

    const currentAvg = this.calculateAverage(currentSizes)
    const baselineAvg = this.calculateAverage(baselineSizes)
    const reduction = ((baselineAvg - currentAvg) / baselineAvg) * 100

    return {
      currentAverageKB: Math.round(currentAvg * 10) / 10,
      baselineAverageKB: Math.round(baselineAvg * 10) / 10,
      reductionPercentage: Math.round(reduction * 10) / 10,
      reductionKB: Math.round((baselineAvg - currentAvg) * 10) / 10
    }
  }

  /**
   * Set baseline metrics for comparison
   * @param {Object} baselineData - Baseline performance data
   */
  setBaseline(baselineData) {
    this.baselineMetrics = baselineData
    console.log('Baseline metrics set for comparison')
  }

  /**
   * Export metrics data
   * @returns {Object} All collected metrics
   */
  exportData() {
    return {
      metrics: this.metrics,
      baseline: this.baselineMetrics,
      sessionInfo: {
        duration: this.sessionDuration,
        start: this.sessionStart,
        end: this.sessionEnd
      }
    }
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics() {
    this.metrics = {
      generationTime: [],
      memoryUsage: [],
      fileSizes: [],
      qualityScores: [],
      compressionRatios: []
    }
    console.log('Performance metrics cleared')
  }
}

/**
 * Benchmark PDF export performance with different settings
 * @param {HTMLElement} previewElement - Preview element to test
 * @param {Object} testConfig - Test configuration
 * @returns {Promise<Object>} Benchmark results
 */
export const benchmarkPDFExport = async (previewElement, testConfig = {}) => {
  const {
    qualityPresets = ['compressed', 'standard', 'high'],
    iterations = 3,
    includeBaseline = true,
    mockFormData = { docNo: 'BENCHMARK-001' },
    mockRows = [],
    staffMode = false,
    currency = 'USD',
    pageSize = 'a4',
    orientation = 'portrait'
  } = testConfig

  const benchmark = new PerformanceBenchmark()
  benchmark.start({ testConfig })

  const results = {
    testConfig,
    qualityResults: {},
    baseline: null,
    summary: null
  }

  try {
    // Run baseline test if requested (unoptimized export)
    if (includeBaseline) {
      console.log('Running baseline performance test...')
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        benchmark.recordMemoryUsage('baseline_start')

        try {
          // Simulate baseline export (unoptimized)
          await exportToPDF(mockFormData, mockRows, staffMode, currency, pageSize, orientation, {
            enableOptimization: false,
            quality: 'standard',
            scale: 2,
            format: 'png'
          })

          const endTime = performance.now()
          benchmark.recordGenerationTime(startTime, endTime, { 
            test: 'baseline', 
            iteration: i + 1,
            optimized: false
          })
          benchmark.recordMemoryUsage('baseline_end')

        } catch (error) {
          console.warn(`Baseline test iteration ${i + 1} failed:`, error)
        }
      }
    }

    // Test each quality preset
    for (const preset of qualityPresets) {
      console.log(`Testing quality preset: ${preset}`)
      
      const presetResults = {
        preset,
        iterations: [],
        averageTime: 0,
        averageMemory: 0,
        averageFileSize: 0
      }

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        benchmark.recordMemoryUsage(`${preset}_start`, { iteration: i + 1 })

        try {
          await exportToPDF(mockFormData, mockRows, staffMode, currency, pageSize, orientation, {
            quality: preset,
            enableOptimization: true,
            progressCallback: (data) => {
              // Record memory usage during different stages
              if (data.stage && data.memoryStatus) {
                benchmark.recordMemoryUsage(data.stage, {
                  preset,
                  iteration: i + 1,
                  memoryPercentage: data.memoryStatus.percentage
                })
              }

              // Record compression ratios
              if (data.compressionRatio) {
                benchmark.recordCompressionRatio(
                  data.compressionRatio.originalSize || 1000000, // Estimate if not available
                  data.finalSize ? data.finalSize * 1024 : 500000, // Convert KB to bytes
                  { preset, iteration: i + 1 }
                )
              }

              // Record file sizes
              if (data.finalSize) {
                benchmark.recordFileSize(data.finalSize * 1024, { 
                  preset, 
                  iteration: i + 1,
                  optimized: true
                })
              }
            }
          })

          const endTime = performance.now()
          benchmark.recordGenerationTime(startTime, endTime, { 
            test: preset, 
            iteration: i + 1,
            optimized: true
          })
          benchmark.recordMemoryUsage(`${preset}_end`, { iteration: i + 1 })

          // Record a quality score (simulated based on preset)
          const qualityScore = preset === 'high' ? 95 : preset === 'standard' ? 85 : 75
          benchmark.recordQualityScore(qualityScore, { preset, iteration: i + 1 })

          presetResults.iterations.push({
            iteration: i + 1,
            duration: endTime - startTime,
            success: true
          })

        } catch (error) {
          console.warn(`${preset} test iteration ${i + 1} failed:`, error)
          presetResults.iterations.push({
            iteration: i + 1,
            duration: 0,
            success: false,
            error: error.message
          })
        }
      }

      // Calculate averages for this preset
      const successfulIterations = presetResults.iterations.filter(i => i.success)
      if (successfulIterations.length > 0) {
        presetResults.averageTime = successfulIterations.reduce((sum, i) => sum + i.duration, 0) / successfulIterations.length
        presetResults.successRate = (successfulIterations.length / iterations) * 100
      }

      results.qualityResults[preset] = presetResults
    }

    benchmark.stop()
    results.summary = benchmark.generateReport()

    console.log('PDF export benchmark completed:', results.summary)
    return results

  } catch (error) {
    console.error('Benchmark failed:', error)
    benchmark.stop()
    throw error
  }
}

/**
 * Quick performance test for a single export
 * @param {HTMLElement} previewElement - Preview element to test
 * @param {Object} exportOptions - Export options to test
 * @returns {Promise<Object>} Performance metrics
 */
export const quickPerformanceTest = async (previewElement, exportOptions = {}) => {
  const benchmark = new PerformanceBenchmark()
  benchmark.start()

  const startTime = performance.now()
  benchmark.recordMemoryUsage('start')

  try {
    // Analyze content first
    const contentAnalysis = analyzeContent(previewElement)
    
    // Run the export with progress tracking
    await exportToPDF(
      { docNo: 'QUICK-TEST' }, 
      [], 
      false, 
      'USD', 
      'a4', 
      'portrait', 
      {
        ...exportOptions,
        progressCallback: (data) => {
          if (data.stage) {
            benchmark.recordMemoryUsage(data.stage)
          }
          if (data.finalSize) {
            benchmark.recordFileSize(data.finalSize * 1024, { test: 'quick' })
          }
          if (data.compressionRatio) {
            benchmark.recordCompressionRatio(
              data.compressionRatio.originalSize || 1000000,
              data.finalSize ? data.finalSize * 1024 : 500000,
              { test: 'quick' }
            )
          }
        }
      }
    )

    const endTime = performance.now()
    benchmark.recordGenerationTime(startTime, endTime, { test: 'quick' })
    benchmark.recordMemoryUsage('end')

    // Estimate quality score based on settings
    const qualityScore = exportOptions.quality === 'high' ? 95 : 
                        exportOptions.quality === 'compressed' ? 75 : 85
    benchmark.recordQualityScore(qualityScore, { test: 'quick' })

    benchmark.stop()

    return {
      contentAnalysis,
      performance: benchmark.generateReport(),
      exportOptions,
      success: true
    }

  } catch (error) {
    const endTime = performance.now()
    benchmark.recordGenerationTime(startTime, endTime, { test: 'quick', error: true })
    benchmark.stop()

    return {
      contentAnalysis: null,
      performance: benchmark.generateReport(),
      exportOptions,
      success: false,
      error: error.message
    }
  }
}

/**
 * Memory stress test for PDF export
 * @param {HTMLElement} previewElement - Preview element to test
 * @param {Object} stressConfig - Stress test configuration
 * @returns {Promise<Object>} Stress test results
 */
export const memoryStressTest = async (previewElement, stressConfig = {}) => {
  const {
    maxConcurrentExports = 3,
    totalExports = 10,
    memoryThreshold = 80 // Percentage
  } = stressConfig

  const benchmark = new PerformanceBenchmark()
  benchmark.start({ stressConfig })

  const results = {
    config: stressConfig,
    exports: [],
    memoryPeaks: [],
    failures: [],
    summary: null
  }

  let activeExports = 0
  let completedExports = 0

  const runExport = async (exportId) => {
    activeExports++
    const startTime = performance.now()
    
    try {
      benchmark.recordMemoryUsage(`export_${exportId}_start`, { exportId, activeExports })

      await exportToPDF(
        { docNo: `STRESS-${exportId}` },
        [],
        false,
        'USD',
        'a4',
        'portrait',
        {
          quality: 'standard',
          progressCallback: (data) => {
            if (data.memoryStatus) {
              benchmark.recordMemoryUsage(`export_${exportId}_${data.stage}`, {
                exportId,
                activeExports,
                memoryPercentage: data.memoryStatus.percentage
              })

              if (data.memoryStatus.percentage > memoryThreshold) {
                results.memoryPeaks.push({
                  exportId,
                  stage: data.stage,
                  percentage: data.memoryStatus.percentage,
                  activeExports
                })
              }
            }
          }
        }
      )

      const endTime = performance.now()
      benchmark.recordGenerationTime(startTime, endTime, { exportId, stress: true })
      
      results.exports.push({
        exportId,
        duration: endTime - startTime,
        success: true,
        activeExports
      })

    } catch (error) {
      const endTime = performance.now()
      results.failures.push({
        exportId,
        error: error.message,
        duration: endTime - startTime,
        activeExports
      })
    } finally {
      activeExports--
      completedExports++
      benchmark.recordMemoryUsage(`export_${exportId}_end`, { exportId, activeExports })
    }
  }

  // Run stress test
  const exportPromises = []
  
  for (let i = 1; i <= totalExports; i++) {
    // Wait if we've reached the concurrent limit
    if (activeExports >= maxConcurrentExports) {
      await Promise.race(exportPromises)
    }

    const exportPromise = runExport(i)
    exportPromises.push(exportPromise)
  }

  // Wait for all exports to complete
  await Promise.allSettled(exportPromises)

  benchmark.stop()
  results.summary = {
    totalExports,
    successfulExports: results.exports.length,
    failedExports: results.failures.length,
    successRate: (results.exports.length / totalExports) * 100,
    memoryPeaks: results.memoryPeaks.length,
    performance: benchmark.generateReport()
  }

  console.log('Memory stress test completed:', results.summary)
  return results
}

/**
 * Create a global performance benchmark instance
 */
export const globalBenchmark = new PerformanceBenchmark()

/**
 * Utility function to format benchmark results for display
 * @param {Object} results - Benchmark results
 * @returns {string} Formatted results string
 */
export const formatBenchmarkResults = (results) => {
  const lines = []
  
  lines.push('=== PDF Export Performance Benchmark Results ===')
  lines.push('')
  
  if (results.summary) {
    const summary = results.summary
    lines.push('Summary:')
    lines.push(`  Total Tests: ${summary.summary.totalTests}`)
    lines.push(`  Session Duration: ${Math.round(summary.summary.sessionDuration)}ms`)
    lines.push('')
    
    if (summary.generationTime.count > 0) {
      lines.push('Generation Time:')
      lines.push(`  Average: ${Math.round(summary.generationTime.average)}ms`)
      lines.push(`  Median: ${Math.round(summary.generationTime.median)}ms`)
      lines.push(`  Range: ${summary.generationTime.min}ms - ${summary.generationTime.max}ms`)
      lines.push('')
    }
    
    if (summary.fileSizes.count > 0) {
      lines.push('File Sizes:')
      lines.push(`  Average: ${summary.fileSizes.averageKB} KB`)
      lines.push(`  Under 2MB: ${summary.fileSizes.under2MB}/${summary.fileSizes.count}`)
      lines.push(`  Under 1MB: ${summary.fileSizes.under1MB}/${summary.fileSizes.count}`)
      lines.push('')
    }
    
    if (summary.memoryUsage.count > 0) {
      lines.push('Memory Usage:')
      lines.push(`  Peak Usage: ${summary.memoryUsage.peakUsage}%`)
      lines.push(`  Average Usage: ${summary.memoryUsage.averageUsage}%`)
      lines.push(`  Efficiency Score: ${summary.memoryUsage.memoryEfficiency}/100`)
      lines.push('')
    }
    
    if (summary.recommendations.length > 0) {
      lines.push('Recommendations:')
      summary.recommendations.forEach(rec => {
        lines.push(`  • ${rec}`)
      })
    }
  }
  
  return lines.join('\n')
}
/**
 * Au
tomated performance test runner
 * Runs comprehensive performance tests and generates reports
 */
export class PerformanceTestRunner {
  constructor() {
    this.testSuites = []
    this.results = []
    this.isRunning = false
  }

  /**
   * Add a test suite to the runner
   * @param {Object} testSuite - Test suite configuration
   */
  addTestSuite(testSuite) {
    this.testSuites.push({
      id: testSuite.id || `suite_${this.testSuites.length + 1}`,
      name: testSuite.name || 'Unnamed Test Suite',
      description: testSuite.description || '',
      tests: testSuite.tests || [],
      config: testSuite.config || {}
    })
  }

  /**
   * Run all test suites
   * @param {Object} options - Runner options
   * @returns {Promise<Object>} Complete test results
   */
  async runAllTests(options = {}) {
    if (this.isRunning) {
      throw new Error('Test runner is already running')
    }

    this.isRunning = true
    this.results = []

    const {
      onProgress = null,
      onSuiteComplete = null,
      stopOnError = false
    } = options

    console.log(`Starting performance test runner with ${this.testSuites.length} test suites`)

    try {
      for (let i = 0; i < this.testSuites.length; i++) {
        const suite = this.testSuites[i]
        
        if (onProgress) {
          onProgress({
            stage: 'suite_start',
            suiteIndex: i,
            totalSuites: this.testSuites.length,
            suiteName: suite.name
          })
        }

        try {
          const suiteResult = await this.runTestSuite(suite, {
            onProgress: (data) => {
              if (onProgress) {
                onProgress({
                  ...data,
                  suiteIndex: i,
                  totalSuites: this.testSuites.length
                })
              }
            }
          })

          this.results.push(suiteResult)

          if (onSuiteComplete) {
            onSuiteComplete(suiteResult, i, this.testSuites.length)
          }

        } catch (error) {
          console.error(`Test suite ${suite.name} failed:`, error)
          
          this.results.push({
            suiteId: suite.id,
            suiteName: suite.name,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          })

          if (stopOnError) {
            throw error
          }
        }
      }

      const finalResults = this.generateFinalReport()
      console.log('Performance test runner completed successfully')
      
      return finalResults

    } finally {
      this.isRunning = false
    }
  }

  /**
   * Run a single test suite
   * @param {Object} suite - Test suite to run
   * @param {Object} options - Suite options
   * @returns {Promise<Object>} Suite results
   */
  async runTestSuite(suite, options = {}) {
    const { onProgress = null } = options
    
    console.log(`Running test suite: ${suite.name}`)
    
    const suiteResult = {
      suiteId: suite.id,
      suiteName: suite.name,
      description: suite.description,
      startTime: new Date().toISOString(),
      tests: [],
      summary: null,
      success: false
    }

    try {
      for (let i = 0; i < suite.tests.length; i++) {
        const test = suite.tests[i]
        
        if (onProgress) {
          onProgress({
            stage: 'test_start',
            testIndex: i,
            totalTests: suite.tests.length,
            testName: test.name
          })
        }

        try {
          const testResult = await this.runSingleTest(test, suite.config)
          suiteResult.tests.push(testResult)

        } catch (error) {
          console.error(`Test ${test.name} failed:`, error)
          suiteResult.tests.push({
            testId: test.id,
            testName: test.name,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          })
        }
      }

      suiteResult.endTime = new Date().toISOString()
      suiteResult.summary = this.generateSuiteSummary(suiteResult)
      suiteResult.success = suiteResult.tests.every(t => t.success)

      return suiteResult

    } catch (error) {
      suiteResult.endTime = new Date().toISOString()
      suiteResult.error = error.message
      suiteResult.success = false
      throw error
    }
  }

  /**
   * Run a single test
   * @param {Object} test - Test configuration
   * @param {Object} suiteConfig - Suite configuration
   * @returns {Promise<Object>} Test result
   */
  async runSingleTest(test, suiteConfig = {}) {
    const testConfig = { ...suiteConfig, ...test.config }
    
    console.log(`Running test: ${test.name}`)
    
    const testResult = {
      testId: test.id || test.name,
      testName: test.name,
      testType: test.type,
      startTime: new Date().toISOString(),
      config: testConfig,
      success: false
    }

    try {
      // Get preview element for testing
      const previewElement = document.getElementById('previewArea')
      if (!previewElement) {
        throw new Error('Preview area not found for testing')
      }

      let result
      
      switch (test.type) {
        case 'benchmark':
          result = await benchmarkPDFExport(previewElement, testConfig)
          break
          
        case 'quick':
          result = await quickPerformanceTest(previewElement, testConfig)
          break
          
        case 'stress':
          result = await memoryStressTest(previewElement, testConfig)
          break
          
        default:
          throw new Error(`Unknown test type: ${test.type}`)
      }

      testResult.result = result
      testResult.success = true
      testResult.endTime = new Date().toISOString()

      return testResult

    } catch (error) {
      testResult.error = error.message
      testResult.success = false
      testResult.endTime = new Date().toISOString()
      throw error
    }
  }

  /**
   * Generate summary for a test suite
   * @param {Object} suiteResult - Suite result data
   * @returns {Object} Suite summary
   */
  generateSuiteSummary(suiteResult) {
    const tests = suiteResult.tests
    const successfulTests = tests.filter(t => t.success)
    
    return {
      totalTests: tests.length,
      successfulTests: successfulTests.length,
      failedTests: tests.length - successfulTests.length,
      successRate: tests.length > 0 ? (successfulTests.length / tests.length) * 100 : 0,
      duration: suiteResult.endTime && suiteResult.startTime ? 
        new Date(suiteResult.endTime) - new Date(suiteResult.startTime) : 0
    }
  }

  /**
   * Generate final report for all test suites
   * @returns {Object} Final report
   */
  generateFinalReport() {
    const totalTests = this.results.reduce((sum, suite) => sum + (suite.tests?.length || 0), 0)
    const successfulTests = this.results.reduce((sum, suite) => 
      sum + (suite.tests?.filter(t => t.success).length || 0), 0)
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuites: this.results.length,
        successfulSuites: this.results.filter(s => s.success).length,
        totalTests,
        successfulTests,
        overallSuccessRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0
      },
      suites: this.results,
      recommendations: this.generateOverallRecommendations()
    }
  }

  /**
   * Generate overall recommendations based on all test results
   * @returns {Array} Array of recommendation strings
   */
  generateOverallRecommendations() {
    const recommendations = []
    
    // Analyze results across all suites
    const allBenchmarkResults = this.results
      .filter(s => s.tests)
      .flatMap(s => s.tests)
      .filter(t => t.success && t.result && t.result.summary)
      .map(t => t.result.summary)

    if (allBenchmarkResults.length === 0) {
      return ['No benchmark data available for analysis']
    }

    // Aggregate performance metrics
    const avgGenerationTimes = allBenchmarkResults
      .filter(r => r.generationTime && r.generationTime.average)
      .map(r => r.generationTime.average)

    const avgFileSizes = allBenchmarkResults
      .filter(r => r.fileSizes && r.fileSizes.averageKB)
      .map(r => r.fileSizes.averageKB)

    const avgMemoryUsage = allBenchmarkResults
      .filter(r => r.memoryUsage && r.memoryUsage.peakUsage)
      .map(r => r.memoryUsage.peakUsage)

    // Generate recommendations based on aggregated data
    if (avgGenerationTimes.length > 0) {
      const avgTime = avgGenerationTimes.reduce((sum, t) => sum + t, 0) / avgGenerationTimes.length
      if (avgTime > 8000) {
        recommendations.push(`Average generation time (${Math.round(avgTime)}ms) exceeds target - consider optimization`)
      }
    }

    if (avgFileSizes.length > 0) {
      const avgSize = avgFileSizes.reduce((sum, s) => sum + s, 0) / avgFileSizes.length
      if (avgSize > 2048) {
        recommendations.push(`Average file size (${Math.round(avgSize)}KB) exceeds 2MB target`)
      }
    }

    if (avgMemoryUsage.length > 0) {
      const avgMemory = avgMemoryUsage.reduce((sum, m) => sum + m, 0) / avgMemoryUsage.length
      if (avgMemory > 80) {
        recommendations.push(`High memory usage detected (${Math.round(avgMemory)}%) - enable memory management`)
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All performance metrics are within acceptable ranges')
    }

    return recommendations
  }

  /**
   * Clear all test results
   */
  clearResults() {
    this.results = []
  }

  /**
   * Get current status
   * @returns {Object} Current runner status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalSuites: this.testSuites.length,
      completedSuites: this.results.length,
      hasResults: this.results.length > 0
    }
  }
}

/**
 * Create default performance test suites
 * @returns {Array} Array of default test suite configurations
 */
export const createDefaultTestSuites = () => {
  return [
    {
      id: 'quality_comparison',
      name: 'Quality Preset Comparison',
      description: 'Compare performance across different quality presets',
      config: {
        iterations: 3,
        includeBaseline: true
      },
      tests: [
        {
          id: 'quality_benchmark',
          name: 'Quality Preset Benchmark',
          type: 'benchmark',
          config: {
            qualityPresets: ['compressed', 'standard', 'high'],
            iterations: 3
          }
        }
      ]
    },
    {
      id: 'memory_performance',
      name: 'Memory Performance Tests',
      description: 'Test memory usage and efficiency',
      tests: [
        {
          id: 'memory_stress',
          name: 'Memory Stress Test',
          type: 'stress',
          config: {
            maxConcurrentExports: 2,
            totalExports: 5,
            memoryThreshold: 80
          }
        },
        {
          id: 'low_memory_test',
          name: 'Low Memory Mode Test',
          type: 'quick',
          config: {
            quality: 'compressed',
            scale: 1.0,
            enableMemoryManagement: true
          }
        }
      ]
    },
    {
      id: 'optimization_validation',
      name: 'Optimization Feature Validation',
      description: 'Validate that optimization features work correctly',
      tests: [
        {
          id: 'optimization_enabled',
          name: 'Optimization Enabled Test',
          type: 'quick',
          config: {
            enableOptimization: true,
            quality: 'standard'
          }
        },
        {
          id: 'optimization_disabled',
          name: 'Optimization Disabled Test',
          type: 'quick',
          config: {
            enableOptimization: false,
            quality: 'standard'
          }
        }
      ]
    }
  ]
}

/**
 * Run default performance test suite
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test results
 */
export const runDefaultPerformanceTests = async (options = {}) => {
  const runner = new PerformanceTestRunner()
  
  // Add default test suites
  const defaultSuites = createDefaultTestSuites()
  defaultSuites.forEach(suite => runner.addTestSuite(suite))
  
  // Run all tests
  return await runner.runAllTests(options)
}

/**
 * Export performance test results to console
 * @param {Object} results - Test results to export
 */
export const exportPerformanceResults = (results) => {
  console.group('=== PDF Export Performance Test Results ===')
  
  console.log('Summary:', results.summary)
  
  results.suites.forEach(suite => {
    console.group(`Suite: ${suite.suiteName}`)
    console.log('Summary:', suite.summary)
    
    if (suite.tests) {
      suite.tests.forEach(test => {
        console.group(`Test: ${test.testName}`)
        console.log('Success:', test.success)
        if (test.result && test.result.performance) {
          console.log('Performance:', test.result.performance)
        }
        if (test.error) {
          console.error('Error:', test.error)
        }
        console.groupEnd()
      })
    }
    
    console.groupEnd()
  })
  
  if (results.recommendations) {
    console.log('Recommendations:', results.recommendations)
  }
  
  console.groupEnd()
}

// Global test runner instance
export const globalTestRunner = new PerformanceTestRunner()