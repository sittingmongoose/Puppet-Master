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
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';

/**
 * Claude-specific platform runner.
 * 
 * Extends BasePlatformRunner to provide Claude CLI integration.
 * Uses claude command with -p flag for non-interactive print mode.
 */
export class ClaudeRunner extends BasePlatformRunner {
  readonly platform: Platform = 'claude';
  private readonly command: string;

  /**
   * Creates a new ClaudeRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param command - Claude CLI command path (default: 'claude')
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = 'claude',
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000
  ) {
    super(capabilityService, defaultTimeout, hardTimeout);
    this.command = command;
  }

  /**
   * Spawns a claude process for execution.
   * 
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * Claude CLI uses -p flag to pass prompt as argument, but we also support stdin.
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
    if (request.nonInteractive && request.prompt) {
      args.push('-p', request.prompt);
    } else if (request.nonInteractive) {
      // If non-interactive but no prompt yet, just add -p flag
      // Prompt will be written to stdin
      args.push('-p');
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
   * Detects completion signals:
   * - <ralph>COMPLETE</ralph> - Task completed successfully
   * - <ralph>GUTTER</ralph> - Agent stuck, cannot proceed
   * 
   * Also extracts:
   * - Session ID (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
   * - Token usage if present
   * - Handles both plain text and JSON/JSONL formats
   */
  protected parseOutput(output: string): ExecutionResult {
    // Detect completion signals (case-insensitive)
    const hasComplete = /<ralph>COMPLETE<\/ralph>/i.test(output);
    const hasGutter = /<ralph>GUTTER<\/ralph>/i.test(output);

    // Determine success based on signals
    // If COMPLETE is present, success = true
    // If GUTTER is present, success = false
    // Otherwise, assume success (exit code will determine)
    let success = true;
    if (hasGutter) {
      success = false;
    } else if (hasComplete) {
      success = true;
    }

    // Extract session ID if present (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
    const sessionIdMatch = output.match(/PM-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}/);
    const sessionId = sessionIdMatch ? sessionIdMatch[0] : undefined;

    // Try to extract token count if present
    // Handle various formats: "tokens: 1234", "tokens=1234", "tokens 1234", etc.
    const tokenMatch = output.match(/["']?tokens?["']?\s*[:=\s]\s*(\d+)/i);
    const tokensUsed = tokenMatch ? parseInt(tokenMatch[1], 10) : undefined;

    // Handle JSON/JSONL format if --output-format json was used
    // Try to parse as JSON lines and extract relevant information
    if (output.trim().startsWith('{') || output.includes('\n{"')) {
      try {
        // Try to parse as JSONL (newline-delimited JSON)
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            // Extract information from JSON if available
            if (json.tokens && !tokensUsed) {
              // tokensUsed will be set below if found in JSON
            }
            if (json.session_id && !sessionId) {
              // sessionId will be set below if found in JSON
            }
          } catch {
            // Not valid JSON, continue
          }
        }
      } catch {
        // Not JSONL, try single JSON object
        try {
          const json = JSON.parse(output);
          if (json.tokens && !tokensUsed) {
            // tokensUsed will be set below if found in JSON
          }
          if (json.session_id && !sessionId) {
            // sessionId will be set below if found in JSON
          }
        } catch {
          // Not JSON, treat as plain text
        }
      }
    }

    // Build result
    const result: ExecutionResult = {
      success,
      output,
      exitCode: 0, // Will be set by execute() method
      duration: 0, // Will be set by execute() method
      processId: 0, // Will be set by execute() method
    };

    // Add optional fields if found
    if (sessionId) {
      result.sessionId = sessionId;
    }
    if (tokensUsed !== undefined) {
      result.tokensUsed = tokensUsed;
    }

    // If GUTTER signal found, add error message
    if (hasGutter) {
      result.error = 'Agent signaled GUTTER - stuck and cannot proceed';
    }

    return result;
  }
}
