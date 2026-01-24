/**
 * ComplexityClassifier Tests (P2-T05)
 *
 * Focused tests for deterministic complexity + task type classification and
 * complexity×taskType → model level routing.
 */

import { describe, it, expect } from 'vitest';
import { ComplexityClassifier, DEFAULT_COMPLEXITY_ROUTING_MATRIX } from './complexity-classifier.js';
import { TierNode } from './tier-node.js';
import type { TierNodeData } from './tier-node.js';
import type { Criterion, TestCommand } from '../types/tiers.js';
import type { ComplexityRoutingMatrix } from '../types/config.js';

function createCriteria(count: number, text?: string): Criterion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `AC-${i + 1}`,
    description: text ?? `Criterion ${i + 1}`,
    type: 'regex',
    target: 'noop',
  }));
}

function createTestCommands(count: number): TestCommand[] {
  return Array.from({ length: count }, (_, i) => ({
    command: 'echo',
    args: [`test-${i + 1}`],
  }));
}

function createSubtaskNode(input: {
  title?: string;
  description?: string;
  criteriaCount?: number;
  testCommandCount?: number;
  criteriaText?: string;
}): TierNode {
  const title = input.title ?? 'Test Subtask';
  const description = input.description ?? '';
  const criteriaCount = input.criteriaCount ?? 0;
  const testCommandCount = input.testCommandCount ?? 0;

  const data: TierNodeData = {
    id: 'ST-001-001-001',
    type: 'subtask',
    title,
    description,
    plan: { id: 'ST-001-001-001', title, description },
    acceptanceCriteria: createCriteria(criteriaCount, input.criteriaText),
    testPlan: { commands: createTestCommands(testCommandCount), failFast: false },
    evidence: [],
    iterations: 0,
    maxIterations: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  return new TierNode(data);
}

describe('ComplexityClassifier', () => {
  it('classifies trivial when ≤2 criteria and ≤1 test command', () => {
    const classifier = new ComplexityClassifier();
    const subtask = createSubtaskNode({ criteriaCount: 2, testCommandCount: 1 });
    expect(classifier.classify(subtask).complexity).toBe('trivial');
  });

  it('classifies simple when ≤5 criteria and ≤2 test commands', () => {
    const classifier = new ComplexityClassifier();
    const subtask = createSubtaskNode({ criteriaCount: 5, testCommandCount: 2 });
    expect(classifier.classify(subtask).complexity).toBe('simple');
  });

  it('classifies standard when ≤10 criteria and ≤4 test commands', () => {
    const classifier = new ComplexityClassifier();
    const subtask = createSubtaskNode({ criteriaCount: 10, testCommandCount: 4 });
    expect(classifier.classify(subtask).complexity).toBe('standard');
  });

  it('classifies critical when >10 criteria', () => {
    const classifier = new ComplexityClassifier();
    const subtask = createSubtaskNode({ criteriaCount: 11, testCommandCount: 0 });
    expect(classifier.classify(subtask).complexity).toBe('critical');
  });

  it('classifies critical when critical keywords appear', () => {
    const classifier = new ComplexityClassifier();
    const subtask = createSubtaskNode({ title: 'Database migration', criteriaCount: 1 });
    expect(classifier.classify(subtask).complexity).toBe('critical');
  });

  it('detects taskType from text (docs/test/bugfix/refactor/feature)', () => {
    const classifier = new ComplexityClassifier();

    expect(classifier.classify(createSubtaskNode({ title: 'Update docs' })).taskType).toBe('docs');
    expect(classifier.classify(createSubtaskNode({ title: 'Add vitest coverage' })).taskType).toBe('test');
    expect(classifier.classify(createSubtaskNode({ title: 'Fix crash on startup' })).taskType).toBe('bugfix');
    expect(classifier.classify(createSubtaskNode({ title: 'Refactor router logic' })).taskType).toBe('refactor');
    expect(classifier.classify(createSubtaskNode({ title: 'Add new feature' })).taskType).toBe('feature');
  });

  it('maps complexity×taskType to model level via default matrix', () => {
    const classifier = new ComplexityClassifier();
    expect(classifier.getModelLevel('trivial', 'feature')).toBe('level1');
    expect(classifier.getModelLevel('simple', 'bugfix')).toBe('level2');
    expect(classifier.getModelLevel('standard', 'feature')).toBe('level2');
    expect(classifier.getModelLevel('critical', 'feature')).toBe('level3');
  });

  it('uses a custom matrix when provided', () => {
    const custom: ComplexityRoutingMatrix = {
      trivial: { feature: 'level3', bugfix: 'level3', refactor: 'level3', test: 'level3', docs: 'level3' },
      simple: { feature: 'level2', bugfix: 'level2', refactor: 'level2', test: 'level2', docs: 'level2' },
      standard: { feature: 'level1', bugfix: 'level1', refactor: 'level1', test: 'level1', docs: 'level1' },
      critical: { feature: 'level1', bugfix: 'level1', refactor: 'level1', test: 'level1', docs: 'level1' },
    };
    const classifier = new ComplexityClassifier(custom);
    expect(classifier.getModelLevel('trivial', 'feature')).toBe('level3');
  });

  it('DEFAULT_COMPLEXITY_ROUTING_MATRIX matches classifier output', () => {
    const classifier = new ComplexityClassifier();
    const expected = DEFAULT_COMPLEXITY_ROUTING_MATRIX.standard.refactor;
    const actual = classifier.getModelLevel('standard', 'refactor');
    expect(actual).toBe(expected);
  });
});

