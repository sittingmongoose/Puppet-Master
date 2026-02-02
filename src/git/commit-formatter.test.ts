/**
 * Tests for CommitFormatter
 */

import { describe, it, expect } from 'vitest';
import { CommitFormatter } from './commit-formatter.js';
import type { CommitContext } from './commit-formatter.js';

describe('CommitFormatter', () => {
  const formatter = new CommitFormatter();

  describe('formatIteration', () => {
    it('should format iteration commit message', () => {
      const result = formatter.formatIteration('ST-001-001-001', 'implement feature');
      expect(result).toBe('ralph: ST-001-001-001 implement feature');
    });

    it('should handle long summaries', () => {
      const result = formatter.formatIteration('ST-001-001-002', 'add comprehensive error handling');
      expect(result).toBe('ralph: ST-001-001-002 add comprehensive error handling');
    });
  });

  describe('formatSubtaskComplete', () => {
    it('should format subtask complete commit message', () => {
      const result = formatter.formatSubtaskComplete('ST-001-001-001', 'Implement ConfigManager');
      expect(result).toBe('ralph: complete ST-001-001-001 - Implement ConfigManager');
    });

    it('should handle titles with special characters', () => {
      const result = formatter.formatSubtaskComplete('ST-001-001-002', 'Fix bug #123');
      expect(result).toBe('ralph: complete ST-001-001-002 - Fix bug #123');
    });
  });

  describe('formatTaskGate', () => {
    it('should format task gate PASS message', () => {
      const result = formatter.formatTaskGate('TK-001-001', 'PASS');
      expect(result).toBe('ralph: task-gate TK-001-001 - PASS');
    });

    it('should format task gate FAIL message', () => {
      const result = formatter.formatTaskGate('TK-001-002', 'FAIL');
      expect(result).toBe('ralph: task-gate TK-001-002 - FAIL');
    });
  });

  describe('formatPhaseGate', () => {
    it('should format phase gate PASS message', () => {
      const result = formatter.formatPhaseGate('PH-001', 'PASS');
      expect(result).toBe('ralph: phase-gate PH-001 - PASS');
    });

    it('should format phase gate FAIL message', () => {
      const result = formatter.formatPhaseGate('PH-002', 'FAIL');
      expect(result).toBe('ralph: phase-gate PH-002 - FAIL');
    });
  });

  describe('formatReplan', () => {
    it('should format replan commit message', () => {
      const result = formatter.formatReplan('PH-001', 'Scope expanded');
      expect(result).toBe('ralph: replan PH-001 - Scope expanded');
    });

    it('should handle detailed reasons', () => {
      const result = formatter.formatReplan('TK-001-001', 'Requirement changed, need additional tests');
      expect(result).toBe('ralph: replan TK-001-001 - Requirement changed, need additional tests');
    });
  });

  describe('formatReopen', () => {
    it('should format reopen commit message', () => {
      const result = formatter.formatReopen('ST-001-001-001', 'Found regression');
      expect(result).toBe('ralph: reopen ST-001-001-001 - Found regression');
    });

    it('should handle detailed reasons', () => {
      const result = formatter.formatReopen('TK-001-001', 'Need to add integration tests');
      expect(result).toBe('ralph: reopen TK-001-001 - Need to add integration tests');
    });
  });

  describe('format', () => {
    it('should dispatch to formatIteration for iteration tier', () => {
      const context: CommitContext = {
        tier: 'iteration',
        itemId: 'ST-001-001-001',
        summary: 'implement feature',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: ST-001-001-001 implement feature');
    });

    it('should dispatch to formatSubtaskComplete for subtask tier', () => {
      const context: CommitContext = {
        tier: 'subtask',
        itemId: 'ST-001-001-001',
        summary: 'Implement ConfigManager',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: complete ST-001-001-001 - Implement ConfigManager');
    });

    it('should dispatch to formatTaskGate for task_gate tier', () => {
      const context: CommitContext = {
        tier: 'task_gate',
        itemId: 'TK-001-001',
        summary: '',
        status: 'PASS',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: task-gate TK-001-001 - PASS');
    });

    it('should dispatch to formatPhaseGate for phase_gate tier', () => {
      const context: CommitContext = {
        tier: 'phase_gate',
        itemId: 'PH-001',
        summary: '',
        status: 'FAIL',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: phase-gate PH-001 - FAIL');
    });

    it('should dispatch to formatReplan for replan tier', () => {
      const context: CommitContext = {
        tier: 'replan',
        itemId: '',
        summary: 'PH-001',
        reason: 'Scope expanded',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: replan PH-001 - Scope expanded');
    });

    it('should dispatch to formatReopen for reopen tier', () => {
      const context: CommitContext = {
        tier: 'reopen',
        itemId: 'ST-001-001-001',
        summary: '',
        reason: 'Found regression',
      };
      const result = formatter.format(context);
      expect(result).toBe('ralph: reopen ST-001-001-001 - Found regression');
    });

    it('should throw error for task_gate without status', () => {
      const context: CommitContext = {
        tier: 'task_gate',
        itemId: 'TK-001-001',
        summary: '',
      };
      expect(() => formatter.format(context)).toThrow('Task gate commits require a status');
    });

    it('should throw error for phase_gate without status', () => {
      const context: CommitContext = {
        tier: 'phase_gate',
        itemId: 'PH-001',
        summary: '',
      };
      expect(() => formatter.format(context)).toThrow('Phase gate commits require a status');
    });

    it('should throw error for replan without reason', () => {
      const context: CommitContext = {
        tier: 'replan',
        itemId: '',
        summary: 'PH-001',
      };
      expect(() => formatter.format(context)).toThrow('Replan commits require a reason');
    });

    it('should throw error for reopen without reason', () => {
      const context: CommitContext = {
        tier: 'reopen',
        itemId: 'ST-001-001-001',
        summary: '',
      };
      expect(() => formatter.format(context)).toThrow('Reopen commits require a reason');
    });
  });
});
