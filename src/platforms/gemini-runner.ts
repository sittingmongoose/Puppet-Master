/**
 * Gemini CLI Platform Runner
 *
 * Executes prompts via Google Gemini CLI in headless mode.
 * Uses fresh process per iteration with JSON output parsing.
 *
 * API Contract:
 * - Binary: gemini (configurable via cliPaths.gemini)
 * - Headless Mode: -p "..." --output-format json --approval-mode yolo
 * - Output Format: JSON with { response, stats, error? }
 * - Signal Detection: <ralph>COMPLETE</ralph> / <ralph>GUTTER</ralph> in response
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

interface GeminiJsonOutput {
  response?: string;
  stats?: Record<string, unknown>;
  error?: string;
}

export class GeminiRunner extends BasePlatformRunner {
  readonly platform: Platform = 'gemini';
  private readonly command: string;

  /**
   * Creates a new GeminiRunner instance.
   *
   * @param capabilityService - Capability discovery service (required)
   * @param command - Gemini CLI command path (default: 'gemini')
   * @param defaultTimeout - Default timeout in milliseconds (default: 600000 = 10 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 900000 = 15 minutes)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = 'gemini',
    defaultTimeout: number = 600_000, // 10 minutes for Gemini (longer prompts)
    hardTimeout: number = 900_000 // 15 minutes hard timeout
  ) {
    super(capabilityService, defaultTimeout, hardTimeout);
    this.command = command;
  }

  /**
   * Spawns a Gemini CLI process for execution.
   *
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * Gemini CLI uses -p flag to pass prompt as argument.
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
   * Builds command-line arguments for Gemini CLI.
   *
   * Constructs arguments based on request:
   * - -p flag for non-interactive/prompt mode
   * - --output-format json for machine-readable output
   * - --approval-mode for automation level
   * - --model flag if model is specified
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

    // JSON output format
    args.push('--output-format', 'json');

    // Approval mode for automation (default to yolo for headless)
    // Note: ExecutionRequest doesn't have approvalMode; this is set to yolo for headless execution
    args.push('--approval-mode', 'yolo');

    // Model selection
    if (request.model && request.model !== 'auto') {
      args.push('--model', request.model);
    }

    return args;
  }

  /**
   * Parses Gemini CLI JSON output to extract execution results.
   *
   * Detects completion signals:
   * - <ralph>COMPLETE</ralph> - Task completed successfully
   * - <ralph>GUTTER</ralph> - Agent stuck, cannot proceed
   */
  protected parseOutput(output: string): ExecutionResult {
    let jsonOutput: GeminiJsonOutput;
    let success = true;
    let responseText = '';
    let error: string | undefined;

    try {
      jsonOutput = JSON.parse(output) as GeminiJsonOutput;
      responseText = jsonOutput.response || '';
      if (jsonOutput.error) {
        success = false;
        error = jsonOutput.error;
      }
    } catch (parseError) {
      success = false;
      responseText = output;
      error = `Failed to parse Gemini JSON output: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
    }

    // Detect ralph signals
    const hasComplete = responseText.includes('<ralph>COMPLETE</ralph>');
    const hasGutter = responseText.includes('<ralph>GUTTER</ralph>');

    if (hasGutter) {
      success = false;
      error = error || 'Agent signaled GUTTER - stuck and cannot proceed';
    }

    const result: ExecutionResult = {
      success: success && !hasGutter,
      output: responseText,
      exitCode: 0, // Will be set by execute() method
      duration: 0, // Will be set by execute() method
      processId: 0, // Will be set by execute() method
    };

    if (error) {
      result.error = error;
    }

    return result;
  }

}

export function createGeminiRunner(
  capabilityService: CapabilityDiscoveryService,
  command?: string
): GeminiRunner {
  return new GeminiRunner(capabilityService, command);
}
