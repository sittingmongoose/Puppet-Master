/**
 * Cursor Platform Runner for RWM Puppet Master
 * 
 * Implements Cursor-specific CLI invocation using cursor-agent.
 * 
 * Per REQUIREMENTS.md Section 3.4.4 (Cursor Integration) and
 * ARCHITECTURE.md Section 6.1.2 (Platform Runners).
 */

import { spawn, type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { PLATFORM_COMMANDS } from './constants.js';
import { CursorOutputParser } from './output-parsers/index.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';

/**
 * Cursor-specific platform runner.
 * 
 * Extends BasePlatformRunner to provide Cursor CLI integration.
 * Uses cursor-agent command with -p flag for non-interactive mode.
 */
export class CursorRunner extends BasePlatformRunner {
  readonly platform: Platform = 'cursor';
  private readonly command: string;
  private modeFlagSupport: boolean | null = null;
  private modeFlagSupportPromise: Promise<boolean> | null = null;
  private readonly outputParser: CursorOutputParser;

  /**
   * Creates a new CursorRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param command - Cursor CLI command path (default: 'cursor-agent')
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = PLATFORM_COMMANDS.cursor,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.command = command;
    this.outputParser = new CursorOutputParser();
  }

  /**
   * Gets the Cursor CLI command.
   */
  protected getCommand(): string {
    return this.command;
  }

  /**
   * Cursor writes the prompt to stdin, not as an argument.
   */
  protected writesPromptToStdin(): boolean {
    return true;
  }

  /**
   * Get custom environment variables for Cursor.
   */
  protected getCustomEnv(_request: ExecutionRequest): Record<string, string> {
    return {
      CURSOR_NON_INTERACTIVE: '1',
    };
  }

  /**
   * Spawns a cursor-agent process for execution.
   * 
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
   */
  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    if (request.planMode === true && this.modeFlagSupport === null) {
      await this.ensureModeFlagSupport();
    }

    const args = this.buildArgs(request);

    const proc = spawn(this.command, args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Ensure non-interactive mode
        CURSOR_NON_INTERACTIVE: '1',
      },
    });

    // Write prompt to stdin if provided
    if (request.prompt && proc.stdin) {
      proc.stdin.write(this.buildPrompt(request));
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for cursor-agent.
   * 
   * Constructs arguments based on request:
   * - -p flag for non-interactive/print mode
   * - --model flag if model is specified
   * - Prompt is written to stdin, not passed as argument
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // Non-interactive mode (print mode)
    if (request.nonInteractive) {
      args.push('-p');
    }

    // Cursor plan mode (best-effort; requires CLI support)
    if (request.planMode === true && this.modeFlagSupport === true) {
      args.push('--mode=plan');
    }

    // Model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Note: Prompt is written to stdin, not passed as argument
    // This matches the pattern from REQUIREMENTS.md Section 3.4.4

    return args;
  }

  private buildPrompt(request: ExecutionRequest): string {
    if (request.planMode === true && this.modeFlagSupport === false) {
      // Safe fallback when plan-mode CLI flag is unavailable:
      // instruct the agent to plan first, then immediately execute.
      const preamble = [
        'PLAN FIRST (briefly), THEN EXECUTE:',
        '- Start with a concise plan (max 10 bullets).',
        '- Then immediately carry out the plan and make the required changes.',
        '- Run the required tests/commands and report results.',
        '',
      ].join('\n');
      return `${preamble}${request.prompt}`;
    }

    return request.prompt;
  }

  private async ensureModeFlagSupport(): Promise<boolean> {
    if (this.modeFlagSupport !== null) {
      return this.modeFlagSupport;
    }
    if (this.modeFlagSupportPromise) {
      return this.modeFlagSupportPromise;
    }

    this.modeFlagSupportPromise = this.probeModeFlagSupport()
      .catch(() => false)
      .then((supported) => {
        this.modeFlagSupport = supported;
        return supported;
      })
      .finally(() => {
        this.modeFlagSupportPromise = null;
      });

    return this.modeFlagSupportPromise;
  }

  private async probeModeFlagSupport(): Promise<boolean> {
    const helpOutput = await this.getHelpOutput(5000);
    const lower = helpOutput.toLowerCase();
    // Best-effort detection: if help mentions --mode and plan, assume `--mode=plan` is supported.
    return lower.includes('--mode') && lower.includes('plan');
  }

  private async getHelpOutput(timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.command, ['--help'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch {
          // ignore
        }
        reject(new Error(`Cursor CLI --help timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      proc.stdout?.on('data', (chunk: Buffer | string) => {
        stdout += typeof chunk === 'string' ? chunk : chunk.toString();
      });
      proc.stderr?.on('data', (chunk: Buffer | string) => {
        stderr += typeof chunk === 'string' ? chunk : chunk.toString();
      });

      proc.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout || stderr);
        } else {
          reject(new Error(`Cursor CLI --help failed with code ${code}: ${stderr || stdout}`));
        }
      });
    });
  }

  /**
   * Parses cursor-agent output to extract execution results.
   * 
   * Uses CursorOutputParser to detect completion signals:
   * - <ralph>COMPLETE</ralph> - Task completed successfully
   * - <ralph>GUTTER</ralph> - Agent stuck, cannot proceed
   * 
   * Also extracts:
   * - Files changed (if detectable from output)
   * - Test results (if detectable from output)
   * - Session ID (if present)
   */
  protected parseOutput(output: string): ExecutionResult {
    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    // Determine success based on completion signal
    const success = parsed.completionSignal !== 'GUTTER';

    // Build result
    const result: ExecutionResult = {
      success,
      output,
      exitCode: 0, // Will be set by execute() method
      duration: 0, // Will be set by execute() method
      processId: 0, // Will be set by execute() method
    };

    // Add optional fields if found
    if (parsed.sessionId) {
      result.sessionId = parsed.sessionId;
    }
    if (parsed.tokensUsed !== undefined) {
      result.tokensUsed = parsed.tokensUsed;
    }

    // If GUTTER signal found, add error message
    if (parsed.completionSignal === 'GUTTER') {
      result.error = 'Agent signaled GUTTER - stuck and cannot proceed';
    }

    return result;
  }
}
