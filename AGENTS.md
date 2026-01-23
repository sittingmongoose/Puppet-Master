# AGENTS.md - RWM Puppet Master
Always use the Context7 MCP.  You need to take your time and be careful as this is something you can mess up easily and cause a lot of issues if you arent careful.
> Long-term memory for AI agents working on this project.
> Updated as patterns emerge and gotchas are discovered.

---

## Project Overview

RWM Puppet Master is a CLI orchestrator implementing the Ralph Wiggum Method - a four-tier hierarchical approach to AI-assisted development. The system coordinates multiple AI CLI platforms (Cursor, Codex, Claude Code) without using APIs, relying exclusively on CLI invocations.

### Key Concepts
- **Four Tiers**: Phase → Task → Subtask → Iteration
- **CLI-Only**: No API calls, only CLI invocations
- **Fresh Agents**: Every iteration spawns a new process
- **Verification Gates**: Automated checks between tiers
- **Memory Layers**: progress.txt (short-term), AGENTS.md (long-term), prd.json (work queue)

---

## Architecture Notes

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `src/cli/` | CLI entry points and commands |
| `src/core/` | State machines, orchestrator, execution engine |
| `src/platforms/` | Platform runners, capability discovery |
| `src/verification/` | Verifiers, gate runner |
| `src/memory/` | State file managers |
| `src/git/` | Git operations, branch strategies |
| `src/types/` | Type definitions |
| `src/utils/` | Shared utilities |

### State Machine Flow
```
Orchestrator: IDLE → PLANNING → EXECUTING → COMPLETE
                              ↓
Tier:         PENDING → PLANNING → RUNNING → GATING → PASSED
                                     ↓
                                  RETRYING (on failure)
```

### Data Flow
1. Load PRD (prd.json) → Build tier tree
2. Select next pending subtask
3. Build iteration prompt (include progress.txt, AGENTS.md)
4. Spawn fresh agent process
5. Parse output for completion signal
6. Run verification gate
7. Update state files
8. Advance to next item or escalate

---

## Codebase Patterns

### ESM Import Pattern
```typescript
// Always use .js extension for local imports
import { ConfigManager } from './config-manager.js';
import type { Platform } from '../types/index.js';
```

### Type-only Exports in ESM (NodeNext)
When re-exporting types (like `Platform`), use `export type`:
```typescript
// CORRECT - types must use type-only exports
export type { Platform } from './config.js';
import type { Platform } from '../types/index.js';

// WRONG - Platform is NOT a runtime value
export { Platform } from './config.js';
import { Platform } from '../types/index.js';
```

### Barrel Export Pattern
```typescript
// src/types/index.ts
// Use type-only re-exports for type aliases
export type { Platform, TierConfig } from './config.js';
// Use regular re-exports for interfaces, classes, and runtime values
export { ConfigManager } from './config-manager.js';
export * from './state.js';  // OK if state.js has no type-only exports to leak
```

### State Machine Pattern
```typescript
class TierStateMachine {
  send(event: TierEvent): boolean {
    const nextState = getNextTierState(this.state, event.type);
    if (nextState) {
      this.state = nextState;
      this.onTransition?.(event);
      return true;
    }
    return false;
  }
}
```

### Manager Class Pattern
```typescript
class PrdManager {
  constructor(private filePath: string) {}
  
  async load(): Promise<PRD> { /* ... */ }
  async save(prd: PRD): Promise<void> { /* ... */ }
  async updateItemStatus(id: string, status: ItemStatus): Promise<void> { /* ... */ }
}
```

### Verifier Pattern
```typescript
class RegexVerifier implements Verifier {
  readonly type = 'regex';
  
  async verify(criterion: Criterion): Promise<VerifierResult> {
    // Implementation
    return { passed, summary, durationMs };
  }
}
```

---

## Tooling Rules

### Vitest (NOT Jest)
```typescript
// Correct
import { describe, it, expect, vi } from 'vitest';

// Wrong
import { describe, it, expect, jest } from '@jest/globals';
```

### TypeScript Strict Mode
- All `strict` options enabled
- No implicit `any`
- No unused variables (prefix with `_` if intentional)

### ESLint Configuration
- Uses `@typescript-eslint/parser`
- Extends `eslint:recommended` and `plugin:@typescript-eslint/recommended`
- Args ignore pattern: `^_`

### Git Commit Format
```
ralph: [tier/scope] [item-id] [summary]

Examples:
ralph: PH0-T01 initialize TypeScript project
ralph: complete ST-001-001-001 - implement ConfigManager  
ralph: task-gate TK-001-001 - PASS
```

### Gitignore Rules
Do NOT use blanket `*.log` pattern. Evidence logs are tracked!
```gitignore
# CORRECT - specific log patterns
npm-debug.log*
yarn-error.log*
# Evidence logs are tracked - do NOT ignore .puppet-master/

# WRONG - too broad, would ignore evidence logs
*.log
```

## Pre-Completion Verification Checklist

**BEFORE updating the Task Status Log, you MUST verify compliance with ALL rules by checking this checklist:**

1. **ESM Import Patterns** (AGENTS.md: Codebase Patterns, .cursorrules: ESM Import Rules)
   - [ ] All local imports use `.js` extension
   - [ ] Type-only exports use `export type` and `import type`
   - [ ] No runtime imports for type aliases (like Platform)

2. **Module Organization** (AGENTS.md: Architecture Notes, .cursorrules: File Organization)
   - [ ] Files created in correct directories per module responsibilities
   - [ ] Barrel exports follow pattern (type-only for types, regular for runtime values)
   - [ ] Module responsibilities respected

3. **Tooling Rules** (AGENTS.md: Tooling Rules, .cursorrules: Technology Stack)
   - [ ] Using Vitest (NOT Jest patterns)
   - [ ] TypeScript strict mode enabled
   - [ ] ESLint configuration correct
   - [ ] Git commit format followed (if committing)

4. **Testing Requirements** (AGENTS.md: Testing, .cursorrules: Testing Requirements)
   - [ ] Tests written for new code (if applicable)
   - [ ] Test files in correct locations (next to source files)
   - [ ] All required tests pass
   - [ ] `npm run typecheck` passes

5. **Code Patterns** (AGENTS.md: Codebase Patterns, Common Failure Modes)
   - [ ] State machine pattern followed (if applicable)
   - [ ] Manager pattern followed (if applicable)
   - [ ] Verifier pattern followed (if applicable)
   - [ ] No session reuse (fresh processes only, if applicable)
   - [ ] No API calls (CLI only, if applicable)
   - [ ] File locking used for shared files (if applicable)

6. **DO/DON'T Checklist** (AGENTS.md: DO, DON'T)
   - [ ] All DO items followed (check DO section)
   - [ ] All DON'T items avoided (check DON'T section)
   - [ ] No modifications outside task scope
   - [ ] Canonical documents not deleted/simplified
   - [ ] Specific `.log` patterns in gitignore (not blanket `*.log`)

7. **Task-Specific Requirements** (.cursorrules: When Working on Tasks)
   - [ ] Referenced documentation sections read FIRST
   - [ ] Only specified task implemented
   - [ ] Tests run after implementation
   - [ ] Task scope strictly followed

8. **File-Specific Rules** (.cursorrules: Critical Patterns)
   - [ ] Gitignore patterns correct (no blanket `*.log`, evidence logs tracked)
   - [ ] Session ID format correct (if applicable): `PM-YYYY-MM-DD-HH-MM-SS-NNN`
   - [ ] No Thread terminology (use Session if applicable)

9. **Final Verification**
   - [ ] All acceptance criteria met (checkboxes updated in phase file)
   - [ ] All required tests pass
   - [ ] `npm run typecheck` passes (if applicable)
   - [ ] `npm run build` passes (if applicable)
   - [ ] No linter errors (if applicable)

**After completing this checklist, proceed to update the Task Status Log.**

---

### Task Status Log Update Rule
After completing ANY build queue task, you MUST update the Task Status Log in the phase file with:
- Status: PASS or FAIL
- Date: YYYY-MM-DD
- Summary of changes
- Files changed
- Commands run + results
- If FAIL: exact error snippets and what remains

---

## Common Failure Modes

### Import Extension Missing
**Symptom**: `ERR_MODULE_NOT_FOUND` at runtime
**Cause**: Missing `.js` extension in import
**Fix**: Add `.js` to all local imports
```typescript
// Before (fails)
import { foo } from './bar';

// After (works)
import { foo } from './bar.js';
```

### Jest Instead of Vitest
**Symptom**: `jest is not defined` or `require is not defined`
**Cause**: Using Jest patterns in ESM project
**Fix**: Use Vitest imports and patterns
```typescript
// Use vi.fn() not jest.fn()
const mock = vi.fn();
```

### Session Reuse
**Symptom**: Agent behavior inconsistent, context pollution
**Cause**: Reusing sessions instead of fresh spawns
**Fix**: Always spawn new process per iteration
```typescript
// Always use spawn(), never reuse
const process = spawn(command, args);
```

### State File Corruption
**Symptom**: Invalid JSON, missing fields
**Cause**: Concurrent writes without locking
**Fix**: Use file locking for prd.json
```typescript
await withFileLock(prdPath, async () => {
  await prdManager.save(prd);
});
```

---

## DO

- ✅ Use `.js` extension in all local imports
- ✅ Use `import type` and `export type` for type aliases (like Platform)
- ✅ Use Vitest for testing
- ✅ Spawn fresh process for each iteration
- ✅ Use Session ID format `PM-YYYY-MM-DD-HH-MM-SS-NNN`
- ✅ Follow barrel export pattern (type-only for types)
- ✅ Run tests after each change
- ✅ Use discriminated unions for events
- ✅ Save evidence for verification results
- ✅ Use async/await for file operations
- ✅ Follow the task scope exactly
- ✅ Update Task Status Log after completing any task
- ✅ Use specific `.log` patterns in gitignore (not `*.log`)

---

## DON'T

- ❌ Use Jest patterns (`jest.fn()`, `jest.mock()`)
- ❌ Omit `.js` extension in imports
- ❌ Use `import { Platform }` for type aliases (use `import type`)
- ❌ Reuse sessions or processes
- ❌ Use "Thread" terminology (use "Session")
- ❌ Call APIs directly (CLI only)
- ❌ Modify files outside task scope
- ❌ Delete or simplify canonical documents
- ❌ Use `exec()` for process spawning (use `spawn()`)
- ❌ Skip file locking for shared files
- ❌ Ignore test failures
- ❌ Use blanket `*.log` in gitignore (evidence logs are tracked!)
- ❌ Ignore `.puppet-master/` directory in gitignore

---

## Testing

### Unit Test Location
Place tests next to source files:
```
src/
├── config/
│   ├── config-manager.ts
│   └── config-manager.test.ts
```

### Integration Test Location
```
src/
└── __tests__/
    ├── integration.test.ts
    └── fixtures/
        ├── sample-prd.json
        └── sample-config.yaml
```

### Test Commands
```bash
npm test                    # Run all tests
npm test -- -t "pattern"    # Run specific tests
npm run test:coverage       # With coverage
npm run test:watch          # Watch mode
```

### Mocking Pattern
```typescript
import { vi } from 'vitest';

const mockRunner = {
  spawnFreshProcess: vi.fn().mockResolvedValue({
    pid: 12345,
    stdout: createMockStream(),
  }),
};
```

---

## Directory Structure

```
puppet-master/
├── .puppet-master/           # Runtime data
│   ├── capabilities/         # Platform capability cache
│   ├── evidence/             # Verification evidence
│   │   ├── test-logs/
│   │   ├── screenshots/
│   │   ├── browser-traces/
│   │   ├── file-snapshots/
│   │   ├── metrics/
│   │   └── gate-reports/
│   ├── usage/                # Usage tracking
│   │   └── usage.jsonl
│   ├── checkpoints/          # State checkpoints
│   └── logs/                 # Operation logs
├── src/                      # Source code
├── dist/                     # Compiled output
├── progress.txt              # Short-term memory
├── AGENTS.md                 # Long-term memory (this file)
├── prd.json                  # Work queue
├── config.yaml               # Configuration
└── package.json
```

---

## Configuration

### Required Config Sections
```yaml
project:
  name: string
  workingDirectory: string

tiers:
  phase:
    platform: cursor | codex | claude
    model: string
    selfFix: boolean
    maxIterations: number
  task: ...
  subtask: ...
  iteration: ...

branching:
  baseBranch: string
  namingPattern: string
  granularity: single | per-phase | per-task

verification:
  browserAdapter: string
  screenshotOnFailure: boolean
  evidenceDirectory: string

memory:
  progressFile: string
  agentsFile: string
  prdFile: string
  multiLevelAgents: boolean

budgets:
  claude: { maxCallsPerRun, maxCallsPerHour, maxCallsPerDay }
  codex: ...
  cursor: ...
```

---

## Platform CLI Commands

### Cursor
```bash
cursor --non-interactive --model <model> --prompt <prompt>
```

### Codex
```bash
codex --non-interactive --model <model> --approval-mode full-auto
```

### Claude Code
```bash
claude --print --model <model> --output-format stream-json --prompt <prompt>
```

### Gemini
```bash
gemini -p "prompt" --output-format json --approval-mode yolo [--model <model>]
```

**Key capabilities:**
- `gemini -p "prompt"` or `gemini --prompt "prompt"` - Headless mode with prompt
- `--output-format json` - Machine-readable JSON output
- `--output-format stream-json` - Streaming JSONL events (real-time)
- `--approval-mode yolo` or `--yolo` - Auto-approve all tool calls
- `--approval-mode auto_edit` - Auto-approve edit tools only
- `--approval-mode plan` - Read-only mode (requires `experimental.plan: true`)
- `--model <model>` or `-m <model>` - Model selection
- `--include-directories <dir1,dir2>` - Multi-directory workspace support
- `--debug` or `-d` - Debug mode
- `--sandbox` or `-s` - Sandbox execution environment
- `--resume [session-id]` - Resume previous session (we spawn fresh, so not used)
- Reads GEMINI.md from project root and ancestors for hierarchical context
- Supports MCP servers via configuration
- `/model` command for interactive model selection
- `/memory` commands for managing GEMINI.md context files

**Authentication:**
- OAuth via `gemini` first run (interactive)
- `GEMINI_API_KEY` environment variable (headless)
- Vertex AI via `GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth`
- `GOOGLE_CLOUD_PROJECT` for Vertex AI

**Output formats:**
- `text` (default) - Human-readable output
- `json` - Single JSON object with `{response, stats, error?}`
- `stream-json` - JSONL events with types: `init`, `message`, `tool_use`, `tool_result`, `error`, `result`

**Session management:**
- Automatic session saving to `~/.gemini/tmp/<project_hash>/chats/`
- `--resume` to continue previous session
- `--list-sessions` to view available sessions
- `--delete-session <id>` to remove sessions
- Note: Puppet Master spawns fresh processes, so session resume is not used

### GitHub Copilot
```bash
copilot -p "prompt" --allow-all-tools [--allow-all-paths] [--allow-all-urls] [--allow-url <domain>] [--silent] [--stream off]
```

**Key capabilities:**
- `copilot -p "prompt"` or `copilot --prompt "prompt"` - Programmatic mode with prompt
- `copilot` (no flags) - Interactive mode (default)
- `--allow-all-tools` - Auto-approve all tools without manual approval
- `--allow-tool <spec>` - Allow specific tool without approval
- `--deny-tool <spec>` - Prevent specific tool usage (takes precedence)
- Tool specifications: `'shell(COMMAND)'`, `'write'`, `'MCP_SERVER_NAME'`
- Model selection: `/model` command (interactive only, not programmatic)
- Default model: Claude Sonnet 4.5
- Output format: Text-based (no JSON output)

**Keyboard shortcuts:**
- Global: `@` (mention files), `Esc` (cancel), `!` (shell bypass), `Ctrl+C` (cancel/exit), `Ctrl+D` (shutdown), `Ctrl+L` (clear screen)
- Timeline: `Ctrl+O` (expand/collapse all), `Ctrl+R` (expand/collapse recent)
- Motion: `Ctrl+A/E` (beginning/end of line), `Ctrl+H/W/U/K` (delete operations), `Meta+←/→` (word movement), `↑/↓` (command history)

**Slash commands (interactive mode):**
- `/add-dir <directory>` - Add directory to allowed list for file access
- `/agent` - Browse and select from available agents
- `/clear`, `/new` - Clear conversation history
- `/compact` - Summarize conversation history to reduce context usage
- `/context` - Show context window token usage and visualization
- `/cwd`, `/cd [directory]` - Change working directory or show current
- `/delegate <prompt>` - Delegate changes to remote repository with AI-generated PR
- `/exit`, `/quit` - Exit the CLI
- `/share [file|gist] [path]` - Share session to markdown file or GitHub gist
- `/feedback` - Provide feedback about the CLI
- `/help` - Show help for interactive commands
- `/list-dirs` - Display all allowed directories for file access
- `/login` - Log in to Copilot
- `/logout` - Log out of Copilot
- `/mcp [show|add|edit|delete|disable|enable] [server-name]` - Manage MCP server configuration
- `/model`, `/models [model]` - Select AI model to use
- `/plan [prompt]` - Create an implementation plan before coding
- `/plugin [marketplace|install|uninstall|update|list] [args...]` - Manage plugins
- `/rename <name>` - Rename the current session
- `/reset-allowed-tools` - Reset the list of allowed tools
- `/resume [sessionId]` - Switch to a different session
- `/review [prompt]` - Run code review agent to analyze changes
- `/session [checkpoints [n]|files|plan|rename <name>]` - Show session info and workspace summary
- `/skills [list|info|add|remove|reload] [args...]` - Manage skills
- `/terminal-setup` - Configure terminal for multiline input support
- `/theme [show|set|list] [auto|dark|light]` - View or configure terminal theme
- `/usage` - Display session usage metrics and statistics
- `/user [show|list|switch]` - Manage GitHub user list

**Approval options:**
- `--allow-all-tools` - Allow all tools automatically
- `--allow-tool 'shell(git)'` - Allow specific shell command
- `--allow-tool 'write'` - Allow file modification tools
- `--allow-tool 'My-MCP-Server'` - Allow all tools from MCP server
- `--deny-tool 'shell(rm)'` - Prevent specific tool (takes precedence)

**Security:**
- Trusted directories: `trusted_folders` in `~/.copilot/config.json`
- Directory trust prompt on first launch
- Path permissions: Control directory/file access (default: current working directory, subdirectories, system temp)
  - `--allow-all-paths` - Disable path verification (documented flag)
  - Path detection limitations: Complex shell constructs, custom env vars, symlinks
- URL permissions: Control external URL access (default: all require approval)
  - `--allow-all-urls` - Disable URL verification
  - `--allow-url <domain>` - Pre-approve specific domain (e.g., `--allow-url github.com`)
  - URL detection limitations: URLs in file contents, obfuscated URLs, HTTP/HTTPS treated separately
- Tool approval system for file modifications and shell commands
- Risk mitigation: Use in restricted environments (VM, container)

**Context files (custom instructions):**
Copilot respects instructions from these locations (in order):
- `CLAUDE.md` (in project root and cwd)
- `GEMINI.md` (in project root and cwd)
- `AGENTS.md` (in git root & cwd)
- `.github/instructions/**/*.instructions.md` (in git root & cwd)
- `.github/copilot-instructions.md` (repository-wide)
- `$HOME/.copilot/copilot-instructions.md` (user-level)
- `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` (additional directories via env var)

**Default custom agents:**
- Explore: Quick codebase analysis without adding to main context
- Task: Execute commands (tests, builds) with brief summaries on success
- Plan: Analyze dependencies and structure to create implementation plans
- Code-review: Review changes focusing on genuine issues, minimizing noise

**Context management:**
- `/usage` - View session statistics (premium requests, duration, lines edited, token usage per model)
- `/context` - Visual overview of current token usage
- `/compact` - Manually compress conversation history to free context space
- Automatic compression: Triggers at 95% of token limit
- Warning: Displayed when less than 20% of token limit remaining

**File mentions and shell:**
- `@path/to/file` - Include file contents in prompt context
- `!command` - Execute shell command directly, bypassing Copilot

**Customization:**
- Custom instructions for project context
- MCP servers for additional data sources and tools
- Custom agents for specialized tasks
- Hooks for validation, logging, security scanning
- Skills for enhanced specialized task performance

**Authentication:**
- GitHub authentication via `/login` command
- `GH_TOKEN` or `GITHUB_TOKEN` environment variable with "Copilot Requests" permission
- Requires GitHub Copilot Pro, Pro+, Business, or Enterprise plan
- Organization policy must enable Copilot CLI

**Model usage:**
- Default: Claude Sonnet 4.5 (GitHub reserves right to change)
- Change via `/model` slash command (interactive mode)
- Premium requests quota: Each prompt reduces monthly quota by model multiplier
- Model availability depends on subscription tier and region

**Command-line options:**
- `--resume` - Cycle through and resume local and remote interactive sessions
- `--continue` - Quickly resume the most recently closed local session
- `--agent=<agent-name>` - Specify custom agent to use (e.g., `--agent=refactor-agent`)

**Note:** Flag `--allow-all-paths` is documented in official docs for disabling path verification. Flags `--silent` and `--stream off` are used in our implementation but may be undocumented features.

---

## Completion Signals

Agents should emit these signals to indicate status:

```
<ralph>COMPLETE</ralph>  # Task completed successfully
<ralph>GUTTER</ralph>    # Stuck, cannot proceed
```

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-11 | Initial creation for BUILD_QUEUE generation |

---

*This file is automatically updated as patterns emerge. Human review recommended for major changes.*
