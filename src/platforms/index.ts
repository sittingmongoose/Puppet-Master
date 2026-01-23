/**
 * Platform module barrel exports
 * 
 * Exports all platform-related types, classes, and utilities.
 */

// Export platform runners
export { BasePlatformRunner } from './base-runner.js';
export { CursorRunner } from './cursor-runner.js';
export { CodexRunner } from './codex-runner.js';
export { ClaudeRunner } from './claude-runner.js';
export { GeminiRunner, createGeminiRunner } from './gemini-runner.js';
export { CopilotRunner, createCopilotRunner } from './copilot-runner.js';
export { CopilotSdkRunner, createCopilotSdkRunner } from './copilot-sdk-runner.js';
// NOTE: AntigravityRunner removed - GUI-only, not suitable for automation

// Export model catalogs
export {
  type GeminiModel,
  GEMINI_MODELS,
  getGeminiModels,
  getStableGeminiModels,
  getGeminiModelIds,
} from './gemini-models.js';
export {
  type CopilotModel,
  COPILOT_MODELS,
  getCopilotModels,
  getOfficialCopilotModels,
  getCopilotModelIds,
  getCopilotModelSelectionNote,
} from './copilot-models.js';
// NOTE: Antigravity models removed - GUI-only, not suitable for automation

// Export platform registry
export { PlatformRegistry } from './registry.js';

// Export capability discovery
export { CapabilityDiscoveryService } from './capability-discovery.js';

// Export quota manager
export { QuotaManager } from './quota-manager.js';

// Export health check
export { PlatformHealthChecker } from './health-check.js';
export type { HealthCheckResult } from './health-check.js';
