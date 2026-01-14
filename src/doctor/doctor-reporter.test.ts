/**
 * Tests for Doctor Reporter
 * 
 * Tests formatting of doctor check results with colors, grouping, and suggestions.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T07 (Doctor Reporter).
 */

import { describe, it, expect } from 'vitest';
import { DoctorReporter, type ReportOptions } from './doctor-reporter.js';
import type { CheckResult } from './check-registry.js';

/**
 * Helper to create a mock check result
 */
function createResult(overrides: Partial<CheckResult>): CheckResult {
  return {
    name: 'test-check',
    category: 'runtime',
    passed: true,
    message: 'Test message',
    durationMs: 10,
    ...overrides,
  };
}

describe('DoctorReporter', () => {
  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const reporter = new DoctorReporter();
      expect(reporter).toBeInstanceOf(DoctorReporter);
    });

    it('should accept custom options', () => {
      const options: ReportOptions = {
        colors: false,
        verbose: true,
        groupByCategory: false,
      };
      const reporter = new DoctorReporter(options);
      expect(reporter).toBeInstanceOf(DoctorReporter);
    });

    it('should default colors to true', () => {
      const reporter = new DoctorReporter({});
      const result = createResult({ passed: true });
      const output = reporter.formatSingleResult(result);
      expect(output).toContain('\x1b[32m'); // Green ANSI code
    });

    it('should default verbose to false', () => {
      const reporter = new DoctorReporter({});
      const result = createResult({ 
        passed: true,
        details: 'Hidden details',
      });
      const output = reporter.formatSingleResult(result);
      expect(output).not.toContain('Hidden details');
    });

    it('should default groupByCategory to true', () => {
      const reporter = new DoctorReporter({});
      const results = [
        createResult({ name: 'check1', category: 'cli' }),
        createResult({ name: 'check2', category: 'git' }),
      ];
      const output = reporter.formatResults(results);
      expect(output).toContain('CLI Tools:');
      expect(output).toContain('Git:');
    });
  });

  describe('formatSingleResult', () => {
    it('should format passed check with green color and checkmark', () => {
      const reporter = new DoctorReporter({ colors: true });
      const result = createResult({
        name: 'node-version',
        passed: true,
        message: 'Node.js 20.10.0',
        durationMs: 2,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).toContain('\x1b[32m'); // Green
      expect(output).toContain('✓');
      expect(output).toContain('node-version: Node.js 20.10.0 (2ms)');
      expect(output).toContain('\x1b[0m'); // Reset
    });

    it('should format failed check with red color and cross', () => {
      const reporter = new DoctorReporter({ colors: true });
      const result = createResult({
        name: 'cursor-cli',
        passed: false,
        message: 'cursor-agent not found',
        durationMs: 5,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).toContain('\x1b[31m'); // Red
      expect(output).toContain('✗');
      expect(output).toContain('cursor-cli: cursor-agent not found (5ms)');
      expect(output).toContain('\x1b[0m'); // Reset
    });

    it('should not include color codes when colors disabled', () => {
      const reporter = new DoctorReporter({ colors: false });
      const result = createResult({
        name: 'test-check',
        passed: true,
        message: 'Test message',
        durationMs: 10,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).not.toContain('\x1b[32m');
      expect(output).not.toContain('\x1b[0m');
      expect(output).toContain('✓');
      expect(output).toContain('test-check: Test message (10ms)');
    });

    it('should include fix suggestion for failed checks', () => {
      const reporter = new DoctorReporter();
      const result = createResult({
        name: 'cursor-cli',
        passed: false,
        message: 'cursor-agent not found',
        fixSuggestion: 'Install with: curl https://cursor.com/install -fsSL | bash',
        durationMs: 5,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).toContain('→ Install with: curl https://cursor.com/install -fsSL | bash');
      expect(output).toContain('  →'); // Indented with 2 spaces
    });

    it('should not include fix suggestion for passed checks', () => {
      const reporter = new DoctorReporter();
      const result = createResult({
        name: 'test-check',
        passed: true,
        fixSuggestion: 'This should not appear',
        durationMs: 10,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).not.toContain('→');
      expect(output).not.toContain('This should not appear');
    });

    it('should include details when verbose mode is enabled', () => {
      const reporter = new DoctorReporter({ verbose: true });
      const result = createResult({
        name: 'test-check',
        passed: true,
        message: 'Test message',
        details: 'Detailed information\nMore details',
        durationMs: 10,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).toContain('Detailed information');
      expect(output).toContain('More details');
      expect(output).toContain('  Detailed information'); // Indented
    });

    it('should not include details when verbose mode is disabled', () => {
      const reporter = new DoctorReporter({ verbose: false });
      const result = createResult({
        name: 'test-check',
        passed: true,
        message: 'Test message',
        details: 'Hidden details',
        durationMs: 10,
      });
      const output = reporter.formatSingleResult(result);
      
      expect(output).not.toContain('Hidden details');
    });

    it('should handle multiline details correctly', () => {
      const reporter = new DoctorReporter({ verbose: true });
      const result = createResult({
        name: 'test-check',
        passed: true,
        message: 'Test message',
        details: 'Line 1\nLine 2\nLine 3',
        durationMs: 10,
      });
      const output = reporter.formatSingleResult(result);
      
      const lines = output.split('\n');
      expect(lines).toContain('  Line 1');
      expect(lines).toContain('  Line 2');
      expect(lines).toContain('  Line 3');
    });
  });

  describe('formatSummary', () => {
    it('should format summary with correct pass/fail counts', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({ name: 'check1', passed: true }),
        createResult({ name: 'check2', passed: true }),
        createResult({ name: 'check3', passed: false }),
        createResult({ name: 'check4', passed: true }),
      ];
      const summary = reporter.formatSummary(results);
      
      expect(summary).toBe('Summary: 3/4 checks passed');
    });

    it('should handle all passed checks', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({ name: 'check1', passed: true }),
        createResult({ name: 'check2', passed: true }),
      ];
      const summary = reporter.formatSummary(results);
      
      expect(summary).toBe('Summary: 2/2 checks passed');
    });

    it('should handle all failed checks', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({ name: 'check1', passed: false }),
        createResult({ name: 'check2', passed: false }),
      ];
      const summary = reporter.formatSummary(results);
      
      expect(summary).toBe('Summary: 0/2 checks passed');
    });

    it('should handle empty results', () => {
      const reporter = new DoctorReporter();
      const summary = reporter.formatSummary([]);
      
      expect(summary).toBe('Summary: 0/0 checks passed');
    });
  });

  describe('groupByCategory', () => {
    it('should group results by category', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({ name: 'check1', category: 'cli' }),
        createResult({ name: 'check2', category: 'git' }),
        createResult({ name: 'check3', category: 'cli' }),
        createResult({ name: 'check4', category: 'runtime' }),
      ];
      const grouped = reporter.groupResultsByCategory(results);
      
      expect(grouped.get('cli')).toHaveLength(2);
      expect(grouped.get('git')).toHaveLength(1);
      expect(grouped.get('runtime')).toHaveLength(1);
      expect(grouped.get('project')).toBeUndefined();
    });

    it('should return empty map for empty results', () => {
      const reporter = new DoctorReporter();
      const grouped = reporter.groupResultsByCategory([]);
      
      expect(grouped.size).toBe(0);
    });
  });

  describe('formatResults', () => {
    it('should format empty results', () => {
      const reporter = new DoctorReporter();
      const output = reporter.formatResults([]);
      
      expect(output).toBe('No checks to report.');
    });

    it('should format results without grouping', () => {
      const reporter = new DoctorReporter({ groupByCategory: false });
      const results = [
        createResult({ name: 'check1', category: 'cli', passed: true }),
        createResult({ name: 'check2', category: 'git', passed: false }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).not.toContain('CLI Tools:');
      expect(output).not.toContain('Git:');
      expect(output).toContain('check1:');
      expect(output).toContain('check2:');
      expect(output).toContain('Summary: 1/2 checks passed');
    });

    it('should format results with category grouping', () => {
      const reporter = new DoctorReporter({ groupByCategory: true });
      const results = [
        createResult({ name: 'cursor-cli', category: 'cli', passed: true }),
        createResult({ name: 'codex-cli', category: 'cli', passed: false }),
        createResult({ name: 'git-available', category: 'git', passed: true }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).toContain('CLI Tools:');
      expect(output).toContain('Git:');
      expect(output).toContain('cursor-cli:');
      expect(output).toContain('codex-cli:');
      expect(output).toContain('git-available:');
      expect(output).toContain('Summary: 2/3 checks passed');
    });

    it('should maintain category order', () => {
      const reporter = new DoctorReporter({ groupByCategory: true });
      const results = [
        createResult({ name: 'check1', category: 'runtime' }),
        createResult({ name: 'check2', category: 'cli' }),
        createResult({ name: 'check3', category: 'git' }),
      ];
      const output = reporter.formatResults(results);
      
      const cliIndex = output.indexOf('CLI Tools:');
      const gitIndex = output.indexOf('Git:');
      const runtimeIndex = output.indexOf('Runtime:');
      
      expect(cliIndex).toBeLessThan(gitIndex);
      expect(gitIndex).toBeLessThan(runtimeIndex);
    });

    it('should skip empty categories', () => {
      const reporter = new DoctorReporter({ groupByCategory: true });
      const results = [
        createResult({ name: 'check1', category: 'cli' }),
        createResult({ name: 'check2', category: 'runtime' }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).toContain('CLI Tools:');
      expect(output).toContain('Runtime:');
      expect(output).not.toContain('Git:');
      expect(output).not.toContain('Project:');
      expect(output).not.toContain('Network:');
    });

    it('should include fix suggestions in formatted output', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({
          name: 'cursor-cli',
          passed: false,
          fixSuggestion: 'Install with: curl https://cursor.com/install -fsSL | bash',
        }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).toContain('→ Install with: curl https://cursor.com/install -fsSL | bash');
    });

    it('should include details when verbose mode is enabled', () => {
      const reporter = new DoctorReporter({ verbose: true });
      const results = [
        createResult({
          name: 'test-check',
          passed: true,
          details: 'Detailed information',
        }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).toContain('Detailed information');
    });

    it('should format complete example output correctly', () => {
      const reporter = new DoctorReporter({ colors: true });
      const results = [
        createResult({
          name: 'node-version',
          category: 'runtime',
          passed: true,
          message: 'Node.js 20.10.0',
          durationMs: 2,
        }),
        createResult({
          name: 'npm-available',
          category: 'runtime',
          passed: true,
          message: 'npm 10.2.0',
          durationMs: 1,
        }),
        createResult({
          name: 'cursor-cli',
          category: 'cli',
          passed: false,
          message: 'cursor-agent not found',
          fixSuggestion: 'Install with: curl https://cursor.com/install -fsSL | bash',
          durationMs: 5,
        }),
      ];
      const output = reporter.formatResults(results);
      
      // Check structure - account for ANSI codes in output
      expect(output).toContain('Runtime:');
      expect(output).toContain('CLI Tools:');
      expect(output).toContain('node-version: Node.js 20.10.0 (2ms)');
      expect(output).toContain('npm-available: npm 10.2.0 (1ms)');
      expect(output).toContain('cursor-cli: cursor-agent not found (5ms)');
      expect(output).toContain('→ Install with: curl https://cursor.com/install -fsSL | bash');
      expect(output).toContain('Summary: 2/3 checks passed');
    });

    it('should handle results with no fix suggestions', () => {
      const reporter = new DoctorReporter();
      const results = [
        createResult({
          name: 'check1',
          passed: false,
          // No fixSuggestion
        }),
      ];
      const output = reporter.formatResults(results);
      
      expect(output).toContain('check1:');
      expect(output).not.toContain('→');
    });

    it('should remove trailing empty line between categories', () => {
      const reporter = new DoctorReporter({ groupByCategory: true });
      const results = [
        createResult({ name: 'check1', category: 'cli' }),
      ];
      const output = reporter.formatResults(results);
      
      // Should have exactly one blank line (two newlines) before summary
      // This ensures readability while not having excessive spacing
      const summaryIndex = output.indexOf('Summary:');
      const beforeSummary = output.substring(Math.max(0, summaryIndex - 2), summaryIndex);
      expect(beforeSummary).toBe('\n\n');
      
      // Verify there are no triple newlines (excessive spacing)
      const beforeSummaryExtended = output.substring(Math.max(0, summaryIndex - 3), summaryIndex);
      expect(beforeSummaryExtended).not.toBe('\n\n\n');
    });
  });
});
