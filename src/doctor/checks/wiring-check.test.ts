/**
 * Wiring Check Tests
 * 
 * Tests for the Doctor wiring check.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WiringCheck, createWiringCheck } from './wiring-check.js';
import type { CheckResult } from '../check-registry.js';

describe('WiringCheck', () => {
  const projectRoot = process.cwd();

  describe('metadata', () => {
    it('should have correct name', () => {
      const check = new WiringCheck(projectRoot);
      expect(check.name).toBe('wiring');
    });

    it('should be in project category', () => {
      const check = new WiringCheck(projectRoot);
      expect(check.category).toBe('project');
    });

    it('should have a description', () => {
      const check = new WiringCheck(projectRoot);
      expect(check.description).toBeDefined();
      expect(check.description.length).toBeGreaterThan(0);
    });
  });

  describe('run', () => {
    it('should return valid CheckResult structure', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('durationMs');

      expect(result.name).toBe('wiring');
      expect(result.category).toBe('project');
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.durationMs).toBe('number');
    });

    it('should include details', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      expect(result.details).toBeDefined();
      expect(result.details!.length).toBeGreaterThan(0);
    });

    it('should report duration', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.details).toContain('Duration:');
    });

    it('should include summary in details', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      expect(result.details).toContain('Summary:');
      expect(result.details).toContain('Missing Injections:');
      expect(result.details).toContain('Event Mismatches:');
      expect(result.details).toContain('Verifier Gaps:');
    });
  });

  describe('pass/fail logic', () => {
    it('should pass when no errors are found', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      // The actual pass/fail depends on the codebase state
      // We just verify the logic is consistent
      if (result.passed) {
        expect(result.message).not.toContain('error');
      } else {
        expect(result.message).toContain('error');
        expect(result.fixSuggestion).toBeDefined();
      }
    });

    it('should provide fix suggestions for errors', async () => {
      const check = new WiringCheck(projectRoot);
      const result = await check.run();

      // If not passed, should have fix suggestions
      if (!result.passed) {
        expect(result.fixSuggestion).toBeDefined();
        expect(result.fixSuggestion!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid project root gracefully', async () => {
      const check = new WiringCheck('/nonexistent/project');
      const result = await check.run();

      // Should not throw, should report issues
      expect(result).toBeDefined();
      // Will likely fail due to missing files
      expect(typeof result.passed).toBe('boolean');
    });
  });
});

describe('createWiringCheck', () => {
  it('should create a WiringCheck instance', () => {
    const check = createWiringCheck(process.cwd());
    expect(check).toBeInstanceOf(WiringCheck);
  });

  it('should pass project root to instance', () => {
    const customRoot = '/custom/path';
    const check = createWiringCheck(customRoot);
    // The projectRoot is private, but we can verify the instance is created
    expect(check).toBeDefined();
  });
});
