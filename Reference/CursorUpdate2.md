# Cursor CLI Modernization Implementation Guide

## Overview

This document contains detailed implementation specifications for updating RWM Puppet Master to leverage new Cursor CLI 2.4 features. All changes are additive and backward compatible.

**Status**: Review Document - No code changes have been made yet.

---

## Table of Contents

1. [Phase 1: Core Runner Enhancements](#phase-1-core-runner-enhancements)
2. [Phase 2: Authentication & Status](#phase-2-authentication--status)
3. [Phase 3: MCP Integration](#phase-3-mcp-integration)
4. [Phase 4: Model Management](#phase-4-model-management)
5. [Phase 5: Permissions System](#phase-5-permissions-system)
6. [Phase 6: GUI Enhancements](#phase-6-gui-enhancements)
7. [Phase 7: Installation & Setup](#phase-7-installation--setup)
8. [Phase 8: Documentation Updates](#phase-8-documentation-updates)
9. [Testing Strategy](#testing-strategy)
10. [Migration Guide](#migration-guide)

---

## Phase 1: Core Runner Enhancements

### Task 1.1: Add Ask Mode Support

**File**: `src/platforms/cursor-runner.ts`

#### Changes Required

1. **Add ask mode support flag to ExecutionRequest type**
   - File: `src/types/platforms.ts`
   - Add: `askMode?: boolean;` to `ExecutionRequest` interface (line ~32)

2. **Update CursorRunner class**
   - Add private field: `private askModeFlagSupport: boolean | null = null;`
   - Add private field: `private askModeFlagSupportProbedAt: number = 0;`
   - Add method: `private async ensureAskModeFlagSupport(): Promise<boolean>`
   - Add method: `private async probeAskModeFlagSupport(): Promise<boolean>`
   - Update `spawn()` method to check ask mode support
   - Update `buildArgs()` method to include `--mode=ask` when `request.askMode === true`

#### Code Changes

```typescript
// In src/types/platforms.ts - ExecutionRequest interface
export interface ExecutionRequest {
  prompt: string;
  model?: string;
  planMode?: boolean;
  askMode?: boolean;  // NEW: Enable read-only exploration mode
  workingDirectory: string;
  timeout?: number;
  hardTimeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
}

// In src/platforms/cursor-runner.ts - Add to class
export class CursorRunner extends BasePlatformRunner {
  // ... existing fields ...
  private askModeFlagSupport: boolean | null = null;
  private askModeFlagSupportProbedAt: number = 0;
  private askModeFlagSupportPromise: Promise<boolean> | null = null;

  // Add method similar to ensureModeFlagSupport
  private async ensureAskModeFlagSupport(): Promise<boolean> {
    const cacheAge = Date.now() - this.askModeFlagSupportProbedAt;
    const cacheValid = cacheAge < CursorRunner.MODE_FLAG_CACHE_TTL_MS;

    if (this.askModeFlagSupport !== null && cacheValid) {
      return this.askModeFlagSupport;
    }
    if (this.askModeFlagSupportPromise) {
      return this.askModeFlagSupportPromise;
    }

    this.askModeFlagSupportPromise = this.probeAskModeFlagSupport()
      .catch((error) => {
        console.warn(`[CursorRunner] Failed to probe ask mode support: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      })
      .then((supported) => {
        this.askModeFlagSupport = supported;
        this.askModeFlagSupportProbedAt = Date.now();
        return supported;
      })
      .finally(() => {
        this.askModeFlagSupportPromise = null;
      });

    return this.askModeFlagSupportPromise;
  }

  private async probeAskModeFlagSupport(): Promise<boolean> {
    const helpOutput = await this.getHelpOutput(5000);
    const lower = helpOutput.toLowerCase();

    // Check for --mode=ask flag
    const hasModeAskFlag = /--mode[=\s]+ask\b/i.test(helpOutput);
    if (hasModeAskFlag) {
      return true;
    }

    // Check for ask mode documentation
    const askModeDocumented =
      lower.includes('ask mode') ||
      lower.includes('read-only') ||
      lower.includes('exploration mode');

    return askModeDocumented;
  }

  // Update spawn() method
  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    if (request.planMode === true && this.modeFlagSupport === null) {
      await this.ensureModeFlagSupport();
    }

    // NEW: Check ask mode support
    if (request.askMode === true && this.askModeFlagSupport === null) {
      await this.ensureAskModeFlagSupport();
    }

    const args = this.buildArgs(request);
    // ... rest of method unchanged ...
  }

  // Update buildArgs() method
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    if (request.nonInteractive) {
      args.push('-p');
    }

    // Plan mode (existing)
    if (request.planMode === true && this.modeFlagSupport === true) {
      args.push('--mode=plan');
    }

    // NEW: Ask mode
    if (request.askMode === true && this.askModeFlagSupport === true) {
      args.push('--mode=ask');
    }

    if (request.model) {
      args.push('--model', request.model);
    }

    return args;
  }
}
```

#### Testing

- Unit test: Verify `--mode=ask` flag is added when `askMode: true`
- Unit test: Verify ask mode detection works correctly
- Integration test: Execute with ask mode and verify read-only behavior

---

### Task 1.2: Add Output Format Support

**File**: `src/platforms/cursor-runner.ts`

#### Changes Required

1. **Add output format to ExecutionRequest type**
   - File: `src/types/platforms.ts`
   - Add: `outputFormat?: 'text' | 'json' | 'stream-json';` to `ExecutionRequest` interface
   - Add: `streamPartialOutput?: boolean;` to `ExecutionRequest` interface

2. **Create JSON output parser**
   - New file: `src/platforms/output-parsers/cursor-json-output-parser.ts`
   - Parse JSON format responses
   - Parse stream-json (NDJSON) format responses

3. **Update CursorRunner**
   - Update `buildArgs()` to include `--output-format` flag
   - Update `parseOutput()` to handle JSON/stream-json formats
   - Add streaming support for `stream-json` format

#### Code Changes

```typescript
// In src/types/platforms.ts - ExecutionRequest interface
export interface ExecutionRequest {
  // ... existing fields ...
  outputFormat?: 'text' | 'json' | 'stream-json';  // NEW
  streamPartialOutput?: boolean;  // NEW: Only valid with stream-json
}

// New file: src/platforms/output-parsers/cursor-json-output-parser.ts
import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Parser for Cursor CLI JSON and stream-json output formats.
 */
export class CursorJsonOutputParser extends BaseOutputParser {
  /**
   * Parse JSON format output (single JSON object).
   */
  parseJson(output: string): ParsedPlatformOutput {
    try {
      const json = JSON.parse(output);

      // Extract result from JSON structure
      // Format: { type: "result", subtype: "success", result: "...", ... }
      const result = json.result || json.message || '';
      const sessionId = json.session_id;
      const duration = json.duration_ms;

      return {
        completionSignal: json.is_error ? 'GUTTER' : 'COMPLETE',
        filesChanged: [],
        testResults: [],
        errors: json.is_error ? [result] : [],
        warnings: [],
        rawOutput: output,
        sessionId,
        tokensUsed: undefined,
      };
    } catch (error) {
      return this.createBaseParsedOutput(output);
    }
  }

  /**
   * Parse stream-json format (NDJSON - one JSON object per line).
   */
  parseStreamJson(output: string): ParsedPlatformOutput {
    const lines = output.trim().split('\n');
    let finalResult = '';
    let sessionId: string | undefined;
    let hasError = false;

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line);

        // Handle different event types
        switch (event.type) {
          case 'assistant':
            if (event.message?.content?.[0]?.text) {
              finalResult += event.message.content[0].text;
            }
            break;
          case 'result':
            if (event.subtype === 'success') {
              finalResult = event.result || finalResult;
              sessionId = event.session_id;
            } else {
              hasError = true;
            }
            break;
          case 'tool_call':
            // Track tool calls if needed
            break;
        }
      } catch {
        // Non-JSON line, treat as raw output
        finalResult += line + '\n';
      }
    }

    return {
      completionSignal: hasError ? 'GUTTER' : 'COMPLETE',
      filesChanged: [],
      testResults: [],
      errors: hasError ? [finalResult] : [],
      warnings: [],
      rawOutput: output,
      sessionId,
      tokensUsed: undefined,
    };
  }
}

// In src/platforms/cursor-runner.ts
export class CursorRunner extends BasePlatformRunner {
  private readonly jsonOutputParser: CursorJsonOutputParser;

  constructor(...) {
    // ... existing constructor code ...
    this.jsonOutputParser = new CursorJsonOutputParser();
  }

  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];

    if (request.nonInteractive) {
      args.push('-p');
    }

    // Output format
    if (request.outputFormat) {
      args.push('--output-format', request.outputFormat);

      // Stream partial output (only valid with stream-json)
      if (request.outputFormat === 'stream-json' && request.streamPartialOutput) {
        args.push('--stream-partial-output');
      }
    }

    // ... rest of args building ...
    return args;
  }

  protected parseOutput(output: string, request: ExecutionRequest): ExecutionResult {
    let parsed: ParsedPlatformOutput;

    // Use appropriate parser based on output format
    if (request.outputFormat === 'json') {
      parsed = this.jsonOutputParser.parseJson(output);
    } else if (request.outputFormat === 'stream-json') {
      parsed = this.jsonOutputParser.parseStreamJson(output);
    } else {
      // Default: use text parser
      parsed = this.outputParser.parse(output);
    }

    // ... rest of parsing logic ...
  }
}
```

#### Testing

- Unit test: Verify `--output-format json` flag is added
- Unit test: Verify `--output-format stream-json` flag is added
- Unit test: Verify JSON parsing works correctly
- Unit test: Verify stream-json (NDJSON) parsing works correctly
- Integration test: Execute with JSON format and verify structured output

---

### Task 1.3: Enhance Plan Mode Detection

**File**: `src/platforms/cursor-runner.ts`

#### Changes Required

1. **Update plan mode detection**
   - Enhance `probeModeFlagSupport()` to check for `/plan` slash command
   - Improve fallback prompt when plan mode unavailable

#### Code Changes

```typescript
// In src/platforms/cursor-runner.ts
private async probeModeFlagSupport(): Promise<boolean> {
  const helpOutput = await this.getHelpOutput(5000);
  const lower = helpOutput.toLowerCase();

  // Heuristic 1: Exact flag match (existing)
  const hasModePlanFlag = /--mode[=\s]+plan\b/i.test(helpOutput);
  if (hasModePlanFlag) {
    return true;
  }

  // NEW: Heuristic 2: Check for /plan slash command
  const hasPlanSlashCommand = /\/(plan|ask)\b/i.test(helpOutput) ||
                               lower.includes('slash command') && lower.includes('plan');
  if (hasPlanSlashCommand) {
    return true;
  }

  // Heuristic 3: Mode option with plan as value (existing)
  const hasModeFlagWithPlanValue =
    lower.includes('--mode') &&
    (lower.includes('plan') || lower.includes('read-only') || lower.includes('analysis'));
  if (hasModeFlagWithPlanValue) {
    return true;
  }

  // Heuristic 4: Plan mode documented in help (existing)
  const planModeDocumented =
    lower.includes('plan mode') ||
    lower.includes('planning mode') ||
    lower.includes('read-only mode');

  return planModeDocumented;
}

private buildPrompt(request: ExecutionRequest): string {
  if (request.planMode === true && this.modeFlagSupport === false) {
    // IMPROVED: Better fallback prompt
    const preamble = [
      'MODE: PLAN FIRST, THEN EXECUTE',
      '',
      'Instructions:',
      '1. Start with a concise plan (max 10 bullets) outlining your approach.',
      '2. Then immediately carry out the plan and make the required changes.',
      '3. Run the required tests/commands and report results.',
      '4. If you encounter issues, explain what went wrong and suggest fixes.',
      '',
      'Task:',
    ].join('\n');
    return `${preamble}\n${request.prompt}`;
  }

  return request.prompt;
}
```

#### Testing

- Unit test: Verify enhanced plan mode detection
- Unit test: Verify improved fallback prompt

---

## Phase 2: Authentication & Status

### Task 2.1: Add Authentication Status Check

**File**: `src/doctor/checks/cli-tools.ts`

#### Changes Required

1. **Update CursorCliCheck class**
   - Add `agent status` command execution
   - Parse authentication status from output
   - Report authentication state in check results

#### Code Changes

```typescript
// In src/doctor/checks/cli-tools.ts - CursorCliCheck class
export class CursorCliCheck implements DoctorCheck {
  // ... existing code ...

  async run(): Promise<CheckResult> {
    // ... existing CLI availability check ...

    if (selected && versionResult?.available) {
      // NEW: Check authentication status
      const authStatus = await this.checkAuthStatus(selected);

      const helpResult = await checkCliAvailable(selected, ['--help'], 5000);

      // Combine auth status with existing checks
      const passed = helpResult.available && authStatus.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Cursor CLI is installed, runnable, and authenticated`
          : authStatus.status === 'not_authenticated'
            ? `Cursor CLI is installed and runnable but not authenticated`
            : `Cursor CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${helpResult.available ? 'yes' : 'no'}. Auth: ${authStatus.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}. ${authStatus.details ? ` ${authStatus.details}` : ''}`.trim(),
        fixSuggestion: authStatus.status === 'not_authenticated' ? authStatus.fixSuggestion : undefined,
        durationMs: 0,
      };
    }
    // ... rest of method ...
  }

  private async checkAuthStatus(invocation: CliInvocation): Promise<{
    status: 'authenticated' | 'not_authenticated' | 'unknown';
    details?: string;
    fixSuggestion?: string;
  }> {
    try {
      const result = await checkCliAvailable(invocation, ['status'], 10000);

      if (!result.available) {
        return {
          status: 'unknown',
          details: 'Could not check auth status',
        };
      }

      const output = result.version || ''; // Reuse version field for status output
      const lower = output.toLowerCase();

      // Parse authentication status from output
      // Expected format: "Authenticated: yes" or "Status: authenticated"
      if (lower.includes('authenticated') && (lower.includes('yes') || lower.includes('true'))) {
        return {
          status: 'authenticated',
          details: 'Cursor CLI is authenticated',
        };
      }

      if (lower.includes('not authenticated') || lower.includes('unauthenticated')) {
        return {
          status: 'not_authenticated',
          details: 'Cursor CLI is not authenticated',
          fixSuggestion: 'Run `agent login` to authenticate with Cursor',
        };
      }

      return {
        status: 'unknown',
        details: 'Could not determine authentication status',
      };
    } catch (error) {
      return {
        status: 'unknown',
        details: `Error checking auth: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
```

#### Testing

- Unit test: Verify auth status check works
- Unit test: Verify fix suggestion for unauthenticated state
- Integration test: Test with authenticated and unauthenticated Cursor CLI

---

### Task 2.2: Create Authentication Helper

**File**: `src/platforms/auth-status.ts`

#### Changes Required

1. **Add getCursorAuthStatus() function**
   - Execute `agent status` command
   - Parse output to determine authentication status
   - Return structured auth status object

#### Code Changes

```typescript
// In src/platforms/auth-status.ts
import { spawn } from 'child_process';
import { PLATFORM_COMMANDS } from './constants.js';

/**
 * Cursor authentication status result.
 */
export interface CursorAuthStatus {
  status: 'authenticated' | 'not_authenticated' | 'unknown';
  details?: string;
  fixSuggestion?: string;
  apiKeySource?: 'env' | 'flag' | 'login' | 'unknown';
}

/**
 * Get Cursor CLI authentication status by executing `agent status`.
 *
 * @param command - Cursor CLI command path (default: 'cursor-agent')
 * @returns Promise resolving to authentication status
 */
export async function getCursorAuthStatus(
  command: string = PLATFORM_COMMANDS.cursor
): Promise<CursorAuthStatus> {
  return new Promise((resolve) => {
    const proc = spawn(command, ['status'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({
        status: 'unknown',
        details: 'Command timed out',
      });
    }, 10000);

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        resolve({
          status: 'unknown',
          details: `Command failed with code ${code}: ${stderr || stdout}`,
        });
        return;
      }

      const output = (stdout || stderr).toLowerCase();

      // Parse authentication status
      const isAuthenticated =
        (output.includes('authenticated') && (output.includes('yes') || output.includes('true'))) ||
        output.includes('api key') && !output.includes('not set');

      const isNotAuthenticated =
        output.includes('not authenticated') ||
        output.includes('unauthenticated') ||
        (output.includes('api key') && output.includes('not set'));

      // Detect API key source
      let apiKeySource: 'env' | 'flag' | 'login' | 'unknown' = 'unknown';
      if (output.includes('api key source: env') || output.includes('curs_api_key')) {
        apiKeySource = 'env';
      } else if (output.includes('api key source: flag')) {
        apiKeySource = 'flag';
      } else if (output.includes('api key source: login') || output.includes('browser')) {
        apiKeySource = 'login';
      }

      if (isAuthenticated) {
        resolve({
          status: 'authenticated',
          details: 'Cursor CLI is authenticated',
          apiKeySource,
        });
      } else if (isNotAuthenticated) {
        resolve({
          status: 'not_authenticated',
          details: 'Cursor CLI is not authenticated',
          fixSuggestion: 'Run `agent login` to authenticate with Cursor, or set CURSOR_API_KEY environment variable',
          apiKeySource,
        });
      } else {
        resolve({
          status: 'unknown',
          details: 'Could not determine authentication status from output',
          apiKeySource,
        });
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        status: 'unknown',
        details: `Error executing command: ${error.message}`,
      });
    });
  });
}
```

#### Testing

- Unit test: Verify getCursorAuthStatus() parses authenticated status
- Unit test: Verify getCursorAuthStatus() parses not_authenticated status
- Unit test: Verify API key source detection
- Integration test: Test with actual Cursor CLI

---

## Phase 3: MCP Integration

### Task 3.1: Detect MCP Configuration

**New File**: `src/platforms/mcp-detector.ts`

#### Changes Required

1. **Create MCP detector module**
   - Check for `.cursor/mcp.json` in project root
   - Check for global MCP config
   - List available MCP servers
   - Report MCP status

#### Code Changes

```typescript
// New file: src/platforms/mcp-detector.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

/**
 * MCP server configuration from mcp.json.
 */
export interface McpServerConfig {
  type: 'stdio' | 'http' | 'sse';
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}

/**
 * MCP configuration structure.
 */
export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

/**
 * Detected MCP configuration.
 */
export interface McpDetectionResult {
  found: boolean;
  configPath?: string;
  config?: McpConfig;
  serverIds: string[];
  error?: string;
}

/**
 * Detect MCP configuration from project or global locations.
 */
export async function detectMcpConfig(
  projectRoot?: string
): Promise<McpDetectionResult> {
  const configPaths: string[] = [];

  if (projectRoot) {
    configPaths.push(join(projectRoot, '.cursor', 'mcp.json'));
  }

  const homeDir = homedir();
  if (homeDir) {
    configPaths.push(join(homeDir, '.cursor', 'mcp.json'));
  }

  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    configPaths.push(join(xdgConfigHome, 'cursor', 'mcp.json'));
  }

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const config: McpConfig = JSON.parse(content);
        const serverIds = Object.keys(config.mcpServers || {});
        return {
          found: true,
          configPath,
          config,
          serverIds,
        };
      } catch (error) {
        return {
          found: true,
          configPath,
          serverIds: [],
          error: `Failed to parse MCP config: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }

  return {
    found: false,
    serverIds: [],
  };
}

/**
 * List MCP servers using `agent mcp list` command.
 */
export async function listMcpServers(
  command: string = 'cursor-agent'
): Promise<{ success: boolean; servers: string[]; error?: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, ['mcp', 'list'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({
        success: false,
        servers: [],
        error: 'Command timed out',
      });
    }, 15000);

    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        resolve({
          success: false,
          servers: [],
          error: `Command failed with code ${code}: ${stderr || stdout}`,
        });
        return;
      }
      const lines = (stdout || stderr).split('\n');
      const servers: string[] = [];
      for (const line of lines) {
        const match = line.match(/(?:server|mcp)[:\s]+([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) servers.push(match[1]);
      }
      resolve({ success: true, servers });
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        servers: [],
        error: error.message,
      });
    });
  });
}
```

#### Integration with CursorRunner

```typescript
// In src/platforms/cursor-runner.ts - Add import
import { detectMcpConfig, listMcpServers } from './mcp-detector.js';

export class CursorRunner extends BasePlatformRunner {
  async getMcpStatus(projectRoot?: string): Promise<{
    configured: boolean;
    servers: string[];
    error?: string;
  }> {
    const detection = await detectMcpConfig(projectRoot);
    if (!detection.found) {
      return { configured: false, servers: [] };
    }
    const listResult = await listMcpServers(this.command);
    return {
      configured: true,
      servers: listResult.success ? listResult.servers : detection.serverIds,
      error: listResult.error,
    };
  }
}
```

---

### Task 3.2: Add MCP Status to Doctor

**New File**: `src/doctor/checks/mcp.ts`

#### Changes Required

1. **Create CursorMcpCheck class**
   - Check for MCP configuration files
   - List configured MCP servers
   - Report MCP server status

#### Code Changes

```typescript
// New file: src/doctor/checks/mcp.ts
import type { CheckResult, DoctorCheck } from '../check-registry.js';
import { detectMcpConfig, listMcpServers } from '../../platforms/mcp-detector.js';
import { getCursorCommandCandidates } from '../../platforms/constants.js';
import type { CliPathsConfig } from '../../types/config.js';

export class CursorMcpCheck implements DoctorCheck {
  readonly name = 'cursor-mcp';
  readonly category = 'cli' as const;
  readonly description = 'Check Cursor MCP (Model Context Protocol) configuration';

  constructor(
    private readonly projectRoot?: string,
    private readonly cliPaths?: Partial<CliPathsConfig> | null
  ) {}

  async run(): Promise<CheckResult> {
    const detection = await detectMcpConfig(this.projectRoot);

    if (!detection.found) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'MCP configuration not found (optional)',
        details: 'MCP is optional. Create .cursor/mcp.json or ~/.cursor/mcp.json to configure.',
        fixSuggestion: 'See https://cursor.com/docs/context/mcp for MCP configuration guide',
        durationMs: 0,
      };
    }

    if (detection.error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'MCP configuration file found but invalid',
        details: detection.error,
        fixSuggestion: 'Fix JSON syntax errors in MCP configuration file',
        durationMs: 0,
      };
    }

    const candidates = getCursorCommandCandidates(this.cliPaths);
    let listResult: { success: boolean; servers: string[]; error?: string } | null = null;
    for (const command of candidates) {
      listResult = await listMcpServers(command);
      if (listResult.success) break;
    }

    const servers = listResult?.servers || detection.serverIds;
    const hasServers = servers.length > 0;

    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: hasServers
        ? `MCP configured with ${servers.length} server(s)`
        : 'MCP configuration found but no servers detected',
      details: `Config: ${detection.configPath}. Servers: ${servers.length > 0 ? servers.join(', ') : 'none'}.`,
      fixSuggestion: hasServers ? undefined : 'Ensure MCP servers are properly configured in mcp.json',
      durationMs: 0,
    };
  }
}
```

---

## Phase 4: Model Management

### Task 4.1: Dynamic Model Discovery

**File**: `src/platforms/cursor-models.ts`

#### Changes Required

1. **Add model discovery function**
   - Execute `agent models` or `agent --list-models`
   - Parse model list from output
   - Cache discovered models
   - Merge with curated model list

#### Code Changes

```typescript
// In src/platforms/cursor-models.ts
import { spawn } from 'child_process';
import { PLATFORM_COMMANDS } from './constants.js';

interface ModelDiscoveryCache {
  models: string[];
  discoveredAt: number;
  command: string;
}

const modelCache = new Map<string, ModelDiscoveryCache>();
const CACHE_TTL_MS = 3600_000;

export async function discoverCursorModels(
  command: string = PLATFORM_COMMANDS.cursor,
  useCache: boolean = true
): Promise<string[]> {
  if (useCache) {
    const cached = modelCache.get(command);
    if (cached && Date.now() - cached.discoveredAt < CACHE_TTL_MS) {
      return cached.models;
    }
  }

  return new Promise((resolve) => {
    const proc = spawn(command, ['models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve(getCursorModelIds());
    }, 10000);

    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        discoverModelsWithFlag(command).then(resolve).catch(() => resolve(getCursorModelIds()));
        return;
      }
      const models = parseModelList(stdout || stderr);
      if (models.length > 0) {
        modelCache.set(command, { models, discoveredAt: Date.now(), command });
        resolve(models);
      } else {
        resolve(getCursorModelIds());
      }
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve(getCursorModelIds());
    });
  });
}

async function discoverModelsWithFlag(command: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, ['--list-models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('Timeout')); }, 10000);
    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(parseModelList(stdout || stderr));
      else reject(new Error(`Command failed with code ${code}`));
    });
    proc.on('error', (error) => { clearTimeout(timer); reject(error); });
  });
}

function parseModelList(output: string): string[] {
  const models: string[] = [];
  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.toLowerCase().includes('model')) continue;
    const match = trimmed.match(/(?:^|\s)[-*]?\s*([a-zA-Z0-9._-]+)/);
    if (match && match[1]) {
      const modelId = match[1].trim();
      if (modelId && !['auto', 'models', 'available', 'list'].includes(modelId.toLowerCase())) {
        models.push(modelId);
      }
    }
  }
  return [...new Set(models)];
}

export async function getAllCursorModels(
  command: string = PLATFORM_COMMANDS.cursor,
  includeDiscovered: boolean = true
): Promise<string[]> {
  const curated = getCursorModelIds();
  if (!includeDiscovered) return curated;
  try {
    const discovered = await discoverCursorModels(command, true);
    return [...new Set([...curated, ...discovered])];
  } catch {
    return curated;
  }
}

export function clearModelDiscoveryCache(): void {
  modelCache.clear();
}
```

---

### Task 4.2: Model Availability Check

**File**: `src/platforms/cursor-runner.ts`

#### Code Changes

```typescript
// In src/platforms/cursor-runner.ts
import { getAllCursorModels } from './cursor-models.js';

export class CursorRunner extends BasePlatformRunner {
  private availableModelsCache: string[] | null = null;
  private modelsCacheTime: number = 0;
  private static readonly MODELS_CACHE_TTL_MS = 3600_000;

  private async validateModel(request: ExecutionRequest): Promise<string | undefined> {
    if (!request.model) return undefined;

    const cacheAge = Date.now() - this.modelsCacheTime;
    if (!this.availableModelsCache || cacheAge > CursorRunner.MODELS_CACHE_TTL_MS) {
      try {
        this.availableModelsCache = await getAllCursorModels(this.command, true);
        this.modelsCacheTime = Date.now();
      } catch {
        return request.model;
      }
    }

    const modelLower = request.model.toLowerCase();
    const isAvailable = this.availableModelsCache.some(m => m.toLowerCase() === modelLower);
    if (isAvailable) return request.model;

    console.warn(
      `[CursorRunner] Model "${request.model}" not found. Falling back to "auto".`
    );
    return 'auto';
  }

  protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
    const validatedModel = await this.validateModel(request);
    if (validatedModel !== request.model) {
      request = { ...request, model: validatedModel };
    }
    // ... rest of spawn ...
  }
}
```

---

## Phase 5: Permissions System

### Task 5.1: Detect Permissions Configuration

**New File**: `src/platforms/permissions-detector.ts`

#### Code Changes

```typescript
// New file: src/platforms/permissions-detector.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';

export interface PermissionsConfig {
  permissions: {
    allow?: string[];
    deny?: string[];
  };
}

export interface PermissionsDetectionResult {
  found: boolean;
  configPath?: string;
  config?: PermissionsConfig;
  error?: string;
}

export async function detectPermissionsConfig(
  projectRoot?: string
): Promise<PermissionsDetectionResult> {
  const configPaths: Array<{ path: string; isProject: boolean }> = [];

  if (projectRoot) {
    configPaths.push({ path: join(projectRoot, '.cursor', 'cli.json'), isProject: true });
  }
  const homeDir = homedir();
  if (homeDir) {
    configPaths.push({ path: join(homeDir, '.cursor', 'cli-config.json'), isProject: false });
  }
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    configPaths.push({ path: join(xdgConfigHome, 'cursor', 'cli-config.json'), isProject: false });
  }

  const projectConfigs = configPaths.filter(c => c.isProject);
  const globalConfigs = configPaths.filter(c => !c.isProject);
  const allConfigs = [...projectConfigs, ...globalConfigs];

  for (const { path } of allConfigs) {
    if (existsSync(path)) {
      try {
        const content = await fs.readFile(path, 'utf-8');
        const config: PermissionsConfig = JSON.parse(content);
        return { found: true, configPath: path, config };
      } catch (error) {
        return {
          found: true,
          configPath: path,
          error: `Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }
  return { found: false };
}

export function getPermissionsSummary(config: PermissionsConfig): {
  allowCount: number;
  denyCount: number;
  hasRestrictions: boolean;
} {
  const allow = config.permissions?.allow || [];
  const deny = config.permissions?.deny || [];
  return {
    allowCount: allow.length,
    denyCount: deny.length,
    hasRestrictions: allow.length > 0 || deny.length > 0,
  };
}
```

---

### Task 5.2: Add Permissions Check to Doctor

**New File**: `src/doctor/checks/permissions.ts`

#### Code Changes

```typescript
// New file: src/doctor/checks/permissions.ts
import type { CheckResult, DoctorCheck } from '../check-registry.js';
import { detectPermissionsConfig, getPermissionsSummary } from '../../platforms/permissions-detector.js';
import type { CliPathsConfig } from '../../types/config.js';

export class CursorPermissionsCheck implements DoctorCheck {
  readonly name = 'cursor-permissions';
  readonly category = 'cli' as const;
  readonly description = 'Check Cursor CLI permissions configuration';

  constructor(
    private readonly projectRoot?: string,
    private readonly cliPaths?: Partial<CliPathsConfig> | null
  ) {}

  async run(): Promise<CheckResult> {
    const detection = await detectPermissionsConfig(this.projectRoot);

    if (!detection.found) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'Permissions configuration not found (optional)',
        details: 'Create .cursor/cli.json or ~/.cursor/cli-config.json to configure.',
        fixSuggestion: 'See https://cursor.com/docs/cli/reference/permissions',
        durationMs: 0,
      };
    }

    if (detection.error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'Permissions configuration file found but invalid',
        details: detection.error,
        fixSuggestion: 'Fix JSON syntax errors',
        durationMs: 0,
      };
    }

    const summary = getPermissionsSummary(detection.config!);
    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: summary.hasRestrictions
        ? `Permissions configured (${summary.allowCount} allow, ${summary.denyCount} deny)`
        : 'Permissions configuration found but empty',
      details: `Config: ${detection.configPath}. Allow: ${summary.allowCount}. Deny: ${summary.denyCount}.`,
      fixSuggestion: summary.hasRestrictions ? undefined : 'Add allow/deny rules',
      durationMs: 0,
    };
  }
}
```

---

## Phase 6: GUI Enhancements

### Task 6.1: Update CLI Capabilities Display

**File**: `src/gui/react/src/pages/Settings.tsx` or capabilities page

- Add MCP server status section
- Add authentication status indicator
- Add available models list (from dynamic discovery)
- Add permissions configuration display

### Task 6.2: Add MCP Management UI

- Display configured MCP servers
- Show enable/disable status
- Provide MCP server management interface (e.g. `agent mcp enable/disable`)

---

## Phase 7: Installation & Setup

### Task 7.1: Enhance Installation Manager

**File**: `src/doctor/installation-manager.ts`

- Add `getPostInstallInstructions(checkName: string): string[]` returning steps for Cursor CLI:
  - Add `~/.local/bin` to PATH (bash/zsh)
  - Run `agent login` or set `CURSOR_API_KEY`
  - Optional: create `.cursor/mcp.json`, `.cursor/cli.json`
- After successful `cursor-cli` install, log these instructions.

### Task 7.2: Update Installer Scripts

**Files**: `installer/linux/scripts/postinstall`, `installer/mac/scripts/postinstall`

- Ensure `~/.local/bin` is added to PATH when missing (detect bash/zsh).
- Print post-install steps: authenticate, optional MCP/permissions setup, links to docs.

---

## Phase 8: Documentation Updates

### Task 8.1: Update REQUIREMENTS.md

- Cursor CLI section: document `-p`, `--model`, `--mode=plan`, `--mode=ask`, `--output-format`, `--stream-partial-output`.
- Add auth: `agent login`, `CURSOR_API_KEY`, `agent status`.
- Add model management: `agent models`, `--list-models`.
- Add MCP: `mcp.json` locations, `agent mcp list/enable/disable/login`.
- Add permissions: `cli.json` / `cli-config.json`, allow/deny examples.

### Task 8.2: Update AGENTS.md

- Update Cursor CLI command examples with new flags and subcommands.
- Document Plan/Ask modes, output formats, MCP, permissions, model discovery.

---

## Testing Strategy

- **Unit tests**: CursorRunner (ask mode, output format, model validation), output parsers, auth helper, MCP detector, permissions detector, doctor checks.
- **Integration tests**: End-to-end Cursor CLI runs with new flags, MCP config, auth status.
- **Smoke tests**: Extend to cover ask mode, output formats, model discovery, MCP detection.

---

## Migration Guide

- All changes are **additive** and **backward compatible**.
- Existing configs and usage continue to work.
- New features (ask mode, output formats, MCP, permissions, model discovery) are optional and can be adopted gradually.

---

## Implementation Checklist

### Phase 1: Core Runner Enhancements
- [ ] Task 1.1: Add Ask Mode Support
- [ ] Task 1.2: Add Output Format Support
- [ ] Task 1.3: Enhance Plan Mode Detection

### Phase 2: Authentication & Status
- [ ] Task 2.1: Add Authentication Status Check
- [ ] Task 2.2: Create Authentication Helper

### Phase 3: MCP Integration
- [ ] Task 3.1: Detect MCP Configuration
- [ ] Task 3.2: Add MCP Status to Doctor

### Phase 4: Model Management
- [ ] Task 4.1: Dynamic Model Discovery
- [ ] Task 4.2: Model Availability Check

### Phase 5: Permissions System
- [ ] Task 5.1: Detect Permissions Configuration
- [ ] Task 5.2: Add Permissions Check to Doctor

### Phase 6: GUI Enhancements
- [ ] Task 6.1: Update CLI Capabilities Display
- [ ] Task 6.2: Add MCP Management UI

### Phase 7: Installation & Setup
- [ ] Task 7.1: Enhance Installation Manager
- [ ] Task 7.2: Update Installer Scripts

### Phase 8: Documentation Updates
- [ ] Task 8.1: Update REQUIREMENTS.md
- [ ] Task 8.2: Update AGENTS.md

---

## Dependencies

- Cursor CLI 2.4+ (January 2026)
- Existing capability discovery and doctor systems
- No new npm dependencies required

---

**End of Implementation Guide**
