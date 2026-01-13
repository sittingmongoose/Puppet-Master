/**
 * Escalation
 *
 * Implements decision logic for handling failures at gates and during execution.
 *
 * See:
 * - REQUIREMENTS.md Section 6.2 (Task-tier failure handling)
 * - REQUIREMENTS.md Section 7.3 (Failure Handling at Gates)
 * - ARCHITECTURE.md Section 5.3 (Gate Execution)
 */

import { PrdManager } from '../memory/index.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { TierType } from '../types/state.js';
import type { GateResult, Criterion, TestCommand, TestPlan } from '../types/tiers.js';
import type { PRD, Phase, Subtask, Task } from '../types/prd.js';
import { TierNode } from './tier-node.js';
import { TierStateManager } from './tier-state-manager.js';

export type EscalationAction = 'self_fix' | 'kick_down' | 'escalate' | 'pause';

export interface EscalationDecision {
  action: EscalationAction;
  reason: string;
  newSubtasks?: SubtaskSpec[];
  newTasks?: TaskSpec[];
  reopenTaskIds?: string[];
  escalateTo?: TierType;
  selfFixInstructions?: string;
}

export interface SubtaskSpec {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  testCommands: string[];
}

export interface TaskSpec {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  testCommands: string[];
}

export interface FailureContext {
  tier: TierNode;
  gateResult: GateResult;
  failureType: 'test' | 'acceptance' | 'timeout' | 'error';
  failureCount: number;
  maxAttempts: number;
}

export interface EscalationConfig {
  selfFixEnabled: boolean;
  maxSelfFixAttempts: number;
  kickDownEnabled: boolean;
  escalateAfterAttempts: number;
}

export class Escalation {
  private readonly tierStateManager: TierStateManager;
  private readonly config: PuppetMasterConfig;
  private readonly prdManager: PrdManager;

  constructor(tierStateManager: TierStateManager, config: PuppetMasterConfig) {
    this.tierStateManager = tierStateManager;
    this.config = config;
    this.prdManager = new PrdManager(config.memory.prdFile);
  }

  determineAction(context: FailureContext): EscalationDecision {
    const escalationConfig = this.resolveEscalationConfig(context);
    const failureReason = context.gateResult.failureReason ?? 'No failureReason provided.';

    if (context.failureCount >= escalationConfig.escalateAfterAttempts || context.failureCount >= context.maxAttempts) {
      return this.createEscalateDecision(context, `Exceeded attempt limits: ${failureReason}`);
    }

    if (this.isSelfFixable(context, escalationConfig)) {
      return {
        action: 'self_fix',
        reason: `Minor ${context.failureType} failure; attempting self-fix (attempt ${context.failureCount + 1}/${escalationConfig.maxSelfFixAttempts}).`,
        selfFixInstructions: this.buildSelfFixInstructions(context),
      };
    }

    if (this.shouldKickDown(context, escalationConfig)) {
      if (context.tier.type === 'phase') {
        const reopenTaskIds = this.extractReferencedTaskIds(failureReason).filter((taskId) =>
          taskId.startsWith('TK-')
        );
        const tasks = this.generateKickDownTasks(context);

        return {
          action: 'kick_down',
          reason: `Failure can be delegated to task-tier work: ${failureReason}`,
          newTasks: tasks,
          reopenTaskIds,
        };
      }

      const subtasks = this.generateKickDownSubtasks(context);
      return {
        action: 'kick_down',
        reason: `Failure can be delegated to new subtasks: ${failureReason}`,
        newSubtasks: subtasks,
      };
    }

    if (context.failureType === 'timeout') {
      return {
        action: 'pause',
        reason: `Timeout failure requires intervention or configuration changes: ${failureReason}`,
      };
    }

    return this.createEscalateDecision(context, `Escalating due to failure type or configuration: ${failureReason}`);
  }

  async executeSelfFix(decision: EscalationDecision, tier: TierNode): Promise<void> {
    if (decision.action !== 'self_fix') {
      throw new Error(`executeSelfFix called with non-self_fix decision: ${decision.action}`);
    }

    if (tier.getState() === 'gating') {
      tier.stateMachine.send({ type: 'GATE_FAILED_MINOR' });
    } else if (tier.getState() === 'failed') {
      tier.stateMachine.send({ type: 'RETRY' });
    }

    await this.tierStateManager.syncToPrd();
  }

  async executeKickDown(decision: EscalationDecision, tier: TierNode): Promise<void> {
    if (decision.action !== 'kick_down') {
      throw new Error(`executeKickDown called with non-kick_down decision: ${decision.action}`);
    }

    await this.tierStateManager.syncToPrd();

    const prd = await this.prdManager.load();

    if (tier.type === 'task') {
      const specs = decision.newSubtasks ?? [];
      if (specs.length === 0) {
        throw new Error('Kick-down decision did not include any newSubtasks.');
      }

      const task = Escalation.findTaskInPrd(prd, tier.id);
      if (!task) {
        throw new Error(`Task not found in PRD for kick-down: ${tier.id}`);
      }

      this.appendKickDownSubtasks(task, specs, decision.reason);
      await this.prdManager.save(prd);
      await this.tierStateManager.initialize();
      return;
    }

    if (tier.type === 'phase') {
      const phase = Escalation.findPhaseInPrd(prd, tier.id);
      if (!phase) {
        throw new Error(`Phase not found in PRD for kick-down: ${tier.id}`);
      }

      const reopenIds = decision.reopenTaskIds ?? [];
      const createdTasks = decision.newTasks ?? [];

      if (reopenIds.length === 0 && createdTasks.length === 0) {
        throw new Error('Kick-down decision did not include any newTasks or reopenTaskIds.');
      }

      const reopenSubtaskSpec = this.buildPhaseKickDownSubtaskSpec(tier, decision.reason);
      for (const taskId of reopenIds) {
        const task = phase.tasks.find((candidate) => candidate.id === taskId);
        if (!task) {
          continue;
        }

        task.status = 'reopened';
        task.completedAt = undefined;
        task.notes = `${task.notes}\n\nReopened: ${decision.reason}`;
        this.appendKickDownSubtasks(task, [reopenSubtaskSpec], decision.reason);
      }

      if (createdTasks.length > 0) {
        this.appendKickDownTasks(phase, createdTasks, decision.reason);
      }

      await this.prdManager.save(prd);
      await this.tierStateManager.initialize();
      return;
    }

    throw new Error(`Kick-down is only supported for phase/task tiers; got ${tier.type} (${tier.id}).`);
  }

  async executeEscalate(decision: EscalationDecision, tier: TierNode): Promise<void> {
    if (decision.action !== 'escalate') {
      throw new Error(`executeEscalate called with non-escalate decision: ${decision.action}`);
    }

    if (tier.getState() === 'gating') {
      tier.stateMachine.send({ type: 'GATE_FAILED_MAJOR' });
    }

    const targetType = decision.escalateTo ?? this.getEscalationTarget(tier);
    const targetNode = Escalation.findAncestorOfType(tier, targetType);

    if (!targetNode) {
      return;
    }

    switch (targetType) {
      case 'phase':
        this.tierStateManager.setCurrentPhase(targetNode.id);
        break;
      case 'task':
        this.tierStateManager.setCurrentTask(targetNode.id);
        break;
      case 'subtask':
        this.tierStateManager.setCurrentSubtask(targetNode.id);
        break;
      case 'iteration':
        break;
      default: {
        const exhaustive: never = targetType;
        throw new Error(`Unhandled escalation target: ${exhaustive}`);
      }
    }

    await this.tierStateManager.syncToPrd();
  }

  private resolveEscalationConfig(context: FailureContext): EscalationConfig {
    const tierConfig = this.config.tiers[context.tier.type];

    return {
      selfFixEnabled: tierConfig.selfFix,
      maxSelfFixAttempts: Escalation.toPositiveInt(tierConfig.maxIterations, 1),
      kickDownEnabled: context.tier.type === 'task' || context.tier.type === 'phase',
      escalateAfterAttempts: Escalation.toPositiveInt(context.maxAttempts, 1),
    };
  }

  private isSelfFixable(context: FailureContext, config: EscalationConfig): boolean {
    if (!config.selfFixEnabled) {
      return false;
    }

    if (!Escalation.isMinorFailure(context.failureType)) {
      return false;
    }

    if (context.failureCount >= config.maxSelfFixAttempts) {
      return false;
    }

    return context.failureCount < context.maxAttempts;
  }

  private shouldKickDown(context: FailureContext, config: EscalationConfig): boolean {
    if (!config.kickDownEnabled) {
      return false;
    }

    if (!Escalation.isMinorFailure(context.failureType)) {
      return false;
    }

    return context.tier.type === 'task' || context.tier.type === 'phase';
  }

  private generateKickDownSubtasks(context: FailureContext): SubtaskSpec[] {
    const failureReason = context.gateResult.failureReason ?? 'No failureReason provided.';
    const testCommands = Escalation.getTestCommandsFromTier(context.tier);

    switch (context.failureType) {
      case 'test':
        return [
          {
            title: `Fix failing tests for ${context.tier.id}`,
            description: `Gate failed due to test failures.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Task-level test plan passes.',
              'No new failing tests introduced.',
            ],
            testCommands,
          },
        ];
      case 'acceptance':
        return [
          {
            title: `Fix acceptance criteria for ${context.tier.id}`,
            description: `Gate failed due to unmet acceptance criteria.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Task-level acceptance criteria are satisfied.',
              'Any necessary evidence is captured.',
            ],
            testCommands,
          },
        ];
      case 'timeout':
      case 'error':
        return [
          {
            title: `Triage ${context.failureType} failure for ${context.tier.id}`,
            description: `Gate failed due to ${context.failureType}.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Root cause is identified and documented.',
              'A concrete fix or mitigation plan is proposed.',
            ],
            testCommands,
          },
        ];
      default: {
        const exhaustive: never = context.failureType;
        throw new Error(`Unhandled failure type: ${exhaustive}`);
      }
    }
  }

  private generateKickDownTasks(context: FailureContext): TaskSpec[] {
    const failureReason = context.gateResult.failureReason ?? 'No failureReason provided.';
    const testCommands = Escalation.getTestCommandsFromTier(context.tier);

    switch (context.failureType) {
      case 'test':
        return [
          {
            title: `Fix failing tests for phase ${context.tier.id}`,
            description: `Phase gate failed due to test failures.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Phase-level test plan passes.',
              'No new failing tests introduced.',
            ],
            testCommands,
          },
        ];
      case 'acceptance':
        return [
          {
            title: `Fix acceptance criteria for phase ${context.tier.id}`,
            description: `Phase gate failed due to unmet acceptance criteria.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Phase-level acceptance criteria are satisfied.',
              'Any necessary evidence is captured.',
            ],
            testCommands,
          },
        ];
      case 'timeout':
      case 'error':
        return [
          {
            title: `Triage ${context.failureType} failure for phase ${context.tier.id}`,
            description: `Phase gate failed due to ${context.failureType}.\n\nReason: ${failureReason}`,
            acceptanceCriteria: [
              'Root cause is identified and documented.',
              'A concrete fix or mitigation plan is proposed.',
            ],
            testCommands,
          },
        ];
      default: {
        const exhaustive: never = context.failureType;
        throw new Error(`Unhandled failure type: ${exhaustive}`);
      }
    }
  }

  private getEscalationTarget(tier: TierNode): TierType {
    const tierConfig = this.config.tiers[tier.type];
    const configured = tierConfig.escalation;

    if (configured) {
      return configured as TierType;
    }

    if (tier.parent) {
      return tier.parent.type;
    }

    return tier.type;
  }

  private createEscalateDecision(context: FailureContext, reason: string): EscalationDecision {
    const target = this.getEscalationTarget(context.tier);
    const canEscalate = target !== context.tier.type || Boolean(context.tier.parent);

    if (!canEscalate) {
      return { action: 'pause', reason: `Cannot escalate beyond ${context.tier.type}: ${reason}` };
    }

    return { action: 'escalate', reason, escalateTo: target };
  }

  private buildSelfFixInstructions(context: FailureContext): string {
    const failureReason = context.gateResult.failureReason ?? 'No failureReason provided.';
    const commands = Escalation.getTestCommandsFromTier(context.tier);
    const commandsBlock = commands.length > 0 ? `\n\nRe-run:\n- ${commands.join('\n- ')}` : '';

    return `Investigate and fix the ${context.failureType} failure for ${context.tier.id}.\n\nReason: ${failureReason}${commandsBlock}`;
  }

  private buildPhaseKickDownSubtaskSpec(phase: TierNode, reason: string): SubtaskSpec {
    const testCommands = Escalation.getTestCommandsFromTier(phase);
    return {
      title: `Remediate phase gate failure for ${phase.id}`,
      description: `Phase gate failed. Investigate and fix within this task.\n\nReason: ${reason}`,
      acceptanceCriteria: [
        'Phase gate passes.',
        'Evidence is recorded for the gate rerun.',
      ],
      testCommands,
    };
  }

  private appendKickDownSubtasks(task: Task, specs: SubtaskSpec[], reason: string): void {
    const prefix = Escalation.getSubtaskIdPrefix(task.id);
    if (!prefix) {
      throw new Error(`Unsupported task id format for kick-down: ${task.id}`);
    }

    const { nextIndex, indexWidth } = Escalation.getNextSubtaskIndex(task.subtasks, prefix);
    let currentIndex = nextIndex;
    let currentPriority = Escalation.getNextPriority(task.subtasks);
    const now = new Date().toISOString();
    const maxIterations = Escalation.toPositiveInt(this.config.tiers.subtask.maxIterations, 1);

    for (const spec of specs) {
      const subtaskId = Escalation.allocateUniqueSubtaskId(task.subtasks, prefix, () => {
        const id = `${prefix}-${String(currentIndex).padStart(indexWidth, '0')}`;
        currentIndex += 1;
        return id;
      });

      const subtask: Subtask = {
        id: subtaskId,
        taskId: task.id,
        title: spec.title,
        description: spec.description,
        status: 'pending',
        priority: currentPriority,
        acceptanceCriteria: Escalation.buildCriteria(subtaskId, spec.acceptanceCriteria),
        testPlan: Escalation.buildTestPlan(spec.testCommands),
        iterations: [],
        maxIterations,
        createdAt: now,
        notes: `Kick-down created: ${reason}`,
      };

      currentPriority += 1;
      task.subtasks.push(subtask);
    }
  }

  private appendKickDownTasks(phase: Phase, specs: TaskSpec[], reason: string): void {
    const prefix = Escalation.getTaskIdPrefix(phase.id);
    if (!prefix) {
      throw new Error(`Unsupported phase id format for kick-down: ${phase.id}`);
    }

    const { nextIndex, indexWidth } = Escalation.getNextTaskIndex(phase.tasks, prefix);
    let currentIndex = nextIndex;
    let currentPriority = Escalation.getNextPriority(phase.tasks);
    const now = new Date().toISOString();
    const maxIterations = Escalation.toPositiveInt(this.config.tiers.subtask.maxIterations, 1);

    for (const spec of specs) {
      const taskId = Escalation.allocateUniqueTaskId(phase.tasks, prefix, () => {
        const id = `${prefix}-${String(currentIndex).padStart(indexWidth, '0')}`;
        currentIndex += 1;
        return id;
      });

      const subtaskIdPrefix = Escalation.getSubtaskIdPrefix(taskId);
      if (!subtaskIdPrefix) {
        throw new Error(`Unable to derive subtask id prefix from task id ${taskId}`);
      }

      const subtask: Subtask = {
        id: `${subtaskIdPrefix}-001`,
        taskId,
        title: spec.title,
        description: spec.description,
        status: 'pending',
        priority: 1,
        acceptanceCriteria: Escalation.buildCriteria(`${subtaskIdPrefix}-001`, spec.acceptanceCriteria),
        testPlan: Escalation.buildTestPlan(spec.testCommands),
        iterations: [],
        maxIterations,
        createdAt: now,
        notes: `Kick-down created: ${reason}`,
      };

      const task: Task = {
        id: taskId,
        phaseId: phase.id,
        title: spec.title,
        description: spec.description,
        status: 'pending',
        priority: currentPriority,
        acceptanceCriteria: Escalation.buildCriteria(taskId, spec.acceptanceCriteria),
        testPlan: Escalation.buildTestPlan(spec.testCommands),
        subtasks: [subtask],
        createdAt: now,
        notes: `Kick-down created: ${reason}`,
      };

      currentPriority += 1;
      phase.tasks.push(task);
    }
  }

  private static findTaskInPrd(prd: PRD, taskId: string): Task | null {
    for (const phase of prd.phases) {
      const task = phase.tasks.find((candidate) => candidate.id === taskId);
      if (task) {
        return task;
      }
    }

    return null;
  }

  private static findPhaseInPrd(prd: PRD, phaseId: string): Phase | null {
    return prd.phases.find((phase) => phase.id === phaseId) ?? null;
  }

  private static findAncestorOfType(node: TierNode, type: TierType): TierNode | null {
    let current: TierNode | null = node;
    while (current) {
      if (current.type === type) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private static buildCriteria(subtaskId: string, criteria: string[]): Criterion[] {
    return criteria.map((description, index) => ({
      id: `${subtaskId}-AC-${String(index + 1).padStart(3, '0')}`,
      description,
      type: 'manual',
      target: 'manual',
    }));
  }

  private static buildTestPlan(testCommands: string[]): TestPlan {
    const commands: TestCommand[] = testCommands.map((command) => ({ command }));
    return { commands, failFast: true };
  }

  private static isMinorFailure(failureType: FailureContext['failureType']): boolean {
    return failureType === 'test' || failureType === 'acceptance';
  }

  private static getTestCommandsFromTier(tier: TierNode): string[] {
    return tier.data.testPlan.commands.map(Escalation.formatTestCommand).filter((value) => value.length > 0);
  }

  private static formatTestCommand(command: TestCommand): string {
    const args = command.args && command.args.length > 0 ? ` ${command.args.join(' ')}` : '';
    return `${command.command}${args}`.trim();
  }

  private static getSubtaskIdPrefix(taskId: string): string | null {
    const match = /^TK-(\d+)-(\d+)$/.exec(taskId);
    if (!match) {
      return null;
    }
    return `ST-${match[1]}-${match[2]}`;
  }

  private static getTaskIdPrefix(phaseId: string): string | null {
    const match = /^PH-(\d+)$/.exec(phaseId);
    if (!match) {
      return null;
    }

    return `TK-${match[1]}`;
  }

  private static getNextTaskIndex(tasks: Task[], prefix: string): { nextIndex: number; indexWidth: number } {
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);

    let maxIndex = 0;
    let width = 3;

    for (const task of tasks) {
      const match = pattern.exec(task.id);
      if (!match) {
        continue;
      }

      width = Math.max(width, match[1].length);
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value)) {
        maxIndex = Math.max(maxIndex, value);
      }
    }

    return { nextIndex: maxIndex + 1, indexWidth: width };
  }

  private static getNextSubtaskIndex(
    subtasks: Subtask[],
    prefix: string
  ): { nextIndex: number; indexWidth: number } {
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);

    let maxIndex = 0;
    let width = 3;

    for (const subtask of subtasks) {
      const match = pattern.exec(subtask.id);
      if (!match) {
        continue;
      }

      width = Math.max(width, match[1].length);
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value)) {
        maxIndex = Math.max(maxIndex, value);
      }
    }

    return { nextIndex: maxIndex + 1, indexWidth: width };
  }

  private static allocateUniqueTaskId(tasks: Task[], prefix: string, allocate: () => string): string {
    const existing = new Set(tasks.map((task) => task.id));

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const candidate = allocate();
      if (!candidate.startsWith(`${prefix}-`)) {
        continue;
      }

      if (!existing.has(candidate)) {
        return candidate;
      }
    }

    throw new Error(`Unable to allocate a unique task id for prefix ${prefix}`);
  }

  private static allocateUniqueSubtaskId(
    subtasks: Subtask[],
    prefix: string,
    allocate: () => string
  ): string {
    const existing = new Set(subtasks.map((subtask) => subtask.id));

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const candidate = allocate();
      if (!candidate.startsWith(`${prefix}-`)) {
        continue;
      }

      if (!existing.has(candidate)) {
        return candidate;
      }
    }

    throw new Error(`Unable to allocate a unique subtask id for prefix ${prefix}`);
  }

  private static getNextPriority(items: Array<{ priority: number }>): number {
    const maxPriority = items.reduce((max, item) => Math.max(max, item.priority), 0);
    return maxPriority + 1;
  }

  private extractReferencedTaskIds(text: string): string[] {
    const matches = text.match(/TK-\d+-\d+/g) ?? [];
    return Array.from(new Set(matches));
  }

  private static toPositiveInt(value: number, fallback: number): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return Math.max(1, Math.trunc(value));
  }
}
