/**
 * Tests for ExecutionEngine
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { PassThrough } from 'stream';
import type { PlatformRunnerContract, RunningProcess } from '../types/index.js';
import type { ExecutionConfig, IterationContext } from './execution-engine.js';
import { ExecutionEngine } from './execution-engine.js';

function createIterationContext(iterationNumber: number): IterationContext {
  return {
    subtaskId: 'ST-001-001-001',
    taskId: 'TK-001-001',
    phaseId: 'PH-001',
    iterationNumber,
    projectPath: '.',
    progressContent: 'progress',
    agentsContent: ['agents'],
    subtaskPlan: {
      id: 'ST-001-001-001',
      title: 'Sample subtask',
      description: 'Do the thing',
      approach: ['Step 1', 'Step 2'],
      dependencies: [],
    },
  };
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

async function* emptyIterable(): AsyncIterable<string> {
  // intentionally empty
}

async function* neverEndingIterable(): AsyncIterable<string> {
  await new Promise<void>(() => undefined);
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
}): PlatformRunnerContract {
  let nextPid = 10_000;
  const stdoutByPid = new Map<number, AsyncIterable<string>>();
  const stderrByPid = new Map<number, AsyncIterable<string>>();
  const transcriptByPid = new Map<number, string>();

  const runner: PlatformRunnerContract = {
    platform: 'codex',
    sessionReuseAllowed: false,
    allowedContextFiles: [],
    defaultTimeout: 1_000,
    hardTimeout: 2_000,
    spawnFreshProcess: vi.fn(async () => {
      const pid = nextPid++;
      stdoutByPid.set(pid, options.stdoutForSpawn?.(pid) ?? emptyIterable());
      stderrByPid.set(pid, options.stderrForSpawn?.(pid) ?? emptyIterable());
      transcriptByPid.set(pid, options.transcriptForSpawn?.(pid) ?? '');
      return createRunningProcess(pid);
    }),
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

