# PDF Export Performance Benchmarks

This module provides comprehensive performance benchmarking tools for the PDF export optimization system. It measures generation time improvements, monitors memory usage during PDF creation, and validates visual quality maintenance.

## Features

### 1. Performance Metrics Collection
- **Generation Time**: Measures PDF creation duration
- **Memory Usage**: Monitors memory consumption during export
- **File Size**: Tracks output file sizes and compression ratios
- **Quality Scores**: Validates visual quality maintenance
- **Compression Ratios**: Measures optimization effectiveness

### 2. Benchmark Types

#### Quick Performance Test
```javascript
import { quickPerformanceTest } from './performanceBenchmarks.js'

const previewElement = document.getElementById('previewArea')
const result = await quickPerformanceTest(previewElement, {
  quality: 'standard',
  enableOptimization: true
})
```

#### Comprehensive Benchmark Suite
```javascript
import { benchmarkPDFExport } from './performanceBenchmarks.js'

const results = await benchmarkPDFExport(previewElement, {
  qualityPresets: ['compressed', 'standard', 'high'],
  iterations: 3,
  includeBaseline: true
})
```

#### Memory Stress Test
```javascript
import { memoryStressTest } from './performanceBenchmarks.js'

const stressResults = await memoryStressTest(previewElement, {
  maxConcurrentExports: 3,
  totalExports: 10,
  memoryThreshold: 80
})
```

### 3. Automated Test Runner

The `PerformanceTestRunner` class provides automated testing capabilities:

```javascript
import { PerformanceTestRunner, createDefaultTestSuites } from './performanceBenchmarks.js'

const runner = new PerformanceTestRunner()

// Add default test suites
const defaultSuites = createDefaultTestSuites()
defaultSuites.forEach(suite => runner.addTestSuite(suite))

// Run all tests
const results = await runner.runAllTests({
  onProgress: (data) => console.log('Progress:', data),
  onSuiteComplete: (result) => console.log('Suite complete:', result.suiteName)
})
```

## Usage in the Application

### Staff Mode Benchmark Button
In staff mode, users can access the "Run Benchmark" button in the Actions component to:
1. Run quick performance tests on current content
2. Execute comprehensive benchmark suites
3. View results in browser console
4. Get performance recommendations

### Integration with PDF Export
The benchmarks integrate seamlessly with the existing PDF export system:
- Uses the same optimization utilities
- Monitors real export operations
- Provides feedback on optimization effectiveness

## Benchmark Results

### Generation Time Analysis
- Average, median, min, max generation times
- Standard deviation for consistency measurement
- Improvement percentage compared to baseline

### Memory Usage Analysis
- Peak memory usage during export
- Average memory consumption
- Memory efficiency score (0-100)
- Stage-by-stage memory tracking

### File Size Analysis
- Average file sizes across tests
- Percentage of files under size targets (1MB, 2MB)
- Size reduction compared to unoptimized exports

### Quality Score Analysis
- Visual quality maintenance scores
- Percentage of exports meeting quality thresholds
- Quality vs. compression trade-off analysis

### Compression Ratio Analysis
- Average compression effectiveness
- Best and worst compression ratios
- Format selection impact analysis

## Performance Targets

The benchmarks validate against these optimization targets:

### Generation Time
- **Target**: Under 5 seconds for typical quotations
- **Baseline**: 8-15 seconds (unoptimized)
- **Expected Improvement**: 40-60% faster

### File Size
- **Target**: Under 2MB for typical quotations
- **Baseline**: 5-15MB (unoptimized)
- **Expected Reduction**: 70-90% smaller

### Memory Usage
- **Target**: Under 80% peak memory usage
- **Monitoring**: Real-time memory tracking
- **Fallbacks**: Automatic low-memory mode

### Quality Maintenance
- **Target**: 80+ quality score
- **Validation**: Visual quality preservation
- **Balance**: Quality vs. file size optimization

## Recommendations Engine

The benchmark system provides automated recommendations:

- **Performance**: Suggests optimization settings for slow generation
- **Memory**: Recommends memory management for high usage
- **File Size**: Advises compression settings for large files
- **Quality**: Suggests quality adjustments for poor scores

## Console Output

Benchmark results are logged to the browser console with detailed information:

```
=== PDF Export Performance Benchmark Results ===

Summary:
  Total Tests: 15
  Session Duration: 45000ms

Generation Time:
  Average: 3200ms
  Median: 3100ms
  Range: 2800ms - 3800ms

File Sizes:
  Average: 850 KB
  Under 2MB: 15/15
  Under 1MB: 12/15

Memory Usage:
  Peak Usage: 65.2%
  Average Usage: 45.8%
  Efficiency Score: 78/100

Recommendations:
  • All performance metrics are within acceptable ranges
```

## Testing and Validation

The module includes comprehensive tests in `__tests__/performanceBenchmarks.test.js`:

- Unit tests for benchmark classes
- Integration tests with PDF export
- Mock data for consistent testing
- Validation of all benchmark types

## Browser Compatibility

The benchmarks work across modern browsers with varying levels of detail:

- **Chrome**: Full memory monitoring with `performance.memory`
- **Firefox/Safari**: Estimated memory usage based on DOM complexity
- **Mobile**: Optimized for lower memory devices

## Development Usage

For development and debugging:

```javascript
// Enable detailed logging
import { globalBenchmark } from './performanceBenchmarks.js'

globalBenchmark.start()
// ... perform operations ...
const report = globalBenchmark.generateReport()
console.log('Detailed report:', report)
```

## Future Enhancements

Planned improvements:
- Visual quality comparison using image analysis
- Network performance impact measurement
- Batch processing benchmarks
- Historical performance tracking
- Automated regression testing