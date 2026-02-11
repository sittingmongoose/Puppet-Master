# FinishRustRewrite — Master Execution Plan

**Date:** 2026-02-11
**Goal:** Complete the Rust+Iced rewrite of RWM Puppet Master, fixing all identified gaps from audits (RustRewrite2-5) and our own deep verification.
**Constraint:** No CLI/headless mode needed (intentionally excluded per user decision).

---

## Dependency Graph

```
                    ┌─────────────┐
                    │ iced-upgrade │  ← EVERYTHING starts here
                    └──────┬──────┘
          ┌────────────────┼────────────────────────────────────┐
          │                │                                    │
          ▼                ▼                                    ▼
  ┌───────────────┐ ┌──────────────┐ ┌─────────────┐   ┌──────────────┐
  │browser-verifier│ │ai-verifier-fix│ │start-chain-ai│   │ (parallel)   │
  └───────┬───────┘ └──────┬───────┘ └──────┬──────┘   │metrics-coll. │
          │                │                │           │output-parser │
          │                │        ┌───────┼───────┐   │escalation-ch.│
          │                │        ▼       ▼       ▼   │orchestrator  │
          │                │  ┌─────────┐┌────────┐┌────────────┐      │
          │                │  │parsers  ││validat.││            │      │
          │                │  └────┬────┘└───┬────┘│            │      │
          │                │       └────┬────┘     │            │      │
          │                ▼            ▼          │            │      │
          │       ┌────────────┐ ┌──────────┐     │            │      │
          │       │verif-gaps  │ │pipeline  │     │            │      │
          │       └────────────┘ └────┬─────┘     │            │      │
          │                          ▼            │            │      │
          ▼                    ┌──────────┐       │            │      │
   ┌──────────────┐            │wizard-   │       │            │      │
   │doctor-checks │            │backend   │       │            │      │
   └──────┬───────┘            └──────────┘       │            │      │
          │                                       ▼            │      │
          │                              ┌────────────────┐    │      │
          │                              │gui-backend-wire│◄───┘      │
          │                              └───────┬────────┘           │
          │                                      │                    │
          └──────────────┬───────────────────────┘                    │
                         ▼                                            │
                ┌───────────────────┐                                 │
                │platform-setup-wiz │                                 │
                └───────────────────┘                                 │
                                                                      │
                         ┌────────────────────┐                       │
                         │ci-workflow-update   │◄─────────────────────┘
                         └────────────────────┘
                         ┌────────────────────┐
                         │cargo-lock-update   │ (after all crate changes)
                         └────────────────────┘
```

---

## Phase 1: Iced 0.14.0 Upgrade (BLOCKING — everything depends on this)

### Task: `iced-upgrade`
**Priority:** P0 — Blocking
**Depends on:** Nothing

**What to do:**
1. Bump `Cargo.toml` line 20: `iced = { version = "0.14.0", features = ["canvas", "svg", "image", "tokio", "multi-window"] }`
2. Run `cargo check` — fix ALL breaking API changes from 0.13→0.14.0
3. Verify all 15 views still compile and render

**Iced 0.14.0 new features to adopt (confirmed via Context7):**

| Feature | What it does | Where to use it in our app |
|---------|-------------|---------------------------|
| **`table` widget** | Tabular data with column headers, sorting, scrolling | `views/tiers.rs` (tier hierarchy), `views/evidence.rs` (evidence list), `views/ledger.rs` (event ledger), `views/metrics.rs` (platform metrics), `views/history.rs` (session history), `views/coverage.rs` (coverage matrix) |
| **`grid` widget** | Two-dimensional layouts with auto-sizing | `views/dashboard.rs` (status cards grid), `views/doctor.rs` (check results grid), `views/projects.rs` (project cards) |
| **`sensor` widget** | Measures content size, fires `on_resize` | `widgets/panel.rs` (responsive panels), `views/dashboard.rs` (responsive layout), anywhere we need adaptive sizing |
| **`float` widget** | Overlay positioning (floats above content) | `widgets/toast.rs` (toast notifications overlay), `widgets/modal.rs` (modal dialogs), tooltips on status badges, context menus |
| **`pin` widget** | Pin elements to viewport positions | Sticky headers in scrollable views, pinned toolbar |
| **Animation API** | Smooth transitions with easing functions via `Animation`, `animation::stream()` | State machine transitions (Idle→Planning→Executing visual), progress bars (smooth fill), tier completion celebrations, loading spinners, page transitions, toast slide-in/out |
| **Reactive rendering** | Only redraws when state actually changes | Automatic — entire app benefits. Especially important for dashboard with frequent timer ticks |
| **Time-travel debugging** | Step through application state history | Add dev mode toggle in settings; invaluable for debugging orchestrator state transitions |
| **Hot reloading** | Rapid development iteration | Development workflow improvement |

**Specific migration steps (0.13→0.14.0 API changes):**
- Check `Application` trait changes (may need update in `app.rs`)
- Check `view()` lifetime signature changes
- Check `subscription()` API changes
- Check `Theme`/`Style` system changes
- Check `canvas::Cache` API changes (used in `budget_donut.rs`, `usage_chart.rs`)
- Check `Element` and widget builder changes
- Review all `container::Style`, `button::Style` closures for new API

**Files to touch:** `Cargo.toml`, `app.rs`, all 15 `views/*.rs`, all 10 `widgets/*.rs`, `theme/styles.rs`, `theme/colors.rs`

**Validation:** `cargo check`, `cargo test --lib`, all views render correctly

---

## Phase 2: Parallel Work (after Iced upgrade)

### Task: `browser-verifier`
**Priority:** P0
**Depends on:** `iced-upgrade`

**What to do:**
Replace the explicit stub (`//! Browser Verifier (Stub)`, line 1) in `puppet-master-rs/src/verification/browser_verifier.rs` with a **real Playwright implementation**.

**Current state:** 363 lines, `verify()` always returns `passed: false` with "Browser verification is not yet implemented" message.

**Target state (match TS browser-verifier.ts, 741 lines):**
1. **Use newest Playwright version** — check latest Playwright for Rust bindings or use CLI subprocess approach (spawn `npx playwright` or use `playwright` CLI)
2. Browser launch: Chromium, Firefox, WebKit (headless by default)
3. Navigation to target URL with configurable timeout
4. CSS selector element finding and validation
5. Text content verification on found elements
6. Element visibility checking
7. `waitFor` selector support (wait for element before proceeding)
8. Action execution: click, fill, select, hover on elements
9. Screenshot capture on failure → save to evidence store
10. Browser trace capture on failure (Playwright trace)
11. Console message capture (filter by error/warning/log/info)
12. Page error capture
13. Network request/response capture (with max count limit)
14. Evidence metadata: screenshot path, trace path, console path, network path
15. Proper cleanup (close browser/context/page)
16. Builder pattern (already exists, keep it)

**Implementation approach:**
- Since Playwright is a Node.js tool, the Rust verifier should spawn `npx playwright test` or use Playwright CLI
- Alternatively, use `chromiumoxide` or `headless_chrome` Rust crate for native Chromium control
- Write a small Playwright script template that the verifier generates and executes
- Parse structured JSON output from the script
- Save evidence artifacts (screenshots, traces) to the EvidenceStore

**Also add:** `checks/playwright_check.rs` in doctor (see `doctor-checks` task)

---

### Task: `ai-verifier-fix`
**Priority:** P0
**Depends on:** `iced-upgrade`

**Current state:** `ai_verifier.rs` (401 lines) has real logic but **wrong CLI flags** in `execute_platform_cli()` (lines 140-175):

| Platform | Current (WRONG) | Correct per AGENTS.md |
|----------|----------------|----------------------|
| cursor | `cursor ask` | `agent -p "prompt" --model X --output-format json` |
| codex | `codex ask` | `codex exec "prompt" --full-auto --json --model X --color never` |
| claude | `claude ask` | `claude -p "prompt" --model X --output-format json --no-session-persistence --permission-mode bypassPermissions` |
| gemini | `gemini-cli query` | `gemini -p "prompt" --output-format json --approval-mode yolo` |
| copilot | `gh copilot suggest` | `copilot -p "prompt" --allow-all-tools --stream off --allow-all-paths --allow-all-urls` |

**What to fix:**
1. Rewrite `execute_platform_cli()` with correct CLI flags per AGENTS.md
2. Set correct binary names: `agent` (cursor), `codex`, `claude`, `gemini`, `copilot`
3. Add `--model` flag support from `self.config.model`
4. Add `--output-format json` where supported for structured parsing
5. Add `--cd` / working directory support
6. Add timeout support via process kill after `self.config.timeout_seconds`
7. Parse JSON output from platforms (not just raw text)
8. Integrate with EvidenceStore for saving verification results
9. Make `verify()` async (currently synchronous, blocks thread)
10. Add integration with PlatformRegistry (check platform availability before spawning)

---

### Task: `start-chain-ai`
**Priority:** P0
**Depends on:** `iced-upgrade`

**Current state:** All start chain generators are pure data transformation — ZERO AI invocation.

**What to do for each module:**

#### `requirements_interviewer.rs` (544 lines)
- Add `interview_with_ai()` async method matching TS `interviewWithAI()`
- Accept a platform runner (from PlatformRegistry)
- Build interview prompt using prompt_templates.rs
- Spawn AI CLI process via the platform runner
- Parse AI response for generated questions and priorities
- Track usage via UsageTracker
- Keep existing `generate_questions()` as non-AI fallback

#### `prd_generator.rs` (208 lines)
- Add `generate_with_ai()` async method matching TS `generateWithAI()`
- Accept platform runner, build PRD generation prompt
- Spawn AI CLI process, parse JSON response into PRD struct
- Support multi-pass for large documents (delegate to multi_pass_generator)
- Track token usage
- Keep existing `generate()` as non-AI fallback

#### `architecture_generator.rs` (212 lines)
- Add `generate_with_ai()` async method matching TS `generateWithAI()`
- **Remove hardcoded tech stack** (lines 133-148 with static "Backend | Rust | Core application logic")
- Let AI analyze the PRD and recommend appropriate tech stack
- Parse AI response for architecture markdown
- Keep existing `generate()` as non-AI fallback

#### `multi_pass_generator.rs` (425 lines)
- Implement actual multi-pass AI refinement matching TS behavior
- Pass 1: Initial PRD generation from requirements via AI
- Pass 2: Gap analysis — AI identifies missing items, adds them
- Pass 3: Quality validation — AI reviews final PRD for completeness
- Each pass spawns a fresh AI process (CU-P2-T12 compliance)
- Calculate actual coverage improvements between passes

**Pattern to follow (from TS):**
```
1. Get platform runner from PlatformRegistry
2. Build prompt using prompt_templates
3. Create ExecutionRequest { prompt, model, workingDirectory, nonInteractive: true, timeout }
4. Call runner.execute(request) → spawns CLI process
5. Parse result.output as JSON
6. Track usage: platform, action, tokens, duration, success
```

---

### Task: `start-chain-parsers`
**Priority:** P1
**Depends on:** `iced-upgrade`

**What to do:**
1. Add DOCX parsing to `document_parser.rs` using `docx-rust` or `docx-rs` crate
   - Extract text content from .docx files
   - Preserve heading structure for section detection
   - Handle tables and lists
2. Add PDF parsing using `lopdf` + `pdf-extract` crates
   - Extract text content from .pdf files
   - Handle multi-page documents
   - Best-effort structure detection from formatting
3. Update `DocumentParser` to auto-detect format by file extension (.docx, .pdf, .txt, .md)
4. Add error handling for corrupted/encrypted documents
5. Add new crates to Cargo.toml

---

### Task: `start-chain-validators`
**Priority:** P1
**Depends on:** `iced-upgrade`

**What to do:**
1. Add `AiGapValidator` — uses AI to detect gaps in PRD coverage (TS: `ai-gap-validator.ts`)
   - Spawns AI process to analyze PRD against requirements
   - Reports uncovered requirements
2. Add `RequirementsInventory` module (TS: `requirements-inventory.ts`)
   - Heuristic extraction of requirement IDs
   - Maps requirements to PRD items for traceability
3. Ensure existing validators (Coverage, Quality, NoManual) match TS feature parity
4. Add `CompositeValidator` that runs all validators and aggregates results

---

### Task: `orchestrator-wiring`
**Priority:** P0
**Depends on:** `iced-upgrade`

**Current state:** `orchestrator.rs` (281 lines, 0 tests). `execute_tier()` transitions state machines but never calls ExecutionEngine. Three imports are dead: `ExecutionEngine`, `PromptBuilder`, `SessionTracker`.

**What to do:**
Rewrite `execute_tier()` to implement the REAL execution loop:

```
execute_tier(tier_id):
  1. transition(StartPlanning)
  2. prompt = PromptBuilder::build(tier, context_files, progress.txt, AGENTS.md)
  3. transition(StartExecution)
  4. for iteration in 0..max_iterations:
     a. session = SessionTracker::start_session()
     b. Check LoopGuard (is this a repetitive cycle?)
     c. request = ExecutionRequest { prompt, model, platform, timeout, ... }
     d. result = ExecutionEngine::execute(request)  ← SPAWN REAL PROCESS
     e. Parse output for completion signals (<ralph>COMPLETE</ralph>)
     f. If worker/reviewer mode: run WorkerReviewer cycle
     g. session.complete(result)
  5. transition(StartGating)
  6. gate_result = GateRunner::run(tier.criteria)
  7. If gate_result.passed:
     a. transition(GatePass)
     b. Update PRD item status
  8. Else:
     a. EscalationEngine::handle(failure)
     b. Either retry (transition(Retry)) or escalate
  9. Save evidence, update progress.txt
```

**Also:**
- Write comprehensive orchestrator tests (currently 0)
- Handle error cases: timeout, process crash, gate failure, max iterations exceeded
- Wire checkpoint saving between iterations
- Wire parallel execution for independent subtasks

---

### Task: `metrics-collector`
**Priority:** P1
**Depends on:** `iced-upgrade`

**What to do:**
Port `src/metrics/metrics-collector.ts` (350 lines) to Rust:
1. Create `puppet-master-rs/src/core/metrics_collector.rs` or `state/metrics_collector.rs`
2. Track per-subtask: success/failure, first-pass success, iteration count
3. Calculate: success rate, first-pass success rate, escalation rate, avg revisions
4. Latency tracking: avg duration per iteration, per platform
5. Cost estimation: token usage × platform pricing table
6. Platform-level aggregation
7. Wire to `views/metrics.rs` for display (use new Iced 0.14.0 `table` widget)
8. JSON/CSV export support (like TS `metrics-reporter.ts`)

---

### Task: `escalation-chain`
**Priority:** P2
**Depends on:** `iced-upgrade`

**What to do:**
Port `src/core/escalation-chain.ts` multi-step escalation chain:
- Chain-step selection algorithm (not just simple escalation)
- Configurable escalation paths per tier level
- Platform fallback chains (e.g., try Claude → fall back to Cursor)
- Wire into orchestrator's error handling path

---

### Task: `output-parser-full`
**Priority:** P2
**Depends on:** `iced-upgrade`

**What to do:**
Enhance `output_parser.rs` to extract structured data from AI platform output:
- Learnings/insights from agent output
- Files changed list
- Test results (passed/failed/skipped counts)
- Token usage reported by platform
- Error messages and stack traces
- Currently only parses `<ralph>COMPLETE</ralph>` and `<ralph>GUTTER</ralph>` signals

---

## Phase 3: Integration (after Phase 2 components are ready)

### Task: `start-chain-pipeline`
**Priority:** P0
**Depends on:** `start-chain-ai`, `start-chain-parsers`, `start-chain-validators`

**What to do:**
Create `puppet-master-rs/src/start_chain/pipeline.rs` matching TS `pipeline.ts` (857 lines):

```rust
pub struct StartChainPipeline {
    platform_registry: Arc<PlatformRegistry>,
    quota_manager: Arc<QuotaManager>,
    config: StartChainConfig,
}

impl StartChainPipeline {
    pub async fn execute(&self, params: StartChainParams) -> Result<StartChainResult> {
        // Step 0: Parse requirements document (md/txt/docx/pdf)
        // Step 1: Requirements inventory (heuristic extraction)
        // Step 2: AI interview (generate questions, optionally ask AI)
        // Step 3: Generate PRD (with AI, multi-pass for large docs)
        // Step 4: Generate architecture (with AI)
        // Step 5: Generate tier plans (heuristic — no AI needed)
        // Step 6: Generate test plans
        // Step 7: Validate PRD (run all validators)
        // Step 8: Save artifacts to .puppet-master/
    }
}
```

- Emit progress events at each step (for wizard UI progress display)
- Support cancellation via AbortSignal/channel
- Handle partial failure (save what completed)
- Register in mod.rs exports

---

### Task: `wizard-backend`
**Priority:** P0
**Depends on:** `start-chain-pipeline`, `iced-upgrade`

**What to do:**
Fix all 8 TODO wizard handlers in `app.rs`:

1. **WizardFileSelected** — Use `rfd` (already a dependency) to open file dialog, read file, parse with DocumentParser, populate wizard state
2. **WizardGenerate** — Spawn async task calling `StartChainPipeline::execute()`, send progress updates to UI via channel, display results in wizard view
3. **WizardSave** — Write generated PRD to `prd.json`, architecture to `architecture.md`, save all artifacts to `.puppet-master/`
4. **WizardStep navigation** — Already works, keep as-is

Update `views/wizard.rs`:
- Show real-time progress during generation (use Iced 0.14.0 Animation API for progress bar)
- Display generated PRD preview before saving
- Show validation results/warnings
- File format indicator (md/txt/docx/pdf)

---

### Task: `gui-backend-wiring`
**Priority:** P0
**Depends on:** `orchestrator-wiring`, `iced-upgrade`

**What to do:**

1. **Create orchestrator runtime channel** in `app.rs run()`:
   ```rust
   let (command_tx, command_rx) = tokio::sync::mpsc::channel(32);
   let (event_tx, event_rx) = tokio::sync::mpsc::channel(64);
   // Store command_tx in App.command_sender (currently always None)
   ```

2. **Spawn orchestrator background task** in `run()`:
   ```rust
   tokio::spawn(async move {
       let orchestrator = Orchestrator::new(config);
       // Listen for commands on command_rx
       // Send events back on event_tx
   });
   ```

3. **Wire all 21 TODO handlers:**

   | Handler | Implementation |
   |---------|---------------|
   | StartOrchestrator | Send `AppCommand::Start` via channel (partially done) |
   | PauseOrchestrator | Send `AppCommand::Pause` |
   | RetryItem | Send `AppCommand::Retry(item_id)` |
   | ReplanItem | Send `AppCommand::Replan(item_id)` |
   | ReopenItem | Send `AppCommand::Reopen(item_id)` |
   | KillProcess | Send `AppCommand::Kill(pid)` via ProcessRegistry |
   | CreateProject | Create project directory, init config.yaml, init git |
   | OpenProject | Load config.yaml, load prd.json, update app state |
   | SaveConfig | Write config to config.yaml via ConfigManager |
   | ReloadConfig | Re-read config.yaml, update app state |
   | ValidateConfig | Run ConfigSchema validation, show results |
   | RunAllChecks | Spawn async doctor CheckRegistry::run_all() |
   | RunCheck | Spawn async single check |
   | FixCheck | Call InstallationManager for the failing check |
   | SelectSession | Load session details from SessionTracker |
   | WindowCloseRequested | Minimize to tray (don't exit) |

4. **Uncomment event subscription** (lines 749-784 in app.rs):
   - Subscribe to backend events via the event_rx channel
   - Update UI state when events arrive (tier progress, completion, errors)

5. **Wire tray icon** (line 1016 TODO):
   - Use existing `tray.rs` module
   - Create tray icon with menu (Show/Hide, Start/Pause, Quit)
   - Handle tray menu actions

---

### Task: `verification-gaps`
**Priority:** P1
**Depends on:** `ai-verifier-fix`, `browser-verifier`

**What to do:**

1. **command_verifier.rs** — Add:
   - `cwd` (working directory for command execution)
   - `env` (environment variables)
   - `timeout` (kill process after N seconds)
   - Output pattern matching (regex on stdout/stderr)
   - Exit code validation (not just 0/non-0)

2. **script_verifier.rs** — Add:
   - `args` (script arguments)
   - `cwd` (working directory)
   - `env` (environment variables)
   - `timeout`
   - `PASS` token detection in script output
   - Note: `"js" => "node"` mapping is acceptable (external runtime)

3. **gate_runner.rs** — Add:
   - Parallel criterion execution (currently sequential)
   - Evidence persistence to EvidenceStore after each verification
   - Configurable stop-on-first-failure vs run-all

4. **Make all verifiers async** — Currently synchronous `fn verify()`, change to `async fn verify()`

5. **Create verification_integration.rs** — Integration module that wires verifiers to EvidenceStore and EventBus

---

### Task: `doctor-checks`
**Priority:** P1
**Depends on:** `browser-verifier`

**What to do:**
Port 3 missing doctor checks from TypeScript:

1. **playwright_check.rs** — Check if Playwright is installed (`npx playwright --version`), check browser installations
2. **platform_compatibility_check.rs** — Verify platform CLI versions are compatible, check for known incompatibilities
3. **wiring_check.rs** — Verify internal component wiring (orchestrator→engine→gate connections)

Register all three in `check_registry.rs`.

---

## Phase 4: Final Integration

### Task: `platform-setup-wizard`
**Priority:** P1
**Depends on:** `gui-backend-wiring`, `doctor-checks`

**Current state:** `installation_manager.rs` (485 lines) can detect installed platforms and provide text instructions, but CANNOT execute installations or trigger login flows. `views/login.rs` shows auth status but doesn't trigger logins.

**What to do:**
Create a first-boot onboarding wizard (separate from the start-chain PRD wizard):

1. **First-launch detection** — Check if `.puppet-master/setup-complete` marker exists
2. **Platform detection step** — Use `InstallationManager::check_all_platforms()` to show what's installed/missing
3. **Installation guidance step** — For each missing platform:
   - Show platform-specific install instructions (already in installation_manager.rs)
   - Optionally auto-execute install commands (add `execute_install()` method to InstallationManager)
   - Re-check after each install attempt
4. **Authentication step** — For each installed platform:
   - Cursor: Run `agent` and check auth, or prompt for `CURSOR_API_KEY` env var
   - Codex: Run `codex` auth check, or prompt for `CODEX_API_KEY`
   - Claude: Run `claude` auth check, or prompt for `ANTHROPIC_API_KEY`
   - Gemini: Check `GEMINI_API_KEY` or `GOOGLE_API_KEY` env var
   - Copilot: Run `gh auth status`, guide through `gh auth login` if needed
   - Show auth status for each (using existing `auth_status.rs`)
5. **Configuration step** — Generate initial `config.yaml` with detected platforms and preferred settings
6. **Completion** — Write `.puppet-master/setup-complete` marker, navigate to dashboard

**Add to `views/` or integrate into existing login.rs view**
**Wire to app.rs with new message variants for each setup step**

---

### Task: `ci-workflow-update`
**Priority:** P1
**Depends on:** `iced-upgrade`

**Status (2026-02-11):** Implemented — build-installers.yml now builds Rust/Iced installers (not Tauri). Linux installs upstream musl 1.2.5, GTK 3.24.48 (introspection disabled), and rpm 6.0.1 to a cached user prefix with 14-day cache bucket rotation; macOS CI builds arm64-only; outputs to dist/installers/<platform-arch>/.

**Previous issues in `.github/workflows/build-installers.yml` (now addressed):**

1. **Line 47:** `cargo clippy -- -D warnings || true` — The `|| true` silently swallows ALL clippy failures. **Fix:** Remove `|| true`, let clippy failures break the build.
2. **Line 132:** `puppet-master --version || true` — Smoke test never actually validates. **Fix:** Remove `|| true`. If binary can't run `--version`, the build should fail.
   - Note: This requires adding `--version` flag handling to `main.rs` (simple `env!("CARGO_PKG_VERSION")` print)
3. **No integration tests** — Add step: `cargo test --test '*'` to run integration tests
4. **Iced 0.14.0 system deps** — Verify `libgtk-3-dev libwebkit2gtk-4.1-dev` are still correct for Iced 0.14.0. Check if additional deps needed.
5. **Add E2E smoke test** — After building, verify binary can at least initialize without crashing (may need virtual display for GUI: `xvfb-run`)
6. **Consider adding:** Playwright installation step in CI for browser verifier tests

---

### Task: `cargo-lock-update`
**Priority:** P1
**Depends on:** `iced-upgrade`, `browser-verifier`, `start-chain-parsers`

**What to do:**
After all Cargo.toml dependency changes are complete:
1. Run `cargo update` to regenerate Cargo.lock
2. Run `cargo check` to verify everything resolves
3. Run `cargo test --lib` to verify all tests pass
4. Commit Cargo.lock

---

## Execution Order Summary

### Wave 1 (sequential — blocking):
1. `iced-upgrade` — Everything depends on this

### Wave 2 (parallel — after Wave 1):
- `browser-verifier`
- `ai-verifier-fix`
- `start-chain-ai`
- `start-chain-parsers`
- `start-chain-validators`
- `orchestrator-wiring`
- `metrics-collector`
- `escalation-chain`
- `output-parser-full`

### Wave 3 (parallel — after Wave 2 dependencies met):
- `start-chain-pipeline` (needs: start-chain-ai + parsers + validators)
- `verification-gaps` (needs: ai-verifier-fix + browser-verifier)
- `doctor-checks` (needs: browser-verifier)
- `gui-backend-wiring` (needs: orchestrator-wiring)
- `ci-workflow-update` (needs: iced-upgrade)

### Wave 4 (after Wave 3):
- `wizard-backend` (needs: start-chain-pipeline)
- `platform-setup-wizard` (needs: gui-backend-wiring + doctor-checks)
- `cargo-lock-update` (needs: all crate changes done)

---

## Items from RustRewrite5 Cross-Referenced

| RustRewrite5 Finding | Addressed By | Notes |
|---------------------|-------------|-------|
| §1 Iced 0.13→0.14.0 | `iced-upgrade` | ✅ |
| §3.1 Orchestrator stub | `orchestrator-wiring` | ✅ |
| §3 Container (DI) missing | N/A | Intentionally excluded — Rust doesn't use DI containers |
| §3 Escalation chain missing | `escalation-chain` | ✅ |
| §3 Output parser partial | `output-parser-full` | ✅ |
| §3 Tier state manager partial | `orchestrator-wiring` | PRD state restoration wired in orchestrator |
| §4 Browser verifier stub | `browser-verifier` | ✅ |
| §4 AI verifier mismatch | `ai-verifier-fix` | ✅ |
| §4 Command verifier gaps | `verification-gaps` | ✅ |
| §4 Script verifier gaps | `verification-gaps` | ✅ |
| §4 Gate runner gaps | `verification-gaps` | ✅ |
| §4 Verification integration missing | `verification-gaps` | ✅ |
| §5 PDF/DOCX parsers missing | `start-chain-parsers` | ✅ |
| §5 Multi-pass generator partial | `start-chain-ai` | ✅ |
| §5 AI gap validator missing | `start-chain-validators` | ✅ |
| §5 Requirements inventory missing | `start-chain-validators` | ✅ |
| §6 Audits missing (8 modules) | N/A | Intentionally excluded — TS-specific build-time tools replaced by cargo clippy/test |
| §6 Contracts missing (3 modules) | N/A | Intentionally excluded — Rust type system provides compile-time guarantees |
| §9.2 Doctor: playwright check | `doctor-checks` | ✅ |
| §9.2 Doctor: platform compat check | `doctor-checks` | ✅ |
| §9.2 Doctor: wiring check | `doctor-checks` | ✅ |
| §10 GUI 21 TODO stubs | `gui-backend-wiring` + `wizard-backend` | ✅ |
| §10 Event subscription commented out | `gui-backend-wiring` | ✅ |
| §11 No CLI | N/A | **Intentionally excluded per user decision** |
| §12 Script verifier depends on Node | Acceptable | External runtime dependency for .js scripts is fine |
| §13 CI smoke test || true | `ci-workflow-update` | ✅ |
| §13 CI clippy || true | `ci-workflow-update` | ✅ |
| §2 Legacy cleanup | Not in scope | Legacy TS cleanup is a separate effort |

---

## Items NOT in RustRewrite5 but Added by Our Audit

| Finding | Addressed By |
|---------|-------------|
| Start chain has NO AI integration (zero platform spawning) | `start-chain-ai` |
| No StartChainPipeline orchestrator | `start-chain-pipeline` |
| Architecture generator has hardcoded tech stack | `start-chain-ai` |
| Wizard is display-only (8 TODO handlers) | `wizard-backend` |
| MetricsCollector not ported (quality metrics) | `metrics-collector` |
| Platform setup wizard (first-boot onboarding) missing | `platform-setup-wizard` |
| CI workflow needs hardening | `ci-workflow-update` |
| All verifiers are synchronous | `verification-gaps` |

---

## Intentionally Excluded (confirmed by user)

| Item | Reason |
|------|--------|
| CLI/headless mode (25+ commands) | User decision: GUI-only app, no CLI needed |
| Audits subsystem (8 modules) | TS-specific build-time tools; cargo clippy/test replaces them |
| Contracts subsystem (3 modules) | Rust type system provides compile-time validation |
| DI Container | Rust idiomatically doesn't use DI containers |
| Legacy TS/Node cleanup | Separate cleanup effort, not part of this plan |
