/**
 * GitHub Copilot CLI Platform Runner
 *
 * Executes prompts via GitHub Copilot CLI in programmatic mode.
 * Uses fresh process per iteration with text output parsing.
 *
 * API Contract:
 * - Binary: copilot (configurable via cliPaths.copilot)
 * - Headless Mode: -p "..." --allow-all-tools --allow-all-paths --silent --stream off
 * - Output Format: Text-based (no JSON)
 * - Signal Detection: <ralph>COMPLETE</ralph> / <ralph>GUTTER</ralph> in output
 * - Model Selection: /model command is interactive; treated as hint-only
 *
 * Per REQUIREMENTS.md Section 26.2 (Platform Runner Contract)
 */

import { spawn, type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';

export class CopilotRunner extends BasePlatformRunner {
  readonly platform: Platform = 'copilot';
  private readonly command: string;

  /**
   * Creates a new CopilotRunner instance.
   *
   * @param capabilityService - Capability discovery service (required)
   * @param command - Copilot CLI command path (default: 'copilot')
   * @param defaultTimeout - Default timeout in milliseconds (default: 600000 = 10 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 900000 = 15 minutes)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = 'copilot',
    defaultTimeout: number = 600_000, // 10 minutes for Copilot
    hardTimeout: number = 900_000 // 15 minutes hard timeout
  ) {
    super(capabilityService, defaultTimeout, hardTimeout);
    this.command = command;
  }

  /**
   * Spawns a Copilot CLI process for execution.
   *
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * Copilot CLI uses -p flag to pass prompt as argument.
   */
  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    const args = this.buildArgs(request);

    const proc = spawn(this.command, args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
      },
    });

    // Write prompt to stdin as fallback if not already passed via -p flag
    if (request.prompt && proc.stdin && !args.includes(request.prompt)) {
      proc.stdin.write(request.prompt, 'utf-8');
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for Copilot CLI.
   *
   * Constructs arguments based on request:
   * - -p flag for non-interactive/prompt mode
   * - --allow-all-tools to prevent interactive approval prompts
   * - --allow-all-paths to disable path verification
   * - --silent for scripting-friendly output
   * - --stream off to disable token streaming
   *
   * Note: Model selection is not directly supported via CLI flags.
   * The /model command is interactive, so we treat request.model as a hint only.
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // Non-interactive mode with prompt
    if (request.nonInteractive) {
      const prompt = request.prompt ?? '';
      const promptBytes = prompt ? Buffer.byteLength(prompt, 'utf8') : 0;
      const MAX_PROMPT_ARG_BYTES = 30_000;

      args.push('-p');

      if (prompt && promptBytes <= MAX_PROMPT_ARG_BYTES) {
        args.push(prompt);
      }
    }

    // Approval flags to prevent interactive prompts
    args.push('--allow-all-tools');
    args.push('--allow-all-paths');

    // Scripting-friendly output
    args.push('--silent');
    args.push('--stream', 'off');

    // Note: Model selection via --model is not documented.
    // Users should configure model inside Copilot or via config files.

    return args;
  }

  /**
   * Parses Copilot CLI text output to extract execution results.
   *
   * Detects completion signals:
   * - <ralph>COMPLETE</ralph> - Task completed successfully
   * - <ralph>GUTTER</ralph> - Agent stuck, cannot proceed
   */
  protected parseOutput(output: string): ExecutionResult {
    // Detect ralph signals in output
    const hasComplete = output.includes('<ralph>COMPLETE</ralph>');
    const hasGutter = output.includes('<ralph>GUTTER</ralph>');

    const result: ExecutionResult = {
      success: !hasGutter,
      output,
      exitCode: 0, // Will be set by execute() method
      duration: 0, // Will be set by execute() method
      processId: 0, // Will be set by execute() method
    };

    if (hasGutter) {
      result.error = 'Agent signaled GUTTER - stuck and cannot proceed';
    }

    return result;
  }
}

export function createCopilotRunner(
  capabilityService: CapabilityDiscoveryService,
  command?: string
): CopilotRunner {
  return new CopilotRunner(capabilityService, command);
}
