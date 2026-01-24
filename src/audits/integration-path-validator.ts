/**
 * Integration Path Validator
 *
 * Validates that all critical integration paths have corresponding test coverage.
 * This is a CI-blocking check for P0 paths.
 *
 * Features:
 * - Check if test files exist
 * - Find tests matching required patterns
 * - Generate human-readable coverage reports
 * - Save reports to .puppet-master/audits/
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T27 for implementation details.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  INTEGRATION_PATH_MATRIX,
  type IntegrationPath,
  type IntegrationPathPriority,
  getCriticalPaths,
} from './integration-path-matrix.js';

/**
 * Result of validating a single integration path.
 */
export interface PathValidationResult {
  /** The integration path that was validated */
  path: IntegrationPath;

  /** Whether the test file exists */
  testFileExists: boolean;

  /** Total number of tests found in the test file */
  testsFound: number;

  /** Test names that match the required pattern */
  matchingTests: string[];

  /** Whether this path passed validation (has at least one matching test) */
  passed: boolean;

  /** Error message if validation failed */
  error?: string;

  /** Warning message (for non-blocking issues) */
  warning?: string;
}

/**
 * Summary statistics for the validation run.
 */
export interface ValidationSummary {
  /** Total paths validated */
  totalPaths: number;

  /** Paths that passed (have test coverage) */
  passedPaths: number;

  /** Paths that failed (missing tests) */
  failedPaths: number;

  /** P0 paths that passed */
  p0Passed: number;

  /** P0 paths total */
  p0Total: number;

  /** P1 paths that passed */
  p1Passed: number;

  /** P1 paths total */
  p1Total: number;

  /** P2 paths that passed */
  p2Passed: number;

  /** P2 paths total */
  p2Total: number;

  /** Whether validation passed (all P0 paths have tests) */
  overallPassed: boolean;
}

/**
 * Complete result of an integration path validation run.
 */
export interface IntegrationPathValidationResult {
  /** Individual results for each path */
  results: PathValidationResult[];

  /** Summary statistics */
  summary: ValidationSummary;

  /** Whether the validation passed (all P0 paths have tests) */
  passed: boolean;

  /** Duration of validation in milliseconds */
  durationMs: number;

  /** Timestamp when validation was run */
  timestamp: string;

  /** Project root that was validated */
  projectRoot: string;
}

/**
 * Configuration options for the validator.
 */
export interface IntegrationPathValidatorConfig {
  /** Project root directory */
  projectRoot: string;

  /** Paths to validate (defaults to INTEGRATION_PATH_MATRIX) */
  paths?: IntegrationPath[];

  /** Whether to include skipped tests as matches */
  includeSkipped?: boolean;

  /** Whether to include todo tests as matches */
  includeTodo?: boolean;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: Omit<IntegrationPathValidatorConfig, 'projectRoot'> = {
  includeSkipped: false,
  includeTodo: false,
};

/**
 * Validates that integration paths have corresponding test coverage.
 */
export class IntegrationPathValidator {
  private config: IntegrationPathValidatorConfig;

  constructor(config: IntegrationPathValidatorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate all integration paths.
   */
  async validateAll(): Promise<IntegrationPathValidationResult> {
    const startTime = Date.now();
    const paths = this.config.paths ?? INTEGRATION_PATH_MATRIX;
    const results: PathValidationResult[] = [];

    for (const integrationPath of paths) {
      results.push(await this.validatePath(integrationPath));
    }

    const summary = this.computeSummary(results);

    return {
      results,
      summary,
      passed: summary.overallPassed,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      projectRoot: this.config.projectRoot,
    };
  }

  /**
   * Validate a single integration path.
   */
  async validatePath(integrationPath: IntegrationPath): Promise<PathValidationResult> {
    const testFilePath = path.join(this.config.projectRoot, integrationPath.testFile);

    // Check if test file exists
    const testFileExists = await this.fileExists(testFilePath);

    if (!testFileExists) {
      return {
        path: integrationPath,
        testFileExists: false,
        testsFound: 0,
        matchingTests: [],
        passed: false,
        error: `Test file not found: ${integrationPath.testFile}`,
      };
    }

    // Read test file and find matching tests
    let testContent: string;
    try {
      testContent = await fs.readFile(testFilePath, 'utf8');
    } catch (err) {
      return {
        path: integrationPath,
        testFileExists: true,
        testsFound: 0,
        matchingTests: [],
        passed: false,
        error: `Failed to read test file: ${(err as Error).message}`,
      };
    }

    // Find all test declarations
    const testDeclarations = this.findTestDeclarations(testContent);
    const testPattern = new RegExp(integrationPath.testPattern, 'gi');

    // Find tests matching the pattern
    const matchingTests = testDeclarations.filter((test) => {
      const matches = testPattern.test(test.name);
      // Reset lastIndex because we're using 'g' flag
      testPattern.lastIndex = 0;

      // Skip skipped tests unless configured to include them
      if (test.isSkipped && !this.config.includeSkipped) {
        return false;
      }

      // Skip todo tests unless configured to include them
      if (test.isTodo && !this.config.includeTodo) {
        return false;
      }

      return matches;
    });

    const passed = matchingTests.length > 0;
    let warning: string | undefined;

    // Check if all matching tests are skipped/todo
    if (matchingTests.length > 0 && matchingTests.every((t) => t.isSkipped || t.isTodo)) {
      warning = 'All matching tests are skipped or marked as todo';
    }

    return {
      path: integrationPath,
      testFileExists: true,
      testsFound: testDeclarations.length,
      matchingTests: matchingTests.map((t) => t.name),
      passed,
      error: passed ? undefined : `No tests matching pattern '${integrationPath.testPattern}' found`,
      warning,
    };
  }

  /**
   * Check if a file exists.
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find all test declarations in a test file.
   *
   * Supports:
   * - it('...', ...)
   * - it.skip('...', ...)
   * - it.todo('...')
   * - test('...', ...)
   * - test.skip('...', ...)
   * - test.todo('...')
   */
  private findTestDeclarations(
    content: string
  ): Array<{ name: string; isSkipped: boolean; isTodo: boolean }> {
    const results: Array<{ name: string; isSkipped: boolean; isTodo: boolean }> = [];

    // Match: it('name', ...) or it("name", ...) or it(`name`, ...)
    // Also match: it.skip('name', ...) or it.todo('name')
    // Also match: test('name', ...) etc.
    const patterns = [
      // Regular tests
      /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // Skipped tests
      /(?:it|test)\.skip\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // Todo tests
      /(?:it|test)\.todo\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    // Regular tests
    let match: RegExpExecArray | null;
    const regularPattern = patterns[0];
    while ((match = regularPattern.exec(content)) !== null) {
      // Check if this is actually a skip or todo (the simple pattern might catch it)
      const beforeMatch = content.slice(Math.max(0, match.index - 10), match.index);
      const isSkipped = beforeMatch.includes('.skip');
      const isTodo = beforeMatch.includes('.todo');

      if (!isSkipped && !isTodo) {
        results.push({
          name: match[1],
          isSkipped: false,
          isTodo: false,
        });
      }
    }

    // Skipped tests
    const skipPattern = patterns[1];
    while ((match = skipPattern.exec(content)) !== null) {
      results.push({
        name: match[1],
        isSkipped: true,
        isTodo: false,
      });
    }

    // Todo tests
    const todoPattern = patterns[2];
    while ((match = todoPattern.exec(content)) !== null) {
      results.push({
        name: match[1],
        isSkipped: false,
        isTodo: true,
      });
    }

    return results;
  }

  /**
   * Compute summary statistics from validation results.
   */
  private computeSummary(results: PathValidationResult[]): ValidationSummary {
    const p0Results = results.filter((r) => r.path.priority === 'p0');
    const p1Results = results.filter((r) => r.path.priority === 'p1');
    const p2Results = results.filter((r) => r.path.priority === 'p2');

    const p0Passed = p0Results.filter((r) => r.passed).length;
    const p1Passed = p1Results.filter((r) => r.passed).length;
    const p2Passed = p2Results.filter((r) => r.passed).length;

    // Overall passes if ALL P0 paths have test coverage
    const overallPassed = p0Passed === p0Results.length;

    return {
      totalPaths: results.length,
      passedPaths: results.filter((r) => r.passed).length,
      failedPaths: results.filter((r) => !r.passed).length,
      p0Passed,
      p0Total: p0Results.length,
      p1Passed,
      p1Total: p1Results.length,
      p2Passed,
      p2Total: p2Results.length,
      overallPassed,
    };
  }

  /**
   * Generate a markdown report from validation results.
   */
  generateReport(result: IntegrationPathValidationResult): string {
    const lines: string[] = [];

    lines.push('# Integration Path Test Coverage Report');
    lines.push('');
    lines.push(`Generated: ${result.timestamp}`);
    lines.push(`Duration: ${result.durationMs}ms`);
    lines.push(`Project: ${result.projectRoot}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Priority | Covered | Total | Percentage |`);
    lines.push(`|----------|---------|-------|------------|`);
    lines.push(
      `| **P0 (Critical)** | ${result.summary.p0Passed} | ${result.summary.p0Total} | ${this.percentage(result.summary.p0Passed, result.summary.p0Total)} |`
    );
    lines.push(
      `| **P1 (Important)** | ${result.summary.p1Passed} | ${result.summary.p1Total} | ${this.percentage(result.summary.p1Passed, result.summary.p1Total)} |`
    );
    lines.push(
      `| **P2 (Nice-to-have)** | ${result.summary.p2Passed} | ${result.summary.p2Total} | ${this.percentage(result.summary.p2Passed, result.summary.p2Total)} |`
    );
    lines.push('');

    // Overall status
    if (result.passed) {
      lines.push('✅ **All P0 critical paths have test coverage!**');
    } else {
      lines.push('❌ **FAILED: Some P0 critical paths are missing test coverage!**');
    }
    lines.push('');

    // P0 Critical Paths
    lines.push('## P0 Critical Paths');
    lines.push('');
    this.addPathSection(
      lines,
      result.results.filter((r) => r.path.priority === 'p0')
    );

    // P1 Important Paths
    lines.push('## P1 Important Paths');
    lines.push('');
    this.addPathSection(
      lines,
      result.results.filter((r) => r.path.priority === 'p1')
    );

    // P2 Nice-to-have Paths
    const p2Results = result.results.filter((r) => r.path.priority === 'p2');
    if (p2Results.length > 0) {
      lines.push('## P2 Nice-to-have Paths');
      lines.push('');
      this.addPathSection(lines, p2Results);
    }

    return lines.join('\n');
  }

  /**
   * Add a section of paths to the report.
   */
  private addPathSection(lines: string[], results: PathValidationResult[]): void {
    if (results.length === 0) {
      lines.push('_No paths in this category._');
      lines.push('');
      return;
    }

    for (const result of results) {
      const icon = result.passed ? '✅' : '❌';
      lines.push(`### ${icon} ${result.path.name} (${result.path.id})`);
      lines.push('');
      lines.push(`**Description:** ${result.path.description}`);
      lines.push('');
      lines.push(`- **Start Point:** ${result.path.startPoint}`);
      lines.push(`- **End Point:** ${result.path.endPoint}`);
      lines.push(`- **Test File:** \`${result.path.testFile}\``);
      lines.push(`- **Test Pattern:** \`${result.path.testPattern}\``);
      lines.push('');

      if (result.passed) {
        lines.push(`**Matching Tests (${result.matchingTests.length}):**`);
        for (const test of result.matchingTests) {
          lines.push(`- ${test}`);
        }
        if (result.warning) {
          lines.push('');
          lines.push(`⚠️ **Warning:** ${result.warning}`);
        }
      } else {
        lines.push(`⚠️ **Error:** ${result.error}`);
      }
      lines.push('');

      lines.push('<details>');
      lines.push('<summary>Critical Components</summary>');
      lines.push('');
      for (const component of result.path.criticalComponents) {
        lines.push(`- \`${component}\``);
      }
      lines.push('');
      lines.push('</details>');
      lines.push('');
    }
  }

  /**
   * Calculate percentage string.
   */
  private percentage(passed: number, total: number): string {
    if (total === 0) return 'N/A';
    const pct = (passed / total) * 100;
    return `${pct.toFixed(0)}%`;
  }

  /**
   * Save the report to the .puppet-master/audits/ directory.
   */
  async saveReport(result: IntegrationPathValidationResult): Promise<string> {
    const auditDir = path.join(this.config.projectRoot, '.puppet-master', 'audits');

    // Ensure directory exists
    await fs.mkdir(auditDir, { recursive: true });

    // Save markdown report
    const reportPath = path.join(auditDir, 'integration-paths.md');
    const report = this.generateReport(result);
    await fs.writeFile(reportPath, report);

    // Also save JSON for programmatic access
    const jsonPath = path.join(auditDir, 'integration-paths.json');
    await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));

    return reportPath;
  }
}

/**
 * Create an IntegrationPathValidator with default configuration.
 */
export function createIntegrationPathValidator(
  projectRoot: string,
  options?: Partial<Omit<IntegrationPathValidatorConfig, 'projectRoot'>>
): IntegrationPathValidator {
  return new IntegrationPathValidator({
    projectRoot,
    ...options,
  });
}

/**
 * Convenience function to validate all integration paths.
 */
export async function validateIntegrationPaths(
  projectRoot: string,
  options?: Partial<Omit<IntegrationPathValidatorConfig, 'projectRoot'>>
): Promise<IntegrationPathValidationResult> {
  const validator = createIntegrationPathValidator(projectRoot, options);
  return validator.validateAll();
}

/**
 * Check if all P0 paths have test coverage.
 */
export async function checkCriticalPaths(projectRoot: string): Promise<{
  passed: boolean;
  missingPaths: IntegrationPath[];
}> {
  const validator = createIntegrationPathValidator(projectRoot, {
    paths: getCriticalPaths(),
  });

  const result = await validator.validateAll();
  const missingPaths = result.results
    .filter((r) => !r.passed)
    .map((r) => r.path);

  return {
    passed: result.passed,
    missingPaths,
  };
}
