# CursorUpdate6.md — Cursor CLI January Update (Implementation Plan + Gap Analysis)
# Project: RWM Puppet Master
# Generated: 2026-01-26
# Scope: Cursor CLI ("agent") feature/contract updates → Puppet Master integration alignment

---

## Executive Summary

Cursor has significantly expanded and formalized its CLI in January (notably **Jan 08** and **Jan 16** changelog entries). The most important updates for Puppet Master are:

1. **CLI Agent Modes**: **Plan mode** and **Ask mode** are now first‑class in Cursor CLI (`/plan` / `--mode=plan`, `/ask` / `--mode=ask`).
2. **Model listing + selection UX**: `agent models`, `--list-models`, and `/models` for discovery + switching.
3. **MCP workflow improvements**: interactive `/mcp` management and improved auth flows.
4. **Automation contract is clearer**: API key auth (`CURSOR_API_KEY` / `--api-key`) + output formats (`--output-format text|json|stream-json`) for scripting.

This document:
- states the **updated Cursor CLI contract** precisely (commands, flags, behaviors),
- compares it to our current integration,
- and provides a BUILD_QUEUE-style plan to implement/align missing pieces safely.

---

## Canonical References (do not “wing it”)

### Changelog (Cursor → CLI updates)
- https://cursor.com/changelog
- https://cursor.com/changelog/cli-jan-08-2026
- https://cursor.com/changelog/cli-jan-16-2026

### Cursor Docs (CLI)
- https://cursor.com/docs
- https://cursor.com/docs/cli/overview
- https://cursor.com/docs/cli/installation
- https://cursor.com/docs/cli/using
- https://cursor.com/docs/cli/shell-mode
- https://cursor.com/docs/cli/mcp
- https://cursor.com/docs/cli/headless
- https://cursor.com/docs/cli/github-actions

### Cursor CLI Cookbooks
- https://cursor.com/docs/cli/cookbook/code-review
- https://cursor.com/docs/cli/cookbook/update-docs
- https://cursor.com/docs/cli/cookbook/fix-ci
- https://cursor.com/docs/cli/cookbook/secret-audit
- https://cursor.com/docs/cli/cookbook/translate-keys

### Cursor CLI Reference
- https://cursor.com/docs/cli/reference/slash-commands
- https://cursor.com/docs/cli/reference/parameters
- https://cursor.com/docs/cli/reference/authentication
- https://cursor.com/docs/cli/reference/permissions
- https://cursor.com/docs/cli/reference/configuration
- https://cursor.com/docs/cli/reference/output-format

---

## What Changed Upstream (January)

### 2026-01-08 — New CLI Features and Improved CLI Performance
From the changelog entry (CLI Jan 08):
- **Model list & selection**:
  - `agent models`
  - `--list-models`
  - `/models`
- **Rules generation/management**:
  - `/rules`
- **MCP enable/disable**:
  - `/mcp enable`
  - `/mcp disable`

Reference: https://cursor.com/changelog/cli-jan-08-2026

### 2026-01-16 — CLI Agent Modes and Cloud Handoff
From the changelog entry (CLI Jan 16):
- **Plan mode in CLI**:
  - `/plan`
  - `--mode=plan`
- **Ask mode in CLI**:
  - `/ask`
  - `--mode=ask`
- **Improved MCP auth flow** (“one-click MCP authentication”) and `/mcp list` UI.

Reference: https://cursor.com/changelog/cli-jan-16-2026

---

## Updated Cursor CLI Contract (Precise)

> Note: Cursor docs now describe the CLI entrypoint as **`agent`**.

### Install / Run

- Install (docs):
  ```bash
  curl https://cursor.com/install -fsS | bash
  ```
- Start interactive session:
  ```bash
  agent
  ```

References:
- https://cursor.com/docs/cli/installation
- https://cursor.com/docs/cli/index

### Authentication (Automation / CI)

Cursor CLI supports API key authentication for automation:

- Env var (recommended):
  ```bash
  export CURSOR_API_KEY=your_api_key_here
  agent "implement user authentication"
  ```
- Flag:
  ```bash
  agent --api-key your_api_key_here "implement user authentication"
  ```

Reference:
- https://cursor.com/docs/cli/reference/authentication

### Non-interactive (Print) Mode

- Run non-interactively:
  - `-p` or `--print` prints the response to stdout.
  - This mode is intended for scripts/CI.

Reference:
- https://cursor.com/docs/cli/using

### Output Format (for parsing/automation)

- `--output-format` supports:
  - `text` (default)
  - `json`
  - `stream-json` (NDJSON event stream)

- Constraint: `--output-format` is only valid when printing (`--print`) or when print mode is inferred (non‑TTY stdout / piped stdin).

- `stream-json` emits events including:
  - `system.init` (contains `apiKeySource`, `cwd`, `session_id`, `model`, etc.)
  - `user` message
  - `assistant` message
  - `tool_call.started` + `tool_call.completed` (including tool result payload)

Reference:
- https://cursor.com/docs/cli/reference/output-format

### Agent Modes

Cursor CLI supports explicit modes:
- Plan:
  - `/plan` (interactive)
  - `--mode=plan` (CLI flag)
- Ask:
  - `/ask`
  - `--mode=ask`

Reference:
- https://cursor.com/changelog/cli-jan-16-2026
- https://cursor.com/docs/agent/modes (linked from changelog)

### Model Listing + Selection

- List models:
  - `agent models`
  - `--list-models`
  - `/models`
- Select model:
  - `/model <id>` (interactive)
  - `--model <id>` (flag)

Reference:
- https://cursor.com/changelog/cli-jan-08-2026
- https://cursor.com/docs/cli/reference/configuration

### MCP (Model Context Protocol)

- List MCP servers:
  ```bash
  agent mcp list
  ```
- List tools for a server:
  ```bash
  agent mcp list-tools playwright
  ```

The changelog also indicates interactive MCP management:
- `/mcp list`
- `/mcp enable`
- `/mcp disable`

Reference:
- https://cursor.com/docs/cli/mcp
- https://cursor.com/changelog/cli-jan-08-2026
- https://cursor.com/changelog/cli-jan-16-2026

### Rules Management

- `/rules` creates/edits rules in CLI.

Reference:
- https://cursor.com/changelog/cli-jan-08-2026

### Permissions + Configuration

Cursor CLI uses a config file with a schema including:
- `version: 1`
- optional `editor.vimMode`
- optional `permissions.allow[]` and `permissions.deny[]` strings, e.g.
  ```json
  {
    "permissions": {
      "allow": ["Shell(ls)", "Shell(git)", "Read(src/**/*.ts)", "Write(package.json)"],
      "deny": ["Shell(rm)", "Read(.env*)", "Write(**/*.key)"]
    }
  }
  ```

Reference:
- https://cursor.com/docs/cli/reference/permissions
- https://cursor.com/docs/cli/reference/configuration

---

## Current Puppet Master Implementation (What We Do Today)

### Cursor binary naming assumptions

- Default command is **`cursor-agent`**:
  - `src/platforms/constants.ts` → `PLATFORM_COMMANDS.cursor = cursor-agent`
  - `REQUIREMENTS.md` Appendix A: Cursor CLI (`cursor-agent`) documents `cursor-agent -p "prompt"`

- We already probe fallbacks:
  - `getCursorCommandCandidates()` includes `cursor`, `cursor-agent`, and `agent`.

Files:
- `src/platforms/constants.ts`
- `REQUIREMENTS.md` (Appendix A)

### Runner behavior

- `CursorRunner`:
  - uses `-p` when `request.nonInteractive` is true
  - best-effort `--mode=plan` support (probes help output; falls back to “PLAN FIRST THEN EXECUTE” prompt preamble)
  - writes prompt to **stdin** (not as a `-p "..."` argument)
  - sets `CURSOR_NON_INTERACTIVE=1`

Files:
- `src/platforms/cursor-runner.ts`

### Doctor + auth

- Doctor checks availability by trying cursor command candidates and running `--version` / `--help`.
- Auth is currently always **skipped** for Cursor:
  - `getPlatformAuthStatus('cursor')` returns `skipped` and assumes local app/session.

Files:
- `src/doctor/checks/cli-tools.ts`
- `src/platforms/auth-status.ts`

### Output parsing

- Cursor output parser is plain-text oriented and looks for:
  - `<ralph>COMPLETE</ralph>` and `<ralph>GUTTER</ralph>`

It does not currently parse Cursor’s `--output-format json|stream-json`.

Files:
- `src/platforms/output-parsers/cursor-output-parser.ts`

### Model catalog

- We maintain a **static** list of Cursor models.
- This may become stale now that `agent models` / `--list-models` exists.

Files:
- `src/platforms/cursor-models.ts`

---

## Gap Analysis (What Likely Needs Updating)

### GAP-01: Default CLI entrypoint mismatch (`cursor-agent` vs `agent`)
- Cursor docs now center around `agent`.
- Puppet Master defaults to `cursor-agent`, and the runner uses that default unless explicitly overridden.

**Risk:** If a user has only `agent` installed on PATH (and not `cursor-agent`), Puppet Master may fail unless we resolve/auto-select the detected candidate.

### GAP-02: Cursor auth status logic is outdated for automation
- Cursor now supports explicit API key auth (`CURSOR_API_KEY` / `--api-key`).
- Our doctor/auth-status says “skipped”.

**Risk:** CI/GitHub Actions usage may be confusing or broken because we won’t surface missing `CURSOR_API_KEY`.

### GAP-03: Cursor output format support not used
- Cursor supports machine-readable output (`json` and `stream-json`).
- We currently parse plain text only.

**Opportunity:** Use `--output-format stream-json` in non-interactive runs for deterministic completion detection + structured evidence of tool calls.

### GAP-04: Ask mode should map to read-only verification / discovery
- Ask mode (`--mode=ask`) is ideal for:
  - capability discovery
  - repo audits
  - reviewer passes

**Opportunity:** Use ask mode in “read-only” tiers or reviewer roles.

### GAP-05: Model discovery should be dynamic (optional)
- We currently use a curated static list.
- Cursor now provides `agent models` / `--list-models`.

**Opportunity:** Add a “best effort” model discovery path, with caching and fallback to static list.

### GAP-06: MCP management UI changes may impact our setup docs
- Cursor’s CLI MCP flows changed (one-click auth + `/mcp list` menu).

**Opportunity:** Update our documentation / doctor messaging to match official flows.

---

## Implementation Plan (BUILD_QUEUE Style)

### Non‑Negotiable Constraints
- Fresh processes only (no session reuse).
- Keep ESM `.js` import extensions.
- Vitest only.
- Do not store secrets in repo.

---

## CU6-P0-T01: Cursor Command Resolution Alignment

### Goal
Make Puppet Master reliably run Cursor CLI even if the installed binary is `agent` (and not `cursor-agent`).

### Read First
- `src/platforms/constants.ts`
- `src/platforms/cursor-runner.ts`
- `src/doctor/checks/cli-tools.ts`
- https://cursor.com/docs/cli/installation
- https://cursor.com/docs/cli/index

### Proposed Changes
- Ensure the runtime command used by `CursorRunner` is resolved from `getCursorCommandCandidates()` (or equivalent detection), not just `PLATFORM_COMMANDS.cursor`.
- Preserve compatibility for existing `cursor-agent` installs.

### Acceptance Criteria
- If `agent --version` works but `cursor-agent --version` does not, Puppet Master still runs Cursor successfully.
- Doctor output clearly shows which command was selected.

### Evidence
- Doctor run shows selected command:
  - `npm run doctor` (or whatever command exists in this repo)

---

## CU6-P0-T02: Cursor Auth Status + Doctor Guidance (API Key)

### Goal
Treat Cursor as "skipped" only when appropriate; surface API-key auth requirements for CI/headless.

### Read First
- `src/platforms/auth-status.ts`
- `src/doctor/checks/cli-tools.ts`
- https://cursor.com/docs/cli/reference/authentication
- https://cursor.com/docs/cli/github-actions

### Proposed Changes
- Update Cursor auth check to:
  - `authenticated` if `CURSOR_API_KEY` is set
  - otherwise `skipped` (or `not_authenticated`) with a fixSuggestion explaining `CURSOR_API_KEY` for CI.

### Acceptance Criteria
- Doctor shows actionable fix suggestion when `CURSOR_API_KEY` is missing.
- No secrets are written to disk.

---

## CU6-P0-T03: Cursor Non-Interactive Invocation Contract (Prompt Passing)

### Goal
Align invocation with Cursor docs for print mode (`-p/--print`) while maintaining compatibility with large prompts.

### Read First
- `src/platforms/cursor-runner.ts`
- https://cursor.com/docs/cli/using

### Proposed Changes
- Prefer passing prompt as an argument in print mode (e.g., `-p "..."`) if compatible.
- Maintain stdin fallback for very large prompts or if required.

### Acceptance Criteria
- Cursor runs in non-interactive mode with documented patterns.
- No regressions in existing tests.

---

## CU6-P0-T04: Output Format Support (Optional, Recommended)

### Goal
Enable deterministic machine-readable output parsing in Cursor runs.

### Read First
- `src/platforms/output-parsers/cursor-output-parser.ts`
- https://cursor.com/docs/cli/reference/output-format

### Proposed Changes
- Add runner option to request `--output-format stream-json` in non-interactive runs.
- Add a parser for Cursor NDJSON events (system/user/assistant/tool_call.*), extracting:
  - final assistant text
  - tool calls + results for evidence
  - session metadata
- Keep text parsing fallback.

### Acceptance Criteria
- When `--output-format stream-json` is enabled, Puppet Master can still detect `<ralph>COMPLETE</ralph>` if present in assistant output.
- Evidence logs can include structured tool call records.

---

## CU6-P0-T05: Implement Ask Mode for Read-Only Runs

### Goal
Allow Puppet Master to run Cursor in a read-only exploration mode.

### Read First
- https://cursor.com/changelog/cli-jan-16-2026

### Proposed Changes
- Add a request flag mapping to `--mode=ask` for:
  - discovery passes
  - reviewer passes
  - gating prompts where we explicitly want no edits

### Acceptance Criteria
- Ask-mode runs do not modify files (best-effort enforced by Cursor).

---

## CU6-P0-T06: Model Discovery (Best-Effort)

### Goal
Optionally augment the static model list with dynamic discovery.

### Read First
- `src/platforms/cursor-models.ts`
- https://cursor.com/changelog/cli-jan-08-2026

### Proposed Changes
- Add a model discovery routine:
  - try `agent models` (or `--list-models`) with a short timeout
  - cache results
  - fallback to curated `CURSOR_MODELS`

### Acceptance Criteria
- GUI can show real available models when discovery succeeds.
- No crashes when discovery fails.

---

## CU6-P0-T07: MCP UX + Documentation Alignment

### Goal
Update our docs/doctor guidance to match Cursor’s new MCP workflows.

### Read First
- https://cursor.com/docs/cli/mcp
- https://cursor.com/changelog/cli-jan-16-2026

### Proposed Changes
- Update doctor suggestions for MCP troubleshooting.
- Ensure our `mcp.json` / `mcp-config.json` approach remains compatible.

### Acceptance Criteria
- Docs reference `/mcp list` / enable/disable behaviors.

---

## Risks / Open Questions (Must Verify Before Shipping)

1. **Binary naming**: confirm whether `cursor-agent` remains shipped/aliased by the installer or whether `agent` is the only stable entrypoint.
2. **Prompt passing**: confirm whether Cursor supports stdin prompt in print mode, or requires `-p "prompt"`.
3. **Output-format gating**: ensure `--output-format` truly requires `--print` (per docs) and works consistently in our environment.
4. **Ask mode enforcement**: treat as best-effort; still rely on our own safety/verification gates.

---

## Notes for GUI / UX

- Add explicit UI affordances for:
  - Cursor mode: `default` / `plan` / `ask`
  - Auth status: show whether `CURSOR_API_KEY` is set (without revealing it)
  - Output format: `text` vs `stream-json` (advanced)

---

## Appendix: Where to Change in This Repo (Pointers)

- Command naming/candidates:
  - `src/platforms/constants.ts`
- Cursor runner behavior:
  - `src/platforms/cursor-runner.ts`
- Cursor doctor checks:
  - `src/doctor/checks/cli-tools.ts`
- Cursor auth detection:
  - `src/platforms/auth-status.ts`
- Cursor output parsing:
  - `src/platforms/output-parsers/cursor-output-parser.ts`
- Cursor model catalog:
  - `src/platforms/cursor-models.ts`
- Current Cursor documentation assumptions:
  - `REQUIREMENTS.md`

---

## Task Status Log (fill in when implementing)

- **Status:** PASS
- **Date:** 2026-02-09
- **Summary:** Fixed Cursor model discovery + labeling regressions: Cursor command resolution now prefers `agent` (incl. Windows `.cmd` shims); `agent models` parsing ignores `Tip:` lines; `/api/config/models` performs best-effort Cursor discovery even on non-refresh loads (short timeout + cache); capability discovery returns discovered Cursor model IDs when available; curated Cursor model catalog updated to match current `agent models` patterns; Claude Code alias labels now include version context.
- **Files changed:**
  - `src/platforms/constants.ts`
  - `src/platforms/cursor-models.ts`
  - `src/platforms/capability-discovery.ts`
  - `src/gui/routes/config.ts`
  - `src/platforms/claude-models.ts`
  - `src/gui/react/src/pages/Config.tsx`
  - `src/platforms/cursor-models.test.ts`
  - `src/platforms/claude-models.test.ts`
  - `src/gui/routes/config.test.ts`
- **Commands run:**
  - `npm run typecheck`: PASS
  - `npm test`: PASS
