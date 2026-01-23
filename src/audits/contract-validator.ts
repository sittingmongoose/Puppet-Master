/**
 * Contract Validator
 * 
 * Validates cross-file contracts to ensure consistency between:
 * - Backend event emissions and frontend listeners
 * - Criterion types in tiers.ts and registered verifiers
 * - PRD prompt types and runtime types
 * 
 * This validator is deterministic (no AI) and fast (< 5 seconds).
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  ALL_BACKEND_EVENT_NAMES,
  ALL_FRONTEND_MESSAGE_TYPES,
  FRONTEND_EVENT_MAP,
} from '../contracts/events.contract.js';
import {
  ALL_CRITERION_TYPES,
  ALL_VERIFIER_CLASSES,
  CRITERION_TYPE_CONTRACT,
  ALL_SPEC_TOKENS,
  SPEC_TO_RUNTIME_MAP,
  type CriterionType,
  type VerifierClassName,
} from '../contracts/criterion-types.contract.js';

/**
 * A single contract violation.
 */
export interface ContractViolation {
  /** Which contract was violated */
  contract: string;
  /** File where violation was detected */
  file: string;
  /** Line number (if available) */
  line?: number;
  /** What was expected */
  expected: string;
  /** What was found */
  actual: string;
  /** Human-readable description */
  description: string;
  /** Severity: error = must fix, warning = should fix */
  severity: 'error' | 'warning';
}

/**
 * Result of contract validation.
 */
export interface ContractValidationResult {
  /** All violations found */
  violations: ContractViolation[];
  /** Whether validation passed (no errors) */
  passed: boolean;
  /** Count of errors */
  errorCount: number;
  /** Count of warnings */
  warningCount: number;
  /** Duration of validation in milliseconds */
  durationMs: number;
  /** Timestamp of validation */
  timestamp: string;
}

/**
 * Configuration for the contract validator.
 */
export interface ContractValidatorConfig {
  /** Project root directory */
  projectRoot: string;
  /** Path to event bus file (relative to projectRoot) */
  eventBusFile?: string;
  /** Path to dashboard.js file (relative to projectRoot) */
  dashboardFile?: string;
  /** Path to tiers.ts file (relative to projectRoot) */
  tiersFile?: string;
  /** Path to container.ts file (relative to projectRoot) */
  containerFile?: string;
  /** Path to prd-prompt.ts file (relative to projectRoot) */
  prdPromptFile?: string;
}

/**
 * Default file paths for contract validation.
 */
const DEFAULT_FILE_PATHS = {
  eventBusFile: 'src/logging/event-bus.ts',
  dashboardFile: 'src/gui/public/js/dashboard.js',
  tiersFile: 'src/types/tiers.ts',
  containerFile: 'src/core/container.ts',
  prdPromptFile: 'src/start-chain/prompts/prd-prompt.ts',
};

/**
 * Contract Validator class.
 * 
 * Validates that source files conform to defined contracts.
 */
export class ContractValidator {
  private readonly config: Required<ContractValidatorConfig>;

  constructor(config: ContractValidatorConfig) {
    this.config = {
      ...DEFAULT_FILE_PATHS,
      ...config,
    };
  }

  /**
   * Run all contract validations.
   */
  async validateAll(): Promise<ContractValidationResult> {
    const startTime = Date.now();
    const violations: ContractViolation[] = [];

    // Run all validations in parallel
    const [eventViolations, criterionViolations, prdViolations] = await Promise.all([
      this.validateEventContract(),
      this.validateCriterionTypeContract(),
      this.validatePrdSchemaContract(),
    ]);

    violations.push(...eventViolations);
    violations.push(...criterionViolations);
    violations.push(...prdViolations);

    const errorCount = violations.filter((v) => v.severity === 'error').length;
    const warningCount = violations.filter((v) => v.severity === 'warning').length;

    return {
      violations,
      passed: errorCount === 0,
      errorCount,
      warningCount,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate event contract consistency.
   * 
   * Checks:
   * 1. Backend EventBus emits only contract-defined event names
   * 2. Frontend dashboard handles expected event names
   */
  async validateEventContract(): Promise<ContractViolation[]> {
    const violations: ContractViolation[] = [];

    // Check event-bus.ts
    const eventBusPath = path.join(this.config.projectRoot, this.config.eventBusFile);
    if (existsSync(eventBusPath)) {
      const eventBusSource = await readFile(eventBusPath, 'utf8');
      violations.push(...this.validateEventBusSource(eventBusSource));
    } else {
      violations.push({
        contract: 'EVENT_CONTRACT',
        file: this.config.eventBusFile,
        expected: 'File exists',
        actual: 'File not found',
        description: `Event bus file not found at ${this.config.eventBusFile}`,
        severity: 'error',
      });
    }

    // Check dashboard.js
    const dashboardPath = path.join(this.config.projectRoot, this.config.dashboardFile);
    if (existsSync(dashboardPath)) {
      const dashboardSource = await readFile(dashboardPath, 'utf8');
      violations.push(...this.validateDashboardSource(dashboardSource));
    } else {
      violations.push({
        contract: 'EVENT_CONTRACT (frontend)',
        file: this.config.dashboardFile,
        expected: 'File exists',
        actual: 'File not found',
        description: `Dashboard file not found at ${this.config.dashboardFile}`,
        severity: 'warning', // Warning because GUI is optional
      });
    }

    return violations;
  }

  /**
   * Validate event-bus.ts uses contract-defined event names.
   */
  private validateEventBusSource(source: string): ContractViolation[] {
    const violations: ContractViolation[] = [];

    // Extract event types from PuppetMasterEvent union
    // Pattern matches: type: 'event_name'
    const typePattern = /type:\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = typePattern.exec(source)) !== null) {
      const eventName = match[1];

      // Skip if it's a contract-defined event
      if ((ALL_BACKEND_EVENT_NAMES as readonly string[]).includes(eventName)) {
        continue;
      }

      // Find line number
      const lineNumber = this.getLineNumber(source, match.index);

      violations.push({
        contract: 'EVENT_CONTRACT',
        file: this.config.eventBusFile,
        line: lineNumber,
        expected: `One of: ${ALL_BACKEND_EVENT_NAMES.join(', ')}`,
        actual: eventName,
        description: `Event type '${eventName}' not in EVENT_CONTRACT`,
        severity: 'error',
      });
    }

    return violations;
  }

  /**
   * Validate dashboard.js handles contract-mapped event names.
   */
  private validateDashboardSource(source: string): ContractViolation[] {
    const violations: ContractViolation[] = [];

    // Find all case statements in handleWebSocketMessage
    // Pattern matches: case 'event_name':
    const casePattern = /case\s*['"]([^'"]+)['"]\s*:/g;
    let match;

    const handledEvents = new Set<string>();

    while ((match = casePattern.exec(source)) !== null) {
      const eventName = match[1];
      handledEvents.add(eventName);

      // Skip if it's a known frontend message type
      if ((ALL_FRONTEND_MESSAGE_TYPES as readonly string[]).includes(eventName)) {
        continue;
      }

      // Allow 'pong' as a special case (heartbeat response)
      if (eventName === 'pong') {
        continue;
      }

      // Find line number
      const lineNumber = this.getLineNumber(source, match.index);

      violations.push({
        contract: 'EVENT_CONTRACT (frontend)',
        file: this.config.dashboardFile,
        line: lineNumber,
        expected: `One of: ${ALL_FRONTEND_MESSAGE_TYPES.join(', ')}`,
        actual: eventName,
        description: `Frontend handles '${eventName}' which is not in FRONTEND_EVENT_MAP`,
        severity: 'warning',
      });
    }

    return violations;
  }

  /**
   * Validate criterion type contract consistency.
   * 
   * Checks:
   * 1. tiers.ts CriterionType matches contract
   * 2. container.ts registers all verifiers
   */
  async validateCriterionTypeContract(): Promise<ContractViolation[]> {
    const violations: ContractViolation[] = [];

    // Check tiers.ts
    const tiersPath = path.join(this.config.projectRoot, this.config.tiersFile);
    if (existsSync(tiersPath)) {
      const tiersSource = await readFile(tiersPath, 'utf8');
      violations.push(...this.validateTiersSource(tiersSource));
    } else {
      violations.push({
        contract: 'CRITERION_TYPE_CONTRACT',
        file: this.config.tiersFile,
        expected: 'File exists',
        actual: 'File not found',
        description: `Tiers file not found at ${this.config.tiersFile}`,
        severity: 'error',
      });
    }

    // Check container.ts
    const containerPath = path.join(this.config.projectRoot, this.config.containerFile);
    if (existsSync(containerPath)) {
      const containerSource = await readFile(containerPath, 'utf8');
      violations.push(...this.validateContainerSource(containerSource));
    } else {
      violations.push({
        contract: 'CRITERION_TYPE_CONTRACT',
        file: this.config.containerFile,
        expected: 'File exists',
        actual: 'File not found',
        description: `Container file not found at ${this.config.containerFile}`,
        severity: 'error',
      });
    }

    return violations;
  }

  /**
   * Validate tiers.ts CriterionType matches contract.
   */
  private validateTiersSource(source: string): ContractViolation[] {
    const violations: ContractViolation[] = [];

    // Extract CriterionType definition
    // Pattern matches: type CriterionType = 'type1' | 'type2' | ...
    const typeDefPattern = /export\s+type\s+CriterionType\s*=\s*([^;]+);/;
    const match = typeDefPattern.exec(source);

    if (!match) {
      violations.push({
        contract: 'CRITERION_TYPE_CONTRACT',
        file: this.config.tiersFile,
        expected: 'CriterionType definition',
        actual: 'Not found',
        description: 'Could not find CriterionType definition in tiers.ts',
        severity: 'error',
      });
      return violations;
    }

    const typeUnion = match[1];
    const lineNumber = this.getLineNumber(source, match.index);

    // Extract individual types from union
    const typePattern = /'([^']+)'/g;
    const declaredTypes: string[] = [];
    let typeMatch;

    while ((typeMatch = typePattern.exec(typeUnion)) !== null) {
      declaredTypes.push(typeMatch[1]);
    }

    // Check for types in code but not in contract
    for (const declared of declaredTypes) {
      if (!(ALL_CRITERION_TYPES as readonly string[]).includes(declared)) {
        violations.push({
          contract: 'CRITERION_TYPE_CONTRACT',
          file: this.config.tiersFile,
          line: lineNumber,
          expected: ALL_CRITERION_TYPES.join(' | '),
          actual: declared,
          description: `Type '${declared}' in tiers.ts not in CRITERION_TYPE_CONTRACT`,
          severity: 'error',
        });
      }
    }

    // Check for types in contract but not in code
    for (const contractType of ALL_CRITERION_TYPES) {
      if (!declaredTypes.includes(contractType)) {
        violations.push({
          contract: 'CRITERION_TYPE_CONTRACT',
          file: this.config.tiersFile,
          line: lineNumber,
          expected: contractType,
          actual: declaredTypes.join(' | '),
          description: `Type '${contractType}' in CRITERION_TYPE_CONTRACT not in tiers.ts`,
          severity: 'error',
        });
      }
    }

    return violations;
  }

  /**
   * Validate container.ts registers all verifiers.
   */
  private validateContainerSource(source: string): ContractViolation[] {
    const violations: ContractViolation[] = [];

    // Check each verifier class is registered
    for (const [type, verifierName] of Object.entries(CRITERION_TYPE_CONTRACT)) {
      if (!source.includes(verifierName)) {
        violations.push({
          contract: 'CRITERION_TYPE_CONTRACT',
          file: this.config.containerFile,
          expected: `Registration of ${verifierName}`,
          actual: 'Not found',
          description: `Verifier '${verifierName}' for type '${type}' not found in container`,
          severity: 'error',
        });
      }
    }

    return violations;
  }

  /**
   * Validate PRD schema contract consistency.
   * 
   * Checks:
   * 1. prd-prompt.ts uses contract-defined criterion types
   */
  async validatePrdSchemaContract(): Promise<ContractViolation[]> {
    const violations: ContractViolation[] = [];

    // Check prd-prompt.ts
    const promptPath = path.join(this.config.projectRoot, this.config.prdPromptFile);
    if (existsSync(promptPath)) {
      const promptSource = await readFile(promptPath, 'utf8');
      violations.push(...this.validatePrdPromptSource(promptSource));
    } else {
      violations.push({
        contract: 'PRD_SCHEMA_CONTRACT',
        file: this.config.prdPromptFile,
        expected: 'File exists',
        actual: 'File not found',
        description: `PRD prompt file not found at ${this.config.prdPromptFile}`,
        severity: 'error',
      });
    }

    return violations;
  }

  /**
   * Validate prd-prompt.ts uses contract types.
   */
  private validatePrdPromptSource(source: string): ContractViolation[] {
    const violations: ContractViolation[] = [];

    // Check that the prompt defines criterion types matching contract
    // Look for the type definition in the prompt template
    const criterionTypePattern = /type:\s*['"]?([^'"|\s;,}]+)['"]?/g;
    let match;

    while ((match = criterionTypePattern.exec(source)) !== null) {
      const usedType = match[1].trim();

      // Skip if it's a TypeScript type annotation (contains uppercase or special chars)
      if (usedType.includes('CriterionType') || usedType === 'string') {
        continue;
      }

      // Check if it's a valid criterion type
      if ((ALL_CRITERION_TYPES as readonly string[]).includes(usedType)) {
        continue;
      }

      // Check if it's a spec token (which is valid in prompt examples)
      if ((ALL_SPEC_TOKENS as readonly string[]).includes(usedType)) {
        continue;
      }

      // Find line number
      const lineNumber = this.getLineNumber(source, match.index);

      violations.push({
        contract: 'PRD_SCHEMA_CONTRACT',
        file: this.config.prdPromptFile,
        line: lineNumber,
        expected: `One of: ${ALL_CRITERION_TYPES.join(' | ')}`,
        actual: usedType,
        description: `Prompt uses type '${usedType}' not in contract`,
        severity: 'warning',
      });
    }

    // Verify spec tokens in prompt match contract
    const specTokenPattern = /([A-Z_]+):/g;
    while ((match = specTokenPattern.exec(source)) !== null) {
      const token = match[1];

      // Skip common non-token patterns
      if (['NOTE', 'IMPORTANT', 'Format', 'Example', 'Rules'].includes(token)) {
        continue;
      }

      // Check if it looks like a verifier token but isn't in contract
      if (token.endsWith('VERIFY') && !(ALL_SPEC_TOKENS as readonly string[]).includes(token)) {
        const lineNumber = this.getLineNumber(source, match.index);

        violations.push({
          contract: 'PRD_SCHEMA_CONTRACT',
          file: this.config.prdPromptFile,
          line: lineNumber,
          expected: `One of: ${ALL_SPEC_TOKENS.join(', ')}`,
          actual: token,
          description: `Prompt uses token '${token}' not in SPEC_TO_RUNTIME_MAP`,
          severity: 'warning',
        });
      }
    }

    return violations;
  }

  /**
   * Get line number for a character index in source.
   */
  private getLineNumber(source: string, index: number): number {
    return source.substring(0, index).split('\n').length;
  }
}

/**
 * Create a contract validator with default configuration.
 */
export function createContractValidator(projectRoot: string): ContractValidator {
  return new ContractValidator({ projectRoot });
}

/**
 * Run contract validation and return result.
 * Convenience function for scripts.
 */
export async function validateContracts(projectRoot: string): Promise<ContractValidationResult> {
  const validator = createContractValidator(projectRoot);
  return validator.validateAll();
}
