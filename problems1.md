# problems1 - RWM Puppet Master gaps and improvements

Date: 2026-01-24

## Executive summary
RWM Puppet Master has strong core architecture and CLI coverage, but several end-to-end gaps could prevent reliable use across GUI + CLI and across platforms. The highest risks are (1) Copilot SDK dependency/installation wiring, (2) GUI config mismatches with schema (antigravity + budgets), and (3) critical GUI issues that block basic workflows. The platform setup story exists in docs, but authentication, model availability, and plan-mode behavior are not enforced or surfaced in product UX.

## Critical gaps (blockers)

### 1) Copilot SDK dependency and install wiring are incomplete
- Evidence: `src/platforms/copilot-sdk-runner.ts` dynamically imports `@github/copilot-sdk`, but `package.json` has no dependency entry.
- Evidence: Install manager defines a `copilot-sdk` install command, but doctor checks do not include a `copilot-sdk` check; it never triggers installation.
- Impact: Copilot platform can fail at runtime with missing module errors; users get no early warning.
- Fix: Add the dependency (or guard with a CLI fallback), add a doctor check for SDK presence, and update docs to explain SDK + CLI relationship.

### 2) GUI configuration exposes Antigravity and invalid schema fields
- Evidence: `src/types/config.ts` and `src/config/config-schema.ts` exclude `antigravity` from `Platform`, `cliPaths`, and budgets.
- Evidence: `src/gui/public/config.html` exposes antigravity in tier platform options, budget panels, and CLI paths.
- Impact: Saving config with antigravity will fail validation or produce invalid config; UI misleads users.
- Fix: Remove antigravity options from GUI config or reintroduce it into schema + registry consistently.

### 3) Critical GUI blockers remain open
- Evidence: `GUI_ISSUES_AND_FIXES.md` documents unresolved critical items (Projects loading, Wizard upload errors).
- Impact: Wizard and Projects flows can be unusable, preventing end-to-end usage through GUI.
- Fix: Resolve the remaining critical GUI issues and verify against the GUI spec.

## High gaps (operational risk)

### 4) Plan mode is only implemented for Cursor and is not exposed in GUI
- Evidence: `src/types/config.ts` defines `planMode` only for tiers; `src/platforms/cursor-runner.ts` implements plan-mode best-effort.
- Evidence: `src/platforms/gemini-runner.ts` always uses `--approval-mode yolo` (no plan mode support), and Copilot/Claude runners do not implement plan mode.
- Evidence: `src/gui/public/config.html` has no plan-mode controls.
- Impact: Plan-only workflows are inconsistent across platforms; users cannot configure plan mode in GUI.
- Fix: Implement plan-mode behavior for Claude/Copilot/Gemini (prompt-based or flags), and expose planMode in GUI.

### 5) Authentication readiness is not surfaced or is inaccurate
- Evidence: `src/platforms/auth-status.ts` only checks env vars for Codex/Claude and returns unknown for Gemini/Copilot.
- Evidence: Copilot/Gemini login flows are documented in `PROJECT_SETUP_GUIDE.md` but not integrated in product UX.
- Impact: Users can be blocked by missing login/trust prompts in non-interactive runs without clear guidance.
- Fix: Add explicit auth checks (CLI commands or files), surface login status in GUI/doctor output, and link to login instructions.

### 6) Model availability and enablement is not enforced
- Evidence: `src/platforms/gemini-models.ts` and `src/platforms/copilot-models.ts` provide suggested lists, but GUI uses free-form inputs.
- Evidence: Copilot CLI does not support `--model` (documented in `src/platforms/copilot-models.ts`), and model enablement is user-controlled.
- Impact: Users can select models that are unavailable, disabled, or unsupported by their subscription, leading to failures.
- Fix: Surface actual model lists (Gemini static + Copilot SDK listModels), warn about enablement and add validation.

## Medium gaps (quality and consistency)

### 7) GUI budget inputs do not normalize non-claude/codex/cursor fields
- Evidence: `src/gui/public/js/config.js` normalizes unlimited/number fields only for `claude`, `codex`, and `cursor` budgets.
- Impact: Gemini/Copilot budget fields can remain strings and fail validation.
- Fix: Extend normalization to all platforms in GUI config.

### 8) Copilot CLI install command mismatches docs
- Evidence: Install manager uses `npm install -g @github/copilot-cli`.
- Evidence: `PROJECT_SETUP_GUIDE.md` documents `npm install -g @github/copilot`.
- Impact: Users may install the wrong package and fail doctor checks.
- Fix: Align install commands with documented package names.

### 9) Antigravity references remain in GUI config but not in runtime
- Evidence: GUI config includes antigravity budget/paths; registry excludes antigravity.
- Impact: Users can configure a platform that cannot run.
- Fix: Remove from GUI or add runner + schema support.

### 10) Capability discovery is not exposed to users
- Evidence: `src/platforms/capability-discovery.ts` caches capabilities but there is no GUI surface to review them.
- Impact: Users do not know which platforms are healthy, authenticated, or feature-ready.
- Fix: Add a GUI/status panel exposing cached capability checks and auth readiness.

## Platform-specific notes (current state vs gaps)

### Cursor
- Plan mode is best-effort via `--mode=plan` with CLI help probing (`src/platforms/cursor-runner.ts`).
- No GUI toggle for plan mode; users cannot enable/disable it per tier.

### Codex
- Uses `codex exec --ask-for-approval never --sandbox workspace-write --json` (non-interactive).
- Auth check only uses `OPENAI_API_KEY`; Codex CLI login tokens are not detected.

### Claude
- Uses `claude -p` with model flag; no plan mode support.
- Auth check only uses `ANTHROPIC_API_KEY`; Claude CLI login tokens are not detected.

### Gemini
- Runner always uses `--approval-mode yolo` and does not support plan mode.
- Preview model requirements are documented in code but not surfaced to users.

### Copilot
- SDK runner is default (`src/platforms/registry.ts`) but SDK dependency is not in package.json.
- Model selection is possible via SDK config, but GUI uses static suggestions and cannot validate enablement.

## Cross-project comparison highlights (RalphInfo)

### Ralph (Amp)
- Uses `prd.json` + `progress.txt` as the only state; PRD conversion via skills.
- Improvement idea: Provide a minimal PRD-to-prd.json converter and a documented PRD format example.

### Ralphy
- Supports parallel worktrees + PRs, YAML task lists, and GitHub issue tasks.
- Improvement idea: Add parallel execution option and worktree isolation as optional modes.

### Ralph for Claude Code
- Dual-exit gate (completion indicators + explicit EXIT_SIGNAL), session continuity, rate limits, and strong test coverage.
- Improvement idea: Add explicit completion confirmation and robust exit gating.

### Ralph Playbook
- Explicit PLAN vs BUILD modes with different prompts; planning loop generates plan only.
- Improvement idea: Provide a dedicated plan-only mode in GUI/CLI (separate from start chain).

### Ralph for Cursor
- Token tracking with rotation, gutter detection, and guardrails logging.
- Improvement idea: Add token-based rotation and gutter detection signals to reduce stuck loops.

### Multi-Agent Ralph
- Multi-agent validation, auto checkpoints, health monitors, and ledger/handoff continuity.
- Improvement idea: Add validator roles and automated checkpoint/health monitoring.

### Zeroshot
- Planner/implementer/validator split with isolated environments and issue-provider support.
- Improvement idea: Add optional isolated validators and issue-provider ingestion.

## Recommended improvements (prioritized)

### P0-P1 (short-term)
1) Fix Copilot SDK dependency + doctor checks; document SDK/CLI requirements.
2) Remove antigravity from GUI config or reintroduce across schema/registry.
3) Resolve critical GUI issues (Projects loading, Wizard upload).
4) Add planMode controls in GUI + document plan behavior per platform.
5) Fix GUI budget normalization for gemini/copilot; align install command for Copilot CLI.

### P2 (mid-term)
1) Implement plan-mode fallback for Claude/Copilot/Gemini (prompt-based or flags).
2) Add model availability validation: Copilot listModels (SDK), Gemini preview warnings.
3) Add auth readiness checks for Gemini/Copilot + surface in GUI/doctor.
4) Add CLI quick reference and platform login/troubleshooting guide.

### P3 (long-term)
1) Add token-based rotation and gutter detection signals.
2) Add multi-agent validation or reviewer tier defaults (Zeroshot/Multi-Agent Ralph style).
3) Add plan-only loop mode (Playbook-style) with explicit prompts and gating.

