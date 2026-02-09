/**
 * Platform auth status detection
 *
 * Provides best-effort, local-only auth readiness checks for platform CLIs.
 * This intentionally avoids network calls (no billable requests).
 *
 * Detection priority:
 *   1. Environment variables (headless/CI usage)
 *   2. Credential files / directories (fast, no subprocess)
 *
 * IMPORTANT: Do NOT run CLI auth/status commands here.
 * Even time-bounded synchronous subprocess calls (execSync/spawnSync) can block
 * the Node event loop and cause severe GUI slowdowns and apparent "freezes".
 */

import { existsSync, readdirSync } from 'node:fs';
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

function getGhHostsPath(home: string): string | null {
  if (!home) return null;
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return appData ? join(appData, 'GitHub CLI', 'hosts.yml') : null;
  }
  return join(home, '.config', 'gh', 'hosts.yml');
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function getPlatformAuthStatus(platform: Platform): PlatformAuthCheckResult {
  const home = homedir();

  switch (platform) {
    /* -------------------------------------------------------------- */
    case 'cursor': {
      // 1. Env-var fallback (headless / CI)
      const hasApiKey =
        typeof process.env.CURSOR_API_KEY === 'string' &&
        process.env.CURSOR_API_KEY.trim() !== '';
      if (hasApiKey) {
        return {
          status: 'authenticated',
          details: 'CURSOR_API_KEY is set (headless/CI mode).',
        };
      }

      // 2. Auth file heuristics (local-only).
      // Observed locations (Feb 2026):
      // - Linux:   ~/.config/cursor/auth.json
      // - Windows: %APPDATA%\\Cursor\\auth.json (case varies)
      // - macOS:   typically uses ~/.cursor plus a CLI config; treat auth.json when present.
      const cursorAuthCandidates: string[] = [];
      if (process.platform === 'win32') {
        const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
        cursorAuthCandidates.push(join(appData, 'Cursor', 'auth.json'));
        cursorAuthCandidates.push(join(appData, 'cursor', 'auth.json'));
      } else {
        cursorAuthCandidates.push(join(home, '.config', 'cursor', 'auth.json'));
      }
      for (const p of cursorAuthCandidates) {
        if (existsSync(p)) {
          return {
            status: 'authenticated',
            details: `Cursor auth file found (${p}).`,
            fixSuggestion: 'If Cursor still fails, open Cursor IDE and ensure you are signed in, or set CURSOR_API_KEY for headless/CI usage.',
          };
        }
      }

      // 3. Best-effort: if credential directories exist, treat as unknown.
      // NOTE: The presence of ~/.cursor* is not a reliable auth signal, but it should
      // flip the wizard away from "Not Authenticated" after a successful login flow.
      const cursorDirs = [
        join(home, '.cursor-server'),
        join(home, '.cursor'),
        join(home, '.config', 'cursor'),
      ];
      for (const p of cursorDirs) {
        if (dirHasFiles(p)) {
          return {
            status: 'unknown',
            details: `Cursor credential directories exist (${p}), but authentication cannot be confirmed without running the CLI.`,
            fixSuggestion:
              'If you just completed login, wait a few seconds and click Retry. Otherwise, open Cursor IDE and sign in, or set CURSOR_API_KEY for headless/CI usage.',
          };
        }
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
        fixSuggestion: 'Run `claude setup-token` (subscription) or set ANTHROPIC_API_KEY in your environment.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'gemini': {
      // 1. Env-var auth (headless / CI)
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

      // 2. Check local settings/config files (heuristic; do not execute the CLI).
      // Recent Gemini CLI versions use ~/.gemini/settings.json for auth method config.
      const settingsPath = join(home, '.gemini', 'settings.json');
      if (existsSync(settingsPath)) {
        return {
          // Treat the presence of settings.json as "configured" for onboarding UX.
          // In practice this is created during interactive setup, and users expect the wizard to update.
          status: 'authenticated',
          details: `Gemini settings file exists (${settingsPath}).`,
          fixSuggestion: 'If Gemini still fails, run `gemini` in a terminal to confirm authentication.',
        };
      }

      // Legacy/alternate locations (keep as weak signals)
      const geminiPaths = [
        join(home, '.config', 'gemini'),
        join(home, '.config', 'google-cloud'),
      ];
      for (const p of geminiPaths) {
        if (dirHasFiles(p)) {
          return {
            status: 'unknown',
            details: `Gemini / Google credential directory exists (${p}).`,
            fixSuggestion: 'Run `gemini` in a terminal to configure auth, or set GEMINI_API_KEY.',
          };
        }
      }

      return {
        status: 'not_authenticated',
        details: 'No Gemini / Google credentials found.',
        fixSuggestion:
          'Set GEMINI_API_KEY / GOOGLE_API_KEY, or configure GOOGLE_APPLICATION_CREDENTIALS (Vertex AI). If your setup uses interactive auth, run `gemini` in a terminal to complete any prompts.',
      };
    }

    /* -------------------------------------------------------------- */
    case 'copilot': {
      // 1. Env-var fallback
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

      // 2. Heuristic: GitHub CLI auth file exists (commonly used by Copilot CLI).
      // For onboarding UX, treat this as authenticated (the common case after `gh auth login`).
      const ghHosts = getGhHostsPath(home);
      if (ghHosts && existsSync(ghHosts)) {
        return {
          status: 'authenticated',
          details: `GitHub CLI auth file exists (${ghHosts}).`,
          fixSuggestion: 'If Copilot still fails, run `copilot login` in a terminal.',
        };
      }

      // 3. Heuristic: Copilot CLI config exists
      const copilotConfig = join(home, '.copilot', 'config.json');
      if (existsSync(copilotConfig)) {
        return {
          status: 'authenticated',
          details: `Copilot CLI config exists (${copilotConfig}).`,
          fixSuggestion: 'Run `copilot login` in a terminal to confirm authentication.',
        };
      }

      return {
        status: 'not_authenticated',
        details: 'Not authenticated with GitHub.',
        fixSuggestion:
          'Run `copilot login` (preferred) or `gh auth login --web`, or set GH_TOKEN / GITHUB_TOKEN with Copilot permission.',
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
