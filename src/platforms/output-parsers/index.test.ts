/**
 * Platform Output Parsers Index Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getOutputParserForPlatform,
  CursorOutputParser,
  CodexOutputParser,
  ClaudeOutputParser,
  GeminiOutputParser,
  CopilotOutputParser,
} from './index.js';

describe('getOutputParserForPlatform', () => {
  it('should return CursorOutputParser for cursor platform', () => {
    const parser = getOutputParserForPlatform('cursor');
    expect(parser).toBeInstanceOf(CursorOutputParser);
  });

  it('should return CodexOutputParser for codex platform', () => {
    const parser = getOutputParserForPlatform('codex');
    expect(parser).toBeInstanceOf(CodexOutputParser);
  });

  it('should return ClaudeOutputParser for claude platform', () => {
    const parser = getOutputParserForPlatform('claude');
    expect(parser).toBeInstanceOf(ClaudeOutputParser);
  });

  it('should return GeminiOutputParser for gemini platform', () => {
    const parser = getOutputParserForPlatform('gemini');
    expect(parser).toBeInstanceOf(GeminiOutputParser);
  });

  it('should return CopilotOutputParser for copilot platform', () => {
    const parser = getOutputParserForPlatform('copilot');
    expect(parser).toBeInstanceOf(CopilotOutputParser);
  });

  it('should return ClaudeOutputParser as default for unknown platform', () => {
    // Mock console.warn to suppress warning in test output
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Type assertion needed for unknown platform
    const parser = getOutputParserForPlatform('unknown' as 'claude');
    expect(parser).toBeInstanceOf(ClaudeOutputParser);

    warnSpy.mockRestore();
  });

});

describe('exports', () => {
  it('should export all parser classes', () => {
    expect(CursorOutputParser).toBeDefined();
    expect(CodexOutputParser).toBeDefined();
    expect(ClaudeOutputParser).toBeDefined();
    expect(GeminiOutputParser).toBeDefined();
    expect(CopilotOutputParser).toBeDefined();
  });

  it('should export factory function', () => {
    expect(getOutputParserForPlatform).toBeDefined();
    expect(typeof getOutputParserForPlatform).toBe('function');
  });
});
