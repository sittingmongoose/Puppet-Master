# Cursor CLI Update Research - January 2026

## Overview

This document contains comprehensive research on Cursor's recent CLI updates (January 2026) and analysis of how RWM Puppet Master can leverage these new features.

---

# Part 1: Cursor CLI Documentation Summary

## January 2026 Changelog Highlights

### January 16, 2026 Release

| Feature | Description |
|---------|-------------|
| **Plan and Ask Modes** | CLI supports Plan mode for designing approaches before coding, with clarifying questions. Ask mode enables code exploration without modifications. |
| **Cloud Agent Handoff** | Prepend "&" to messages to push local conversations to Cloud Agents. Continue at cursor.com/agents. |
| **Word-Level Diffs** | Precise word-level highlighting in the CLI for granular visibility into modifications. |
| **MCP Authentication** | One-click login flows with automatic callback handling. `/mcp list` offers interactive menu for browsing and configuring MCP servers. |

### January 8, 2026 Release

| Feature | Description |
|---------|-------------|
| **Model Management** | New `agent models` command, `--list-models` flag, and `/models` slash command for listing and switching models. |
| **Rules Management** | `/rules` command allows direct creation and editing of rules from CLI. |
| **MCP Server Controls** | `/mcp enable` and `/mcp disable` commands for on-the-fly server management. |
| **Performance** | Hook commands start 40x faster with significant performance enhancements. |

---

## CLI Overview

Cursor CLI is a terminal-based tool for direct interaction with AI agents for code development tasks.

### Operating Modes

| Mode | Description | Activation |
|------|-------------|------------|
| **Agent** | Full tool access for complex tasks (default) | Default or `--mode=agent` |
| **Plan** | Design-focused approach with clarifying questions | `/plan` or `--mode=plan` |
| **Ask** | Read-only exploration | `/ask` or `--mode=ask` |

Switch between modes using `Shift+Tab`.

### Key Capabilities

- Code writing, review, and modification
- Performance issue detection and fixes
- Security-focused code review
- Cloud Agent integration for background task execution
- Flexible invocation through slash commands, keyboard shortcuts, or CLI flags

---

## Installation

### Command
```bash
curl https://cursor.com/install -fsS | bash
```

### Verification
```bash
agent --version
```

### PATH Configuration
Add `~/.local/bin` to system PATH (bash or zsh).

### Update Mechanism
```bash
agent update
# or
agent upgrade
```

---

## CLI Usage

### Core Commands & Shortcuts

| Shortcut/Command | Action |
|------------------|--------|
| `ArrowUp` | Cycle through previous messages |
| `Shift+Tab` | Rotate between modes |
| `Shift+Enter` | Create multiline prompts (iTerm2, Ghostty, Kitty, Warp, Zed) |
| `Ctrl+D` | Exit CLI (double-press required) |
| `Ctrl+J` or `\+Enter` | Alternative newline insertion |
| `Ctrl+R` | Review changes; press `i` for follow-up instructions |
| `@` | Select files/folders for context |
| `/compress` | Reduce context window usage |
| `/setup-terminal` | Configure `Option+Enter` for Apple Terminal/Alacritty/VS Code |

### Cloud Integration
```bash
& refactor the auth module and add comprehensive tests
```
Prepend `&` to push tasks to Cloud Agent and resume later at cursor.com/agents.

### Session Management
```bash
agent resume          # Continue most recent conversation
--resume [thread id]  # Load specific prior context
agent ls              # View previous conversations
```

### Non-Interactive Mode
```bash
-p / --print              # For script integration
--output-format json      # Structured output
--output-format text      # Clean final answer
--output-format stream-json  # Real-time events
```

### Configuration Loading
The CLI automatically loads:
- MCP server configurations
- Rules from `.cursor/rules`
- `AGENTS.md` and `CLAUDE.md` at project root

---

## Shell Mode

Shell Mode enables direct execution of shell commands through the CLI without interrupting conversations.

### Features
- Runs commands in your login shell (`$SHELL`)
- Supports command chaining for multi-directory operations
- Safety checks and permission validation before execution
- Auto-truncates large outputs

### Limitations
- Commands timeout after 30 seconds (not adjustable)
- Long-running processes, servers, and interactive prompts unsupported
- Best suited for short, non-interactive commands

### Tips
- Chain operations: `cd <dir> && ...`
- `Ctrl+O` to expand truncated output
- `Escape` to exit Shell Mode

---

## MCP Integration

### Commands

| Command | Description |
|---------|-------------|
| `agent mcp list` | Display all configured servers with status |
| `agent mcp list-tools <identifier>` | Show available tools, parameters, constraints |
| `agent mcp login <identifier>` | Authenticate with configured servers |
| `agent mcp enable <identifier>` | Enable server access |
| `agent mcp disable <identifier>` | Disable server access |

Slash command equivalents: `/mcp list`, `/mcp enable <name>`, `/mcp disable <name>`

MCP server names with spaces are supported in all `/mcp` commands.

### Shared Configuration
MCP servers configured in the editor automatically function in the CLI, following precedence rules (project -> global -> nested directories).

---

## Headless Mode

For non-interactive, automated usage in scripting and CI/CD workflows.

### Key Parameters

| Parameter | Description |
|-----------|-------------|
| `-p, --print` | Non-interactive scripting mode |
| `--force` | Allow direct file changes without confirmation |
| `--output-format text` | Clean, final-answer responses (default) |
| `--output-format json` | Structured analysis results |
| `--output-format stream-json` | Message-level progress tracking (NDJSON) |
| `--stream-partial-output` | Incremental delta streaming |

### Authentication for Automation
```bash
export CURSOR_API_KEY=your_api_key_here
```

### Use Cases
1. **Codebase Analysis** - Query projects with simple commands
2. **Automated Code Review** - Generate structured feedback
3. **Real-time Monitoring** - Track progress with streaming JSON
4. **Batch Processing** - Process multiple files using loops
5. **Media Analysis** - Include file paths for images/videos

---

## GitHub Actions Integration

### Basic Setup
```yaml
- name: Install Cursor CLI
  run: |
    curl https://cursor.com/install -fsS | bash
    echo "$HOME/.cursor/bin" >> $GITHUB_PATH
```

### Autonomy Models

**Full Autonomy**: Comprehensive permissions across git operations, GitHub CLI interactions, and repository management.

**Restricted Autonomy**: Agent handles analytical and file-modification tasks only; deterministic operations handled by explicit workflow steps.

### Permission Configuration
```json
{
  "permissions": {
    "allow": ["Read(**/*.md)", "Write(docs/**/*)", "Shell(grep)"],
    "deny": ["Shell(git)", "Shell(gh)", "Write(.env*)"]
  }
}
```

---

## Cookbook Examples

### Code Review
- Focus on high-severity issues: null/undefined dereferences, resource leaks, injection vulnerabilities, race conditions, missing error handling, logic errors, performance anti-patterns
- Maximum 10 inline comments per review
- Emoji usage: 🚨 Critical, 🔒 Security, ⚡ Performance, ⚠️ Logic, ✅ Resolved

### Documentation Update
- Detects new/modified code via PR diffs
- Updates only relevant documentation files
- Maintains persistent branch with `docs` prefix

### CI Fix
- Monitors specified CI workflow for failures
- Creates persistent fix branch with `ci-fix` prefix
- Applies minimal, targeted edits
- Posts comment with inline compare link

### Secret Audit
- Scans for potential secrets in tracked files and recent history
- Supports custom allowlist patterns (`.gitleaks.toml`)
- Identifies risky workflow patterns
- Generates `SECURITY_LOG.md` summarizing remediation

### Translate Keys (i18n)
- Detects i18n keys added/changed via PR diffs
- Identifies missing translations per locale
- Adds entries only for missing keys
- Validates JSON formatting and schemas

---

## Slash Commands Reference

| Command | Purpose |
|---------|---------|
| `/plan` | Switch to Plan mode |
| `/ask` | Switch to Ask mode |
| `/model <model>` | Set or list available models |
| `/auto-run [state]` | Toggle auto-run or set on/off/status |
| `/new-chat` | Start new chat session |
| `/vim` | Toggle Vim keys |
| `/help [command]` | Display help information |
| `/feedback <message>` | Share feedback with team |
| `/resume <chat>` | Resume previous chat by folder name |
| `/usage` | View Cursor streaks and usage stats |
| `/about` | Show environment and CLI setup details |
| `/copy-req-id` | Copy last request ID |
| `/logout` | Sign out from Cursor |
| `/quit` | Exit the application |
| `/setup-terminal` | Auto-configure terminal keybindings |
| `/mcp list` | Browse, enable, configure MCP servers |
| `/mcp enable <name>` | Enable an MCP server |
| `/mcp disable <name>` | Disable an MCP server |
| `/rules` | Create or edit rules |
| `/commands` | Create or edit commands |
| `/compress` | Summarize conversation to free context |

---

## CLI Parameters Reference

### Global Options

| Flag | Description | Default |
|------|-------------|---------|
| `-v, --version` | Output version number | — |
| `-a, --api-key <key>` | Auth credential (or use `CURSOR_API_KEY` env var) | — |
| `-p, --print` | Print responses to console (non-interactive) | disabled |
| `--output-format <format>` | Response format: `text`, `json`, `stream-json` | `text` |
| `--stream-partial-output` | Stream partial output as text deltas | disabled |
| `-b, --background` | Start in background mode | disabled |
| `--fullscreen` | Enable full-screen interface | disabled |
| `--resume [chatId]` | Restore previous conversation | — |
| `-m, --model <model>` | Specify AI model | — |
| `--mode <mode>` | Mode: `agent`, `plan`, or `ask` | `agent` |
| `--list-models` | Display all compatible models | — |
| `-f, --force` | Force allow commands unless explicitly denied | disabled |
| `-h, --help` | Display documentation | — |

### Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with service |
| `logout` | Remove stored credentials |
| `status` | Verify current authentication state |
| `models` | Display available models |
| `mcp` | Configure MCP servers |
| `update` / `upgrade` | Install latest agent version |
| `ls` | List chat sessions |
| `resume` | Restore most recent session |
| `help [command]` | Access documentation |

---

## Authentication

### Methods

1. **Browser-based login** (preferred): `agent login` launches browser for credential entry
2. **API key authentication**: For automated workflows via `CURSOR_API_KEY` environment variable or `--api-key` flag

### API Key Setup
1. Generate key in Cursor dashboard under **Integrations > User API Keys**
2. Set via environment: `export CURSOR_API_KEY=your_api_key_here`
3. Or via flag: `--api-key your_api_key_here`

### Account Management Commands
```bash
agent login   # Browser-based authentication
agent status  # Display auth state and account details
agent logout  # Remove stored credentials
```

### Troubleshooting
- Auth failures: Run `agent login` or configure API key
- SSL errors: Use `--insecure` flag
- Endpoint connectivity: Use `--endpoint` flag for custom API locations

---

## Permissions

### Permission Types

| Type | Format | Example |
|------|--------|---------|
| Shell Commands | `Shell(commandBase)` | `Shell(ls)`, `Shell(git)`, `Shell(npm)` |
| File Reads | `Read(pathOrGlob)` | `Read(src/**/*.ts)`, `Read(.env*)` |
| File Writes | `Write(pathOrGlob)` | `Write(docs/**/*.md)`, `Write(**/*.key)` |

### Configuration Structure
Permissions in `~/.cursor/cli-config.json` (global) or `<project>/.cursor/cli.json` (project):

```json
{
  "permissions": {
    "allow": ["Read(**/*.md)", "Write(docs/**/*)", "Shell(grep)"],
    "deny": ["Shell(git)", "Shell(gh)", "Write(.env*)"]
  }
}
```

**Deny rules supersede allow rules** when conflicts arise.

### Glob Patterns
- `**` - Match any directory depth
- `*` - Match any characters in segment
- `?` - Match single character
- Relative paths are workspace-scoped
- Absolute paths target external locations

---

## Configuration

### File Locations

| Platform | Global Config | Project Config |
|----------|---------------|----------------|
| macOS/Linux | `~/.cursor/cli-config.json` | `<project>/.cursor/cli.json` |
| Windows | `$env:USERPROFILE\.cursor\cli-config.json` | `<project>/.cursor/cli.json` |

Environment variable overrides: `CURSOR_CONFIG_DIR`, `XDG_CONFIG_HOME`

### Required Fields

| Field | Description |
|-------|-------------|
| `version` | Schema version (currently `1`) |
| `editor.vimMode` | Toggle for Vim keybindings (default: disabled) |
| `permissions.allow` | Approved operations list |
| `permissions.deny` | Blocked operations list |

### Optional Settings

| Field | Description |
|-------|-------------|
| `model` | Model selection configuration |
| `hasChangedDefaultModel` | CLI-managed override flag |
| `network.useHttp1ForAgent` | Use HTTP/1.1 instead of HTTP/2 (default: false) |

### Proxy Support
Configure via environment variables: `HTTP_PROXY`, `HTTPS_PROXY`, `NODE_EXTRA_CA_CERTS`

Enable HTTP/1.1 fallback for enterprise proxies with `network.useHttp1ForAgent: true`

---

## Output Formats

### Available Formats (with `--print`)

| Format | Description |
|--------|-------------|
| `text` | Human-readable final response only (default) |
| `json` | Single JSON object emitted upon completion |
| `stream-json` | Newline-delimited JSON (NDJSON) with real-time events |

### JSON Format Response
```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 1000,
  "result": "Complete assistant text",
  "session_id": "...",
  "request_id": "..."
}
```

### Stream JSON Event Types
- **System initialization**: Session setup details
- **User message**: Input prompt
- **Assistant message**: Response segments between tool calls
- **Tool calls**: Started and completed events with args and results
- **Terminal result**: Final completion event

### Implementation Details
- Events terminate with newline characters
- Thinking events suppressed in print mode
- Session IDs remain consistent throughout execution
- Tool call IDs correlate start/completion pairs
- Field additions occur in backward-compatible ways

---

# Part 2: Current RWM Puppet Master Implementation

## Cursor Platform Registration

**File**: `src/platforms/registry.ts`

- Registered as platform ID: `'cursor'`
- Uses `CursorRunner` class for execution
- 5-minute default timeout, 30-minute hard timeout
- Uses `FreshSpawner` for process isolation

## Cursor Models

**File**: `src/platforms/cursor-models.ts`

Current model catalog:
- **Special modes**: `auto` (recommended), `cursor-small`
- **Anthropic (Claude)**: `sonnet`, `opus`, `haiku`, `claude-4.5-opus`, `claude-3.5-sonnet`, `claude-haiku`
- **OpenAI**: `gpt-5`, `gpt-5.2-codex`, `gpt-4o`, `gpt-4.1`
- **Google Gemini**: `gemini-3-pro`, `gemini-2.5-pro`, `gemini-flash`
- **Other providers**: `grok-code`, `deepseek-r1`

Key functions:
- `getCursorModels()` - Get all available models
- `getCursorModelsByProvider()` - Filter by provider
- `getDefaultCursorModel()` - Returns 'auto'

## CursorRunner

**File**: `src/platforms/cursor-runner.ts`

Key features:
- Uses `cursor-agent` command (configurable via `PLATFORM_COMMANDS.cursor`)
- **Non-interactive mode**: Uses `-p` flag with `CURSOR_NON_INTERACTIVE=1` environment variable
- **Prompt handling**: Writes prompts to stdin (not as command-line arguments)
- **Plan mode support**: Best-effort `--mode=plan` flag with fallback prompting
- **Output parsing**: Detects `<ralph>COMPLETE</ralph>` or `<ralph>GUTTER</ralph>` signals

Critical methods:
```typescript
buildArgs(request)      // Constructs: -p, --mode=plan, --model flags
writesPromptToStdin()   // Returns true - unique characteristic
getCustomEnv()          // Sets CURSOR_NON_INTERACTIVE=1
parseOutput()           // Detects completion signals
```

Plan mode detection caches result for 1 hour.

## Authentication Handling

**File**: `src/platforms/auth-status.ts`

Current approach for Cursor:
- Status: `'skipped'`
- Details: "Cursor auth is handled by the local Cursor app/session; no automated check performed"
- No API key required (differs from Claude, Codex, Gemini)

## CLI Command Constants

**File**: `src/platforms/constants.ts`

Default command: `'cursor-agent'` (or `cursor-agent.exe` on Windows)

Command candidates with fallbacks:
- Primary: `cursor-agent`
- Alternates: `cursor`, `agent`

Known installation paths:
- Linux: `/usr/local/bin/cursor-agent`, `~/.local/bin/cursor-agent`, `~/.local/share/cursor/cursor-agent`
- macOS: `/opt/homebrew/bin/cursor-agent`, `/Applications/Cursor.app/Contents/Resources/app/bin/cursor-agent`
- Windows: `%LOCALAPPDATA%\Programs\cursor\resources\app\bin\cursor-agent.exe`

## Doctor Checks

**File**: `src/doctor/checks/cli-tools.ts`

`CursorCliCheck` class:
- Probes multiple command candidates via `getCursorCommandCandidates()`
- Runs `--version` check with 10-second timeout
- Runs `--help` check with 5-second timeout
- Checks auth status via `getPlatformAuthStatus('cursor')`
- Reports: availability, version, command used, auth status

Fix suggestion: `curl https://cursor.com/install -fsSL | bash`

## Configuration

**File**: `src/types/config.ts` & `src/config/default-config.ts`

Default configuration:
```typescript
subtask: {
  platform: 'cursor',
  model: 'sonnet',
  selfFix: true,
  maxIterations: 10,
  escalation: 'task',
},
iteration: {
  platform: 'cursor',
  model: 'auto',
  planMode: true,  // Enables plan mode at iteration tier
  selfFix: false,
  maxIterations: 3,
  escalation: 'subtask',
}
```

Plan mode can be configured per-tier via `TierConfig.planMode`.

## Installer Scripts

### Linux (`installer/linux/scripts/postinstall`)
- Displays completion message and next-steps checklist
- Guides users to run: `puppet-master doctor`, `puppet-master login`, `puppet-master validate`
- Explains optional GUI systemd service setup

### macOS (`installer/mac/scripts/postinstall`)
- Similar to Linux with macOS-specific paths/instructions

### Windows (`installer/win/puppet-master.nsi`)
- NSIS installer script
- Installs to `Program Files\Puppet Master` (64-bit)
- Adds install directory to system PATH

## GUI Integration

### Wizard Steps (`src/gui/react/src/pages/Wizard.tsx`)
7-step workflow:
1. Upload - Parse requirements
2. Configure - Select platforms & models per tier
3. Interview - AI-driven clarification questions
4. Generate - PRD + architecture generation
5. Review - Validate generated artifacts
6. Plan - Generate execution tier plan
7. Start - Save and begin orchestration

### API Routes
- `/api/config/models` - Fetches model catalogs for all platforms
- `/api/wizard/*` - Wizard workflow endpoints
- `/api/doctor/*` - Health check endpoints

---

# Part 3: Implementation Gaps & Opportunities

## Priority 1: Core Runner Improvements (Critical)

### 1.1 Update Command Constants

**Current**: Default command is `cursor-agent`
**New**: Documentation shows `agent` as the primary command

**Changes needed in `src/platforms/constants.ts`**:
1. Change default from `cursor-agent` to `agent`
2. Add new installation paths: `~/.cursor/bin`, `~/.local/bin`
3. Reorder candidates: Put `agent` first

```typescript
// Proposed change
cursor: process.platform === 'win32' ? 'agent.exe' : 'agent',

// New paths to add
join(process.env.HOME, '.cursor', 'bin', 'agent'),
join(process.env.HOME, '.local', 'bin', 'agent'),

// Reordered candidates
candidates.push('agent', 'cursor', 'cursor-agent');
```

### 1.2 Add Ask Mode Support

**Current**: Only plan mode implemented
**New**: Ask mode available via `--mode=ask`

**Changes needed in `src/platforms/cursor-runner.ts`**:
```typescript
// Add to buildArgs method:
if (request.askMode === true) {
  args.push('--mode=ask');
} else if (request.planMode === true && this.modeFlagSupport === true) {
  args.push('--mode=plan');
}
```

**Changes needed in `src/types/platforms.ts`**:
- Add `askMode?: boolean` to `ExecutionRequest`

### 1.3 Add Streaming JSON Output Support

**Current**: Uses `-p` flag only
**New**: Output formats `text`, `json`, `stream-json` available

**Changes needed in `src/platforms/cursor-runner.ts`**:
```typescript
if (request.outputFormat) {
  args.push('--output-format', request.outputFormat);
}
if (request.force === true) {
  args.push('--force');
}
if (request.streamPartialOutput) {
  args.push('--stream-partial-output');
}
```

---

## Priority 2: Authentication Improvements (High)

### 2.1 Cursor Auth Status Detection

**Current**: Always returns `'skipped'`
**New**: Can check `CURSOR_API_KEY` env var and `agent status` command

**Changes needed in `src/platforms/auth-status.ts`**:
```typescript
case 'cursor': {
  const hasApiKey =
    typeof process.env.CURSOR_API_KEY === 'string' &&
    process.env.CURSOR_API_KEY.trim() !== '';

  if (hasApiKey) {
    return {
      status: 'authenticated',
      details: 'CURSOR_API_KEY is set.',
    };
  }

  return {
    status: 'unknown',
    details: 'Cursor auth is managed via browser login or CURSOR_API_KEY.',
    fixSuggestion: 'Run `agent login` or set CURSOR_API_KEY environment variable.',
  };
}
```

### 2.2 Add Auth Command Integration

**Changes needed in `src/doctor/checks/cli-tools.ts`**:
- Add `agent status` command check for Cursor
- Parse auth status from command output
- Add fix suggestion for `agent login`

---

## Priority 3: Doctor Check Updates (Medium)

### 3.1 Fix Installation URL

**Current**: `curl https://cursor.com/install -fsSL | bash`
**New**: `curl https://cursor.com/install -fsS | bash`

### 3.2 Add Model Listing Check

**New feature**: Verify models via `agent models` or `--list-models`

```typescript
// After help check succeeds:
const modelsResult = await checkCliAvailable(selected, ['models'], 5000);
```

### 3.3 Add MCP Status Check

**New feature**: Check MCP server availability via `/mcp list`

---

## Priority 4: Dynamic Model Discovery (Medium)

### 4.1 CLI-Based Model Fetching

**Current**: Static model list from `cursor-models.ts`
**New**: Can dynamically fetch via `agent models`

**Changes needed in `src/platforms/capability-discovery.ts`**:
```typescript
case 'cursor': {
  const modelsResult = await executeCommand(
    this.getCommand('cursor'),
    ['models'],
    10_000
  );

  if (modelsResult.ok) {
    return parseModelsFromOutput(modelsResult.output);
  }

  // Fall back to static list
  return [...KNOWN_CURSOR_MODELS];
}
```

### 4.2 Update Model Catalog

Add new models mentioned in docs:
- `gpt-5.2-codex`
- `sonnet-4`

---

## Priority 5: GUI Integration (Low)

### 5.1 Expose Ask Mode in Tier Configuration

**Changes needed**:
- Add `askMode?: boolean` to `TierConfig` interface
- Update GUI wizard to show mode selection
- Add validation to ensure only one mode is active

### 5.2 Session Management GUI

**New feature**: Expose session resume functionality in GUI
- Add `/api/sessions` endpoint
- Add `/api/sessions/:id/resume` endpoint
- Create Sessions page in React GUI

### 5.3 MCP Server Status in GUI

**New feature**: Show MCP server configuration in Settings or Doctor page

---

## Priority 6: Installer Updates (Low)

### 6.1 Update Postinstall Scripts

Add guidance for Cursor CLI installation:
```bash
echo "  Note: For Cursor CLI support, install with:"
echo "     curl https://cursor.com/install -fsS | bash"
```

Files affected:
- `installer/linux/scripts/postinstall`
- `installer/mac/scripts/postinstall`
- `installer/win/puppet-master.nsi`

---

# Part 4: Implementation Sequence

## Phase 1: Foundation
1. Update `constants.ts` command defaults and paths
2. Fix doctor check installation URL
3. Update `auth-status.ts` for Cursor

## Phase 2: Runner Enhancements
1. Add ask mode to `cursor-runner.ts`
2. Add output format and force flag support
3. Update `ExecutionRequest` type

## Phase 3: Doctor & Discovery
1. Implement `agent status` auth check
2. Add model listing check
3. Implement dynamic model discovery

## Phase 4: Config & GUI
1. Add `askMode` to `TierConfig`
2. Update GUI wizard for mode selection
3. Add sessions API endpoints

## Phase 5: Polish
1. Update installer scripts
2. Add MCP status check
3. Documentation updates

---

# Part 5: Risk Assessment

## Low Risk
- Updating constants and paths (backward compatible)
- Adding new optional flags (won't break existing)
- Updating fix suggestions (documentation only)

## Medium Risk
- Changing default command from `cursor-agent` to `agent`
  - **Mitigation**: Keep both in candidates list, test on fresh installs
- Dynamic model discovery
  - **Mitigation**: Always fall back to static list

## High Risk
- Output parser changes for JSON format
  - **Mitigation**: Only parse JSON when explicitly requested

---

# Part 6: Backward Compatibility

1. **Command Candidates**: Keep `cursor-agent` in candidates list
2. **Config Fields**: New fields (`askMode`, `outputFormat`) are optional
3. **API Endpoints**: New endpoints don't affect existing ones
4. **Default Behavior**: Unchanged unless new features explicitly enabled

---

# Part 7: Critical Files Summary

| File | Changes |
|------|---------|
| `src/platforms/cursor-runner.ts` | Ask mode, output format, force flag |
| `src/platforms/constants.ts` | Command defaults, installation paths |
| `src/platforms/auth-status.ts` | CURSOR_API_KEY support, agent status |
| `src/doctor/checks/cli-tools.ts` | URL fix, agent status, model listing |
| `src/types/platforms.ts` | askMode, outputFormat, force in ExecutionRequest |
| `src/platforms/capability-discovery.ts` | Dynamic model fetching |
| `src/platforms/cursor-models.ts` | New models |
| `src/types/config.ts` | askMode in TierConfig |
| `src/gui/routes/wizard.ts` | Mode selection |
| `src/gui/react/src/pages/Wizard.tsx` | Mode selection UI |
| `installer/linux/scripts/postinstall` | Cursor CLI guidance |
| `installer/mac/scripts/postinstall` | Cursor CLI guidance |
| `installer/win/puppet-master.nsi` | Cursor CLI guidance |

---

# Part 8: Testing Strategy

## Unit Tests
- `cursor-runner.test.ts`: Add tests for ask mode, output format, force flag
- `auth-status.test.ts`: Add tests for Cursor API key detection
- `cli-tools.test.ts`: Update mock outputs for new command patterns

## Integration Tests
- `integration.test.ts`: Add Cursor session resume test
- `gui.integration.test.ts`: Add sessions API tests

## Manual Testing
- Verify `agent` command works with all new flags
- Test `agent login` flow
- Test `agent status` parsing
- Test session resume via GUI
