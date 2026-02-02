/**
 * Agents module barrel export
 * 
 * Exports for AGENTS.md enforcement and multi-level loading functionality.
 */

export { MultiLevelLoader } from './multi-level-loader.js';
export type { LevelPath, AgentsDocument } from './multi-level-loader.js';
export type { AgentsLevel } from '../memory/agents-manager.js';
export { UpdateDetector } from './update-detector.js';
export type { FileSnapshot, UpdateResult } from './update-detector.js';
export { PromotionEngine } from './promotion-engine.js';
export type {
  AgentsEntry,
  EntryStats,
  PromotionRule,
  PromotionCandidate,
  PromotionConfig,
} from './promotion-engine.js';
export { GateEnforcer } from './gate-enforcer.js';
export type { EnforcementResult, Violation } from './gate-enforcer.js';
export { ArchiveManager } from './archive-manager.js';
export type { ArchiveEntry } from './archive-manager.js';
