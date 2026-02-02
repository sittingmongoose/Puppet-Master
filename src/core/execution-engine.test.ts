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

function createIterationContext(iterationNumber: number, overrides?: Partial<IterationContext>): IterationContext {
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
    ...overrides,
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

  it('populates ExecutionRequest.model from IterationContext.model', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: () => fromArray(['<ralph>COMPLETE</ralph>']),
      transcriptForSpawn: () => '<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const context = createIterationContext(1);
    context.model = 'claude-3-opus-20240229';
    await engine.spawnIteration(context);

    const request = runner.spawnFreshProcess.mock.calls[0]?.[0];
    expect(request).toBeTruthy();
    expect(request!.model).toBe('claude-3-opus-20240229');
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

  it('runs plan then execution pass when planMode enabled for claude', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: (pid) =>
        fromArray(
          pid === 10_000 ? ['Plan step', '<ralph>COMPLETE</ralph>'] : ['Executed', '<ralph>COMPLETE</ralph>']
        ),
      transcriptForSpawn: (pid) =>
        pid === 10_000 ? 'Plan step\n<ralph>COMPLETE</ralph>' : 'Executed\n<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const context = createIterationContext(1, {
      platform: 'claude',
      planMode: true,
      permissionMode: 'plan',
    });
    const result = await engine.spawnIteration(context);

    expect(runner.spawnFreshProcess).toHaveBeenCalledTimes(2);

    const planCall = runner.spawnFreshProcess.mock.calls[0]?.[0];
    expect(planCall?.planMode).toBe(true);
    expect(planCall?.permissionMode).toBe('plan');
    expect(planCall?.prompt).toContain('PLAN MODE - READ ONLY');

    const executionCall = runner.spawnFreshProcess.mock.calls[1]?.[0];
    expect(executionCall?.planMode).toBe(false);
    expect(executionCall?.permissionMode).toBeUndefined();
    expect(executionCall?.prompt).toContain('EXECUTE THE APPROVED PLAN:');
    expect(executionCall?.prompt).toContain('Plan step');

    expect(result.output).toContain('=== PLAN PASS ===');
    expect(result.output).toContain('=== EXECUTION PASS ===');
  });

  it('runs plan then execution pass for copilot without plan flag', async () => {
    const runner = createMockRunner({
      stdoutForSpawn: (pid) =>
        fromArray(
          pid === 10_000 ? ['Copilot plan', '<ralph>COMPLETE</ralph>'] : ['Copilot exec', '<ralph>COMPLETE</ralph>']
        ),
      transcriptForSpawn: (pid) =>
        pid === 10_000 ? 'Copilot plan\n<ralph>COMPLETE</ralph>' : 'Copilot exec\n<ralph>COMPLETE</ralph>',
    });

    const engine = new ExecutionEngine(createBaseConfig());
    engine.setRunner(runner);

    const context = createIterationContext(1, {
      platform: 'copilot',
      planMode: true,
    });
    await engine.spawnIteration(context);

    expect(runner.spawnFreshProcess).toHaveBeenCalledTimes(2);

    const planCall = runner.spawnFreshProcess.mock.calls[0]?.[0];
    expect(planCall?.planMode).toBe(false);
    expect(planCall?.prompt).toContain('PLAN MODE - READ ONLY');
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

  describe('killAgentOnFailure', () => {
    it('kills failed iteration when killAgentOnFailure is true (default)', async () => {
      const runner = createMockRunner({
        stdoutForSpawn: () => fromArray(['<ralph>GUTTER</ralph>']),
        transcriptForSpawn: () => '<ralph>GUTTER</ralph>',
      });

      const engine = new ExecutionEngine(createBaseConfig({ killAgentOnFailure: true }));
      engine.setRunner(runner);

      const result = await engine.spawnIteration(createIterationContext(1));

      expect(result.success).toBe(false);
      expect(result.completionSignal).toBe('GUTTER');
      expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
      expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
    });

    it('kills failed iteration when killAgentOnFailure is undefined (defaults to true)', async () => {
      const runner = createMockRunner({
        stdoutForSpawn: () => fromArray(['<ralph>GUTTER</ralph>']),
        transcriptForSpawn: () => '<ralph>GUTTER</ralph>',
      });

      const engine = new ExecutionEngine(createBaseConfig());
      engine.setRunner(runner);

      const result = await engine.spawnIteration(createIterationContext(1));

      expect(result.success).toBe(false);
      expect(result.completionSignal).toBe('GUTTER');
      expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
      expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
    });

    it('keeps failed iteration alive when killAgentOnFailure is false', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const runner = createMockRunner({
        stdoutForSpawn: () => fromArray(['<ralph>GUTTER</ralph>']),
        transcriptForSpawn: () => '<ralph>GUTTER</ralph>',
      });

      const engine = new ExecutionEngine(createBaseConfig({ killAgentOnFailure: false }));
      engine.setRunner(runner);

      const result = await engine.spawnIteration(createIterationContext(1));

      expect(result.success).toBe(false);
      expect(result.completionSignal).toBe('GUTTER');
      expect(runner.terminateProcess).not.toHaveBeenCalled();
      expect(runner.forceKillProcess).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Agent kept alive for debugging')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('To kill manually:')
      );

      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });

    it('kills on timeout when killAgentOnFailure is true', async () => {
      vi.useFakeTimers();
      const runner = createMockRunner({
        stdoutForSpawn: () => neverEndingIterable(),
        transcriptForSpawn: () => '',
      });

      const engine = new ExecutionEngine(createBaseConfig({ hardTimeout: 50, killAgentOnFailure: true }));
      engine.setRunner(runner);

      const promise = engine.spawnIteration(createIterationContext(1));
      await vi.advanceTimersByTimeAsync(60);
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Hard timeout');
      expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
      expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
    });

    it('keeps alive on timeout when killAgentOnFailure is false', async () => {
      vi.useFakeTimers();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const runner = createMockRunner({
        stdoutForSpawn: () => neverEndingIterable(),
        transcriptForSpawn: () => '',
      });

      const engine = new ExecutionEngine(createBaseConfig({ hardTimeout: 50, killAgentOnFailure: false }));
      engine.setRunner(runner);

      const promise = engine.spawnIteration(createIterationContext(1));
      await vi.advanceTimersByTimeAsync(60);
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Hard timeout');
      expect(runner.terminateProcess).not.toHaveBeenCalled();
      expect(runner.forceKillProcess).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Agent kept alive for debugging (timeout)')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('To kill manually:')
      );

      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });

    it('kills on stall when killAgentOnFailure is true', async () => {
      const runner = createMockRunner({
        stdoutForSpawn: () => fromArray(['same', 'same', 'same']),
        transcriptForSpawn: () => 'same same same',
      });

      const engine = new ExecutionEngine(
        createBaseConfig({
          stallDetection: {
            enabled: true,
            noOutputTimeout: 10_000,
            identicalOutputThreshold: 3,
          },
          killAgentOnFailure: true,
        })
      );
      engine.setRunner(runner);

      const result = await engine.spawnIteration(createIterationContext(1));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Stall detected');
      expect(runner.terminateProcess).toHaveBeenCalledTimes(1);
      expect(runner.forceKillProcess).toHaveBeenCalledTimes(1);
    });

    it('keeps alive on stall when killAgentOnFailure is false', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const runner = createMockRunner({
        stdoutForSpawn: () => fromArray(['same', 'same', 'same']),
        transcriptForSpawn: () => 'same same same',
      });

      const engine = new ExecutionEngine(
        createBaseConfig({
          stallDetection: {
            enabled: true,
            noOutputTimeout: 10_000,
            identicalOutputThreshold: 3,
          },
          killAgentOnFailure: false,
        })
      );
      engine.setRunner(runner);

      const result = await engine.spawnIteration(createIterationContext(1));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Stall detected');
      expect(runner.terminateProcess).not.toHaveBeenCalled();
      expect(runner.forceKillProcess).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Agent kept alive for debugging (stall detected)')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('To kill manually:')
      );

      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });
});
