/**
 * CommitFormatter for RWM Puppet Master
 * 
 * Formats commit messages according to REQUIREMENTS.md Section 27.2.
 * 
 * Commit templates:
 * - Iteration: "ralph: [subtask-id] [summary]"
 * - Subtask Complete: "ralph: complete [subtask-id] - [title]"
 * - Task Gate: "ralph: task-gate [task-id] - [status]"
 * - Phase Gate: "ralph: phase-gate [phase-id] - [status]"
 * - Replan: "ralph: replan [scope] - [reason]"
 * - Reopen: "ralph: reopen [item-id] - [reason]"
 */

/**
 * Types of commit tiers
 */
export type CommitTier = 'iteration' | 'subtask' | 'task_gate' | 'phase_gate' | 'replan' | 'reopen';

/**
 * Context for formatting a commit message
 */
export interface CommitContext {
  /** The tier/type of commit */
  tier: CommitTier;
  /** Item ID (subtask-id, task-id, phase-id, etc.) */
  itemId: string;
  /** Summary, title, or scope text */
  summary: string;
  /** Status for gate commits (optional) */
  status?: 'PASS' | 'FAIL';
  /** Reason for replan or reopen commits (optional) */
  reason?: string;
}

/**
 * Formats commit messages according to RWM Puppet Master conventions
 */
export class CommitFormatter {
  /**
   * Format a commit message based on context
   */
  format(context: CommitContext): string {
    switch (context.tier) {
      case 'iteration':
        return this.formatIteration(context.itemId, context.summary);
      case 'subtask':
        return this.formatSubtaskComplete(context.itemId, context.summary);
      case 'task_gate':
        if (!context.status) {
          throw new Error('Task gate commits require a status');
        }
        return this.formatTaskGate(context.itemId, context.status);
      case 'phase_gate':
        if (!context.status) {
          throw new Error('Phase gate commits require a status');
        }
        return this.formatPhaseGate(context.itemId, context.status);
      case 'replan':
        if (!context.reason) {
          throw new Error('Replan commits require a reason');
        }
        return this.formatReplan(context.summary, context.reason);
      case 'reopen':
        if (!context.reason) {
          throw new Error('Reopen commits require a reason');
        }
        return this.formatReopen(context.itemId, context.reason);
      default:
        throw new Error(`Unknown commit tier: ${(context as CommitContext).tier}`);
    }
  }

  /**
   * Format an iteration commit message
   * Template: "ralph: [subtask-id] [summary]"
   */
  formatIteration(itemId: string, summary: string): string {
    return `ralph: ${itemId} ${summary}`;
  }

  /**
   * Format a subtask complete commit message
   * Template: "ralph: complete [subtask-id] - [title]"
   */
  formatSubtaskComplete(itemId: string, title: string): string {
    return `ralph: complete ${itemId} - ${title}`;
  }

  /**
   * Format a task gate commit message
   * Template: "ralph: task-gate [task-id] - [status]"
   */
  formatTaskGate(itemId: string, status: 'PASS' | 'FAIL'): string {
    return `ralph: task-gate ${itemId} - ${status}`;
  }

  /**
   * Format a phase gate commit message
   * Template: "ralph: phase-gate [phase-id] - [status]"
   */
  formatPhaseGate(itemId: string, status: 'PASS' | 'FAIL'): string {
    return `ralph: phase-gate ${itemId} - ${status}`;
  }

  /**
   * Format a replan commit message
   * Template: "ralph: replan [scope] - [reason]"
   */
  formatReplan(scope: string, reason: string): string {
    return `ralph: replan ${scope} - ${reason}`;
  }

  /**
   * Format a reopen commit message
   * Template: "ralph: reopen [item-id] - [reason]"
   */
  formatReopen(itemId: string, reason: string): string {
    return `ralph: reopen ${itemId} - ${reason}`;
  }
}
