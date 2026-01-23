/**
 * Traceability utilities tests
 * 
 * Tests for TraceabilityManager query utilities and matrix builder.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TraceabilityManager } from './traceability.js';
import type { ParsedRequirements, ParsedSection, RequirementsSource } from '../types/requirements.js';
import type { PRD, Phase, Task, Subtask, SourceRef } from '../types/prd.js';

describe('TraceabilityManager', () => {
  let manager: TraceabilityManager;

  beforeEach(() => {
    manager = new TraceabilityManager();
  });

  const createSource = (path: string = 'test.md'): RequirementsSource => ({
    path,
    format: 'markdown',
    size: 0,
    lastModified: new Date().toISOString(),
  });

  const createSourceRef = (
    sectionPath: string,
    sourcePath: string = 'test.md',
    excerptHash: string = 'abc123'
  ): SourceRef => ({
    sourcePath,
    sectionPath,
    excerptHash,
  });

  const createParsedRequirements = (
    sections: ParsedSection[],
    title: string = 'Requirements'
  ): ParsedRequirements => ({
    source: createSource(),
    title,
    sections,
    extractedGoals: [],
    extractedConstraints: [],
    rawText: '',
    parseErrors: [],
  });

  const createPRD = (phases: Phase[]): PRD => ({
    project: 'test-project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchName: 'ralph/main',
    description: 'Test PRD',
    phases,
    metadata: {
      totalPhases: phases.length,
      completedPhases: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalSubtasks: 0,
      completedSubtasks: 0,
    },
  });

  describe('getPrdItemsForRequirement', () => {
    it('should return empty array when no PRD items match', () => {
      const sectionPath = 'Requirements > Section 4.2';
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const results = manager.getPrdItemsForRequirement(sectionPath, prd);
      expect(results).toHaveLength(0);
    });

    it('should find phase that matches requirement', () => {
      const sectionPath = 'Requirements > Authentication';
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: [createSourceRef(sectionPath)],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const results = manager.getPrdItemsForRequirement(sectionPath, prd);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('PH-001');
    });

    it('should find task that matches requirement', () => {
      const sectionPath = 'Requirements > Authentication > JWT';
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [],
              sourceRefs: [createSourceRef(sectionPath)],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const results = manager.getPrdItemsForRequirement(sectionPath, prd);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('TK-001-001');
    });

    it('should find subtask that matches requirement', () => {
      const sectionPath = 'Requirements > Authentication > JWT > Implementation';
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'Description',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  sourceRefs: [createSourceRef(sectionPath)],
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
      ]);

      const results = manager.getPrdItemsForRequirement(sectionPath, prd);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('ST-001-001-001');
    });

    it('should find multiple PRD items that match requirement', () => {
      const sectionPath = 'Requirements > Authentication';
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [],
              sourceRefs: [createSourceRef(sectionPath)],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          sourceRefs: [createSourceRef(sectionPath)],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const results = manager.getPrdItemsForRequirement(sectionPath, prd);
      expect(results).toHaveLength(2);
      expect(results.map(r => r.id)).toContain('PH-001');
      expect(results.map(r => r.id)).toContain('TK-001-001');
    });
  });

  describe('getUncoveredRequirements', () => {
    it('should return all sections when PRD has no sourceRefs', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [
            {
              title: 'JWT',
              content: 'JWT content',
              level: 2,
              children: [],
            },
          ],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const uncovered = manager.getUncoveredRequirements(parsed, prd);
      expect(uncovered).toContain('Requirements > Authentication');
      expect(uncovered).toContain('Requirements > Authentication > JWT');
    });

    it('should return empty array when all sections are covered', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: [createSourceRef('Requirements > Authentication')],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const uncovered = manager.getUncoveredRequirements(parsed, prd);
      expect(uncovered).toHaveLength(0);
    });

    it('should return only uncovered sections', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [
            {
              title: 'JWT',
              content: 'JWT content',
              level: 2,
              children: [],
            },
            {
              title: 'OAuth',
              content: 'OAuth content',
              level: 2,
              children: [],
            },
          ],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: [createSourceRef('Requirements > Authentication > JWT')],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const uncovered = manager.getUncoveredRequirements(parsed, prd);
      expect(uncovered).toContain('Requirements > Authentication');
      expect(uncovered).toContain('Requirements > Authentication > OAuth');
      expect(uncovered).not.toContain('Requirements > Authentication > JWT');
    });
  });

  describe('buildTraceabilityMatrix', () => {
    it('should build empty matrix when PRD has no sourceRefs', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix.requirementToPrdItems).toEqual({});
      expect(matrix.prdItemToRequirements).toEqual({});
      expect(matrix.excerptHashes).toEqual({});
      expect(matrix.timestamp).toBeTruthy();
    });

    it('should build matrix with phase sourceRefs', () => {
      const sectionPath = 'Requirements > Authentication';
      const excerptHash = 'hash123';
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: [
            {
              sourcePath: 'test.md',
              sectionPath,
              excerptHash,
            },
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix.requirementToPrdItems[sectionPath]).toEqual(['PH-001']);
      expect(matrix.prdItemToRequirements['PH-001']).toEqual([sectionPath]);
      expect(matrix.excerptHashes[sectionPath]).toBe(excerptHash);
    });

    it('should build matrix with task and subtask sourceRefs', () => {
      const taskSectionPath = 'Requirements > Authentication > JWT';
      const subtaskSectionPath = 'Requirements > Authentication > JWT > Implementation';
      const taskHash = 'hash456';
      const subtaskHash = 'hash789';

      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [
            {
              title: 'JWT',
              content: 'JWT content',
              level: 2,
              children: [
                {
                  title: 'Implementation',
                  content: 'Implementation content',
                  level: 3,
                  children: [],
                },
              ],
            },
          ],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'Description',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  sourceRefs: [
                    {
                      sourcePath: 'test.md',
                      sectionPath: subtaskSectionPath,
                      excerptHash: subtaskHash,
                    },
                  ],
                  createdAt: new Date().toISOString(),
                  notes: '',
                },
              ],
              sourceRefs: [
                {
                  sourcePath: 'test.md',
                  sectionPath: taskSectionPath,
                  excerptHash: taskHash,
                },
              ],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix.requirementToPrdItems[taskSectionPath]).toContain('TK-001-001');
      expect(matrix.requirementToPrdItems[subtaskSectionPath]).toContain('ST-001-001-001');
      expect(matrix.prdItemToRequirements['TK-001-001']).toContain(taskSectionPath);
      expect(matrix.prdItemToRequirements['ST-001-001-001']).toContain(subtaskSectionPath);
      expect(matrix.excerptHashes[taskSectionPath]).toBe(taskHash);
      expect(matrix.excerptHashes[subtaskSectionPath]).toBe(subtaskHash);
    });

    it('should handle multiple PRD items covering same requirement', () => {
      const sectionPath = 'Requirements > Authentication';
      const parsed = createParsedRequirements([
        {
          title: 'Authentication',
          content: 'Auth content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [],
              sourceRefs: [createSourceRef(sectionPath)],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          sourceRefs: [createSourceRef(sectionPath)],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix.requirementToPrdItems[sectionPath]).toHaveLength(2);
      expect(matrix.requirementToPrdItems[sectionPath]).toContain('PH-001');
      expect(matrix.requirementToPrdItems[sectionPath]).toContain('TK-001-001');
    });
  });

  describe('error handling and edge cases', () => {
    it('should throw error when sectionPath is empty', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      expect(() => manager.getPrdItemsForRequirement('', prd)).toThrow('sectionPath cannot be empty');
      expect(() => manager.getPrdItemsForRequirement('   ', prd)).toThrow('sectionPath cannot be empty');
    });

    it('should throw error when PRD is invalid', () => {
      const invalidPrd = null as unknown as PRD;
      expect(() => manager.getPrdItemsForRequirement('Requirements > Section', invalidPrd)).toThrow('Invalid PRD');
    });

    it('should throw error when PRD has no phases array', () => {
      const invalidPrd = { project: 'test' } as unknown as PRD;
      expect(() => manager.getPrdItemsForRequirement('Requirements > Section', invalidPrd)).toThrow('Invalid PRD');
    });

    it('should throw error when parsed requirements is invalid', () => {
      const prd = createPRD([]);
      const invalidParsed = null as unknown as ParsedRequirements;
      expect(() => manager.getUncoveredRequirements(invalidParsed, prd)).toThrow('Invalid parsed requirements');
    });

    it('should throw error when building matrix with invalid PRD', () => {
      const parsed = createParsedRequirements([]);
      const invalidPrd = null as unknown as PRD;
      expect(() => manager.buildTraceabilityMatrix(parsed, invalidPrd)).toThrow('Invalid PRD');
    });

    it('should handle PRD items with missing IDs gracefully', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Section',
          content: 'Content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: '', // Missing ID
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      // Should not throw, but should skip invalid items
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed sourceRefs gracefully', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Section',
          content: 'Content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: [
            null as unknown as SourceRef,
            { sourcePath: 'test.md', sectionPath: '' } as SourceRef, // Invalid: empty sectionPath
            { sourcePath: 'test.md', sectionPath: 'Valid Path', excerptHash: 'hash' }, // Valid
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const matrix = manager.buildTraceabilityMatrix(parsed, prd);
      expect(matrix).toBeDefined();
      // Should only include valid sourceRefs
      expect(matrix.prdItemToRequirements['PH-001']).toContain('Valid Path');
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle empty PRD gracefully', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Section',
          content: 'Content',
          level: 1,
          children: [],
        },
      ]);

      const emptyPrd = createPRD([]);
      const uncovered = manager.getUncoveredRequirements(parsed, emptyPrd);
      expect(uncovered).toContain('Requirements > Section');

      const matrix = manager.buildTraceabilityMatrix(parsed, emptyPrd);
      expect(matrix.requirementToPrdItems).toEqual({});
      expect(matrix.prdItemToRequirements).toEqual({});
    });

    it('should handle empty requirements gracefully', () => {
      const emptyParsed = createParsedRequirements([]);
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const uncovered = manager.getUncoveredRequirements(emptyParsed, prd);
      expect(uncovered).toHaveLength(0);
    });

    it('should handle PRD items with null/undefined sourceRefs', () => {
      const parsed = createParsedRequirements([
        {
          title: 'Section',
          content: 'Content',
          level: 1,
          children: [],
        },
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          sourceRefs: undefined,
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ]);

      const results = manager.getPrdItemsForRequirement('Requirements > Section', prd);
      expect(results).toHaveLength(0);

      const uncovered = manager.getUncoveredRequirements(parsed, prd);
      expect(uncovered).toContain('Requirements > Section');
    });
  });
});
