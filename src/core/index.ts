/**
 * Core module barrel export
 */

export { OrchestratorStateMachine } from './orchestrator-state-machine.js';
export type { StateMachineConfig, TransitionRecord } from './orchestrator-state-machine.js';

export { TierStateMachine } from './tier-state-machine.js';
export type { TierContext, TierStateMachineConfig } from './tier-state-machine.js';

export { StatePersistence } from './state-persistence.js';
export type { PersistedState } from './state-persistence.js';

export { CheckpointManager } from './checkpoint-manager.js';
export type {
  Checkpoint,
  CheckpointSummary,
  CurrentPosition,
  CheckpointMetadata,
} from './checkpoint-manager.js';

export { TierNode, createTierNode, buildTierTree } from './tier-node.js';
export type { TierNodeData } from './tier-node.js';

export { TierStateManager } from './tier-state-manager.js';

export { AutoAdvancement } from './auto-advancement.js';

export { Escalation } from './escalation.js';

export { ExecutionEngine } from './execution-engine.js';

export { OutputParser } from './output-parser.js';
export type { ParsedOutput, CompletionSignal } from './output-parser.js';

export { PromptBuilder } from './prompt-builder.js';
export type { PromptContext, FailureInfo, GateReviewContext } from './prompt-builder.js';

export { FreshSpawner } from './fresh-spawn.js';
export type { SpawnConfig, SpawnRequest, SpawnResult, ProcessAudit } from './fresh-spawn.js';

export {
  WorkerReviewerOrchestrator,
  shouldUseWorkerReviewer,
  createWorkerReviewerOrchestrator,
} from './worker-reviewer.js';
export type {
  WorkerResult,
  ReviewerResult,
  IterationOutcome,
  ReviewerContext,
  WorkerReviewerConfig,
} from './worker-reviewer.js';

export { Orchestrator } from './orchestrator.js';
export type {
  OrchestratorConfig,
  OrchestratorDependencies,
  OrchestratorProgress,
} from './orchestrator.js';

export { Container, createContainer, createOrchestrator } from './container.js';
export type { RegistrationType } from './container.js';

export { ParallelExecutor, createParallelExecutor } from './parallel-executor.js';
export type {
  ParallelExecutionResult,
  SubtaskExecutionResult,
  ParallelExecutorConfig,
} from './parallel-executor.js';

export {
  buildDependencyGraph,
  getParallelizableGroups,
  topologicalSort,
  hasDependencies,
  validateDependencies,
  isReadyToExecute,
  getReadySubtasks,
  DependencyCycleError,
  InvalidDependencyError,
} from './dependency-analyzer.js';
export type {
  DependencyNode,
  DependencyGraph,
} from './dependency-analyzer.js';
