/**
 * Platform auth status detection
 *
 * Provides best-effort, local-only auth readiness checks for platform CLIs.
 * This intentionally avoids network calls (no billable requests).
 */

import type { Platform } from '../types/config.js';

export type PlatformAuthStatus =
  | 'authenticated'
  | 'not_authenticated'
  | 'skipped'
  | 'unknown';

export interface PlatformAuthCheckResult {
  status: PlatformAuthStatus;
  details?: string;
  fixSuggestion?: string;
}

export function getPlatformAuthStatus(platform: Platform): PlatformAuthCheckResult {
  switch (platform) {
    case 'cursor':
      return {
        status: 'skipped',
        details:
          'Cursor auth is handled by the local Cursor app/session; no automated check performed.',
      };
    case 'codex': {
      const hasKey = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.trim() !== '';
      return hasKey
        ? {
            status: 'authenticated',
            details: 'OPENAI_API_KEY is set.',
          }
        : {
            status: 'not_authenticated',
            details: 'OPENAI_API_KEY is not set.',
            fixSuggestion: 'Set OPENAI_API_KEY in your environment (or use your platform’s supported auth flow).',
          };
    }
    case 'claude': {
      const hasKey =
        typeof process.env.ANTHROPIC_API_KEY === 'string' &&
        process.env.ANTHROPIC_API_KEY.trim() !== '';
      return hasKey
        ? {
            status: 'authenticated',
            details: 'ANTHROPIC_API_KEY is set.',
          }
        : {
            status: 'not_authenticated',
            details: 'ANTHROPIC_API_KEY is not set.',
            fixSuggestion:
              'Set ANTHROPIC_API_KEY in your environment (or use your platform’s supported auth flow).',
          };
    }
    default:
      return {
        status: 'unknown',
        details: 'No auth readiness check is implemented for this platform.',
      };
  }
}

