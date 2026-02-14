# AGENTS.md - RWM Puppet Master
Always use the Context7 MCP.  You need to take your time and be careful as this is something you can mess up easily and cause a lot of issues if you arent careful.
> Long-term memory for AI agents working on this project.
> Updated as patterns emerge and gotchas are discovered.

---

## Project Overview

RWM Puppet Master is a CLI orchestrator implementing the Ralph Wiggum Method - a four-tier hierarchical approach to AI-assisted development. The system coordinates multiple AI CLI platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot) without using APIs, relying exclusively on CLI invocations.

> **NOTE: Rewrite in Progress** — The codebase was rewritten from Tauri/TypeScript to **Rust/Iced** (`puppet-master-rs/`). The Rust codebase is the active development target. Some sections below still reference the old TypeScript patterns for reference, but all new work should be in Rust.

### Key Concepts
- **Four Tiers**: Phase → Task → Subtask → Iteration
- **CLI-Only**: No API calls, only CLI invocations
- **Fresh Agents**: Every iteration spawns a new process (CU-P2-T12: no session resume, no cloud handoff)
- **Verification Gates**: Automated checks between tiers
- **Memory Layers**: progress.txt (short-term), AGENTS.md (long-term), prd.json (work queue)

---

## Architecture Notes

> **The active codebase is `puppet-master-rs/` (Rust/Iced).** All paths below are relative to `puppet-master-rs/src/`.

### Module Responsibilities (Rust/Iced)

| Module | Purpose |
|--------|---------|
| `src/app.rs` | Main app state, Message enum, update/view logic (~4700 lines) |
| `src/views/` | Iced view functions (config, setup, doctor, wizard, interview, etc.) |
| `src/widgets/` | Reusable Iced UI components (see `docs/gui-widget-catalog.md`) |
| `src/platforms/` | Platform runners, auth, detection, capability, **platform_specs.rs** |
| `src/platforms/platform_specs.rs` | **Single source of truth** for ALL platform CLI data |
| `src/core/` | State machines, orchestrator, execution engine |
| `src/config/` | GUI config, app settings |
| `src/types/` | Type definitions (Platform enum, PlatformConfig, etc.) |
| `src/interview/` | Interview orchestrator, phase management |
| `src/git/` | Git operations, worktree, PR management |
| `src/doctor/` | Platform health checks |
| `src/state/` | Agent state management, promotion gates |
| `src/projects/` | Project management |
| `src/start_chain/` | Startup chain orchestration |

### Supported Platforms (5 total)
All platform data is in `src/platforms/platform_specs.rs`. **Never hardcode platform info elsewhere.**

| Platform | CLI Binary | Auth | Subscription |
|----------|-----------|------|-------------|
| Cursor | `agent` | `agent login` (browser OAuth) | Cursor subscription |
| Codex | `codex` | `codex login` (browser OAuth) | ChatGPT subscription |
| Claude Code | `claude` | Interactive browser login | Anthropic subscription |
| Gemini | `gemini` | Google OAuth on first run | Google subscription |
| GitHub Copilot | `copilot` | `/login` (GitHub OAuth) | GitHub subscription |

**CRITICAL: Subscription auth ONLY — NO API keys.** API keys are expensive and don't go towards subscriptions.

### Legacy Module Responsibilities (TypeScript — for reference only)

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
4. Spawn fresh agent process (CU-P2-T12: always fresh, never resume or cloud handoff)
5. Parse output for completion signal
6. Run verification gate
7. Update state files
8. Advance to next item or escalate

**CU-P2-T12: Process Isolation Policy**
- Puppet Master spawns a completely fresh process for each iteration
- Never uses `agent resume` or session continuation features
- Never uses cloud handoff (`&` command) or any stateful session features
- Rationale: Determinism, isolation, and reproducibility require stateless execution
- Each iteration must be independent and reproducible without session dependencies

---

## Codebase Patterns

### Rust/Iced Patterns (Active Codebase)

**Platform data — always use platform_specs:**
```rust
use crate::platforms::platform_specs;

// CORRECT — single source of truth
let binary = platform_specs::cli_binary_names(platform);
let supports = platform_specs::supports_effort(platform);
let models = platform_specs::fallback_model_ids(platform);

// WRONG — hardcoded data
let binary = match platform { Platform::Cursor => "agent", ... };
```

**Iced view functions — always check widgets first:**
```rust
use crate::widgets::{styled_button, page_header, status_badge, refresh_button};

// CORRECT — reuse shared widgets
let btn = styled_button("Save", Message::Save);
let header = page_header("Settings", vec![refresh_button(Message::Refresh)]);

// WRONG — hand-rolled UI
let btn = button(text("Save")).style(|_| { ... });
```

**DRY tagging — tag all new reusable items:**
```rust
// DRY:FN:my_helper — What it does
pub fn my_helper() { ... }
```

### Legacy TypeScript Patterns (Reference Only)

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

### DRY Method — Reuse-First (Rust/Iced)

The codebase uses a DRY tagging system for agent discoverability. All reusable code is tagged with `// DRY:` comments.

**Tag convention:**
```rust
// DRY:WIDGET:<name>  — Reusable UI widget (see src/widgets/)
// DRY:DATA:<name>    — Single source of truth data module
// DRY:FN:<name>      — Reusable helper/query function
// DRY:HELPER:<name>  — Shared utility function
```

**To discover existing reusable items:**
```sh
grep -r "DRY:" puppet-master-rs/src/       # All tagged items
grep -r "DRY:WIDGET" puppet-master-rs/src/  # Just widgets
grep -r "DRY:DATA" puppet-master-rs/src/    # Data sources
grep -r "DRY:FN" puppet-master-rs/src/      # Functions
```

**Before writing new code, ALWAYS check:**
1. `docs/gui-widget-catalog.md` — Full widget + data source catalog
2. `puppet-master-rs/src/widgets/` — Shared UI widgets
3. `puppet-master-rs/src/platforms/platform_specs.rs` — Single source of truth for ALL platform CLI data (binary names, install paths, auth, models, effort, images, headless, experimental, subagents, SDKs)
4. Grep for `DRY:` tags in the area you're working

**Key DRY data sources (non-widget):**
- `platform_specs::get_spec(platform)` — Full platform spec (auth, models, effort, images, etc.)
- `platform_specs::supports_effort(platform)` — Effort/reasoning support (true: Claude/Codex/Copilot)
- `platform_specs::supports_images(platform)` — Image support (ALL 5 platforms)
- `platform_specs::cli_binary_names(platform)` — CLI binary names to search for
- `platform_specs::fallback_model_ids(platform)` — Fallback models when dynamic discovery fails
- `platform_specs::reasoning_is_model_based(platform)` — True only for Cursor (reasoning in model names)

**Key reusable widgets:**
- `selectable_text_field` — Read-only selectable text
- `context_menu_actions` — Copy/paste/select-all context menu
- `auth_status_chip` — Auth state badge
- `page_header` + `refresh_button` — Page title with actions
- `status_badge` / `status_dot` — Status indicators
- `styled_button` — Themed buttons (primary/secondary/danger/etc.)
- `styled_text_input` — Themed text inputs
- `modal_overlay` / `confirm_modal` — Modal dialogs
- `toast_overlay` — Toast notifications

**When writing new code, ALWAYS tag reusable items:**
```rust
// DRY:FN:my_new_helper — Short description
pub fn my_new_helper() { ... }
```

- Bespoke UI is allowed only if existing widgets cannot express the requirement.
- Any bespoke bypass must include an inline rationale:
```rust
// UI-DRY-EXCEPTION: <short reason>
```
- Run after widget changes:
  - `scripts/generate-widget-catalog.sh`
  - `scripts/check-widget-reuse.sh` (warn-only, always exit 0)

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

**BEFORE updating the Task Status Log, you MUST verify compliance with ALL rules by checking this checklist.**

> **Determine which stack you're working in first:**
> - **Rust/Iced** (primary): Code in `puppet-master-rs/` — use the Rust checklist
> - **Legacy TypeScript**: Code in `src/` — use the TypeScript checklist

### Rust/Iced Checklist (puppet-master-rs/)

1. **Compilation**
   - [ ] `cd puppet-master-rs && cargo check` passes with no errors
   - [ ] `cargo test` passes (all existing + new tests)
   - [ ] No new warnings introduced (check `cargo check 2>&1 | grep warning`)

2. **DRY Method** (see DRY Method section below)
   - [ ] Checked `docs/gui-widget-catalog.md` before creating new UI components
   - [ ] Checked `src/platforms/platform_specs.rs` before hardcoding platform data
   - [ ] Used `platform_specs::` functions instead of duplicating platform info
   - [ ] Tagged new reusable items with `// DRY:WIDGET:`, `// DRY:DATA:`, `// DRY:FN:`, or `// DRY:HELPER:`
   - [ ] No hardcoded platform models, CLI commands, auth, or capabilities

3. **Module Organization**
   - [ ] Files created in correct `src/` subdirectory per module responsibilities
   - [ ] New modules declared in parent `mod.rs` with `pub mod`
   - [ ] Imports use `use crate::` paths (not relative)

4. **Code Patterns**
   - [ ] No session reuse (fresh processes only, if applicable)
   - [ ] No direct API calls (CLI only — subscription auth, not API keys)
   - [ ] Platform data sourced from `platform_specs` (single source of truth)
   - [ ] Widget reuse from `src/widgets/` (check catalog first)

5. **Testing**
   - [ ] Tests written for new public functions
   - [ ] Tests in same file (`#[cfg(test)] mod tests`) or `tests/` directory
   - [ ] `cargo test` passes

6. **Scope & Safety**
   - [ ] No modifications outside task scope
   - [ ] Canonical documents not deleted/simplified
   - [ ] No API keys or secrets in code (subscription auth ONLY)
   - [ ] Task scope strictly followed

### Legacy TypeScript Checklist (src/)

> Only use this if working on the legacy TypeScript codebase (`src/`), NOT `puppet-master-rs/`.

1. **ESM Import Patterns**
   - [ ] All local imports use `.js` extension
   - [ ] Type-only exports use `export type` and `import type`

2. **Tooling**
   - [ ] Using Vitest (NOT Jest patterns)
   - [ ] `npm run typecheck` passes
   - [ ] `npm run build` passes

3. **Testing**
   - [ ] Tests written for new code
   - [ ] All required tests pass

### Universal Checklist (both stacks)

1. **DO/DON'T** — See DO and DON'T sections below
2. **Gitignore** — Specific `.log` patterns (not blanket `*.log`), evidence logs tracked
3. **Git commit format** followed (if committing)
4. **Referenced documentation sections** read FIRST
5. **Task scope** strictly followed

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

### Rust/Iced Failures

#### Hardcoded Platform Data
**Symptom**: Wrong models, wrong CLI flags, wrong auth commands
**Cause**: Platform data duplicated instead of using `platform_specs`
**Fix**: Always use `crate::platforms::platform_specs::` functions
```rust
// WRONG — hardcoded
let models = vec!["gpt-5", "gpt-5-turbo"];

// RIGHT — from single source of truth
let models = platform_specs::fallback_model_ids(platform);
```

#### Wrong Effort/Reasoning Check
**Symptom**: Effort picker shows for Gemini (not supported) or Cursor (model-based)
**Cause**: Checking wrong conditions
**Fix**: Use platform_specs
```rust
// WRONG
matches!(platform, Platform::Claude | Platform::Gemini)

// RIGHT
platform_specs::supports_effort(platform)
// Returns: true for Claude/Codex/Copilot, false for Gemini/Cursor
```

#### Borrow Checker — Reference to Temporary
**Symptom**: `cannot return reference to temporary value`
**Cause**: Returning reference to inline-constructed value
**Fix**: Use `static` for data that needs `&'static` lifetime

#### Missing Widget Reuse
**Symptom**: Duplicate UI code across views
**Cause**: Not checking `docs/gui-widget-catalog.md` first
**Fix**: Search `grep -r "DRY:WIDGET" puppet-master-rs/src/widgets/`

### Legacy TypeScript Failures

#### Import Extension Missing
**Symptom**: `ERR_MODULE_NOT_FOUND` at runtime
**Fix**: Add `.js` to all local imports

#### Jest Instead of Vitest
**Symptom**: `jest is not defined`
**Fix**: Use `vi.fn()` not `jest.fn()`

### Both Stacks

#### Session Reuse
**Symptom**: Agent behavior inconsistent, context pollution
**Fix**: Always spawn new process per iteration

---

## DO

### Both Stacks
- ✅ Spawn fresh process for each iteration (no session reuse)
- ✅ Run tests after each change
- ✅ Follow the task scope exactly
- ✅ Update Task Status Log after completing any task
- ✅ Use specific `.log` patterns in gitignore (not `*.log`)
- ✅ Use Session ID format `PM-YYYY-MM-DD-HH-MM-SS-NNN`
- ✅ Save evidence for verification results
- ✅ Use subscription auth ONLY — NO API keys for platform access

### Rust/Iced (puppet-master-rs/)
- ✅ Check `docs/gui-widget-catalog.md` and `src/widgets/` before creating new UI
- ✅ Use `platform_specs::` functions for ALL platform data (models, CLI, auth, capabilities)
- ✅ Tag reusable code with `// DRY:WIDGET:`, `// DRY:DATA:`, `// DRY:FN:`, `// DRY:HELPER:`
- ✅ Run `cargo check` and `cargo test` after changes
- ✅ Import platform specs as `use crate::platforms::platform_specs;`
- ✅ Declare new modules in parent `mod.rs`

### Legacy TypeScript (src/)
- ✅ Use `.js` extension in all local imports
- ✅ Use `import type` and `export type` for type aliases (like Platform)
- ✅ Use Vitest for testing
- ✅ Follow barrel export pattern (type-only for types)
- ✅ Use discriminated unions for events
- ✅ Use async/await for file operations

---

## DON'T

### Both Stacks
- ❌ Reuse sessions or processes
- ❌ Use "Thread" terminology (use "Session")
- ❌ Call APIs directly (CLI only — subscription auth, NOT API keys)
- ❌ Modify files outside task scope
- ❌ Delete or simplify canonical documents
- ❌ Ignore test failures
- ❌ Use blanket `*.log` in gitignore (evidence logs are tracked!)
- ❌ Ignore `.puppet-master/` directory in gitignore

### Rust/Iced (puppet-master-rs/)
- ❌ Hardcode platform data (models, CLI commands, auth, capabilities) — use `platform_specs`
- ❌ Re-implement existing widget patterns without checking `docs/gui-widget-catalog.md`
- ❌ Duplicate effort/reasoning/image checks — use `platform_specs::supports_effort()` etc.
- ❌ Use API keys for platform auth — subscription-only (OAuth/browser login)

### Legacy TypeScript (src/)
- ❌ Use Jest patterns (`jest.fn()`, `jest.mock()`)
- ❌ Omit `.js` extension in imports
- ❌ Use `import { Platform }` for type aliases (use `import type`)
- ❌ Use `exec()` for process spawning (use `spawn()`)
- ❌ Skip file locking for shared files

---

## Testing

### Rust/Iced (puppet-master-rs/) — Primary

**Test location:** In-file `#[cfg(test)] mod tests` blocks, or `puppet-master-rs/tests/` for integration tests.

**Test commands:**
```bash
cd puppet-master-rs
cargo test                        # Run all tests
cargo test platform_specs         # Run tests matching pattern
cargo test -- --nocapture         # Show println output
cargo check                       # Type check only (faster)
```

**Example test pattern:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_supports_effort() {
        assert!(platform_specs::supports_effort(Platform::Claude));
        assert!(!platform_specs::supports_effort(Platform::Gemini));
    }
}
```

### Legacy TypeScript (src/) — Reference Only

**Test commands:**
```bash
npm test                    # Run all tests
npm test -- -t "pattern"    # Run specific tests
npm run test:coverage       # With coverage
```

---

## Directory Structure

### Rust/Iced Codebase (Primary — Active Development)
```
puppet-master-rs/                   # Rust/Iced desktop app
├── src/
│   ├── app.rs                      # Main app state + message handlers (~4700 lines)
│   ├── main.rs                     # Entry point
│   ├── platforms/                   # Platform CLI integration
│   │   ├── mod.rs                  # Module declarations + PlatformRunner trait
│   │   ├── platform_specs.rs       # ⭐ SINGLE SOURCE OF TRUTH for all platform data
│   │   ├── cursor.rs               # Cursor runner (build_args, execute)
│   │   ├── claude.rs               # Claude runner
│   │   ├── codex.rs                # Codex runner
│   │   ├── gemini.rs               # Gemini runner
│   │   ├── copilot.rs              # Copilot runner
│   │   ├── auth_actions.rs         # Login/logout actions
│   │   ├── auth_status.rs          # Auth status checks
│   │   ├── platform_detector.rs    # CLI binary detection
│   │   ├── capability.rs           # Platform capability probing
│   │   ├── model_catalog.rs        # Dynamic model cache
│   │   └── registry.rs             # Runner registry (runtime)
│   ├── views/                       # Iced GUI views
│   │   ├── config.rs               # Config page (tier cards, model picker)
│   │   ├── setup.rs                # Setup wizard (install, login)
│   │   ├── doctor.rs               # Doctor checks
│   │   ├── wizard.rs               # Task wizard
│   │   ├── interview.rs            # Interview management
│   │   └── ...                     # Other views
│   ├── widgets/                     # Reusable Iced widgets (see docs/gui-widget-catalog.md)
│   ├── types/                       # Shared types (Platform enum, config)
│   ├── config/                      # Configuration (gui_config.rs)
│   ├── core/                        # Orchestrator, execution engine
│   └── state/                       # Agent state management
├── tests/                           # Integration tests
├── Cargo.toml                       # Rust dependencies
└── README.md
```

### Project Root
```
puppet-master/
├── puppet-master-rs/            # ⭐ Rust/Iced app (see above)
├── .puppet-master/              # Runtime data (capabilities, evidence, usage, logs)
├── docs/
│   └── gui-widget-catalog.md    # Widget reuse catalog (check before creating new UI)
├── AGENTS.md                    # ⭐ This file — agent instructions (read FIRST)
├── PLATFORM_SPECS_PLAN.md       # Platform specs refactor plan
├── src/                         # Legacy TypeScript code (reference only)
├── src-tauri/                   # Legacy Tauri wrapper (reference only)
└── config.yaml                  # Configuration
```

---

## Configuration

### Tier Config (Rust/Iced)
Each tier selects a platform, model, and optional effort level. Models are fetched dynamically from platform CLIs and cached.

**Supported platforms:** `cursor`, `codex`, `claude`, `gemini`, `copilot`

**Key behaviors:**
- Changing platform cascades: model list updates, effort picker shows/hides
- Cursor: model names encode reasoning (e.g., `sonnet-4.5-thinking`), no separate effort picker, "Auto" mode available
- Gemini: no effort/reasoning support
- Claude: effort via `CLAUDE_CODE_EFFORT_LEVEL` env var (low/medium/high)
- Codex/Copilot: effort levels Low/Medium/High/Extra High
- ALL 5 platforms support images

### Legacy Config Format (Reference)
```yaml
tiers:
  phase:
    platform: cursor | codex | claude | gemini | copilot
    model: string       # Dynamic — fetched from platform CLI, cached
    maxIterations: number
  task: ...
  subtask: ...
  iteration: ...
```

---

## Platform CLI Commands

### Cursor
```bash
# CU-P0-T01, CU-P1-T10: Updated per Cursor January 2026 contract
# Primary binary: agent (preferred), also available as cursor-agent
agent -p "prompt" --model <model> [--mode=plan|ask] [--output-format json|stream-json]
```

**CU-P0-T01, CU-P1-T10: Key changes (January 2026):**
- Binary: Prefer `agent`, fallback to `cursor-agent` (both installed by `curl https://cursor.com/install -fsSL | bash`)
- Non-interactive: `-p` or `--print` flag (prefer prompt-as-arg, stdin fallback for large prompts)
- Modes: `--mode=plan` (planning), `--mode=ask` (read-only/discovery)
- Output formats: `--output-format json|stream-json` (requires `-p` flag)
- Model discovery: `agent models` or `--list-models` (best-effort, cached)
- MCP: `agent mcp list`, `agent mcp list-tools <server>` (read-only probing)
- Auth: `CURSOR_API_KEY` env var for headless/CI (interactive uses local app auth)
- Config: `~/.cursor/config.json` or `~/.config/cursor/config.json` (read-only detection)

**Puppet Master policy:**
- Fresh process per iteration (no `agent resume`, no cloud handoff)
- Deterministic automation requires process isolation

### Codex
```bash
codex exec "prompt" [flags]
```

**Key capabilities:**
- `codex exec "prompt"` - Non-interactive execution with JSONL output
- `codex` (no subcommand) - Launch interactive TUI session
- `codex mcp-server` - Run Codex as MCP server (CLI-based, acceptable)

**Non-interactive flags (used by Puppet Master):**
- `--cd <dir>` or `-C <dir>` - Set working directory
- `--model <model>` or `-m <model>` - Model selection (e.g., `gpt-5.2-codex`)
- `--full-auto` - Convenience flag: sets `--ask-for-approval on-request` and `--sandbox workspace-write`
- `--ask-for-approval <policy>` - Control approval: `untrusted | on-failure | on-request | never`
- `--sandbox <mode>` - Sandbox policy: `read-only | workspace-write | danger-full-access`
- `--json` or `--experimental-json` - JSONL event stream output (newline-delimited JSON)
- `--color <mode>` - ANSI color control: `always | never | auto` (Puppet Master uses `never` for CI/CD)
- `--max-turns <n>` - Cap agentic turns (when supported)
- `--skip-git-repo-check` - Allow running outside Git repository
- `--output-last-message <path>` or `-o <path>` - Write final message to file (CI/CD)
- `--output-schema <path>` - Structured JSON output with custom schema (advanced)

**Additional flags (available but not currently used):**
- `--add-dir <path>` - Grant additional directories write access (repeatable, multi-directory workspaces)
- `--image <path>` or `-i <path>` - Attach image files to prompts (comma-separated or repeatable)
- `--profile <name>` or `-p <name>` - Load configuration profile from `~/.codex/config.toml`
- `-c key=value` or `--config key=value` - Inline configuration overrides (repeatable)
- `--search` - Enable web search capability
- `--oss` - Use local open source model provider (requires Ollama)

**Configuration file:**
- Codex reads `~/.codex/config.toml` for persistent settings (default model, profiles, sandbox settings, etc.)
- Explicit CLI flags override config file settings
- Config file precedence: CLI flags > config file > defaults

**Team Config (layered config):**
- Codex loads config from `.codex/` in cwd, parents, repo root, plus `~/.codex` and `/etc/codex`
- Higher-precedence locations override lower. Explicit CLI/SDK options override all

**CI / headless authentication:**
- `codex exec` reuses saved CLI auth by default. For CI/headless, provide credentials explicitly:
  - **`CODEX_API_KEY`** env var (supported for `codex exec` only): set as secret in CI jobs
  - **`codex login --device-auth`**: device-code flow when browser login is not possible (e.g. SSH, headless)
- CLI auto-switches to device-code login when headless is detected (Codex 0.81+)

**Web search:**
- `--search` enables web search. When enabled, cached `web_search` is the default client behavior (Codex 0.92+)

**Slash commands (interactive mode only, not used by Puppet Master):**
- `/model` - Switch model mid-session
- `/approvals` - Update approval rules
- `/status` - Show session configuration and token usage
- `/review` - Run code review
- `/plan` - Generate implementation plan
- `/diff` - Show Git diff
- `/compact` - Summarize conversation to free tokens
- `/fork` - Fork conversation into new thread
- `/resume` - Resume saved conversation
- `/new` - Start new conversation
- `/exit` or `/quit` - Exit CLI

**Codex SDK (`@openai/codex-sdk`):**
- TypeScript SDK for programmatic control
- **VERIFIED CLI-based**: SDK wraps the bundled `codex` binary and spawns CLI processes internally
- SDK exchanges JSONL events over stdin/stdout with the CLI process
- **Respects "CLI only" constraint**: ✅ SDK is CLI-based, not API-based
- **Uses subscription account**: SDK spawns CLI processes which use OpenAI subscription account (ChatGPT/Codex plan), NOT pay-per-use API calls
- **Current implementation**: CodexRunner uses SDK instead of direct CLI spawn
- **Fresh process requirement**: Each iteration creates a NEW thread via `codexClient.startThread()`, ensuring fresh process per iteration
- **Benefits**: Better TypeScript integration, structured event handling, built-in timeout support via AbortSignal
- **Note**: The constraint is about using subscription-based access (via CLI) rather than direct API calls that charge per-use. SDK qualifies because it uses CLI internally.

**Codex MCP Server (`codex mcp-server`):**
- Runs Codex CLI as long-running MCP server process
- **MCP Server is CLI-based**: Running `codex mcp-server` is a CLI invocation ✅ Acceptable
- Exposes two tools: `codex()` (start session) and `codex-reply()` (continue session)
- **However**: OpenAI Agents SDK that orchestrates MCP servers uses OpenAI API ❌ Violates constraint
- **Key distinction**:
  - Using `codex mcp-server` directly (CLI-based) ✅ Acceptable
  - Using OpenAI Agents SDK to orchestrate (uses OpenAI API) ❌ Violates constraint
- **For Puppet Master**: Could potentially use MCP server directly without Agents SDK
- **Current decision**: Continue with `codex exec` for simplicity and consistency with fresh-process-per-iteration model

**Puppet Master implementation:**
- Uses `@openai/codex-sdk` (SDK spawns CLI processes internally - CLI-based ✅)
- Each iteration creates a NEW thread via `codexClient.startThread()` (fresh process requirement)
- Thread options: `approvalPolicy: 'never'`, `sandboxMode: 'workspace-write'`, `workingDirectory`, `model`
- Optional: `skipGitRepoCheck` (from `ExecutionRequest`), `additionalDirectories` (from `includeDirectories`), `modelReasoningEffort` (from `reasoningEffort`, mapped to SDK: low/medium/high/xhigh)
- Timeout handling via `AbortSignal` in `TurnOptions`
- SDK provides structured `Turn` results with `finalResponse`, `items`, `usage` (token counts)
- Legacy `buildArgs()` method still available for fallback but not used with SDK
- Config file (`~/.codex/config.toml`) is respected but explicit thread options override it

### Claude Code
```bash
claude -p "prompt" [--model <model>] [--output-format text|json|stream-json] [--no-session-persistence] [--permission-mode <mode>] [--allowedTools "Read,Edit,Bash"] [--max-turns <n>] [--append-system-prompt "..."]
```

**Key capabilities:**
- `claude -p "prompt"` or `claude --print "prompt"` - Non-interactive print mode (headless)
- `--output-format text|json|stream-json` - Plain text, single JSON object, or JSONL events
- `--no-session-persistence` - Disable session save (print mode); we use this for fresh process per iteration
- `--permission-mode default|acceptEdits|plan|dontAsk|bypassPermissions` - Permission behavior
  - **Plan Mode**: `--permission-mode plan` enables read-only analysis mode (verified via official CLI reference)
  - Supports both interactive and print modes (`-p` flag)
  - Documentation: https://code.claude.com/docs/en/cli-reference
- `--allowedTools "Read,Edit,Bash"` - Auto-approve listed tools (comma-separated)
- `--max-turns <n>` - Limit agentic turns
- `--model <model>` - Model selection (e.g. `sonnet`, `opus`, `claude-sonnet-4-5`)
- `--append-system-prompt "..."` - Append instructions; `--append-system-prompt-file <path>` for file
- CLAUDE.md support; MCP via `--mcp-config` or config

**Puppet Master policy:**
- Fresh process per iteration (no `-c`/`--continue`, no `-r`/`--resume`)
- Plan mode: Uses `--permission-mode plan` flag (not prompt preamble)

**Docs and commands:**
- [CLI reference](https://code.claude.com/docs/en/cli-reference), [Headless](https://code.claude.com/docs/en/headless), [Setup](https://code.claude.com/docs/en/setup), [Troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- `claude doctor` - Check installation health; `claude update` - Update CLI; `claude mcp` - Configure MCP

**Agent SDK:** [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) (Python/TS) uses Claude Code as runtime; we use CLI subprocess only.

### Gemini
```bash
gemini -p "prompt" --output-format json --approval-mode yolo [--model <model>] [--sandbox] [--include-directories <dir1,dir2>]
```

**Key capabilities:**
- `gemini -p "prompt"` or `gemini --prompt "prompt"` - Headless mode with prompt
- `--output-format json` - Machine-readable JSON output (default for automation)
- `--output-format stream-json` - Streaming JSONL events (real-time monitoring)
- `--approval-mode yolo` or `--yolo` - Auto-approve all tool calls (recommended for automation)
- `--approval-mode auto_edit` - Auto-approve edit tools only
- `--approval-mode plan` - Read-only mode (requires `experimental.plan: true` in settings)
- `--model <model>` or `-m <model>` - Model selection (e.g., `gemini-2.5-pro`, `gemini-3-pro-preview`)
- `--include-directories <dir1,dir2>` - Multi-directory workspace support (max 5 directories, monorepo compatibility)
- `--sandbox` or `-s` - Sandbox execution environment (security isolation for tool execution)
- `--debug` or `-d` - Debug mode (verbose output)
- `--resume [session-id]` - Resume previous session (not used by Puppet Master - we spawn fresh)
- Model discovery: `gemini models` - List available models dynamically (best-effort, cached)

**Model Selection:**
- `auto` (recommended) - Automatic model selection based on task complexity
- Pro models (`gemini-2.5-pro`, `gemini-3-pro-preview`) - Best for complex reasoning
- Flash models (`gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview`) - Fast, efficient
- Preview models require `general.previewFeatures: true` in `~/.gemini/settings.json`

**Authentication:**
- OAuth via `gemini` first run (interactive mode)
- `GEMINI_API_KEY` environment variable (headless/automation)
- `GOOGLE_API_KEY` environment variable (alternative to GEMINI_API_KEY)
- Vertex AI via `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON path)
- `GOOGLE_CLOUD_PROJECT` environment variable (for Vertex AI)
- `GOOGLE_CLOUD_LOCATION` environment variable (for Vertex AI, optional)

**Configuration (Hierarchical Settings):**
- System defaults: Built into Gemini CLI
- User settings: `~/.gemini/settings.json` (highest precedence for user-level config)
- Project settings: `.gemini/settings.json` or project root (project-specific overrides)
- Environment variable substitution: `${VAR_NAME}` syntax in settings.json
- Preview features: `general.previewFeatures: true` enables preview models
- Settings schema: https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json

**Context Files (GEMINI.md):**
- Hierarchical loading: Scans up to 200 directories from project root
- Global: `~/.gemini/GEMINI.md` (user-level instructions)
- Project: `.gemini/GEMINI.md` or `GEMINI.md` in project root
- Sub-directory: Local `GEMINI.md` files in subdirectories
- Modular imports: `@import` directive for including other files
- `.geminiignore` - File exclusion patterns (similar to `.gitignore`)

**Output formats:**
- `text` (default) - Human-readable output
- `json` - Single JSON object with `{response, stats, error?}`
  - `response`: Main AI-generated content
  - `stats`: Usage statistics (models, tools, files, tokens)
  - `error`: Error object if present
- `stream-json` - JSONL events (one JSON object per line) with types:
  - `init` - Initialization event
  - `message` - Message content
  - `tool_use` - Tool invocation
  - `tool_result` - Tool execution result
  - `error` - Error event
  - `result` - Final result event

**Session management:**
- Automatic session saving to `~/.gemini/tmp/<project_hash>/chats/`
- `--resume` to continue previous session
- `--list-sessions` to view available sessions
- `--delete-session <id>` to remove sessions
- Note: Puppet Master spawns fresh processes, so session resume is not used

**Extensions and Extensibility:**
- Extensions: Custom prompts, MCP server configs, commands (via `gemini-extension.json`)
- Hooks: Event-driven scripting (`SessionStart`, `BeforeTool`, `AfterModel`, etc.)
- MCP Servers: Model Context Protocol integration for external tools and resources
- Agent Skills: Self-contained directories with instructions and scripts (experimental)
- Custom commands: Slash commands and at-commands for specialized workflows

**Installation:**
- `npm install -g @google/gemini-cli` - Global npm installation
- `npx @google/gemini-cli` - One-off usage without installation
- `brew install gemini-cli` - Homebrew (macOS)
- Docker: Official images available (see Gemini CLI documentation)

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

## Usage Tracking & Plan Detection

### Overview

Puppet Master integrates platform-reported usage data from multiple sources to provide accurate quota visibility and plan detection:

1. **Platform APIs** (most reliable): Claude Admin API, GitHub Copilot Metrics API, Gemini Cloud Quotas API
2. **Error Message Parsing**: Extracts quota/reset information from platform error messages
3. **CLI Command Parsing**: Parses `/stats`, `/status`, `/cost` command outputs
4. **Manual Configuration**: For platforms without APIs (Cursor, Codex)

### Usage Tracking APIs

#### Claude Code
- **API**: `GET /v1/organizations/usage_report/claude_code` (Claude Admin API)
- **Requirements**: `ANTHROPIC_API_KEY` with admin permissions
- **Provides**: Request counts, token usage, quota limits, reset times, customer_type, subscription_type
- **CLI Commands**: `/cost` (API token usage), `/stats` (usage patterns for subscribers)

#### GitHub Copilot
- **API**: `GET /orgs/{org}/copilot/metrics` (GitHub REST API)
- **Requirements**: `GITHUB_TOKEN` or `GH_TOKEN` with `copilot:read` scope, organization access, 5+ members with active licenses
- **Provides**: Premium requests used/limit, monthly reset (1st at 00:00:00 UTC)
- **Limitation**: Organization-level only

#### Gemini
- **API**: `https://cloudquotas.googleapis.com` (Google Cloud Quotas API)
- **Requirements**: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS` or ADC
- **Provides**: Quota limits, usage counts, reset times
- **CLI Command**: `/stats` (per-model usage, tokens, tool stats, file modifications)

#### Plan Mode Support Across Platforms

**Summary of plan mode capabilities (verified January 2026):**

| Platform | Plan Mode Support | Implementation |
|----------|------------------|----------------|
| **Cursor** | ✅ Native flag | `--mode=plan` (with fallback to prompt preamble if unsupported) |
| **Claude Code** | ✅ Native flag | `--permission-mode plan` (works in both interactive and print modes) |
| **Gemini** | ✅ Native flag | `--approval-mode plan` (requires `experimental.plan: true` in settings) |
| **Codex** | ❌ No flag | Uses prompt preamble (no CLI flag available) |
| **Copilot** | ❌ No flag | Uses prompt preamble (no CLI flag available) |

**Research sources:**
- Claude Code: https://code.claude.com/docs/en/cli-reference (verified `--permission-mode plan`)
- Gemini: Code implementation verified (requires experimental.plan setting)
- Codex: No plan mode flag found in official documentation
- Copilot: No plan mode flag found in official documentation

**Implementation notes:**
- Platforms with native flags use CLI flags when `planMode: true` is requested
- Platforms without native flags use prompt preamble for consistent behavior
- All platforms provide read-only/planning behavior when plan mode is enabled

#### Codex
- **API**: None (no programmatic API)
- **CLI Command**: `/status` (token usage: Input/Output/Total)
- **Error Parsing**: "You've reached your 5-hour message limit. Try again in 3h 42m."
- **SDK**: `Turn.usage` object provides token counts

#### Cursor
- **API**: None (no programmatic API)
- **Status Command**: `agent status` (auth only, not usage)
- **Dashboard**: `cursor.com/dashboard?tab=usage` (web only)
- **Manual Config**: `autoModeUnlimited` flag for grandfathered plans

### Error Message Parsing

Puppet Master parses platform error messages to extract quota/reset information:

- **Codex**: `"You've reached your 5-hour message limit. Try again in 3h 42m."` → Extracts limit hours and reset time
- **Gemini**: `"Your quota will reset after 8h44m7s."` → Extracts reset time (hours/minutes/seconds)
- **Claude**: Rate limit errors (429, 413, 503, 529) with `Retry-After` header or reset time in body

### Plan Detection

Plan detection identifies subscription tiers to understand quota limits:

- **Claude**: Uses Usage Report API `customer_type` and `subscription_type` fields
- **Copilot**: Infers tier from premium requests limit (free/pro/team/enterprise)
- **Gemini**: Infers tier from quota limits via Cloud Quotas API
- **Codex**: Manual config or quota inference from error messages
- **Cursor**: Manual config or `autoModeUnlimited` flag detection

### Integration

Usage tracking is integrated into:
- **QuotaManager**: Merges platform-reported usage with internal UsageTracker data
- **Usage CLI Command**: `puppet-master usage [platform]` displays platform-reported data
- **Doctor Checks**: `UsageQuotaCheck` uses platform-reported usage for warnings

### Configuration

Usage tracking uses environment variables:
- `ANTHROPIC_API_KEY` - Claude Admin API access
- `GITHUB_TOKEN` or `GH_TOKEN` - GitHub Copilot Metrics API access
- `GOOGLE_CLOUD_PROJECT` - Gemini Cloud Quotas API project
- `GOOGLE_APPLICATION_CREDENTIALS` - Gemini service account credentials

Manual plan configuration (for Cursor/Codex):
```yaml
# In config.yaml (future enhancement)
plan_detection:
  cursor:
    tier: "pro"  # free, pro, team, enterprise
    customerType: "individual"
  codex:
    tier: "plus"  # free, plus, team, enterprise
```

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
| 2026-02-14 | Major update: Added Rust/Iced architecture, 5 platforms (was 3), DRY Method with tagging convention, platform_specs as single source of truth, subscription-only auth policy, updated checklists for Rust |

---

*This file is automatically updated as patterns emerge. Human review recommended for major changes.*
