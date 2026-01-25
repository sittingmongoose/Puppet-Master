/**
 * GitHub Copilot CLI Platform Runner
 *
 * @deprecated Use CopilotSdkRunner instead.
 *
 * This CLI-based runner is deprecated in favor of the SDK-based runner
 * which provides:
 * - Model selection (via SessionConfig.model)
 * - Custom tool definitions
 * - Structured responses (no text parsing)
 * - Session persistence (opt-in)
 *
 * The SDK runner is in copilot-sdk-runner.ts and is now the default.
 * This file is kept as a fallback for edge cases where SDK fails.
 * It will be removed in a future release.
 *
 * @see copilot-sdk-runner.ts - The recommended replacement
 *
 * ---
 *
 * LEGACY DOCUMENTATION (for reference):
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
 *
 * GitHub Copilot CLI Command Reference:
 * - Programmatic mode: `-p "prompt"` or `--prompt "prompt"`
 * - Interactive mode: `copilot` (no flags, default)
 * - Approval options:
 *   - `--allow-all-tools` - Auto-approve all tools without manual approval
 *   - `--allow-tool <spec>` - Allow specific tool without approval
 *   - `--deny-tool <spec>` - Prevent specific tool usage (takes precedence)
 * - Tool specifications:
 *   - `'shell(COMMAND)'` - Shell command (e.g., `'shell(git)'`, `'shell(rm)'`)
 *   - `'shell(git push)'` - Specific git subcommand
 *   - `'shell'` - Any shell command
 *   - `'write'` - File modification tools (non-shell)
 *   - `'MCP_SERVER_NAME'` - All tools from MCP server
 *   - `'MCP_SERVER_NAME(tool_name)'` - Specific tool from MCP server
 * - Model selection: `/model` slash command (interactive only, not programmatic)
 * - Default model: Claude Sonnet 4.5 (GitHub reserves right to change)
 * - Output format: Text-based (no JSON output format available)
 *
 * Path and URL permissions:
 * - `--allow-all-paths` - Disable path verification (documented flag)
 * - `--allow-all-urls` - Disable URL verification (documented flag)
 * - `--allow-url <domain>` - Pre-approve specific domain (documented flag, e.g., `--allow-url github.com`)
 * 
 * Command-line options (for interactive sessions):
 * - `--resume` - Cycle through and resume local and remote interactive sessions
 * - `--continue` - Quickly resume the most recently closed local session
 * - `--agent=<agent-name>` - Specify custom agent to use (e.g., `--agent=refactor-agent`)
 * 
 * Undocumented flags (used in our implementation but not in official docs):
 * - `--silent` - May reduce output verbosity for scripting
 * - `--stream off` - May disable token streaming
 *
 * Security Considerations:
 * - Trusted directories: Configured in `trusted_folders` array in `~/.copilot/config.json`
 * - Directory trust prompt on first launch from new directory
 * - Can trust for current session only or permanently
 * - Warning: Don't launch from home directory or untrusted locations
 * - Heuristic permission scoping (GitHub doesn't guarantee all files outside trusted directories are protected)
 * - Risk mitigation: Use in restricted environments (VM, container, dedicated system)
 *
 * Authentication:
 * - GitHub authentication via `/login` command in interactive mode
 * - `GH_TOKEN` or `GITHUB_TOKEN` environment variable with "Copilot Requests" permission
 * - Requires GitHub Copilot Pro, Pro+, Business, or Enterprise subscription
 * - Organization policy must enable Copilot CLI feature
 *
 * Model Usage:
 * - Default model: Claude Sonnet 4.5 (subject to change by GitHub)
 * - Change model: `/model` slash command in interactive mode only
 * - Premium requests: Each prompt reduces monthly quota by model multiplier (e.g., "1x", "2x")
 * - Model availability: Depends on subscription tier (Pro, Pro+, Business, Enterprise) and region
 *
 * Context files (custom instructions, automatically loaded):
 * - `CLAUDE.md`, `GEMINI.md`, `AGENTS.md` (in project root and cwd)
 * - `.github/instructions/` directory with recursive `*.instructions.md` files (path-specific)
 * - `.github/copilot-instructions.md` (repository-wide)
 * - `$HOME/.copilot/copilot-instructions.md` (user-level)
 * - `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` (additional directories via env var)
 * 
 * Default custom agents (built-in):
 * - Explore: Quick codebase analysis without adding to main context
 * - Task: Execute commands (tests, builds) with brief summaries
 * - Plan: Analyze dependencies to create implementation plans
 * - Code-review: Review changes focusing on genuine issues
 * 
 * Context management (interactive mode only):
 * - `/usage` - Session statistics (premium requests, duration, lines edited, token usage)
 * - `/context` - Visual overview of current token usage
 * - `/compact` - Manually compress conversation history
 * - Automatic compression triggers at 95% of token limit
 * - Warning displayed when less than 20% of token limit remaining
 * 
 * Interactive features (not used in programmatic mode):
 * - Keyboard shortcuts: `@` (file mentions), `!` (shell bypass), `Esc` (cancel), etc.
 * - Slash commands: `/add-dir`, `/agent`, `/plan`, `/review`, `/delegate`, `/context`, `/compact`, `/usage`, etc.
 * - File mentions: `@path/to/file` - Include file contents in prompt
 * - Shell bypass: `!command` - Execute shell command directly
 * 
 * Customization Options (available but not used by Puppet Master):
 * - Custom instructions: Project context, build/test/validation instructions
 * - MCP servers: Additional data sources and tools via Model Context Protocol
 * - Custom agents: Specialized versions for different tasks
 * - Hooks: Execute shell commands at key points (validation, logging, security scanning)
 * - Skills: Enhanced specialized task performance with instructions, scripts, resources
 *
 * @see https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli - Official documentation
 * @see https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli - Usage guide
 */

import { spawn, type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CopilotOutputParser } from './output-parsers/index.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';
import { PLATFORM_COMMANDS } from './constants.js';

export class CopilotRunner extends BasePlatformRunner {
  readonly platform: Platform = 'copilot';
  private readonly command: string;
  private readonly outputParser: CopilotOutputParser;

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
    command: string = PLATFORM_COMMANDS.copilot,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.command = command;
    this.outputParser = new CopilotOutputParser();
  }

  /**
   * Gets the Copilot CLI command.
   */
  protected getCommand(): string {
    return this.command;
  }

  /**
   * Spawns a Copilot CLI process for execution.
   *
   * Creates a fresh process (no session reuse) per REQUIREMENTS.md Section 26.1.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
   * Copilot CLI uses -p flag to pass prompt as argument.
   */
  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    const args = this.buildArgs(request);
    const prompt = this.buildPrompt(request);

    const proc = spawn(this.command, args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
      },
    });

    // Write prompt to stdin as fallback if not already passed via -p flag
    if (prompt && proc.stdin && !args.includes(prompt)) {
      proc.stdin.write(prompt, 'utf-8');
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds command-line arguments for Copilot CLI.
   *
   * Constructs arguments based on request:
   * - `-p` flag for non-interactive/prompt mode (alternative: `--prompt`)
   * - `--allow-all-tools` to prevent interactive approval prompts
   * - `--allow-all-paths` to disable path verification (undocumented flag)
   * - `--silent` for scripting-friendly output (undocumented flag)
   * - `--stream off` to disable token streaming (undocumented flag)
   *
   * Note: Large prompts (>30KB) are passed via stdin instead of command-line argument
   * to avoid shell argument length limits.
   *
   * Future considerations (not currently implemented):
   * - `--allow-tool <spec>` for specific tool approval (e.g., `'shell(git)'`, `'write'`)
   * - `--deny-tool <spec>` for tool restrictions (e.g., `'shell(rm)'`)
   * - Tool specification syntax supports shell commands, write operations, and MCP servers
   *
   * Model selection:
   * - Model selection is NOT supported via CLI flags
   * - The `/model` command is interactive only
   * - Default model is Claude Sonnet 4.5 (subject to change by GitHub)
   * - Model availability depends on subscription tier and region
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    // P0-G16: Warn if model is configured but will be ignored
    // Copilot CLI does NOT support --model flag; model selection is interactive only
    if (request.model) {
      console.warn(
        `[CopilotRunner] Model '${request.model}' specified but Copilot CLI does not support ` +
        `programmatic model selection. Default model (Claude Sonnet 4.5) will be used. ` +
        `Use CopilotSdkRunner for model selection support, or use /model command in interactive mode.`
      );
    }

    // Non-interactive mode with prompt
    if (request.nonInteractive) {
      // P1-G01: Apply plan mode preamble if planMode is requested
      const prompt = this.buildPrompt(request);
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
   * Builds the prompt, adding plan mode preamble if needed.
   * 
   * P1-G01: Copilot CLI doesn't have a native plan mode CLI flag in headless mode.
   * When planMode is requested, we add a preamble instructing the agent to
   * plan first, then execute. This provides a consistent experience across platforms.
   */
  private buildPrompt(request: ExecutionRequest): string {
    const prompt = request.prompt ?? '';
    
    if (request.planMode === true) {
      // Plan mode via prompt preamble (Copilot /plan is interactive only)
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
   * Parses Copilot CLI text output to extract execution results.
   *
   * Uses CopilotOutputParser to handle text-based responses.
   *
   * Detects completion signals in output text:
   * - `<ralph>COMPLETE</ralph>` - Task completed successfully
   * - `<ralph>GUTTER</ralph>` - Agent stuck, cannot proceed (sets success to false)
   */
  protected parseOutput(output: string): ExecutionResult {
    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    const result: ExecutionResult = {
      success: parsed.completionSignal !== 'GUTTER',
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

    if (parsed.completionSignal === 'GUTTER') {
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
