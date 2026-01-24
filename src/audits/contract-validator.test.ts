/**
 * Contract Validator Tests
 * 
 * Tests for the contract validation system.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'path';
import { ContractValidator, createContractValidator, validateContracts } from './contract-validator.js';
import { ALL_BACKEND_EVENT_NAMES, ALL_FRONTEND_MESSAGE_TYPES } from '../contracts/events.contract.js';
import { ALL_CRITERION_TYPES, ALL_VERIFIER_CLASSES } from '../contracts/criterion-types.contract.js';

// Get project root for tests (relative to this file)
const PROJECT_ROOT = path.resolve(import.meta.dirname || __dirname, '../..');

describe('ContractValidator', () => {
  let validator: ContractValidator;

  beforeEach(() => {
    validator = createContractValidator(PROJECT_ROOT);
  });

  describe('validateAll', () => {
    it('should return validation result with all fields', async () => {
      const result = await validator.validateAll();

      expect(result).toHaveProperty('violations');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('warningCount');
      expect(result).toHaveProperty('durationMs');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.durationMs).toBe('number');
    });

    it('should complete in under 5 seconds', async () => {
      const result = await validator.validateAll();
      expect(result.durationMs).toBeLessThan(5000);
    });
  });

  describe('validateEventContract', () => {
    it('should validate event bus file exists', async () => {
      const violations = await validator.validateEventContract();
      
      // Should not have "file not found" error for event-bus.ts
      const fileNotFound = violations.find(
        v => v.file.includes('event-bus') && v.description.includes('not found')
      );
      expect(fileNotFound).toBeUndefined();
    });

    it('should detect event types in PuppetMasterEvent union', async () => {
      const violations = await validator.validateEventContract();
      
      // The actual event-bus.ts should have valid event types
      // If there are violations, they should be from the contract check
      for (const v of violations) {
        if (v.contract === 'EVENT_CONTRACT' && v.file.includes('event-bus')) {
          // Any violations should mention what was expected
          expect(v.expected).toBeDefined();
        }
      }
    });
  });

  describe('validateCriterionTypeContract', () => {
    it('should validate tiers.ts exists', async () => {
      const violations = await validator.validateCriterionTypeContract();
      
      // Should not have "file not found" error for tiers.ts
      const fileNotFound = violations.find(
        v => v.file.includes('tiers') && v.description.includes('not found')
      );
      expect(fileNotFound).toBeUndefined();
    });

    it('should validate container.ts exists', async () => {
      const violations = await validator.validateCriterionTypeContract();
      
      // Should not have "file not found" error for container.ts
      const fileNotFound = violations.find(
        v => v.file.includes('container') && v.description.includes('not found')
      );
      expect(fileNotFound).toBeUndefined();
    });

    it('should check all verifiers are registered', async () => {
      const violations = await validator.validateCriterionTypeContract();
      
      // Should not have "not found in container" errors for registered verifiers
      for (const verifierName of ALL_VERIFIER_CLASSES) {
        const missingVerifier = violations.find(
          v => v.description.includes(verifierName) && v.description.includes('not found')
        );
        expect(missingVerifier).toBeUndefined();
      }
    });
  });

  describe('validatePrdSchemaContract', () => {
    it('should validate prd-prompt.ts exists', async () => {
      const violations = await validator.validatePrdSchemaContract();
      
      // Should not have "file not found" error for prd-prompt.ts
      const fileNotFound = violations.find(
        v => v.file.includes('prd-prompt') && v.description.includes('not found')
      );
      expect(fileNotFound).toBeUndefined();
    });
  });
});

describe('Contract definitions', () => {
  describe('EVENT_CONTRACT', () => {
    it('should have all expected backend event names', () => {
      expect(ALL_BACKEND_EVENT_NAMES).toContain('state_changed');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('tier_changed');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('iteration_started');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('iteration_completed');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('output_chunk');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('error');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('progress');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('gate_start');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('gate_complete');
      expect(ALL_BACKEND_EVENT_NAMES).toContain('commit');
    });

    it('should have frontend message types for key events', () => {
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('state_change');
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('progress');
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('output');
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('iteration_start');
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('iteration_complete');
      expect(ALL_FRONTEND_MESSAGE_TYPES).toContain('error');
    });
  });

  describe('CRITERION_TYPE_CONTRACT', () => {
    it('should have all expected criterion types', () => {
      expect(ALL_CRITERION_TYPES).toContain('command');
      expect(ALL_CRITERION_TYPES).toContain('regex');
      expect(ALL_CRITERION_TYPES).toContain('file_exists');
      expect(ALL_CRITERION_TYPES).toContain('browser_verify');
      expect(ALL_CRITERION_TYPES).toContain('ai');
      expect(ALL_CRITERION_TYPES).toContain('script');
    });

    it('should NOT include manual type', () => {
      expect(ALL_CRITERION_TYPES).not.toContain('manual');
    });

    it('should have verifier class for each type', () => {
      expect(ALL_VERIFIER_CLASSES).toContain('CommandVerifier');
      expect(ALL_VERIFIER_CLASSES).toContain('RegexVerifier');
      expect(ALL_VERIFIER_CLASSES).toContain('FileExistsVerifier');
      expect(ALL_VERIFIER_CLASSES).toContain('BrowserVerifier');
      expect(ALL_VERIFIER_CLASSES).toContain('AIVerifier');
      expect(ALL_VERIFIER_CLASSES).toContain('ScriptVerifier');
    });

    it('should have same number of types and verifiers', () => {
      expect(ALL_CRITERION_TYPES.length).toBe(ALL_VERIFIER_CLASSES.length);
    });
  });
});

describe('validateContracts convenience function', () => {
  it('should run validation and return result', async () => {
    const result = await validateContracts(PROJECT_ROOT);
    
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('passed');
    expect(typeof result.passed).toBe('boolean');
  });
});

describe('ContractValidator with missing files', () => {
  it('should report violations for missing files', async () => {
    const validator = new ContractValidator({
      projectRoot: '/nonexistent/path',
    });

    const result = await validator.validateAll();
    
    // Should have violations for missing files
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.description.includes('not found'))).toBe(true);
  });
});
