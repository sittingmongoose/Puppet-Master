/**
 * Doctor Reporter for RWM Puppet Master Doctor System
 * 
 * Provides formatted output for doctor check results with colors,
 * category grouping, and fix suggestions.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T07 (Doctor Reporter).
 */

import type { CheckResult, CheckCategory } from './check-registry.js';

/**
 * Options for configuring report formatting
 */
export interface ReportOptions {
  /** Enable ANSI color codes in output (default: true) */
  colors?: boolean;
  /** Show detailed information including details field (default: false) */
  verbose?: boolean;
  /** Group results by category (default: true) */
  groupByCategory?: boolean;
}

/**
 * Category display names for human-readable output
 */
const CATEGORY_NAMES: Record<CheckCategory, string> = {
  cli: 'CLI Tools',
  git: 'Git',
  runtime: 'Runtime',
  project: 'Project',
  network: 'Network',
};

/**
 * Category display order for consistent output
 */
const CATEGORY_ORDER: CheckCategory[] = ['cli', 'git', 'runtime', 'project', 'network'];

/**
 * ANSI color codes
 */
const ANSI_CODES = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m',
} as const;

/**
 * Symbols for check results
 */
const SYMBOLS = {
  PASS: '✓',
  FAIL: '✗',
  WARNING: '⚠',
} as const;

/**
 * Reporter for formatting doctor check results
 */
export class DoctorReporter {
  private readonly colors: boolean;
  private readonly verbose: boolean;
  private readonly groupByCategory: boolean;

  constructor(options: ReportOptions = {}) {
    this.colors = options.colors ?? true;
    this.verbose = options.verbose ?? false;
    this.groupByCategory = options.groupByCategory ?? true;
  }

  /**
   * Formats an array of check results into a human-readable string
   * 
   * @param results - Array of check results to format
   * @returns Formatted string ready for terminal output
   */
  formatResults(results: CheckResult[]): string {
    if (results.length === 0) {
      return 'No checks to report.';
    }

    const lines: string[] = [];

    if (this.groupByCategory) {
      const grouped = this.groupResultsByCategory(results);
      
      for (const category of CATEGORY_ORDER) {
        const categoryResults = grouped.get(category);
        if (!categoryResults || categoryResults.length === 0) {
          continue;
        }

        lines.push(`${CATEGORY_NAMES[category]}:`);
        for (const result of categoryResults) {
          lines.push(this.formatSingleResult(result));
        }
        lines.push(''); // Empty line between categories
      }
    } else {
      for (const result of results) {
        lines.push(this.formatSingleResult(result));
      }
    }

    // Remove trailing empty line if present
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    // Add summary
    lines.push('');
    lines.push(this.formatSummary(results));

    return lines.join('\n');
  }

  /**
   * Formats a single check result
   * 
   * @param result - Check result to format
   * @returns Formatted string for a single result
   */
  formatSingleResult(result: CheckResult): string {
    const lines: string[] = [];
    
    // Determine symbol and color based on result
    const symbol = result.passed ? SYMBOLS.PASS : SYMBOLS.FAIL;
    const colorCode = result.passed 
      ? (this.colors ? ANSI_CODES.GREEN : '')
      : (this.colors ? ANSI_CODES.RED : '');
    const resetCode = this.colors ? ANSI_CODES.RESET : '';

    // Format main line: symbol name: message (duration)
    const mainLine = `${colorCode}${symbol}${resetCode} ${result.name}: ${result.message} (${result.durationMs}ms)`;
    lines.push(mainLine);

    // Add fix suggestion if present and check failed
    if (!result.passed && result.fixSuggestion) {
      lines.push(`  → ${result.fixSuggestion}`);
    }

    // Add details if verbose mode is enabled
    if (this.verbose && result.details) {
      const detailLines = result.details.split('\n');
      for (const detailLine of detailLines) {
        lines.push(`  ${detailLine}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Formats a summary line showing pass/fail counts with category breakdown.
   * Includes a note so "X/16 passed" is less alarming when failures are optional or context-dependent.
   *
   * @param results - Array of check results
   * @returns Summary string (may be multiple lines)
   */
  formatSummary(results: CheckResult[]): string {
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const lines: string[] = [`Summary: ${passed}/${total} checks passed`];

    const grouped = this.groupResultsByCategory(results);
    const parts: string[] = [];
    for (const category of CATEGORY_ORDER) {
      const categoryResults = grouped.get(category);
      if (!categoryResults || categoryResults.length === 0) continue;
      const p = categoryResults.filter((r) => r.passed).length;
      const n = categoryResults.length;
      const label = category === 'cli' ? 'CLI platforms' : CATEGORY_NAMES[category];
      parts.push(`${label}: ${p}/${n}`);
    }
    if (parts.length > 0) {
      lines.push(`  ${parts.join('  ')}`);
    }

    const failedCli = grouped.get('cli')?.filter((r) => !r.passed).length ?? 0;
    const failedProject = grouped.get('project')?.filter((r) => !r.passed).length ?? 0;
    if (failedCli > 0 || failedProject > 0) {
      const hints: string[] = [];
      if (failedCli > 0) hints.push("use the GUI 'Install all missing' button or run 'puppet-master doctor --fix' to install");
      if (failedProject > 0) hints.push("run 'puppet-master init' in a project for project checks");
      if (hints.length > 0) {
        lines.push(`  Note: ${hints.join('. ')}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Groups check results by category
   * 
   * @param results - Array of check results to group
   * @returns Map of category to array of results
   */
  groupResultsByCategory(results: CheckResult[]): Map<CheckCategory, CheckResult[]> {
    const grouped = new Map<CheckCategory, CheckResult[]>();

    for (const result of results) {
      const existing = grouped.get(result.category) ?? [];
      existing.push(result);
      grouped.set(result.category, existing);
    }

    return grouped;
  }
}
