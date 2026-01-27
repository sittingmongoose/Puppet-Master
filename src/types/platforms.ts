/**
 * Platform-related types for RWM Puppet Master
 * 
 * This file defines types for platform runners, execution requests/results,
 * capabilities, and runner contracts.
 * 
 * NOTE: Platform type is defined in config.ts (canonical source).
 * This file re-exports Platform for convenience.
 */

import type { Platform } from './config.js';

// Re-export Platform as a TYPE (not a runtime value)
export type { Platform };

/**
 * Request to execute a command on a platform runner.
 */
export interface ExecutionRequest {
  prompt: string;
  model?: string;
  /**
   * Enable platform “plan mode” (best-effort; currently used by Cursor runner).
   */
  planMode?: boolean;
  /**
   * CU-P0-T05: Enable platform "ask mode" for read-only/discovery/reviewer passes.
   * Maps to --mode=ask for Cursor CLI.
   */
  askMode?: boolean;
  /**
   * CU-P0-T04: Output format for Cursor CLI (requires --print mode).
   * - 'text': Plain text output (default)
   * - 'json': Single JSON object
   * - 'stream-json': NDJSON events (streaming)
   */
  outputFormat?: 'text' | 'json' | 'stream-json';
  /**
   * Claude Code CLI: --permission-mode. Only applied when platform is claude.
   * See https://code.claude.com/docs/en/iam#permission-modes
   */
  permissionMode?: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
  /**
   * Claude Code CLI: --allowedTools (comma-separated). Tools that run without permission prompts.
   * Only applied when platform is claude. See https://code.claude.com/docs/en/headless#auto-approve-tools
   */
  allowedTools?: string;
  /**
   * Enable sandbox execution environment (Gemini CLI: --sandbox or -s).
   * Provides security isolation for tool execution.
   */
  sandbox?: boolean;
  /**
   * Include additional directories in workspace (Gemini CLI: --include-directories).
   * Maximum 5 directories supported by Gemini CLI.
   */
  includeDirectories?: string[];
  workingDirectory: string;
  timeout?: number;
  hardTimeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
  /**
   * Structured JSON output validation schema path.
   * Supported by: Cursor (--json-schema), Codex (--output-schema), Claude (--json-schema)
   */
  jsonSchema?: string;
  /**
   * Maximum budget in USD for this execution.
   * Supported by: Cursor (--max-budget-usd), Claude (--max-budget-usd)
   */
  maxBudgetUsd?: number;
  /**
   * Fallback model to use when primary model is overloaded.
   * Supported by: Cursor (--fallback-model), Claude (--fallback-model)
   */
  fallbackModel?: string;
  /**
   * Include partial streaming events in output.
   * Supported by: Cursor (--include-partial-messages), Claude (--include-partial-messages)
   */
  includePartialMessages?: boolean;
  /**
   * Input format for prompts.
   * Supported by: Cursor (--input-format stream-json), Claude (--input-format stream-json)
   */
  inputFormat?: 'text' | 'stream-json';
  /**
   * Image file paths to attach to prompt.
   * Supported by: Codex (--image)
   */
  images?: string[];
  /**
   * Enable web search capability.
   * Supported by: Codex (--search)
   */
  enableWebSearch?: boolean;
  /**
   * System prompt file path (replaces entire system prompt).
   * Supported by: Claude (--system-prompt-file)
   */
  systemPromptFile?: string;
  /**
   * Append system prompt from file.
   * Supported by: Claude (--append-system-prompt-file)
   */
  appendSystemPromptFile?: string;
  /**
   * List of allowed tools (restrict available tools).
   * Supported by: Claude (--tools)
   */
  allowedToolsList?: string[];
  /**
   * List of disallowed tools (block specific tools).
   * Supported by: Claude (--disallowedTools)
   */
  disallowedTools?: string[];
  /**
   * Enable Chrome browser integration for web automation.
   * Supported by: Claude (--chrome)
   */
  enableChrome?: boolean;
  /**
   * Custom subagents definition (JSON).
   * Supported by: Claude (--agents)
   */
  customAgents?: Record<string, unknown>;
  /**
   * MCP-based permission handling tool.
   * Supported by: Claude (--permission-prompt-tool)
   */
  permissionPromptTool?: string;
  /**
   * Include all files in context.
   * Supported by: Gemini (--all-files / -a)
   */
  includeAllFiles?: boolean;
  /**
   * Enable verbose debug output.
   * Supported by: Gemini (--debug / -d)
   */
  debug?: boolean;
  /**
   * Export session transcript to markdown file.
   * Supported by: Copilot (--share [path])
   */
  shareTranscript?: string;
  /**
   * Export session to GitHub gist.
   * Supported by: Copilot (--share-gist)
   */
  shareGist?: boolean;
  /**
   * Pre-approve URL domains for web access.
   * Supported by: Copilot (--allow-url <domain>)
   */
  allowedUrls?: string[];
  /**
   * Custom agent selection.
   * Supported by: Copilot (--agent=<agent-name>)
   */
  agent?: string;
  /**
   * Use local Ollama/open-source model support.
   * Supported by: Codex (--oss)
   */
  useOss?: boolean;
  /**
   * Configuration profile selection.
   * Supported by: Codex (--profile <name>)
   */
  profile?: string;
  /**
   * Inline configuration overrides (key=value pairs).
   * Supported by: Codex (-c key=value / --config key=value)
   */
  configOverrides?: Record<string, unknown>;
  /**
   * Output last message to file (for CI/CD integration).
   * Supported by: Codex (--output-last-message <path>)
   */
  outputLastMessage?: string;
}

/**
 * Result of executing a command on a platform runner.
 */
export interface ExecutionResult {
  success: boolean;
  output: string;
  exitCode: number;
  duration: number;
  tokensUsed?: number;
  sessionId?: string;
  processId: number;
  error?: string;
}

/**
 * Event emitted during streaming execution.
 */
export interface ExecutionEvent {
  type: 'started' | 'output' | 'tool_use' | 'error' | 'complete';
  timestamp: number;
  data: unknown;
}

/**
 * Information about a running process.
 */
export interface ProcessInfo {
  pid: number;
  platform: Platform;
  startedAt: string;
  status: 'running' | 'completed' | 'killed';
}

/**
 * Configuration for creating a session.
 */
export interface SessionConfig {
  platform: Platform;
  workingDirectory: string;
  model?: string;
  timeout?: number;
}

/**
 * Represents a session with a platform.
 */
export interface Session {
  id: string;
  platform: Platform;
  createdAt: string;
  status: 'active' | 'completed' | 'expired';
}

/**
 * Platform capabilities discovered at runtime.
 * 
 * NOTE: This uses a simplified structure per task specification.
 * PROMPT_NEXT.md shows an enhanced version with CapabilityStatus objects
 * instead of booleans for capabilities fields.
 * 
 * Per REQUIREMENTS.md Section 22.4.
 */
export interface PlatformCapabilities {
  platform: Platform;
  version: string;
  discoveredAt: string;
  capabilities: {
    nonInteractive: boolean;
    modelSelection: boolean;
    streaming: 'full' | 'partial' | 'none';
    sessionResume: boolean;
    mcpSupport: boolean;
  };
  availableModels: string[];
  smokeTest: SmokeTestResult | null;
}

/**
 * Result of smoke tests run to verify platform capabilities.
 */
export interface SmokeTestResult {
  passed: boolean;
  output: string;
  durationMs: number;
  tests: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
}

/**
 * Runner contract that every platform runner MUST implement.
 * 
 * Per REQUIREMENTS.md Section 26.2.
 * Critical: spawnFreshProcess MUST create a NEW process (fresh agent).
 */
export interface PlatformRunnerContract {
  readonly platform: Platform;
  readonly sessionReuseAllowed: boolean;
  readonly allowedContextFiles: string[];
  readonly defaultTimeout: number;
  readonly hardTimeout: number;

  spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>;
  prepareWorkingDirectory(path: string): Promise<void>;
  cleanupAfterExecution(pid: number): Promise<void>;
  terminateProcess(pid: number): Promise<void>;
  forceKillProcess(pid: number): Promise<void>;
  captureStdout(pid: number): AsyncIterable<string>;
  captureStderr(pid: number): AsyncIterable<string>;
  getTranscript(pid: number): Promise<string>;
}

/**
 * Represents a running process spawned by a platform runner.
 * 
 * NOTE: Task specification uses NodeJS stream types.
 * PROMPT_NEXT.md shows a different structure with AsyncIterable
 * and waitForExit method.
 */
export interface RunningProcess {
  pid: number;
  platform: Platform;
  startedAt: string;
  stdin: NodeJS.WritableStream;
  stdout: NodeJS.ReadableStream;
  stderr: NodeJS.ReadableStream;
}
