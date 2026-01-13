/**
 * Type definitions barrel export
 * 
 * Re-exports all types from individual type definition files.
 * Use type-only exports for all re-exports to ensure proper ESM handling.
 */

export type {
  Platform,
  ProjectConfig,
  CliPathsConfig,
  LoggingConfig,
  TierConfig,
  BranchingConfig,
  VerificationConfig,
  AgentsEnforcementConfig,
  MemoryConfig,
  BudgetConfig,
  PlatformBudgets,
  BudgetEnforcementConfig,
  TiersConfig,
  PuppetMasterConfig,
} from './config.js';

export type {
  ExecutionRequest,
  ExecutionResult,
  ExecutionEvent,
  ProcessInfo,
  SessionConfig,
  Session,
  PlatformCapabilities,
  SmokeTestResult,
  PlatformRunnerContract,
  RunningProcess,
} from './platforms.js';

export type {
  OrchestratorState,
  TierState,
  TierType,
  OrchestratorContext,
} from './state.js';

export type {
  OrchestratorEvent,
  TierEvent,
  StateTransition,
} from './events.js';

export type {
  StateTransitionAction,
  OrchestratorTransition,
  TierTransition,
} from './transitions.js';

export type {
  Criterion,
  TestCommand,
  TestPlan,
  TierPlan,
  Evidence,
  TierNode,
  VerifierResult,
  GateReport,
  GateResult,
  AdvancementResult,
} from './tiers.js';

export type {
  ItemStatus,
  TestResult,
  CriterionResult,
  EvidenceItem,
  Evidence as PRDEvidence,
  VerifierResult as PRDVerifierResult,
  GateReport as PRDGateReport,
  Iteration,
  Subtask,
  Task,
  Phase,
  PRDMetadata,
  PRD,
} from './prd.js';

export type {
  EvidenceType,
  StoredEvidence,
  Evidence as EvidenceArtifact,
  GateReportEvidence,
  VerifierResultSummary,
} from './evidence.js';

export type {
  UsageEvent,
  UsageQuery,
  UsageSummary,
} from './usage.js';
