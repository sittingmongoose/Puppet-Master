# Claude's Major Improvements Analysis

## RWM Puppet Master - Critical Architecture Review

**Document Author:** Claude (Architect Reviewer)
**Date:** 2026-01-20
**Scope:** Comprehensive analysis comparing RWM Puppet Master against 7 reference Ralph implementations and the original Ralph Wiggum Model specification

---

## Executive Summary

After thorough analysis of this project against the original Ralph Wiggum Model specification, the AI Hero tips, and 7 reference implementations, I have identified **critical architectural gaps** that threaten the project's fundamental viability. The concerns raised about PRD/task parsing, acceptance criteria, and CLI control are well-founded and require immediate attention.

**Severity Assessment:**
- 🔴 **CRITICAL** (3 issues) - Will cause project failure if not addressed
- 🟠 **HIGH** (4 issues) - Significant degradation of functionality
- 🟡 **MEDIUM** (3 issues) - Important improvements needed

---

## 🔴 CRITICAL ISSUE #1: PRD Parsing Failure

### Problem Statement
The user reported: *"I uploaded a big requirements document and it only parsed a few lines of it and shows only 1 section."*

This is a **fatal flaw**. The Ralph Wiggum Model's entire premise depends on a well-structured PRD with explicit acceptance criteria per task. If requirements parsing fails, the entire downstream chain fails.

### Root Cause Analysis

**Location:** `src/start-chain/prd-generator.ts`

The current implementation uses naive rule-based parsing:

```typescript
// Current approach - INADEQUATE
extractAcceptanceCriteria(content: string, itemId: string): Criterion[] {
  const lines = content.split('\n');
  for (const line of lines) {
    // Only captures bullet points (-, *, •) and numbered lists
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
  }
}
```

**Why This Fails:**
1. Only looks for simple bullet/numbered patterns
2. Misses nested requirements, tables, prose descriptions
3. Doesn't understand semantic meaning or context
4. No chunking strategy for large documents
5. Falls back to generic "Implementation complete" criterion

### How Reference Implementations Solve This

**ralph-main (original):**
- Uses AI-driven PRD generation with explicit prompts
- `prd.json` schema enforces structured user stories with `passes` boolean
- Iterative refinement loop for PRD quality

**ralph-playbook:**
- Multi-stage document processing
- Fan-out pattern: spawns up to 500 subagents for parallel parsing
- `IMPLEMENTATION_PLAN.md` as intermediate coordination format

**multi-agent-ralph-loop:**
- 12-step orchestration with dedicated planning agents
- Separate PRD Architect, Requirements Analyst, and Task Decomposer agents
- Schema validation at each stage

### Recommended Fix

1. **Replace rule-based parsing with AI-driven extraction:**
```typescript
// Recommended approach
async generatePRD(requirements: string): Promise<PRD> {
  // Step 1: Chunk large documents intelligently
  const chunks = await this.semanticChunker.chunk(requirements, {
    maxTokens: 8000,
    overlapTokens: 500,
    preserveStructure: true
  });

  // Step 2: Extract structured data per chunk via AI
  const extractedSections: ParsedSection[] = [];
  for (const chunk of chunks) {
    const result = await this.aiPlatform.generate({
      prompt: this.buildExtractionPrompt(chunk),
      schema: PRD_EXTRACTION_SCHEMA,
      temperature: 0.1  // Low temp for consistency
    });
    extractedSections.push(result);
  }

  // Step 3: Merge and deduplicate
  const merged = this.mergeSections(extractedSections);

  // Step 4: Validate completeness
  await this.validatePRDCompleteness(merged, requirements);

  return merged;
}
```

2. **Add validation layer:**
```typescript
async validatePRDCompleteness(prd: PRD, originalRequirements: string): Promise<void> {
  const coverage = await this.aiPlatform.generate({
    prompt: `Compare this PRD against the original requirements.
             Identify ANY requirements not captured.
             Output: { missing: string[], coverage: number }`,
    context: { prd, originalRequirements }
  });

  if (coverage.coverage < 0.95) {
    throw new PRDIncompleteError(coverage.missing);
  }
}
```

3. **Implement semantic chunking:**
   - Respect markdown headers as boundaries
   - Keep related content together
   - Track parent/child relationships across chunks

---

## 🔴 CRITICAL ISSUE #2: Manual Test Criteria Violation

### Problem Statement
User explicitly stated: *"THERE CAN BE NO MANUAL TESTS THE USER WILL NOT TEST"*

The current implementation **defaults every acceptance criterion to `type: 'manual'`**, which directly violates this core requirement.

### Root Cause Analysis

**Location:** `src/start-chain/prd-generator.ts` lines 89-115

```typescript
// PROBLEM: Default type is 'manual'
criteria.push({
  id: `${itemId}-AC-${String(criterionIndex).padStart(3, '0')}`,
  description,
  type: 'manual',  // 🔴 THIS IS THE PROBLEM
  target: '',
});
```

This means EVERY generated acceptance criterion requires human verification, making the loop non-autonomous.

### How Reference Implementations Solve This

**ralph-main:**
- Enforces `<promise>COMPLETE</promise>` as deterministic completion signal
- Tests must pass before promise can be printed

**ralph-claude-code:**
- RALPH_STATUS block communication pattern:
```
<RALPH_STATUS>
completion_indicators:
  - ✅ All tests passing
  - ✅ No type errors
  - ✅ Lint clean
EXIT_SIGNAL: READY
</RALPH_STATUS>
```
- Circuit breaker pattern prevents infinite loops

**ralph-wiggum-cursor:**
- Checkbox tracking in RALPH_TASK.md with automated parsing
- Guardrails system learns from failures
- "Gutter detection" (3x same failure = escalate)

### Recommended Fix

1. **Implement verifier token classification:**
```typescript
classifyAcceptanceCriterion(description: string): CriterionType {
  const patterns = {
    test: /test|spec|unit|integration|e2e/i,
    cli_verify: /build|compile|typecheck|lint|type.?check/i,
    file_exists: /create|add|file|exists|implement/i,
    regex_verify: /contain|include|match|pattern/i,
    perf_verify: /performance|latency|throughput|<\d+ms/i,
    browser_verify: /ui|display|render|show|visible/i,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(description)) {
      return type as CriterionType;
    }
  }

  // IMPORTANT: Use AI verification as fallback, NEVER manual
  return 'ai_verify';
}
```

2. **Generate executable verification commands:**
```typescript
generateVerificationTarget(criterion: Criterion): string {
  switch (criterion.type) {
    case 'test':
      return 'TEST:npm test';
    case 'cli_verify':
      return 'CLI_VERIFY:npm run typecheck && npm run lint';
    case 'file_exists':
      return `FILE_VERIFY:${this.inferFilePath(criterion.description)}:exists`;
    case 'regex_verify':
      return `REGEX_VERIFY:${this.inferFilePath(criterion.description)}:${this.extractPattern(criterion.description)}`;
    case 'ai_verify':
      return `AI_VERIFY:${criterion.description}`;
    default:
      return `AI_VERIFY:${criterion.description}`;
  }
}
```

3. **Add validation that rejects manual criteria:**
```typescript
validateNoManualCriteria(prd: PRD): void {
  const manualCriteria = this.findCriteriaByType(prd, 'manual');
  if (manualCriteria.length > 0) {
    throw new ManualCriteriaError(
      `Found ${manualCriteria.length} manual criteria. ` +
      `Manual criteria are not allowed. Convert to: test, cli_verify, ` +
      `file_exists, regex_verify, browser_verify, perf_verify, or ai_verify.`
    );
  }
}
```

---

## 🔴 CRITICAL ISSUE #3: CLI Control and Inter-Platform Communication

### Problem Statement
User stated: *"I am also seriously concerned with the cli control, the comamnds, and communicating between them."*

The current implementation lacks the sophisticated communication patterns needed for reliable multi-platform orchestration.

### Current State Analysis

**Location:** `src/cli/commands/start.ts`, `src/platforms/*.ts`

Current implementation:
- Basic Commander.js CLI with start/stop/status commands
- Platform runners invoke CLI tools but lack structured output parsing
- No heartbeat or health monitoring
- No retry/circuit breaker logic
- Simple file-based state without conflict detection

### How Reference Implementations Solve This

**ralph-claude-code - RALPH_STATUS Block Pattern:**
```markdown
<RALPH_STATUS>
iteration: 3
phase: implementation
completion_indicators:
  - ✅ Core logic implemented
  - ✅ Tests written
  - ⏳ Integration pending
blockers:
  - Need database schema review
EXIT_SIGNAL: CONTINUE
</RALPH_STATUS>
```

**ralph-claude-code - Circuit Breaker:**
```typescript
interface CircuitBreaker {
  state: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  failures: number;
  lastFailure: Date;
  cooldownMs: number;
}

async execute(fn: () => Promise<T>): Promise<T> {
  if (this.state === 'OPEN') {
    if (Date.now() - this.lastFailure > this.cooldownMs) {
      this.state = 'HALF_OPEN';
    } else {
      throw new CircuitOpenError();
    }
  }
  // ... execution logic
}
```

**ralph-wiggum-cursor - Stream Parser with Token Tracking:**
```typescript
class StreamParser {
  private tokenCount = 0;
  private readonly rotationThreshold = 80000;

  async parse(stream: ReadableStream): Promise<ParseResult> {
    for await (const chunk of stream) {
      this.tokenCount += this.countTokens(chunk);

      if (this.tokenCount > this.rotationThreshold) {
        return { action: 'ROTATE_CONTEXT', summary: this.summarize() };
      }

      // Parse structured output
      if (this.detectStatusBlock(chunk)) {
        return this.parseStatusBlock(chunk);
      }
    }
  }
}
```

**multi-agent-ralph-loop - Structured Agent Communication:**
```typescript
interface AgentMessage {
  from: AgentId;
  to: AgentId;
  type: 'TASK' | 'RESULT' | 'ESCALATE' | 'QUERY';
  payload: unknown;
  correlationId: string;
  timestamp: Date;
}

class MessageBus {
  async send(msg: AgentMessage): Promise<void>;
  async receive(agentId: AgentId): Promise<AgentMessage>;
  async broadcast(msg: AgentMessage): Promise<void>;
}
```

### Recommended Fix

1. **Implement structured output protocol:**
```typescript
// Add to src/types/protocol.ts
interface RalphStatusBlock {
  iteration: number;
  phase: 'planning' | 'implementation' | 'verification' | 'review';
  completionIndicators: CompletionIndicator[];
  blockers: string[];
  exitSignal: 'CONTINUE' | 'READY' | 'BLOCKED' | 'ESCALATE';
  metrics?: {
    tokensUsed: number;
    filesModified: string[];
    testsRun: number;
    testsPassed: number;
  };
}

interface CompletionIndicator {
  description: string;
  status: '✅' | '⏳' | '❌';
  evidence?: string;
}
```

2. **Add stream parser for platform output:**
```typescript
// Add to src/platforms/output-parser.ts
class PlatformOutputParser {
  private readonly statusBlockRegex = /<RALPH_STATUS>([\s\S]*?)<\/RALPH_STATUS>/;

  parse(output: string): ParsedOutput {
    const statusMatch = output.match(this.statusBlockRegex);
    if (statusMatch) {
      return this.parseStatusBlock(statusMatch[1]);
    }

    // Fallback: look for completion promise
    if (output.includes('<promise>COMPLETE</promise>')) {
      return { exitSignal: 'READY', type: 'promise' };
    }

    return { exitSignal: 'CONTINUE', type: 'implicit' };
  }
}
```

3. **Implement circuit breaker for platform calls:**
```typescript
// Add to src/platforms/circuit-breaker.ts
class PlatformCircuitBreaker {
  private state: 'CLOSED' | 'HALF_OPEN' | 'OPEN' = 'CLOSED';
  private consecutiveFailures = 0;
  private lastFailureTime = 0;

  private readonly failureThreshold = 3;
  private readonly cooldownMs = 60000;
  private readonly halfOpenSuccessThreshold = 2;

  async execute<T>(platformCall: () => Promise<T>): Promise<T> {
    this.checkState();

    try {
      const result = await platformCall();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private checkState(): void {
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure > this.cooldownMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerOpenError(
          `Platform circuit breaker open. Cooldown: ${this.cooldownMs - timeSinceFailure}ms`
        );
      }
    }
  }
}
```

4. **Add heartbeat/health monitoring:**
```typescript
// Add to src/platforms/health-monitor.ts
class PlatformHealthMonitor {
  private readonly healthChecks = new Map<Platform, HealthStatus>();
  private readonly checkIntervalMs = 30000;

  async startMonitoring(platforms: Platform[]): Promise<void> {
    for (const platform of platforms) {
      this.scheduleHealthCheck(platform);
    }
  }

  private async checkHealth(platform: Platform): Promise<HealthStatus> {
    const runner = this.registry.get(platform);
    const startTime = Date.now();

    try {
      await runner.healthCheck();
      return {
        platform,
        status: 'healthy',
        latencyMs: Date.now() - startTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        platform,
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }
}
```

---

## 🟠 HIGH ISSUE #4: Subtask Granularity and Context Management

### Problem Statement
The Ralph Wiggum Model specifies: *"Each Subtask must be ~1 context window of work (focused, testable unit)"*

Current implementation uses naive line-chunking that doesn't understand semantic task boundaries.

### Root Cause Analysis

**Location:** `src/start-chain/prd-generator.ts`

```typescript
// Current approach - INADEQUATE
generateSubtasks(taskId: string, content: string, ...): Subtask[] {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const chunkSize = Math.max(1, Math.ceil(lines.length / this.maxSubtasksPerTask));

  // Simply splits by line count, ignoring semantic meaning
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    // Creates "Subtask 1", "Subtask 2" with generic names
  }
}
```

### Recommended Fix

```typescript
class SemanticSubtaskGenerator {
  async generateSubtasks(task: Task, config: PuppetMasterConfig): Promise<Subtask[]> {
    // Use AI to decompose task into logical subtasks
    const decomposition = await this.aiPlatform.generate({
      prompt: this.buildDecompositionPrompt(task),
      schema: SUBTASK_DECOMPOSITION_SCHEMA
    });

    // Validate each subtask fits in context window
    const validated: Subtask[] = [];
    for (const subtask of decomposition.subtasks) {
      const tokenEstimate = this.estimateTokens(subtask);

      if (tokenEstimate > config.contextWindowLimit * 0.7) {
        // Too large - recursively decompose
        const smaller = await this.generateSubtasks(
          this.subtaskToTask(subtask),
          config
        );
        validated.push(...smaller);
      } else {
        validated.push(subtask);
      }
    }

    return validated;
  }

  private buildDecompositionPrompt(task: Task): string {
    return `Decompose this task into atomic subtasks.

RULES:
1. Each subtask must be completable in ONE focused coding session
2. Each subtask must have clear, testable acceptance criteria
3. Subtasks must be ordered by dependency (earlier don't depend on later)
4. Each subtask should modify 1-3 files maximum
5. Include specific file paths when known

TASK:
${task.description}

ACCEPTANCE CRITERIA:
${task.acceptanceCriteria.map(c => `- ${c.description}`).join('\n')}

OUTPUT FORMAT:
{
  "subtasks": [
    {
      "title": "Descriptive action-oriented title",
      "description": "What to implement",
      "files": ["src/path/file.ts"],
      "acceptanceCriteria": [
        { "description": "Specific testable criterion", "type": "test" }
      ],
      "dependencies": ["ST-XXX-XXX-001"]  // Earlier subtask IDs
    }
  ]
}`;
  }
}
```

---

## 🟠 HIGH ISSUE #5: Missing Worker/Reviewer Separation

### Problem Statement
The Ralph Wiggum Model specifies: *"(Recommended) Separate 'worker' and 'reviewer' agents/models. One agent does the coding, a different agent reviews and decides SHIP vs REVISE."*

The current implementation has a single agent handling both roles, reducing quality control.

### Current State

**Location:** `src/core/orchestrator.ts`

The orchestrator runs iterations but doesn't implement true worker/reviewer separation with different models.

### How Reference Implementations Solve This

**ralph-main:**
- Worker spawns with coding prompt
- Reviewer spawns with review prompt, different context
- Fresh sessions for each

**multi-agent-ralph-loop:**
- 11+ specialized agents including:
  - Code Writer Agent
  - Code Reviewer Agent
  - Test Writer Agent
  - Security Reviewer Agent
- Different models for different roles (Opus for complex review, Sonnet for coding)

### Recommended Fix

```typescript
// Add to src/core/orchestrator.ts
interface AgentRoles {
  worker: {
    platform: Platform;
    model?: string;
    systemPrompt: string;
  };
  reviewer: {
    platform: Platform;
    model?: string;
    systemPrompt: string;
  };
}

async runIteration(subtask: Subtask): Promise<IterationResult> {
  // Phase 1: Worker implements
  const workerResult = await this.runWorker(subtask);

  if (!workerResult.claimsDone) {
    return { status: 'continue', workerResult };
  }

  // Phase 2: Reviewer verifies (different model/context)
  const reviewerResult = await this.runReviewer(subtask, workerResult);

  if (reviewerResult.verdict === 'SHIP') {
    return { status: 'complete', workerResult, reviewerResult };
  } else {
    // Write feedback for next iteration
    await this.writeFeedback(reviewerResult.feedback);
    return { status: 'revise', workerResult, reviewerResult };
  }
}

private async runReviewer(subtask: Subtask, workerResult: WorkerResult): Promise<ReviewerResult> {
  const reviewerPlatform = this.config.reviewer?.platform ?? this.config.tiers.subtask.platform;
  const reviewerModel = this.config.reviewer?.model; // Different model recommended

  const prompt = this.buildReviewerPrompt(subtask, workerResult);

  return await this.platformRunner.run({
    platform: reviewerPlatform,
    model: reviewerModel,
    prompt,
    role: 'reviewer'
  });
}
```

---

## 🟠 HIGH ISSUE #6: State Persistence and Recovery

### Problem Statement
The Ralph Wiggum Model requires: *"Persisted state files. The agent must read/write state to files so new sessions can continue without chat history."*

Current implementation has basic state management but lacks robust recovery mechanisms.

### Gaps Identified

1. No atomic writes (corruption risk on crash)
2. No state versioning/history
3. No conflict detection for concurrent access
4. No checkpointing for long-running tasks

### Recommended Fix

```typescript
// Add to src/state/state-manager.ts
class AtomicStateManager {
  async write(state: State): Promise<void> {
    const tempPath = `${this.statePath}.tmp.${Date.now()}`;
    const backupPath = `${this.statePath}.backup`;

    // Write to temp file
    await fs.writeFile(tempPath, JSON.stringify(state, null, 2));

    // Verify write succeeded
    const verified = await fs.readFile(tempPath, 'utf-8');
    if (JSON.stringify(state) !== verified.trim()) {
      throw new StateWriteError('State verification failed');
    }

    // Atomic rename (backup old, rename new)
    if (await this.exists(this.statePath)) {
      await fs.rename(this.statePath, backupPath);
    }
    await fs.rename(tempPath, this.statePath);
  }

  async checkpoint(label: string): Promise<void> {
    const checkpointPath = `${this.stateDir}/checkpoints/${label}-${Date.now()}.json`;
    await fs.copyFile(this.statePath, checkpointPath);
  }

  async recover(): Promise<State> {
    // Try main state
    if (await this.exists(this.statePath)) {
      try {
        return await this.read(this.statePath);
      } catch (e) {
        console.warn('Main state corrupted, trying backup');
      }
    }

    // Try backup
    const backupPath = `${this.statePath}.backup`;
    if (await this.exists(backupPath)) {
      return await this.read(backupPath);
    }

    // Try latest checkpoint
    const checkpoints = await this.listCheckpoints();
    if (checkpoints.length > 0) {
      return await this.read(checkpoints[0]);
    }

    throw new StateRecoveryError('No recoverable state found');
  }
}
```

---

## 🟠 HIGH ISSUE #7: Scale-Specific Concerns

### Problem Statement
User noted: *"The big differences between our platform and the others are, we are working on a much larger scale. They only work on smaller tasks and features, we are trying to use this method to build much larger, complete platforms."*

Reference implementations target single features. This project needs enterprise-scale orchestration.

### Scale Challenges

1. **PRD Size**: Enterprise requirements docs can be 100+ pages
2. **Task Count**: Hundreds of tasks vs. dozens
3. **Iteration Count**: Thousands of iterations possible
4. **Duration**: Days/weeks vs. hours
5. **Platform Coordination**: Multiple platforms working in parallel

### Recommended Additions

1. **Hierarchical PRD Processing:**
```typescript
interface ScalablePRDProcessor {
  // Process large PRDs in stages
  async processLargePRD(requirements: string): Promise<PRD> {
    // Stage 1: Extract high-level structure
    const structure = await this.extractStructure(requirements);

    // Stage 2: Process each major section in parallel
    const sections = await Promise.all(
      structure.sections.map(s => this.processSection(s))
    );

    // Stage 3: Resolve cross-references
    const resolved = await this.resolveCrossReferences(sections);

    // Stage 4: Validate completeness
    await this.validateCompleteness(resolved, requirements);

    return resolved;
  }
}
```

2. **Parallel Task Execution:**
```typescript
interface ParallelExecutor {
  maxConcurrency: number;

  async executeParallel(tasks: Task[]): Promise<TaskResult[]> {
    // Group by dependency level
    const levels = this.topologicalSort(tasks);

    const results: TaskResult[] = [];
    for (const level of levels) {
      // Execute all tasks at same level in parallel
      const levelResults = await this.executeLevel(level, this.maxConcurrency);
      results.push(...levelResults);
    }

    return results;
  }
}
```

3. **Progress Persistence for Long Runs:**
```typescript
interface LongRunningProgress {
  // Persist progress every N iterations
  checkpointInterval: number;

  // Resume from specific checkpoint
  async resumeFrom(checkpointId: string): Promise<void>;

  // Generate progress report
  async generateReport(): Promise<ProgressReport>;
}
```

---

## 🟡 MEDIUM ISSUE #8: Error Recovery and Escalation

### Problem Statement
The Ralph Wiggum Model specifies: *"'Blocked' file: if the worker can't proceed, write a RALPH-BLOCKED.md describing what's blocking and what was tried."*

Current implementation lacks sophisticated escalation paths.

### Recommended Fix

```typescript
// Add escalation chain
interface EscalationChain {
  levels: EscalationLevel[];
}

interface EscalationLevel {
  trigger: EscalationTrigger;
  action: EscalationAction;
}

type EscalationTrigger =
  | { type: 'iteration_limit'; max: number }
  | { type: 'repeated_failure'; pattern: string; count: number }
  | { type: 'timeout'; durationMs: number }
  | { type: 'explicit_block' };

type EscalationAction =
  | { type: 'retry_with_different_model'; model: string }
  | { type: 'escalate_to_tier'; tier: TierType }
  | { type: 'create_blocked_file'; template: string }
  | { type: 'notify_human'; channel: string }
  | { type: 'pause_and_checkpoint' };
```

---

## 🟡 MEDIUM ISSUE #9: Verification Integration

### Problem Statement
Current verification is basic. Need robust integration with test runners, linters, and type checkers.

### Recommended Fix

```typescript
// Add to src/verification/verification-runner.ts
class VerificationRunner {
  async runVerifications(criteria: Criterion[]): Promise<VerificationReport> {
    const results: VerificationResult[] = [];

    for (const criterion of criteria) {
      const result = await this.runSingleVerification(criterion);
      results.push(result);

      // Fail-fast if configured
      if (!result.passed && this.config.failFast) {
        break;
      }
    }

    return {
      passed: results.every(r => r.passed),
      results,
      summary: this.generateSummary(results)
    };
  }

  private async runSingleVerification(criterion: Criterion): Promise<VerificationResult> {
    const [type, command] = this.parseVerifierToken(criterion.target);

    switch (type) {
      case 'TEST':
        return await this.runTestCommand(command);
      case 'CLI_VERIFY':
        return await this.runCliCommand(command);
      case 'FILE_VERIFY':
        return await this.verifyFileExists(command);
      case 'REGEX_VERIFY':
        return await this.verifyRegex(command);
      case 'AI_VERIFY':
        return await this.runAIVerification(command, criterion.description);
      default:
        throw new UnknownVerifierError(type);
    }
  }
}
```

---

## 🟡 MEDIUM ISSUE #10: Metrics and Observability

### Problem Statement
No comprehensive metrics for tracking efficiency, costs, or identifying bottlenecks.

### Recommended Fix

```typescript
// Add to src/metrics/metrics-collector.ts
interface OrchestratorMetrics {
  // Iteration metrics
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  averageIterationDurationMs: number;

  // Platform metrics per platform
  platformMetrics: Map<Platform, PlatformMetrics>;

  // Cost metrics
  estimatedTokensUsed: number;
  estimatedCostUSD: number;

  // Quality metrics
  firstPassSuccessRate: number;
  averageRevisionsPerSubtask: number;
  escalationRate: number;

  // Time metrics
  totalDurationMs: number;
  planningDurationMs: number;
  executionDurationMs: number;
  verificationDurationMs: number;
}

class MetricsCollector {
  private metrics: OrchestratorMetrics;

  recordIteration(result: IterationResult): void {
    this.metrics.totalIterations++;
    if (result.status === 'complete') {
      this.metrics.successfulIterations++;
    }
    // ... record all metrics
  }

  generateReport(): MetricsReport {
    return {
      summary: this.computeSummary(),
      charts: this.generateCharts(),
      recommendations: this.generateRecommendations()
    };
  }
}
```

---

## Implementation Priority Matrix

| Issue | Severity | Effort | Impact | Priority |
|-------|----------|--------|--------|----------|
| #1 PRD Parsing | 🔴 CRITICAL | High | Blocks everything | **P0** |
| #2 Manual Test Criteria | 🔴 CRITICAL | Medium | Core violation | **P0** |
| #3 CLI Communication | 🔴 CRITICAL | High | Reliability | **P0** |
| #4 Subtask Granularity | 🟠 HIGH | Medium | Quality | **P1** |
| #5 Worker/Reviewer Split | 🟠 HIGH | Medium | Quality | **P1** |
| #6 State Persistence | 🟠 HIGH | Medium | Reliability | **P1** |
| #7 Scale Architecture | 🟠 HIGH | High | Core capability | **P1** |
| #8 Error Escalation | 🟡 MEDIUM | Low | Resilience | **P2** |
| #9 Verification Integration | 🟡 MEDIUM | Medium | Automation | **P2** |
| #10 Metrics/Observability | 🟡 MEDIUM | Medium | Operations | **P2** |

---

## Recommendations Summary

### Immediate Actions (P0 - Do First)

1. **Replace rule-based PRD parsing with AI-driven extraction**
   - Add semantic chunking for large documents
   - Add validation layer to ensure coverage
   - Test with the user's "big requirements document" that failed

2. **Eliminate all manual acceptance criteria**
   - Add criterion type classification
   - Generate executable verification targets
   - Add validation that rejects `type: 'manual'`

3. **Implement structured CLI communication**
   - Add RALPH_STATUS block protocol
   - Add stream parser for platform output
   - Add circuit breaker for platform calls

### Short-Term Actions (P1 - Next Sprint)

4. **Improve subtask generation** with semantic decomposition
5. **Implement worker/reviewer separation** with different models
6. **Add atomic state persistence** with recovery mechanisms
7. **Add scale-specific architecture** for large PRDs and parallel execution

### Medium-Term Actions (P2 - Following Sprints)

8. **Add escalation chain** for error recovery
9. **Enhance verification integration** with all verifier types
10. **Add comprehensive metrics** and observability

---

## Reference Implementation Patterns Worth Adopting

| Pattern | From | Benefit |
|---------|------|---------|
| RALPH_STATUS block | ralph-claude-code | Structured communication |
| Circuit breaker | ralph-claude-code | Fault tolerance |
| Subagent fan-out | ralph-playbook | Parallel processing |
| Checkbox tracking | ralph-wiggum-cursor | Progress visibility |
| Gutter detection | ralph-wiggum-cursor | Prevent infinite loops |
| 12-step orchestration | multi-agent-ralph-loop | Comprehensive workflow |
| Multi-model agents | multi-agent-ralph-loop | Role-specific optimization |
| Memory systems | multi-agent-ralph-loop | Learning across iterations |

---

## Conclusion

The concerns about this project's viability are **justified and actionable**. The three critical issues (PRD parsing, manual criteria, CLI control) must be addressed before the system can function as intended. The good news is that clear patterns exist in the reference implementations that can be adapted.

The project has a solid architectural foundation but requires significant enhancement of its parsing, verification, and communication subsystems to meet the Ralph Wiggum Model requirements and scale to enterprise platform development.

**Recommended Next Step:** Create a focused build queue targeting the P0 issues, with specific acceptance criteria that can be verified without manual testing.

---

## Addendum: Cross-Reference with Codex Review

After completing my initial analysis, I discovered that Codex has also performed a comprehensive review documented in [CodexsMajorImprovements.md](CodexsMajorImprovements.md). **Codex's review is extremely thorough and covers additional critical issues I did not initially identify.** Below I summarize the key additional findings from Codex and new bugs I discovered in the verification system.

---

## 🔴 ADDITIONAL CRITICAL ISSUES (From Codex + New Analysis)

### P0.11: Verification System Bugs (NEW - Not in Codex Review)

Deep analysis of the verification system revealed multiple bugs that will cause gates to fail incorrectly:

#### Bug 1: Missing Manual Verifier Implementation
**Location:** `src/core/container.ts` lines 169-173, `src/types/tiers.ts` line 18

```typescript
// tiers.ts allows 'manual' as a criterion type:
type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai';

// But container.ts only registers 5 verifiers (NO ManualVerifier):
// RegexVerifier, FileExistsVerifier, CommandVerifier, BrowserVerifier, AIVerifier
```

**Impact:** Any criterion with `type: 'manual'` will fail with "Verifier not found: manual" error in `gate-runner.ts` lines 102-110. Combined with the PRD generator defaulting all criteria to `type: 'manual'`, **every gate will fail by default**.

#### Bug 2: Aggregate Check Logic Error
**Location:** `src/verification/verification-integration.ts` lines 177-189

```typescript
// Line 185: Uses 'true'/'false' as shell commands
target: allPassed ? 'true' : 'false',
// Line 187: But expects exit code 0 always
expectedExitCode: 0,
```

**Problem:**
- When all children passed: `'true'` command → exit 0 → passes ✓
- When any child failed: `'false'` command → exit 1 → **expected 0, gets 1** → verification fails correctly BUT...
- This is also **not portable to Windows** where `true`/`false` commands don't exist

#### Bug 3: Gate ID Parsing Broken
**Location:** `src/verification/gate-runner.ts` `saveEvidence()` method

```typescript
// Tries to detect tier type by checking if gateId starts with 'PH-'/'ST-'
// But actual gate IDs are: 'phase-gate-PH-001', 'task-gate-TK-...'
// The prefix check fails, causing evidence to be mislabeled
```

#### Bug 4: Evidence ID Mismatch
**Location:** `src/verification/verification-integration.ts` lines 110-126

- `convertTestCommandToCriterion()` generates IDs like `command-0`
- `EvidenceStore.getEvidence(itemId)` expects filenames starting with tier IDs (`PH-...`, `TK-...`)
- **Result:** Test logs are saved but can't be retrieved when browsing evidence for a tier

#### Bug 5: Missing Null Safety in Criteria Collection
**Location:** `src/verification/verification-integration.ts` `collectCriteria()`

```typescript
// No null check on tier.data.acceptanceCriteria
criteria.push(...tier.data.acceptanceCriteria);  // Will crash if undefined
```

#### Bug 6: Regex Verifier Missing Error Field
**Location:** `src/verification/verifiers/regex-verifier.ts` lines 133-139

When regex verification fails, no `error` field is populated in the result (unlike other verifiers), causing inconsistent error reporting.

---

### P0.12: GUI Not Wired to Real Start Chain (From Codex)

Codex identified that the GUI wizard does **not actually run the Start Chain pipeline**:

- `/api/wizard/save` only runs `StartChainPipeline` if `parsed` requirements are provided
- Browser client posts only `{ prd, architecture, tierPlan, projectPath }` (no `parsed`)
- **Result:** Users think they're running AI Start Chain, but only saving low-quality preview artifacts

### P0.13: WebSocket Event Name Mismatch (From Codex)

- Backend emits: `state_changed`, `output_chunk`, `iteration_started`, `iteration_completed`
- Frontend listens for: `state_change`, `output`, `iteration_start`
- **Result:** GUI appears "stuck" with no updates even when events are flowing

### P0.14: Orchestration Loop Internal Inconsistencies (From Codex)

1. **Prompt construction gap:** `ExecutionEngine.buildPrompt()` doesn't include acceptance criteria or test commands; the more complete `PromptBuilder` exists but isn't used
2. **Transcript capture race condition:** `BasePlatformRunner.getTranscript()` attaches new listeners to streams that may have already ended
3. **Empty filesChanged:** `ExecutionEngine` sets `filesChanged` to empty array; never integrates `OutputParser` results
4. **Silent commit failures:** `commitChanges()` bails if `filesChanged` is empty, leaving real changes uncommitted

### P0.15: Init Command Creates Invalid PRD (From Codex)

`puppet-master init` writes `.puppet-master/prd.json` as `{}` which is invalid for `PrdManager.load()` (requires `phases[]`). Commands that load PRD fail until `puppet-master plan` runs.

### P0.16: Schema/Type Drift (From Codex)

- `STATE_FILES.md` defines criterion types: `test`, `cli_verify`, `perf_verify`, `ai_verify`, etc.
- `prd-prompt.ts` asks AI to output those types
- But `src/types/tiers.ts` only allows: `'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai'`
- **Result:** AI can output "valid per prompt/spec" PRD JSON that runtime code cannot interpret

### P0.17: Platform Runner Timeout Issues (From Codex)

- `ExecutionEngine` implements hard timeout, but `BasePlatformRunner.execute()` ignores `request.timeout`/`request.hardTimeout`
- `ClaudeRunner` passes full prompt via `-p <prompt>` which can exceed OS command-line length limits for large prompts
- `CodexRunner` doesn't set approval policies; may stall in interactive flows

---

## Updated Priority Matrix (Combined)

| Issue | Source | Severity | Priority |
|-------|--------|----------|----------|
| PRD Parsing / H1 Title Bug | Both | 🔴 CRITICAL | **P0** |
| Manual Criteria Default | Both | 🔴 CRITICAL | **P0** |
| No Manual Verifier Registered | Claude NEW | 🔴 CRITICAL | **P0** |
| Schema/Type Drift | Codex | 🔴 CRITICAL | **P0** |
| GUI Not Wired to Start Chain | Codex | 🔴 CRITICAL | **P0** |
| WebSocket Event Mismatch | Codex | 🔴 CRITICAL | **P0** |
| Orchestration Loop Bugs | Codex | 🔴 CRITICAL | **P0** |
| Gate Evidence ID Mismatch | Claude NEW | 🟠 HIGH | **P1** |
| Init Creates Invalid PRD | Codex | 🟠 HIGH | **P1** |
| Platform Timeout Issues | Codex | 🟠 HIGH | **P1** |
| Aggregate Check Not Portable | Claude NEW | 🟡 MEDIUM | **P2** |

---

## Codex's Additional Recommendations Worth Highlighting

### Requirements Interview Step
Before generating PRD/architecture, generate qualifying questions:
- What information is still needed for objective acceptance criteria?
- What requirements are ambiguous/conflicting?
- What NFRs are missing (security, deployment, perf)?

### Multi-Pass PRD Build
1. Parse + normalize structure (H1-title flattening)
2. Build outline PRD with stable IDs and placeholders
3. Expand each phase/task in isolation (chunked prompts)
4. Run "AI coverage diff" pass
5. Run PRD quality validator

### Traceability Links
Add `sourceRefs: [{ sourcePath, sectionPath, excerptHash }]` to PRD items so you can answer:
- "Which PRD items cover Requirement 4.2?"
- "Which requirements are currently uncovered?"

### Git as First-Class Memory Layer
- Detect changes using `git status --porcelain` / `git diff --name-only` (not output parsing)
- Integrate `BranchStrategy` + `PRManager` into tier lifecycle
- Consider dedicated "git pusher" step after verifiers pass

### Start Chain Platform/Model Selection
Add `startChain` routing to config:
```yaml
startChain:
  requirementsInterview: { platform: claude, model: opus }
  prd: { platform: codex, model: gpt-4 }
  architecture: { platform: claude, model: sonnet }
  validationReview: { platform: claude, model: opus }
```

---

## Final Consolidated Build Queue

Based on both reviews, the recommended build order is:

1. **Schema Alignment** - Unify `STATE_FILES.md` ↔ `src/types/*` ↔ prompt schemas ↔ verifier registry
2. **Start Chain v2** - Normalize headings + coverage gate + fail-fast + no-manual enforcement
3. **Verification System Fixes** - Register all verifiers, fix evidence IDs, portable aggregate checks
4. **Execution Loop Correctness** - Unify prompt builder, transcript capture, result parsing
5. **GUI Wiring** - Connect wizard to real Start Chain, fix WebSocket event names
6. **Per-Tier Platform Routing** - Choose runner/model per tier plan
7. **Init Command Fix** - Create schema-valid empty PRD scaffold

---

## Acknowledgments

This document should be read in conjunction with:
- [CodexsMajorImprovements.md](CodexsMajorImprovements.md) - Codex's comprehensive review (highly detailed, covers additional P0 issues)
- [PHASE_5_REVIEW.md](PHASE_5_REVIEW.md) - Phase 5 implementation review
- [RalphInfo/RalphReview.md](RalphInfo/RalphReview.md) - Original Ralph Wiggum Model specification

**Bottom Line:** The project requires significant work on Start Chain, verification, and orchestration before it can reliably build complete platforms. The architectural foundation is sound, but implementation gaps create multiple P0 blockers that must be resolved.

---

## Addendum 2: New Reference Projects Analysis (2026-01-20)

After analyzing **Zeroshot** and **Codex-Weave-Weave**, two additional reference implementations, I've identified critical patterns and a major discovery about our git implementation.

---

## 🔴 CRITICAL ISSUE: Git Infrastructure Exists But Is Almost Completely Unused

### The Discovery

RWM Puppet Master has **comprehensive git infrastructure** (555+ lines in GitManager, 322 lines in BranchStrategy, full CommitFormatter and PRManager) but **the orchestrator only uses ~30 lines of it**.

### What's Implemented vs. What's Used

| Component | Lines of Code | Used in Orchestrator |
|-----------|--------------|---------------------|
| GitManager | 555 | Only add(), commit(), getStatus(), getHeadSha() |
| BranchStrategy (3 strategies) | 322 | **NEVER instantiated** |
| CommitFormatter (6 tier types) | 122 | **NEVER called** (format hard-coded) |
| PRManager | 238 | **NEVER instantiated** |
| push() | Implemented | **NEVER called** |
| createBranch(), merge() | Implemented | **NEVER called** |
| stash(), stashPop() | Implemented | **NEVER called** |

### The Only Git Usage in Orchestrator (lines 825-858)

```typescript
// THIS IS ALL THE GIT THE ORCHESTRATOR DOES:
await this.deps.gitManager.add(['.']);
const message = `ralph: [subtask] ${subtask.id} ${subtask.data.title}`; // WRONG FORMAT
await this.deps.gitManager.commit({ message });
```

### What's Missing

1. **No branch isolation** - All work stays on single branch (never uses BranchStrategy)
2. **Wrong commit format** - Uses `ralph: [subtask]` instead of CommitFormatter's `ralph: ST-001-001-001`
3. **No gate commits** - handleGateResult() doesn't record outcomes in git
4. **No replan/reopen commits** - These operations happen but aren't tracked
5. **No push automation** - Never pushes to remote
6. **No PR creation** - PRManager exists but is never called
7. **No conflict handling** - Not implemented at all

### Why This Matters

The Ralph Wiggum Model specifies: *"Git as Memory - All commits with structured messages. Enables rollback, audit, and history review. Branch per configured strategy."*

Without proper git integration:
- ❌ No rollback capability
- ❌ No audit trail of tier completions
- ❌ No branch isolation for parallel work
- ❌ No PR workflow automation
- ❌ Can't resume from known checkpoints

### Recommended Fix

**Wire existing infrastructure into orchestrator:**

```typescript
// 1. Register BranchStrategy and CommitFormatter in container.ts
container.register('branchStrategy', (c) =>
  createBranchStrategy(config.git.branch, c.get('gitManager')), 'singleton');
container.register('commitFormatter', () => new CommitFormatter(), 'singleton');
container.register('prManager', () => new PRManager(projectPath), 'singleton');

// 2. Use BranchStrategy in orchestrator runLoop
const context = { phaseId, taskId, subtaskId, isComplete };
await this.deps.branchStrategy.ensureBranch(context);

// 3. Use CommitFormatter for all commits
const message = this.deps.commitFormatter.format({
  tier: 'iteration',
  itemId: subtask.id,
  summary: result.summary
});

// 4. Create gate commits in handleGateResult
const gateMessage = this.deps.commitFormatter.format({
  tier: 'phase_gate',
  itemId: tier.id,
  status: result.passed ? 'PASS' : 'FAIL'
});

// 5. Push and create PRs on task/phase completion
if (config.git.push.auto_push) {
  await this.deps.gitManager.push();
}
if (config.git.pr.enabled && tier.type === 'task') {
  await this.deps.prManager.createPR(...);
}
```

---

## Zeroshot Reference Implementation - Key Patterns

### Architecture Overview

Zeroshot uses a **message-driven multi-agent orchestration** model that differs significantly from Ralph Wiggum:

| Aspect | Ralph Wiggum | Zeroshot |
|--------|--------------|----------|
| Coordination | Direct agent control | Event-driven pub/sub via SQLite ledger |
| Persistence | In-memory state | SQLite immutable event log |
| Isolation | Directory modes | Git worktrees + Docker containers |
| Agent Model | Sequential execution | Parallel validators + iterative loops |
| Complexity Routing | Manual planning | 2D classification auto-selects workflow |

### Pattern 1: 2D Complexity Classification

```javascript
// Complexity × TaskType → Workflow Template
getConfig(complexity, taskType) {
  // TRIVIAL → level1 (cheapest model)
  // CRITICAL → level3 (most capable model)
  // Returns appropriate template: single-worker, worker-validator, full-workflow
}
```

**Benefit:** Auto-select appropriate agent topology based on task complexity.

### Pattern 2: Acceptance Criteria as Executable Contracts

```json
{
  "id": "AC1",
  "criterion": "Toggle dark mode → all text readable (contrast >4.5:1)",
  "verification": "./verify-dark-mode.sh",
  "priority": "MUST"
}
```

**Benefit:** Forces concrete, testable acceptance criteria with explicit verification commands.

### Pattern 3: Blind Validators

Validators receive:
- Issue description
- Implementation result

Validators DON'T receive:
- Worker's debug logs
- Planning rationale
- Other validators' feedback

**Benefit:** Prevents validators from anchoring on worker's claims.

### Pattern 4: Git Worktree Isolation

```javascript
// Fast parallel work setup (~1s)
this.worktrees = new Map(); // clusterId -> { path, branch, repoRoot }
// Each agent gets isolated worktree
// Merge back only after gates pass
```

**Benefit:** Enables safe parallel agent work without file conflicts.

### Pattern 5: SQLite Ledger for Crash Recovery

```javascript
this.db.pragma('journal_mode = WAL');  // Write-ahead logging
// All state persisted to ~/.zeroshot/<cluster-id>.db
// Resume: zeroshot resume <id>
```

**Benefit:** Crash recovery, audit trail, query API for state inspection.

### Pattern 6: WIP Commits Instead of Git Stash

```bash
❌ FORBIDDEN: git stash          # Hides work from other agents
✅ CORRECT:   git add -A && git commit -m "WIP: feature X"
```

**Benefit:** Nothing hidden, all work visible, squashable before merge.

---

## Codex-Weave Reference Implementation - Key Patterns

### Architecture Overview

Codex-Weave adds **native agent-to-agent coordination** through a persistent, shared session system using Rust + TypeScript.

### Pattern 1: Envelope-Based Message Protocol

```rust
struct WeaveEnvelope {
    v: u8,           // version
    type: String,    // operation type
    id: String,      // unique message id
    ts: String,      // RFC3339 timestamp
    src: String,     // sender agent id
    dst: Option<String>,  // recipient (None = broadcast)
    session: Option<String>,
    seq: Option<u64>,     // sequence number
    corr: Option<String>, // correlation id for request/response
    payload: Option<Value>,
}
```

**Benefit:** Versioned, correlatable, idempotent message passing.

### Pattern 2: Loop Guards (Deterministic)

```rust
pub fn allow_relay(&self, message: &WeaveMessage) -> bool {
    if self.config.suppress_reply_relay &&
       message.kind == WeaveMessageKind::Reply {
        return false;
    }
    !matches!(message.kind, WeaveMessageKind::Control | WeaveMessageKind::System)
}
```

**Benefit:** Prevents infinite ping-pong loops without timers/exponential backoff.

### Pattern 3: Dual Transport (UDS + HTTP)

```
weave-transport-uds/  → Unix sockets for local coordination (fast)
weave-transport-http/ → REST + SSE for UI integration (standard)
weave-runtime/        → Pure state machine (transport-agnostic)
```

**Benefit:** Fast local communication, standard HTTP for remote/UI.

### Pattern 4: Weak References for Cycle Prevention

```rust
pub struct AgentControl {
    manager: Weak<ThreadManagerState>,  // Prevents Arc cycles
}
```

**Benefit:** Prevents memory leaks in manager↔agent relationships.

### Pattern 5: Headless Agent Drains

```rust
fn spawn_headless_drain(thread: Arc<CodexThread>) {
    tokio::spawn(async move {
        loop {
            match thread.next_event().await {
                Ok(_) => {},  // Discard event
                Err(_) => break,
            }
        }
    });
}
```

**Benefit:** Prevents unbounded queue growth when no UI attached.

### Pattern 6: SSE Streaming for Real-Time UI

```rust
// GET /api/sessions/{id}/events/stream
// Server-Sent Events for live updates
```

**Benefit:** Real-time event propagation to GUI without polling.

---

## Recommendations Based on New Reference Projects

### 1. Adopt Acceptance Criteria as Executable Contracts

Replace vague criteria with:
```typescript
interface ExecutableCriterion {
  id: string;
  criterion: string;           // Human-readable description
  verification: string;        // "./scripts/verify.sh" or "npm test -- --grep='auth'"
  priority: 'MUST' | 'SHOULD' | 'COULD';
  timeout?: number;
}
```

### 2. Implement Git Worktree Isolation for Parallel Work

```typescript
class WorktreeManager {
  async createWorktree(agentId: string, branchName: string): Promise<string>;
  async destroyWorktree(agentId: string): Promise<void>;
  async mergeWorktree(agentId: string, targetBranch: string): Promise<MergeResult>;
}
```

### 3. Add SQLite-Based Event Ledger

```typescript
class EventLedger {
  async append(event: OrchestratorEvent): Promise<void>;
  async query(filter: EventFilter): Promise<OrchestratorEvent[]>;
  async getLastEvent(type: string): Promise<OrchestratorEvent | null>;
  async recover(): Promise<OrchestrationState>;
}
```

### 4. Implement Loop Guards for Multi-Agent Coordination

```typescript
class LoopGuard {
  private recentMessages: Map<string, number>; // hash -> count

  shouldRelay(message: AgentMessage): boolean {
    // Deterministic rules, not timeouts
    if (message.kind === 'reply' && this.config.suppressReplyRelay) return false;
    if (message.kind === 'control' || message.kind === 'system') return false;

    // Detect ping-pong (same message hash seen 3+ times)
    const hash = this.hashMessage(message);
    const count = this.recentMessages.get(hash) || 0;
    if (count >= 3) return false;

    this.recentMessages.set(hash, count + 1);
    return true;
  }
}
```

### 5. Add Complexity-Based Model Selection

```yaml
# config.yaml
complexity_routing:
  trivial:
    model_level: level1  # Cheapest (Haiku/GPT-3.5)
    max_iterations: 2
  simple:
    model_level: level1
    max_iterations: 3
  standard:
    model_level: level2  # Balanced (Sonnet/GPT-4)
    max_iterations: 5
  critical:
    model_level: level3  # Most capable (Opus/GPT-4-Turbo)
    max_iterations: 8
```

---

## Revised Final Build Queue (With New Findings)

Based on all reviews (Claude, Codex, Zeroshot, Codex-Weave), the prioritized build order is:

### P0 - Critical (Must Fix First)

1. **Wire existing git infrastructure** - BranchStrategy, CommitFormatter, PRManager into orchestrator
2. **Schema alignment** - Unify STATE_FILES.md ↔ types ↔ prompts ↔ verifiers
3. **No-manual enforcement** - Validator rejects manual criteria; generate executable verification
4. **Start Chain v2** - H1-title normalization, coverage gate, multi-pass PRD build
5. **Verification system fixes** - Register all verifiers, fix evidence IDs

### P1 - High Priority

6. **Execution loop correctness** - Unify prompt builder, fix transcript capture
7. **GUI wiring** - Connect wizard to real Start Chain, fix WebSocket event names
8. **Start Chain platform selectability** - Add `startChain:` config section
9. **SQLite event ledger** - Crash recovery, audit trail (from Zeroshot)

### P2 - Important

10. **Parallel execution** - Git worktrees, concurrent task execution
11. **Loop guards** - Deterministic relay suppression (from Codex-Weave)
12. **Acceptance criteria as contracts** - Executable verification (from Zeroshot)
13. **Installer v1** - Embedded Node + app directory approach

---

## Summary of All Review Sources

| Source | Focus | Key Contribution |
|--------|-------|------------------|
| Claude's Review | PRD parsing, manual criteria, CLI control | Initial P0 identification |
| Codex's Review | GUI wiring, schema drift, orchestration bugs | Deep implementation issues |
| Verification Analysis | Gate runner bugs, evidence ID mismatch | Runtime failure modes |
| Zeroshot Analysis | Parallel execution, acceptance criteria, git worktrees | Multi-agent patterns |
| Codex-Weave Analysis | Loop guards, message protocol, SSE streaming | Coordination patterns |
| Git Analysis | Unused infrastructure discovery | Major wiring gap |

**Total P0 Issues Identified: 17+**
**Total Lines of Unused Code: 1,000+ (git infrastructure alone)**
