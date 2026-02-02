/**
 * Copilot Output Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CopilotOutputParser, createCopilotOutputParser } from './copilot-output-parser.js';

describe('CopilotOutputParser', () => {
  let parser: CopilotOutputParser;

  beforeEach(() => {
    parser = new CopilotOutputParser();
  });

  describe('parse', () => {
    it('should detect COMPLETE signal', () => {
      const output = 'Task done <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should detect GUTTER signal', () => {
      const output = 'Stuck <ralph>GUTTER</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('GUTTER');
    });

    it('should detect case-insensitive COMPLETE signal', () => {
      const output = '<ralph>complete</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should detect case-insensitive GUTTER signal', () => {
      const output = '<ralph>gutter</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('GUTTER');
    });

    it('should extract conversation ID', () => {
      const output = 'conversation_id: conv-123 <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('conv-123');
    });

    it('should extract session ID with various formats', () => {
      const formats = [
        { input: 'session-id: sess-abc', expected: 'sess-abc' },
        { input: 'chat_id: chat-xyz', expected: 'chat-xyz' },
        { input: '"conversationId": "conv-456"', expected: 'conv-456' },
      ];

      for (const { input, expected } of formats) {
        const parsed = parser.parse(input);
        expect(parsed.sessionId).toBe(expected);
      }
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
      const output = 'error: Command failed\n<ralph>GUTTER</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.errors).toContain('Command failed');
    });

    it('should extract warnings', () => {
      const output = 'warning: Deprecated usage\n<ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.warnings).toContain('Deprecated usage');
    });

    it('should extract learnings', () => {
      const output = 'learned: Always use strict mode\n<ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.learnings).toContain('Always use strict mode');
    });

    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.rawOutput).toBe('');
    });

    it('should never throw on malformed input', () => {
      expect(() => parser.parse('<<<invalid>>>')).not.toThrow();
    });

    it('should preserve raw output', () => {
      const output = 'some output text';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });

    it('should not set model (not available in Copilot text output)', () => {
      const output = '<ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.model).toBeUndefined();
    });
  });

  describe('createCopilotOutputParser', () => {
    it('should create a CopilotOutputParser instance', () => {
      const instance = createCopilotOutputParser();
      expect(instance).toBeInstanceOf(CopilotOutputParser);
    });
  });
});
