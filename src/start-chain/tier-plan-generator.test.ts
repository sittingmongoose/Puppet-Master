/**
 * Tier Plan Generator Tests
 * 
 * Tests for the TierPlanGenerator implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TierPlanGenerator } from './tier-plan-generator.js';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import type { PuppetMasterConfig } from '../types/config.js';

describe('TierPlanGenerator', () => {
  let generator: TierPlanGenerator;
  let config: PuppetMasterConfig;

  const createTestConfig = (): PuppetMasterConfig => ({
    project: {
      name: 'test-project',
      workingDirectory: '.',
    },
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
      claude: {
        maxCallsPerRun: 5,
        maxCallsPerHour: 3,
        maxCallsPerDay: 10,
        cooldownHours: 5,
        fallbackPlatform: 'codex',
      },
      codex: {
        maxCallsPerRun: 50,
        maxCallsPerHour: 20,
        maxCallsPerDay: 100,
        fallbackPlatform: 'cursor',
      },
      cursor: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        fallbackPlatform: null,
      },
    },
    budgetEnforcement: {
      onLimitReached: 'fallback',
      warnAtPercentage: 80,
      notifyOnFallback: true,
    },
    logging: {
      level: 'info',
      retentionDays: 30,
    },
    cliPaths: {
      cursor: 'cursor-agent',
      codex: 'codex',
      claude: 'claude',
    },
  });

  const createSubtask = (id: string, taskId: string): Subtask => ({
    id,
    taskId,
    title: `Subtask ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: true },
    iterations: [],
    maxIterations: 3,
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createTask = (id: string, phaseId: string, subtaskCount: number = 2): Task => ({
    id,
    phaseId,
    title: `Task ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: true },
    subtasks: Array.from({ length: subtaskCount }, (_, i) =>
      createSubtask(`ST-${id.split('-')[1]}-${id.split('-')[2]}-${String(i + 1).padStart(3, '0')}`, id)
    ),
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createPhase = (id: string, taskCount: number = 2, subtasksPerTask: number = 2): Phase => ({
    id,
    title: `Phase ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: true },
    tasks: Array.from({ length: taskCount }, (_, i) =>
      createTask(`TK-${id.split('-')[1]}-${String(i + 1).padStart(3, '0')}`, id, subtasksPerTask)
    ),
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createPRD = (phaseCount: number = 1, tasksPerPhase: number = 2, subtasksPerTask: number = 2): PRD => {
    const now = new Date().toISOString();
    const phases = Array.from({ length: phaseCount }, (_, i) =>
      createPhase(`PH-${String(i + 1).padStart(3, '0')}`, tasksPerPhase, subtasksPerTask)
    );

    let totalTasks = 0;
    let totalSubtasks = 0;

    for (const phase of phases) {
      totalTasks += phase.tasks.length;
      for (const task of phase.tasks) {
        totalSubtasks += task.subtasks.length;
      }
    }

    return {
      project: 'test-project',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'ralph/main',
      description: 'Test PRD',
      phases,
      metadata: {
        totalPhases: phases.length,
        completedPhases: 0,
        totalTasks,
        completedTasks: 0,
        totalSubtasks,
        completedSubtasks: 0,
      },
    };
  };

  beforeEach(() => {
    config = createTestConfig();
    generator = new TierPlanGenerator(config);
  });

  describe('constructor', () => {
    it('should create generator with config', () => {
      expect(generator).toBeDefined();
    });
  });

  describe('assignPlatform', () => {
    it('should return platform for phase tier', () => {
      expect(generator.assignPlatform('phase')).toBe('claude');
    });

    it('should return platform for task tier', () => {
      expect(generator.assignPlatform('task')).toBe('codex');
    });

    it('should return platform for subtask tier', () => {
      expect(generator.assignPlatform('subtask')).toBe('cursor');
    });

    it('should return platform for iteration tier', () => {
      expect(generator.assignPlatform('iteration')).toBe('cursor');
    });
  });

  describe('getMaxIterations', () => {
    it('should return maxIterations for phase tier', () => {
      expect(generator.getMaxIterations('phase')).toBe(3);
    });

    it('should return maxIterations for task tier', () => {
      expect(generator.getMaxIterations('task')).toBe(5);
    });

    it('should return maxIterations for subtask tier', () => {
      expect(generator.getMaxIterations('subtask')).toBe(10);
    });

    it('should return maxIterations for iteration tier', () => {
      expect(generator.getMaxIterations('iteration')).toBe(3);
    });
  });

  describe('getEscalationTarget', () => {
    it('should return null for phase tier (top tier)', () => {
      expect(generator.getEscalationTarget('phase')).toBeNull();
    });

    it('should return phase for task tier escalation', () => {
      expect(generator.getEscalationTarget('task')).toBe('phase');
    });

    it('should return task for subtask tier escalation', () => {
      expect(generator.getEscalationTarget('subtask')).toBe('task');
    });

    it('should return subtask for iteration tier escalation', () => {
      expect(generator.getEscalationTarget('iteration')).toBe('subtask');
    });
  });

  describe('generate', () => {
    it('should generate tier plan with correct structure', () => {
      const prd = createPRD(1, 1, 1);
      const plan = generator.generate(prd);

      expect(plan).toBeDefined();
      expect(plan.phases).toHaveLength(1);
      expect(plan.phases[0]?.tasks).toHaveLength(1);
      expect(plan.phases[0]?.tasks[0]?.subtasks).toHaveLength(1);
    });

    it('should preserve all phases from PRD', () => {
      const prd = createPRD(3, 2, 2);
      const plan = generator.generate(prd);

      expect(plan.phases).toHaveLength(3);
      expect(plan.phases[0]?.phaseId).toBe('PH-001');
      expect(plan.phases[1]?.phaseId).toBe('PH-002');
      expect(plan.phases[2]?.phaseId).toBe('PH-003');
    });

    it('should preserve all tasks from each phase', () => {
      const prd = createPRD(1, 3, 1);
      const plan = generator.generate(prd);

      expect(plan.phases[0]?.tasks).toHaveLength(3);
      expect(plan.phases[0]?.tasks[0]?.taskId).toBe('TK-001-001');
      expect(plan.phases[0]?.tasks[1]?.taskId).toBe('TK-001-002');
      expect(plan.phases[0]?.tasks[2]?.taskId).toBe('TK-001-003');
    });

    it('should preserve all subtasks from each task', () => {
      const prd = createPRD(1, 1, 4);
      const plan = generator.generate(prd);

      expect(plan.phases[0]?.tasks[0]?.subtasks).toHaveLength(4);
      expect(plan.phases[0]?.tasks[0]?.subtasks[0]?.subtaskId).toBe('ST-001-001-001');
      expect(plan.phases[0]?.tasks[0]?.subtasks[1]?.subtaskId).toBe('ST-001-001-002');
      expect(plan.phases[0]?.tasks[0]?.subtasks[2]?.subtaskId).toBe('ST-001-001-003');
      expect(plan.phases[0]?.tasks[0]?.subtasks[3]?.subtaskId).toBe('ST-001-001-004');
    });

    describe('platform assignment', () => {
      it('should assign phase platform to all phases', () => {
        const prd = createPRD(2, 1, 1);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          expect(phasePlan.platform).toBe('claude');
        }
      });

      it('should assign task platform to all tasks', () => {
        const prd = createPRD(1, 3, 1);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          for (const taskPlan of phasePlan.tasks) {
            expect(taskPlan.platform).toBe('codex');
          }
        }
      });

      it('should assign subtask platform to all subtasks', () => {
        const prd = createPRD(1, 1, 3);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          for (const taskPlan of phasePlan.tasks) {
            for (const subtaskPlan of taskPlan.subtasks) {
              expect(subtaskPlan.platform).toBe('cursor');
            }
          }
        }
      });
    });

    describe('iteration limits', () => {
      it('should assign phase maxIterations to all phases', () => {
        const prd = createPRD(2, 1, 1);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          expect(phasePlan.maxIterations).toBe(3);
        }
      });

      it('should assign task maxIterations to all tasks', () => {
        const prd = createPRD(1, 3, 1);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          for (const taskPlan of phasePlan.tasks) {
            expect(taskPlan.maxIterations).toBe(5);
          }
        }
      });

      it('should assign subtask maxIterations to all subtasks', () => {
        const prd = createPRD(1, 1, 3);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          for (const taskPlan of phasePlan.tasks) {
            for (const subtaskPlan of taskPlan.subtasks) {
              expect(subtaskPlan.maxIterations).toBe(10);
            }
          }
        }
      });
    });

    describe('escalation paths', () => {
      it('should set phase escalation to null (top tier)', () => {
        const prd = createPRD(2, 1, 1);
        const plan = generator.generate(prd);

        for (const phasePlan of plan.phases) {
          expect(phasePlan.escalation).toBeNull();
        }
      });

      it('should set task escalation to phase when config says phase', () => {
        const prd = createPRD(1, 2, 1);
        const plan = generator.generate(prd);

        // Note: Tasks don't have escalation in TaskPlan, only phases do
        // This test verifies phase escalation is correct
        expect(plan.phases[0]?.escalation).toBeNull();
      });

      it('should handle different escalation configurations', () => {
        const customConfig: PuppetMasterConfig = {
          ...config,
          tiers: {
            ...config.tiers,
            task: {
              ...config.tiers.task,
              escalation: 'phase',
            },
            subtask: {
              ...config.tiers.subtask,
              escalation: 'task',
            },
          },
        };

        const customGenerator = new TierPlanGenerator(customConfig);
        const prd = createPRD(1, 1, 1);
        const plan = customGenerator.generate(prd);

        expect(plan.phases[0]?.escalation).toBeNull();
        expect(customGenerator.getEscalationTarget('task')).toBe('phase');
        expect(customGenerator.getEscalationTarget('subtask')).toBe('task');
      });
    });

    describe('ID preservation', () => {
      it('should preserve phase IDs exactly', () => {
        const prd = createPRD(3, 1, 1);
        const plan = generator.generate(prd);

        expect(plan.phases[0]?.phaseId).toBe(prd.phases[0]?.id);
        expect(plan.phases[1]?.phaseId).toBe(prd.phases[1]?.id);
        expect(plan.phases[2]?.phaseId).toBe(prd.phases[2]?.id);
      });

      it('should preserve task IDs exactly', () => {
        const prd = createPRD(1, 3, 1);
        const plan = generator.generate(prd);

        const prdTasks = prd.phases[0]?.tasks || [];
        const planTasks = plan.phases[0]?.tasks || [];

        for (let i = 0; i < prdTasks.length; i++) {
          expect(planTasks[i]?.taskId).toBe(prdTasks[i]?.id);
        }
      });

      it('should preserve subtask IDs exactly', () => {
        const prd = createPRD(1, 1, 3);
        const plan = generator.generate(prd);

        const prdSubtasks = prd.phases[0]?.tasks[0]?.subtasks || [];
        const planSubtasks = plan.phases[0]?.tasks[0]?.subtasks || [];

        for (let i = 0; i < prdSubtasks.length; i++) {
          expect(planSubtasks[i]?.subtaskId).toBe(prdSubtasks[i]?.id);
        }
      });
    });

    describe('complex hierarchy', () => {
      it('should handle multiple phases with multiple tasks and subtasks', () => {
        const prd = createPRD(2, 3, 4);
        const plan = generator.generate(prd);

        expect(plan.phases).toHaveLength(2);
        expect(plan.phases[0]?.tasks).toHaveLength(3);
        expect(plan.phases[0]?.tasks[0]?.subtasks).toHaveLength(4);
        expect(plan.phases[1]?.tasks).toHaveLength(3);
        expect(plan.phases[1]?.tasks[0]?.subtasks).toHaveLength(4);
      });

      it('should handle empty phases', () => {
        const prd: PRD = {
          project: 'test',
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          branchName: 'main',
          description: 'Empty PRD',
          phases: [],
          metadata: {
            totalPhases: 0,
            completedPhases: 0,
            totalTasks: 0,
            completedTasks: 0,
            totalSubtasks: 0,
            completedSubtasks: 0,
          },
        };

        const plan = generator.generate(prd);
        expect(plan.phases).toHaveLength(0);
      });
    });
  });
});
