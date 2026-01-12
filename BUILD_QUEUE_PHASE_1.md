# RWM Puppet Master — BUILD_QUEUE_PHASE_1.md

> Phase 1: State & Git  
> Tasks: 9  
> Focus: State file managers, git integration

---

## Phase Overview

This phase implements state persistence:
- ProgressManager for progress.txt
- AgentsManager for AGENTS.md (multi-level)
- PrdManager for prd.json
- EvidenceStore for screenshots, logs, gate reports
- File locking utilities
- UsageTracker for budget tracking
- Git integration with branch strategies

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Parallel Group A | PH1-T01, PH1-T02, PH1-T03 | Phase 0 complete |
| Parallel Group B | PH1-T04, PH1-T05 | Phase 0 complete |
| Sequential | PH1-T06 | PH1-T05 |
| Parallel Group C | PH1-T07, PH1-T08, PH1-T09 | Phase 0 complete |

---

## PH1-T01: ProgressManager

### Title
Implement ProgressManager for progress.txt

### Goal
Create ProgressManager class that reads and appends to progress.txt per STATE_FILES.md spec.

### Depends on
- Phase 0 complete (all type definitions)

### Parallelizable with
- PH1-T02, PH1-T03

### Recommended model quality
Medium OK — file I/O with formatting

### Read first
- STATE_FILES.md: Section 3.1 (progress.txt schema)
- REQUIREMENTS.md: Section 9.1 (Short-Term Memory)
- REQUIREMENTS.md: Section 28 (Session ID format)

### Files to create/modify
- `src/memory/progress-manager.ts`
- `src/memory/index.ts` (barrel export)
- `src/memory/progress-manager.test.ts`

### Implementation notes
- Use Session ID format: `PM-YYYY-MM-DD-HH-MM-SS-NNN` (NOT "Thread")
- progress.txt is append-only
- Parse existing entries into structured format
- Support getLatest(n) for reading recent entries

### Acceptance criteria
- [ ] ProgressManager reads progress.txt
- [ ] ProgressManager appends entries in correct format
- [ ] Session ID uses `PM-` prefix format
- [ ] getLatest(n) returns last n entries
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "progress"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "progress"
```

### Evidence to record
- none (unit tests only)

### Cursor Agent Prompt
```
Implement ProgressManager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T01)
- Follow STATE_FILES.md Section 3.1 spec exactly
- Use Session ID format (NOT "Thread")

Read first:
- STATE_FILES.md Section 3.1 for progress.txt schema
- REQUIREMENTS.md Section 28 for Session ID format

Create src/memory/progress-manager.ts:

1. ProgressEntry interface:
   - timestamp: string (ISO format)
   - itemId: string
   - sessionId: string (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
   - platform: 'cursor' | 'codex' | 'claude'
   - duration: string (e.g., "4m 23s")
   - status: 'SUCCESS' | 'FAILED' | 'PARTIAL'
   - accomplishments: string[]
   - filesChanged: { path: string; description: string }[]
   - testsRun: { command: string; result: string }[]
   - learnings: string[]
   - nextSteps: string[]

2. ProgressManager class:
   - constructor(filePath: string = 'progress.txt')
   - async append(entry: ProgressEntry): Promise<void>
   - async read(): Promise<ProgressEntry[]>
   - async getLatest(n?: number): Promise<ProgressEntry[]>
   - generateSessionId(): string
   - private formatEntry(entry: ProgressEntry): string
   - private parseEntries(content: string): ProgressEntry[]

3. Format output per STATE_FILES.md:
   ## {timestamp} - {itemId}
   
   **Session:** {sessionId}
   **Platform:** {platform}
   **Duration:** {duration}
   **Status:** {status}
   
   ### What Was Done
   - {accomplishment}
   
   ### Files Changed
   - `{path}` - {description}
   
   ### Tests Run
   - `{command}` - {result}
   
   ### Learnings for Future Iterations
   - {learning}
   
   ### Next Steps
   - {nextStep}
   
   ---

4. Session ID format: PM-{YYYY-MM-DD}-{HH-MM-SS}-{NNN}
   - Use Date.now() for timestamp
   - NNN is 3-digit sequence (001, 002, etc.)
   - Track sequence within same second

Create src/memory/index.ts to export ProgressManager.

Create src/memory/progress-manager.test.ts:
- Test append creates correct format
- Test read parses entries
- Test getLatest returns correct count
- Test Session ID format is correct
- Test handles empty file
- Test handles malformed content gracefully

After implementation, run:
- npm run typecheck
- npm test -- -t "progress"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T02: AgentsManager

### Title
Implement AgentsManager for AGENTS.md with multi-level support

### Goal
Create AgentsManager class that manages AGENTS.md at root, module, phase, and task levels.

### Depends on
- Phase 0 complete

### Parallelizable with
- PH1-T01, PH1-T03

### Recommended model quality
HQ required — complex multi-level logic

### Read first
- STATE_FILES.md: Section 3.2 (AGENTS.md schema)
- REQUIREMENTS.md: Section 24 (AGENTS.md Enforcement)

### Files to create/modify
- `src/memory/agents-manager.ts`
- `src/memory/index.ts` (update exports)
- `src/memory/agents-manager.test.ts`

### Implementation notes
- Support loading from multiple locations (root, module, phase, task)
- Required structure per STATE_FILES.md Section 3.2
- Support addPattern(), addGotcha(), promoteToHigherLevel()
- Parse sections: Overview, Architecture Notes, Codebase Patterns, etc.

### Acceptance criteria
- [ ] AgentsManager loads root AGENTS.md
- [ ] AgentsManager supports multi-level loading
- [ ] addPattern() appends to correct section
- [ ] addGotcha() appends to failure modes section
- [ ] promoteToHigherLevel() moves content between levels
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "agents"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "agents"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement AgentsManager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T02)
- Support multi-level AGENTS.md per REQUIREMENTS.md Section 24.3
- Follow required structure from STATE_FILES.md

Read first:
- STATE_FILES.md Section 3.2 for AGENTS.md structure
- REQUIREMENTS.md Section 24 for multi-level and enforcement

Create src/memory/agents-manager.ts:

1. AgentsLevel type: 'root' | 'module' | 'phase' | 'task'

2. AgentsContent interface:
   - level: AgentsLevel
   - path: string
   - content: string
   - sections: ParsedSections

3. ParsedSections interface:
   - overview: string
   - architectureNotes: string[]
   - codebasePatterns: string[]
   - toolingRules: string[]
   - commonFailureModes: { description: string; fix: string }[]
   - doItems: string[]
   - dontItems: string[]
   - testing: string[]
   - directoryStructure: { dir: string; purpose: string }[]

4. Pattern interface:
   - description: string
   - context?: string

5. Gotcha interface:
   - description: string
   - fix: string

6. AgentsManagerConfig interface:
   - rootPath: string
   - multiLevelEnabled: boolean
   - modulePattern: string (e.g., "src/*/AGENTS.md")
   - phasePattern: string (e.g., ".puppet-master/agents/phase-*.md")
   - taskPattern: string

7. AgentsManager class:
   - constructor(config: AgentsManagerConfig)
   - async loadForContext(context: IterationContext): Promise<AgentsContent[]>
   - async loadFile(path: string, level: AgentsLevel): Promise<AgentsContent>
   - async read(path: string): Promise<string>
   - async write(path: string, content: string): Promise<void>
   - parseSections(content: string): ParsedSections
   - formatSections(sections: ParsedSections): string
   - async addPattern(pattern: Pattern, level?: AgentsLevel): Promise<void>
   - async addGotcha(gotcha: Gotcha, level?: AgentsLevel): Promise<void>
   - async promoteToHigherLevel(item: string, fromLevel: AgentsLevel, toLevel: AgentsLevel): Promise<void>
   - private findModuleAgents(filesTargeted: string[]): string | null
   - private exists(path: string): Promise<boolean>
   - private getFilePath(level: AgentsLevel, context?: IterationContext): string
   - private findSection(content: string, sectionName: string): string
   - private appendToSection(content: string, section: string, item: string): string

8. IterationContext (partial, for this file):
   - phaseId: string
   - taskId: string
   - filesTargeted: string[]

Update src/memory/index.ts to export AgentsManager.

Create src/memory/agents-manager.test.ts:
- Test loading root AGENTS.md
- Test parsing sections correctly
- Test addPattern appends to Codebase Patterns
- Test addGotcha appends to Common Failure Modes
- Test multi-level loading order
- Test promoteToHigherLevel
- Test handles missing files gracefully

After implementation, run:
- npm run typecheck
- npm test -- -t "agents"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T03: PrdManager

### Title
Implement PrdManager for prd.json

### Goal
Create PrdManager class with full CRUD and query methods for the structured work queue.

### Depends on
- Phase 0 complete

### Parallelizable with
- PH1-T01, PH1-T02

### Recommended model quality
HQ required — complex data structure management

### Read first
- STATE_FILES.md: Section 3.3 (prd.json schema)
- REQUIREMENTS.md: Appendix G (PRD Generation template)

### Files to create/modify
- `src/memory/prd-manager.ts`
- `src/types/prd.ts` (PRD-specific types)
- `src/memory/index.ts` (update exports)
- `src/memory/prd-manager.test.ts`

### Implementation notes
- PRD contains phases, tasks, subtasks with full hierarchy
- Support updateItemStatus(), getNextPending(), findItem()
- Automatically recalculate metadata counts
- Save updates atomically

### Acceptance criteria
- [ ] PrdManager loads prd.json
- [ ] PrdManager saves with updated metadata
- [ ] updateItemStatus() works correctly
- [ ] getNextPending() finds next incomplete item
- [ ] Metadata counts are accurate
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "prd"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "prd"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement PrdManager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T03)
- Follow STATE_FILES.md Section 3.3 schema
- Support full hierarchy: Phases → Tasks → Subtasks

Read first:
- STATE_FILES.md Section 3.3 for prd.json schema
- REQUIREMENTS.md Appendix G for PRD structure

Create src/types/prd.ts:

1. ItemStatus type: 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'reopened'

2. Subtask interface:
   - id: string
   - title: string
   - description: string
   - status: ItemStatus
   - acceptanceCriteria: string[]
   - testCommands: string[]
   - filesTargeted: string[]
   - iterations: IterationRecord[]
   - evidence?: Evidence
   - createdAt: string
   - updatedAt: string

3. IterationRecord interface:
   - iterationNumber: number
   - sessionId: string
   - startedAt: string
   - completedAt?: string
   - status: 'running' | 'success' | 'failure'
   - output?: string
   - error?: string

4. Task interface:
   - id: string
   - title: string
   - description: string
   - status: ItemStatus
   - phaseId: string
   - acceptanceCriteria: string[]
   - testCommands: string[]
   - subtasks: Subtask[]
   - gateReport?: GateReport
   - createdAt: string
   - updatedAt: string

5. Phase interface:
   - id: string
   - title: string
   - description: string
   - status: ItemStatus
   - acceptanceCriteria: string[]
   - testCommands: string[]
   - tasks: Task[]
   - gateReport?: GateReport
   - createdAt: string
   - updatedAt: string

6. PRD interface:
   - project: string
   - version: string
   - createdAt: string
   - updatedAt: string
   - branchName: string
   - description: string
   - phases: Phase[]
   - metadata: PRDMetadata

7. PRDMetadata interface:
   - totalPhases: number
   - completedPhases: number
   - totalTasks: number
   - completedTasks: number
   - totalSubtasks: number
   - completedSubtasks: number

Create src/memory/prd-manager.ts:

1. PrdManager class:
   - constructor(filePath: string = '.puppet-master/prd.json')
   - async load(): Promise<PRD>
   - async save(prd: PRD): Promise<void>
   - async updateItemStatus(itemId: string, status: ItemStatus, evidence?: Evidence): Promise<void>
   - async getNextPending(type: 'phase' | 'task' | 'subtask'): Promise<Phase | Task | Subtask | null>
   - async findItem(itemId: string): Promise<Phase | Task | Subtask | null>
   - async findPhase(phaseId: string): Promise<Phase | null>
   - async findTask(taskId: string): Promise<Task | null>
   - async findSubtask(subtaskId: string): Promise<Subtask | null>
   - async addIterationRecord(subtaskId: string, record: IterationRecord): Promise<void>
   - async setGateReport(itemId: string, report: GateReport): Promise<void>
   - async reopenItem(itemId: string, reason: string): Promise<void>
   - recalculateMetadata(prd: PRD): PRDMetadata
   - private ensureDirectoryExists(filePath: string): Promise<void>

2. Item ID format:
   - Phase: PH-001, PH-002
   - Task: TK-001-001 (phase-task)
   - Subtask: ST-001-001-001 (phase-task-subtask)

Update src/types/index.ts to re-export from prd.ts.
Update src/memory/index.ts to export PrdManager.

Create src/memory/prd-manager.test.ts:
- Test load/save roundtrip
- Test updateItemStatus changes status
- Test getNextPending finds correct item
- Test findItem with different ID types
- Test metadata recalculation
- Test reopenItem sets reopened status
- Test handles missing file by returning empty PRD

After implementation, run:
- npm run typecheck
- npm test -- -t "prd"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T04: EvidenceStore

### Title
Implement EvidenceStore for screenshots, logs, and gate reports

### Goal
Create EvidenceStore class that saves and retrieves evidence artifacts.

### Depends on
- Phase 0 complete

### Parallelizable with
- PH1-T05

### Recommended model quality
Medium OK — file I/O with organization

### Read first
- STATE_FILES.md: Section 5 (Evidence directory structure)
- REQUIREMENTS.md: Section 25.5 (Evidence Artifacts)

### Files to create/modify
- `src/memory/evidence-store.ts`
- `src/types/evidence.ts`
- `src/memory/index.ts` (update exports)
- `src/memory/evidence-store.test.ts`

### Implementation notes
- Organize by type: test-logs/, screenshots/, browser-traces/, file-snapshots/, metrics/
- Use naming convention: {item-id}-{type}.{ext}
- Support saving gate reports as JSON

### Acceptance criteria
- [ ] EvidenceStore creates directory structure
- [ ] saveTestLog() saves to correct path
- [ ] saveScreenshot() saves to correct path
- [ ] saveGateReport() saves JSON
- [ ] getEvidence() retrieves by item ID
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "evidence"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "evidence"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement EvidenceStore for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T04)
- Follow STATE_FILES.md Section 5 directory structure
- Use naming conventions per REQUIREMENTS.md

Read first:
- STATE_FILES.md Section 5 for evidence structure
- REQUIREMENTS.md Section 25.5 for evidence artifacts

Create src/types/evidence.ts:

1. EvidenceType type: 'log' | 'screenshot' | 'trace' | 'snapshot' | 'metric' | 'gate-report'

2. Evidence interface:
   - type: EvidenceType
   - path: string
   - summary: string
   - timestamp: string
   - itemId: string
   - metadata?: Record<string, unknown>

3. GateReportEvidence interface:
   - gateId: string
   - timestamp: string
   - verifiersRun: VerifierResultSummary[]
   - overallPassed: boolean
   - tierType: 'phase' | 'task' | 'subtask'

4. VerifierResultSummary interface:
   - type: string
   - target: string
   - passed: boolean
   - evidencePath?: string
   - summary: string

Create src/memory/evidence-store.ts:

1. EvidenceStore class:
   - constructor(baseDir: string = '.puppet-master/evidence')
   - async initialize(): Promise<void>  // Create directory structure
   - async saveTestLog(itemId: string, content: string, testName?: string): Promise<string>
   - async saveScreenshot(itemId: string, data: Buffer, scenarioName: string): Promise<string>
   - async saveBrowserTrace(itemId: string, data: Buffer): Promise<string>
   - async saveFileSnapshot(itemId: string, filePath: string, content: string): Promise<string>
   - async saveMetric(itemId: string, metric: Record<string, unknown>): Promise<string>
   - async saveGateReport(gateId: string, report: GateReportEvidence): Promise<string>
   - async getEvidence(itemId: string): Promise<Evidence[]>
   - async getGateReport(gateId: string): Promise<GateReportEvidence | null>
   - async listAllEvidence(): Promise<Evidence[]>
   - private generatePath(type: EvidenceType, itemId: string, suffix?: string): string
   - private ensureDirectories(): Promise<void>

2. Directory structure:
   .puppet-master/evidence/
   ├── test-logs/
   ├── screenshots/
   ├── browser-traces/
   ├── file-snapshots/
   ├── metrics/
   └── gate-reports/

3. Naming convention:
   - test-logs: {itemId}-{testName}.log
   - screenshots: {itemId}-{scenario}.png
   - gate-reports: {gateId}.json

Update src/types/index.ts to re-export from evidence.ts.
Update src/memory/index.ts to export EvidenceStore.

Create src/memory/evidence-store.test.ts:
- Test initialize creates directories
- Test saveTestLog writes to correct path
- Test saveScreenshot writes to correct path
- Test saveGateReport writes JSON
- Test getEvidence returns all for item
- Test getGateReport retrieves report
- Use temp directory for tests

After implementation, run:
- npm run typecheck
- npm test -- -t "evidence"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T05: File Locking

### Title
Implement file locking utilities

### Goal
Create file locking utilities to prevent corruption during concurrent access.

### Depends on
- Phase 0 complete

### Parallelizable with
- PH1-T04

### Recommended model quality
Medium OK — standard concurrency pattern

### Read first
- STATE_FILES.md: Section 10 (File Locking & Concurrency)

### Files to create/modify
- `src/utils/file-lock.ts`
- `src/utils/index.ts` (barrel export)
- `src/utils/file-lock.test.ts`

### Implementation notes
- Use lock files (.lock suffix)
- Support timeout and retry
- Handle stale locks (process died)
- prd.json needs exclusive lock
- progress.txt is append-only (no lock needed)

### Acceptance criteria
- [ ] FileLocker acquires and releases locks
- [ ] withLock() helper executes operation under lock
- [ ] Handles timeout correctly
- [ ] Detects and clears stale locks
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "file-lock"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "file-lock"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement file locking utilities for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T05)
- Follow STATE_FILES.md Section 10 locking strategy
- Handle concurrent access scenarios

Read first:
- STATE_FILES.md Section 10 for locking strategy

Create src/utils/file-lock.ts:

1. LockOptions interface:
   - timeout: number (ms, default 5000)
   - retryInterval: number (ms, default 100)
   - staleTimeout: number (ms, default 30000)

2. LockInfo interface:
   - pid: number
   - hostname: string
   - timestamp: number

3. FileLocker class:
   - constructor(options?: Partial<LockOptions>)
   - async acquire(filePath: string): Promise<void>
   - async release(filePath: string): Promise<void>
   - async withLock<T>(filePath: string, operation: () => Promise<T>): Promise<T>
   - isLocked(filePath: string): Promise<boolean>
   - private getLockPath(filePath: string): string
   - private async isStale(lockPath: string): Promise<boolean>
   - private async waitForLock(lockPath: string): Promise<void>
   - private writeLockInfo(lockPath: string): Promise<void>
   - private readLockInfo(lockPath: string): Promise<LockInfo | null>

4. Implementation details:
   - Lock file: {filePath}.lock
   - Lock file contains JSON: { pid, hostname, timestamp }
   - Check if locking process is still running
   - Clear stale locks automatically
   - Throw on timeout

5. Export helper:
   - withFileLock<T>(filePath: string, operation: () => Promise<T>, options?: LockOptions): Promise<T>

Create src/utils/index.ts to export FileLocker, withFileLock.

Create src/utils/file-lock.test.ts:
- Test acquire creates lock file
- Test release removes lock file
- Test withLock executes operation
- Test withLock releases on error
- Test timeout throws error
- Test stale lock detection
- Test concurrent access waits

After implementation, run:
- npm run typecheck
- npm test -- -t "file-lock"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T06: UsageTracker

### Title
Implement UsageTracker for budget tracking

### Goal
Create UsageTracker class that tracks platform usage in usage.jsonl.

### Depends on
- PH1-T05 (file utilities)

### Parallelizable with
- none

### Recommended model quality
Medium OK — file I/O with queries

### Read first
- STATE_FILES.md: Section 4 (usage.jsonl schema)
- REQUIREMENTS.md: Section 23 (Quota/Cooldown)

### Files to create/modify
- `src/memory/usage-tracker.ts`
- `src/types/usage.ts`
- `src/memory/index.ts` (update exports)
- `src/memory/usage-tracker.test.ts`

### Implementation notes
- Append-only JSONL file
- Track: timestamp, platform, action, tokens, duration
- Support queries: by platform, by time period
- Used by BudgetManager (Phase 2)

### Acceptance criteria
- [ ] UsageTracker appends to usage.jsonl
- [ ] track() records usage event
- [ ] getByPlatform() returns events for platform
- [ ] getInPeriod() returns events in time range
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "usage"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "usage"
```

### Evidence to record
- `.puppet-master/usage/usage.jsonl` (on track)

### Cursor Agent Prompt
```
Implement UsageTracker for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T06)
- Follow STATE_FILES.md Section 4 for usage.jsonl
- Support queries per REQUIREMENTS.md Section 23

Read first:
- STATE_FILES.md Section 4 for usage.jsonl schema
- REQUIREMENTS.md Section 23 for budget tracking needs

Create src/types/usage.ts:

1. UsageEvent interface:
   - timestamp: string (ISO format)
   - platform: 'cursor' | 'codex' | 'claude'
   - action: string (e.g., 'iteration', 'gate_review', 'start_chain')
   - tokens?: number
   - durationMs: number
   - sessionId?: string
   - itemId?: string
   - success: boolean
   - error?: string

2. UsageQuery interface:
   - platform?: 'cursor' | 'codex' | 'claude'
   - action?: string
   - since?: Date
   - until?: Date
   - limit?: number

3. UsageSummary interface:
   - platform: 'cursor' | 'codex' | 'claude'
   - totalCalls: number
   - totalTokens: number
   - totalDurationMs: number
   - successCount: number
   - failureCount: number

Create src/memory/usage-tracker.ts:

1. UsageTracker class:
   - constructor(filePath: string = '.puppet-master/usage/usage.jsonl')
   - async track(event: Omit<UsageEvent, 'timestamp'>): Promise<void>
   - async getAll(): Promise<UsageEvent[]>
   - async getByPlatform(platform: Platform): Promise<UsageEvent[]>
   - async getInPeriod(since: Date, until?: Date): Promise<UsageEvent[]>
   - async query(query: UsageQuery): Promise<UsageEvent[]>
   - async getSummary(platform: Platform, since?: Date): Promise<UsageSummary>
   - async getCallCountInLastHour(platform: Platform): Promise<number>
   - async getCallCountToday(platform: Platform): Promise<number>
   - private async ensureFileExists(): Promise<void>
   - private parseLine(line: string): UsageEvent | null

2. File format: JSONL (one JSON object per line)
   {"timestamp":"2026-01-10T14:00:00Z","platform":"claude","action":"phase_gate",...}

Update src/types/index.ts to re-export from usage.ts.
Update src/memory/index.ts to export UsageTracker.

Create src/memory/usage-tracker.test.ts:
- Test track appends to file
- Test getAll reads all events
- Test getByPlatform filters correctly
- Test getInPeriod filters by time
- Test getSummary calculates correctly
- Test getCallCountInLastHour
- Use temp file for tests

After implementation, run:
- npm run typecheck
- npm test -- -t "usage"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T07: GitManager

### Title
Implement GitManager base class

### Goal
Create GitManager class for git operations: commit, push, branch, checkout.

### Depends on
- Phase 0 complete

### Parallelizable with
- PH1-T08, PH1-T09

### Recommended model quality
Medium OK — git CLI wrapper

### Read first
- REQUIREMENTS.md: Section 27 (Git Protocol)
- STATE_FILES.md: Section 6 (Git as Memory)

### Files to create/modify
- `src/git/git-manager.ts`
- `src/git/index.ts` (barrel export)
- `src/git/git-manager.test.ts`

### Implementation notes
- Use child_process to spawn git commands
- Capture stdout/stderr for logging
- Support structured commit messages
- Check for git availability

### Acceptance criteria
- [ ] GitManager.commit() creates commits
- [ ] GitManager.push() pushes to remote
- [ ] GitManager.checkout() switches branches
- [ ] GitManager.createBranch() creates branches
- [ ] GitManager.isAvailable() checks git installation
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "git-manager"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "git-manager"
```

### Evidence to record
- `.puppet-master/logs/git-actions.log`

### Cursor Agent Prompt
```
Implement GitManager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T07)
- Use child_process.spawn, NOT exec
- Follow REQUIREMENTS.md Section 27 commit format

Read first:
- REQUIREMENTS.md Section 27 for git protocol
- STATE_FILES.md Section 6 for git as memory

Create src/git/git-manager.ts:

1. GitResult interface:
   - success: boolean
   - stdout: string
   - stderr: string
   - exitCode: number

2. CommitOptions interface:
   - message: string
   - files?: string[]  // Specific files, or all if not specified
   - amend?: boolean

3. PushOptions interface:
   - remote?: string  // default: origin
   - branch?: string  // default: current branch
   - force?: boolean

4. GitManager class:
   - constructor(workingDirectory: string, logPath?: string)
   - async isAvailable(): Promise<boolean>
   - async getVersion(): Promise<string>
   - async getCurrentBranch(): Promise<string>
   - async commit(options: CommitOptions): Promise<GitResult>
   - async push(options?: PushOptions): Promise<GitResult>
   - async pull(remote?: string): Promise<GitResult>
   - async checkout(branchOrCommit: string): Promise<GitResult>
   - async createBranch(name: string, checkout?: boolean): Promise<GitResult>
   - async deleteBranch(name: string, force?: boolean): Promise<GitResult>
   - async merge(branch: string): Promise<GitResult>
   - async stash(message?: string): Promise<GitResult>
   - async stashPop(): Promise<GitResult>
   - async getRecentCommits(count?: number): Promise<CommitInfo[]>
   - async getStatus(): Promise<GitStatus>
   - async add(files: string[] | '.'): Promise<GitResult>
   - async diff(staged?: boolean): Promise<string>
   - async log(logEntry: GitLogEntry): Promise<void>
   - private async run(args: string[]): Promise<GitResult>
   - private async logAction(action: string, result: GitResult): Promise<void>

5. CommitInfo interface:
   - sha: string
   - shortSha: string
   - message: string
   - author: string
   - date: string

6. GitStatus interface:
   - branch: string
   - staged: string[]
   - modified: string[]
   - untracked: string[]
   - ahead: number
   - behind: number

7. GitLogEntry interface:
   - timestamp: string
   - action: string
   - args?: string[]
   - result: 'success' | 'failure'
   - message?: string
   - sha?: string

Create src/git/index.ts to export GitManager.

Create src/git/git-manager.test.ts:
- Test isAvailable returns true when git installed
- Test getVersion returns version string
- Test getCurrentBranch returns branch name
- Test add stages files
- Test commit creates commit
- Test getStatus returns status
- Test getRecentCommits returns commits
- Mock git commands for unit tests OR use temp repo

After implementation, run:
- npm run typecheck
- npm test -- -t "git-manager"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T08: Branch Strategy

### Title
Implement branch strategy patterns

### Goal
Create branch strategy implementations for single, per-phase, and per-task.

### Depends on
- PH1-T07

### Parallelizable with
- PH1-T09

### Recommended model quality
Medium OK — pattern implementation

### Read first
- REQUIREMENTS.md: Section 14 (Branch Strategy)
- REQUIREMENTS.md: Section 27.3 (Branch Operations)

### Files to create/modify
- `src/git/branch-strategy.ts`
- `src/git/index.ts` (update exports)
- `src/git/branch-strategy.test.ts`

### Implementation notes
- Support granularity: single, per-phase, per-task
- Use naming pattern from config (e.g., `ralph/{phase}/{task}`)
- Integrate with GitManager

### Acceptance criteria
- [ ] BranchStrategy interface defined
- [ ] SingleBranchStrategy implementation
- [ ] PerPhaseBranchStrategy implementation
- [ ] PerTaskBranchStrategy implementation
- [ ] Branch naming follows config pattern
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "branch-strategy"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "branch-strategy"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement branch strategies for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T08)
- Use GitManager from PH1-T07
- Follow REQUIREMENTS.md Section 14 strategies

Read first:
- REQUIREMENTS.md Section 14 for branch strategies
- REQUIREMENTS.md Section 27.3 for branch operations

Create src/git/branch-strategy.ts:

1. BranchStrategyConfig interface:
   - granularity: 'single' | 'per-phase' | 'per-task'
   - baseBranch: string
   - namingPattern: string  // e.g., "ralph/{phase}/{task}"

2. BranchContext interface:
   - phaseId?: string
   - taskId?: string
   - subtaskId?: string

3. BranchStrategy interface:
   - readonly granularity: 'single' | 'per-phase' | 'per-task'
   - getBranchName(context: BranchContext): string
   - shouldCreateBranch(context: BranchContext): boolean
   - shouldMerge(context: BranchContext): boolean

4. BaseBranchStrategy abstract class:
   - constructor(config: BranchStrategyConfig, gitManager: GitManager)
   - protected formatBranchName(pattern: string, context: BranchContext): string
   - async ensureBranch(context: BranchContext): Promise<void>
   - async mergeToBranch(targetBranch: string): Promise<void>

5. SingleBranchStrategy extends BaseBranchStrategy:
   - getBranchName(): returns baseBranch always
   - shouldCreateBranch(): false
   - shouldMerge(): false

6. PerPhaseBranchStrategy extends BaseBranchStrategy:
   - getBranchName(context): format with phase only
   - shouldCreateBranch(context): true when new phase
   - shouldMerge(context): true when phase complete

7. PerTaskBranchStrategy extends BaseBranchStrategy:
   - getBranchName(context): format with phase and task
   - shouldCreateBranch(context): true when new task
   - shouldMerge(context): true when task complete

8. Factory function:
   - createBranchStrategy(config: BranchStrategyConfig, gitManager: GitManager): BranchStrategy

Update src/git/index.ts to export strategies and factory.

Create src/git/branch-strategy.test.ts:
- Test SingleBranchStrategy returns base branch
- Test PerPhaseBranchStrategy formats correctly
- Test PerTaskBranchStrategy formats correctly
- Test shouldCreateBranch logic
- Test shouldMerge logic
- Test pattern substitution with {phase}, {task}

After implementation, run:
- npm run typecheck
npm test -- -t "branch-strategy"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH1-T09: Commit Formatting and PR Manager

### Title
Implement commit message formatting and PR manager

### Goal
Create commit message formatter and GitHub PR manager via gh CLI.

### Depends on
- PH1-T07

### Parallelizable with
- PH1-T08

### Recommended model quality
Medium OK — CLI integration

### Read first
- REQUIREMENTS.md: Section 27.2 (Commit Message Templates)
- REQUIREMENTS.md: Section 27.3 (PR configuration)

### Files to create/modify
- `src/git/commit-formatter.ts`
- `src/git/pr-manager.ts`
- `src/git/index.ts` (update exports)
- `src/git/commit-formatter.test.ts`
- `src/git/pr-manager.test.ts`

### Implementation notes
- Commit format: `ralph: [tier] [item-id] [summary]`
- PR creation via gh CLI
- Check gh availability before using

### Acceptance criteria
- [ ] CommitFormatter generates correct messages per tier
- [ ] PRManager.isAvailable() checks gh CLI
- [ ] PRManager.createPR() creates pull request
- [ ] PRManager handles gh not installed gracefully
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "commit-formatter|pr-manager"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "commit-formatter"
npm test -- -t "pr-manager"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement commit formatting and PR manager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH1-T09)
- Follow REQUIREMENTS.md Section 27.2 commit format
- Use gh CLI for PR creation

Read first:
- REQUIREMENTS.md Section 27.2 for commit templates
- REQUIREMENTS.md Section 27.3 for PR configuration

Create src/git/commit-formatter.ts:

1. CommitTier type: 'iteration' | 'subtask' | 'task_gate' | 'phase_gate' | 'replan' | 'reopen'

2. CommitContext interface:
   - tier: CommitTier
   - itemId: string
   - summary: string
   - status?: 'PASS' | 'FAIL'
   - reason?: string

3. CommitFormatter class:
   - format(context: CommitContext): string
   - formatIteration(itemId: string, summary: string): string
   - formatSubtaskComplete(itemId: string, title: string): string
   - formatTaskGate(itemId: string, status: 'PASS' | 'FAIL'): string
   - formatPhaseGate(itemId: string, status: 'PASS' | 'FAIL'): string
   - formatReplan(scope: string, reason: string): string
   - formatReopen(itemId: string, reason: string): string

4. Commit templates per REQUIREMENTS.md 27.2:
   - iteration: "ralph: [subtask-id] [summary]"
   - subtask_complete: "ralph: complete [subtask-id] - [title]"
   - task_gate: "ralph: task-gate [task-id] - [status]"
   - phase_gate: "ralph: phase-gate [phase-id] - [status]"
   - replan: "ralph: replan [scope] - [reason]"
   - reopen: "ralph: reopen [item-id] - [reason]"

Create src/git/pr-manager.ts:

1. PRConfig interface:
   - enabled: boolean
   - createOn: 'task_complete' | 'phase_complete'
   - autoMerge: boolean
   - requireReview: boolean
   - template?: string
   - labels: string[]

2. PRInfo interface:
   - number: number
   - url: string
   - title: string
   - state: 'open' | 'merged' | 'closed'

3. PRManager class:
   - constructor(workingDirectory: string)
   - async isAvailable(): Promise<boolean>
   - async createPR(title: string, body: string, base?: string): Promise<PRInfo>
   - async getPR(number: number): Promise<PRInfo | null>
   - async mergePR(number: number, method?: 'merge' | 'squash' | 'rebase'): Promise<boolean>
   - async addLabels(number: number, labels: string[]): Promise<void>
   - private async runGh(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }>

Update src/git/index.ts to export CommitFormatter, PRManager.

Create src/git/commit-formatter.test.ts:
- Test each commit format
- Test format() dispatch

Create src/git/pr-manager.test.ts:
- Test isAvailable
- Mock gh CLI for other tests
- Test createPR generates correct command
- Test handles gh not installed

After implementation, run:
- npm run typecheck
- npm test -- -t "commit-formatter"
- npm test -- -t "pr-manager"

Iterate until all tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## Phase 1 Completion Checklist

After completing all Phase 1 tasks:

- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all tests)
- [ ] ProgressManager can read/write progress.txt
- [ ] AgentsManager supports multi-level AGENTS.md
- [ ] PrdManager has full CRUD on prd.json
- [ ] EvidenceStore organizes evidence by type
- [ ] File locking prevents corruption
- [ ] UsageTracker tracks platform usage
- [ ] GitManager can commit, branch, push
- [ ] Branch strategies work per configuration

### Phase 1 Stop Point Commit

```bash
git add .
git commit -m "ralph: phase-1 state-git complete"
```

---

*End of BUILD_QUEUE_PHASE_1.md*
