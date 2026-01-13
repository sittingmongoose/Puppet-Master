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
  workingDirectory: string;
  timeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
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
