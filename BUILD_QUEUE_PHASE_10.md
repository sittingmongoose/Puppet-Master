# RWM Puppet Master — BUILD_QUEUE_PHASE_10.md

> Phase 10: CLI Commands  
> Tasks: 8  
> Focus: Additional CLI commands (pause, resume, stop, install, replan, reopen, gui, validate)

---

## Phase Overview

This phase implements the remaining CLI commands required by REQUIREMENTS.md Section 18:
- Lifecycle commands: pause, resume, stop
- Setup commands: install
- Recovery commands: replan, reopen
- Interface commands: gui
- Validation commands: validate

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Parallel Group A | PH10-T01, PH10-T02, PH10-T03 | Phase 9 complete |
| Parallel Group B | PH10-T04, PH10-T05, PH10-T06 | Phase 9 complete |
| Parallel Group C | PH10-T07, PH10-T08 | Phase 9 complete |

---

## PH10-T01: CLI Pause Command

### Title
Implement puppet-master pause command

### Goal
Create the CLI pause command to pause orchestration execution.

### Depends on
- Phase 9 complete (or PH4-T12 Lifecycle commands)

### Parallelizable with
- PH10-T02, PH10-T03

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- ARCHITECTURE.md: Section 3 (State Machine transitions)

### Files to create/modify
- `src/cli/commands/pause.ts`
- `src/cli/commands/pause.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Pause should gracefully stop after current iteration
- Save checkpoint before pausing
- Update orchestrator state to PAUSED

### Acceptance criteria
- [ ] `puppet-master pause` command works
- [ ] Waits for current iteration to complete
- [ ] Creates checkpoint at pause point
- [ ] Orchestrator state transitions to PAUSED
- [ ] Can provide optional reason via `--reason`
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "pause command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement pause command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T01)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/pause.ts:

1. PauseOptions interface:
   - reason?: string
   - force?: boolean (skip confirmation)

2. pauseCommand function:
   - async pauseCommand(options: PauseOptions): Promise<void>
   
   Steps:
   1. Check if orchestrator is running
   2. If not running, error with message
   3. Request pause from orchestrator
   4. Wait for current iteration to complete (unless --force)
   5. Create checkpoint
   6. Update state to PAUSED
   7. Display pause confirmation

3. Integration with Orchestrator:
   - Call orchestrator.pause(reason)
   - Handle already-paused case

4. Create src/cli/commands/pause.test.ts:
   - Test pause during execution
   - Test pause when already paused
   - Test --force flag
   - Test --reason flag
   - Mock orchestrator

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "pause command"

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

## PH10-T02: CLI Resume Command

### Title
Implement puppet-master resume command

### Goal
Create the CLI resume command to resume paused orchestration.

### Depends on
- Phase 9 complete (or PH4-T12 Lifecycle commands)

### Parallelizable with
- PH10-T01, PH10-T03

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- ARCHITECTURE.md: Section 3 (State Machine transitions)

### Files to create/modify
- `src/cli/commands/resume.ts`
- `src/cli/commands/resume.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Resume from checkpoint
- Validate state is PAUSED before resuming
- Continue from exact point of pause

### Acceptance criteria
- [ ] `puppet-master resume` command works
- [ ] Restores from checkpoint
- [ ] Validates orchestrator is in PAUSED state
- [ ] Continues execution from pause point
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "resume command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement resume command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T02)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/resume.ts:

1. ResumeOptions interface:
   - checkpoint?: string (specific checkpoint to resume from)
   - skipValidation?: boolean

2. resumeCommand function:
   - async resumeCommand(options: ResumeOptions): Promise<void>
   
   Steps:
   1. Check if orchestrator is in PAUSED state
   2. If not paused, error with message
   3. Load checkpoint (latest or specified)
   4. Validate checkpoint integrity
   5. Resume orchestrator execution
   6. Display resume confirmation

3. Integration with Orchestrator:
   - Call orchestrator.resume()
   - Handle not-paused case

4. Create src/cli/commands/resume.test.ts:
   - Test resume from paused state
   - Test resume when not paused (error)
   - Test resume with specific checkpoint
   - Mock orchestrator and checkpoints

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "resume command"

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

## PH10-T03: CLI Stop Command

### Title
Implement puppet-master stop command

### Goal
Create the CLI stop command to stop orchestration completely.

### Depends on
- Phase 9 complete (or PH4-T12 Lifecycle commands)

### Parallelizable with
- PH10-T01, PH10-T02

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- ARCHITECTURE.md: Section 3 (State Machine transitions)

### Files to create/modify
- `src/cli/commands/stop.ts`
- `src/cli/commands/stop.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Stop should terminate all running processes
- Create final checkpoint
- Clean up resources

### Acceptance criteria
- [ ] `puppet-master stop` command works
- [ ] Terminates running processes gracefully
- [ ] Creates final checkpoint
- [ ] Cleans up resources
- [ ] `--force` flag kills immediately
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "stop command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement stop command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T03)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/stop.ts:

1. StopOptions interface:
   - force?: boolean (kill immediately)
   - timeout?: number (grace period in seconds)
   - saveCheckpoint?: boolean (default: true)

2. stopCommand function:
   - async stopCommand(options: StopOptions): Promise<void>
   
   Steps:
   1. Check if orchestrator is running
   2. If not running, display message and exit
   3. Request graceful stop
   4. Wait for grace period (unless --force)
   5. Kill remaining processes if needed
   6. Save final checkpoint (unless disabled)
   7. Clean up resources
   8. Display stop confirmation

3. Integration with Orchestrator:
   - Call orchestrator.stop(force)
   - Handle cleanup

4. Create src/cli/commands/stop.test.ts:
   - Test graceful stop
   - Test force stop
   - Test timeout handling
   - Test cleanup
   - Mock orchestrator and processes

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "stop command"

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

## PH10-T04: CLI Install Command

### Title
Implement puppet-master install command

### Goal
Create the CLI install command to install missing dependencies.

### Depends on
- Phase 9 complete (or PH6-T08 Doctor command)

### Parallelizable with
- PH10-T05, PH10-T06

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- REQUIREMENTS.md: Section 20 (Doctor Command)

### Files to create/modify
- `src/cli/commands/install.ts`
- `src/cli/commands/install.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Wrapper around doctor --fix
- Install specific tools or all missing
- Confirm before installing

### Acceptance criteria
- [ ] `puppet-master install` command works
- [ ] `puppet-master install cursor` installs Cursor CLI
- [ ] `puppet-master install --all` installs all missing
- [ ] Confirms before installing
- [ ] `--yes` flag skips confirmation
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "install command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement install command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T04)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/install.ts:

1. InstallOptions interface:
   - tool?: string (specific tool to install)
   - all?: boolean (install all missing)
   - yes?: boolean (skip confirmation)
   - dryRun?: boolean

2. installCommand function:
   - async installCommand(options: InstallOptions): Promise<void>
   
   Steps:
   1. Run doctor checks to find missing tools
   2. Filter to specified tool or all missing
   3. Display what will be installed
   4. Confirm with user (unless --yes)
   5. Run installations via InstallationManager
   6. Report results

3. Use existing InstallationManager from PH6-T06

4. Create src/cli/commands/install.test.ts:
   - Test installing specific tool
   - Test installing all missing
   - Test dry run mode
   - Test confirmation prompt
   - Mock InstallationManager

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "install command"

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

## PH10-T05: CLI Replan Command

### Title
Implement puppet-master replan command

### Goal
Create the CLI replan command to regenerate plans for failed items.

### Depends on
- Phase 9 complete (or PH5-T10 Plan command)

### Parallelizable with
- PH10-T04, PH10-T06

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- REQUIREMENTS.md: Section 5 (Start Chain)

### Files to create/modify
- `src/cli/commands/replan.ts`
- `src/cli/commands/replan.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Regenerate plan for specific item or all failed
- Keep history of old plans
- Validate new plan before applying

### Acceptance criteria
- [ ] `puppet-master replan <item-id>` command works
- [ ] `puppet-master replan --failed` replans all failed items
- [ ] Archives old plan before replacing
- [ ] Validates new plan
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "replan command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement replan command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T05)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/replan.ts:

1. ReplanOptions interface:
   - itemId?: string (specific item to replan)
   - failed?: boolean (replan all failed items)
   - keepOriginal?: boolean (archive old plan)
   - validate?: boolean (validate before applying)

2. replanCommand function:
   - async replanCommand(options: ReplanOptions): Promise<void>
   
   Steps:
   1. Load current PRD
   2. Find items to replan (by ID or failed status)
   3. Archive original plans
   4. Regenerate plans using PrdGenerator
   5. Validate new plans
   6. Apply to PRD
   7. Save updated PRD

3. Integration with existing components:
   - PrdManager for loading/saving
   - PrdGenerator for regeneration
   - ValidationGate for validation

4. Create src/cli/commands/replan.test.ts:
   - Test replanning specific item
   - Test replanning all failed
   - Test plan validation
   - Test archive creation
   - Mock generators

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "replan command"

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

## PH10-T06: CLI Reopen Command

### Title
Implement puppet-master reopen command

### Goal
Create the CLI reopen command to reopen failed/passed items.

### Depends on
- Phase 9 complete

### Parallelizable with
- PH10-T04, PH10-T05

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- STATE_FILES.md: Section 3.3 (PRD status values)

### Files to create/modify
- `src/cli/commands/reopen.ts`
- `src/cli/commands/reopen.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Change item status back to 'pending' or 'reopened'
- Clear iteration count
- Optionally clear evidence

### Acceptance criteria
- [ ] `puppet-master reopen <item-id>` command works
- [ ] Confirms before reopening passed items
- [ ] Resets iteration count
- [ ] `--clear-evidence` removes old evidence
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "reopen command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement reopen command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T06)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/reopen.ts:

1. ReopenOptions interface:
   - itemId: string
   - clearEvidence?: boolean
   - yes?: boolean (skip confirmation for passed items)

2. reopenCommand function:
   - async reopenCommand(options: ReopenOptions): Promise<void>
   
   Steps:
   1. Load PRD
   2. Find item by ID
   3. Validate item exists
   4. If item is 'passed', confirm with user
   5. Update status to 'reopened'
   6. Reset iteration count to 0
   7. Clear evidence if requested
   8. Save PRD
   9. Display confirmation

3. Status transition:
   - passed -> reopened
   - failed -> reopened
   - skipped -> reopened

4. Create src/cli/commands/reopen.test.ts:
   - Test reopening failed item
   - Test reopening passed item (with confirmation)
   - Test evidence clearing
   - Test invalid item ID
   - Mock PrdManager

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "reopen command"

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

## PH10-T07: CLI GUI Command

### Title
Implement puppet-master gui command

### Goal
Create the CLI gui command to launch the web interface.

### Depends on
- Phase 9 complete (GUI implementation)

### Parallelizable with
- PH10-T08

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- GUI_SPEC.md: Server configuration

### Files to create/modify
- `src/cli/commands/gui.ts`
- `src/cli/commands/gui.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Start GUI server
- Open browser automatically (optional)
- Support custom port

### Acceptance criteria
- [ ] `puppet-master gui` command works
- [ ] Starts GUI server on default port 3847
- [ ] `--port <port>` uses custom port
- [ ] `--no-open` prevents browser opening
- [ ] Server starts successfully
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "gui command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement gui command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T07)
- Follow REQUIREMENTS.md Section 18
- Follow GUI_SPEC.md for server config

Create src/cli/commands/gui.ts:

1. GuiOptions interface:
   - port?: number (default: 3847)
   - open?: boolean (default: true)
   - host?: string (default: 'localhost')

2. guiCommand function:
   - async guiCommand(options: GuiOptions): Promise<void>
   
   Steps:
   1. Check if port is available
   2. Start GUI server from src/gui/server.ts
   3. Wait for server to be ready
   4. Display URL
   5. Open browser if enabled
   6. Keep running until SIGINT

3. Integration with GuiServer:
   - Import and start server
   - Handle graceful shutdown

4. Browser opening:
   - Use 'open' package for cross-platform support
   - Respect --no-open flag

5. Create src/cli/commands/gui.test.ts:
   - Test server starts on correct port
   - Test custom port
   - Test no-open flag
   - Mock server and open package

6. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "gui command"

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

## PH10-T08: CLI Validate Command

### Title
Implement puppet-master validate command

### Goal
Create the CLI validate command to validate project configuration and state.

### Depends on
- Phase 9 complete

### Parallelizable with
- PH10-T07

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)
- STATE_FILES.md: File schemas

### Files to create/modify
- `src/cli/commands/validate.ts`
- `src/cli/commands/validate.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Validate config.yaml schema
- Validate prd.json structure
- Validate AGENTS.md format
- Check file consistency

### Acceptance criteria
- [ ] `puppet-master validate` command works
- [ ] Validates config.yaml against schema
- [ ] Validates prd.json structure
- [ ] Validates AGENTS.md format
- [ ] Reports all errors (not just first)
- [ ] `--fix` attempts auto-repair
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "validate command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement validate command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH10-T08)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/validate.ts:

1. ValidateOptions interface:
   - target?: 'all' | 'config' | 'prd' | 'agents'
   - fix?: boolean (attempt auto-repair)
   - json?: boolean (JSON output)

2. ValidateResult interface:
   - file: string
   - valid: boolean
   - errors: ValidationError[]
   - warnings: ValidationWarning[]
   - fixed?: boolean

3. validateCommand function:
   - async validateCommand(options: ValidateOptions): Promise<void>
   
   Steps:
   1. Determine files to validate
   2. Run validators:
      - validateConfig() - config.yaml
      - validatePrd() - prd.json
      - validateAgents() - AGENTS.md
   3. Collect all results
   4. If --fix, attempt repairs
   5. Display results
   6. Exit with code 1 if errors

4. Validators:
   - Use ConfigManager.validate() for config
   - Use ValidationGate for PRD
   - Use AgentsManager for AGENTS.md

5. Create src/cli/commands/validate.test.ts:
   - Test validating valid files
   - Test detecting invalid config
   - Test detecting invalid PRD
   - Test fix mode
   - Mock validators

6. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "validate command"

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

## Phase 10 Completion Checklist

Before marking Phase 10 complete:

- [ ] All 8 tasks have PASS status
- [ ] `puppet-master pause` works
- [ ] `puppet-master resume` works
- [ ] `puppet-master stop` works
- [ ] `puppet-master install` works
- [ ] `puppet-master replan` works
- [ ] `puppet-master reopen` works
- [ ] `puppet-master gui` works
- [ ] `puppet-master validate` works
- [ ] All CLI commands have --help documentation
- [ ] `npm test` passes all Phase 10 tests

### Phase 10 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-10 cli-commands complete"
```

---

## Phase 10 Summary

| Task ID | Title | Depends On | Parallel Group |
|---------|-------|------------|----------------|
| PH10-T01 | CLI pause command | Phase 9 | A |
| PH10-T02 | CLI resume command | Phase 9 | A |
| PH10-T03 | CLI stop command | Phase 9 | A |
| PH10-T04 | CLI install command | Phase 9 | B |
| PH10-T05 | CLI replan command | Phase 9 | B |
| PH10-T06 | CLI reopen command | Phase 9 | B |
| PH10-T07 | CLI gui command | Phase 9 | C |
| PH10-T08 | CLI validate command | Phase 9 | C |

**Total Tasks:** 8
**Estimated Time:** 12-18 hours

---

*End of BUILD_QUEUE_PHASE_10.md*
