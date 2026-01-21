/**
 * Platform command constants
 *
 * Single source of truth for platform CLI command naming.
 *
 * Why this exists:
 * - The codebase historically referenced multiple Cursor command names
 *   (`cursor-agent`, `cursor`, `agent`) across runner/discovery/doctor paths.
 * - P0-T15 requires these to be consistent and centrally defined.
 *
 * Notes:
 * - `cliPaths` (from config) can override these defaults.
 * - Some platforms may have multiple acceptable command names in the wild
 *   (e.g. Cursor: `cursor-agent`, `cursor`, `agent`). Use candidates where
 *   discovery/doctor checks need fallbacks.
 */

import type { CliPathsConfig, Platform } from '../types/config.js';

/**
 * Default CLI command names for each platform.
 *
 * IMPORTANT: Keep these aligned with repository fixtures and docs.
 * `REQUIREMENTS.md` currently documents Cursor as `cursor-agent`.
 */
export const PLATFORM_COMMANDS: Readonly<Record<Platform, string>> = {
  cursor: process.platform === 'win32' ? 'cursor-agent.exe' : 'cursor-agent',
  codex: process.platform === 'win32' ? 'codex.exe' : 'codex',
  claude: process.platform === 'win32' ? 'claude.exe' : 'claude',
  gemini: process.platform === 'win32' ? 'gemini.exe' : 'gemini',
  copilot: process.platform === 'win32' ? 'copilot.exe' : 'copilot',
  antigravity: process.platform === 'win32' ? 'agy.exe' : 'agy',
} as const;

/**
 * Resolve the executable command for a platform.
 *
 * @param platform - Platform identifier
 * @param cliPaths - Optional configured overrides (from config)
 */
export function resolvePlatformCommand(
  platform: Platform,
  cliPaths?: Partial<CliPathsConfig> | null
): string {
  const override = cliPaths?.[platform];
  if (override && typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }
  return PLATFORM_COMMANDS[platform];
}

/**
 * Cursor CLI command candidates in preference order.
 *
 * Cursor CLI naming has been inconsistent historically. Use this list when you
 * need to probe availability with fallbacks (doctor, capability discovery).
 */
export function getCursorCommandCandidates(
  cliPaths?: Partial<CliPathsConfig> | null
): string[] {
  const candidates = [
    cliPaths?.cursor,
    PLATFORM_COMMANDS.cursor,
    // Alternate Cursor command names seen in the wild / docs
    process.platform === 'win32' ? 'cursor.exe' : 'cursor',
    'cursor-agent',
    'agent',
  ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

  return Array.from(new Set(candidates));
}

