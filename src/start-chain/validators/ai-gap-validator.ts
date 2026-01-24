/**
 * AI Gap Validator for RWM Puppet Master
 *
 * Validates PRD coverage by running AI gap detection and evaluating results
 * against configurable severity thresholds.
 *
 * This validator integrates into the Start Chain pipeline as an optional
 * validation pass after PRD generation.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T26 for implementation details.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import type { PRD } from '../../types/prd.js';
import type { PlatformRegistry } from '../../platforms/registry.js';
import type { QuotaManager } from '../../platforms/quota-manager.js';
import type {
  GapDetectionInput,
  GapDetectionResult,
  DetectedGap,
  AIGapValidatorConfig,
  AIGapValidationResult,
  GapValidationError,
  GapValidationWarning,
  CodebaseStructure,
  TestInfo,
} from '../../types/gap-detection.js';
import { DEFAULT_AI_GAP_VALIDATOR_CONFIG } from '../../types/gap-detection.js';
import { AIGapDetector } from '../../audits/ai-gap-detector.js';

/**
 * AIGapValidator class.
 *
 * Validates PRDs against the codebase using AI-assisted gap detection.
 * Produces pass/fail results based on severity thresholds.
 */
export class AIGapValidator {
  private readonly config: AIGapValidatorConfig;
  private readonly gapDetector: AIGapDetector;

  /**
   * Creates a new AIGapValidator instance.
   *
   * @param config - Configuration options (defaults to DEFAULT_AI_GAP_VALIDATOR_CONFIG)
   * @param platformRegistry - Optional platform registry for AI invocation
   * @param quotaManager - Optional quota manager for rate limiting
   */
  constructor(
    config: Partial<AIGapValidatorConfig> = {},
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager
  ) {
    this.config = { ...DEFAULT_AI_GAP_VALIDATOR_CONFIG, ...config };

    // Merge detector config
    const detectorConfig = {
      ...DEFAULT_AI_GAP_VALIDATOR_CONFIG.detector,
      ...config.detector,
    };

    this.gapDetector = new AIGapDetector(detectorConfig, platformRegistry, quotaManager);
  }

  /**
   * Validates a PRD by running AI gap detection.
   *
   * @param prd - PRD to validate
   * @param architecture - Architecture document content
   * @param projectRoot - Project root directory
   * @param codebaseStructure - Optional pre-built codebase structure
   * @param existingTests - Optional pre-found test information
   * @returns Validation result with pass/fail and details
   */
  async validate(
    prd: PRD,
    architecture: string,
    projectRoot: string,
    codebaseStructure?: CodebaseStructure,
    existingTests?: TestInfo[]
  ): Promise<AIGapValidationResult> {
    // If disabled, return pass with warning
    if (!this.config.enabled) {
      return {
        passed: true,
        errors: [],
        warnings: [{
          code: 'AI_GAP_SKIPPED',
          message: 'AI gap detection is disabled in configuration',
        }],
      };
    }

    try {
      // Build codebase structure if not provided
      const structure = codebaseStructure || await AIGapDetector.buildCodebaseStructure(projectRoot);

      // Find tests if not provided
      const tests = existingTests || await AIGapDetector.findExistingTests(projectRoot);

      // Summarize PRD
      const prdSummary = AIGapDetector.summarizePRD(prd);

      // Build input
      const input: GapDetectionInput = {
        prd: prdSummary,
        architecture,
        codebaseStructure: structure,
        existingTests: tests,
        projectContext: {
          name: prd.project,
          type: this.detectProjectType(structure),
          technologies: this.detectTechnologies(structure),
        },
      };

      // Run gap detection
      const result = await this.gapDetector.detectGaps(input);

      // Persist report
      const reportPath = await this.persistReport(result, projectRoot);

      // Evaluate thresholds
      const validationResult = this.evaluateThresholds(result);

      return {
        ...validationResult,
        gapDetectionResult: result,
        reportPath,
      };
    } catch (error) {
      // Graceful degradation - don't block pipeline if AI fails
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        passed: true, // Don't block on AI failure
        errors: [],
        warnings: [{
          code: 'AI_GAP_SKIPPED',
          message: `AI gap detection failed (graceful degradation): ${errorMessage}`,
        }],
      };
    }
  }

  /**
   * Evaluates gap detection results against severity thresholds.
   *
   * @param result - Gap detection result
   * @returns Validation result with pass/fail based on thresholds
   */
  private evaluateThresholds(result: GapDetectionResult): AIGapValidationResult {
    const errors: GapValidationError[] = [];
    const warnings: GapValidationWarning[] = [];

    // Check if gap detection itself failed
    if (result.error) {
      return {
        passed: true, // Don't block on detection failure
        errors: [],
        warnings: [{
          code: 'AI_GAP_SKIPPED',
          message: `Gap detection encountered an error: ${result.error}`,
        }],
      };
    }

    // Add any warnings from detection
    if (result.warnings) {
      for (const warning of result.warnings) {
        warnings.push({
          code: 'AI_GAP_SKIPPED',
          message: warning,
        });
      }
    }

    // Count gaps by severity
    const criticalGaps = result.gaps.filter(g => g.severity === 'critical');
    const highGaps = result.gaps.filter(g => g.severity === 'high');
    const mediumGaps = result.gaps.filter(g => g.severity === 'medium');
    const lowGaps = result.gaps.filter(g => g.severity === 'low');

    // Check critical gaps
    if (this.config.blockOnCritical && criticalGaps.length > 0) {
      for (const gap of criticalGaps) {
        errors.push({
          code: 'AI_GAP_CRITICAL',
          message: gap.description,
          path: gap.location,
          suggestion: gap.suggestedFix,
        });
      }
    }

    // Check high gap threshold
    if (highGaps.length > this.config.maxHighGaps) {
      errors.push({
        code: 'AI_GAP_TOO_MANY_HIGH',
        message: `${highGaps.length} high-severity gaps exceed threshold of ${this.config.maxHighGaps}`,
      });
    }

    // Add non-blocking gaps as warnings
    for (const gap of highGaps) {
      if (!this.config.blockOnCritical || highGaps.length <= this.config.maxHighGaps) {
        warnings.push({
          code: 'AI_GAP_HIGH',
          message: `${gap.id}: ${gap.description} (${gap.location || 'unknown location'})`,
        });
      }
    }

    for (const gap of mediumGaps) {
      warnings.push({
        code: 'AI_GAP_MEDIUM',
        message: `${gap.id}: ${gap.description} (${gap.location || 'unknown location'})`,
      });
    }

    for (const gap of lowGaps) {
      warnings.push({
        code: 'AI_GAP_LOW',
        message: `${gap.id}: ${gap.description} (${gap.location || 'unknown location'})`,
      });
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Persists gap detection report to disk.
   *
   * @param result - Gap detection result
   * @param projectRoot - Project root directory
   * @returns Path to saved report
   */
  private async persistReport(
    result: GapDetectionResult,
    projectRoot: string
  ): Promise<string> {
    const reportPath = this.config.reportPath ||
      '.puppet-master/audits/ai-gap-detection.json';

    const fullPath = join(projectRoot, reportPath);

    // Ensure directory exists
    await fs.mkdir(dirname(fullPath), { recursive: true });

    // Build comprehensive report
    const report = {
      ...result,
      config: {
        enabled: this.config.enabled,
        maxHighGaps: this.config.maxHighGaps,
        blockOnCritical: this.config.blockOnCritical,
        detector: this.config.detector,
      },
      summary: {
        totalGaps: result.gaps.length,
        bySeverity: {
          critical: result.gaps.filter(g => g.severity === 'critical').length,
          high: result.gaps.filter(g => g.severity === 'high').length,
          medium: result.gaps.filter(g => g.severity === 'medium').length,
          low: result.gaps.filter(g => g.severity === 'low').length,
        },
        byType: this.countGapsByType(result.gaps),
      },
    };

    await fs.writeFile(fullPath, JSON.stringify(report, null, 2), 'utf-8');

    return fullPath;
  }

  /**
   * Counts gaps by type.
   */
  private countGapsByType(gaps: DetectedGap[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const gap of gaps) {
      counts[gap.type] = (counts[gap.type] || 0) + 1;
    }

    return counts;
  }

  /**
   * Detects project type from codebase structure.
   */
  private detectProjectType(structure: CodebaseStructure): string {
    const hasPackageJson = structure.configFiles.some(f => f === 'package.json');
    const hasTsConfig = structure.configFiles.some(f => f.includes('tsconfig'));
    const hasPyproject = structure.configFiles.some(f => f.includes('pyproject'));
    const hasSetupPy = structure.configFiles.some(f => f === 'setup.py');
    const hasGoMod = structure.configFiles.some(f => f === 'go.mod');
    const hasCargo = structure.configFiles.some(f => f === 'Cargo.toml');

    if (hasTsConfig || (hasPackageJson && structure.files.some(f => f.path.endsWith('.ts')))) {
      return 'typescript';
    }
    if (hasPackageJson) {
      return 'javascript';
    }
    if (hasPyproject || hasSetupPy) {
      return 'python';
    }
    if (hasGoMod) {
      return 'go';
    }
    if (hasCargo) {
      return 'rust';
    }

    return 'unknown';
  }

  /**
   * Detects technologies used in the project.
   */
  private detectTechnologies(structure: CodebaseStructure): string[] {
    const technologies: string[] = [];

    // Check for common frameworks/libraries based on imports
    const allImports = structure.files.flatMap(f => f.imports || []);

    if (allImports.some(i => i.includes('react'))) {
      technologies.push('React');
    }
    if (allImports.some(i => i.includes('vue'))) {
      technologies.push('Vue');
    }
    if (allImports.some(i => i.includes('express'))) {
      technologies.push('Express');
    }
    if (allImports.some(i => i.includes('fastify'))) {
      technologies.push('Fastify');
    }
    if (allImports.some(i => i.includes('vitest'))) {
      technologies.push('Vitest');
    }
    if (allImports.some(i => i.includes('jest'))) {
      technologies.push('Jest');
    }

    // Check config files
    if (structure.configFiles.some(f => f.includes('tsconfig'))) {
      technologies.push('TypeScript');
    }
    if (structure.configFiles.some(f => f.includes('eslint'))) {
      technologies.push('ESLint');
    }

    return [...new Set(technologies)];
  }
}

/**
 * Factory function to create AIGapValidator with default configuration.
 *
 * @param config - Optional partial configuration
 * @param platformRegistry - Optional platform registry
 * @param quotaManager - Optional quota manager
 * @returns Configured AIGapValidator instance
 */
export function createAIGapValidator(
  config?: Partial<AIGapValidatorConfig>,
  platformRegistry?: PlatformRegistry,
  quotaManager?: QuotaManager
): AIGapValidator {
  return new AIGapValidator(config, platformRegistry, quotaManager);
}

/**
 * Convenience function to run gap validation.
 *
 * @param prd - PRD to validate
 * @param architecture - Architecture document content
 * @param projectRoot - Project root directory
 * @param config - Optional configuration
 * @param platformRegistry - Optional platform registry
 * @param quotaManager - Optional quota manager
 * @returns Validation result
 */
export async function validateGaps(
  prd: PRD,
  architecture: string,
  projectRoot: string,
  config?: Partial<AIGapValidatorConfig>,
  platformRegistry?: PlatformRegistry,
  quotaManager?: QuotaManager
): Promise<AIGapValidationResult> {
  const validator = createAIGapValidator(config, platformRegistry, quotaManager);
  return validator.validate(prd, architecture, projectRoot);
}
