# Cursor CLI Integration Update - Implementation Details

## Overview

This document outlines all the changes needed to update RWM Puppet Master's Cursor CLI integration to align with the latest Cursor CLI documentation (January 2026 updates). All changes are documented here for review before implementation.

---

## Phase 1: Command Name and Basic Updates

### 1.1 Update `src/platforms/constants.ts`

**Change 1: Update default command name**
```typescript
// BEFORE:
cursor: process.platform === 'win32' ? 'cursor-agent.exe' : 'cursor-agent',

// AFTER:
cursor: process.platform === 'win32' ? 'agent.exe' : 'agent',
```

**Change 2: Update command candidates order**
```typescript
// In getCursorCommandCandidates(), update the alternate command names section:
// BEFORE:
if (process.platform === 'win32') {
  candidates.push('cursor.exe', 'cursor-agent.exe', 'agent.exe');
} else {
  candidates.push('cursor', 'cursor-agent', 'agent');
}

// AFTER:
if (process.platform === 'win32') {
  candidates.push('agent.exe', 'cursor-agent.exe', 'cursor.exe');
} else {
  candidates.push('agent', 'cursor-agent', 'cursor');
}
```

**Change 3: Update known installation paths**
Add paths for `agent` command:
```typescript
// Add to CURSOR_KNOWN_PATHS:
process.env.HOME ? join(process.env.HOME, '.local', 'bin', 'agent') : '',
process.env.HOME ? join(process.env.HOME, 'bin', 'agent') : '',
'/opt/homebrew/bin/agent',
'/usr/local/bin/agent',
process.env.HOME ? join(process.env.HOME, '.local', 'share', 'cursor', 'agent') : '',

// Add to CURSOR_KNOWN_PATHS_WIN32:
process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'cursor', 'resources', 'app', 'bin', 'agent.exe') : '',
process.env.APPDATA ? join(process.env.APPDATA, 'npm', 'agent.exe') : '',
```

**Change 4: Update comment**
```typescript
// BEFORE:
/**
 * Default CLI command names for each platform.
 *
 * IMPORTANT: Keep these aligned with repository fixtures and docs.
 * `REQUIREMENTS.md` currently documents Cursor as `cursor-agent`.
 */

// AFTER:
/**
 * Default CLI command names for each platform.
 *
 * IMPORTANT: Keep these aligned with repository fixtures and docs.
 * Cursor CLI primary command is now `agent` (as of Jan 2026), with `cursor-agent` as fallback.
 */
```

### 1.2 Update `src/doctor/checks/cli-tools.ts`

**Change: Update CursorCliCheck to prefer `agent`**
```typescript
// The getCursorCommandCandidates() function already handles this, but update the comment:
// BEFORE:
// Check: `command -v cursor-agent || command -v agent` (prefer cursor-agent)

// AFTER:
// Check: `command -v agent || command -v cursor-agent` (prefer agent)
```

### 1.3 Update `src/doctor/installation-manager.ts`

**Change: Verify installation command**
The installation command `curl https://cursor.com/install -fsSL | bash` should still be correct. No changes needed unless Cursor changed their installer.

### 1.4 Update Documentation

**File: `AGENTS.md`**

Update the Cursor CLI section:
```markdown
### Cursor
```bash
# OLD:
cursor --non-interactive --model <model> --prompt <prompt>

# NEW:
agent -p "prompt" --model <model>
# or
agent --print "prompt" --model <model>
# or for interactive mode:
agent
```

**Key capabilities:**
- `agent -p "prompt"` or `agent --print "prompt"` - Non-interactive print mode
- `agent` (no flags) - Interactive mode (default)
- `--model <model>` or `-m <model>` - Model selection
- `--mode <mode>` - Set agent mode: `agent` (default), `plan`, or `ask`
- `--output-format <format>` - Output format: `text` (default), `json`, or `stream-json`
- `--stream-partial-output` - Stream partial output as individual text deltas (with stream-json)
- `agent models` or `--list-models` - List all available models
- `agent mcp list` - List configured MCP servers
- `agent mcp enable <name>` - Enable an MCP server
- `agent mcp disable <name>` - Disable an MCP server
- `agent ls` - List previous conversations
- `agent resume` - Resume the latest conversation
- `agent resume <chat-id>` - Resume specific conversation
- Reads AGENTS.md and CLAUDE.md from project root (if present)
- Supports MCP via `.cursor/mcp.json` or `mcp.json`
- `/model` command in interactive mode to switch models
- `/plan` command to switch to Plan mode
- `/ask` command to switch to Ask mode
- `/compress` to free context space
```

**File: `REQUIREMENTS.md`**

Update Section 3.1:
```markdown
| Cursor | `agent` | ✅ | Text/JSON | Primary command is `agent`; `cursor-agent` still supported |
```

Update Section 4 (Constraint: No APIs):
```markdown
All agent interactions happen via CLI invocations only:
- `agent "prompt" [flags]` or `agent -p "prompt" [flags]`
- `codex "prompt" [flags]`
- `claude -p "prompt" [flags]`
...
```

---

## Phase 2: Mode Support (Plan and Ask)

### 2.1 Update `src/types/platforms.ts`

**Change: Add askMode to ExecutionRequest**
```typescript
export interface ExecutionRequest {
  prompt: string;
  model?: string;
  /**
   * Enable platform "plan mode" (best-effort; currently used by Cursor runner).
   */
  planMode?: boolean;
  /**
   * Enable platform "ask mode" for read-only exploration (Cursor CLI only).
   * When true, agent will not make file changes, only read and answer questions.
   */
  askMode?: boolean;
  workingDirectory: string;
  timeout?: number;
  hardTimeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
}
```

### 2.2 Update `src/types/config.ts`

**Change: Add askMode to TierConfig**
```typescript
export interface TierConfig {
  platform: Platform;
  model: string;
  /**
   * Enable Cursor "plan mode" for this tier (best-effort).
   *
   * YAML: plan_mode
   * Notes:
   * - Only meaningful for Cursor CLI, ignored by other platforms.
   * - If the platform CLI does not support a dedicated plan mode flag, the runner
   *   should fall back to a plan-first instruction in the prompt.
   */
  planMode?: boolean;
  /**
   * Enable Cursor "ask mode" for this tier (read-only exploration).
   *
   * YAML: ask_mode
   * Notes:
   * - Only meaningful for Cursor CLI, ignored by other platforms.
   * - When enabled, agent will not make file changes, only read and answer questions.
   */
  askMode?: boolean;
  selfFix: boolean; // YAML: self_fix
  // ... rest of interface
}
```

### 2.3 Update `src/platforms/cursor-runner.ts`

**Change 1: Add askMode support detection**
```typescript
// Add new private fields:
private askModeSupport: boolean | null = null;
private askModeSupportPromise: Promise<boolean> | null = null;
private askModeSupportProbedAt: number = 0;
private static readonly ASK_MODE_CACHE_TTL_MS = 3600_000;
```

**Change 2: Update buildArgs method**
```typescript
protected buildArgs(request: ExecutionRequest): string[] {
  const args: string[] = [];

  // Non-interactive mode (print mode)
  if (request.nonInteractive) {
    args.push('-p');
  }

  // Cursor plan mode (best-effort; requires CLI support)
  if (request.planMode === true && this.modeFlagSupport === true) {
    args.push('--mode=plan');
  }

  // Cursor ask mode (read-only exploration)
  if (request.askMode === true) {
    // Check if ask mode is supported
    if (this.askModeSupport === null) {
      // Will be probed asynchronously, but for now add the flag
      // The probe will happen in ensureAskModeSupport()
    }
    if (this.askModeSupport !== false) {
      args.push('--mode=ask');
    }
  }

  // Model selection
  if (request.model) {
    args.push('--model', request.model);
  }

  return args;
}
```

**Change 3: Add ask mode detection methods**
```typescript
/**
 * Ensure ask mode support is probed with cache invalidation.
 */
private async ensureAskModeSupport(): Promise<boolean> {
  const cacheAge = Date.now() - this.askModeSupportProbedAt;
  const cacheValid = cacheAge < CursorRunner.ASK_MODE_CACHE_TTL_MS;
  
  if (this.askModeSupport !== null && cacheValid) {
    return this.askModeSupport;
  }
  if (this.askModeSupportPromise) {
    return this.askModeSupportPromise;
  }

  this.askModeSupportPromise = this.probeAskModeSupport()
    .catch((error) => {
      console.warn(`[CursorRunner] Failed to probe ask mode support: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    })
    .then((supported) => {
      this.askModeSupport = supported;
      this.askModeSupportProbedAt = Date.now();
      if (!supported) {
        console.info('[CursorRunner] Ask mode (--mode=ask) not detected.');
      }
      return supported;
    })
    .finally(() => {
      this.askModeSupportPromise = null;
    });

  return this.askModeSupportPromise;
}

/**
 * Probe for ask mode support.
 */
private async probeAskModeSupport(): Promise<boolean> {
  const helpOutput = await this.getHelpOutput(5000);
  const lower = helpOutput.toLowerCase();
  
  // Check for --mode=ask flag
  const hasModeAskFlag = /--mode[=\s]+ask\b/i.test(helpOutput);
  if (hasModeAskFlag) {
    return true;
  }
  
  // Check for ask mode documented in help
  const askModeDocumented = 
    lower.includes('ask mode') || 
    lower.includes('read-only') ||
    (lower.includes('--mode') && lower.includes('ask'));
  
  return askModeDocumented;
}
```

**Change 4: Update spawn method to check ask mode**
```typescript
protected async spawn(request: ExecutionRequest): Promise<ChildProcess> {
  if (request.planMode === true && this.modeFlagSupport === null) {
    await this.ensureModeFlagSupport();
  }
  
  if (request.askMode === true && this.askModeSupport === null) {
    await this.ensureAskModeSupport();
  }

  const args = this.buildArgs(request);
  // ... rest of method
}
```

**Change 5: Update invalidatePlanModeCache to also invalidate ask mode**
```typescript
public invalidatePlanModeCache(): void {
  this.modeFlagSupport = null;
  this.modeFlagSupportProbedAt = 0;
  this.askModeSupport = null;
  this.askModeSupportProbedAt = 0;
}
```

---

## Phase 3: Model Management

### 3.1 Update `src/platforms/cursor-models.ts`

**Change: Add function to query live models**
```typescript
/**
 * Query Cursor CLI for available models.
 * 
 * @param command - Cursor CLI command (default: 'agent')
 * @returns Promise resolving to array of model IDs, or empty array on error
 */
export async function getAvailableCursorModels(command: string = 'agent'): Promise<string[]> {
  return new Promise((resolve) => {
    const proc = spawn(command, ['models'], {
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
      resolve([]); // Return empty on timeout
    }, 10000);

    proc.stdout?.on('data', (chunk: Buffer | string) => {
      stdout += typeof chunk === 'string' ? chunk : chunk.toString();
    });

    proc.stderr?.on('data', (chunk: Buffer | string) => {
      stderr += typeof chunk === 'string' ? chunk : chunk.toString();
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve([]);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout) {
        // Parse model list from output
        // Format may vary, try to extract model IDs
        const lines = stdout.split('\n');
        const models: string[] = [];
        
        for (const line of lines) {
          // Try to match model IDs (various formats possible)
          const match = line.match(/\b(auto|gpt-[\d.]+|claude-[\d.]+|gemini-[\d.]+|cursor-[\w-]+|grok-[\w-]+|sonnet-[\d.]+|opus-[\d.]+|haiku|flash|deepseek-[\w-]+)\b/i);
          if (match) {
            models.push(match[1].toLowerCase());
          }
        }
        
        // If no matches, try JSON parsing
        if (models.length === 0) {
          try {
            const json = JSON.parse(stdout);
            if (Array.isArray(json)) {
              resolve(json);
            } else if (json.models && Array.isArray(json.models)) {
              resolve(json.models);
            }
          } catch {
            // Not JSON, return empty
          }
        }
        
        resolve(models.length > 0 ? models : CURSOR_MODELS.map(m => m.id));
      } else {
        // Fallback to curated list
        resolve(CURSOR_MODELS.map(m => m.id));
      }
    });
  });
}

/**
 * Alternative: Use --list-models flag if available.
 */
export async function getAvailableCursorModelsViaFlag(command: string = 'agent'): Promise<string[]> {
  return new Promise((resolve) => {
    const proc = spawn(command, ['--list-models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1' },
    });

    let stdout = '';
    const timer = setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {
        // ignore
      }
      resolve(CURSOR_MODELS.map(m => m.id)); // Fallback
    }, 10000);

    proc.stdout?.on('data', (chunk: Buffer | string) => {
      stdout += typeof chunk === 'string' ? chunk : chunk.toString();
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve(CURSOR_MODELS.map(m => m.id));
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && stdout) {
        try {
          const json = JSON.parse(stdout);
          if (Array.isArray(json)) {
            resolve(json);
          } else if (json.models && Array.isArray(json.models)) {
            resolve(json.models);
          }
        } catch {
          // Not JSON, try line-by-line parsing
          const models = stdout.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
          resolve(models.length > 0 ? models : CURSOR_MODELS.map(m => m.id));
        }
      } else {
        resolve(CURSOR_MODELS.map(m => m.id));
      }
    });
  });
}
```

**Note: Add import for spawn at top of file:**
```typescript
import { spawn } from 'child_process';
```

### 3.2 Update `src/platforms/capability-discovery.ts`

**Change: Add model listing capability detection**
```typescript
// In the capability discovery logic, add:
async function detectModelListingCapability(command: string): Promise<boolean> {
  // Try agent models command
  try {
    const proc = spawn(command, ['models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    });
    
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        resolve(false);
      }, 5000);
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve(code === 0);
      });
      
      proc.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}
```

### 3.3 Update `src/gui/routes/config.ts`

**Change: Add endpoint for Cursor models**
```typescript
/**
 * GET /api/config/cursor/models
 * Query Cursor CLI for available models
 */
router.get('/config/cursor/models', async (_req: Request, res: Response) => {
  try {
    const { getAvailableCursorModels, getAvailableCursorModelsViaFlag } = await import('../../platforms/cursor-models.js');
    const { resolvePlatformCommand } = await import('../../platforms/constants.js');
    const { getConfigManager } = await import('../../config/config-manager.js');
    
    const configManager = getConfigManager();
    const config = await configManager.load();
    const command = resolvePlatformCommand('cursor', config.cliPaths);
    
    // Try --list-models flag first, then agent models command
    let models = await getAvailableCursorModelsViaFlag(command);
    if (models.length === 0 || models.length === CURSOR_MODELS.length) {
      // Fallback to agent models command
      models = await getAvailableCursorModels(command);
    }
    
    res.json({
      success: true,
      models,
      command,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
```

### 3.4 Update `src/gui/react/src/pages/Config.tsx`

**Change: Add model selection with live model list**
```typescript
// Add state for Cursor models
const [cursorModels, setCursorModels] = useState<string[]>([]);
const [loadingModels, setLoadingModels] = useState(false);

// Add useEffect to fetch models when Cursor is selected
useEffect(() => {
  const fetchCursorModels = async () => {
    if (config.tiers?.phase?.platform === 'cursor') {
      setLoadingModels(true);
      try {
        const response = await fetch('/api/config/cursor/models');
        const data = await response.json();
        if (data.success && Array.isArray(data.models)) {
          setCursorModels(data.models);
        }
      } catch (error) {
        console.error('Failed to fetch Cursor models:', error);
      } finally {
        setLoadingModels(false);
      }
    }
  };
  
  fetchCursorModels();
}, [config.tiers?.phase?.platform]);

// Update model input to show live models as suggestions
// Add datalist or select dropdown for Cursor models
```

---

## Phase 4: Output Format Support

### 4.1 Update `src/types/platforms.ts`

**Change: Add outputFormat to ExecutionRequest**
```typescript
export interface ExecutionRequest {
  prompt: string;
  model?: string;
  planMode?: boolean;
  askMode?: boolean;
  workingDirectory: string;
  timeout?: number;
  hardTimeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
  /**
   * Output format for the execution result.
   * - 'text': Plain text output (default)
   * - 'json': Single JSON object with result
   * - 'stream-json': Newline-delimited JSON (NDJSON) events
   */
  outputFormat?: 'text' | 'json' | 'stream-json';
  /**
   * Stream partial output as individual text deltas (only with stream-json).
   */
  streamPartialOutput?: boolean;
}
```

### 4.2 Update `src/platforms/cursor-runner.ts`

**Change: Add output format support to buildArgs**
```typescript
protected buildArgs(request: ExecutionRequest): string[] {
  const args: string[] = [];

  // Non-interactive mode (print mode)
  if (request.nonInteractive) {
    args.push('-p');
  }

  // Output format
  if (request.outputFormat && request.outputFormat !== 'text') {
    args.push('--output-format', request.outputFormat);
    
    // Stream partial output (only with stream-json)
    if (request.outputFormat === 'stream-json' && request.streamPartialOutput) {
      args.push('--stream-partial-output');
    }
  }

  // Cursor plan mode
  if (request.planMode === true && this.modeFlagSupport === true) {
    args.push('--mode=plan');
  }

  // Cursor ask mode
  if (request.askMode === true && this.askModeSupport !== false) {
    args.push('--mode=ask');
  }

  // Model selection
  if (request.model) {
    args.push('--model', request.model);
  }

  return args;
}
```

### 4.3 Update `src/platforms/output-parsers/cursor-output-parser.ts`

**Change: Add JSON parsing support**
```typescript
/**
 * Parse JSON output from Cursor CLI.
 */
private parseJsonOutput(output: string): { result?: string; error?: string } {
  try {
    // Try to parse as single JSON object
    const json = JSON.parse(output);
    
    if (typeof json === 'object' && json !== null) {
      if (json.result) {
        return { result: typeof json.result === 'string' ? json.result : JSON.stringify(json.result) };
      }
      if (json.error) {
        return { error: typeof json.error === 'string' ? json.error : JSON.stringify(json.error) };
      }
      // If it's a result object, extract the result field
      return { result: JSON.stringify(json) };
    }
  } catch {
    // Not valid JSON, try NDJSON (stream-json format)
    const lines = output.split('\n').filter(line => line.trim().length > 0);
    let finalResult = '';
    
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.type === 'result' && json.result) {
          finalResult = json.result;
        } else if (json.type === 'assistant' && json.message?.content) {
          const content = json.message.content;
          if (Array.isArray(content)) {
            for (const item of content) {
              if (item.type === 'text' && item.text) {
                finalResult += item.text;
              }
            }
          }
        }
      } catch {
        // Skip invalid JSON lines
      }
    }
    
    if (finalResult) {
      return { result: finalResult };
    }
  }
  
  return {};
}

// Update parse method to handle JSON
parse(output: string): ParsedOutput {
  // Check if output is JSON
  const trimmed = output.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const jsonResult = this.parseJsonOutput(output);
    if (jsonResult.result || jsonResult.error) {
      return {
        completionSignal: jsonResult.error ? 'GUTTER' : 'COMPLETE',
        sessionId: undefined,
        tokensUsed: undefined,
        filesChanged: [],
        testResults: undefined,
      };
    }
  }
  
  // Continue with existing text parsing logic...
  // ... rest of existing parse method
}
```

---

## Phase 5: MCP Management Integration

### 5.1 Update `src/platforms/capability-discovery.ts`

**Change: Add MCP command detection**
```typescript
async function detectMcpCapability(command: string): Promise<boolean> {
  try {
    const proc = spawn(command, ['mcp', 'list'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    });
    
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        resolve(false);
      }, 5000);
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve(code === 0);
      });
      
      proc.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}
```

### 5.2 Update `src/doctor/checks/cli-tools.ts`

**Change: Add MCP capability check to CursorCliCheck**
```typescript
async run(): Promise<CheckResult> {
  // ... existing code ...
  
  if (selected && versionResult?.available) {
    // Check MCP capability
    const mcpResult = await checkCliAvailable(selected, ['mcp', 'list'], 5000);
    const mcpSupported = mcpResult.available;
    
    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: `Cursor CLI is installed and runnable (auth check skipped)`,
      details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}. MCP support: ${mcpSupported ? 'yes' : 'no'}. ${auth.details ?? ''}`.trim(),
      fixSuggestion: undefined,
      durationMs: 0,
    };
  }
  // ... rest of method
}
```

---

## Phase 6: Session Management (Documentation Only)

### 6.1 Update `src/platforms/cursor-runner.ts`

**Change: Add comment about session support**
```typescript
/**
 * Cursor Platform Runner for RWM Puppet Master
 * 
 * Implements Cursor-specific CLI invocation using agent (primary) or cursor-agent (fallback).
 * 
 * NOTE: Cursor CLI supports session management via `agent ls` and `agent resume`,
 * but this runner intentionally spawns fresh processes per iteration per REQUIREMENTS.md.
 * Session resume is not used to ensure fresh context for each iteration.
 * 
 * Per REQUIREMENTS.md Section 3.4.4 (Cursor Integration) and
 * ARCHITECTURE.md Section 6.1.2 (Platform Runners).
 */
```

---

## Phase 7: Capability Discovery Updates

### 7.1 Update `src/platforms/capability-discovery.ts`

**Change: Add detection for all new capabilities**
```typescript
// In the capability discovery for Cursor, add checks for:
// 1. Ask mode (--mode=ask)
// 2. Output formats (--output-format)
// 3. Model listing (agent models or --list-models)
// 4. MCP commands (agent mcp list)

interface CursorCapabilities {
  // ... existing capabilities ...
  askMode: boolean;
  outputFormats: {
    json: boolean;
    streamJson: boolean;
  };
  modelListing: boolean;
  mcpManagement: boolean;
}

async function discoverCursorCapabilities(command: string): Promise<CursorCapabilities> {
  const helpOutput = await getHelpOutput(command);
  const lower = helpOutput.toLowerCase();
  
  return {
    // ... existing capabilities ...
    askMode: /--mode[=\s]+ask\b/i.test(helpOutput) || lower.includes('ask mode'),
    outputFormats: {
      json: /--output-format[=\s]+json\b/i.test(helpOutput),
      streamJson: /--output-format[=\s]+stream-json\b/i.test(helpOutput),
    },
    modelListing: await detectModelListingCapability(command),
    mcpManagement: await detectMcpCapability(command),
  };
}
```

### 7.2 Update `src/platforms/health-check.ts`

**Change: Add smoke tests for new capabilities**
```typescript
// Add to SMOKE_TEST_DEFINITIONS.cursor:
{
  name: 'ask_mode',
  verifiesCapability: 'askMode',
  buildCommand: (cli) => ({ cmd: cli, args: ['--mode=ask', '-p', 'respond with exactly: ASK_MODE_OK'] }),
  validateOutput: (stdout, _stderr, code) => code === 0 && stdout.includes('ASK_MODE_OK'),
  timeout: 60000,
},
{
  name: 'output_format_json',
  verifiesCapability: 'outputFormatJson',
  buildCommand: (cli) => ({ cmd: cli, args: ['-p', '--output-format', 'json', 'respond with exactly: JSON_OK'] }),
  validateOutput: (stdout, _stderr, code) => {
    if (code !== 0) return false;
    try {
      const json = JSON.parse(stdout);
      return json.result?.includes('JSON_OK') || stdout.includes('JSON_OK');
    } catch {
      return false;
    }
  },
  timeout: 60000,
},
{
  name: 'model_listing',
  verifiesCapability: 'modelListing',
  buildCommand: (cli) => ({ cmd: cli, args: ['models'] }),
  validateOutput: (stdout, _stderr, code) => code === 0 && stdout.length > 0,
  timeout: 10000,
},
```

---

## Phase 8: Documentation Updates

### 8.1 Update `AGENTS.md`

**Change: Complete rewrite of Cursor CLI section** (see Phase 1.4 for details)

### 8.2 Update `REQUIREMENTS.md`

**Change: Update platform table and command examples** (see Phase 1.4 for details)

### 8.3 Update `PROJECT_SETUP_GUIDE.md`

**Change: Verify installation command is still correct**
```markdown
# Installation command should still be:
curl https://cursor.com/install -fsS | bash

# Verify with:
agent --version
```

---

## Phase 9: GUI Enhancements

### 9.1 Update `GUI_SPEC.md`

**Change: Document model management UI**
```markdown
### Model Selection (Config Screen)

When Cursor is selected as platform:
- Show dropdown/datalist with available models
- Fetch live models from `/api/config/cursor/models`
- Show loading state while fetching
- Fallback to curated list if API fails
- Display model descriptions and providers
- Highlight "auto" as recommended
```

### 9.2 Update `src/gui/react/src/pages/Config.tsx`

**Change: Implement model selection UI** (see Phase 3.4 for details)

---

## Phase 10: Doctor Feature Enhancements

### 10.1 Update `src/doctor/checks/cli-tools.ts`

**Change: Enhanced Cursor CLI check** (see Phase 5.2 for MCP check)

**Additional changes:**
```typescript
// Add checks for:
// 1. --mode=plan support
// 2. --mode=ask support  
// 3. --output-format support
// 4. Model listing capability

async run(): Promise<CheckResult> {
  // ... existing code ...
  
  if (selected && versionResult?.available) {
    // Get help output once
    const helpResult = await checkCliAvailable(selected, ['--help'], 5000);
    const helpOutput = helpResult.available ? (helpResult as any).output || '' : '';
    
    // Check all capabilities
    const [planModeSupported, askModeSupported, outputFormatSupported, modelListingResult, mcpResult] = await Promise.all([
      Promise.resolve(/--mode[=\s]+plan\b/i.test(helpOutput) || helpOutput.toLowerCase().includes('plan mode')),
      Promise.resolve(/--mode[=\s]+ask\b/i.test(helpOutput) || helpOutput.toLowerCase().includes('ask mode')),
      Promise.resolve(/--output-format\b/i.test(helpOutput)),
      checkCliAvailable(selected, ['models'], 5000),
      checkCliAvailable(selected, ['mcp', 'list'], 5000),
    ]);
    
    const capabilities = [
      planModeSupported ? 'Plan mode' : null,
      askModeSupported ? 'Ask mode' : null,
      outputFormatSupported ? 'Output formats' : null,
      modelListingResult.available ? 'Model listing' : null,
      mcpResult.available ? 'MCP management' : null,
    ].filter(Boolean).join(', ');
    
    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: `Cursor CLI is installed and runnable`,
      details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}. Capabilities: ${capabilities || 'basic'}. ${auth.details ?? ''}`.trim(),
      fixSuggestion: undefined,
      durationMs: 0,
    };
  }
  // ... rest of method
}
```

**Note: The checkCliAvailable function may need to be updated to return output in the result for help checks.**

### 10.2 Update `src/doctor/doctor-reporter.ts`

**Change: Better reporting format for capabilities**
```typescript
// Update formatSingleResult to show capabilities in a structured way
formatSingleResult(result: CheckResult): string {
  // ... existing code ...
  
  // If result has capabilities details, format them nicely
  if (result.details?.includes('Capabilities:')) {
    // Extract and format capabilities list
    const capabilitiesMatch = result.details.match(/Capabilities: ([^.]+)/);
    if (capabilitiesMatch) {
      const capabilities = capabilitiesMatch[1].split(', ').filter(Boolean);
      if (capabilities.length > 0) {
        output += `\n    Capabilities: ${capabilities.join(', ')}`;
      }
    }
  }
  
  // ... rest of method
}
```

---

## Summary of Files to Modify

1. `src/platforms/constants.ts` - Command name updates
2. `src/doctor/checks/cli-tools.ts` - Enhanced checks
3. `src/platforms/cursor-runner.ts` - Mode support, output formats
4. `src/types/platforms.ts` - Add askMode, outputFormat
5. `src/types/config.ts` - Add askMode to TierConfig
6. `src/platforms/cursor-models.ts` - Model listing functions
7. `src/platforms/capability-discovery.ts` - New capability detection
8. `src/platforms/output-parsers/cursor-output-parser.ts` - JSON parsing
9. `src/platforms/health-check.ts` - New smoke tests
10. `src/gui/routes/config.ts` - Model listing endpoint
11. `src/gui/react/src/pages/Config.tsx` - Model selection UI
12. `AGENTS.md` - Documentation updates
13. `REQUIREMENTS.md` - Documentation updates
14. `PROJECT_SETUP_GUIDE.md` - Documentation updates
15. `GUI_SPEC.md` - GUI documentation updates

---

## Testing Checklist

- [ ] Unit tests for command name changes
- [ ] Unit tests for ask mode support
- [ ] Unit tests for output format parsing
- [ ] Integration tests for model listing
- [ ] Integration tests for MCP detection
- [ ] Capability discovery tests
- [ ] Doctor check tests
- [ ] GUI model selection tests
- [ ] Smoke tests for all new capabilities

---

## Notes

- All changes maintain backward compatibility with `cursor-agent` command
- Installation command remains the same unless Cursor changes it
- Session management is documented but not used (fresh spawn per iteration)
- Model listing falls back to curated list if CLI query fails
- Output format defaults to 'text' if not specified
- Ask mode requires CLI support, falls back gracefully if unavailable
- Plan mode detection already exists but will be improved
- All new features are opt-in and don't break existing functionality
