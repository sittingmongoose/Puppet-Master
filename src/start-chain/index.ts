/**
 * Start Chain exports
 * 
 * This module exports components for the start chain pipeline,
 * including PRD generation, architecture generation, and requirements parsing.
 */

export { PrdGenerator } from './prd-generator.js';
export type { PrdGeneratorOptions } from './prd-generator.js';

export { ArchGenerator } from './arch-generator.js';
export type { ArchGeneratorOptions } from './arch-generator.js';

export { TierPlanGenerator } from './tier-plan-generator.js';
export type {
  TierPlan,
  PhasePlan,
  TaskPlan,
  SubtaskPlan,
} from './tier-plan-generator.js';

export { ValidationGate } from './validation-gate.js';
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './validation-gate.js';

export { buildPrdPrompt } from './prompts/prd-prompt.js';
export { buildArchPrompt } from './prompts/arch-prompt.js';

export { StartChainPipeline } from '../core/start-chain/pipeline.js';
export type { StartChainResult } from '../core/start-chain/pipeline.js';

export { TraceabilityManager } from './traceability.js';
export type { TraceabilityMatrix } from './traceability.js';
