# BUILD_QUEUE_PHASE_3.md — Platform Runners

**Phase Focus:** Platform abstraction layer, CLI capability discovery, quota/cooldown management, and platform-specific runners.

**Depends on:** Phase 2 complete (core engine operational)

**Stop Point After Completion:** `ralph: phase-3 platform-runners complete`

---

## Parallel Groups

| Group | Tasks | Hot Files (avoid parallel edits) |
|-------|-------|----------------------------------|
| PH3-A | PH3-T01, PH3-T02 | `src/types/platform.ts` |
| PH3-B | PH3-T03, PH3-T04 | `src/platforms/base-runner.ts` |
| PH3-C | PH3-T05, PH3-T06, PH3-T07 | None (separate platform files) |
| PH3-D | PH3-T08, PH3-T09 | `src/platforms/registry.ts` |
| PH3-E | PH3-T10 | Integration only |

---

## PH3-T01: Platform Capability Discovery Types

### Title
Define platform capability discovery interfaces and schemas

### Goal
Create TypeScript interfaces for platform capabilities, feature flags, and discovery results per REQUIREMENTS.md Section 26.

### Depends on
- PH0-T07 (platform types foundation)
- Phase 2 complete

### Parallelizable with
- PH3-T02

### Recommended model quality
**Medium OK** — Type definitions, straightforward

### Read first
- `REQUIREMENTS.md` Section 26 (Platform Discovery & Capability Probing)
- `ARCHITECTURE.md` Section 6.1 (Platform Abstraction Layer)
- `STATE_FILES.md` Section 4.2 (Capability Cache)

### Files to create/modify
- `src/types/capabilities.ts` (create)
- `src/types/index.ts` (add export)

### Implementation notes
- Define `PlatformCapabilities` interface with fields: `streaming`, `codeExecution`, `imageGeneration`, `fileAccess`, `webSearch`, `computerUse`, `maxContextTokens`, `maxOutputTokens`, `supportedLanguages`
- Define `CapabilityProbeResult` interface with: `platform`, `version`, `capabilities`, `quotaInfo`, `cooldownInfo`, `probeTimestamp`
- Define `QuotaInfo` interface: `remaining`, `limit`, `resetsAt`, `period`
- Define `CooldownInfo` interface: `active`, `endsAt`, `reason`
- Define `FeatureFlag` type for capability booleans
- These types support the capability YAML/JSON caching in `.puppet-master/capabilities/`

### Acceptance criteria
- [ ] `PlatformCapabilities` interface covers all fields from REQUIREMENTS.md 26.3
- [ ] `CapabilityProbeResult` includes quota and cooldown information
- [ ] `QuotaInfo` and `CooldownInfo` interfaces defined
- [ ] Types exported from `src/types/index.ts`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

### Tests to run
```bash
npm run build
npm run lint
```

### Evidence to record
None (type definitions only)

### Cursor Agent Prompt
```
TASK: PH3-T01 — Platform Capability Discovery Types

Read these files first:
- REQUIREMENTS.md Section 26 (Platform Discovery & Capability Probing)
- ARCHITECTURE.md Section 6.1 (Platform Abstraction Layer)
- STATE_FILES.md Section 4.2 (Capability Cache)

Create `src/types/capabilities.ts` with:
1. PlatformCapabilities interface — streaming, codeExecution, imageGeneration, fileAccess, webSearch, computerUse, maxContextTokens, maxOutputTokens, supportedLanguages fields
2. CapabilityProbeResult interface — platform, version, capabilities, quotaInfo, cooldownInfo, probeTimestamp
3. QuotaInfo interface — remaining, limit, resetsAt, period
4. CooldownInfo interface — active, endsAt, reason
5. FeatureFlag type alias

Export all types from src/types/index.ts.

Run these commands to verify:
- npm run build
- npm run lint

IMPORTANT:
- Implement ONLY this task
- Keep changes minimal — do not refactor unrelated code
- Iterate in this chat until build and lint pass
- Do NOT delete or simplify canonical docs

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T02: Capability Discovery Service

### Title
Implement capability discovery service with caching

### Goal
Create a service that probes platform CLIs to discover capabilities and caches results per STATE_FILES.md Section 4.2.

### Depends on
- PH3-T01 (capability types)

### Parallelizable with
- PH3-T01 (after types are defined)

### Recommended model quality
**HQ required** — Core platform abstraction logic, CLI probing

### Read first
- `REQUIREMENTS.md` Section 26.1-26.4 (Discovery Protocol)
- `ARCHITECTURE.md` Section 6.1.3 (Capability Cache)
- `STATE_FILES.md` Section 4.2 (Capability Cache Schema)
- `src/types/capabilities.ts` (from PH3-T01)

### Files to create/modify
- `src/platforms/capability-discovery.ts` (create)
- `src/platforms/capability-discovery.test.ts` (create)

### Implementation notes
- `CapabilityDiscoveryService` class
- `probe(platform: Platform): Promise<CapabilityProbeResult>` — runs CLI with `--help` or version flags, parses output
- `getCached(platform: Platform): CapabilityProbeResult | null` — reads from `.puppet-master/capabilities/{platform}.yaml`
- `refresh(platform: Platform): Promise<CapabilityProbeResult>` — forces re-probe and updates cache
- `isCacheValid(platform: Platform, maxAgeMs: number): boolean` — checks cache freshness
- Cache location: `.puppet-master/capabilities/{platform}.yaml` (human-readable) and `.puppet-master/capabilities/{platform}.json` (machine-readable)
- Use `js-yaml` for YAML parsing/writing
- Discovery should NOT fail if CLI is missing; return capabilities with all features false

### Acceptance criteria
- [ ] `probe()` executes CLI and parses output
- [ ] Results cached to both YAML and JSON formats
- [ ] `getCached()` reads from cache files
- [ ] `isCacheValid()` checks timestamp against maxAge
- [ ] Gracefully handles missing CLIs (returns empty capabilities)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "capability-discovery"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "capability-discovery"
```

### Evidence to record
- `.puppet-master/capabilities/cursor.yaml` (example from test)
- `.puppet-master/capabilities/cursor.json` (example from test)

### Cursor Agent Prompt
```
TASK: PH3-T02 — Capability Discovery Service

Read these files first:
- REQUIREMENTS.md Section 26.1-26.4 (Discovery Protocol)
- ARCHITECTURE.md Section 6.1.3 (Capability Cache)
- STATE_FILES.md Section 4.2 (Capability Cache Schema)
- src/types/capabilities.ts

Create `src/platforms/capability-discovery.ts`:
1. CapabilityDiscoveryService class
2. probe(platform) — execute CLI with --help/version, parse capabilities
3. getCached(platform) — read from .puppet-master/capabilities/{platform}.yaml
4. refresh(platform) — force re-probe and update cache
5. isCacheValid(platform, maxAgeMs) — check cache freshness
6. Write cache to both .yaml and .json formats
7. Handle missing CLIs gracefully (return empty capabilities, don't throw)

Create `src/platforms/capability-discovery.test.ts`:
- Test probe() with mocked CLI execution
- Test getCached() reads from filesystem
- Test isCacheValid() timestamp logic
- Test graceful handling of missing CLI

Run these commands to verify:
- npm run build
- npm run lint
- npm test -- -t "capability-discovery"

IMPORTANT:
- Implement ONLY this task
- Use child_process.spawn (NOT exec) for CLI calls
- Keep changes minimal
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T03: Platform Runner Base Class

### Title
Create abstract base class for platform runners

### Goal
Define the `BasePlatformRunner` abstract class that all platform-specific runners extend, per REQUIREMENTS.md Section 26.2.

### Depends on
- PH3-T01 (capability types)
- PH3-T02 (discovery service)

### Parallelizable with
- PH3-T04

### Recommended model quality
**HQ required** — Core abstraction that all runners inherit

### Read first
- `REQUIREMENTS.md` Section 26.2 (Platform Runner Contract)
- `ARCHITECTURE.md` Section 6.1.1 (Base Runner)
- `src/types/platform.ts` (from PH0-T07)

### Files to create/modify
- `src/platforms/base-runner.ts` (create)
- `src/platforms/base-runner.test.ts` (create)

### Implementation notes
- Abstract class `BasePlatformRunner` implementing `PlatformRunnerContract`
- Abstract methods: `spawn(request: ExecutionRequest): Promise<ChildProcess>`, `buildArgs(request: ExecutionRequest): string[]`, `parseOutput(output: string): ExecutionResult`
- Concrete methods: `execute(request: ExecutionRequest): Promise<ExecutionResult>`, `getCapabilities(): Promise<PlatformCapabilities>`, `checkQuota(): Promise<QuotaInfo>`, `checkCooldown(): Promise<CooldownInfo>`
- Constructor takes `CapabilityDiscoveryService` instance
- Emit events via EventEmitter: `output`, `error`, `complete`
- Track process ID for fresh agent enforcement

### Acceptance criteria
- [ ] Abstract class defines required contract methods
- [ ] Concrete `execute()` method orchestrates spawn/parse cycle
- [ ] Events emitted: `output`, `error`, `complete`
- [ ] Integrates with `CapabilityDiscoveryService`
- [ ] Process ID tracked for audit
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "base-runner"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "base-runner"
```

### Evidence to record
None (abstract class)

### Cursor Agent Prompt
```
TASK: PH3-T03 — Platform Runner Base Class

Read these files first:
- REQUIREMENTS.md Section 26.2 (Platform Runner Contract)
- ARCHITECTURE.md Section 6.1.1 (Base Runner)
- src/types/platform.ts

Create `src/platforms/base-runner.ts`:
1. Abstract class BasePlatformRunner implements PlatformRunnerContract
2. Abstract methods: spawn(request), buildArgs(request), parseOutput(output)
3. Concrete execute(request) — orchestrates spawn → collect output → parse
4. Concrete getCapabilities() — delegates to CapabilityDiscoveryService
5. Concrete checkQuota(), checkCooldown() — use discovery service
6. Extend EventEmitter, emit: 'output', 'error', 'complete'
7. Track process.pid for audit

Create `src/platforms/base-runner.test.ts`:
- Test execute() flow with mock spawn
- Test event emission
- Test capability delegation

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "base-runner"

IMPORTANT:
- Implement ONLY this task
- Keep abstract methods abstract — implementations come in platform-specific runners
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T04: Quota and Cooldown Manager

### Title
Implement quota tracking and cooldown management

### Goal
Create a manager that tracks platform quotas and cooldowns per REQUIREMENTS.md Section 23 (Budget Management).

### Depends on
- PH3-T01 (capability types with QuotaInfo/CooldownInfo)
- PH1-T06 (UsageTracker)

### Parallelizable with
- PH3-T03

### Recommended model quality
**HQ required** — Budget enforcement is critical for cost control

### Read first
- `REQUIREMENTS.md` Section 23 (Budget & Quota Management)
- `ARCHITECTURE.md` Section 6.2 (Quota Management)
- `src/memory/usage-tracker.ts` (from PH1-T06)

### Files to create/modify
- `src/platforms/quota-manager.ts` (create)
- `src/platforms/quota-manager.test.ts` (create)

### Implementation notes
- `QuotaManager` class
- `checkQuota(platform: Platform): QuotaInfo` — reads usage from UsageTracker, compares to configured limits
- `checkCooldown(platform: Platform): CooldownInfo` — checks if platform in cooldown
- `recordUsage(platform: Platform, tokens: number, duration: number): void` — delegates to UsageTracker
- `canProceed(platform: Platform): { allowed: boolean; reason?: string }` — composite check
- `getRecommendedPlatform(tiers: TierConfig[]): Platform | null` — returns platform with best quota availability
- Configurable limits from `PuppetMasterConfig.budgets`
- Support per-platform and global limits

### Acceptance criteria
- [ ] `checkQuota()` calculates remaining quota from usage history
- [ ] `checkCooldown()` detects active cooldowns
- [ ] `canProceed()` returns composite decision
- [ ] `getRecommendedPlatform()` selects best available platform
- [ ] Integrates with UsageTracker
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "quota-manager"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "quota-manager"
```

### Evidence to record
None (manager class)

### Cursor Agent Prompt
```
TASK: PH3-T04 — Quota and Cooldown Manager

Read these files first:
- REQUIREMENTS.md Section 23 (Budget & Quota Management)
- ARCHITECTURE.md Section 6.2 (Quota Management)
- src/memory/usage-tracker.ts

Create `src/platforms/quota-manager.ts`:
1. QuotaManager class
2. checkQuota(platform) — calculate remaining from UsageTracker data
3. checkCooldown(platform) — detect active cooldowns
4. recordUsage(platform, tokens, duration) — delegate to UsageTracker
5. canProceed(platform) — composite check returning {allowed, reason?}
6. getRecommendedPlatform(tiers) — select platform with best quota availability
7. Support per-platform and global budget limits from config

Create `src/platforms/quota-manager.test.ts`:
- Test quota calculation
- Test cooldown detection
- Test canProceed() logic
- Test platform recommendation

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "quota-manager"

IMPORTANT:
- Implement ONLY this task
- Integrate with existing UsageTracker
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T05: Cursor Platform Runner

### Title
Implement Cursor-specific platform runner

### Goal
Create the `CursorRunner` that extends `BasePlatformRunner` for Cursor CLI invocation.

### Depends on
- PH3-T03 (base runner class)

### Parallelizable with
- PH3-T06, PH3-T07

### Recommended model quality
**HQ required** — Primary development platform runner

### Read first
- `REQUIREMENTS.md` Section 3.4.4 (Cursor Integration)
- `ARCHITECTURE.md` Section 6.1.2 (Platform Runners)
- `src/platforms/base-runner.ts` (from PH3-T03)

### Files to create/modify
- `src/platforms/cursor-runner.ts` (create)
- `src/platforms/cursor-runner.test.ts` (create)

### Implementation notes
- `CursorRunner extends BasePlatformRunner`
- Override `spawn()` — invoke `cursor-agent` CLI (or configured path)
- Override `buildArgs()` — construct arguments: `--prompt`, `--working-dir`, `--model`, etc.
- Override `parseOutput()` — extract completion signals, files changed, test results
- Detect `<ralph>COMPLETE</ralph>` and `<ralph>GUTTER</ralph>` signals
- Support `--model` flag for model selection per tier config
- Fresh agent enforcement: always start new process, no session reuse

### Acceptance criteria
- [ ] `CursorRunner` extends `BasePlatformRunner`
- [ ] `spawn()` invokes correct CLI command
- [ ] `buildArgs()` constructs proper arguments
- [ ] `parseOutput()` detects ralph signals
- [ ] Fresh process per execution (no session reuse)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "cursor-runner"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "cursor-runner"
```

### Evidence to record
- `.puppet-master/logs/cursor-executions.log` (from test runs)

### Cursor Agent Prompt
```
TASK: PH3-T05 — Cursor Platform Runner

Read these files first:
- REQUIREMENTS.md Section 3.4.4 (Cursor Integration)
- ARCHITECTURE.md Section 6.1.2 (Platform Runners)
- src/platforms/base-runner.ts

Create `src/platforms/cursor-runner.ts`:
1. CursorRunner extends BasePlatformRunner
2. Override spawn(request) — invoke cursor-agent CLI
3. Override buildArgs(request) — construct --prompt, --working-dir, --model args
4. Override parseOutput(output) — detect <ralph>COMPLETE</ralph> and <ralph>GUTTER</ralph>
5. Extract files changed and test results from output
6. Ensure fresh process per execution (no session reuse)

Create `src/platforms/cursor-runner.test.ts`:
- Test buildArgs() generates correct arguments
- Test parseOutput() detects ralph signals
- Test spawn() creates new process
- Mock child_process for unit tests

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "cursor-runner"

IMPORTANT:
- Implement ONLY this task
- Use child_process.spawn, NOT exec
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T06: Codex Platform Runner

### Title
Implement Codex-specific platform runner

### Goal
Create the `CodexRunner` that extends `BasePlatformRunner` for Codex CLI invocation.

### Depends on
- PH3-T03 (base runner class)

### Parallelizable with
- PH3-T05, PH3-T07

### Recommended model quality
**Medium OK** — Similar pattern to Cursor runner

### Read first
- `REQUIREMENTS.md` Section 3.4.2 (Codex Integration)
- `ARCHITECTURE.md` Section 6.1.2 (Platform Runners)
- `src/platforms/base-runner.ts` (from PH3-T03)

### Files to create/modify
- `src/platforms/codex-runner.ts` (create)
- `src/platforms/codex-runner.test.ts` (create)

### Implementation notes
- `CodexRunner extends BasePlatformRunner`
- Override `spawn()` — invoke `codex` CLI
- Override `buildArgs()` — construct Codex-specific arguments
- Override `parseOutput()` — extract completion signals
- Codex may have different output format than Cursor; handle accordingly
- Support approval modes if Codex requires them

### Acceptance criteria
- [ ] `CodexRunner` extends `BasePlatformRunner`
- [ ] `spawn()` invokes correct CLI command
- [ ] `buildArgs()` constructs proper arguments
- [ ] `parseOutput()` handles Codex output format
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "codex-runner"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "codex-runner"
```

### Evidence to record
None

### Cursor Agent Prompt
```
TASK: PH3-T06 — Codex Platform Runner

Read these files first:
- REQUIREMENTS.md Section 3.4.2 (Codex Integration)
- ARCHITECTURE.md Section 6.1.2 (Platform Runners)
- src/platforms/base-runner.ts

Create `src/platforms/codex-runner.ts`:
1. CodexRunner extends BasePlatformRunner
2. Override spawn(request) — invoke codex CLI
3. Override buildArgs(request) — construct Codex-specific arguments
4. Override parseOutput(output) — handle Codex output format, detect ralph signals
5. Fresh process per execution

Create `src/platforms/codex-runner.test.ts`:
- Test buildArgs() generates correct arguments
- Test parseOutput() handles Codex format
- Mock child_process for unit tests

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "codex-runner"

IMPORTANT:
- Implement ONLY this task
- Follow same pattern as CursorRunner
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T07: Claude Platform Runner

### Title
Implement Claude-specific platform runner

### Goal
Create the `ClaudeRunner` that extends `BasePlatformRunner` for Claude CLI invocation.

### Depends on
- PH3-T03 (base runner class)

### Parallelizable with
- PH3-T05, PH3-T06

### Recommended model quality
**Medium OK** — Similar pattern to other runners

### Read first
- `REQUIREMENTS.md` Section 3.4.3 (Claude Integration)
- `ARCHITECTURE.md` Section 6.1.2 (Platform Runners)
- `src/platforms/base-runner.ts` (from PH3-T03)

### Files to create/modify
- `src/platforms/claude-runner.ts` (create)
- `src/platforms/claude-runner.test.ts` (create)

### Implementation notes
- `ClaudeRunner extends BasePlatformRunner`
- Override `spawn()` — invoke `claude` CLI
- Override `buildArgs()` — construct Claude-specific arguments
- Override `parseOutput()` — extract completion signals
- Claude CLI may have different flags and output format

### Acceptance criteria
- [ ] `ClaudeRunner` extends `BasePlatformRunner`
- [ ] `spawn()` invokes correct CLI command
- [ ] `buildArgs()` constructs proper arguments
- [ ] `parseOutput()` handles Claude output format
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "claude-runner"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "claude-runner"
```

### Evidence to record
None

### Cursor Agent Prompt
```
TASK: PH3-T07 — Claude Platform Runner

Read these files first:
- REQUIREMENTS.md Section 3.4.3 (Claude Integration)
- ARCHITECTURE.md Section 6.1.2 (Platform Runners)
- src/platforms/base-runner.ts

Create `src/platforms/claude-runner.ts`:
1. ClaudeRunner extends BasePlatformRunner
2. Override spawn(request) — invoke claude CLI
3. Override buildArgs(request) — construct Claude-specific arguments
4. Override parseOutput(output) — handle Claude output format, detect ralph signals
5. Fresh process per execution

Create `src/platforms/claude-runner.test.ts`:
- Test buildArgs() generates correct arguments
- Test parseOutput() handles Claude format
- Mock child_process for unit tests

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "claude-runner"

IMPORTANT:
- Implement ONLY this task
- Follow same pattern as other runners
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T08: Platform Registry

### Title
Implement platform runner registry

### Goal
Create a registry that manages platform runner instances and provides factory methods.

### Depends on
- PH3-T05 (CursorRunner)
- PH3-T06 (CodexRunner)
- PH3-T07 (ClaudeRunner)

### Parallelizable with
- PH3-T09

### Recommended model quality
**Medium OK** — Straightforward factory pattern

### Read first
- `ARCHITECTURE.md` Section 6.1.4 (Platform Registry)
- `src/platforms/cursor-runner.ts`
- `src/platforms/codex-runner.ts`
- `src/platforms/claude-runner.ts`

### Files to create/modify
- `src/platforms/registry.ts` (create)
- `src/platforms/registry.test.ts` (create)
- `src/platforms/index.ts` (create — barrel export)

### Implementation notes
- `PlatformRegistry` class (singleton pattern)
- `register(platform: Platform, runner: BasePlatformRunner): void`
- `get(platform: Platform): BasePlatformRunner | undefined`
- `getAvailable(): Platform[]` — returns platforms with valid runners
- `createDefault(config: PuppetMasterConfig): PlatformRegistry` — factory that creates and registers all runners
- Integrates with CapabilityDiscoveryService

### Acceptance criteria
- [ ] Registry stores and retrieves runners by platform
- [ ] `getAvailable()` returns only platforms with runners
- [ ] `createDefault()` factory works with config
- [ ] Barrel export in `src/platforms/index.ts`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "registry"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "registry"
```

### Evidence to record
None

### Cursor Agent Prompt
```
TASK: PH3-T08 — Platform Registry

Read these files first:
- ARCHITECTURE.md Section 6.1.4 (Platform Registry)
- src/platforms/cursor-runner.ts
- src/platforms/codex-runner.ts
- src/platforms/claude-runner.ts

Create `src/platforms/registry.ts`:
1. PlatformRegistry class (singleton pattern)
2. register(platform, runner) — store runner
3. get(platform) — retrieve runner
4. getAvailable() — return platforms with valid runners
5. createDefault(config) — factory method that creates all runners

Create `src/platforms/index.ts` (barrel export):
- Export all runners
- Export registry
- Export capability discovery

Create `src/platforms/registry.test.ts`:
- Test register/get cycle
- Test getAvailable()
- Test createDefault() factory

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "registry"

IMPORTANT:
- Implement ONLY this task
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T09: Platform Health Check

### Title
Implement platform health check system

### Goal
Create a health check system that validates platform availability and reports status.

### Depends on
- PH3-T08 (registry)
- PH3-T02 (capability discovery)

### Parallelizable with
- PH3-T08

### Recommended model quality
**Medium OK** — Straightforward health check logic

### Read first
- `REQUIREMENTS.md` Section 15.1 (Doctor Checks)
- `ARCHITECTURE.md` Section 6.3 (Health Monitoring)

### Files to create/modify
- `src/platforms/health-check.ts` (create)
- `src/platforms/health-check.test.ts` (create)

### Implementation notes
- `PlatformHealthChecker` class
- `checkPlatform(platform: Platform): Promise<HealthCheckResult>` — verify CLI exists, is executable, responds to version check
- `checkAll(): Promise<Map<Platform, HealthCheckResult>>` — check all registered platforms
- `HealthCheckResult` interface: `healthy`, `message`, `version?`, `capabilities?`
- Integrates with CapabilityDiscoveryService for capability reporting
- Used by Doctor command

### Acceptance criteria
- [ ] `checkPlatform()` validates CLI availability
- [ ] `checkAll()` iterates over registry
- [ ] Returns structured health check results
- [ ] Integrates with capability discovery
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "health-check"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "health-check"
```

### Evidence to record
None

### Cursor Agent Prompt
```
TASK: PH3-T09 — Platform Health Check

Read these files first:
- REQUIREMENTS.md Section 15.1 (Doctor Checks)
- ARCHITECTURE.md Section 6.3 (Health Monitoring)
- src/platforms/registry.ts
- src/platforms/capability-discovery.ts

Create `src/platforms/health-check.ts`:
1. HealthCheckResult interface: healthy, message, version?, capabilities?
2. PlatformHealthChecker class
3. checkPlatform(platform) — verify CLI exists and responds
4. checkAll() — check all registered platforms
5. Integrate with CapabilityDiscoveryService

Create `src/platforms/health-check.test.ts`:
- Test checkPlatform() with mock CLI
- Test checkAll() iteration
- Test health result structure

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "health-check"

IMPORTANT:
- Implement ONLY this task
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## PH3-T10: Platform Integration Test

### Title
Create integration tests for platform layer

### Goal
Validate the complete platform abstraction layer works end-to-end with mocked CLIs.

### Depends on
- All PH3 tasks (PH3-T01 through PH3-T09)

### Parallelizable with
- None (integration test)

### Recommended model quality
**HQ required** — Complex integration validation

### Read first
- All `src/platforms/*.ts` files
- `REQUIREMENTS.md` Section 26 (Platform Discovery)

### Files to create/modify
- `src/platforms/integration.test.ts` (create)

### Implementation notes
- Create mock CLI scripts in `tests/fixtures/mock-clis/`
- Test full flow: discovery → registry → runner → execution → output parsing
- Test quota enforcement blocks execution when exhausted
- Test cooldown enforcement
- Test fallback when preferred platform unavailable
- Use Vitest's mocking capabilities for child_process

### Acceptance criteria
- [ ] Integration test covers discovery → execution flow
- [ ] Quota enforcement tested
- [ ] Cooldown enforcement tested
- [ ] Platform fallback tested
- [ ] Mock CLIs in test fixtures
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- -t "platform.*integration"` passes

### Tests to run
```bash
npm run build
npm run lint
npm test -- -t "platform.*integration"
```

### Evidence to record
- `.puppet-master/evidence/test-logs/PH3-T10-integration.log`

### Cursor Agent Prompt
```
TASK: PH3-T10 — Platform Integration Test

Read these files first:
- All src/platforms/*.ts files
- REQUIREMENTS.md Section 26 (Platform Discovery)

Create mock CLI scripts in `tests/fixtures/mock-clis/`:
- mock-cursor (outputs fake responses)
- mock-codex (outputs fake responses)
- mock-claude (outputs fake responses)

Create `src/platforms/integration.test.ts`:
1. Test full discovery → registry → runner → execution flow
2. Test quota enforcement blocks when exhausted
3. Test cooldown enforcement delays execution
4. Test fallback to alternative platform
5. Use Vitest mocking for child_process

Run these commands:
- npm run build
- npm run lint
- npm test -- -t "platform.*integration"

IMPORTANT:
- Implement ONLY this task
- This is integration testing only — do not modify production code
- Iterate until all tests pass

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary: 
Files changed: 
Commands run: 
If FAIL — where stuck + error snippets:
```

---

## Phase 3 Summary

| Task ID | Title | Depends On | Parallel Group |
|---------|-------|------------|----------------|
| PH3-T01 | Capability Discovery Types | Phase 2 | A |
| PH3-T02 | Capability Discovery Service | PH3-T01 | A |
| PH3-T03 | Platform Runner Base Class | PH3-T01, PH3-T02 | B |
| PH3-T04 | Quota and Cooldown Manager | PH3-T01, PH1-T06 | B |
| PH3-T05 | Cursor Platform Runner | PH3-T03 | C |
| PH3-T06 | Codex Platform Runner | PH3-T03 | C |
| PH3-T07 | Claude Platform Runner | PH3-T03 | C |
| PH3-T08 | Platform Registry | PH3-T05, PH3-T06, PH3-T07 | D |
| PH3-T09 | Platform Health Check | PH3-T08, PH3-T02 | D |
| PH3-T10 | Platform Integration Test | All PH3 | E |

**Total Tasks:** 10
**Estimated Time:** 20-30 hours
