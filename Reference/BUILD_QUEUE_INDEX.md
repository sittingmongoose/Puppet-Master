# RWM Puppet Master — BUILD_QUEUE_INDEX.md

> Version: 3.0  
> Purpose: Master index for manual build queue  
> Last Updated: 2026-01-12

---

## 1. Overview

This index coordinates the manual build of RWM Puppet Master using Cursor's GUI agent.

### How to Use

1. **Work through phases sequentially** (Phase 0 → Phase 1 → ...)
2. **Within each phase**, tasks may be parallelized where indicated
3. **For each task**, open the appropriate `BUILD_QUEUE_PHASE_N.md` file
4. Copy the **Cursor Agent Prompt** and run in Cursor
5. Update the **Task Status Log** after completion
6. Commit at designated stop points

### What This Is NOT

- NOT an orchestrated or automated build
- NOT using RWM loops, CLI automation, or fresh-agent-per-iteration workflows
- The **product** we're building supports those features; our **development process** is manual

---

## 2. Phase Summary

| Phase | Name | Tasks | Focus |
|-------|------|-------|-------|
| **Phase 0** | Foundation Setup | 8 | Project scaffolding, config system, core types |
| **Phase 1** | State & Git | 9 | State file managers, git integration |
| **Phase 2** | Core Engine | 12 | State machines, execution engine, budget manager |
| **Phase 3** | Platform Runners | 10 | CLI abstractions, capability discovery |
| **Phase 4** | Verification & Integration | 14 | Verifiers, orchestrator wiring, basic CLI |
| **Phase 5** | Start Chain | 10 | Requirements ingestion, PRD generation |
| **Phase 6** | Doctor & Dependencies | 8 | System checks, installation management |
| **Phase 7** | Logging & Observability | 7 | Logging infrastructure, event bus |
| **Phase 8** | AGENTS.md Enforcement | 6 | Multi-level agents, promotion rules |
| **Phase 9** | GUI Implementation | 12 | Web interface per GUI_SPEC.md |
| **Phase 10** | CLI Commands | 8 | Additional CLI commands (pause, resume, stop, etc.) |

**Total: 104 tasks** across 11 phases

### Phase File Map

- [BUILD_QUEUE_PHASE_0.md](./BUILD_QUEUE_PHASE_0.md) — Foundation Setup
- [BUILD_QUEUE_PHASE_1.md](./BUILD_QUEUE_PHASE_1.md) — State & Git
- [BUILD_QUEUE_PHASE_2.md](./BUILD_QUEUE_PHASE_2.md) — Core Engine
- [BUILD_QUEUE_PHASE_3.md](./BUILD_QUEUE_PHASE_3.md) — Platform Runners
- [BUILD_QUEUE_PHASE_4.md](./BUILD_QUEUE_PHASE_4.md) — Verification & Integration
- [BUILD_QUEUE_PHASE_5.md](./BUILD_QUEUE_PHASE_5.md) — Start Chain
- [BUILD_QUEUE_PHASE_6.md](./BUILD_QUEUE_PHASE_6.md) — Doctor & Dependencies
- [BUILD_QUEUE_PHASE_7.md](./BUILD_QUEUE_PHASE_7.md) — Logging & Observability
- [BUILD_QUEUE_PHASE_8.md](./BUILD_QUEUE_PHASE_8.md) — AGENTS.md Enforcement
- [BUILD_QUEUE_PHASE_9.md](./BUILD_QUEUE_PHASE_9.md) — GUI Implementation
- [BUILD_QUEUE_PHASE_10.md](./BUILD_QUEUE_PHASE_10.md) — CLI Commands

---

## 3. Phase Ordering (Sequential Dependencies)

```
Phase 0: Foundation Setup
    ↓ (must complete before)
Phase 1: State & Git
    ↓ (must complete before)
Phase 2: Core Engine
    ↓ (must complete before)
Phase 3: Platform Runners
    ↓ (must complete before)
Phase 4: Verification & Integration
    ↓
[Minimal Viable Product: puppet-master start works]
    ↓
Phase 5: Start Chain
    ↓
Phase 6: Doctor & Dependencies
    ↓
Phase 7: Logging & Observability
    ↓
Phase 8: AGENTS.md Enforcement
    ↓
Phase 9: GUI Implementation
    ↓
Phase 10: CLI Commands
    ↓
[Full Product Complete]
```

---

## 4. Parallel Groups Within Phases

### Phase 0: Foundation Setup

| Group | Tasks | Notes |
|-------|-------|-------|
| Sequential Start | PH0-T01 | Must complete first |
| Parallel Group A | PH0-T02, PH0-T03 | Linting + testing setup |
| Sequential | PH0-T04 | Directory structure |
| Parallel Group B | PH0-T05, PH0-T06, PH0-T07, PH0-T08 | Types + config (after PH0-T04) |

### Phase 1: State & Git

| Group | Tasks | Notes |
|-------|-------|-------|
| Parallel Group A | PH1-T01, PH1-T02, PH1-T03 | Memory managers (progress, agents, prd) |
| Parallel Group B | PH1-T04, PH1-T05 | Evidence store + file locking |
| Sequential | PH1-T06 | Usage tracker (depends on file utils) |
| Parallel Group C | PH1-T07, PH1-T08, PH1-T09 | Git integration |

### Phase 2: Core Engine

| Group | Tasks | Notes |
|-------|-------|-------|
| Sequential | PH2-T01 | State types (foundational) |
| Parallel Group A | PH2-T02, PH2-T03 | Orchestrator + Tier state machines |
| Sequential | PH2-T04 | State persistence |
| Sequential | PH2-T05 | Tier node structure |
| Sequential | PH2-T06 | TierStateManager |
| Parallel Group B | PH2-T07, PH2-T08 | Auto-advancement + escalation |
| Sequential | PH2-T09 | Execution engine base |
| Parallel Group C | PH2-T10, PH2-T11, PH2-T12 | Fresh spawn + prompt builder + output parser |

### Phase 3: Platform Runners

| Group | Tasks | Notes |
|-------|-------|-------|
| Sequential | PH3-T01 | Runner contract interface |
| Sequential | PH3-T02 | Base runner abstract class |
| Parallel Group A | PH3-T03, PH3-T04, PH3-T05 | Cursor, Codex, Claude runners |
| Sequential | PH3-T06 | Platform factory |
| Parallel Group B | PH3-T07, PH3-T08, PH3-T09, PH3-T10 | Capability discovery |

### Phase 4: Verification & Integration

| Group | Tasks | Notes |
|-------|-------|-------|
| Sequential | PH4-T01 | Test runner base |
| Parallel Group A | PH4-T02, PH4-T03, PH4-T04 | Test plan + timeout + output capture |
| Sequential | PH4-T05 | Verifier registry |
| Parallel Group B | PH4-T06, PH4-T07, PH4-T08, PH4-T09 | Basic verifiers |
| Sequential | PH4-T10 | Budget manager |
| Sequential | PH4-T11 | Orchestrator class |
| Parallel Group C | PH4-T12, PH4-T13 | Lifecycle commands + event bus |
| Sequential | PH4-T14 | CLI start command |

---

## 5. Branching Strategy

### Branch Naming Convention

```
ph{N}/t{NN}-{short-name}
```

Examples:
- `ph0/t01-scaffolding`
- `ph1/t03-prd-manager`
- `ph2/t09-execution-engine`

### Workflow

1. **Start each task** from `main` (or `dev` if using a dev branch):
   ```bash
   git checkout main
   git pull
   git checkout -b ph0/t01-scaffolding
   ```

2. **Complete the task** following the Cursor Agent Prompt

3. **Commit with standard message**:
   ```bash
   git add .
   git commit -m "ralph: PH0-T01 project scaffolding"
   ```

4. **Merge back to main**:
   ```bash
   git checkout main
   git merge ph0/t01-scaffolding
   git branch -d ph0/t01-scaffolding
   ```

### Parallel Work Branches

When working on parallel tasks:

1. **Each developer** takes a different task from a parallel group
2. **Branch from the same base** (typically right after the previous sequential task)
3. **Merge in order** or use rebase to resolve conflicts
4. **Communication required** if touching same files

---

## 6. Hot Files (Avoid Parallel Edits)

These files are modified by many tasks. **Do not edit in parallel**:

| File | Modified By | Strategy |
|------|-------------|----------|
| `src/types/index.ts` | Many tasks | Sequential edits only |
| `src/types/config.ts` | PH0-T05, PH0-T06 | Coordinate or serialize |
| `src/types/platforms.ts` | PH0-T07, PH3-* | One phase at a time |
| `src/types/state.ts` | PH0-T08, PH2-* | One phase at a time |
| `package.json` | PH0-T01, occasional deps | Merge carefully |

### Safe for Parallel Work

| Directory | Notes |
|-----------|-------|
| `src/memory/*` | Each manager is independent |
| `src/platforms/*` | Each runner is independent |
| `src/verification/*` | Each verifier is independent |
| `src/doctor/*` | Mostly independent files |
| Test files (`*.test.ts`) | Co-located, low conflict |

---

## 7. Model Quality Guidelines

| Label | When to Use | Cursor Model |
|-------|-------------|--------------|
| **HQ required** | Architecture, complex state logic, smart decisions | Claude Opus / GPT-5 |
| **Medium OK** | Implementation, integration, standard patterns | Claude Sonnet / Default |
| **Fast OK** | Boilerplate, simple edits, tests, docs | Claude Haiku / Fast |

---

## 8. Stop Points & Commits

### Phase Stop Points

| After | Commit Message | What's Working |
|-------|----------------|----------------|
| Phase 0 | `ralph: phase-0 foundation complete` | Build, lint, typecheck pass |
| Phase 1 | `ralph: phase-1 state-git complete` | State files read/write |
| Phase 2 | `ralph: phase-2 core-engine complete` | State machines working |
| Phase 3 | `ralph: phase-3 runners complete` | CLI platforms spawn |
| Phase 4 | `ralph: phase-4 integration complete` | `puppet-master start` works |
| Phase 5 | `ralph: phase-5 start-chain complete` | `puppet-master init` and `plan` work |
| Phase 6 | `ralph: phase-6 doctor complete` | `puppet-master doctor` works |
| Phase 7 | `ralph: phase-7 logging complete` | Logging and event bus working |
| Phase 8 | `ralph: phase-8 agents-enforcement complete` | Multi-level AGENTS.md enforced |
| Phase 9 | `ralph: phase-9 gui complete` | `puppet-master gui` works |
| Phase 10 | `ralph: phase-10 cli-commands complete` | All CLI commands implemented |

### Per-Task Commits

Each task has a suggested commit message in its definition. Use:
```
ralph: PH{N}-T{NN} {short-description}
```

---

## 9. Critical Path

The minimum path to a working `puppet-master start`:

```
PH0-T01 → PH0-T04 → PH0-T05 → PH0-T08 →
PH1-T01 → PH1-T03 →
PH2-T01 → PH2-T02 → PH2-T09 →
PH3-T01 → PH3-T02 → PH3-T03 →
PH4-T01 → PH4-T05 → PH4-T10 → PH4-T11 → PH4-T14
```

**Estimated critical path time (MVP):** 40-60 hours

### Full Product Path

After MVP, continue through remaining phases:

```
Phase 5 (Start Chain) → Phase 6 (Doctor) → Phase 7 (Logging) →
Phase 8 (AGENTS Enforcement) → Phase 9 (GUI) → Phase 10 (CLI Commands)
```

**Estimated total time (Full Product):** 140-200 hours

---

## 10. Quick Reference: Task IDs

### Phase 0: Foundation Setup
- PH0-T01: Initialize TypeScript project
- PH0-T02: ESLint setup
- PH0-T03: Vitest setup
- PH0-T04: Directory structure
- PH0-T05: Config types
- PH0-T06: ConfigManager
- PH0-T07: Platform types
- PH0-T08: State types

### Phase 1: State & Git
- PH1-T01: ProgressManager
- PH1-T02: AgentsManager
- PH1-T03: PrdManager
- PH1-T04: EvidenceStore
- PH1-T05: File locking
- PH1-T06: UsageTracker
- PH1-T07: GitManager
- PH1-T08: Branch strategy
- PH1-T09: Commit formatting + PR manager

### Phase 2: Core Engine
- PH2-T01: State types and events
- PH2-T02: OrchestratorStateMachine
- PH2-T03: TierStateMachine
- PH2-T04: State persistence
- PH2-T05: TierNode structure
- PH2-T06: TierStateManager
- PH2-T07: Auto-advancement logic
- PH2-T08: Escalation logic
- PH2-T09: ExecutionEngine base
- PH2-T10: Fresh agent spawn
- PH2-T11: Iteration prompt builder
- PH2-T12: Output parser

### Phase 3: Platform Runners
- PH3-T01: PlatformRunnerContract
- PH3-T02: BasePlatformRunner
- PH3-T03: CursorRunner
- PH3-T04: CodexRunner
- PH3-T05: ClaudeCodeRunner
- PH3-T06: Platform factory
- PH3-T07: CapabilityDiscoveryService
- PH3-T08: Help output parser
- PH3-T09: Smoke test runner
- PH3-T10: Capability storage + execution gate

### Phase 4: Verification & Integration
- PH4-T01: TestRunner base
- PH4-T02: Test plan execution
- PH4-T03: Timeout handling
- PH4-T04: Test output capture
- PH4-T05: VerifierRegistry
- PH4-T06: TEST verifier
- PH4-T07: CLI_VERIFY verifier
- PH4-T08: FILE_VERIFY verifier
- PH4-T09: REGEX_VERIFY verifier
- PH4-T10: BudgetManager
- PH4-T11: Orchestrator class
- PH4-T12: Lifecycle commands
- PH4-T13: EventBus
- PH4-T14: CLI start command

### Phase 5: Start Chain
- PH5-T01: Requirements ingestion types
- PH5-T02: Markdown parser adapter
- PH5-T03: PDF parser adapter
- PH5-T04: Text/Docx parser adapters
- PH5-T05: PRD generator
- PH5-T06: Architecture generator
- PH5-T07: Tier plan generator
- PH5-T08: Validation gate
- PH5-T09: CLI init command
- PH5-T10: CLI plan command

### Phase 6: Doctor & Dependencies
- PH6-T01: Check registry
- PH6-T02: CLI tools check
- PH6-T03: Git check
- PH6-T04: Runtime check
- PH6-T05: Project setup check
- PH6-T06: Installation manager
- PH6-T07: Doctor reporter
- PH6-T08: CLI doctor command

### Phase 7: Logging & Observability
- PH7-T01: Logger service
- PH7-T02: Activity logger
- PH7-T03: Error logger
- PH7-T04: Iteration logger
- PH7-T05: Event bus
- PH7-T06: Log streaming
- PH7-T07: Log retention

### Phase 8: AGENTS.md Enforcement
- PH8-T01: Multi-level loader
- PH8-T02: Update detector
- PH8-T03: Promotion rules engine
- PH8-T04: Gate enforcer
- PH8-T05: Archive manager
- PH8-T06: Enforcement integration tests

### Phase 9: GUI Implementation
- PH9-T01: GUI server
- PH9-T02: State API endpoints
- PH9-T03: WebSocket event streaming
- PH9-T04: Dashboard screen
- PH9-T05: Project select screen
- PH9-T06: Start chain wizard
- PH9-T07: Configuration screen
- PH9-T08: Tier views
- PH9-T09: Evidence viewer
- PH9-T10: Run controls
- PH9-T11: Doctor screen
- PH9-T12: GUI integration tests

### Phase 10: CLI Commands
- PH10-T01: CLI pause command
- PH10-T02: CLI resume command
- PH10-T03: CLI stop command
- PH10-T04: CLI install command
- PH10-T05: CLI replan command
- PH10-T06: CLI reopen command
- PH10-T07: CLI gui command
- PH10-T08: CLI validate command

---

## 11. File Locations

| Document | Purpose |
|----------|---------|
| `BUILD_QUEUE_INDEX.md` | This file - master index |
| `BUILD_QUEUE_PHASE_0.md` | Phase 0 task definitions |
| `BUILD_QUEUE_PHASE_1.md` | Phase 1 task definitions |
| `BUILD_QUEUE_PHASE_2.md` | Phase 2 task definitions |
| `BUILD_QUEUE_PHASE_3.md` | Phase 3 task definitions |
| `BUILD_QUEUE_PHASE_4.md` | Phase 4 task definitions |
| `BUILD_QUEUE_PHASE_5.md` | Phase 5 task definitions |
| `BUILD_QUEUE_PHASE_6.md` | Phase 6 task definitions |
| `BUILD_QUEUE_PHASE_7.md` | Phase 7 task definitions |
| `BUILD_QUEUE_PHASE_8.md` | Phase 8 task definitions |
| `BUILD_QUEUE_PHASE_9.md` | Phase 9 task definitions |
| `BUILD_QUEUE_PHASE_10.md` | Phase 10 task definitions |
| `.cursorrules` | Agent configuration |
| `AGENTS.md` | Long-term agent memory |

---

*End of BUILD_QUEUE_INDEX.md*
