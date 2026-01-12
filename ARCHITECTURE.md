# RWM Puppet Master — ARCHITECTURE.md

> Version: 2.2  
> Status: Design Document  
> Last Updated: 2026-01-10 (Micro-patch: Session rename, Discovery-populated capability matrix)

---

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RWM PUPPET MASTER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐                    │
│  │   CLI       │    │   GUI        │    │   Config    │                    │
│  │   Interface │    │   (Web)      │    │   Manager   │                    │
│  └──────┬──────┘    └──────┬───────┘    └──────┬──────┘                    │
│         │                  │                   │                            │
│         └──────────────────┼───────────────────┘                            │
│                            │                                                │
│                    ┌───────▼───────┐                                        │
│                    │  Orchestrator  │                                        │
│                    │  (Core Engine) │                                        │
│                    └───────┬───────┘                                        │
│                            │                                                │
│         ┌──────────────────┼──────────────────┐                            │
│         │                  │                  │                            │
│  ┌──────▼──────┐   ┌───────▼───────┐  ┌──────▼──────┐                      │
│  │   State     │   │   Tier State  │  │  Execution  │                      │
│  │   Machine   │   │   Manager     │  │  Engine     │                      │
│  └──────┬──────┘   └───────┬───────┘  └──────┬──────┘                      │
│         │                  │                  │                            │
│         └──────────────────┼──────────────────┘                            │
│                            │                                                │
│  ┌─────────────────────────▼─────────────────────────┐                     │
│  │              Platform Abstraction Layer            │                     │
│  ├───────────────┬───────────────┬───────────────────┤                     │
│  │  Cursor       │  Codex        │  Claude Code      │                     │
│  │  Runner       │  Runner       │  Runner           │                     │
│  └───────────────┴───────────────┴───────────────────┘                     │
│                            │                                                │
│  ┌─────────────────────────▼─────────────────────────┐                     │
│  │              Verification Engine                   │                     │
│  ├───────────────┬───────────────┬───────────────────┤                     │
│  │  Test         │  Acceptance   │  Browser          │                     │
│  │  Runner       │  Verifier     │  Adapter          │                     │
│  └───────────────┴───────────────┴───────────────────┘                     │
│                            │                                                │
│  ┌─────────────────────────▼─────────────────────────┐                     │
│  │              Memory Layer Manager                  │                     │
│  ├───────────────┬───────────────┬───────────────────┤                     │
│  │  progress.txt │  AGENTS.md    │  prd.json         │                     │
│  │  (short-term) │  (long-term)  │  (queue)          │                     │
│  └───────────────┴───────────────┴───────────────────┘                     │
│                            │                                                │
│  ┌─────────────────────────▼─────────────────────────┐                     │
│  │              Git Integration Layer                 │                     │
│  └───────────────────────────────────────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Breakdown

### 2.1 Core Modules

| Module | Responsibility |
|--------|----------------|
| **Orchestrator** | Main coordination logic; routes commands; manages lifecycle |
| **StateMachine** | Tracks current state; handles transitions; enforces gates |
| **TierStateManager** | Manages Phase/Task/Subtask/Iteration state hierarchy |
| **ExecutionEngine** | Spawns and manages CLI processes; handles I/O |
| **ConfigManager** | Loads, validates, and provides configuration |
| **CapabilityDiscovery** | Discovers and validates CLI capabilities (ADDENDUM v2.0) |
| **BudgetManager** | Tracks platform usage and enforces quotas (ADDENDUM v2.0) |

### 2.2 Platform Layer

| Module | Responsibility |
|--------|----------------|
| **PlatformRunner (abstract)** | Base interface for CLI runners |
| **CursorRunner** | Cursor-specific invocation, parsing, session management |
| **CodexRunner** | Codex-specific invocation, JSONL parsing, session management |
| **ClaudeCodeRunner** | Claude Code-specific invocation, session management |

### 2.3 Verification Layer

| Module | Responsibility |
|--------|----------------|
| **TestRunner** | Execute test commands, capture results |
| **AcceptanceVerifier** | Check acceptance criteria against evidence |
| **BrowserAdapter** | Abstract browser verification; concrete implementations per tool |
| **EvidenceCollector** | Capture and store verification evidence |
| **VerifierRegistry** | Registry of verifier types and handlers (ADDENDUM v2.0) |

### 2.4 Memory Layer

| Module | Responsibility |
|--------|----------------|
| **ProgressManager** | Read/write progress.txt |
| **AgentsManager** | Read/write AGENTS.md with multi-level support (ADDENDUM v2.0) |
| **PrdManager** | Read/write prd.json; query/update items |
| **EvidenceStore** | Store screenshots, logs, gate reports |

### 2.5 Interface Layer

| Module | Responsibility |
|--------|----------------|
| **CLIHandler** | Parse CLI commands, dispatch to orchestrator |
| **GUIServer** | Serve web GUI, handle WebSocket connections |
| **EventBus** | Pub/sub for real-time updates |

### 2.6 Git Layer (ADDENDUM v2.0)

| Module | Responsibility |
|--------|----------------|
| **GitManager** | Core git operations (commit, push, branch) |
| **BranchStrategy** | Implements branching strategies |
| **PRManager** | GitHub PR automation via `gh` CLI |
| **ConflictResolver** | Handles merge conflicts |

---

## 3. State Machine Design

### 3.1 Orchestrator States

```
                    ┌─────────┐
                    │  IDLE   │
                    └────┬────┘
                         │ init
                         ▼
                    ┌─────────┐
             ┌──────│ PLANNING│◄─────────────────────┐
             │      └────┬────┘                      │
             │           │ start                     │ replan
             │           ▼                           │
             │      ┌─────────┐                      │
             │      │EXECUTING│──────────────────────┤
             │      └────┬────┘                      │
             │           │                           │
             │     ┌─────┴─────┬─────────────┐       │
             │     │           │             │       │
             │     ▼           ▼             ▼       │
             │ ┌───────┐  ┌───────┐    ┌─────────┐   │
             │ │PAUSED │  │ ERROR │    │COMPLETE │   │
             │ └───┬───┘  └───┬───┘    └─────────┘   │
             │     │          │                      │
             │     │ resume   │ recover              │
             │     └────┬─────┘                      │
             │          │                            │
             └──────────┴────────────────────────────┘
```

### 3.2 Tier State Machine

Each tier (Phase, Task, Subtask, Iteration) has its own state:

```
         ┌──────────┐
         │ PENDING  │
         └────┬─────┘
              │ start
              ▼
         ┌──────────┐
         │ PLANNING │
         └────┬─────┘
              │ plan_complete
              ▼
         ┌──────────┐          ┌──────────┐
         │ RUNNING  │◄─────────│ RETRYING │
         └────┬─────┘          └────┬─────┘
              │                     │
         ┌────┴────┐                │
         │         │                │
         ▼         ▼                │
    ┌────────┐ ┌───────┐            │
    │ GATING │ │FAILED │────────────┘
    └────┬───┘ └───────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ PASSED │ │ESCALATED │
└────────┘ └──────────┘
```

### 3.3 State Transitions Table

| From | Event | To | Action |
|------|-------|-----|--------|
| PENDING | tier_selected | PLANNING | Generate tier plan |
| PLANNING | plan_approved | RUNNING | Begin execution |
| RUNNING | iteration_complete | GATING | Run gate checks |
| RUNNING | iteration_failed | RETRYING | Spawn new attempt |
| RUNNING | max_attempts | FAILED | Mark failed |
| GATING | gate_passed | PASSED | Record evidence, advance |
| GATING | gate_failed_minor | RUNNING | Self-fix attempt |
| GATING | gate_failed_major | ESCALATED | Kick up/down |
| FAILED | retry | PENDING | Reset for retry |
| RETRYING | new_attempt | RUNNING | Fresh iteration |

---

## 4. Platform Abstraction Layer

### 4.1 PlatformRunner Interface

```typescript
interface PlatformRunner {
  // Identity
  readonly platform: 'cursor' | 'codex' | 'claude';
  
  // Capability check
  isAvailable(): Promise<boolean>;
  getVersion(): Promise<string>;
  
  // Execution
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  executeStreaming(request: ExecutionRequest): AsyncIterable<ExecutionEvent>;
  
  // Session management
  createSession(config: SessionConfig): Promise<Session>;
  resumeSession(sessionId: string): Promise<Session>;
  terminateSession(sessionId: string): Promise<void>;
  
  // Process management
  getRunningProcesses(): Promise<ProcessInfo[]>;
  killProcess(pid: number): Promise<void>;
}

interface ExecutionRequest {
  prompt: string;
  model?: string;
  workingDirectory: string;
  timeout?: number;
  maxTurns?: number;
  contextFiles?: string[];
  systemPrompt?: string;
  nonInteractive: boolean;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  exitCode: number;
  duration: number;
  tokensUsed?: number;
  sessionId?: string;
  error?: string;
}

interface ExecutionEvent {
  type: 'started' | 'output' | 'tool_use' | 'error' | 'complete';
  timestamp: number;
  data: unknown;
}
```

### 4.2 Cursor Runner Implementation

```typescript
class CursorRunner implements PlatformRunner {
  readonly platform = 'cursor';
  
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const args = this.buildArgs(request);
    const proc = spawn('cursor-agent', args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Handle non-interactive mode
    if (request.nonInteractive) {
      args.unshift('-p'); // Print mode
    }
    
    // Write prompt to stdin
    proc.stdin.write(request.prompt);
    proc.stdin.end();
    
    // Collect output
    const output = await collectOutput(proc);
    
    return {
      success: proc.exitCode === 0,
      output,
      exitCode: proc.exitCode,
      duration: Date.now() - startTime,
      sessionId: this.extractSessionId(output)
    };
  }
  
  private buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];
    
    if (request.model) {
      args.push('--model', request.model);
    }
    
    if (request.maxTurns) {
      args.push('--max-turns', String(request.maxTurns));
    }
    
    // Add prompt as final argument
    args.push(request.prompt);
    
    return args;
  }
}
```

### 4.3 Codex Runner Implementation

```typescript
class CodexRunner implements PlatformRunner {
  readonly platform = 'codex';
  
  async executeStreaming(request: ExecutionRequest): AsyncIterable<ExecutionEvent> {
    const args = this.buildArgs(request);
    args.push('--output-format', 'stream-json');
    
    const proc = spawn('codex', ['exec', ...args], {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    proc.stdin.write(request.prompt);
    proc.stdin.end();
    
    // Parse JSONL output
    const rl = readline.createInterface({ input: proc.stdout });
    
    for await (const line of rl) {
      try {
        const event = JSON.parse(line);
        yield this.mapEvent(event);
      } catch {
        // Non-JSON output, emit as raw
        yield { type: 'output', timestamp: Date.now(), data: line };
      }
    }
  }
  
  private mapEvent(raw: any): ExecutionEvent {
    // Map Codex JSONL events to our format
    switch (raw.type) {
      case 'thread.started':
        return { type: 'started', timestamp: Date.now(), data: raw };
      case 'item.completed':
        return { type: 'complete', timestamp: Date.now(), data: raw };
      case 'error':
        return { type: 'error', timestamp: Date.now(), data: raw };
      default:
        return { type: 'output', timestamp: Date.now(), data: raw };
    }
  }
}
```

### 4.4 Claude Code Runner Implementation

```typescript
class ClaudeCodeRunner implements PlatformRunner {
  readonly platform = 'claude';
  
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const args = this.buildArgs(request);
    
    const proc = spawn('claude', args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    proc.stdin.write(request.prompt);
    proc.stdin.end();
    
    const output = await collectOutput(proc);
    
    return {
      success: proc.exitCode === 0,
      output,
      exitCode: proc.exitCode,
      duration: Date.now() - startTime,
      sessionId: this.extractSessionId(output)
    };
  }
  
  private buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = [];
    
    // Always use print mode for non-interactive
    if (request.nonInteractive) {
      args.push('-p');
    }
    
    if (request.model) {
      args.push('--model', request.model);
    }
    
    if (request.maxTurns) {
      args.push('--max-turns', String(request.maxTurns));
    }
    
    if (request.systemPrompt) {
      args.push('--append-system-prompt', request.systemPrompt);
    }
    
    // Add prompt
    args.push(request.prompt);
    
    return args;
  }
}
```

### 4.5 Fresh Agent Enforcement

To ensure fresh context per iteration:

```typescript
class ExecutionEngine {
  async spawnFreshIteration(
    tier: 'subtask' | 'iteration',
    config: TierConfig,
    context: IterationContext
  ): Promise<IterationResult> {
    // 1. ALWAYS create new process (never reuse)
    const runner = this.getRunner(config.platform);
    
    // 2. Build prompt with state files
    const prompt = await this.buildIterationPrompt(context);
    
    // 3. Execute WITHOUT resume flag
    const request: ExecutionRequest = {
      prompt,
      model: config.model,
      workingDirectory: context.projectPath,
      nonInteractive: true,
      maxTurns: config.maxTurns,
      // NO sessionId - always fresh
    };
    
    // 4. Track process ID for verification
    const result = await runner.execute(request);
    
    // 5. Log for audit
    this.auditLog.record({
      type: 'iteration_spawned',
      tier,
      processId: result.processId,
      timestamp: Date.now(),
      fresh: true
    });
    
    return this.parseResult(result);
  }
}
```

---

## 5. Tier State Manager

### 5.1 Tier Hierarchy

```typescript
interface TierNode {
  id: string;
  type: 'phase' | 'task' | 'subtask' | 'iteration';
  state: TierState;
  parent?: TierNode;
  children: TierNode[];
  plan: TierPlan;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  evidence: Evidence[];
  iterations: number;
  maxIterations: number;
}

class TierStateManager {
  private root: TierNode; // Current project
  private phases: Map<string, TierNode>;
  private tasks: Map<string, TierNode>;
  private subtasks: Map<string, TierNode>;
  
  // Navigation
  getCurrentPhase(): TierNode;
  getCurrentTask(): TierNode;
  getCurrentSubtask(): TierNode;
  
  // Transitions
  async transitionTier(tierId: string, event: TierEvent): Promise<void>;
  
  // Auto-advancement
  async checkAndAdvance(): Promise<AdvancementResult>;
  
  // Queries
  getNextPendingSubtask(): TierNode | null;
  getFailedItems(): TierNode[];
  getCompletedItems(): TierNode[];
}
```

### 5.2 Auto-Advancement Logic

```typescript
async checkAndAdvance(): Promise<AdvancementResult> {
  const current = this.getCurrentSubtask();
  
  // Check if current subtask is complete
  if (current.state === 'PASSED') {
    // Check for more subtasks in current task
    const nextSubtask = this.getNextPendingSubtask(current.parent);
    if (nextSubtask) {
      return { action: 'continue', next: nextSubtask };
    }
    
    // All subtasks done - run task gate
    const taskGate = await this.runTaskGate(current.parent);
    if (taskGate.passed) {
      // Check for more tasks in current phase
      const nextTask = this.getNextPendingTask(current.parent.parent);
      if (nextTask) {
        return { action: 'advance_task', next: nextTask };
      }
      
      // All tasks done - run phase gate
      const phaseGate = await this.runPhaseGate(current.parent.parent);
      if (phaseGate.passed) {
        // Check for more phases
        const nextPhase = this.getNextPendingPhase();
        if (nextPhase) {
          return { action: 'advance_phase', next: nextPhase };
        }
        
        // All done!
        return { action: 'complete' };
      } else {
        return { action: 'phase_gate_failed', gate: phaseGate };
      }
    } else {
      return { action: 'task_gate_failed', gate: taskGate };
    }
  }
  
  return { action: 'continue', next: current };
}
```

### 5.3 Gate Execution

```typescript
async runTaskGate(task: TierNode): Promise<GateResult> {
  const config = this.config.tiers.task;
  const runner = this.getRunner(config.platform);
  
  // 1. Collect all subtask evidence
  const evidence = task.children.flatMap(s => s.evidence);
  
  // 2. Build gate prompt
  const prompt = this.buildGatePrompt({
    type: 'task',
    plan: task.plan,
    acceptanceCriteria: task.acceptanceCriteria,
    testPlan: task.testPlan,
    childEvidence: evidence
  });
  
  // 3. Execute gate review
  const result = await runner.execute({
    prompt,
    model: config.model,
    workingDirectory: this.projectPath,
    nonInteractive: true
  });
  
  // 4. Run test plan
  const testResult = await this.verification.runTestPlan(task.testPlan);
  
  // 5. Verify acceptance criteria
  const acceptanceResult = await this.verification.checkAcceptance(
    task.acceptanceCriteria,
    result.output
  );
  
  // 6. Generate gate report
  const report = this.generateGateReport({
    task,
    agentResult: result,
    testResult,
    acceptanceResult
  });
  
  // 7. Store evidence
  await this.evidenceStore.saveGateReport(task.id, report);
  
  return {
    passed: testResult.passed && acceptanceResult.passed,
    report,
    failureReason: this.getFailureReason(testResult, acceptanceResult)
  };
}
```

---

## 6. Verification Engine

### 6.1 Test Runner

```typescript
class TestRunner {
  async runTestPlan(plan: TestPlan): Promise<TestResult> {
    const results: CommandResult[] = [];
    
    for (const command of plan.commands) {
      const result = await this.executeCommand(command);
      results.push(result);
      
      if (!result.success && plan.failFast) {
        break;
      }
    }
    
    return {
      passed: results.every(r => r.success),
      results,
      summary: this.generateSummary(results)
    };
  }
  
  private async executeCommand(cmd: TestCommand): Promise<CommandResult> {
    const proc = spawn(cmd.command, cmd.args, {
      cwd: cmd.workingDirectory,
      timeout: cmd.timeout || 60000
    });
    
    const output = await collectOutput(proc);
    
    return {
      command: cmd,
      success: proc.exitCode === 0,
      exitCode: proc.exitCode,
      output,
      duration: proc.duration
    };
  }
}
```

### 6.2 Acceptance Verifier

```typescript
class AcceptanceVerifier {
  async checkAcceptance(
    criteria: Criterion[],
    evidence: string
  ): Promise<AcceptanceResult> {
    const results: CriterionResult[] = [];
    
    for (const criterion of criteria) {
      const result = await this.verifyCriterion(criterion, evidence);
      results.push(result);
    }
    
    return {
      passed: results.every(r => r.passed),
      results,
      passedCount: results.filter(r => r.passed).length,
      totalCount: results.length
    };
  }
  
  private async verifyCriterion(
    criterion: Criterion,
    evidence: string
  ): Promise<CriterionResult> {
    switch (criterion.type) {
      case 'regex':
        return this.checkRegex(criterion, evidence);
      
      case 'file_exists':
        return this.checkFileExists(criterion);
      
      case 'browser_verify':
        return this.checkBrowser(criterion);
      
      case 'command':
        return this.checkCommand(criterion);
      
      case 'manual':
        // Flag for human review
        return { passed: false, requiresHumanReview: true };
      
      default:
        // AI-based verification as fallback
        return this.aiVerify(criterion, evidence);
    }
  }
}
```

### 6.3 Browser Adapter

```typescript
interface BrowserAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
  
  navigate(url: string): Promise<void>;
  getSnapshot(): Promise<string>;
  click(ref: string): Promise<void>;
  fill(ref: string, text: string): Promise<void>;
  screenshot(path: string): Promise<void>;
  
  verify(scenario: BrowserScenario): Promise<BrowserVerifyResult>;
}

class DevBrowserAdapter implements BrowserAdapter {
  private client: DevBrowserClient;
  
  async verify(scenario: BrowserScenario): Promise<BrowserVerifyResult> {
    const page = await this.client.page(scenario.pageName);
    
    // Navigate if needed
    if (scenario.url) {
      await page.goto(scenario.url);
      await waitForPageLoad(page);
    }
    
    // Get snapshot for AI verification
    const snapshot = await this.client.getAISnapshot(scenario.pageName);
    
    // Execute verification steps
    const stepResults: StepResult[] = [];
    for (const step of scenario.steps) {
      const result = await this.executeStep(page, step, snapshot);
      stepResults.push(result);
      
      if (!result.passed && scenario.failFast) {
        break;
      }
    }
    
    // Take evidence screenshot
    const screenshotPath = `${this.evidencePath}/${scenario.pageName}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    
    return {
      passed: stepResults.every(s => s.passed),
      stepResults,
      screenshotPath,
      snapshot
    };
  }
}
```

---

## 7. Memory Layer Manager

### 7.1 Progress Manager

```typescript
class ProgressManager {
  private filePath: string;
  
  async append(entry: ProgressEntry): Promise<void> {
    const formatted = this.formatEntry(entry);
    await fs.appendFile(this.filePath, formatted + '\n---\n');
  }
  
  async read(): Promise<ProgressEntry[]> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return this.parseEntries(content);
  }
  
  async getLatest(n: number = 5): Promise<ProgressEntry[]> {
    const entries = await this.read();
    return entries.slice(-n);
  }
  
  private formatEntry(entry: ProgressEntry): string {
    return `## ${entry.timestamp} - ${entry.itemId}
**Session:** ${entry.sessionId}
**Platform:** ${entry.platform}
**Duration:** ${entry.duration}
**Status:** ${entry.status}

### What Was Done
${entry.accomplishments.map(a => `- ${a}`).join('\n')}

### Files Changed
${entry.filesChanged.map(f => `- \`${f.path}\` - ${f.description}`).join('\n')}

### Tests Run
${entry.testsRun.map(t => `- \`${t.command}\` - ${t.result}`).join('\n')}

### Learnings for Future Iterations
${entry.learnings.map(l => `- ${l}`).join('\n')}

### Next Steps
${entry.nextSteps.map(s => `- ${s}`).join('\n')}
`;
  }
}
```

### 7.2 Agents Manager

```typescript
class AgentsManager {
  private rootPath: string;
  private multiLevelEnabled: boolean;
  
  async loadForContext(context: IterationContext): Promise<AgentsContent[]> {
    const contents: AgentsContent[] = [];
    
    // Always load root AGENTS.md
    contents.push(await this.loadFile(this.rootPath));
    
    if (this.multiLevelEnabled) {
      // Load module-level if applicable
      const modulePath = this.findModuleAgents(context.filesTargeted);
      if (modulePath) {
        contents.push(await this.loadFile(modulePath));
      }
      
      // Load phase-level if exists
      const phasePath = `.puppet-master/agents/phase-${context.phaseId}.md`;
      if (await this.exists(phasePath)) {
        contents.push(await this.loadFile(phasePath));
      }
      
      // Load task-level if exists
      const taskPath = `.puppet-master/agents/task-${context.taskId}.md`;
      if (await this.exists(taskPath)) {
        contents.push(await this.loadFile(taskPath));
      }
    }
    
    return contents;
  }
  
  async addPattern(pattern: Pattern, level: AgentsLevel = 'root'): Promise<void> {
    const filePath = this.getFilePath(level);
    const content = await this.read(filePath);
    const section = this.findSection(content, 'Codebase Patterns');
    const updated = this.appendToSection(section, `- ${pattern.description}`);
    await this.write(filePath, updated);
  }
  
  async addGotcha(gotcha: Gotcha, level: AgentsLevel = 'root'): Promise<void> {
    const filePath = this.getFilePath(level);
    const content = await this.read(filePath);
    const section = this.findSection(content, 'Common Failure Modes');
    const updated = this.appendToSection(section, `- ${gotcha.description}: ${gotcha.fix}`);
    await this.write(filePath, updated);
  }
  
  async promoteToHigherLevel(
    item: AgentsItem,
    fromLevel: AgentsLevel,
    toLevel: AgentsLevel
  ): Promise<void> {
    // Add to higher level
    await this.addToLevel(item, toLevel);
    
    // Optionally remove from lower level to avoid duplication
    if (this.config.removeOnPromotion) {
      await this.removeFromLevel(item, fromLevel);
    }
  }
}
```

### 7.3 PRD Manager

```typescript
class PrdManager {
  private filePath: string;
  
  async load(): Promise<PRD> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }
  
  async save(prd: PRD): Promise<void> {
    prd.updatedAt = new Date().toISOString();
    await fs.writeFile(this.filePath, JSON.stringify(prd, null, 2));
  }
  
  async updateItemStatus(
    itemId: string,
    status: ItemStatus,
    evidence?: Evidence
  ): Promise<void> {
    const prd = await this.load();
    const item = this.findItem(prd, itemId);
    
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }
    
    item.status = status;
    if (evidence) {
      item.evidence = evidence;
    }
    
    // Update metadata
    this.recalculateMetadata(prd);
    
    await this.save(prd);
  }
  
  async getNextPending(type: 'phase' | 'task' | 'subtask'): Promise<Item | null> {
    const prd = await this.load();
    return this.findNextPending(prd, type);
  }
}
```

---

## 8. Capability Discovery Service (ADDENDUM v2.0)

### 8.1 Overview

The Capability Discovery Service validates CLI tool assumptions at runtime.

```typescript
class CapabilityDiscoveryService {
  private capabilities: Map<Platform, PlatformCapabilities>;
  
  async discoverAll(): Promise<DiscoveryReport> {
    const results: DiscoveryResult[] = [];
    
    for (const platform of ['cursor', 'codex', 'claude']) {
      const result = await this.discoverPlatform(platform);
      results.push(result);
      this.capabilities.set(platform, result.capabilities);
    }
    
    return {
      timestamp: new Date().toISOString(),
      results,
      allPassed: results.every(r => r.passed)
    };
  }
  
  async discoverPlatform(platform: Platform): Promise<DiscoveryResult> {
    const capabilities: PlatformCapabilities = {
      platform,
      version: await this.getVersion(platform),
      discoveredAt: new Date().toISOString(),
      capabilities: {},
      availableModels: [],
      smokeTest: null
    };
    
    // 1. Parse help output
    const helpOutput = await this.runCommand(`${platform} --help`);
    capabilities.capabilities = this.parseHelpFlags(helpOutput);
    
    // 2. Discover models
    capabilities.availableModels = await this.discoverModels(platform);
    
    // 3. Run smoke test
    capabilities.smokeTest = await this.runSmokeTest(platform);
    
    // 4. Save results
    await this.saveCapabilities(platform, capabilities);
    
    return {
      platform,
      passed: capabilities.smokeTest.passed,
      capabilities
    };
  }
  
  async runSmokeTest(platform: Platform): Promise<SmokeTestResult> {
    const tests = [
      { name: 'basic_invocation', command: this.getBasicCommand(platform) },
      { name: 'non_interactive', command: this.getNonInteractiveCommand(platform) },
      { name: 'model_selection', command: this.getModelCommand(platform) }
    ];
    
    const results: TestResult[] = [];
    for (const test of tests) {
      const result = await this.runTest(test);
      results.push(result);
    }
    
    return {
      passed: results.every(r => r.passed),
      results,
      duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0)
    };
  }
}
```

### 8.2 Capability Matrix Data Structure

```typescript
interface PlatformCapabilities {
  platform: 'cursor' | 'codex' | 'claude';
  version: string;
  discoveredAt: string;
  
  capabilities: {
    nonInteractive: boolean;
    modelSelection: boolean;
    streaming: 'full' | 'partial' | 'none';
    sessionResume: boolean;
    mcpSupport: boolean;
    maxTurns: boolean;
    outputFormat: string[];
  };
  
  invocation: {
    command: string;
    nonInteractiveFlag: string;
    modelFlag: string;
    workingDirFlag?: string;
  };
  
  exitCodes: {
    success: number;
    failure: number[];
  };
  
  availableModels: string[];
  
  smokeTest: SmokeTestResult;
}
```

### 8.3 Discovery as Authoritative Source of Truth (ADDENDUM v2.1)

**CRITICAL**: The Capability Discovery Service is the **authoritative source of truth** for CLI platform capabilities. This has the following operational implications:

**1. Refusal Rules:**
```typescript
class CapabilityDiscoveryService {
  async validateReadyForExecution(): Promise<ValidationResult> {
    const issues: string[] = [];
    
    for (const platform of this.requiredPlatforms) {
      const caps = this.capabilities.get(platform);
      
      if (!caps) {
        issues.push(`Missing capability discovery for ${platform}`);
        continue;
      }
      
      if (!caps.smokeTest?.passed) {
        issues.push(`Smoke test not passed for ${platform}`);
      }
      
      const staleThreshold = this.config.stalenessThresholdHours || 24;
      const discoveredAt = new Date(caps.discoveredAt);
      const hoursOld = (Date.now() - discoveredAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursOld > staleThreshold) {
        issues.push(`Capability data for ${platform} is stale (${hoursOld.toFixed(1)}h old)`);
      }
    }
    
    return {
      ready: issues.length === 0,
      issues,
      mustRunDoctor: issues.length > 0
    };
  }
}
```

**2. Evidence Artifacts Produced:**

| Artifact | Path | Purpose |
|----------|------|---------|
| `capabilities.json` | `.puppet-master/capabilities/capabilities.json` | Combined capability matrix for all platforms |
| `smoke-test-<platform>.log` | `.puppet-master/capabilities/smoke-test-cursor.log` | Full smoke test output |
| `capability-discovery-report.md` | `.puppet-master/capabilities/discovery-report.md` | Human-readable summary |

**3. Orchestrator Integration:**

The Orchestrator MUST call `validateReadyForExecution()` before starting any execution:

```typescript
class Orchestrator {
  async start(): Promise<void> {
    const validation = await this.capabilityDiscovery.validateReadyForExecution();
    
    if (!validation.ready) {
      throw new CapabilityValidationError(
        'Cannot start execution: ' + validation.issues.join('; '),
        validation.issues,
        'Run `puppet-master doctor` to discover and validate capabilities'
      );
    }
    
    // Proceed with execution...
  }
}
```

**Any default values in documentation or configuration are placeholders until Discovery validates them.**

---

## 9. Budget Manager (ADDENDUM v2.0)

### 9.1 Overview

The Budget Manager tracks platform usage and enforces quotas.

```typescript
class BudgetManager {
  private usage: Map<Platform, UsageRecord[]>;
  private budgets: BudgetConfig;
  
  async recordUsage(platform: Platform, action: string, tokens?: number): Promise<void> {
    const record: UsageRecord = {
      timestamp: new Date().toISOString(),
      platform,
      action,
      tokens: tokens || 0,
      duration_ms: 0
    };
    
    // Append to usage log
    await this.appendUsageLog(record);
    
    // Check limits
    const status = await this.checkLimits(platform);
    if (status.limitReached) {
      await this.handleLimitReached(platform, status);
    }
  }
  
  async checkLimits(platform: Platform): Promise<LimitStatus> {
    const budget = this.budgets[platform];
    const usage = await this.getUsageForPeriod(platform, 'hour');
    
    return {
      platform,
      currentUsage: usage.length,
      limit: budget.max_calls_per_hour,
      percentage: (usage.length / budget.max_calls_per_hour) * 100,
      limitReached: usage.length >= budget.max_calls_per_hour,
      cooldownEnds: this.getCooldownEnd(platform)
    };
  }
  
  async handleLimitReached(platform: Platform, status: LimitStatus): Promise<void> {
    const policy = this.budgets.budget_enforcement.on_limit_reached;
    
    switch (policy) {
      case 'fallback':
        const fallback = this.budgets[platform].fallback_platform;
        this.eventBus.emit('platform_fallback', { from: platform, to: fallback });
        break;
        
      case 'pause':
        this.eventBus.emit('execution_paused', { reason: 'budget_limit', platform });
        break;
        
      case 'queue':
        this.eventBus.emit('work_queued', { platform, resumeAt: status.cooldownEnds });
        break;
    }
  }
  
  async getStatus(): Promise<BudgetStatus> {
    const platforms = ['cursor', 'codex', 'claude'] as const;
    const statuses: Record<Platform, LimitStatus> = {};
    
    for (const platform of platforms) {
      statuses[platform] = await this.checkLimits(platform);
    }
    
    return {
      timestamp: new Date().toISOString(),
      platforms: statuses,
      warnings: this.getWarnings(statuses)
    };
  }
}
```

---

## 10. Verifier Registry (ADDENDUM v2.0)

### 10.1 Overview

The Verifier Registry manages verifier types and their handlers.

```typescript
class VerifierRegistry {
  private verifiers: Map<string, Verifier>;
  
  constructor() {
    // Register built-in verifiers
    this.register('TEST', new TestVerifier());
    this.register('CLI_VERIFY', new CliVerifier());
    this.register('BROWSER_VERIFY', new BrowserVerifier());
    this.register('FILE_VERIFY', new FileVerifier());
    this.register('REGEX_VERIFY', new RegexVerifier());
    this.register('PERF_VERIFY', new PerfVerifier());
    this.register('MANUAL_VERIFY', new ManualVerifier());
    this.register('AI_VERIFY', new AiVerifier());
  }
  
  register(type: string, verifier: Verifier): void {
    this.verifiers.set(type, verifier);
  }
  
  async execute(token: string): Promise<VerifierResult> {
    const { type, target, options } = this.parseToken(token);
    
    const verifier = this.verifiers.get(type);
    if (!verifier) {
      throw new Error(`Unknown verifier type: ${type}`);
    }
    
    const startTime = Date.now();
    const result = await verifier.execute(target, options);
    result.duration_ms = Date.now() - startTime;
    
    // Store evidence
    await this.evidenceStore.save(result.evidence);
    
    return result;
  }
  
  private parseToken(token: string): ParsedToken {
    // Format: TYPE:target[:options]
    const parts = token.split(':');
    return {
      type: parts[0],
      target: parts[1],
      options: parts.slice(2).join(':') || undefined
    };
  }
}

// Example verifier implementation
class TestVerifier implements Verifier {
  type = 'TEST';
  
  async execute(target: string, options?: string): Promise<VerifierResult> {
    const proc = spawn('sh', ['-c', target], { stdio: 'pipe' });
    const output = await collectOutput(proc);
    
    const logPath = `.puppet-master/evidence/test-logs/${Date.now()}.log`;
    await fs.writeFile(logPath, output);
    
    return {
      passed: proc.exitCode === 0,
      output,
      evidence: {
        type: 'log',
        path: logPath,
        summary: this.summarize(output),
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

---

## 11. Git Manager (ADDENDUM v2.0)

### 11.1 Overview

The Git Manager handles all git operations with configurable strategies.

```typescript
class GitManager {
  private config: GitConfig;
  
  async commit(message: string, files?: string[]): Promise<CommitResult> {
    // Stage files
    if (files && files.length > 0) {
      await this.run(['add', ...files]);
    } else {
      await this.run(['add', '-A']);
    }
    
    // Check if there are changes to commit
    const status = await this.run(['status', '--porcelain']);
    if (!status.trim()) {
      return { committed: false, reason: 'no_changes' };
    }
    
    // Commit
    const args = ['commit', '-m', message];
    if (this.config.commit.sign_commits) {
      args.push('-S');
    }
    
    await this.run(args);
    const sha = await this.run(['rev-parse', 'HEAD']);
    
    // Log action
    await this.logAction('commit', { sha: sha.trim(), message, files });
    
    return { committed: true, sha: sha.trim() };
  }
  
  async push(branch?: string): Promise<PushResult> {
    const currentBranch = branch || await this.getCurrentBranch();
    
    try {
      await this.run(['push', 'origin', currentBranch]);
      await this.logAction('push', { branch: currentBranch, result: 'success' });
      return { pushed: true };
    } catch (error) {
      if (this.isConflictError(error)) {
        return await this.handlePushConflict(currentBranch);
      }
      throw error;
    }
  }
  
  async createBranch(name: string, baseBranch?: string): Promise<void> {
    const base = baseBranch || this.config.branch.base_branch;
    await this.run(['checkout', '-b', name, base]);
    await this.logAction('branch_create', { name, base });
  }
  
  async createPR(title: string, body: string): Promise<PRResult> {
    if (!this.config.pr.enabled) {
      return { created: false, reason: 'pr_disabled' };
    }
    
    // Check if gh CLI is available
    if (!await this.isGhAvailable()) {
      return { created: false, reason: 'gh_not_available' };
    }
    
    const args = [
      'pr', 'create',
      '--title', title,
      '--body', body,
      '--base', this.config.branch.base_branch
    ];
    
    if (this.config.pr.labels.length > 0) {
      args.push('--label', this.config.pr.labels.join(','));
    }
    
    const output = await this.runGh(args);
    const prNumber = this.extractPRNumber(output);
    
    await this.logAction('pr_create', { number: prNumber, title });
    
    return { created: true, number: prNumber, url: output.trim() };
  }
  
  private async handlePushConflict(branch: string): Promise<PushResult> {
    const strategy = this.config.conflict.strategy;
    
    switch (strategy) {
      case 'pause':
        this.eventBus.emit('git_conflict', { branch });
        return { pushed: false, reason: 'conflict', requiresHuman: true };
        
      case 'rebase':
        try {
          await this.run(['pull', '--rebase', 'origin', branch]);
          await this.run(['push', 'origin', branch]);
          return { pushed: true, rebased: true };
        } catch {
          return { pushed: false, reason: 'rebase_failed', requiresHuman: true };
        }
        
      case 'abort':
        return { pushed: false, reason: 'conflict_aborted' };
    }
  }
}
```

---

## 12. Runner Contract (ADDENDUM v2.0)

### 12.1 Full Runner Contract Interface

```typescript
interface PlatformRunnerContract {
  // ===== Identity =====
  readonly platform: 'cursor' | 'codex' | 'claude';
  
  // ===== Capability Discovery =====
  isAvailable(): Promise<boolean>;
  getVersion(): Promise<string>;
  discoverCapabilities(): Promise<PlatformCapabilities>;
  
  // ===== Spawning (CRITICAL: Always Fresh) =====
  spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess>;
  readonly sessionReuseAllowed: boolean; // Default: false
  
  // ===== State Isolation =====
  prepareWorkingDirectory(path: string): Promise<void>;
  cleanupAfterExecution(pid: number): Promise<void>;
  
  // ===== Context Files =====
  readonly allowedContextFiles: string[];
  // Default: ['progress.txt', 'AGENTS.md', 'prd.json', '.puppet-master/plans/*']
  
  buildContextPrompt(context: IterationContext): Promise<string>;
  
  // ===== Timeouts =====
  readonly defaultTimeout: number;  // milliseconds
  readonly hardTimeout: number;     // kill after this
  
  // ===== Kill Semantics =====
  terminateProcess(pid: number): Promise<void>;      // SIGTERM
  forceKillProcess(pid: number): Promise<void>;      // SIGKILL
  
  // ===== Output Handling =====
  captureStdout(pid: number): AsyncIterable<string>;
  captureStderr(pid: number): AsyncIterable<string>;
  getTranscript(pid: number): Promise<string>;
  parseOutput(output: string): ParsedOutput;
  
  // ===== Stall Detection =====
  detectStall(pid: number, config: StallConfig): Promise<StallStatus>;
  
  // ===== Audit =====
  getProcessAudit(pid: number): Promise<ProcessAudit>;
}

interface RunningProcess {
  pid: number;
  startedAt: Date;
  platform: Platform;
  request: ExecutionRequest;
  stdout: Readable;
  stderr: Readable;
  exitPromise: Promise<number>;
}

interface ProcessAudit {
  iteration_id: string;
  process: {
    pid: number;
    started_at: string;
    ended_at: string;
    exit_code: number;
    fresh_spawn: boolean;
    session_resumed: boolean;
  };
  context_files_provided: string[];
  working_directory: string;
  environment_vars_set: string[];
}
```

### 12.2 Fresh Spawn Implementation

```typescript
abstract class BasePlatformRunner implements PlatformRunnerContract {
  readonly sessionReuseAllowed = false; // NEVER reuse by default
  
  async spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess> {
    // 1. Verify clean state
    await this.prepareWorkingDirectory(request.workingDirectory);
    
    // 2. Build command (NO --resume flag)
    const args = this.buildArgs(request);
    
    // 3. Spawn new process
    const proc = spawn(this.getCommand(), args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: this.buildEnvironment(request)
    });
    
    // 4. Record PID
    const runningProcess: RunningProcess = {
      pid: proc.pid,
      startedAt: new Date(),
      platform: this.platform,
      request,
      stdout: proc.stdout,
      stderr: proc.stderr,
      exitPromise: this.waitForExit(proc)
    };
    
    // 5. Start stall detection
    this.startStallMonitor(runningProcess);
    
    return runningProcess;
  }
  
  async prepareWorkingDirectory(path: string): Promise<void> {
    // Verify git is clean or stash
    const status = await this.git.status(path);
    if (status.modified.length > 0) {
      if (this.config.stash_uncommitted) {
        await this.git.stash(path);
      } else {
        throw new Error('Uncommitted changes in working directory');
      }
    }
  }
  
  async cleanupAfterExecution(pid: number): Promise<void> {
    // Ensure process is terminated
    try {
      process.kill(pid, 0); // Check if running
      await this.terminateProcess(pid);
    } catch {
      // Process already dead, good
    }
    
    // Clean temp files if any
    await this.cleanTempFiles(pid);
  }
}
```

---

## 13. Directory Structure

```
rwm-puppet-master/
├── src/
│   ├── core/
│   │   ├── orchestrator.ts
│   │   ├── state-machine.ts
│   │   ├── tier-manager.ts
│   │   ├── execution-engine.ts
│   │   ├── capability-discovery.ts    # ADDENDUM v2.0
│   │   └── budget-manager.ts          # ADDENDUM v2.0
│   ├── platforms/
│   │   ├── platform-runner.ts         # Interface + Contract
│   │   ├── cursor-runner.ts
│   │   ├── codex-runner.ts
│   │   └── claude-code-runner.ts
│   ├── verification/
│   │   ├── test-runner.ts
│   │   ├── acceptance-verifier.ts
│   │   ├── browser-adapter.ts
│   │   ├── evidence-collector.ts
│   │   └── verifier-registry.ts       # ADDENDUM v2.0
│   ├── memory/
│   │   ├── progress-manager.ts
│   │   ├── agents-manager.ts          # Enhanced with multi-level
│   │   ├── prd-manager.ts
│   │   └── evidence-store.ts
│   ├── git/
│   │   ├── git-manager.ts             # Enhanced
│   │   ├── branch-strategy.ts         # ADDENDUM v2.0
│   │   ├── pr-manager.ts              # ADDENDUM v2.0
│   │   └── conflict-resolver.ts       # ADDENDUM v2.0
│   ├── config/
│   │   ├── config-manager.ts
│   │   └── schema.ts
│   ├── cli/
│   │   ├── index.ts
│   │   └── commands/
│   │       ├── init.ts
│   │       ├── start.ts
│   │       ├── status.ts
│   │       ├── doctor.ts
│   │       └── gui.ts
│   └── gui/
│       ├── server.ts
│       └── routes/
├── gui/                               # React frontend
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Capabilities.tsx       # ADDENDUM v2.0
│   │   │   ├── Budgets.tsx            # ADDENDUM v2.0
│   │   │   └── ...
│   │   └── components/
│   └── package.json
├── templates/
│   ├── prompts/
│   │   ├── iteration.md
│   │   ├── gate-task.md
│   │   ├── gate-phase.md
│   │   └── start-chain.md
│   └── config/
│       └── default.yaml
├── tests/
├── docs/
├── package.json
└── tsconfig.json
```

---

## 14. Data Flow

### 14.1 Execution Flow

```
User Command
     │
     ▼
┌─────────┐
│   CLI   │──────────────────────────┐
└────┬────┘                          │
     │                               │
     ▼                               ▼
┌─────────────┐              ┌────────────┐
│ Orchestrator│◄─────────────│    GUI     │
└──────┬──────┘              └────────────┘
       │
       ▼
┌──────────────┐
│ BudgetManager│ ◄── Check limits before execution
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ TierManager  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────┐
│  Execution   │────►│   Platform  │
│   Engine     │     │   Runner    │
└──────┬───────┘     └──────┬──────┘
       │                    │
       │                    ▼
       │             ┌─────────────┐
       │             │  CLI Process │
       │             │  (cursor/   │
       │             │   codex/    │
       │             │   claude)   │
       │             └──────┬──────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌─────────────┐
│ Verification │◄────│   Output    │
│   Engine     │     │   Parser    │
└──────┬───────┘     └─────────────┘
       │
       ▼
┌──────────────┐
│   Memory     │
│   Manager    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     Git      │
│   Manager    │
└──────────────┘
```

### 14.2 State Update Flow

```
Iteration Completes
        │
        ▼
┌───────────────┐
│ Parse Output  │
└───────┬───────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────┐  ┌───────┐
│Tests│  │Accept │
└──┬──┘  └───┬───┘
   │         │
   └────┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
PASS      FAIL
 │          │
 ▼          ▼
┌─────┐  ┌───────┐
│Gate │  │Retry/ │
│Check│  │Escalate│
└──┬──┘  └───────┘
   │
   ▼
┌──────────────┐
│Update Memory │
│- progress.txt│
│- prd.json    │
│- AGENTS.md   │
└──────┬───────┘
        │
        ▼
┌──────────────┐
│  Git Commit  │
└──────────────┘
```

---

## 15. Error Handling Strategy

### 15.1 Error Categories

| Category | Examples | Handling |
|----------|----------|----------|
| Platform Error | CLI not found, auth failed | Fail fast, prompt for fix |
| Execution Error | Timeout, crash, OOM | Retry with fresh context |
| Test Failure | Tests fail, typecheck fail | Record, retry, escalate |
| Acceptance Failure | Criteria not met | Retry, eventually escalate |
| Git Error | Merge conflict, push fail | Pause, alert user |
| Gutter | Repeated failures | Stop iteration, escalate |
| Budget Exceeded | Platform limit hit | Fallback or pause |

### 15.2 Recovery Actions

```typescript
class ErrorHandler {
  async handle(error: OrchestratorError): Promise<RecoveryAction> {
    switch (error.category) {
      case 'platform':
        return { action: 'halt', message: error.message };
      
      case 'execution':
        if (this.retryCount < this.maxRetries) {
          return { action: 'retry', fresh: true };
        }
        return { action: 'escalate', tier: 'parent' };
      
      case 'test':
        return { action: 'retry', fresh: true };
      
      case 'acceptance':
        if (this.retryCount < 2) {
          return { action: 'retry', fresh: true };
        }
        return { action: 'escalate', tier: 'parent' };
      
      case 'git':
        return { action: 'pause', requiresHuman: true };
      
      case 'gutter':
        return { action: 'escalate', tier: 'parent' };
      
      case 'budget':
        const fallback = this.budgetManager.getFallback(error.platform);
        if (fallback) {
          return { action: 'switch_platform', to: fallback };
        }
        return { action: 'pause', reason: 'budget_exhausted' };
    }
  }
}
```

---

## 16. Related Work / Weave Analysis (ADDENDUM v2.0)

### 16.1 Overview

The [codex-weave](https://github.com/rosem/codex-weave) repository implements multi-agent orchestration for Codex. We analyzed it for applicable patterns.

### 16.2 Key Concepts from Weave

1. **JSONL Event Protocol**
   - Structured events: `task`, `result`, `error`, `heartbeat`
   - Envelope format with routing info
   - **Adopted**: Activity logging uses JSONL format

2. **Agent Routing**
   - Central coordinator routes messages between agents
   - Load balancing across instances
   - **Adapted**: Our tier-to-tier communication follows similar patterns

3. **Trace Format**
   - Span-based tracing (OpenTelemetry-like)
   - Parent-child relationships
   - **Adopted**: Iteration tracking uses trace-like structure

4. **Plugin Architecture**
   - Extensible tool providers
   - Output formatters
   - **Adopted**: VerifierRegistry follows similar plugin pattern

### 16.3 What We Did NOT Adopt

- **Direct agent-to-agent communication**: Puppet Master mediates all communication
- **WebSocket RPC**: We use CLI invocation, not persistent connections
- **Session pooling**: Each platform has different session semantics

### 16.4 Weave-Inspired Patterns in Puppet Master

```typescript
// JSONL Event Format (inspired by Weave)
interface ActivityEvent {
  timestamp: string;
  type: 'iteration_start' | 'iteration_complete' | 'gate_start' | 'gate_complete' | 'error';
  tier: 'phase' | 'task' | 'subtask' | 'iteration';
  item_id: string;
  parent_id?: string;  // For trace hierarchy
  data: Record<string, unknown>;
}

// Envelope Pattern for CLI Output Parsing
interface OutputEnvelope {
  source: Platform;
  timestamp: string;
  type: 'stdout' | 'stderr' | 'structured';
  content: string | object;
  metadata?: {
    tokens_used?: number;
    duration_ms?: number;
  };
}
```

---

## 17. Extensibility Points

### 17.1 Plugin Architecture

```typescript
interface PuppetMasterPlugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInit?(context: PluginContext): Promise<void>;
  onShutdown?(): Promise<void>;
  
  // Event hooks
  onIterationStart?(iteration: Iteration): Promise<void>;
  onIterationComplete?(iteration: Iteration, result: Result): Promise<void>;
  onGateStart?(gate: Gate): Promise<void>;
  onGateComplete?(gate: Gate, result: GateResult): Promise<void>;
  
  // Extension points
  providePlatformRunner?(): PlatformRunner;
  provideBrowserAdapter?(): BrowserAdapter;
  provideVerifier?(): Verifier;
}
```

### 17.2 Custom Platform Support

```typescript
// Example: Adding support for a new CLI
class MyCustomRunner implements PlatformRunnerContract {
  readonly platform = 'custom' as const;
  readonly sessionReuseAllowed = false;
  
  async spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess> {
    // Implementation following the contract
  }
  
  // ... other methods
}

// Register
orchestrator.registerPlatform('custom', new MyCustomRunner());
```

### 17.3 Custom Verifier

```typescript
// Example: Adding a custom verifier
class ApiHealthVerifier implements Verifier {
  type = 'API_HEALTH';
  
  async execute(target: string, options?: string): Promise<VerifierResult> {
    const response = await fetch(target);
    return {
      passed: response.ok,
      output: `Status: ${response.status}`,
      evidence: {
        type: 'log',
        path: `.puppet-master/evidence/api-health/${Date.now()}.json`,
        summary: `API ${target} returned ${response.status}`,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Register
verifierRegistry.register('API_HEALTH', new ApiHealthVerifier());
```

---

*End of ARCHITECTURE.md*
