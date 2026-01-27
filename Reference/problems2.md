# problems2 — End-to-end readiness gaps (RWM Puppet Master)

> Scope: This document is **findings-only** (no fixes applied).  
> Goal: Identify **end-to-end blockers** and “we didn’t think about this” gaps across **CLI**, **GUI**, **platform runners**, **models/auth**, **quotas**, **plan mode**, and **installers**.  
> Evidence: Each issue cites relevant **file paths** and, where useful, the exact behavior implied by the code.

---

## Second-pass audit addendum (2026-01-24)

A deeper second pass found additional issues that should be treated as high confidence:

- **Quota checks can be a no-op in start-chain**: `checkQuota()` is treated as a boolean in `src/start-chain/requirements-inventory.ts`, so it never blocks.
- **Gates can pass incorrectly** when criteria arrays are empty; AGENTS.md enforcement errors are swallowed (`src/verification/gate-runner.ts`).
- **FreshSpawner path can misreport success and leak resources**: `BasePlatformRunner.execute()` assumes `exitCode = 0` for FreshSpawner, and `FreshSpawner`’s per-spawn cleanup hook is not invoked by the runner (`src/platforms/base-runner.ts`, `src/core/fresh-spawn.ts`).
- **Git operations swallow critical failures** (merge/push/PR creation) and branch state is not verified after `ensureBranch()` (`src/core/orchestrator.ts`).

These are now included below as P0/P1 findings.

---

## Executive summary (why end-to-end may not work today)

The project has the right *shape* (tiers, fresh processes, PRD/state files, verifiers, GUI control surface). However, there are several **P0 blockers** that can cause:

- **Crash-on-start** instead of controlled pausing/escalation when no platform is available.
- **False readiness**: capability discovery doesn’t actually discover models or real quotas, and auth readiness is incomplete for some platforms.
- **Start-chain surprises**: hardcoded platform/model fallbacks and missing plan-mode propagation can derail PRD generation before orchestration even starts.
- **GUI spec drift + missing endpoints**: the GUI works for some flows, but it doesn’t implement several spec-required endpoints and is **not secure** (no auth, permissive CORS).
- **Installers** can install successfully but still leave the user unable to run (PATH issues, macOS postinstall path mismatch, missing prereq checks).

If you want confidence “it works end-to-end”, the project needs a **deterministic preflight** (capabilities/auth/models/quota) that blocks execution until it’s safe, plus GUI API parity and installer correctness.

---

## P0 — Critical blockers (likely to break real runs)

### 1) Orchestrator does not enforce “validateReadyForExecution” before start

- **Spec says MUST**: `ARCHITECTURE.md` explicitly states Orchestrator MUST call `validateReadyForExecution()` before starting execution.
- **Observed code path**:
  - `src/core/orchestrator.ts`: `start()` transitions to executing then calls `runLoop()` **without capability validation**.
  - `src/cli/commands/start.ts`: does `orchestrator.initialize()` then `orchestrator.start()`; only checks PRD exists.

**Why it matters:** You can start a run with missing/unrunnable CLIs, missing auth, stale capability data, etc., and discover the failures mid-loop.

**Evidence:**
- `ARCHITECTURE.md` “Orchestrator Integration” (validateReadyForExecution example).
- `src/core/orchestrator.ts` (`start()`).
- `src/cli/commands/start.ts` (only PRD file existence check + no doctor/capability enforcement).

---

### 2) PlatformRouter can throw “NoPlatformAvailableError” and crash the loop

- `src/core/platform-router.ts` throws `NoPlatformAvailableError` when preferred platform + fallbacks aren’t registered.
- The orchestration loop selects a platform per tier. The end-to-end audit found this error isn’t handled as a controlled failure (pause/escalate), so the orchestrator can **crash**.

**Evidence:**
- `src/core/platform-router.ts` (`NoPlatformAvailableError`, `getFallback()` throws).
- `src/core/orchestrator.ts` (platform selection is not guarded with a specific catch for “no platform available”).

**User-facing symptom:** `puppet-master start` can hard-exit with a generic error instead of telling you “run doctor / install tools / authenticate”.

---

### 3) Start-chain has hardcoded platform/model defaults (can silently choose the wrong platform)

`src/start-chain/requirements-inventory.ts` uses hardcoded fallbacks if config is missing:

- Platform fallback: `'cursor'`
- Model fallback: `'claude-sonnet-4-20250514'`

**Why it matters:** This can cause immediate failures when:
- user doesn’t have Cursor CLI installed,
- model string is invalid for the selected platform,
- user expected e.g. Claude or Gemini for inventory but got Cursor.

**Evidence:**
- `src/start-chain/requirements-inventory.ts` (AI refinement path chooses platform/model with hardcoded fallbacks).

---

### 4) Capability discovery does not actually populate “available models” or real quota data

`GUI_SPEC.md` expects discovery-populated model lists and staleness gating for capabilities. The current `CapabilityDiscoveryService`:

- probes `--version` / `--help` only,
- derives coarse booleans by substring matching help output,
- sets quota info to huge defaults,
- does **not** discover per-platform available models.

**Why it matters:** The system cannot reliably say “you can run model X on platform Y” or show accurate budgets in the GUI.

**Evidence:**
- `src/platforms/capability-discovery.ts` (parse help output; default quota info).
- `GUI_SPEC.md` (capabilities screen requires available models and discovery artifacts).
- `ARCHITECTURE.md` stresses discovery-driven truth and staleness gating.

---

### 5) GUI is not safe to run outside localhost (no auth + permissive CORS)

The GUI exposes start/stop/replan/config endpoints and evidence/project file access **without authentication**. CORS allows a wide range of localhost, dev ports, and local-network IPs.

**Why it matters:** If a user binds GUI to a non-local interface or has local-network access, it becomes an **unauthenticated remote control panel**.

**Evidence:**
- `src/gui/server.ts` (CORS origin logic allows local IP ranges + dev ports).
- GUI routes are registered without auth middleware (entire `src/gui/routes/*`).

---

### 6) Evidence file serving path validation is fragile

`src/gui/routes/evidence.ts` builds a path using `decodeURIComponent(name)` inside `resolve(join(baseDir, subdir, ...))` then checks `startsWith(evidenceDir)`.

**Why it matters:** Path normalization/decoding edge cases can lead to traversal vulnerabilities or false negatives.

**Evidence:**
- `src/gui/routes/evidence.ts` (construct file path with `decodeURIComponent`, `resolve`, then prefix-check).

---

### 7) Installer correctness issues can prevent running the app even after “successful install”

From the installer audit:

- **macOS**: postinstall expects a different path than what `pkgbuild` stages/installs.
- **Windows**: PATH updates may not take effect until restart; launcher path quoting can break in paths with spaces.
- **All platforms**: installers do not validate prerequisites (external CLIs), so users “install Puppet Master” but still can’t run any platform.

**Evidence:**
- `scripts/build-installer.ts` (staging layout + launchers, GUI assets copy).
- `installer/mac/scripts/postinstall`
- `installer/win/puppet-master.nsi`
- `installer/linux/nfpm.yaml`

---

### 8) Start-chain quota check is ineffective (quota never blocks)

In `src/start-chain/requirements-inventory.ts`, quota is checked like this:

- `const hasQuota = await this.quotaManager.checkQuota(platform);`
- `if (!hasQuota) { ... }`

But `checkQuota()` returns a **QuotaInfo object**, not a boolean. Objects are always truthy, so this condition never triggers and start-chain will proceed even when quota is exhausted (until later failures occur).

**Evidence:**
- `src/start-chain/requirements-inventory.ts` (quota “boolean” check).
- `src/platforms/quota-manager.ts` (`checkQuota()` returns `QuotaInfo` / throws on hard limit).

**User-facing symptom:** PRD/start-chain steps can keep calling a platform when the config intends to stop or fallback on quota exhaustion.

---

### 9) Verification gates can pass incorrectly (empty criteria + enforcement error swallowing)

There are two correctness hazards in `src/verification/gate-runner.ts`:

- **Empty criteria arrays pass**: `aggregateResults()` computes `overallPassed = results.every((r) => r.passed)`. When `results` is empty, `.every(...)` returns `true`, so a gate with no criteria is reported as passed.\n- **AGENTS.md enforcement errors are swallowed**: if enforcement throws, it logs but does not fail the gate (`catch` logs “Error running AGENTS.md enforcement” and continues). If the report was otherwise passing, the gate remains passing.

**Evidence:**
- `src/verification/gate-runner.ts`:\n  - `aggregateResults()` uses `results.every(...)`.\n  - `runGate()` catches enforcement errors and explicitly “don’t fail the gate”.

**User-facing symptom:** Misconfigured/empty acceptance criteria or enforcement failures can allow the system to advance when it should stop.

---

### 10) FreshSpawner path can misreport exit status and leak resources

When `FreshSpawner` is used:

- `BasePlatformRunner.execute()` sets `exitCode = 0` after streams complete, with a comment noting it’s a placeholder. This can misreport failures as successes.\n- `FreshSpawner.spawn()` returns a `SpawnResult` with a `cleanup()` method (`cleanupAfterSpawn(pid)`), but the runner path that uses `FreshSpawner` does not retain or call that per-spawn cleanup hook. This risks leaving entries in `FreshSpawner.runningByPid`, leaving timers/temp context files around, and potentially leaving processes unmanaged.

**Evidence:**
- `src/platforms/base-runner.ts` (FreshSpawner execution path assumes `exitCode = 0`).\n- `src/core/fresh-spawn.ts` (`SpawnResult.cleanup: async () => this.cleanupAfterSpawn(processId)`; tracked in `runningByPid`).

**User-facing symptom:** “It passed” when the underlying process actually failed; accumulating resource leaks across many iterations.

---

## P1 — High priority gaps (likely to cause user confusion or silent failure)

### A) Authentication readiness is incomplete (Gemini/Copilot “unknown”)

`src/platforms/auth-status.ts` only implements checks for:
- `codex` via `OPENAI_API_KEY`
- `claude` via `ANTHROPIC_API_KEY`
- `cursor` is “skipped”
- everything else returns “unknown”

Doctor checks can treat “unknown” as non-blocking, which can create **false confidence**.

**Evidence:**
- `src/platforms/auth-status.ts`
- `src/doctor/checks/cli-tools.ts` (Gemini/Copilot checks call auth status but “unknown” isn’t a hard failure)

**Platform reality (Context7-backed):**
- Copilot: authenticate via `copilot` then `/login`, or PAT via `GH_TOKEN`/`GITHUB_TOKEN` with **Copilot Requests** permission.
- Gemini: OAuth interactive or `GEMINI_API_KEY` for headless.

---

### B) Plan mode semantics are inconsistent across platforms

Current behavior:
- `TierConfig.planMode` is documented as “Cursor-only” in config types.
- `CursorRunner` best-effort uses `--mode=plan` if `--help` suggests it exists; otherwise prompt preamble “PLAN FIRST, THEN EXECUTE”.
- `GeminiRunner` hardcodes `--approval-mode yolo`, which is the opposite of a true read-only “plan mode”.
- Start-chain components generally don’t pass `planMode` at all (so even Cursor plan-mode won’t be used during PRD generation steps).

**Evidence:**
- `src/types/config.ts` (planMode docs).
- `src/platforms/cursor-runner.ts` (plan mode detection + fallback).
- `src/platforms/gemini-runner.ts` (always `--approval-mode yolo`).
- Start-chain audit: `src/start-chain/*` doesn’t pass planMode through.

---

### C) Model selection “truth” is platform-dependent and not consistently enforced

This project currently treats `model` as a free-form string in config and passes it through to runners, but **the reality differs per platform**:

- **Cursor/Codex/Claude/Gemini**: accept a model flag, but available models depend on the local tool/version/account and are not discovered.
- **Copilot**:
  - CLI interactive selection is done via `/model` (Context7-backed).
  - Programmatic model selection via CLI flags is not reliable/official.
  - This repo includes **both**:
    - legacy CLI runner (`src/platforms/copilot-runner.ts`, deprecated), and
    - SDK runner (`src/platforms/copilot-sdk-runner.ts`) that supports `listModels()` and session model config.

**Key risk:** the registry currently registers the SDK runner and then type-casts it into a `BasePlatformRunner` slot (see `src/platforms/registry.ts`). If `@github/copilot-sdk` isn’t installed, the dynamic import will fail at runtime, and the user won’t learn that until the first Copilot execution (unless doctor is run and fails loudly).

**Evidence:**
- `src/platforms/copilot-models.ts` (documents `/model` as source of truth and that availability depends on plan/region/policies).
- `src/platforms/copilot-sdk-runner.ts` (dynamic import `@github/copilot-sdk`, calls `listModels()`).
- `src/platforms/registry.ts` (registers Copilot SDK runner as the platform runner).
- `package.json` (does not list `@github/copilot-sdk` as a dependency).
- `src/doctor/checks/cli-tools.ts` (`CopilotSdkCheck` recommends installing SDK and using `copilot /login`).

---

### D) Quotas/limits tracking is not aligned with real platform quota models

What the system enforces today:
- `QuotaManager` enforces max **calls** per run/hour/day per platform (with optional cooldown hours).
- Tokens are tracked as a best-effort number, but the budget logic is call-based, not cost-based.

Where the mismatch shows up:
- **Copilot** uses **premium request multipliers** by model and model availability is controlled by subscription tier + org/enterprise policy + region (Context7-backed).
- **Gemini**/Claude/Codex may have token-based billing/limits, but the local CLI does not necessarily expose consistent machine-readable “quota remaining”.

**Why it matters:** The GUI spec shows budgets/usage per platform and implies meaningful quota enforcement; without a consistent unit, users won’t trust the “budget remaining” numbers.

**Evidence:**
- `src/platforms/quota-manager.ts` (call-count budgets).
- `src/memory/usage-tracker.ts` (usage log; tokens may be partial/estimated depending on platform).
- Context7: Copilot premium request multipliers and model availability are plan/policy dependent.

---

### E) “Completion signal” is required; lack of signal can be a false-negative failure

The execution system is built around strict completion signals (`<ralph>COMPLETE</ralph>` / `<ralph>GUTTER</ralph>`). For example, the iteration engine derives success from the marker, not from whether files changed or tests passed.

**Why it matters:** A model can do real work but omit the marker → iteration treated as failed, and the system may kill the process or retry/escalate unnecessarily. This is “by design” for deterministic exit, but it’s a key operational gotcha.

**Evidence:**
- `src/core/execution-engine.ts` (extracts completion signal from output and uses it to compute `success`).
- Platform output parsers in `src/platforms/output-parsers/` are built around the same markers.

---

### F) Git operations swallow failures (merge/push/PR) and branch state isn’t verified

There are multiple places in `src/core/orchestrator.ts` where critical git steps are wrapped in `try/catch` and only logged via `console.warn`, while execution continues:

- Merge failures: `console.warn('Failed to merge branch:', error);`\n- Push failures: `console.warn('Failed to push:', error);`\n- PR creation failures: `console.warn('Failed to create PR:', error);`

Also, the loop calls `branchStrategy.ensureBranch(...)` before iteration execution, but does not verify that the repo is actually on the expected branch afterwards.

**Evidence:**
- `src/core/orchestrator.ts`:\n  - `ensureBranch(...)` before execution.\n  - merge/push/PR warnings around advancement/gates.\n- `src/git/branch-strategy.ts` (branch creation/checkout logic; no guaranteed post-condition checks from the orchestrator side).

**User-facing symptom:** Work can be produced on the wrong branch, not pushed, not merged, or never PR’d—without failing the run.

---

## P2 — Medium priority gaps (won’t always break, but will degrade outcomes)

### 1) Start-chain expects JSON from models without validating the platform/output mode

Some start-chain steps parse AI output as JSON (or JSON inside markdown fences) but do not validate that the selected platform/model will actually emit JSON (or the CLI flag is enabled).

**Evidence:**
- `src/start-chain/requirements-inventory.ts` (`parseAIResponse()` tries to parse JSON, with fallback regex extraction).
- Start-chain audit calls out similar patterns across PRD/arch/interview steps.

---

### 2) Start-chain doesn’t pass plan-mode intent through to runners

Even if a user configures plan mode, start-chain doesn’t reliably propagate `planMode` to `ExecutionRequest`. This can create inconsistent behavior between “PRD generation” and “execution tiers”.

**Evidence:**
- Start-chain audit (e.g., `prd-generator`, `arch-generator`, `requirements-interviewer`).

---

### 3) GUI endpoint parity vs `GUI_SPEC.md` is incomplete (spec drift)

The GUI implementation is functional, but it does not match several `GUI_SPEC.md` endpoint contracts, and some endpoints are stubs.

Examples:
- `/api/status` returns a hardcoded `'idle'` (not actual orchestrator state).
- Controls are under `/api/controls/*` (spec suggests `/api/start`, `/api/pause`, etc.).
- Spec-required endpoints are missing for phases/tasks/subtasks, capabilities, budgets, logs, and richer AGENTS.md APIs.

**Evidence:**
- `src/gui/server.ts` (`/api/status` returns fixed `'idle'` state).
- `src/gui/routes/controls.ts` (uses `/api/controls/...`).
- `src/gui/routes/state.ts` (`GET /api/agents` returns concatenated content; spec expects list + per-file endpoints).
- `GUI_SPEC.md` (endpoint list and screen requirements for `/capabilities`, `/budgets`, `/memory`, `/logs`).

---

### 4) Project path handling in GUI routes can allow unintended filesystem access

Routes that accept arbitrary paths (projects/evidence) must enforce allowed roots robustly, especially if GUI is accessed remotely.

**Evidence:**
- GUI audit flagged `src/gui/routes/projects.ts` and `src/gui/routes/evidence.ts` as needing stricter path validation/normalization.

---

## P3 — Low priority / polish gaps

- Installer UX: better “what to do next” guidance (run doctor, login steps, model enablement).
- Better OS-specific troubleshooting in docs (PATH reload, credential locations, etc.).
- Spec alignment decision for GUI tech stack (React/Tailwind in spec vs vanilla JS in implementation).
- Type-safety masking in a few places: `as unknown as BasePlatformRunner` appears in multiple tests and `src/platforms/registry.ts`, which can hide real interface mismatches until runtime.

---

## Platform-specific setup “reality check” (what users actually must do)

### GitHub Copilot

- **Login**: run `copilot` (interactive) then `/login`, or use a PAT via `GH_TOKEN` / `GITHUB_TOKEN` with **Copilot Requests** permission.
- **Choose models**: `/model` inside Copilot; available models depend on subscription tier/region and org/enterprise policies.
- **Quotas**: premium request multipliers vary by model; admins can restrict features/models via policy.

**Evidence:** Context7 (`/github/copilot-cli`, `/websites/github_en_copilot`) and this repo’s `src/platforms/copilot-models.ts`.

### Gemini

- **Auth**: OAuth interactive or `GEMINI_API_KEY` for headless; Vertex AI via service account/ADC.
- **Plan mode**: true read-only “plan mode” is `--approval-mode plan` and requires `experimental.plan: true` (REQUIREMENTS.md documents this).

**Evidence:** `REQUIREMENTS.md` Gemini section; `src/platforms/gemini-runner.ts` shows current headless invocation choices.

### Cursor / Codex / Claude Code

- **Auth** varies (Cursor handled by app; Codex/Claude often via API keys in env).
- **Models**: model strings must match each tool’s supported names; the project currently does not validate them preflight.

---

## RalphInfo comparison: proven patterns present elsewhere but missing/partial here

`RalphInfo/` contains multiple reference implementations. Common patterns that those repos emphasize (and that Puppet Master only partially covers) include:

- **Strict planning/build separation** (plan stage cannot mutate; build stage can).
- **Token-aware context rotation** (warn/rotate around thresholds to avoid performance collapse).
- **More robust stagnation detection** (beyond identical output) including “no file changes” or repeated failing checks.
- **Security hardening** (path validation, sandboxing recommendations; avoiding “YOLO” modes by default).
- **Licensing awareness**: vendored repos often lack clear licensing—use for inspiration, not copy/paste.

**Evidence:** `RalphInfo/RalphReview.md` plus the audited `RalphInfo/*` repositories.

---

## Suggested next steps (concrete actions to make it truly end-to-end)

### P0 next steps (make runs safe)

1. Add a **hard preflight gate** before `orchestrator.start()`:\n   - require doctor/capability discovery,\n   - block on unrunnable required platforms,\n   - block on stale capabilities,\n   - surface clear remediation steps.\n\n2. Make platform routing failures **non-crashing**:\n   - handle `NoPlatformAvailableError` as a first-class failure (pause/escalate).\n\n3. Remove hardcoded platform/model fallbacks in start-chain; require explicit config or safe defaults per platform.

### P1 next steps (make setup predictable)

4. Implement “platform readiness” that includes:\n   - auth readiness per platform (best-effort, no billable calls),\n   - model availability checks where possible (Copilot via SDK `listModels()`),\n   - clear docs for login and model enablement.\n\n5. Decide and document what “plan mode” means across platforms (Cursor/Gemini/Copilot/Claude/Codex) and enforce it consistently.

### GUI / installer next steps (make it safe + shippable)

6. Add GUI auth + tighten CORS + validate filesystem paths.\n7. Close the gap between `GUI_SPEC.md` and actual endpoints (or update spec to match current implementation).\n8. Fix macOS installer path mismatch and improve Windows PATH and quoting behavior; add explicit “run doctor next” guidance post-install.

---

## Sanity checks performed for this report

- `.test-cache` and `.test-quota` were searched for and **not found** in the repo.

