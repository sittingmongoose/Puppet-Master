## 7. Data Model Contract (Rust Structs)

These are the GUI-facing projection structs. They are computed from the backend's `TierTree` + event stream and exposed to the Slint UI layer.

### 7.1 RunGraphMeta

```rust
/// Metadata for the entire run, displayed in the top bar.
/// Computed from OrchestratorState + event stream.
pub struct RunGraphMeta {
    pub run_id: String,
    pub run_date: DateTime<Utc>,
    pub ts_start: DateTime<Utc>,
    pub ts_end: Option<DateTime<Utc>>,
    pub elapsed_ms: u64,
    pub status: OrchestratorState,
    pub counters_by_state: HashMap<TierState, u32>,
}
```

### 7.2 GraphNode

```rust
/// Projection of a single node for the Run Graph View.
/// One instance per tier node in the plan graph.
pub struct GraphNode {
    pub id: String,
    pub title: String,
    pub objective: Option<String>,
    pub state: TierState,
    pub tier_type: TierType,
    pub deps_up: Vec<String>,
    pub deps_down: Vec<String>,
    pub run_date: DateTime<Utc>,
    pub start_ts: Option<DateTime<Utc>>,
    pub end_ts: Option<DateTime<Utc>>,
    pub elapsed_ms: Option<u64>,
    pub attempts: u32,
    pub retry_count: u32,
    pub blocked_reason: Option<String>,
    pub evidence_refs: Vec<String>,
    pub event_refs: Vec<String>,
    pub worker_activity_refs: Vec<String>,
    pub worker_identity: Option<String>,
    pub worker_provider: Option<String>,
    pub worker_model: Option<String>,
    pub worker_reasoning_effort: Option<String>,
    pub worker_tokens: TokenUsage,
    pub verifier_state: Option<VerificationState>,
    pub verifier_identity: Option<String>,
    pub verifier_provider: Option<String>,
    pub verifier_model: Option<String>,
    pub verifier_start_ts: Option<DateTime<Utc>>,
    pub verifier_end_ts: Option<DateTime<Utc>>,
    pub verifier_elapsed_ms: Option<u64>,
    pub verifier_refs: Vec<String>,
    pub verifier_tokens: TokenUsage,
    pub hitl_pending: bool,
    pub hitl_request_id: Option<String>,
    pub plan_mapping: PlanMapping,
}
```

### 7.3 Supporting Structs

```rust
/// Token usage for a single agent (worker or verifier).
/// Projected from UsageRecord entries (Plans/usage-feature.md) correlated by tier_id.
/// Backend requirement: UsageRecord MUST provide per-tier worker/verifier
/// breakdowns with input/output/reasoning splits. If the current UsageRecord
/// only has aggregate `tokens: Option<u64>`, it must be extended.
pub struct TokenUsage {
    pub input: u64,
    pub output: u64,
    pub reasoning: u64,
    pub cost_usd: Option<f64>,
}

/// Maps a node to its position in the human-readable plan.
pub struct PlanMapping {
    pub plan_breadcrumb: String,         // "Phase 1 > Task 2 > Subtask 3"
    pub plan_section_anchor: Option<String>,  // Heading or anchor ID in plan.md
    pub plan_excerpt: Option<String>,    // 1-3 lines of relevant plan text
}

/// A single edge in the DAG.
pub struct GraphEdge {
    pub from: String,  // upstream node id
    pub to: String,    // downstream node id
}

/// Verification state for a node.
/// NOTE: This is a new projection enum introduced by this spec.
/// It MUST be added to puppet-master-rs/src/types/state.rs alongside TierState.
/// If a backend VerificationState already exists, use that instead.
pub enum VerificationState {
    Pending,
    InProgress,
    Passed,
    Failed,
}

/// Layout position computed by the layout engine.
pub struct NodePosition {
    pub node_id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}
```

### 7.4 Relationship to Existing Structs

These projection structs are **computed from** existing backend structs:
- `TierNode` (puppet-master-rs/src/core/tier_node.rs): provides id, tier_type, title, description, dependencies, state_machine.
- `TierTree` (same file): arena-based storage; used to build the full graph.
- `TierState` (puppet-master-rs/src/types/state.rs): enum values map directly to `GraphNode.state`.
- `PuppetMasterEvent` variants (puppet-master-rs/src/types/events.rs): `TierChanged`, `IterationStart/Complete`, `GateStart/Complete`, `Progress`, `Output`, `Error`, `UserInteractionRequired`, `EvidenceStored`.
- `UsageRecord` (puppet-master-rs/src/types/budget.rs): provides token counts and cost.
- `StoredEvidence` (puppet-master-rs/src/types/evidence.rs): evidence type and file path.

The view-model layer converts backend structs to `GraphNode` projections on initial load, then applies incremental updates as events arrive.

ContractRef: DRY:DATA:TierTree, DRY:DATA:TierState, DRY:DATA:PuppetMasterEvent

---

<a id="8-state-colors"></a>
