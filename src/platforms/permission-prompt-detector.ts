/**
 * Permission Prompt Detector
 *
 * Shared utility that scans CLI agent stdout/stderr for patterns indicating
 * the platform is waiting for user approval. This is a safety net -- if
 * auto-approval flags are correctly applied, this should never trigger.
 *
 * Used by all platform runners and output parsers to detect potential hangs
 * caused by unanswered permission prompts in headless/autonomous execution.
 */

import type { Platform } from '../types/platforms.js';

/**
 * Result of a permission prompt detection scan.
 */
export interface PermissionPromptDetection {
  /** Whether a permission prompt pattern was detected */
  detected: boolean;
  /** The regex pattern string that matched */
  pattern: string;
  /** Surrounding text context (~100 chars around the match) */
  context: string;
  /** Platform that produced the output */
  platform: Platform;
  /** ISO timestamp of detection */
  timestamp: string;
}

/**
 * Compiled permission prompt patterns.
 *
 * Each entry has:
 * - `regex`: the compiled RegExp
 * - `label`: a human-readable label for logging/audit
 */
const PERMISSION_PATTERNS: ReadonlyArray<{ regex: RegExp; label: string }> = [
  { regex: /Do you want to allow\b/i, label: 'Do you want to allow' },
  { regex: /\[Y\/n\]/, label: '[Y/n]' },
  { regex: /\[y\/N\]/, label: '[y/N]' },
  { regex: /\bApprove\?\s*$/m, label: 'Approve?' },
  { regex: /\byes\/no\b/i, label: 'yes/no' },
  { regex: /\bAllow this action\b/i, label: 'Allow this action' },
  { regex: /\bGrant permission\b/i, label: 'Grant permission' },
  { regex: /\bconfirm\s*\(y\/n\)/i, label: 'confirm (y/n)' },
  { regex: /\bDo you approve\b/i, label: 'Do you approve' },
  { regex: /\bWaiting for.*approval\b/i, label: 'Waiting for approval' },
  { regex: /\bapproval required\b/i, label: 'approval required' },
  { regex: /\btrust this.*directory\b/i, label: 'trust this directory' },
  { regex: /\bPress.*to continue\b/i, label: 'Press to continue' },
  { regex: /\bPermission required\b/i, label: 'Permission required' },
  { regex: /\bAllow tool execution\b/i, label: 'Allow tool execution' },
];

/**
 * Default number of bytes from the tail of output to scan.
 * Only scanning the tail reduces false positives from patterns
 * appearing inside code blocks or historical output.
 */
const DEFAULT_TAIL_BYTES = 500;

/**
 * Scans output for permission prompt patterns.
 *
 * @param output - The full output string to scan
 * @param platform - The platform that produced the output
 * @returns Detection result, or null if no prompt detected
 */
export function scanForPermissionPrompt(
  output: string,
  platform: Platform
): PermissionPromptDetection | null {
  return scanTailForPermissionPrompt(output, platform, output.length);
}

/**
 * Scans the tail of output for permission prompt patterns.
 *
 * Only scanning the last N bytes reduces false positives from patterns
 * appearing in code blocks, historical output, or quoted strings earlier
 * in the response.
 *
 * @param output - The full output string
 * @param platform - The platform that produced the output
 * @param tailBytes - Number of bytes from end to scan (default: 500)
 * @returns Detection result, or null if no prompt detected
 */
export function scanTailForPermissionPrompt(
  output: string,
  platform: Platform,
  tailBytes: number = DEFAULT_TAIL_BYTES
): PermissionPromptDetection | null {
  if (!output || output.length === 0) {
    return null;
  }

  const tail = tailBytes >= output.length
    ? output
    : output.slice(-tailBytes);

  for (const { regex, label } of PERMISSION_PATTERNS) {
    const match = regex.exec(tail);
    if (match) {
      // Extract context: up to 50 chars before and after the match
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      const contextStart = Math.max(0, matchStart - 50);
      const contextEnd = Math.min(tail.length, matchEnd + 50);
      const context = tail.slice(contextStart, contextEnd).replace(/\n/g, '\\n');

      return {
        detected: true,
        pattern: label,
        context,
        platform,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return null;
}

/**
 * Class-based wrapper for convenience (stateless, delegates to module functions).
 */
export class PermissionPromptDetector {
  scan(output: string, platform: Platform): PermissionPromptDetection | null {
    return scanForPermissionPrompt(output, platform);
  }

  scanTail(
    output: string,
    platform: Platform,
    tailBytes?: number
  ): PermissionPromptDetection | null {
    return scanTailForPermissionPrompt(output, platform, tailBytes);
  }
}
