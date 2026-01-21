/**
 * Verification Integration
 * 
 * Connects GateRunner with AutoAdvancement and TierStateManager.
 * Handles gate execution, criteria collection, and state transitions.
 * 
 * See BUILD_QUEUE_PHASE_4.md PH4-T07 for implementation details.
 */

import type { TierNode } from '../core/tier-node.js';
import type { TierStateManager } from '../core/tier-state-manager.js';
import type { GateRunner } from './gate-runner.js';
import type { EvidenceStore } from '../memory/evidence-store.js';
import type { Criterion, GateResult, GateReport, VerifierResult, TestCommand } from '../types/tiers.js';
import type { TierEvent } from '../types/events.js';
import type { CommandCriterion } from './verifiers/command-verifier.js';

/**
 * VerificationIntegration class.
 * Bridges gate execution with tier state management.
 */
export class VerificationIntegration {
  constructor(
    private readonly gateRunner: GateRunner,
    private readonly tierStateManager: TierStateManager,
    private readonly evidenceStore: EvidenceStore
  ) {}

  /**
   * Runs a task-level gate.
   * Collects criteria from task, executes gate, and returns result.
   * @param task - Task tier node
   * @returns Gate result
   */
  async runTaskGate(task: TierNode): Promise<GateResult> {
    const criteria = this.collectCriteria(task);
    const gateId = this.buildGateId(task, 'task');
    
    const report = await this.gateRunner.runGate(gateId, criteria);
    
    // Convert GateReport to GateResult
    const result: GateResult = {
      passed: report.overallPassed,
      report,
      failureReason: report.overallPassed ? undefined : this.extractFailureReason(report),
    };

    return result;
  }

  /**
   * Runs a phase-level gate.
   * Collects criteria from phase, adds aggregate checks, executes gate, and returns result.
   * @param phase - Phase tier node
   * @returns Gate result
   */
  async runPhaseGate(phase: TierNode): Promise<GateResult> {
    const criteria = this.collectCriteria(phase);
    
    // Add aggregate check: verify all child tasks passed
    const aggregateCheck = this.buildAggregateCheck(phase);
    if (aggregateCheck) {
      criteria.push(aggregateCheck);
    }
    
    const gateId = this.buildGateId(phase, 'phase');
    
    const report = await this.gateRunner.runGate(gateId, criteria);
    
    // Convert GateReport to GateResult
    const result: GateResult = {
      passed: report.overallPassed,
      report,
      failureReason: report.overallPassed ? undefined : this.extractFailureReason(report),
    };

    return result;
  }

  /**
   * Runs verification for a subtask.
   * This is optional and may be used for future subtask-level verification.
   * @param subtask - Subtask tier node
   * @returns Array of verifier results
   */
  async runSubtaskVerification(subtask: TierNode): Promise<VerifierResult[]> {
    const criteria = this.collectCriteria(subtask);
    const gateId = this.buildGateId(subtask, 'subtask');
    
    const report = await this.gateRunner.runGate(gateId, criteria);
    
    return report.verifiersRun;
  }

  /**
   * Handles gate result and triggers appropriate state transitions.
   * @param result - Gate result
   * @param tier - Tier node
   */
  handleGateResult(result: GateResult, tier: TierNode): void {
    this.transitionOnResult(result, tier);
  }

  /**
   * Collects all criteria from a tier node.
   * Includes acceptance criteria and test plan commands.
   * @param tier - Tier node
   * @returns Array of criteria
   */
  private collectCriteria(tier: TierNode): Criterion[] {
    const criteria: Criterion[] = [];

    // Add acceptance criteria
    criteria.push(...(tier.data.acceptanceCriteria ?? []));

    // Convert test plan commands to CommandCriterion
    if (tier.data.testPlan.commands && tier.data.testPlan.commands.length > 0) {
      for (let i = 0; i < tier.data.testPlan.commands.length; i++) {
        const cmd = tier.data.testPlan.commands[i];
        const commandCriterion = this.convertTestCommandToCriterion(tier.id, cmd, i);
        criteria.push(commandCriterion);
      }
    }

    return criteria;
  }

  /**
   * Converts a test command to a CommandCriterion.
   * Note: IDs must be prefixed with the tier ID so evidence can be retrieved via EvidenceStore.getEvidence(tierId).
   * @param cmd - Test command
   * @param index - Index in test plan
   * @returns CommandCriterion
   */
  private convertTestCommandToCriterion(tierId: string, cmd: TestCommand, index: number): CommandCriterion {
    return {
      id: `${tierId}-command-${index}`,
      description: `Run test command: ${cmd.command}`,
      type: 'command',
      target: cmd.command,
      options: {
        args: cmd.args,
        cwd: cmd.workingDirectory,
        timeout: cmd.timeout,
        expectedExitCode: 0,
      },
    };
  }

  /**
   * Builds a gate ID for a tier node.
   * @param tier - Tier node
   * @param tierType - Type of tier ('task', 'phase', 'subtask')
   * @returns Gate ID (e.g., "task-gate-TK-001-001")
   */
  private buildGateId(tier: TierNode, tierType: 'task' | 'phase' | 'subtask'): string {
    return `${tierType}-gate-${tier.id}`;
  }

  /**
   * Builds an aggregate check criterion for phase gates.
   * Verifies that all child tasks have passed.
   * Note: This is a verification step even though auto-advancement checks this
   * before calling runPhaseGate. This provides explicit evidence of the check.
   * @param phase - Phase tier node
   * @returns Aggregate check criterion or null if no children
   */
  private buildAggregateCheck(phase: TierNode): Criterion | null {
    const children = phase.getChildren();
    if (children.length === 0) {
      return null;
    }

    // Create a criterion that verifies all children passed
    // Since auto-advancement already checks this, we create a simple verification
    // that documents the check. In practice, this could be enhanced with AI verification
    // or more sophisticated checks.
    const allPassed = children.every((child) => child.getState() === 'passed');
    
    return {
      id: `${phase.id}-aggregate-check-all-tasks-passed`,
      description: `Verify all ${children.length} child task(s) have passed`,
      type: 'command',
      // Use a portable check (works on Windows/macOS/Linux) without relying on `true`/`false` shell commands.
      target: 'node',
      options: {
        args: ['-e', allPassed ? 'process.exit(0)' : 'process.exit(1)'],
        expectedExitCode: 0,
      },
    };
  }

  /**
   * Triggers state transitions based on gate result.
   * @param result - Gate result
   * @param tier - Tier node
   */
  private transitionOnResult(result: GateResult, tier: TierNode): void {
    if (result.passed) {
      // Passed: transition to PASSED state
      const event: TierEvent = { type: 'GATE_PASSED' };
      this.tierStateManager.transitionTier(tier.id, event);
    } else {
      // Failed: determine if minor or major
      const failureType = result.report.failureType ?? 'minor';
      
      if (failureType === 'major') {
        // Major failure: transition to ESCALATED state
        const event: TierEvent = { type: 'GATE_FAILED_MAJOR' };
        this.tierStateManager.transitionTier(tier.id, event);
      } else {
        // Minor failure: transition to RUNNING state (allows self-fix)
        const event: TierEvent = { type: 'GATE_FAILED_MINOR' };
        this.tierStateManager.transitionTier(tier.id, event);
      }
    }
  }

  /**
   * Extracts failure reason from gate report.
   * @param report - Gate report
   * @returns Failure reason string
   */
  private extractFailureReason(report: GateReport): string {
    const failed = report.verifiersRun.filter((r) => !r.passed);
    
    if (failed.length === 0) {
      return 'Gate failed but no failed verifiers found';
    }

    const reasons = failed.map((r) => {
      const error = r.error ? `: ${r.error}` : '';
      return `${r.type} (${r.target})${error}`;
    });

    return `Failed verifiers: ${reasons.join('; ')}`;
  }
}
