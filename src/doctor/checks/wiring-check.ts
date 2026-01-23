/**
 * Wiring Check for RWM Puppet Master Doctor System
 * 
 * Performs implementation wiring audit to detect:
 * - Orphan exports
 * - Unused container registrations
 * - Missing dependency injections
 * - Event mismatches
 * - Verifier registration gaps
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22 for implementation details.
 */

import type { DoctorCheck, CheckResult, CheckCategory } from '../check-registry.js';
import { auditRWMWiring } from '../../audits/rwm-specific-audit.js';
import type { WiringAuditResult, WiringIssue } from '../../audits/types.js';

/**
 * Doctor check for implementation wiring issues.
 * 
 * This check runs the RWM-specific wiring audit and reports
 * any issues found as part of the doctor system.
 */
export class WiringCheck implements DoctorCheck {
  readonly name = 'wiring';
  readonly category: CheckCategory = 'project';
  readonly description = 'Checks for implementation wiring issues (orphan exports, unused registrations, event mismatches)';

  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async run(): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      const result = await auditRWMWiring(this.projectRoot);
      const durationMs = Date.now() - startTime;

      const errors = result.issues.filter((i) => i.severity === 'error');
      const warnings = result.issues.filter((i) => i.severity === 'warning');

      // Determine pass/fail status
      const passed = errors.length === 0;
      
      // Build message
      let message: string;
      if (passed && warnings.length === 0) {
        message = 'All wiring checks passed';
      } else if (passed) {
        message = `Wiring OK with ${warnings.length} warning(s)`;
      } else {
        message = `${errors.length} wiring error(s) found`;
      }

      // Build details
      const details = this.formatDetails(result);

      // Build fix suggestion
      const fixSuggestion = errors.length > 0
        ? this.formatFixSuggestions(errors)
        : undefined;

      return {
        name: this.name,
        category: this.category,
        passed,
        message,
        details,
        fixSuggestion,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Wiring audit failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        durationMs,
      };
    }
  }

  /**
   * Format audit result details for display.
   */
  private formatDetails(result: WiringAuditResult): string {
    const lines: string[] = [];

    lines.push(`Duration: ${result.durationMs}ms`);
    lines.push('');
    lines.push('Summary:');
    lines.push(`  Missing Injections: ${result.summary.missingInjections}`);
    lines.push(`  Event Mismatches: ${result.summary.eventMismatches}`);
    lines.push(`  Verifier Gaps: ${result.summary.verifierGaps}`);
    lines.push('');

    if (result.issues.length > 0) {
      lines.push('Issues:');
      for (const issue of result.issues) {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        const location = issue.location.line 
          ? `${issue.location.file}:${issue.location.line}`
          : issue.location.file;
        lines.push(`  ${icon} [${issue.type}] ${location}`);
        lines.push(`     ${issue.description}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format fix suggestions for error-level issues.
   */
  private formatFixSuggestions(errors: WiringIssue[]): string {
    const suggestions = errors.map((e) => `• ${e.suggestion}`);
    return suggestions.join('\n');
  }
}

/**
 * Create a wiring check instance for the given project root.
 */
export function createWiringCheck(projectRoot: string): WiringCheck {
  return new WiringCheck(projectRoot);
}
