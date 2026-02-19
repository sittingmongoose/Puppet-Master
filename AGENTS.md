# AGENTS.md - RWM Puppet Master

Always use the Context7 MCP. You need to take your time and be careful as this is something you can mess up easily and cause a lot of issues if you aren't careful.

> Long-term memory for AI agents working on this project.
> Updated as patterns emerge and gotchas are discovered.

---

## Table of Contents

1. [Keeping AGENTS.md minimal](#keeping-agentsmd-minimal)
2. [Project Overview](#project-overview)
3. [Context7 MCP](#context7-mcp)
4. [Architecture Notes](#architecture-notes)
5. [Codebase Patterns](#codebase-patterns)
    - [GUI Selection & Context Menus](#gui-selection--context-menus)
6. [DRY Method](#dry-method--reuse-first)
7. [Tooling Rules](#tooling-rules)
8. [Pre-Completion Checklist](#pre-completion-verification-checklist)
9. [Common Failure Modes](#common-failure-modes)
10. [DO / DON'T](#do)
11. [Testing](#testing)
12. [Directory Structure](#directory-structure)
13. [Configuration](#configuration)
14. [Platform CLI Commands](#platform-cli-commands)
15. [Usage Tracking](#usage-tracking--plan-detection)
16. [Completion Signals](#completion-signals)

---

## Keeping AGENTS.md minimal

This file is loaded into agent context; long files consume context and get skimmed, so critical rules can be missed. When **adding or editing** this file: put **critical rules at the top**; move **long reference** (e.g. full platform CLI details, long tables) to `docs/` and link from here; **trim redundancy**. For **generated** (target-project) AGENTS.md, the Interview plan §5.1 specifies a size budget, critical-first block, and linked docs—see Plans/interview-subagent-integration.md.

---

## Project Overview

RWM Puppet Master is a **Rust/Iced desktop orchestrator** implementing the Ralph Wiggum Method — a four-tier hierarchical approach to AI-assisted development. The system coordinates 5 AI CLI platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot) without using APIs, relying exclusively on CLI invocations.

The codebase is **pure Rust/Iced** in `puppet-master-rs/`.

### Key Concepts
- **Four Tiers**: Phase → Task → Subtask → Iteration
- **CLI-Only**: No API calls, only CLI invocations
- **Fresh Agents**: Every iteration spawns a new process (no session resume, no cloud handoff)
- **Verification Gates**: Automated checks between tiers
- **Memory Layers**: progress.txt (short-term), AGENTS.md (long-term), prd.json (work queue)

---

## Context7 MCP

**Always use Context7** when working with external libraries or frameworks to get up-to-date documentation.

**How to use:**
1. Call `resolve-library-id` first with the library name to get the Context7-compatible ID
2. Then call `query-docs` with the resolved ID and your specific question
3. Maximum 3 calls per question — use the best result you have after that

**When to use:**
- Looking up API docs for any dependency (iced, tokio, serde, rusqlite, etc.)
- Checking current best practices for a library
- Verifying function signatures or usage patterns

---

## Architecture Notes

All paths below are relative to `puppet-master-rs/src/`.

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `src/app.rs` | Main app state, Message enum, update/view logic |
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
| `src/automation/` | GUI automation (headless runner, action catalog, MCP bridge) |

### Headless Rendering

Headless screenshots use **Iced's `tiny-skia` software renderer** for pixel-perfect output without a GPU or display server. This replaces the old `imageproc`/`ab_glyph` wireframe approximation.

**How it works:**
1. `headless_runner.rs` creates a headless `iced::Renderer` via `<iced::Renderer as Headless>::new(Font::DEFAULT, Pixels(16.0), Some("tiny-skia"))`
2. Calls `app.view()` to build the real widget tree, then lays it out with `UserInterface::build(element, size, cache, renderer)`
3. Draws via `ui.draw(renderer, &theme, &style, cursor)` and extracts RGBA pixels via `renderer.screenshot()`
4. Saves as PNG — identical to what the real GUI renders

**Key dependencies:**
- `iced` with `"advanced"` feature (exposes `Headless` trait)
- `iced_runtime` (for `UserInterface` and `Cache`)
- `image` crate (RGBA → PNG)

**Tokio runtime note:** The renderer init is async. `run()` detects whether a tokio runtime already exists (`Handle::try_current()`) to avoid "cannot start a runtime from within a runtime" panics in `#[tokio::test]` contexts. When inside an existing runtime, it spawns a scoped thread for `block_on`.

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
- Never uses cloud handoff or any stateful session features
- Each iteration must be independent and reproducible

---

## Codebase Patterns

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

### GUI Selection & Context Menus

To provide a "normal application" experience, all significant text in the GUI should be selectable and support a right-click floating context menu.

**Selectable Labels:**
Use `selectable_label` (UI font) or `selectable_label_mono` (Monospace font) instead of the standard Iced `text()` widget for any value that a user might want to copy. These widgets are styled to look identical to static text but support left-click-and-drag selection and standard Ctrl+C.

```rust
use crate::widgets::{selectable_label, selectable_label_mono};

// CORRECT — Selectable and supports right-click menu
content = content.push(selectable_label(theme, &item.phase_name));

// WRONG — Static text that cannot be selected/copied
content = content.push(text(&item.phase_name));
```

**Floating Context Menu:**
The context menu is a global overlay managed in `App::view` via a `stack!` and `absolute` positioning.
- **Trigger**: Widgets use `.on_right_press(Message::OpenContextMenu(...))` via a `mouse_area`.
- **Target**: `ContextMenuTarget` determines what is copied to the clipboard.
- **Dismissal**: Handled by a full-screen transparent `mouse_area` beneath the menu.

**DRY tagging — tag all new reusable items:**
```rust
// DRY:FN:my_helper — What it does
pub fn my_helper() { ... }
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
- `selectable_label` / `selectable_label_mono` — Read-only text that looks like static labels but supports selection and floating context menus
- `selectable_text_field` — Read-only selectable text field with standard styling
- `context_menu_actions` — Floating context menu actions (Copy)
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

### Git Commit Format
```
ralph: [tier/scope] [item-id] [summary]

Examples:
ralph: PH0-T01 initialize Rust project
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

1. **Compilation**
   - [ ] `cd puppet-master-rs && cargo check` passes with no errors
   - [ ] `cargo test` passes (all existing + new tests)
   - [ ] No new warnings introduced (check `cargo check 2>&1 | grep warning`)

2. **DRY Method**
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
   - [ ] Gitignore uses specific `.log` patterns (not blanket `*.log`)
   - [ ] Git commit format followed

7. **Documentation / AGENTS.md**
   - [ ] When adding to AGENTS.md: keep it minimal—critical rules at top, long reference in docs/, trim redundancy (see "Keeping AGENTS.md minimal" above).

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

#### Session Reuse
**Symptom**: Agent behavior inconsistent, context pollution
**Fix**: Always spawn new process per iteration

---

## DO

- ✅ Spawn fresh process for each iteration (no session reuse)
- ✅ Run tests after each change (`cargo check` and `cargo test`)
- ✅ Follow the task scope exactly
- ✅ Update Task Status Log after completing any task
- ✅ Use specific `.log` patterns in gitignore (not `*.log`)
- ✅ Use Session ID format `PM-YYYY-MM-DD-HH-MM-SS-NNN`
- ✅ Save evidence for verification results
- ✅ Use subscription auth ONLY — NO API keys for platform access
- ✅ Check `docs/gui-widget-catalog.md` and `src/widgets/` before creating new UI
- ✅ Use `platform_specs::` functions for ALL platform data (models, CLI, auth, capabilities)
- ✅ Tag reusable code with `// DRY:WIDGET:`, `// DRY:DATA:`, `// DRY:FN:`, `// DRY:HELPER:`
- ✅ Import platform specs as `use crate::platforms::platform_specs;`
- ✅ Declare new modules in parent `mod.rs`

---

## DON'T

- ❌ Reuse sessions or processes
- ❌ Use "Thread" terminology (use "Session")
- ❌ Call APIs directly (CLI only — subscription auth, NOT API keys)
- ❌ Modify files outside task scope
- ❌ Delete or simplify canonical documents
- ❌ Ignore test failures
- ❌ Use blanket `*.log` in gitignore (evidence logs are tracked!)
- ❌ Ignore `.puppet-master/` directory in gitignore
- ❌ Hardcode platform data (models, CLI commands, auth, capabilities) — use `platform_specs`
- ❌ Re-implement existing widget patterns without checking `docs/gui-widget-catalog.md`
- ❌ Duplicate effort/reasoning/image checks — use `platform_specs::supports_effort()` etc.
- ❌ Use API keys for platform auth — subscription-only (OAuth/browser login)

---

## Testing

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
├── Reference/                   # Design docs, research, GUI concept images
├── scripts/                     # Build, test, and maintenance scripts
├── AGENTS.md                    # ⭐ This file — agent instructions (read FIRST)
├── REQUIREMENTS.md              # Project requirements specification
├── README.md                    # Project overview and quick start
└── STATE_FILES.md               # State file format specification
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
- `codex exec` reuses saved CLI auth by default
- `CODEX_API_KEY` env var for CI/headless
- `codex login --device-auth` for device-code flow (SSH, headless)

**Puppet Master policy:**
- Uses `codex exec` with fresh process per iteration
- No session resume, no interactive slash commands

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
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` env var (headless/automation)
- Vertex AI via `GOOGLE_APPLICATION_CREDENTIALS` (service account)

**Puppet Master policy:**
- Fresh process per iteration (no `--resume`)
- Uses `--output-format json --approval-mode yolo` for automation

### GitHub Copilot
```bash
copilot -p "prompt" --allow-all-tools [--allow-all-paths] [--allow-all-urls] [--silent] [--stream off]
```

Launch and orchestrator execution for Copilot use `npx -y @github/copilot` so the agentic CLI is used everywhere (the resolved `copilot` binary may be the old suggest/explain tool).

**Key capabilities:**
- `copilot -p "prompt"` — Programmatic mode with prompt
- `--allow-all-tools` — Auto-approve all tools without manual approval
- `--allow-tool <spec>` / `--deny-tool <spec>` — Fine-grained tool control
- Tool specs: `'shell(COMMAND)'`, `'write'`, `'MCP_SERVER_NAME'`
- `--allow-all-paths` — Disable path verification
- `--allow-all-urls` / `--allow-url <domain>` — URL access control
- Default model: Claude Sonnet 4.5
- Output format: Text-based (no JSON output)

**Authentication:**
- GitHub authentication via `/login` command
- `GH_TOKEN` or `GITHUB_TOKEN` env var with "Copilot Requests" permission
- Requires GitHub Copilot Pro, Pro+, Business, or Enterprise plan

**Puppet Master policy:**
- Fresh process per iteration (no `--resume`, no `--continue`)
- Uses `--allow-all-tools --allow-all-paths` for automation

---

## Usage Tracking & Plan Detection

Puppet Master integrates platform-reported usage data for quota visibility:

| Platform | Usage Source | Plan Detection |
|----------|-------------|----------------|
| Claude | Admin API (`/v1/organizations/usage_report/claude_code`) | `customer_type` + `subscription_type` fields |
| Copilot | GitHub REST API (`/orgs/{org}/copilot/metrics`) | Infers from premium requests limit |
| Gemini | Cloud Quotas API (`cloudquotas.googleapis.com`) | Infers from quota limits |
| Codex | Error message parsing only | Manual config or quota inference |
| Cursor | No API available | Manual config or `autoModeUnlimited` detection |

### Plan Mode Support

| Platform | Plan Mode | Implementation |
|----------|-----------|----------------|
| Cursor | ✅ Native | `--mode=plan` |
| Claude Code | ✅ Native | `--permission-mode plan` |
| Gemini | ✅ Native | `--approval-mode plan` (requires `experimental.plan: true`) |
| Codex | ❌ | `--sandbox read-only` for plan-like behavior; no native plan flag |
| Copilot | ❌ | Restrictive flags when plan_mode (omit `--allow-all-paths`); native plan is interactive (Shift+Tab) only |

### Error Message Parsing
- **Codex**: `"You've reached your 5-hour message limit. Try again in 3h 42m."` → Extracts reset time
- **Gemini**: `"Your quota will reset after 8h44m7s."` → Extracts reset time
- **Claude**: Rate limit errors (429, 413, 503, 529) with `Retry-After` header

### Environment Variables
- `ANTHROPIC_API_KEY` — Claude Admin API access
- `GITHUB_TOKEN` / `GH_TOKEN` — GitHub Copilot Metrics API
- `GOOGLE_CLOUD_PROJECT` — Gemini Cloud Quotas API
- `GOOGLE_APPLICATION_CREDENTIALS` — Gemini service account credentials

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
| 2026-02-14 | Major update: Added Rust/Iced architecture, 5 platforms, DRY Method, platform_specs, subscription-only auth |
| 2026-07-23 | Cleanup: Removed all legacy TypeScript sections, condensed platform CLI docs, added Context7 MCP section, added TOC |

---

*This file is automatically updated as patterns emerge. Human review recommended for major changes.*
