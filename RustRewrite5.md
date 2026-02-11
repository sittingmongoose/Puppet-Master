# RustRewrite5 — Comprehensive Rust+Iced Rewrite Completeness Audit

**Date:** 2026-02-11
**Auditors:** 5-agent team (2 Rust Engineers, 1 Code Reviewer, 1 Version Auditor, 1 State/Platform Auditor) + Team Lead synthesis
**Scope:** Full rewrite completeness, version compliance, legacy cleanup, feature parity
**Constraints:** Report-only; no code changes

---

## Executive Summary

The Rust+Iced rewrite has **excellent individual module coverage** (most modules are genuinely implemented with tests) but suffers from **three critical systemic gaps**:

1. **Iced version is 0.13.1, not the required 0.14.0**
2. **The orchestrator does not actually execute work** — `execute_tier()` transitions state but never calls ExecutionEngine
3. **No CLI exists** — the Rust binary is GUI-only with no `clap`/`structopt` argument parsing

Additionally, the entire **audits/** and **contracts/** subsystems (11 modules) have zero Rust coverage, and the legacy Node/TS codebase remains fully present in the repo.

---

## 1) Version Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Rust 1.93** | **PASS** | `rust-toolchain.toml`: `channel = "1.93.0"`; `Cargo.toml`: `rust-version = "1.93"` |
| **musl 1.2.5** | **PASS (configured)** | `rust-toolchain.toml` targets `x86_64-unknown-linux-musl`; `.cargo/config.toml` enables `+crt-static`; CI installs `musl-tools`; `libc = "0.2.170"` (musl 1.2.5 compatible). Exact musl runtime version is a build-image property. |
| **Iced 0.14.0** | **FAIL** | `Cargo.toml`: `iced = { version = "0.13", ... }`; `Cargo.lock` resolves to **iced 0.13.1**. Requirement is 0.14.0. |

### CI/Build Pipeline Assessment

- **Workflow**: `.github/workflows/build-installers.yml` — "Build Installers (Rust)"
- **Targets**: Linux (x86_64-unknown-linux-musl), macOS arm64 + x86_64 (universal binary), Windows (x86_64-pc-windows-msvc)
- **Test step**: `cargo test --all-features` (runs before build)
- **Clippy**: `cargo clippy -- -D warnings || true` (warnings don't fail build — `|| true`)
- **Smoke test**: `puppet-master --version || true` (non-validating — always passes)
- **Packaging**: nfpm (.deb/.rpm), DMG (macOS), NSIS (Windows)
- **No Node steps** in CI workflow — Rust-only pipeline

**CI Issues:**
- Clippy and smoke test use `|| true` — failures are silently swallowed
- No integration tests or E2E tests in CI

---

## 2) Legacy Leftovers

### 2.1 The legacy Node/TypeScript project is still fully present

| Artifact | Status | Details |
|----------|--------|---------|
| `package.json` | **Present** | Declares `"puppet-master": "./dist/cli/index.js"` as bin entrypoint |
| `README.md` | **Present** | Documents Node.js 18+ install, `npm run gui`, Tauri wrapper usage |
| `src/**/*.ts` | **~2175 files** | Full TS source tree (core, CLI, GUI, platforms, etc.) |
| `src/**/*.tsx` | **~66 files** | React GUI components |
| `dist/` | **Present** | Compiled Node/TS output (CLI entrypoint, commands, etc.) |
| `src/gui/react/dist/` | **Present** | Built React GUI assets |
| `src-tauri/` | **Present** | Tauri v2 wrapper (spawns embedded Node runtime) |
| `scripts/install.sh` | **Present** | Node-first installer (requires node/npm, runs `npm run build`) |
| `run-puppet-master-gui.sh` | **Present** | Runs `node dist/cli/index.js gui` |
| `node_modules/` | **Likely present** | Not checked but expected given package.json |

### 2.2 Dual Packaging Tracks

| Track | Location | Status |
|-------|----------|--------|
| **Rust-only CI** | `.github/workflows/build-installers.yml` | Active, builds all 3 platforms |
| **Node/Tauri packaging** | `package.json` scripts (`build:win`, `build:mac`, etc.) | Still present, references `tsx scripts/build-installer.ts` |

### 2.3 Tauri Wrapper

`src-tauri/src/main.rs` explicitly spawns an embedded **Node runtime** to launch the Node CLI GUI backend (`node <app_entry> gui --no-open --port <...>`). This should be removed if Iced is the GUI.

### 2.4 Recommended Cleanup

For a clean Rust-only repo, the following should be removed:
- `src/` (entire TS source tree)
- `dist/` (compiled Node output)
- `src-tauri/` (Tauri wrapper)
- `src/gui/react/` (React GUI)
- `package.json`, `package-lock.json`, `tsconfig.json`
- `node_modules/`
- `scripts/install.sh`, `scripts/install.ps1`
- `run-puppet-master-gui.sh`
- Node-based build scripts in `scripts/`
- `README.md` needs full rewrite for Rust

---

## 3) Core Modules Audit

**Source:** rust-core-auditor agent (read every file, verified implementation status)

### Summary: 21 TS modules → 18 complete, 2 missing, 3 partial

| # | Module | TS Path | Rust Equivalent | Status | Notes |
|---|--------|---------|-----------------|--------|-------|
| 1 | auto-advancement | `src/core/auto-advancement.ts` | `auto_advancement.rs` | **Complete** | 349 lines with tests |
| 2 | checkpoint-manager | `src/core/checkpoint-manager.ts` | `checkpoint_manager.rs` | **Complete** | 508 lines with tests |
| 3 | complexity-classifier | `src/core/complexity-classifier.ts` | `complexity_classifier.rs` | **Complete** | 449 lines with tests |
| 4 | **container** | `src/core/container.ts` | **MISSING** | **Missing** | DI container not ported; Rust wires manually in orchestrator |
| 5 | dependency-analyzer | `src/core/dependency-analyzer.ts` | `dependency_analyzer.rs` | **Complete** | Kahn's algorithm, 533 lines with tests |
| 6 | escalation | `src/core/escalation.ts` | `escalation.rs` | **Complete** | 372 lines with tests |
| 7 | **escalation-chain** | `src/core/escalation-chain.ts` | **MISSING** | **Missing** | Chain-step selection algorithm not ported |
| 8 | execution-engine | `src/core/execution-engine.ts` | `execution_engine.rs` | **Complete** | 414 lines with tests |
| 9 | fresh-spawn | `src/core/fresh-spawn.ts` | `fresh_spawn.rs` | **Complete** | 341 lines with tests |
| 10 | loop-guard | `src/core/loop-guard.ts` | `loop_guard.rs` | **Complete** | MD5 hashing, cycle detection, 458 lines with tests |
| 11 | **orchestrator** | `src/core/orchestrator.ts` | `orchestrator.rs` | **PARTIAL** | **CRITICAL: See section 3.1** |
| 12 | orchestrator-state-machine | `src/core/orchestrator-state-machine.ts` | `state_machine.rs` | **Complete** | Combined with TierStateMachine, 531 lines |
| 13 | **output-parser** | `src/core/output-parser.ts` | *(inlined)* | **Partial** | Basic signal parsing in execution_engine.rs; missing structured output (learnings, files changed, test results) |
| 14 | parallel-executor | `src/core/parallel-executor.ts` | `parallel_executor.rs` | **Complete** | Semaphore-based concurrency, 451 lines with tests |
| 15 | platform-router | `src/core/platform-router.ts` | `platform_router.rs` | **Complete** | 428 lines with tests |
| 16 | process-registry | `src/core/process-registry.ts` | `process_registry.rs` | **Complete** | Cross-platform (SIGTERM/taskkill), 505 lines with tests |
| 17 | prompt-builder | `src/core/prompt-builder.ts` | `prompt_builder.rs` | **Complete** | 415 lines with tests |
| 18 | session-tracker | `src/core/session-tracker.ts` | `session_tracker.rs` | **Complete** | 369 lines with tests |
| 19 | state-persistence | `src/core/state-persistence.ts` | `state_persistence.rs` | **Complete** | Atomic writes, 416 lines with tests |
| 20 | state-transitions | `src/core/state-transitions.ts` | `state_transitions.rs` | **Complete** | 482 lines with tests |
| 21 | tier-node | `src/core/tier-node.ts` | `tier_node.rs` | **Complete** | Arena-based tree, 544 lines with tests |
| 22 | tier-state-machine | `src/core/tier-state-machine.ts` | `state_machine.rs` | **Complete** | Combined with OrchestratorStateMachine |
| 23 | **tier-state-manager** | `src/core/tier-state-manager.ts` | *(distributed)* | **Partial** | Navigation helpers split across tier_node.rs + orchestrator.rs; PRD state restoration missing |
| 24 | worker-reviewer | `src/core/worker-reviewer.ts` | `worker_reviewer.rs` | **Complete** | 325 lines with tests |

### 3.1 CRITICAL: Orchestrator `execute_tier()` Is a Stub

**This is the single most important finding.** The Rust orchestrator at `puppet-master-rs/src/core/orchestrator.rs` (281 lines vs TS's 2849+ lines) has an `execute_tier()` method that **auto-completes every tier without doing real work**:

```
execute_tier() transitions:
  Pending → Planning → Running → Gating → Passed

But NEVER:
  1. Builds prompts (PromptBuilder imported but unused)
  2. Calls ExecutionEngine to spawn platform processes
  3. Processes output or completion signals
  4. Runs worker/reviewer cycles
  5. Runs gate validation
  6. Checks loop guard
  7. Handles escalation
```

All the individual components (ExecutionEngine, PromptBuilder, WorkerReviewer, EscalationEngine, LoopGuard) are constructed but **never wired together** in the execution path.

**The orchestrator test module is empty** — 0 tests for 281 lines of code.

### 3.2 Core Test Coverage

| Module | Has Tests | Approx Count |
|--------|-----------|-------------|
| auto_advancement.rs | Yes | 5 |
| checkpoint_manager.rs | Yes | 7 |
| complexity_classifier.rs | Yes | 11 |
| dependency_analyzer.rs | Yes | 8 |
| escalation.rs | Yes | 7 |
| execution_engine.rs | Yes | 5 |
| fresh_spawn.rs | Yes | 6 |
| loop_guard.rs | Yes | 11 |
| **orchestrator.rs** | **EMPTY** | **0** |
| parallel_executor.rs | Yes | 5 |
| platform_router.rs | Yes | 6 |
| process_registry.rs | Yes | 7 |
| prompt_builder.rs | Yes | 5 |
| session_tracker.rs | Yes | 5 |
| state_machine.rs | Yes | 8 |
| state_persistence.rs | Yes | 6 |
| state_transitions.rs | Yes | 7 |
| tier_node.rs | Yes | 9 |
| worker_reviewer.rs | Yes | 6 |

**19 of 20 modules have tests. Only orchestrator.rs has zero tests.**

---

## 4) Verification System Audit

**Source:** rust-verification-auditor agent

### 4.1 Module Coverage

| Module | TS Path | Rust Equivalent | Status | Feature Parity |
|--------|---------|-----------------|--------|----------------|
| Verifier Interface | `verifiers/verifier.ts` | `verifier.rs` | **Complete** | ~80% |
| Command Verifier | `verifiers/command-verifier.ts` | `command_verifier.rs` | **Complete** | ~40% (missing cwd/env/timeout/patterns) |
| File Exists Verifier | `verifiers/file-exists-verifier.ts` | `file_exists_verifier.rs` | **Complete** | ~90% |
| Regex Verifier | `verifiers/regex-verifier.ts` | `regex_verifier.rs` | **Complete** | ~80% |
| Script Verifier | `verifiers/script-verifier.ts` | `script_verifier.rs` | **Complete** | ~35% (missing args/cwd/env/timeout/PASS token) |
| **AI Verifier** | `verifiers/ai-verifier.ts` | `ai_verifier.rs` | **Complete** | ~30% (CLI shell-out vs platform runner integration) |
| **Browser Verifier** | `verifiers/browser-verifier.ts` | `browser_verifier.rs` | **Stubbed** | ~5% (always returns false, config types only) |
| Gate Runner | `gate-runner.ts` | `gate_runner.rs` | **Complete** | ~70% (missing parallel execution, evidence persistence) |
| **Verification Integration** | `verification-integration.ts` | **MISSING** | **Missing** | 0% |

### 4.2 Key Findings

- **Script Verifier depends on Node**: `script_verifier.rs` maps `"js" => "node"` — shells out to Node for `.js` verification scripts
- **AI Verifier architecture mismatch**: TS uses internal PlatformRegistry; Rust shells out to CLI binaries (`cursor`, `codex`, `claude`, `gemini-cli`, `gh copilot`)
- **All Rust verifiers are synchronous** (TS verifiers are async) — could block thread during long verifications
- **No EvidenceStore integration** in any Rust verifier (TS verifiers persist results to evidence store)

---

## 5) Start-Chain System Audit

### 5.1 Module Coverage

| Module | TS Path | Rust Equivalent | Status |
|--------|---------|-----------------|--------|
| Markdown Parser | `parsers/markdown-parser.ts` | `document_parser.rs` | **Complete** |
| Text Parser | `parsers/text-parser.ts` | `document_parser.rs` | **Complete** |
| **PDF Parser** | `parsers/pdf-parser.ts` | **MISSING** | **Missing** |
| **DOCX Parser** | `parsers/docx-parser.ts` | **MISSING** | **Missing** |
| Requirements Parser | *(implicit)* | `requirements_parser.rs` | **Complete** |
| PRD Generator | `prd-generator.ts` | `prd_generator.rs` | **Complete** |
| Architecture Generator | `arch-generator.ts` | `architecture_generator.rs` | **Complete** (static templates, no AI) |
| Criterion Classifier | `criterion-classifier.ts` | `criterion_classifier.rs` | **Complete** |
| Criterion-to-Script | `criterion-to-script.ts` | `criterion_to_script.rs` | **Complete** (browser/AI placeholders) |
| Multi-Pass Generator | `multi-pass-generator.ts` | `multi_pass_generator.rs` | **Partial** (~40% — analyzes but doesn't generate/improve PRD) |
| Requirements Interviewer | `requirements-interviewer.ts` | `requirements_interviewer.rs` | **Complete** |
| **Requirements Inventory** | `requirements-inventory.ts` | **MISSING** | **Missing** (only prompt template exists) |
| Structure Detector | `structure-detector.ts` | `structure_detector.rs` | **Complete** |
| Validation Gate | `validation-gate.ts` | `validation_gate.rs` | **Complete** |
| Test Plan Generator | `test-plan-generator.ts` | `test_plan_generator.rs` | **Complete** |
| Tier Plan Generator | `tier-plan-generator.ts` | `tier_plan_generator.rs` | **Complete** |
| Traceability | `traceability.ts` | `traceability.rs` | **Complete** |
| Prompt Templates | `prompts/*.ts` (4 files) | `prompt_templates.rs` | **Complete** (consolidated) |
| **AI Gap Validator** | `validators/ai-gap-validator.ts` | **MISSING** | **Missing** |
| Coverage Validator | `validators/coverage-validator.ts` | `prd_validators.rs` | **Complete** |
| No-Manual Validator | `validators/no-manual-validator.ts` | `prd_validators.rs` | **Complete** |
| PRD Quality Validator | `validators/prd-quality-validator.ts` | `prd_validators.rs` | **Complete** |

---

## 6) Audits & Contracts: COMPLETELY MISSING

### 6.1 Audits (`src/audits/` → 0% Rust coverage)

| Module | TS Path | Rust |
|--------|---------|------|
| AI Gap Detector | `src/audits/ai-gap-detector.ts` | **Missing** |
| Contract Validator | `src/audits/contract-validator.ts` | **Missing** |
| Dead Code Detector | `src/audits/dead-code-detector.ts` | **Missing** |
| Integration Path Matrix | `src/audits/integration-path-matrix.ts` | **Missing** |
| Integration Path Validator | `src/audits/integration-path-validator.ts` | **Missing** |
| Platform Compatibility | `src/audits/platform-compatibility.ts` | **Missing** |
| RWM Specific Audit | `src/audits/rwm-specific-audit.ts` | **Missing** |
| Wiring Audit | `src/audits/wiring-audit.ts` | **Missing** |

### 6.2 Contracts (`src/contracts/` → 0% Rust coverage)

| Module | TS Path | Rust |
|--------|---------|------|
| Criterion Types Contract | `src/contracts/criterion-types.contract.ts` | **Missing** |
| Events Contract | `src/contracts/events.contract.ts` | **Missing** |
| PRD Schema Contract | `src/contracts/prd-schema.contract.ts` | **Missing** |

**Total: 11 modules with zero Rust coverage.**

---

## 7) State Management Audit

| TS Module | TS Path | Rust Module | Status |
|-----------|---------|-------------|--------|
| Event Ledger | `src/state/event-ledger.ts` | `event_ledger.rs` | **Complete** |
| Atomic Writer | `src/state/atomic-writer.ts` | `utils/atomic_writer.rs` | **Complete** (moved to utils) |
| *(no TS equivalent)* | — | `prd_manager.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `progress_manager.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `evidence_store.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `usage_tracker.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `agents_manager.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `agents_gate_enforcer.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `agents_multi_level.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `agents_promotion.rs` | Rust-only addition |
| *(no TS equivalent)* | — | `agents_archive.rs` | Rust-only addition |

**Rust state subsystem is LARGER than TS** (11 Rust modules vs 2 TS modules). TS state management is more distributed across other modules; Rust consolidates it.

---

## 8) Platform Integrations Audit

### 8.1 Rust Platform Modules (20 files)

| Rust Module | Purpose | TS Counterpart |
|-------------|---------|----------------|
| `runner.rs` | Base platform runner trait | `base-runner.ts` |
| `registry.rs` | Platform registry | `registry.ts` |
| `cursor.rs` | Cursor runner | `cursor-runner.ts` |
| `claude.rs` | Claude runner | `claude-runner.ts` |
| `codex.rs` | Codex runner | `codex-runner.ts` |
| `gemini.rs` | Gemini runner | `gemini-runner.ts` |
| `copilot.rs` | Copilot runner | `copilot-runner.ts` |
| `output_parser.rs` | Output parsing | `output-parsers/*.ts` (6 files) |
| `health_monitor.rs` | Health monitoring | `health-monitor.ts` |
| `quota_manager.rs` | Quota management | `quota-manager.ts` |
| `circuit_breaker.rs` | Circuit breaker | `circuit-breaker.ts` |
| `capability.rs` | Capability discovery | `capability-discovery.ts` |
| `auth_status.rs` | Auth status | `auth-status.ts` |
| `platform_detector.rs` | Platform detection | `platform-detector.ts` |
| `model_catalog.rs` | Model catalogs | `*-models.ts` (5 files) |
| `rate_limiter.rs` | Rate limiting | *(new in Rust)* |
| `permission_detector.rs` | Permission prompts | `permission-prompt-detector.ts` |
| `permission_audit.rs` | Permission audit log | `permission-audit-logger.ts` |
| `usage_tracker.rs` | Usage tracking | `usage/*.ts` (8 files) |

### 8.2 Missing from Rust

| TS Module | Purpose |
|-----------|---------|
| `copilot-tools.ts` | Copilot tool definitions |
| `copilot-sdk-runner.ts` | Copilot SDK integration |
| `constants.ts` | Platform constants |
| `usage/api-clients/*.ts` (3 files) | Claude/Copilot/Gemini API usage clients |
| `usage/error-parsers/*.ts` (3 files) | Platform-specific error parsers |
| `usage/cli-parsers/*.ts` (4 files) | CLI output parsers for usage data |
| `usage/plan-detection.ts` | Plan tier detection |

**Rust consolidates** TS's per-platform output parsers (6 files) into one `output_parser.rs`, and TS's usage subsystem (8 files) into one `usage_tracker.rs`. However, the per-platform detail is likely lost in consolidation.

---

## 9) Config, Doctor, Logging, Git, Utils, Types

### 9.1 Configuration — FULL COVERAGE

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `config-manager.ts` | `config_manager.rs` | **Complete** |
| `config-override.ts` | `config_override.rs` | **Complete** |
| `default-config.ts` | `default_config.rs` | **Complete** |
| `secrets-manager.ts` | `secrets_manager.rs` | **Complete** |
| `config-schema.ts` | `config_schema.rs` | **Complete** |

### 9.2 Doctor — MOSTLY COMPLETE

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `check-registry.ts` | `check_registry.rs` | **Complete** |
| `doctor-reporter.ts` | `doctor_reporter.rs` | **Complete** |
| `installation-manager.ts` | `installation_manager.rs` | **Complete** |
| `checks/cli-tools.ts` | `checks/cli_checks.rs` | **Complete** |
| `checks/git-check.ts` | `checks/git_checks.rs` | **Complete** |
| `checks/project-check.ts` | `checks/project_checks.rs` | **Complete** |
| `checks/secrets-check.ts` | `checks/secrets_check.rs` | **Complete** |
| `checks/runtime-check.ts` | `checks/runtime_check.rs` | **Complete** |
| `checks/usage-check.ts` | `checks/usage_check.rs` | **Complete** |
| `checks/config-checks.ts` | `checks/config_checks.rs` | **Complete** |
| **`checks/playwright-check.ts`** | **MISSING** | Browser/Playwright check not ported |
| **`checks/platform-compatibility-check.ts`** | **MISSING** | Platform compat check not ported |
| **`checks/wiring-check.ts`** | **MISSING** | Wiring audit check not ported |

### 9.3 Logging — FULL COVERAGE

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `log-streamer.ts` | `log_streamer.rs` | **Complete** |
| `log-retention.ts` | `log_retention.rs` | **Complete** |
| `activity-logger.ts` | `activity_logger.rs` | **Complete** |
| `event-bus.ts` | `event_bus.rs` | **Complete** |
| `iteration-logger.ts` | `iteration_logger.rs` | **Complete** |
| `error-logger.ts` | `error_logger.rs` | **Complete** |
| `intensive-logging.ts` | `intensive_logger.rs` | **Complete** |
| `logger-service.ts` | `logger_service.rs` | **Complete** |

### 9.4 Git — FULL COVERAGE

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `git-manager.ts` | `git_manager.rs` | **Complete** |
| `commit-formatter.ts` | `commit_formatter.rs` | **Complete** |
| `pr-manager.ts` | `pr_manager.rs` | **Complete** |
| `worktree-manager.ts` | `worktree_manager.rs` | **Complete** |
| `branch-strategy.ts` | `branch_strategy.rs` | **Complete** |

### 9.5 Utils — FULL COVERAGE (Rust has more)

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `file-lock.ts` | `file_lock.rs` | **Complete** |
| `project-paths.ts` | `project_paths.rs` | **Complete** |
| *(from state)* | `atomic_writer.rs` | **Complete** |
| *(new)* | `process.rs` | Rust-only addition |

### 9.6 Types — FULL COVERAGE

| TS Module | Rust Module | Status |
|-----------|-------------|--------|
| `state.ts` | `state.rs` | **Complete** |
| `events.ts` | `events.rs` | **Complete** |
| `transitions.ts` | `transitions.rs` | **Complete** |
| `requirements.ts` | `requirements.rs` | **Complete** |
| `evidence.ts` | `evidence.rs` | **Complete** |
| `prd.ts` | `prd.rs` | **Complete** |
| `capabilities.ts` | `capabilities.rs` | **Complete** |
| `config.ts` | `config.rs` | **Complete** |
| `platforms.ts` | `platform.rs` | **Complete** |
| *(new)* | `git.rs` | Rust-only |
| *(new)* | `budget.rs` | Rust-only |
| *(new)* | `start_chain.rs` | Rust-only |
| *(new)* | `doctor.rs` | Rust-only |
| *(new)* | `execution.rs` | Rust-only |
| `usage.ts` | *(in platform.rs)* | Consolidated |
| `tiers.ts` | *(in state.rs)* | Consolidated |
| `requirements-inventory.ts` | **MISSING** | No dedicated type file |
| `gap-detection.ts` | **MISSING** | No gap detection types |

---

## 10) GUI (Iced) Completeness

### 10.1 Views/Pages

The Iced GUI has **15 views** matching the React GUI:

| View | Rust File | Status |
|------|-----------|--------|
| Dashboard | `views/dashboard.rs` | **Renders** |
| Projects | `views/projects.rs` | **Renders** |
| Wizard | `views/wizard.rs` | **Renders** |
| Config | `views/config.rs` | **Renders** |
| Doctor | `views/doctor.rs` | **Renders** |
| Tiers | `views/tiers.rs` | **Renders** |
| Evidence | `views/evidence.rs` | **Renders** |
| Evidence Detail | `views/evidence_detail.rs` | **Renders** |
| Metrics | `views/metrics.rs` | **Renders** |
| History | `views/history.rs` | **Renders** |
| Coverage | `views/coverage.rs` | **Renders** |
| Memory | `views/memory.rs` | **Renders** |
| Ledger | `views/ledger.rs` | **Renders** |
| Login | `views/login.rs` | **Renders** |
| Settings | `views/settings.rs` | **Renders** |

### 10.2 Custom Widgets (10 total)

`icons.rs`, `panel.rs`, `progress_bar.rs`, `help_text.rs`, `budget_donut.rs`, `usage_chart.rs`, `header.rs`, `modal.rs`, `toast.rs`, `status_badge.rs`

### 10.3 TODO Count in GUI

**21 TODO comments in `app.rs`** — many command handlers are stubs:

| Handler | Status |
|---------|--------|
| StartOrchestrator | Sends command to channel (functional if channel exists) |
| PauseOrchestrator | Sends command (same) |
| **RetryItem** | TODO stub |
| **ReplanItem** | TODO stub |
| **ReopenItem** | TODO stub |
| **KillProcess** | TODO stub |
| **CreateProject** | TODO stub |
| **OpenProject** | TODO stub |
| **SaveConfig** | TODO stub |
| **ReloadConfig** | TODO stub |
| **ValidateConfig** | TODO stub |
| **RunAllChecks** | TODO stub |
| **RunCheck** | TODO stub |
| **FixCheck** | TODO stub |
| **WizardFileSelected** | TODO stub |
| **WizardGenerate** | TODO stub |
| **WizardSave** | TODO stub |
| **SelectSession** | TODO stub |
| **WindowCloseRequested** | TODO stub |
| **Tray icon creation** | TODO in `run()` |
| **Orchestrator runtime setup** | TODO in `run()` |

### 10.4 Backend Event Subscription

The backend event receiver and tray action receiver are **commented out** in `subscription()` (lines 749-784). The app currently only has a 1-second timer tick and window close listener.

---

## 11) CLI Parity: COMPLETELY MISSING

### TS CLI Commands (25 commands)

`init`, `start`, `stop`, `pause`, `resume`, `plan`, `replan`, `reopen`, `retry`, `reset`, `status`, `gui`, `doctor`, `config`, `validate`, `coverage`, `evidence`, `history`, `ledger`, `usage`, `metrics`, `models`, `agents`, `checkpoints`, `kill-spawn`, `interview`, `install`, `check`, `check-types`, `login`

### Rust CLI: NONE

`puppet-master-rs/src/main.rs` unconditionally launches the Iced application (`app::run()`). There is:
- No `clap` or `structopt` dependency
- No argument parsing
- No CLI command dispatch
- No headless mode

**The entire CLI surface area (25+ commands) has not been rewritten.**

---

## 12) Overall Scorecard

| Subsystem | TS Modules | Rust Modules | Complete | Partial | Missing | Stubbed | Coverage |
|-----------|-----------|-------------|----------|---------|---------|---------|----------|
| Core | 24 | 20 | 18 | 3 | 2 | 0 | **83%** |
| Verification | 10 | 9 | 7 | 0 | 1 | 1 | **70%** |
| Start-Chain | 22 | 16 | 14 | 1 | 4 | 0 | **68%** |
| Audits | 8 | 0 | 0 | 0 | 8 | 0 | **0%** |
| Contracts | 3 | 0 | 0 | 0 | 3 | 0 | **0%** |
| State | 2 | 11 | 11 | 0 | 0 | 0 | **100%+** |
| Platforms | 75* | 20 | 18 | 0 | 2+ | 0 | **~75%** |
| Config | 5 | 5 | 5 | 0 | 0 | 0 | **100%** |
| Doctor | 13 | 12 | 9 | 0 | 3 | 0 | **75%** |
| Logging | 8 | 8 | 8 | 0 | 0 | 0 | **100%** |
| Git | 5 | 5 | 5 | 0 | 0 | 0 | **100%** |
| Utils | 2 | 4 | 4 | 0 | 0 | 0 | **100%+** |
| Types | 15 | 15 | 13 | 0 | 2 | 0 | **87%** |
| GUI Views | 15** | 15 | 15 | 0 | 0 | 0 | **100%*** |
| CLI | 25 | 0 | 0 | 0 | 25 | 0 | **0%** |

\* TS platforms includes test files, usage sub-modules, and per-platform parsers
\** React GUI components vs Iced views (structural parity, not behavioral)
\*** GUI views render but 21 message handlers are TODO stubs

### Weighted Feature Parity (accounting for stubs and feature gaps)

When considering actual behavioral completeness (not just file existence):

| Area | Estimated True Parity |
|------|----------------------|
| Core (excluding orchestrator) | **~90%** |
| Core orchestrator | **~15%** (state transitions work, execution doesn't) |
| Verification | **~45%** (files exist but feature parity is low) |
| Start-Chain | **~60%** (most generators work but no AI enhancement) |
| Audits + Contracts | **0%** |
| Config / Logging / Git / Utils | **~95%** |
| GUI (visual rendering) | **~90%** |
| GUI (backend wiring) | **~10%** (21 TODO stubs, event subscriptions commented out) |
| CLI | **0%** |

---

## 13) Critical Issues (Priority Order)

### P0 — Blocking

| # | Issue | Impact |
|---|-------|--------|
| 1 | **Orchestrator `execute_tier()` is a stub** | The core product loop does not execute. All tiers auto-pass without running real work. |
| 2 | **Iced version is 0.13.1, not 0.14.0** | Does not meet stated version requirement. |
| 3 | **No CLI exists** | 25+ TS CLI commands have zero Rust equivalents. Users cannot `init`, `plan`, `start`, `doctor`, etc. from terminal. |

### P1 — High

| # | Issue | Impact |
|---|-------|--------|
| 4 | **GUI backend not wired** | 21 TODO stubs in app.rs; event subscription commented out; tray icon not created; orchestrator runtime not initialized. |
| 5 | **Audits/Contracts subsystem missing** (11 modules) | No wiring audit, dead code detection, contract validation, AI gap detection. |
| 6 | **PDF/DOCX parsers missing** | Cannot ingest non-text requirement documents. |
| 7 | **Browser Verifier is a stub** | Cannot run Playwright/browser-based verification. |
| 8 | **Legacy codebase not cleaned up** | ~2200+ TS files, dist/ artifacts, package.json, scripts, README all reference Node. |

### P2 — Medium

| # | Issue | Impact |
|---|-------|--------|
| 9 | Verification feature gaps (cwd/env/timeout missing) | Verifiers work for simple cases but lack rich TS configuration options. |
| 10 | Multi-pass generator doesn't actually generate | Analyzes PRD structure but doesn't improve it with AI passes. |
| 11 | AI Verifier architecture mismatch | Shells out to CLIs vs using platform runner integration. |
| 12 | Script verifier depends on Node for .js | External runtime dependency contradicts Rust-only goal. |
| 13 | CI smoke test is `|| true` | Binary validation is bypassed — broken binaries can ship. |
| 14 | Doctor missing 3 checks | playwright-check, platform-compatibility, wiring-check not ported. |
| 15 | Escalation chain not ported | Multi-step escalation configuration missing. |

### P3 — Low

| # | Issue | Impact |
|---|-------|--------|
| 16 | Container (DI) not ported | Acceptable for Rust (manual wiring), but less flexible. |
| 17 | Requirements Inventory module missing | Heuristic extraction and ID mapping not available. |
| 18 | Output parser partial | Structured output parsing (learnings, files changed) not ported. |
| 19 | All Rust verifiers are synchronous | Could block thread during long-running verifications. |

---

## 14) Appendix: Key Evidence Pointers

| Evidence | Location |
|----------|----------|
| Iced version pin | `puppet-master-rs/Cargo.toml` line 20: `iced = { version = "0.13" ...}` |
| Iced lock version | `puppet-master-rs/Cargo.lock`: `iced 0.13.1` |
| Rust toolchain | `puppet-master-rs/rust-toolchain.toml`: `channel = "1.93.0"` |
| musl config | `puppet-master-rs/.cargo/config.toml`: `+crt-static` for musl |
| CI workflow | `.github/workflows/build-installers.yml`: Rust-only, all 3 platforms |
| Orchestrator stub | `puppet-master-rs/src/core/orchestrator.rs`: `execute_tier()` auto-passes |
| Orchestrator empty tests | `puppet-master-rs/src/core/orchestrator.rs` line 278: `mod tests {}` |
| GUI TODOs | `puppet-master-rs/src/app.rs`: 21 TODO comments |
| Event subscription off | `puppet-master-rs/src/app.rs` lines 749-784: commented out |
| No CLI args | `puppet-master-rs/src/main.rs`: calls `app::run()` directly, no clap |
| Legacy CLI entrypoint | `package.json`: `"puppet-master": "./dist/cli/index.js"` |
| Legacy README | `README.md`: "Prereqs: Node.js 18+ and npm" |
| Script verifier → node | `puppet-master-rs/src/verification/script_verifier.rs` line 28: `"js" => "node"` |
| Browser verifier stub | `puppet-master-rs/src/verification/browser_verifier.rs`: always returns false |
| Missing audits dir | No `puppet-master-rs/src/audits/` directory exists |
| Missing contracts dir | No `puppet-master-rs/src/contracts/` directory exists |
| TS CLI commands | `src/cli/commands/`: 25+ command files |

---

## 15) Bottom Line

The Rust rewrite demonstrates **strong module-level implementation quality** — individual components (loop guard, state machine, execution engine, verifiers, generators, etc.) are genuinely coded with real logic and comprehensive tests. The codebase is well-structured with 130+ Rust source files.

However, the rewrite is **not yet functionally complete**:

1. **The engine doesn't run** — the orchestrator connects to nothing. All the well-implemented components sit unused because `execute_tier()` is a passthrough.
2. **No CLI** — 25+ commands are unported. The binary can only launch a GUI.
3. **The GUI doesn't connect to the backend** — 21 handlers are TODO stubs, event subscriptions are commented out, orchestrator runtime initialization is TODO.
4. **Version compliance fails** on Iced (0.13.1 vs required 0.14.0).
5. **11 entire subsystems** (audits + contracts) have zero Rust presence.
6. **Legacy code** remains fully in the repo, including compiled artifacts, Node-first scripts, and outdated documentation.

**Estimated overall functional completeness: ~45-55%** (high file coverage, low behavioral wiring).
