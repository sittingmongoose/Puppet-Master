/**
 * Memory layer barrel export
 * 
 * Exports all memory management classes and types.
 */

export { ProgressManager } from './progress-manager.js';
export type { ProgressEntry } from './progress-manager.js';

export { AgentsManager } from './agents-manager.js';
export type {
  AgentsLevel,
  AgentsContent,
  ParsedSections,
  Pattern,
  Gotcha,
  AgentsManagerConfig,
  IterationContext,
} from './agents-manager.js';

export { PrdManager } from './prd-manager.js';

export { EvidenceStore } from './evidence-store.js';

export { UsageTracker } from './usage-tracker.js';
export type {
  UsageEvent,
  UsageQuery,
  UsageSummary,
} from '../types/usage.js';
