# RWM Puppet Master — BUILD_QUEUE_PHASE_4.md

> Phase 4: Verification & Integration  
> Tasks: 14  
> Focus: Verifier taxonomy, gate runner, orchestrator wiring, CLI start command

---

## Phase Overview

This phase implements verification and wires everything together:
- Verifier taxonomy (regex, file_exists, browser_verify, command, ai)
- Gate runner to execute verifiers
- Orchestrator integration
- CLI entry point (`puppet-master start`)
- Initial doctor command

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Parallel Group A | PH4-T01, PH4-T02, PH4-T03, PH4-T04, PH4-T05 | Phase 3 complete |
| Sequential | PH4-T06 | PH4-T01 through PH4-T05 |
| Sequential | PH4-T07 | PH4-T06 |
| Parallel Group B | PH4-T08, PH4-T09 | PH4-T07 |
| Sequential | PH4-T10 | PH4-T08, PH4-T09 |
| Sequential | PH4-T11 | PH4-T10 |
| Parallel Group C | PH4-T12, PH4-T13 | PH4-T11 |
| Sequential | PH4-T14 | PH4-T12, PH4-T13 |

---

## PH4-T01: Regex Verifier

### Title
Implement regex verifier for pattern matching

### Goal
Create verifier that checks file contents against regex patterns.

### Depends on
- Phase 3 complete

### Parallelizable with
- PH4-T02, PH4-T03, PH4-T04, PH4-T05

### Recommended model quality
Medium OK — pattern matching

### Read first
- REQUIREMENTS.md: Section 25.2 (Verifier Taxonomy)
- ARCHITECTURE.md: Section 6 (Verification Engine)

### Files to create/modify
- `src/verification/verifiers/regex-verifier.ts`
- `src/verification/verifiers/index.ts`
- `src/verification/verifiers/regex-verifier.test.ts`

### Implementation notes
- Match patterns in specified files
- Support multiple patterns
- Support negative patterns (must NOT match)

### Acceptance criteria
- [ ] RegexVerifier implements Verifier interface
- [ ] verify() checks patterns against file content
- [ ] Supports positive and negative patterns
- [ ] Returns detailed results with match locations
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "regex-verifier"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "regex-verifier"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement regex verifier for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T01)
- Follow REQUIREMENTS.md Section 25.2 verifier spec
- Support both positive and negative patterns

Read first:
- REQUIREMENTS.md Section 25.2 for verifier taxonomy
- ARCHITECTURE.md Section 6 for verification engine

Create src/verification/verifiers/regex-verifier.ts:

1. Verifier interface (shared):
   - type: string
   - verify(criterion: Criterion): Promise<VerifierResult>

2. RegexCriterion interface extends Criterion:
   - type: 'regex'
   - target: string  // File path or glob
   - options: {
       pattern: string | string[]
       flags?: string
       mustMatch?: boolean  // default true
       matchAll?: boolean   // all patterns must match
     }

3. RegexVerifier class implements Verifier:
   - readonly type = 'regex'
   
   - async verify(criterion: RegexCriterion): Promise<VerifierResult>
   - private async readFileContent(path: string): Promise<string>
   - private testPattern(content: string, pattern: string, flags: string): MatchResult
   - private formatMatchResult(matches: MatchResult[]): string

4. MatchResult interface:
   - pattern: string
   - matched: boolean
   - locations?: { line: number; column: number; match: string }[]

5. Verification logic:
   - Read target file(s)
   - Apply each pattern
   - If mustMatch: true → pattern must match
   - If mustMatch: false → pattern must NOT match
   - If matchAll: true → ALL patterns must satisfy condition
   - Collect all match locations for evidence

6. Result building:
   - passed: all conditions satisfied
   - summary: human-readable description
   - evidencePath: save match details to file if needed
   - durationMs: time taken

Create src/verification/verifiers/index.ts to export RegexVerifier.

Create src/verification/verifiers/regex-verifier.test.ts:
- Test pattern matches file content
- Test negative pattern (must not match)
- Test multiple patterns
- Test glob target
- Test handles missing file
- Test match location extraction

After implementation, run:
- npm run typecheck
- npm test -- -t "regex-verifier"

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

## PH4-T02: File Exists Verifier

### Title
Implement file existence verifier

### Goal
Create verifier that checks for file/directory existence.

### Depends on
- Phase 3 complete

### Parallelizable with
- PH4-T01, PH4-T03, PH4-T04, PH4-T05

### Recommended model quality
Fast OK — simple file checks

### Read first
- REQUIREMENTS.md: Section 25.2 (Verifier Taxonomy)

### Files to create/modify
- `src/verification/verifiers/file-exists-verifier.ts`
- `src/verification/verifiers/index.ts` (update)
- `src/verification/verifiers/file-exists-verifier.test.ts`

### Implementation notes
- Check file or directory exists
- Support glob patterns
- Check file properties (size, permissions)

### Acceptance criteria
- [ ] FileExistsVerifier implements Verifier interface
- [ ] Checks file existence
- [ ] Supports glob patterns
- [ ] Can check file properties
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "file-exists-verifier"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "file-exists-verifier"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement file exists verifier for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T02)
- Support file and directory checks
- Support glob patterns

Read first:
- REQUIREMENTS.md Section 25.2 for verifier taxonomy

Create src/verification/verifiers/file-exists-verifier.ts:

1. FileExistsCriterion interface extends Criterion:
   - type: 'file_exists'
   - target: string  // File path or glob
   - options?: {
       isDirectory?: boolean
       minSize?: number
       maxSize?: number
       permissions?: string  // e.g., 'rwx'
       notExists?: boolean   // Check does NOT exist
     }

2. FileExistsVerifier class implements Verifier:
   - readonly type = 'file_exists'
   
   - async verify(criterion: FileExistsCriterion): Promise<VerifierResult>
   - private async checkFile(path: string, options: FileExistsCriterion['options']): Promise<FileCheckResult>
   - private async checkPermissions(path: string, expected: string): Promise<boolean>
   - private async resolveGlob(pattern: string): Promise<string[]>

3. FileCheckResult interface:
   - path: string
   - exists: boolean
   - isDirectory?: boolean
   - size?: number
   - permissions?: string
   - error?: string

4. Verification logic:
   - Resolve glob to actual paths
   - For each path: check existence
   - If options provided: check additional properties
   - If notExists: true → file must NOT exist
   - Aggregate results for multiple files

Update src/verification/verifiers/index.ts to export FileExistsVerifier.

Create src/verification/verifiers/file-exists-verifier.test.ts:
- Test file exists check
- Test directory exists check
- Test glob pattern matching
- Test size constraints
- Test notExists option
- Test handles missing file correctly

After implementation, run:
- npm run typecheck
- npm test -- -t "file-exists-verifier"

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

## PH4-T03: Command Verifier

### Title
Implement command execution verifier

### Goal
Create verifier that runs commands and checks exit codes/output.

### Depends on
- Phase 3 complete

### Parallelizable with
- PH4-T01, PH4-T02, PH4-T04, PH4-T05

### Recommended model quality
Medium OK — command execution

### Read first
- REQUIREMENTS.md: Section 25.2 (Verifier Taxonomy)

### Files to create/modify
- `src/verification/verifiers/command-verifier.ts`
- `src/verification/verifiers/index.ts` (update)
- `src/verification/verifiers/command-verifier.test.ts`

### Implementation notes
- Execute shell commands
- Check exit code
- Check stdout/stderr content
- Support timeout

### Acceptance criteria
- [ ] CommandVerifier implements Verifier interface
- [ ] Executes command and captures output
- [ ] Checks exit code
- [ ] Checks output content
- [ ] Supports timeout
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "command-verifier"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "command-verifier"
```

### Evidence to record
- Command output in test-logs/

### Cursor Agent Prompt
```
Implement command verifier for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T03)
- Use spawn() for command execution
- Support output pattern matching

Read first:
- REQUIREMENTS.md Section 25.2 for verifier taxonomy

Create src/verification/verifiers/command-verifier.ts:

1. CommandCriterion interface extends Criterion:
   - type: 'command'
   - target: string  // Command to run
   - options?: {
       args?: string[]
       cwd?: string
       env?: Record<string, string>
       timeout?: number
       expectedExitCode?: number  // default 0
       outputPattern?: string     // regex to match in stdout
       errorPattern?: string      // regex to match in stderr
       outputMustNotContain?: string
     }

2. CommandVerifier class implements Verifier:
   - readonly type = 'command'
   
   - constructor(evidenceStore: EvidenceStore)
   - async verify(criterion: CommandCriterion): Promise<VerifierResult>
   - private async executeCommand(criterion: CommandCriterion): Promise<CommandResult>
   - private checkOutput(output: string, pattern?: string, mustNotContain?: string): boolean
   - private async saveEvidence(itemId: string, result: CommandResult): Promise<string>

3. CommandResult interface:
   - exitCode: number
   - stdout: string
   - stderr: string
   - durationMs: number
   - timedOut: boolean

4. Verification logic:
   - Spawn command with args
   - Wait for completion or timeout
   - Check exit code matches expected
   - Check stdout matches pattern (if provided)
   - Check stderr matches pattern (if provided)
   - Check output does NOT contain forbidden text
   - Save output as evidence

5. Error handling:
   - Timeout kills process
   - Capture both stdout and stderr
   - Return failure with details on error

Update src/verification/verifiers/index.ts to export CommandVerifier.

Create src/verification/verifiers/command-verifier.test.ts:
- Test successful command (exit 0)
- Test failed command (non-zero exit)
- Test output pattern matching
- Test timeout handling
- Test stderr pattern
- Test outputMustNotContain

After implementation, run:
- npm run typecheck
- npm test -- -t "command-verifier"

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

## PH4-T04: Browser Verifier

### Title
Implement browser verification for UI testing

### Goal
Create verifier that uses Playwright for browser-based verification.

### Depends on
- Phase 3 complete

### Parallelizable with
- PH4-T01, PH4-T02, PH4-T03, PH4-T05

### Recommended model quality
HQ required — complex browser automation

### Read first
- REQUIREMENTS.md: Section 25.2 (Verifier Taxonomy)
- REQUIREMENTS.md: Section 25.4 (Browser Verification)

### Files to create/modify
- `src/verification/verifiers/browser-verifier.ts`
- `src/verification/verifiers/index.ts` (update)
- `src/verification/verifiers/browser-verifier.test.ts`
- `package.json` (add playwright dependency)

### Implementation notes
- Use Playwright for browser automation
- Support element visibility checks
- Capture screenshots on failure
- Support custom selectors

### Acceptance criteria
- [ ] BrowserVerifier implements Verifier interface
- [ ] Launches browser and navigates to URL
- [ ] Checks element visibility/content
- [ ] Captures screenshot on failure
- [ ] Supports Playwright selectors
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "browser-verifier"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "browser-verifier"
```

### Evidence to record
- Screenshots in screenshots/
- Browser traces in browser-traces/

### Cursor Agent Prompt
```
Implement browser verifier for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T04)
- Use Playwright for browser automation
- Capture evidence on all outcomes

Read first:
- REQUIREMENTS.md Section 25.2 for verifier taxonomy
- REQUIREMENTS.md Section 25.4 for browser verification

Install dependency:
- @playwright/test (devDependency)

Create src/verification/verifiers/browser-verifier.ts:

1. BrowserCriterion interface extends Criterion:
   - type: 'browser_verify'
   - target: string  // URL to navigate to
   - options: {
       selector?: string        // Element to find
       text?: string           // Text to verify
       visible?: boolean       // Check visibility
       screenshot?: boolean    // Always capture screenshot
       timeout?: number        // Navigation timeout
       waitFor?: string        // Selector to wait for
       action?: BrowserAction  // Action to perform
     }

2. BrowserAction interface:
   - type: 'click' | 'fill' | 'select' | 'hover'
   - selector: string
   - value?: string  // For fill/select

3. BrowserVerifier class implements Verifier:
   - readonly type = 'browser_verify'
   
   - constructor(evidenceStore: EvidenceStore, config?: BrowserVerifierConfig)
   - async verify(criterion: BrowserCriterion): Promise<VerifierResult>
   - private async launchBrowser(): Promise<Browser>
   - private async navigateAndCheck(page: Page, criterion: BrowserCriterion): Promise<BrowserCheckResult>
   - private async captureScreenshot(page: Page, itemId: string): Promise<string>
   - private async captureTrace(context: BrowserContext, itemId: string): Promise<string>
   - private async performAction(page: Page, action: BrowserAction): Promise<void>

4. BrowserVerifierConfig interface:
   - headless?: boolean
   - browser?: 'chromium' | 'firefox' | 'webkit'
   - screenshotOnFailure?: boolean
   - traceOnFailure?: boolean

5. BrowserCheckResult interface:
   - passed: boolean
   - elementFound?: boolean
   - textMatched?: boolean
   - visible?: boolean
   - screenshotPath?: string
   - tracePath?: string
   - error?: string

6. Verification logic:
   - Launch browser (headless by default)
   - Navigate to URL
   - Wait for page load
   - If waitFor: wait for selector
   - If action: perform action
   - Check element exists (if selector)
   - Check text content (if text)
   - Check visibility (if visible)
   - Capture screenshot on failure
   - Close browser

Update src/verification/verifiers/index.ts to export BrowserVerifier.

Create src/verification/verifiers/browser-verifier.test.ts:
- Test navigation to URL
- Test element visibility check
- Test text content check
- Test action execution
- Test screenshot capture
- Mock Playwright for unit tests

After implementation, run:
- npm run typecheck
- npm test -- -t "browser-verifier"

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

## PH4-T05: AI Verifier

### Title
Implement AI-based verification for semantic checks

### Goal
Create verifier that uses AI to assess semantic correctness.

### Depends on
- Phase 3 complete

### Parallelizable with
- PH4-T01, PH4-T02, PH4-T03, PH4-T04

### Recommended model quality
HQ required — AI integration

### Read first
- REQUIREMENTS.md: Section 25.2 (Verifier Taxonomy)
- REQUIREMENTS.md: Section 25.6 (AI Verification)

### Files to create/modify
- `src/verification/verifiers/ai-verifier.ts`
- `src/verification/verifiers/index.ts` (update)
- `src/verification/verifiers/ai-verifier.test.ts`

### Implementation notes
- Use platform runner to invoke AI for verification
- Provide context and ask pass/fail question
- Parse AI response for decision

### Acceptance criteria
- [ ] AIVerifier implements Verifier interface
- [ ] Uses platform runner for AI invocation
- [ ] Structures verification prompt correctly
- [ ] Parses AI response for pass/fail
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "ai-verifier"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "ai-verifier"
```

### Evidence to record
- AI response in evidence

### Cursor Agent Prompt
```
Implement AI verifier for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T05)
- Use PlatformFacade for AI invocation
- Structure prompts for clear pass/fail response

Read first:
- REQUIREMENTS.md Section 25.2 for verifier taxonomy
- REQUIREMENTS.md Section 25.6 for AI verification

Create src/verification/verifiers/ai-verifier.ts:

1. AICriterion interface extends Criterion:
   - type: 'ai'
   - target: string  // File or content to verify
   - options: {
       question: string        // Question to ask AI
       context?: string        // Additional context
       expectedAnswer?: string // Expected response keyword
       platform?: Platform     // Platform to use (default: claude)
     }

2. AIVerifier class implements Verifier:
   - readonly type = 'ai'
   
   - constructor(platformFacade: PlatformFacade, evidenceStore: EvidenceStore)
   - async verify(criterion: AICriterion): Promise<VerifierResult>
   - private buildVerificationPrompt(criterion: AICriterion, content: string): string
   - private parseAIResponse(response: string): AIVerificationResult
   - private async getContent(target: string): Promise<string>

3. AIVerificationResult interface:
   - passed: boolean
   - confidence: 'high' | 'medium' | 'low'
   - explanation: string
   - rawResponse: string

4. Verification prompt template:
   You are a code reviewer verifying implementation correctness.
   
   ## Content to Review
   {CONTENT}
   
   ## Verification Question
   {QUESTION}
   
   ## Additional Context
   {CONTEXT}
   
   ## Instructions
   Analyze the content and answer the question.
   Respond in this EXACT format:
   
   VERDICT: PASS or FAIL
   CONFIDENCE: HIGH, MEDIUM, or LOW
   EXPLANATION: Your reasoning (1-3 sentences)

5. Response parsing:
   - Extract VERDICT line
   - Extract CONFIDENCE line
   - Extract EXPLANATION
   - Default to FAIL if parsing fails

6. Error handling:
   - Timeout on AI call
   - Parse failure → return FAIL with explanation
   - Save raw response as evidence

Update src/verification/verifiers/index.ts to export AIVerifier.

Create src/verification/verifiers/ai-verifier.test.ts:
- Test prompt building
- Test response parsing (PASS)
- Test response parsing (FAIL)
- Test confidence extraction
- Test handles malformed response
- Mock platform facade

After implementation, run:
- npm run typecheck
- npm test -- -t "ai-verifier"

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

## PH4-T06: Gate Runner

### Title
Implement gate runner to execute all verifiers

### Goal
Create gate runner that executes verifiers and produces gate reports.

### Depends on
- PH4-T01 through PH4-T05

### Parallelizable with
- none

### Recommended model quality
HQ required — orchestration logic

### Read first
- ARCHITECTURE.md: Section 5.3 (Gate Execution)
- REQUIREMENTS.md: Section 7.3 (Failure Handling at Gates)

### Files to create/modify
- `src/verification/gate-runner.ts`
- `src/verification/index.ts` (barrel export)
- `src/verification/gate-runner.test.ts`

### Implementation notes
- Execute all verifiers for a gate
- Aggregate results into GateReport
- Determine pass/fail/minor/major

### Acceptance criteria
- [ ] GateRunner executes all verifiers
- [ ] Produces GateReport with all results
- [ ] Determines overall pass/fail
- [ ] Classifies failures as minor/major
- [ ] Saves evidence for all verifiers
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "gate-runner"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "gate-runner"
```

### Evidence to record
- Gate report in gate-reports/

### Cursor Agent Prompt
```
Implement gate runner for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T06)
- Use all verifiers from PH4-T01 through PH4-T05
- Follow ARCHITECTURE.md Section 5.3

Read first:
- ARCHITECTURE.md Section 5.3 for gate execution
- REQUIREMENTS.md Section 7.3 for failure handling

Create src/verification/gate-runner.ts:

1. VerifierRegistry class:
   - private verifiers: Map<string, Verifier>
   - register(verifier: Verifier): void
   - get(type: string): Verifier | null
   - getAll(): Verifier[]

2. GateConfig interface:
   - failFast?: boolean
   - parallel?: boolean
   - timeout?: number

3. GateRunner class:
   - constructor(
       verifierRegistry: VerifierRegistry,
       evidenceStore: EvidenceStore,
       config?: GateConfig
     )
   
   - async runGate(gateId: string, criteria: Criterion[]): Promise<GateReport>
   - async runVerifier(criterion: Criterion): Promise<VerifierResult>
   - classifyFailure(results: VerifierResult[]): 'minor' | 'major'
   - private aggregateResults(results: VerifierResult[]): GateReport
   - private async runParallel(criteria: Criterion[]): Promise<VerifierResult[]>
   - private async runSequential(criteria: Criterion[]): Promise<VerifierResult[]>

4. GateReport interface (from types):
   - gateId: string
   - timestamp: string
   - verifiersRun: VerifierResult[]
   - overallPassed: boolean
   - failureType?: 'minor' | 'major'
   - summary: string

5. Gate execution logic:
   - For each criterion:
     - Get appropriate verifier
     - Execute verification
     - Collect result
     - If failFast and failed: stop
   - Aggregate results
   - Classify failure severity
   - Generate summary
   - Save report to evidence store

6. Failure classification per REQUIREMENTS.md 7.3:
   - Minor: Only regex/command failures, low severity
   - Major: Browser or AI failures, multiple failures, critical patterns

7. Summary generation:
   - List passed verifiers
   - List failed verifiers with reasons
   - Overall verdict

Create src/verification/index.ts to export GateRunner, VerifierRegistry.

Create src/verification/gate-runner.test.ts:
- Test runs all verifiers
- Test produces correct report
- Test failFast stops on failure
- Test parallel execution
- Test failure classification
- Test summary generation

After implementation, run:
- npm run typecheck
- npm test -- -t "gate-runner"

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

## PH4-T07: Verification Integration

### Title
Integrate verification with core engine

### Goal
Connect verification system to TierStateManager and auto-advancement.

### Depends on
- PH4-T06

### Parallelizable with
- none

### Recommended model quality
HQ required — integration complexity

### Read first
- src/core/auto-advancement.ts (from PH2-T07)
- src/verification/gate-runner.ts (from PH4-T06)

### Files to create/modify
- `src/verification/verification-integration.ts`
- `src/verification/index.ts` (update)
- `src/verification/verification-integration.test.ts`

### Implementation notes
- Connect GateRunner to auto-advancement
- Provide runTaskGate() and runPhaseGate() implementations
- Handle gate results appropriately

### Acceptance criteria
- [ ] VerificationIntegration connects components
- [ ] runTaskGate() executes task-level verification
- [ ] runPhaseGate() executes phase-level verification
- [ ] Results trigger correct state transitions
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "verification-integration"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "verification-integration"
```

### Evidence to record
- Gate reports saved

### Cursor Agent Prompt
```
Implement verification integration for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T07)
- Connect GateRunner to auto-advancement
- Handle all gate result scenarios

Read first:
- src/core/auto-advancement.ts for advancement logic
- src/verification/gate-runner.ts for gate execution

Create src/verification/verification-integration.ts:

1. VerificationIntegration class:
   - constructor(
       gateRunner: GateRunner,
       tierStateManager: TierStateManager,
       evidenceStore: EvidenceStore
     )
   
   - async runTaskGate(task: TierNode): Promise<GateResult>
   - async runPhaseGate(phase: TierNode): Promise<GateResult>
   - async runSubtaskVerification(subtask: TierNode): Promise<VerifierResult[]>
   - handleGateResult(result: GateResult, tier: TierNode): void
   
   - Private methods:
     - private collectCriteria(tier: TierNode): Criterion[]
     - private buildGateId(tier: TierNode): string
     - private transitionOnResult(result: GateResult, tier: TierNode): void

2. Gate execution flow:
   
   runTaskGate(task):
   - Collect acceptance criteria from task
   - Collect test plan commands as command criteria
   - Build gate ID: "task-gate-{taskId}"
   - Run gate via GateRunner
   - Convert GateReport to GateResult
   - Save to evidence store
   - Return result
   
   runPhaseGate(phase):
   - Collect acceptance criteria from phase
   - Include aggregate checks (all tasks passed)
   - Build gate ID: "phase-gate-{phaseId}"
   - Run gate
   - Return result

3. Criteria collection:
   - Convert task.acceptanceCriteria to Criterion[]
   - Convert task.testPlan.commands to CommandCriterion[]
   - Add any browser verification criteria

4. Result handling:
   - If passed: transition tier to PASSED
   - If failed minor: transition tier to RUNNING (self-fix)
   - If failed major: transition tier to ESCALATED

Update src/verification/index.ts to export VerificationIntegration.

Create src/verification/verification-integration.test.ts:
- Test runTaskGate collects criteria
- Test runTaskGate returns correct result
- Test runPhaseGate includes aggregate checks
- Test result handling transitions state
- Test evidence is saved

After implementation, run:
- npm run typecheck
- npm test -- -t "verification-integration"

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

## PH4-T08: Orchestrator Class

### Title
Implement main Orchestrator class

### Goal
Create the main Orchestrator that ties all components together.

### Depends on
- PH4-T07

### Parallelizable with
- PH4-T09

### Recommended model quality
HQ required — main coordination

### Read first
- ARCHITECTURE.md: Section 2 (Module Breakdown)
- src/core/orchestrator-state-machine.ts
- src/core/execution-engine.ts

### Files to create/modify
- `src/core/orchestrator.ts`
- `src/core/index.ts` (update)
- `src/core/orchestrator.test.ts`

### Implementation notes
- Main entry point for orchestration
- Coordinates all components
- Implements main loop

### Acceptance criteria
- [ ] Orchestrator initializes all components
- [ ] start() begins orchestration loop
- [ ] pause()/resume() work correctly
- [ ] stop() cleanly terminates
- [ ] Handles all state transitions
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "orchestrator"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "orchestrator"
```

### Evidence to record
- State transitions logged

### Cursor Agent Prompt
```
Implement main Orchestrator class for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T08)
- Coordinate all previously built components
- Implement main orchestration loop

Read first:
- ARCHITECTURE.md Section 2 for module breakdown
- All src/core/*.ts files

Create src/core/orchestrator.ts:

1. OrchestratorConfig interface:
   - config: PuppetMasterConfig
   - projectPath: string
   - prdPath?: string

2. OrchestratorDependencies interface:
   - configManager: ConfigManager
   - prdManager: PrdManager
   - progressManager: ProgressManager
   - agentsManager: AgentsManager
   - evidenceStore: EvidenceStore
   - usageTracker: UsageTracker
   - gitManager: GitManager
   - platformFacade: PlatformFacade
   - verificationIntegration: VerificationIntegration

3. Orchestrator class:
   - Private members:
     - stateMachine: OrchestratorStateMachine
     - tierStateManager: TierStateManager
     - autoAdvancement: AutoAdvancement
     - escalation: Escalation
     - executionEngine: ExecutionEngine
     - promptBuilder: PromptBuilder
     - outputParser: OutputParser
     - deps: OrchestratorDependencies
     - config: PuppetMasterConfig
   
   - constructor(orchestratorConfig: OrchestratorConfig)
   
   - async initialize(): Promise<void>
   - async start(): Promise<void>
   - async pause(reason?: string): Promise<void>
   - async resume(): Promise<void>
   - async stop(): Promise<void>
   - getState(): OrchestratorState
   - getProgress(): OrchestratorProgress
   
   - Private methods:
     - private async runLoop(): Promise<void>
     - private async executeIteration(): Promise<IterationResult>
     - private async handleIterationResult(result: IterationResult): Promise<void>
     - private async handleGateResult(result: GateResult): Promise<void>
     - private async handleAdvancement(result: AdvancementResult): Promise<void>
     - private async recordProgress(result: IterationResult): Promise<void>
     - private async commitChanges(result: IterationResult): Promise<void>

4. Main loop (runLoop):
   while (state === 'executing') {
     // Get current subtask
     subtask = tierStateManager.getCurrentSubtask()
     
     // Build iteration context
     context = buildContext(subtask)
     
     // Execute iteration
     result = await executionEngine.spawnIteration(context)
     
     // Handle result
     await handleIterationResult(result)
     
     // Record progress
     await recordProgress(result)
     
     // Commit changes
     await commitChanges(result)
     
     // Check advancement
     advancement = await autoAdvancement.checkAndAdvance()
     await handleAdvancement(advancement)
   }

5. OrchestratorProgress interface:
   - state: OrchestratorState
   - currentPhase: { id: string; title: string } | null
   - currentTask: { id: string; title: string } | null
   - currentSubtask: { id: string; title: string } | null
   - completedSubtasks: number
   - totalSubtasks: number
   - iterationsRun: number
   - startedAt: string
   - elapsedTime: number

Update src/core/index.ts to export Orchestrator.

Create src/core/orchestrator.test.ts:
- Test initialize sets up components
- Test start begins loop
- Test pause stops loop
- Test resume continues loop
- Test stop terminates cleanly
- Test handles iteration result
- Test handles gate result
- Use mocks for dependencies

After implementation, run:
- npm run typecheck
- npm test -- -t "orchestrator"

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

## PH4-T09: Dependency Injection Setup

### Title
Implement dependency injection container

### Goal
Create DI container to wire up all components.

### Depends on
- PH4-T07

### Parallelizable with
- PH4-T08

### Recommended model quality
Medium OK — DI pattern

### Read first
- ARCHITECTURE.md: All component interfaces

### Files to create/modify
- `src/core/container.ts`
- `src/core/index.ts` (update)
- `src/core/container.test.ts`

### Implementation notes
- Simple DI container (no framework)
- Register and resolve dependencies
- Support singleton and factory patterns

### Acceptance criteria
- [ ] Container registers dependencies
- [ ] resolve() returns correct instances
- [ ] Supports singleton pattern
- [ ] Supports factory pattern
- [ ] createOrchestrator() builds full dependency tree
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "container"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "container"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement dependency injection container for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T09)
- No external DI framework
- Simple but complete container

Read first:
- All component interfaces and constructors

Create src/core/container.ts:

1. Registration types:
   type RegistrationType = 'singleton' | 'transient' | 'factory'

2. Container class:
   - private singletons: Map<string, unknown>
   - private factories: Map<string, () => unknown>
   - private registrations: Map<string, RegistrationType>
   
   - register<T>(key: string, factory: () => T, type?: RegistrationType): void
   - registerInstance<T>(key: string, instance: T): void
   - resolve<T>(key: string): T
   - has(key: string): boolean
   - clear(): void

3. Factory function for complete setup:
   
   createContainer(config: PuppetMasterConfig, projectPath: string): Container {
     const container = new Container()
     
     // Register config
     container.registerInstance('config', config)
     container.registerInstance('projectPath', projectPath)
     
     // Register managers (singletons)
     container.register('configManager', () => new ConfigManager(...), 'singleton')
     container.register('prdManager', () => new PrdManager(...), 'singleton')
     container.register('progressManager', () => new ProgressManager(...), 'singleton')
     container.register('agentsManager', () => new AgentsManager(...), 'singleton')
     container.register('evidenceStore', () => new EvidenceStore(...), 'singleton')
     container.register('usageTracker', () => new UsageTracker(...), 'singleton')
     container.register('gitManager', () => new GitManager(...), 'singleton')
     
     // Register platform components
     container.register('platformFacade', () => {
       const facade = new PlatformFacade(
         container.resolve('config'),
         container.resolve('usageTracker')
       )
       return facade
     }, 'singleton')
     
     // Register verification
     container.register('verifierRegistry', () => {
       const registry = new VerifierRegistry()
       registry.register(new RegexVerifier())
       registry.register(new FileExistsVerifier())
       registry.register(new CommandVerifier(container.resolve('evidenceStore')))
       registry.register(new BrowserVerifier(container.resolve('evidenceStore')))
       registry.register(new AIVerifier(
         container.resolve('platformFacade'),
         container.resolve('evidenceStore')
       ))
       return registry
     }, 'singleton')
     
     container.register('gateRunner', () => new GateRunner(
       container.resolve('verifierRegistry'),
       container.resolve('evidenceStore')
     ), 'singleton')
     
     // Register core
     container.register('tierStateManager', () => new TierStateManager(
       container.resolve('prdManager')
     ), 'singleton')
     
     container.register('autoAdvancement', () => new AutoAdvancement(
       container.resolve('tierStateManager')
     ), 'singleton')
     
     // Register orchestrator
     container.register('orchestrator', () => new Orchestrator({
       config: container.resolve('config'),
       projectPath: container.resolve('projectPath')
     }), 'singleton')
     
     return container
   }

4. Helper function:
   createOrchestrator(config: PuppetMasterConfig, projectPath: string): Orchestrator {
     const container = createContainer(config, projectPath)
     return container.resolve('orchestrator')
   }

Update src/core/index.ts to export Container, createContainer, createOrchestrator.

Create src/core/container.test.ts:
- Test register and resolve
- Test singleton returns same instance
- Test transient returns new instance
- Test createContainer builds full tree
- Test createOrchestrator returns orchestrator

After implementation, run:
- npm run typecheck
- npm test -- -t "container"

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

## PH4-T10: CLI Framework Setup

### Title
Set up CLI framework with Commander.js

### Goal
Create CLI entry point using Commander.js.

### Depends on
- PH4-T08, PH4-T09

### Parallelizable with
- none

### Recommended model quality
Medium OK — CLI setup

### Read first
- REQUIREMENTS.md: Section 19 (CLI Invocation)

### Files to create/modify
- `src/cli/index.ts`
- `src/cli/commands/index.ts`
- `package.json` (add commander, add bin entry)
- `src/cli/cli.test.ts`

### Implementation notes
- Use Commander.js for CLI parsing
- Set up main entry point
- Register command structure

### Acceptance criteria
- [ ] CLI entry point works
- [ ] `puppet-master --help` shows commands
- [ ] `puppet-master --version` shows version
- [ ] Command registration framework ready
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "cli"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "cli"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Set up CLI framework for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T10)
- Use Commander.js
- Follow REQUIREMENTS.md Section 19

Install dependency:
- commander: ^12.0.0

Read first:
- REQUIREMENTS.md Section 19 for CLI invocation

Create src/cli/index.ts:

1. Main CLI setup:
   import { Command } from 'commander';
   import { VERSION } from '../index.js';
   
   const program = new Command();
   
   program
     .name('puppet-master')
     .description('RWM Puppet Master - CLI orchestrator for AI development workflows')
     .version(VERSION);
   
   // Commands will be registered here
   
   export function run(argv: string[] = process.argv): void {
     program.parse(argv);
   }
   
   export { program };

2. Command registration pattern:
   
   // src/cli/commands/index.ts
   import { Command } from 'commander';
   
   export interface CommandModule {
     register(program: Command): void;
   }
   
   export function registerCommands(program: Command, commands: CommandModule[]): void {
     for (const cmd of commands) {
       cmd.register(program);
     }
   }

3. Update package.json:
   {
     "bin": {
       "puppet-master": "./dist/cli/index.js"
     }
   }

4. Entry point script (src/cli/index.ts):
   #!/usr/bin/env node
   import { run } from './index.js';
   run();

5. Make executable:
   - Add shebang
   - Set executable permissions in build

Create src/cli/commands/index.ts with CommandModule interface.

Create src/cli/cli.test.ts:
- Test program creation
- Test --help output
- Test --version output
- Test unknown command handling

After implementation, run:
- npm run typecheck
- npm test -- -t "cli"
- npm run build && ./dist/cli/index.js --help

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

## PH4-T11: Start Command

### Title
Implement `puppet-master start` command

### Goal
Create the main start command that begins orchestration.

### Depends on
- PH4-T10

### Parallelizable with
- none

### Recommended model quality
HQ required — main entry point

### Read first
- REQUIREMENTS.md: Section 19 (CLI Invocation)
- src/core/orchestrator.ts (from PH4-T08)

### Files to create/modify
- `src/cli/commands/start.ts`
- `src/cli/index.ts` (register command)
- `src/cli/commands/start.test.ts`

### Implementation notes
- Parse config file
- Initialize orchestrator
- Start execution
- Handle signals (SIGINT, SIGTERM)

### Acceptance criteria
- [ ] `puppet-master start` initializes orchestrator
- [ ] Accepts --config flag
- [ ] Accepts --prd flag
- [ ] Handles SIGINT gracefully
- [ ] Outputs progress to console
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "start-command"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "start-command"
```

### Evidence to record
- Orchestration logs

### Cursor Agent Prompt
```
Implement start command for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T11)
- Follow REQUIREMENTS.md Section 19
- Handle signals properly

Read first:
- REQUIREMENTS.md Section 19 for CLI invocation
- src/core/orchestrator.ts for Orchestrator

Create src/cli/commands/start.ts:

1. StartOptions interface:
   - config?: string
   - prd?: string
   - verbose?: boolean
   - dryRun?: boolean

2. StartCommand implements CommandModule:
   - register(program: Command): void
   
3. Command definition:
   program
     .command('start')
     .description('Start the orchestration loop')
     .option('-c, --config <path>', 'Path to config file')
     .option('-p, --prd <path>', 'Path to PRD file')
     .option('-v, --verbose', 'Enable verbose output')
     .option('--dry-run', 'Validate configuration without executing')
     .action(async (options: StartOptions) => {
       await startAction(options);
     });

4. startAction function:
   async function startAction(options: StartOptions): Promise<void> {
     // Load configuration
     const configManager = new ConfigManager(options.config);
     const config = await configManager.load();
     
     // Validate PRD exists
     const prdPath = options.prd || config.memory.prdFile;
     if (!await fileExists(prdPath)) {
       console.error(`PRD file not found: ${prdPath}`);
       process.exit(1);
     }
     
     // Dry run check
     if (options.dryRun) {
       console.log('Configuration validated successfully');
       console.log('PRD file found');
       return;
     }
     
     // Create orchestrator
     const orchestrator = createOrchestrator(config, process.cwd());
     
     // Setup signal handlers
     setupSignalHandlers(orchestrator);
     
     // Initialize
     console.log('Initializing orchestrator...');
     await orchestrator.initialize();
     
     // Start
     console.log('Starting orchestration...');
     await orchestrator.start();
     
     console.log('Orchestration complete');
   }

5. Signal handling:
   function setupSignalHandlers(orchestrator: Orchestrator): void {
     process.on('SIGINT', async () => {
       console.log('\nReceived SIGINT, pausing...');
       await orchestrator.pause('User interrupt');
       console.log('Orchestrator paused. Press Ctrl+C again to stop.');
       
       process.once('SIGINT', async () => {
         console.log('\nReceived second SIGINT, stopping...');
         await orchestrator.stop();
         process.exit(0);
       });
     });
     
     process.on('SIGTERM', async () => {
       console.log('Received SIGTERM, stopping...');
       await orchestrator.stop();
       process.exit(0);
     });
   }

6. Progress output:
   - Subscribe to orchestrator events
   - Log current phase/task/subtask
   - Log iteration progress
   - Log gate results

Update src/cli/index.ts to register StartCommand.

Create src/cli/commands/start.test.ts:
- Test parses options correctly
- Test validates config
- Test validates PRD exists
- Test dry-run mode
- Test signal handling setup
- Mock orchestrator for tests

After implementation, run:
- npm run typecheck
- npm test -- -t "start-command"

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

## PH4-T12: Status Command

### Title
Implement `puppet-master status` command

### Goal
Create command to show current orchestration status.

### Depends on
- PH4-T11

### Parallelizable with
- PH4-T13

### Recommended model quality
Fast OK — status display

### Read first
- src/core/orchestrator.ts (getProgress method)

### Files to create/modify
- `src/cli/commands/status.ts`
- `src/cli/index.ts` (register command)
- `src/cli/commands/status.test.ts`

### Implementation notes
- Read state from files
- Display current progress
- Show phase/task/subtask status

### Acceptance criteria
- [ ] `puppet-master status` shows progress
- [ ] Shows current phase/task/subtask
- [ ] Shows completion percentage
- [ ] Works without running orchestrator
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "status-command"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "status-command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement status command for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T12)
- Read from state files
- Format output clearly

Read first:
- src/core/orchestrator.ts for progress format

Create src/cli/commands/status.ts:

1. StatusOptions interface:
   - config?: string
   - json?: boolean

2. StatusCommand implements CommandModule:
   - register(program: Command): void

3. Command definition:
   program
     .command('status')
     .description('Show current orchestration status')
     .option('-c, --config <path>', 'Path to config file')
     .option('--json', 'Output as JSON')
     .action(async (options: StatusOptions) => {
       await statusAction(options);
     });

4. statusAction function:
   async function statusAction(options: StatusOptions): Promise<void> {
     const configManager = new ConfigManager(options.config);
     const config = await configManager.load();
     
     const prdManager = new PrdManager(config.memory.prdFile);
     const prd = await prdManager.load();
     
     const status = buildStatus(prd);
     
     if (options.json) {
       console.log(JSON.stringify(status, null, 2));
     } else {
       printStatus(status);
     }
   }

5. Status interface:
   interface Status {
     project: string
     state: 'not_started' | 'in_progress' | 'paused' | 'complete'
     progress: {
       phases: { completed: number; total: number }
       tasks: { completed: number; total: number }
       subtasks: { completed: number; total: number }
     }
     currentPhase?: { id: string; title: string; status: string }
     currentTask?: { id: string; title: string; status: string }
     currentSubtask?: { id: string; title: string; status: string }
     recentActivity: ActivityEntry[]
   }

6. printStatus function:
   function printStatus(status: Status): void {
     console.log(`Project: ${status.project}`);
     console.log(`State: ${status.state}`);
     console.log();
     console.log('Progress:');
     console.log(`  Phases: ${status.progress.phases.completed}/${status.progress.phases.total}`);
     console.log(`  Tasks: ${status.progress.tasks.completed}/${status.progress.tasks.total}`);
     console.log(`  Subtasks: ${status.progress.subtasks.completed}/${status.progress.subtasks.total}`);
     
     if (status.currentPhase) {
       console.log();
       console.log(`Current Phase: ${status.currentPhase.id} - ${status.currentPhase.title}`);
     }
     if (status.currentTask) {
       console.log(`Current Task: ${status.currentTask.id} - ${status.currentTask.title}`);
     }
     if (status.currentSubtask) {
       console.log(`Current Subtask: ${status.currentSubtask.id} - ${status.currentSubtask.title}`);
     }
   }

Update src/cli/index.ts to register StatusCommand.

Create src/cli/commands/status.test.ts:
- Test builds correct status
- Test handles missing PRD
- Test JSON output format
- Test text output format

After implementation, run:
- npm run typecheck
- npm test -- -t "status-command"

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

## PH4-T13: Doctor Command (Basic)

### Title
Implement basic `puppet-master doctor` command

### Goal
Create command to verify system setup.

### Depends on
- PH4-T11

### Parallelizable with
- PH4-T12

### Recommended model quality
Medium OK — system checks

### Read first
- REQUIREMENTS.md: Section 21 (Pre-Flight Checks)

### Files to create/modify
- `src/cli/commands/doctor.ts`
- `src/cli/index.ts` (register command)
- `src/cli/commands/doctor.test.ts`

### Implementation notes
- Check CLI tool availability
- Check configuration validity
- Check file permissions
- Basic smoke test

### Acceptance criteria
- [ ] `puppet-master doctor` runs system checks
- [ ] Checks CLI tools (cursor, codex, claude)
- [ ] Checks configuration file
- [ ] Checks git availability
- [ ] Reports issues clearly
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "doctor-command"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "doctor-command"
```

### Evidence to record
- Doctor report

### Cursor Agent Prompt
```
Implement doctor command for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T13)
- Basic checks only (full doctor in later phase)
- Follow REQUIREMENTS.md Section 21

Read first:
- REQUIREMENTS.md Section 21 for pre-flight checks

Create src/cli/commands/doctor.ts:

1. DoctorOptions interface:
   - config?: string
   - fix?: boolean
   - verbose?: boolean

2. Check interface:
   - name: string
   - description: string
   - run(): Promise<CheckResult>

3. CheckResult interface:
   - passed: boolean
   - message: string
   - fixable?: boolean
   - fixCommand?: string

4. DoctorCommand implements CommandModule:
   - register(program: Command): void

5. Command definition:
   program
     .command('doctor')
     .description('Check system configuration and dependencies')
     .option('-c, --config <path>', 'Path to config file')
     .option('--fix', 'Attempt to fix issues')
     .option('-v, --verbose', 'Show detailed output')
     .action(async (options: DoctorOptions) => {
       await doctorAction(options);
     });

6. Basic checks:
   
   GitCheck:
   - Run `git --version`
   - Check for .git directory
   
   CursorCheck:
   - Run `cursor --version`
   - Report if not installed
   
   CodexCheck:
   - Run `codex --version`
   - Report if not installed
   
   ClaudeCheck:
   - Run `claude --version`
   - Report if not installed
   
   ConfigCheck:
   - Check config file exists
   - Validate config schema
   
   NodeVersionCheck:
   - Check Node.js version >= 20
   
   DirectoryCheck:
   - Check .puppet-master directory exists
   - Check write permissions

7. doctorAction function:
   async function doctorAction(options: DoctorOptions): Promise<void> {
     const checks: Check[] = [
       new GitCheck(),
       new NodeVersionCheck(),
       new CursorCheck(),
       new CodexCheck(),
       new ClaudeCheck(),
       new ConfigCheck(options.config),
       new DirectoryCheck(),
     ];
     
     let allPassed = true;
     
     for (const check of checks) {
       const result = await check.run();
       printCheckResult(check.name, result, options.verbose);
       if (!result.passed) {
         allPassed = false;
         if (options.fix && result.fixable) {
           // Attempt fix
         }
       }
     }
     
     if (allPassed) {
       console.log('\n✅ All checks passed');
     } else {
       console.log('\n❌ Some checks failed');
       process.exit(1);
     }
   }

Update src/cli/index.ts to register DoctorCommand.

Create src/cli/commands/doctor.test.ts:
- Test Git check
- Test Node version check
- Test CLI checks
- Test config check
- Test overall reporting
- Mock system commands

After implementation, run:
- npm run typecheck
- npm test -- -t "doctor-command"

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

## PH4-T14: Integration Test

### Title
Create end-to-end integration test

### Goal
Verify all components work together in realistic scenario.

### Depends on
- PH4-T12, PH4-T13

### Parallelizable with
- none (final task)

### Recommended model quality
HQ required — comprehensive testing

### Read first
- All implementation files from Phase 0-4

### Files to create/modify
- `src/__tests__/integration.test.ts`
- `src/__tests__/fixtures/sample-prd.json`
- `src/__tests__/fixtures/sample-config.yaml`

### Implementation notes
- Test full flow with mocked platform
- Verify state transitions
- Verify file outputs
- Test error handling

### Acceptance criteria
- [ ] Integration test runs full orchestration cycle
- [ ] Mocked platform returns controlled responses
- [ ] State files created correctly
- [ ] Progress tracked correctly
- [ ] Gate verification works
- [ ] `npm run typecheck` passes
- [ ] `npm test -- -t "integration"` passes

### Tests to run
```bash
npm run typecheck
npm test -- -t "integration"
```

### Evidence to record
- Integration test results

### Cursor Agent Prompt
```
Create integration test for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH4-T14)
- Test realistic scenario with mocked platform
- Verify all components integrate correctly

Read first:
- All major component files

Create src/__tests__/fixtures/sample-prd.json:
{
  "project": "integration-test",
  "version": "1.0.0",
  "createdAt": "2026-01-10T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z",
  "branchName": "test-branch",
  "description": "Integration test PRD",
  "phases": [
    {
      "id": "PH-001",
      "title": "Test Phase",
      "description": "A test phase",
      "status": "pending",
      "acceptanceCriteria": ["All tasks complete"],
      "testCommands": ["npm test"],
      "tasks": [
        {
          "id": "TK-001-001",
          "title": "Test Task",
          "description": "A test task",
          "status": "pending",
          "phaseId": "PH-001",
          "acceptanceCriteria": ["Subtask complete"],
          "testCommands": [],
          "subtasks": [
            {
              "id": "ST-001-001-001",
              "title": "Test Subtask",
              "description": "A test subtask",
              "status": "pending",
              "acceptanceCriteria": ["File exists"],
              "testCommands": ["echo test"],
              "filesTargeted": ["test.txt"],
              "iterations": []
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "totalPhases": 1,
    "completedPhases": 0,
    "totalTasks": 1,
    "completedTasks": 0,
    "totalSubtasks": 1,
    "completedSubtasks": 0
  }
}

Create src/__tests__/fixtures/sample-config.yaml (minimal valid config)

Create src/__tests__/integration.test.ts:

1. MockPlatformRunner:
   - Extends BasePlatformRunner
   - Returns controlled output
   - Simulates COMPLETE signal

2. Integration test suite:
   
   describe('Integration', () => {
     let tempDir: string;
     let orchestrator: Orchestrator;
     
     beforeEach(async () => {
       tempDir = await createTempDir();
       await copyFixtures(tempDir);
       // Setup mock runner
     });
     
     afterEach(async () => {
       await cleanup(tempDir);
     });
     
     it('should complete a full orchestration cycle', async () => {
       // Initialize
       await orchestrator.initialize();
       
       // Start (will run loop)
       await orchestrator.start();
       
       // Verify state
       expect(orchestrator.getState()).toBe('complete');
       
       // Verify files
       const prd = await loadPrd(tempDir);
       expect(prd.metadata.completedSubtasks).toBe(1);
       
       // Verify progress
       const progress = await loadProgress(tempDir);
       expect(progress.length).toBeGreaterThan(0);
     });
     
     it('should handle iteration failure and retry', async () => {
       // Configure mock to fail first iteration
       mockRunner.setResponses([
         { success: false, output: 'Error occurred' },
         { success: true, output: '<ralph>COMPLETE</ralph>' }
       ]);
       
       await orchestrator.initialize();
       await orchestrator.start();
       
       // Verify retry happened
       expect(mockRunner.spawnCount).toBe(2);
     });
     
     it('should pause and resume correctly', async () => {
       // ...
     });
     
     it('should handle gate failure correctly', async () => {
       // ...
     });
   });

3. Helper functions:
   - createTempDir()
   - copyFixtures()
   - cleanup()
   - loadPrd()
   - loadProgress()

After implementation, run:
- npm run typecheck
- npm test -- -t "integration"

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

## Phase 4 Completion Checklist

After completing all Phase 4 tasks:

- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all tests)
- [ ] All verifiers implemented and tested
- [ ] GateRunner executes verification
- [ ] Orchestrator coordinates all components
- [ ] DI container wires dependencies
- [ ] CLI framework set up
- [ ] `puppet-master start` works
- [ ] `puppet-master status` works
- [ ] `puppet-master doctor` works
- [ ] Integration test passes

### Phase 4 Stop Point Commit

```bash
git add .
git commit -m "ralph: phase-4 verification-integration complete"
```

---

## MVP Complete!

At this point, you have a working MVP of RWM Puppet Master:

```bash
# Check system
puppet-master doctor

# Start orchestration
puppet-master start --config config.yaml --prd prd.json

# Check status (in another terminal)
puppet-master status
```

### What's Next

Future phases (not in this build queue):
- Phase 5: GUI implementation
- Phase 6: Start Chain
- Phase 7: Doctor & Dependencies (full)
- Phase 8: Logging & Observability
- Phase 9: AGENTS.md Enforcement

---

*End of BUILD_QUEUE_PHASE_4.md*
