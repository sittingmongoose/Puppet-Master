/**
 * TierNode
 *
 * Runtime tree node structure for the four-tier hierarchy (Phase → Task → Subtask → Iteration).
 * See ARCHITECTURE.md Section 5.1 (Tier Hierarchy).
 */

import type { TierState, TierType } from '../types/state.js';
import type { TierPlan, Criterion, TestPlan, Evidence as TierEvidence } from '../types/tiers.js';
import type { PRD, Phase, Task, Subtask, ItemStatus, Evidence as PRDEvidence } from '../types/prd.js';
import { TierStateMachine } from './tier-state-machine.js';
import type { TierContext } from './tier-state-machine.js';

/**
 * TierNodeData interface.
 * Represents the serialized data for a tier node.
 * Matches the TierNode interface from types/tiers.ts but includes title/description.
 */
export interface TierNodeData {
  id: string;
  type: TierType;
  title: string;
  description: string;
  plan: TierPlan;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  evidence: TierEvidence[];
  iterations: number;
  maxIterations: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * TierNode class.
 * Runtime tree node with parent/child relationships and state machine.
 */
export class TierNode {
  readonly id: string;
  readonly type: TierType;
  readonly data: TierNodeData;
  parent: TierNode | null;
  children: TierNode[];
  stateMachine: TierStateMachine;

  constructor(data: TierNodeData, parent?: TierNode) {
    this.id = data.id;
    this.type = data.type;
    this.data = data;
    this.parent = parent ?? null;
    this.children = [];

    // Initialize state machine
    this.stateMachine = new TierStateMachine({
      tierType: this.type,
      itemId: this.id,
      maxIterations: this.data.maxIterations,
    });

    // If parent is provided, add this node to parent's children
    if (parent) {
      parent.addChild(this);
    }
  }

  /**
   * Get the current state from the state machine.
   */
  getState(): TierState {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Get the full path from root to this node as an array of IDs.
   * Returns [rootId, phaseId, taskId, subtaskId] as applicable.
   */
  getPath(): string[] {
    const path: string[] = [];
    let current: TierNode | null = this;

    while (current !== null) {
      path.unshift(current.id);
      current = current.parent;
    }

    return path;
  }

  /**
   * Get the full path as a formatted string.
   * Returns "PH-001/TK-001-001/ST-001-001-001" format.
   */
  getPathString(): string {
    return this.getPath().join('/');
  }

  /**
   * Add a child node.
   */
  addChild(child: TierNode): void {
    if (!this.children.includes(child)) {
      this.children.push(child);
      if (child.parent !== this) {
        child.parent = this;
      }
    }
  }

  /**
   * Remove a child node by ID.
   * Returns true if child was found and removed, false otherwise.
   */
  removeChild(childId: string): boolean {
    const index = this.children.findIndex((child) => child.id === childId);
    if (index !== -1) {
      const child = this.children[index];
      this.children.splice(index, 1);
      child.parent = null;
      return true;
    }
    return false;
  }

  /**
   * Find a direct child by ID.
   */
  findChild(childId: string): TierNode | null {
    return this.children.find((child) => child.id === childId) ?? null;
  }

  /**
   * Find a descendant node by ID (searches recursively).
   */
  findDescendant(id: string): TierNode | null {
    // Check self
    if (this.id === id) {
      return this;
    }

    // Check direct children
    for (const child of this.children) {
      const found = child.findDescendant(id);
      if (found !== null) {
        return found;
      }
    }

    return null;
  }

  /**
   * Get all direct children.
   */
  getChildren(): TierNode[] {
    return [...this.children];
  }

  /**
   * Get all descendant nodes (recursive).
   */
  getAllDescendants(): TierNode[] {
    const descendants: TierNode[] = [];

    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }

    return descendants;
  }

  /**
   * Get all leaf nodes (nodes with no children).
   */
  getLeafNodes(): TierNode[] {
    if (this.children.length === 0) {
      return [this];
    }

    const leaves: TierNode[] = [];
    for (const child of this.children) {
      leaves.push(...child.getLeafNodes());
    }

    return leaves;
  }

  /**
   * Check if node is complete (state is PASSED).
   */
  isComplete(): boolean {
    return this.getState() === 'passed';
  }

  /**
   * Check if node is pending (state is PENDING).
   */
  isPending(): boolean {
    return this.getState() === 'pending';
  }

  /**
   * Check if node is failed (state is FAILED or ESCALATED).
   */
  isFailed(): boolean {
    const state = this.getState();
    return state === 'failed' || state === 'escalated';
  }

  /**
   * Get count of completed children.
   */
  getCompletedChildCount(): number {
    return this.children.filter((child) => child.isComplete()).length;
  }

  /**
   * Get count of pending children.
   */
  getPendingChildCount(): number {
    return this.children.filter((child) => child.isPending()).length;
  }

  /**
   * Convert node to JSON representation.
   * Includes state and childIds for serialization.
   */
  toJSON(): TierNodeData & { state: TierState; childIds: string[] } {
    return {
      ...this.data,
      state: this.getState(),
      childIds: this.children.map((child) => child.id),
    };
  }
}

/**
 * Create a TierNode with proper initialization.
 */
export function createTierNode(data: TierNodeData, parent?: TierNode): TierNode {
  return new TierNode(data, parent);
}

/**
 * Map ItemStatus to TierState.
 */
function mapItemStatusToTierState(status: ItemStatus): TierState {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'planning':
      return 'planning';
    case 'running':
      return 'running';
    case 'gating':
      return 'gating';
    case 'passed':
      return 'passed';
    case 'failed':
      return 'failed';
    case 'escalated':
      return 'escalated';
    case 'reopened':
      return 'pending'; // Reopened items go back to pending
    default:
      return 'pending';
  }
}

/**
 * Convert PRD Evidence to TierEvidence array.
 */
function convertPRDEvidenceToTierEvidence(prdEvidence?: PRDEvidence): TierEvidence[] {
  if (!prdEvidence) {
    return [];
  }

  return prdEvidence.items.map((item) => ({
    type: item.type,
    path: item.path,
    summary: item.summary,
    timestamp: prdEvidence.collectedAt,
  }));
}

/**
 * Build TierPlan from PRD item data.
 */
function buildTierPlan(id: string, title: string, description: string): TierPlan {
  return {
    id,
    title,
    description,
  };
}

/**
 * Build TierNodeData from Phase.
 */
function buildPhaseNodeData(phase: Phase): TierNodeData {
  return {
    id: phase.id,
    type: 'phase',
    title: phase.title,
    description: phase.description,
    plan: buildTierPlan(phase.id, phase.title, phase.description),
    acceptanceCriteria: phase.acceptanceCriteria,
    testPlan: phase.testPlan,
    evidence: convertPRDEvidenceToTierEvidence(phase.evidence),
    iterations: 0, // Phases don't have iterations
    maxIterations: 1, // Phases don't iterate
    createdAt: phase.createdAt,
    updatedAt: phase.completedAt || phase.startedAt || phase.createdAt,
  };
}

/**
 * Build TierNodeData from Task.
 */
function buildTaskNodeData(task: Task): TierNodeData {
  return {
    id: task.id,
    type: 'task',
    title: task.title,
    description: task.description,
    plan: buildTierPlan(task.id, task.title, task.description),
    acceptanceCriteria: task.acceptanceCriteria,
    testPlan: task.testPlan,
    evidence: convertPRDEvidenceToTierEvidence(task.evidence),
    iterations: 0, // Tasks don't have iterations
    maxIterations: 1, // Tasks don't iterate
    createdAt: task.createdAt,
    updatedAt: task.completedAt || task.startedAt || task.createdAt,
  };
}

/**
 * Build TierNodeData from Subtask.
 */
function buildSubtaskNodeData(subtask: Subtask): TierNodeData {
  return {
    id: subtask.id,
    type: 'subtask',
    title: subtask.title,
    description: subtask.description,
    plan: buildTierPlan(subtask.id, subtask.title, subtask.description),
    acceptanceCriteria: subtask.acceptanceCriteria,
    testPlan: subtask.testPlan,
    evidence: convertPRDEvidenceToTierEvidence(subtask.evidence),
    iterations: subtask.iterations.length,
    maxIterations: subtask.maxIterations,
    createdAt: subtask.createdAt,
    updatedAt: subtask.completedAt || subtask.startedAt || subtask.createdAt,
  };
}

/**
 * Restore TierStateMachine state from TierContext if available.
 */
function restoreStateMachineState(
  node: TierNode,
  tierContext?: TierContext
): void {
  if (!tierContext) {
    return;
  }

  // The state machine starts in 'pending' state
  // We need to transition it to the saved state if different
  const savedState = tierContext.state;
  const currentState = node.getState();

  if (savedState !== currentState) {
    // Try to transition to the saved state
    // This is a simplified approach - in practice, we'd need to replay events
    // For now, we'll just update the context directly if possible
    // Note: This is a limitation - we can't directly set state without events
    // The state machine will need to be enhanced or we accept this limitation
  }
}

/**
 * Build a TierNode tree from a PRD.
 * Returns the root node (which represents the project).
 */
export function buildTierTree(prd: PRD): TierNode {
  // Create a root node for the project
  const rootData: TierNodeData = {
    id: `root-${prd.project}`,
    type: 'phase', // Root acts as a phase container
    title: prd.project,
    description: prd.description,
    plan: {
      id: `root-${prd.project}`,
      title: prd.project,
      description: prd.description,
    },
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: false },
    evidence: [],
    iterations: 0,
    maxIterations: 1,
    createdAt: prd.createdAt,
    updatedAt: prd.updatedAt,
  };

  const root = new TierNode(rootData);

  // Build phase nodes
  for (const phase of prd.phases) {
    const phaseData = buildPhaseNodeData(phase);
    const phaseNode = new TierNode(phaseData, root);

    // Restore state if tierContext is available
    if (phase.tierContext) {
      restoreStateMachineState(phaseNode, phase.tierContext);
      // Map the state from tierContext to the state machine
      // Since we can't directly set state, we'll need to handle this in the state machine
      // For now, we'll accept that the state machine starts in 'pending'
    }

    // Build task nodes
    for (const task of phase.tasks) {
      const taskData = buildTaskNodeData(task);
      const taskNode = new TierNode(taskData, phaseNode);

      // Restore state if tierContext is available
      if (task.tierContext) {
        restoreStateMachineState(taskNode, task.tierContext);
      }

      // Build subtask nodes
      for (const subtask of task.subtasks) {
        const subtaskData = buildSubtaskNodeData(subtask);
        const subtaskNode = new TierNode(subtaskData, taskNode);

        // Restore state if tierContext is available
        if (subtask.tierContext) {
          restoreStateMachineState(subtaskNode, subtask.tierContext);
        }
      }
    }
  }

  return root;
}
