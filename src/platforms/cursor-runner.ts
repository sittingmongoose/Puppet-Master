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
  // P1-G03: Track when mode flag support was last probed
  private modeFlagSupportProbedAt: number = 0;
  // P1-G03: Cache TTL for mode flag support (1 hour)
  private static readonly MODE_FLAG_CACHE_TTL_MS = 3600_000;
  // CU-P0-T04: Store output format for current execution
  private currentOutputFormat?: 'text' | 'json' | 'stream-json';

  // Permission hardening: approval flag discovery
  private approvalFlagSupport: string | null = null; // null = not probed; '' = none found; string = flag name
  private approvalFlagSupportPromise: Promise<string> | null = null;
  private approvalFlagSupportProbedAt: number = 0;
  private static readonly APPROVAL_FLAG_CACHE_TTL_MS = 3600_000; // 1 hour

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
   * P1-G03: Invalidate the plan mode support cache.
   * Call after a Cursor CLI update to re-probe capabilities.
   */
  public invalidatePlanModeCache(): void {
    this.modeFlagSupport = null;
    this.modeFlagSupportProbedAt = 0;
  }

  /**
   * CU-P0-T03: Cursor prompt transport method.
   * Prefers prompt-as-arg with -p flag, falls back to stdin for large prompts.
   */
  protected writesPromptToStdin(): boolean {
    // Will be determined dynamically based on prompt size
    return false; // Default to arg mode, will override for large prompts
  }
  
  /**
   * CU-P0-T03: Maximum prompt size for argument mode (32KB).
   * Larger prompts fall back to stdin to avoid command-line length limits.
   */
  private static readonly MAX_ARG_PROMPT_SIZE = 32 * 1024; // 32KB

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
    // Permission hardening: probe for approval flags on first spawn
    if (this.approvalFlagSupport === null) {
      await this.ensureApprovalFlagSupport();
    }

    // CU-P0-T04: Store output format for parseOutput
    this.currentOutputFormat = request.outputFormat;

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

    // CU-P0-T03: Write prompt to stdin only if not passed as argument
    // (fallback for large prompts that exceed command-line length limits)
    const promptSize = request.prompt ? Buffer.byteLength(request.prompt, 'utf8') : 0;
    const useStdin = request.prompt && promptSize > CursorRunner.MAX_ARG_PROMPT_SIZE;
    
    if (useStdin && proc.stdin) {
      proc.stdin.write(this.buildPrompt(request));
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for cursor-agent.
   * 
   * CU-P0-T03: Updated to prefer prompt-as-arg with -p flag per Cursor January 2026 docs.
   * Falls back to stdin for extremely large prompts.
   * 
   * Constructs arguments based on request:
   * - -p "prompt" for non-interactive/print mode (preferred)
   * - --model flag if model is specified
   * - Prompt passed as argument if size allows, otherwise written to stdin
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // Non-interactive mode (print mode)
    if (request.nonInteractive && request.prompt) {
      const promptSize = Buffer.byteLength(request.prompt, 'utf8');
      
      // CU-P0-T03: Prefer prompt-as-arg, fall back to stdin for large prompts
      if (promptSize <= CursorRunner.MAX_ARG_PROMPT_SIZE) {
        // Pass prompt as argument (preferred method per docs)
        args.push('-p', request.prompt);
      } else {
        // Fall back to stdin for extremely large prompts
        args.push('-p');
        // Prompt will be written to stdin in spawn()
      }
    } else if (request.nonInteractive) {
      // Non-interactive but no prompt (shouldn't happen, but handle gracefully)
      args.push('-p');
    }

    // CU-P0-T05: Cursor ask mode (read-only/discovery/reviewer passes)
    if (request.askMode === true) {
      args.push('--mode=ask');
    }
    // Cursor plan mode (best-effort; requires CLI support)
    else if (request.planMode === true && this.modeFlagSupport === true) {
      args.push('--mode=plan');
    }

    // Permission hardening: apply discovered approval flag (if any)
    if (this.approvalFlagSupport && this.approvalFlagSupport.length > 0) {
      const flag = this.approvalFlagSupport;
      if (flag === '--approval-mode') {
        args.push('--approval-mode', 'yolo');
      } else if (flag === '--permission-mode') {
        args.push('--permission-mode', request.permissionMode ?? 'acceptEdits');
      } else {
        // Simple flags: --auto-approve, --no-confirm, --yolo, --full-auto, --allow-all-tools
        args.push(flag);
      }
    }

    // Model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // CU-P0-T04: Output format (requires --print mode, which is set above)
    if (request.outputFormat && request.outputFormat !== 'text' && request.nonInteractive) {
      args.push('--output-format', request.outputFormat);
    }

    // P0: Cost control - max budget in USD
    if (request.maxBudgetUsd !== undefined && request.maxBudgetUsd > 0) {
      args.push('--max-budget-usd', request.maxBudgetUsd.toFixed(2));
    }

    // P0: Structured JSON output validation schema
    if (request.jsonSchema && request.nonInteractive) {
      args.push('--json-schema', request.jsonSchema);
    }

    // P0: Fallback model when primary model is overloaded
    if (request.fallbackModel) {
      args.push('--fallback-model', request.fallbackModel);
    }

    // P0: Include partial streaming events (requires stream-json)
    if (request.includePartialMessages && request.outputFormat === 'stream-json' && request.nonInteractive) {
      args.push('--include-partial-messages');
    }

    // P0: Input format for agent chaining
    if (request.inputFormat && request.inputFormat === 'stream-json' && request.nonInteractive) {
      args.push('--input-format', 'stream-json');
    }

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

  /**
   * P1-G03: Ensure mode flag support is probed with cache invalidation.
   */
  private async ensureModeFlagSupport(): Promise<boolean> {
    // P1-G03: Check if cache is still valid
    const cacheAge = Date.now() - this.modeFlagSupportProbedAt;
    const cacheValid = cacheAge < CursorRunner.MODE_FLAG_CACHE_TTL_MS;
    
    if (this.modeFlagSupport !== null && cacheValid) {
      return this.modeFlagSupport;
    }
    if (this.modeFlagSupportPromise) {
      return this.modeFlagSupportPromise;
    }

    this.modeFlagSupportPromise = this.probeModeFlagSupport()
      .catch((error) => {
        console.warn(`[CursorRunner] Failed to probe plan mode support: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      })
      .then((supported) => {
        this.modeFlagSupport = supported;
        this.modeFlagSupportProbedAt = Date.now();
        if (!supported) {
          console.info('[CursorRunner] Plan mode (--mode=plan) not detected. Using prompt-based plan fallback.');
        }
        return supported;
      })
      .finally(() => {
        this.modeFlagSupportPromise = null;
      });

    return this.modeFlagSupportPromise;
  }

  /**
   * P1-G03: Enhanced plan mode detection with multiple heuristics.
   */
  private async probeModeFlagSupport(): Promise<boolean> {
    const helpOutput = await this.getHelpOutput(5000);
    const lower = helpOutput.toLowerCase();
    
    // P1-G03: Multiple detection heuristics for better robustness
    // Heuristic 1: Exact flag match
    const hasModePlanFlag = /--mode[=\s]+plan\b/i.test(helpOutput);
    if (hasModePlanFlag) {
      return true;
    }
    
    // Heuristic 2: Mode option with plan as value
    const hasModeFlagWithPlanValue = 
      lower.includes('--mode') && 
      (lower.includes('plan') || lower.includes('read-only') || lower.includes('analysis'));
    if (hasModeFlagWithPlanValue) {
      return true;
    }
    
    // Heuristic 3: Plan mode documented in help
    const planModeDocumented = 
      lower.includes('plan mode') || 
      lower.includes('planning mode') ||
      lower.includes('read-only mode');
    
    return planModeDocumented;
  }

  /**
   * Permission hardening: Invalidate the approval flag cache.
   * Call after a Cursor CLI update to re-probe capabilities.
   */
  public invalidateApprovalFlagCache(): void {
    this.approvalFlagSupport = null;
    this.approvalFlagSupportProbedAt = 0;
  }

  /**
   * Permission hardening: Ensure approval flag support is probed with cache.
   * Follows the same pattern as ensureModeFlagSupport().
   */
  private async ensureApprovalFlagSupport(): Promise<string> {
    const cacheAge = Date.now() - this.approvalFlagSupportProbedAt;
    const cacheValid = cacheAge < CursorRunner.APPROVAL_FLAG_CACHE_TTL_MS;

    if (this.approvalFlagSupport !== null && cacheValid) {
      return this.approvalFlagSupport;
    }
    if (this.approvalFlagSupportPromise) {
      return this.approvalFlagSupportPromise;
    }

    this.approvalFlagSupportPromise = this.probeApprovalFlagSupport()
      .catch((error) => {
        console.warn(
          `[CursorRunner] Failed to probe approval flag support: ${error instanceof Error ? error.message : String(error)}`
        );
        return '';
      })
      .then((flag) => {
        this.approvalFlagSupport = flag;
        this.approvalFlagSupportProbedAt = Date.now();
        if (flag) {
          console.info(`[CursorRunner] Approval flag detected: ${flag}`);
        } else {
          console.info(
            '[CursorRunner] No approval/permission flags detected in cursor-agent --help.'
          );
        }
        return flag;
      })
      .finally(() => {
        this.approvalFlagSupportPromise = null;
      });

    return this.approvalFlagSupportPromise;
  }

  /**
   * Permission hardening: Probe cursor-agent --help for approval/permission flags.
   */
  private async probeApprovalFlagSupport(): Promise<string> {
    const helpOutput = await this.getHelpOutput(5000);

    // Check for common approval/permission flag patterns
    const flagPatterns: Array<{ pattern: RegExp; flagName: string }> = [
      { pattern: /--(?:approval|approve)-mode/i, flagName: '--approval-mode' },
      { pattern: /--allow-all-tools\b/i, flagName: '--allow-all-tools' },
      { pattern: /--(?:auto-approve|autoApprove)\b/i, flagName: '--auto-approve' },
      { pattern: /--permission-mode\b/i, flagName: '--permission-mode' },
      { pattern: /--(?:no-confirm|noconfirm|skip-confirm)\b/i, flagName: '--no-confirm' },
      { pattern: /--yolo\b/i, flagName: '--yolo' },
      { pattern: /--full-auto\b/i, flagName: '--full-auto' },
    ];

    for (const { pattern, flagName } of flagPatterns) {
      if (pattern.test(helpOutput)) {
        return flagName;
      }
    }

    return ''; // No flags found
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
   * CU-P0-T04: Enhanced to support JSON and stream-json output formats.
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
    const outputFormat = this.currentOutputFormat;
    
    // CU-P0-T04: Handle structured output formats
    if (outputFormat === 'json' || outputFormat === 'stream-json') {
      const parsed = this.outputParser.parseStructured(output, outputFormat);
      
      // Build result from structured output
      const result: ExecutionResult = {
        success: parsed.completionSignal !== 'GUTTER',
        output: parsed.rawOutput || output,
        exitCode: 0, // Will be set by execute() method
        duration: 0, // Will be set by execute() method
        processId: 0, // Will be set by execute() method
      };

      if (parsed.sessionId) {
        result.sessionId = parsed.sessionId;
      }
      if (parsed.tokensUsed !== undefined) {
        result.tokensUsed = parsed.tokensUsed;
      }

      if (parsed.completionSignal === 'GUTTER') {
        result.error = 'Agent signaled GUTTER - stuck and cannot proceed';
      }

      return result;
    }

    // Fallback to text parsing (default behavior)
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
