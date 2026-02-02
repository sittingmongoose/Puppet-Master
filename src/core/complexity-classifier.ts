/**
 * ComplexityClassifier (P2-T05)
 *
 * Deterministically classifies a subtask (TierNode) into:
 * - complexity: trivial | simple | standard | critical
 * - taskType: feature | bugfix | refactor | test | docs
 *
 * Then maps (complexity × taskType) to a model level (level1|level2|level3).
 *
 * This is intentionally heuristic and cheap: no LLM calls, no runtime I/O.
 */
import type { TierNode } from './tier-node.js';
import type { Complexity, TaskType, ModelLevel, ComplexityRoutingMatrix } from '../types/config.js';

export type { Complexity, TaskType };

/**
 * Default routing matrix from BUILD_QUEUE_IMPROVEMENTS.md P2-T05 prompt.
 */
export const DEFAULT_COMPLEXITY_ROUTING_MATRIX: ComplexityRoutingMatrix = {
  trivial: { feature: 'level1', bugfix: 'level1', refactor: 'level1', test: 'level1', docs: 'level1' },
  simple: { feature: 'level1', bugfix: 'level2', refactor: 'level1', test: 'level1', docs: 'level1' },
  standard: { feature: 'level2', bugfix: 'level2', refactor: 'level2', test: 'level2', docs: 'level1' },
  critical: { feature: 'level3', bugfix: 'level3', refactor: 'level3', test: 'level2', docs: 'level2' },
};

export interface ClassificationResult {
  complexity: Complexity;
  taskType: TaskType;
}

/**
 * ComplexityClassifier
 *
 * Notes on heuristics:
 * - We primarily use acceptance criteria count because it correlates strongly with surface area.
 * - We bump complexity when testPlan contains multiple commands (integration/system scope).
 * - We bias CRITICAL for migrations/security/architecture keywords.
 */
export class ComplexityClassifier {
  private readonly matrix: ComplexityRoutingMatrix;

  constructor(matrix?: ComplexityRoutingMatrix) {
    this.matrix = matrix ?? DEFAULT_COMPLEXITY_ROUTING_MATRIX;
  }

  classify(subtask: TierNode): ClassificationResult {
    const complexity = this.classifyComplexity(subtask);
    const taskType = this.classifyTaskType(subtask);
    return { complexity, taskType };
  }

  getModelLevel(complexity: Complexity, taskType: TaskType): ModelLevel {
    return this.matrix[complexity][taskType];
  }

  private classifyComplexity(subtask: TierNode): Complexity {
    const criteriaCount = subtask.data.acceptanceCriteria?.length ?? 0;
    const testCommandCount = subtask.data.testPlan?.commands?.length ?? 0;

    const text = this.getSignalText(subtask);
    const hasCriticalKeywords =
      /\b(migration|migrate|security|auth|encryption|architecture|orchestrator|state machine|breaking change)\b/i.test(
        text
      );

    if (hasCriticalKeywords) {
      return 'critical';
    }

    // Primary heuristic: criteria count buckets
    if (criteriaCount <= 2 && testCommandCount <= 1) {
      return 'trivial';
    }
    if (criteriaCount <= 5 && testCommandCount <= 2) {
      return 'simple';
    }
    if (criteriaCount <= 10 && testCommandCount <= 4) {
      return 'standard';
    }
    return 'critical';
  }

  private classifyTaskType(subtask: TierNode): TaskType {
    const text = this.getSignalText(subtask);

    if (/\b(readme|docs?|documentation|changelog)\b/i.test(text)) {
      return 'docs';
    }

    // "test" before "bugfix" to avoid "fix test" being treated as bugfix.
    if (/\b(test|vitest|jest|coverage|spec|assert)\b/i.test(text)) {
      return 'test';
    }

    if (/\b(fix|bug|regression|crash|error|broken|fails?)\b/i.test(text)) {
      return 'bugfix';
    }

    if (/\b(refactor|cleanup|restructure|rewrite|rename|simplify)\b/i.test(text)) {
      return 'refactor';
    }

    return 'feature';
  }

  private getSignalText(subtask: TierNode): string {
    const title = subtask.data.title ?? '';
    const description = subtask.data.description ?? '';
    const criteriaText = (subtask.data.acceptanceCriteria ?? [])
      .map((c) => `${c.description ?? ''} ${c.verification ?? ''}`)
      .join(' ');
    return `${title}\n${description}\n${criteriaText}`.trim();
  }
}

