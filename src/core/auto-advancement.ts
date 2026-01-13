/**
 * AutoAdvancement
 *
 * Implements automatic advancement decisions when subtasks/tasks/phases complete.
 *
 * See:
 * - ARCHITECTURE.md Section 5.2 (Auto-Advancement Logic)
 * - REQUIREMENTS.md Section 7 (Auto-Progression Requirements)
 */

import type { TierEvent } from '../types/events.js';
import type { GateReport, GateResult } from '../types/tiers.js';
import { TierNode } from './tier-node.js';
import { TierStateManager } from './tier-state-manager.js';

export type AdvancementAction =
  | 'continue'
  | 'advance_subtask'
  | 'advance_task'
  | 'advance_phase'
  | 'run_task_gate'
  | 'run_phase_gate'
  | 'complete'
  | 'task_gate_failed'
  | 'phase_gate_failed';

export interface AdvancementResult {
  action: AdvancementAction;
  next?: TierNode;
  gate?: GateResult;
  message: string;
}

export class AutoAdvancement {
  private readonly tierStateManager: TierStateManager;

  constructor(tierStateManager: TierStateManager) {
    this.tierStateManager = tierStateManager;
  }

  async checkAndAdvance(): Promise<AdvancementResult> {
    const currentSubtask = this.tierStateManager.getCurrentSubtask();
    if (currentSubtask) {
      return this.checkSubtaskCompletion(currentSubtask);
    }

    const currentTask = this.tierStateManager.getCurrentTask();
    if (currentTask) {
      return this.checkTaskCompletion(currentTask);
    }

    const currentPhase = this.tierStateManager.getCurrentPhase();
    if (currentPhase) {
      return this.checkPhaseCompletion(currentPhase);
    }

    const failed = this.getFirstFailedItem();
    if (failed) {
      return {
        action: 'continue',
        next: failed,
        message: `No current selection; found failed item ${failed.id} (state: ${failed.getState()}).`,
      };
    }

    const nextSubtask = this.tierStateManager.getNextPendingSubtask();
    if (nextSubtask) {
      return {
        action: 'continue',
        next: nextSubtask,
        message: `No current selection; continuing with pending subtask ${nextSubtask.id}.`,
      };
    }

    const nextPhase = this.getNextPhase();
    if (nextPhase) {
      return {
        action: 'advance_phase',
        next: nextPhase,
        message: `No current selection; advancing to phase ${nextPhase.id}.`,
      };
    }

    return this.getProjectCompletionResult();
  }

  async checkSubtaskCompletion(subtask: TierNode): Promise<AdvancementResult> {
    const state = subtask.getState();
    if (state !== 'passed') {
      return {
        action: 'continue',
        next: subtask,
        message: `Subtask ${subtask.id} not complete (state: ${state}).`,
      };
    }

    const task = subtask.parent;
    if (!task) {
      return {
        action: 'continue',
        next: subtask,
        message: `Subtask ${subtask.id} has no parent task; cannot advance.`,
      };
    }

    const nextSubtask = this.getNextSubtask(task);
    if (nextSubtask) {
      return {
        action: 'continue',
        next: nextSubtask,
        message: `Subtask ${subtask.id} passed; continuing with next subtask ${nextSubtask.id}.`,
      };
    }

    if (!this.allChildrenComplete(task)) {
      return {
        action: 'continue',
        next: subtask,
        message: `Task ${task.id} still has incomplete subtasks; not ready for task gate.`,
      };
    }

    const taskGate = await this.runTaskGate(task);
    if (!taskGate.passed) {
      return {
        action: 'task_gate_failed',
        gate: taskGate,
        message: `Task gate failed for ${task.id}.`,
      };
    }

    this.markTierPassed(task);

    const phase = task.parent;
    if (!phase) {
      return {
        action: 'complete',
        message: `Task gate passed for ${task.id}, but no parent phase found.`,
      };
    }

    const nextTask = this.getNextTask(phase);
    if (nextTask) {
      return {
        action: 'advance_task',
        next: nextTask,
        message: `Task gate passed for ${task.id}; advancing to task ${nextTask.id}.`,
      };
    }

    if (!this.allChildrenComplete(phase)) {
      return {
        action: 'continue',
        next: subtask,
        message: `Phase ${phase.id} still has incomplete tasks; not ready for phase gate.`,
      };
    }

    const phaseGate = await this.runPhaseGate(phase);
    if (!phaseGate.passed) {
      return {
        action: 'phase_gate_failed',
        gate: phaseGate,
        message: `Phase gate failed for ${phase.id}.`,
      };
    }

    this.markTierPassed(phase);

    const nextPhase = this.getNextPhase();
    if (nextPhase) {
      return {
        action: 'advance_phase',
        next: nextPhase,
        message: `Phase gate passed for ${phase.id}; advancing to phase ${nextPhase.id}.`,
      };
    }

    return this.getProjectCompletionResult();
  }

  async checkTaskCompletion(task: TierNode): Promise<AdvancementResult> {
    const state = task.getState();
    if (state !== 'passed') {
      return {
        action: 'continue',
        next: task,
        message: `Task ${task.id} not complete (state: ${state}).`,
      };
    }

    const phase = task.parent;
    if (!phase) {
      return { action: 'complete', message: `Task ${task.id} passed, but no parent phase found.` };
    }

    const nextTask = this.getNextTask(phase);
    if (nextTask) {
      return {
        action: 'advance_task',
        next: nextTask,
        message: `Task ${task.id} passed; advancing to task ${nextTask.id}.`,
      };
    }

    if (!this.allChildrenComplete(phase)) {
      return {
        action: 'continue',
        next: task,
        message: `Phase ${phase.id} still has incomplete tasks; not ready for phase gate.`,
      };
    }

    const phaseGate = await this.runPhaseGate(phase);
    if (!phaseGate.passed) {
      return {
        action: 'phase_gate_failed',
        gate: phaseGate,
        message: `Phase gate failed for ${phase.id}.`,
      };
    }

    this.markTierPassed(phase);

    const nextPhase = this.getNextPhase();
    if (nextPhase) {
      return {
        action: 'advance_phase',
        next: nextPhase,
        message: `Phase gate passed for ${phase.id}; advancing to phase ${nextPhase.id}.`,
      };
    }

    return this.getProjectCompletionResult();
  }

  async checkPhaseCompletion(phase: TierNode): Promise<AdvancementResult> {
    const state = phase.getState();
    if (state !== 'passed') {
      return {
        action: 'continue',
        next: phase,
        message: `Phase ${phase.id} not complete (state: ${state}).`,
      };
    }

    const nextPhase = this.getNextPhase();
    if (nextPhase) {
      return {
        action: 'advance_phase',
        next: nextPhase,
        message: `Phase ${phase.id} passed; advancing to phase ${nextPhase.id}.`,
      };
    }

    return this.getProjectCompletionResult();
  }

  async runTaskGate(task: TierNode): Promise<GateResult> {
    const report: GateReport = {
      gateId: `task-gate-${task.id}`,
      timestamp: new Date().toISOString(),
      verifiersRun: [],
      overallPassed: false,
    };

    return { passed: false, report, failureReason: 'Task gate runner not implemented.' };
  }

  async runPhaseGate(phase: TierNode): Promise<GateResult> {
    const report: GateReport = {
      gateId: `phase-gate-${phase.id}`,
      timestamp: new Date().toISOString(),
      verifiersRun: [],
      overallPassed: false,
    };

    return { passed: false, report, failureReason: 'Phase gate runner not implemented.' };
  }

  private getNextSubtask(task: TierNode): TierNode | null {
    return this.tierStateManager.getNextPendingSubtask(task);
  }

  private getNextTask(phase: TierNode): TierNode | null {
    return this.tierStateManager.getNextPendingTask(phase);
  }

  private getNextPhase(): TierNode | null {
    return this.tierStateManager.getNextPendingPhase();
  }

  private allChildrenComplete(node: TierNode): boolean {
    const children = node.getChildren();
    if (children.length === 0) {
      return true;
    }

    return children.every((child) => child.getState() === 'passed');
  }

  private getProjectCompletionResult(): AdvancementResult {
    if (this.areAllPhasesPassed()) {
      return { action: 'complete', message: 'All phases complete.' };
    }

    const failed = this.getFirstFailedItem();
    if (failed) {
      return {
        action: 'continue',
        next: failed,
        message: `Project not complete; found failed item ${failed.id} (state: ${failed.getState()}).`,
      };
    }

    const phase = this.getFirstNonPassedPhase();
    if (phase) {
      return {
        action: 'continue',
        next: phase,
        message: `Project not complete; phase ${phase.id} is in state ${phase.getState()}.`,
      };
    }

    return { action: 'continue', message: 'Project not complete; no next tier resolved.' };
  }

  private areAllPhasesPassed(): boolean {
    return this.tierStateManager.getAllPhases().every((phase) => phase.getState() === 'passed');
  }

  private getFirstNonPassedPhase(): TierNode | null {
    return this.tierStateManager.getAllPhases().find((phase) => phase.getState() !== 'passed') ?? null;
  }

  private getFirstFailedItem(): TierNode | null {
    return this.tierStateManager.getFailedItems()[0] ?? null;
  }

  private markTierPassed(node: TierNode): void {
    if (node.getState() === 'passed') {
      return;
    }

    const events: TierEvent[] = [
      { type: 'TIER_SELECTED' },
      { type: 'PLAN_APPROVED' },
      { type: 'ITERATION_COMPLETE', success: true },
      { type: 'GATE_PASSED' },
    ];

    for (const event of events) {
      node.stateMachine.send(event);
    }
  }
}
