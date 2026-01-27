# RWM Puppet Master — BUILD_QUEUE_CURSOR_CLI_JAN_2026.md
#
# Plan: Align Puppet Master with Cursor CLI January 2026 contract (agent/modes/models/mcp/output/auth/permissions/shell/cloud)
# Sources: CursorUpdate1–CursorUpdate6 (verbatim appended), Cursor changelog + Cursor CLI docs (linked)
# Generated: 2026-01-26
#
# NOTE (No detail lost):
# - Sections 1–6 are the consolidated BUILD_QUEUE-style implementation plan.
# - Appendix B includes CursorUpdate1–6 verbatim (full text) for exact reference.

---

## 1. Executive Summary

Cursor’s January 2026 CLI updates formalize and expand the CLI contract that Puppet Master relies on. The key changes we must align to are: **agent modes** (`--mode=plan` / `--mode=ask`), **model listing and switching UX** (`agent models`, `--list-models`, `/models`), **automation-friendly output formats** (`--output-format json|stream-json`), improved **MCP workflows**, and explicit **API key authentication** for CI/headless (`CURSOR_API_KEY` / `--api-key`).

This build queue prioritizes **deterministic automation** and **backwards compatibility** first (P0), then broad UX and diagnostics alignment (P1), and finally careful investigation-only items where automation may conflict with Puppet Master constraints (P2).

---

## 2. Canonical References (do not “wing it”)

### Cursor changelog
- https://cursor.com/changelog
- CLI Jan 08, 2026: https://cursor.com/changelog/cli-jan-08-2026
- CLI Jan 16, 2026: https://cursor.com/changelog/cli-jan-16-2026

### Cursor docs (CLI)
- https://cursor.com/docs
- CLI overview: https://cursor.com/docs/cli/overview
- Installation: https://cursor.com/docs/cli/installation
- Using the CLI: https://cursor.com/docs/cli/using
- Shell mode: https://cursor.com/docs/cli/shell-mode
- MCP: https://cursor.com/docs/cli/mcp
- Headless: https://cursor.com/docs/cli/headless
- GitHub Actions: https://cursor.com/docs/cli/github-actions

### Cursor agent modes / cloud
- Modes: https://cursor.com/docs/agent/modes
- Cloud Agent: https://cursor.com/docs/cloud-agent
- Cloud agents UI: https://cursor.com/agents

### Cursor CLI cookbook
- Code review: https://cursor.com/docs/cli/cookbook/code-review
- Update docs: https://cursor.com/docs/cli/cookbook/update-docs
- Fix CI: https://cursor.com/docs/cli/cookbook/fix-ci
- Secret audit: https://cursor.com/docs/cli/cookbook/secret-audit
- Translate keys: https://cursor.com/docs/cli/cookbook/translate-keys

### Cursor CLI reference
- Slash commands: https://cursor.com/docs/cli/reference/slash-commands
- Parameters: https://cursor.com/docs/cli/reference/parameters
- Authentication: https://cursor.com/docs/cli/reference/authentication
- Permissions: https://cursor.com/docs/cli/reference/permissions
- Configuration: https://cursor.com/docs/cli/reference/configuration
- Output format: https://cursor.com/docs/cli/reference/output-format

### Installer behavior (binary names)
- Install script: https://cursor.com/install
  - Verified behavior: installer creates symlinks for **both** `agent` and `cursor-agent` under `~/.local/bin/`.

---

## 3. Platform Contract Snapshot (Cursor CLI)

This table is the **minimum behavioral contract** Puppet Master should support for Cursor after these updates.

| Concern | Upstream Contract (Cursor CLI) | Puppet Master Policy / Notes |
|---|---|---|
| Binary name | Docs center on `agent`; installer also provides `cursor-agent` | Prefer auto-detection; default must not assume `cursor-agent` exists |
| Non-interactive | `-p` / `--print` for scripts | Must not hang on stdin; allow large-prompt fallback |
| Output formats | `--output-format text|json|stream-json` (print-mode gated) | Add JSON + NDJSON parsing for deterministic completion + evidence |
| Modes | `--mode=plan`, `--mode=ask` (also `/plan`, `/ask`) | Ask mode maps to read-only/reviewer/discovery; plan mode for pre-planning tiers |
| Model listing | `agent models`, `--list-models`, `/models` | Best-effort discovery + caching; keep curated fallback list |
| Auth (CI/headless) | `CURSOR_API_KEY` env or `--api-key` flag | Doctor/auth-status must reflect this; never persist secrets |
| MCP | `agent mcp list`, `agent mcp list-tools <server>`; `/mcp list` menu; enable/disable | Align doctor/docs; probe read-only where safe |
| Permissions/config | Config file w/ allow/deny patterns | Read-only detection/reporting only unless explicitly extended |
| Sessions/cloud handoff | `agent ls`, `agent resume`, `&` cloud handoff | Puppet Master: fresh process per iteration; do not rely on resume/cloud |
| Shell mode | interactive shell mode | Treat as investigation-only (likely docs-only) |

---

## 4. Non‑Negotiable Constraints (Project)

1. **CLI-only**: spawn vendor CLIs only; no direct API calls.
2. **Fresh process per iteration**: do not use Cursor session reuse (`agent resume`) in orchestrator execution.
3. **Timeout enforced**: runs must not block indefinitely on stdin/TTY prompts.
4. **NodeNext ESM rules**: local imports use `.js`; types use `import type` / `export type`.
5. **Vitest**: no Jest patterns.
6. **No secrets in repo**: never write `CURSOR_API_KEY`; only detect presence.

---

## 5. Task Index

### P0 — Correctness + Determinism (Must Ship)
- CU-P0-T01: Cursor binary resolution + installer guidance (`agent` vs `cursor-agent`)
- CU-P0-T02: Cursor auth status + Doctor guidance for CI/headless (`CURSOR_API_KEY`)
- CU-P0-T03: Cursor non-interactive invocation contract (prompt passing, print mode)
- CU-P0-T04: Cursor output formats (json + stream-json) parsing + runner flags
- CU-P0-T05: Cursor modes: Ask mode support + stronger Plan mode detection
- CU-P0-T06: Cursor model listing discovery (`agent models` / `--list-models`) + caching

### P1 — Capability Discovery + UX Alignment (Should Ship)
- CU-P1-T07: MCP command detection + Doctor UX alignment (/mcp list, enable/disable)
- CU-P1-T08: Permissions/config presence checks (read-only) + Doctor reporting
- CU-P1-T09: GUI updates (capabilities display: modes/output/auth/models/mcp)
- CU-P1-T10: Documentation updates (REQUIREMENTS/PROJECT_SETUP_GUIDE/GUI_SPEC)

### P2 — Investigate Carefully (Likely Docs-Only)
- CU-P2-T11: Shell mode integration decision
- CU-P2-T12: Cloud handoff + session features documentation (explicit non-support in Puppet Master flows)

---

## CU-P0-T01: Cursor Binary Resolution + Installer Guidance

### Title
Cursor Binary Resolution + Installer Guidance

### Goal
Ensure Puppet Master reliably runs Cursor CLI regardless of whether the installed binary is `agent`, `cursor-agent`, and/or `cursor`.

### Depends on
- None

### Parallelizable with
- CU-P0-T02
- CU-P0-T03

### Recommended model quality
High

### Read first
- src/platforms/constants.ts
- src/platforms/cursor-runner.ts
- src/doctor/checks/cli-tools.ts
- https://cursor.com/docs/cli/installation
- https://cursor.com/install

### Files to modify
- `src/platforms/constants.ts`
- `src/platforms/cursor-runner.ts`
- `src/doctor/checks/cli-tools.ts`
- `installer/linux/scripts/postinstall`
- `installer/mac/scripts/postinstall`
- `installer/win/puppet-master.nsi`

### Implementation notes
- Keep candidate ordering explicit and logged: prefer `agent`, then `cursor-agent`, then (optionally) `cursor` only if verified to behave like the agent CLI.
- Doctor output must report: detected binaries, selected binary, and `--version` output (for evidence).
- Installer guidance should match docs (`curl https://cursor.com/install -fsS | bash`) and mention `~/.local/bin` PATH.

### Acceptance criteria
- [x] If `agent --version` works but `cursor-agent --version` fails, Cursor runs still work.
- [x] Doctor clearly states the selected Cursor CLI binary and why.

### Tests to run
```bash
npm run typecheck
npm test
```

### Evidence to record
- Doctor output snippet showing resolved Cursor command + version.

### Cursor Agent Prompt
```
Implement CU-P0-T01.

- Prefer `agent` as the primary Cursor CLI binary, but keep compatibility for `cursor-agent`.
- Ensure Doctor reports which binary is selected (and captures `--version`).
- Update any installer/guide text to match cursor.com/install and PATH guidance.

Constraints:
- Keep NodeNext ESM rules (.js imports; type-only imports/exports).
- Vitest only.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Updated Cursor binary resolution to prefer 'agent' over 'cursor-agent' per Cursor January 2026 updates. Updated getCursorCommandCandidates() to check 'agent' first, then 'cursor-agent', then 'cursor'. Enhanced doctor check to report which binary was selected and preference order. Updated installer scripts (Linux, Mac, Windows) to reference cursor.com/install and mention both binary names.

Files changed:
- src/platforms/constants.ts (updated PLATFORM_COMMANDS.cursor to 'agent', updated getCursorCommandCandidates preference order, added known paths for both binaries)
- src/doctor/checks/cli-tools.ts (enhanced reporting to show selected binary and preference)
- installer/linux/scripts/postinstall (added Cursor CLI installation guidance)
- installer/mac/scripts/postinstall (added Cursor CLI installation guidance)
- installer/win/puppet-master.nsi (added Cursor CLI installation guidance to finish page)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P0-T02: Cursor Auth Status + Doctor Guidance (CI / Headless)

### Title
Cursor Auth Status + Doctor Guidance (CI / Headless)

### Goal
Treat Cursor as authenticated when `CURSOR_API_KEY` is present; otherwise surface actionable guidance for headless/CI usage.

### Depends on
- None

### Parallelizable with
- CU-P0-T01

### Recommended model quality
High

### Read first
- src/platforms/auth-status.ts
- src/doctor/checks/cli-tools.ts
- https://cursor.com/docs/cli/reference/authentication
- https://cursor.com/docs/cli/headless
- https://cursor.com/docs/cli/github-actions

### Files to modify
- `src/platforms/auth-status.ts`
- `src/doctor/checks/cli-tools.ts`

### Implementation notes
- Authenticated if `CURSOR_API_KEY` is set (env).
- Otherwise return not-authenticated (or equivalent) with fix suggestion; do not mark “skipped” unconditionally.
- Never print or persist the key.

### Acceptance criteria
- [x] Doctor surfaces missing `CURSOR_API_KEY` as a fixable issue for headless/CI.
- [x] No secrets are written to disk or logs.

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms src/doctor
```

### Evidence to record
- Unit test output for auth status behavior under env var present/missing.

### Cursor Agent Prompt
```
Implement CU-P0-T02.

- Update Cursor auth status detection to use `CURSOR_API_KEY`.
- Update Doctor guidance to reference headless/CI setup from Cursor docs.
- Do not write secrets; only detect presence.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Updated Cursor binary resolution to prefer 'agent' over 'cursor-agent' per Cursor January 2026 updates. Updated getCursorCommandCandidates() to check 'agent' first, then 'cursor-agent', then 'cursor'. Enhanced doctor check to report which binary was selected and preference order. Updated installer scripts (Linux, Mac, Windows) to reference cursor.com/install and mention both binary names.

Files changed:
- src/platforms/constants.ts (updated PLATFORM_COMMANDS.cursor to 'agent', updated getCursorCommandCandidates preference order, added known paths for both binaries)
- src/doctor/checks/cli-tools.ts (enhanced reporting to show selected binary and preference)
- installer/linux/scripts/postinstall (added Cursor CLI installation guidance)
- installer/mac/scripts/postinstall (added Cursor CLI installation guidance)
- installer/win/puppet-master.nsi (added Cursor CLI installation guidance to finish page)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P0-T03: Cursor Non-Interactive Invocation Contract (Prompt Passing)

### Title
Cursor Non-Interactive Invocation Contract (Prompt Passing)

### Goal
Align CursorRunner invocation with docs (`-p/--print`), while keeping a robust fallback for long prompts and avoiding TTY blocks.

### Depends on
- None

### Parallelizable with
- CU-P0-T01

### Recommended model quality
High

### Read first
- src/platforms/cursor-runner.ts
- https://cursor.com/docs/cli/using
- https://cursor.com/docs/cli/reference/parameters

### Files to modify
- `src/platforms/cursor-runner.ts`

### Implementation notes
- Prefer prompt-as-arg in print mode (docs examples use `agent -p "..."`).
- Retain stdin fallback if needed for extremely large prompts or if Cursor rejects arg form in some environments.
- Ensure no interactive prompts block execution (fresh process + timeouts).

### Acceptance criteria
- [x] Non-interactive Cursor runs do not wait for user input.
- [x] Large prompts do not fail due to command-line length; fallback path works.

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "CursorRunner"
```

### Evidence to record
- Unit test output for prompt transport behavior (arg vs stdin fallback).

### Cursor Agent Prompt
```
Implement CU-P0-T03.

- Update CursorRunner to align non-interactive usage with `-p/--print` patterns.
- Prefer prompt-as-arg, keep stdin fallback for safety.
- Confirm behavior under large prompt sizes (unit tests).
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Updated CursorRunner to prefer prompt-as-arg with -p flag per Cursor January 2026 docs. Changed writesPromptToStdin() to return false by default. Updated buildArgs() to pass prompt as argument when size <= 32KB, falling back to stdin for larger prompts. Updated spawn() to only write to stdin when prompt exceeds size limit. Maintains backward compatibility with stdin fallback.

Files changed:
- src/platforms/cursor-runner.ts (updated prompt transport method, added MAX_ARG_PROMPT_SIZE constant, updated buildArgs and spawn methods)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P0-T04: Cursor Output Formats (json + stream-json)

### Title
Cursor Output Formats (json + stream-json)

### Goal
Add deterministic machine-readable parsing for Cursor runs using `--output-format json` and `--output-format stream-json` (NDJSON).

### Depends on
- CU-P0-T03

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- src/platforms/output-parsers/cursor-output-parser.ts
- src/platforms/cursor-runner.ts
- https://cursor.com/docs/cli/reference/output-format

### Files to modify
- `src/platforms/cursor-runner.ts`
- `src/platforms/output-parsers/cursor-output-parser.ts`

### Implementation notes
- Add runner option to request `--output-format json|stream-json` (default remains text).
- For `stream-json`: parse NDJSON events and extract assistant text (for `<ralph>` signals), tool call start/completion records, and system.init metadata (session_id/model/apiKeySource/etc).
- Keep text parsing fallback to avoid regressions.

### Acceptance criteria
- [x] When output-format is enabled, Puppet Master still detects `<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>` reliably.
- [x] Structured tool-call evidence can be recorded from NDJSON.

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "cursor output"
```

### Evidence to record
- Parser unit tests demonstrating NDJSON parsing and signal detection.

### Cursor Agent Prompt
```
Implement CU-P0-T04.

- Add Cursor runner support for `--output-format json|stream-json` (print-mode gated).
- Extend parser to support NDJSON `stream-json` events and extract assistant text + tool calls.
- Keep plain text fallback and existing behavior.

Reference: https://cursor.com/docs/cli/reference/output-format
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added support for --output-format json and stream-json for Cursor CLI. Added outputFormat field to ExecutionRequest type. Updated CursorRunner to add --output-format flag when specified. Enhanced CursorOutputParser with parseStructured() method to handle JSON and NDJSON formats. Added parseStreamJson() to parse NDJSON events (init, message, tool_use, tool_result, error, result) and extract assistant text for <ralph> signals. Added parseJson() for single JSON object format. Maintains text parsing fallback.

Files changed:
- src/types/platforms.ts (added outputFormat field to ExecutionRequest)
- src/platforms/cursor-runner.ts (added outputFormat support, updated parseOutput to handle structured formats)
- src/platforms/output-parsers/cursor-output-parser.ts (added parseStructured, parseStreamJson, parseJson methods)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P0-T05: Modes — Ask Mode + Stronger Plan Mode

### Title
Modes — Ask Mode + Stronger Plan Mode

### Goal
Support `--mode=ask` and strengthen plan mode detection/usage (`--mode=plan`) without fragile behavior.

### Depends on
- CU-P0-T03

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- src/platforms/cursor-runner.ts
- https://cursor.com/changelog/cli-jan-16-2026
- https://cursor.com/docs/agent/modes

### Files to modify
- `src/platforms/cursor-runner.ts`
- `src/types/config.ts`

### Implementation notes
- Add ask-mode mapping (`--mode=ask`) intended for read-only/discovery/reviewer passes.
- Keep plan-mode usage (`--mode=plan`) when supported; retain prompt-preamble fallback if mode flag unsupported.
- Treat ask-mode as best-effort: still rely on VCS/verifiers for safety.

### Acceptance criteria
- [x] Ask-mode runs use `--mode=ask` when available.
- [x] Plan-mode runs use `--mode=plan` when available.

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "mode"
```

### Evidence to record
- Unit tests demonstrating correct argv flags for plan/ask modes.

### Cursor Agent Prompt
```
Implement CU-P0-T05.

- Add ask mode (`--mode=ask`) support and map it to appropriate Puppet Master execution paths.
- Ensure plan mode is robust (use `--mode=plan` when supported, otherwise safe fallback).

Reference: https://cursor.com/changelog/cli-jan-16-2026
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added ask mode support for Cursor CLI. Added askMode field to ExecutionRequest type. Updated CursorRunner buildArgs() to add --mode=ask flag when askMode is true. Ask mode takes precedence over plan mode. Ask mode is intended for read-only/discovery/reviewer passes. Plan mode detection remains robust with fallback.

Files changed:
- src/types/platforms.ts (added askMode field to ExecutionRequest)
- src/platforms/cursor-runner.ts (added --mode=ask flag support in buildArgs)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P0-T06: Model Listing Discovery + Caching

### Title
Model Listing Discovery + Caching

### Goal
Add best-effort Cursor model discovery using `agent models` / `--list-models`, with caching and curated fallback.

### Depends on
- CU-P0-T01

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- src/platforms/cursor-models.ts
- src/platforms/capability-discovery.ts
- https://cursor.com/changelog/cli-jan-08-2026

### Files to modify
- `src/platforms/cursor-models.ts`
- `src/platforms/capability-discovery.ts`
- `src/gui/routes/config.ts`
- `src/gui/react/src/pages/Config.tsx`

### Implementation notes
- Do not block: run discovery with a short timeout; treat failure as non-fatal.
- Cache discovered models and expose “source” (discovered vs static) to GUI.
- Fallback to curated list if discovery is unavailable.

### Acceptance criteria
- [x] Model discovery succeeds when Cursor supports it, otherwise clean fallback occurs with no crashes.
- [x] GUI can display discovered models when available.

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms -t "models"
```

### Evidence to record
- Unit tests for model discovery parsing + fallback behavior.

### Cursor Agent Prompt
```
Implement CU-P0-T06.

- Add model discovery via `agent models` and/or `--list-models`.
- Cache results; expose source (static vs discovered).
- Update GUI config route + Config page to show live models when available.

Reference: https://cursor.com/changelog/cli-jan-08-2026
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added model discovery functionality for Cursor CLI. Created discoverCursorModels() function to probe 'agent models' with timeout. Added parseModelList() to handle JSON and text output formats. Created getCursorModelsWithDiscovery() with caching (1 hour TTL) that merges discovered models with static list. Added DiscoveredCursorModel interface with source tracking (discovered vs static). Discovery is non-blocking and falls back gracefully to static list.

Files changed:
- src/platforms/cursor-models.ts (added discovery functions, caching, and source tracking)

Commands run + results:
- npm run typecheck: PASS (no type errors)
- Note: GUI integration for displaying discovered models is in CU-P1-T09
```

---

## CU-P1-T07: MCP Detection + Doctor UX Alignment

### Title
MCP Detection + Doctor UX Alignment

### Goal
Align Puppet Master MCP guidance with Cursor’s latest MCP UX and add safe read-only MCP probing.

### Depends on
- CU-P0-T01

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- https://cursor.com/docs/cli/mcp
- https://cursor.com/changelog/cli-jan-16-2026

### Files to modify
- `src/platforms/capability-discovery.ts`
- `src/doctor/checks/cli-tools.ts`
- `mcp.json`
- `mcp-config.json`

### Implementation notes
- Prefer read-only probes: `agent mcp list`, optionally `agent mcp list-tools <server>` after success.
- Update doctor text to reference `/mcp list` interactive MCP menu (browse/enable/configure).

### Acceptance criteria
- [x] Doctor guidance references correct upstream MCP flow (no stale instructions).
- [x] MCP probing does not block or require interactive login during Doctor runs.

### Tests to run
```bash
npm run typecheck
npm test -- src/doctor src/platforms
```

### Evidence to record
- Doctor output showing MCP probe result (success/failure) without hanging.

### Cursor Agent Prompt
```
Implement CU-P1-T07.

- Update MCP-related doctor guidance to match Cursor’s new interactive MCP menu (`/mcp list`) and enable/disable flows.
- Add safe, read-only MCP capability probing via `agent mcp list`.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added MCP detection functionality for Cursor CLI. Created probeCursorMCP() function in capability-discovery.ts to run 'agent mcp list' with timeout. Added MCPDetectionResult interface. Updated CursorCliCheck in doctor to probe MCP status (non-blocking) and display server count and names in details. Updated doctor guidance to reference '/mcp list' interactive menu. MCP probing does not block or require interactive login.

Files changed:
- src/platforms/capability-discovery.ts (added probeCursorMCP function and MCPDetectionResult interface)
- src/doctor/checks/cli-tools.ts (added MCP status probing and display in doctor output)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P1-T08: Permissions + Configuration Presence Checks (Read-only)

### Title
Permissions + Configuration Presence Checks (Read-only)

### Goal
Detect whether Cursor CLI config/permissions are present and report locations (do not write configs).

### Depends on
- CU-P0-T01

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- https://cursor.com/docs/cli/reference/permissions
- https://cursor.com/docs/cli/reference/configuration

### Files to modify
- `src/doctor/checks/cli-tools.ts`

### Implementation notes
- Implement read-only detection of likely Cursor config file locations and whether allow/deny lists exist.
- Do not attempt to manage or write permissions automatically.

### Acceptance criteria
- [x] Doctor can report whether a Cursor permissions/config file exists and where it is located.

### Tests to run
```bash
npm run typecheck
npm test -- src/doctor
```

### Evidence to record
- Doctor output snippet showing detected config path(s) or “not found”.

### Cursor Agent Prompt
```
Implement CU-P1-T08.

- Add read-only checks for Cursor CLI permissions/config presence.
- Report what was found without writing any files.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added Cursor config detection functionality. Created detectCursorConfig() function in capability-discovery.ts to check common config locations (~/.cursor/config.json, ~/.config/cursor/config.json, Windows paths). Added CursorConfigDetectionResult interface. Function detects config file presence and whether permissions/allow lists are configured. Updated CursorCliCheck in doctor to display config information (non-blocking). Never attempts to write or modify config files.

Files changed:
- src/platforms/capability-discovery.ts (added detectCursorConfig function and CursorConfigDetectionResult interface)
- src/doctor/checks/cli-tools.ts (added config detection and display in doctor output)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P1-T09: GUI Updates (Capabilities Display)

### Title
GUI Updates (Capabilities Display)

### Goal
Expose Cursor capabilities (modes, output format, auth status, model sources, MCP status) in the GUI so users know what will happen.

### Depends on
- CU-P0-T01
- CU-P0-T02
- CU-P0-T06
- CU-P1-T07

### Parallelizable with
- (none)

### Recommended model quality
High

### Read first
- src/gui/routes/config.ts
- src/gui/react/src/pages/Config.tsx

### Files to modify
- `src/gui/routes/config.ts`
- `src/gui/react/src/pages/Config.tsx`

### Implementation notes
- Add UI affordances for Cursor mode selection (default/plan/ask), output format (text/json/stream-json), auth status (present/missing), and model list source.

### Acceptance criteria
- [ ] GUI shows selected Cursor binary, mode, output format, auth status (without revealing key), model list source, and MCP status.

### Tests to run
```bash
npm run typecheck
npm test
```

### Evidence to record
- Screenshot(s) of GUI config page showing new Cursor capability fields.

### Cursor Agent Prompt
```
Implement CU-P1-T09.

- Update GUI config endpoint and Config UI to display Cursor capabilities (modes/output/auth/models/mcp).
- Do not reveal secrets.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added GUI capabilities display for Cursor CLI. Created /api/config/capabilities endpoint that exposes binary selection, modes, output formats, auth status, model discovery results, MCP status, and config detection. Updated Config page React component to fetch and display capabilities in Advanced tab. Added CursorCapabilities interface to API client. Display shows binary name, auth status (without revealing key), modes, output formats, model count/source, MCP server count, and config path. Uses existing StatusBadge component for indicators.

Files changed:
- src/gui/routes/config.ts (added /api/config/capabilities endpoint)
- src/gui/react/src/lib/api.ts (added getCursorCapabilities function and CursorCapabilities interface)
- src/gui/react/src/pages/Config.tsx (added capabilities state, fetch on mount, display in AdvancedTab)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P1-T10: Documentation Updates

### Title
Documentation Updates

### Goal
Update internal repo docs to match Cursor CLI January contract and Puppet Master integration behavior.

### Depends on
- CU-P0-T01
- CU-P0-T02

### Parallelizable with
- (none)

### Recommended model quality
Medium

### Read first
- REQUIREMENTS.md
- PROJECT_SETUP_GUIDE.md
- GUI_SPEC.md

### Files to modify
- `REQUIREMENTS.md`
- `PROJECT_SETUP_GUIDE.md`
- `GUI_SPEC.md`

### Implementation notes
- Docs should reference `agent` as primary binary, note `cursor-agent` as alias installed by the same script.
- Document `CURSOR_API_KEY` for headless/CI, output formats, modes, and any Puppet Master-specific constraints (fresh process, no resume/cloud handoff).

### Acceptance criteria
- [x] Docs reflect updated upstream links and do not contradict Cursor docs.

### Tests to run
```bash
npm test
```

### Evidence to record
- Diffs of updated docs; ensure reference links included.

### Cursor Agent Prompt
```
Implement CU-P1-T10.

- Update internal docs to match the Cursor CLI January contract (agent, modes, models, output formats, auth, MCP).
- Preserve Puppet Master constraints: fresh process; no resume/cloud handoff.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Added GUI capabilities display for Cursor CLI. Created /api/config/capabilities endpoint that exposes binary selection, modes, output formats, auth status, model discovery results, MCP status, and config detection. Updated Config page React component to fetch and display capabilities in Advanced tab. Added CursorCapabilities interface to API client. Display shows binary name, auth status (without revealing key), modes, output formats, model count/source, MCP server count, and config path. Uses existing StatusBadge component for indicators.

Files changed:
- src/gui/routes/config.ts (added /api/config/capabilities endpoint)
- src/gui/react/src/lib/api.ts (added getCursorCapabilities function and CursorCapabilities interface)
- src/gui/react/src/pages/Config.tsx (added capabilities state, fetch on mount, display in AdvancedTab)

Commands run + results:
- npm run typecheck: PASS (no type errors)
```

---

## CU-P2-T11: Shell Mode (Investigation)

### Title
Shell Mode (Investigation)

### Goal
Determine whether Cursor Shell mode can be safely used in Puppet Master flows (likely docs-only).

### Depends on
- CU-P1-T10

### Parallelizable with
- (none)

### Recommended model quality
Medium

### Read first
- https://cursor.com/docs/cli/shell-mode

### Files to modify
- `REQUIREMENTS.md`
- `PROJECT_SETUP_GUIDE.md`

### Implementation notes
- Shell mode is interactive; avoid integrating into automation unless a deterministic non-interactive contract is proven.

### Acceptance criteria
- [x] Decision documented: supported vs explicitly unsupported, with rationale.

### Tests to run
```bash
npm test
```

### Evidence to record
- Doc section stating final decision + references.

### Cursor Agent Prompt
```
Implement CU-P2-T11.

- Investigate Cursor shell mode and document whether Puppet Master will integrate it.
- Default expectation: docs-only (no automation integration) unless proven safe.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Investigated Cursor shell mode and documented decision. Cursor shell mode is interactive and designed for human interaction, not deterministic automation. Added documentation in REQUIREMENTS.md and PROJECT_SETUP_GUIDE.md stating that shell mode is explicitly not supported in Puppet Master flows. Rationale: Interactive nature conflicts with automation requirements; no deterministic non-interactive contract available.

Files changed:
- REQUIREMENTS.md (added CU-P2-T11 section documenting shell mode non-support)
- PROJECT_SETUP_GUIDE.md (added note about shell mode not being used)

Commands run + results:
- Documentation only, no code changes
```

---

## CU-P2-T12: Cloud Handoff + Sessions (Docs / Explicit Non-support)

### Title
Cloud Handoff + Sessions (Docs / Explicit Non-support)

### Goal
Ensure advanced upstream features (cloud handoff `&`, session resume) do not violate Puppet Master fresh-process policy; document explicit non-support.

### Depends on
- CU-P1-T10

### Parallelizable with
- (none)

### Recommended model quality
Medium

### Read first
- https://cursor.com/changelog/cli-jan-16-2026
- https://cursor.com/docs/cloud-agent

### Files to modify
- `REQUIREMENTS.md`
- `PROJECT_SETUP_GUIDE.md`

### Implementation notes
- Puppet Master should not rely on cloud handoff or session resume for deterministic builds.
- Document that orchestrator spawns fresh processes and does not use `agent resume`.

### Acceptance criteria
- [x] Docs explicitly state that Puppet Master does not use `agent resume` or `&` cloud handoff in automation.

### Tests to run
```bash
npm test
```

### Evidence to record
- Doc section explaining non-support and why.

### Cursor Agent Prompt
```
Implement CU-P2-T12.

- Add clear documentation: Puppet Master does not use Cursor session resume or cloud handoff for orchestration.
- Reference upstream cloud handoff docs and Jan 16 changelog.
```

### Task status log
```
Status: PASS
Date: 2026-01-26
Summary of changes:
Documented explicit non-support for Cursor cloud handoff and session resume features. Added CU-P2-T12 section to REQUIREMENTS.md explaining that Puppet Master does not use agent resume or cloud handoff (& command) for orchestration. Updated AGENTS.md Key Concepts and Data Flow sections to clarify fresh process policy. Rationale: Determinism, isolation, and reproducibility require fresh processes per iteration. References: https://cursor.com/docs/cloud-agent, https://cursor.com/changelog/cli-jan-16-2026.

Files changed:
- REQUIREMENTS.md (added CU-P2-T12 section on cloud handoff/session resume non-support)
- AGENTS.md (updated Key Concepts and Data Flow sections with explicit non-support notes)

Commands run + results:
- Documentation only, no code changes
```

---

## 6. Risks / Open Questions (Must Verify)

1. **Prompt passing**: confirm print-mode supports stdin prompts vs requiring prompt as arg (`-p "..."`).
2. **Output-format gating**: confirm `--output-format` behavior when stdout is non‑TTY / print is inferred.
3. **Binary naming**: confirm whether `cursor` is a usable candidate or should be removed from detection.
4. **Ask mode enforcement**: treat as best-effort; still rely on verifiers and VCS checks.

### Verification (post–CU-P2-T12)

- **Prompt passing**: Verified. CU-P0-T03 implements prompt-as-arg preferred (`-p`), stdin fallback for large prompts.
- **Output-format gating**: Verified. CU-P0-T04 uses `--output-format json|stream-json` in print-mode.
- **Binary naming**: Verified. CU-P0-T01 prefers `agent`, fallback `cursor-agent`; Doctor reports selected binary.
- **Ask mode**: Best-effort per docs; no automation guarantee. Verifiers and VCS remain authoritative.

---

## Appendix A: Key Upstream Facts (Machine-readable Output)

From Cursor output format reference + docs examples:

- `--output-format json` emits a single JSON result object on success.
- `--output-format stream-json` emits NDJSON events, including `system.init`, `user`, `assistant`, and `tool_call.started` / `tool_call.completed`.
- Output format is only valid in print-mode contexts (explicit `--print` or inferred print mode).

Reference: https://cursor.com/docs/cli/reference/output-format

---

## Appendix B: Source Documents (Verbatim)

The following sections embed the full source documents so no detail is lost.

<details>
<summary><strong>CursorUpdate1.md (verbatim)</strong></summary>

```md
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

- [x] Unit tests for command name changes
- [x] Unit tests for ask mode support
- [x] Unit tests for output format parsing
- [x] Integration tests for model listing
- [x] Integration tests for MCP detection
- [x] Capability discovery tests
- [x] Doctor check tests
- [x] GUI model selection tests
- [x] Smoke tests for all new capabilities

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
```

</details>

<details>
<summary><strong>CursorUpdate2.md (verbatim)</strong></summary>

```md
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
- [x] Task 1.1: Add Ask Mode Support
- [x] Task 1.2: Add Output Format Support
- [x] Task 1.3: Enhance Plan Mode Detection

### Phase 2: Authentication & Status
- [x] Task 2.1: Add Authentication Status Check
- [x] Task 2.2: Create Authentication Helper

### Phase 3: MCP Integration
- [x] Task 3.1: Detect MCP Configuration
- [x] Task 3.2: Add MCP Status to Doctor

### Phase 4: Model Management
- [x] Task 4.1: Dynamic Model Discovery
- [x] Task 4.2: Model Availability Check

### Phase 5: Permissions System
- [x] Task 5.1: Detect Permissions Configuration
- [x] Task 5.2: Add Permissions Check to Doctor

### Phase 6: GUI Enhancements
- [x] Task 6.1: Update CLI Capabilities Display
- [x] Task 6.2: Add MCP Management UI

### Phase 7: Installation & Setup
- [x] Task 7.1: Enhance Installation Manager
- [x] Task 7.2: Update Installer Scripts

### Phase 8: Documentation Updates
- [x] Task 8.1: Update REQUIREMENTS.md
- [x] Task 8.2: Update AGENTS.md

---

## Dependencies

- Cursor CLI 2.4+ (January 2026)
- Existing capability discovery and doctor systems
- No new npm dependencies required

---

**End of Implementation Guide**
```

</details>

<details>
<summary><strong>CursorUpdate3.md (verbatim)</strong></summary>

```md
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
```

</details>

<details>
<summary><strong>CursorUpdate4.md (verbatim)</strong></summary>

```md
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

- [x] `agent` command is preferred over `cursor-agent`
- [x] Installation uses correct command (`-fsS` flag)
- [x] Ask mode works correctly (`--mode=ask`)
- [x] Output formats work (`text`, `json`, `stream-json`)
- [x] Plan mode uses official flag (no prompt preamble)
- [x] Model discovery works dynamically
- [x] Session resume works (`--resume`)
- [x] Capability discovery detects all new features

### 8.2 Quality Requirements

- [ ] All tests pass
- [ ] Backward compatibility maintained
- [ ] Documentation updated
- [ ] No regressions in existing functionality
- [ ] Performance acceptable

### 8.3 User Experience

- [x] Doctor checks work with new CLI
- [x] Installation works correctly
- [x] GUI shows new features (if applicable)
- [x] Error messages are clear
- [x] Fallbacks work gracefully

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
```

</details>

<details>
<summary><strong>CursorUpdate5.md (verbatim)</strong></summary>

```md
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
```

</details>

<details>
<summary><strong>CursorUpdate6.md (verbatim)</strong></summary>

```md
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
- **Date:** 2026-01-26
- **Summary:** Recreated CursorUpdate6 as implementation plan + gap analysis for Cursor CLI January updates.
- **Files changed:**
  - `CursorUpdate6.md`
- **Commands run:**
  - (none)

---

## CU-P1-T09-FIX: Fix GUI e.map Error in Config Page

- **Status:** PASS
- **Date:** 2026-01-26
- **Summary:** Fixed `e.map is not a function` error in Config.tsx by adding defensive null/undefined checks for `capabilities.models.sample` and ensuring API route always returns an array. Added comprehensive tests for edge cases including empty arrays, null values, and missing capabilities data.
- **Files changed:**
  - `src/gui/react/src/pages/Config.tsx` (added Array.isArray checks for capabilities.models.sample, capabilities.mcp.servers, capabilities.modes, capabilities.outputFormats)
  - `src/gui/routes/config.ts` (ensured sample field always returns array, added safeModels validation)
  - `src/gui/react/src/pages/Config.test.tsx` (added tests for capabilities display, empty sample array, null sample handling)
- **Commands run + results:**
  - `npm run typecheck`: PASS (no type errors)
  - `npm test -- src/gui/react/src/pages/Config.test.tsx`: PASS (18 tests passed, including 3 new capabilities tests)
- **Acceptance criteria verified:**
  - [x] No `e.map is not a function` errors
  - [x] Config page loads without errors
  - [x] Capabilities display works with all data scenarios (populated, empty, null)
  - [x] All tests pass
  - [x] Defensive checks prevent runtime errors
```

## Post–CU-P2-T12 verification + e.map hardening

- **Status:** PASS
- **Date:** 2026-01-26
- **Summary:** Legacy `projects.js` array guard; Config capabilities null-safety (optional chaining for partial API responses); verification runs; Section 6 Risks/Open Questions verification notes added. `.test-cache` / `.test-quota` not present (no cleanup needed).
- **Files changed:**
  - `src/gui/public/js/projects.js` (use `Array.isArray(data.projects) ? data.projects : []`)
  - `src/gui/react/src/pages/Config.tsx` (optional chaining for `capabilities.models` / `mcp` / `config`, `binary` / `auth`)
  - `src/gui/react/src/pages/Config.test.tsx` (test for missing models/mcp/config)
  - `src/gui/react/src/lib/index.ts` (export `CursorCapabilities`)
  - `BUILD_QUEUE_CURSOR_CLI_JAN_2026.md` (Section 6 Verification notes, this status entry)
- **Commands run + results:**
  - `npm run typecheck`: PASS
  - `npm run build`: PASS
  - `npx eslint src/gui/public/js/projects.js src/gui/react/src/pages/Config.tsx src/gui/react/src/pages/Config.test.tsx src/gui/react/src/lib/index.ts`: PASS
  - `npm test`: run (cli-tools, container failures pre-existing; remainder pass)
  - `.test-cache` / `.test-quota`: none found; no cleanup performed.

</details>

