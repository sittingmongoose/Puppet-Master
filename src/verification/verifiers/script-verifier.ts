/**
 * Script Verifier
 *
 * Executes verification scripts and interprets their output.
 *
 * P2-T04: Executable Acceptance Criteria
 * - Scripts should be human-editable
 * - ScriptVerifier executes scripts and records evidence
 *
 * Pass condition (per task spec):
 * - exit code === 0
 * - stdout includes 'PASS'
 */

import { spawn } from 'node:child_process';
import type { Criterion, VerifierResult } from '../../types/tiers.js';
import type { EvidenceStore } from '../../memory/evidence-store.js';
import type { Verifier } from './verifier.js';

/**
 * Script criterion options.
 */
export interface ScriptCriterionOptions extends Record<string, unknown> {
  /** Script arguments */
  args?: string[];
  /** Working directory for script execution */
  cwd?: string;
  /** Environment variables to set */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Expected exit code (default: 0) */
  expectedExitCode?: number;
  /** If true, require 'PASS' token in stdout (default: true) */
  requirePassToken?: boolean;
}

/**
 * Script criterion interface.
 */
export interface ScriptCriterion extends Criterion {
  type: 'script';
  target: string; // Script path
  options?: ScriptCriterionOptions;
}

interface ScriptResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export class ScriptVerifier implements Verifier {
  readonly type = 'script';

  constructor(private readonly evidenceStore: EvidenceStore) {}

  async verify(criterion: Criterion): Promise<VerifierResult> {
    const startTime = Date.now();
    const itemId = criterion.id || 'script-verification';

    if (criterion.type !== 'script') {
      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        summary: `Invalid criterion type: expected 'script', got '${criterion.type}'`,
        error: `Invalid criterion type: ${criterion.type}`,
        durationMs: Date.now() - startTime,
      };
    }

    const scriptCriterion = criterion as ScriptCriterion;

    if (!scriptCriterion.target || scriptCriterion.target.trim().length === 0) {
      return {
        type: this.type,
        target: scriptCriterion.target,
        passed: false,
        summary: 'Missing script path (criterion.target)',
        error: 'Missing script path (criterion.target)',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const result = await this.executeScript(scriptCriterion);

      const expectedExitCode = scriptCriterion.options?.expectedExitCode ?? 0;
      const requirePassToken = scriptCriterion.options?.requirePassToken ?? true;

      const exitCodeMatches = result.exitCode === expectedExitCode;
      const passTokenPresent = requirePassToken ? result.stdout.includes('PASS') : true;

      const passed = exitCodeMatches && passTokenPresent && !result.timedOut;

      const summaryParts: string[] = [];
      if (!exitCodeMatches) {
        summaryParts.push(`Exit code ${result.exitCode} (expected ${expectedExitCode})`);
      }
      if (!passTokenPresent) {
        summaryParts.push(`Missing PASS token in stdout`);
      }
      if (result.timedOut) {
        summaryParts.push('Script timed out');
      }
      if (passed) {
        summaryParts.push('Script verification passed');
      }

      const summary = summaryParts.join('; ') || 'Script executed successfully';

      const evidencePath = await this.saveEvidence(itemId, scriptCriterion, result);

      return {
        type: this.type,
        target: scriptCriterion.target,
        passed,
        evidencePath,
        summary,
        durationMs: Date.now() - startTime,
        error: passed ? undefined : summary,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const evidencePath = await this.evidenceStore.saveTestLog(
        itemId,
        `Script execution failed.\n\nScript: ${criterion.target}\nError: ${errorMessage}\n`,
        'script'
      );

      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        evidencePath,
        summary: `Script execution failed: ${errorMessage}`,
        error: errorMessage,
        durationMs: Date.now() - startTime,
      };
    }
  }

  private async executeScript(criterion: ScriptCriterion): Promise<ScriptResult> {
    const startTime = Date.now();
    const options = criterion.options ?? {};
    const timeout = options.timeout ?? 30_000;

    return new Promise<ScriptResult>((resolve, reject) => {
      const env = { ...process.env, ...options.env };

      const child = spawn(criterion.target, options.args ?? [], {
        cwd: options.cwd,
        env,
        shell: true, // rely on shebang for portability
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let timeoutId: NodeJS.Timeout | null = null;

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          timedOut = true;
          if (child.pid) {
            try {
              process.kill(-child.pid, 'SIGTERM');
            } catch {
              child.kill('SIGTERM');
            }
          }
        }, timeout);
      }

      if (child.stdout) {
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString('utf-8');
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString('utf-8');
        });
      }

      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          exitCode: code ?? -1,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          durationMs: Date.now() - startTime,
          timedOut,
        });
      });

      child.on('error', (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error(`Failed to spawn script "${criterion.target}": ${err.message}`));
      });
    });
  }

  private async saveEvidence(itemId: string, criterion: ScriptCriterion, result: ScriptResult): Promise<string> {
    const content = [
      `Script: ${criterion.target}`,
      `ExitCode: ${result.exitCode}`,
      `TimedOut: ${result.timedOut}`,
      '',
      '--- STDOUT ---',
      result.stdout || '(empty)',
      '',
      '--- STDERR ---',
      result.stderr || '(empty)',
      '',
    ].join('\n');

    return await this.evidenceStore.saveTestLog(itemId, content, 'script');
  }
}

