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
import { OutputParser } from '../core/output-parser.js';

/**
 * Codex platform runner.
 * 
 * Handles Codex CLI invocation with proper argument construction
 * and output parsing.
 */
export class CodexRunner extends BasePlatformRunner {
  readonly platform: Platform = 'codex';
  private readonly outputParser: OutputParser;

  /**
   * Creates a new CodexRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000
  ) {
    super(capabilityService, defaultTimeout, hardTimeout);
    this.outputParser = new OutputParser();
  }

  /**
   * Spawns a Codex CLI process.
   * 
   * Uses `codex exec` subcommand for non-interactive execution.
   * Writes prompt to stdin and returns the ChildProcess.
   */
  protected async spawn(
    request: ExecutionRequest
  ): Promise<ChildProcess> {
    const args = this.buildArgs(request);

    const proc = spawn('codex', args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Write prompt to stdin and end stream
    if (proc.stdin) {
      proc.stdin.write(request.prompt, 'utf-8');
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
   * - `--path <dir>` - Working directory (alternative to cwd)
   * - `--model <model>` - Model selection
   * - `--max-turns <n>` - Cap agentic turns
   * - `--output-format json` - Structured JSONL output (optional)
   * - `--approval-policy <policy>` - Command approval control (optional)
   * - `--sandbox-mode` - Filesystem/network access control (optional)
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = ['exec'];

    // Add working directory via --path flag
    // Note: Codex uses --path instead of relying solely on cwd
    // Only add if workingDirectory is non-empty
    if (request.workingDirectory && request.workingDirectory.trim() !== '') {
      args.push('--path', request.workingDirectory);
    }

    // Add model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Add max turns if specified
    if (request.maxTurns !== undefined) {
      args.push('--max-turns', String(request.maxTurns));
    }

    // Add output format for structured output (optional, but useful for parsing)
    // Note: We can handle both JSONL and plain text, so this is optional
    // args.push('--output-format', 'json');

    // Note: approval-policy and sandbox-mode are optional and not included
    // by default. They can be added via contextFiles or systemPrompt if needed.

    return args;
  }

  /**
   * Parses Codex output.
   * 
   * Uses OutputParser to extract:
   * - Completion signals (<ralph>COMPLETE</ralph>, <ralph>GUTTER</ralph>)
   * - Files changed
   * - Test results
   * - Errors and warnings
   * 
   * Handles both plain text and JSONL formats (if --output-format json was used).
   */
  protected parseOutput(output: string): ExecutionResult {
    // Parse output using OutputParser
    const parsed = this.outputParser.parse(output);

    // Determine success based on completion signal and parsed results
    // Success if COMPLETE signal is present, or if no errors and exit code is 0
    // (exit code will be set by base class execute() method)
    const hasCompleteSignal = parsed.completionSignal === 'COMPLETE';
    const hasGutterSignal = parsed.completionSignal === 'GUTTER';
    const hasErrors = parsed.errors.length > 0;

    // Default success to false, will be updated based on exit code in execute()
    // For now, we consider it successful if COMPLETE signal is present
    const success = hasCompleteSignal && !hasGutterSignal && !hasErrors;

    // Extract session ID if present in output
    // Codex may output session information in JSONL format
    let sessionId: string | undefined;
    const sessionIdMatch = output.match(/["']?session[_-]?id["']?\s*[:=]\s*["']?([^"'\s]+)["']?/i);
    if (sessionIdMatch) {
      sessionId = sessionIdMatch[1];
    }

    // Extract token usage if present
    let tokensUsed: number | undefined;
    const tokensMatch = output.match(/["']?tokens?["']?\s*[:=]\s*(\d+)/i);
    if (tokensMatch) {
      tokensUsed = parseInt(tokensMatch[1], 10);
    }

    return {
      success,
      output,
      exitCode: 0, // Will be updated by base class execute() method
      duration: 0, // Will be updated by base class execute() method
      processId: 0, // Will be updated by base class execute() method
      tokensUsed,
      sessionId,
      ...(hasErrors && parsed.errors.length > 0
        ? { error: parsed.errors[0] }
        : {}),
    };
  }
}
