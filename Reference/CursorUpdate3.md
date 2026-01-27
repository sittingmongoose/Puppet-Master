# Cursor CLI Update Analysis - January 2026

**Date:** 2026-01-26  
**Purpose:** Comprehensive analysis of Cursor CLI updates and modernization plan for RWM Puppet Master

---

## Executive Summary

Cursor CLI has undergone significant updates in January 2026 (version 2.4), introducing new features including Plan/Ask modes, enhanced MCP support, output formats, model management commands, permissions system, and improved authentication. This document analyzes our current implementation, identifies gaps, and provides a detailed modernization plan.

---

## Part 1: New Cursor CLI Features (From Documentation)

### 1.1 Core Features (January 2026 Release)

#### Modes
- **Plan Mode**: `--mode=plan` or `/plan` - Design approach before coding with clarifying questions
- **Ask Mode**: `--mode=ask` or `/ask` - Read-only exploration without making changes
- **Agent Mode**: Default mode with full tool access

#### Model Management
- `agent models` - List all available models
- `/model <model>` - Set or list models in interactive mode
- `--list-models` - Flag to list models
- Model selection via `--model <model>` or `-m <model>`

#### MCP (Model Context Protocol) Support
- `agent mcp list` - Browse, enable, and configure MCP servers
- `agent mcp enable <identifier>` - Enable an MCP server
- `agent mcp disable <identifier>` - Disable an MCP server
- `agent mcp login <identifier>` - Authenticate with MCP server (one-click auth)
- `agent mcp list-tools <identifier>` - List tools provided by MCP server
- `/mcp list`, `/mcp enable`, `/mcp disable` - Slash commands in interactive mode

#### Output Formats
- `--output-format text` - Plain text output (default)
- `--output-format json` - Structured JSON output
- `--output-format stream-json` - Newline-delimited JSON (NDJSON) for real-time events
- `--stream-partial-output` - Stream partial output as individual text deltas (with stream-json)

#### Shell Mode
- New shell mode for running commands directly from CLI
- Commands timeout after 30 seconds
- Supports chaining with `cd subdir && npm test`
- Output truncated automatically for large outputs

#### Cloud Agent Handoff
- Prepend `&` to any message to send to Cloud Agent
- Pick up tasks on web or mobile at cursor.com/agents
- Allows continuation while away

#### Session Management
- `agent ls` - List all previous conversations
- `agent resume` - Resume latest conversation
- `agent --resume <chat-id>` - Resume specific conversation
- `--resume [chatId]` - Flag to resume session

#### Authentication
- `agent login` - Browser-based authentication (recommended)
- `agent status` - Check authentication status
- `agent logout` - Sign out and clear stored authentication
- API key authentication: `--api-key <key>` or `CURSOR_API_KEY` env var

#### Configuration
- Global config: `~/.cursor/cli-config.json` (macOS/Linux) or `$env:USERPROFILE\.cursor\cli-config.json` (Windows)
- Project config: `<project>/.cursor/cli.json` (permissions only)
- Config schema includes: version, editor.vimMode, permissions, model, network settings

#### Permissions
- Configured in `.cursor/cli.json` (project) or `~/.cursor/cli-config.json` (global)
- Permission types:
  - `Shell(commandBase)` - Control shell command access
  - `Read(pathOrGlob)` - Control file read access
  - `Write(pathOrGlob)` - Control file write access
- Pattern matching with glob patterns (`**`, `*`, `?`)
- Deny rules take precedence over allow rules

#### Rules and Commands
- `/rules` - Create new rules or edit existing rules
- `/commands` - Create new commands or edit existing commands
- Rules in `.cursor/rules` directory automatically loaded
- `AGENTS.md` and `CLAUDE.md` at project root also applied as rules

#### Slash Commands
- `/plan` - Switch to Plan mode
- `/ask` - Switch to Ask mode
- `/model <model>` - Set or list models
- `/auto-run [state]` - Toggle auto-run
- `/new-chat` - Start new chat session
- `/vim` - Toggle Vim keys
- `/help [command]` - Show help
- `/feedback <message>` - Share feedback
- `/resume <chat>` - Resume previous chat
- `/usage` - View Cursor streaks and usage stats
- `/about` - Show environment and CLI setup details
- `/copy-req-id` - Copy last request ID
- `/logout` - Sign out
- `/quit` - Exit
- `/setup-terminal` - Auto-configure terminal keybindings
- `/mcp list` - Browse MCP servers
- `/mcp enable <name>` - Enable MCP server
- `/mcp disable <name>` - Disable MCP server
- `/rules` - Manage rules
- `/commands` - Manage commands
- `/compress` - Summarize conversation to free context space

#### Installation
- Command: `curl https://cursor.com/install -fsS | bash`
- Installs to `~/.local/bin` (Linux/macOS)
- Requires adding `~/.local/bin` to PATH
- Auto-updates by default
- Manual update: `agent update` or `agent upgrade`

#### Non-Interactive Mode
- `-p, --print` - Print responses to console (for scripts)
- `--force` - Force allow commands unless explicitly denied (required for file writes in print mode)
- `--output-format <format>` - Control output format (only with --print)
- `--stream-partial-output` - Stream partial output (with stream-json)

---

## Part 2: Current Implementation Analysis

### 2.1 What We Currently Have (Working Well)

#### CLI Detection
- **Location**: `src/platforms/constants.ts`, `src/doctor/checks/cli-tools.ts`
- **Implementation**: 
  - Checks for both `cursor-agent` and `agent` commands
  - Uses `getCursorCommandCandidates()` with fallback paths
  - Checks known installation paths
  - Verifies `--version` and `--help` work
- **Status**: ✅ Good - handles command name variations correctly

#### Model Selection
- **Location**: `src/platforms/cursor-runner.ts`, `src/platforms/cursor-models.ts`
- **Implementation**:
  - Supports `--model <model>` flag
  - Has model catalog in `cursor-models.ts`
  - Models include: auto, cursor-small, sonnet, opus, haiku, gpt-5, gemini-3-pro, etc.
- **Status**: ✅ Good - basic model selection works

#### Non-Interactive Mode
- **Location**: `src/platforms/cursor-runner.ts`
- **Implementation**:
  - Uses `-p` flag for print mode
  - Writes prompt to stdin
  - Sets `CURSOR_NON_INTERACTIVE=1` environment variable
- **Status**: ✅ Good - non-interactive mode works

#### Plan Mode (Partial)
- **Location**: `src/platforms/cursor-runner.ts`
- **Implementation**:
  - Attempts to use `--mode=plan` flag
  - Has detection heuristics to check if flag is supported
  - Falls back to prompt-based planning if flag not supported
  - Caches mode support detection (1 hour TTL)
- **Status**: ⚠️ Partial - works but could be improved

#### MCP Configuration
- **Location**: `mcp.json` (project root)
- **Implementation**:
  - Has MCP server configuration
  - Supports context7 MCP server
- **Status**: ✅ Good - basic MCP config exists

#### Doctor Checks
- **Location**: `src/doctor/checks/cli-tools.ts`
- **Implementation**:
  - `CursorCliCheck` verifies CLI availability
  - Checks version, help, and functionality
  - Provides installation suggestion
- **Status**: ✅ Good - basic checks work

#### Installation Manager
- **Location**: `src/doctor/installation-manager.ts`
- **Implementation**:
  - Has install command: `curl https://cursor.com/install -fsSL | bash`
  - Maps checks to installation commands
- **Status**: ✅ Good - installation command exists

#### Output Parsing
- **Location**: `src/platforms/output-parsers/cursor-output-parser.ts`
- **Implementation**:
  - Parses text output
  - Extracts completion signals (`<ralph>COMPLETE</ralph>`, `<ralph>GUTTER</ralph>`)
  - Extracts session ID and token counts
- **Status**: ✅ Good - basic parsing works

### 2.2 What We're Missing (Gaps)

#### 1. Ask Mode
- **Missing**: `--mode=ask` support
- **Impact**: Cannot use read-only exploration mode
- **Priority**: High

#### 2. Enhanced Plan Mode
- **Missing**: Proper `/plan` slash command support, better detection
- **Impact**: Plan mode may not work optimally
- **Priority**: Medium

#### 3. Model Management Commands
- **Missing**: `agent models`, `/model` command, `--list-models`
- **Impact**: Cannot discover available models dynamically
- **Priority**: Medium

#### 4. MCP Commands
- **Missing**: `agent mcp list`, `agent mcp enable/disable`, `agent mcp login`
- **Impact**: Cannot manage MCP servers programmatically
- **Priority**: Medium

#### 5. Output Formats
- **Missing**: `--output-format json`, `--output-format stream-json`, `--stream-partial-output`
- **Impact**: Cannot get structured output or real-time streaming
- **Priority**: High

#### 6. Shell Mode
- **Missing**: Shell mode support
- **Impact**: Cannot use new shell mode feature
- **Priority**: Low (we have our own command execution)

#### 7. Cloud Handoff
- **Missing**: `&` prefix support
- **Impact**: Cannot hand off to cloud agents
- **Priority**: Low (we run locally)

#### 8. Permissions Configuration
- **Missing**: Reading/writing `.cursor/cli.json` permissions
- **Impact**: Cannot configure permissions programmatically
- **Priority**: Low

#### 9. Configuration Reading
- **Missing**: Reading `~/.cursor/cli-config.json`
- **Impact**: Cannot use user's CLI preferences
- **Priority**: Low

#### 10. Authentication Management
- **Missing**: `agent login`, `agent status`, `agent logout` commands
- **Impact**: Cannot check or manage authentication
- **Priority**: Medium

#### 11. Rules Management
- **Missing**: `/rules` command support
- **Impact**: Cannot manage rules programmatically
- **Priority**: Low

#### 12. Commands Management
- **Missing**: `/commands` command support
- **Impact**: Cannot manage custom commands programmatically
- **Priority**: Low

#### 13. Session Management
- **Missing**: `agent ls`, `agent resume` (though we spawn fresh)
- **Impact**: Cannot list/resume sessions (but we don't need this)
- **Priority**: Very Low (we spawn fresh per iteration)

---

## Part 3: Detailed Implementation Plan

### Phase 1: Core Mode Support (High Priority)

#### Task 1.1: Enhance Plan Mode Support

**Files to modify:**
- `src/platforms/cursor-runner.ts` - Improve plan mode detection and usage
- `src/types/platforms.ts` - Ensure planMode is properly typed

**Current State:**
- Has `planMode` detection with heuristics
- Caches mode support (1 hour TTL)
- Falls back to prompt-based planning

**Changes Needed:**
1. Improve mode detection heuristics (already partially done)
2. Ensure `--mode=plan` is used when `request.planMode === true` and flag is supported
3. Add support for `/plan` slash command in prompts (for interactive mode scenarios)
4. Update capability discovery to check for plan mode support

**Acceptance Criteria:**
- Plan mode works with `--mode=plan` flag when supported
- Fallback to prompt-based planning when flag not supported
- Mode detection cached and invalidated appropriately
- Capability discovery reports plan mode support

**Estimated Effort:** 1-2 days

#### Task 1.2: Implement Ask Mode

**Files to create/modify:**
- `src/platforms/cursor-runner.ts` - Add ask mode support
- `src/types/platforms.ts` - Add `askMode?: boolean` to ExecutionRequest

**Current State:**
- No ask mode support

**Changes Needed:**
1. Add `askMode?: boolean` to `ExecutionRequest` interface
2. Update `buildArgs()` to use `--mode=ask` when `request.askMode === true`
3. Ensure ask mode doesn't allow file writes (read-only enforcement)
4. Add capability discovery for ask mode
5. Update smoke tests to check ask mode

**Acceptance Criteria:**
- Ask mode uses `--mode=ask` flag
- Ask mode prevents file modifications (read-only)
- Works in non-interactive mode
- Capability discovery reports ask mode support

**Estimated Effort:** 1-2 days

### Phase 2: Output Format Support (High Priority)

#### Task 2.1: Add Output Format Support

**Files to modify:**
- `src/platforms/cursor-runner.ts` - Add output format flags
- `src/types/platforms.ts` - Add `outputFormat?: 'text' | 'json' | 'stream-json'`
- `src/platforms/output-parsers/cursor-output-parser.ts` - Parse JSON/stream-json formats

**Current State:**
- Only supports text output
- Basic text parsing in `cursor-output-parser.ts`

**Changes Needed:**
1. Add `outputFormat` to `ExecutionRequest` interface
2. Update `buildArgs()` to add `--output-format` flag
3. Implement JSON output parsing:
   - Parse single JSON object on completion
   - Extract `result` field for final response
   - Handle error cases
4. Implement stream-json (NDJSON) parsing:
   - Parse newline-delimited JSON events
   - Handle event types: system, user, assistant, tool_call, result
   - Support `--stream-partial-output` for character-level streaming
   - Emit events in real-time
5. Update output parser to handle all formats
6. Add capability discovery for output formats

**Output Format Details:**

**JSON Format:**
```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 1234,
  "result": "<full assistant text>",
  "session_id": "<uuid>",
  "request_id": "<optional request id>"
}
```

**Stream-JSON Format (NDJSON):**
- Each line is a JSON object
- Event types: `system`, `user`, `assistant`, `tool_call`, `result`
- Tool calls have `started` and `completed` subtypes
- With `--stream-partial-output`: multiple `assistant` events per message

**Acceptance Criteria:**
- Text format (default) works as before
- JSON format returns structured output
- Stream-json format emits events in real-time
- Partial output streaming works
- Capability discovery reports output format support

**Estimated Effort:** 2-3 days

### Phase 3: Model Management (Medium Priority)

#### Task 3.1: Add Model List Command Support

**Files to modify:**
- `src/platforms/cursor-runner.ts` - Add model discovery
- `src/platforms/cursor-models.ts` - Update with latest models
- `src/doctor/checks/cli-tools.ts` - Check for model list capability
- `src/platforms/capability-discovery.ts` - Add model list capability

**Current State:**
- Static model catalog in `cursor-models.ts`
- No dynamic model discovery

**Changes Needed:**
1. Add capability to run `agent models` or `agent --list-models`
2. Parse model list output (format TBD - need to test)
3. Update `CURSOR_MODELS` array with models discovered from CLI
4. Cache model list in capability discovery
5. Add doctor check to verify model list capability
6. Update GUI to show discovered models

**Acceptance Criteria:**
- Can discover available models from CLI
- Model list cached in capabilities.json
- Doctor check verifies model list capability
- GUI shows discovered models

**Estimated Effort:** 1-2 days

#### Task 3.2: Update Model Catalog

**Files to modify:**
- `src/platforms/cursor-models.ts` - Add new models from documentation

**Current State:**
- Has comprehensive model list
- May be missing newer models

**Changes Needed:**
1. Review changelog for new models
2. Add any missing models to `CURSOR_MODELS`
3. Update model descriptions based on latest docs
4. Verify model IDs match CLI format

**Acceptance Criteria:**
- All documented models included
- Model IDs match CLI format
- Descriptions accurate

**Estimated Effort:** 0.5 days

### Phase 4: MCP Enhancement (Medium Priority)

#### Task 4.1: Add MCP Command Support

**Files to create/modify:**
- `src/platforms/cursor-runner.ts` - Add MCP command execution
- `src/doctor/checks/cli-tools.ts` - Check MCP capabilities
- `src/platforms/capability-discovery.ts` - Add MCP capability checks

**Current State:**
- Has MCP configuration in `mcp.json`
- No programmatic MCP management

**Changes Needed:**
1. Support running `agent mcp list` to discover MCP servers
2. Parse MCP server list output
3. Support `agent mcp enable/disable <identifier>`
4. Support `agent mcp login <identifier>` for authentication
5. Support `agent mcp list-tools <identifier>` to list tools
6. Check MCP server status in doctor
7. Add capability discovery for MCP commands

**Acceptance Criteria:**
- Can list MCP servers via CLI
- Can enable/disable MCP servers
- Can authenticate with MCP servers
- Can list tools from MCP servers
- Doctor verifies MCP functionality
- Capability discovery reports MCP support

**Estimated Effort:** 2 days

### Phase 5: Doctor & Installer Improvements (High Priority)

#### Task 5.1: Update Installation Command

**Files to modify:**
- `src/doctor/installation-manager.ts` - Verify install command
- `src/doctor/checks/cli-tools.ts` - Update installation suggestion

**Current State:**
- Has install command: `curl https://cursor.com/install -fsSL | bash`
- Doesn't check PATH configuration

**Changes Needed:**
1. Verify `curl https://cursor.com/install -fsS | bash` is still correct (note: `-fsS` not `-fsSL`)
2. Add check for `~/.local/bin` in PATH (post-installation)
3. Update doctor to suggest PATH configuration if needed
4. Add check for Windows installation paths

**Acceptance Criteria:**
- Installation command matches latest docs
- Doctor suggests PATH fix if CLI installed but not in PATH
- Works on macOS, Linux, and Windows

**Estimated Effort:** 1 day

#### Task 5.2: Add Authentication Check

**Files to modify:**
- `src/doctor/checks/cli-tools.ts` - Add auth status check
- `src/platforms/auth-status.ts` - Enhance Cursor auth detection

**Current State:**
- Has basic auth status check
- May not use `agent status` command

**Changes Needed:**
1. Run `agent status` to check authentication
2. Parse auth status from output
3. Provide fix suggestions for unauthenticated state
4. Update doctor to report authentication status clearly

**Acceptance Criteria:**
- Doctor reports authentication status
- Suggests `agent login` if not authenticated
- Parses status output correctly

**Estimated Effort:** 1 day

#### Task 5.3: Add Capability Discovery for New Features

**Files to modify:**
- `src/platforms/capability-discovery.ts` - Add new capability checks
- `src/types/platforms.ts` - Add new capability types

**Current State:**
- Has capability discovery system
- Checks basic capabilities (non-interactive, model selection, etc.)

**Changes Needed:**
1. Add capability checks for:
   - Plan mode (`--mode=plan`)
   - Ask mode (`--mode=ask`)
   - Output formats (`--output-format`)
   - Model list (`agent models`)
   - MCP commands (`agent mcp list`)
   - Shell mode (if applicable)
   - Cloud handoff (if applicable)
2. Update capability types in `types/platforms.ts`
3. Cache new capabilities in capabilities.json
4. Update GUI to show new capabilities

**Acceptance Criteria:**
- All new capabilities discoverable
- Cached in capabilities.json
- Doctor reports capability status
- GUI shows capability status

**Estimated Effort:** 2-3 days

### Phase 6: Configuration & Permissions (Low Priority)

#### Task 6.1: Read Cursor CLI Configuration

**Files to create/modify:**
- `src/platforms/cursor-config.ts` - New file for config reading
- `src/platforms/cursor-runner.ts` - Use config values

**Current State:**
- No config reading

**Changes Needed:**
1. Read `~/.cursor/cli-config.json` (global) or `.cursor/cli.json` (project)
2. Parse config schema:
   - version
   - editor.vimMode
   - permissions (allow/deny)
   - model preferences
   - network settings
3. Use config values as defaults
4. Handle missing config gracefully

**Config Schema:**
```json
{
  "version": 1,
  "editor": { "vimMode": false },
  "permissions": {
    "allow": ["Shell(ls)", "Read(src/**/*.ts)"],
    "deny": ["Shell(rm)", "Write(.env*)"]
  },
  "model": { ... },
  "network": { "useHttp1ForAgent": false }
}
```

**Acceptance Criteria:**
- Can read CLI config file
- Config values used as defaults
- Handles missing config gracefully
- Works with both global and project configs

**Estimated Effort:** 2-3 days

#### Task 6.2: Support Permissions Configuration

**Files to modify:**
- `src/platforms/cursor-runner.ts` - Respect permissions
- `src/types/platforms.ts` - Add permission types

**Current State:**
- No permission system

**Changes Needed:**
1. Read permissions from `.cursor/cli.json` or `~/.cursor/cli-config.json`
2. Parse permission format:
   - `Shell(commandBase)` - Shell command access
   - `Read(pathOrGlob)` - File read access
   - `Write(pathOrGlob)` - File write access
3. Apply permission restrictions to tool calls
4. Document permission format

**Acceptance Criteria:**
- Permissions read from config
- Restrictions applied to execution
- Documented in code
- Works with glob patterns

**Estimated Effort:** 2-3 days

### Phase 7: GUI Integration (Medium Priority)

#### Task 7.1: Update GUI to Show New Features

**Files to modify:**
- `src/gui/react/src/pages/Settings.tsx` - Add mode selection
- `src/gui/react/src/pages/Capabilities.tsx` - Show new capabilities
- `src/gui/routes/config.ts` - Expose new config options

**Current State:**
- GUI shows basic Cursor CLI info
- May not show all new features

**Changes Needed:**
1. Add Plan/Ask mode toggle in settings
2. Show output format selection (text/json/stream-json)
3. Display MCP server status
4. Show model list in capabilities page
5. Display authentication status
6. Show permission configuration

**Acceptance Criteria:**
- GUI shows all new Cursor CLI features
- Settings allow configuration
- Capabilities page shows status
- MCP servers visible and manageable

**Estimated Effort:** 2 days

### Phase 8: Documentation Updates (Low Priority)

#### Task 8.1: Update Internal Documentation

**Files to modify:**
- `REQUIREMENTS.md` - Update Cursor CLI section
- `AGENTS.md` - Update platform commands
- `ARCHITECTURE.md` - Update runner implementation

**Current State:**
- Documentation may be outdated
- Examples may use old syntax

**Changes Needed:**
1. Document new modes (Plan, Ask)
2. Document output formats
3. Document MCP commands
4. Document model management
5. Update command examples
6. Update architecture diagrams

**Acceptance Criteria:**
- All docs reflect new features
- Examples use latest syntax
- Architecture diagrams updated
- Command reference complete

**Estimated Effort:** 1 day

---

## Part 4: Implementation Notes

### Command Name Handling

We already handle both `cursor-agent` and `agent` commands correctly via `getCursorCommandCandidates()` in `src/platforms/constants.ts`. This is good and should be maintained.

**Current Implementation:**
- Checks user-configured override first
- Falls back to default `cursor-agent`
- Checks alternate names: `cursor`, `cursor-agent`, `agent`
- Checks known installation paths
- Works on Windows, macOS, and Linux

### Fresh Spawn Policy

We spawn fresh agents per iteration (per REQUIREMENTS.md Section 26.1), so session management (`agent ls`, `agent resume`) is not applicable to our use case. However, we should still be aware of these features for debugging purposes.

### Output Format Priority

1. **Start with text format** (current behavior) - maintain backward compatibility
2. **Add JSON format** - for structured responses and scripting
3. **Add stream-json** - for real-time updates (most complex, but most useful)

### Testing Strategy

- Update smoke tests to check for new capabilities
- Add integration tests for new modes (Plan, Ask)
- Test output format parsing (text, JSON, stream-json)
- Verify MCP command execution
- Test authentication status checking
- Test model list discovery

### Risk Assessment

**Low Risk:**
- Model catalog updates
- Documentation updates
- GUI display updates

**Medium Risk:**
- Output format parsing (JSON/stream-json) - need to handle edge cases
- MCP command execution - need to parse various output formats
- Configuration file reading - need to handle missing/invalid configs

**High Risk:**
- Ask mode implementation - must prevent writes correctly
- Permission system integration - must apply restrictions correctly
- Breaking changes in CLI behavior - need to handle version differences

### Dependencies

- Cursor CLI 2.4+ (January 2026 release)
- Existing capability discovery system
- Doctor system
- GUI system
- Output parser system

---

## Part 5: Success Criteria

1. ✅ Plan mode works reliably with `--mode=plan`
2. ✅ Ask mode prevents file modifications
3. ✅ Output formats (text/json/stream-json) all work
4. ✅ Model list discoverable from CLI
5. ✅ MCP commands executable
6. ✅ Doctor reports all new capabilities
7. ✅ GUI shows new features
8. ✅ Documentation updated
9. ✅ All tests pass
10. ✅ No regressions in existing functionality

---

## Part 6: Timeline Estimate

- **Phase 1 (Core Modes)**: 2-3 days
- **Phase 2 (Output Formats)**: 2-3 days
- **Phase 3 (Model Management)**: 1-2 days
- **Phase 4 (MCP Enhancement)**: 2 days
- **Phase 5 (Doctor/Installer)**: 2-3 days
- **Phase 6 (Config/Permissions)**: 2-3 days
- **Phase 7 (GUI Integration)**: 2 days
- **Phase 8 (Documentation)**: 1 day

**Total: ~15-20 days** (assuming sequential execution, can be parallelized)

---

## Part 7: Key Files Reference

### Current Implementation Files

1. **CLI Detection & Constants**
   - `src/platforms/constants.ts` - Command names and path resolution
   - `src/doctor/checks/cli-tools.ts` - CLI availability checks

2. **Cursor Runner**
   - `src/platforms/cursor-runner.ts` - Main runner implementation
   - `src/platforms/cursor-models.ts` - Model catalog
   - `src/platforms/output-parsers/cursor-output-parser.ts` - Output parsing

3. **Capability Discovery**
   - `src/platforms/capability-discovery.ts` - Capability detection
   - `src/types/platforms.ts` - Type definitions

4. **Doctor System**
   - `src/doctor/installation-manager.ts` - Installation commands
   - `src/doctor/doctor-reporter.ts` - Report formatting

5. **GUI**
   - `src/gui/react/src/pages/Settings.tsx` - Settings page
   - `src/gui/react/src/pages/Capabilities.tsx` - Capabilities page
   - `src/gui/routes/config.ts` - Config API

6. **Documentation**
   - `REQUIREMENTS.md` - Requirements specification
   - `AGENTS.md` - Agent documentation
   - `ARCHITECTURE.md` - Architecture documentation

---

## Part 8: Next Steps

1. **Review this document** - Ensure all gaps identified
2. **Prioritize phases** - Decide which phases to implement first
3. **Start with Phase 1** - Core Mode Support (highest priority)
4. **Test each phase** - Verify before moving to next
5. **Update capability discovery** - As features are added
6. **Keep documentation in sync** - Update docs as implementation progresses

---

## Part 9: Questions for Review

1. **Priority**: Which phases should be implemented first? (Recommend: Phase 1, 2, 5)
2. **Scope**: Should we implement all phases or focus on high-priority ones?
3. **Testing**: How should we test new features? (Integration tests, smoke tests, manual?)
4. **Backward Compatibility**: Should we maintain backward compatibility with older Cursor CLI versions?
5. **GUI**: Should GUI updates wait until core features are implemented?
6. **Documentation**: Should documentation be updated as we go or at the end?

---

## Part 10: Additional Findings

### Installation Command Note

The documentation shows the install command as:
```bash
curl https://cursor.com/install -fsS | bash
```

Our current implementation uses:
```bash
curl https://cursor.com/install -fsSL | bash
```

The difference is `-fsSL` vs `-fsS`. The `-L` flag follows redirects. We should verify which is correct, but `-fsS` (without `-L`) is what the official docs show.

### PATH Configuration

The documentation emphasizes adding `~/.local/bin` to PATH after installation. Our doctor should check for this and suggest the fix if CLI is installed but not in PATH.

### Authentication Flow

The new authentication uses browser-based flow with automatic callback handling. This is more user-friendly than API keys for interactive use, but API keys are still needed for automation/CI.

### MCP Authentication

MCP servers now support one-click authentication with automatic callback handling. This makes MCP setup much easier than before.

### Output Format Details

The stream-json format is particularly useful for real-time monitoring. It emits NDJSON (newline-delimited JSON) with event types:
- `system` - Initialization
- `user` - User message
- `assistant` - Assistant message
- `tool_call` - Tool execution (with `started` and `completed` subtypes)
- `result` - Final result

With `--stream-partial-output`, the `assistant` events contain incremental text deltas for character-level streaming.

---

## Conclusion

This document provides a comprehensive analysis of Cursor CLI updates and a detailed plan for modernizing our implementation. The plan is organized into 8 phases, with clear priorities and acceptance criteria for each task.

The highest priority items are:
1. Core Mode Support (Plan/Ask modes)
2. Output Format Support (JSON/stream-json)
3. Doctor & Installer Improvements

These should be implemented first, followed by medium-priority items (Model Management, MCP Enhancement, GUI Integration), and finally low-priority items (Configuration/Permissions, Documentation).

All changes should maintain backward compatibility and include comprehensive testing.
