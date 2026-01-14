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

// Export platform registry
export { PlatformRegistry } from './registry.js';

// Export capability discovery
export { CapabilityDiscoveryService } from './capability-discovery.js';

// Export quota manager
export { QuotaManager } from './quota-manager.js';
