/**
 * Tests for CheckRegistry
 * 
 * Tests check registry functionality including registration,
 * execution, category filtering, and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CheckRegistry } from './check-registry.js';
import type { DoctorCheck, CheckResult, CheckCategory } from './check-registry.js';

/**
 * Mock check implementation for testing
 */
class MockCheck implements DoctorCheck {
  constructor(
    public readonly name: string,
    public readonly category: CheckCategory,
    public readonly description: string,
    private readonly shouldPass: boolean,
    private readonly message: string,
    private readonly delayMs: number = 0
  ) {}

  async run(): Promise<CheckResult> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    return {
      name: this.name,
      category: this.category,
      passed: this.shouldPass,
      message: this.message,
      durationMs: 0, // Will be overwritten by registry
    };
  }
}

/**
 * Mock check that throws an error
 */
class FailingCheck implements DoctorCheck {
  constructor(
    public readonly name: string,
    public readonly category: CheckCategory,
    public readonly description: string
  ) {}

  async run(): Promise<CheckResult> {
    throw new Error('Check execution failed');
  }
}

describe('CheckRegistry', () => {
  let registry: CheckRegistry;

  beforeEach(() => {
    registry = new CheckRegistry();
  });

  describe('register', () => {
    it('should register a check', () => {
      const check = new MockCheck('test-check', 'cli', 'Test check', true, 'Passed');
      registry.register(check);

      const registered = registry.getRegisteredChecks();
      expect(registered).toHaveLength(1);
      expect(registered[0]).toBe(check);
    });

    it('should overwrite existing check with same name', () => {
      const check1 = new MockCheck('test-check', 'cli', 'First check', true, 'Passed');
      const check2 = new MockCheck('test-check', 'git', 'Second check', false, 'Failed');

      registry.register(check1);
      registry.register(check2);

      const registered = registry.getRegisteredChecks();
      expect(registered).toHaveLength(1);
      expect(registered[0]).toBe(check2);
      expect(registered[0].category).toBe('git');
    });

    it('should allow registering multiple checks', () => {
      const check1 = new MockCheck('check-1', 'cli', 'Check 1', true, 'Passed');
      const check2 = new MockCheck('check-2', 'git', 'Check 2', true, 'Passed');
      const check3 = new MockCheck('check-3', 'runtime', 'Check 3', false, 'Failed');

      registry.register(check1);
      registry.register(check2);
      registry.register(check3);

      const registered = registry.getRegisteredChecks();
      expect(registered).toHaveLength(3);
    });
  });

  describe('unregister', () => {
    it('should unregister a check by name', () => {
      const check = new MockCheck('test-check', 'cli', 'Test check', true, 'Passed');
      registry.register(check);

      const removed = registry.unregister('test-check');
      expect(removed).toBe(true);
      expect(registry.getRegisteredChecks()).toHaveLength(0);
    });

    it('should return false when unregistering non-existent check', () => {
      const removed = registry.unregister('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('runAll', () => {
    it('should run all registered checks', async () => {
      const check1 = new MockCheck('check-1', 'cli', 'Check 1', true, 'Passed');
      const check2 = new MockCheck('check-2', 'git', 'Check 2', false, 'Failed');
      const check3 = new MockCheck('check-3', 'runtime', 'Check 3', true, 'Passed');

      registry.register(check1);
      registry.register(check2);
      registry.register(check3);

      const results = await registry.runAll();

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe('check-1');
      expect(results[0].passed).toBe(true);
      expect(results[1].name).toBe('check-2');
      expect(results[1].passed).toBe(false);
      expect(results[2].name).toBe('check-3');
      expect(results[2].passed).toBe(true);
    });

    it('should return empty array when no checks registered', async () => {
      const results = await registry.runAll();
      expect(results).toHaveLength(0);
    });

    it('should measure execution duration', async () => {
      const check = new MockCheck('slow-check', 'cli', 'Slow check', true, 'Passed', 50);
      registry.register(check);

      const results = await registry.runAll();
      // Timers can under-shoot slightly under load; assert a close lower bound instead of exact delay.
      expect(results[0].durationMs).toBeGreaterThanOrEqual(40);
    });

    it('should handle errors gracefully', async () => {
      const check = new FailingCheck('failing-check', 'cli', 'Failing check');
      registry.register(check);

      const results = await registry.runAll();
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toContain('Check execution failed');
      expect(results[0].name).toBe('failing-check');
      expect(results[0].category).toBe('cli');
    });

    it('should ensure result has correct name and category', async () => {
      const check = new MockCheck('test-check', 'project', 'Test check', true, 'Passed');
      registry.register(check);

      const results = await registry.runAll();
      expect(results[0].name).toBe('test-check');
      expect(results[0].category).toBe('project');
    });
  });

  describe('runCategory', () => {
    it('should run only checks in specified category', async () => {
      const cliCheck1 = new MockCheck('cli-1', 'cli', 'CLI Check 1', true, 'Passed');
      const cliCheck2 = new MockCheck('cli-2', 'cli', 'CLI Check 2', false, 'Failed');
      const gitCheck = new MockCheck('git-1', 'git', 'Git Check', true, 'Passed');
      const runtimeCheck = new MockCheck('runtime-1', 'runtime', 'Runtime Check', true, 'Passed');

      registry.register(cliCheck1);
      registry.register(cliCheck2);
      registry.register(gitCheck);
      registry.register(runtimeCheck);

      const results = await registry.runCategory('cli');

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.category === 'cli')).toBe(true);
      expect(results.some((r) => r.name === 'cli-1')).toBe(true);
      expect(results.some((r) => r.name === 'cli-2')).toBe(true);
    });

    it('should return empty array when no checks in category', async () => {
      const check = new MockCheck('cli-check', 'cli', 'CLI Check', true, 'Passed');
      registry.register(check);

      const results = await registry.runCategory('git');
      expect(results).toHaveLength(0);
    });

    it('should handle all category types', async () => {
      const categories: CheckCategory[] = ['cli', 'git', 'runtime', 'project', 'network'];
      
      for (const category of categories) {
        const check = new MockCheck(`check-${category}`, category, `${category} check`, true, 'Passed');
        registry.register(check);
      }

      for (const category of categories) {
        const results = await registry.runCategory(category);
        expect(results).toHaveLength(1);
        expect(results[0].category).toBe(category);
      }
    });
  });

  describe('runOne', () => {
    it('should run a single check by name', async () => {
      const check = new MockCheck('test-check', 'cli', 'Test check', true, 'Passed');
      registry.register(check);

      const result = await registry.runOne('test-check');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('test-check');
      expect(result?.passed).toBe(true);
      expect(result?.category).toBe('cli');
    });

    it('should return null for non-existent check', async () => {
      const result = await registry.runOne('non-existent');
      expect(result).toBeNull();
    });

    it('should handle errors in single check execution', async () => {
      const check = new FailingCheck('failing-check', 'git', 'Failing check');
      registry.register(check);

      const result = await registry.runOne('failing-check');

      expect(result).not.toBeNull();
      expect(result?.passed).toBe(false);
      expect(result?.message).toContain('Check execution failed');
    });
  });

  describe('getRegisteredChecks', () => {
    it('should return all registered checks', () => {
      const check1 = new MockCheck('check-1', 'cli', 'Check 1', true, 'Passed');
      const check2 = new MockCheck('check-2', 'git', 'Check 2', true, 'Passed');

      registry.register(check1);
      registry.register(check2);

      const registered = registry.getRegisteredChecks();
      expect(registered).toHaveLength(2);
      expect(registered).toContain(check1);
      expect(registered).toContain(check2);
    });

    it('should return empty array when no checks registered', () => {
      const registered = registry.getRegisteredChecks();
      expect(registered).toHaveLength(0);
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      registry.register(new MockCheck('check-1', 'cli', 'Check 1', true, 'Passed'));
      registry.register(new MockCheck('check-2', 'git', 'Check 2', true, 'Passed'));
      registry.register(new MockCheck('check-3', 'cli', 'Check 3', true, 'Passed'));
      registry.register(new MockCheck('check-4', 'runtime', 'Check 4', true, 'Passed'));

      const categories = registry.getCategories();
      expect(categories).toHaveLength(3);
      expect(categories).toContain('cli');
      expect(categories).toContain('git');
      expect(categories).toContain('runtime');
    });

    it('should return sorted categories', () => {
      registry.register(new MockCheck('check-1', 'runtime', 'Check 1', true, 'Passed'));
      registry.register(new MockCheck('check-2', 'cli', 'Check 2', true, 'Passed'));
      registry.register(new MockCheck('check-3', 'git', 'Check 3', true, 'Passed'));

      const categories = registry.getCategories();
      expect(categories).toEqual(['cli', 'git', 'runtime']);
    });

    it('should return empty array when no checks registered', () => {
      const categories = registry.getCategories();
      expect(categories).toHaveLength(0);
    });
  });

  describe('integration', () => {
    it('should handle complex scenario with multiple checks and categories', async () => {
      // Register checks across multiple categories
      registry.register(new MockCheck('cursor-cli', 'cli', 'Cursor CLI', true, 'Available'));
      registry.register(new MockCheck('codex-cli', 'cli', 'Codex CLI', false, 'Not found'));
      registry.register(new MockCheck('git-available', 'git', 'Git CLI', true, 'Available'));
      registry.register(new MockCheck('git-config', 'git', 'Git Config', true, 'Configured'));
      registry.register(new MockCheck('node-version', 'runtime', 'Node.js', true, 'v20.10.0'));

      // Run all checks
      const allResults = await registry.runAll();
      expect(allResults).toHaveLength(5);

      // Run by category
      const cliResults = await registry.runCategory('cli');
      expect(cliResults).toHaveLength(2);

      const gitResults = await registry.runCategory('git');
      expect(gitResults).toHaveLength(2);

      // Run single check
      const singleResult = await registry.runOne('cursor-cli');
      expect(singleResult).not.toBeNull();
      expect(singleResult?.passed).toBe(true);

      // Get categories
      const categories = registry.getCategories();
      expect(categories).toHaveLength(3);
      expect(categories).toContain('cli');
      expect(categories).toContain('git');
      expect(categories).toContain('runtime');
    });
  });
});
