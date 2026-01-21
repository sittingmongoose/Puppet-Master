/**
 * Tests for ExecutionEngine
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { PassThrough } from 'stream';
import type { PlatformRunnerContract, RunningProcess } from '../types/index.js';
import type { ExecutionConfig, IterationContext } from './execution-engine.js';
import { ExecutionEngine } from './execution-engine.js';
import { TierNode } from './tier-node.js';
import type { Criterion, TestPlan, TierPlan } from '../types/tiers.js';
import type { AgentsContent } from '../memory/agents-manager.js';
import type { ProgressEntry } from '../memory/progress-manager.js';

function createIterationContext(iterationNumber: number): IterationContext {
  const tierNode = createSubtaskNode();
  const subtaskPlan: TierPlan = {
    id: tierNode.id,
    title: tierNode.data.title,
    description: tierNode.data.description,
    approach: tierNode.data.plan.approach,
    dependencies: tierNode.data.plan.dependencies,
  };

  return {
    tierNode,
    iterationNumber,
    maxIterations: tierNode.data.maxIterations,
    projectPath: '.',
    projectName: 'Test Project',
    sessionId: 'PM-2026-01-10-14-00-00-001',
    platform: 'codex',
    progressEntries: [] satisfies ProgressEntry[],
    agentsContent: [] satisfies AgentsContent[],
    subtaskPlan,
  };
}

function createSubtaskNode(): TierNode {
  const now = new Date().toISOString();

  const emptyTestPlan: TestPlan = { commands: [], failFast: true };

  const phasePlan: TierPlan = { id: 'PH-001', title: 'Sample phase', description: 'Phase description' };
  const taskPlan: TierPlan = { id: 'TK-001-001', title: 'Sample task', description: 'Task description' };
  const subtaskPlan: TierPlan = {
    id: 'ST-001-001-001',
    title: 'Sample subtask',
    description: 'Do the thing',
    approach: ['Step 1', 'Step 2'],
    dependencies: [],
  };

  const acceptanceCriteria: Criterion[] = [
    {
      id: 'ST-001-001-001-AC-001',
      description: 'Meets the acceptance requirement',
      type: 'regex',
      target: 'some-pattern',
    },
  ];

  const testPlan: TestPlan = {
    commands: [{ command: 'npm', args: ['test'], workingDirectory: '.', timeout: 60_000 }],
    failFast: true,
  };

  const phase = new TierNode(
    {
      id: 'PH-001',
      type: 'phase',
      title: 'Sample phase',
      description: 'Phase description',
      plan: phasePlan,
      acceptanceCriteria: [],
      testPlan: emptyTestPlan,
      evidence: [],
      iterations: 0,
      maxIterations: 1,
      createdAt: now,
      updatedAt: now,
    },
    undefined
  );

  const task = new TierNode(
    {
      id: 'TK-001-001',
      type: 'task',
      title: 'Sample task',
      description: 'Task description',
      plan: taskPlan,
      acceptanceCriteria: [],
      testPlan: emptyTestPlan,
      evidence: [],
      iterations: 0,
      maxIterations: 1,
      createdAt: now,
      updatedAt: now,
    },
    phase
  );

  const subtask = new TierNode(
    {
      id: 'ST-001-001-001',
      type: 'subtask',
      title: 'Sample subtask',
      description: 'Do the thing',
      plan: subtaskPlan,
      acceptanceCriteria,
      testPlan,
      evidence: [],
      iterations: 0,
      maxIterations: 3,
      createdAt: now,
      updatedAt: now,
    },
    task
  );

  return subtask;
}

function createBaseConfig(overrides?: Partial<ExecutionConfig>): ExecutionConfig {
  return {
    defaultTimeout: 1_000,
    hardTimeout: 2_000,
    stallDetection: {
      enabled: true,
      noOutputTimeout: 5_000,
      identicalOutputThreshold: 3,
    },
    ...overrides,
  };
}

async function* fromArray(chunks: string[]): AsyncIterable<string> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

function emptyIterable(): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<string> {
      return {
        next: async () => ({ value: undefined, done: true }),
      };
    },
  };
}

function neverEndingIterable(): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<string> {
      return {
        next: async () => new Promise<IteratorResult<string>>(() => undefined),
      };
    },
  };
}

function createRunningProcess(pid: number): RunningProcess {
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  return {
    pid,
    platform: 'codex',
    startedAt: new Date().toISOString(),
    stdin,
    stdout,
    stderr,
  };
}

function createMockRunner(options: {
  stdoutForSpawn?: (pid: number) => AsyncIterable<string>;
  stderrForSpawn?: (pid: number) => AsyncIterable<string>;
  transcriptForSpawn?: (pid: number) => string;
}): PlatformRunnerContract & { spawnFreshProcess: ReturnType<typeof vi.fn> } {
  let nextPid = 10_000;
  const stdoutByPid = new Map<number, AsyncIterable<string>>();
  const stderrByPid = new Map<number, AsyncIterable<string>>();
  const transcriptByPid = new Map<number, string>();

  const spawnFreshProcess = vi.fn(async () => {
    const pid = nextPid++;
    stdoutByPid.set(pid, options.stdoutForSpawn?.(pid) ?? emptyIterable());
    stderrByPid.set(pid, options.stderrForSpawn?.(pid) ?? emptyIterable());
    transcriptByPid.set(pid, options.transcriptForSpawn?.(pid) ?? '');
    return createRunningProcess(pid);
  });

  const runner: PlatformRunnerContract & { spawnFreshProcess: ReturnType<typeof vi.fn> } = {
    platform: 'codex',
    sessionReuseAllowed: false,
    allowedContextFiles: [],
    defaultTimeout: 1_000,
    hardTimeout: 2_000,
    spawnFreshProcess,
    prepareWorkingDirectory: vi.fn(async () => undefined),
    cleanupAfterExecution: vi.fn(async () => undefined),
    terminateProcess: vi.fn(async () => undefined),
    forceKillProcess: vi.fn(async () => undefined),
    captureStdout: vi.fn((pid: number) => stdoutByPid.get(pid) ?? emptyIterable()),
    captureStderr: vi.fn((pid: number) => stderrByPid.get(pid) ?? emptyIterable()),
    getTranscript: vi.fn(async (pid: number) => transcriptByPid.get(pid) ?? ''),
  };

  return runner;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('execution-engine', () => {
  it('spawnIteration creates a fresh process each time', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['hello', '<ralph>COMPLETE</ralph>']),
      transcriptForSpawn: () => 'hello<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const result1 = await engine.spawnIteration(createIterationContext(1));
    const result2 = await engine.spawnIteration(createIterationContext(2));

    expect(result1.processId).not.toBe(result2.processId);
    expect(runner.spawnFreshProcess).toHaveBeenCalledTimes(2);
  });

  it('builds prompts using PromptBuilder (includes acceptance criteria and test requirements)', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['<ralph>COMPLETE</ralph>']),
      transcriptForSpawn: () => '<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    await engine.spawnIteration(createIterationContext(1));

    const firstCall = runner.spawnFreshProcess.mock.calls[0]?.[0];
    expect(firstCall).toBeTruthy();
    expect(firstCall!.prompt).toContain('## Acceptance Criteria');
    expect(firstCall!.prompt).toContain('## Test Requirements');
    expect(firstCall!.prompt).toContain('ST-001-001-001-AC-001');
    expect(firstCall!.prompt).toContain('npm test');
  });

  it('includes previous failure info in the next iteration prompt', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['<ralph>GUTTER</ralph>']),
      transcriptForSpawn: () => '<ralph>GUTTER</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    await engine.spawnIteration(createIterationContext(1));
    await engine.spawnIteration(createIterationContext(2));

    const secondCall = runner.spawnFreshProcess.mock.calls[1]?.[0];
    expect(secondCall).toBeTruthy();
    expect(secondCall!.prompt).toContain('## Previous Iteration Failures (if any)');
    expect(secondCall!.prompt).toContain('Iteration 1:');
  });

  it('tracks process IDs for audit', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['<ralph>COMPLETE</ralph>']),
      transcriptForSpawn: () => '<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const result = await engine.spawnIteration(createIterationContext(1));

    const processes = engine.getRunningProcesses();
    expect(processes.some((process) => process.pid === result.processId)).toBe(true);
  });

  it('timeout triggers kill', async () => {
    vi.useFakeTimers();

    const runner = createMockRunner({
      stdoutForSpawn: () => neverEndingIterable(),
      transcriptForSpawn: () => '',
    });

    const engine = new ExecutionEngine(createBaseConfig({ hardTimeout: 50 }));
    engine.setRunner(runner);

    const promise = engine.spawnIteration(createIterationContext(1));
    await vi.advanceTimersByTimeAsync(60);
    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toContain('Hard timeout');
    expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
    expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
  });

  it('detects stall via identical output threshold', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['loop', 'loop', 'loop', 'more']),
      transcriptForSpawn: () => 'looplooploopmore',
    });

    const engine = new ExecutionEngine(
      createBaseConfig({
        stallDetection: {
          enabled: true,
          noOutputTimeout: 10_000,
          identicalOutputThreshold: 3,
        },
      })
    );
    engine.setRunner(runner);

    const result = await engine.spawnIteration(createIterationContext(1));

    expect(result.success).toBe(false);
    expect(result.error).toContain('Stall detected');
    expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
    expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
  });

  it('fires output and complete callbacks', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['hello', '<ralph>COMPLETE</ralph>']),
      transcriptForSpawn: () => 'hello<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const outputCallback = vi.fn();
    const completeCallback = vi.fn();
    engine.onOutput(outputCallback);
    engine.onComplete(completeCallback);

    const result = await engine.spawnIteration(createIterationContext(1));

    expect(outputCallback).toHaveBeenCalledWith('hello');
    expect(outputCallback).toHaveBeenCalledWith('<ralph>COMPLETE</ralph>');
    expect(completeCallback).toHaveBeenCalledTimes(1);
    expect(completeCallback).toHaveBeenCalledWith(result);
  });
});
