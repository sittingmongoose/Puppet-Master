# RWM Puppet Master — ROADMAP.md

> Version: 2.2  
> Status: Design Document  
> Last Updated: 2026-01-10 (Micro-patch: Session rename, Discovery-populated capability matrix)

---

## Overview

This roadmap uses **Blocks → Chunks → Pieces** terminology for building RWM Puppet Master itself. Each Piece includes acceptance criteria, tests, dependencies, parallelization notes, and recommended AI model tier.

### Model Tier Legend

| Tier | Models | Use For |
|------|--------|---------|
| 🧠 **Smart** | Claude Opus 4.5, GPT-5.2-high | Architecture decisions, complex logic, planning |
| 🎯 **Medium** | Claude Sonnet 4.5, GPT-5, Codex | Implementation, integration, review |
| ⚡ **Fast** | Claude Haiku, Cursor Auto | Boilerplate, tests, docs, simple edits |

### Dependency Legend

| Symbol | Meaning |
|--------|---------|
| ⬅️ | Blocked by (must complete first) |
| ➡️ | Blocks (other pieces wait for this) |
| 🔀 | Can parallelize with |

---

## Block 1: Foundation

**Purpose:** Core infrastructure, configuration, and state file management.

### Chunk 1.1: Project Scaffolding

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **1.1.1** | Initialize TypeScript project with build config | ⚡ Fast | None ➡️ All | tsconfig.json exists; `npm run build` succeeds | `npm run build` passes |
| **1.1.2** | Set up ESLint + Prettier | ⚡ Fast | 🔀 1.1.1 | lint config exists; `npm run lint` works | `npm run lint` passes |
| **1.1.3** | Set up Jest test framework | ⚡ Fast | 🔀 1.1.1 | jest.config.js exists; `npm test` runs | `npm test` shows 0 tests |
| **1.1.4** | Create directory structure | ⚡ Fast | ⬅️ 1.1.1 | All folders from ARCHITECTURE.md exist | Directory check script |
| **1.1.5** | Create package.json scripts | ⚡ Fast | ⬅️ 1.1.1, 1.1.2, 1.1.3 | build, test, lint, dev scripts work | Manual verification |

### Chunk 1.2: Configuration System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **1.2.1** | Define config schema (TypeScript types) | 🎯 Medium | ⬅️ 1.1.1 ➡️ 1.2.2-1.2.5 | Types match STATE_FILES.md schema | Type compilation |
| **1.2.2** | Create ConfigManager class | 🎯 Medium | ⬅️ 1.2.1 | Can load YAML config files | Unit tests for load |
| **1.2.3** | Config validation logic | 🎯 Medium | ⬅️ 1.2.1, 1.2.2 | Invalid configs throw descriptive errors | Validation tests |
| **1.2.4** | Default config generation | ⚡ Fast | ⬅️ 1.2.1 | `puppet-master init` creates default config | Integration test |
| **1.2.5** | Config override via CLI flags | 🎯 Medium | ⬅️ 1.2.2, 1.2.3 | CLI flags override file config | Unit tests |
| **1.2.6** | Budget configuration schema (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 1.2.1 | Budget fields in config type | Type compilation |

### Chunk 1.3: State File Managers

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **1.3.1** | ProgressManager class | 🎯 Medium | ⬅️ 1.1.1 ➡️ 2.3.x | Can read/append progress.txt per spec (with Session ID) | Unit tests |
| **1.3.2** | AgentsManager class (multi-level) | 🧠 Smart | ⬅️ 1.1.1 ➡️ 2.3.x | Can read/update AGENTS.md at root, module, phase, task levels | Unit tests |
| **1.3.3** | PrdManager class | 🧠 Smart | ⬅️ 1.2.1 ➡️ 2.2.x | Full CRUD on prd.json; query methods work | Comprehensive tests |
| **1.3.4** | EvidenceStore class | 🎯 Medium | ⬅️ 1.1.4 | Can save screenshots, logs, gate reports, verifier results | Unit tests |
| **1.3.5** | File locking utilities | 🎯 Medium | ⬅️ 1.1.1 🔀 1.3.1-1.3.4 | Concurrent access doesn't corrupt files | Concurrency tests |
| **1.3.6** | UsageTracker class (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 1.1.1 | Append to usage.jsonl, query by platform/period | Unit tests |

### Chunk 1.4: Git Integration

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **1.4.1** | GitManager base class | 🎯 Medium | ⬅️ 1.1.1 | commit, push, branch, checkout work | Unit tests |
| **1.4.2** | Branch strategy implementation | 🎯 Medium | ⬅️ 1.4.1, 1.2.1 | Creates branches per config (single/phase/task) | Integration tests |
| **1.4.3** | Commit message formatting | ⚡ Fast | ⬅️ 1.4.1 | Messages follow "ralph: ..." format per tier | Unit tests |
| **1.4.4** | History and rollback | 🎯 Medium | ⬅️ 1.4.1 | getRecentCommits, rollback work | Unit tests |
| **1.4.5** | PR Manager (gh CLI) (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 1.4.1 | Create PR via gh, detect gh availability | Integration tests |
| **1.4.6** | Conflict resolver (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 1.4.1 | Handle conflict per strategy (pause/rebase/abort) | Unit tests |
| **1.4.7** | Git actions logger (ADDENDUM v2.0) | ⚡ Fast | ⬅️ 1.4.1 | Log all git ops to git-actions.log | Unit tests |

**Chunk 1 Parallelization:** 1.1.1 must complete first. Then 1.1.2, 1.1.3, 1.2.1 can run in parallel. 1.3.x and 1.4.x can largely parallelize after 1.1.4 completes.

---

## Block 2: Core Engine

**Purpose:** Orchestrator, state machine, tier management, execution engine.

### Chunk 2.1: State Machine

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **2.1.1** | Define state types and events | 🧠 Smart | ⬅️ 1.1.1 ➡️ 2.1.2-2.1.4 | Types match ARCHITECTURE.md state diagram | Type compilation |
| **2.1.2** | OrchestratorStateMachine class | 🧠 Smart | ⬅️ 2.1.1 | Handles all state transitions correctly | State transition tests |
| **2.1.3** | TierStateMachine class | 🧠 Smart | ⬅️ 2.1.1 | Per-tier state with pending/running/gating/passed/failed | State transition tests |
| **2.1.4** | State persistence (save/restore) | 🎯 Medium | ⬅️ 2.1.2, 1.3.3 | Can resume from checkpoint | Integration tests |

### Chunk 2.2: Tier State Manager

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **2.2.1** | TierNode data structure | 🎯 Medium | ⬅️ 2.1.1 ➡️ 2.2.2-2.2.5 | Hierarchy: Phase → Task → Subtask → Iteration | Unit tests |
| **2.2.2** | TierStateManager class | 🧠 Smart | ⬅️ 2.2.1, 1.3.3 | Navigate and query tier hierarchy | Unit tests |
| **2.2.3** | Auto-advancement logic | 🧠 Smart | ⬅️ 2.2.2 | Advances when subtask→task→phase gates pass | Integration tests |
| **2.2.4** | Escalation logic | 🧠 Smart | ⬅️ 2.2.2 | Correct escalation based on config | Unit tests |
| **2.2.5** | Gate execution dispatcher | 🧠 Smart | ⬅️ 2.2.2, 2.3.x | Runs correct platform for tier gates | Integration tests |

### Chunk 2.3: Execution Engine

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **2.3.1** | ExecutionEngine base class | 🧠 Smart | ⬅️ 2.1.2 ➡️ 2.3.2-2.3.4 | Coordinates iteration spawning | Unit tests |
| **2.3.2** | Fresh agent spawn mechanism | 🧠 Smart | ⬅️ 2.3.1 | New process per iteration; no session reuse; PID tracked | Process ID tracking tests |
| **2.3.3** | Iteration prompt builder | 🧠 Smart | ⬅️ 2.3.1, 1.3.1, 1.3.2 | Builds prompt with progress.txt + all AGENTS.md levels | Unit tests |
| **2.3.4** | Output parser | 🎯 Medium | ⬅️ 2.3.1 | Parses completion signals, extracts learnings | Parser tests |
| **2.3.5** | Stall detection (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 2.3.1 | Detect no-output, repeated-output, timeout | Unit tests |
| **2.3.6** | Process audit logging (ADDENDUM v2.0) | ⚡ Fast | ⬅️ 2.3.1 | Log PID, fresh_spawn, context_files per iteration | Unit tests |

### Chunk 2.4: Orchestrator

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **2.4.1** | Orchestrator class shell | 🎯 Medium | ⬅️ 2.1.2, 2.2.2, 2.3.1 ➡️ 2.4.2-2.4.4 | Wires together state machine, tier manager, execution | Integration tests |
| **2.4.2** | Start/Pause/Resume/Stop commands | 🎯 Medium | ⬅️ 2.4.1 | All lifecycle commands work | Integration tests |
| **2.4.3** | Event emission (EventBus) | 🎯 Medium | ⬅️ 2.4.1 🔀 5.x | Emits events for GUI/CLI consumption | Unit tests |
| **2.4.4** | Error handling and recovery | 🧠 Smart | ⬅️ 2.4.1, 2.2.4 | Handles errors per REQUIREMENTS.md | Error scenario tests |

### Chunk 2.5: Budget Manager (ADDENDUM v2.0)

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **2.5.1** | BudgetManager class | 🎯 Medium | ⬅️ 1.3.6, 1.2.6 | Track usage, check limits, get status | Unit tests |
| **2.5.2** | Limit enforcement | 🎯 Medium | ⬅️ 2.5.1 | Block calls when limit reached | Unit tests |
| **2.5.3** | Fallback handling | 🧠 Smart | ⬅️ 2.5.1, 2.4.1 | Auto-switch platform on limit | Integration tests |
| **2.5.4** | Cooldown tracking | 🎯 Medium | ⬅️ 2.5.1 | Track cooldown end times per platform | Unit tests |
| **2.5.5** | Budget event emission | ⚡ Fast | ⬅️ 2.5.1, 2.4.3 | Emit budget_warning, budget_fallback events | Unit tests |

**Chunk 2 Parallelization:** 2.1.x must complete before 2.2.x. 2.3.x can start after 2.1.2. 2.4.x requires all previous chunks. 2.5.x can parallelize with 2.4.x after 2.4.1.

---

## Block 3: Platform Runners

**Purpose:** CLI abstractions for Cursor, Codex, Claude Code.

### Chunk 3.1: Platform Interface + Runner Contract (UPDATED v2.0)

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **3.1.1** | PlatformRunnerContract interface | 🧠 Smart | ⬅️ 1.1.1 ➡️ 3.2.x, 3.3.x, 3.4.x | Interface includes fresh spawn, stall detection, audit | Type compilation |
| **3.1.2** | ExecutionRequest/Result types | 🎯 Medium | ⬅️ 3.1.1 | All fields from ARCHITECTURE.md including processId | Type compilation |
| **3.1.3** | Platform factory | 🎯 Medium | ⬅️ 3.1.1 | Returns correct runner for platform string | Unit tests |
| **3.1.4** | BasePlatformRunner abstract class | 🎯 Medium | ⬅️ 3.1.1 | Implements common fresh spawn, cleanup logic | Unit tests |

### Chunk 3.2: Cursor Runner

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **3.2.1** | CursorRunner basic execution | 🧠 Smart | ⬅️ 3.1.4 | Spawns cursor-agent, captures output | Integration tests |
| **3.2.2** | Cursor argument builder | 🎯 Medium | ⬅️ 3.2.1 | Correct flags for model, print mode, etc. | Unit tests |
| **3.2.3** | Cursor output parser | 🎯 Medium | ⬅️ 3.2.1 | Extracts session ID, token counts | Parser tests |
| **3.2.4** | Cursor session resume (debug only) | 🎯 Medium | ⬅️ 3.2.1, 3.2.3 | Can resume with --resume flag when configured | Integration tests |
| **3.2.5** | Cursor availability check | ⚡ Fast | ⬅️ 3.2.1 | Verifies cursor-agent is installed | Unit tests |

### Chunk 3.3: Codex Runner

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **3.3.1** | CodexRunner basic execution | 🧠 Smart | ⬅️ 3.1.4 | Spawns codex exec, captures JSONL output | Integration tests |
| **3.3.2** | Codex argument builder | 🎯 Medium | ⬅️ 3.3.1 | Correct flags for model, path, approval-policy | Unit tests |
| **3.3.3** | Codex JSONL event parser | 🎯 Medium | ⬅️ 3.3.1 | Parses stream-json output correctly | Parser tests |
| **3.3.4** | Codex session resume (debug only) | 🎯 Medium | ⬅️ 3.3.1 | Can resume with --resume when configured | Integration tests |
| **3.3.5** | Codex availability check | ⚡ Fast | ⬅️ 3.3.1 | Verifies codex is installed | Unit tests |

### Chunk 3.4: Claude Code Runner

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **3.4.1** | ClaudeCodeRunner basic execution | 🧠 Smart | ⬅️ 3.1.4 | Spawns claude -p, captures output | Integration tests |
| **3.4.2** | Claude argument builder | 🎯 Medium | ⬅️ 3.4.1 | Correct flags for model, max-turns, system-prompt | Unit tests |
| **3.4.3** | Claude output parser | 🎯 Medium | ⬅️ 3.4.1 | Parses JSON output, extracts session ID | Parser tests |
| **3.4.4** | Claude session resume (debug only) | 🎯 Medium | ⬅️ 3.4.1 | Can resume with --resume when configured | Integration tests |
| **3.4.5** | Claude availability check | ⚡ Fast | ⬅️ 3.4.1 | Verifies claude is installed | Unit tests |

### Chunk 3.5: Capability Discovery (ADDENDUM v2.0, UPDATED v2.1)

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **3.5.1** | CapabilityDiscoveryService class | 🎯 Medium | ⬅️ 3.2.1, 3.3.1, 3.4.1 | Discover capabilities for all platforms | Unit tests |
| **3.5.2** | Help output parser | 🎯 Medium | ⬅️ 3.5.1 | Parse --help to extract flags | Unit tests |
| **3.5.3** | Smoke test runner | 🎯 Medium | ⬅️ 3.5.1 | Run basic_invocation, non_interactive, model_selection | Integration tests |
| **3.5.4** | Capability file storage | ⚡ Fast | ⬅️ 3.5.1 | Save/load YAML capability files | Unit tests |
| **3.5.5** | Model list discovery | 🎯 Medium | ⬅️ 3.5.1 | Query available models per platform | Integration tests |
| **3.5.6** | Combined capabilities.json generation (ADDENDUM v2.1) | 🎯 Medium | ⬅️ 3.5.1 | Generate combined capability matrix as authoritative source | Unit tests |
| **3.5.7** | Discovery evidence artifacts (ADDENDUM v2.1) | ⚡ Fast | ⬅️ 3.5.3 | Produce smoke-test-*.log and discovery-report.md | Unit tests |
| **3.5.8** | Execution refusal gate (ADDENDUM v2.1) | 🧠 Smart | ⬅️ 3.5.6 | Orchestrator refuses to start if capabilities missing/stale/failed | Integration tests |

**Chunk 3 Parallelization:** 3.1.x first. Then 3.2.x, 3.3.x, 3.4.x can all run in parallel. 3.5.x after runners complete.

---

## Block 4: Verification Engine

**Purpose:** Test running, acceptance verification, browser automation, evidence collection.

### Chunk 4.1: Test Runner

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **4.1.1** | TestRunner class | 🎯 Medium | ⬅️ 1.1.1 ➡️ 4.1.2-4.1.4 | Execute commands, capture results | Unit tests |
| **4.1.2** | Test plan execution | 🎯 Medium | ⬅️ 4.1.1 | Run sequence of commands, aggregate results | Unit tests |
| **4.1.3** | Timeout handling | 🎯 Medium | ⬅️ 4.1.1 | Kill command on timeout, mark failed | Unit tests |
| **4.1.4** | Test output capture | ⚡ Fast | ⬅️ 4.1.1 | Save stdout/stderr to evidence | Unit tests |

### Chunk 4.2: Verifier Registry (ADDENDUM v2.0)

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **4.2.1** | VerifierRegistry class | 🎯 Medium | ⬅️ 1.1.1 ➡️ 4.2.2-4.2.8 | Register and lookup verifiers by type | Unit tests |
| **4.2.2** | Token parser | 🎯 Medium | ⬅️ 4.2.1 | Parse TYPE:target:options format | Unit tests |
| **4.2.3** | TEST verifier | 🎯 Medium | ⬅️ 4.2.1, 4.1.1 | Execute test command, produce evidence | Unit tests |
| **4.2.4** | CLI_VERIFY verifier | 🎯 Medium | ⬅️ 4.2.1 | Run CLI command, check exit code | Unit tests |
| **4.2.5** | FILE_VERIFY verifier | ⚡ Fast | ⬅️ 4.2.1 | Check file exists/matches pattern | Unit tests |
| **4.2.6** | REGEX_VERIFY verifier | ⚡ Fast | ⬅️ 4.2.1 | Check file contains pattern | Unit tests |
| **4.2.7** | PERF_VERIFY verifier | 🎯 Medium | ⬅️ 4.2.1 | Check metric against threshold | Unit tests |
| **4.2.8** | MANUAL_VERIFY verifier | ⚡ Fast | ⬅️ 4.2.1 | Flag for human review | Unit tests |
| **4.2.9** | AI_VERIFY verifier (fallback) | 🧠 Smart | ⬅️ 4.2.1, 3.x | Use AI platform to verify criterion | Integration tests |

### Chunk 4.3: Browser Adapter

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **4.3.1** | BrowserAdapter interface | 🎯 Medium | ⬅️ 1.1.1 ➡️ 4.3.2-4.3.4 | Abstract browser operations | Type compilation |
| **4.3.2** | DevBrowserAdapter | 🧠 Smart | ⬅️ 4.3.1 | Integrate amp-skills dev-browser | Integration tests |
| **4.3.3** | Browser scenario execution | 🎯 Medium | ⬅️ 4.3.1 | Navigate, interact, screenshot | Integration tests |
| **4.3.4** | BROWSER_VERIFY verifier | 🎯 Medium | ⬅️ 4.3.1, 4.2.1 | Execute browser scenario, produce evidence | Integration tests |
| **4.3.5** | PlaywrightMCPAdapter (fallback) | 🎯 Medium | ⬅️ 4.3.1 | Alternative adapter for playwright-mcp | Integration tests |

### Chunk 4.4: Acceptance Verification

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **4.4.1** | AcceptanceVerifier class | 🎯 Medium | ⬅️ 4.2.1 | Verify list of criteria using registry | Unit tests |
| **4.4.2** | Evidence aggregation | 🎯 Medium | ⬅️ 4.4.1, 1.3.4 | Collect all evidence items into summary | Unit tests |
| **4.4.3** | Gate report generation | 🎯 Medium | ⬅️ 4.4.1 | Generate JSON gate report with all results | Unit tests |
| **4.4.4** | Failure feed-forward | 🎯 Medium | ⬅️ 4.4.1 | Append failures to progress.txt, build next prompt | Unit tests |

**Chunk 4 Parallelization:** 4.1.x first. 4.2.x and 4.3.x can parallelize after 4.1.x. 4.4.x after 4.2.x.

---

## Block 5: Interfaces

**Purpose:** CLI and GUI implementations.

### Chunk 5.1: CLI Handler

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **5.1.1** | CLI framework setup (Commander.js) | ⚡ Fast | ⬅️ 1.1.1 ➡️ 5.1.2-5.1.10 | CLI parses commands | Integration tests |
| **5.1.2** | `init` command | 🎯 Medium | ⬅️ 5.1.1, 1.2.4 | Creates config, initializes project | Integration tests |
| **5.1.3** | `start` command | 🎯 Medium | ⬅️ 5.1.1, 2.4.2 | Starts execution | Integration tests |
| **5.1.4** | `status` command | 🎯 Medium | ⬅️ 5.1.1, 2.4.1 | Shows current state | Integration tests |
| **5.1.5** | `doctor` command | 🎯 Medium | ⬅️ 5.1.1, 7.1.x | Runs dependency checks | Integration tests |
| **5.1.6** | `config` command | 🎯 Medium | ⬅️ 5.1.1, 1.2.2 | View/edit configuration | Integration tests |
| **5.1.7** | `gui` command | ⚡ Fast | ⬅️ 5.1.1, 5.2.1 | Launches GUI server | Integration tests |
| **5.1.8** | `replan` command | 🎯 Medium | ⬅️ 5.1.1, 2.4.1 | Regenerates plans | Integration tests |
| **5.1.9** | `reopen` command | 🎯 Medium | ⬅️ 5.1.1, 2.4.1 | Reopens completed item | Integration tests |
| **5.1.10** | `capabilities` command (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.1.1, 3.5.x | View/discover CLI capabilities | Integration tests |

### Chunk 5.2: GUI Server

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **5.2.1** | Express/Fastify server setup | ⚡ Fast | ⬅️ 1.1.1 ➡️ 5.2.2-5.2.4 | Server starts on port | Integration tests |
| **5.2.2** | REST API routes | 🎯 Medium | ⬅️ 5.2.1, 2.4.1 | All endpoints from GUI_SPEC.md | API tests |
| **5.2.3** | WebSocket server | 🎯 Medium | ⬅️ 5.2.1, 2.4.3 | Real-time event streaming | Integration tests |
| **5.2.4** | Static file serving | ⚡ Fast | ⬅️ 5.2.1, 5.3.x | Serves React build | Integration tests |
| **5.2.5** | Budget API endpoints (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.2.1, 2.5.x | GET/POST budget status | API tests |
| **5.2.6** | Capabilities API endpoints (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.2.1, 3.5.x | GET capabilities, POST discover | API tests |
| **5.2.7** | AGENTS.md API endpoints (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.2.1, 1.3.2 | GET/PUT/POST agents files | API tests |

### Chunk 5.3: GUI Frontend

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **5.3.1** | React project setup | ⚡ Fast | ⬅️ 1.1.1 ➡️ 5.3.2-5.3.9 | React app builds | Build test |
| **5.3.2** | Dashboard screen | 🎯 Medium | ⬅️ 5.3.1, 5.2.3 | Matches GUI_SPEC, real-time updates | Manual + snapshot |
| **5.3.3** | Project Select screen | 🎯 Medium | ⬅️ 5.3.1 | List/create projects | Manual + snapshot |
| **5.3.4** | Start Chain wizard | 🧠 Smart | ⬅️ 5.3.1 | 6-step flow works | Manual + integration |
| **5.3.5** | Configuration screen | 🎯 Medium | ⬅️ 5.3.1 | All tabs from GUI_SPEC | Manual + snapshot |
| **5.3.6** | Phase/Task/Subtask views | 🎯 Medium | ⬅️ 5.3.1 | Hierarchical navigation | Manual + snapshot |
| **5.3.7** | Evidence viewer | 🎯 Medium | ⬅️ 5.3.1 | View gate reports, screenshots | Manual + snapshot |
| **5.3.8** | Doctor screen | 🎯 Medium | ⬅️ 5.3.1 | Dependency check UI | Manual + snapshot |
| **5.3.9** | Capabilities screen (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.3.1 | View/discover capabilities | Manual + snapshot |
| **5.3.10** | Budgets screen (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.3.1 | View usage, limits, cooldowns | Manual + snapshot |
| **5.3.11** | Memory/AGENTS screen (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 5.3.1 | View/edit/promote AGENTS.md | Manual + snapshot |

**Chunk 5 Parallelization:** 5.1.x, 5.2.x, 5.3.x can largely parallelize after their first pieces.

---

## Block 6: Start Chain

**Purpose:** Requirements → PRD → Architecture → Plan pipeline.

### Chunk 6.1: Requirements Ingestion

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **6.1.1** | Requirements parser (md, txt) | 🎯 Medium | ⬅️ 1.1.1 ➡️ 6.1.3 | Reads markdown/text files | Unit tests |
| **6.1.2** | Requirements parser (pdf, docx) | 🎯 Medium | ⬅️ 1.1.1 🔀 6.1.1 | Extracts text from binary formats | Unit tests |
| **6.1.3** | Requirements normalizer | 🎯 Medium | ⬅️ 6.1.1, 6.1.2 | Produces consistent markdown | Unit tests |
| **6.1.4** | Requirements storage | ⚡ Fast | ⬅️ 6.1.3, 1.1.4 | Saves to .puppet-master/requirements/ | Integration tests |

### Chunk 6.2: PRD Generation

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **6.2.1** | PRD generation prompt | 🧠 Smart | ⬅️ 6.1.3 ➡️ 6.2.2 | Template with verifier tokens | Review verification |
| **6.2.2** | PRD generator | 🧠 Smart | ⬅️ 6.2.1, 3.x, 2.5.x | Invokes AI platform (with budget check), parses JSON | Integration tests |
| **6.2.3** | PRD validator | 🎯 Medium | ⬅️ 6.2.2, 1.3.3 | Validates against prd.json schema | Unit tests |
| **6.2.4** | PRD editor integration | 🎯 Medium | ⬅️ 6.2.2, 5.3.4 | GUI allows PRD editing | Integration tests |

### Chunk 6.3: Architecture Generation

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **6.3.1** | Architecture generation prompt | 🧠 Smart | ⬅️ 6.1.3 ➡️ 6.3.2 | Produces target project architecture | Review verification |
| **6.3.2** | Architecture generator | 🧠 Smart | ⬅️ 6.3.1, 3.x, 2.5.x | Invokes AI (with budget check), saves | Integration tests |
| **6.3.3** | Architecture reviewer | 🎯 Medium | ⬅️ 6.3.2, 5.3.4 | GUI shows architecture preview | Integration tests |

### Chunk 6.4: Tier Plan Generation

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **6.4.1** | Tier plan generation prompt | 🧠 Smart | ⬅️ 6.2.2, 6.3.2 ➡️ 6.4.2 | Produces Phase → Task → Subtask with verifier tokens | Review verification |
| **6.4.2** | Tier plan generator | 🧠 Smart | ⬅️ 6.4.1, 3.x, 2.5.x | Populates prd.json with full hierarchy | Integration tests |
| **6.4.3** | Plan file generator | 🎯 Medium | ⬅️ 6.4.2 | Creates plan markdown files | Integration tests |
| **6.4.4** | Plan validator | 🎯 Medium | ⬅️ 6.4.2 | Validates dependency ordering, sizes | Unit tests |

**Chunk 6 Parallelization:** 6.1.x first. Then 6.2.x and 6.3.x can parallelize. 6.4.x requires both.

---

## Block 7: Doctor & Dependencies

**Purpose:** Dependency checking, installation, health monitoring.

### Chunk 7.1: Doctor System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **7.1.1** | Doctor framework | 🎯 Medium | ⬅️ 1.1.1 ➡️ 7.1.2-7.1.8 | Checks return pass/fail/warning | Unit tests |
| **7.1.2** | CLI tool checks | 🎯 Medium | ⬅️ 7.1.1, 3.x | cursor-agent, codex, claude availability | Integration tests |
| **7.1.3** | Git checks | ⚡ Fast | ⬅️ 7.1.1, 1.4.x | git installed, repo initialized, credentials | Unit tests |
| **7.1.4** | Node/Python checks | ⚡ Fast | ⬅️ 7.1.1 | Runtime environments available | Unit tests |
| **7.1.5** | Browser tool checks | 🎯 Medium | ⬅️ 7.1.1, 4.3.x | dev-browser/playwright available | Integration tests |
| **7.1.6** | Test runner checks | ⚡ Fast | ⬅️ 7.1.1 | npm test / pytest available | Unit tests |
| **7.1.7** | Capability matrix check (ADDENDUM v2.0) | 🎯 Medium | ⬅️ 7.1.1, 3.5.x | Capability files exist and current | Unit tests |
| **7.1.8** | gh CLI check (ADDENDUM v2.0) | ⚡ Fast | ⬅️ 7.1.1 | GitHub CLI available if PR enabled | Unit tests |

### Chunk 7.2: Installation System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **7.2.1** | Install framework | 🎯 Medium | ⬅️ 7.1.1 ➡️ 7.2.2-7.2.4 | Attempts auto-install or provides commands | Integration tests |
| **7.2.2** | CLI tool installers | 🎯 Medium | ⬅️ 7.2.1 | Install cursor-agent, codex, claude | Manual verification |
| **7.2.3** | Browser tool installers | 🎯 Medium | ⬅️ 7.2.1 | Install Playwright, start dev-browser | Integration tests |
| **7.2.4** | Smoke test after install | 🎯 Medium | ⬅️ 7.2.1, 3.5.x | Run capability discovery after install | Integration tests |

**Chunk 7 Parallelization:** 7.1.2-7.1.8 can all run in parallel after 7.1.1. 7.2.x after 7.1.x.

---

## Block 8: Logging & Observability

**Purpose:** Activity logs, error tracking, audit trail.

### Chunk 8.1: Logging System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **8.1.1** | Logger setup (Winston/Pino) | 🎯 Medium | ⬅️ 1.1.1 ➡️ 8.1.2-8.1.6 | Configurable log levels, file output | Unit tests |
| **8.1.2** | Activity log writer (JSONL) | 🎯 Medium | ⬅️ 8.1.1 | Writes to .puppet-master/logs/activity.log | Unit tests |
| **8.1.3** | Error log writer | 🎯 Medium | ⬅️ 8.1.1 | Structured error logs with stack traces | Unit tests |
| **8.1.4** | Iteration log writer | 🎯 Medium | ⬅️ 8.1.1 | Per-iteration JSON logs with process audit | Unit tests |
| **8.1.5** | Audit log writer | 🎯 Medium | ⬅️ 8.1.1 | Config changes, reopens, replans, fallbacks logged | Unit tests |
| **8.1.6** | Git actions log writer (ADDENDUM v2.0) | ⚡ Fast | ⬅️ 8.1.1 | All git ops logged to git-actions.log | Unit tests |

### Chunk 8.2: Log Management

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **8.2.1** | Log rotation | ⚡ Fast | ⬅️ 8.1.x | Rotates logs per retention config | Unit tests |
| **8.2.2** | Log viewer API | 🎯 Medium | ⬅️ 8.1.x, 5.2.2 | API to query/filter logs | API tests |
| **8.2.3** | Log export | ⚡ Fast | ⬅️ 8.1.x | Export logs to file/clipboard | Unit tests |

**Chunk 8 Parallelization:** All of 8.1.x can parallelize after 8.1.1. 8.2.x after 8.1.x.

---

## Block 9: AGENTS.md Enforcement (ADDENDUM v2.0)

**Purpose:** Mandatory AGENTS.md updates and multi-level propagation.

### Chunk 9.1: Enforcement System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **9.1.1** | Update detector | 🎯 Medium | ⬅️ 1.3.2 | Detect when gotcha/pattern found in output | Unit tests |
| **9.1.2** | Mandatory update checker | 🎯 Medium | ⬅️ 9.1.1 | Flag if update expected but not made | Unit tests |
| **9.1.3** | Gate enforcement | 🎯 Medium | ⬅️ 9.1.2, 4.4.x | Gate can fail if AGENTS.md update missing | Integration tests |
| **9.1.4** | Reviewer acknowledgment | 🎯 Medium | ⬅️ 9.1.1, 5.3.11 | GUI shows pending updates, requires ack | Integration tests |

### Chunk 9.2: Promotion System

| Piece | Description | Model | Dependencies | Acceptance Criteria | Tests |
|-------|-------------|-------|--------------|---------------------|-------|
| **9.2.1** | Promotion rules engine | 🎯 Medium | ⬅️ 1.3.2 | Identify items eligible for promotion | Unit tests |
| **9.2.2** | Auto-promote on gate pass | 🎯 Medium | ⬅️ 9.2.1 | Promote Task→Phase, Phase→Root automatically | Integration tests |
| **9.2.3** | Manual promotion UI | 🎯 Medium | ⬅️ 9.2.1, 5.3.11 | GUI button to promote to higher level | Integration tests |
| **9.2.4** | Deduplication | ⚡ Fast | ⬅️ 9.2.1 | Avoid duplicate entries across levels | Unit tests |

---

## Dependency Graph Summary

```
Block 1 (Foundation) ─────────────────┐
         │                            │
         ▼                            │
Block 2 (Core Engine) ◄───────────────┤
         │                            │
         ▼                            │
Block 3 (Platform Runners) ◄──────────┤
         │                            │
         ▼                            │
Block 4 (Verification) ◄──────────────┤
         │                            │
         ▼                            │
Block 5 (Interfaces) ◄────────────────┘
         │
         ▼
Block 6 (Start Chain)
         │
         ▼
Block 7 (Doctor/Dependencies)
         │
         ▼
Block 8 (Logging)
         │
         ▼
Block 9 (AGENTS Enforcement) ◄──── NEW
```

**Critical Path:** 1.1.1 → 1.2.1 → 2.1.1 → 2.4.1 → 5.1.3 → First working execution

---

## Implementation Order Recommendation

### Phase 1: Minimal Viable Loop (Blocks 1, 2, 3 core)
**Goal:** Single subtask can be executed via CLI

1. Block 1 complete (including new pieces 1.2.6, 1.3.6, 1.4.5-1.4.7)
2. Chunk 2.1 (State Machine)
3. Chunk 2.3 (Execution Engine with fresh spawn enforcement)
4. Chunk 2.5 (Budget Manager)
5. Chunk 3.1 + 3.2 (Cursor Runner only)
6. Chunk 3.5 (Capability Discovery)
7. Basic CLI (start command only)

**Milestone:** `puppet-master start` runs one iteration with Cursor, tracks budget, validates capabilities

### Phase 2: Full Orchestration (Blocks 2-4 complete)
**Goal:** Multi-tier execution with gates and verification

1. Complete Chunks 2.2, 2.4
2. Complete Chunks 3.3, 3.4 (Codex + Claude runners)
3. Block 4 complete (including VerifierRegistry)
4. Basic gate execution working

**Milestone:** Full Phase → Task → Subtask → Iteration loop with gates

### Phase 3: Interfaces (Block 5)
**Goal:** Full CLI and GUI

1. Complete Chunk 5.1 (CLI)
2. Complete Chunk 5.2 (GUI server with new endpoints)
3. Complete Chunk 5.3 (GUI frontend with new screens)

**Milestone:** GUI parity with CLI, including Capabilities, Budgets, Memory screens

### Phase 4: Start Chain & Polish (Blocks 6-9)
**Goal:** Complete product

1. Block 6 (Start Chain)
2. Block 7 (Doctor/Install)
3. Block 8 (Logging)
4. Block 9 (AGENTS Enforcement)

**Milestone:** End-to-end: requirements → running execution → complete

---

## Estimated Effort

| Block | Chunks | Pieces | Hours (Est.) |
|-------|--------|--------|--------------|
| Block 1: Foundation | 4 | 23 | 25-35 |
| Block 2: Core Engine | 5 | 24 | 50-70 |
| Block 3: Platform Runners | 5 | 24 | 35-50 |
| Block 4: Verification | 4 | 19 | 40-55 |
| Block 5: Interfaces | 3 | 27 | 50-70 |
| Block 6: Start Chain | 4 | 14 | 30-45 |
| Block 7: Doctor | 2 | 12 | 18-25 |
| Block 8: Logging | 2 | 9 | 12-18 |
| Block 9: AGENTS Enforcement | 2 | 8 | 15-22 |
| **Total** | **31** | **160** | **275-390** |

---

## Parallelization Opportunities

### High Parallelization
- Block 1 chunks 1.2-1.4 after 1.1.1
- Block 3 runners (3.2, 3.3, 3.4) after 3.1.x
- Block 5 CLI/backend/frontend

### Medium Parallelization
- Block 2 chunks after core state machine
- Block 4 verifiers after registry

### Sequential (Critical Path)
- 1.1.1 → 1.2.1 → 2.1.1 → 2.4.1 → 5.1.3

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| CLI behavior changes | Capability discovery validates assumptions at runtime |
| Claude Code cooldowns | Budget manager with fallback to Codex |
| Agent state drift | Fresh spawn enforcement with process ID tracking |
| AGENTS.md bloat | Multi-level with promotion rules |
| Git conflicts | Configurable conflict resolution strategy |
| Complex gate logic | Extensive state machine tests |

---

*End of ROADMAP.md*
