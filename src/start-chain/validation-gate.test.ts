/**
 * Validation Gate Tests
 * 
 * Tests for the ValidationGate implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationGate } from './validation-gate.js';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import type { PuppetMasterConfig, Platform } from '../types/config.js';
import type { TierPlan, PhasePlan, TaskPlan, SubtaskPlan } from './tier-plan-generator.js';
import type { Criterion } from '../types/tiers.js';

describe('ValidationGate', () => {
  let gate: ValidationGate;
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
        gemini: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        copilot: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
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
      gemini: 'gemini',
      copilot: 'copilot',
    },
  });

  const createCriterion = (id: string = 'CR-001'): Criterion => ({
    id,
    description: 'Test criterion',
    type: 'ai',
    target: 'test',
  });

  const createSubtask = (id: string, taskId: string, withAcceptance: boolean = true): Subtask => ({
    id,
    taskId,
    title: `Subtask ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: withAcceptance ? [createCriterion()] : [],
    testPlan: { commands: [], failFast: true },
    iterations: [],
    maxIterations: 3,
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createTask = (id: string, phaseId: string, subtaskCount: number = 2, withAcceptance: boolean = true): Task => ({
    id,
    phaseId,
    title: `Task ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: withAcceptance ? [createCriterion()] : [],
    testPlan: { commands: [], failFast: true },
    subtasks: Array.from({ length: subtaskCount }, (_, i) =>
      createSubtask(`ST-${id.split('-')[1]}-${id.split('-')[2]}-${String(i + 1).padStart(3, '0')}`, id, true)
    ),
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createPhase = (id: string, taskCount: number = 2, subtasksPerTask: number = 2, withAcceptance: boolean = true): Phase => ({
    id,
    title: `Phase ${id}`,
    description: `Description for ${id}`,
    status: 'pending',
    priority: 1,
    acceptanceCriteria: withAcceptance ? [createCriterion()] : [],
    testPlan: { commands: [], failFast: true },
    tasks: Array.from({ length: taskCount }, (_, i) =>
      createTask(`TK-${id.split('-')[1]}-${String(i + 1).padStart(3, '0')}`, id, subtasksPerTask, true)
    ),
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const createValidPRD = (): PRD => {
    const now = new Date().toISOString();
    const phases = [
      createPhase('PH-001', 2, 2, true),
    ];

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

  const createValidTierPlan = (): TierPlan => {
    // Task 1 subtasks
    const subtaskPlan1_1: SubtaskPlan = {
      subtaskId: 'ST-001-001-001',
      platform: 'cursor',
      maxIterations: 10,
    };
    const subtaskPlan1_2: SubtaskPlan = {
      subtaskId: 'ST-001-001-002',
      platform: 'cursor',
      maxIterations: 10,
    };

    // Task 2 subtasks
    const subtaskPlan2_1: SubtaskPlan = {
      subtaskId: 'ST-001-002-001',
      platform: 'cursor',
      maxIterations: 10,
    };
    const subtaskPlan2_2: SubtaskPlan = {
      subtaskId: 'ST-001-002-002',
      platform: 'cursor',
      maxIterations: 10,
    };

    const taskPlan1: TaskPlan = {
      taskId: 'TK-001-001',
      platform: 'codex',
      maxIterations: 5,
      subtasks: [subtaskPlan1_1, subtaskPlan1_2],
    };

    const taskPlan2: TaskPlan = {
      taskId: 'TK-001-002',
      platform: 'codex',
      maxIterations: 5,
      subtasks: [subtaskPlan2_1, subtaskPlan2_2],
    };

    const phasePlan1: PhasePlan = {
      phaseId: 'PH-001',
      platform: 'claude',
      maxIterations: 3,
      escalation: null,
      tasks: [taskPlan1, taskPlan2],
    };

    return {
      phases: [phasePlan1],
    };
  };

  beforeEach(() => {
    gate = new ValidationGate();
    config = createTestConfig();
  });

  describe('validatePrd', () => {
    it('should pass validation for valid PRD', () => {
      const prd = createValidPRD();
      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when PRD has no phases', () => {
      const prd: PRD = {
        project: 'test',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'main',
        description: 'Test',
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

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('PRD_NO_PHASES');
    });

    it('should fail when phase has no tasks', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks = [];

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_EMPTY_PHASE')).toBe(true);
    });

    it('should fail when task has no subtasks', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks[0].subtasks = [];

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_EMPTY_TASK')).toBe(true);
    });

    it('should fail when subtask has no acceptance criteria', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks[0].subtasks[0].acceptanceCriteria = [];

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_EMPTY_ACCEPTANCE_CRITERIA')).toBe(true);
    });

    it('should fail when IDs are duplicated', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks[0].id = prd.phases[0].tasks[1].id; // Duplicate task ID

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_DUPLICATE_ID')).toBe(true);
    });

    it('should fail when phase is missing ID', () => {
      const prd = createValidPRD();
      prd.phases[0].id = '';

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_MISSING_ID')).toBe(true);
    });

    it('should fail when phase is missing title', () => {
      const prd = createValidPRD();
      prd.phases[0].title = '';

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PRD_MISSING_TITLE')).toBe(true);
    });

    it('should warn when phase has no acceptance criteria', () => {
      const prd = createValidPRD();
      prd.phases[0].acceptanceCriteria = [];

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.code === 'PRD_EMPTY_ACCEPTANCE_CRITERIA')).toBe(true);
    });

    it('should warn when task has no acceptance criteria', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks[0].acceptanceCriteria = [];

      const result = gate.validatePrd(prd);

      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.code === 'PRD_EMPTY_ACCEPTANCE_CRITERIA')).toBe(true);
    });
  });

  describe('validateArchitecture', () => {
    it('should pass validation for valid architecture document', () => {
      const arch = `# Architecture Document

## Overview
This is a test architecture document with sufficient content.

## Module Breakdown
- Module 1
- Module 2

## Dependencies
- Dependency 1
- Dependency 2

## Tech Stack
- Technology 1
- Technology 2
`;

      const result = gate.validateArchitecture(arch);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when architecture document is empty', () => {
      const result = gate.validateArchitecture('');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('ARCH_EMPTY');
    });

    it('should fail when architecture document is only whitespace', () => {
      const result = gate.validateArchitecture('   \n\t  ');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('ARCH_EMPTY');
    });

    it('should warn when architecture document is too short', () => {
      const result = gate.validateArchitecture('Short doc');

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'ARCH_TOO_SHORT')).toBe(true);
    });

    it('should warn when architecture document is missing sections', () => {
      const arch = `# Architecture Document

Some content here but missing expected sections.
`;

      const result = gate.validateArchitecture(arch);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'ARCH_MISSING_SECTION')).toBe(true);
    });
  });

  describe('validateTierPlan', () => {
    it('should pass validation for valid tier plan', () => {
      const plan = createValidTierPlan();
      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when tier plan has no phases', () => {
      const plan: TierPlan = { phases: [] };
      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('TIER_PLAN_NO_PHASES');
    });

    it('should fail when phase plan has invalid platform', () => {
      const plan = createValidTierPlan();
      plan.phases[0].platform = 'invalid' as Platform;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_INVALID_PLATFORM')).toBe(true);
    });

    it('should fail when phase plan has invalid maxIterations', () => {
      const plan = createValidTierPlan();
      plan.phases[0].maxIterations = 0;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_INVALID_ITERATIONS')).toBe(true);
    });

    it('should fail when phase plan has invalid escalation', () => {
      const plan = createValidTierPlan();
      plan.phases[0].escalation = 'invalid' as any;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_INVALID_ESCALATION')).toBe(true);
    });

    it('should pass when phase plan has null escalation', () => {
      const plan = createValidTierPlan();
      plan.phases[0].escalation = null;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(true);
    });

    it('should fail when task plan has invalid platform', () => {
      const plan = createValidTierPlan();
      plan.phases[0].tasks[0].platform = 'invalid' as Platform;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_INVALID_PLATFORM')).toBe(true);
    });

    it('should fail when subtask plan has invalid maxIterations', () => {
      const plan = createValidTierPlan();
      plan.phases[0].tasks[0].subtasks[0].maxIterations = -1;

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_INVALID_ITERATIONS')).toBe(true);
    });

    it('should fail when phase plan is missing phaseId', () => {
      const plan = createValidTierPlan();
      plan.phases[0].phaseId = '';

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_MISSING_ID')).toBe(true);
    });

    it('should warn when phase plan has no tasks', () => {
      const plan = createValidTierPlan();
      plan.phases[0].tasks = [];

      const result = gate.validateTierPlan(plan, config);

      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.code === 'TIER_PLAN_EMPTY_PHASE')).toBe(true);
    });
  });

  describe('validateTierPlanStructure', () => {
    it('should pass when tier plan matches PRD structure', () => {
      const prd = createValidPRD();
      const plan = createValidTierPlan();
      const result = gate.validateTierPlanStructure(prd, plan);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when PRD phase has no corresponding plan', () => {
      const prd = createValidPRD();
      const plan: TierPlan = { phases: [] }; // Empty plan

      const result = gate.validateTierPlanStructure(prd, plan);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_MISMATCH')).toBe(true);
    });

    it('should fail when PRD task has no corresponding plan', () => {
      const prd = createValidPRD();
      const plan = createValidTierPlan();
      plan.phases[0].tasks = []; // Remove tasks

      const result = gate.validateTierPlanStructure(prd, plan);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_MISMATCH')).toBe(true);
    });

    it('should fail when PRD subtask has no corresponding plan', () => {
      const prd = createValidPRD();
      const plan = createValidTierPlan();
      plan.phases[0].tasks[0].subtasks = []; // Remove subtasks

      const result = gate.validateTierPlanStructure(prd, plan);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_MISMATCH')).toBe(true);
    });

    it('should warn when tier plan has extra phase not in PRD', () => {
      const prd = createValidPRD();
      const plan = createValidTierPlan();
      plan.phases.push({
        phaseId: 'PH-999',
        platform: 'claude',
        maxIterations: 3,
        escalation: null,
        tasks: [],
      });

      const result = gate.validateTierPlanStructure(prd, plan);

      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.code === 'TIER_PLAN_EXTRA_PHASE')).toBe(true);
    });
  });

  describe('validateAll', () => {
    it('should pass when all artifacts are valid', () => {
      const prd = createValidPRD();
      const arch = `# Architecture Document

## Overview
Test architecture.

## Module Breakdown
Modules here.

## Dependencies
Deps here.

## Tech Stack
Tech here.
`;
      const plan = createValidTierPlan();

      const result = gate.validateAll(prd, arch, plan, config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should aggregate errors from all validators', () => {
      const prd = createValidPRD();
      prd.phases[0].tasks = []; // PRD error
      const arch = ''; // Architecture error
      const plan: TierPlan = { phases: [] }; // Tier plan error

      const result = gate.validateAll(prd, arch, plan, config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      // Should have errors from PRD, architecture, and tier plan
      expect(result.errors.some(e => e.code === 'PRD_EMPTY_PHASE')).toBe(true);
      expect(result.errors.some(e => e.code === 'ARCH_EMPTY')).toBe(true);
      expect(result.errors.some(e => e.code === 'TIER_PLAN_NO_PHASES')).toBe(true);
    });

    it('should aggregate warnings from all validators', () => {
      const prd = createValidPRD();
      prd.phases[0].acceptanceCriteria = []; // PRD warning
      prd.phases[0].tasks[0].acceptanceCriteria = []; // PRD warning
      const arch = 'Short doc'; // Architecture warning
      const plan = createValidTierPlan();
      // Don't remove tasks to avoid structure mismatch error
      // Instead, we'll rely on PRD and architecture warnings

      const result = gate.validateAll(prd, arch, plan, config);

      expect(result.valid).toBe(true); // No errors, just warnings
      expect(result.warnings.length).toBeGreaterThan(1);
      expect(result.warnings.some(w => w.code === 'PRD_EMPTY_ACCEPTANCE_CRITERIA')).toBe(true);
      expect(result.warnings.some(w => w.code === 'ARCH_TOO_SHORT')).toBe(true);
    });
  });
});
