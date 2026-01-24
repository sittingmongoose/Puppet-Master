/**
 * PRD Quality Validator for RWM Puppet Master
 * 
 * Enforces quality checks on PRDs to prevent "looks valid but misses major things" issues.
 * Validates verifiability, specificity, test plan completeness, traceability, and structural sanity.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T21.
 */

import type { PRD, Phase, Task, Subtask } from '../../types/prd.js';
import type { ParsedRequirements } from '../../types/requirements.js';
import type { Criterion, TestPlan } from '../../types/tiers.js';
import type { ValidationError, ValidationWarning, ValidationResult } from '../validation-gate.js';
import { detectDocumentStructure } from '../structure-detector.js';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Configuration for PRD quality validation.
 */
export interface PrdQualityConfig {
  /** Maximum percentage of generic criteria allowed (default: 30) */
  maxGenericCriteriaPercent?: number;
  /** Maximum absolute count of generic criteria allowed (default: 5) */
  maxGenericCriteriaAbsolute?: number;
  /** Require traceability (sourceRefs/requirementIds) for all items (default: true) */
  requireTraceability?: boolean;
  /** Character threshold for "large" document (default: 5000) */
  largeDocThreshold?: number;
  /** Minimum phases required for large documents (default: 2) */
  minPhasesForLargeDoc?: number;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: Required<PrdQualityConfig> = {
  maxGenericCriteriaPercent: 30,
  maxGenericCriteriaAbsolute: 5,
  requireTraceability: true,
  largeDocThreshold: 5000,
  minPhasesForLargeDoc: 2,
};

/**
 * Quality metrics computed during validation.
 */
export interface PrdQualityMetrics {
  totalCriteria: number;
  genericCriteriaCount: number;
  genericCriteriaPercent: number;
  criteriaWithMissingTargets: number;
  itemsWithTraceability: number;
  itemsWithoutTraceability: number;
  testCommandsCount: number;
  projectType?: 'node' | 'python' | 'unknown';
}

/**
 * PRD quality validation result.
 */
export interface PrdQualityResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: PrdQualityMetrics;
}

/**
 * PRD Quality Validator class.
 * Performs comprehensive quality checks on PRDs.
 */
export class PrdQualityValidator {
  private readonly config: Required<PrdQualityConfig>;

  constructor(config: PrdQualityConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validates PRD quality.
   * 
   * @param prd - PRD to validate
   * @param parsed - Optional parsed requirements for structural checks
   * @param projectPath - Optional project path for project type detection
   * @returns Quality validation result with errors, warnings, and metrics
   */
  validate(
    prd: PRD,
    parsed?: ParsedRequirements,
    projectPath?: string
  ): PrdQualityResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metrics: PrdQualityMetrics = {
      totalCriteria: 0,
      genericCriteriaCount: 0,
      genericCriteriaPercent: 0,
      criteriaWithMissingTargets: 0,
      itemsWithTraceability: 0,
      itemsWithoutTraceability: 0,
      testCommandsCount: 0,
      projectType: projectPath ? this.detectProjectType(projectPath) : undefined,
    };

    // Collect all criteria and items for metrics
    const allCriteria: Array<{ criterion: Criterion; path: string }> = [];
    const allItems: Array<{ item: Phase | Task | Subtask; path: string; hasTraceability: boolean }> = [];

    // Walk PRD structure
    prd.phases.forEach((phase, phaseIndex) => {
      const phasePath = `phases[${phaseIndex}]`;
      
      // Check traceability
      const hasPhaseTraceability = this.hasTraceability(phase);
      allItems.push({
        item: phase,
        path: phasePath,
        hasTraceability: hasPhaseTraceability,
      });
      if (hasPhaseTraceability) {
        metrics.itemsWithTraceability++;
      } else {
        metrics.itemsWithoutTraceability++;
      }

      // Check phase acceptance criteria
      if (phase.acceptanceCriteria) {
        phase.acceptanceCriteria.forEach((criterion, critIndex) => {
          const critPath = `${phasePath}.acceptanceCriteria[${critIndex}]`;
          allCriteria.push({ criterion, path: critPath });
          metrics.totalCriteria++;
        });
      }

      // Check phase test plan
      if (phase.testPlan) {
        metrics.testCommandsCount += phase.testPlan.commands?.length || 0;
      }

      // Check tasks
      phase.tasks.forEach((task, taskIndex) => {
        const taskPath = `${phasePath}.tasks[${taskIndex}]`;
        
        // Check traceability
        const hasTaskTraceability = this.hasTraceability(task);
        allItems.push({
          item: task,
          path: taskPath,
          hasTraceability: hasTaskTraceability,
        });
        if (hasTaskTraceability) {
          metrics.itemsWithTraceability++;
        } else {
          metrics.itemsWithoutTraceability++;
        }

        // Check task acceptance criteria
        if (task.acceptanceCriteria) {
          task.acceptanceCriteria.forEach((criterion, critIndex) => {
            const critPath = `${taskPath}.acceptanceCriteria[${critIndex}]`;
            allCriteria.push({ criterion, path: critPath });
            metrics.totalCriteria++;
          });
        }

        // Check task test plan
        if (task.testPlan) {
          metrics.testCommandsCount += task.testPlan.commands?.length || 0;
        }

        // Check subtasks
        task.subtasks.forEach((subtask, subtaskIndex) => {
          const subtaskPath = `${taskPath}.subtasks[${subtaskIndex}]`;
          
          // Check traceability
          const hasSubtaskTraceability = this.hasTraceability(subtask);
          allItems.push({
            item: subtask,
            path: subtaskPath,
            hasTraceability: hasSubtaskTraceability,
          });
          if (hasSubtaskTraceability) {
            metrics.itemsWithTraceability++;
          } else {
            metrics.itemsWithoutTraceability++;
          }

          // Check subtask acceptance criteria
          if (subtask.acceptanceCriteria) {
            subtask.acceptanceCriteria.forEach((criterion, critIndex) => {
              const critPath = `${subtaskPath}.acceptanceCriteria[${critIndex}]`;
              allCriteria.push({ criterion, path: critPath });
              metrics.totalCriteria++;
            });
          }

          // Check subtask test plan
          if (subtask.testPlan) {
            metrics.testCommandsCount += subtask.testPlan.commands?.length || 0;
          }
        });
      });
    });

    // Run quality checks
    this.checkVerifiability(allCriteria, errors, metrics);
    this.checkSpecificity(allCriteria, errors, warnings, metrics);
    this.checkTestPlanCompleteness(prd, errors, metrics, projectPath);
    this.checkTraceability(allItems, errors);
    this.checkStructuralSanity(prd, parsed, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics,
    };
  }

  /**
   * Check 1: Verifiability
   * Ensures all criteria have non-empty, valid target fields.
   */
  private checkVerifiability(
    allCriteria: Array<{ criterion: Criterion; path: string }>,
    errors: ValidationError[],
    metrics: PrdQualityMetrics
  ): void {
    allCriteria.forEach(({ criterion, path }) => {
      // All verifiable types must have a non-empty target
      // Note: 'manual' type is not in CriterionType, so it won't appear here
      const validTypes: Criterion['type'][] = ['command', 'regex', 'file_exists', 'browser_verify', 'ai', 'script'];
      if (validTypes.includes(criterion.type)) {
        if (!criterion.target || criterion.target.trim() === '') {
          errors.push({
            code: 'PRD_QUALITY_MISSING_TARGET',
            message: `Criterion at ${path} has type '${criterion.type}' but missing or empty target`,
            path: `${path}.target`,
            suggestion: `Add a valid target value for the ${criterion.type} criterion. For example: command='npm test', regex='pattern', file_exists='path/to/file', script='.puppet-master/scripts/verify-foo.sh', etc.`,
          });
          metrics.criteriaWithMissingTargets++;
        }
      }
    });
  }

  /**
   * Check 2: Specificity / Anti-Filler
   * Detects generic criteria and TODO/tbd language.
   */
  private checkSpecificity(
    allCriteria: Array<{ criterion: Criterion; path: string }>,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    metrics: PrdQualityMetrics
  ): void {
    // Match generic phrases that are standalone or at the start/end of description
    const genericPatterns = [
      /^(?:implementation\s+complete|code\s+works|tests?\s+pass|functionality\s+works|feature\s+complete|done)[\s\.]*$/i,
      /^(?:implementation\s+complete|code\s+works|tests?\s+pass|functionality\s+works|feature\s+complete|done)[\s,\.]/i,
      /[\s,\.](?:implementation\s+complete|code\s+works|tests?\s+pass|functionality\s+works|feature\s+complete|done)[\s\.]*$/i,
    ];

    const todoPatterns = [
      /\btodo\b/i,
      /\btbd\b/i,
      /\bfigure\s+out\b/i,
      /\bmaybe\b/i,
      /\bpossibly\b/i,
      /\bto\s+be\s+determined\b/i,
    ];

    // First pass: count generic criteria
    allCriteria.forEach(({ criterion, path }) => {
      const description = criterion.description || '';
      const isGeneric = genericPatterns.some(pattern => pattern.test(description));
      const hasTodo = todoPatterns.some(pattern => pattern.test(description));

      if (isGeneric) {
        metrics.genericCriteriaCount++;
        warnings.push({
          code: 'PRD_QUALITY_GENERIC_CRITERIA',
          message: `Generic criterion detected at ${path}: "${description.substring(0, 50)}..."`,
          suggestion: `Replace generic criterion with specific, verifiable criteria. Instead of "Implementation complete", specify what must be implemented and how to verify it.`,
        });
      }

      if (hasTodo) {
        warnings.push({
          code: 'PRD_QUALITY_GENERIC_CRITERIA',
          message: `TODO/tbd language detected at ${path}: "${description.substring(0, 50)}..."`,
          suggestion: `Remove TODO/tbd language and replace with concrete, actionable criteria.`,
        });
      }
    });

    // Recalculate percentage now that we have the count
    if (metrics.totalCriteria > 0) {
      metrics.genericCriteriaPercent = (metrics.genericCriteriaCount / metrics.totalCriteria) * 100;
    }

    // Check thresholds
    const percentExceeded = metrics.genericCriteriaPercent > this.config.maxGenericCriteriaPercent;
    const absoluteExceeded = metrics.genericCriteriaCount > this.config.maxGenericCriteriaAbsolute;

    if (percentExceeded || absoluteExceeded) {
      errors.push({
        code: 'PRD_QUALITY_EXCESSIVE_FILLER',
        message: `Too many generic criteria: ${metrics.genericCriteriaCount} (${metrics.genericCriteriaPercent.toFixed(1)}%) exceeds limits (${this.config.maxGenericCriteriaAbsolute} absolute, ${this.config.maxGenericCriteriaPercent}%)`,
        path: 'phases',
        suggestion: `Replace generic criteria with specific, verifiable criteria. Generic criteria like "Implementation complete" or "Tests pass" are not actionable.`,
      });
    }
  }

  /**
   * Check 3: Test Plan Completeness
   * Ensures test plans have minimum required commands for project type.
   */
  private checkTestPlanCompleteness(
    prd: PRD,
    errors: ValidationError[],
    metrics: PrdQualityMetrics,
    projectPath?: string
  ): void {
    // Collect all test plans
    const allTestPlans: Array<{ plan: TestPlan; path: string; itemId: string }> = [];

    prd.phases.forEach((phase, phaseIndex) => {
      if (phase.testPlan) {
        allTestPlans.push({
          plan: phase.testPlan,
          path: `phases[${phaseIndex}]`,
          itemId: phase.id,
        });
      }

      phase.tasks.forEach((task, taskIndex) => {
        if (task.testPlan) {
          allTestPlans.push({
            plan: task.testPlan,
            path: `phases[${phaseIndex}].tasks[${taskIndex}]`,
            itemId: task.id,
          });
        }

        task.subtasks.forEach((subtask, subtaskIndex) => {
          if (subtask.testPlan) {
            allTestPlans.push({
              plan: subtask.testPlan,
              path: `phases[${phaseIndex}].tasks[${taskIndex}].subtasks[${subtaskIndex}]`,
              itemId: subtask.id,
            });
          }
        });
      });
    });

    // Check each test plan
    allTestPlans.forEach(({ plan, path, itemId }) => {
      const commands = plan.commands || [];
      
      if (commands.length === 0) {
        errors.push({
          code: 'PRD_QUALITY_EMPTY_TEST_PLAN',
          message: `Test plan is empty for item ${itemId} at ${path}`,
          path: `${path}.testPlan.commands`,
          suggestion: `Add at least one test command to verify the item. For example: "npm test", "npm run typecheck", or a specific verification command.`,
        });
        return;
      }

      // Check project-specific requirements
      if (metrics.projectType === 'node' && projectPath) {
        const requiredCommands = this.getRequiredNodeCommands(projectPath);
        const commandStrings = commands.map(c => c.command).join(' ');
        const missingCommands = requiredCommands.filter(req => 
          !commandStrings.includes(req)
        );

        if (missingCommands.length > 0) {
          errors.push({
            code: 'PRD_QUALITY_INCOMPLETE_TEST_PLAN',
            message: `Test plan for ${itemId} at ${path} is missing required Node.js commands: ${missingCommands.join(', ')}`,
            path: `${path}.testPlan.commands`,
            suggestion: `Add missing test commands: ${missingCommands.map(c => `"${c}"`).join(', ')}. These are standard for Node.js/TypeScript projects.`,
          });
        }
      }
    });
  }

  /**
   * Check 4: Traceability
   * Requires sourceRefs or requirementIds for phases/tasks/subtasks.
   */
  private checkTraceability(
    allItems: Array<{ item: Phase | Task | Subtask; path: string; hasTraceability: boolean }>,
    errors: ValidationError[]
  ): void {
    if (!this.config.requireTraceability) {
      return;
    }

    allItems.forEach(({ item, path, hasTraceability }) => {
      if (!hasTraceability) {
        errors.push({
          code: 'PRD_QUALITY_MISSING_TRACEABILITY',
          message: `Item ${item.id} at ${path} is missing traceability (sourceRefs or requirementIds)`,
          path: `${path}.sourceRefs`,
          suggestion: `Add sourceRefs array linking this PRD item back to the source requirements document sections. This enables traceability: "Which PRD items cover Requirement 4.2?"`,
        });
      }
    });
  }

  /**
   * Check 5: Structural Sanity
   * Large documents should not produce only 1 phase.
   */
  private checkStructuralSanity(
    prd: PRD,
    parsed: ParsedRequirements | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!parsed) {
      return; // Can't check without parsed requirements
    }

    const docSize = parsed.rawText.length;
    const phaseCount = prd.phases.length;

    if (docSize > this.config.largeDocThreshold && phaseCount < this.config.minPhasesForLargeDoc) {
      // Use structure detection if available
      const structure = detectDocumentStructure(
        parsed.sections,
        parsed.rawText,
        { failOnValidationError: false }
      );

      if (structure.metrics.phasesCount < this.config.minPhasesForLargeDoc) {
        errors.push({
          code: 'PRD_QUALITY_STRUCTURAL_ISSUE',
          message: `Large document (${docSize} chars) produced only ${phaseCount} phase(s). Expected at least ${this.config.minPhasesForLargeDoc} phases.`,
          path: 'phases',
          suggestion: `Break down the large document into multiple phases. Large documents should be split into logical phases for better organization and execution.`,
        });
      } else {
        // Structure detection suggests more phases, but PRD has fewer
        warnings.push({
          code: 'PRD_QUALITY_STRUCTURAL_ISSUE',
          message: `Document structure suggests ${structure.metrics.phasesCount} phases, but PRD has only ${phaseCount}. Consider splitting into more phases.`,
          suggestion: `Review the document structure and split into multiple phases for better organization.`,
        });
      }
    }
  }

  /**
   * Check if an item has traceability (sourceRefs or requirementIds).
   */
  private hasTraceability(item: Phase | Task | Subtask): boolean {
    // Check for sourceRefs array (non-empty)
    if (item.sourceRefs && Array.isArray(item.sourceRefs) && item.sourceRefs.length > 0) {
      return true;
    }

    // Note: requirementIds is not in the current PRD schema, but we check for it defensively
    const itemAny = item as unknown as Record<string, unknown>;
    if (itemAny.requirementIds && Array.isArray(itemAny.requirementIds) && itemAny.requirementIds.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Detect project type from project path.
   */
  private detectProjectType(projectPath: string): 'node' | 'python' | 'unknown' {
    if (existsSync(join(projectPath, 'package.json'))) {
      return 'node';
    }
    if (existsSync(join(projectPath, 'pyproject.toml')) || existsSync(join(projectPath, 'setup.py'))) {
      return 'python';
    }
    return 'unknown';
  }

  /**
   * Get required test commands for Node.js projects.
   */
  private getRequiredNodeCommands(projectPath: string): string[] {
    const required: string[] = [];
    
    // Check for package.json scripts
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        // We can't import JSON in ESM easily, so check for common scripts via file system
        // For now, return standard commands that should be present
        required.push('typecheck', 'test');
        
        // Check if build script exists (optional but common)
        // We'll be lenient and not require build if it's not present
      }
    } catch {
      // If we can't read package.json, just return standard commands
    }

    // Default required commands for Node.js/TypeScript projects
    if (required.length === 0) {
      required.push('typecheck', 'test');
    }

    return required;
  }
}
