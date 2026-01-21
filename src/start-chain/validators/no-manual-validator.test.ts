import { describe, it, expect } from 'vitest';
import type { PRD } from '../../types/prd.js';
import { validateNoManualCriteria } from './no-manual-validator.js';

describe('validateNoManualCriteria', () => {
  it('passes when no manual criteria exist', () => {
    const prd: PRD = {
      project: 'x',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchName: 'ralph/main',
      description: 'x',
      phases: [
        {
          id: 'PH-001',
          title: 'Phase',
          description: '',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [
            { id: 'PH-001-AC-001', description: 'OK', type: 'ai', target: 'AI_VERIFY:OK' },
          ],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task',
              description: '',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Sub',
                  description: '',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [
                    {
                      id: 'ST-001-001-001-AC-001',
                      description: 'Run tests',
                      type: 'command',
                      target: 'TEST:npm test',
                    },
                  ],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: new Date().toISOString(),
                  notes: '',
                },
              ],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
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

    const result = validateNoManualCriteria(prd);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when manual criteria exist (runtime data)', () => {
    const prdWithManual = {
      project: 'x',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchName: 'ralph/main',
      description: 'x',
      phases: [
        {
          id: 'PH-001',
          title: 'Phase',
          description: '',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task',
              description: '',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Sub',
                  description: '',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [
                    {
                      id: 'ST-001-001-001-AC-001',
                      description: 'Manually verify',
                      type: 'manual',
                      target: '',
                    },
                  ],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: new Date().toISOString(),
                  notes: '',
                },
              ],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
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
    } as unknown as PRD;

    const result = validateNoManualCriteria(prdWithManual);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('PRD_MANUAL_CRITERIA');
    expect(result.errors[0].path).toContain('acceptanceCriteria');
  });
});

