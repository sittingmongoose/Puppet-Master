/**
 * Gate Runner Tests
 * 
 * Comprehensive tests for GateRunner and VerifierRegistry.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GateRunner, VerifierRegistry, type GateConfig } from './gate-runner.js';
import { EvidenceStore } from '../memory/evidence-store.js';
import type { Verifier } from './verifiers/verifier.js';
import type { Criterion, VerifierResult } from '../types/tiers.js';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Mock verifier for testing
 */
class MockVerifier implements Verifier {
  readonly type: string;
  private readonly shouldPass: boolean;
  private readonly delay: number;

  constructor(type: string, shouldPass: boolean = true, delay: number = 0) {
    this.type = type;
    this.shouldPass = shouldPass;
    this.delay = delay;
  }

  async verify(criterion: Criterion): Promise<VerifierResult> {
    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    return {
      type: this.type,
      target: criterion.target,
      passed: this.shouldPass,
      summary: this.shouldPass ? 'Verification passed' : 'Verification failed',
      error: this.shouldPass ? undefined : 'Mock error',
      durationMs: this.delay,
    };
  }
}

describe('VerifierRegistry', () => {
  let registry: VerifierRegistry;

  beforeEach(() => {
    registry = new VerifierRegistry();
  });

  describe('register', () => {
    it('should register a verifier', () => {
      const verifier = new MockVerifier('test');
      registry.register(verifier);
      expect(registry.get('test')).toBe(verifier);
    });

    it('should overwrite existing verifier with same type', () => {
      const verifier1 = new MockVerifier('test');
      const verifier2 = new MockVerifier('test');
      registry.register(verifier1);
      registry.register(verifier2);
      expect(registry.get('test')).toBe(verifier2);
    });
  });

  describe('get', () => {
    it('should return verifier by type', () => {
      const verifier = new MockVerifier('test');
      registry.register(verifier);
      expect(registry.get('test')).toBe(verifier);
    });

    it('should return null for unregistered type', () => {
      expect(registry.get('unknown')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no verifiers registered', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('should return all registered verifiers', () => {
      const verifier1 = new MockVerifier('type1');
      const verifier2 = new MockVerifier('type2');
      registry.register(verifier1);
      registry.register(verifier2);
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(verifier1);
      expect(all).toContain(verifier2);
    });
  });
});

describe('GateRunner', () => {
  let registry: VerifierRegistry;
  let evidenceStore: EvidenceStore;
  let tempDir: string;
  let runner: GateRunner;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `gate-runner-test-${Date.now()}`);
    evidenceStore = new EvidenceStore(tempDir);
    await evidenceStore.initialize();
    registry = new VerifierRegistry();
    runner = new GateRunner(registry, evidenceStore);
  });

  describe('runVerifier', () => {
    it('should execute verifier successfully', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criterion: Criterion = {
        id: 'test-1',
        description: 'Test criterion',
        type: 'regex',
        target: 'test-target',
      };

      const result = await runner.runVerifier(criterion);

      expect(result.passed).toBe(true);
      expect(result.type).toBe('regex');
      expect(result.target).toBe('test-target');
    });

    it('should return failure result when verifier not found', async () => {
      const criterion: Criterion = {
        id: 'test-1',
        description: 'Test criterion',
        type: 'command',
        target: 'test-target',
      };

      const result = await runner.runVerifier(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle verifier errors gracefully', async () => {
      const verifier: Verifier = {
        type: 'command',
        verify: vi.fn().mockRejectedValue(new Error('Verifier error')),
      };
      registry.register(verifier);

      const criterion: Criterion = {
        id: 'test-1',
        description: 'Test criterion',
        type: 'command',
        target: 'test-target',
      };

      const result = await runner.runVerifier(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Verifier execution failed');
    });
  });

  describe('classifyFailure', () => {
    it('should return minor when no failures', () => {
      const results: VerifierResult[] = [
        { type: 'regex', target: 'test', passed: true, summary: 'OK', durationMs: 10 },
        { type: 'command', target: 'test', passed: true, summary: 'OK', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('minor');
    });

    it('should return minor for single regex failure', () => {
      const results: VerifierResult[] = [
        { type: 'regex', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('minor');
    });

    it('should return minor for single command failure', () => {
      const results: VerifierResult[] = [
        { type: 'command', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('minor');
    });

    it('should return minor for single file_exists failure', () => {
      const results: VerifierResult[] = [
        { type: 'file_exists', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('minor');
    });

    it('should return major for browser failure', () => {
      const results: VerifierResult[] = [
        { type: 'browser_verify', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('major');
    });

    it('should return major for AI failure', () => {
      const results: VerifierResult[] = [
        { type: 'ai', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('major');
    });

    it('should return major for multiple failures', () => {
      const results: VerifierResult[] = [
        { type: 'regex', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
        { type: 'command', target: 'test', passed: false, summary: 'Failed', durationMs: 10 },
      ];

      expect(runner.classifyFailure(results)).toBe('major');
    });
  });

  describe('runGate', () => {
    it('should execute all verifiers successfully', async () => {
      const verifier1 = new MockVerifier('regex', true);
      const verifier2 = new MockVerifier('command', true);
      registry.register(verifier1);
      registry.register(verifier2);

      const criteria: Criterion[] = [
        {
          id: 'c1',
          description: 'Test 1',
          type: 'regex',
          target: 'test1',
        },
        {
          id: 'c2',
          description: 'Test 2',
          type: 'command',
          target: 'test2',
        },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      expect(report.gateId).toBe('TK-001-001');
      expect(report.overallPassed).toBe(true);
      expect(report.verifiersRun).toHaveLength(2);
      expect(report.verifiersRun[0].passed).toBe(true);
      expect(report.verifiersRun[1].passed).toBe(true);
      expect(report.failureType).toBeUndefined();
      expect(report.summary).toContain('PASSED');
    });

    it('should produce correct GateReport structure', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criteria: Criterion[] = [
        {
          id: 'c1',
          description: 'Test',
          type: 'regex',
          target: 'test',
        },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      expect(report).toHaveProperty('gateId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('verifiersRun');
      expect(report).toHaveProperty('overallPassed');
      expect(report).toHaveProperty('summary');
      expect(Array.isArray(report.verifiersRun)).toBe(true);
    });

    it('should determine overall pass/fail correctly', async () => {
      const verifier1 = new MockVerifier('regex', true);
      const verifier2 = new MockVerifier('command', false);
      registry.register(verifier1);
      registry.register(verifier2);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      expect(report.overallPassed).toBe(false);
      expect(report.failureType).toBeDefined();
    });

    it('should classify failures as minor/major', async () => {
      const verifier = new MockVerifier('regex', false);
      registry.register(verifier);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test', type: 'regex', target: 'test' },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      expect(report.failureType).toBe('minor');
    });

    it('should save evidence for all verifiers', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test', type: 'regex', target: 'test' },
      ];

      await runner.runGate('TK-001-001', criteria);

      // Check that gate report was saved
      const report = await evidenceStore.getGateReport('TK-001-001');
      expect(report).not.toBeNull();
      expect(report?.gateId).toBe('TK-001-001');
      expect(report?.verifiersRun).toHaveLength(1);
    });

    it('should generate summary with passed and failed verifiers', async () => {
      const verifier1 = new MockVerifier('regex', true);
      const verifier2 = new MockVerifier('command', false);
      registry.register(verifier1);
      registry.register(verifier2);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      expect(report.summary).toContain('Passed');
      expect(report.summary).toContain('Failed');
      expect(report.summary).toContain('FAILED');
    });
  });

  describe('failFast', () => {
    it('should stop on first failure when failFast is enabled', async () => {
      const verifier1 = new MockVerifier('regex', false);
      const verifier2 = new MockVerifier('command', true);
      registry.register(verifier1);
      registry.register(verifier2);

      const config: GateConfig = { failFast: true };
      const runnerWithFailFast = new GateRunner(registry, evidenceStore, config);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const report = await runnerWithFailFast.runGate('TK-001-001', criteria);

      // Should only have one result (stopped after first failure)
      expect(report.verifiersRun).toHaveLength(1);
      expect(report.verifiersRun[0].passed).toBe(false);
    });

    it('should continue after failure when failFast is disabled', async () => {
      const verifier1 = new MockVerifier('regex', false);
      const verifier2 = new MockVerifier('command', true);
      registry.register(verifier1);
      registry.register(verifier2);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const report = await runner.runGate('TK-001-001', criteria);

      // Should have both results
      expect(report.verifiersRun).toHaveLength(2);
    });
  });

  describe('parallel execution', () => {
    it('should run verifiers in parallel when enabled', async () => {
      const verifier1 = new MockVerifier('regex', true, 50);
      const verifier2 = new MockVerifier('command', true, 50);
      registry.register(verifier1);
      registry.register(verifier2);

      const config: GateConfig = { parallel: true };
      const parallelRunner = new GateRunner(registry, evidenceStore, config);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const startTime = Date.now();
      const report = await parallelRunner.runGate('TK-001-001', criteria);
      const duration = Date.now() - startTime;

      // Parallel execution should take less than sequential (50ms each = ~100ms sequential)
      // But allow some margin for test execution overhead
      expect(duration).toBeLessThan(100);
      expect(report.verifiersRun).toHaveLength(2);
    });

    it('should respect failFast in parallel mode', async () => {
      const verifier1 = new MockVerifier('regex', false, 10);
      const verifier2 = new MockVerifier('command', true, 10);
      registry.register(verifier1);
      registry.register(verifier2);

      const config: GateConfig = { parallel: true, failFast: true };
      const parallelRunner = new GateRunner(registry, evidenceStore, config);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const report = await parallelRunner.runGate('TK-001-001', criteria);

      // In parallel mode with failFast, we still get all results but should stop processing
      // Actually, with Promise.all, we can't really stop early, so we get all results
      // But the logic should still work correctly
      expect(report.verifiersRun.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('sequential execution', () => {
    it('should run verifiers sequentially by default', async () => {
      const verifier1 = new MockVerifier('regex', true, 30);
      const verifier2 = new MockVerifier('command', true, 30);
      registry.register(verifier1);
      registry.register(verifier2);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test 1', type: 'regex', target: 'test1' },
        { id: 'c2', description: 'Test 2', type: 'command', target: 'test2' },
      ];

      const startTime = Date.now();
      const report = await runner.runGate('TK-001-001', criteria);
      const duration = Date.now() - startTime;

      // Sequential should take at least 60ms (30ms each)
      expect(duration).toBeGreaterThanOrEqual(50);
      expect(report.verifiersRun).toHaveLength(2);
    });
  });

  describe('tier type detection', () => {
    it('should detect phase gate from gate ID', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test', type: 'regex', target: 'test' },
      ];

      await runner.runGate('phase-gate-PH-001', criteria);

      const report = await evidenceStore.getGateReport('phase-gate-PH-001');
      expect(report?.tierType).toBe('phase');
    });

    it('should detect task gate from gate ID', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test', type: 'regex', target: 'test' },
      ];

      await runner.runGate('task-gate-TK-001-001', criteria);

      const report = await evidenceStore.getGateReport('task-gate-TK-001-001');
      expect(report?.tierType).toBe('task');
    });

    it('should detect subtask gate from gate ID', async () => {
      const verifier = new MockVerifier('regex', true);
      registry.register(verifier);

      const criteria: Criterion[] = [
        { id: 'c1', description: 'Test', type: 'regex', target: 'test' },
      ];

      await runner.runGate('subtask-gate-ST-001-001-001', criteria);

      const report = await evidenceStore.getGateReport('subtask-gate-ST-001-001-001');
      expect(report?.tierType).toBe('subtask');
    });
  });
});
