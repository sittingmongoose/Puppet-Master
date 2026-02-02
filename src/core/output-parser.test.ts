/**
 * OutputParser tests
 *
 * Comprehensive test coverage for output parsing functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OutputParser } from './output-parser.js';

describe('OutputParser', () => {
  let parser: OutputParser;

  beforeEach(() => {
    parser = new OutputParser();
  });

  describe('detectCompletionSignal', () => {
    it('should detect COMPLETE signal', () => {
      const output = 'Task completed successfully. <ralph>COMPLETE</ralph>';
      expect(parser.detectCompletionSignal(output)).toBe('COMPLETE');
    });

    it('should detect COMPLETE signal case-insensitively', () => {
      const output = '<ralph>complete</ralph>';
      expect(parser.detectCompletionSignal(output)).toBe('COMPLETE');
    });

    it('should detect GUTTER signal', () => {
      const output = 'I am stuck. <ralph>GUTTER</ralph>';
      expect(parser.detectCompletionSignal(output)).toBe('GUTTER');
    });

    it('should detect GUTTER signal case-insensitively', () => {
      const output = '<ralph>gutter</ralph>';
      expect(parser.detectCompletionSignal(output)).toBe('GUTTER');
    });

    it('should return NONE when no signal present', () => {
      const output = 'Just regular output with no signals.';
      expect(parser.detectCompletionSignal(output)).toBe('NONE');
    });

    it('should prioritize COMPLETE over GUTTER if both present', () => {
      const output = '<ralph>GUTTER</ralph> <ralph>COMPLETE</ralph>';
      expect(parser.detectCompletionSignal(output)).toBe('COMPLETE');
    });

    it('should handle signals in comments', () => {
      const output = '// <ralph>COMPLETE</ralph> in comment';
      expect(parser.detectCompletionSignal(output)).toBe('COMPLETE');
    });

    it('should handle partial matches gracefully', () => {
      const output = '<ralph>COMPLET</ralph>'; // Missing E
      expect(parser.detectCompletionSignal(output)).toBe('NONE');
    });
  });

  describe('extractLearnings', () => {
    it('should extract learnings with "learned:" prefix', () => {
      const output = 'learned: Always use .js extension in imports';
      const learnings = parser.extractLearnings(output);
      expect(learnings).toContain('Always use .js extension in imports');
    });

    it('should extract learnings with "gotcha:" prefix', () => {
      const output = 'gotcha: Platform is a type alias, not a runtime value';
      const learnings = parser.extractLearnings(output);
      expect(learnings).toContain('Platform is a type alias, not a runtime value');
    });

    it('should extract learnings with "note:" prefix', () => {
      const output = 'note: Use Vitest, not Jest';
      const learnings = parser.extractLearnings(output);
      expect(learnings).toContain('Use Vitest, not Jest');
    });

    it('should extract learnings with "important:" prefix', () => {
      const output = 'important: Never reuse sessions';
      const learnings = parser.extractLearnings(output);
      expect(learnings).toContain('Never reuse sessions');
    });

    it('should extract multiple learnings', () => {
      const output = `
        learned: First learning
        gotcha: Second learning
        note: Third learning
      `;
      const learnings = parser.extractLearnings(output);
      expect(learnings).toHaveLength(3);
    });

    it('should return empty array when no learnings found', () => {
      const output = 'No learnings here';
      const learnings = parser.extractLearnings(output);
      expect(learnings).toEqual([]);
    });

    it('should handle case-insensitive patterns', () => {
      const output = 'LEARNED: Uppercase learning';
      const learnings = parser.extractLearnings(output);
      expect(learnings.length).toBeGreaterThan(0);
    });
  });

  describe('extractFilesChanged', () => {
    it('should extract files with "created" verb', () => {
      const output = 'created src/core/output-parser.ts';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('src/core/output-parser.ts');
    });

    it('should extract files with "modified" verb', () => {
      const output = 'modified src/core/index.ts';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('src/core/index.ts');
    });

    it('should extract files with "updated" verb', () => {
      const output = 'updated package.json';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('package.json');
    });

    it('should extract files with "wrote" verb', () => {
      const output = 'wrote test-file.ts';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('test-file.ts');
    });

    it('should extract files with "changed" verb', () => {
      const output = 'changed src/types/index.ts';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('src/types/index.ts');
    });

    it('should extract files with "edited" verb', () => {
      const output = 'edited README.md';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('README.md');
    });

    it('should handle files with quotes', () => {
      const output = 'created "src/core/parser.ts"';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('src/core/parser.ts');
    });

    it('should handle files with backticks', () => {
      const output = 'modified `src/index.ts`';
      const files = parser.extractFilesChanged(output);
      expect(files).toContain('src/index.ts');
    });

    it('should extract multiple files', () => {
      const output = `
        created file1.ts
        modified file2.ts
        updated file3.ts
      `;
      const files = parser.extractFilesChanged(output);
      expect(files.length).toBeGreaterThanOrEqual(3);
    });

    it('should not duplicate files', () => {
      const output = 'created file.ts created file.ts';
      const files = parser.extractFilesChanged(output);
      expect(files.filter((f) => f === 'file.ts')).toHaveLength(1);
    });

    it('should return empty array when no files found', () => {
      const output = 'No file changes here';
      const files = parser.extractFilesChanged(output);
      expect(files).toEqual([]);
    });
  });

  describe('extractTestResults', () => {
    it('should extract npm test results with PASS', () => {
      const output = 'npm test PASS';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(true);
      expect(results[0]?.command).toContain('npm');
    });

    it('should extract npm test results with FAIL', () => {
      const output = 'npm test FAIL';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(false);
    });

    it('should extract vitest results', () => {
      const output = 'vitest passed';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('vitest');
    });

    it('should extract jest results', () => {
      const output = 'jest failed';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('jest');
    });

    it('should extract pytest results', () => {
      const output = 'pytest PASS';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('pytest');
    });

    it('should extract npm run test results', () => {
      const output = 'npm run test PASS';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('npm');
    });

    it('should handle checkmark symbols', () => {
      const output = 'npm test ✓';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(true);
    });

    it('should handle X symbols', () => {
      const output = 'vitest ✗';
      const results = parser.extractTestResults(output);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(false);
    });

    it('should return empty array when no test results found', () => {
      const output = 'No test output here';
      const results = parser.extractTestResults(output);
      expect(results).toEqual([]);
    });
  });

  describe('extractErrors', () => {
    it('should extract errors with "error:" prefix', () => {
      const output = 'error: Module not found';
      const errors = parser.extractErrors(output);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Module not found');
    });

    it('should extract errors with "failed:" prefix', () => {
      const output = 'failed: Test execution failed';
      const errors = parser.extractErrors(output);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should extract errors with "exception:" prefix', () => {
      const output = 'exception: Runtime error occurred';
      const errors = parser.extractErrors(output);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should extract errors with "fatal:" prefix', () => {
      const output = 'fatal: Critical error';
      const errors = parser.extractErrors(output);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should extract multiple errors', () => {
      const output = `
        error: First error
        failed: Second error
      `;
      const errors = parser.extractErrors(output);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no errors found', () => {
      const output = 'No errors here';
      const errors = parser.extractErrors(output);
      expect(errors).toEqual([]);
    });
  });

  describe('extractWarnings', () => {
    it('should extract warnings with "warning:" prefix', () => {
      const output = 'warning: Deprecated API usage';
      const warnings = parser.extractWarnings(output);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('Deprecated API usage');
    });

    it('should extract warnings with "warn:" prefix', () => {
      const output = 'warn: This is a warning';
      const warnings = parser.extractWarnings(output);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should extract warnings with "deprecated:" prefix', () => {
      const output = 'deprecated: Old method';
      const warnings = parser.extractWarnings(output);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should return empty array when no warnings found', () => {
      const output = 'No warnings here';
      const warnings = parser.extractWarnings(output);
      expect(warnings).toEqual([]);
    });
  });

  describe('detectGutterIndicators', () => {
    it('should detect explicit GUTTER signal', () => {
      const output = '<ralph>GUTTER</ralph>';
      expect(parser.detectGutterIndicators(output)).toBe(true);
    });

    it('should detect token limit indicators', () => {
      const output = 'token limit exceeded';
      expect(parser.detectGutterIndicators(output)).toBe(true);
    });

    it('should detect max tokens indicators', () => {
      const output = 'max tokens reached';
      expect(parser.detectGutterIndicators(output)).toBe(true);
    });

    it('should detect context length indicators', () => {
      const output = 'context length exceeded';
      expect(parser.detectGutterIndicators(output)).toBe(true);
    });

    it('should detect repeated identical output', () => {
      const output = `
        Line 1
        Line 1
        Line 1
      `;
      expect(parser.detectGutterIndicators(output)).toBe(true);
    });

    it('should detect same command failed 3x', () => {
      const output1 = 'npm test FAIL';
      const output2 = 'npm test FAIL';
      const output3 = 'npm test FAIL';

      parser.parse(output1);
      parser.parse(output2);
      parser.parse(output3);

      // The third failure should trigger gutter detection
      expect(parser.detectGutterIndicators(output3)).toBe(true);
    });

    it('should return false when no gutter indicators present', () => {
      const output = 'Normal output with no issues';
      expect(parser.detectGutterIndicators(output)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse complete output with all fields', () => {
      const output = `
        created src/core/output-parser.ts
        learned: Always use .js extensions
        npm test PASS
        error: Some error occurred
        warning: Deprecated usage
        <ralph>COMPLETE</ralph>
      `;

      const parsed = parser.parse(output);

      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.filesChanged).toContain('src/core/output-parser.ts');
      expect(parsed.learnings.length).toBeGreaterThan(0);
      expect(parsed.testResults.length).toBeGreaterThan(0);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.learnings).toEqual([]);
      expect(parsed.filesChanged).toEqual([]);
      expect(parsed.testResults).toEqual([]);
      expect(parsed.errors).toEqual([]);
      expect(parsed.warnings).toEqual([]);
    });

    it('should handle malformed output gracefully', () => {
      const output = '<<<ralph>INVALID</ralph> broken XML <unclosed tag';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('NONE');
      // Should not throw
    });

    it('should extract suggested AGENTS.md update', () => {
      const output = `
        update AGENTS.md: Always use Context7 MCP
      `;
      const parsed = parser.parse(output);
      expect(parsed.suggestedAgentsUpdate).toBeDefined();
      expect(parsed.suggestedAgentsUpdate).toContain('Context7 MCP');
    });
  });

  describe('reset', () => {
    it('should reset command failure tracking', () => {
      const output1 = 'npm test FAIL';
      const output2 = 'npm test FAIL';
      const output3 = 'npm test FAIL';

      parser.parse(output1);
      parser.parse(output2);
      parser.parse(output3); // Parse to track failures
      expect(parser.detectGutterIndicators(output3)).toBe(true);

      parser.reset();
      // After reset, should not detect gutter from single failure
      const output4 = 'npm test FAIL';
      parser.parse(output4); // Parse to track failure
      expect(parser.detectGutterIndicators(output4)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle output with special characters', () => {
      const output = 'created file-with-dashes.ts and file_with_underscores.ts';
      const files = parser.extractFilesChanged(output);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should handle very long output', () => {
      const longOutput = 'x'.repeat(10000) + ' <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(longOutput);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should handle unicode characters', () => {
      const output = 'created файл.ts learned: Используйте .js расширения';
      const parsed = parser.parse(output);
      expect(parsed.filesChanged.length).toBeGreaterThan(0);
      expect(parsed.learnings.length).toBeGreaterThan(0);
    });

    it('should handle newlines and whitespace', () => {
      const output = `
        
        
        <ralph>COMPLETE</ralph>
        
        
      `;
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });
  });
});
