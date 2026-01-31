// TypeScript type definitions
// Types will be added as they are needed

/**
 * Orchestrator status matching backend state
 * These are the states the orchestrator can be in at runtime.
 */
export type OrchestratorStatus = 'idle' | 'running' | 'paused' | 'error' | 'complete';

/**
 * Platform types supported by Puppet Master
 */
export type Platform = 'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot';

/**
 * Status badge display states
 * Extends OrchestratorStatus with 'pending' for items not yet started.
 * Use OrchestratorStatus for runtime state, StatusType for display purposes.
 */
export type StatusType = OrchestratorStatus | 'pending';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark';

/**
 * Project definition - matches store definition
 */
export interface Project {
  id: string;
  name: string;
  path: string;
  lastAccessed: Date | null;
  status?: 'active' | 'completed' | 'error';
  prdPath?: string;
  configPath?: string;
}
