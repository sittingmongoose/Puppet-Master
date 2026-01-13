/**
 * Tests for PrdManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { PrdManager } from './prd-manager.js';
import type {
  PRD,
  Phase,
  Task,
  Subtask,
  Iteration,
  Evidence,
  GateReport,
} from '../types/prd.js';

describe('PrdManager', () => {
  const testDir = join(process.cwd(), '.test-prd');
  const testPrdPath = join(testDir, 'prd.json');

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  /**
   * Helper to create a sample PRD with one phase, one task, one subtask
   */
  function createSamplePRD(): PRD {
    const now = new Date().toISOString();
    return {
      project: 'TestProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Test PRD',
      phases: [
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'First phase',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'First task',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'First subtask',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
              ],
              createdAt: now,
              notes: '',
            },
          ],
          createdAt: now,
          notes: '',
        },
      ],
      metadata: {
        totalPhases: 1,
        completedPhases: 0,
        totalTasks: 1,
        completedTasks: 0,
        totalSubtasks: 1,
        completedSubtasks: 0,
      },
    };
  }

  /**
   * Helper to create a PRD with multiple phases/tasks/subtasks and mixed statuses
   */
  function createComplexPRD(): PRD {
    const now = new Date().toISOString();
    return {
      project: 'ComplexProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Complex PRD',
      phases: [
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'First phase',
          status: 'passed',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'First task',
              status: 'passed',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'First subtask',
                  status: 'passed',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
              ],
              createdAt: now,
              notes: '',
            },
          ],
          createdAt: now,
          notes: '',
        },
        {
          id: 'PH-002',
          title: 'Phase 2',
          description: 'Second phase',
          status: 'pending',
          priority: 2,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-002-001',
              phaseId: 'PH-002',
              title: 'Task 1',
              description: 'First task',
              status: 'running',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-002-001-001',
                  taskId: 'TK-002-001',
                  title: 'Subtask 1',
                  description: 'First subtask',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
                {
                  id: 'ST-002-001-002',
                  taskId: 'TK-002-001',
                  title: 'Subtask 2',
                  description: 'Second subtask',
                  status: 'pending',
                  priority: 2,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
              ],
              createdAt: now,
              notes: '',
            },
          ],
          createdAt: now,
          notes: '',
        },
      ],
      metadata: {
        totalPhases: 2,
        completedPhases: 1,
        totalTasks: 2,
        completedTasks: 1,
        totalSubtasks: 3,
        completedSubtasks: 1,
      },
    };
  }

  describe('load', () => {
    it('should return empty PRD when file does not exist', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = await manager.load();
      
      expect(prd.project).toBe('');
      expect(prd.version).toBe('1.0.0');
      expect(prd.phases).toEqual([]);
      expect(prd.metadata.totalPhases).toBe(0);
    });

    it('should load existing prd.json', async () => {
      const samplePRD = createSamplePRD();
      await writeFile(testPrdPath, JSON.stringify(samplePRD, null, 2), 'utf-8');

      const manager = new PrdManager(testPrdPath);
      const prd = await manager.load();

      expect(prd.project).toBe('TestProject');
      expect(prd.phases).toHaveLength(1);
      expect(prd.phases[0]?.id).toBe('PH-001');
      expect(prd.phases[0]?.tasks).toHaveLength(1);
      expect(prd.phases[0]?.tasks[0]?.subtasks).toHaveLength(1);
    });

    it('should recalculate metadata on load', async () => {
      const samplePRD = createSamplePRD();
      // Intentionally set wrong metadata
      samplePRD.metadata.totalPhases = 999;
      await writeFile(testPrdPath, JSON.stringify(samplePRD, null, 2), 'utf-8');

      const manager = new PrdManager(testPrdPath);
      const prd = await manager.load();

      expect(prd.metadata.totalPhases).toBe(1);
      expect(prd.metadata.totalTasks).toBe(1);
      expect(prd.metadata.totalSubtasks).toBe(1);
    });

    it('should throw on invalid JSON', async () => {
      await writeFile(testPrdPath, 'invalid json', 'utf-8');

      const manager = new PrdManager(testPrdPath);
      await expect(manager.load()).rejects.toThrow();
    });

    it('should throw on invalid PRD structure', async () => {
      await writeFile(testPrdPath, JSON.stringify({ invalid: 'structure' }), 'utf-8');

      const manager = new PrdManager(testPrdPath);
      await expect(manager.load()).rejects.toThrow('Invalid PRD structure');
    });
  });

  describe('save', () => {
    it('should create file if missing', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      
      await manager.save(prd);

      const content = await readFile(testPrdPath, 'utf-8');
      const saved = JSON.parse(content) as PRD;
      expect(saved.project).toBe('TestProject');
    });

    it('should update existing file', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd1 = createSamplePRD();
      await manager.save(prd1);

      const prd2 = await manager.load();
      prd2.project = 'UpdatedProject';
      await manager.save(prd2);

      const loaded = await manager.load();
      expect(loaded.project).toBe('UpdatedProject');
    });

    it('should update metadata before saving', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      // Intentionally set wrong metadata
      prd.metadata.totalPhases = 999;
      
      await manager.save(prd);

      const loaded = await manager.load();
      expect(loaded.metadata.totalPhases).toBe(1);
    });

    it('should update updatedAt timestamp', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      const originalUpdatedAt = prd.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await manager.save(prd);

      const loaded = await manager.load();
      expect(loaded.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('updateItemStatus', () => {
    it('should update phase status', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('PH-001', 'running');

      const loaded = await manager.load();
      expect(loaded.phases[0]?.status).toBe('running');
      expect(loaded.phases[0]?.startedAt).toBeDefined();
    });

    it('should update task status', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('TK-001-001', 'running');

      const loaded = await manager.load();
      const task = loaded.phases[0]?.tasks[0];
      expect(task?.status).toBe('running');
      expect(task?.startedAt).toBeDefined();
    });

    it('should update subtask status', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('ST-001-001-001', 'running');

      const loaded = await manager.load();
      const subtask = loaded.phases[0]?.tasks[0]?.subtasks[0];
      expect(subtask?.status).toBe('running');
      expect(subtask?.startedAt).toBeDefined();
    });

    it('should set completedAt when status is passed', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('ST-001-001-001', 'passed');

      const loaded = await manager.load();
      const subtask = loaded.phases[0]?.tasks[0]?.subtasks[0];
      expect(subtask?.status).toBe('passed');
      expect(subtask?.completedAt).toBeDefined();
    });

    it('should attach evidence when provided', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const evidence: Evidence = {
        collectedAt: new Date().toISOString(),
        items: [
          {
            type: 'log',
            path: 'test.log',
            summary: 'Test evidence',
          },
        ],
      };

      await manager.updateItemStatus('ST-001-001-001', 'passed', evidence);

      const loaded = await manager.load();
      const subtask = loaded.phases[0]?.tasks[0]?.subtasks[0];
      expect(subtask?.evidence).toBeDefined();
      expect(subtask?.evidence?.items).toHaveLength(1);
    });

    it('should throw on invalid item ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await expect(manager.updateItemStatus('INVALID-001', 'pending')).rejects.toThrow(
        'Item not found'
      );
    });

    it('should update metadata on status change', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('ST-001-001-001', 'passed');

      const loaded = await manager.load();
      expect(loaded.metadata.completedSubtasks).toBe(1);
    });
  });

  describe('getNextPending', () => {
    it('should find first pending phase', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      const next = await manager.getNextPending('phase');
      expect(next).not.toBeNull();
      expect((next as Phase).id).toBe('PH-002');
      expect((next as Phase).status).toBe('pending');
    });

    it('should find first pending task', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      const next = await manager.getNextPending('task');
      expect(next).not.toBeNull();
      expect((next as Task).id).toBe('TK-002-001');
      // Note: getNextPending returns tasks with status 'pending' or 'running'
      expect(['pending', 'running']).toContain((next as Task).status);
    });

    it('should find first pending subtask', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      const next = await manager.getNextPending('subtask');
      expect(next).not.toBeNull();
      expect((next as Subtask).id).toBe('ST-002-001-001');
      expect((next as Subtask).status).toBe('pending');
    });

    it('should return null when all phases are complete', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);
      await manager.updateItemStatus('PH-001', 'passed');

      const next = await manager.getNextPending('phase');
      expect(next).toBeNull();
    });

    it('should respect hierarchy order', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      // Should find subtask in first phase with pending items
      const next = await manager.getNextPending('subtask');
      expect(next).not.toBeNull();
      expect((next as Subtask).id).toBe('ST-002-001-001');
    });
  });

  describe('findItem', () => {
    it('should find phase by PH-001', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const item = await manager.findItem('PH-001');
      expect(item).not.toBeNull();
      expect((item as Phase).id).toBe('PH-001');
      expect((item as Phase).title).toBe('Phase 1');
    });

    it('should find task by TK-001-001', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const item = await manager.findItem('TK-001-001');
      expect(item).not.toBeNull();
      expect((item as Task).id).toBe('TK-001-001');
      expect((item as Task).title).toBe('Task 1');
    });

    it('should find subtask by ST-001-001-001', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const item = await manager.findItem('ST-001-001-001');
      expect(item).not.toBeNull();
      expect((item as Subtask).id).toBe('ST-001-001-001');
      expect((item as Subtask).title).toBe('Subtask 1');
    });

    it('should return null for non-existent ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const item = await manager.findItem('PH-999');
      expect(item).toBeNull();
    });
  });

  describe('findPhase', () => {
    it('should find phase by ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const phase = await manager.findPhase('PH-001');
      expect(phase).not.toBeNull();
      expect(phase?.id).toBe('PH-001');
    });

    it('should return null for non-existent phase', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const phase = await manager.findPhase('PH-999');
      expect(phase).toBeNull();
    });
  });

  describe('findTask', () => {
    it('should find task by ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const task = await manager.findTask('TK-001-001');
      expect(task).not.toBeNull();
      expect(task?.id).toBe('TK-001-001');
    });

    it('should return null for non-existent task', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const task = await manager.findTask('TK-999-999');
      expect(task).toBeNull();
    });
  });

  describe('findSubtask', () => {
    it('should find subtask by ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const subtask = await manager.findSubtask('ST-001-001-001');
      expect(subtask).not.toBeNull();
      expect(subtask?.id).toBe('ST-001-001-001');
    });

    it('should return null for non-existent subtask', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const subtask = await manager.findSubtask('ST-999-999-999');
      expect(subtask).toBeNull();
    });
  });

  describe('addIterationRecord', () => {
    it('should add iteration to subtask', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const iteration: Iteration = {
        id: 'IT-001-001-001-001',
        subtaskId: 'ST-001-001-001',
        attemptNumber: 1,
        status: 'succeeded',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        platform: 'cursor',
        model: 'auto',
        sessionId: 'PM-2026-01-10-14-00-00-001',
        processId: 12345,
      };

      await manager.addIterationRecord('ST-001-001-001', iteration);

      const loaded = await manager.load();
      const subtask = loaded.phases[0]?.tasks[0]?.subtasks[0];
      expect(subtask?.iterations).toHaveLength(1);
      expect(subtask?.iterations[0]?.id).toBe('IT-001-001-001-001');
    });

    it('should throw on invalid subtask ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const iteration: Iteration = {
        id: 'IT-001-001-001-001',
        subtaskId: 'ST-999-999-999',
        attemptNumber: 1,
        status: 'succeeded',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        platform: 'cursor',
        model: 'auto',
        sessionId: 'PM-2026-01-10-14-00-00-001',
        processId: 12345,
      };

      await expect(
        manager.addIterationRecord('ST-999-999-999', iteration)
      ).rejects.toThrow('Subtask not found');
    });
  });

  describe('setGateReport', () => {
    it('should set gate report on task', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const report: GateReport = {
        gateType: 'task',
        executedAt: new Date().toISOString(),
        platform: 'codex',
        model: 'gpt-5.2-high',
        testResults: [],
        acceptanceResults: [],
        verifierResults: [],
        passed: true,
        decision: 'pass',
        agentsUpdated: false,
      };

      await manager.setGateReport('TK-001-001', report);

      const loaded = await manager.load();
      const task = loaded.phases[0]?.tasks[0];
      expect(task?.gateReport).toBeDefined();
      expect(task?.gateReport?.gateType).toBe('task');
    });

    it('should set gate report on phase', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const report: GateReport = {
        gateType: 'phase',
        executedAt: new Date().toISOString(),
        platform: 'claude',
        model: 'opus-4.5',
        testResults: [],
        acceptanceResults: [],
        verifierResults: [],
        passed: true,
        decision: 'pass',
        agentsUpdated: false,
      };

      await manager.setGateReport('PH-001', report);

      const loaded = await manager.load();
      const phase = loaded.phases[0];
      expect(phase?.gateReport).toBeDefined();
      expect(phase?.gateReport?.gateType).toBe('phase');
    });

    it('should throw on invalid item ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const report: GateReport = {
        gateType: 'task',
        executedAt: new Date().toISOString(),
        platform: 'codex',
        model: 'gpt-5.2-high',
        testResults: [],
        acceptanceResults: [],
        verifierResults: [],
        passed: true,
        decision: 'pass',
        agentsUpdated: false,
      };

      await expect(manager.setGateReport('TK-999-999', report)).rejects.toThrow(
        'Task not found'
      );
    });

    it('should throw when setting gate report on subtask', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      const report: GateReport = {
        gateType: 'task',
        executedAt: new Date().toISOString(),
        platform: 'codex',
        model: 'gpt-5.2-high',
        testResults: [],
        acceptanceResults: [],
        verifierResults: [],
        passed: true,
        decision: 'pass',
        agentsUpdated: false,
      };

      await expect(manager.setGateReport('ST-001-001-001', report)).rejects.toThrow(
        'Gate reports can only be set on phases or tasks'
      );
    });
  });

  describe('reopenItem', () => {
    it('should set status to reopened', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);
      await manager.updateItemStatus('ST-001-001-001', 'passed');

      await manager.reopenItem('ST-001-001-001', 'Test failure');

      const loaded = await manager.load();
      const subtask = loaded.phases[0]?.tasks[0]?.subtasks[0];
      expect(subtask?.status).toBe('reopened');
      expect(subtask?.completedAt).toBeUndefined();
      expect(subtask?.notes).toContain('Reopened: Test failure');
    });

    it('should throw on invalid item ID', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await expect(manager.reopenItem('ST-999-999-999', 'Reason')).rejects.toThrow(
        'Item not found'
      );
    });
  });

  describe('recalculateMetadata', () => {
    it('should count total items correctly', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      const loaded = await manager.load();
      expect(loaded.metadata.totalPhases).toBe(2);
      expect(loaded.metadata.totalTasks).toBe(2);
      expect(loaded.metadata.totalSubtasks).toBe(3);
    });

    it('should count completed items correctly', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createComplexPRD();
      await manager.save(prd);

      const loaded = await manager.load();
      expect(loaded.metadata.completedPhases).toBe(1);
      expect(loaded.metadata.completedTasks).toBe(1);
      expect(loaded.metadata.completedSubtasks).toBe(1);
    });

    it('should handle empty PRD', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = await manager.load(); // Returns empty PRD

      const metadata = manager.recalculateMetadata(prd);
      expect(metadata.totalPhases).toBe(0);
      expect(metadata.completedPhases).toBe(0);
      expect(metadata.totalTasks).toBe(0);
      expect(metadata.completedTasks).toBe(0);
      expect(metadata.totalSubtasks).toBe(0);
      expect(metadata.completedSubtasks).toBe(0);
    });

    it('should update on status changes', async () => {
      const manager = new PrdManager(testPrdPath);
      const prd = createSamplePRD();
      await manager.save(prd);

      await manager.updateItemStatus('ST-001-001-001', 'passed');

      const loaded = await manager.load();
      expect(loaded.metadata.completedSubtasks).toBe(1);
      expect(loaded.metadata.totalSubtasks).toBe(1);
    });
  });
});
