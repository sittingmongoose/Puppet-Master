# RWM Puppet Master — BUILD_QUEUE_PHASE_6.md

> Phase 6: Doctor & Dependencies  
> Tasks: 8  
> Focus: System checks, capability validation, installation management

---

## Phase Overview

This phase implements the doctor system:
- Check registry for all validations
- CLI tool availability checks
- Git configuration checks
- Runtime environment checks
- Installation management

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | PH6-T01 | Phase 5 complete |
| Parallel Group A | PH6-T02, PH6-T03, PH6-T04, PH6-T05 | PH6-T01 |
| Sequential | PH6-T06 | PH6-T02, PH6-T03, PH6-T04, PH6-T05 |
| Sequential | PH6-T07 | PH6-T06 |
| Sequential | PH6-T08 | PH6-T07 |

---

## PH6-T01: Check Registry

### Title
Implement doctor check registry

### Goal
Create the registry pattern for doctor checks.

### Depends on
- Phase 5 complete

### Parallelizable with
- none (foundational)

### Recommended model quality
Medium OK — registry pattern

### Read first
- REQUIREMENTS.md: Section 20 (Doctor Command)

### Files to create/modify
- `src/doctor/check-registry.ts`
- `src/doctor/check-registry.test.ts`
- `src/doctor/index.ts`

### Implementation notes
- Registry pattern for pluggable checks
- Each check returns pass/fail with details
- Support check categories

### Acceptance criteria
- [ ] CheckRegistry class implemented
- [ ] `register(check)` adds check to registry
- [ ] `runAll()` executes all checks
- [ ] `runCategory(category)` runs subset
- [ ] Check results include details
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "CheckRegistry"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement check registry for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T01)
- Follow REQUIREMENTS.md Section 20

Create src/doctor/check-registry.ts:

1. CheckCategory type:
   export type CheckCategory = 'cli' | 'git' | 'runtime' | 'project' | 'network';

2. CheckResult interface:
   - name: string
   - category: CheckCategory
   - passed: boolean
   - message: string
   - details?: string
   - fixSuggestion?: string
   - durationMs: number

3. DoctorCheck interface:
   - name: string
   - category: CheckCategory
   - description: string
   - run(): Promise<CheckResult>

4. CheckRegistry class:
   - private checks: Map<string, DoctorCheck>
   - register(check: DoctorCheck): void
   - unregister(name: string): boolean
   - async runAll(): Promise<CheckResult[]>
   - async runCategory(category: CheckCategory): Promise<CheckResult[]>
   - async runOne(name: string): Promise<CheckResult | null>
   - getRegisteredChecks(): DoctorCheck[]
   - getCategories(): CheckCategory[]

5. Create src/doctor/check-registry.test.ts:
   - Test registering checks
   - Test running all checks
   - Test running by category
   - Test with mock checks

6. Create src/doctor/index.ts:
   export { CheckRegistry } from './check-registry.js';
   export type { DoctorCheck, CheckResult, CheckCategory } from './check-registry.js';

After implementation, run:
- npm test -- -t "CheckRegistry"

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

## PH6-T02: CLI Tools Check

### Title
Implement CLI tools availability checks

### Goal
Create checks for cursor, codex, and claude CLI availability.

### Depends on
- PH6-T01

### Parallelizable with
- PH6-T03, PH6-T04, PH6-T05

### Recommended model quality
Medium OK — CLI detection

### Read first
- REQUIREMENTS.md: Section 20.2 (Required CLIs)
- REQUIREMENTS.md: Section 22 (CLI Capability Matrix)

### Files to create/modify
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/checks/cli-tools.test.ts`
- `src/doctor/checks/index.ts`

### Implementation notes
- Check if each CLI is in PATH
- Verify --version works
- Report version found

### Acceptance criteria
- [ ] CursorCliCheck implemented
- [ ] CodexCliCheck implemented
- [ ] ClaudeCliCheck implemented
- [ ] All checks verify CLI availability
- [ ] Version reported in details
- [ ] Tests pass (with mocks)
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "cli-tools"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement CLI tools checks for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T02)
- Follow REQUIREMENTS.md Sections 20.2 and 22

Create src/doctor/checks/cli-tools.ts:

1. Helper function:
   async function checkCliAvailable(command: string, versionFlag: string): Promise<{
     available: boolean;
     version?: string;
     error?: string;
   }>

2. CursorCliCheck class implements DoctorCheck:
   - name: 'cursor-cli'
   - category: 'cli'
   - description: 'Check if Cursor Agent CLI is available'
   - async run(): Promise<CheckResult>
   - Check: `command -v cursor-agent || command -v agent` (prefer cursor-agent)
   - Also check: `cursor-agent --help` or `agent --help` for functionality
   - Installation: `curl https://cursor.com/install -fsSL | bash`
   - Note: Do NOT use npm install for Cursor (no npm package exists)

3. CodexCliCheck class implements DoctorCheck:
   - name: 'codex-cli'
   - category: 'cli'
   - Check: codex --version
   - Also check: npx codex --version
   - Installation: npm install -g @openai/codex

4. ClaudeCliCheck class implements DoctorCheck:
   - name: 'claude-cli'
   - category: 'cli'
   - Check: claude --version
   - Also check: ~/.claude/local/claude
   - Installation: curl -fsSL https://claude.ai/install.sh | bash
   - Alternative: npm install -g @anthropic-ai/claude-code

5. Create src/doctor/checks/cli-tools.test.ts:
   - Test with mock spawn
   - Test CLI found case
   - Test CLI not found case
   - Test version parsing

6. Create src/doctor/checks/index.ts:
   export { CursorCliCheck, CodexCliCheck, ClaudeCliCheck } from './cli-tools.js';

After implementation, run:
- npm test -- -t "cli-tools"

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

## PH6-T03: Git Check

### Title
Implement git configuration checks

### Goal
Create checks for git availability and configuration.

### Depends on
- PH6-T01

### Parallelizable with
- PH6-T02, PH6-T04, PH6-T05

### Recommended model quality
Fast OK — git checks

### Read first
- REQUIREMENTS.md: Section 20.3 (Git checks)

### Files to create/modify
- `src/doctor/checks/git-check.ts`
- `src/doctor/checks/git-check.test.ts`
- `src/doctor/checks/index.ts` (add export)

### Implementation notes
- Check git is installed
- Check user.name and user.email configured
- Check current directory is a git repo

### Acceptance criteria
- [ ] GitAvailableCheck implemented
- [ ] GitConfigCheck implemented
- [ ] GitRepoCheck implemented
- [ ] Reports missing config
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "git-check"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement git checks for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T03)
- Follow REQUIREMENTS.md Section 20.3

Create src/doctor/checks/git-check.ts:

1. GitAvailableCheck class implements DoctorCheck:
   - name: 'git-available'
   - category: 'git'
   - Check: git --version
   - Report version in details

2. GitConfigCheck class implements DoctorCheck:
   - name: 'git-config'
   - category: 'git'
   - Check: git config user.name
   - Check: git config user.email
   - Fail if either missing
   - Suggestion: "Run git config --global user.name 'Your Name'"

3. GitRepoCheck class implements DoctorCheck:
   - name: 'git-repo'
   - category: 'git'
   - Check: git rev-parse --is-inside-work-tree
   - Report: not a git repo if fails
   - Suggestion: "Run git init to initialize a repository"

4. GitRemoteCheck class implements DoctorCheck:
   - name: 'git-remote'
   - category: 'git'
   - Check: git remote -v
   - Report: no remote configured (warning only)

5. Create src/doctor/checks/git-check.test.ts:
   - Test each check independently
   - Mock git commands
   - Test pass and fail cases

6. Update src/doctor/checks/index.ts

After implementation, run:
- npm test -- -t "git-check"

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

## PH6-T04: Runtime Check

### Title
Implement runtime environment checks

### Goal
Create checks for Node.js and Python environments.

### Depends on
- PH6-T01

### Parallelizable with
- PH6-T02, PH6-T03, PH6-T05

### Recommended model quality
Fast OK — version checks

### Read first
- REQUIREMENTS.md: Section 20.4 (Runtime checks)

### Files to create/modify
- `src/doctor/checks/runtime-check.ts`
- `src/doctor/checks/runtime-check.test.ts`
- `src/doctor/checks/index.ts` (add export)

### Implementation notes
- Check Node.js version (minimum 18)
- Check Python version if needed
- Check npm/yarn availability

### Acceptance criteria
- [ ] NodeVersionCheck implemented
- [ ] NpmAvailableCheck implemented
- [ ] PythonVersionCheck implemented (optional)
- [ ] Version requirements validated
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "runtime-check"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement runtime checks for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T04)
- Follow REQUIREMENTS.md Section 20.4

Create src/doctor/checks/runtime-check.ts:

1. NodeVersionCheck class implements DoctorCheck:
   - name: 'node-version'
   - category: 'runtime'
   - Check: node --version
   - Minimum: 18.0.0
   - Compare using semver
   - Suggestion: "Install Node.js 18+ from https://nodejs.org"

2. NpmAvailableCheck class implements DoctorCheck:
   - name: 'npm-available'
   - category: 'runtime'
   - Check: npm --version
   - Report version

3. YarnAvailableCheck class implements DoctorCheck:
   - name: 'yarn-available'
   - category: 'runtime'
   - Check: yarn --version
   - Optional (warn if not found)

4. PythonVersionCheck class implements DoctorCheck:
   - name: 'python-version'
   - category: 'runtime'
   - Check: python3 --version or python --version
   - Minimum: 3.8 (for some tools)
   - Optional (warn if not found)

5. Helper:
   parseVersion(versionString: string): { major: number; minor: number; patch: number }
   compareVersions(v1, v2): -1 | 0 | 1

6. Create src/doctor/checks/runtime-check.test.ts:
   - Test version parsing
   - Test version comparison
   - Test check pass/fail

7. Update src/doctor/checks/index.ts

After implementation, run:
- npm test -- -t "runtime-check"

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

## PH6-T05: Project Setup Check

### Title
Implement project setup checks

### Goal
Create checks for puppet-master project configuration.

### Depends on
- PH6-T01

### Parallelizable with
- PH6-T02, PH6-T03, PH6-T04

### Recommended model quality
Fast OK — file checks

### Read first
- STATE_FILES.md: Section 2 (Directory Structure)

### Files to create/modify
- `src/doctor/checks/project-check.ts`
- `src/doctor/checks/project-check.test.ts`
- `src/doctor/checks/index.ts` (add export)

### Implementation notes
- Check .puppet-master directory exists
- Check config.yaml exists and is valid
- Check required subdirectories

### Acceptance criteria
- [ ] ProjectDirCheck implemented
- [ ] ConfigFileCheck implemented
- [ ] SubdirectoriesCheck implemented
- [ ] Reports missing items
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "project-check"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement project setup checks for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T05)
- Follow STATE_FILES.md Section 2

Create src/doctor/checks/project-check.ts:

1. ProjectDirCheck class implements DoctorCheck:
   - name: 'project-dir'
   - category: 'project'
   - Check: .puppet-master directory exists
   - Suggestion: "Run puppet-master init to initialize"

2. ConfigFileCheck class implements DoctorCheck:
   - name: 'config-file'
   - category: 'project'
   - Check: .puppet-master/config.yaml exists
   - Validate: YAML parses correctly
   - Validate: Required fields present
   - Report: specific missing fields

3. SubdirectoriesCheck class implements DoctorCheck:
   - name: 'subdirectories'
   - category: 'project'
   - Required dirs:
     - .puppet-master/checkpoints
     - .puppet-master/evidence
     - .puppet-master/logs
     - .puppet-master/usage
   - Report: which are missing

4. AgentsFileCheck class implements DoctorCheck:
   - name: 'agents-file'
   - category: 'project'
   - Check: AGENTS.md exists (root or .puppet-master)
   - Warn if missing (not error)

5. Create src/doctor/checks/project-check.test.ts:
   - Test with valid project
   - Test with missing directory
   - Test with invalid config
   - Use temp directories

6. Update src/doctor/checks/index.ts

After implementation, run:
- npm test -- -t "project-check"

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

## PH6-T06: Installation Manager

### Title
Implement installation manager for missing tools

### Goal
Create manager to install missing dependencies.

### Depends on
- PH6-T02, PH6-T03, PH6-T04, PH6-T05

### Parallelizable with
- none

### Recommended model quality
Medium OK — installation logic

### Read first
- REQUIREMENTS.md: Section 20.5 (Auto-install)

### Files to create/modify
- `src/doctor/installation-manager.ts`
- `src/doctor/installation-manager.test.ts`
- `src/doctor/index.ts` (add export)

### Implementation notes
- Map failed checks to installation commands
- Support --fix flag for auto-install
- Confirm before installing

### Acceptance criteria
- [ ] InstallationManager class implemented
- [ ] Maps checks to install commands
- [ ] `getInstallCommand(checkName)` returns command
- [ ] `install(checkName)` executes installation
- [ ] Handles installation failures
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "InstallationManager"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement installation manager for RWM Puppet Master doctor.

CONSTRAINTS:
- Implement ONLY this task (PH6-T06)
- Follow REQUIREMENTS.md Section 20.5

Create src/doctor/installation-manager.ts:

1. InstallCommand interface:
   - check: string (check name)
   - command: string
   - description: string
   - requiresSudo: boolean
   - platforms: ('darwin' | 'linux' | 'win32')[]

2. InstallationManager class:
   - private commands: Map<string, InstallCommand>
   - constructor()
   - registerCommand(cmd: InstallCommand): void
   - getInstallCommand(checkName: string): InstallCommand | null
   - async install(checkName: string, options?: { dryRun?: boolean }): Promise<boolean>
   - getAvailableInstalls(): InstallCommand[]
   - getCurrentPlatform(): string

3. Default install commands (config-driven, confirm before running):
   - cursor-cli: "curl https://cursor.com/install -fsSL | bash"
     (Do NOT use npm - no npm package exists for Cursor)
   - codex-cli: "npm install -g @openai/codex"
   - claude-cli: "curl -fsSL https://claude.ai/install.sh | bash" 
     OR "npm install -g @anthropic-ai/claude-code"
   - project-dir: "puppet-master init"
   
   NOTE: InstallationManager should be config-driven and must
   confirm with user before running any install commands.

4. Platform detection:
   - Use process.platform
   - Adjust commands per platform

5. Create src/doctor/installation-manager.test.ts:
   - Test command registration
   - Test command lookup
   - Test dry run mode
   - Mock actual installation

6. Update src/doctor/index.ts

After implementation, run:
- npm test -- -t "InstallationManager"

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

## PH6-T07: Doctor Reporter

### Title
Implement doctor report formatter

### Goal
Create formatted output for doctor check results.

### Depends on
- PH6-T06

### Parallelizable with
- none

### Recommended model quality
Fast OK — formatting

### Read first
- REQUIREMENTS.md: Section 20.6 (Output format)

### Files to create/modify
- `src/doctor/doctor-reporter.ts`
- `src/doctor/doctor-reporter.test.ts`
- `src/doctor/index.ts` (add export)

### Implementation notes
- Format results for terminal
- Use colors for pass/fail
- Group by category
- Show suggestions for failures

### Acceptance criteria
- [ ] DoctorReporter class implemented
- [ ] `formatResults(results)` returns formatted string
- [ ] Pass/fail indicated with colors/symbols
- [ ] Results grouped by category
- [ ] Suggestions shown for failures
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "DoctorReporter"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement doctor reporter for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH6-T07)
- Follow REQUIREMENTS.md Section 20.6

Create src/doctor/doctor-reporter.ts:

1. ReportOptions interface:
   - colors: boolean (default: true)
   - verbose: boolean (default: false)
   - groupByCategory: boolean (default: true)

2. DoctorReporter class:
   - constructor(options?: ReportOptions)
   - formatResults(results: CheckResult[]): string
   - formatSingleResult(result: CheckResult): string
   - formatSummary(results: CheckResult[]): string
   - groupByCategory(results: CheckResult[]): Map<CheckCategory, CheckResult[]>

3. Output format:
   ✓ node-version: Node.js 20.10.0 (2ms)
   ✓ npm-available: npm 10.2.0 (1ms)
   ✗ cursor-cli: cursor-agent not found (5ms)
     → Install with: curl https://cursor.com/install -fsSL | bash
   
   Summary: 5/6 checks passed

4. Color codes (ANSI):
   - Pass: green ✓
   - Fail: red ✗
   - Warning: yellow ⚠

5. Create src/doctor/doctor-reporter.test.ts:
   - Test formatting with colors
   - Test formatting without colors
   - Test category grouping
   - Test summary generation

6. Update src/doctor/index.ts

After implementation, run:
- npm test -- -t "DoctorReporter"

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

## PH6-T08: CLI Doctor Command

### Title
Implement puppet-master doctor command

### Goal
Create the CLI doctor command that runs all checks.

### Depends on
- PH6-T07

### Parallelizable with
- none

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)

### Files to create/modify
- `src/cli/commands/doctor.ts`
- `src/cli/commands/doctor.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Run all checks by default
- Support --category flag
- Support --fix flag
- Support --json output

### Acceptance criteria
- [ ] `puppet-master doctor` command works
- [ ] Runs all registered checks
- [ ] `--category <cat>` filters checks
- [ ] `--fix` attempts to install missing
- [ ] `--json` outputs JSON
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "doctor command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement doctor command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH6-T08)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/doctor.ts:

1. DoctorCommandOptions interface:
   - category?: CheckCategory
   - fix?: boolean
   - json?: boolean
   - verbose?: boolean

2. doctorCommand function:
   - async doctorCommand(options: DoctorCommandOptions): Promise<void>
   
   Steps:
   1. Create CheckRegistry with all checks
   2. Run checks (all or by category)
   3. Format and display results
   4. If --fix, attempt installations
   5. Exit with code 1 if any checks failed

3. Register all checks:
   - CursorCliCheck
   - CodexCliCheck
   - ClaudeCliCheck
   - GitAvailableCheck
   - GitConfigCheck
   - GitRepoCheck
   - NodeVersionCheck
   - NpmAvailableCheck
   - ProjectDirCheck
   - ConfigFileCheck
   - SubdirectoriesCheck

4. Exit codes:
   - 0: All checks passed
   - 1: One or more checks failed

5. Create src/cli/commands/doctor.test.ts:
   - Test running all checks
   - Test category filtering
   - Test JSON output
   - Mock check results

6. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "doctor command"

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

## Phase 6 Completion Checklist

Before marking Phase 6 complete:

- [ ] All 8 tasks have PASS status
- [ ] Check registry works correctly
- [ ] All CLI tool checks implemented
- [ ] Git checks verify configuration
- [ ] Runtime checks validate versions
- [ ] Project checks verify structure
- [ ] Installation manager maps checks to commands
- [ ] Reporter formats output correctly
- [ ] CLI doctor command runs full suite
- [ ] `npm test` passes all Phase 6 tests

### Phase 6 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-6 doctor-dependencies complete"
```

---

*End of BUILD_QUEUE_PHASE_6.md*
