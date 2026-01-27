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
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Default CLI command names for each platform.
 *
 * IMPORTANT: Keep these aligned with repository fixtures and docs.
 * CU-P0-T01: Updated to prefer `agent` as primary Cursor CLI binary per
 * Cursor January 2026 updates. Installer provides both `agent` and `cursor-agent`.
 */
export const PLATFORM_COMMANDS: Readonly<Record<Platform, string>> = {
  cursor: process.platform === 'win32' ? 'agent.exe' : 'agent',
  codex: process.platform === 'win32' ? 'codex.exe' : 'codex',
  claude: process.platform === 'win32' ? 'claude.exe' : 'claude',
  gemini: process.platform === 'win32' ? 'gemini.exe' : 'gemini',
  copilot: process.platform === 'win32' ? 'copilot.exe' : 'copilot',
  // NOTE: antigravity removed - GUI-only, not suitable for automation
} as const;

/**
 * Known installation paths for Cursor CLI.
 * These are common paths where Cursor installs its CLI.
 * CU-P0-T01: Updated to check for `agent` first, then `cursor-agent` for compatibility.
 */
const CURSOR_KNOWN_PATHS: readonly string[] = [
  // Linux - user local installs (prefer agent, then cursor-agent)
  process.env.HOME ? join(process.env.HOME, '.local', 'bin', 'agent') : '',
  process.env.HOME ? join(process.env.HOME, '.local', 'bin', 'cursor-agent') : '',
  process.env.HOME ? join(process.env.HOME, 'bin', 'agent') : '',
  process.env.HOME ? join(process.env.HOME, 'bin', 'cursor-agent') : '',
  // Linux - npm global installs
  '/usr/local/bin/agent',
  '/usr/local/bin/cursor-agent',
  '/usr/bin/agent',
  '/usr/bin/cursor-agent',
  // macOS - Homebrew and common paths
  '/opt/homebrew/bin/agent',
  '/opt/homebrew/bin/cursor-agent',
  '/usr/local/bin/agent',
  '/usr/local/bin/cursor-agent',
  // macOS - Cursor app bundle
  '/Applications/Cursor.app/Contents/Resources/app/bin/agent',
  '/Applications/Cursor.app/Contents/Resources/app/bin/cursor-agent',
  // Linux - Cursor app image
  process.env.HOME ? join(process.env.HOME, '.local', 'share', 'cursor', 'agent') : '',
  process.env.HOME ? join(process.env.HOME, '.local', 'share', 'cursor', 'cursor-agent') : '',
  // Windows paths (when running from WSL)
  '/mnt/c/Users/*/AppData/Local/Programs/cursor/resources/app/bin/agent',
  '/mnt/c/Users/*/AppData/Local/Programs/cursor/resources/app/bin/cursor-agent',
].filter(p => p.length > 0) as readonly string[];

/**
 * Known installation paths for Cursor CLI on Windows.
 * CU-P0-T01: Updated to check for `agent.exe` first, then `cursor-agent.exe` for compatibility.
 */
const CURSOR_KNOWN_PATHS_WIN32: readonly string[] = [
  // Windows - User install (most common) - prefer agent, then cursor-agent
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'cursor', 'resources', 'app', 'bin', 'agent.exe') : '',
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'cursor', 'resources', 'app', 'bin', 'cursor-agent.exe') : '',
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'Cursor', 'resources', 'app', 'bin', 'agent.exe') : '',
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'Cursor', 'resources', 'app', 'bin', 'cursor-agent.exe') : '',
  // Windows - npm global
  process.env.APPDATA ? join(process.env.APPDATA, 'npm', 'agent.exe') : '',
  process.env.APPDATA ? join(process.env.APPDATA, 'npm', 'cursor-agent.exe') : '',
  // Windows - Program Files
  'C:\\Program Files\\Cursor\\resources\\app\\bin\\agent.exe',
  'C:\\Program Files\\Cursor\\resources\\app\\bin\\cursor-agent.exe',
  'C:\\Program Files (x86)\\Cursor\\resources\\app\\bin\\agent.exe',
  'C:\\Program Files (x86)\\Cursor\\resources\\app\\bin\\cursor-agent.exe',
].filter(p => p.length > 0) as readonly string[];

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
 * CU-P0-T01: Updated preference order per Cursor January 2026 updates:
 * 1. Prefer `agent` (primary binary per docs)
 * 2. Then `cursor-agent` (backward compatibility)
 * 3. Then `cursor` (if verified to behave like agent CLI)
 *
 * Use this list when you need to probe availability with fallbacks
 * (doctor, capability discovery).
 */
export function getCursorCommandCandidates(
  cliPaths?: Partial<CliPathsConfig> | null
): string[] {
  const candidates: string[] = [];
  
  // 1. User-configured override (highest priority)
  if (cliPaths?.cursor) {
    candidates.push(cliPaths.cursor);
  }
  
  // 2. Default command name (expects PATH) - now 'agent' per CU-P0-T01
  candidates.push(PLATFORM_COMMANDS.cursor);
  
  // 3. Alternate command names (for PATH) - prefer agent, then cursor-agent, then cursor
  if (process.platform === 'win32') {
    candidates.push('agent.exe', 'cursor-agent.exe', 'cursor.exe');
  } else {
    candidates.push('agent', 'cursor-agent', 'cursor');
  }
  
  // 4. Known installation paths (for when not in PATH)
  const knownPaths = process.platform === 'win32' 
    ? CURSOR_KNOWN_PATHS_WIN32 
    : CURSOR_KNOWN_PATHS;
  
  for (const path of knownPaths) {
    // Only add if the file actually exists (avoid probing non-existent paths)
    try {
      if (existsSync(path)) {
        candidates.push(path);
      }
    } catch {
      // Ignore errors (permission denied, etc.)
    }
  }
  
  // Deduplicate while preserving order
  return Array.from(new Set(candidates.filter(v => v.trim().length > 0)));
}
