/**
 * Platform Output Parsers - Barrel Exports
 *
 * Exports all platform-specific output parsers and types.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

// Export types
export type {
  CompletionSignal,
  RalphStatusBlock,
  ParsedPlatformOutput,
  PlatformOutputParser,
} from './types.js';

// Export base parser
export { BaseOutputParser } from './base-output-parser.js';

// Export platform-specific parsers
export { CursorOutputParser, createCursorOutputParser } from './cursor-output-parser.js';
export { CodexOutputParser, createCodexOutputParser } from './codex-output-parser.js';
export { ClaudeOutputParser, createClaudeOutputParser } from './claude-output-parser.js';
export { GeminiOutputParser, createGeminiOutputParser } from './gemini-output-parser.js';
export { CopilotOutputParser, createCopilotOutputParser } from './copilot-output-parser.js';

// Factory function to get parser by platform name
import type { Platform } from '../../types/config.js';
import type { PlatformOutputParser } from './types.js';
import { CursorOutputParser } from './cursor-output-parser.js';
import { CodexOutputParser } from './codex-output-parser.js';
import { ClaudeOutputParser } from './claude-output-parser.js';
import { GeminiOutputParser } from './gemini-output-parser.js';
import { CopilotOutputParser } from './copilot-output-parser.js';

/**
 * Get output parser for a specific platform.
 *
 * @param platform - Platform identifier
 * @returns Appropriate output parser for the platform
 */
export function getOutputParserForPlatform(platform: Platform): PlatformOutputParser {
  switch (platform) {
    case 'cursor':
      return new CursorOutputParser();
    case 'codex':
      return new CodexOutputParser();
    case 'claude':
      return new ClaudeOutputParser();
    case 'gemini':
      return new GeminiOutputParser();
    case 'copilot':
      return new CopilotOutputParser();
    default:
      // For unknown platforms (antigravity, etc.), use Claude parser as default
      // since it handles multiple formats
      console.warn(`[getOutputParserForPlatform] Unknown platform: ${platform}, using ClaudeOutputParser`);
      return new ClaudeOutputParser();
  }
}
