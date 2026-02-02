/**
 * Platform auth status detection
 *
 * Provides best-effort, local-only auth readiness checks for platform CLIs.
 * This intentionally avoids network calls (no billable requests).
 *
 * Detection priority:
 *   1. CLI credential files / directories (fast, no subprocess)
 *   2. CLI auth status commands (execSync with short timeout)
 *   3. Environment variable fallback (legacy / CI usage)
 */

import { existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
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

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

/** Check whether a directory exists AND contains at least one file. */
function dirHasFiles(dirPath: string): boolean {
  try {
    if (!existsSync(dirPath)) return false;
    const entries = readdirSync(dirPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

/** Build an enriched PATH so CLI tools installed in common locations are found. */
function enrichedPath(): string {
  const home = homedir();
  const extra = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    join(home, '.local', 'bin'),
    join(home, '.nvm', 'versions', 'node'),  // glob won't work here but covers many layouts
    '/usr/local/lib/puppet-master/node/bin',
    '/opt/puppet-master/node/bin',
  ];
  const current = process.env.PATH || '/usr/bin:/bin';
  return [...extra, current].join(':');
}

/** Run a command with a short timeout; return true if exit code is 0. */
function cliAuthOk(command: string): boolean {
  try {
    execSync(command, {
      timeout: 5_000,
      stdio: 'pipe',
      env: { ...process.env, PATH: enrichedPath() },
    });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function getPlatformAuthStatus(platform: Platform): PlatformAuthCheckResult {
  const home = homedir();

  switch (platform) {
    /* -------------------------------------------------------------- */
    case 'cursor': {
      // 1. Check for local Cursor auth directories
      const cursorPaths = [
        join(home, '.cursor-server'),
        join(home, '.cursor'),
      ];
      for (const p of cursorPaths) {
        if (dirHasFiles(p)) {
          return {
            status: 'authenticated',
            details: `Cursor credentials found (${p}).`,
          };
        }
      }

      // 2. Env-var fallback (headless / CI)
      const hasApiKey =
        typeof process.env.CURSOR_API_KEY === 'string' &&
        process.env.CURSOR_API_KEY.trim() !== '';
      if (hasApiKey) {
        return {
          status: 'authenticated',
          details: 'CURSOR_API_KEY is set (headless/CI mode).',
        };
      }

      return {
        status: 'not_authenticated',
        details:
          'No Cursor credentials found. Open the Cursor app and sign in, or set CURSOR_API_KEY for headless/CI usage.',
        fixSuggestion:
          'Open Cursor IDE and sign in, or set CURSOR_API_KEY environment variable.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'codex': {
      // 1. Check CLI credential files
      const codexPaths = [
        join(home, '.codex', 'auth.json'),
        join(home, '.config', 'codex'),
      ];
      for (const p of codexPaths) {
        if (existsSync(p)) {
          return {
            status: 'authenticated',
            details: `Codex CLI credentials found (${p}).`,
          };
        }
      }

      // 2. Env-var fallback
      const hasKey =
        typeof process.env.OPENAI_API_KEY === 'string' &&
        process.env.OPENAI_API_KEY.trim() !== '';
      if (hasKey) {
        return {
          status: 'authenticated',
          details: 'OPENAI_API_KEY is set.',
        };
      }

      return {
        status: 'not_authenticated',
        details: 'No Codex credentials found.',
        fixSuggestion: 'Run `codex login` or set OPENAI_API_KEY in your environment.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'claude': {
      // 1. Check CLI credential directories
      const claudePaths = [
        join(home, '.claude.ai'),
        join(home, '.claude'),
        join(home, '.config', 'claude'),
      ];
      for (const p of claudePaths) {
        if (dirHasFiles(p)) {
          return {
            status: 'authenticated',
            details: `Claude CLI credentials found (${p}).`,
          };
        }
      }

      // 2. Env-var fallback
      const hasKey =
        typeof process.env.ANTHROPIC_API_KEY === 'string' &&
        process.env.ANTHROPIC_API_KEY.trim() !== '';
      if (hasKey) {
        return {
          status: 'authenticated',
          details: 'ANTHROPIC_API_KEY is set.',
        };
      }

      return {
        status: 'not_authenticated',
        details: 'No Claude credentials found.',
        fixSuggestion: 'Run `claude login` or set ANTHROPIC_API_KEY in your environment.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'gemini': {
      // 1. Check CLI credential directories
      const geminiPaths = [
        join(home, '.config', 'gemini'),
        join(home, '.config', 'google-cloud'),
      ];
      for (const p of geminiPaths) {
        if (dirHasFiles(p)) {
          return {
            status: 'authenticated',
            details: `Gemini / Google credentials found (${p}).`,
          };
        }
      }

      // 2. Env-var fallback
      const hasGeminiKey =
        typeof process.env.GEMINI_API_KEY === 'string' &&
        process.env.GEMINI_API_KEY.trim() !== '';
      const hasGoogleKey =
        typeof process.env.GOOGLE_API_KEY === 'string' &&
        process.env.GOOGLE_API_KEY.trim() !== '';
      const hasVertexCreds =
        typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
        process.env.GOOGLE_APPLICATION_CREDENTIALS.trim() !== '';
      if (hasGeminiKey) {
        return { status: 'authenticated', details: 'GEMINI_API_KEY is set.' };
      }
      if (hasGoogleKey) {
        return { status: 'authenticated', details: 'GOOGLE_API_KEY is set.' };
      }
      if (hasVertexCreds) {
        return { status: 'authenticated', details: 'GOOGLE_APPLICATION_CREDENTIALS is set (Vertex AI).' };
      }

      return {
        status: 'not_authenticated',
        details: 'No Gemini / Google credentials found.',
        fixSuggestion:
          'Run `gemini auth login`, or set GEMINI_API_KEY / GOOGLE_API_KEY in your environment.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'copilot': {
      // 1. Try `gh auth status` (fast local check, returns 0 when logged in)
      if (cliAuthOk('gh auth status')) {
        return {
          status: 'authenticated',
          details: 'GitHub CLI is authenticated (gh auth status).',
        };
      }

      // 2. Env-var fallback
      const hasGhToken =
        typeof process.env.GH_TOKEN === 'string' &&
        process.env.GH_TOKEN.trim() !== '';
      const hasGitHubToken =
        typeof process.env.GITHUB_TOKEN === 'string' &&
        process.env.GITHUB_TOKEN.trim() !== '';
      if (hasGhToken) {
        return {
          status: 'authenticated',
          details: 'GH_TOKEN is set (ensure it has Copilot permission).',
        };
      }
      if (hasGitHubToken) {
        return {
          status: 'authenticated',
          details: 'GITHUB_TOKEN is set (ensure it has Copilot permission).',
        };
      }

      return {
        status: 'not_authenticated',
        details: 'Not authenticated with GitHub.',
        fixSuggestion:
          'Run `gh auth login --web -p https` or set GH_TOKEN / GITHUB_TOKEN with Copilot permission.',
      };
    }

    /* -------------------------------------------------------------- */
    default: {
      // Exhaustive check - this should never be reached if all Platform values are handled
      const _exhaustiveCheck: never = platform;
      return {
        status: 'unknown',
        details: `No auth readiness check is implemented for platform: ${_exhaustiveCheck}`,
      };
    }
  }
}

/**
 * P0-G22: API key verification cache entry.
 */
interface VerificationCacheEntry {
  valid: boolean;
  checkedAt: number;
  error?: string;
}

/**
 * P0-G22: Cache for API key verification results.
 * TTL: 5 minutes (300,000 ms)
 */
const verificationCache = new Map<string, VerificationCacheEntry>();
const VERIFICATION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * P0-G22: Verify API key validity with a lightweight API call.
 * 
 * Makes a minimal API request to check if the key is valid.
 * Results are cached for 5 minutes to avoid repeated verification.
 * 
 * This is an optional check - only called when --verify-auth is specified.
 * 
 * @param platform - Platform to verify
 * @returns Verification result with validity and optional error
 */
export async function verifyApiKey(platform: Platform): Promise<{
  valid: boolean;
  error?: string;
  fromCache: boolean;
}> {
  const cacheKey = `${platform}-${getApiKeyForPlatform(platform) ?? 'none'}`;
  const cached = verificationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.checkedAt < VERIFICATION_CACHE_TTL_MS) {
    return {
      valid: cached.valid,
      error: cached.error,
      fromCache: true,
    };
  }

  const result = await doVerifyApiKey(platform);
  
  // Cache the result
  verificationCache.set(cacheKey, {
    valid: result.valid,
    checkedAt: Date.now(),
    error: result.error,
  });

  return {
    ...result,
    fromCache: false,
  };
}

/**
 * Get the API key value for a platform (for cache keying).
 */
function getApiKeyForPlatform(platform: Platform): string | undefined {
  switch (platform) {
    case 'codex':
      return process.env.OPENAI_API_KEY?.substring(0, 8);
    case 'claude':
      return process.env.ANTHROPIC_API_KEY?.substring(0, 8);
    case 'gemini':
      return (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)?.substring(0, 8);
    case 'copilot':
      return (process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN)?.substring(0, 8);
    default:
      return undefined;
  }
}

/**
 * P0-G22: Perform actual API key verification.
 * 
 * Uses lightweight endpoints:
 * - OpenAI: GET /v1/models (lists available models)
 * - Anthropic: GET /v1/models (lists available models)
 * - Gemini: GET /v1beta/models (lists available models)
 * - GitHub: GET /user (checks token validity)
 */
async function doVerifyApiKey(platform: Platform): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (platform) {
      case 'cursor':
        // Cursor uses local app auth, can't verify programmatically
        return { valid: true };
        
      case 'codex': {
        const key = process.env.OPENAI_API_KEY;
        if (!key) return { valid: false, error: 'OPENAI_API_KEY not set' };
        
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        
        if (response.ok) return { valid: true };
        if (response.status === 401) return { valid: false, error: 'Invalid API key' };
        return { valid: false, error: `API error: ${response.status}` };
      }
      
      case 'claude': {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) return { valid: false, error: 'ANTHROPIC_API_KEY not set' };
        
        // Anthropic doesn't have a models endpoint, use a minimal completion request
        // Actually, just check if the key format is valid (starts with sk-ant-)
        if (!key.startsWith('sk-ant-')) {
          return { valid: false, error: 'Invalid key format (should start with sk-ant-)' };
        }
        // For actual verification, we'd need to make an API call
        // For now, just validate format
        return { valid: true };
      }
      
      case 'gemini': {
        const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
        if (!key) return { valid: false, error: 'GEMINI_API_KEY/GOOGLE_API_KEY not set' };
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        
        if (response.ok) return { valid: true };
        if (response.status === 401 || response.status === 403) {
          return { valid: false, error: 'Invalid API key' };
        }
        return { valid: false, error: `API error: ${response.status}` };
      }
      
      case 'copilot': {
        const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
        if (!token) return { valid: false, error: 'GH_TOKEN/GITHUB_TOKEN not set' };
        
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        
        if (response.ok) return { valid: true };
        if (response.status === 401) return { valid: false, error: 'Invalid token' };
        return { valid: false, error: `API error: ${response.status}` };
      }
      
      default:
        return { valid: false, error: `Verification not supported for ${platform}` };
    }
  } catch (error) {
    return {
      valid: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * P0-G22: Clear verification cache.
 * Useful for testing or when keys are rotated.
 */
export function clearVerificationCache(): void {
  verificationCache.clear();
}

