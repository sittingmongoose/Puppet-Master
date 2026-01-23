/**
 * Platform Compatibility Check for RWM Puppet Master Doctor System
 * 
 * Integrates platform compatibility checking into the Doctor system.
 * 
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T24 (Platform Compatibility Validator).
 */

import type { CheckResult, DoctorCheck } from '../check-registry.js';
import { PlatformCompatibilityChecker } from '../../audits/platform-compatibility.js';

/**
 * Check for Windows/Unix compatibility issues
 */
export class PlatformCompatibilityCheck implements DoctorCheck {
  readonly name = 'platform-compatibility';
  readonly category = 'project';
  readonly description = 'Check for Windows/Unix compatibility issues';

  async run(): Promise<CheckResult> {
    const startTime = Date.now();
    const checker = new PlatformCompatibilityChecker();
    const issues = await checker.check(process.cwd());

    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');

    const durationMs = Date.now() - startTime;

    if (errors.length > 0) {
      const errorDetails = errors
        .map(
          (e) =>
            `${e.file}:${e.line} - ${e.description}\n    Fix: ${e.suggestion}`
        )
        .join('\n');

      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Found ${errors.length} platform compatibility error(s)`,
        details: errorDetails,
        fixSuggestion: 'Fix Unix-only commands, paths, or shell syntax to be cross-platform',
        durationMs,
      };
    }

    if (warnings.length > 0) {
      const warningDetails = warnings
        .map(
          (w) =>
            `${w.file}:${w.line} - ${w.description}\n    Fix: ${w.suggestion}`
        )
        .join('\n');

      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Found ${warnings.length} platform compatibility warning(s)`,
        details: warningDetails,
        fixSuggestion: 'Consider fixing warnings for better cross-platform compatibility',
        durationMs,
      };
    }

    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: 'No platform compatibility issues found',
      durationMs,
    };
  }
}
