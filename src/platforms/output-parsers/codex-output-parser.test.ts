/**
 * Codex Output Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodexOutputParser, createCodexOutputParser } from './codex-output-parser.js';

describe('CodexOutputParser', () => {
  let parser: CodexOutputParser;

  beforeEach(() => {
    parser = new CodexOutputParser();
  });

  describe('parse - plain text', () => {
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

    it('should extract session ID from text', () => {
      const output = 'session_id: abc123 <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('abc123');
    });

    it('should extract session ID with various formats', () => {
      const formats = [
        { input: 'session-id: test123', expected: 'test123' },
        { input: 'sessionId=abc456', expected: 'abc456' },
        { input: '"session_id": "xyz789"', expected: 'xyz789' },
      ];

      for (const { input, expected } of formats) {
        const parsed = parser.parse(input);
        expect(parsed.sessionId).toBe(expected);
      }
    });
  });

  describe('parse - JSONL format', () => {
    it('should parse JSONL output', () => {
      const output = `{"type":"start","session_id":"sess123"}
{"type":"content","content":"Working on task..."}
{"type":"content","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.sessionId).toBe('sess123');
    });

    it('should extract tokens from JSONL', () => {
      const output = `{"type":"start","tokens":1500}
{"type":"content","content":"Done <ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(1500);
    });

    it('should extract model from JSONL', () => {
      const output = `{"type":"start","model":"codex-best"}
{"type":"content","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.model).toBe('codex-best');
    });

    it('should accumulate content from multiple events', () => {
      const output = `{"type":"content","content":"Part 1 "}
{"type":"content","content":"Part 2 "}
{"type":"content","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.rawOutput).toBe(output);
    });

    it('should handle mixed JSON and text', () => {
      const output = `{"type":"start"}
Some plain text
{"type":"content","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });
  });

  describe('parse - edge cases', () => {
    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.rawOutput).toBe('');
    });

    it('should never throw on malformed JSON', () => {
      const output = '{"broken json\n{"also broken';
      expect(() => parser.parse(output)).not.toThrow();
    });

    it('should handle single JSON line as text', () => {
      const output = '{"single":"line"}';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });

    it('should preserve raw output', () => {
      const output = 'original output text';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('createCodexOutputParser', () => {
    it('should create a CodexOutputParser instance', () => {
      const instance = createCodexOutputParser();
      expect(instance).toBeInstanceOf(CodexOutputParser);
    });
  });
});
