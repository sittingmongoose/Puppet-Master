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
### 7.5 Canonical upstream ownership for graph projections

The Run Graph consumes canonical runtime projections; it does not invent feature-local state.

Required upstream projection families for this packet:

| Detail area | Canonical owner | Required fields |
|---|---|---|
| SCM / worktree lineage | `Plans/storage-plan.md` + `Plans/WorktreeGitImprovement.md` | `repo_id`, `worktree_id`, worktree path snapshot, branch, commit range, compare target |
| GitHub Actions linkage | `Plans/GitHub_Integration.md` + `Plans/GitHub_API_Auth_and_Flows.md` | workflow, run, job, step, latest status, failed-step reference |
| Docker / Publish / Unraid linkage | `Plans/Containers_Registry_and_Unraid.md` + `Plans/newtools.md` | runtime/context ref, image refs, `publish_result_id`, digest refs, `template_repo_id`, review state |
| Kubernetes linkage | `Plans/Containers_Registry_and_Unraid.md` | context, namespace, workload, rollout/apply refs |
| Usage / cost linkage | `Plans/usage-feature.md` + `Plans/Runtime_Artifacts_Panel.md` | canonical usage event ref or usage_event_seq |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md

Detail-pane rules:
- the selected-node detail view MUST be able to open the relevant Source Control, GitHub Actions, or Docker Manager surface in-context
- historical node detail MUST preserve historical lineage even when the live worktree, workflow run, or runtime no longer exists
- missing live targets must render as historical/retired state, not as silent disappearance

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

### 9.1 Preset Table

| # | Preset Name | Algorithm | Direction | Best For |
|---|------------|-----------|-----------|----------|
| 1 | **Layered L-R** (default) | Sugiyama layered | Left to Right | Dependency flow visualization |
| 2 | Layered T-B | Sugiyama layered | Top to Bottom | Vertical hierarchy view |
| 3 | Compact | Minimize edge crossings + spacing | Left to Right | Maximizing node visibility in small space |
| 4 | Grouped by Phase | Phase containers with internal layout | Left to Right | Phase-level overview with grouped tasks |
| 5 | Critical Path | Same as Layered L-R but with critical path highlighted | Left to Right | Identifying bottleneck chain |

### 9.2 Sugiyama Algorithm Steps (Presets 1, 2)

1. **Layer assignment**: assign each node to a layer based on longest path from entry points.
2. **Crossing reduction**: Barycenter heuristic to minimize edge crossings within each layer.
3. **Coordinate assignment**: Brandes-Kopf for compact horizontal/vertical positioning.
4. **Edge routing**: orthogonal routing with bend minimization.

**Deterministic tie-break rules** (to guarantee same graph → same layout):
- Layer assignment ties: break by `node.id` lexicographic order.
- Barycenter ties in crossing reduction: break by `node.id` lexicographic order.
- Node ordering within a layer: after crossing reduction, stable-sort by `node.id` for equal barycenters.
- Disconnected subgraphs: order subgraphs by the lexicographically smallest `node.id` in each subgraph.
- All traversals use a deterministic iteration order (sorted `node.id`).

### 9.3 Compact (Preset 3)

- Uses the same dependency-respecting layer assignment as Layered L-R, but reduces inter-layer spacing and intra-layer gaps to maximize visible nodes before scrolling.
- Applies an additional crossing-reduction pass that prefers shorter edge spans when barycenter scores tie.
- Shrinks node padding before it shrinks text; labels still use the standard truncation/tooltip rules from §4.2.
- Deterministic tie-break rules remain lexicographic by `node.id`.

### 9.4 Grouped by Phase (Preset 4)

- Phase nodes become **containers** (larger rectangles with a header showing phase title).
- Task/subtask nodes are laid out inside their parent phase container.
- Phase containers are laid out left-to-right based on phase dependencies.
- Within a container: Sugiyama layout for tasks/subtasks.

### 9.5 Critical Path (Preset 5)

- Same layout as Layered L-R.
- **Critical path** = longest path from start to current frontier (or end if complete).
- If multiple paths have equal duration/length, choose the path whose ordered `node.id` tuple is lexicographically smallest so highlighting stays deterministic.
- Critical path nodes: thicker border (4px vs 2px), brighter status color.
- Critical path edges: thicker (3px vs 2px), fully opaque.
- Non-critical nodes and edges: reduced opacity (50%).

### 9.6 Large-Graph Fallback

When node count exceeds a threshold (default: 200 nodes):
- **Label simplification**: truncate node titles to 12 chars.
- **Edge simplification**: straight lines instead of orthogonal routing.
- **Optional group collapse**: phases with all children in same state (e.g., all Passed) collapse to a single summary node showing "{N} tasks passed". Click to expand.
- Threshold checks re-run whenever live updates materially change node count; the graph must not oscillate between modes more than once per refresh cycle.

When node count exceeds 500:
- Additionally: reduce node rectangle size (120x36px at 100% zoom).
- Enable level-of-detail: at zoom < 50%, nodes render as colored dots only (no text).

---

<a id="10-interactions"></a>
