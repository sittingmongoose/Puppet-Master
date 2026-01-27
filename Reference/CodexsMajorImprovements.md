# Codex’s Major Improvements (Architect Review)

**Project:** RWM Puppet Master (`/mnt/user/Cursor/RWM Puppet Master`)  
**Author:** Codex (Architect Reviewer)  
**Date:** 2026-01-20  
**Scope:** End-to-end viability review with focus on Start Chain (requirements → PRD), acceptance criteria quality, “no manual tests” enforcement, and multi-platform CLI orchestration (Cursor/Codex/Claude Code).  

## Executive Summary

Your concerns are justified. In its current state, the project is **not reliably executable end-to-end** for large requirements documents, and several core parts of the Ralph Wiggum loop are either **stubbed**, **internally inconsistent**, or **architecturally drifted** from the project’s own canonical specs (`REQUIREMENTS.md`, `STATE_FILES.md`, `ARCHITECTURE.md`).

The “fundamentally won’t work” risk is not theoretical: there are multiple **P0 failures** where the system can generate a PRD that cannot be gated, cannot be executed, or cannot be trusted for coverage.

## What Must Be True (Non‑Negotiables) for This to Work at Large Scale

To scale RWM to “complete platforms” (not just small features), the system must guarantee:

1. **Requirements coverage:** the Start Chain must not silently drop 80% of the input doc. Missing requirements must be *detected*, *reported*, and *fixed automatically* (or the pipeline must hard‑fail).
2. **Objective verification only:** acceptance criteria and verification steps must be **machine-checkable**. If the user will not test, then “manual” criteria are functionally “no criteria”.
3. **Schema & verifier alignment:** PRD schema, TypeScript types, prompt schemas, and verifier registry must agree; otherwise gating becomes arbitrary or impossible.
4. **Deterministic orchestration behavior:** process spawning, prompt construction, stop conditions, transcripts, and timeouts must be correct and consistent across platforms.
5. **Consistency under iteration:** PRD/task/subtask structure must be stable and incremental across iterations (traceability, dedupe, no drift).

## P0 (Critical) Issues That Block Viability

### P0.1 Start Chain parsing is structurally capable of “1 top-level section” even when the doc is huge

**Likely root cause of your observed symptom (“only 1 section”):**
- Many requirements docs have **one H1 title**, with the *real* structure in H2/H3 headings.
- The current markdown parser builds a tree correctly, but the downstream PRD mapping treats **top-level sections as phases** (`PrdGenerator.generatePhases(sections)`), so a “single H1 doc title” becomes “one phase”.
- If the UI only surfaces top-level sections, it will look like “only 1 section was parsed”.

**Where this happens:**
- `src/start-chain/parsers/markdown-parser.ts` (heading parsing behavior)
- `src/start-chain/prd-generator.ts` (`generatePhases` uses top-level sections as phases)
- GUI path: `src/gui/routes/wizard.ts` currently uses **rule-based PRD generation** (see P0.2), which amplifies this effect.

**Required improvement: add a normalization layer between parsing and PRD generation**
- Treat the *first H1* as **document title**, not a “phase”.
- Promote H2 sections to phases when the doc shape is: `H1(title) -> H2(major sections)`.
- Add a “structure detection” step:
  - Detect dominant heading level distribution.
  - Choose phase/task mapping accordingly (configurable).

**Fail-fast checks (must be automated):**
- If `rawText.length` is large but `sections.length <= 1`, emit a **hard error** unless the section has meaningful children.
- If parser output is “Content” (docx/text fallback), compute **coverage heuristics** (e.g., number of extracted headings, number of list items, presence of repeated patterns) and require a minimum.
- Explicitly forbid silent truncation in “fallback” generation paths:
  - The rule-based PRD generator currently drops content beyond caps (`maxTasksPerPhase` / `maxSubtasksPerTask`) via `.slice(...)` in `src/start-chain/prd-generator.ts`. For large docs this can look like “it only parsed a few lines”, but it is actually **discarding requirements**.
  - PDF parsing can yield **zero sections** if headings aren’t detected (`src/start-chain/parsers/pdf-parser.ts`), which makes Start Chain either fail validation or generate a near-empty PRD. Ensure every parser can at least emit a single “Content” section + coverage warnings.

---

### P0.2 “No manual tests” is currently violated by default PRD generation paths

You explicitly require: **NO MANUAL TESTS** (user will not test). Today, the system generates PRDs where acceptance criteria are **typed as manual** and test plans are **empty** by default.

**Concrete places:**
- `src/start-chain/prd-generator.ts`:
  - `extractAcceptanceCriteria(...)` sets `type: 'manual'` for every extracted bullet/number.
  - `createTestPlan(...)` returns `{ commands: [], failFast: true }` always.
- `src/gui/routes/wizard.ts`:
  - `/wizard/generate` forces `generateWithAI(parsed, false)` (rule-based) because AI dependencies are not wired into GUI flow.

**Why this is a hard blocker:**
- Gate execution uses the verifier registry; there is **no `manual` verifier registered** (`src/core/container.ts` registers regex/file_exists/command/browser_verify/ai only).
- `src/verification/verification-integration.ts` feeds acceptance criteria directly into the gate runner.
- Result: “manual criteria” either (a) fail every gate, or (b) must be ignored (which means gates have no objective checks).

**Required improvement: “manual” must become illegal in generated PRDs for this project’s intended operating mode**
- Add a Start Chain validation rule: **error if any `Criterion.type === 'manual'`**.
- Add a PRD quality gate requirement: every Subtask must include at least:
  - One automated verifier criterion (`regex`, `file_exists`, `command`, `browser_verify`, or `ai_verify`), and
  - A non-empty `testPlan.commands` where applicable (repo-language detection + config).

**Strategic recommendation: stop pretending rule-based PRD generation is acceptable**
- For large-scale platform builds, rule-based generation should be:
  - Either removed, or
  - Restricted to “preview only” mode with a huge warning and a hard stop before execution.

---

### P0.3 Orchestration loop has internal inconsistencies that can hang or produce unusable iterations

There are serious issues in how prompts are built, output is captured, and results are recorded.

**Examples:**
- Prompt construction:
  - Orchestrator constructs `IterationContext`, but `ExecutionEngine.buildPrompt()` currently does **not** include a clear assignment, acceptance criteria, or required test commands (it mostly dumps context + plan).
  - A more complete `PromptBuilder` exists (`src/core/prompt-builder.ts`) but is **not used** by `ExecutionEngine.spawnIteration()`.
- Output capture / transcript risk:
  - `ExecutionEngine` consumes `runner.captureStdout/captureStderr` and then later calls `runner.getTranscript(processId)`.
  - `BasePlatformRunner.getTranscript()` calls `captureStdout/captureStderr` again, which attach new listeners. If the stream has already ended before listeners attach, this pattern can **stall indefinitely** (no future `end` event).
- Progress & git commits:
  - `recordProgress()` relies on `IterationResult.learnings` / `filesChanged`, but `ExecutionEngine` currently sets these to empty arrays; it never integrates `OutputParser` results into `IterationResult`.
  - `commitChanges()` depends on `filesChanged`; so commits can silently never occur even when changes exist.
- Iteration persistence:
  - PRD subtasks have an `iterations[]` array (`src/types/prd.ts`), but the orchestrator loop does not append structured iteration records (attempt number, output, tests run, etc.).
  - `TierNode.data.iterations` is derived from `prd.subtask.iterations.length` (`src/core/tier-node.ts`), so “iteration count” can reset on reload even if attempts occurred.

**Required improvement: unify the iteration contract**
- One canonical iteration prompt builder used by orchestrator execution (and used across platforms).
- One canonical output parsing step that populates:
  - completion signal,
  - files changed (prefer git diff-based detection, not regex on output),
  - tests run + results (from actual executed commands, not guessed),
  - errors/warnings.
- One canonical transcript capture mechanism:
  - Capture stdout/stderr once; don’t “re-consume” streams after consumption.

---

### P0.4 Spec/schema drift: canonical docs, prompt schemas, TypeScript types, and verifiers disagree

Your own canonical schema in `STATE_FILES.md` defines many criterion types (`test`, `cli_verify`, `perf_verify`, `ai_verify`, etc.). The prompt schema in `src/start-chain/prompts/prd-prompt.ts` also asks models to output those types.

But the runtime TypeScript type union in `src/types/tiers.ts` only allows:
- `'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai'`

**This drift guarantees inconsistency:**
- AI can output “valid per prompt/spec” PRD JSON that your runtime code cannot correctly interpret.
- Verifier registry does not implement the full taxonomy described in `STATE_FILES.md`.

**Required improvement: declare one source of truth and make everything match it**
- Option A (recommended): Implement and support the expanded criterion taxonomy in code (or provide a deterministic mapping layer, e.g., `cli_verify` → `command` with standard options).
- Option B: Simplify the canonical spec to what you actually implement (but your requirements say the opposite—more robust verification).

Either way, **do not ship with divergent schemas**. It will create “it sometimes works” behavior and destroy trust.

---

### P0.5 No real installers yet, and “Doctor Fix” is host‑side (not client‑side)

Your intuition here is correct: for “real users”, you need **actual installers** (exe/dmg/deb/etc) and a clear “run locally to fix locally” story.

**Current reality:**
- Repo-based install exists (`README.md`, `scripts/install.sh`, `scripts/install.ps1`), but there are **no real installers** (signed `.msi`/`.exe`, notarized `.pkg`/`.dmg`, Linux packages).
- The existing `puppet-master install` command is **not an installer for Puppet Master itself**; it installs *other* dependencies (Cursor/Codex/Claude CLIs) **after** Puppet Master is already runnable.
- The GUI “Doctor → FIX” feature runs installation commands on the **machine hosting the GUI server**. If the GUI is running remotely, FIX installs on the remote host, not the browser client machine.
- “Doctor FIX” commands are not OS-complete:
  - Cursor install is Unix-only (`curl https://cursor.com/install -fsSL | bash`) and has no Windows path (`src/doctor/installation-manager.ts`).
  - There is no Playwright/browser dependency check or install path, but verifiers depend on it (Playwright requires browser downloads and OS deps; today nothing runs `playwright install`).

**Glaring onboarding issues (break “quickstart” trust):**
- `puppet-master init` writes `.puppet-master/prd.json` as `{}` (invalid for `PrdManager.load()` which requires `phases[]`), so commands that load PRD can fail until `puppet-master plan` overwrites it.
- `puppet-master init` overwrites `AGENTS.md` and `progress.txt` unconditionally (risking data loss in existing repos).
- Doctor “Project Directory” fix is circular in common setups:
  - The fix command is `puppet-master init` (`src/doctor/installation-manager.ts`). If the user launched the GUI via `npm run gui` / `tsx` (or otherwise without installing `puppet-master` onto PATH), the fix action will fail even though the code is present locally.
  - Fixes should call internal functions (or invoke the currently-running executable path), not depend on global PATH state.

**Required strategic improvements (what you asked for):**
- Ship real installers:
  - Windows: signed `.msi` or `.exe` that puts `puppet-master` on PATH.
  - macOS: signed/notarized `.pkg`/`.dmg` (or an app bundle if you choose a desktop launcher approach).
  - Linux: `.deb`/`.rpm` and/or AppImage + tarball fallback.
- Pick a packaging strategy and standardize it in CI releases:
  - **Single-binary** route (ship Node runtime): evaluate `pkg`, `nexe`, or `bun build --compile` (watch for ESM/asset bundling constraints).
  - **Installer installs Node + npm package** route: simpler, but you must manage PATH + permissions cleanly.
- **Recommendation (for this codebase): choose the installer route**, ideally shipping an **embedded Node runtime + app directory** (so users don’t need preinstalled Node) rather than a true “single binary”.
  - Why: this repo is ESM + serves static GUI assets + uses Playwright; single-binary bundlers tend to be brittle with ESM resolution, asset paths, and Playwright/browser downloads. An installer-based runtime gives you deterministic Node versioning and far fewer “it works on my machine” failures.
  - Your “Doctor FIX” story becomes coherent only when the user can install/run the GUI locally in a click (installer launches GUI; fix buttons run locally).
- Make project roots deterministic (installer/GUI critical):
  - Today, many paths resolve relative to `process.cwd()` (config discovery, `.puppet-master/*`, `AGENTS.md`, `progress.txt`). A packaged app won’t start in the user’s project directory by default.
  - Resolve config + all memory/evidence paths relative to the active project root (or config file directory) so “Open Project” + “Doctor Fix” operate on the intended machine and filesystem.
- Make Doctor “FIX” safe + OS-native:
  - Prefer brew/winget/choco/apt where possible; avoid opaque `curl | bash` as the default path.
  - Always show the exact command + output in GUI; handle elevation and common permission failures (npm global prefix).
  - Detect and warn when GUI is not running locally (so users don’t expect client-side fixes).
- Fix init/runbook correctness:
  - `init` must create a schema-valid empty PRD scaffold and must not clobber existing `AGENTS.md`/`progress.txt` without explicit consent.

---

### P0.6 GUI is not wired to the real Start Chain (and many GUI features won’t work reliably)

You explicitly want: **wire AI Start Chain fully**. Today the GUI is structurally unable to do that reliably due to wiring and event-contract issues.

**Critical wiring problems:**
- **Wizard does not actually run Start Chain Pipeline**:
  - `/api/wizard/save` can run `StartChainPipeline` *only if `parsed` requirements are provided*, but the browser client currently posts only `{ prd, architecture, tierPlan, projectPath }` (no `parsed`), so the pipeline never runs.
  - Result: users think they’re running an AI start chain, but they are only saving the (often low-quality) preview artifacts.
- **Wizard is effectively “preview-only” even when Start Chain deps exist:**
  - `/api/wizard/generate` explicitly disables AI and wires `platformRegistry`/`quotaManager` as `undefined` (“not available in GUI context”), so the wizard cannot generate AI artifacts today (`src/gui/routes/wizard.ts`).
  - The frontend `savePrd()` call does not include `parsed`, then waits for WebSocket `start_chain_complete` and falls back after 30s—this reads like “Start Chain running in background” but is just “save the preview artifacts” (`src/gui/public/js/wizard.js`, `src/gui/routes/wizard.ts`).
- **`npm run gui` starts a non-functional server by default:**
  - `src/gui/start-gui.ts` starts `GuiServer` without registering orchestrator/state/start-chain dependencies. Combined with the “router re-registration” bug below, Controls/Projects/History and AI Start Chain are effectively dead-on-arrival for most users.
- **Controls include “reset” but it isn’t implemented:**
  - `/api/controls/reset` returns `{ success: true }` without resetting the orchestrator or state machine. The GUI presents controls that do not match backend behavior (`src/gui/routes/controls.ts`).
- **Dependency “re-registration” doesn’t override existing routes** (Express ordering):
  - `GuiServer.setupRoutesSync()` registers “null dependency” routers first (controls/projects/wizard/history).
  - Later calls like `registerOrchestratorInstance()` and `registerStartChainDependencies()` add new routers, but the original routers still match first and terminate the request.
  - Result: controls can stay 503 and wizard can stay “no-AI” even when you “registered” the orchestrator/platform registry.
- **WebSocket event names don’t match what the frontend listens for**:
  - Backend emits `state_changed`, `output_chunk`, `iteration_started`, `iteration_completed` (see `src/logging/event-bus.ts` and `src/core/orchestrator.ts`).
  - Frontend dashboard/tiers code listens for `state_change`, `output`, `iteration_start`, etc. (see `src/gui/public/js/dashboard.js` and `src/gui/public/js/tiers.js`).
  - Result: the GUI may appear “stuck” (no updates) even though events are flowing.
- **“Projects” is not a real project switch today (high risk of writing to the wrong project):**
  - `src/gui/routes/projects.ts` loads config via raw `yaml.load(...)` (no snake_case→camelCase conversion), and then calls `orchestrator.loadProject({ prd, config })`.
  - `Orchestrator.loadProject(...)` only saves the provided PRD using the orchestrator’s *existing* `PrdManager` path and does not re-bind config/memory/evidence paths. It does not actually “switch” the running instance to the selected project.
  - Net: project switching is unreliable and can overwrite the wrong `.puppet-master/prd.json`. Decide: “one GUI server per project” (simpler) vs true multi-project support (requires per-project container/orchestrator instances).
- **Large requirements docs are not reliably handled in the GUI today:**
  - Wizard “Preview” only renders `parsed.sections` and ignores nested children, so a doc shaped like `H1(title) → H2(major sections)` can look like “only 1 section parsed” even when the parser captured structure.
  - File upload base64 encoding uses a spread into `String.fromCharCode(...Uint8Array)` (`src/gui/public/js/wizard.js`), which will throw or corrupt for large files; server JSON body size is also capped (50mb) (`src/gui/server.ts`). For “big requirements” use cases, you need streaming/multipart upload (or chunked base64) + explicit size/coverage reporting.

**Required improvement (for “AI Start Chain fully wired”):**
- Replace the “register a second router later” pattern with one router whose handlers read from a mutable dependency holder (or middleware that injects the current orchestrator/platform registry at request time).
- Make the wizard a true pipeline:
  - Step 1 upload → store parsed in session/state.
  - Step 2 show parsed + coverage report.
  - Step 3 run AI PRD/arch generation (stream progress + optionally stream partial artifacts).
  - Step 4 validate → save exact reviewed artifacts (do not regenerate on save).
- Standardize the event contract: either update the frontend to match `PuppetMasterEvent` types or add a server-side event “translator” so the UI receives the names it expects.

---

### P0.7 Gate execution + evidence linkage is broken (you can’t reliably “prove PASS”)

Even if you fix PRD generation, the current gate/evidence plumbing will struggle to provide credible, navigable proof.

**Concrete failures:**
- Gate report tier type detection is wrong:
  - `GateRunner.saveEvidence()` tries to infer tier type by checking if `gateId` starts with `PH-`/`ST-`, but actual IDs are `phase-gate-PH-001`, `task-gate-TK-...` (so the prefix check fails).
  - Result: gate evidence gets mislabeled and downstream UIs can’t reason about it correctly.
- Test log evidence isn’t discoverable by item ID:
  - `VerificationIntegration` converts `testPlan.commands[]` into criteria IDs like `command-0`.
  - `CommandVerifier` uses `criterion.id` as the evidence “itemId”.
  - `EvidenceStore.getEvidence(itemId)` expects filenames starting with real tier IDs (`PH-...`, `TK-...`, `ST-...`), so those logs won’t be returned when you browse evidence for a subtask/task/phase.
- “Aggregate checks” are not cross-platform:
  - Phase aggregate check uses `target: 'true'` / `'false'` as a shell command. This is not portable to Windows.
- AI verifier is effectively unusable in real runs:
  - `AIVerifier.waitForProcess()` hard-caps wait time to 5 seconds (`Math.min(runner.defaultTimeout, 5000)`), which guarantees timeouts for real verification prompts (`src/verification/verifiers/ai-verifier.ts`).
- Browser trace evidence ignores configured evidence directory:
  - `BrowserVerifier.captureTrace()` writes temp files under hard-coded `.puppet-master/evidence/...` rather than `EvidenceStore`’s configured baseDir (`src/verification/verifiers/browser-verifier.ts`).
- GUI evidence view can’t show gate reports:
  - `EvidenceStore.listAllEvidence()` intentionally skips `gate-reports`, but the GUI evidence route/UI expects to list them (`src/memory/evidence-store.ts`, `src/gui/routes/evidence.ts`).

**Required improvement: make evidence a first-class traceability artifact**
- Gate IDs and evidence IDs must be stable and parseable. Prefer: `gateId = ${tier.id}` and store `gateType` separately, or use a strict `gateId` schema you can parse.
- All evidence produced during a tier should be tagged with that tier’s ID (not generic `command-0`).
- Replace `true/false` shell checks with a portable mechanism (Node `process.exit(0/1)` or an internal “meta verifier” that doesn’t spawn shells).

---

### P0.8 Platform CLI/process management is not production-grade (high risk of hangs + inconsistent behavior)

This is the layer that determines whether the whole system is deterministic or “randomly flaky”.

**Major issues to address:**
- Runner timeouts are inconsistently enforced:
  - `ExecutionEngine` implements a hard timeout, but `BasePlatformRunner.execute()` ignores `request.timeout`/`request.hardTimeout` entirely (Start Chain generation can hang).
- Prompt size / OS limits:
  - `ClaudeRunner` passes the full prompt via `-p <prompt>` when non-interactive, which can exceed OS command-line length limits for large prompts (exactly your “large scale” use case).
- Codex execution is likely to block on approvals:
  - `CodexRunner` does not set approval policies (e.g., full-auto) or a structured output mode; it may stall in interactive flows.
- Fresh process enforcement is split-brained:
  - You have a robust `FreshSpawner` (git clean-state checks, audit logs, timeouts), but the platform runners don’t use it.
  - Result: the “fresh context” guarantee is weaker than the architecture implies.
- CLI command naming is inconsistent across the stack:
  - Doctor checks/capability discovery/default config/platform runners must agree on command names and paths (`cursor-agent` vs `cursor`, etc.).

**Required improvement: one canonical “Process Runner” per platform**
- Centralize command construction, flags, env vars, stdin/file prompt passing, output parsing, timeouts, and audit logging.
- Validate each platform CLI via a deterministic “smoke test” and cache the results (capability discovery should inform runner behavior).

---

### P0.9 Secrets + unsafe automation will cause incidents (and undermine adoption)

At “build complete platforms” scale, you need stricter safety defaults.

**Concrete issues:**
- `mcp.json` contains a plaintext Context7 API key. This should not be committed; rotate it and move to env/secret storage.
- Doctor fixes include `curl | bash` installers and global `npm install -g` operations. In a GUI context, this is “click-to-run remote script” — it needs explicit consent, dry-run, and clearer provenance.
- Widespread use of `spawn(..., { shell: true })` and OS-specific shell commands reduces determinism and increases platform-specific failure modes.

**Required improvement:**
- Treat secrets as first-class: never store API keys in tracked repo files; add a local-only config path and validate “no secrets in repo” as a Doctor check.
- Treat installation as a supply-chain sensitive operation: require user confirmation, show checksums/signatures where possible, and prefer official package managers over `curl | bash`.

---

### P0.10 Git is implemented but not actually used as a first-class “Ralph memory layer” (and commits can silently not happen)

This matters because the Ralph loop relies on **git history as durable memory** between fresh sessions. If git integration is shallow or unreliable, iterations will “forget” work and drift.

**Current reality:**
- Git modules exist (`src/git/git-manager.ts`, `src/git/branch-strategy.ts`, `src/git/pr-manager.ts`, `src/git/commit-formatter.ts`), but orchestration uses only a minimal commit path.
- `Orchestrator.commitChanges()` bails out if `IterationResult.filesChanged` is empty, and `filesChanged` is derived from `OutputParser` heuristics (regex on agent output), not from `git diff`. This can leave real changes uncommitted even when the working tree is dirty.
- Branch strategy + PR creation are not integrated into the orchestration loop (no worktrees, no branch-per-task/phase behavior, no push/PR gates), despite config supporting it (`branching.*` in `config.yaml`).

**Required improvement: treat git as a gated stage, not a side effect**
- Detect changes using git itself (`git status --porcelain`, `git diff --name-only`) rather than output parsing.
- Integrate `BranchStrategy` + `PRManager` into the tier lifecycle (create/merge/push policies driven by config and tier transitions).
- Consider a dedicated “git pusher” step/agent after verifiers pass (Zeroshot’s pattern): stage → commit → push → create PR → (auto)merge, with evidence recorded and failure modes handled deterministically.

---

### P0.11 The orchestration loop is not actually executing the Ralph tier state machine (can get stuck on the first subtask forever)

This is a core “fundamentally won’t work” risk: the loop is structured like Phase/Task/Subtask state machines exist, but the runtime is not driving them correctly.

**Concrete symptoms in code:**
- `Orchestrator.runLoop()` executes `ExecutionEngine.spawnIteration()` without ever moving the current tier into `planning`/`running` (no `TIER_SELECTED` / `PLAN_APPROVED` events).
  - The current subtask typically remains in `pending`, so `ITERATION_COMPLETE`/`ITERATION_FAILED` events are not valid transitions and are ignored by the state machine (`src/core/state-transitions.ts`, `src/core/tier-state-machine.ts`).
- Even when a subtask reaches `gating`, there is **no subtask gate execution** to emit `GATE_PASSED`/`GATE_FAILED_*` for that subtask.
  - `AutoAdvancement.checkSubtaskCompletion()` only advances when the subtask state is `passed`, so without subtask gates the system can loop forever on the same subtask (`src/core/auto-advancement.ts`).

**Result:** the system can repeatedly spawn iterations but never advance tiers, even if the agent prints `<ralph>COMPLETE</ralph>`.

**Required improvement: make tier transitions first-class**
- Decide the intended lifecycle for subtasks:
  - Either **subtasks are the unit of gating** (recommended): run a subtask gate after an iteration completes, then mark subtask `passed`/`running`/`escalated` based on results.
  - Or subtasks “complete” immediately on `<ralph>COMPLETE</ralph>` and are marked passed without a gate (but then you lose verification backpressure at the unit-of-work level).
- Ensure the orchestrator emits the correct tier events in the right order (pending → planning → running → gating → passed) and handles invalid transitions as fatal bugs (not silent no-ops).

---

### P0.12 CLI flags/config are not honored consistently (platform selection is partial; model selection is effectively ignored)

This is directly in the “CLI management” danger zone: users think they configured/selected platforms/models, but runtime may not respect it.

**Concrete issues:**
- `puppet-master start --prd <path>` validates that file exists, but `Orchestrator` ignores `prdPath` entirely and uses whatever `PrdManager` path the container was built with (typically `config.memory.prdFile`) (`src/cli/commands/start.ts`, `src/core/orchestrator.ts`).
- `OrchestratorConfig.projectPath` and `OrchestratorConfig.prdPath` are accepted but never used inside `Orchestrator` (`src/core/orchestrator.ts`).
- Iteration execution does not pass `model` into `ExecutionRequest`, so `tiers.*.model` settings do not actually control the invoked CLIs (`src/core/execution-engine.ts` vs runner `buildArgs()` in `src/platforms/*`).
- Execution uses only one runner chosen at startup (subtask platform), not per-tier nor per-step.

**Required improvement: make runtime routing explicit**
- Explicitly define where routing decisions come from:
  - Start Chain routing (requirements/prd/arch) from `startChain.*` (see P1 3.5).
  - Tier execution routing from `tiers.*` (phase/task/subtask/iteration).
- Ensure every execution request includes: `{ platform, model, nonInteractive, approval policy, output format, timeouts }`.
- Treat “flag accepted but ignored” as a P0 defect; it destroys trust.

---

### P0.13 Path resolution is overly dependent on `process.cwd()` (packaged app + GUI multi-project will misbehave)

If you ship real installers, the app will not start “inside the project directory” by default. Today, many components implicitly assume it does.

**Concrete examples:**
- `AgentsManager.loadForContext()` loads root `AGENTS.md` using `this.config.rootPath` without resolving against `projectRoot` (so multi-project and “open project” are wrong by construction) (`src/memory/agents-manager.ts`).
- `PrdManager`, `EvidenceStore`, `UsageTracker`, and others default to relative paths that silently depend on the CWD at process start.

**Required improvement: introduce a canonical “ProjectRoot” concept**
- Make all state/evidence paths absolute and derived from the active project root.
- For GUI multi-project: either run one server per project (simpler) or store an orchestrator/container per project (harder but feasible).
- For packaged apps: open a project directory first, then run everything relative to that project root.

---

### P0.14 Capability discovery + doctor checks are “presence checks”, not “can actually run” checks (auth is missing)

At large scale, “CLI exists” is not enough. Users will hit failures like “Codex installed but not authenticated”, “Claude CLI installed but no credentials”, “Cursor CLI installed but not in non-interactive mode”.

**What reference projects do better:**
- Zeroshot runs preflight that checks install + auth + recovery steps (and it treats those as blocking with actionable output).
- ralph-claude-code invests heavily in CLI-format drift handling and fallback parsing.

**Required improvement: preflight must validate the real execution surface**
- Doctor should include “auth-ready” checks per CLI (e.g., can you run a no-op command, does `--version`/`--help` work, are credentials present, are rate limits hit).
- Capability discovery should honor `cliPaths` and record “working invocation” (including required flags) not just “binary exists”.
- Fix internal inconsistencies in Doctor/Discovery:
  - Capability discovery hard-codes commands (`cursor-agent`, `codex`, `claude`) and ignores `config.cliPaths` (`src/platforms/capability-discovery.ts`), guaranteeing false negatives when users customize paths or when platform commands differ by OS.
  - Cursor CLI check has a logic bug: after falling back to `agent`, it still runs the help check against `cursor-agent` (`src/doctor/checks/cli-tools.ts`), producing misleading “Cursor CLI found but --help failed” states.
- Ensure Doctor itself is production-safe: `src/doctor/checks/runtime-check.ts` imports `semver` without declaring it as a runtime dependency, so “Doctor” can crash in production installs.

---

### P0.15 State persistence / checkpoints are not actually restorable (pause/resume cannot be trusted)

The system has checkpoint + pause/resume scaffolding, but state cannot be reconstructed reliably. This blocks long-running workflows and “resume after crash” (a must-have for large-scale builds).

**Concrete failures:**
- Tier state restoration is stubbed in the tier tree:
  - `restoreStateMachineState()` is a no-op, so `tierContext` saved into PRD items is ignored and runtime nodes always start at `pending` (`src/core/tier-node.ts`).
- Checkpoint restore logic cannot reach most states:
  - `StatePersistence.restoreTierMachines()` only attempts a *single* event transition to reach the saved state. States like `running`, `gating`, `passed`, `failed`, `escalated` can’t be reached from `pending` in one step, so restore silently fails (`src/core/state-persistence.ts`).
- Orchestrator context restore is explicitly not implemented:
  - `StatePersistence.restoreOrchestratorMachine()` does not restore `orchestratorContext` (so “where was I?” is lost).

**Required improvement: persist an event log OR persist exact state**
- Option A (recommended): persist and replay orchestrator + tier event logs (deterministic, auditable, robust).
- Option B: persist state + context and allow “set state directly” (simpler, but guard invariants carefully).
- Add an automated end-to-end resume test: start → run iteration → pause → kill process → resume → continues correctly.

---

### P0.16 CLI/GUI control is missing a real coordination layer (stop/pause/kill are best-effort)

Right now, “control” is mostly optimistic: there’s no real control plane that can reliably manage long-running orchestrations and child processes.

**Concrete failures:**
- `puppet-master stop` admits it can’t terminate platform runner processes (placeholder comments), and there’s no central registry of running PIDs to kill reliably (`src/cli/commands/stop.ts`).
- `puppet-master pause --force` is unused; there’s no implemented mechanism to coordinate “finish current iteration vs stop now” outside the in-process SIGINT handler (`src/cli/commands/pause.ts`, `src/cli/commands/start.ts`).
- Process-tree termination is not robust across platforms:
  - `CommandVerifier` tries `process.kill(-pid)` without `detached: true`, then falls back to killing only the shell process. This can leave orphaned children (especially on Windows and when `shell: true`) (`src/verification/verifiers/command-verifier.ts`).

**Required improvement: adopt a coordinator/daemon + unified process manager**
- Run orchestrator as a background service with a control socket/HTTP API (Codex-Weave-style coordinator), so GUI/CLI talk to the same running session.
- Track child PIDs per iteration and enforce termination (process groups on Unix, job objects on Windows).
- Make stop/pause semantics explicit and testable (no silent “best effort”).

---

### P0.17 AGENTS.md enforcement/promotion exists but is not wired into execution (rules will drift at scale)

Your own specs depend on AGENTS.md as durable constraints between fresh sessions. The repo has substantial enforcement code, but it isn’t used in the live orchestration path.

**Current reality:**
- `GateEnforcer`, `PromotionEngine`, `ArchiveManager`, and multi-level loading exist, but are only referenced in tests and never run as part of gates (`src/agents/*`).
- `memory.agentsEnforcement.*` config exists, but is not enforced by the orchestration loop.

**Why this matters:**
- Without enforcement, rules like “no manual tests”, import extension rules, “no exec()”, etc will drift across iterations and across platforms/models.
- At platform-scale, that drift becomes irrecoverable inconsistency.

**Required improvement: make AGENTS enforcement part of gating**
- After each subtask/task gate, run enforcement using:
  - the agent transcript,
  - the actual code diff (not just stdout),
  - and the applicable AGENTS.md hierarchy (root/module/phase/task).
- Treat violations as gate failures with actionable feedback (and save evidence).

## P1 (High) Improvements to Make Start Chain Reliable for Big Docs

### 0) Add a Requirements Interview step (qualifying questions + assumptions)
Before you generate PRD/architecture, the system should explicitly answer:
- “What information do we still need to make objective acceptance criteria?”
- “What requirements are ambiguous/conflicting/underspecified?”
- “What critical non-functional requirements are missing (security, deployment, perf, data retention, observability, budget limits)?”

**Recommended behavior:**
- Generate a short, ranked list of qualifying questions (≤ 10) with:
  - why the answer matters,
  - what the default assumption will be if unanswered,
  - what it changes downstream (PRD items, architecture decisions, test strategy).
- Persist this as an artifact (e.g., `.puppet-master/requirements/questions.md` + `.puppet-master/requirements/assumptions.md`).
- Gate PRD generation when unanswered questions would force “manual” acceptance criteria (your default mode cannot allow that).

### 1) Add a Requirements Coverage Gate (automatic)
The Start Chain must compute and persist a coverage report:
- total chars/lines/pages extracted vs source size (heuristic per format)
- number of headings detected
- number of bullets/requirements extracted
- “missing sections” list (AI-assisted compare PRD against raw requirements)

Hard fail if:
- coverage below threshold, or
- only one high-level unit is produced without evidence the document is actually single-section, or
- PRD contains generic filler acceptance criteria (“Implementation complete”) beyond a small allowance.

### 2) Implement a multi-pass PRD build (outline → expand → verify coverage)
For large requirements docs, single-pass generation is fragile due to context limits and model variance. Use a deterministic pipeline:
1. Parse + normalize structure (including H1-title flattening).
2. Build an outline PRD with stable IDs and placeholders.
3. Expand each phase/task in isolation (chunked prompts).
4. Run an “AI coverage diff” pass: list missing requirements and map them into new PRD items.
5. Run PRD quality validator (no manual, has tests, has verifiers, sane sizes).

### 2.5) Fix architecture generation context (today it is too lossy to be useful at scale)
Right now, the AI architecture prompt includes only:
- Top-level section titles and at most a single-line preview per section, and
- A PRD outline that omits most of the real requirements detail
(`src/start-chain/prompts/arch-prompt.ts`).

For large requirements docs, this almost guarantees “generic architecture”.

**Required improvement:**
- Feed architecture generation with chunked requirement summaries (per major section) + traceability references.
- Include “non-negotiables” explicitly: deployment model, security boundaries, data/storage, observability, scaling targets.
- Add an architecture coverage gate similar to the PRD coverage gate (it should call out missing critical system concerns).

### 3) Add traceability links: Requirement → PRD item
Add fields like:
- `sourceRefs: [{ sourcePath, sectionPath, excerptHash }]`
So you can answer:
- “Which PRD items cover Requirement 4.2?”
- “Which requirements are currently uncovered?”

This is mandatory for large-scale platform builds; otherwise you will lose requirements during refactors/replanning.

## P1 (High) Improvements for Multi‑Platform CLI Control

### 1) One process-spawn path, not two
Right now you have:
- Platform runners (`src/platforms/*`) and
- A separate FreshSpawner (`src/core/fresh-spawn.ts`)
with inconsistent command building (especially Codex invocation).

Pick one strategy and delete/absorb the other. Otherwise bugs will be duplicated and fixes won’t propagate.

### 2) Enforce non-interactive flags + structured output per platform
For reliability:
- Codex: force non-interactive and a machine-parseable output mode if available.
- Claude Code: use stable flags (`--print`, `--output-format stream-json` or equivalent) and parse deterministically.
- Cursor: ensure non-interactive is truly non-interactive; capture exit codes and errors.

### 3) Respect per-tier platform configuration
Your docs promise per-tier platform/model selection. Execution currently selects **only the subtask tier platform** for iteration execution (`src/cli/commands/start.ts`).

To scale:
- Phase planning, task planning, subtask execution, and gate review can (and should) use different platforms/models.
- This must be driven by the tier plan (`TierPlanGenerator`) and PRD, not a single runner chosen at startup.

### 3.5) Make the Start Chain AI platform/model selectable per step (not hardwired to `tiers.phase`)
You called this out explicitly, and you’re right: Start Chain generation is its own pipeline and should have its own routing.

**Current behavior:**
- PRD + architecture generation use `config.tiers.phase.platform`/`model` (see `src/start-chain/prd-generator.ts`, `src/core/start-chain/pipeline.ts`), regardless of what you want for “requirements → PRD” vs “plan execution”.

**Required improvement:**
- Add `startChain` routing to config (example shape):
  - `startChain.requirementsInterview: { platform, model }`
  - `startChain.prd: { platform, model }`
  - `startChain.architecture: { platform, model }`
  - `startChain.validationReview: { platform, model }` (optional “AI reviewer”)
- Allow CLI/GUI overrides (e.g., “use Codex for PRD but Claude for architecture”) without changing tier execution platforms.

### 4) Add rate limiting, cooldown handling, and circuit breakers (borrow from reference implementations)
The ralph-claude-code and ralphy implementations invest heavily in:
- call limits
- cooldown windows
- stop conditions (test-only loops, repeated “done” claims, etc.)

You already have a `QuotaManager`/`UsageTracker` concept—make it enforcement, not logging.

## P1 (High) Add Parallel / Multi-Agent Execution (with isolation)

If you want to scale to “whole platforms”, you will eventually need safe parallelism (especially in early phases where tasks are independent).

**What to copy from proven patterns (Ralphy + Zeroshot):**
- Use **git worktrees** (or isolated copies) per agent/subtask to prevent file conflicts and keep failures contained.
- Add a scheduler that can run multiple subtasks concurrently when they have no dependency edge.
- Merge back only after gates pass, and treat merge/conflict resolution as its own step (optionally handled by a dedicated “merge” agent).

**Non-negotiables for parallelism in Puppet Master:**
- PRD updates must be file-locked (you already have `withFileLock` in `PrdManager`) and must remain the source of truth.
- `progress.txt`, session logs (`.puppet-master/logs/sessions.jsonl`), and evidence indexes must also be concurrency-safe:
  - Today, `ProgressManager.generateSessionId()` and `SessionTracker` generate IDs via per-process counters; parallel runs in the same second can collide across processes (`src/memory/progress-manager.ts`, `src/core/session-tracker.ts`).
  - These files are appended without locking, so concurrent runs can interleave writes and corrupt logs.
- Evidence and logs must be scoped per agent/worktree and traceable back to the tier IDs.
- Budgets/quotas must be enforced per platform across concurrent runs (otherwise you’ll trip cooldowns and collapse throughput).

## P1 (High) Improvements to Verification (No Manual Testing)

### 1) Make “manual” criteria invalid in execution mode
- Keep “manual” only for an optional “human review mode”.
- In default mode (your target), reject it at Start Chain validation time.

### 2) Generate real test plans automatically
At minimum:
- If `package.json` exists, include `npm test`, `npm run typecheck`, `npm run lint` where available.
- If Python, include `pytest`, `ruff`, `mypy` where configured.
- If no tests exist, generate subtasks whose first job is to create a test harness (unit/integration) so future subtasks have objective gates.

### 3) Add a verifier-token parser and mapper
Your prompts talk about tokens like `CLI_VERIFY:npm run typecheck`. The runtime should:
- parse these tokens into canonical criterion objects,
- map them to existing verifier types (`command`, `regex`, etc.),
- standardize evidence output.

## What the Reference Implementations Teach (and What to Adopt)

### Ralph (original `ralph.sh`)
- Simple, deterministic loop: read prompt file → run CLI → check completion marker → repeat with max iterations.
- Key lesson: **strict completion marker** + **fresh process** is non-negotiable.

### ralph-claude-code
- Treats CLI usage constraints as first-class: rate limiting, session handling, monitoring, circuit breakers.
- Key lesson: operational constraints are part of the architecture, not “nice to have”.

### Ralphy
- Multi-engine support and strong “project detection” (language/framework/test commands).
- Key lesson: automated verification comes from reliably discovering the project’s build/test surface area.

### multi-agent-ralph-loop
- Heavy focus on guardrails, templates, security, validation scripts.
- Key lesson: at scale, you need *more deterministic structure*, not less.

### Codex-Weave-Weave
- Uses a **local coordinator process** + sessions for agent-to-agent messaging (`~/.weave/coord.sock`) and supports `#agent` relay + control commands (`/new`, `/interrupt`, `/compact`, `/review`).
- Key lesson: if you want multi-agent parallel work across heterogeneous CLIs, you need a **first-class coordination layer** (sessions, agent registry, message/event contract), not ad-hoc stdout parsing.
- Concrete pattern worth copying:
  - A background daemon with a PID file + log file + control commands (start/stop) that survives multiple CLI instances (`weave-service` + `~/.weave/*`).

### Zeroshot
- Strong **preflight** validation with actionable recovery steps (CLI installed + authenticated + optional `gh` requirements).
- Explicit provider abstraction + output parsing per provider; safe multi-agent via **isolation** (Docker/worktrees) + a durable ledger.
- Dedicated “git-pusher” stage gated on validator consensus + evidence (PR creation/merge as a deterministic finalization step).
- Key lesson: treat **safety + isolation + git finalization** as core architecture, not an optional add-on.
- Concrete patterns worth copying:
  - Auth-aware preflight (`gh auth status`, provider CLI presence + auth checks) with exact recovery commands.
  - Worktree isolation that is robust to stale metadata + branch collisions (retry with randomized suffixes, `git worktree prune`).
  - Daemon/attach/detach UX (foreground streams, daemon persists, user can reattach to logs/status).

## Recommended Next Build Queue (Strictly Focused on Viability)

1. **Start Chain v2:** normalize headings + coverage gate + fail-fast.
2. **Schema alignment:** unify `STATE_FILES.md` ↔ `src/types/*` ↔ prompt schemas ↔ verifier registry.
3. **No-manual enforcement:** validator rejects `manual`; PRD generator must emit verifiable criteria + test plans.
4. **Execution loop correctness:** unify prompt builder, transcript capture, result parsing, git diff-based file detection.
5. **Per-tier platform routing:** choose runner/model per tier plan; add cooldown/rate limits.
6. **GUI Start Chain (your decision):** wire AI Start Chain fully (streaming events), fix router dependency injection + event contract, and make the multi-project story explicit (single-project server vs per-project instances).
7. **Installer v1:** produce real installers (exe/dmg/linux packages) so Doctor “FIX” and CLI orchestration actually run on the user’s machine.

---

## Bottom Line

The project can work, but only if Start Chain becomes a **first-class, multi-pass, quality-gated compiler** from Requirements → PRD, and the execution loop becomes a **deterministic, schema-aligned, fully automated verification system** (no manual criteria anywhere in the default mode).
