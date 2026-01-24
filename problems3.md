# problems3 — Comprehensive End-to-End Gap Analysis (RWM Puppet Master)

> **Scope:** Complete analysis of gaps that may prevent end-to-end functionality  
> **Status:** Findings only (no fixes applied)  
> **Last Updated:** 2026-01-24  
> **Builds on:** problems2.md findings

---

## Executive Summary

After thorough analysis of the codebase, RalphInfo reference implementations, platform integrations, GUI, CLI, installers, and authentication flows, this document identifies **critical gaps** that could prevent the system from working end-to-end. A second-pass deep dive added additional findings in areas like testing coverage, error handling, timeout management, and recovery mechanisms.

### Key Findings

| Category | P0 (Blockers) | P1 (High) | P2 (Medium) | P3 (Low) |
|----------|---------------|-----------|-------------|----------|
| **Authentication** | 3 | 2 | 1 | - |
| **Platform Integration** | 3 | 5 | 4 | - |
| **Model Selection** | 2 | 4 | 3 | - |
| **Quotas/Limits** | 2 | 2 | 1 | - |
| **Plan Mode** | 1 | 2 | - | - |
| **GUI/CLI** | 2 | 4 | 3 | 1 |
| **Installers** | 2 | 2 | 3 | - |
| **Testing** | - | 1 | 2 | - |
| **Error Handling** | - | 2 | 2 | - |
| **Total** | **15** | **24** | **19** | **1** |

---

## P0 — Critical Blockers (Will Prevent End-to-End Runs)

### 1. Authentication Status Incomplete for Gemini & Copilot

**File:** `src/platforms/auth-status.ts`

**Problem:** The `getPlatformAuthStatus()` function only checks:
- `codex` → `OPENAI_API_KEY`
- `claude` → `ANTHROPIC_API_KEY`
- `cursor` → returns "skipped"
- **Everything else → returns "unknown"**

```typescript
// Current implementation
case 'cursor':
  return { status: 'skipped', details: '...' };
// Gemini and Copilot fall through to:
default:
  return { status: 'unknown', details: 'No auth readiness check is implemented...' };
```

**Impact:**
- Gemini (`GEMINI_API_KEY` or OAuth) is never verified
- Copilot (`GH_TOKEN`, `GITHUB_TOKEN`, or `/login`) is never verified
- Doctor checks treat "unknown" as non-blocking → false confidence

**Reality (per REQUIREMENTS.md):**
- **Gemini:** Requires `GEMINI_API_KEY`, OAuth via `gemini` first run, or Vertex AI credentials
- **Copilot:** Requires `GH_TOKEN`/`GITHUB_TOKEN` with "Copilot Requests" permission OR `/login` in CLI

**Evidence:**
- `src/platforms/auth-status.ts:59-64`
- `src/doctor/checks/cli-tools.ts:327-377` (GeminiCliCheck uses auth status)
- `src/doctor/checks/cli-tools.ts:382-439` (CopilotCliCheck uses auth status)

---

### 2. Copilot SDK Dependency Not in package.json

**File:** `package.json`

**Problem:** The codebase uses `@github/copilot-sdk` via dynamic import, but it's **NOT listed as a dependency**:

```typescript
// src/platforms/copilot-sdk-runner.ts:157
const { CopilotClient: SdkClient } = await import('@github/copilot-sdk');

// src/doctor/checks/cli-tools.ts:461
const { CopilotClient } = await import('@github/copilot-sdk');
```

**But in `package.json`:**
```json
{
  "dependencies": {
    // @github/copilot-sdk is NOT listed!
  }
}
```

**Impact:**
- `npm ci` will succeed but Copilot integration will fail at runtime
- Doctor's `CopilotSdkCheck` will always fail with "Copilot SDK not installed"
- The SDK runner is registered as the default Copilot runner in `src/platforms/registry.ts`

**Note:** Repository memory indicates `npm ci` fails due to `@github/copilot-sdk@^1.0.0` having no matching version (ETARGET). This may mean the SDK package either doesn't exist yet or has a different name.

**Evidence:**
- `package.json` (no copilot-sdk entry)
- `src/platforms/copilot-sdk-runner.ts:157`
- `src/doctor/checks/cli-tools.ts:461`
- `src/platforms/registry.ts:130-145` (registers CopilotSdkRunner)

---

### 3. No Preflight Validation Before Orchestrator Start

**Problem:** The orchestrator's `start()` method transitions directly to execution without capability/auth validation.

**Per ARCHITECTURE.md:**
> "Orchestrator MUST call `validateReadyForExecution()` before starting execution"

**Current Code Path:**
```typescript
// src/cli/commands/start.ts
await access(prdPath);  // Only checks PRD file exists
const orchestrator = new Orchestrator({ config, projectPath });
await orchestrator.initialize(deps);
await orchestrator.start();  // No validation!

// src/core/orchestrator.ts start() method
// Transitions to EXECUTING immediately without capability checks
```

**Impact:**
- Can start runs with missing CLIs
- Can start with unauthenticated platforms
- Can start with stale capability data
- Failures discovered mid-execution instead of upfront

**Evidence:**
- `src/cli/commands/start.ts:43-100`
- `src/core/orchestrator.ts` (no `validateReadyForExecution` call found)
- `grep -r "validateReadyForExecution" src/` returns no matches

---

### 4. Hardcoded Platform/Model Fallbacks in Start-Chain

**File:** `src/start-chain/requirements-inventory.ts`

**Problem:**
```typescript
// Lines 299-306
const platform = 
  this.puppetMasterConfig?.startChain?.inventory?.platform ||
  this.puppetMasterConfig?.tiers?.phase?.platform ||
  'cursor';  // ← HARDCODED FALLBACK

const model =
  this.puppetMasterConfig?.startChain?.inventory?.model ||
  this.puppetMasterConfig?.tiers?.phase?.model ||
  'claude-sonnet-4-20250514';  // ← HARDCODED FALLBACK
```

**Impact:**
- User may not have Cursor installed → silent failure
- Model string `claude-sonnet-4-20250514` may not be valid for Cursor
- User expects Claude/Gemini but gets Cursor silently
- No warning or error when fallback is used

**Evidence:**
- `src/start-chain/requirements-inventory.ts:299-306`

---

### 5. Default Config Contains Non-Existent Model Names

**File:** `src/config/default-config.ts`

**Problem:**
```typescript
tiers: {
  phase: { platform: 'claude', model: 'opus-4.5', ... },       // Does NOT exist
  task: { platform: 'codex', model: 'gpt-5.2-high', ... },     // Does NOT exist
  subtask: { platform: 'cursor', model: 'sonnet-4.5-thinking', ... },  // Does NOT exist
  iteration: { platform: 'cursor', model: 'auto', ... },       // 'auto' unclear
}
```

**Impact:**
- Fresh installs will fail immediately on first execution
- Users must override ALL tier configs to get a working system
- No model validation at config load time

**Evidence:**
- `src/config/default-config.ts:19-48`

---

### 6. Copilot CLI Model Selection Not Supported Programmatically

**File:** `src/platforms/copilot-runner.ts`, `src/platforms/copilot-models.ts`

**Problem:** Copilot CLI does NOT support `--model` flag programmatically:
- Model selection is ONLY via `/model` slash command in interactive mode
- Config allows specifying `model` for Copilot tier, but it's **ignored**

**Per copilot-models.ts:**
```typescript
// Line 28-30
* Copilot CLI does NOT support the `--model` flag for programmatic model selection.
* Users must select models interactively via `/model` command.
```

**Impact:**
- Config file `model` setting for Copilot is a no-op
- Users have no programmatic control over which model Copilot uses
- The SDK runner attempts to set model via `SessionConfig.model`, but if SDK doesn't exist, this fails

**Evidence:**
- `src/platforms/copilot-models.ts:28-30`
- `src/platforms/copilot-runner.ts:243-245`

---

### 7. GUI Has No Authentication (Security Critical)

**File:** `src/gui/server.ts`

**Problem:** GUI exposes all endpoints without authentication:
- `/api/controls/start` - Start execution
- `/api/controls/stop` - Stop execution
- `/api/controls/replan` - Replan tasks
- `/api/config/*` - Read/write configuration
- `/api/evidence/*` - Access evidence files

CORS allows local network IPs:
```typescript
// Lines 217-238
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?$/;
const devPortPattern = /^https?:\/\/[^:]+:(3\d{3}|[4-9]\d{3})$/;
const localIPPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)(:\d+)?$/;
```

**Impact:**
- Any device on local network can control orchestrator
- No access tokens, no sessions, no user verification
- Production exposure would be catastrophic

**Evidence:**
- `src/gui/server.ts:198-250` (CORS config)
- `src/gui/routes/*` (no auth middleware)

---

### 8. macOS Installer Path Mismatch

**File:** `installer/mac/scripts/postinstall`

**Problem:**
```bash
INSTALL_ROOT="/usr/local/lib/puppet-master"
LAUNCHER="${INSTALL_ROOT}/bin/puppet-master"
```

But `scripts/build-installer.ts` stages files differently:
- Stages to `puppet-master/` subdirectory
- pkgbuild may not match expected structure

**Impact:**
- macOS installer may complete successfully
- But `puppet-master` command fails because launcher isn't where expected

**Evidence:**
- `installer/mac/scripts/postinstall:4-6`
- `scripts/build-installer.ts` (staging logic)

---

### 9. Windows PATH Update Requires Restart

**File:** `installer/win/puppet-master.nsi`

**Problem:**
```nsis
WriteRegExpandStr HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path" "$0"
System::Call 'Kernel32::SendMessageTimeout(...)'
```

`SendMessageTimeout` broadcasts `WM_SETTINGCHANGE`, but:
- Existing CMD/PowerShell windows won't see the change
- User must restart terminal or entire system

**Impact:**
- After install, `puppet-master` command not found
- User confusion, thinks install failed

**Evidence:**
- `installer/win/puppet-master.nsi:47-62`

---

### 10. Gemini Runner Always Uses YOLO Mode (No Plan Mode)

**File:** `src/platforms/gemini-runner.ts`

**Problem:**
```typescript
// Line 171
args.push('--approval-mode', 'yolo');
```

Per REQUIREMENTS.md, Gemini supports plan mode:
```
--approval-mode plan (read-only, requires experimental.plan: true)
```

But the runner hardcodes `yolo` (auto-approve all), ignoring:
- `request.planMode` setting
- Safe read-only execution option

**Impact:**
- Gemini always runs with full mutation permissions
- No way to use Gemini for planning-only passes
- Inconsistent with other platforms' plan mode support

**Evidence:**
- `src/platforms/gemini-runner.ts:171`
- REQUIREMENTS.md Gemini section

---

### 11. Cursor Plan Mode Detection is Heuristic-Only

**File:** `src/platforms/cursor-runner.ts`

**Problem:**
```typescript
// Lines 181-185
private async probeModeFlagSupport(): Promise<boolean> {
  const helpOutput = await this.getHelpOutput(5000);
  const lower = helpOutput.toLowerCase();
  return lower.includes('--mode') && lower.includes('plan');
}
```

**Impact:**
- If Cursor's help output changes, detection fails silently
- Falls back to prompt preamble "PLAN FIRST, THEN EXECUTE" which doesn't enforce read-only
- No actual plan mode if detection fails

**Evidence:**
- `src/platforms/cursor-runner.ts:181-185`
- `src/platforms/cursor-runner.ts:143-157` (fallback preamble)

---

### 12. Start-Chain Doesn't Pass planMode to Runners

**Problem:** Even if user configures `planMode: true`, start-chain components don't propagate it.

Review of start-chain files:
- `prd-generator.ts` - No planMode parameter
- `arch-generator.ts` - No planMode parameter
- `requirements-interviewer.ts` - No planMode parameter
- `requirements-inventory.ts` - No planMode in ExecutionRequest

**Impact:**
- PRD generation uses full mutation mode
- Architecture generation uses full mutation mode
- Even if user wants read-only planning, start-chain ignores it

**Evidence:**
- `src/start-chain/*.ts` (search for planMode finds no propagation)

---

### 13. PlatformRouter Throws Unhandled Error

**File:** `src/core/platform-router.ts`

**Problem:** When no platform is available, throws `NoPlatformAvailableError`:
```typescript
throw new NoPlatformAvailableError(preferred);
```

This error is NOT handled by orchestrator:
```typescript
// src/core/orchestrator.ts - no catch for NoPlatformAvailableError
```

**Impact:**
- Orchestrator crashes instead of pausing/escalating
- User sees generic error, no recovery path
- Should trigger doctor/remediation, not crash

**Evidence:**
- `src/core/platform-router.ts` (throws NoPlatformAvailableError)
- `src/core/orchestrator.ts` (no specific catch)

---

## P1 — High Priority Gaps (Likely to Cause User Confusion)

### A. Quota Tracking is Call-Based, Not Token-Based

**File:** `src/platforms/quota-manager.ts`

**Problem:** QuotaManager tracks:
```typescript
maxCallsPerRun: number;
maxCallsPerHour: number;
maxCallsPerDay: number;
```

But real platform quotas are:
- **Copilot:** Premium request multipliers (e.g., "1x", "2x") per model
- **Claude:** Token-based with 5-hour cooldown
- **Gemini:** Token-based or request-based depending on plan

**Impact:**
- Budget displays are meaningless ("42 calls remaining")
- Can't accurately predict when limits will hit
- GUI shows quota info but it doesn't reflect reality

**Evidence:**
- `src/platforms/quota-manager.ts`
- `src/platforms/copilot-models.ts:17-19` (describes premium request multipliers)

---

### B. GUI Endpoint Parity vs GUI_SPEC.md

**Problem:** Multiple spec-required endpoints are stubs or missing:

| Endpoint | Spec Requirement | Actual |
|----------|-----------------|--------|
| `/api/status` | Return orchestrator state | Returns hardcoded `'idle'` |
| `/api/capabilities` | Platform capabilities | Not implemented |
| `/api/budgets` | Budget/quota info | Not implemented |
| `/api/logs` | Execution logs | Not implemented |
| `/api/phases`, `/api/tasks`, `/api/subtasks` | Tier details | Partially via state routes |

**Evidence:**
- `src/gui/server.ts:295-300` (hardcoded idle)
- `GUI_SPEC.md` endpoint requirements
- `src/gui/routes/*` (missing routes)

---

### C. Capability Discovery Doesn't Discover Models

**File:** `src/platforms/capability-discovery.ts`

**Problem:**
```typescript
// Only probes --version and --help
// Sets quota to huge defaults:
quotaInfo: {
  remaining: 999999,
  limit: 999999,
  ...
}
// Does NOT discover available models
```

**GUI_SPEC.md expects:**
- Discovery-populated model lists
- Accurate quota info
- Staleness gating

**Impact:**
- Can't show user which models are available per platform
- Quota numbers are fictional
- No way to validate model string before execution

**Evidence:**
- `src/platforms/capability-discovery.ts`

---

### D. Completion Signal is Fragile

**Problem:** System requires exact markers:
```
<ralph>COMPLETE</ralph>
<ralph>GUTTER</ralph>
```

If model outputs slightly different text, iteration fails:
- `<ralph> COMPLETE </ralph>` (spaces) → not detected
- `<RALPH>COMPLETE</RALPH>` (uppercase) → not detected
- Natural language "Task complete" → not detected

**Impact:**
- Good work discarded due to parsing
- Retries/escalation triggered unnecessarily
- Model must be prompted very precisely

**Evidence:**
- `src/core/execution-engine.ts`
- `src/platforms/output-parsers/*`

---

### E. Model Lists are Hardcoded Guesses

**Files:**
- `src/platforms/gemini-models.ts`
- `src/platforms/copilot-models.ts`

**Problem:** Both files contain hardcoded model lists:
```typescript
// gemini-models.ts
export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'auto', label: 'Auto (Recommended)', ... },
  { id: 'gemini-2.5-pro', ... },  // May not exist
  { id: 'gemini-3-pro-preview', preview: true, ... },  // May require config
  ...
];
```

With disclaimers like:
```typescript
// copilot-models.ts
* IMPORTANT: This is a suggested list only.
* Available models vary by subscription tier and region.
```

**Impact:**
- GUI shows models that may not be available
- Config validation can't know what's real
- Models may be renamed/removed without notice

**Evidence:**
- `src/platforms/gemini-models.ts:40-73`
- `src/platforms/copilot-models.ts:54-87`

---

### F. Worker/Reviewer Ping-Pong Loops

**File:** `src/core/worker-reviewer.ts`

**Problem:** Repository memory notes:
> "Worker/Reviewer separation (P1-T13) can create ping-pong loops: worker COMPLETE vs reviewer REVISE"

If worker says COMPLETE but reviewer says REVISE repeatedly:
- Loop never terminates
- Budget exhausted
- No detection/breaker for this pattern

**Evidence:**
- `src/core/worker-reviewer.ts`
- `src/core/orchestrator.ts:606-641` (worker/reviewer flow)

---

### G. No Circuit Breaker for Stagnation

**Problem:** Reference implementations (Ralph-Claude-Code) have:
- 3+ loops with no file changes → circuit break
- 5+ loops with same error → circuit break
- Identical output detection

Puppet Master has loop guards but:
```typescript
// src/core/loop-guard.ts
// Checks max iterations and identical output
// But NOT: no-file-changes, repeated errors
```

**Impact:**
- Can burn through quota making no progress
- No automatic detection of "stuck but not GUTTER"

**Evidence:**
- `src/core/loop-guard.ts`
- Reference: `RalphInfo/ralph-claude-code-main` has circuit breaker

---

### H. Installers Don't Validate Prerequisites

**Problem:** After successful install, user may still not be able to run:
- No check for Node.js runtime (if not bundled correctly)
- No check for external CLIs (cursor, codex, claude, gemini, copilot)
- No guidance on authentication setup

**Impact:**
- User installs, tries to run, fails with cryptic CLI errors
- No "run doctor next" guidance post-install

**Evidence:**
- `installer/win/puppet-master.nsi` (no prereq checks)
- `installer/mac/scripts/postinstall` (no prereq checks)
- `installer/linux/nfpm.yaml` (no prereq checks)

---

## P2 — Medium Priority Gaps

### 1. Start-Chain JSON Parsing Assumptions

**Files:** `src/start-chain/requirements-inventory.ts`, `src/start-chain/prd-generator.ts`

**Problem:** Components parse AI output as JSON but don't ensure the platform/model will emit JSON:
- Some platforms need `--output-format json`
- Some models may not follow JSON instructions
- Fallback regex extraction is fragile

**Evidence:**
- `src/start-chain/requirements-inventory.ts` (`parseAIResponse()`)

---

### 2. Copilot Context Files Not Documented for Users

**Files:** `src/platforms/copilot-runner.ts` (comments only)

**Problem:** Copilot loads context from multiple locations:
- `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`
- `.github/instructions/*.instructions.md`
- `.github/copilot-instructions.md`
- `$HOME/.copilot/copilot-instructions.md`

Users may not know these files affect behavior.

**Evidence:**
- `src/platforms/copilot-runner.ts:87-92` (documents but doesn't help users)

---

### 3. Evidence Path Validation is Fragile

**File:** `src/gui/routes/evidence.ts`

**Problem:**
```typescript
const filePath = resolve(join(baseDir, subdir, decodeURIComponent(name)));
if (!filePath.startsWith(evidenceDir)) {
  // Path traversal check
}
```

`decodeURIComponent` + `resolve` can have edge cases:
- Double encoding
- Unicode normalization
- Symlink following

**Evidence:**
- `src/gui/routes/evidence.ts`

---

### 4. Validation Gate Excludes Gemini & Copilot

**File:** `src/start-chain/validation-gate.ts`

**Problem:**
```typescript
const validPlatforms: Platform[] = ['cursor', 'codex', 'claude'];
// Gemini and Copilot not in list
```

**Impact:**
- Validation doesn't cover all supported platforms
- Inconsistent behavior

---

### 5. No Graceful Degradation for Missing Platforms

**Problem:** If user configures Tier A → Codex but Codex is unavailable:
- System should suggest/use alternatives
- Currently throws `NoPlatformAvailableError`
- No automatic fallback to healthy platform

**Evidence:**
- `src/core/platform-router.ts`

---

### 6. GUI Tech Stack Mismatch vs Spec

**File:** `GUI_SPEC.md` vs `src/gui/public/*`

**Problem:**
- Spec suggests: React, Tailwind CSS
- Implementation: Vanilla JavaScript, embedded styles

**Impact:**
- Maintenance burden
- Harder to extend
- Spec drift

---

### 7. Session ID Format Not Enforced

**AGENTS.md specifies:**
> Session ID format: `PM-YYYY-MM-DD-HH-MM-SS-NNN`

**Problem:** This format is documented but:
- Not validated at creation
- Not checked at restoration
- Legacy IDs may not match

---

## P3 — Low Priority / Polish

### 1. Better Post-Install Guidance

**Problem:** After install, users need:
- "Run `puppet-master doctor` to verify setup"
- "Run `/login` in each CLI to authenticate"
- "Enable models in GitHub Copilot settings"

Currently: No guidance provided.

---

## Platform Setup Reality Check

### GitHub Copilot

| Step | Required | Where/How |
|------|----------|-----------|
| Install CLI | ✅ | `npm install -g @github/copilot` or `brew install copilot-cli` |
| Authenticate | ✅ | `copilot` then `/login` OR `GH_TOKEN`/`GITHUB_TOKEN` env var |
| Enable models | ✅ | GitHub.com → Settings → Copilot → Enable models |
| Subscription | ✅ | Pro, Pro+, Business, or Enterprise |
| Org policy | Maybe | Enterprise/Org may restrict CLI |

**Critical:** User MUST enable specific models in GitHub settings before they're available via `/model` command.

### Gemini CLI

| Step | Required | Where/How |
|------|----------|-----------|
| Install CLI | ✅ | `npm install -g @google/gemini-cli` |
| Authenticate | ✅ | First run OAuth OR `GEMINI_API_KEY` env var |
| Enable preview models | Optional | `~/.gemini/settings.json` → `general.previewFeatures: true` |
| Plan mode | Optional | `experimental.plan: true` for `--approval-mode plan` |

### Claude Code

| Step | Required | Where/How |
|------|----------|-----------|
| Install CLI | ✅ | `curl -fsSL https://claude.ai/install.sh \| bash` OR `npm install -g @anthropic-ai/claude-code` |
| Authenticate | ✅ | `ANTHROPIC_API_KEY` env var |
| Quotas | Aware | 1-4 prompts then 5h cooldown on free tier |

### Cursor

| Step | Required | Where/How |
|------|----------|-----------|
| Install CLI | ✅ | `curl https://cursor.com/install -fsSL \| bash` |
| Authenticate | Auto | Handled by Cursor app session |
| CLI available | Varies | `cursor-agent` command must be in PATH |

### Codex (OpenAI)

| Step | Required | Where/How |
|------|----------|-----------|
| Install CLI | ✅ | `npm install -g @openai/codex` |
| Authenticate | ✅ | `OPENAI_API_KEY` env var |

---

## Missing Features from Reference Implementations

| Feature | Found In | Impact if Missing |
|---------|----------|-------------------|
| **Circuit Breaker** | Ralph-Claude-Code | Infinite loops possible |
| **Blind Validation** | Zeroshot | Reviewer bias |
| **Worktree Isolation** | Zeroshot, Ralphy | Task pollution |
| **Docker Isolation** | Zeroshot | Host contamination |
| **Crash Recovery** | Zeroshot | Lost progress |
| **Complexity Classification** | Zeroshot | Wrong model for task |
| **Session Continuity** | Ralph-Claude-Code | Context loss |
| **Multi-Platform Issues** | Zeroshot | GitHub only |
| **Cost Ceilings** | Zeroshot | Budget overrun |
| **Browser Automation** | Ralphy | UI testing gaps |

---

## Recommended Action Plan

### Immediate (Before First Real Use)

1. **Fix auth status for Gemini/Copilot** - Check actual env vars/credentials
2. **Add/verify Copilot SDK dependency** - Or remove SDK runner, use CLI-only
3. **Add preflight validation** - Block start if platforms unavailable
4. **Remove/fix hardcoded model names** - Use real model names or require explicit config
5. **Add GUI authentication** - At minimum, localhost-only binding enforcement

### Short Term (Within 1-2 Weeks)

6. **Implement circuit breaker** - No-file-changes, repeated-error detection
7. **Fix macOS installer paths** - Align postinstall with staging
8. **Add quota reality** - Track tokens, not just calls
9. **Document platform setup** - User guide for each platform auth

### Medium Term (Within 1 Month)

10. **Model discovery** - Query actual available models per platform
11. **Plan mode consistency** - All platforms should support read-only passes
12. **GUI spec alignment** - Implement missing endpoints

---

## Additional Gaps Found (Second Pass Analysis)

### 14. Circuit Breaker Exists But Not Fully Integrated

**File:** `src/platforms/circuit-breaker.ts`

**Problem:** A circuit breaker exists but:
- Only tracks consecutive failures at platform level
- Doesn't track "no file changes" stagnation (like Ralph-Claude-Code does)
- Doesn't track "same error repeated" patterns
- Is integrated in `base-runner.ts` but for platform-level failures only, not iteration-level stagnation

**Reference Implementation (RalphInfo):**
```bash
# RalphInfo/ralph-claude-code-main/lib/circuit_breaker.sh
CB_NO_PROGRESS_THRESHOLD=3      # Open circuit after N loops with no progress
CB_SAME_ERROR_THRESHOLD=5       # Open circuit after N loops with same error
CB_OUTPUT_DECLINE_THRESHOLD=70  # Open circuit if output declines by >70%
```

**Impact:**
- Puppet Master can burn budget making no actual progress
- No detection of "model spinning without changing files"

**Evidence:**
- `src/platforms/circuit-breaker.ts` - exists but limited scope
- `src/platforms/base-runner.ts:89,115,578,710-716` - integration points

---

### 15. Test Coverage Gaps in Critical Modules

**Problem:** Many critical files lack unit tests:

| File | Test Status |
|------|-------------|
| `src/gui/server.ts` | ❌ No test |
| `src/gui/routes/controls.ts` | ❌ No test |
| `src/gui/routes/wizard.ts` | ❌ No test |
| `src/gui/routes/events.ts` | ❌ No test |
| `src/gui/routes/settings.ts` | ❌ No test |
| `src/platforms/copilot-sdk-runner.ts` | ❌ No test |
| `src/platforms/auth-status.ts` | ❌ No test |
| `src/core/escalation-chain.ts` | ❌ No test |
| `src/core/session-tracker.ts` | ❌ No test |
| `src/core/start-chain/pipeline.ts` | ❌ No test |

**Stats:** 214 source files vs 142 test files → 72 untested files

**Impact:**
- Bugs in critical paths (GUI, auth, escalation) may not be caught
- Confidence in end-to-end functionality is lower

---

### 16. No Claude/Codex Model Catalog Files

**Problem:** Gemini and Copilot have model catalog files:
- `src/platforms/gemini-models.ts` ✅
- `src/platforms/copilot-models.ts` ✅
- `src/platforms/claude-models.ts` ❌ **Missing**
- `src/platforms/codex-models.ts` ❌ **Missing**
- `src/platforms/cursor-models.ts` ❌ **Missing**

**Impact:**
- GUI can't populate model dropdowns for Claude/Codex/Cursor
- No documentation of valid model names for these platforms
- Config validation can't verify model strings

---

### 17. Timeout Handling May Kill Long Tasks

**File:** `src/platforms/base-runner.ts`

**Problem:**
```typescript
readonly defaultTimeout: number;  // 5 minutes for most platforms
readonly hardTimeout: number;     // 30 minutes hard kill

// Only Gemini has longer default:
// gemini-runner.ts: defaultTimeout = 600_000 (10 minutes)
```

Real AI tasks can take much longer:
- Complex refactoring: 30+ minutes
- Test suite generation: 20+ minutes
- Architecture planning: 15+ minutes

**Impact:**
- Good work killed by timeout
- Partial changes left in codebase
- No save/resume mechanism

**Evidence:**
- `src/platforms/base-runner.ts:67-68`
- `src/platforms/cursor-runner.ts:47-48`

---

### 18. No Recovery from Partial State

**Problem:** If orchestrator crashes mid-task:
- `prd.json` may be partially updated
- Git commits may be incomplete
- No transaction/rollback mechanism

**Reference Implementation:**
Ralph-Claude-Code uses:
- Session continuity with ID persistence
- Progress tracking with recovery points
- Checkpoint files for resumption

Puppet Master has checkpointing (`src/core/checkpoint-manager.ts`) but:
- Not tested with real crash scenarios
- No automatic checkpoint-to-recovery path

---

### 19. GUI WebSocket Connection Has No Heartbeat

**File:** `src/gui/server.ts`

**Problem:**
```typescript
// No ping/pong heartbeat mechanism
ws.on('close', () => { /* cleanup */ });
ws.on('error', () => { /* cleanup */ });
// But no proactive keepalive
```

**Impact:**
- Stale connections not detected
- Browser tab left open accumulates dead sockets
- Server thinks client is connected when it's not

---

### 20. Error Messages Don't Guide Recovery

**Problem:** Throughout codebase, errors are generic:
```typescript
// src/core/platform-router.ts
throw new NoPlatformAvailableError(preferred);
// No suggestion: "Run puppet-master doctor to check platform status"

// src/cli/commands/start.ts
console.error('Error starting orchestration:', errorMessage);
// No suggestion: "Check config.yaml and run doctor first"
```

**Impact:**
- Users see error, don't know how to fix
- Support burden increases
- Doctor command not discoverable from error messages

---

### 21. Cursor CLI Command Discovery is Fragile

**File:** `src/platforms/constants.ts`, `src/doctor/checks/cli-tools.ts`

**Problem:**
```typescript
// constants.ts
export const PLATFORM_COMMANDS = {
  cursor: 'cursor-agent',  // But might be 'cursor' or 'agent'
  ...
};

// cli-tools.ts:getCursorCommandCandidates()
// Checks multiple paths but user might have non-standard install
```

Cursor's CLI has changed names over time and varies by installation method.

**Impact:**
- Doctor may report "Cursor not found" when it exists under different name
- Execution fails with "command not found"

---

### 22. Models Configuration Complexity Level Mapping Incomplete

**File:** `src/config/default-config.ts`

**Problem:**
```typescript
models: {
  level1: { platform: 'claude', model: 'haiku' },      // haiku doesn't exist in claude
  level2: { platform: 'claude', model: 'sonnet' },    // needs full model name
  level3: { platform: 'claude', model: 'opus' },      // needs full model name
}
```

Claude model names need full versions like `claude-3-5-sonnet-20241022`, not just `sonnet`.

**Impact:**
- Complexity routing uses invalid model names
- P2-T05 (complexity-based routing) doesn't work out of box

---

### 23. Start-Chain Interview Mode Not Fully Integrated

**File:** `src/cli/commands/interview.ts`, `src/start-chain/requirements-interviewer.ts`

**Problem:** The interview command exists but:
- How does it integrate with wizard GUI?
- How does generated output feed into PRD?
- No end-to-end flow documented

---

### 24. Linux Installer Has No Service File

**File:** `installer/linux/nfpm.yaml`

**Problem:** Linux package only installs binary, no:
- systemd service file for running as daemon
- Log rotation configuration
- User/group creation for security

**Impact:**
- Users must manually manage process
- No standard way to run on boot

---

## Updated Summary

| Category | P0 (Blockers) | P1 (High) | P2 (Medium) | P3 (Low) |
|----------|---------------|-----------|-------------|----------|
| **Authentication** | 3 | 2 | 1 | - |
| **Platform Integration** | 3 | 5 | 4 | - |
| **Model Selection** | 2 | 4 | 3 | - |
| **Quotas/Limits** | 2 | 2 | 1 | - |
| **Plan Mode** | 1 | 2 | - | - |
| **GUI/CLI** | 2 | 4 | 3 | 1 |
| **Installers** | 2 | 2 | 3 | - |
| **Testing** | - | 1 | 2 | - |
| **Error Handling** | - | 2 | 2 | - |
| **Total** | **15** | **24** | **19** | **1** |

---

## Conclusion

The project has strong architectural foundations but has **15 P0 blockers** that will prevent real-world end-to-end usage. The most critical issues are:

1. **Authentication gaps** (Gemini, Copilot not verified)
2. **Missing dependencies** (Copilot SDK not in package.json)
3. **No preflight validation** (can start with broken setup)
4. **Hardcoded invalid defaults** (non-existent model names)
5. **Security gaps** (unauthenticated GUI)
6. **Incomplete circuit breaker** (stagnation not detected)
7. **Missing model catalogs** (Claude, Codex, Cursor have no model files)

Until these are addressed, the system will fail in various ways during real usage, often with confusing error messages that don't guide users toward solutions.

---

## Appendix A: Evidence Files Referenced

| File | Issues Found |
|------|--------------|
| `src/platforms/auth-status.ts` | Incomplete auth checks |
| `src/platforms/copilot-sdk-runner.ts` | Missing dependency, no test |
| `src/platforms/copilot-runner.ts` | Model selection no-op |
| `src/platforms/gemini-runner.ts` | Hardcoded YOLO mode |
| `src/platforms/cursor-runner.ts` | Heuristic plan mode |
| `src/platforms/circuit-breaker.ts` | Limited scope (platform-level only) |
| `src/platforms/base-runner.ts` | Short timeouts for complex tasks |
| `src/start-chain/requirements-inventory.ts` | Hardcoded fallbacks |
| `src/config/default-config.ts` | Invalid model names |
| `src/core/orchestrator.ts` | No preflight validation |
| `src/core/platform-router.ts` | Unhandled error, no recovery suggestions |
| `src/gui/server.ts` | No authentication, no heartbeat, no test |
| `src/gui/routes/evidence.ts` | Path validation |
| `src/gui/routes/*.ts` | Multiple routes without tests |
| `installer/mac/scripts/postinstall` | Path mismatch |
| `installer/win/puppet-master.nsi` | PATH restart required |
| `installer/linux/nfpm.yaml` | No systemd service |
| `package.json` | Missing copilot-sdk |

---

## Appendix B: Untested Critical Files

| File | Importance |
|------|------------|
| `src/gui/server.ts` | Main GUI server |
| `src/gui/routes/controls.ts` | Orchestrator control endpoints |
| `src/gui/routes/wizard.ts` | Start chain wizard |
| `src/platforms/copilot-sdk-runner.ts` | Copilot integration |
| `src/platforms/auth-status.ts` | Platform authentication |
| `src/core/escalation-chain.ts` | Failure handling |
| `src/core/session-tracker.ts` | Session management |
| `src/core/start-chain/pipeline.ts` | PRD generation |

---

## Appendix C: Reference Implementation Comparison

| Feature | Ralph-Claude-Code | Puppet Master | Gap |
|---------|-------------------|---------------|-----|
| Circuit breaker (stagnation) | ✅ 3 loops no progress | ⚠️ Platform-level only | Significant |
| Session continuity | ✅ 24-hour sessions | ⚠️ Fresh spawns only | By design |
| tmux integration | ✅ Built-in | ❌ None | Nice to have |
| Real-time monitor | ✅ ralph_monitor.sh | ⚠️ GUI WebSocket | Partial |
| Exit signal detection | ✅ Done signals | ⚠️ COMPLETE/GUTTER only | Partial |
| Model-based quota | ❌ Call-based | ❌ Call-based | Both limited |
| Cost ceilings | ❌ None | ❌ None | Both missing |
| Multi-platform | ❌ Claude-only | ✅ 5 platforms | PM better |
