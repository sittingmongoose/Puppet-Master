/**
 * TierStateManager
 *
 * Manages the TierNode hierarchy (Phase → Task → Subtask) and provides
 * navigation, querying, and transition helpers.
 *
 * See ARCHITECTURE.md Section 5 (Tier State Manager).
 */

import type { TierEvent } from '../types/events.js';
import type { PRD, ItemStatus } from '../types/prd.js';
import type { TierState } from '../types/state.js';
import type { PrdManager } from '../memory/index.js';
import { TierNode, buildTierTree } from './tier-node.js';

export class TierStateManager {
  private root!: TierNode;
  private phases: Map<string, TierNode> = new Map();
  private tasks: Map<string, TierNode> = new Map();
  private subtasks: Map<string, TierNode> = new Map();

  private currentPhaseId: string | null = null;
  private currentTaskId: string | null = null;
  private currentSubtaskId: string | null = null;

  private readonly prdManager: PrdManager;

  constructor(prdManager: PrdManager) {
    this.prdManager = prdManager;
  }

  async initialize(): Promise<void> {
    const prd = await this.prdManager.load();

    this.root = buildTierTree(prd);
    this.phases = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();

    this.indexTree();
    this.restoreTierStatesFromPrd(prd);
    this.selectInitialCurrentIds(prd);
  }

  getRoot(): TierNode {
    return this.root;
  }

  getCurrentPhase(): TierNode | null {
    if (!this.currentPhaseId) {
      return null;
    }
    return this.phases.get(this.currentPhaseId) ?? null;
  }

  getCurrentTask(): TierNode | null {
    if (!this.currentTaskId) {
      return null;
    }
    return this.tasks.get(this.currentTaskId) ?? null;
  }

  getCurrentSubtask(): TierNode | null {
    if (!this.currentSubtaskId) {
      return null;
    }
    return this.subtasks.get(this.currentSubtaskId) ?? null;
  }

  setCurrentPhase(phaseId: string): void {
    const phase = this.getPhase(phaseId);
    if (!phase) {
      throw new Error(`Phase not found: ${phaseId}`);
    }

    this.currentPhaseId = phase.id;
    this.currentTaskId = null;
    this.currentSubtaskId = null;
  }

  setCurrentTask(taskId: string): void {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.currentTaskId = task.id;
    this.currentSubtaskId = null;

    const parentPhaseId = task.parent?.id ?? null;
    if (parentPhaseId && this.phases.has(parentPhaseId)) {
      this.currentPhaseId = parentPhaseId;
    }
  }

  setCurrentSubtask(subtaskId: string): void {
    const subtask = this.getSubtask(subtaskId);
    if (!subtask) {
      throw new Error(`Subtask not found: ${subtaskId}`);
    }

    this.currentSubtaskId = subtask.id;

    const parentTaskId = subtask.parent?.id ?? null;
    if (parentTaskId && this.tasks.has(parentTaskId)) {
      this.currentTaskId = parentTaskId;
    }

    const parentPhaseId = subtask.parent?.parent?.id ?? null;
    if (parentPhaseId && this.phases.has(parentPhaseId)) {
      this.currentPhaseId = parentPhaseId;
    }
  }

  getPhase(phaseId: string): TierNode | null {
    return this.phases.get(phaseId) ?? null;
  }

  getTask(taskId: string): TierNode | null {
    return this.tasks.get(taskId) ?? null;
  }

  getSubtask(subtaskId: string): TierNode | null {
    return this.subtasks.get(subtaskId) ?? null;
  }

  /**
   * Get a tier node by ID, regardless of type (phase, task, or subtask)
   */
  getTierById(tierId: string): TierNode | null {
    // Check phases first
    const phase = this.phases.get(tierId);
    if (phase) {
      return phase;
    }

    // Check tasks
    const task = this.tasks.get(tierId);
    if (task) {
      return task;
    }

    // Check subtasks
    const subtask = this.subtasks.get(tierId);
    if (subtask) {
      return subtask;
    }

    return null;
  }

  getAllPhases(): TierNode[] {
    return this.root.getChildren();
  }

  getAllTasks(phaseId?: string): TierNode[] {
    if (phaseId) {
      const phase = this.getPhase(phaseId);
      return phase ? phase.getChildren() : [];
    }

    const tasks: TierNode[] = [];
    for (const phase of this.getAllPhases()) {
      tasks.push(...phase.getChildren());
    }
    return tasks;
  }

  getAllSubtasks(taskId?: string): TierNode[] {
    if (taskId) {
      const task = this.getTask(taskId);
      return task ? task.getChildren() : [];
    }

    const subtasks: TierNode[] = [];
    for (const task of this.getAllTasks()) {
      subtasks.push(...task.getChildren());
    }
    return subtasks;
  }

  getNextPendingSubtask(taskNode?: TierNode): TierNode | null {
    const task = taskNode ?? this.getCurrentTask();
    if (task) {
      return task.getChildren().find((child) => child.getState() === 'pending') ?? null;
    }

    for (const candidateTask of this.getAllTasks()) {
      const next = candidateTask.getChildren().find((child) => child.getState() === 'pending');
      if (next) {
        return next;
      }
    }

    return null;
  }

  getNextPendingTask(phaseNode?: TierNode): TierNode | null {
    const phase = phaseNode ?? this.getCurrentPhase();
    if (phase) {
      return phase.getChildren().find((child) => child.getState() === 'pending') ?? null;
    }

    for (const candidatePhase of this.getAllPhases()) {
      const next = candidatePhase.getChildren().find((child) => child.getState() === 'pending');
      if (next) {
        return next;
      }
    }

    return null;
  }

  getNextPendingPhase(): TierNode | null {
    return this.getAllPhases().find((phase) => phase.getState() === 'pending') ?? null;
  }

  getFailedItems(): TierNode[] {
    return this.getAllIndexedNodesInOrder().filter((node) => node.isFailed());
  }

  getCompletedItems(): TierNode[] {
    return this.getAllIndexedNodesInOrder().filter((node) => node.isComplete());
  }

  transitionTier(tierId: string, event: TierEvent): boolean {
    const node = this.findNode(tierId);
    if (!node) {
      return false;
    }

    return node.stateMachine.send(event);
  }

  findNode(id: string): TierNode | null {
    if (this.root && this.root.id === id) {
      return this.root;
    }

    return this.phases.get(id) ?? this.tasks.get(id) ?? this.subtasks.get(id) ?? null;
  }

  async syncToPrd(): Promise<void> {
    const prd = await this.prdManager.load();

    for (const phase of prd.phases) {
      const phaseNode = this.phases.get(phase.id);
      if (phaseNode) {
        phase.status = TierStateManager.mapTierStateToItemStatus(phaseNode.getState());
        phase.tierContext = phaseNode.stateMachine.getContext();
        TierStateManager.updateTimestamps(phase, phase.status);
      }

      for (const task of phase.tasks) {
        const taskNode = this.tasks.get(task.id);
        if (taskNode) {
          task.status = TierStateManager.mapTierStateToItemStatus(taskNode.getState());
          task.tierContext = taskNode.stateMachine.getContext();
          TierStateManager.updateTimestamps(task, task.status);
        }

        for (const subtask of task.subtasks) {
          const subtaskNode = this.subtasks.get(subtask.id);
          if (subtaskNode) {
            subtask.status = TierStateManager.mapTierStateToItemStatus(subtaskNode.getState());
            subtask.tierContext = subtaskNode.stateMachine.getContext();
            TierStateManager.updateTimestamps(subtask, subtask.status);
          }
        }
      }
    }

    await this.prdManager.save(prd);
  }

  private indexTree(): void {
    for (const phase of this.root.getChildren()) {
      this.phases.set(phase.id, phase);

      for (const task of phase.getChildren()) {
        this.tasks.set(task.id, task);

        for (const subtask of task.getChildren()) {
          this.subtasks.set(subtask.id, subtask);
        }
      }
    }
  }

  private restoreTierStatesFromPrd(prd: PRD): void {
    for (const phase of prd.phases) {
      const phaseNode = this.phases.get(phase.id);
      if (phaseNode) {
        const desired = phase.tierContext?.state ?? TierStateManager.mapItemStatusToTierState(phase.status);
        TierStateManager.restoreStateMachineToState(phaseNode, desired);
      }

      for (const task of phase.tasks) {
        const taskNode = this.tasks.get(task.id);
        if (taskNode) {
          const desired = task.tierContext?.state ?? TierStateManager.mapItemStatusToTierState(task.status);
          TierStateManager.restoreStateMachineToState(taskNode, desired);
        }

        for (const subtask of task.subtasks) {
          const subtaskNode = this.subtasks.get(subtask.id);
          if (subtaskNode) {
            const desired =
              subtask.tierContext?.state ?? TierStateManager.mapItemStatusToTierState(subtask.status);
            TierStateManager.restoreStateMachineToState(subtaskNode, desired);
          }
        }
      }
    }
  }

  private selectInitialCurrentIds(prd: PRD): void {
    const restoredPhaseId = prd.orchestratorContext?.currentPhaseId ?? null;
    const restoredTaskId = prd.orchestratorContext?.currentTaskId ?? null;
    const restoredSubtaskId = prd.orchestratorContext?.currentSubtaskId ?? null;

    if (restoredSubtaskId && this.subtasks.has(restoredSubtaskId)) {
      this.setCurrentSubtask(restoredSubtaskId);
      return;
    }

    if (restoredTaskId && this.tasks.has(restoredTaskId)) {
      this.setCurrentTask(restoredTaskId);
      return;
    }

    if (restoredPhaseId && this.phases.has(restoredPhaseId)) {
      this.setCurrentPhase(restoredPhaseId);
      return;
    }

    const active = this.findFirstSubtaskInStates(prd, [
      'planning',
      'running',
      'retrying',
      'gating',
    ]);
    if (active) {
      this.setCurrentSubtask(active.id);
      return;
    }

    const pending = this.findFirstSubtaskInStates(prd, ['pending']);
    if (pending) {
      this.setCurrentSubtask(pending.id);
      return;
    }

    // If there are no subtasks, fall back to phases/tasks where possible
    const phasePending = this.getNextPendingPhase();
    if (phasePending) {
      this.setCurrentPhase(phasePending.id);
    }
  }

  private findFirstSubtaskInStates(prd: PRD, states: TierState[]): TierNode | null {
    for (const phase of prd.phases) {
      for (const task of phase.tasks) {
        for (const subtask of task.subtasks) {
          const node = this.subtasks.get(subtask.id);
          if (node && states.includes(node.getState())) {
            return node;
          }
        }
      }
    }

    return null;
  }

  private getAllIndexedNodesInOrder(): TierNode[] {
    const nodes: TierNode[] = [];

    for (const phase of this.getAllPhases()) {
      nodes.push(phase);
      for (const task of phase.getChildren()) {
        nodes.push(task);
        nodes.push(...task.getChildren());
      }
    }

    return nodes;
  }

  private static restoreStateMachineToState(node: TierNode, desired: TierState): void {
    node.stateMachine.reset();

    const events = TierStateManager.getEventsFromPendingToState(desired);
    for (const event of events) {
      node.stateMachine.send(event);
    }
  }

  private static getEventsFromPendingToState(desired: TierState): TierEvent[] {
    switch (desired) {
      case 'pending':
        return [];
      case 'planning':
        return [{ type: 'TIER_SELECTED' }];
      case 'running':
        return [{ type: 'TIER_SELECTED' }, { type: 'PLAN_APPROVED' }];
      case 'retrying':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_FAILED', error: 'Restored from PRD' },
        ];
      case 'gating':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
        ];
      case 'passed':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
          { type: 'GATE_PASSED' },
        ];
      case 'failed':
        return [{ type: 'TIER_SELECTED' }, { type: 'PLAN_APPROVED' }, { type: 'MAX_ATTEMPTS' }];
      case 'escalated':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
          { type: 'GATE_FAILED_MAJOR' },
        ];
      default: {
        const exhaustive: never = desired;
        return exhaustive;
      }
    }
  }

  private static mapItemStatusToTierState(status: ItemStatus): TierState {
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
      case 'skipped':
        return 'passed';
      case 'escalated':
        return 'escalated';
      case 'reopened':
        return 'pending';
      default: {
        const exhaustive: never = status;
        return exhaustive;
      }
    }
  }

  private static mapTierStateToItemStatus(state: TierState): ItemStatus {
    if (state === 'retrying') {
      return 'running';
    }

    switch (state) {
      case 'pending':
      case 'planning':
      case 'running':
      case 'gating':
      case 'passed':
      case 'failed':
      case 'escalated':
        return state;
      default: {
        const exhaustive: never = state;
        return exhaustive;
      }
    }
  }

  private static updateTimestamps(
    item: { startedAt?: string; completedAt?: string },
    status: ItemStatus
  ): void {
    const now = new Date().toISOString();

    if (status === 'running' && !item.startedAt) {
      item.startedAt = now;
    }

    if ((status === 'passed' || status === 'failed' || status === 'skipped' || status === 'escalated') && !item.completedAt) {
      item.completedAt = now;
    }

    if ((status === 'pending' || status === 'planning' || status === 'gating' || status === 'reopened') && item.completedAt) {
      item.completedAt = undefined;
    }
  }
}

