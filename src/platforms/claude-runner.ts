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
    const prompt = this.buildPrompt(request);

    const env = { ...process.env };
    // Opus 4.6 effort level: CLAUDE_CODE_EFFORT_LEVEL=low|medium|high (model-config docs)
    if (request.reasoningEffort && this.isOpus46Model(request.model)) {
      const effortMap: Record<string, string> = {
        Low: 'low',
        Medium: 'medium',
        High: 'high',
      };
      const level = effortMap[request.reasoningEffort];
      if (level) {
        env.CLAUDE_CODE_EFFORT_LEVEL = level;
      }
    }

    const proc = spawn(this.command, args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
    });

    // Write prompt to stdin if provided and not already passed via -p flag
    // Claude supports both -p "prompt" and stdin, but -p is preferred for non-interactive mode
    // If prompt is not in args (via -p), write to stdin as fallback
    if (prompt && proc.stdin && !args.includes(prompt)) {
      proc.stdin.write(prompt, 'utf-8');
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for claude CLI.
   *
   * Per https://code.claude.com/docs/en/cli-reference and
   * https://code.claude.com/docs/en/headless.
   *
   * - -p: non-interactive print mode (prompt as arg or stdin)
   * - --no-session-persistence: fresh process per iteration (print mode only)
   * - --output-format: text | json | stream-json when specified
   * - --model, --max-turns
   * - --permission-mode, --allowedTools when provided (explicit config only)
   * - --mcp-config, --strict-mcp-config, --plugin-dir when provided (explicit config only)
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // Non-interactive mode (print mode) with prompt
    // Claude uses -p "prompt" format where prompt is passed as argument to -p
    if (request.nonInteractive) {
      // IMPORTANT: OS command-line argument length limits (especially on Windows)
      // can be exceeded by large prompts. To avoid this, omit the prompt argument
      // when it's too large and rely on stdin (supported by Claude in -p mode).
      const prompt = this.buildPrompt(request);
      const promptBytes = prompt ? Buffer.byteLength(prompt, 'utf8') : 0;
      const MAX_PROMPT_ARG_BYTES = 30_000;

      args.push('-p');

      if (prompt && promptBytes <= MAX_PROMPT_ARG_BYTES) {
        args.push(prompt);
      }

      // Disable session persistence so each run is truly fresh (no resume).
      // Per CLI reference: print mode only.
      args.push('--no-session-persistence');
    }

    // Model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Max turns if specified
    if (request.maxTurns !== undefined) {
      args.push('--max-turns', String(request.maxTurns));
    }

    // Output format (text | json | stream-json). Omit when text or unspecified.
    if (
      request.nonInteractive &&
      request.outputFormat &&
      request.outputFormat !== 'text'
    ) {
      args.push('--output-format', request.outputFormat);
    }

    // Input format (text | stream-json). Only set when stream-json is requested.
    if (request.nonInteractive && request.inputFormat === 'stream-json') {
      args.push('--input-format', 'stream-json');
    }

    // Permission mode - use plan mode when planMode is requested
    // Verified: Claude Code CLI supports --permission-mode plan flag
    // Documentation: https://code.claude.com/docs/en/cli-reference
    if (request.planMode === true) {
      args.push('--permission-mode', 'plan');
    } else if (request.permissionMode) {
      args.push('--permission-mode', request.permissionMode);
    } else if (request.nonInteractive) {
      // DEFAULT HARDENING: For autonomous headless execution, default to 'acceptEdits'
      // to prevent Claude from prompting for file edit approval when no explicit
      // permissionMode is configured. Can be overridden by setting permissionMode
      // in tier config. See permission-hardening plan for rationale.
      args.push('--permission-mode', 'acceptEdits');
    }

    // Allowed tools (comma-separated; only when explicitly configured)
    if (request.allowedTools && request.allowedTools.trim()) {
      args.push('--allowedTools', request.allowedTools.trim());
    }

    // MCP config and plugins (only when explicitly configured)
    if (request.mcpConfig && request.mcpConfig.trim()) {
      args.push('--mcp-config', request.mcpConfig.trim());
      if (request.strictMcpConfig === true) {
        args.push('--strict-mcp-config');
      }
    } else if (request.strictMcpConfig === true) {
      // Strict mode without config path is meaningless; ignore.
    }

    if (request.pluginDir && request.pluginDir.trim()) {
      args.push('--plugin-dir', request.pluginDir.trim());
    }

    // Optional system prompt append (CLI reference: --append-system-prompt)
    if (request.systemPrompt && request.systemPrompt.trim()) {
      args.push('--append-system-prompt', request.systemPrompt.trim());
    }

    // P0: Cost control - max budget in USD (print mode only)
    if (request.maxBudgetUsd !== undefined && request.maxBudgetUsd > 0 && request.nonInteractive) {
      args.push('--max-budget-usd', request.maxBudgetUsd.toFixed(2));
    }

    // P0: Structured JSON output validation schema (print mode only)
    if (request.jsonSchema && request.nonInteractive) {
      args.push('--json-schema', request.jsonSchema);
    }

    // P0: Fallback model when primary model is overloaded (print mode only)
    if (request.fallbackModel && request.nonInteractive) {
      args.push('--fallback-model', request.fallbackModel);
    }

    // P0: Include partial streaming events (requires stream-json and print mode)
    if (request.includePartialMessages && request.outputFormat === 'stream-json' && request.nonInteractive) {
      args.push('--include-partial-messages');
    }

    // P0: System prompt file (replaces entire prompt, print mode only)
    if (request.systemPromptFile && request.nonInteractive) {
      args.push('--system-prompt-file', request.systemPromptFile);
    }

    // P0: Append system prompt from file (print mode only)
    if (request.appendSystemPromptFile && request.nonInteractive) {
      args.push('--append-system-prompt-file', request.appendSystemPromptFile);
    }

    // P0: Restrict available tools (--tools)
    if (request.allowedToolsList && request.allowedToolsList.length > 0) {
      args.push('--tools', request.allowedToolsList.join(','));
    }

    // P0: Block specific tools (--disallowedTools)
    if (request.disallowedTools && request.disallowedTools.length > 0) {
      args.push('--disallowedTools', request.disallowedTools.join(','));
    }

    // P0: Enable Chrome browser integration
    if (request.enableChrome) {
      args.push('--chrome');
    }

    // P0: Custom subagents definition (JSON)
    if (request.customAgents && Object.keys(request.customAgents).length > 0) {
      args.push('--agents', JSON.stringify(request.customAgents));
    }

    // P0: MCP-based permission handling tool
    if (request.permissionPromptTool && request.nonInteractive) {
      args.push('--permission-prompt-tool', request.permissionPromptTool);
    }

    // P0: Multi-directory workspace support
    if (request.includeDirectories && request.includeDirectories.length > 0) {
      args.push('--add-dir', ...request.includeDirectories);
    }

    return args;
  }

  /**
   * Returns true if the model is Opus 4.6 (which supports effort levels).
   */
  private isOpus46Model(model?: string): boolean {
    if (!model) return false;
    const m = model.toLowerCase();
    return m === 'opus' || m === 'claude-opus-4-6' || m.startsWith('opus[1m]');
  }

  /**
   * Builds the prompt.
   * 
   * Note: Plan mode is now handled via --permission-mode plan flag (not prompt preamble).
   * Claude Code CLI supports --permission-mode plan flag for both interactive and print modes.
   * Documentation: https://code.claude.com/docs/en/cli-reference
   */
  private buildPrompt(request: ExecutionRequest): string {
    return request.prompt ?? '';
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
