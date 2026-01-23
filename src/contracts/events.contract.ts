/**
 * Event Contract - Single Source of Truth for Event Names
 * 
 * This file defines the canonical event names used by the backend EventBus
 * and the mappings to frontend WebSocket message types.
 * 
 * RULES:
 * 1. Backend MUST emit events using names from EVENT_CONTRACT
 * 2. Frontend MUST handle events using names from FRONTEND_HANDLED_EVENTS
 * 3. New events MUST be added here first, then implemented
 * 4. Contract is validated by contract-validator.ts
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

/**
 * SINGLE SOURCE OF TRUTH for backend event names.
 * 
 * These are the exact event type strings used in PuppetMasterEvent union
 * in src/logging/event-bus.ts. Backend code MUST use these exact names.
 */
export const EVENT_CONTRACT = {
  /**
   * Orchestrator-level events
   */
  orchestrator: {
    /** Orchestrator state machine transition */
    stateChanged: 'state_changed',
    /** Error occurred in orchestrator */
    error: 'error',
    /** Log message */
    log: 'log',
    /** Project loaded and ready */
    projectLoaded: 'project_loaded',
    /** Overall progress update */
    progress: 'progress',
  },

  /**
   * Tier-level events (Phase/Task/Subtask)
   */
  tier: {
    /** Tier state changed */
    tierChanged: 'tier_changed',
    /** Iteration started for a subtask */
    iterationStarted: 'iteration_started',
    /** Iteration completed for a subtask */
    iterationCompleted: 'iteration_completed',
    /** Output chunk from agent */
    outputChunk: 'output_chunk',
    /** Gate verification started */
    gateStart: 'gate_start',
    /** Gate verification completed */
    gateComplete: 'gate_complete',
    /** Replanning completed */
    replanComplete: 'replan_complete',
    /** Item reopened for retry */
    itemReopened: 'item_reopened',
  },

  /**
   * Git-related events
   */
  git: {
    /** Commit created */
    commit: 'commit',
  },

  /**
   * Budget and usage events
   */
  budget: {
    /** Budget/quota update */
    budgetUpdate: 'budget_update',
  },

  /**
   * Agent-related events
   */
  agents: {
    /** AGENTS.md files updated */
    agentsUpdated: 'agents_updated',
    /** Reviewer verdict received */
    reviewerVerdict: 'reviewer_verdict',
  },

  /**
   * Process control events
   */
  process: {
    /** Processes killed */
    processKilled: 'process_killed',
  },

  /**
   * Start Chain pipeline events
   */
  startChain: {
    /** Pipeline step started/completed/failed */
    stepEvent: 'start_chain_step',
    /** Pipeline completed */
    complete: 'start_chain_complete',
    /** Requirements interview completed */
    interviewComplete: 'requirements_interview_complete',
    /** Requirements inventory completed */
    inventoryComplete: 'requirements_inventory_complete',
  },
} as const;

/**
 * Flatten EVENT_CONTRACT to get all event names as a tuple type.
 */
type FlattenEventContract<T> = T extends Record<string, unknown>
  ? T[keyof T] extends Record<string, unknown>
    ? FlattenEventContract<T[keyof T]>
    : T[keyof T]
  : never;

/**
 * Union type of all backend event names.
 */
export type BackendEventName = FlattenEventContract<typeof EVENT_CONTRACT>;

/**
 * Array of all backend event names for runtime validation.
 */
export const ALL_BACKEND_EVENT_NAMES: readonly BackendEventName[] = [
  // Orchestrator
  EVENT_CONTRACT.orchestrator.stateChanged,
  EVENT_CONTRACT.orchestrator.error,
  EVENT_CONTRACT.orchestrator.log,
  EVENT_CONTRACT.orchestrator.projectLoaded,
  EVENT_CONTRACT.orchestrator.progress,
  // Tier
  EVENT_CONTRACT.tier.tierChanged,
  EVENT_CONTRACT.tier.iterationStarted,
  EVENT_CONTRACT.tier.iterationCompleted,
  EVENT_CONTRACT.tier.outputChunk,
  EVENT_CONTRACT.tier.gateStart,
  EVENT_CONTRACT.tier.gateComplete,
  EVENT_CONTRACT.tier.replanComplete,
  EVENT_CONTRACT.tier.itemReopened,
  // Git
  EVENT_CONTRACT.git.commit,
  // Budget
  EVENT_CONTRACT.budget.budgetUpdate,
  // Agents
  EVENT_CONTRACT.agents.agentsUpdated,
  EVENT_CONTRACT.agents.reviewerVerdict,
  // Process
  EVENT_CONTRACT.process.processKilled,
  // Start Chain
  EVENT_CONTRACT.startChain.stepEvent,
  EVENT_CONTRACT.startChain.complete,
  EVENT_CONTRACT.startChain.interviewComplete,
  EVENT_CONTRACT.startChain.inventoryComplete,
] as const;

/**
 * Frontend WebSocket message type mapping.
 * 
 * Maps frontend message types to the backend event names they correspond to.
 * This handles cases where frontend uses different names than backend.
 * 
 * Key = frontend message type (what dashboard.js handles)
 * Value = backend event name (what EventBus emits)
 * 
 * NOTE: The GUI server broadcasts raw PuppetMasterEvents, so frontend
 * code should handle the backend event type names directly OR the server
 * should transform them. Currently dashboard.js expects some different names.
 */
export const FRONTEND_EVENT_MAP = {
  // Direct mappings (frontend uses same name as backend)
  'progress': EVENT_CONTRACT.orchestrator.progress,
  'error': EVENT_CONTRACT.orchestrator.error,
  'gate_start': EVENT_CONTRACT.tier.gateStart,
  'gate_complete': EVENT_CONTRACT.tier.gateComplete,
  'commit': EVENT_CONTRACT.git.commit,
  'budget_update': EVENT_CONTRACT.budget.budgetUpdate,

  // Transformed mappings (frontend uses different name)
  // These are what dashboard.js currently expects:
  'state_change': EVENT_CONTRACT.orchestrator.stateChanged,      // Note: frontend drops 'd'
  'output': EVENT_CONTRACT.tier.outputChunk,                     // Note: frontend shortens
  'iteration_start': EVENT_CONTRACT.tier.iterationStarted,       // Note: frontend drops 'ed'
  'iteration_complete': EVENT_CONTRACT.tier.iterationCompleted,  // Note: frontend drops 'd'

  // Budget warning is a derived event (not direct from backend)
  'budget_warning': EVENT_CONTRACT.budget.budgetUpdate,

  // Ping/pong for heartbeat (not a real event, just protocol)
  'pong': 'pong' as const,
} as const;

/**
 * Type for frontend message types.
 */
export type FrontendMessageType = keyof typeof FRONTEND_EVENT_MAP;

/**
 * All frontend message types as an array for runtime validation.
 */
export const ALL_FRONTEND_MESSAGE_TYPES: readonly FrontendMessageType[] = Object.keys(
  FRONTEND_EVENT_MAP
) as FrontendMessageType[];

/**
 * Reverse mapping: backend event name → frontend message type.
 * Used by server to transform events before broadcasting (if needed).
 * 
 * NOTE: Some backend events don't have a frontend handler yet.
 * This only includes events that have explicit frontend handlers.
 */
export const BACKEND_TO_FRONTEND_MAP: Partial<Record<BackendEventName, FrontendMessageType>> = {
  [EVENT_CONTRACT.orchestrator.stateChanged]: 'state_change',
  [EVENT_CONTRACT.orchestrator.progress]: 'progress',
  [EVENT_CONTRACT.orchestrator.error]: 'error',
  [EVENT_CONTRACT.tier.outputChunk]: 'output',
  [EVENT_CONTRACT.tier.iterationStarted]: 'iteration_start',
  [EVENT_CONTRACT.tier.iterationCompleted]: 'iteration_complete',
  [EVENT_CONTRACT.tier.gateStart]: 'gate_start',
  [EVENT_CONTRACT.tier.gateComplete]: 'gate_complete',
  [EVENT_CONTRACT.git.commit]: 'commit',
  [EVENT_CONTRACT.budget.budgetUpdate]: 'budget_update',
};

/**
 * Type guard to check if a string is a valid backend event name.
 */
export function isBackendEventName(name: string): name is BackendEventName {
  return (ALL_BACKEND_EVENT_NAMES as readonly string[]).includes(name);
}

/**
 * Type guard to check if a string is a valid frontend message type.
 */
export function isFrontendMessageType(name: string): name is FrontendMessageType {
  return name in FRONTEND_EVENT_MAP;
}

/**
 * Get the frontend message type for a backend event name.
 * Returns undefined if no mapping exists (event not handled by frontend).
 */
export function getBackendToFrontend(backendEvent: BackendEventName): FrontendMessageType | undefined {
  return BACKEND_TO_FRONTEND_MAP[backendEvent];
}
