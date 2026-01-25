/**
 * Platform Router Tests
 * 
 * Tests for the PlatformRouter implementation.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T08 for implementation details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformRouter, NoPlatformAvailableError } from './platform-router.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { TierNode } from './tier-node.js';
import type { TierNodeData } from './tier-node.js';
import type { PuppetMasterConfig, Platform } from '../types/config.js';
import type { TierPlan } from '../types/tiers.js';
import { BasePlatformRunner } from '../platforms/base-runner.js';
import type { PlatformRunnerContract } from '../types/platforms.js';

describe('PlatformRouter', () => {
  let config: PuppetMasterConfig;
  let registry: PlatformRegistry;
  let router: PlatformRouter;
  let mockRunners: Map<Platform, PlatformRunnerContract>;

  beforeEach(() => {
    // Create mock config
    config = {
      project: { name: 'Test', workingDirectory: '.' },
      tiers: {
        phase: {
          platform: 'claude',
          model: 'opus-4.5',
          selfFix: false,
          maxIterations: 3,
          escalation: null,
        },
        task: {
          platform: 'codex',
          model: 'gpt-5.2-high',
          selfFix: true,
          maxIterations: 5,
          escalation: 'phase',
        },
        subtask: {
          platform: 'cursor',
          model: 'sonnet-4.5-thinking',
          selfFix: true,
          maxIterations: 10,
          escalation: 'task',
        },
        iteration: {
          platform: 'cursor',
          model: 'auto',
          planMode: true,
          selfFix: false,
          maxIterations: 3,
          escalation: 'subtask',
        },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{phase}/{task}',
        granularity: 'per-task',
        pushPolicy: 'per-subtask',
        mergePolicy: 'squash',
        autoPr: true,
      },
      verification: {
        browserAdapter: 'dev-browser',
        screenshotOnFailure: true,
        evidenceDirectory: '.puppet-master/evidence',
      },
      memory: {
        progressFile: 'progress.txt',
        agentsFile: 'AGENTS.md',
        prdFile: '.puppet-master/prd.json',
        multiLevelAgents: true,
        agentsEnforcement: {
          requireUpdateOnFailure: true,
          requireUpdateOnGotcha: true,
          gateFailsOnMissingUpdate: true,
          reviewerMustAcknowledge: true,
        },
      },
      budgets: {
        claude: { maxCallsPerRun: 5, maxCallsPerHour: 3, maxCallsPerDay: 10, cooldownHours: 5, fallbackPlatform: 'codex' },
        codex: { maxCallsPerRun: 50, maxCallsPerHour: 20, maxCallsPerDay: 100, fallbackPlatform: 'cursor' },
        cursor: { maxCallsPerRun: 'unlimited', maxCallsPerHour: 'unlimited', maxCallsPerDay: 'unlimited', fallbackPlatform: null },
        gemini: { maxCallsPerRun: 100, maxCallsPerHour: 'unlimited', maxCallsPerDay: 'unlimited', fallbackPlatform: 'copilot' },
        copilot: { maxCallsPerRun: 'unlimited', maxCallsPerHour: 'unlimited', maxCallsPerDay: 'unlimited', fallbackPlatform: 'gemini' },
      },
      budgetEnforcement: {
        onLimitReached: 'fallback',
        warnAtPercentage: 80,
        notifyOnFallback: true,
      },
      logging: { level: 'info', retentionDays: 30 },
      cliPaths: {
        cursor: 'cursor-agent',
        codex: 'codex',
        claude: 'claude',
        gemini: 'gemini',
        copilot: 'copilot',
      },
    };

    // Create mock runners
    mockRunners = new Map();
    const platforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
    for (const platform of platforms) {
      const mockRunner = {
        platform,
        sessionReuseAllowed: false,
        allowedContextFiles: [],
        defaultTimeout: 300000,
        hardTimeout: 1800000,
        spawnFreshProcess: vi.fn(),
        prepareWorkingDirectory: vi.fn(),
        cleanupAfterExecution: vi.fn(),
        terminateProcess: vi.fn(),
        forceKillProcess: vi.fn(),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
        getTranscript: vi.fn(),
        parseOutput: vi.fn(),
      } as unknown as PlatformRunnerContract;
      mockRunners.set(platform, mockRunner);
    }

    // Create registry and register mock runners
    registry = new PlatformRegistry();
    for (const [platform, runner] of mockRunners) {
      registry.register(platform, runner as BasePlatformRunner);
    }

    router = new PlatformRouter(config, registry);
  });

  function createMockTierNode(type: 'phase' | 'task' | 'subtask' | 'iteration', id: string): TierNode {
    const node = {
      id,
      type,
      data: {
        id,
        type,
        title: `Test ${type}`,
        description: `Test ${type} description`,
        plan: { id, title: `Test ${type}`, description: `Test ${type} description` },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      parent: null,
      children: [],
      stateMachine: {} as unknown as TierNode['stateMachine'],
      getState: () => 'pending' as const,
      getChildren: () => [],
      getPath: () => [],
      getPathString: () => id,
      addChild: vi.fn(),
      removeChild: vi.fn(),
      findChild: vi.fn(),
      findDescendant: vi.fn(),
      getAllDescendants: vi.fn().mockReturnValue([]),
      toJSON: vi.fn(),
    };
    return node as unknown as TierNode;
  }

  describe('selectPlatform', () => {
    it('should select correct platform for phase tier', () => {
      const tier = createMockTierNode('phase', 'PH-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result.platform).toBe('claude');
      expect(result.model).toBe('opus-4.5');
    });

    it('should select correct platform for task tier', () => {
      const tier = createMockTierNode('task', 'TK-001-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result.platform).toBe('codex');
      expect(result.model).toBe('gpt-5.2-high');
    });

    it('should select correct platform for subtask tier', () => {
      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result.platform).toBe('cursor');
      expect(result.model).toBe('sonnet-4.5-thinking');
    });

    it('should select correct platform for iteration tier', () => {
      const tier = createMockTierNode('iteration', 'IT-001-001-001-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result.platform).toBe('cursor');
      expect(result.model).toBe('auto');
      expect(result.planMode).toBe(true);
    });

    it('should use gate_review config for review actions', () => {
      config.tiers.gate_review = {
        platform: 'claude',
        model: 'sonnet',
        selfFix: false,
        maxIterations: 1,
        escalation: null,
      };
      router = new PlatformRouter(config, registry);

      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'review');
      expect(result.platform).toBe('claude');
      expect(result.model).toBe('sonnet');
    });

    it('should fall back to tier config if gate_review not specified', () => {
      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'review');
      expect(result.platform).toBe('cursor'); // Uses subtask config
    });

    it('should respect TierPlan platform override', () => {
      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const tierPlan = { platform: 'gemini' } as unknown as TierPlan;
      const result = router.selectPlatform(tier, 'execute', tierPlan);
      expect(result.platform).toBe('gemini');
    });

    it('should fall back when preferred platform unavailable', () => {
      // Remove cursor from registry
      registry.clear();
      registry.register('codex', mockRunners.get('codex') as BasePlatformRunner);
      registry.register('claude', mockRunners.get('claude') as BasePlatformRunner);
      router = new PlatformRouter(config, registry);

      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'execute');
      // Should fall back to codex (first in fallback chain for cursor)
      expect(result.platform).toBe('codex');
    });

    it('should throw error when no platforms available', () => {
      registry.clear();
      router = new PlatformRouter(config, registry);

      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      expect(() => router.selectPlatform(tier, 'execute')).toThrow(NoPlatformAvailableError);
    });

    it('should use fallback chain correctly', () => {
      // Test cursor → codex fallback
      registry.clear();
      registry.register('codex', mockRunners.get('codex') as BasePlatformRunner);
      router = new PlatformRouter(config, registry);

      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result.platform).toBe('codex');
    });

    it('should log platform selection', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      router.selectPlatform(tier, 'execute');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PlatformRouter] Selected platform: cursor')
      );
      consoleSpy.mockRestore();
    });

    it('should include all config fields in result', () => {
      const tier = createMockTierNode('task', 'TK-001-001');
      const result = router.selectPlatform(tier, 'execute');
      expect(result).toMatchObject({
        platform: 'codex',
        model: 'gpt-5.2-high',
        selfFix: true,
        maxIterations: 5,
        escalation: 'phase',
      });
    });

    it('should handle gate_review fallback when platform unavailable', () => {
      config.tiers.gate_review = {
        platform: 'cursor',
        model: 'sonnet',
        selfFix: false,
        maxIterations: 1,
        escalation: null,
      };
      registry.clear();
      registry.register('codex', mockRunners.get('codex') as BasePlatformRunner);
      router = new PlatformRouter(config, registry);

      const tier = createMockTierNode('subtask', 'ST-001-001-001');
      const result = router.selectPlatform(tier, 'review');
      // Should fall back from cursor to codex
      expect(result.platform).toBe('codex');
    });

    describe('P2-T05 complexity-based model routing', () => {
      function createSubtaskNode(input?: { title?: string; criteriaCount?: number }): TierNode {
        const title = input?.title ?? 'Test subtask';
        const description = 'Subtask description';
        const criteriaCount = input?.criteriaCount ?? 0;

        const data: TierNodeData = {
          id: 'ST-001-001-001',
          type: 'subtask',
          title,
          description,
          plan: { id: 'ST-001-001-001', title, description },
          acceptanceCriteria: Array.from({ length: criteriaCount }, (_, i) => ({
            id: `AC-${i + 1}`,
            description: `Criterion ${i + 1}`,
            type: 'regex',
            target: 'noop',
          })),
          testPlan: { commands: [], failFast: false },
          evidence: [],
          iterations: 0,
          maxIterations: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return new TierNode(data);
      }

      beforeEach(() => {
        config.models = {
          level1: { platform: 'gemini', model: 'L1' },
          level2: { platform: 'codex', model: 'L2' },
          level3: { platform: 'claude', model: 'L3' },
        };
        // Keep default complexityRouting in place (falls back to built-in matrix if unset).
        router = new PlatformRouter(config, registry);
      });

      it('routes subtask execute based on complexity×taskType when models configured', () => {
        const tier = createSubtaskNode({ title: 'Add feature', criteriaCount: 0 }); // trivial/feature -> level1
        const result = router.selectPlatform(tier, 'execute');
        expect(result.platform).toBe('gemini');
        expect(result.model).toBe('L1');
      });

      it('respects TierPlan modelLevel override for subtask execute', () => {
        const tier = createSubtaskNode({ title: 'Add feature', criteriaCount: 0 });
        const tierPlan: TierPlan = { id: tier.id, title: 'Plan', description: 'Plan', modelLevel: 'level3' };
        const result = router.selectPlatform(tier, 'execute', tierPlan);
        expect(result.platform).toBe('claude');
        expect(result.model).toBe('L3');
      });

      it('falls back when routed platform is unavailable, preserving model string', () => {
        // Route level1 to cursor, but make cursor unavailable.
        config.models = {
          level1: { platform: 'cursor', model: 'L1' },
          level2: { platform: 'codex', model: 'L2' },
          level3: { platform: 'claude', model: 'L3' },
        };
        registry.clear();
        registry.register('codex', mockRunners.get('codex') as BasePlatformRunner);
        registry.register('claude', mockRunners.get('claude') as BasePlatformRunner);
        router = new PlatformRouter(config, registry);

        const tier = createSubtaskNode({ title: 'Add feature', criteriaCount: 0 }); // trivial/feature -> level1 (cursor)
        const result = router.selectPlatform(tier, 'execute');
        expect(result.platform).toBe('codex'); // cursor -> codex fallback
        expect(result.model).toBe('L1'); // model preserved from level1
      });
    });
  });
});
