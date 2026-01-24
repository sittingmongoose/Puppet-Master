/**
 * No Manual Criteria Validator
 *
 * Enforces the project invariant: PRDs must not contain manual acceptance criteria.
 * This is a runtime validator (PRDs are loaded from JSON) so it must be defensive
 * against unknown shapes and values.
 */

import type { PRD } from '../../types/prd.js';
import type { ValidationError, ValidationResult } from '../validation-gate.js';

export function validateNoManualCriteria(prd: PRD): ValidationResult {
  const errors: ValidationError[] = [];

  const pushError = (path: string, foundType: string) => {
    errors.push({
      code: 'PRD_MANUAL_CRITERIA',
      message: `Manual acceptance criterion found (type: '${foundType}')`,
      path,
      suggestion: `Replace 'manual' with a machine-verifiable type ('command', 'file_exists', 'regex', 'browser_verify', 'script', or 'ai')`,
    });
  };

  const root = prd as unknown as Record<string, unknown>;
  const phases = Array.isArray(root.phases) ? (root.phases as unknown[]) : [];

  phases.forEach((phase, phaseIndex) => {
    const phasePath = `phases[${phaseIndex}]`;
    scanCriteria((phase as any)?.acceptanceCriteria, `${phasePath}.acceptanceCriteria`, pushError);

    const tasks = Array.isArray((phase as any)?.tasks) ? ((phase as any).tasks as unknown[]) : [];
    tasks.forEach((task, taskIndex) => {
      const taskPath = `${phasePath}.tasks[${taskIndex}]`;
      scanCriteria((task as any)?.acceptanceCriteria, `${taskPath}.acceptanceCriteria`, pushError);

      const subtasks = Array.isArray((task as any)?.subtasks) ? ((task as any).subtasks as unknown[]) : [];
      subtasks.forEach((subtask, subtaskIndex) => {
        const subtaskPath = `${taskPath}.subtasks[${subtaskIndex}]`;
        scanCriteria((subtask as any)?.acceptanceCriteria, `${subtaskPath}.acceptanceCriteria`, pushError);
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

function scanCriteria(
  criteria: unknown,
  basePath: string,
  onManual: (path: string, foundType: string) => void
): void {
  if (!Array.isArray(criteria)) return;

  criteria.forEach((criterion, index) => {
    const typeValue = (criterion as any)?.type;
    if (typeof typeValue === 'string' && typeValue.toLowerCase() === 'manual') {
      onManual(`${basePath}[${index}]`, typeValue);
    }
  });
}

