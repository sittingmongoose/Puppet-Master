/**
 * CLI Tools Checks for RWM Puppet Master Doctor System
 * 
 * Checks for availability of cursor, codex, and claude CLI tools.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T02 (CLI Tools Check).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { CheckResult, DoctorCheck } from '../check-registry.js';
import type { CliPathsConfig } from '../../types/config.js';
import { getPlatformAuthStatus } from '../../platforms/auth-status.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from '../../platforms/constants.js';

/**
 * Result of checking CLI availability
 */
interface CliAvailabilityResult {
  /** Whether the CLI is available */
  available: boolean;
  /** Version string if available */
  version?: string;
  /** Error message if unavailable */
  error?: string;
}

interface CliInvocation {
  command: string;
  argsPrefix?: string[];
}

function formatInvocation(invocation: CliInvocation): string {
  const prefix = invocation.argsPrefix?.length ? ` ${invocation.argsPrefix.join(' ')}` : '';
  return `${invocation.command}${prefix}`;
}

/**
 * Checks if a CLI command is available and can run a version flag.
 * 
 * @param command - Command to check (e.g., 'cursor-agent', 'codex')
 * @param versionFlag - Flag to use for version check (e.g., '--version')
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise resolving to availability result
 */
async function checkCliAvailable(
  invocation: CliInvocation,
  args: string[] = ['--version'],
  timeout: number = 10000
): Promise<CliAvailabilityResult> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn(invocation.command, [...(invocation.argsPrefix ?? []), ...args], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({
        available: false,
        error: `Command timed out after ${timeout}ms`,
      });
    }, timeout);

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        // Extract version from first line of output
        const version = stdout.trim().split('\n')[0].trim();
        resolve({
          available: true,
          version: version || 'unknown',
        });
      } else {
        resolve({
          available: false,
          error: `Command exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
        });
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        available: false,
        error: error.message,
      });
    });
  });
}

/**
 * Check for Cursor Agent CLI availability
 */
export class CursorCliCheck implements DoctorCheck {
  readonly name = 'cursor-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Cursor Agent CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const candidates: CliInvocation[] = getCursorCommandCandidates(this.cliPaths).map((c) => ({
      command: c,
    }));

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      // Also verify --help works for functionality check
      const helpResult = await checkCliAvailable(selected, ['--help'], 5000);
      const auth = getPlatformAuthStatus('cursor');

      // Help check failure doesn't fail the check, but we note it
      if (!helpResult.available) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: `Cursor CLI is installed; version works but --help failed (auth check skipped)`,
          details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}. Help check: ${helpResult.error}. ${auth.details ?? ''}`.trim(),
          fixSuggestion: undefined,
          durationMs: 0, // Will be set by CheckRegistry
        };
      }

      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Cursor CLI is installed and runnable (auth check skipped)`,
        details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}. ${auth.details ?? ''}`.trim(),
        fixSuggestion: undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Cursor CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: 'Install with: curl https://cursor.com/install -fsSL | bash',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Codex CLI availability
 */
export class CodexCliCheck implements DoctorCheck {
  readonly name = 'codex-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Codex CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('codex');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('codex', this.cliPaths);
    if (this.cliPaths?.codex && this.cliPaths.codex.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      // Avoid network installs: only works if codex is already available locally.
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', 'codex'] });
    }

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version'], 15_000);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Codex CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Codex CLI is installed and runnable but not authenticated`
            : `Codex CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${auth.details ? ` ${auth.details}` : ''}`.trim(),
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Codex CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion:
          'Install with: npm install -g @openai/codex (or ensure a local install exists for npx --no-install codex)',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Claude CLI availability
 */
export class ClaudeCliCheck implements DoctorCheck {
  readonly name = 'claude-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Claude CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('claude');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('claude', this.cliPaths);
    candidates.push({ command: configured });

    const localClaudePath = join(homedir(), '.claude', 'local', 'claude');
    try {
      await access(localClaudePath);
      candidates.push({ command: localClaudePath });
    } catch {
      // ignore
    }

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Claude CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Claude CLI is installed and runnable but not authenticated`
            : `Claude CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${auth.details ? ` ${auth.details}` : ''}`.trim(),
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Claude CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: 'Install with: curl -fsSL https://claude.ai/install.sh | bash\n  OR: npm install -g @anthropic-ai/claude-code',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Gemini CLI availability
 */
export class GeminiCliCheck implements DoctorCheck {
  readonly name = 'gemini-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Gemini CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('gemini');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('gemini', this.cliPaths);
    candidates.push({ command: configured });

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Gemini CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Gemini CLI is installed and runnable but not authenticated`
            : `Gemini CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${auth.details ? ` ${auth.details}` : ''}`.trim(),
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Gemini CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: 'Install with: npm install -g @google/gemini-cli',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for GitHub Copilot CLI availability
 */
export class CopilotCliCheck implements DoctorCheck {
  readonly name = 'copilot-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if GitHub Copilot CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('copilot');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('copilot', this.cliPaths);
    candidates.push({ command: configured });

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Copilot CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Copilot CLI is installed and runnable but not authenticated`
            : `Copilot CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${auth.details ? ` ${auth.details}` : ''}`.trim(),
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Copilot CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        // P0-G19: Updated to correct install command
        fixSuggestion: 'Install with: npm install -g @github/copilot',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for GitHub Copilot SDK availability
 *
 * Uses the official Copilot SDK to check:
 * - SDK package installed
 * - CLI available (SDK communicates with CLI via JSON-RPC)
 * - Authentication status
 * - Available models
 *
 * This replaces CLI-only checks with richer SDK-based validation.
 */
export class CopilotSdkCheck implements DoctorCheck {
  readonly name = 'copilot-sdk';
  readonly category = 'cli' as const;
  readonly description = 'Check if GitHub Copilot SDK is available and authenticated';

  async run(): Promise<CheckResult> {
    try {
      // Dynamic import to avoid errors if SDK not installed
      const { CopilotClient } = await import('@github/copilot-sdk');

      const client = new CopilotClient();
      await client.start();

      const [status, authStatus, models] = await Promise.all([
        client.getStatus(),
        client.getAuthStatus(),
        client.listModels().catch(() => [] as string[]),
      ]);

      await client.stop();

      const authenticated = authStatus.authenticated;
      const modelCount = models.length;

      return {
        name: this.name,
        category: this.category,
        passed: authenticated,
        message: authenticated
          ? `Copilot SDK is working and authenticated`
          : `Copilot SDK is working but not authenticated`,
        details: `SDK: yes. CLI: v${status.cliVersion ?? status.version ?? 'unknown'}. Auth: ${authenticated ? authStatus.authType ?? 'authenticated' : 'not authenticated'}. Models available: ${modelCount}.`,
        fixSuggestion: authenticated ? undefined : 'Run `copilot /login` to authenticate',
        durationMs: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a module not found error
      if (errorMessage.includes('Cannot find module') || errorMessage.includes('ERR_MODULE_NOT_FOUND')) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: 'Copilot SDK not installed',
          details: `The @github/copilot-sdk package is not installed.`,
          fixSuggestion: 'Run: npm install @github/copilot-sdk',
          durationMs: 0,
        };
      }

      // Other errors (CLI not available, connection failed, etc.)
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'Copilot SDK initialization failed',
        details: errorMessage,
        fixSuggestion: 'Ensure Copilot CLI is installed and run: npm install @github/copilot-sdk',
        durationMs: 0,
      };
    }
  }
}

// NOTE: AntigravityCliCheck removed - GUI-only, not suitable for automation
// See plan: /root/.claude/plans/snoopy-wondering-mountain.md
