/**
 * Permission Audit Logger Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionAuditLogger } from './permission-audit-logger.js';
import type { PermissionPromptDetection } from './permission-prompt-detector.js';

describe('PermissionAuditLogger', () => {
  let logger: PermissionAuditLogger;

  beforeEach(() => {
    logger = new PermissionAuditLogger();
  });

  describe('logFlagsApplied', () => {
    it('records permission flags', () => {
      logger.logFlagsApplied('claude', {
        '--permission-mode': 'acceptEdits',
        '--allowedTools': 'Read,Write,Edit',
      });

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].platform).toBe('claude');
      expect(entries[0].event).toBe('flags_applied');
      expect(entries[0].details.flags).toEqual({
        '--permission-mode': 'acceptEdits',
        '--allowedTools': 'Read,Write,Edit',
      });
    });
  });

  describe('logPromptDetected', () => {
    it('records detected permission prompt', () => {
      const detection: PermissionPromptDetection = {
        detected: true,
        pattern: '[Y/n]',
        context: 'Do you want to continue? [Y/n]',
        platform: 'cursor',
        timestamp: '2026-01-15T10:30:00.000Z',
      };

      logger.logPromptDetected(detection);

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].event).toBe('prompt_detected');
      expect(entries[0].platform).toBe('cursor');
      expect(entries[0].details.pattern).toBe('[Y/n]');
      expect(entries[0].details.context).toContain('[Y/n]');
    });
  });

  describe('logSdkPermissionRequest', () => {
    it('records SDK permission request', () => {
      logger.logSdkPermissionRequest('copilot', 'write', '/workspace/src/index.ts');

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].event).toBe('sdk_permission_request');
      expect(entries[0].details.requestType).toBe('write');
      expect(entries[0].details.resource).toBe('/workspace/src/index.ts');
    });
  });

  describe('logSdkPermissionDecision', () => {
    it('records SDK permission decision with reason', () => {
      logger.logSdkPermissionDecision(
        'copilot',
        'shell',
        'npm test',
        'approved',
        'within workspace boundary'
      );

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].event).toBe('sdk_permission_decision');
      expect(entries[0].details.decision).toBe('approved');
      expect(entries[0].details.reason).toBe('within workspace boundary');
    });
  });

  describe('logProbeResult', () => {
    it('records probe result', () => {
      logger.logProbeResult('cursor', 'approval_flag', {
        flagFound: '--approval-mode',
        supported: true,
      });

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].event).toBe('probe_result');
      expect(entries[0].details.probeType).toBe('approval_flag');
      expect(entries[0].details.flagFound).toBe('--approval-mode');
    });
  });

  describe('querying', () => {
    beforeEach(() => {
      logger.logFlagsApplied('claude', { '--permission-mode': 'acceptEdits' });
      logger.logFlagsApplied('gemini', { '--approval-mode': 'yolo' });
      logger.logSdkPermissionRequest('copilot', 'write', '/workspace/test.ts');
      logger.logSdkPermissionDecision('copilot', 'write', '/workspace/test.ts', 'approved');
    });

    it('getEntriesForPlatform filters correctly', () => {
      const claudeEntries = logger.getEntriesForPlatform('claude');
      expect(claudeEntries).toHaveLength(1);
      expect(claudeEntries[0].platform).toBe('claude');

      const copilotEntries = logger.getEntriesForPlatform('copilot');
      expect(copilotEntries).toHaveLength(2);
    });

    it('getEntriesByType filters correctly', () => {
      const flagEntries = logger.getEntriesByType('flags_applied');
      expect(flagEntries).toHaveLength(2);

      const sdkEntries = logger.getEntriesByType('sdk_permission_request');
      expect(sdkEntries).toHaveLength(1);
    });

    it('size returns correct count', () => {
      expect(logger.size).toBe(4);
    });
  });

  describe('serialization', () => {
    it('toJSON returns valid JSON', () => {
      logger.logFlagsApplied('claude', { '--permission-mode': 'acceptEdits' });
      const json = logger.toJSON();
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('capacity management', () => {
    it('caps entries at MAX_ENTRIES', () => {
      // Add more than 1000 entries
      for (let i = 0; i < 1050; i++) {
        logger.logFlagsApplied('claude', { index: String(i) });
      }

      expect(logger.size).toBeLessThanOrEqual(1000);
    });

    it('clear removes all entries', () => {
      logger.logFlagsApplied('claude', { test: 'true' });
      logger.logFlagsApplied('gemini', { test: 'true' });
      expect(logger.size).toBe(2);

      logger.clear();
      expect(logger.size).toBe(0);
    });
  });

  describe('timestamps', () => {
    it('auto-generates ISO timestamps', () => {
      logger.logFlagsApplied('claude', {});
      const entries = logger.getEntries();
      expect(entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
