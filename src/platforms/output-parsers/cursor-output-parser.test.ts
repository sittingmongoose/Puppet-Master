/**
 * Cursor Output Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CursorOutputParser, createCursorOutputParser } from './cursor-output-parser.js';

describe('CursorOutputParser', () => {
  let parser: CursorOutputParser;

  beforeEach(() => {
    parser = new CursorOutputParser();
  });

  describe('parse', () => {
    it('should detect exact COMPLETE signal', () => {
      const output = 'Task done <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should detect exact GUTTER signal', () => {
      const output = 'Stuck <ralph>GUTTER</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('GUTTER');
    });

    it('should detect case-insensitive COMPLETE signal', () => {
      const output = '<ralph>complete</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should extract session ID', () => {
      const output = 'Session PM-2026-01-20-14-30-00-001 started <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('PM-2026-01-20-14-30-00-001');
    });

    it('should extract token count', () => {
      const output = 'tokens: 5678 <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(5678);
    });

    it('should extract files changed', () => {
      const output = 'created src/index.ts\nmodified package.json\n<ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.filesChanged).toContain('src/index.ts');
      expect(parsed.filesChanged).toContain('package.json');
    });

    it('should extract test results', () => {
      const output = 'npm test PASS\n<ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.testResults.length).toBeGreaterThan(0);
      expect(parsed.testResults[0]?.passed).toBe(true);
    });

    it('should extract errors', () => {
      const output = 'error: Something failed\n<ralph>GUTTER</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.errors).toContain('Something failed');
    });

    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.rawOutput).toBe('');
    });

    it('should never throw on malformed input', () => {
      expect(() => parser.parse('<<<invalid xml>>>')).not.toThrow();
    });

    it('should preserve raw output', () => {
      const output = 'some output text';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('createCursorOutputParser', () => {
    it('should create a CursorOutputParser instance', () => {
      const instance = createCursorOutputParser();
      expect(instance).toBeInstanceOf(CursorOutputParser);
    });
  });
});
