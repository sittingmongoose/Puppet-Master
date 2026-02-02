/**
 * Command Verifier
 * 
 * Executes shell commands and verifies their exit codes and output patterns.
 * 
 * See REQUIREMENTS.md Section 25.2 (Verifier Taxonomy) and
 * BUILD_QUEUE_PHASE_4.md PH4-T03 for implementation details.
 */

import { spawn } from 'node:child_process';
import type { Criterion, VerifierResult } from '../../types/tiers.js';
import type { EvidenceStore } from '../../memory/evidence-store.js';

/**
 * Command criterion options.
 * Extends the base Criterion with command-specific options.
 */
export interface CommandCriterionOptions extends Record<string, unknown> {
  /** Command arguments */
  args?: string[];
  /** Working directory for command execution */
  cwd?: string;
  /** Environment variables to set */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Expected exit code (default: 0) */
  expectedExitCode?: number;
  /** Regex pattern to match in stdout */
  outputPattern?: string;
  /** Regex pattern to match in stderr */
  errorPattern?: string;
  /** String that must NOT appear in output */
  outputMustNotContain?: string;
}

/**
 * Command criterion interface.
 * Extends Criterion with command-specific configuration.
 */
export interface CommandCriterion extends Criterion {
  type: 'command';
  target: string;
  options?: CommandCriterionOptions;
}

/**
 * Internal command execution result.
 */
interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

/**
 * Command Verifier
 * 
 * Executes shell commands and verifies:
 * - Exit code matches expected value
 * - Output matches specified patterns
 * - Output does not contain forbidden text
 * - Command completes within timeout
 */
export class CommandVerifier {
  readonly type = 'command';

  constructor(private readonly evidenceStore: EvidenceStore) {}

  /**
   * Verifies a command criterion.
   * @param criterion - Command criterion to verify
   * @returns Verifier result
   */
  async verify(criterion: CommandCriterion): Promise<VerifierResult> {
    const startTime = Date.now();
    const itemId = criterion.id || 'command-verification';

    try {
      // Execute the command
      const result = await this.executeCommand(criterion);

      // Check exit code
      const expectedExitCode = criterion.options?.expectedExitCode ?? 0;
      const exitCodeMatches = result.exitCode === expectedExitCode;

      // Check output patterns
      const stdoutMatches = this.checkOutput(
        result.stdout,
        criterion.options?.outputPattern,
        criterion.options?.outputMustNotContain
      );

      // Check stderr pattern if provided
      const stderrMatches = criterion.options?.errorPattern
        ? new RegExp(criterion.options.errorPattern).test(result.stderr)
        : true;

      // Determine if verification passed
      const passed = exitCodeMatches && stdoutMatches && stderrMatches && !result.timedOut;

      // Build summary
      const summaryParts: string[] = [];
      if (!exitCodeMatches) {
        summaryParts.push(`Exit code ${result.exitCode} (expected ${expectedExitCode})`);
      }
      if (!stdoutMatches) {
        summaryParts.push('Output pattern check failed');
      }
      if (!stderrMatches) {
        summaryParts.push('Stderr pattern check failed');
      }
      if (result.timedOut) {
        summaryParts.push('Command timed out');
      }
      if (passed) {
        summaryParts.push('Command verification passed');
      }

      const summary = summaryParts.join('; ') || 'Command executed successfully';

      // Save evidence
      const evidencePath = await this.saveEvidence(itemId, result, criterion);

      const durationMs = Date.now() - startTime;

      return {
        type: this.type,
        target: criterion.target,
        passed,
        evidencePath,
        summary,
        durationMs,
        error: passed ? undefined : summary,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        summary: `Command execution failed: ${errorMessage}`,
        error: errorMessage,
        durationMs,
      };
    }
  }

  /**
   * Executes a command and captures output.
   * @param criterion - Command criterion
   * @returns Command execution result
   */
  private async executeCommand(criterion: CommandCriterion): Promise<CommandResult> {
    const startTime = Date.now();
    const options = criterion.options || {};
    const timeout = options.timeout ?? 30000; // Default 30 seconds

    return new Promise<CommandResult>((resolve, reject) => {
      // Prepare environment
      const env = {
        ...process.env,
        ...options.env,
      };

      // Spawn the process
      const child = spawn(criterion.target, options.args || [], {
        cwd: options.cwd,
        env,
        shell: true, // Use shell for cross-platform compatibility
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let timeoutId: NodeJS.Timeout | null = null;

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          timedOut = true;
          // Kill the process and its children
          if (child.pid) {
            try {
              // On Unix, kill the process group
              process.kill(-child.pid, 'SIGTERM');
            } catch {
              // Fallback to regular kill
              child.kill('SIGTERM');
            }
          }
        }, timeout);
      }

      // Capture stdout
      if (child.stdout) {
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString('utf-8');
        });
      }

      // Capture stderr
      if (child.stderr) {
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString('utf-8');
        });
      }

      // Handle process completion
      child.on('close', (code) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const durationMs = Date.now() - startTime;

        resolve({
          exitCode: code ?? -1,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          durationMs,
          timedOut,
        });
      });

      // Handle spawn errors
      child.on('error', (error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        reject(
          new Error(
            `Failed to spawn command "${criterion.target}": ${error.message}`
          )
        );
      });
    });
  }

  /**
   * Checks if output matches pattern and does not contain forbidden text.
   * @param output - Output to check
   * @param pattern - Optional regex pattern to match
   * @param mustNotContain - Optional string that must not appear
   * @returns True if checks pass
   */
  private checkOutput(
    output: string,
    pattern?: string,
    mustNotContain?: string
  ): boolean {
    // Check positive pattern
    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(output)) {
          return false;
        }
      } catch (error) {
        // Invalid regex pattern - treat as failure
        return false;
      }
    }

    // Check negative pattern (must not contain)
    if (mustNotContain && output.includes(mustNotContain)) {
      return false;
    }

    return true;
  }

  /**
   * Saves command execution evidence.
   * @param itemId - Item ID for evidence naming
   * @param result - Command execution result
   * @param criterion - Original criterion
   * @returns Path to saved evidence file
   */
  private async saveEvidence(
    itemId: string,
    result: CommandResult,
    criterion: CommandCriterion
  ): Promise<string> {
    const evidenceContent = [
      `Command: ${criterion.target}`,
      `Args: ${JSON.stringify(criterion.options?.args || [])}`,
      `Working Directory: ${criterion.options?.cwd || process.cwd()}`,
      `Exit Code: ${result.exitCode}`,
      `Timed Out: ${result.timedOut}`,
      `Duration: ${result.durationMs}ms`,
      '',
      '=== STDOUT ===',
      result.stdout || '(empty)',
      '',
      '=== STDERR ===',
      result.stderr || '(empty)',
    ].join('\n');

    const testName = `command-${Date.now()}`;
    return await this.evidenceStore.saveTestLog(itemId, evidenceContent, testName);
  }
}
