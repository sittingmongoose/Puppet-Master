/**
 * Claude Output Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClaudeOutputParser, createClaudeOutputParser } from './claude-output-parser.js';

describe('ClaudeOutputParser', () => {
  let parser: ClaudeOutputParser;

  beforeEach(() => {
    parser = new ClaudeOutputParser();
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

    it('should detect case-insensitive signals', () => {
      expect(parser.parse('<ralph>complete</ralph>').completionSignal).toBe('COMPLETE');
      expect(parser.parse('<ralph>gutter</ralph>').completionSignal).toBe('GUTTER');
    });

    it('should extract session ID', () => {
      const output = 'Session PM-2026-01-20-14-30-00-001 <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('PM-2026-01-20-14-30-00-001');
    });

    it('should extract token count', () => {
      const output = 'tokens: 2500 <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(2500);
    });
  });

  describe('parse - single JSON', () => {
    it('should parse JSON with response field', () => {
      const output = JSON.stringify({
        response: 'Task completed <ralph>COMPLETE</ralph>',
        tokens: 1000,
        model: 'claude-sonnet-4.5',
      });

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.tokensUsed).toBe(1000);
      expect(parsed.model).toBe('claude-sonnet-4.5');
    });

    it('should parse JSON with content field', () => {
      const output = JSON.stringify({
        content: '<ralph>COMPLETE</ralph>',
        session_id: 'sess-abc',
      });

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.sessionId).toBe('sess-abc');
    });

    it('should parse JSON with text field', () => {
      const output = JSON.stringify({
        text: 'Done <ralph>COMPLETE</ralph>',
      });

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should preserve raw output as original JSON', () => {
      const output = JSON.stringify({ response: 'test' });
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('parse - stream-json (JSONL)', () => {
    it('should parse stream-json output', () => {
      const output = `{"type":"message_start","model":"claude-sonnet-4.5"}
{"type":"content_block_delta","delta":{"text":"Working..."}}
{"type":"content_block_delta","delta":{"text":"<ralph>COMPLETE</ralph>"}}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
      expect(parsed.model).toBe('claude-sonnet-4.5');
    });

    it('should extract usage information from stream', () => {
      const output = `{"type":"message_start"}
{"type":"content_block_delta","delta":{"text":"Done"}}
{"type":"usage","usage":{"output_tokens":500}}`;

      const parsed = parser.parse(output);
      expect(parsed.tokensUsed).toBe(500);
    });

    it('should extract session ID from stream events', () => {
      const output = `{"type":"init","session_id":"stream-sess-123"}
{"type":"content_block_delta","delta":{"text":"<ralph>COMPLETE</ralph>"}}`;

      const parsed = parser.parse(output);
      expect(parsed.sessionId).toBe('stream-sess-123');
    });

    it('should accumulate text from content blocks', () => {
      const output = `{"type":"content_block_start","content_block":{"text":"Part 1 "}}
{"type":"content_block_delta","delta":{"text":"Part 2 "}}
{"type":"content_block_delta","delta":{"text":"<ralph>COMPLETE</ralph>"}}`;

      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should handle message field in events', () => {
      const output = `{"type":"message","message":"Processing..."}
{"type":"message","message":"<ralph>COMPLETE</ralph>"}`;

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

    it('should handle invalid JSON gracefully', () => {
      const output = '{"broken": json}';
      expect(() => parser.parse(output)).not.toThrow();
    });

    it('should fall back to text parsing for invalid JSON', () => {
      const output = '{invalid} <ralph>COMPLETE</ralph>';
      const parsed = parser.parse(output);
      expect(parsed.completionSignal).toBe('COMPLETE');
    });

    it('should handle mixed valid and invalid JSON lines', () => {
      const output = `{"valid": "json"}
not json at all
{"also": "valid"}`;

      expect(() => parser.parse(output)).not.toThrow();
    });

    it('should preserve raw output', () => {
      const output = 'original text';
      const parsed = parser.parse(output);
      expect(parsed.rawOutput).toBe(output);
    });
  });

  describe('createClaudeOutputParser', () => {
    it('should create a ClaudeOutputParser instance', () => {
      const instance = createClaudeOutputParser();
      expect(instance).toBeInstanceOf(ClaudeOutputParser);
    });
  });
});
