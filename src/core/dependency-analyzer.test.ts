/**
 * Tests for DependencyAnalyzer
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildDependencyGraph,
  getParallelizableGroups,
  topologicalSort,
  hasDependencies,
  validateDependencies,
  isReadyToExecute,
  getReadySubtasks,
  DependencyCycleError,
  InvalidDependencyError,
} from './dependency-analyzer.js';
import { TierNode, type TierNodeData } from './tier-node.js';
import type { TierPlan } from '../types/tiers.js';

/**
 * Helper to create a mock subtask TierNode
 */
function createSubtaskNode(
  id: string,
  dependsOn: string[] = [],
  parent?: TierNode
): TierNode {
  const plan: TierPlan = {
    id: `plan-${id}`,
    title: `Plan for ${id}`,
    description: `Plan description for ${id}`,
    steps: [],
    context: '',
    constraints: [],
    dependsOn,
  };

  const data: TierNodeData = {
    id,
    type: 'subtask',
    title: `Subtask ${id}`,
    description: `Description for ${id}`,
    plan,
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: false },
    evidence: [],
    iterations: 0,
    maxIterations: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new TierNode(data, parent);
}

describe('DependencyAnalyzer', () => {
  describe('buildDependencyGraph', () => {
    it('should build graph for independent subtasks', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
      ];

      const graph = buildDependencyGraph(subtasks);

      expect(graph.nodes.size).toBe(3);
      expect(graph.hasDependencies).toBe(false);
      expect(graph.hasCycles).toBe(false);
      // All should be at level 0 (can run in parallel)
      expect(graph.levels).toHaveLength(1);
      expect(graph.levels[0]).toHaveLength(3);
    });

    it('should build graph for linear dependencies (A->B->C)', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
        createSubtaskNode('ST-003', ['ST-002']),
      ];

      const graph = buildDependencyGraph(subtasks);

      expect(graph.hasDependencies).toBe(true);
      expect(graph.hasCycles).toBe(false);
      expect(graph.levels).toHaveLength(3);
      expect(graph.levels[0].map(n => n.id)).toEqual(['ST-001']);
      expect(graph.levels[1].map(n => n.id)).toEqual(['ST-002']);
      expect(graph.levels[2].map(n => n.id)).toEqual(['ST-003']);
    });

    it('should build graph for diamond dependencies (A->B, A->C, B->D, C->D)', () => {
      const subtasks = [
        createSubtaskNode('ST-A'),
        createSubtaskNode('ST-B', ['ST-A']),
        createSubtaskNode('ST-C', ['ST-A']),
        createSubtaskNode('ST-D', ['ST-B', 'ST-C']),
      ];

      const graph = buildDependencyGraph(subtasks);

      expect(graph.hasDependencies).toBe(true);
      expect(graph.levels).toHaveLength(3);
      expect(graph.levels[0].map(n => n.id)).toEqual(['ST-A']);
      // B and C can run in parallel at level 1
      expect(graph.levels[1].map(n => n.id).sort()).toEqual(['ST-B', 'ST-C']);
      expect(graph.levels[2].map(n => n.id)).toEqual(['ST-D']);
    });

    it('should detect simple cycle (A->B->A)', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-002']),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      expect(() => buildDependencyGraph(subtasks)).toThrow(DependencyCycleError);
    });

    it('should detect longer cycle (A->B->C->A)', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-003']),
        createSubtaskNode('ST-002', ['ST-001']),
        createSubtaskNode('ST-003', ['ST-002']),
      ];

      expect(() => buildDependencyGraph(subtasks)).toThrow(DependencyCycleError);
    });

    it('should throw for invalid dependency reference', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-GHOST']),
      ];

      expect(() => buildDependencyGraph(subtasks)).toThrow(InvalidDependencyError);
      expect(() => buildDependencyGraph(subtasks)).toThrow(/non-existent/);
    });

    it('should handle complex mixed dependencies', () => {
      // Level 0: A, B (no deps)
      // Level 1: C (deps: A), D (deps: B)
      // Level 2: E (deps: C, D)
      const subtasks = [
        createSubtaskNode('ST-A'),
        createSubtaskNode('ST-B'),
        createSubtaskNode('ST-C', ['ST-A']),
        createSubtaskNode('ST-D', ['ST-B']),
        createSubtaskNode('ST-E', ['ST-C', 'ST-D']),
      ];

      const graph = buildDependencyGraph(subtasks);

      expect(graph.levels).toHaveLength(3);
      expect(graph.levels[0].map(n => n.id).sort()).toEqual(['ST-A', 'ST-B']);
      expect(graph.levels[1].map(n => n.id).sort()).toEqual(['ST-C', 'ST-D']);
      expect(graph.levels[2].map(n => n.id)).toEqual(['ST-E']);
    });
  });

  describe('getParallelizableGroups', () => {
    it('should return all subtasks in one group when no dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
      ];

      const groups = getParallelizableGroups(subtasks);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(3);
    });

    it('should separate dependent subtasks into groups', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      const groups = getParallelizableGroups(subtasks);

      expect(groups).toHaveLength(2);
      expect(groups[0].map(n => n.id)).toEqual(['ST-001']);
      expect(groups[1].map(n => n.id)).toEqual(['ST-002']);
    });
  });

  describe('topologicalSort', () => {
    it('should return subtasks in dependency order', () => {
      const subtasks = [
        createSubtaskNode('ST-C', ['ST-B']),
        createSubtaskNode('ST-A'),
        createSubtaskNode('ST-B', ['ST-A']),
      ];

      const sorted = topologicalSort(subtasks);
      const ids = sorted.map(n => n.id);

      expect(ids.indexOf('ST-A')).toBeLessThan(ids.indexOf('ST-B'));
      expect(ids.indexOf('ST-B')).toBeLessThan(ids.indexOf('ST-C'));
    });

    it('should handle empty array', () => {
      const sorted = topologicalSort([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('hasDependencies', () => {
    it('should return false for no dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
      ];

      expect(hasDependencies(subtasks)).toBe(false);
    });

    it('should return true when any subtask has dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      expect(hasDependencies(subtasks)).toBe(true);
    });
  });

  describe('validateDependencies', () => {
    it('should validate correct dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      const result = validateDependencies(subtasks);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid dependency references', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-GHOST']),
      ];

      const result = validateDependencies(subtasks);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('non-existent');
    });

    it('should detect self-dependency', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-001']),
      ];

      const result = validateDependencies(subtasks);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('itself'))).toBe(true);
    });

    it('should detect cycles', () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-002']),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      const result = validateDependencies(subtasks);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Circular'))).toBe(true);
    });
  });

  describe('isReadyToExecute', () => {
    it('should return true for subtask with no dependencies', () => {
      const subtask = createSubtaskNode('ST-001');
      const completed = new Set<string>();

      expect(isReadyToExecute(subtask, completed)).toBe(true);
    });

    it('should return true when all dependencies are completed', () => {
      const subtask = createSubtaskNode('ST-003', ['ST-001', 'ST-002']);
      const completed = new Set(['ST-001', 'ST-002']);

      expect(isReadyToExecute(subtask, completed)).toBe(true);
    });

    it('should return false when dependencies are not completed', () => {
      const subtask = createSubtaskNode('ST-003', ['ST-001', 'ST-002']);
      const completed = new Set(['ST-001']);

      expect(isReadyToExecute(subtask, completed)).toBe(false);
    });
  });

  describe('getReadySubtasks', () => {
    it('should return all subtasks when no dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
      ];
      const completed = new Set<string>();
      const inProgress = new Set<string>();

      const ready = getReadySubtasks(subtasks, completed, inProgress);

      expect(ready).toHaveLength(3);
    });

    it('should exclude completed subtasks', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
      ];
      const completed = new Set(['ST-001']);
      const inProgress = new Set<string>();

      const ready = getReadySubtasks(subtasks, completed, inProgress);

      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('ST-002');
    });

    it('should exclude in-progress subtasks', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
      ];
      const completed = new Set<string>();
      const inProgress = new Set(['ST-001']);

      const ready = getReadySubtasks(subtasks, completed, inProgress);

      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('ST-002');
    });

    it('should respect dependencies', () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
        createSubtaskNode('ST-003', ['ST-001']),
      ];
      const completed = new Set<string>();
      const inProgress = new Set<string>();

      let ready = getReadySubtasks(subtasks, completed, inProgress);
      expect(ready.map(n => n.id)).toEqual(['ST-001']);

      // After ST-001 completes
      completed.add('ST-001');
      ready = getReadySubtasks(subtasks, completed, inProgress);
      expect(ready.map(n => n.id).sort()).toEqual(['ST-002', 'ST-003']);
    });
  });

  describe('DependencyCycleError', () => {
    it('should include cycle path in error', () => {
      const cyclePath = ['ST-A', 'ST-B', 'ST-C', 'ST-A'];
      const error = new DependencyCycleError(cyclePath);

      expect(error.name).toBe('DependencyCycleError');
      expect(error.cyclePath).toEqual(cyclePath);
      expect(error.message).toContain('ST-A');
      expect(error.message).toContain('cycle');
    });
  });

  describe('InvalidDependencyError', () => {
    it('should include details in error', () => {
      const error = new InvalidDependencyError('ST-001', 'ST-GHOST');

      expect(error.name).toBe('InvalidDependencyError');
      expect(error.subtaskId).toBe('ST-001');
      expect(error.invalidDependency).toBe('ST-GHOST');
      expect(error.message).toContain('non-existent');
    });
  });
});
