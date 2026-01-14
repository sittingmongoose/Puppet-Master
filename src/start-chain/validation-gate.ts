/**
 * Validation Gate for RWM Puppet Master
 * 
 * Validates generated artifacts (PRD, architecture document, tier plan) before execution begins.
 * Provides actionable validation errors and warnings to catch issues early in the start chain pipeline.
 * 
 * See REQUIREMENTS.md Section 5.1 (Start Chain Steps, step 5: Validation Gate) and
 * BUILD_QUEUE_PHASE_5.md PH5-T08.
 */

import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { Platform } from '../types/config.js';
import type { TierType } from '../types/state.js';
import type { TierPlan, PhasePlan, TaskPlan, SubtaskPlan } from './tier-plan-generator.js';

/**
 * Validation error interface.
 * Represents a specific validation error with location and suggestion.
 */
export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** JSON path to the error location (e.g., "phases[0].tasks[1]") */
  path?: string;
  /** Optional suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Validation warning interface.
 * Represents a validation warning (non-blocking issue).
 */
export interface ValidationWarning {
  /** Warning code for programmatic handling */
  code: string;
  /** Human-readable warning message */
  message: string;
  /** Optional suggestion for addressing the warning */
  suggestion?: string;
}

/**
 * Validation result interface.
 * Contains all errors and warnings from validation.
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Array of validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation gate class.
 * Validates PRD structure, architecture documents, and tier plans.
 */
export class ValidationGate {
  /**
   * Validates PRD structure.
   * Checks hierarchy, IDs, and required fields.
   * 
   * @param prd - PRD to validate
   * @returns Validation result with errors and warnings
   */
  validatePrd(prd: PRD): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for at least one phase
    if (!prd.phases || prd.phases.length === 0) {
      errors.push({
        code: 'PRD_NO_PHASES',
        message: 'PRD must have at least one phase',
        path: 'phases',
        suggestion: 'Add at least one phase to the PRD',
      });
      return { valid: false, errors, warnings };
    }

    // Collect all IDs to check for duplicates
    const allIds = new Set<string>();
    const duplicateIds: string[] = [];

    // Validate each phase
    prd.phases.forEach((phase, phaseIndex) => {
      const phasePath = `phases[${phaseIndex}]`;

      // Check required fields
      if (!phase.id) {
        errors.push({
          code: 'PRD_MISSING_ID',
          message: `Phase at index ${phaseIndex} is missing an ID`,
          path: `${phasePath}.id`,
          suggestion: 'Add a unique ID to the phase (format: PH-001)',
        });
      } else {
        if (allIds.has(phase.id)) {
          duplicateIds.push(phase.id);
        } else {
          allIds.add(phase.id);
        }
      }

      if (!phase.title || phase.title.trim() === '') {
        errors.push({
          code: 'PRD_MISSING_TITLE',
          message: `Phase ${phase.id || phaseIndex} is missing a title`,
          path: `${phasePath}.title`,
          suggestion: 'Add a descriptive title to the phase',
        });
      }

      if (!phase.description || phase.description.trim() === '') {
        warnings.push({
          code: 'PRD_MISSING_DESCRIPTION',
          message: `Phase ${phase.id || phaseIndex} has no description`,
          suggestion: 'Consider adding a description to clarify the phase scope',
        });
      }

      // Check for at least one task
      if (!phase.tasks || phase.tasks.length === 0) {
        errors.push({
          code: 'PRD_EMPTY_PHASE',
          message: `Phase ${phase.id || phaseIndex} has no tasks`,
          path: `${phasePath}.tasks`,
          suggestion: `Add at least one task to phase ${phase.id || phaseIndex}`,
        });
      } else {
        // Validate each task
        phase.tasks.forEach((task, taskIndex) => {
          const taskPath = `${phasePath}.tasks[${taskIndex}]`;

          // Check required fields
          if (!task.id) {
            errors.push({
              code: 'PRD_MISSING_ID',
              message: `Task at index ${taskIndex} in phase ${phase.id || phaseIndex} is missing an ID`,
              path: `${taskPath}.id`,
              suggestion: 'Add a unique ID to the task (format: TK-001-001)',
            });
          } else {
            if (allIds.has(task.id)) {
              duplicateIds.push(task.id);
            } else {
              allIds.add(task.id);
            }
          }

          if (!task.title || task.title.trim() === '') {
            errors.push({
              code: 'PRD_MISSING_TITLE',
              message: `Task ${task.id || taskIndex} in phase ${phase.id || phaseIndex} is missing a title`,
              path: `${taskPath}.title`,
              suggestion: 'Add a descriptive title to the task',
            });
          }

          // Check for at least one subtask
          if (!task.subtasks || task.subtasks.length === 0) {
            errors.push({
              code: 'PRD_EMPTY_TASK',
              message: `Task ${task.id || taskIndex} in phase ${phase.id || phaseIndex} has no subtasks`,
              path: `${taskPath}.subtasks`,
              suggestion: `Add at least one subtask to task ${task.id || taskIndex}`,
            });
          } else {
            // Validate each subtask
            task.subtasks.forEach((subtask, subtaskIndex) => {
              const subtaskPath = `${taskPath}.subtasks[${subtaskIndex}]`;

              // Check required fields
              if (!subtask.id) {
                errors.push({
                  code: 'PRD_MISSING_ID',
                  message: `Subtask at index ${subtaskIndex} in task ${task.id || taskIndex} is missing an ID`,
                  path: `${subtaskPath}.id`,
                  suggestion: 'Add a unique ID to the subtask (format: ST-001-001-001)',
                });
              } else {
                if (allIds.has(subtask.id)) {
                  duplicateIds.push(subtask.id);
                } else {
                  allIds.add(subtask.id);
                }
              }

              if (!subtask.title || subtask.title.trim() === '') {
                errors.push({
                  code: 'PRD_MISSING_TITLE',
                  message: `Subtask ${subtask.id || subtaskIndex} in task ${task.id || taskIndex} is missing a title`,
                  path: `${subtaskPath}.title`,
                  suggestion: 'Add a descriptive title to the subtask',
                });
              }

              // Check acceptance criteria
              if (!subtask.acceptanceCriteria || subtask.acceptanceCriteria.length === 0) {
                errors.push({
                  code: 'PRD_EMPTY_ACCEPTANCE_CRITERIA',
                  message: `Subtask ${subtask.id || subtaskIndex} has no acceptance criteria`,
                  path: `${subtaskPath}.acceptanceCriteria`,
                  suggestion: `Add at least one acceptance criterion to subtask ${subtask.id || subtaskIndex}`,
                });
              }
            });
          }

          // Check task acceptance criteria
          if (!task.acceptanceCriteria || task.acceptanceCriteria.length === 0) {
            warnings.push({
              code: 'PRD_EMPTY_ACCEPTANCE_CRITERIA',
              message: `Task ${task.id || taskIndex} has no acceptance criteria`,
              suggestion: `Consider adding acceptance criteria to task ${task.id || taskIndex}`,
            });
          }
        });
      }

      // Check phase acceptance criteria
      if (!phase.acceptanceCriteria || phase.acceptanceCriteria.length === 0) {
        warnings.push({
          code: 'PRD_EMPTY_ACCEPTANCE_CRITERIA',
          message: `Phase ${phase.id || phaseIndex} has no acceptance criteria`,
          suggestion: `Consider adding acceptance criteria to phase ${phase.id || phaseIndex}`,
        });
      }
    });

    // Report duplicate IDs
    if (duplicateIds.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateIds)];
      uniqueDuplicates.forEach(id => {
        errors.push({
          code: 'PRD_DUPLICATE_ID',
          message: `Duplicate ID found: ${id}`,
          path: 'phases',
          suggestion: `Ensure all IDs are unique. Found duplicate: ${id}`,
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates architecture document.
   * Checks that the document is not empty and contains expected sections.
   * 
   * @param arch - Architecture document content
   * @returns Validation result with errors and warnings
   */
  validateArchitecture(arch: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if document is empty
    if (!arch || arch.trim().length === 0) {
      errors.push({
        code: 'ARCH_EMPTY',
        message: 'Architecture document is empty',
        suggestion: 'Generate an architecture document with project structure and design decisions',
      });
      return { valid: false, errors, warnings };
    }

    // Check minimum length (at least 100 characters for a meaningful document)
    if (arch.trim().length < 100) {
      warnings.push({
        code: 'ARCH_TOO_SHORT',
        message: 'Architecture document is very short (less than 100 characters)',
        suggestion: 'Consider expanding the architecture document with more details',
      });
    }

    // Check for expected sections (markdown headings)
    const expectedSections = [
      { name: 'Overview', pattern: /^#\s+(?:Architecture|Overview|Introduction)/im },
      { name: 'Module Breakdown', pattern: /^#+\s+(?:Module|Component|Structure)/im },
      { name: 'Dependencies', pattern: /^#+\s+(?:Dependency|Dependencies|Deps)/im },
      { name: 'Tech Stack', pattern: /^#+\s+(?:Tech|Technology|Stack)/im },
    ];

    const foundSections: string[] = [];
    expectedSections.forEach(section => {
      if (section.pattern.test(arch)) {
        foundSections.push(section.name);
      }
    });

    // Warn about missing sections (not errors, as structure may vary)
    expectedSections.forEach(section => {
      if (!foundSections.includes(section.name)) {
        warnings.push({
          code: 'ARCH_MISSING_SECTION',
          message: `Architecture document may be missing section: ${section.name}`,
          suggestion: `Consider adding a ${section.name} section to the architecture document`,
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates tier plan structure and assignments.
   * Checks that plan matches PRD structure and has valid platform/iteration assignments.
   * 
   * @param plan - Tier plan to validate
   * @param config - Configuration for validation
   * @returns Validation result with errors and warnings
   */
  validateTierPlan(plan: TierPlan, config: PuppetMasterConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for at least one phase plan
    if (!plan.phases || plan.phases.length === 0) {
      errors.push({
        code: 'TIER_PLAN_NO_PHASES',
        message: 'Tier plan has no phases',
        path: 'phases',
        suggestion: 'Generate tier plan with at least one phase',
      });
      return { valid: false, errors, warnings };
    }

    // Valid platforms
    const validPlatforms: Platform[] = ['cursor', 'codex', 'claude'];

    // Valid tier types for escalation
    const validTierTypes: TierType[] = ['phase', 'task', 'subtask', 'iteration'];

    // Validate each phase plan
    plan.phases.forEach((phasePlan, phaseIndex) => {
      const phasePath = `phases[${phaseIndex}]`;

      // Check required fields
      if (!phasePlan.phaseId) {
        errors.push({
          code: 'TIER_PLAN_MISSING_ID',
          message: `Phase plan at index ${phaseIndex} is missing phaseId`,
          path: `${phasePath}.phaseId`,
          suggestion: 'Add phaseId to match PRD phase ID',
        });
      }

      // Validate platform
      if (!phasePlan.platform || !validPlatforms.includes(phasePlan.platform)) {
        errors.push({
          code: 'TIER_PLAN_INVALID_PLATFORM',
          message: `Phase plan ${phasePlan.phaseId || phaseIndex} has invalid platform: ${phasePlan.platform}`,
          path: `${phasePath}.platform`,
          suggestion: `Platform must be one of: ${validPlatforms.join(', ')}`,
        });
      }

      // Validate maxIterations
      if (typeof phasePlan.maxIterations !== 'number' || phasePlan.maxIterations <= 0) {
        errors.push({
          code: 'TIER_PLAN_INVALID_ITERATIONS',
          message: `Phase plan ${phasePlan.phaseId || phaseIndex} has invalid maxIterations: ${phasePlan.maxIterations}`,
          path: `${phasePath}.maxIterations`,
          suggestion: 'maxIterations must be a positive number',
        });
      }

      // Validate escalation
      if (phasePlan.escalation !== null && !validTierTypes.includes(phasePlan.escalation)) {
        errors.push({
          code: 'TIER_PLAN_INVALID_ESCALATION',
          message: `Phase plan ${phasePlan.phaseId || phaseIndex} has invalid escalation: ${phasePlan.escalation}`,
          path: `${phasePath}.escalation`,
          suggestion: `Escalation must be one of: ${validTierTypes.join(', ')}, or null`,
        });
      }

      // Validate tasks
      if (!phasePlan.tasks || phasePlan.tasks.length === 0) {
        warnings.push({
          code: 'TIER_PLAN_EMPTY_PHASE',
          message: `Phase plan ${phasePlan.phaseId || phaseIndex} has no tasks`,
          suggestion: 'Ensure phase plan includes all tasks from PRD',
        });
      } else {
        phasePlan.tasks.forEach((taskPlan, taskIndex) => {
          const taskPath = `${phasePath}.tasks[${taskIndex}]`;

          // Check required fields
          if (!taskPlan.taskId) {
            errors.push({
              code: 'TIER_PLAN_MISSING_ID',
              message: `Task plan at index ${taskIndex} in phase ${phasePlan.phaseId || phaseIndex} is missing taskId`,
              path: `${taskPath}.taskId`,
              suggestion: 'Add taskId to match PRD task ID',
            });
          }

          // Validate platform
          if (!taskPlan.platform || !validPlatforms.includes(taskPlan.platform)) {
            errors.push({
              code: 'TIER_PLAN_INVALID_PLATFORM',
              message: `Task plan ${taskPlan.taskId || taskIndex} has invalid platform: ${taskPlan.platform}`,
              path: `${taskPath}.platform`,
              suggestion: `Platform must be one of: ${validPlatforms.join(', ')}`,
            });
          }

          // Validate maxIterations
          if (typeof taskPlan.maxIterations !== 'number' || taskPlan.maxIterations <= 0) {
            errors.push({
              code: 'TIER_PLAN_INVALID_ITERATIONS',
              message: `Task plan ${taskPlan.taskId || taskIndex} has invalid maxIterations: ${taskPlan.maxIterations}`,
              path: `${taskPath}.maxIterations`,
              suggestion: 'maxIterations must be a positive number',
            });
          }

          // Validate subtasks
          if (!taskPlan.subtasks || taskPlan.subtasks.length === 0) {
            warnings.push({
              code: 'TIER_PLAN_EMPTY_TASK',
              message: `Task plan ${taskPlan.taskId || taskIndex} has no subtasks`,
              suggestion: 'Ensure task plan includes all subtasks from PRD',
            });
          } else {
            taskPlan.subtasks.forEach((subtaskPlan, subtaskIndex) => {
              const subtaskPath = `${taskPath}.subtasks[${subtaskIndex}]`;

              // Check required fields
              if (!subtaskPlan.subtaskId) {
                errors.push({
                  code: 'TIER_PLAN_MISSING_ID',
                  message: `Subtask plan at index ${subtaskIndex} in task ${taskPlan.taskId || taskIndex} is missing subtaskId`,
                  path: `${subtaskPath}.subtaskId`,
                  suggestion: 'Add subtaskId to match PRD subtask ID',
                });
              }

              // Validate platform
              if (!subtaskPlan.platform || !validPlatforms.includes(subtaskPlan.platform)) {
                errors.push({
                  code: 'TIER_PLAN_INVALID_PLATFORM',
                  message: `Subtask plan ${subtaskPlan.subtaskId || subtaskIndex} has invalid platform: ${subtaskPlan.platform}`,
                  path: `${subtaskPath}.platform`,
                  suggestion: `Platform must be one of: ${validPlatforms.join(', ')}`,
                });
              }

              // Validate maxIterations
              if (typeof subtaskPlan.maxIterations !== 'number' || subtaskPlan.maxIterations <= 0) {
                errors.push({
                  code: 'TIER_PLAN_INVALID_ITERATIONS',
                  message: `Subtask plan ${subtaskPlan.subtaskId || subtaskIndex} has invalid maxIterations: ${subtaskPlan.maxIterations}`,
                  path: `${subtaskPath}.maxIterations`,
                  suggestion: 'maxIterations must be a positive number',
                });
              }
            });
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates tier plan structure matches PRD structure.
   * Ensures all PRD phases/tasks/subtasks have corresponding plans.
   * 
   * @param prd - PRD to validate against
   * @param plan - Tier plan to validate
   * @returns Validation result with errors and warnings
   */
  validateTierPlanStructure(prd: PRD, plan: TierPlan): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Create maps of IDs from PRD
    const prdPhaseIds = new Set(prd.phases.map(p => p.id));
    const prdTaskIds = new Map<string, Set<string>>(); // phaseId -> taskIds
    const prdSubtaskIds = new Map<string, Set<string>>(); // taskId -> subtaskIds

    prd.phases.forEach(phase => {
      const taskIds = new Set(phase.tasks.map(t => t.id));
      prdTaskIds.set(phase.id, taskIds);

      phase.tasks.forEach(task => {
        const subtaskIds = new Set(task.subtasks.map(s => s.id));
        prdSubtaskIds.set(task.id, subtaskIds);
      });
    });

    // Create maps of IDs from tier plan
    const planPhaseIds = new Set(plan.phases.map(p => p.phaseId));
    const planTaskIds = new Map<string, Set<string>>(); // phaseId -> taskIds
    const planSubtaskIds = new Map<string, Set<string>>(); // taskId -> subtaskIds

    plan.phases.forEach(phasePlan => {
      const taskIds = new Set(phasePlan.tasks.map(t => t.taskId));
      planTaskIds.set(phasePlan.phaseId, taskIds);

      phasePlan.tasks.forEach(taskPlan => {
        const subtaskIds = new Set(taskPlan.subtasks.map(s => s.subtaskId));
        planSubtaskIds.set(taskPlan.taskId, subtaskIds);
      });
    });

    // Check for missing phases in plan
    prdPhaseIds.forEach(phaseId => {
      if (!planPhaseIds.has(phaseId)) {
        errors.push({
          code: 'TIER_PLAN_MISMATCH',
          message: `PRD phase ${phaseId} has no corresponding plan`,
          path: 'phases',
          suggestion: `Add tier plan entry for phase ${phaseId}`,
        });
      }
    });

    // Check for extra phases in plan
    planPhaseIds.forEach(phaseId => {
      if (!prdPhaseIds.has(phaseId)) {
        warnings.push({
          code: 'TIER_PLAN_EXTRA_PHASE',
          message: `Tier plan has phase ${phaseId} that is not in PRD`,
          suggestion: `Remove tier plan entry for phase ${phaseId} or add it to PRD`,
        });
      }
    });

    // Check for missing tasks in plan
    prdTaskIds.forEach((taskIds, phaseId) => {
      const planTasks = planTaskIds.get(phaseId) || new Set<string>();
      taskIds.forEach(taskId => {
        if (!planTasks.has(taskId)) {
          errors.push({
            code: 'TIER_PLAN_MISMATCH',
            message: `PRD task ${taskId} in phase ${phaseId} has no corresponding plan`,
            path: `phases[${phaseId}].tasks`,
            suggestion: `Add tier plan entry for task ${taskId}`,
          });
        }
      });
    });

    // Check for missing subtasks in plan
    prdSubtaskIds.forEach((subtaskIds, taskId) => {
      const planSubtasks = planSubtaskIds.get(taskId) || new Set<string>();
      subtaskIds.forEach(subtaskId => {
        if (!planSubtasks.has(subtaskId)) {
          errors.push({
            code: 'TIER_PLAN_MISMATCH',
            message: `PRD subtask ${subtaskId} in task ${taskId} has no corresponding plan`,
            path: `tasks[${taskId}].subtasks`,
            suggestion: `Add tier plan entry for subtask ${subtaskId}`,
          });
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates all artifacts together.
   * Runs all validation methods and aggregates results.
   * 
   * @param prd - PRD to validate
   * @param arch - Architecture document to validate
   * @param plan - Tier plan to validate
   * @param config - Configuration for validation
   * @returns Combined validation result
   */
  validateAll(
    prd: PRD,
    arch: string,
    plan: TierPlan,
    config: PuppetMasterConfig
  ): ValidationResult {
    // Run all validations
    const prdResult = this.validatePrd(prd);
    const archResult = this.validateArchitecture(arch);
    const planResult = this.validateTierPlan(plan, config);
    const structureResult = this.validateTierPlanStructure(prd, plan);

    // Aggregate all errors and warnings
    const allErrors = [
      ...prdResult.errors,
      ...archResult.errors,
      ...planResult.errors,
      ...structureResult.errors,
    ];

    const allWarnings = [
      ...prdResult.warnings,
      ...archResult.warnings,
      ...planResult.warnings,
      ...structureResult.warnings,
    ];

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
}
