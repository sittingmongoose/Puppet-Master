/**
 * Base Output Parser Tests
 *
 * Tests shared parsing functionality used by all platform parsers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseOutputParser } from './base-output-parser.js';
import type { ParsedPlatformOutput } from './types.js';

// Create a concrete implementation for testing
class TestableBaseParser extends BaseOutputParser {
  parse(output: string): ParsedPlatformOutput {
    return this.createBaseParsedOutput(output);
  }

  // Expose protected methods for testing
  public testDetectCompletionSignal(output: string) {
    return this.detectCompletionSignal(output);
  }

  public testExtractSessionId(output: string) {
    return this.extractSessionId(output);
  }

  public testExtractTokenCount(output: string) {
    return this.extractTokenCount(output);
  }

  public testExtractFilesChanged(output: string) {
    return this.extractFilesChanged(output);
  }

  public testExtractLearnings(output: string) {
    return this.extractLearnings(output);
  }

  public testExtractErrors(output: string) {
    return this.extractErrors(output);
  }

  public testExtractWarnings(output: string) {
    return this.extractWarnings(output);
  }

  public testExtractTestResults(output: string) {
    return this.extractTestResults(output);
  }

  public testExtractRalphStatusBlock(output: string) {
    return this.extractRalphStatusBlock(output);
  }
}

describe('BaseOutputParser', () => {
  let parser: TestableBaseParser;

  beforeEach(() => {
    parser = new TestableBaseParser();
  });

  describe('detectCompletionSignal', () => {
    it('should detect COMPLETE signal', () => {
      expect(parser.testDetectCompletionSignal('<ralph>COMPLETE</ralph>')).toBe('COMPLETE');
    });

    it('should detect COMPLETE signal case-insensitively', () => {
      expect(parser.testDetectCompletionSignal('<ralph>complete</ralph>')).toBe('COMPLETE');
    });

    it('should detect GUTTER signal', () => {
      expect(parser.testDetectCompletionSignal('<ralph>GUTTER</ralph>')).toBe('GUTTER');
    });

    it('should detect GUTTER signal case-insensitively', () => {
      expect(parser.testDetectCompletionSignal('<ralph>gutter</ralph>')).toBe('GUTTER');
    });

    it('should prioritize GUTTER over COMPLETE', () => {
      expect(
        parser.testDetectCompletionSignal('<ralph>COMPLETE</ralph> <ralph>GUTTER</ralph>')
      ).toBe('GUTTER');
    });

    it('should return NONE when no signal', () => {
      expect(parser.testDetectCompletionSignal('no signals here')).toBe('NONE');
    });
  });

  describe('extractSessionId', () => {
    it('should extract session ID in correct format', () => {
      expect(parser.testExtractSessionId('Session: PM-2026-01-20-14-30-00-001')).toBe(
        'PM-2026-01-20-14-30-00-001'
      );
    });

    it('should extract session ID from middle of text', () => {
      expect(parser.testExtractSessionId('Started PM-2026-01-20-14-30-00-001 successfully')).toBe(
        'PM-2026-01-20-14-30-00-001'
      );
    });

    it('should return undefined when no session ID', () => {
      expect(parser.testExtractSessionId('no session here')).toBeUndefined();
    });
  });

  describe('extractTokenCount', () => {
    it('should extract tokens with colon format', () => {
      expect(parser.testExtractTokenCount('tokens: 1234')).toBe(1234);
    });

    it('should extract tokens with equals format', () => {
      expect(parser.testExtractTokenCount('tokens=5678')).toBe(5678);
    });

    it('should extract tokens with space format', () => {
      expect(parser.testExtractTokenCount('tokens 9012')).toBe(9012);
    });

    it('should extract tokens from JSON format', () => {
      expect(parser.testExtractTokenCount('"tokens": 3456')).toBe(3456);
    });

    it('should return undefined when no tokens', () => {
      expect(parser.testExtractTokenCount('no tokens here')).toBeUndefined();
    });
  });

  describe('extractFilesChanged', () => {
    it('should extract files with created verb', () => {
      expect(parser.testExtractFilesChanged('created src/file.ts')).toContain('src/file.ts');
    });

    it('should extract files with modified verb', () => {
      expect(parser.testExtractFilesChanged('modified package.json')).toContain('package.json');
    });

    it('should extract files with updated verb', () => {
      expect(parser.testExtractFilesChanged('updated README.md')).toContain('README.md');
    });

    it('should extract multiple files', () => {
      const files = parser.testExtractFilesChanged('created file1.ts\nmodified file2.ts');
      expect(files).toContain('file1.ts');
      expect(files).toContain('file2.ts');
    });

    it('should not duplicate files', () => {
      const files = parser.testExtractFilesChanged('created file.ts created file.ts');
      expect(files.filter((f) => f === 'file.ts')).toHaveLength(1);
    });

    it('should handle files with backticks', () => {
      expect(parser.testExtractFilesChanged('modified `src/index.ts`')).toContain('src/index.ts');
    });

    it('should handle files with quotes', () => {
      expect(parser.testExtractFilesChanged('created "src/file.ts"')).toContain('src/file.ts');
    });
  });

  describe('extractLearnings', () => {
    it('should extract learnings with learned prefix', () => {
      const learnings = parser.testExtractLearnings('learned: Always use .js extensions');
      expect(learnings).toContain('Always use .js extensions');
    });

    it('should extract learnings with gotcha prefix', () => {
      const learnings = parser.testExtractLearnings('gotcha: Platform is a type alias');
      expect(learnings).toContain('Platform is a type alias');
    });

    it('should extract learnings with note prefix', () => {
      const learnings = parser.testExtractLearnings('note: Use Vitest not Jest');
      expect(learnings).toContain('Use Vitest not Jest');
    });

    it('should extract multiple learnings', () => {
      const learnings = parser.testExtractLearnings(
        'learned: First\ngotcha: Second\nnote: Third'
      );
      expect(learnings).toHaveLength(3);
    });
  });

  describe('extractErrors', () => {
    it('should extract errors with error prefix', () => {
      const errors = parser.testExtractErrors('error: Module not found');
      expect(errors).toContain('Module not found');
    });

    it('should extract errors with failed prefix', () => {
      const errors = parser.testExtractErrors('failed: Test execution');
      expect(errors).toContain('Test execution');
    });

    it('should extract errors with exception prefix', () => {
      const errors = parser.testExtractErrors('exception: Runtime error');
      expect(errors).toContain('Runtime error');
    });
  });

  describe('extractWarnings', () => {
    it('should extract warnings with warning prefix', () => {
      const warnings = parser.testExtractWarnings('warning: Deprecated API');
      expect(warnings).toContain('Deprecated API');
    });

    it('should extract warnings with warn prefix', () => {
      const warnings = parser.testExtractWarnings('warn: This is deprecated');
      expect(warnings).toContain('This is deprecated');
    });

    it('should extract warnings with deprecated prefix', () => {
      const warnings = parser.testExtractWarnings('deprecated: Old method');
      expect(warnings).toContain('Old method');
    });
  });

  describe('extractTestResults', () => {
    it('should extract npm test PASS', () => {
      const results = parser.testExtractTestResults('npm test PASS');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(true);
    });

    it('should extract npm test FAIL', () => {
      const results = parser.testExtractTestResults('npm test FAIL');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(false);
    });

    it('should extract vitest results', () => {
      const results = parser.testExtractTestResults('vitest passed');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('vitest');
    });

    it('should extract jest results', () => {
      const results = parser.testExtractTestResults('jest failed');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.command).toContain('jest');
    });

    it('should handle checkmark symbols', () => {
      const results = parser.testExtractTestResults('npm test ✓');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.passed).toBe(true);
    });
  });

  describe('extractRalphStatusBlock', () => {
    it('should extract JSON status block', () => {
      const output = '<RALPH_STATUS>{"status":"COMPLETE","message":"Done"}</RALPH_STATUS>';
      const block = parser.testExtractRalphStatusBlock(output);
      expect(block?.status).toBe('COMPLETE');
      expect(block?.message).toBe('Done');
    });

    it('should extract GUTTER status block', () => {
      const output = '<RALPH_STATUS>{"status":"GUTTER","errors":["Stuck"]}</RALPH_STATUS>';
      const block = parser.testExtractRalphStatusBlock(output);
      expect(block?.status).toBe('GUTTER');
      expect(block?.errors).toContain('Stuck');
    });

    it('should handle text-based status block', () => {
      const output = '<RALPH_STATUS>Task complete</RALPH_STATUS>';
      const block = parser.testExtractRalphStatusBlock(output);
      expect(block?.status).toBe('COMPLETE');
    });

    it('should return undefined when no status block', () => {
      expect(parser.testExtractRalphStatusBlock('no status here')).toBeUndefined();
    });
  });

  describe('parse (full integration)', () => {
    it('should parse complete output with all fields', () => {
      const output = `
        Session: PM-2026-01-20-14-30-00-001
        tokens: 1234
        created src/file.ts
        modified package.json
        learned: Always use .js extensions
        npm test PASS
        error: Minor issue
        warning: Deprecated usage
        <ralph>COMPLETE</ralph>
      `;

      const parsed = parser.parse(output);

      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.sessionId).toBe('PM-2026-01-20-14-30-00-001');
      expect(parsed.tokensUsed).toBe(1234);
      expect(parsed.filesChanged).toContain('src/file.ts');
      expect(parsed.filesChanged).toContain('package.json');
      expect(parsed.learnings).toContain('Always use .js extensions');
      expect(parsed.testResults.length).toBeGreaterThan(0);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.warnings.length).toBeGreaterThan(0);
      expect(parsed.rawOutput).toBe(output);
    });

    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.filesChanged).toEqual([]);
      expect(parsed.rawOutput).toBe('');
    });

    it('should never throw on malformed input', () => {
      const malformed = '<<<invalid>>>json{{{}}}';
      expect(() => parser.parse(malformed)).not.toThrow();
      const parsed = parser.parse(malformed);
      expect(parsed.rawOutput).toBe(malformed);
    });
  });
});
