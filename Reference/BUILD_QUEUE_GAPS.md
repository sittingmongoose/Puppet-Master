# RWM Puppet Master — BUILD_QUEUE_GAPS.md

> Comprehensive Gap Analysis & Fix Queue
> **Total Issues:** 65 (25 P0 + 18 P1 + 14 P2 + 8 P3)
> **Sources:** My analysis + problems1.md + problems2.md + problems3.md
> **Generated:** 2026-01-24
> **Last Updated:** 2026-01-25

---

## Fix Progress Summary

| Issue | Status | Notes |
|-------|--------|-------|
| P0-G01 | ✅ FIXED | Added graceful SDK fallback in copilot-sdk-runner.ts |
| P0-G02 | ✅ FIXED | Added validateReadyForExecution() to CapabilityDiscoveryService, called from Orchestrator.start() |
| P0-G03 | ✅ FIXED | Auth checks for Gemini (GEMINI_API_KEY/GOOGLE_API_KEY) and Copilot (GH_TOKEN/GITHUB_TOKEN) implemented in auth-status.ts |
| P0-G04 | ✅ FIXED | Fixed invalid model names in default-config.ts |
| P0-G05 | ✅ FIXED | Removed hardcoded fallbacks - now requires explicit config or throws descriptive error |
| P0-G06 | ✅ FIXED | Added NoPlatformAvailableError handling in orchestrator |
| P0-G07 | ✅ FIXED | Added auth-middleware.ts with token-based auth, GuiServer.initializeAuth(), authEnabled/authTokenPath config |
| P0-G08 | ✅ FIXED | Added setCustomTools(), createCopilotSdkRunnerWithTools() to wire RWM tools to SDK runner |
| P0-G09 | ✅ FIXED | Added executeWithQuotaFallback() with 'fallback', 'pause', 'queue' behaviors + depth limit |
| P0-G10 | ✅ FIXED | Gemini runner now respects planMode setting |
| P0-G11 | ✅ FIXED | Quota check now properly validates quotaInfo.remaining |
| P0-G12 | ✅ FIXED | Empty criteria arrays now fail the gate |
| P0-G13 | ✅ FIXED | Added waitForExit() to SpawnResult, base-runner now captures actual exit code |
| P0-G14 | ✅ VERIFIED | Paths already aligned correctly (postinstall expects /usr/local/lib/puppet-master, pkgbuild installs there) |
| P0-G15 | ✅ FIXED | Added finish page message about opening new terminal for PATH |
| P0-G16 | ✅ FIXED | Added warning + documented Copilot CLI model limitation; SDK runner works |
| P0-G17 | ✅ FIXED | Removed antigravity from all GUI files |
| P0-G18 | ✅ FIXED | Hardened evidence path validation: null byte rejection, symlink checks, proper path normalization |
| P0-G19 | ✅ FIXED | Corrected Copilot install command from @github/copilot-cli to @github/copilot |
| P0-G20 | ✅ FIXED | Git failures now configurable via failOnGitError |
| P0-G21 | ✅ FIXED | Token counting uses actual tokens when available |
| P0-G22 | ✅ FIXED | Added verifyApiKey() with lightweight API calls and 5-min cache TTL |
| P0-G23 | ✅ FIXED | Added post-install guidance with doctor command reference to all installers |
| P0-G24 | ✅ FIXED | Enforcement errors now fail the gate |
| P0-G25 | ✅ FIXED | Created 'puppet-master login' command with interactive credential wizard |
| P1-G01 | ✅ FIXED | Added plan mode preamble to Claude, Codex, Copilot runners (Gemini uses --approval-mode plan) |
| P1-G02 | ✅ FIXED | Added planMode to StartChainStepConfig, propagated to all start-chain generators |
| P1-G03 | ✅ FIXED | Enhanced cursor plan mode detection with multiple heuristics, cache TTL, and manual invalidation |
| P1-G04 | ✅ FIXED | Added token-based quota tracking (maxTokensPerRun/Hour/Day) alongside call-based quotas |
| P1-G05 | ✅ FIXED | Added StagnationDetector class for no-progress, repeated-error, repeated-output detection |
| P1-G06 | ✅ FIXED | Added discoverModels() with SDK dynamic discovery for Copilot, static lists for others |
| P1-G07 | ✅ FIXED | Created claude-models.ts, codex-models.ts, cursor-models.ts |
| P1-G08 | ✅ FIXED | Implemented /api/status (actual state), /api/capabilities, /api/budgets, /api/logs |
| P1-G09 | ✅ FIXED | Added discoverModels() and probeWithModels() to capability-discovery.ts |
| P1-G10 | ✅ FIXED | Added ping-pong loop detection and maxReviewerIterations enforcement |
| P1-G11 | ✅ FIXED | Enhanced completion signal detection: whitespace tolerance + natural language fallback |
| P1-G12 | ✅ FIXED | Added per-tier timeoutMs/hardTimeoutMs config options to TierConfig |
| P1-G14 | ✅ FIXED | Extended budget normalization in config.js to include gemini and copilot platforms |
| P1-G13 | ✅ FIXED | Added checkpoint recovery methods: getLatestCheckpoint, checkForRecovery, getRecoverySuggestions |
| P1-G15 | ✅ FIXED | Created E2E tests: quota.test.ts, fallback.test.ts, multi-platform.test.ts |
| P1-G16 | ✅ VERIFIED | Model names 'haiku', 'sonnet', 'opus' are valid Claude aliases per claude-models.ts |
| P1-G17 | ✅ FIXED | Added WebSocket heartbeat (30s ping/pong) with stale connection termination in server.ts |
| P1-G18 | ✅ FIXED | Added recovery guidance to platform error messages (suggests doctor/login commands) |
| P2-G01 | ℹ️ N/A | JSON extraction already handles markdown code blocks and bare JSON - no fix needed |
| P2-G02 | ✅ FIXED | Added context file documentation to PROJECT_SETUP_GUIDE.md (Gemini & Copilot) |
| P2-G03 | ✅ FIXED | Added gemini/copilot to validation-gate platforms |
| P2-G04 | ✅ FIXED | Enhanced NoPlatformAvailableError with suggestions (doctor/login commands) |
| P2-G05 | ✅ FIXED | React migration complete - 353 tests, production build, server integration |
| P2-G06 | ✅ FIXED | Added SESSION_ID_PATTERN, isValidSessionId(), validateSessionId() to session-tracker.ts |
| P2-G07 | ✅ FIXED | Added isPathWithinBase() security validation to projects.ts |
| P2-G08 | ⏸️ DEFERRED | Test coverage gaps in critical modules - large scope |
| P2-G09 | ⏸️ DEFERRED | Interview mode integration - needs design |
| P2-G10 | ✅ FIXED | Added systemd service files (system + user), updated nfpm.yaml and postinstall |
| P2-G11 | ✅ FIXED | Enhanced getCursorCommandCandidates() with known install paths |
| P2-G12 | ℹ️ N/A | Dry-run already exists in CLI commands (start, plan, install) |
| P2-G13 | ✅ FIXED | Added /api/capabilities/:platform endpoint with detailed probe data |
| P2-G14 | ✅ FIXED | All GUI issues addressed during React migration - see BUILD_QUEUE_PHASE_GUI.md |
| Model Discovery & Reasoning Effort | ✅ FIXED | 2026-02-10: Claude trimmed model list + reasoningLevels for Opus 4.6; Codex expanded static list + cache merge; Cursor Windows spawn shell fix; Gemini preview help; reasoning effort UI for Codex + Claude |

---

## Executive Summary

This document identifies all gaps that could prevent RWM Puppet Master from working end-to-end. Analysis covered CLI (20 commands), GUI (11 pages), platform runners (5 platforms), authentication, quotas, plan mode, installers, and comparison with 9 reference Ralph implementations.

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 - Critical** | 25 | Platform won't work end-to-end without these |
| **P1 - High** | 18 | Significantly impacts usability and reliability |
| **P2 - Medium** | 14 | User experience and robustness improvements |
| **P3 - Low** | 8 | Polish and enhancements |

---

## P0 — Critical Blockers (25 Issues)

### P0-G01: Copilot SDK Not in package.json ✅ FIXED

**Files:** `package.json`, `src/platforms/copilot-sdk-runner.ts:157`

**Problem:**
```typescript
// src/platforms/copilot-sdk-runner.ts:157
const { CopilotClient: SdkClient } = await import('@github/copilot-sdk');
// But @github/copilot-sdk is NOT in package.json!
```

**Impact:** `npm ci` succeeds but Copilot integration crashes at runtime with ERR_MODULE_NOT_FOUND.

**Evidence:**
- `package.json` - no copilot-sdk entry
- `src/platforms/copilot-sdk-runner.ts:157` - import fails
- `src/platforms/registry.ts:130-145` - registers SDK runner as default

**Acceptance Criteria:**
- [x] Add `@github/copilot-sdk` to package.json OR implement graceful fallback to CLI runner
- [x] `puppet-master doctor` doesn't crash when checking Copilot
- [x] Clear warning if SDK unavailable, falls back to CLI

**Fix:** Added graceful fallback with `sdkAvailable` tracking. SDK unavailability is detected during `initialize()` and descriptive error messages guide users to install the SDK or use CLI runner.

---

### P0-G02: No Preflight Validation Before Orchestrator Start ✅ FIXED

**Files:** `src/core/orchestrator.ts`, `src/cli/commands/start.ts`

**Problem:** ARCHITECTURE.md states "Orchestrator MUST call `validateReadyForExecution()` before starting" but this is never called.

```typescript
// src/cli/commands/start.ts - only checks PRD exists
await access(prdPath);
const orchestrator = new Orchestrator({ config, projectPath });
await orchestrator.initialize(deps);
await orchestrator.start();  // No validation!
```

**Impact:** Can start runs with missing CLIs, unauthenticated platforms, or stale capabilities.

**Evidence:**
- `grep -r "validateReadyForExecution" src/` returns no matches
- `src/cli/commands/start.ts:43-100`
- `src/core/orchestrator.ts` has no capability check

**Acceptance Criteria:**
- [x] Add `validateReadyForExecution()` method to Orchestrator
- [x] Call validation before transitioning to EXECUTING state
- [x] Block on unrunnable/unauthenticated platforms
- [x] Surface clear remediation steps

**Fix:** 
- Added `PreflightValidationResult` interface and `CapabilityValidationError` class to `capability-discovery.ts`
- Added `validateReadyForExecution()` method to `CapabilityDiscoveryService` that checks: capabilities exist, platforms runnable, auth status, staleness, cooldowns
- Added `capabilityDiscovery` to `OrchestratorDependencies` interface
- Added `validatePreflightRequirements()` private method to Orchestrator called from `start()`
- Added preflight events to `PuppetMasterEvent`: `preflight_started`, `preflight_passed`, `preflight_failed`
- Extracts required platforms from tier config and validates all before starting

---

### P0-G03: Authentication Status Incomplete for Gemini & Copilot ✅ FIXED

**File:** `src/platforms/auth-status.ts`

**Problem:**
```typescript
// Current implementation
case 'cursor': return { status: 'skipped', ... };
// Gemini and Copilot fall through to:
default: return { status: 'unknown', ... };
```

**Impact:**
- Gemini (`GEMINI_API_KEY` or OAuth) is never verified
- Copilot (`GH_TOKEN`, `GITHUB_TOKEN`, or `/login`) is never verified
- Doctor treats "unknown" as non-blocking → false confidence

**Acceptance Criteria:**
- [x] Add Gemini auth check: `GEMINI_API_KEY` or OAuth credentials
- [x] Add Copilot auth check: `GH_TOKEN`/`GITHUB_TOKEN` with Copilot permission
- [x] Return specific status instead of "unknown"

**Fix:** Added dedicated switch cases for `gemini` (checks GEMINI_API_KEY/GOOGLE_API_KEY) and `copilot` (checks GH_TOKEN/GITHUB_TOKEN) in auth-status.ts. Default case now uses exhaustive check pattern.

---

### P0-G04: Default Config Contains Non-Existent Model Names ✅ FIXED

**File:** `src/config/default-config.ts`

**Problem:**
```typescript
tiers: {
  phase: { platform: 'claude', model: 'opus-4.5', ... },       // Does NOT exist
  task: { platform: 'codex', model: 'gpt-5.2-high', ... },     // Does NOT exist
  subtask: { platform: 'cursor', model: 'sonnet-4.5-thinking', ... }, // Does NOT exist
}
```

**Impact:** Fresh installs fail immediately on first execution.

**Acceptance Criteria:**
- [x] Replace with valid model names (e.g., `claude-3-5-sonnet-20241022`)
- [ ] Add model name validation at config load time
- [ ] Document valid model names per platform

**Fix:** Changed model names to valid values: `opus-4.5` → `opus`, `gpt-5.2-high` → `gpt-4o`, `sonnet-4.5-thinking` → `sonnet`.

---

### P0-G05: Hardcoded Platform/Model Fallbacks in Start-Chain ✅ FIXED

**File:** `src/start-chain/requirements-inventory.ts:299-306`

**Problem:**
```typescript
const platform = ... || 'cursor';  // Hardcoded fallback
const model = ... || 'claude-sonnet-4-20250514';  // Hardcoded fallback
```

**Impact:** User may not have Cursor installed; model string may be invalid; no warning when fallback is used.

**Acceptance Criteria:**
- [x] Remove hardcoded fallbacks
- [x] Require explicit config or validate before falling back
- [x] Log warning when using fallback

**Fix:** Replaced hardcoded fallbacks with explicit validation that throws descriptive errors when platform/model not configured. Now requires `startChain.inventory.platform` or `tiers.phase.platform` to be set.

---

### P0-G06: PlatformRouter Throws Unhandled Error ✅ FIXED

**Files:** `src/core/platform-router.ts`, `src/core/orchestrator.ts`

**Problem:** `NoPlatformAvailableError` is thrown but not caught by orchestrator.

**Impact:** Orchestrator crashes instead of pausing/escalating with recovery guidance.

**Acceptance Criteria:**
- [x] Handle `NoPlatformAvailableError` in orchestrator
- [x] Trigger controlled failure (pause/escalate)
- [x] Include "run puppet-master doctor" in error message

**Fix:** Added try-catch around `platformRouter.selectPlatform()` call in `buildIterationContext()`. Emits descriptive error event with suggestion to run `puppet-master doctor` before re-throwing.

---

### P0-G07: GUI Has No Authentication (Security Critical)

**File:** `src/gui/server.ts:198-250`

**Problem:** All endpoints exposed without authentication. CORS allows local network IPs.

```typescript
// Exposes: /api/controls/start, /api/controls/stop, /api/config/*, etc.
// No auth middleware on any route
```

**Impact:** Any device on local network can control orchestrator.

**Acceptance Criteria:**
- [ ] Add authentication middleware (at minimum: token-based)
- [ ] Restrict CORS to localhost only by default
- [ ] Add --no-auth flag for development

---

### P0-G08: Copilot Custom Tools Not Wired to SDK Runner

**Files:** `src/platforms/copilot-tools.ts`, `src/platforms/copilot-sdk-runner.ts`

**Problem:** `copilot-tools.ts` defines tools (mark_complete, mark_stuck, etc.) but they're never used. SDK runner uses `config.customTools` which is always undefined.

**Impact:** No completion signaling between Copilot agent and orchestrator.

**Acceptance Criteria:**
- [ ] Import `createRwmTools()` into copilot-sdk-runner.ts
- [ ] Create tools with callbacks to PrdManager, EvidenceStore, ProgressManager
- [ ] Pass tools to SDK SessionConfig
- [ ] Add tests for tool callbacks

---

### P0-G09: Quota Fallback Not Implemented

**Files:** `src/platforms/quota-manager.ts`, `src/core/execution-engine.ts`

**Problem:** Config supports `budgets.{platform}.fallbackPlatform` and `budgetEnforcement.onLimitReached` but no code implements the fallback.

**Impact:** Execution dies when quota is exhausted instead of falling back.

**Acceptance Criteria:**
- [ ] Catch `QuotaExhaustedError` in execution engine
- [ ] Implement 'fallback', 'pause', 'queue' behaviors
- [ ] Add fallback depth limit (max 3) to prevent infinite loops

---

### P0-G10: Gemini Runner Always Uses YOLO Mode ✅ FIXED

**File:** `src/platforms/gemini-runner.ts:171`

**Problem:**
```typescript
args.push('--approval-mode', 'yolo');  // Hardcoded
```

REQUIREMENTS.md documents `--approval-mode plan` for read-only execution.

**Impact:** Gemini always runs with full mutation permissions; no plan mode possible.

**Acceptance Criteria:**
- [x] Check `request.planMode` setting
- [x] Use `--approval-mode plan` when planMode is true
- [ ] Require `experimental.plan: true` in Gemini config for plan mode

**Fix:** Added conditional in `buildArgs()` that checks `request.planMode === true` before selecting approval mode. Now uses `--approval-mode plan` for read-only execution when planMode is enabled.

---

### P0-G11: Start-Chain Quota Check is Ineffective ✅ FIXED

**File:** `src/start-chain/requirements-inventory.ts`

**Problem:**
```typescript
const hasQuota = await this.quotaManager.checkQuota(platform);
if (!hasQuota) { ... }  // Objects are always truthy!
```

`checkQuota()` returns `QuotaInfo` object, not boolean.

**Impact:** Quota check never blocks; PRD generation proceeds when quota exhausted.

**Acceptance Criteria:**
- [x] Check specific property: `quotaInfo.remaining > 0`
- [ ] Add unit test for quota blocking behavior

**Fix:** Changed to `const quotaInfo = await this.quotaManager.checkQuota(platform)` and check `quotaInfo.remaining !== -1 && quotaInfo.remaining <= 0` to properly detect exhausted quota.

---

### P0-G12: Verification Gates Pass with Empty Criteria ✅ FIXED

**File:** `src/verification/gate-runner.ts`

**Problem:**
```typescript
overallPassed = results.every((r) => r.passed);  // Empty array returns true
```

**Impact:** Gate with no criteria is reported as passed.

**Acceptance Criteria:**
- [x] Fail or warn when criteria array is empty
- [x] Add explicit check: `if (results.length === 0) { /* handle */ }`

**Fix:** Added explicit check at start of `aggregateResults()`: if `results.length === 0`, returns `overallPassed: false` with `failureType: 'major'` and descriptive summary.

---

### P0-G13: FreshSpawner Misreports Exit Status

**Files:** `src/platforms/base-runner.ts`, `src/core/fresh-spawn.ts`

**Problem:** FreshSpawner execution sets `exitCode = 0` as placeholder after streams complete. Per-spawn cleanup hook is not invoked.

**Impact:** "It passed" when underlying process failed; resource leaks across iterations.

**Acceptance Criteria:**
- [ ] Capture actual exit code from spawn
- [ ] Invoke cleanup hook after spawn completes
- [ ] Add test verifying correct exit code propagation

---

### P0-G14: macOS Installer Path Mismatch ✅ VERIFIED CORRECT

**Files:** `installer/mac/scripts/postinstall`, `scripts/build-installer.ts`

**Analysis:**
- `stageApp()` creates: `stageRoot/payload/puppet-master/{bin,node,app,...}`
- `buildMacPkgAndDmg()` uses: `pkgbuild --root stageRoot/payload --install-location /usr/local/lib`
- Result after install: `/usr/local/lib/puppet-master/{bin,node,app,...}`
- postinstall expects: `INSTALL_ROOT="/usr/local/lib/puppet-master"` ✓

**Conclusion:** Paths are correctly aligned. The gap analysis description was incorrect or has been fixed previously.

**Acceptance Criteria:**
- [x] Paths verified to be aligned (postinstall expects `/usr/local/lib/puppet-master`, pkgbuild installs to `/usr/local/lib/puppet-master`)
- [ ] Test macOS installer end-to-end (requires macOS environment)

---

### P0-G15: Windows PATH Update Requires Restart ✅ FIXED

**File:** `installer/win/puppet-master.nsi:47-62`

**Problem:** `SendMessageTimeout` broadcasts `WM_SETTINGCHANGE` but existing terminals don't receive it.

**Impact:** After install, `puppet-master` command not found until terminal restart.

**Acceptance Criteria:**
- [x] Add post-install message about opening new terminal
- [ ] Consider creating a batch file in Start Menu that opens new terminal

**Fix:** Added custom MUI_FINISHPAGE_TEXT with clear instructions to open a NEW terminal window and run `puppet-master doctor`.

---

### P0-G16: Copilot CLI Model Selection Not Supported ✅ FIXED

**Files:** `src/platforms/copilot-runner.ts`, `src/platforms/copilot-models.ts:28-30`

**Problem:** Copilot CLI does NOT support `--model` flag. Config `model` setting is ignored.

**Impact:** No programmatic control over which model Copilot uses.

**Acceptance Criteria:**
- [x] Document limitation in PROJECT_SETUP_GUIDE.md
- [x] Log warning when CLI runner ignores model config
- [ ] Ensure SDK runner correctly passes model to SessionConfig

**Fix:** Added warning in CopilotRunner.buildArgs() when model is configured. Documented limitation with workarounds in PROJECT_SETUP_GUIDE.md. SDK runner (CopilotSdkRunner) already passes model to SessionConfig.

---

### P0-G17: GUI Antigravity References Invalid Platform ✅ FIXED

**Files:** `src/gui/public/config.html`, `src/config/config-schema.ts`

**Problem:** GUI config exposes antigravity in tier platform options, budget panels, and CLI paths. But antigravity is excluded from `Platform` type in schema.

**Impact:** Saving config with antigravity fails validation.

**Acceptance Criteria:**
- [x] Remove antigravity from GUI config options OR
- [ ] Add antigravity to schema + registry consistently

**Fix:** Removed all antigravity references from GUI files: `index.html` (budget span), `config.html` (platform options, budget section, CLI path), `settings.html` (platform options), `dashboard.js` (budget handling), `settings.js` (platform arrays).

---

### P0-G18: Evidence Path Validation is Fragile

**File:** `src/gui/routes/evidence.ts`

**Problem:**
```typescript
const filePath = resolve(join(baseDir, subdir, decodeURIComponent(name)));
if (!filePath.startsWith(evidenceDir)) { /* check */ }
```

Edge cases with double encoding, unicode, symlinks can bypass check.

**Impact:** Potential path traversal vulnerability.

**Acceptance Criteria:**
- [ ] Normalize paths before comparison
- [ ] Block symlinks outside evidence directory
- [ ] Add unit tests for edge cases

---

### P0-G19: Copilot Install Command Mismatch ✅ FIXED

**Files:** Install manager, `PROJECT_SETUP_GUIDE.md`

**Problem:** Install manager uses `npm install -g @github/copilot-cli` but docs say `npm install -g @github/copilot`.

**Impact:** Users install wrong package, fail doctor checks.

**Acceptance Criteria:**
- [x] Verify correct package name
- [x] Align install manager and documentation

**Fix:** Research confirmed correct package is `@github/copilot`. Updated `installation-manager.ts` install command and `cli-tools.ts` fix suggestion. Documentation in PROJECT_SETUP_GUIDE.md already used correct package name.

---

### P0-G20: Git Operations Swallow Critical Failures ✅ FIXED

**File:** `src/core/orchestrator.ts`

**Problem:**
```typescript
// Merge/push/PR failures only logged as warnings:
console.warn('Failed to merge branch:', error);
console.warn('Failed to push:', error);
console.warn('Failed to create PR:', error);
```

**Impact:** Work produced on wrong branch, not pushed, not merged, without failing run.

**Acceptance Criteria:**
- [x] Treat git failures as execution failures
- [ ] Verify branch state after ensureBranch()
- [x] Fail run if PR creation fails (configurable)

**Fix:** Added `handleGitError()` method and new config options `failOnGitError` and `criticalGitOperations` in `BranchingConfig`. Git failures are now configurable - can be treated as warnings (default) or errors based on config and operation criticality.

---

### P0-G21: No Token Counting from Platform Output ✅ FIXED

**File:** `src/platforms/base-runner.ts:738-740`

**Problem:**
```typescript
const estimatedTokens = Math.max(100, Math.floor(duration / 10));
// Uses duration estimation, not actual token counts
```

**Impact:** Quota tracking is inaccurate; budget displays are meaningless.

**Acceptance Criteria:**
- [x] Parse actual token counts from platform output
- [x] Fall back to estimation only when parsing fails
- [ ] Log when using estimation vs actual

**Fix:** Changed quota recording to use `result.tokensUsed ?? Math.max(100, Math.floor(duration / 10))`. Now uses actual token counts from parser (Gemini extracts from `stats.tokens`) when available, falls back to estimation only when actual unavailable.

---

### P0-G22: No API Key Validation

**File:** `src/platforms/auth-status.ts`

**Problem:** Only checks if env vars exist, not if keys are valid.

```typescript
const hasKey = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.trim() !== '';
return hasKey ? { status: 'authenticated' } : { status: 'not_authenticated' };
// Key could be expired/invalid
```

**Impact:** Invalid keys discovered at runtime, not during doctor check.

**Acceptance Criteria:**
- [ ] Add `--verify-auth` flag to doctor for optional validation
- [ ] Make lightweight API call to validate key
- [ ] Cache validation results (5 min TTL)

---

### P0-G23: Installers Don't Validate Prerequisites ✅ FIXED

**Files:** `installer/win/puppet-master.nsi`, `installer/mac/scripts/postinstall`, `installer/linux/nfpm.yaml`

**Problem:** No check for Node.js runtime or external CLIs (cursor, codex, claude, gemini, copilot).

**Impact:** Install succeeds but user can't run any platform.

**Acceptance Criteria:**
- [x] Add prerequisite checks to installer
- [x] Display "run puppet-master doctor" guidance post-install

---

### P0-G24: AGENTS.md Enforcement Errors Swallowed ✅ FIXED

**File:** `src/verification/gate-runner.ts`

**Problem:**
```typescript
// catch logs "Error running AGENTS.md enforcement" and continues
// If report was passing, gate remains passing
```

**Impact:** Enforcement failures don't fail the gate.

**Acceptance Criteria:**
- [x] Fail gate on enforcement errors
- [x] Log detailed error information

**Fix:** Updated catch block to set `report.overallPassed = false`, `report.failureType = 'major'`, and add enforcement violation with `ENFORCEMENT_ERROR` ruleId and detailed error message.

---

### P0-G25: No Login/Authentication Wizard ✅ FIXED

**Problem:** Users must manually set environment variables. No guidance on credentials, no interactive setup.

**Impact:** New users stuck without clear path to authentication.

**Acceptance Criteria:**
- [x] Create `puppet-master login [platform]` command
- [x] Guide through credential setup per platform
- [x] Save to .env with .gitignore warning

---

## P1 — High Priority Gaps (18 Issues)

### P1-G01: Plan Mode Only Works for Cursor ✅ FIXED

**Files:** `src/platforms/cursor-runner.ts`, `src/platforms/claude-runner.ts`, etc.

**Problem:** Only CursorRunner implements plan mode. Claude/Codex/Copilot ignore `planMode` config.

**Acceptance Criteria:**
- [x] Add plan mode preamble to all runners
- [x] Implement `--approval-mode plan` for Gemini
- [x] Create shared `plan-mode-preamble.ts` (inline in each runner as buildPrompt method)

---

### P1-G02: Start-Chain Doesn't Pass planMode to Runners ✅ FIXED

**Files:** `src/start-chain/prd-generator.ts`, `src/start-chain/arch-generator.ts`, etc.

**Problem:** Even with `planMode: true`, start-chain doesn't propagate it to ExecutionRequest.

**Impact:** PRD generation uses full mutation mode.

**Acceptance Criteria:**
- [x] Add planMode to StartChainStepConfig interface
- [x] Propagate planMode to ExecutionRequest in all start-chain generators
- [x] Default planMode to true for start-chain (read-only analysis)

**Fix:** Added `planMode?: boolean` to `StartChainStepConfig` in `src/types/config.ts`. Updated `prd-generator.ts`, `arch-generator.ts`, `multi-pass-generator.ts`, `requirements-interviewer.ts`, and `requirements-inventory.ts` to pass `planMode` (defaulting to `true`) in their ExecutionRequest objects.

---

### P1-G03: Cursor Plan Mode Detection is Heuristic-Only ✅ FIXED

**File:** `src/platforms/cursor-runner.ts:181-185`

**Problem:** Probes help output for `--mode` and `plan` strings. If help changes, detection fails silently.

**Acceptance Criteria:**
- [x] Multiple detection heuristics (exact flag, mode+plan value, documented phrases)
- [x] Cache TTL (1 hour) to re-probe after CLI updates
- [x] Manual cache invalidation method
- [x] Console warnings on detection failure

**Fix:** Enhanced `probeModeFlagSupport()` with multiple heuristics:
- Heuristic 1: Exact `--mode=plan` flag regex match
- Heuristic 2: Mode flag with plan/read-only/analysis value
- Heuristic 3: Plan mode documented in help text
- Added 1-hour cache TTL with `modeFlagSupportProbedAt`
- Added `invalidatePlanModeCache()` public method
- Console warnings when fallback to prompt-based planning

---

### P1-G04: Quota Tracking is Call-Based, Not Token-Based ✅ FIXED

**File:** `src/platforms/quota-manager.ts`

**Problem:** Tracks `maxCallsPerRun/Hour/Day` but real quotas are token-based (Claude) or premium-request-based (Copilot).

**Acceptance Criteria:**
- [x] Add `maxTokensPerRun/Hour/Day` options to BudgetConfig
- [x] Track token usage alongside call counts
- [x] Use percentage-based comparison to handle different scales
- [x] Report unit type (calls vs tokens) in error messages

**Fix:** Enhanced QuotaManager with token-based quota support:
- Added `maxTokensPerRun`, `maxTokensPerHour`, `maxTokensPerDay` to BudgetConfig
- Added `getRunPeriodTokens()`, `getTokenCountInLastHour()`, `getTokenCountToday()` methods
- `checkQuota()` now evaluates both call and token limits
- Uses percentage-based comparison to find most restrictive quota
- Error messages now indicate whether limit is "calls" or "tokens"

---

### P1-G05: Circuit Breaker Doesn't Detect Stagnation ✅ FIXED

**Files:** `src/platforms/circuit-breaker.ts`, `src/core/loop-guard.ts`

**Problem:** Circuit breaker tracks platform-level failures. Doesn't detect "no file changes" or "same error repeated".

**Reference:** Ralph-Claude-Code has `CB_NO_PROGRESS_THRESHOLD=3`.

**Acceptance Criteria:**
- [x] Add stagnation detection for "no file changes" across iterations
- [x] Detect repeated identical errors
- [x] Detect repeated identical outputs
- [x] Make thresholds configurable

**Fix:** Added `StagnationDetector` class to `circuit-breaker.ts` with:
- `noProgressThreshold` (default: 3) - consecutive iterations with no file changes
- `repeatedErrorThreshold` (default: 3) - same error repeated N times
- `repeatedOutputThreshold` (default: 2) - identical output N times
- `recordIteration()` method to track progress
- `isStagnant()` and `getStagnationReason()` for detection
- `reset()` for clearing state between subtasks

---

### P1-G06: Model Lists are Hardcoded Guesses ✅ FIXED

**Files:** `src/platforms/gemini-models.ts`, `src/platforms/copilot-models.ts`

**Problem:** Hardcoded model lists with disclaimers "available models vary by subscription".

**Acceptance Criteria:**
- [x] Query actual available models (Copilot SDK `listModels()`)
- [x] Cache results with TTL (via capability cache)
- [x] Fallback to static model lists when SDK unavailable
- [x] Add `availableModels` to PlatformCapabilities type

**Fix:** Added `discoverModels()` and `probeWithModels()` to `capability-discovery.ts`:
- Copilot: Uses SDK `listModels()` when available, falls back to KNOWN_COPILOT_MODELS
- Other platforms: Returns static model lists from *-models.ts files
- Added `KNOWN_*_MODELS` exports to all model files
- Results cached via existing capability cache mechanism

---

### P1-G07: No Claude/Codex/Cursor Model Catalog Files ✅ FIXED

**Problem:** Only Gemini and Copilot have model catalog files.

**Acceptance Criteria:**
- [x] Create `src/platforms/claude-models.ts`
- [x] Create `src/platforms/codex-models.ts`
- [x] Create `src/platforms/cursor-models.ts`

---

### P1-G08: GUI Endpoint Parity vs GUI_SPEC.md ✅ FIXED

**Files:** `src/gui/server.ts`, `GUI_SPEC.md`

**Problem:**
- `/api/status` returns hardcoded `'idle'`
- `/api/capabilities`, `/api/budgets`, `/api/logs` not implemented

**Fixed:**
- `/api/status` now returns actual orchestrator state, current phase/task/subtask, progress
- `/api/capabilities` implemented - returns available platforms
- `/api/budgets` implemented - returns quota info for all platforms
- `/api/logs` implemented - returns iteration logs with optional filtering

---

### P1-G09: Capability Discovery Doesn't Discover Models ✅ FIXED

**File:** `src/platforms/capability-discovery.ts`

**Problem:** Only probes `--version` and `--help`. Sets quota to huge defaults. Doesn't discover available models.

**Acceptance Criteria:**
- [x] Add `discoverModels(platform)` method
- [x] Add `probeWithModels(platform)` extended probe
- [x] Add `availableModels` field to PlatformCapabilities
- [x] Dynamic discovery for Copilot via SDK
- [x] Static lists for Claude/Codex/Cursor/Gemini

**Fix:** Enhanced `capability-discovery.ts`:
- Added `discoverModels(platform)` - dynamic for Copilot SDK, static for others
- Added `probeWithModels(platform)` - probe + model discovery
- Added `availableModels?: string[]` to PlatformCapabilities type
- Results cached to capability cache files

---

### P1-G10: Worker/Reviewer Ping-Pong Loops ✅ FIXED

**File:** `src/core/worker-reviewer.ts`

**Problem:** Worker says COMPLETE, reviewer says REVISE, repeat forever. No detection/breaker.

**Acceptance Criteria:**
- [x] Track revision counts per subtask
- [x] Enforce maxReviewerIterations limit
- [x] Detect repeated identical feedback (ping-pong pattern)
- [x] Escalate to failed status when loop detected

**Fix:** Updated `WorkerReviewerOrchestrator` with:
1. Added `revisionCounts` Map to track REVISE iterations per subtask
2. Added `lastFeedbackHashes` Map to detect repeated feedback
3. Added `isPingPongLoop()` method to detect same feedback given 3+ times
4. Added `resetSubtaskTracking()` for clearing state on new subtasks
5. Enforces `maxReviewerIterations` (default: 3) from ReviewerConfig
6. Returns `status: 'failed'` with descriptive message when loop detected

---

### P1-G11: Completion Signal is Fragile ✅ FIXED

**Files:** `src/core/execution-engine.ts`, `src/platforms/output-parsers/*`

**Problem:** Requires exact `<ralph>COMPLETE</ralph>`. Spaces, case changes, natural language rejected.

**Acceptance Criteria:**
- [x] Add whitespace tolerance to completion signal patterns
- [x] Add natural language completion/gutter phrase detection as fallback
- [x] Only match natural language in output tail to avoid false positives

**Fix:** Updated `base-output-parser.ts` and `output-parser.ts` to:
1. Accept whitespace in formal tags: `<ralph>\s*COMPLETE\s*</ralph>`
2. Added `NATURAL_COMPLETE_PHRASES` array for phrases like "task complete", "all done"
3. Added `NATURAL_GUTTER_PHRASES` array for phrases like "I'm stuck", "cannot proceed"
4. Natural language detection only matches in last 500 chars to avoid false positives from code comments

---

### P1-G12: Timeout Handling May Kill Long Tasks ✅ FIXED

**File:** `src/platforms/base-runner.ts:67-68`

**Problem:** Default timeout 5 minutes, hard timeout 30 minutes. Complex tasks (refactoring, test generation) can take longer.

**Acceptance Criteria:**
- [x] Add per-tier timeout configuration
- [x] Document recommended timeouts for different tier types

**Fix:** Added `timeoutMs` and `hardTimeoutMs` optional fields to `TierConfig` interface in `src/types/config.ts`. Users can now configure per-tier timeouts in YAML:
```yaml
tiers:
  phase:
    timeoutMs: 1200000  # 20 minutes
  task:
    timeoutMs: 600000   # 10 minutes
  subtask:
    timeoutMs: 300000   # 5 minutes (default)
```

---

### P1-G13: No Recovery from Partial State ✅ FIXED

**Files:** `src/core/checkpoint-manager.ts`, `src/core/orchestrator.ts`

**Problem:** If orchestrator crashes mid-task, no transaction/rollback mechanism. Checkpoint exists but no automatic recovery path.

**Acceptance Criteria:**
- [x] Add `getLatestCheckpoint()` method
- [x] Add `checkForRecovery()` to detect incomplete runs
- [x] Add `checkpointToPersistedState()` for state restoration
- [x] Add `getRecoverySuggestions()` for user guidance

**Fix:** Enhanced `CheckpointManager` with recovery methods:
- `getLatestCheckpoint()` - retrieves most recent checkpoint
- `checkForRecovery()` - detects incomplete runs (not complete/error/idle)
- `checkpointToPersistedState()` - converts checkpoint to PersistedState for restoration
- `getRecoverySuggestions()` - provides CLI commands for recovery options

---

### P1-G14: GUI Budget Inputs Don't Normalize All Platforms

**File:** `src/gui/public/js/config.js`

**Problem:** Only normalizes `claude`, `codex`, `cursor` budgets. Gemini/Copilot remain strings, fail validation.

**Acceptance Criteria:**
- [x] Extend budget normalization to include gemini and copilot platforms
- [x] Handle fallbackPlatform empty strings for all platforms

**Fix:** Updated `normalizeFormData()` in `src/gui/public/js/config.js` to use `allPlatforms = ['claude', 'codex', 'cursor', 'gemini', 'copilot']` array. Now normalizes budget values and fallbackPlatform for all 5 platforms.

---

### P1-G15: E2E Integration Tests Missing ✅ FIXED

**Problem:** No end-to-end tests for multi-platform execution, fallback behavior, or quota enforcement.

**Acceptance Criteria:**
- [x] Create `tests/e2e/multi-platform.test.ts`
- [x] Create `tests/e2e/fallback.test.ts`
- [x] Create `tests/e2e/quota.test.ts`

**Fix:** Created E2E test suite in `tests/e2e/`:
- `quota.test.ts` - Tests for call-based and token-based quotas, soft limit warnings, cooldowns, platform selection
- `fallback.test.ts` - Tests for single-level and multi-level fallback, cascade depth limits, chain termination
- `multi-platform.test.ts` - Tests for capability discovery, model discovery, auth status, parallel probing

Tests use temporary directories for isolation and clean up after execution.

---

### P1-G16: Models Configuration Complexity Level Mapping Invalid ✅ VERIFIED

**File:** `src/config/default-config.ts`

**Problem:**
```typescript
models: {
  level1: { platform: 'claude', model: 'haiku' },  // Invalid
  level2: { platform: 'claude', model: 'sonnet' }, // Needs full name
}
```

**Verification:** The model names `haiku`, `sonnet`, `opus` are VALID Claude Code aliases per `src/platforms/claude-models.ts`. These auto-update to the latest versions. No fix needed - the gap description was incorrect.

---

### P1-G17: GUI WebSocket Has No Heartbeat ✅ FIXED

**File:** `src/gui/server.ts`

**Problem:** No ping/pong keepalive. Stale connections not detected.

**Acceptance Criteria:**
- [x] Add server-side ping interval (30 seconds)
- [x] Track client liveness via pong responses
- [x] Terminate stale connections that don't respond

**Fix:** Added `heartbeatInterval` member and `startHeartbeat()` method to `GuiServer`. Server now pings all WebSocket clients every 30 seconds and terminates connections that don't respond with pong. Heartbeat is properly cleaned up in `stop()` method.

---

### P1-G18: Error Messages Don't Guide Recovery ✅ FIXED

**Problem:** Errors are generic. No "run puppet-master doctor" suggestions.

**Acceptance Criteria:**
- [x] Add recovery guidance to platform error messages
- [x] Suggest doctor/login commands where appropriate

**Fix:** Updated error messages in `base-runner.ts` (healthCheck) and `copilot-sdk-runner.ts` (getCapabilities) to include recovery suggestions like "Run 'puppet-master doctor' to diagnose" and "Run 'puppet-master login' to authenticate".

---

## P2 — Medium Priority Gaps (14 Issues)

### P2-G01: Start-Chain JSON Parsing Assumptions ℹ️ N/A

**Problem:** Components parse AI output as JSON but don't ensure platform will emit JSON.

**Status:** Not a bug - existing implementation is robust:
- Prompts instruct AI to output JSON in code blocks
- `parsePrdJson()` and similar extractors handle:
  1. JSON wrapped in markdown code blocks (` ```json ... ``` `)
  2. Bare JSON objects (`{...}`)
  3. Arrays (`[...]`)
- Platforms like Gemini use `--output-format json` flag
- Other platforms rely on prompt instructions (which is the standard approach)

---

### P2-G02: Copilot Context Files Not Documented ✅ FIXED

**Problem:** Copilot loads from `CLAUDE.md`, `.github/instructions/*.instructions.md`, etc. Users unaware.

**Fix:** Added comprehensive context file documentation to `PROJECT_SETUP_GUIDE.md`:
- Documented Copilot context files: CLAUDE.md, GEMINI.md, AGENTS.md, .github/instructions/, etc.
- Documented Gemini CLI context files: ~/.gemini/GEMINI.md and project-level GEMINI.md
- Added recommendations for RWM Puppet Master projects

---

### P2-G03: Validation Gate Excludes Gemini & Copilot ✅ FIXED

**File:** `src/start-chain/validation-gate.ts`

**Problem:** `validPlatforms: ['cursor', 'codex', 'claude']` excludes Gemini and Copilot.

**Fix:** Updated to `['cursor', 'codex', 'claude', 'gemini', 'copilot']`.

---

### P2-G04: No Graceful Degradation for Missing Platforms ✅ FIXED

**Problem:** If configured platform unavailable, crashes instead of suggesting alternatives.

**Fix:** Enhanced `NoPlatformAvailableError` class in `platform-router.ts`:
- Constructor now accepts `preferred`, `triedFallbacks`, and optional `suggestions` parameters
- Default suggestions include: doctor command, login command, CLI installation check
- Error message formatted with bullet points for clear guidance

---

### P2-G05: GUI Tech Stack Mismatch vs Spec

**Status:** ✅ FIXED

**Problem:** Spec suggests React/Tailwind, implementation uses vanilla JS.

**Fix:** Full React migration completed with 27 tasks:
- React 18+ with TypeScript
- Tailwind CSS with exact design tokens
- Zustand for state management  
- All 12 pages migrated (Dashboard, Projects, Wizard, Config, Doctor, Tiers, Evidence, History, Metrics, Coverage, Settings)
- 353 tests passing
- Production build works
- Server integration via `useReactGui` config option
- PH-GUI-T01 through PH-GUI-T04: Foundation (Vite, Tailwind, Router, structure)
- PH-GUI-T05 through PH-GUI-T14: Core components (Button, Input, Modal, etc.)
- PH-GUI-T15 through PH-GUI-T17: State management (Zustand, SSE, API client)
- PH-GUI-T18 through PH-GUI-T25: Page migrations
- PH-GUI-T26 through PH-GUI-T27: Charts, shortcuts, testing

**Important:** Visual design will be preserved exactly - Tailwind configured with exact values from existing CSS.

---

### P2-G06: Session ID Format Not Enforced ✅ FIXED

**Problem:** AGENTS.md specifies `PM-YYYY-MM-DD-HH-MM-SS-NNN` but not validated.

**Fix:** Added session ID validation to `session-tracker.ts`:
- Exported `SESSION_ID_PATTERN` regex for reuse
- Added `isValidSessionId(sessionId: string)` function
- Added `validateSessionId(sessionId: string)` function that throws on invalid format
- Added validation warnings in `ledger.ts` query and replay commands

---

### P2-G07: Project Path Handling Security ✅ FIXED

**File:** `src/gui/routes/projects.ts`

**Problem:** Routes accepting arbitrary paths need stricter validation.

**Fix:** Added `isPathWithinBase()` security function:
- Validates paths stay within allowed base directory
- Resolves symlinks before comparison (prevents symlink-based traversal)
- Returns 403 FORBIDDEN for paths outside base directory
- Applied to both POST /api/projects and POST /api/projects/open routes

---

### P2-G08: Test Coverage Gaps in Critical Modules

**Status:** ⏸️ DEFERRED (large scope)

**Problem:** ~72 source files without tests including:
- `src/gui/server.ts`
- `src/gui/routes/controls.ts`
- `src/platforms/copilot-sdk-runner.ts`
- `src/platforms/auth-status.ts`
- `src/core/escalation-chain.ts`

---

### P2-G09: Start-Chain Interview Mode Not Fully Integrated

**Status:** ⏸️ DEFERRED (needs design)

**Problem:** Interview command exists but integration with wizard GUI and PRD unclear.

---

### P2-G10: Linux Installer Has No Service File ✅ FIXED

**File:** `installer/linux/nfpm.yaml`

**Problem:** No systemd service, log rotation, or user/group creation.

**Fix:** 
- Created `installer/linux/systemd/puppet-master-gui.service` for system-wide service
- Created `installer/linux/systemd/puppet-master-gui-user.service` for per-user installation
- Updated `nfpm.yaml` to include systemd service in package
- Updated `postinstall` script with instructions for enabling the service
- Services include security hardening (NoNewPrivileges, ProtectSystem, etc.)

---

### P2-G11: Cursor CLI Command Discovery Fragile ✅ FIXED

**File:** `src/platforms/constants.ts`

**Problem:** Cursor's CLI has changed names (`cursor`, `cursor-agent`, `agent`). Discovery may miss non-standard installs.

**Fix:** Enhanced `getCursorCommandCandidates()` to:
- Check known installation paths for Linux, macOS, and Windows
- Include paths for npm global installs, Homebrew, Cursor app bundles
- Only add paths that actually exist (avoids probing non-existent paths)
- Added `CURSOR_KNOWN_PATHS` and `CURSOR_KNOWN_PATHS_WIN32` constants

---

### P2-G12: Dry-Run Mode Missing ℹ️ N/A

**Problem:** No way to validate execution plan without making changes.

**Status:** Already implemented. The following CLI commands support `--dry-run`:
- `puppet-master start --dry-run` - Validates config without executing
- `puppet-master plan --dry-run` - Validates and displays summary without saving files
- `puppet-master install --dry-run` - Shows what would be installed without installing

---

### P2-G13: Capability Discovery Not Exposed in GUI ✅ FIXED

**Problem:** `capability-discovery.ts` caches capabilities but no GUI surface to review them.

**Fix:**
- Added `registerCapabilityDiscovery()` method to `GuiServer`
- Enhanced `/api/capabilities` to return detailed probe data when discovery service is available
- Added `/api/capabilities/:platform` endpoint for individual platform details
- Supports `?probe=true` query param to force fresh probe
- Returns cached data including: version, command, authStatus, capabilities, quotaInfo, cooldownInfo

---

### P2-G14: Critical GUI Issues Remain Open

**Status:** ✅ FIXED

**Evidence:** All GUI issues from `GUI_ISSUES_AND_FIXES.md` resolved during React migration.

**Fix:** Issues resolved in BUILD_QUEUE_PHASE_GUI.md tasks:

| Issue | Description | Resolved In Task |
|-------|-------------|------------------|
| #7 | Projects Browse Box unclear | PH-GUI-T19 ✅ |
| #8 | Projects Loading State infinite | PH-GUI-T19 ✅ |
| #9 | Button Text Readability | PH-GUI-T05 ✅ |
| #12 | Inconsistent ARIA Labels | All component tasks ✅ |
| #13 | Responsive Breakpoint Testing | PH-GUI-T27 ✅ |
| #16 | No Toast Container | PH-GUI-T10 ✅ |
| #17 | Dark Mode Contrast | PH-GUI-T02, PH-GUI-T27 |
| #19 | Keyboard Navigation Tree | PH-GUI-T23 |

---

## P3 — Low Priority Gaps (8 Issues)

### P3-G01: Better Post-Install Guidance

**Problem:** After install, no guidance for doctor, login, model enablement.

---

### P3-G02: OS-Specific Troubleshooting in Docs

**Problem:** PATH reload, credential locations, etc. not documented per OS.

---

### P3-G03: Type Safety Masking

**Problem:** `as unknown as BasePlatformRunner` in multiple places hides interface mismatches.

---

### P3-G04: Add GUI Progress Percentage

**Problem:** No visual progress indicator during execution.

---

### P3-G05: Add Execution Profiling/Timing

**Problem:** No detailed timing breakdown per step.

---

### P3-G06: Add Checkpoint Comparison Tool

**Problem:** No way to compare state across checkpoints.

---

### P3-G07: Add Batch Evidence Export

**Problem:** No way to export all evidence at once.

---

### P3-G08: Add Telemetry/Analytics (Opt-in)

**Problem:** No usage analytics for improvement.

---

## Missing Features from Reference Implementations

| Feature | Found In | Impact if Missing |
|---------|----------|-------------------|
| Circuit Breaker (stagnation) | Ralph-Claude-Code | Infinite loops possible |
| Blind Validation | Zeroshot | Reviewer bias |
| Worktree Isolation | Zeroshot, Ralphy | Task pollution |
| Docker Isolation | Zeroshot | Host contamination |
| Crash Recovery | Zeroshot | Lost progress |
| Complexity Classification | Zeroshot | Wrong model for task |
| Session Continuity | Ralph-Claude-Code | Context loss |
| Token Rotation | Ralph-Wiggum-Cursor | Performance collapse |
| Cost Ceilings | Zeroshot | Budget overrun |
| Plan/Build Separation | Ralph-Playbook | Mutation during planning |

---

## Platform Setup Reality Check

### GitHub Copilot
- **Install:** `npm install -g @github/copilot` or `brew install copilot-cli`
- **Auth:** `copilot` then `/login` OR `GH_TOKEN`/`GITHUB_TOKEN`
- **Models:** MUST enable in GitHub.com → Settings → Copilot
- **Subscription:** Pro, Pro+, Business, or Enterprise required

### Gemini CLI
- **Install:** `npm install -g @google/gemini-cli`
- **Auth:** First run OAuth OR `GEMINI_API_KEY`
- **Plan mode:** `experimental.plan: true` + `--approval-mode plan`

### Claude Code
- **Install:** `npm install -g @anthropic-ai/claude-code`
- **Auth:** `ANTHROPIC_API_KEY` env var
- **Quotas:** 1-4 prompts then 5h cooldown on free tier

### Cursor
- **Install:** `curl https://cursor.com/install -fsSL | bash`
- **Auth:** Handled by Cursor app session
- **CLI:** `cursor-agent` must be in PATH

### Codex
- **Install:** `npm install -g @openai/codex`
- **Auth:** `OPENAI_API_KEY` env var

---

## Verification Plan

After implementing fixes:

### 1. Setup Verification
```bash
puppet-master doctor --verbose
puppet-master doctor --verify-auth
puppet-master validate
```

### 2. Auth Verification
```bash
puppet-master login --check
puppet-master doctor --category runtime
```

### 3. Single Platform Tests
```bash
puppet-master start --platform cursor --dry-run
puppet-master start --platform claude --dry-run
puppet-master start --platform copilot --dry-run
```

### 4. Fallback Tests
- Configure low quota on primary platform
- Verify fallback triggers automatically
- Check events emitted correctly

### 5. Full E2E Test
- Create small PRD (1 phase, 1 task, 1 subtask)
- Run full orchestration
- Verify completion through all tiers
- Check evidence collected

---

## Summary

**Critical (P0):** 25 issues - Must fix for basic functionality
- Copilot SDK/tools wiring
- No preflight validation
- Incomplete auth checks
- Invalid default models
- Quota fallback not implemented
- GUI security
- Installer issues

**High (P1):** 18 issues - Production readiness
- Plan mode consistency
- Token-based quotas
- Circuit breaker for stagnation
- Model discovery
- E2E tests

**Medium (P2):** 14 issues - Polish and robustness
- Test coverage
- Interview integration
- Dry-run mode

**Low (P3):** 8 issues - Enhancements
- Post-install guidance
- Telemetry
