/**
 * TierNode tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TierNode, createTierNode, buildTierTree } from './tier-node.js';
import type { TierNodeData } from './tier-node.js';
import type { PRD } from '../types/prd.js';

describe('TierNode', () => {
  describe('node creation', () => {
    it('should create a node with required data', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Test Phase',
        description: 'Test Description',
        plan: {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test Description',
        },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);

      expect(node.id).toBe('PH-001');
      expect(node.type).toBe('phase');
      expect(node.data).toEqual(data);
      expect(node.parent).toBeNull();
      expect(node.children).toEqual([]);
      expect(node.stateMachine).toBeDefined();
    });

    it('should create a node with parent', () => {
      const parentData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Parent Phase',
        description: 'Parent Description',
        plan: {
          id: 'PH-001',
          title: 'Parent Phase',
          description: 'Parent Description',
        },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const childData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Child Task',
        description: 'Child Description',
        plan: {
          id: 'TK-001-001',
          title: 'Child Task',
          description: 'Child Description',
        },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const parent = new TierNode(parentData);
      const child = new TierNode(childData, parent);

      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);
      expect(parent.children.length).toBe(1);
    });

    it('should initialize state machine in pending state', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Test Phase',
        description: 'Test Description',
        plan: {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test Description',
        },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);

      expect(node.getState()).toBe('pending');
    });
  });

  describe('parent/child relationships', () => {
    let parent: TierNode;
    let child1: TierNode;
    let child2: TierNode;

    beforeEach(() => {
      const parentData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Parent',
        description: 'Parent Description',
        plan: { id: 'PH-001', title: 'Parent', description: 'Parent Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const child1Data: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Child 1',
        description: 'Child 1 Description',
        plan: { id: 'TK-001-001', title: 'Child 1', description: 'Child 1 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const child2Data: TierNodeData = {
        id: 'TK-001-002',
        type: 'task',
        title: 'Child 2',
        description: 'Child 2 Description',
        plan: { id: 'TK-001-002', title: 'Child 2', description: 'Child 2 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      parent = new TierNode(parentData);
      child1 = new TierNode(child1Data, parent);
      child2 = new TierNode(child2Data, parent);
    });

    it('should add child to parent', () => {
      expect(parent.children).toContain(child1);
      expect(parent.children).toContain(child2);
      expect(parent.children.length).toBe(2);
    });

    it('should set parent on child', () => {
      expect(child1.parent).toBe(parent);
      expect(child2.parent).toBe(parent);
    });

    it('should find child by ID', () => {
      const found = parent.findChild('TK-001-001');
      expect(found).toBe(child1);

      const notFound = parent.findChild('TK-999-999');
      expect(notFound).toBeNull();
    });

    it('should remove child by ID', () => {
      const removed = parent.removeChild('TK-001-001');
      expect(removed).toBe(true);
      expect(parent.children).not.toContain(child1);
      expect(parent.children.length).toBe(1);
      expect(child1.parent).toBeNull();
    });

    it('should not remove non-existent child', () => {
      const removed = parent.removeChild('TK-999-999');
      expect(removed).toBe(false);
      expect(parent.children.length).toBe(2);
    });

    it('should add child manually', () => {
      const newChildData: TierNodeData = {
        id: 'TK-001-003',
        type: 'task',
        title: 'Child 3',
        description: 'Child 3 Description',
        plan: { id: 'TK-001-003', title: 'Child 3', description: 'Child 3 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const newChild = new TierNode(newChildData);
      parent.addChild(newChild);

      expect(parent.children).toContain(newChild);
      expect(newChild.parent).toBe(parent);
    });

    it('should not add duplicate child', () => {
      const initialCount = parent.children.length;
      parent.addChild(child1);
      expect(parent.children.length).toBe(initialCount);
    });
  });

  describe('path methods', () => {
    it('should return path for root node', () => {
      const rootData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Root',
        description: 'Root Description',
        plan: { id: 'PH-001', title: 'Root', description: 'Root Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = new TierNode(rootData);

      expect(root.getPath()).toEqual(['PH-001']);
      expect(root.getPathString()).toBe('PH-001');
    });

    it('should return full path for nested node', () => {
      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const taskData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Task',
        description: 'Task Description',
        plan: { id: 'TK-001-001', title: 'Task', description: 'Task Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const subtaskData: TierNodeData = {
        id: 'ST-001-001-001',
        type: 'subtask',
        title: 'Subtask',
        description: 'Subtask Description',
        plan: { id: 'ST-001-001-001', title: 'Subtask', description: 'Subtask Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phase = new TierNode(phaseData);
      const task = new TierNode(taskData, phase);
      const subtask = new TierNode(subtaskData, task);

      expect(subtask.getPath()).toEqual(['PH-001', 'TK-001-001', 'ST-001-001-001']);
      expect(subtask.getPathString()).toBe('PH-001/TK-001-001/ST-001-001-001');
    });
  });

  describe('findDescendant', () => {
    it('should find self', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      expect(node.findDescendant('PH-001')).toBe(node);
    });

    it('should find direct child', () => {
      const parentData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Parent',
        description: 'Parent Description',
        plan: { id: 'PH-001', title: 'Parent', description: 'Parent Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const childData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Child',
        description: 'Child Description',
        plan: { id: 'TK-001-001', title: 'Child', description: 'Child Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const parent = new TierNode(parentData);
      const child = new TierNode(childData, parent);

      expect(parent.findDescendant('TK-001-001')).toBe(child);
    });

    it('should find deep descendant', () => {
      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const taskData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Task',
        description: 'Task Description',
        plan: { id: 'TK-001-001', title: 'Task', description: 'Task Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const subtaskData: TierNodeData = {
        id: 'ST-001-001-001',
        type: 'subtask',
        title: 'Subtask',
        description: 'Subtask Description',
        plan: { id: 'ST-001-001-001', title: 'Subtask', description: 'Subtask Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phase = new TierNode(phaseData);
      const task = new TierNode(taskData, phase);
      const subtask = new TierNode(subtaskData, task);

      expect(phase.findDescendant('ST-001-001-001')).toBe(subtask);
    });

    it('should return null for non-existent descendant', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      expect(node.findDescendant('TK-999-999')).toBeNull();
    });
  });

  describe('getAllDescendants', () => {
    it('should return empty array for leaf node', () => {
      const data: TierNodeData = {
        id: 'ST-001-001-001',
        type: 'subtask',
        title: 'Subtask',
        description: 'Subtask Description',
        plan: { id: 'ST-001-001-001', title: 'Subtask', description: 'Subtask Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      expect(node.getAllDescendants()).toEqual([]);
    });

    it('should return all descendants', () => {
      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const task1Data: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Task 1',
        description: 'Task 1 Description',
        plan: { id: 'TK-001-001', title: 'Task 1', description: 'Task 1 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const task2Data: TierNodeData = {
        id: 'TK-001-002',
        type: 'task',
        title: 'Task 2',
        description: 'Task 2 Description',
        plan: { id: 'TK-001-002', title: 'Task 2', description: 'Task 2 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phase = new TierNode(phaseData);
      const task1 = new TierNode(task1Data, phase);
      const task2 = new TierNode(task2Data, phase);

      const descendants = phase.getAllDescendants();
      expect(descendants).toContain(task1);
      expect(descendants).toContain(task2);
      expect(descendants.length).toBe(2);
    });
  });

  describe('getLeafNodes', () => {
    it('should return self for leaf node', () => {
      const data: TierNodeData = {
        id: 'ST-001-001-001',
        type: 'subtask',
        title: 'Subtask',
        description: 'Subtask Description',
        plan: { id: 'ST-001-001-001', title: 'Subtask', description: 'Subtask Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      const leaves = node.getLeafNodes();
      expect(leaves).toEqual([node]);
    });

    it('should return all leaf nodes', () => {
      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const taskData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Task',
        description: 'Task Description',
        plan: { id: 'TK-001-001', title: 'Task', description: 'Task Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const subtask1Data: TierNodeData = {
        id: 'ST-001-001-001',
        type: 'subtask',
        title: 'Subtask 1',
        description: 'Subtask 1 Description',
        plan: { id: 'ST-001-001-001', title: 'Subtask 1', description: 'Subtask 1 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const subtask2Data: TierNodeData = {
        id: 'ST-001-001-002',
        type: 'subtask',
        title: 'Subtask 2',
        description: 'Subtask 2 Description',
        plan: { id: 'ST-001-001-002', title: 'Subtask 2', description: 'Subtask 2 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phase = new TierNode(phaseData);
      const task = new TierNode(taskData, phase);
      const subtask1 = new TierNode(subtask1Data, task);
      const subtask2 = new TierNode(subtask2Data, task);

      const leaves = phase.getLeafNodes();
      expect(leaves).toContain(subtask1);
      expect(leaves).toContain(subtask2);
      expect(leaves.length).toBe(2);
    });
  });

  describe('state queries', () => {
    it('should check if node is pending', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      expect(node.isPending()).toBe(true);
      expect(node.isComplete()).toBe(false);
      expect(node.isFailed()).toBe(false);
    });

    it('should check if node is complete', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      // Transition to passed state
      node.stateMachine.send({ type: 'TIER_SELECTED' });
      node.stateMachine.send({ type: 'PLAN_APPROVED' });
      node.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });
      node.stateMachine.send({ type: 'GATE_PASSED' });

      expect(node.isComplete()).toBe(true);
      expect(node.isPending()).toBe(false);
      expect(node.isFailed()).toBe(false);
    });

    it('should check if node is failed', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      // Transition to failed state
      node.stateMachine.send({ type: 'TIER_SELECTED' });
      node.stateMachine.send({ type: 'PLAN_APPROVED' });
      node.stateMachine.send({ type: 'ITERATION_FAILED', error: 'Test error' });
      node.stateMachine.send({ type: 'MAX_ATTEMPTS' });

      expect(node.isFailed()).toBe(true);
      expect(node.isComplete()).toBe(false);
      expect(node.isPending()).toBe(false);
    });
  });

  describe('child counting', () => {
    it('should count completed children', () => {
      const parentData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Parent',
        description: 'Parent Description',
        plan: { id: 'PH-001', title: 'Parent', description: 'Parent Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const child1Data: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Child 1',
        description: 'Child 1 Description',
        plan: { id: 'TK-001-001', title: 'Child 1', description: 'Child 1 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const child2Data: TierNodeData = {
        id: 'TK-001-002',
        type: 'task',
        title: 'Child 2',
        description: 'Child 2 Description',
        plan: { id: 'TK-001-002', title: 'Child 2', description: 'Child 2 Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const parent = new TierNode(parentData);
      const child1 = new TierNode(child1Data, parent);
      const child2 = new TierNode(child2Data, parent);

      // Complete child1
      child1.stateMachine.send({ type: 'TIER_SELECTED' });
      child1.stateMachine.send({ type: 'PLAN_APPROVED' });
      child1.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });
      child1.stateMachine.send({ type: 'GATE_PASSED' });

      expect(parent.getCompletedChildCount()).toBe(1);
      expect(parent.getPendingChildCount()).toBe(1);
    });

    it('should return zero for empty children', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      expect(node.getCompletedChildCount()).toBe(0);
      expect(node.getPendingChildCount()).toBe(0);
    });
  });

  describe('toJSON', () => {
    it('should serialize node to JSON', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = new TierNode(data);
      const json = node.toJSON();

      expect(json.id).toBe('PH-001');
      expect(json.state).toBe('pending');
      expect(json.childIds).toEqual([]);
    });

    it('should include child IDs in JSON', () => {
      const parentData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Parent',
        description: 'Parent Description',
        plan: { id: 'PH-001', title: 'Parent', description: 'Parent Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const childData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Child',
        description: 'Child Description',
        plan: { id: 'TK-001-001', title: 'Child', description: 'Child Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const parent = new TierNode(parentData);
      new TierNode(childData, parent);

      const json = parent.toJSON();
      expect(json.childIds).toContain('TK-001-001');
    });
  });

  describe('createTierNode factory', () => {
    it('should create node using factory function', () => {
      const data: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase',
        description: 'Phase Description',
        plan: { id: 'PH-001', title: 'Phase', description: 'Phase Description' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const node = createTierNode(data);

      expect(node).toBeInstanceOf(TierNode);
      expect(node.id).toBe('PH-001');
    });
  });

  describe('buildTierTree', () => {
    it('should build tree from PRD', () => {
      const prd: PRD = {
        project: 'Test Project',
        version: '1.0.0',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        branchName: 'main',
        description: 'Test Description',
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Phase 1 Description',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: false },
            tasks: [
              {
                id: 'TK-001-001',
                phaseId: 'PH-001',
                title: 'Task 1',
                description: 'Task 1 Description',
                status: 'pending',
                priority: 1,
                acceptanceCriteria: [],
                testPlan: { commands: [], failFast: false },
                subtasks: [
                  {
                    id: 'ST-001-001-001',
                    taskId: 'TK-001-001',
                    title: 'Subtask 1',
                    description: 'Subtask 1 Description',
                    status: 'pending',
                    priority: 1,
                    acceptanceCriteria: [],
                    testPlan: { commands: [], failFast: false },
                    iterations: [],
                    maxIterations: 3,
                    createdAt: '2026-01-01T00:00:00Z',
                    notes: '',
                  },
                ],
                createdAt: '2026-01-01T00:00:00Z',
                notes: '',
              },
            ],
            createdAt: '2026-01-01T00:00:00Z',
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

      const root = buildTierTree(prd);

      expect(root.id).toBe(`root-${prd.project}`);
      expect(root.children.length).toBe(1);

      const phase = root.children[0];
      expect(phase.id).toBe('PH-001');
      expect(phase.children.length).toBe(1);

      const task = phase.children[0];
      expect(task.id).toBe('TK-001-001');
      expect(task.children.length).toBe(1);

      const subtask = task.children[0];
      expect(subtask.id).toBe('ST-001-001-001');
      expect(subtask.children.length).toBe(0);
    });

    it('should handle empty PRD', () => {
      const prd: PRD = {
        project: 'Empty Project',
        version: '1.0.0',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        branchName: 'main',
        description: 'Empty Description',
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

      const root = buildTierTree(prd);

      expect(root.id).toBe(`root-${prd.project}`);
      expect(root.children.length).toBe(0);
    });

    it('should convert PRD evidence to tier evidence', () => {
      const prd: PRD = {
        project: 'Test Project',
        version: '1.0.0',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        branchName: 'main',
        description: 'Test Description',
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Phase 1 Description',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: false },
            tasks: [],
            evidence: {
              collectedAt: '2026-01-01T01:00:00Z',
              items: [
                {
                  type: 'log',
                  path: '/path/to/log',
                  summary: 'Test log',
                },
              ],
            },
            createdAt: '2026-01-01T00:00:00Z',
            notes: '',
          },
        ],
        metadata: {
          totalPhases: 1,
          completedPhases: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalSubtasks: 0,
          completedSubtasks: 0,
        },
      };

      const root = buildTierTree(prd);
      const phase = root.children[0];

      expect(phase.data.evidence.length).toBe(1);
      expect(phase.data.evidence[0].type).toBe('log');
      expect(phase.data.evidence[0].path).toBe('/path/to/log');
      expect(phase.data.evidence[0].summary).toBe('Test log');
      expect(phase.data.evidence[0].timestamp).toBe('2026-01-01T01:00:00Z');
    });

    it('should calculate iterations from subtask iterations array', () => {
      const prd: PRD = {
        project: 'Test Project',
        version: '1.0.0',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        branchName: 'main',
        description: 'Test Description',
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Phase 1 Description',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: false },
            tasks: [
              {
                id: 'TK-001-001',
                phaseId: 'PH-001',
                title: 'Task 1',
                description: 'Task 1 Description',
                status: 'pending',
                priority: 1,
                acceptanceCriteria: [],
                testPlan: { commands: [], failFast: false },
                subtasks: [
                  {
                    id: 'ST-001-001-001',
                    taskId: 'TK-001-001',
                    title: 'Subtask 1',
                    description: 'Subtask 1 Description',
                    status: 'pending',
                    priority: 1,
                    acceptanceCriteria: [],
                    testPlan: { commands: [], failFast: false },
                    iterations: [
                      {
                        id: 'IT-001-001-001-001',
                        subtaskId: 'ST-001-001-001',
                        attemptNumber: 1,
                        status: 'succeeded',
                        startedAt: '2026-01-01T00:00:00Z',
                        platform: 'cursor',
                        model: 'gpt-4',
                        sessionId: 'PM-2026-01-01-00-00-00-001',
                        processId: 12345,
                      },
                      {
                        id: 'IT-001-001-001-002',
                        subtaskId: 'ST-001-001-001',
                        attemptNumber: 2,
                        status: 'succeeded',
                        startedAt: '2026-01-01T01:00:00Z',
                        platform: 'cursor',
                        model: 'gpt-4',
                        sessionId: 'PM-2026-01-01-01-00-00-001',
                        processId: 12346,
                      },
                    ],
                    maxIterations: 3,
                    createdAt: '2026-01-01T00:00:00Z',
                    notes: '',
                  },
                ],
                createdAt: '2026-01-01T00:00:00Z',
                notes: '',
              },
            ],
            createdAt: '2026-01-01T00:00:00Z',
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

      const root = buildTierTree(prd);
      const subtask = root.findDescendant('ST-001-001-001');

      expect(subtask).not.toBeNull();
      expect(subtask!.data.iterations).toBe(2);
      expect(subtask!.data.maxIterations).toBe(3);
    });
  });
});
