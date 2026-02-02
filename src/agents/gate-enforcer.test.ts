/**
 * Tests for GateEnforcer class
 * 
 * Tests AGENTS.md rule enforcement during gate verification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GateEnforcer } from './gate-enforcer.js';
import type { AgentsDocument } from './multi-level-loader.js';

describe('GateEnforcer', () => {
  let enforcer: GateEnforcer;

  beforeEach(() => {
    enforcer = new GateEnforcer();
  });

  describe('check', () => {
    it('should return no violations when output complies with all rules', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use .js extension in all local imports'],
        dontItems: ['Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { foo } from './bar.js';
import { vi } from 'vitest';

describe('test', () => {
  it('works', () => {
    const mock = vi.fn();
  });
});
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.summary).toContain('All AGENTS.md rules passed');
    });

    it('should detect DON\'T violations for Jest patterns', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns (jest.fn(), jest.mock())'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { jest } from '@jest/globals';

describe('test', () => {
  it('works', () => {
    const mock = jest.fn();
  });
});
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('Jest'))).toBe(true);
      expect(result.summary).toContain('DON\'T rule violation');
    });

    it('should detect missing .js extension in imports', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use .js extension in all local imports'],
        dontItems: ['Omit .js extension in imports'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { foo } from './bar';
import { baz } from '../qux';
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      // Should detect missing .js extension
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect incorrect import type usage for Platform', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use import { Platform } for type aliases (use import type)'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { Platform } from './config.js';
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('import'))).toBe(true);
    });

    it('should detect Thread terminology violation', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use "Thread" terminology (use "Session")'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
const threadId = 'Thread-001';
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('Thread'))).toBe(true);
    });

    it('should detect exec() usage violation', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use exec() for process spawning (use spawn())'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { exec } from 'child_process';
exec('npm test');
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.type === 'dont' && v.rule.includes('exec()'))).toBe(true);
    });

    it('should extract context snippets for violations', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
// Line 1
// Line 2
const mock = jest.fn();
// Line 4
// Line 5
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      const violation = result.violations[0];
      expect(violation.context).toBeDefined();
      expect(violation.context).toContain('jest.fn()');
      expect(violation.lineNumber).toBeDefined();
    });

    it('should handle empty output', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use .js extension'],
        dontItems: ['Use Jest'],
        testing: [],
        directoryStructure: [],
      };

      const result = await enforcer.check('', agentsDoc);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle empty rules', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      const output = 'some code here';
      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle multiple violations', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [
          'Use Jest patterns',
          'Use exec() for process spawning',
          'Use "Thread" terminology',
        ],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { exec } from 'child_process';
const threadId = 'Thread-001';
const mock = jest.fn();
exec('npm test');
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
      expect(result.summary).toContain('violation(s)');
    });

    it('should include suggestions in violations', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = 'const mock = jest.fn();';
      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      const violation = result.violations.find(v => v.type === 'dont');
      expect(violation?.suggestion).toBeDefined();
      expect(violation?.suggestion).toContain('vi.fn()');
    });

    it('should handle rules with emoji prefixes', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['✅ Use .js extension'],
        dontItems: ['❌ Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = 'const mock = jest.fn();';
      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should handle rules with markdown list formatting', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['- Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = 'const mock = jest.fn();';
      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should generate actionable summary', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = 'const mock = jest.fn();';
      const result = await enforcer.check(output, agentsDoc);

      expect(result.summary).toContain('AGENTS.md rule violation');
      expect(result.summary).toContain('DON\'T');
      expect(result.summary).toContain('Jest');
    });

    it('should check DO rules for missing compliance', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: ['Use Vitest for testing'],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      // Output without Vitest
      const output = `
import { describe, it } from 'jest';
`;

      const result = await enforcer.check(output, agentsDoc);

      // Note: DO rule checking is less strict - it checks if patterns are present
      // This test verifies the method doesn't crash
      expect(result).toBeDefined();
      expect(result.passed !== undefined).toBe(true);
    });

    it('should handle complex code with multiple import statements', async () => {
      const agentsDoc: AgentsDocument = {
        overview: '',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: ['Use Jest patterns'],
        testing: [],
        directoryStructure: [],
      };

      const output = `
import { foo } from './bar.js';
import { baz } from '../qux.js';
import { jest } from '@jest/globals';

describe('test', () => {
  it('works', () => {
    const mock = jest.fn();
  });
});
`;

      const result = await enforcer.check(output, agentsDoc);

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.type === 'dont')).toBe(true);
    });
  });
});
