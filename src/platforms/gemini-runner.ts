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
 *
 * Gemini CLI Command Reference:
 * - Headless mode: `-p "prompt"` or `--prompt "prompt"`
 * - Output formats: `--output-format json` (default) or `--output-format stream-json` (JSONL events)
 * - Approval modes: `--approval-mode yolo` (auto-approve all) or `--yolo` (shortcut)
 *   - `--approval-mode auto_edit` (auto-approve edit tools only)
 *   - `--approval-mode plan` (read-only, requires experimental.plan: true in settings)
 * - Model selection: `--model <model>` or `-m <model>` (e.g., gemini-2.5-pro, gemini-3-pro-preview)
 * - Model discovery: `gemini models` - List available models dynamically
 * - Multi-directory: `--include-directories <dir1,dir2>` (max 5 directories, monorepo support)
 * - Sandbox: `--sandbox` or `-s` (security isolation for tool execution)
 * - Debug mode: `--debug` or `-d` (verbose output)
 * - Session resume: `--resume [session-id]` (not used by Puppet Master - we spawn fresh)
 * 
 * Configuration:
 * - Settings: Hierarchical `settings.json` (system/user/project) with env var substitution
 * - Context files: `GEMINI.md` loaded from project root and ancestors (up to 200 directories)
 * - Preview features: Enable via `general.previewFeatures: true` in `~/.gemini/settings.json`
 *
 * Authentication (handled via environment variables for headless):
 * - GEMINI_API_KEY - Gemini API key for headless/automation
 * - GOOGLE_APPLICATION_CREDENTIALS - Vertex AI service account JSON
 * - GOOGLE_CLOUD_PROJECT - Google Cloud project ID (for Vertex AI)
 * - GOOGLE_CLOUD_LOCATION - Google Cloud location (for Vertex AI)
 *
 * Context Files (automatically loaded by Gemini CLI):
 * - GEMINI.md from project root and ancestors (hierarchical loading)
 * - Global: ~/.gemini/GEMINI.md
 * - Project: .gemini/GEMINI.md or GEMINI.md in project root
 * - Sub-directory: Scans up to 200 directories for local GEMINI.md files
 *
 * Output Format (JSON):
 * {
 *   "response": "string",  // Main AI-generated content
 *   "stats": {
 *     "models": { ... },    // Per-model API and token usage
 *     "tools": { ... },     // Tool execution statistics
 *     "files": { ... }      // File modification statistics
 *   },
 *   "error": { ... }        // Present only when error occurred
 * }
 *
 * Output Format (stream-json):
 * - JSONL format with event types: init, message, tool_use, tool_result, error, result
 * - Each line is a complete JSON event
 * - Real-time streaming for monitoring long-running operations
 *
 * @see https://geminicli.com/docs/cli/headless - Headless mode documentation
 * @see https://geminicli.com/docs/cli/commands - CLI commands reference
 * @see https://geminicli.com/docs/get-started/configuration - Configuration guide
 */

import { spawn, type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { GeminiOutputParser } from './output-parsers/index.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';
import { PLATFORM_COMMANDS } from './constants.js';

export class GeminiRunner extends BasePlatformRunner {
  readonly platform: Platform = 'gemini';
  private readonly command: string;
  private readonly outputParser: GeminiOutputParser;

  /**
   * Creates a new GeminiRunner instance.
   *
   * @param capabilityService - Capability discovery service (required)
   * @param command - Gemini CLI command path (default: 'gemini')
   * @param defaultTimeout - Default timeout in milliseconds (default: 600000 = 10 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 900000 = 15 minutes)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    command: string = PLATFORM_COMMANDS.gemini,
    defaultTimeout: number = 600_000, // 10 minutes for Gemini (longer prompts)
    hardTimeout: number = 900_000, // 15 minutes hard timeout
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.command = command;
    this.outputParser = new GeminiOutputParser();
  }

  /**
   * Gets the Gemini CLI command.
   */
  protected getCommand(): string {
    return this.command;
  }

  /**
   * Spawns a Gemini CLI process for execution.
   *
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
   * Gemini CLI uses -p flag to pass prompt as argument.
   */
  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    const args = this.buildArgs(request);

    const proc = spawn(this.command, args, {
      cwd: request.workingDirectory,
      // Windows npm installs typically provide .cmd/.ps1 shims which require shell resolution.
      shell: process.platform === 'win32',
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
   * - `-p` flag for non-interactive/prompt mode (alternative: `--prompt`)
   * - `--output-format json` for machine-readable output (alternative: `stream-json` for JSONL events)
   * - `--approval-mode yolo` for full automation (alternative: `--yolo` shortcut)
   * - `--model <model>` flag if model is specified (alternative: `-m <model>`)
   *
   * Note: Large prompts (>30KB) are passed via stdin instead of command-line argument
   * to avoid shell argument length limits.
   *
   * Supported features:
   * - `--output-format stream-json` for real-time event streaming (via outputFormat option)
   * - `--sandbox` or `-s` for sandbox execution environment (via sandbox option)
   * - `--include-directories <dir1,dir2>` for multi-directory workspace support (via includeDirectories option, max 5)
   * - `--debug` or `-d` for verbose debug output (not currently exposed)
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

    // Output format: json (default) or stream-json for real-time events
    const outputFormat = request.outputFormat === 'stream-json' ? 'stream-json' : 'json';
    args.push('--output-format', outputFormat);

    // P0-G10: Approval mode - respect planMode for read-only execution
    // planMode uses 'plan' mode (read-only), otherwise use 'yolo' for headless automation
    // Note: plan mode requires experimental.plan: true in Gemini config
    if (request.planMode === true) {
      args.push('--approval-mode', 'plan');
    } else {
      args.push('--approval-mode', 'yolo');
    }

    // Model selection
    if (request.model && request.model !== 'auto') {
      args.push('--model', request.model);
    }

    // Sandbox execution (security isolation)
    if (request.sandbox === true) {
      args.push('--sandbox');
    }

    // Multi-directory workspace support (max 5 directories)
    if (request.includeDirectories && request.includeDirectories.length > 0) {
      const dirs = request.includeDirectories.slice(0, 5); // Enforce max 5
      args.push('--include-directories', dirs.join(','));
    }

    // P0: Include all files in context
    if (request.includeAllFiles) {
      args.push('--all-files');
    }

    // P0: Debug mode (verbose output)
    if (request.debug) {
      args.push('--debug');
    }

    return args;
  }

  /**
   * Parses Gemini CLI output to extract execution results.
   *
   * Uses GeminiOutputParser to handle JSON output format with structure:
   * {
   *   "response": "string",      // Main AI-generated content
   *   "stats": { ... },          // Usage statistics (models, tools, files)
   *   "error": { ... }           // Error object if present
   * }
   *
   * Detects completion signals in response text:
   * - `<ralph>COMPLETE</ralph>` - Task completed successfully
   * - `<ralph>GUTTER</ralph>` - Agent stuck, cannot proceed (sets success to false)
   */
  protected parseOutput(output: string): ExecutionResult {
    const trimmed = output.trim();

    // Gemini is invoked with `--output-format json`, so non-JSON output is treated as a parsing failure.
    // Allow stream-json (JSONL) output as well.
    const lines = trimmed.split('\n').filter((line) => line.trim());
    const looksLikeStreamJson =
      lines.length >= 2 &&
      lines.slice(0, 2).every((line) => {
        try {
          JSON.parse(line);
          return true;
        } catch {
          return false;
        }
      });

    // For JSON output, extract the response text for human-facing output.
    // (The parser may preserve raw JSON for debugging/audits.)
    let responseText = '';

    if (!looksLikeStreamJson) {
      if (!trimmed.startsWith('{')) {
        return {
          success: false,
          output,
          error: 'Failed to parse Gemini JSON output: expected JSON object',
          exitCode: 0,
          duration: 0,
          processId: 0,
        };
      }

      try {
        const json = JSON.parse(trimmed) as { response?: unknown };
        responseText = typeof json.response === 'string' ? json.response : '';
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          output,
          error: `Failed to parse Gemini JSON output: ${message}`,
          exitCode: 0,
          duration: 0,
          processId: 0,
        };
      }
    }

    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    // Determine success based on completion signal and errors
    const success = parsed.completionSignal !== 'GUTTER' && parsed.errors.length === 0;

    const result: ExecutionResult = {
      success,
      output: looksLikeStreamJson ? parsed.rawOutput : responseText,
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

    // Set error message
    if (parsed.errors.length > 0) {
      result.error = parsed.errors[0];
    } else if (parsed.completionSignal === 'GUTTER') {
      result.error = 'Agent signaled GUTTER - stuck and cannot proceed';
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
