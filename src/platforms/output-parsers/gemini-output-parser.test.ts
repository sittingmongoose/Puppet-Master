/**
 * Gemini Output Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiOutputParser, createGeminiOutputParser } from './gemini-output-parser.js';

describe('GeminiOutputParser', () => {
  let parser: GeminiOutputParser;

  beforeEach(() => {
    parser = new GeminiOutputParser();
  });

  describe('parse - JSON format', () => {
    it('should parse JSON with response field', () => {
      const output = JSON.stringify({
        response: 'Task completed <ralph>COMPLETE</ralph>',
        stats: { tokens: 1500 },
      });

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.tokensUsed).toBe(1500);
    });

    it('should parse JSON with error field', () => {
      const output = JSON.stringify({
        response: '',
        error: 'Rate limit exceeded',
      });

      const parsed = parser.parse(output);
      expect(parsed.errors).toContain('Rate limit exceeded');
    });

    it('should parse JSON with error object', () => {
      const output = JSON.stringify({
        response: '',
        error: { message: 'API error', code: 'ERR_API' },
      });

      const parsed = parser.parse(output);
      expect(parsed.errors).toContain('API error');
    });

    it('should extract model from JSON', () => {
      const output = JSON.stringify({
        response: '<ralph>COMPLETE</ralph>',
        model: 'gemini-2.0-flash',
      });

      const parsed = parser.parse(output);
      expect(parsed.model).toBe('gemini-2.0-flash');
    });

    it('should extract session_id from JSON', () => {
      const output = JSON.stringify({
        response: '<ralph>COMPLETE</ralph>',
        session_id: 'gemini-sess-123',
      });

      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('gemini-sess-123');
    });

    it('should extract output_tokens from stats', () => {
      const output = JSON.stringify({
        response: '<ralph>COMPLETE</ralph>',
        stats: { output_tokens: 2000 },
      });

      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(2000);
    });

    it('should detect GUTTER signal and add error', () => {
      const output = JSON.stringify({
        response: 'Stuck <ralph>GUTTER</ralph>',
      });

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('GUTTER');
      expect(parsed.errors.some((e) => e.includes('GUTTER'))).toBe(true);
    });

    it('should preserve raw output as original JSON', () => {
      const output = JSON.stringify({ response: 'test' });
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('parse - stream-json (JSONL)', () => {
    it('should parse JSONL output', () => {
      const output = `{"type":"init","model":"gemini-2.0-flash"}
{"type":"message","content":"Working..."}
{"type":"result","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.model).toBe('gemini-2.0-flash');
    });

    it('should extract tokens from stream events', () => {
      const output = `{"type":"init","tokens":1000}
{"type":"result","response":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(1000);
    });

    it('should accumulate content from events', () => {
      const output = `{"type":"message","content":"Part 1 "}
{"type":"message","content":"Part 2 "}
{"type":"result","content":"<ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should extract errors from stream events', () => {
      const output = `{"type":"error","error":"Something went wrong"}
{"type":"result","content":""}`;

      const parsed = parser.parse(output);
      expect(parsed.errors).toContain('Something went wrong');
    });

    it('should handle data field in events', () => {
      const output = `{"type":"chunk","data":"Hello "}
{"type":"chunk","data":"World <ralph>COMPLETE</ralph>"}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });
  });

  describe('parse - plain text fallback', () => {
    it('should parse plain text output', () => {
      const output = 'Simple text output <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should detect GUTTER in plain text', () => {
      const output = 'Stuck and cannot proceed <ralph>GUTTER</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('GUTTER');
    });

    it('should extract session ID from plain text', () => {
      const output = 'Session PM-2026-01-20-14-30-00-001 started <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('PM-2026-01-20-14-30-00-001');
    });
  });

  describe('parse - edge cases', () => {
    it('should handle empty output', () => {
      const parsed = parser.parse('');
      expect(parsed.completionSignal).toBe('NONE');
      expect(parsed.rawOutput).toBe('');
    });

    it('should handle invalid JSON gracefully', () => {
      const output = '{"broken json';
      expect(() => parser.parse(output)).not.toThrow();
    });

    it('should fall back to text for invalid JSON', () => {
      const output = '{broken} <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should never throw on malformed input', () => {
      const malformed = '<<<}}}{{{>>>';
      expect(() => parser.parse(malformed)).not.toThrow();
    });

    it('should preserve raw output', () => {
      const output = 'original output';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('createGeminiOutputParser', () => {
    it('should create a GeminiOutputParser instance', () => {
      const instance = createGeminiOutputParser();
      expect(instance).toBeInstanceOf(GeminiOutputParser);
    });
  });
});
