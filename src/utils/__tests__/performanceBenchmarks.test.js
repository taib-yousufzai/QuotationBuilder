/**
 * Performance Benchmarks Integration Tests
 * Tests the performance benchmarking system with the PDF export functionality
 */

import { 
  PerformanceBenchmark,
  benchmarkPDFExport,
  quickPerformanceTest,
  memoryStressTest,
  PerformanceTestRunner,
  createDefaultTestSuites,
  runDefaultPerformanceTests,
  globalBenchmark
} from '../performanceBenchmarks.js'

// Mock DOM elements for testing
const createMockPreviewElement = () => {
  const mockElement = document.createElement('div')
  mockElement.id = 'previewArea'
  mockElement.innerHTML = `
    <div class="quotation-section">
      <table>
        <tbody>
          <tr><td>Item 1</td><td>$100</td></tr>
          <tr><td>Item 2</td><td>$200</td></tr>
          <tr><td>Item 3</td><td>$300</td></tr>
        </tbody>
      </table>
    </div>
  `
  document.body.appendChild(mockElement)
  return mockElement
}

// Mock PDF export function for testing
const mockExportToPDF = async (formData, rows, staffMode, currency, pageSize, orientation, options = {}) => {
  const { progressCallback } = options
  
  // Simulate export process with progress updates
  if (progressCallback) {
    progressCallback({ stage: 'analyzing', progress: 10, message: 'Analyzing content...' })
    await new Promise(resolve => setTimeout(resolve, 100))
    
    progressCallback({ 
      stage: 'rendering', 
      progress: 50, 
      message: 'Rendering to canvas...',
      memoryStatus: { percentage: 45 }
    })
    await new Promise(resolve => setTimeout(resolve, 200))
    
    progressCallback({ 
      stage: 'compressing', 
      progress: 80, 
      message: 'Compressing...',
      compressionRatio: { originalSize: 1000000, compressedSize: 300000 }
    })
    await new Promise(resolve => setTimeout(resolve, 100))
    
    progressCallback({ 
      stage: 'complete', 
      progress: 100, 
      message: 'Complete!',
      finalSize: 300 // KB
    })
  }
  
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return { success: true, fileSize: 300 * 1024 }
}

/**
 * Test the PerformanceBenchmark class
 */
export const testPerformanceBenchmark = () => {
  console.log('Testing PerformanceBenchmark class...')
  
  const benchmark = new PerformanceBenchmark()
  
  // Test basic functionality
  benchmark.start()
  
  // Record some test metrics
  benchmark.recordGenerationTime(1000, 1500, { test: 'sample' })
  benchmark.recordMemoryUsage('test_stage', { percentage: 65 })
  benchmark.recordFileSize(500 * 1024, { test: 'sample' })
  benchmark.recordQualityScore(85, { test: 'sample' })
  benchmark.recordCompressionRatio(1000000, 300000, { test: 'sample' })
  
  benchmark.stop()
  
  // Generate report
  const report = benchmark.generateReport()
  
  console.log('Benchmark report generated:', {
    generationTime: report.generationTime,
    memoryUsage: report.memoryUsage,
    fileSizes: report.fileSizes,
    qualityScores: report.qualityScores,
    compressionRatios: report.compressionRatios
  })
  
  // Validate results
  const isValid = report.generationTime.count === 1 &&
                  report.memoryUsage.count === 1 &&
                  report.fileSizes.count === 1 &&
                  report.qualityScores.count === 1 &&
                  report.compressionRatios.count === 1
  
  console.log('PerformanceBenchmark test:', isValid ? 'PASSED' : 'FAILED')
  return isValid
}

/**
 * Test the quick performance test function
 */
export const testQuickPerformanceTest = async () => {
  console.log('Testing quick performance test...')
  
  const mockElement = createMockPreviewElement()
  
  try {
    // Mock the exportToPDF function
    const originalExport = window.exportToPDF
    window.exportToPDF = mockExportToPDF
    
    const result = await quickPerformanceTest(mockElement, {
      quality: 'standard',
      enableOptimization: true
    })
    
    console.log('Quick performance test result:', {
      success: result.success,
      hasContentAnalysis: !!result.contentAnalysis,
      hasPerformance: !!result.performance,
      exportOptions: result.exportOptions
    })
    
    // Restore original function
    window.exportToPDF = originalExport
    
    const isValid = result.success && result.performance && result.contentAnalysis
    console.log('Quick performance test:', isValid ? 'PASSED' : 'FAILED')
    return isValid
    
  } catch (error) {
    console.error('Quick performance test failed:', error)
    return false
  } finally {
    document.body.removeChild(mockElement)
  }
}

/**
 * Test the performance test runner
 */
export const testPerformanceTestRunner = async () => {
  console.log('Testing PerformanceTestRunner...')
  
  const mockElement = createMockPreviewElement()
  
  try {
    // Mock the exportToPDF function
    const originalExport = window.exportToPDF
    window.exportToPDF = mockExportToPDF
    
    const runner = new PerformanceTestRunner()
    
    // Add a simple test suite
    runner.addTestSuite({
      id: 'test_suite',
      name: 'Test Suite',
      description: 'Simple test suite for validation',
      tests: [
        {
          id: 'quick_test',
          name: 'Quick Test',
          type: 'quick',
          config: { quality: 'standard' }
        }
      ]
    })
    
    const results = await runner.runAllTests({
      onProgress: (data) => {
        console.log('Test progress:', data.stage, data.suiteName || data.testName)
      }
    })
    
    console.log('Test runner results:', {
      totalSuites: results.summary.totalSuites,
      successfulSuites: results.summary.successfulSuites,
      totalTests: results.summary.totalTests,
      successfulTests: results.summary.successfulTests,
      overallSuccessRate: results.summary.overallSuccessRate
    })
    
    // Restore original function
    window.exportToPDF = originalExport
    
    const isValid = results.summary.totalSuites === 1 && 
                    results.summary.successfulSuites === 1 &&
                    results.summary.overallSuccessRate === 100
    
    console.log('PerformanceTestRunner test:', isValid ? 'PASSED' : 'FAILED')
    return isValid
    
  } catch (error) {
    console.error('PerformanceTestRunner test failed:', error)
    return false
  } finally {
    document.body.removeChild(mockElement)
  }
}

/**
 * Test default test suites creation
 */
export const testDefaultTestSuites = () => {
  console.log('Testing default test suites creation...')
  
  const suites = createDefaultTestSuites()
  
  console.log('Default test suites:', suites.map(s => ({
    id: s.id,
    name: s.name,
    testCount: s.tests.length
  })))
  
  const isValid = suites.length > 0 && 
                  suites.every(s => s.id && s.name && s.tests && s.tests.length > 0)
  
  console.log('Default test suites test:', isValid ? 'PASSED' : 'FAILED')
  return isValid
}

/**
 * Test memory usage monitoring
 */
export const testMemoryMonitoring = () => {
  console.log('Testing memory usage monitoring...')
  
  const benchmark = new PerformanceBenchmark()
  
  // Test memory usage recording
  const initialMemory = benchmark.getMemoryUsage()
  console.log('Initial memory usage:', initialMemory)
  
  benchmark.start()
  benchmark.recordMemoryUsage('test_start')
  benchmark.recordMemoryUsage('test_middle', { additionalData: 'test' })
  benchmark.recordMemoryUsage('test_end')
  benchmark.stop()
  
  const report = benchmark.generateReport()
  const memoryAnalysis = report.memoryUsage
  
  console.log('Memory analysis:', {
    count: memoryAnalysis.count,
    peakUsage: memoryAnalysis.peakUsage,
    averageUsage: memoryAnalysis.averageUsage,
    stages: Object.keys(memoryAnalysis.stages || {})
  })
  
  const isValid = memoryAnalysis.count === 3 && 
                  typeof memoryAnalysis.peakUsage === 'number' &&
                  typeof memoryAnalysis.averageUsage === 'number'
  
  console.log('Memory monitoring test:', isValid ? 'PASSED' : 'FAILED')
  return isValid
}

/**
 * Run all performance benchmark tests
 */
export const runAllBenchmarkTests = async () => {
  console.log('=== Running Performance Benchmark Tests ===')
  
  const results = {
    performanceBenchmark: false,
    quickPerformanceTest: false,
    performanceTestRunner: false,
    defaultTestSuites: false,
    memoryMonitoring: false
  }
  
  try {
    results.performanceBenchmark = testPerformanceBenchmark()
    results.quickPerformanceTest = await testQuickPerformanceTest()
    results.performanceTestRunner = await testPerformanceTestRunner()
    results.defaultTestSuites = testDefaultTestSuites()
    results.memoryMonitoring = testMemoryMonitoring()
    
    const passedTests = Object.values(results).filter(r => r === true).length
    const totalTests = Object.keys(results).length
    
    console.log('=== Performance Benchmark Test Results ===')
    console.log(`Passed: ${passedTests}/${totalTests}`)
    console.log('Individual results:', results)
    
    const allPassed = passedTests === totalTests
    console.log('Overall result:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED')
    
    return {
      success: allPassed,
      results,
      summary: {
        passed: passedTests,
        total: totalTests,
        successRate: (passedTests / totalTests) * 100
      }
    }
    
  } catch (error) {
    console.error('Error running benchmark tests:', error)
    return {
      success: false,
      error: error.message,
      results
    }
  }
}

/**
 * Demonstration function to show how to use the performance benchmarks
 */
export const demonstratePerformanceBenchmarks = async () => {
  console.log('=== Performance Benchmarks Demonstration ===')
  
  // Create a mock preview element
  const mockElement = createMockPreviewElement()
  
  try {
    // Mock the exportToPDF function for demonstration
    const originalExport = window.exportToPDF
    window.exportToPDF = mockExportToPDF
    
    console.log('1. Running quick performance test...')
    const quickResult = await quickPerformanceTest(mockElement, {
      quality: 'standard',
      enableOptimization: true
    })
    
    console.log('Quick test completed:', {
      success: quickResult.success,
      generationTime: quickResult.performance?.generationTime?.average,
      fileSize: quickResult.performance?.fileSizes?.averageKB,
      memoryPeak: quickResult.performance?.memoryUsage?.peakUsage
    })
    
    console.log('2. Running default performance test suite...')
    const suiteResults = await runDefaultPerformanceTests({
      onProgress: (data) => {
        if (data.stage === 'suite_start') {
          console.log(`Starting suite: ${data.suiteName}`)
        }
      }
    })
    
    console.log('Test suite completed:', {
      totalSuites: suiteResults.summary.totalSuites,
      successfulSuites: suiteResults.summary.successfulSuites,
      overallSuccessRate: suiteResults.summary.overallSuccessRate,
      recommendations: suiteResults.recommendations
    })
    
    // Restore original function
    window.exportToPDF = originalExport
    
    console.log('=== Demonstration Complete ===')
    
  } catch (error) {
    console.error('Demonstration failed:', error)
  } finally {
    document.body.removeChild(mockElement)
  }
}

// Export test functions for external use
export {
  createMockPreviewElement,
  mockExportToPDF
}