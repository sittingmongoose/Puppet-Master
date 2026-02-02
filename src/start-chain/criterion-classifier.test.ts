import { describe, it, expect } from 'vitest';
import type { Criterion } from '../types/tiers.js';
import { CriterionClassifier } from './criterion-classifier.js';

describe('CriterionClassifier', () => {
  it('classifies test-related criteria as command and generates TEST target', () => {
    const classifier = new CriterionClassifier();
    const type = classifier.classifyAcceptanceCriterion('Run unit tests for the module');
    expect(type).toBe('command');

    const criterion: Criterion = {
      id: 'X-AC-001',
      description: 'Run unit tests for the module',
      type,
      target: '',
    };

    expect(classifier.generateVerificationTarget(criterion)).toBe('TEST:npm test');
  });

  it('classifies file-related criteria when a path is present', () => {
    const classifier = new CriterionClassifier();
    const type = classifier.classifyAcceptanceCriterion('Create `src/foo.ts` file');
    expect(type).toBe('file_exists');

    const criterion: Criterion = {
      id: 'X-AC-001',
      description: 'Create `src/foo.ts` file',
      type,
      target: '',
    };

    expect(classifier.generateVerificationTarget(criterion)).toBe('FILE_VERIFY:src/foo.ts:exists');
  });

  it('falls back to AI_VERIFY when it cannot infer a command', () => {
    const classifier = new CriterionClassifier();
    const type = classifier.classifyAcceptanceCriterion('Improve performance and latency');
    expect(type).toBe('command');

    const criterion: Criterion = {
      id: 'X-AC-001',
      description: 'Improve performance and latency',
      type,
      target: '',
    };

    expect(classifier.generateVerificationTarget(criterion)).toBe('AI_VERIFY:Improve performance and latency');
  });
});

