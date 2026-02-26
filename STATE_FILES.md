# Puppet Master — STATE_FILES.md

> Version: 2.2  
> Status: Design Document  
> Last Updated: 2026-01-10 (Micro-patch: Session rename, Discovery-populated capability matrix)

---

## 1. Overview

Puppet Master uses file-based state management to persist memory across iterations and enable fresh agent contexts. This document specifies all state files, their schemas, update policies, and locations.

### Core Principle

**Every iteration spawns a fresh agent.** State persists ONLY via:
1. State files (progress.txt, AGENTS.md, prd.json)
2. Git commits
3. Puppet Master's internal database

---

## 2. State File Hierarchy

```
target-project/
├── AGENTS.md                    # Long-term memory (project-wide)
├── progress.txt                 # Short-term memory (recent history)
├── src/
│   └── AGENTS.md                # Directory-specific memory (optional)
└── .puppet-master/
    ├── config.yaml              # Puppet Master configuration
    ├── prd.json                 # Structured work queue
    ├── architecture.md          # Target project architecture
    ├── requirements/
    │   └── original.md          # Original requirements doc
    ├── plans/
    │   ├── phase-001.md         # Phase plans
    │   ├── task-001-001.md      # Task plans
    │   └── subtask-001-001-001.md
    ├── agents/                  # Multi-level AGENTS.md (ADDENDUM v2.0)
    │   ├── phase-001.md         # Phase-specific learnings
    │   └── task-001-001.md      # Task-specific learnings
    ├── capabilities/            # CLI capability discovery (ADDENDUM v2.0, UPDATED v2.1)
    │   ├── cursor.yaml          # Per-platform capability data
    │   ├── codex.yaml
    │   ├── claude.yaml
    │   ├── capabilities.json    # Combined capability matrix (ADDENDUM v2.1)
    │   ├── discovery-report.md  # Human-readable summary (ADDENDUM v2.1)
    │   ├── smoke-test-cursor.log # Smoke test logs (ADDENDUM v2.1)
    │   ├── smoke-test-codex.log
    │   └── smoke-test-claude.log
    ├── usage/                   # Budget tracking (ADDENDUM v2.0)
    │   └── usage.jsonl
    ├── evidence/
    │   ├── gate-reports/
    │   │   └── task-001-001.json
    │   ├── screenshots/
    │   │   └── verify-001.png
    │   ├── test-logs/
    │   │   └── iteration-001.log
    │   └── verifier-results/    # ADDENDUM v2.0
    │       └── ST-001-001-001.json
    ├── logs/
    │   ├── activity.log
    │   ├── errors.log
    │   ├── git-actions.log      # ADDENDUM v2.0
    │   └── iterations/
    │       └── iter-001.json
    └── audit.log
```

---

## 3. Primary State Files

### 3.1 `progress.txt` — Short-Term Memory

**Purpose:** Append-only log of recent activity. Each agent reads this to understand what happened in previous iterations.

**Location:** `<project-root>/progress.txt`

**Update Policy:**
- Append after EVERY iteration
- NEVER delete or replace entries
- Puppet Master may archive old entries (configurable)

#### Schema (UPDATED v2.0)

```markdown
## Codebase Patterns

(Consolidated patterns - updated when genuinely reusable knowledge discovered)
- Pattern 1: description
- Pattern 2: description

---

## [ISO_TIMESTAMP] - [ITEM_ID]

**Session:** [session_id]
**Platform:** [cursor|codex|claude]
**Duration:** [Xm Ys]
**Status:** [SUCCESS | FAILED | PARTIAL]

### What Was Done
- Bullet point of accomplishment
- Another accomplishment

### Files Changed
- `path/to/file1.ts` - description of change
- `path/to/file2.ts` - description of change

### Tests Run
- `npm test` - PASSED
- `npm run typecheck` - PASSED

### Learnings for Future Iterations
- Learning 1 (gotcha, pattern, or context)
- Learning 2

### Next Steps
- What the next iteration should do (if incomplete)

---
```

**NOTE (ADDENDUM v2.0, UPDATED v2.1):** The "Thread" field (originally from Amp-specific terminology like example.invalid/threads/<id>) has been renamed to **"Session"** for platform neutrality. Session IDs follow the format: `PM-YYYY-MM-DD-HH-MM-SS-NNN`. This rename ensures no Amp involvement is implied and maintains clarity across all supported CLI platforms (Cursor, Codex, Claude Code).

#### Example (UPDATED v2.0)

```markdown
## Codebase Patterns

- Use `sql<number>` template tag for database aggregations
- Always use `IF NOT EXISTS` for migrations
- Export types from `actions.ts` for UI components
- Authentication middleware lives in `lib/auth.ts`

---

## 2026-01-10T14:32:15Z - US-003

**Session:** PM-2026-01-10-14-32-15-001
**Platform:** cursor
**Duration:** 4m 23s
**Status:** SUCCESS

### What Was Done
- Added `status` column to tasks table with migration
- Updated Prisma schema with TaskStatus enum
- Created migration file `20260110_add_task_status`

### Files Changed
- `prisma/schema.prisma` - added status field to Task model
- `prisma/migrations/20260110_add_task_status/migration.sql` - migration SQL

### Tests Run
- `npm run typecheck` - PASSED
- `npx prisma validate` - PASSED

### Learnings for Future Iterations
- Prisma requires `npx prisma generate` after schema changes
- Status enum should be defined before the model that uses it

### Next Steps
- N/A - all acceptance criteria met

---

## 2026-01-10T14:28:51Z - US-002

**Session:** PM-2026-01-10-14-28-51-001
**Platform:** cursor
**Duration:** 6m 12s
**Status:** SUCCESS

### What Was Done
- Implemented user authentication middleware
- Added JWT token validation
- Created protected route wrapper

...
```

---

### 3.2 `AGENTS.md` — Long-Term Memory

**Purpose:** Reusable knowledge that persists across features/projects. Contains patterns, conventions, architecture notes, and gotchas that any future agent should know.

**Location:** 
- `<project-root>/AGENTS.md` - Project-wide (REQUIRED)
- `<subdirectory>/AGENTS.md` - Directory-specific (optional)
- `.puppet-master/agents/phase-<id>.md` - Phase-specific (optional, ADDENDUM v2.0)
- `.puppet-master/agents/task-<id>.md` - Task-specific (optional, ADDENDUM v2.0)

**Update Policy (STRENGTHENED v2.0):**
- Update is **MANDATORY** when genuinely reusable knowledge is discovered
- Gates MAY fail if expected AGENTS.md update is missing
- NOT story-specific details
- NOT temporary debugging notes
- Puppet Master suggests updates; human approves (configurable)

#### Required Structure (ADDENDUM v2.0)

```markdown
# [Project Name] - Agent Instructions

## Overview
[Brief project description - 2-3 sentences max]

## Architecture Notes
- [Key architectural decisions]
- [Module organization]
- [Data flow patterns]

## Codebase Patterns
- [Pattern: "When doing X, always Y"]
- [Pattern: "Use Z pattern for Q situations"]

## Tooling Rules
- [MCP configuration notes]
- [Required environment setup]
- [Build/test commands]

## Common Failure Modes
- [Failure: description + fix]
- [Failure: description + fix]

## Do's and Don'ts

### Do
- [Do item]
- [Do item]

### Don't
- [Don't item]
- [Don't item]

## Testing
- Run tests: `[command]`
- Test database: `[setup notes]`
- Browser tests: `[requirements]`

## Directory Structure
- `[dir]/` - [purpose]
- `[dir]/` - [purpose]
```

#### Example

```markdown
# Untangle - Agent Instructions

## Overview
Investor outreach management system. Tracks cold and warm investor contacts
through multi-phase messaging campaigns.

## Architecture Notes
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- Server actions for mutations
- Zustand for client state

## Codebase Patterns
- Use `sql<number>` template for Prisma raw queries with counts
- All database dates stored as UTC, converted in UI
- Export types from `lib/actions/*.ts` for component props
- Use `revalidatePath()` after server actions that mutate data

## Tooling Rules
- MCP server: Context7 for documentation lookup
- Browser verification: dev-browser skill required
- Node version: 20.x (use nvm)

## Common Failure Modes
- Prisma schema change without generate: Run `npx prisma generate`
- Missing revalidation: Add `revalidatePath()` after mutations
- Type mismatch in server actions: Re-export types from action files

## Do's and Don'ts

### Do
- Run typecheck before committing
- Update AGENTS.md when discovering new patterns
- Use server actions for all data mutations

### Don't
- Use `console.log` in server components (use `console.error`)
- Commit without running tests
- Add inline styles (use Tailwind)

## Testing
- Run: `npm test`
- Requires: PostgreSQL running on localhost:5432
- Test DB: `untangle_test` (created automatically)
- Browser tests require `dev-browser` skill

## Directory Structure
- `app/` - Next.js routes and pages
- `components/` - React components
- `lib/actions/` - Server actions
- `lib/db/` - Database utilities
- `prisma/` - Schema and migrations
```

#### AGENTS.md Update Policy Rules

| Should Add | Should NOT Add |
|------------|----------------|
| Reusable patterns across stories | Story-specific implementation details |
| Architecture decisions | Temporary debugging notes |
| Recurring gotchas | Information already in progress.txt |
| Test environment requirements | One-time setup instructions |
| File dependency chains | Individual commit descriptions |

#### Multi-Level AGENTS.md Loading Order (ADDENDUM v2.0)

When building iteration prompts, load AGENTS.md files in this order:

1. **Root AGENTS.md** (always loaded)
2. **Module AGENTS.md** (if editing files in module with AGENTS.md)
3. **Phase AGENTS.md** (if exists: `.puppet-master/agents/phase-<id>.md`)
4. **Task AGENTS.md** (if exists: `.puppet-master/agents/task-<id>.md`)

#### Promotion Rules (ADDENDUM v2.0)

| From Level | To Level | Trigger | Reviewer Action |
|------------|----------|---------|-----------------|
| Task AGENTS | Phase AGENTS | Task gate passes | Identify broadly applicable patterns |
| Phase AGENTS | Root AGENTS | Phase gate passes | Identify project-wide patterns |
| Module AGENTS | Root AGENTS | Manual review | Identify cross-module patterns |

---

### 3.3 `prd.json` — Structured Work Queue

**Purpose:** Machine-readable representation of all work items (phases, tasks, subtasks) with their status, acceptance criteria, and evidence.

**Location:** `.puppet-master/prd.json`

**Update Policy:**
- Updated by Puppet Master after each iteration
- Human-editable for re-planning
- Backed up before major changes

#### Schema

```typescript
interface PRD {
  project: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  branchName: string;
  description: string;
  
  phases: Phase[];
  
  metadata: {
    totalPhases: number;
    completedPhases: number;
    totalTasks: number;
    completedTasks: number;
    totalSubtasks: number;
    completedSubtasks: number;
  };
}

interface Phase {
  id: string;                    // "PH-001"
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  
  tasks: Task[];
  
  evidence?: Evidence;
  gateReport?: GateReport;
  
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  notes: string;
}

interface Task {
  id: string;                    // "TK-001-001"
  phaseId: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  
  subtasks: Subtask[];
  
  evidence?: Evidence;
  gateReport?: GateReport;
  
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  notes: string;
}

/** Optional. When present, orchestrator uses these subagents for this item; else fallback to dynamic selection. See Plans/interview-subagent-integration.md and Plans/orchestrator-subagent-integration.md. */
interface CrewRecommendation {
  /** Required. Names from subagent_registry (e.g. "rust-engineer", "security-auditor"). */
  subagents: string[];
  rationale?: string;
  crew_template?: string;
  complexity_score?: number;
  expertise_areas?: string[];
}

interface Subtask {
  id: string;                    // "ST-001-001-001"
  taskId: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  
  iterations: Iteration[];
  maxIterations: number;
  
  evidence?: Evidence;
  
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  notes: string;
  
  /** Optional. Orchestrator uses these subagents when present; else dynamic selection. */
  crew_recommendation?: CrewRecommendation;
  /** Optional. Item ids that must complete before this one. Empty or missing = no dependencies. */
  depends_on?: string[];
  /** Optional. Items with same non-empty value may run in parallel (subject to depends_on). */
  parallel_group?: string | null;
}

interface Iteration {
  id: string;                    // "IT-001-001-001-001"
  subtaskId: string;
  attemptNumber: number;
  
  status: 'running' | 'succeeded' | 'failed';
  
  startedAt: string;
  completedAt?: string;
  
  platform: string;
  model: string;
  sessionId: string;              // UPDATED v2.1: was runId (v2.0), was threadId (v1.x)
  processId: number;             // ADDENDUM v2.0
  
  output?: string;
  testsRun?: TestResult[];
  acceptanceChecked?: CriterionResult[];
  
  gitCommit?: string;
}

type ItemStatus = 
  | 'pending'
  | 'planning'
  | 'running'
  | 'gating'
  | 'passed'
  | 'failed'
  | 'escalated'
  | 'reopened';

interface Criterion {
  id: string;
  description: string;
  type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'test' | 'cli_verify' | 'perf_verify' | 'ai_verify';  // EXPANDED v2.0
  target?: string;
  options?: string;
  passed?: boolean;
  evidence?: string;
}

interface TestPlan {
  commands: TestCommand[];
  failFast: boolean;
}

interface TestCommand {
  command: string;
  args?: string[];
  workingDirectory?: string;
  timeout?: number;
  expectedExitCode?: number;
}

interface Evidence {
  collectedAt: string;
  items: EvidenceItem[];
}

interface EvidenceItem {
  type: 'log' | 'screenshot' | 'file' | 'metric';  // EXPANDED v2.0
  path: string;
  summary: string;
}

interface GateReport {
  gateType: 'task' | 'phase';
  executedAt: string;
  platform: string;
  model: string;
  
  testResults: TestResult[];
  acceptanceResults: CriterionResult[];
  verifierResults: VerifierResult[];  // ADDENDUM v2.0
  
  passed: boolean;
  decision: 'pass' | 'self_fix' | 'kick_down' | 'escalate';
  reason?: string;
  
  agentsUpdated: boolean;  // ADDENDUM v2.0
}
```

**Crew and parallelism:** The canonical schema for `crew_recommendation`, `depends_on`, and `parallel_group` is defined above on Subtask. Phase and Task may carry the same optional fields with the same types and semantics when the generator specifies recommendations/dependencies at that level. Generator: Plans/interview-subagent-integration.md §5.2 and Crew-Aware Plan Generation. Consumer: Plans/orchestrator-subagent-integration.md "Respecting PRD/plan: subagent personas and parallelization."

#### Example

```json
{
  "project": "Untangle",
  "version": "1.0.0",
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T14:35:00Z",
  "branchName": "pm/friends-feature",
  "description": "Add investor friend tagging and custom sequences",
  
  "phases": [
    {
      "id": "PH-001",
      "title": "Database & Backend",
      "description": "Add investor type field and update server actions",
      "status": "running",
      "priority": 1,
      
      "acceptanceCriteria": [
        {
          "id": "AC-001-01",
          "description": "InvestorType enum exists in Prisma schema",
          "type": "file_exists",
          "target": "prisma/schema.prisma",
          "passed": true
        },
        {
          "id": "AC-001-02",
          "description": "TEST:npm run typecheck",
          "type": "test",
          "target": "npm run typecheck",
          "passed": true
        }
      ],
      
      "testPlan": {
        "commands": [
          { "command": "npm", "args": ["run", "typecheck"] },
          { "command": "npm", "args": ["test"] }
        ],
        "failFast": true
      },
      
      "tasks": [
        {
          "id": "TK-001-001",
          "phaseId": "PH-001",
          "title": "Add investor type field",
          "status": "passed",
          "subtasks": [...]
        }
      ]
    }
  ],
  
  "metadata": {
    "totalPhases": 3,
    "completedPhases": 0,
    "totalTasks": 8,
    "completedTasks": 1,
    "totalSubtasks": 18,
    "completedSubtasks": 3
  }
}
```

---

## 4. Capability Discovery Files (ADDENDUM v2.0, UPDATED v2.1)

### 4.1 Location

`.puppet-master/capabilities/<platform>.yaml`

### 4.2 Per-Platform Schema

```yaml
# .puppet-master/capabilities/cursor.yaml

platform: cursor
version: "1.2.3"
discovered_at: "2026-01-10T14:00:00Z"

invocation:
  command: "cursor-agent"
  non_interactive_flag: "-p"
  model_flag: "--model"
  working_dir_flag: null  # Uses CWD

capabilities:
  non_interactive: true
  model_selection: true
  streaming: "partial"  # full | partial | none
  session_resume: true
  mcp_support: true
  max_turns: true
  output_formats:
    - "text"

exit_codes:
  success: 0
  failure: [1, 2]

available_models:
  - "auto"
  - "sonnet-4.5-thinking"
  - "grok-code"

smoke_test:
  passed: true
  tests:
    - name: "basic_invocation"
      passed: true
      duration_ms: 1234
    - name: "non_interactive"
      passed: true
      duration_ms: 2345
    - name: "model_selection"
      passed: true
      duration_ms: 1567
  total_duration_ms: 5146
```

### 4.3 Combined Capability Matrix (ADDENDUM v2.1)

**Location:** `.puppet-master/capabilities/capabilities.json`

**Purpose:** Single authoritative source of truth for all platform capabilities. This file is the primary artifact that the orchestrator checks before execution.

```json
{
  "generated_at": "2026-01-10T14:00:00Z",
  "generated_by": "puppet-master doctor",
  "staleness_threshold_hours": 24,
  
  "platforms": {
    "cursor": {
      "available": true,
      "version": "1.2.3",
      "discovered_at": "2026-01-10T14:00:00Z",
      "smoke_test_passed": true,
      "capabilities": {
        "non_interactive": true,
        "model_selection": true,
        "streaming": "partial",
        "session_resume": true,
        "mcp_support": true
      },
      "invocation": {
        "command": "cursor-agent",
        "non_interactive_flag": "-p",
        "model_flag": "--model"
      },
      "available_models": ["auto", "sonnet-4.5-thinking", "grok-code"]
    },
    "codex": {
      "available": true,
      "version": "2.1.0",
      "discovered_at": "2026-01-10T14:00:00Z",
      "smoke_test_passed": true,
      "capabilities": {
        "non_interactive": true,
        "model_selection": true,
        "streaming": "full",
        "session_resume": true,
        "mcp_support": true
      },
      "invocation": {
        "command": "codex",
        "non_interactive_flag": "exec",
        "model_flag": "--model"
      },
      "available_models": ["gpt-5.2-high", "gpt-5"]
    },
    "claude": {
      "available": true,
      "version": "1.0.0",
      "discovered_at": "2026-01-10T14:00:00Z",
      "smoke_test_passed": true,
      "capabilities": {
        "non_interactive": true,
        "model_selection": true,
        "streaming": "partial",
        "session_resume": true,
        "mcp_support": true
      },
      "invocation": {
        "command": "claude",
        "non_interactive_flag": "-p",
        "model_flag": "--model"
      },
      "available_models": ["opus-4.5", "sonnet-4.5"]
    }
  },
  
  "validation": {
    "all_required_platforms_available": true,
    "all_smoke_tests_passed": true,
    "ready_for_execution": true,
    "issues": []
  }
}
```

### 4.4 Human-Readable Discovery Report (ADDENDUM v2.1)

**Location:** `.puppet-master/capabilities/discovery-report.md`

**Purpose:** Human-readable summary for review and debugging.

```markdown
# Capability Discovery Report

**Generated:** 2026-01-10T14:00:00Z
**Status:** ✅ Ready for Execution

## Platform Summary

| Platform | Version | Smoke Test | Non-Interactive | Model Selection |
|----------|---------|------------|-----------------|-----------------|
| Cursor   | 1.2.3   | ✅ PASS    | ✅              | ✅              |
| Codex    | 2.1.0   | ✅ PASS    | ✅              | ✅              |
| Claude   | 1.0.0   | ✅ PASS    | ✅              | ✅              |

## Smoke Test Details

### Cursor
- basic_invocation: PASS (1234ms)
- non_interactive: PASS (2345ms)
- model_selection: PASS (1567ms)

### Codex
- basic_invocation: PASS (987ms)
- non_interactive: PASS (1456ms)
- model_selection: PASS (2234ms)

### Claude
- basic_invocation: PASS (1123ms)
- non_interactive: PASS (1890ms)
- model_selection: PASS (2001ms)

## Issues

None detected.

## Next Steps

Capabilities are valid. Ready to start execution.
```

### 4.5 Smoke Test Logs (ADDENDUM v2.1)

**Location:** `.puppet-master/capabilities/smoke-test-<platform>.log`

**Purpose:** Full output from smoke test runs for debugging.

```
# .puppet-master/capabilities/smoke-test-cursor.log

=== Smoke Test: cursor ===
Started: 2026-01-10T14:00:00Z

--- Test: basic_invocation ---
Command: cursor-agent --version
Exit Code: 0
Duration: 234ms
Output:
  cursor-agent version 1.2.3

--- Test: non_interactive ---
Command: cursor-agent -p "echo test"
Exit Code: 0
Duration: 2345ms
Output:
  test
  
--- Test: model_selection ---
Command: cursor-agent -p "echo test" --model auto
Exit Code: 0
Duration: 1567ms
Output:
  test

=== Summary ===
Total Tests: 3
Passed: 3
Failed: 0
Total Duration: 5146ms
```

### 4.6 Update Policy

- Regenerated on `puppet-master doctor`
- Regenerated on explicit request
- Cached for 24 hours (configurable)
- Invalid or missing capabilities block execution
- **Orchestrator MUST refuse to start if capabilities.json is missing or stale** (ADDENDUM v2.1)

---

## 5. Usage Tracking Files (ADDENDUM v2.0)

### 5.1 Location

`.puppet-master/usage/usage.jsonl`

### 5.2 Schema (JSONL, UPDATED v2.1)

```jsonl
{"timestamp":"2026-01-10T14:00:00Z","platform":"claude","action":"start_chain","item_id":"PH-001","tokens":5000,"duration_ms":30000,"session_id":"PM-2026-01-10-14-00-00-001"}
{"timestamp":"2026-01-10T14:05:00Z","platform":"claude","action":"phase_gate","item_id":"PH-001","tokens":3000,"duration_ms":20000,"session_id":"PM-2026-01-10-14-05-00-001"}
{"timestamp":"2026-01-10T14:30:00Z","platform":"codex","action":"task_gate","item_id":"TK-001-001","tokens":4000,"duration_ms":25000,"session_id":"PM-2026-01-10-14-30-00-001"}
{"timestamp":"2026-01-10T14:35:00Z","platform":"cursor","action":"iteration","item_id":"ST-001-001-001","tokens":2000,"duration_ms":180000,"session_id":"PM-2026-01-10-14-35-00-001"}
```

### 5.3 Summary File

`.puppet-master/usage/summary.json`

```json
{
  "period_start": "2026-01-10T00:00:00Z",
  "period_end": "2026-01-10T23:59:59Z",
  "by_platform": {
    "claude": {
      "total_calls": 2,
      "total_tokens": 8000,
      "total_duration_ms": 50000,
      "calls_remaining_hour": 1,
      "calls_remaining_day": 8,
      "cooldown_until": null
    },
    "codex": {
      "total_calls": 5,
      "total_tokens": 15000,
      "total_duration_ms": 125000,
      "calls_remaining_hour": 15,
      "calls_remaining_day": 95,
      "cooldown_until": null
    },
    "cursor": {
      "total_calls": 25,
      "total_tokens": 50000,
      "total_duration_ms": 4500000,
      "calls_remaining_hour": "unlimited",
      "calls_remaining_day": "unlimited",
      "cooldown_until": null
    }
  }
}
```

---

## 6. Evidence Files

### 6.1 Gate Reports

**Location:** `.puppet-master/evidence/gate-reports/<item-id>.json`

**Schema:**

```json
{
  "gate_id": "TK-001-001",
  "gate_type": "task",
  "executed_at": "2026-01-10T15:00:00Z",
  "platform": "codex",
  "model": "gpt-5.2-high",
  "session_id": "PM-2026-01-10-15-00-00-001",
  
  "verifiers_run": [
    {
      "type": "TEST",
      "target": "npm test",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/test-logs/TK-001-001-test.log",
      "summary": "15 tests passed, 0 failed",
      "duration_ms": 5234
    },
    {
      "type": "CLI_VERIFY",
      "target": "npm run typecheck",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/test-logs/TK-001-001-typecheck.log",
      "summary": "No TypeScript errors",
      "duration_ms": 2341
    },
    {
      "type": "BROWSER_VERIFY",
      "target": "login-flow",
      "passed": true,
      "evidence_path": ".puppet-master/evidence/screenshots/TK-001-001-login.png",
      "summary": "Login flow completed successfully",
      "duration_ms": 8765
    }
  ],
  
  "acceptance_results": [
    {
      "criterion_id": "AC-001-01",
      "description": "User can log in with valid credentials",
      "passed": true,
      "verified_by": "BROWSER_VERIFY:login-flow"
    }
  ],
  
  "test_results": {
    "passed": true,
    "total": 15,
    "passed_count": 15,
    "failed_count": 0,
    "skipped_count": 0
  },
  
  "overall_passed": true,
  "decision": "pass",
  "reason": null,
  
  "agents_updated": true,
  "agents_update_summary": "Added pattern: Use revalidatePath after mutations"
}
```

### 6.2 Verifier Results (ADDENDUM v2.0)

**Location:** `.puppet-master/evidence/verifier-results/<item-id>.json`

**Schema:**

```json
{
  "item_id": "ST-001-001-001",
  "iteration": 2,
  "session_id": "PM-2026-01-10-14-35-00-001",
  "executed_at": "2026-01-10T14:40:00Z",
  
  "verifiers": [
    {
      "token": "TEST:npm test -- --testPathPattern=auth",
      "type": "TEST",
      "target": "npm test -- --testPathPattern=auth",
      "options": null,
      "passed": true,
      "output_summary": "5 tests passed",
      "evidence": {
        "type": "log",
        "path": ".puppet-master/evidence/test-logs/ST-001-001-001-iter-002-auth.log",
        "size_bytes": 4523,
        "checksum": "sha256:abc123..."
      },
      "duration_ms": 3456
    },
    {
      "token": "FILE_VERIFY:src/lib/auth.ts:exists",
      "type": "FILE_VERIFY",
      "target": "src/lib/auth.ts",
      "options": "exists",
      "passed": true,
      "output_summary": "File exists, 234 lines",
      "evidence": {
        "type": "file",
        "path": ".puppet-master/evidence/file-snapshots/ST-001-001-001-auth.ts.snapshot",
        "size_bytes": 8901,
        "checksum": "sha256:def456..."
      },
      "duration_ms": 12
    }
  ],
  
  "all_passed": true,
  "total_duration_ms": 3468
}
```

### 6.3 Screenshots

**Location:** `.puppet-master/evidence/screenshots/<scenario>-<timestamp>.png`

**Naming Convention:** `<item-id>-<scenario>-<timestamp>.png`

### 6.4 Test Logs

**Location:** `.puppet-master/evidence/test-logs/<item-id>-<test-name>.log`

**Format:** Plain text with ANSI codes stripped

---

## 7. Log Files

### 7.1 Activity Log

**Location:** `.puppet-master/logs/activity.log`

**Format:** JSONL

```jsonl
{"timestamp":"2026-01-10T10:00:00Z","type":"project_init","data":{"requirements":"requirements.md"}}
{"timestamp":"2026-01-10T10:05:00Z","type":"start_chain_begin","data":{"phase":"prd_generation"}}
{"timestamp":"2026-01-10T10:10:00Z","type":"start_chain_complete","data":{"phases":3,"tasks":8,"subtasks":18}}
{"timestamp":"2026-01-10T10:15:00Z","type":"execution_start","data":{"phase":"PH-001","task":"TK-001-001"}}
{"timestamp":"2026-01-10T10:20:00Z","type":"iteration_start","data":{"item":"ST-001-001-001","attempt":1,"platform":"cursor"}}
{"timestamp":"2026-01-10T10:25:00Z","type":"iteration_complete","data":{"item":"ST-001-001-001","attempt":1,"status":"success"}}
```

### 7.2 Error Log

**Location:** `.puppet-master/logs/errors.log`

**Format:** Structured text

```
[2026-01-10T14:30:00Z] ERROR platform/cursor
  Message: cursor-agent exited with code 1
  Item: ST-001-001-002
  Iteration: 3
  Stack:
    at CursorRunner.execute (cursor-runner.ts:45)
    at ExecutionEngine.runIteration (execution-engine.ts:123)
  Context:
    prompt_length: 4523
    timeout: false
    output_tail: "Error: Cannot find module 'missing-dep'"

[2026-01-10T14:45:00Z] ERROR verification/test
  Message: Test command timed out
  Item: TK-001-001
  Command: npm test
  Timeout: 60000ms
```

### 7.3 Git Actions Log (ADDENDUM v2.0)

**Location:** `.puppet-master/logs/git-actions.log`

**Format:** JSONL

```jsonl
{"timestamp":"2026-01-10T14:00:00Z","action":"commit","sha":"abc1234","message":"pm: ST-001-001-001 add auth middleware","files_count":3,"branch":"pm/ph-001/tk-001"}
{"timestamp":"2026-01-10T14:05:00Z","action":"push","branch":"pm/ph-001/tk-001","result":"success","remote":"origin"}
{"timestamp":"2026-01-10T15:00:00Z","action":"pr_create","number":42,"title":"pm: TK-001-001 Authentication Task","branch":"pm/ph-001/tk-001","base":"main"}
{"timestamp":"2026-01-10T15:30:00Z","action":"branch_create","name":"pm/ph-001/tk-002","base":"pm/ph-001/tk-001"}
{"timestamp":"2026-01-10T16:00:00Z","action":"merge","source":"pm/ph-001/tk-001","target":"main","strategy":"squash","sha":"def5678"}
```

### 7.4 Iteration Log

**Location:** `.puppet-master/logs/iterations/iter-<id>.json`

**Schema:**

```json
{
  "iteration_id": "IT-001-001-001-002",
  "subtask_id": "ST-001-001-001",
  "attempt_number": 2,
  
  "timing": {
    "started_at": "2026-01-10T14:35:00Z",
    "completed_at": "2026-01-10T14:40:30Z",
    "duration_ms": 330000
  },
  
  "execution": {
    "platform": "cursor",
    "model": "sonnet-4.5-thinking",
    "process_id": 12345,
    "fresh_spawn": true,
    "session_resumed": false,
    "exit_code": 0,
    "session_id": "PM-2026-01-10-14-35-00-001"
  },
  
  "context_provided": {
    "progress_entries": 5,
    "agents_files": ["AGENTS.md", "src/lib/AGENTS.md"],
    "plan_file": ".puppet-master/plans/subtask-001-001-001.md"
  },
  
  "prompt": {
    "template": "iteration.md",
    "variables": {
      "subtask_id": "ST-001-001-001",
      "title": "Add auth middleware",
      "acceptance_criteria": "..."
    },
    "rendered_length": 4523
  },
  
  "output": {
    "raw_length": 8901,
    "parsed": {
      "files_changed": ["src/lib/auth.ts", "src/middleware.ts"],
      "commands_run": ["npm run typecheck", "npm test"],
      "completion_signal": "<pm>COMPLETE</pm>"
    }
  },
  
  "verification": {
    "tests_run": [
      {"command": "npm run typecheck", "passed": true, "duration_ms": 2341},
      {"command": "npm test", "passed": true, "duration_ms": 5678}
    ],
    "acceptance_checked": [
      {"criterion": "AC-001", "passed": true, "verifier": "FILE_VERIFY"}
    ]
  },
  
  "result": {
    "status": "success",
    "reason": null
  },
  
  "git_commit": {
    "sha": "abc1234def",
    "message": "pm: ST-001-001-001 add auth middleware",
    "files_committed": ["src/lib/auth.ts", "src/middleware.ts"]
  },
  
  "agents_update": {
    "updated": true,
    "level": "root",
    "additions": ["Pattern: Always validate JWT in middleware before route handlers"]
  }
}
```

### 7.5 Audit Log

**Location:** `.puppet-master/audit.log`

**Purpose:** Track configuration changes, re-plans, reopens for compliance

**Format:** JSONL

```jsonl
{"timestamp":"2026-01-10T10:00:00Z","action":"project_init","user":"cli","data":{"requirements":"requirements.md"}}
{"timestamp":"2026-01-10T10:05:00Z","action":"config_change","user":"cli","data":{"key":"tiers.task.model","old":"gpt-5","new":"gpt-5.2-high"}}
{"timestamp":"2026-01-10T15:00:00Z","action":"item_reopened","user":"gui","data":{"item_id":"ST-001-001-001","reason":"Integration test failed"}}
{"timestamp":"2026-01-10T16:00:00Z","action":"replan","user":"cli","data":{"phase_id":"PH-002","reason":"Scope change requested"}}
{"timestamp":"2026-01-10T17:00:00Z","action":"budget_fallback","user":"system","data":{"from":"claude","to":"codex","reason":"hourly_limit_reached"}}
```

---

## 8. Plan Files

### 8.1 Phase Plan

**Location:** `.puppet-master/plans/phase-<id>.md`

**Created:** During Start Chain or when phase is first planned

#### Template

```markdown
# Phase Plan: [PHASE_ID] - [TITLE]

## Overview
[Description of this phase's scope and goals]

## Assumptions
- Assumption 1
- Assumption 2

## Dependencies
- Depends on: [list of preceding phases/external deps]
- Blocks: [list of phases that depend on this]

## Definition of Done
- [ ] All tasks complete with passing gates
- [ ] Phase acceptance criteria verified
- [ ] Phase test plan passes
- [ ] Evidence recorded

## Acceptance Criteria
1. [Criterion 1] - Verifier: [VERIFIER_TOKEN]
2. [Criterion 2] - Verifier: [VERIFIER_TOKEN]

## Test Plan
- `TEST:npm run typecheck`
- `TEST:npm test`
- [Additional commands]

## Tasks (Overview)
| ID | Title | Status |
|----|-------|--------|
| TK-001-001 | Task 1 | Pending |
| TK-001-002 | Task 2 | Pending |

## Risk Assessment
- Risk 1: [description] - Mitigation: [mitigation]

## Estimated Effort
- Tasks: [N]
- Subtasks: ~[M]
- Iterations: ~[K]
```

### 8.2 Task Plan

**Location:** `.puppet-master/plans/task-<id>.md`

#### Template

```markdown
# Task Plan: [TASK_ID] - [TITLE]

## Phase
[PHASE_ID] - [Phase Title]

## Overview
[What this task accomplishes]

## Approach
1. Step 1
2. Step 2
3. Step 3

## Dependencies
- Files: [list of files this task will modify]
- External: [external dependencies]
- Previous tasks: [task IDs]

## Integration Notes
- How this integrates with other tasks
- Coordination requirements

## Acceptance Criteria
1. [Criterion 1] - Verifier: `CLI_VERIFY:npm run typecheck`
2. [Criterion 2] - Verifier: `BROWSER_VERIFY:login-flow`

## Test Plan
- `TEST:npm test -- --testPathPattern=auth`
- `CLI_VERIFY:npm run lint`

## Subtasks (Breakdown)
| ID | Title | Size | Status |
|----|-------|------|--------|
| ST-001-001-001 | Subtask 1 | Small | Pending |
| ST-001-001-002 | Subtask 2 | Medium | Pending |
```

### 8.3 Subtask Plan

**Location:** `.puppet-master/plans/subtask-<id>.md`

#### Template

```markdown
# Subtask: [SUBTASK_ID] - [TITLE]

## Task
[TASK_ID] - [Task Title]

## User Story
As a [role], I want [feature] so that [benefit].

## Scope
[Concise description of what to implement]

## Files to Modify
- `path/to/file1.ts` - [what to change]
- `path/to/file2.ts` - [what to change]

## Acceptance Criteria
- [ ] [Criterion 1] - `FILE_VERIFY:src/auth.ts:exists`
- [ ] [Criterion 2] - `REGEX_VERIFY:src/auth.ts:export function authenticate`
- [ ] `CLI_VERIFY:npm run typecheck`

## Test Requirements
- [ ] `TEST:npm test -- --testPathPattern=auth`

## Implementation Notes
- [Hint or guidance]
- [Gotcha to watch for]

## Context
[Any additional context from progress.txt or AGENTS.md]
```

---

## 9. State File Update Sequences

### 9.1 After Successful Iteration

```
1. Parse iteration output
2. Run verifiers (test plan + acceptance criteria)
3. IF all pass:
   a. Update prd.json: subtask.status = "passed"
   b. Append to progress.txt (with Session ID, not Thread)
   c. Update AGENTS.md (if reusable knowledge - MANDATORY check)
   d. Git commit with standard message format
   e. Git push (if policy allows)
   f. Log to activity.log
   g. Record usage in usage.jsonl
4. IF tests fail:
   a. Log to errors.log
   b. Increment iteration count
   c. Update prd.json: subtask.iterations.push(record)
   d. IF under max: spawn new iteration
   e. ELSE: escalate
```

### 9.2 After Gate Review

```
1. Check budget for gate platform
2. Execute gate prompt (with platform from config)
3. Run tier verifiers (test plan + acceptance criteria)
4. Generate gate report
5. Save gate report to evidence/
6. Check AGENTS.md update (MANDATORY if learnings found)
7. IF passed:
   a. Update prd.json: item.status = "passed"
   b. Update prd.json: item.gateReport = report
   c. Append summary to progress.txt
   d. Git commit
   e. Create PR if configured
   f. Advance to next item
8. IF failed:
   a. Determine action (self_fix, kick_down, escalate)
   b. Update prd.json accordingly
   c. Create new items if kick_down
   d. Log decision to audit.log
9. Record usage in usage.jsonl
```

### 9.3 On Reopen

```
1. Validate item exists and is passed
2. Update prd.json: item.status = "reopened"
3. Update prd.json: item.reopenedAt = now
4. Update prd.json: item.reopenReason = reason
5. Clear evidence (optional)
6. Reset iteration count
7. Log to audit.log
8. Append to progress.txt: "Reopened: [reason]"
```

### 9.4 On Replan

```
1. Archive current prd.json to archive/
2. Regenerate affected plans
3. Update prd.json with new items
4. Update progress.txt with replan note
5. Log to audit.log
6. Git commit: "pm: replan [reason]"
```

### 9.5 On Budget Limit Reached (ADDENDUM v2.0)

```
1. Log to usage.jsonl
2. Update usage/summary.json
3. Determine fallback action:
   a. IF fallback_platform configured:
      - Log fallback to audit.log
      - Continue with fallback platform
   b. ELSE IF policy = pause:
      - Emit execution_paused event
      - Wait for cooldown or resume
   c. ELSE IF policy = queue:
      - Queue work for later
      - Continue with other tiers
4. Notify via GUI/CLI
```

---

## 10. File Locking & Concurrency

### 10.1 Lock Strategy

| File | Lock Type | Reason |
|------|-----------|--------|
| prd.json | Exclusive | Prevent corruption during update |
| progress.txt | Append-only | No lock needed (append is atomic) |
| AGENTS.md | Advisory | Suggest updates, human approves |
| config.yaml | Read | Reload on change |
| usage.jsonl | Append-only | No lock needed |

### 10.2 Implementation

```typescript
class FileLocker {
  async withLock<T>(
    file: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const lockFile = `${file}.lock`;
    
    // Acquire lock
    while (await this.exists(lockFile)) {
      await this.wait(100);
    }
    await this.write(lockFile, process.pid.toString());
    
    try {
      return await operation();
    } finally {
      await this.remove(lockFile);
    }
  }
}
```

---

## 11. Backup & Recovery

### 11.1 Automatic Backups

- `prd.json` backed up before each update
- Location: `.puppet-master/backups/prd-<timestamp>.json`
- Retention: Last 50 backups

### 11.2 Archive Policy

When starting a new feature (different branchName):
1. Create archive: `.puppet-master/archive/<date>-<feature>/`
2. Copy: prd.json, progress.txt, plans/, evidence/
3. Reset progress.txt (keep Codebase Patterns section)
4. Initialize fresh prd.json

### 11.3 Recovery Commands

```bash
# Restore prd.json from backup
puppet-master restore --prd <timestamp>

# Restore full archive
puppet-master restore --archive <date>-<feature>

# Rollback to specific state
puppet-master rollback --to <commit-sha>
```

---

*End of STATE_FILES.md*
