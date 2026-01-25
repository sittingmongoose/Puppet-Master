/**
 * Codex Platform Runner for RWM Puppet Master
 * 
 * Implements Codex CLI invocation via BasePlatformRunner.
 * 
 * Per REQUIREMENTS.md Section 3.4.2 (Codex Integration) and
 * ARCHITECTURE.md Section 6.1.2 (Platform Runners).
 */

import { spawn, type ChildProcess } from 'child_process';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CodexOutputParser } from './output-parsers/index.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';
import { PLATFORM_COMMANDS } from './constants.js';

/**
 * Codex platform runner.
 * 
 * Handles Codex CLI invocation with proper argument construction
 * and output parsing.
 */
export class CodexRunner extends BasePlatformRunner {
  readonly platform: Platform = 'codex';
  private readonly outputParser: CodexOutputParser;

  /**
   * Creates a new CodexRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.outputParser = new CodexOutputParser();
  }

  /**
   * Gets the Codex CLI command.
   */
  protected getCommand(): string {
    return PLATFORM_COMMANDS.codex;
  }

  /**
   * Spawns a Codex CLI process.
   * 
   * Uses `codex exec` subcommand for non-interactive execution.
   * Passes the prompt as the positional `PROMPT` argument and disables
   * stdin input to prevent interactive hangs.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
   */
  protected async spawn(
    request: ExecutionRequest
  ): Promise<ChildProcess> {
    const args = this.buildArgs(request);

    const proc = spawn('codex', args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Important: avoid interactive prompts/hangs by ensuring stdin is closed
    // in non-interactive mode. Codex expects the prompt via positional argument.
    if (request.nonInteractive && proc.stdin) {
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds Codex CLI arguments.
   * 
   * Codex command structure: `codex exec [flags]`
   * 
   * Flags:
   * - `--cd <dir>` - Working directory (alternative to cwd)
   * - `--model <model>` - Model selection
   * - `--json` - JSONL event stream output (optional)
   * - `--ask-for-approval <policy>` - Command approval control
   * - `--sandbox <mode>` - Filesystem/network access control
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = ['exec'];

    // Add working directory via --cd flag
    // Note: Codex supports --cd/-C to set workspace root.
    // Only add if workingDirectory is non-empty
    if (request.workingDirectory && request.workingDirectory.trim() !== '') {
      args.push('--cd', request.workingDirectory);
    }

    // Add model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Non-interactive execution: ensure Codex never pauses for approval and can
    // write to the workspace. Emit structured JSONL events for robust parsing.
    if (request.nonInteractive) {
      args.push('--ask-for-approval', 'never');
      args.push('--sandbox', 'workspace-write');
      args.push('--json');
    }

    // Pass the prompt as the required positional argument for `codex exec`.
    // P1-G01: Apply plan mode preamble if planMode is requested
    args.push(this.buildPrompt(request));

    return args;
  }

  /**
   * Builds the prompt, adding plan mode preamble if needed.
   * 
   * P1-G01: Codex doesn't have a native plan mode CLI flag.
   * When planMode is requested, we add a preamble instructing the agent to
   * plan first, then execute. This provides a consistent experience across platforms.
   */
  private buildPrompt(request: ExecutionRequest): string {
    const prompt = request.prompt ?? '';
    
    if (request.planMode === true) {
      // Plan mode via prompt preamble
      const preamble = [
        'PLAN FIRST (briefly), THEN EXECUTE:',
        '- Start with a concise plan (max 10 bullets).',
        '- Then immediately carry out the plan and make the required changes.',
        '- Run the required tests/commands and report results.',
        '',
      ].join('\n');
      return `${preamble}${prompt}`;
    }
    
    return prompt;
  }

  /**
   * Parses Codex output.
   * 
   * Uses CodexOutputParser to extract:
   * - Completion signals (<ralph>COMPLETE</ralph>, <ralph>GUTTER</ralph>)
   * - Files changed
   * - Test results
   * - Errors and warnings
   * 
   * Handles both plain text and JSONL formats (if --json flag was used).
   */
  protected parseOutput(output: string): ExecutionResult {
    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    // Determine success based on completion signal and parsed results
    // Note: Some outputs may contain both signals; in that case, treat COMPLETE as higher priority.
    const completePresent = /<ralph>COMPLETE<\/ralph>/i.test(output);
    const gutterPresent = /<ralph>GUTTER<\/ralph>/i.test(output);
    const hasErrors = parsed.errors.length > 0;

    // Success if COMPLETE is present and there are no errors (COMPLETE takes precedence over GUTTER).
    const success = completePresent && !hasErrors;

    return {
      success,
      output,
      exitCode: 0, // Will be updated by base class execute() method
      duration: 0, // Will be updated by base class execute() method
      processId: 0, // Will be updated by base class execute() method
      tokensUsed: parsed.tokensUsed,
      sessionId: parsed.sessionId,
      ...(hasErrors && parsed.errors.length > 0
        ? { error: parsed.errors[0] }
        : !success && gutterPresent
          ? { error: 'Agent signaled GUTTER - stuck and cannot proceed' }
          : {}),
    };
  }
}
