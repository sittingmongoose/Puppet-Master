# Cursor CLI Update Analysis & Recommendations
## RWM Puppet Master - January 2026

> **Purpose**: Comprehensive analysis of new Cursor CLI features and recommendations for updating RWM Puppet Master implementation
> **Status**: Review Document - No Changes Made
> **Date**: January 26, 2026

---

## Executive Summary

Cursor CLI has undergone significant updates in January 2026, introducing new modes (Plan, Ask), enhanced model management, improved output formats, session management, MCP support, and more. This document analyzes our current implementation and provides detailed recommendations for modernization.

**Key Findings**:
- Our implementation uses `cursor-agent` but should prefer `agent` (new primary command)
- Plan mode exists but uses prompt preamble fallback; official `--mode=plan` now available
- Ask mode (`--mode=ask`) is completely missing
- Output formats (JSON, stream-json) not supported
- Model discovery could leverage `agent models` command
- Session management partially implemented but could be enhanced
- MCP support exists but could leverage new CLI commands

---

## Part 1: New Cursor CLI Features (From Documentation)

### 1.1 Command Name Changes

**Old Behavior**:
- Primary command: `cursor-agent`
- Installation: `curl https://cursor.com/install -fsSL | bash`

**New Behavior**:
- Primary command: `agent` (preferred)
- Fallback: `cursor-agent` (still works)
- Installation: `curl https://cursor.com/install -fsS | bash` (note: `-fsS` not `-fsSL`)

**Impact**: Low - We already check both commands, but should prefer `agent`

### 1.2 Modes (NEW FEATURE)

#### Plan Mode
- **CLI Flag**: `--mode=plan` or `/plan` (interactive)
- **Keyboard**: `Shift+Tab` (rotate modes)
- **Purpose**: Design approach before coding, asks clarifying questions
- **Status**: We have partial support with prompt preamble fallback

#### Ask Mode
- **CLI Flag**: `--mode=ask` or `/ask` (interactive)
- **Purpose**: Read-only exploration without making changes
- **Status**: Not implemented

#### Agent Mode
- **Default**: Full access to all tools
- **Status**: This is our current default behavior

### 1.3 Model Management (ENHANCED)

**New Commands**:
- `agent models` - List all available models
- `/models` - Interactive model list
- `--list-models` - Flag to list models
- `/model <model>` - Switch model in interactive mode

**Auto-Update**:
- CLI auto-updates by default
- Manual update: `agent update` or `agent upgrade`

**Impact**: Medium - We have static model list; could use dynamic discovery

### 1.4 Output Formats (NEW FEATURE)

**Formats**:
- `text` (default) - Plain text output
- `json` - Single JSON object on completion
- `stream-json` - Newline-delimited JSON (NDJSON) events

**Streaming**:
- `--stream-partial-output` - Character-level deltas with `stream-json`

**Use Cases**:
- Scripts and automation
- CI/CD pipelines
- Real-time progress tracking

**Impact**: High - Currently not supported; would enable better automation

### 1.5 Sessions (ENHANCED)

**Commands**:
- `agent ls` - List previous conversations
- `agent resume` - Resume latest conversation
- `--resume <chat-id>` - Resume specific conversation

**Session IDs**:
- Tracked in output
- Can be extracted for resume

**Impact**: Medium - We extract session IDs but don't use resume functionality

### 1.6 MCP Support (ENHANCED)

**Interactive Commands**:
- `/mcp list` - Browse, enable, configure MCP servers
- `/mcp enable <name>` - Enable MCP server
- `/mcp disable <name>` - Disable MCP server

**CLI Commands**:
- `agent mcp list` - List configured servers
- `agent mcp login <identifier>` - Authenticate with MCP server
- `agent mcp list-tools <identifier>` - List available tools

**Auto-Discovery**:
- Respects `mcp.json` configuration (project → global → nested)

**Impact**: Low - We already support MCP via config; new commands are convenience

### 1.7 Shell Mode (NEW FEATURE)

**Purpose**: Run shell commands directly from CLI without leaving conversation

**Limitations**:
- 30 second timeout
- Non-interactive only
- No long-running processes

**Use Cases**:
- Quick status checks
- File operations
- Environment inspection

**Impact**: Low - Not critical for our use case (we spawn processes directly)

### 1.8 Cloud Handoff (NEW FEATURE)

**Syntax**: Prefix message with `&` to send to Cloud Agent

**Access**: Continue on web/mobile at cursor.com/agents

**Impact**: Low - We operate locally, cloud handoff not needed

### 1.9 Permissions (NEW FEATURE)

**Configuration**:
- Project: `.cursor/cli.json`
- Global: `~/.cursor/cli-config.json`

**Permission Types**:
- `Shell(command)` - Control shell command access
- `Read(pathOrGlob)` - Control file read access
- `Write(pathOrGlob)` - Control file write access

**Enforcement**: Allow/deny lists

**Impact**: Medium - Could enhance security for our automation

### 1.10 Authentication (ENHANCED)

**Methods**:
- Browser: `agent login` (recommended)
- API Key: `CURSOR_API_KEY` env var or `--api-key` flag

**Status Check**: `agent status`

**Impact**: Low - We already handle authentication

---

## Part 2: Current Implementation Analysis

### 2.1 Command Detection

**Current Implementation** (`src/platforms/constants.ts`):
```typescript
export const PLATFORM_COMMANDS: Readonly<Record<Platform, string>> = {
  cursor: process.platform === 'win32' ? 'cursor-agent.exe' : 'cursor-agent',
  // ...
}

export function getCursorCommandCandidates(
  cliPaths?: Partial<CliPathsConfig> | null
): string[] {
  const candidates: string[] = [];
  // 1. User-configured override
  if (cliPaths?.cursor) {
    candidates.push(cliPaths.cursor);
  }
  // 2. Default command name
  candidates.push(PLATFORM_COMMANDS.cursor);
  // 3. Alternate command names
  if (process.platform === 'win32') {
    candidates.push('cursor.exe', 'cursor-agent.exe', 'agent.exe');
  } else {
    candidates.push('cursor', 'cursor-agent', 'agent');
  }
  // 4. Known installation paths
  // ...
}
```

**Analysis**:
- ✅ Already checks `agent` as fallback
- ❌ Should prefer `agent` over `cursor-agent`
- ✅ Installation path detection is good

**Recommendation**: Update `PLATFORM_COMMANDS.cursor` to prefer `agent`, keep `cursor-agent` as fallback

### 2.2 Plan Mode Support

**Current Implementation** (`src/platforms/cursor-runner.ts`):
```typescript
// Cursor plan mode (best-effort; requires CLI support)
if (request.planMode === true && this.modeFlagSupport === true) {
  args.push('--mode=plan');
}

// Fallback when plan-mode CLI flag is unavailable:
if (request.planMode === true && this.modeFlagSupport === false) {
  const preamble = [
    'PLAN FIRST (briefly), THEN EXECUTE:',
    '- Start with a concise plan (max 10 bullets).',
    // ...
  ].join('\n');
  return `${preamble}${request.prompt}`;
}
```

**Analysis**:
- ✅ Detects plan mode support via `--help` parsing
- ✅ Uses `--mode=plan` when available
- ✅ Has fallback prompt preamble
- ⚠️ Fallback may no longer be needed (plan mode is official)

**Recommendation**: Keep detection, but assume plan mode is available in newer CLI versions

### 2.3 Ask Mode Support

**Current Implementation**: Not implemented

**Analysis**:
- ❌ No `askMode` in `ExecutionRequest` type
- ❌ No `--mode=ask` flag support
- ❌ No capability discovery for ask mode

**Recommendation**: Add ask mode support for read-only exploration

### 2.4 Output Formats

**Current Implementation**: Not implemented

**Analysis**:
- ❌ No `outputFormat` in `ExecutionRequest` type
- ❌ No `--output-format` flag support
- ❌ Output parser only handles text

**Recommendation**: Add output format support, especially `json` and `stream-json` for automation

### 2.5 Session Management

**Current Implementation** (`src/platforms/cursor-runner.ts`):
```typescript
// Extract session IDs from output
if (parsed.sessionId) {
  result.sessionId = parsed.sessionId;
}
```

**Analysis**:
- ✅ Extracts session IDs
- ❌ No `--resume` flag support
- ❌ No `agent ls` integration
- ❌ Session IDs not stored for resume

**Recommendation**: Add session resume capability, store session IDs

### 2.6 Model Management

**Current Implementation** (`src/platforms/cursor-models.ts`):
```typescript
export const CURSOR_MODELS: CursorModel[] = [
  { id: 'auto', label: 'Auto (Recommended)', ... },
  { id: 'cursor-small', label: 'Cursor Small', ... },
  // ... static list
];
```

**Analysis**:
- ✅ Static model list is comprehensive
- ❌ No dynamic discovery via `agent models`
- ❌ No `--list-models` flag usage

**Recommendation**: Add dynamic model discovery while keeping static list as fallback

### 2.7 Doctor Checks

**Current Implementation** (`src/doctor/checks/cli-tools.ts`):
```typescript
export class CursorCliCheck implements DoctorCheck {
  async run(): Promise<CheckResult> {
    const candidates: CliInvocation[] = getCursorCommandCandidates(this.cliPaths).map((c) => ({
      command: c,
    }));
    // Checks for --version and --help
    // Installation: 'curl https://cursor.com/install -fsSL | bash'
  }
}
```

**Analysis**:
- ✅ Checks both `agent` and `cursor-agent`
- ❌ Installation command uses old flag (`-fsSL` instead of `-fsS`)
- ✅ Version and help checks work

**Recommendation**: Update installation command, prefer `agent` in checks

### 2.8 Installation Manager

**Current Implementation** (`src/doctor/installation-manager.ts`):
```typescript
// Default install commands
- cursor-cli: "curl https://cursor.com/install -fsSL | bash"
```

**Analysis**:
- ❌ Uses old installation URL format
- ✅ Platform detection works
- ✅ Confirmation flow works

**Recommendation**: Update installation command to new format

### 2.9 Capability Discovery

**Current Implementation** (`src/platforms/capability-discovery.ts`):
- Probes CLI with `--help` and `--version`
- Parses flags from help output
- Runs smoke tests
- Caches results

**Analysis**:
- ✅ Good foundation
- ❌ Doesn't check for new modes (ask mode)
- ❌ Doesn't check for output formats
- ❌ Doesn't check for MCP commands
- ❌ Doesn't check for session management

**Recommendation**: Add capability checks for all new features

---

## Part 3: Gap Analysis

### 3.1 Critical Gaps (Must Fix)

1. **Command Preference**: Should prefer `agent` over `cursor-agent`
2. **Installation Command**: Update to new URL format (`-fsS` not `-fsSL`)
3. **Ask Mode**: Completely missing, should be added
4. **Output Formats**: Not supported, needed for automation

### 3.2 Important Gaps (Should Fix)

1. **Plan Mode**: Remove fallback preamble (now officially supported)
2. **Model Discovery**: Add dynamic discovery via `agent models`
3. **Session Resume**: Add `--resume` support
4. **Capability Discovery**: Add checks for new features

### 3.3 Nice-to-Have (Could Fix)

1. **MCP Commands**: Add `agent mcp` command support
2. **Permissions**: Add `.cursor/cli.json` support
3. **Shell Mode**: Document but not critical for our use case
4. **Cloud Handoff**: Not needed for local operation

---

## Part 4: Detailed Recommendations

### 4.1 Phase 1: Critical Updates (Priority: High)

#### Task 1.1: Update Command Preference
**Files**: `src/platforms/constants.ts`

**Changes**:
```typescript
// Change from:
cursor: process.platform === 'win32' ? 'cursor-agent.exe' : 'cursor-agent',

// To:
cursor: process.platform === 'win32' ? 'agent.exe' : 'agent',
```

**Rationale**: `agent` is now the primary command name

#### Task 1.2: Update Installation Commands
**Files**: 
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.ts`

**Changes**:
```typescript
// Change from:
'curl https://cursor.com/install -fsSL | bash'

// To:
'curl https://cursor.com/install -fsS | bash'
```

**Rationale**: New documentation uses `-fsS` flag

#### Task 1.3: Add Ask Mode Support
**Files**: 
- `src/types/platforms.ts` (add `askMode?: boolean`)
- `src/platforms/cursor-runner.ts` (add `--mode=ask` flag)

**Changes**:
```typescript
// In ExecutionRequest:
export interface ExecutionRequest {
  // ... existing fields
  askMode?: boolean;  // NEW
}

// In CursorRunner.buildArgs():
if (request.askMode === true) {
  args.push('--mode=ask');
}
```

**Rationale**: Ask mode enables read-only exploration

#### Task 1.4: Add Output Format Support
**Files**: 
- `src/types/platforms.ts` (add `outputFormat?: 'text' | 'json' | 'stream-json'`)
- `src/platforms/cursor-runner.ts` (add `--output-format` flag)
- `src/platforms/output-parsers/cursor-output-parser.ts` (add JSON parsing)

**Changes**:
```typescript
// In ExecutionRequest:
export interface ExecutionRequest {
  // ... existing fields
  outputFormat?: 'text' | 'json' | 'stream-json';  // NEW
  streamPartialOutput?: boolean;  // NEW
}

// In CursorRunner.buildArgs():
if (request.outputFormat) {
  args.push('--output-format', request.outputFormat);
  if (request.outputFormat === 'stream-json' && request.streamPartialOutput) {
    args.push('--stream-partial-output');
  }
}
```

**Rationale**: JSON formats enable better automation and progress tracking

### 4.2 Phase 2: Important Updates (Priority: Medium)

#### Task 2.1: Enhance Plan Mode
**Files**: `src/platforms/cursor-runner.ts`

**Changes**:
- Remove or simplify prompt preamble fallback
- Assume plan mode is available in newer CLI versions
- Keep detection for backward compatibility

**Rationale**: Plan mode is now officially supported

#### Task 2.2: Add Dynamic Model Discovery
**Files**: `src/platforms/cursor-models.ts`

**Changes**:
```typescript
export async function discoverCursorModels(command: string = 'agent'): Promise<CursorModel[]> {
  // Run: agent models or agent --list-models
  // Parse output
  // Return discovered models
  // Fallback to static list if discovery fails
}
```

**Rationale**: Dynamic discovery ensures we always have latest models

#### Task 2.3: Add Session Resume
**Files**: `src/platforms/cursor-runner.ts`

**Changes**:
```typescript
// In ExecutionRequest:
export interface ExecutionRequest {
  // ... existing fields
  resumeSessionId?: string;  // NEW
}

// In CursorRunner.buildArgs():
if (request.resumeSessionId) {
  args.push('--resume', request.resumeSessionId);
}
```

**Rationale**: Session resume enables conversation continuity

#### Task 2.4: Update Capability Discovery
**Files**: `src/platforms/capability-discovery.ts`

**Changes**:
- Add check for `--mode=plan`
- Add check for `--mode=ask`
- Add check for `--output-format`
- Add check for `agent models` command
- Add check for `agent ls` command
- Add check for MCP commands

**Rationale**: Ensure we detect all available features

### 4.3 Phase 3: Nice-to-Have Updates (Priority: Low)

#### Task 3.1: Add MCP Command Support
**Files**: New file or extend existing

**Changes**:
- Add `agent mcp list` integration
- Add `agent mcp enable/disable` support
- Display MCP status in GUI

**Rationale**: Better MCP management UX

#### Task 3.2: Add Permissions Support
**Files**: New file for permissions management

**Changes**:
- Read `.cursor/cli.json` or `~/.cursor/cli-config.json`
- Respect permission settings
- Document permission configuration

**Rationale**: Enhanced security for automation

---

## Part 5: Implementation Plan

### Phase 1: Critical Updates (Week 1)

1. **Update Command Preference**
   - Change `PLATFORM_COMMANDS.cursor` to `agent`
   - Update `getCursorCommandCandidates()` to prefer `agent`
   - Test backward compatibility

2. **Update Installation Commands**
   - Fix installation URL in doctor checks
   - Fix installation URL in installation manager
   - Test installation on all platforms

3. **Add Ask Mode Support**
   - Add `askMode` to `ExecutionRequest` type
   - Add `--mode=ask` flag support
   - Add capability discovery for ask mode
   - Add tests

4. **Add Output Format Support**
   - Add `outputFormat` to `ExecutionRequest` type
   - Add `--output-format` flag support
   - Add JSON output parser
   - Add stream-json parser
   - Add tests

### Phase 2: Important Updates (Week 2)

1. **Enhance Plan Mode**
   - Simplify fallback (or remove)
   - Update capability discovery
   - Test with new CLI versions

2. **Add Dynamic Model Discovery**
   - Implement `discoverCursorModels()` function
   - Integrate with capability discovery
   - Cache discovered models
   - Fallback to static list

3. **Add Session Resume**
   - Add `resumeSessionId` to `ExecutionRequest`
   - Add `--resume` flag support
   - Store session IDs
   - Add `agent ls` integration

4. **Update Capability Discovery**
   - Add checks for all new features
   - Update capability matrix
   - Update smoke tests

### Phase 3: Nice-to-Have Updates (Week 3)

1. **Add MCP Command Support**
   - Integrate `agent mcp` commands
   - Add GUI integration
   - Document usage

2. **Add Permissions Support**
   - Read permission configs
   - Respect permissions
   - Document configuration

### Phase 4: Documentation & Testing (Week 4)

1. **Update Documentation**
   - Update `REQUIREMENTS.md` with new features
   - Update `AGENTS.md` with new commands
   - Update `ARCHITECTURE.md` if needed

2. **Comprehensive Testing**
   - Unit tests for all new features
   - Integration tests
   - Capability discovery tests
   - Doctor check tests
   - GUI tests (if applicable)

---

## Part 6: Testing Strategy

### 6.1 Unit Tests

**New Tests Needed**:
- Ask mode flag building
- Output format flag building
- Session resume flag building
- Model discovery parsing
- JSON output parsing
- Stream-json parsing

### 6.2 Integration Tests

**New Tests Needed**:
- End-to-end ask mode execution
- End-to-end output format execution
- Session resume flow
- Model discovery flow
- Capability discovery with new features

### 6.3 Capability Tests

**New Tests Needed**:
- Detect plan mode support
- Detect ask mode support
- Detect output format support
- Detect model discovery support
- Detect session management support

### 6.4 Doctor Tests

**New Tests Needed**:
- Doctor check with `agent` command
- Doctor check with new installation command
- Installation with new command

---

## Part 7: Migration Notes

### 7.1 Backward Compatibility

**Strategy**: Maintain support for `cursor-agent` command while preferring `agent`

**Implementation**:
- Keep `cursor-agent` in command candidates
- Prefer `agent` when both available
- Graceful fallback if `agent` not found

### 7.2 Feature Flags

**Consideration**: Use feature flags for new capabilities

**Implementation**:
- Detect CLI version if possible
- Enable features based on capability discovery
- Graceful degradation for older CLI versions

### 7.3 Error Handling

**Strategy**: Graceful degradation if features unavailable

**Implementation**:
- Try new features first
- Fall back to old behavior if not available
- Log warnings when falling back

---

## Part 8: Success Criteria

### 8.1 Functional Requirements

- [ ] `agent` command is preferred over `cursor-agent`
- [ ] Installation uses correct command (`-fsS` flag)
- [ ] Ask mode works correctly (`--mode=ask`)
- [ ] Output formats work (`text`, `json`, `stream-json`)
- [ ] Plan mode uses official flag (no prompt preamble)
- [ ] Model discovery works dynamically
- [ ] Session resume works (`--resume`)
- [ ] Capability discovery detects all new features

### 8.2 Quality Requirements

- [ ] All tests pass
- [ ] Backward compatibility maintained
- [ ] Documentation updated
- [ ] No regressions in existing functionality
- [ ] Performance acceptable

### 8.3 User Experience

- [ ] Doctor checks work with new CLI
- [ ] Installation works correctly
- [ ] GUI shows new features (if applicable)
- [ ] Error messages are clear
- [ ] Fallbacks work gracefully

---

## Part 9: Risk Assessment

### 9.1 Low Risk

- Command name preference change (backward compatible)
- Installation command update (simple change)
- Documentation updates

### 9.2 Medium Risk

- Ask mode addition (new feature, needs testing)
- Output format support (parsing complexity)
- Model discovery (network dependency)

### 9.3 High Risk

- Plan mode changes (could break existing workflows)
- Session resume (complexity in state management)
- Capability discovery updates (affects all platforms)

### 9.4 Mitigation Strategies

1. **Feature Flags**: Enable new features gradually
2. **Testing**: Comprehensive test coverage
3. **Monitoring**: Watch for errors in production
4. **Rollback**: Keep old code paths available
5. **Documentation**: Clear migration guides

---

## Part 10: Appendix

### 10.1 Current File Locations

**Core Implementation**:
- `src/platforms/cursor-runner.ts` - Main runner
- `src/platforms/cursor-models.ts` - Model definitions
- `src/platforms/capability-discovery.ts` - Capability detection
- `src/platforms/constants.ts` - Command constants
- `src/types/platforms.ts` - Type definitions

**Doctor System**:
- `src/doctor/checks/cli-tools.ts` - CLI checks
- `src/doctor/installation-manager.ts` - Installation

**Documentation**:
- `REQUIREMENTS.md` - Requirements
- `AGENTS.md` - Agent documentation
- `ARCHITECTURE.md` - Architecture docs

### 10.2 Key Documentation Links

- [Cursor Changelog](https://cursor.com/changelog)
- [Cursor CLI Overview](https://cursor.com/docs/cli/overview)
- [Cursor CLI Installation](https://cursor.com/docs/cli/installation)
- [Cursor CLI Using](https://cursor.com/docs/cli/using)
- [Cursor CLI MCP](https://cursor.com/docs/cli/mcp)
- [Cursor CLI Headless](https://cursor.com/docs/cli/headless)
- [Cursor CLI Reference](https://cursor.com/docs/cli/reference)

### 10.3 Related Issues

- Plan mode fallback preamble (could be removed)
- Model list static vs dynamic (should be dynamic)
- Session IDs extracted but not used (should add resume)
- Output parsing only handles text (should handle JSON)

---

## Conclusion

The Cursor CLI has evolved significantly with new features that would enhance RWM Puppet Master's capabilities. The most critical updates are:

1. **Command preference** (quick win)
2. **Installation command** (quick win)
3. **Ask mode** (new capability)
4. **Output formats** (automation enhancement)

The recommended approach is phased implementation, starting with critical updates and gradually adding important and nice-to-have features. All changes should maintain backward compatibility and include comprehensive testing.

**Next Steps**:
1. Review this document
2. Prioritize tasks based on needs
3. Create implementation tickets
4. Begin Phase 1 implementation

---

*Document prepared by: AI Assistant*  
*Date: January 26, 2026*  
*Status: Ready for Review*
