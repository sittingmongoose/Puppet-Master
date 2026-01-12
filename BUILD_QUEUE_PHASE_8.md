# RWM Puppet Master — BUILD_QUEUE_PHASE_8.md

> Phase 8: AGENTS.md Enforcement  
> Tasks: 6  
> Focus: Multi-level agents, promotion rules, gate integration

---

## Phase Overview

This phase implements AGENTS.md enforcement:
- Multi-level AGENTS.md loading (root, module, phase, task)
- Update detection for AGENTS.md changes
- Promotion rules engine
- Gate integration for enforcement
- Archive management for old AGENTS.md versions

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | PH8-T01 | Phase 7 complete |
| Sequential | PH8-T02 | PH8-T01 |
| Sequential | PH8-T03 | PH8-T02 |
| Sequential | PH8-T04 | PH8-T03 |
| Sequential | PH8-T05 | PH8-T04 |
| Sequential | PH8-T06 | PH8-T05 |

---

## PH8-T01: Multi-Level Loader

### Title
Implement multi-level AGENTS.md loader

### Goal
Create loader that combines AGENTS.md files from multiple levels.

### Depends on
- Phase 7 complete

### Parallelizable with
- none (foundational)

### Recommended model quality
Medium OK — file merging logic

### Read first
- REQUIREMENTS.md: Section 24 (AGENTS.md Enforcement)
- STATE_FILES.md: Section 3.2 (AGENTS.md schema)

### Files to create/modify
- `src/agents/multi-level-loader.ts`
- `src/agents/multi-level-loader.test.ts`
- `src/agents/index.ts`

### Implementation notes
- Load from root, module, phase, task levels
- Merge with priority (more specific overrides general)
- Handle missing files gracefully

### Acceptance criteria
- [ ] MultiLevelLoader class implemented
- [ ] Loads from multiple paths
- [ ] Merges with correct priority
- [ ] Handles missing files
- [ ] Returns combined AgentsDocument
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "MultiLevelLoader"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement multi-level AGENTS.md loader for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH8-T01)
- Follow REQUIREMENTS.md Section 24
- Follow STATE_FILES.md Section 3.2

Create src/agents/multi-level-loader.ts:

1. AgentsLevel type:
   export type AgentsLevel = 'root' | 'module' | 'phase' | 'task';

2. LevelPath interface:
   - level: AgentsLevel
   - path: string
   - exists: boolean

3. MultiLevelLoader class:
   - constructor(agentsManager: AgentsManager)
   - async loadAll(paths: LevelPath[]): Promise<AgentsDocument>
   - async loadForTier(tierId: string, rootDir: string): Promise<AgentsDocument>
   - mergeDocs(docs: AgentsDocument[]): AgentsDocument
   - resolvePaths(tierId: string, rootDir: string): LevelPath[]

4. Path resolution (per STATE_FILES.md):
   - Root: ./AGENTS.md or ./.puppet-master/AGENTS.md
   - Module: ./src/{module}/AGENTS.md
   - Phase: ./.puppet-master/agents/phase-{phase-id}.md
   - Task: ./.puppet-master/agents/task-{task-id}.md
   - Subtask: ./.puppet-master/agents/subtask-{subtask-id}.md
   - Iteration: ./.puppet-master/agents/iteration-{iteration-id}.md

5. Merge priority (later wins):
   1. Root (base)
   2. Module (adds/overrides)
   3. Phase (adds/overrides)
   4. Task (adds/overrides)

6. Merge logic:
   - Arrays: concatenate with dedup
   - Strings: later replaces earlier
   - Objects: deep merge

7. Create src/agents/multi-level-loader.test.ts:
   - Test loading from multiple levels
   - Test merge priority
   - Test missing files handled
   - Use temp directories

8. Create src/agents/index.ts:
   export { MultiLevelLoader } from './multi-level-loader.js';

After implementation, run:
- npm test -- -t "MultiLevelLoader"

Iterate until tests pass.

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

## PH8-T02: Update Detector

### Title
Implement AGENTS.md update detector

### Goal
Detect when AGENTS.md has been updated during execution.

### Depends on
- PH8-T01

### Parallelizable with
- none

### Recommended model quality
Medium OK — file monitoring

### Read first
- REQUIREMENTS.md: Section 24.3 (Runtime updates)

### Files to create/modify
- `src/agents/update-detector.ts`
- `src/agents/update-detector.test.ts`
- `src/agents/index.ts` (add export)

### Implementation notes
- Track file hashes
- Detect changes during run
- Trigger reload on change

### Acceptance criteria
- [ ] UpdateDetector class implemented
- [ ] `checkForUpdates()` detects changes
- [ ] Uses file hash comparison
- [ ] Emits events on change
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "UpdateDetector"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement AGENTS.md update detector for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH8-T02)
- Follow REQUIREMENTS.md Section 24.3

Create src/agents/update-detector.ts:

1. FileSnapshot interface:
   - path: string
   - hash: string
   - lastChecked: string
   - lastModified: string

2. UpdateResult interface:
   - hasUpdates: boolean
   - updatedFiles: string[]
   - previousHashes: Map<string, string>
   - currentHashes: Map<string, string>

3. UpdateDetector class:
   - constructor(eventBus?: EventBus)
   - private snapshots: Map<string, FileSnapshot>
   - async takeSnapshot(paths: string[]): Promise<void>
   - async checkForUpdates(paths: string[]): Promise<UpdateResult>
   - async getFileHash(path: string): Promise<string>
   - hasChanged(path: string): Promise<boolean>
   - reset(): void

4. Hash calculation:
   - Use crypto.createHash('sha256')
   - Hash file contents

5. Event emission:
   - Emit 'agents_updated' event via EventBus when changes detected

6. Create src/agents/update-detector.test.ts:
   - Test snapshot creation
   - Test change detection
   - Test no-change case
   - Test missing file handling
   - Use temp files

7. Update src/agents/index.ts

After implementation, run:
- npm test -- -t "UpdateDetector"

Iterate until tests pass.

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

## PH8-T03: Promotion Rules Engine

### Title
Implement promotion rules for AGENTS.md entries

### Goal
Create engine for promoting patterns/gotchas to higher levels.

### Depends on
- PH8-T02

### Parallelizable with
- none

### Recommended model quality
HQ required — rule evaluation

### Read first
- REQUIREMENTS.md: Section 24.4 (Promotion rules)

### Files to create/modify
- `src/agents/promotion-engine.ts`
- `src/agents/promotion-engine.test.ts`
- `src/agents/index.ts` (add export)

### Implementation notes
- Patterns repeated N times → promote
- Gotchas with high impact → promote
- Manual promotion via CLI

### Acceptance criteria
- [ ] PromotionEngine class implemented
- [ ] `evaluate(entry)` returns promotion recommendation
- [ ] Tracks entry frequency
- [ ] Supports manual promotion
- [ ] Applies promotion to target level
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "PromotionEngine"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement promotion rules engine for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH8-T03)
- Follow REQUIREMENTS.md Section 24.4

Create src/agents/promotion-engine.ts:

1. PromotionRule interface:
   - name: string
   - condition: (entry: AgentsEntry, stats: EntryStats) => boolean
   - targetLevel: AgentsLevel
   - priority: number

2. EntryStats interface:
   - occurrenceCount: number
   - firstSeen: string
   - lastSeen: string
   - usedInTiers: string[]
   - impactScore?: number

3. PromotionCandidate interface:
   - entry: AgentsEntry
   - currentLevel: AgentsLevel
   - targetLevel: AgentsLevel
   - rule: string
   - confidence: number

4. PromotionEngine class:
   - constructor(config: PromotionConfig)
   - private rules: PromotionRule[]
   - private stats: Map<string, EntryStats>
   - registerRule(rule: PromotionRule): void
   - trackUsage(entry: AgentsEntry, tierId: string): void
   - evaluate(entry: AgentsEntry): PromotionCandidate | null
   - getPromotionCandidates(): PromotionCandidate[]
   - async promote(candidate: PromotionCandidate, loader: MultiLevelLoader): Promise<void>

5. Default rules:
   - REPEATED_PATTERN: occurrenceCount >= 3 → promote to parent
   - HIGH_IMPACT_GOTCHA: impactScore >= 8 → promote to root
   - UNIVERSAL_RULE: usedInTiers.length >= 5 → promote to root

6. Create src/agents/promotion-engine.test.ts:
   - Test rule evaluation
   - Test frequency tracking
   - Test promotion execution
   - Test custom rules

7. Update src/agents/index.ts

After implementation, run:
- npm test -- -t "PromotionEngine"

Iterate until tests pass.

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

## PH8-T04: Gate Integration

### Title
Integrate AGENTS.md enforcement with gates

### Goal
Make gates fail when AGENTS.md rules are violated.

### Depends on
- PH8-T03

### Parallelizable with
- none

### Recommended model quality
HQ required — enforcement logic

### Read first
- REQUIREMENTS.md: Section 24.5 (Gate enforcement)

### Files to create/modify
- `src/agents/gate-enforcer.ts`
- `src/agents/gate-enforcer.test.ts`
- `src/agents/index.ts` (add export)

### Implementation notes
- Check agent output against DON'T rules
- Verify DO rules were followed
- Block gate if violations found

### Acceptance criteria
- [ ] GateEnforcer class implemented
- [ ] `check(output, agentsDoc)` returns violations
- [ ] Detects DON'T violations
- [ ] Verifies DO compliance
- [ ] Returns actionable error messages
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "GateEnforcer"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement gate enforcer for AGENTS.md rules.

CONSTRAINTS:
- Implement ONLY this task (PH8-T04)
- Follow REQUIREMENTS.md Section 24.5

Create src/agents/gate-enforcer.ts:

1. Violation interface:
   - rule: string
   - ruleType: 'do' | 'dont' | 'pattern' | 'gotcha'
   - description: string
   - evidence?: string
   - severity: 'error' | 'warning'

2. EnforcementResult interface:
   - passed: boolean
   - violations: Violation[]
   - warnings: Violation[]
   - checkedRules: number

3. GateEnforcer class:
   - constructor(config?: EnforcerConfig)
   - check(output: string, agentsDoc: AgentsDocument, filesChanged: string[]): EnforcementResult
   - checkDonts(output: string, donts: string[]): Violation[]
   - checkDos(output: string, filesChanged: string[], dos: string[]): Violation[]
   - checkPatterns(filesChanged: string[], patterns: string[]): Violation[]
   - checkGotchas(output: string, gotchas: GotchaEntry[]): Violation[]

4. Detection methods:
   - DON'T violations: Check if output contains prohibited patterns
   - DO compliance: Check if expected artifacts exist
   - Pattern compliance: Check if files follow patterns

5. Example checks:
   - DON'T: "use any third-party logging library" → scan for import statements
   - DO: "add tests for new functions" → check if test files modified
   - PATTERN: "use .js extensions in imports" → scan for imports

6. Create src/agents/gate-enforcer.test.ts:
   - Test DON'T violation detection
   - Test DO compliance checking
   - Test pattern compliance
   - Test edge cases

7. Update src/agents/index.ts

After implementation, run:
- npm test -- -t "GateEnforcer"

Iterate until tests pass.

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

## PH8-T05: Archive Manager

### Title
Implement AGENTS.md archive manager

### Goal
Create manager for archiving old AGENTS.md versions.

### Depends on
- PH8-T04

### Parallelizable with
- none

### Recommended model quality
Fast OK — file management

### Read first
- REQUIREMENTS.md: Section 24.6 (Archiving)

### Files to create/modify
- `src/agents/archive-manager.ts`
- `src/agents/archive-manager.test.ts`
- `src/agents/index.ts` (add export)

### Implementation notes
- Archive before updates
- Store with timestamp
- Support retrieval of old versions

### Acceptance criteria
- [ ] ArchiveManager class implemented
- [ ] `archive(path)` creates timestamped backup
- [ ] `list()` returns available archives
- [ ] `restore(archiveId)` restores old version
- [ ] `diff(archiveId)` shows changes
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "ArchiveManager"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement AGENTS.md archive manager for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH8-T05)
- Follow REQUIREMENTS.md Section 24.6

Create src/agents/archive-manager.ts:

1. ArchiveEntry interface:
   - id: string
   - originalPath: string
   - archivePath: string
   - createdAt: string
   - hash: string
   - reason?: string

2. ArchiveManager class:
   - constructor(archiveDir: string)
   - async archive(path: string, reason?: string): Promise<ArchiveEntry>
   - async list(originalPath?: string): Promise<ArchiveEntry[]>
   - async restore(archiveId: string): Promise<void>
   - async diff(archiveId: string, currentPath: string): Promise<string>
   - async get(archiveId: string): Promise<string | null>
   - async prune(maxAge: number): Promise<number>

3. Archive naming:
   .puppet-master/archives/agents/{timestamp}-{hash}.md

4. Archive index:
   .puppet-master/archives/agents/index.json
   Contains array of ArchiveEntry

5. Diff output:
   - Use simple line-by-line diff
   - Show added (+) and removed (-) lines

6. Create src/agents/archive-manager.test.ts:
   - Test archiving file
   - Test listing archives
   - Test restore
   - Test diff
   - Test prune

7. Update src/agents/index.ts

After implementation, run:
- npm test -- -t "ArchiveManager"

Iterate until tests pass.

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

## PH8-T06: Enforcement Integration Tests

### Title
Create integration tests for AGENTS.md enforcement

### Goal
Verify full AGENTS.md enforcement pipeline works end-to-end.

### Depends on
- PH8-T05

### Parallelizable with
- none

### Recommended model quality
Medium OK — test implementation

### Read first
- All PH8 tasks

### Files to create/modify
- `src/agents/enforcement.integration.test.ts`
- `src/agents/index.ts` (verify exports)

### Implementation notes
- Test full workflow from load to enforcement
- Test promotion pipeline
- Test archive on update

### Acceptance criteria
- [ ] Integration test file created
- [ ] Tests multi-level loading end-to-end
- [ ] Tests update detection and reload
- [ ] Tests gate enforcement
- [ ] Tests promotion pipeline
- [ ] All integration tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "enforcement.integration"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create integration tests for AGENTS.md enforcement.

CONSTRAINTS:
- Implement ONLY this task (PH8-T06)
- Test full enforcement pipeline

Create src/agents/enforcement.integration.test.ts:

1. Test: "loads and merges multi-level AGENTS.md files"
   - Create temp directory structure with:
     - Root AGENTS.md
     - Module AGENTS.md
     - Phase AGENTS.md
   - Load with MultiLevelLoader
   - Verify merge is correct

2. Test: "detects AGENTS.md updates during execution"
   - Take initial snapshot
   - Modify file
   - Check for updates
   - Verify update detected

3. Test: "enforces DON'T rules at gate"
   - Create AGENTS.md with DON'T rule
   - Simulate agent output violating rule
   - Run GateEnforcer
   - Verify violation detected

4. Test: "promotes frequently used patterns"
   - Track pattern usage multiple times
   - Run PromotionEngine evaluation
   - Verify promotion candidate generated

5. Test: "archives before update"
   - Create original AGENTS.md
   - Archive it
   - Modify original
   - Verify archive accessible
   - Test restore works

6. Test: "full enforcement workflow"
   - Initialize project
   - Load agents docs
   - Run iteration (mock)
   - Check gate with enforcement
   - Detect updates if any
   - Archive and promote as needed

7. Helpers:
   - createTempProject(): creates test directory structure
   - mockAgentOutput(): creates test output
   - cleanupTempProject(): removes test files

After implementation, run:
- npm test -- -t "enforcement.integration"

Iterate until tests pass.

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

## Phase 8 Completion Checklist

Before marking Phase 8 complete:

- [ ] All 6 tasks have PASS status
- [ ] Multi-level loader merges correctly
- [ ] Update detector catches changes
- [ ] Promotion engine evaluates rules
- [ ] Gate enforcer blocks violations
- [ ] Archive manager preserves history
- [ ] Integration tests pass
- [ ] `npm test` passes all Phase 8 tests

### Phase 8 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-8 agents-enforcement complete"
```

---

*End of BUILD_QUEUE_PHASE_8.md*
