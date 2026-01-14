/**
 * Gate Runner
 * 
 * Orchestrates verifier execution for gates, aggregates results, classifies failures,
 * and produces gate reports with evidence.
 * 
 * See ARCHITECTURE.md Section 5.3 (Gate Execution) and
 * REQUIREMENTS.md Section 7.3 (Failure Handling at Gates).
 */

import type { Criterion, VerifierResult, GateReport } from '../types/tiers.js';
import type { Verifier } from './verifiers/verifier.js';
import type { EvidenceStore } from '../memory/evidence-store.js';
import type { VerifierResultSummary, GateReportEvidence } from '../types/evidence.js';

/**
 * Gate configuration interface.
 * Controls how gates are executed.
 */
export interface GateConfig {
  /** Stop execution on first failure (default: false) */
  failFast?: boolean;
  /** Run verifiers in parallel (default: false) */
  parallel?: boolean;
  /** Overall timeout in milliseconds (default: undefined) */
  timeout?: number;
}

/**
 * VerifierRegistry class.
 * Manages verifier instances by type.
 */
export class VerifierRegistry {
  private readonly verifiers = new Map<string, Verifier>();

  /**
   * Registers a verifier.
   * @param verifier - Verifier instance to register
   */
  register(verifier: Verifier): void {
    this.verifiers.set(verifier.type, verifier);
  }

  /**
   * Gets a verifier by type.
   * @param type - Verifier type
   * @returns Verifier instance or null if not found
   */
  get(type: string): Verifier | null {
    return this.verifiers.get(type) ?? null;
  }

  /**
   * Gets all registered verifiers.
   * @returns Array of all verifier instances
   */
  getAll(): Verifier[] {
    return Array.from(this.verifiers.values());
  }
}

/**
 * GateRunner class.
 * Executes verifiers for gates and produces gate reports.
 */
export class GateRunner {
  constructor(
    private readonly verifierRegistry: VerifierRegistry,
    private readonly evidenceStore: EvidenceStore,
    private readonly config: GateConfig = {}
  ) {}

  /**
   * Runs a gate with the given criteria.
   * @param gateId - Gate ID (e.g., 'TK-001-001')
   * @param criteria - Array of criteria to verify
   * @returns Gate report with all results
   */
  async runGate(gateId: string, criteria: Criterion[]): Promise<GateReport> {
    // Execute verifiers (parallel or sequential)
    const results = this.config.parallel
      ? await this.runParallel(criteria)
      : await this.runSequential(criteria);

    // Aggregate results into gate report
    const report = this.aggregateResults(gateId, results);

    // Save evidence
    await this.saveEvidence(gateId, report);

    return report;
  }

  /**
   * Runs a single verifier for a criterion.
   * @param criterion - Criterion to verify
   * @returns Verifier result
   */
  async runVerifier(criterion: Criterion): Promise<VerifierResult> {
    const verifier = this.verifierRegistry.get(criterion.type);

    if (!verifier) {
      return {
        type: criterion.type,
        target: criterion.target,
        passed: false,
        summary: `No verifier found for type: ${criterion.type}`,
        error: `Verifier not found: ${criterion.type}`,
        durationMs: 0,
      };
    }

    try {
      return await verifier.verify(criterion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        type: criterion.type,
        target: criterion.target,
        passed: false,
        summary: `Verifier execution failed: ${errorMessage}`,
        error: `Verifier execution failed: ${errorMessage}`,
        durationMs: 0,
      };
    }
  }

  /**
   * Classifies failure severity.
   * @param results - Array of verifier results
   * @returns 'minor' or 'major'
   */
  classifyFailure(results: VerifierResult[]): 'minor' | 'major' {
    const failed = results.filter((r) => !r.passed);

    // No failures = minor (not really a failure, but return minor for consistency)
    if (failed.length === 0) {
      return 'minor';
    }

    // Check for major failure types
    const hasBrowserFailure = failed.some((r) => r.type === 'browser_verify');
    const hasAIFailure = failed.some((r) => r.type === 'ai');

    // Multiple failures = major
    if (failed.length > 1) {
      return 'major';
    }

    // Browser or AI failure = major
    if (hasBrowserFailure || hasAIFailure) {
      return 'major';
    }

    // Only regex/command/file_exists failures = minor
    return 'minor';
  }

  /**
   * Aggregates verifier results into a gate report.
   * @param gateId - Gate ID
   * @param results - Array of verifier results
   * @returns Gate report
   */
  private aggregateResults(gateId: string, results: VerifierResult[]): GateReport {
    const overallPassed = results.every((r) => r.passed);
    const failureType = overallPassed ? undefined : this.classifyFailure(results);
    const summary = this.generateSummary(results, failureType);

    return {
      gateId,
      timestamp: new Date().toISOString(),
      verifiersRun: results,
      overallPassed,
      failureType,
      summary,
    };
  }

  /**
   * Runs verifiers in parallel.
   * @param criteria - Array of criteria to verify
   * @returns Array of verifier results
   */
  private async runParallel(criteria: Criterion[]): Promise<VerifierResult[]> {
    const promises = criteria.map((criterion) => this.runVerifier(criterion));
    const results = await Promise.all(promises);

    // If failFast is enabled, check if we should stop
    if (this.config.failFast) {
      const firstFailure = results.findIndex((r) => !r.passed);
      if (firstFailure !== -1) {
        // Return only up to the first failure
        return results.slice(0, firstFailure + 1);
      }
    }

    return results;
  }

  /**
   * Runs verifiers sequentially.
   * @param criteria - Array of criteria to verify
   * @returns Array of verifier results
   */
  private async runSequential(criteria: Criterion[]): Promise<VerifierResult[]> {
    const results: VerifierResult[] = [];

    for (const criterion of criteria) {
      const result = await this.runVerifier(criterion);
      results.push(result);

      // If failFast and this failed, stop
      if (this.config.failFast && !result.passed) {
        break;
      }
    }

    return results;
  }

  /**
   * Generates a human-readable summary of gate results.
   * @param results - Array of verifier results
   * @param failureType - Failure type if any
   * @returns Summary string
   */
  private generateSummary(
    results: VerifierResult[],
    failureType?: 'minor' | 'major'
  ): string {
    const passed = results.filter((r) => r.passed);
    const failed = results.filter((r) => !r.passed);

    const lines: string[] = [];
    lines.push('Gate Report Summary');
    lines.push('==================');

    if (passed.length > 0) {
      lines.push(`Passed: ${passed.length} verifier${passed.length > 1 ? 's' : ''}`);
      for (const result of passed) {
        lines.push(`- ${result.type}: ${result.target} - ${result.summary}`);
      }
      lines.push('');
    }

    if (failed.length > 0) {
      lines.push(`Failed: ${failed.length} verifier${failed.length > 1 ? 's' : ''}`);
      for (const result of failed) {
        const error = result.error ? ` - ${result.error}` : '';
        lines.push(`- ${result.type}: ${result.target}${error}`);
      }
      lines.push('');
    }

    const overallStatus = results.every((r) => r.passed) ? 'PASSED' : 'FAILED';
    const failureTypeStr = failureType ? ` (${failureType})` : '';
    lines.push(`Overall: ${overallStatus}${failureTypeStr}`);

    return lines.join('\n');
  }

  /**
   * Saves gate report evidence.
   * @param gateId - Gate ID
   * @param report - Gate report
   */
  private async saveEvidence(gateId: string, report: GateReport): Promise<void> {
    // Convert VerifierResult[] to VerifierResultSummary[]
    const verifiersRun: VerifierResultSummary[] = report.verifiersRun.map((r) => ({
      type: r.type,
      target: r.target,
      passed: r.passed,
      evidencePath: r.evidencePath,
      summary: r.summary,
    }));

    // Determine tier type from gate ID
    // PH-001 = phase, TK-001-001 = task, ST-001-001-001 = subtask
    let tierType: 'phase' | 'task' | 'subtask' = 'task';
    if (gateId.startsWith('PH-')) {
      tierType = 'phase';
    } else if (gateId.startsWith('ST-')) {
      tierType = 'subtask';
    }

    const evidence: GateReportEvidence = {
      gateId,
      timestamp: report.timestamp,
      verifiersRun,
      overallPassed: report.overallPassed,
      tierType,
    };

    await this.evidenceStore.saveGateReport(gateId, evidence);
  }
}
