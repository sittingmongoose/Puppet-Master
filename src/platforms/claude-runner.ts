/**
 * Claude Platform Runner for RWM Puppet Master
 * 
 * Implements Claude-specific CLI invocation using claude CLI.
 * 
 * Per REQUIREMENTS.md Section 3.4.3 (Claude Integration) and
 * ARCHITECTURE.md Section 6.1.2 (Platform Runners).
 */

import { spawn, type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { ClaudeOutputParser } from './output-parsers/index.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';
import { PLATFORM_COMMANDS } from './constants.js';

/**
 * Claude-specific platform runner.
 * 
 * Extends BasePlatformRunner to provide Claude CLI integration.
 * Uses claude command with -p flag for non-interactive print mode.
 */
export class ClaudeRunner extends BasePlatformRunner {
  readonly platform: Platform = 'claude';
  private readonly command: string;
  private readonly outputParser: ClaudeOutputParser;

  /**
   * Creates a new ClaudeRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param command - Claude CLI command path (default: 'claude')
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = PLATFORM_COMMANDS.claude,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.command = command;
    this.outputParser = new ClaudeOutputParser();
  }

  /**
   * Gets the Claude CLI command.
   */
  protected getCommand(): string {
    return this.command;
  }

  /**
   * Spawns a claude process for execution.
   * 
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * Claude CLI uses -p flag to pass prompt as argument, but we also support stdin.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
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

    // Write prompt to stdin if provided and not already passed via -p flag
    // Claude supports both -p "prompt" and stdin, but -p is preferred for non-interactive mode
    // If prompt is not in args (via -p), write to stdin as fallback
    if (request.prompt && proc.stdin && !args.includes(request.prompt)) {
      proc.stdin.write(request.prompt, 'utf-8');
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for claude CLI.
   * 
   * Constructs arguments based on request:
   * - -p flag for non-interactive/print mode (with prompt as value)
   * - --model flag if model is specified
   * - --output-format json (optional, for structured output)
   * - --max-turns flag if maxTurns is specified
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // Non-interactive mode (print mode) with prompt
    // Claude uses -p "prompt" format where prompt is passed as argument to -p
    if (request.nonInteractive) {
      // IMPORTANT: OS command-line argument length limits (especially on Windows)
      // can be exceeded by large prompts. To avoid this, omit the prompt argument
      // when it's too large and rely on stdin (supported by Claude in -p mode).
      const prompt = request.prompt ?? '';
      const promptBytes = prompt ? Buffer.byteLength(prompt, 'utf8') : 0;
      const MAX_PROMPT_ARG_BYTES = 30_000;

      args.push('-p');

      if (prompt && promptBytes <= MAX_PROMPT_ARG_BYTES) {
        args.push(prompt);
      }
    }

    // Model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Max turns if specified
    if (request.maxTurns !== undefined) {
      args.push('--max-turns', String(request.maxTurns));
    }

    // Optional: structured output format (can help with parsing)
    // Note: This is optional - we can handle both JSON and plain text
    // Uncomment if structured output is desired:
    // args.push('--output-format', 'json');

    return args;
  }

  /**
   * Parses claude output to extract execution results.
   * 
   * Uses ClaudeOutputParser to detect completion signals:
   * - <ralph>COMPLETE</ralph> - Task completed successfully
   * - <ralph>GUTTER</ralph> - Agent stuck, cannot proceed
   * 
   * Also extracts:
   * - Session ID (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
   * - Token usage if present
   * - Handles plain text, JSON, and stream-json formats
   */
  protected parseOutput(output: string): ExecutionResult {
    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    // Determine success based on signals
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
