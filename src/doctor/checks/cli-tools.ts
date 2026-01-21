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
import { getCursorCommandCandidates } from '../../platforms/constants.js';

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

/**
 * Checks if a CLI command is available and can run a version flag.
 * 
 * @param command - Command to check (e.g., 'cursor-agent', 'codex')
 * @param versionFlag - Flag to use for version check (e.g., '--version')
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise resolving to availability result
 */
async function checkCliAvailable(
  command: string,
  versionFlag: string = '--version',
  timeout: number = 10000
): Promise<CliAvailabilityResult> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn(command, [versionFlag], {
      shell: true,
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

  async run(): Promise<CheckResult> {
    const candidates = getCursorCommandCandidates(null);

    let selectedCommand: string | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, '--version');
      if (res.available) {
        selectedCommand = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selectedCommand && versionResult?.available) {
      // Also verify --help works for functionality check
      const helpResult = await checkCliAvailable(selectedCommand, '--help', 5000);

      // Help check failure doesn't fail the check, but we note it
      if (!helpResult.available) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: `Cursor CLI found but --help check failed`,
          details: `Command: ${selectedCommand}. Version: ${versionResult.version || 'unknown'}. Help check: ${helpResult.error}`,
          fixSuggestion: undefined,
          durationMs: 0, // Will be set by CheckRegistry
        };
      }

      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Cursor CLI is available`,
        details: `Command: ${selectedCommand}. Version: ${versionResult.version || 'unknown'}`,
        fixSuggestion: undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Cursor CLI not found (checked: ${candidates.join(', ')})`,
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

  async run(): Promise<CheckResult> {
    // Try codex first
    let result = await checkCliAvailable('codex', '--version');
    
    // Fallback to npx codex if codex not found
    if (!result.available) {
      // Check if npx is available first
      const npxCheck = await checkCliAvailable('npx', '--version');
      if (npxCheck.available) {
        // Try running npx codex --version
        // Note: We need to use shell command for npx with package name
        const npxCodexResult = await new Promise<CliAvailabilityResult>((resolve) => {
          const proc: ChildProcess = spawn('npx', ['codex', '--version'], {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
          });

          let stdout = '';
          let stderr = '';

          const timer = setTimeout(() => {
            proc.kill('SIGKILL');
            resolve({
              available: false,
              error: 'Command timed out',
            });
          }, 15000); // Longer timeout for npx

          proc.stdout?.on('data', (data: Buffer) => {
            stdout += data.toString();
          });

          proc.stderr?.on('data', (data: Buffer) => {
            stderr += data.toString();
          });

          proc.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
              const version = stdout.trim().split('\n')[0].trim();
              resolve({
                available: true,
                version: version || 'via npx',
              });
            } else {
              resolve({
                available: false,
                error: `npx codex exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
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

        if (npxCodexResult.available) {
          result = npxCodexResult;
        }
      }
    }

    if (result.available) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Codex CLI is available`,
        details: `Version: ${result.version || 'unknown'}`,
        fixSuggestion: undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Codex CLI not found (checked: codex, npx codex)`,
        details: result.error,
        fixSuggestion: 'Install with: npm install -g @openai/codex',
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

  async run(): Promise<CheckResult> {
    // Try claude first
    let result = await checkCliAvailable('claude', '--version');
    
    // Fallback to ~/.claude/local/claude if claude not found
    if (!result.available) {
      const localClaudePath = join(homedir(), '.claude', 'local', 'claude');
      try {
        await access(localClaudePath);
        // File exists, try running it
        result = await checkCliAvailable(localClaudePath, '--version');
      } catch {
        // File doesn't exist or not accessible, keep original result
      }
    }

    if (result.available) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Claude CLI is available`,
        details: `Version: ${result.version || 'unknown'}`,
        fixSuggestion: undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Claude CLI not found (checked: claude, ~/.claude/local/claude)`,
        details: result.error,
        fixSuggestion: 'Install with: curl -fsSL https://claude.ai/install.sh | bash\n  OR: npm install -g @anthropic-ai/claude-code',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}
