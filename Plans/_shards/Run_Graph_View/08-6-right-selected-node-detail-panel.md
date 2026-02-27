## 6. RIGHT: Selected-Node Detail Panel

When a node is selected, the detail panel shows comprehensive information organized into 8 collapsible sections. The panel updates **live** as events arrive for the selected node.

### C1. Node Summary

| Field | Source |
|-------|--------|
| Node ID | `GraphNode.id` |
| Title | `GraphNode.title` |
| Objective | `GraphNode.objective` |
| Tier Type | `GraphNode.tier_type` (Phase/Task/Subtask/Iteration) |
| State | `GraphNode.state` (color-coded badge) |
| Run Date | `RunGraphMeta.run_date` |
| Start / End / Elapsed | `GraphNode.start_ts` / `end_ts` / `elapsed_ms` |
| Attempts | `GraphNode.attempts` (with retry count) |
| Injected context | Injected-context breakdown (Instruction/Work/Memory) for the selected node |
| Blocked Reason | `GraphNode.blocked_reason` (if set) |
| HITL Status | "Pending approval" or "No HITL request" |

Rule: The detail panel MUST show an “Injected Context” breakdown for the selected node/run, including: included `AGENTS.md` paths + byte counts; parent summary and attempt journal inclusion + byte counts; and whether truncation occurred (and why).

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

Rule: Attempt journals are per-Subtask Iteration; when enabled, only the most recent attempt journal for the same Subtask is injected into the next Iteration by default (no history injection).

ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

### C2. Plan Mapping

Shows where this node maps to the human-readable plan (plan.md):

| Field | Source | Behavior |
|-------|--------|----------|
| Breadcrumb | `GraphNode.plan_mapping.plan_breadcrumb` | E.g., "Phase 1 > Task 2 > Subtask 3" |
| Section heading | `GraphNode.plan_mapping.plan_section_anchor` | Plan section title |
| Excerpt | `GraphNode.plan_mapping.plan_excerpt` | 1-3 lines of plan text (read-only) |
| "Open plan at section" | Action button | Navigate to plan view or open plan artifact in File Editor, scrolled to the relevant section |
| "Copy plan reference" | Action button | Copy breadcrumb + anchor to clipboard |

Data source: plan_mapping fields are populated from canonical project artifacts defined in `Plans/Project_Output_Artifacts.md` (canonical graph entrypoint `.puppet-master/project/plan_graph/index.json`, referenced `plan_graph/nodes/<node_id>.json`, and human-readable `.puppet-master/project/plan.md`) and extracted by node hierarchy position.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C3. Worker Activity (Real-Time)

Live stream of what the worker agent is doing for this node:

| Element | Content | Behavior |
|---------|---------|----------|
| Worker identity | Subagent persona name (e.g., "rust-engineer") | Static per iteration |
| Provider / Model | Platform and model used (e.g., "Claude Code / claude-opus-4-6") | Static per iteration |
| Progress stream | Live text output from worker | Auto-scroll, monospace font |
| Tool calls | Collapsible list of tool invocations | Each entry: tool name, args summary (collapsed), result summary, duration, error (if any). Expand for full args/result. |
| Files changed | List of files modified by this node's worker | Each entry: file path, +N -M counts. Click to open diff in File Editor. |
| Evidence produced | Links to evidence artifacts | Each entry: evidence type, description. Click to open in Evidence view. |

Data source: `PuppetMasterEvent::Output` (filtered by tier_id), `PuppetMasterEvent::EvidenceStored`, tool call events from the worker's session. **Backend requirement**: `Output` events MUST carry a `tier_id` field to enable per-node filtering; if the current event schema lacks this field, it must be added before this view can be implemented.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C4. Verifier Activity (Real-Time)

Live stream of the verification process for this node:

| Element | Content | Behavior |
|---------|---------|----------|
| Verifier identity | Verifier agent name / persona | Static per verification |
| Provider / Model | Platform and model used | Static per verification |
| Verification timing | Start / End / Elapsed | Updates live until complete |
| Acceptance checks | List of checks from acceptance_criteria | Each: check description, pass/fail badge, detail (collapsible) |
| Invariants checked | List of invariant checks | Each: invariant name, pass/fail badge |
| Evidence validation | Results of evidence validation | Pass/fail per evidence item |
| Final verdict | "PASS" or "FAIL" badge | With reason text |

Data source: `PuppetMasterEvent::GateStart`, `GateComplete`, verification events scoped to this node's tier_id.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C5. Model, Reasoning, Tokens, and Usage Link

Shows the AI model details and resource consumption for both worker and verifier:

| Field | Worker | Verifier |
|-------|--------|----------|
| Model | `GraphNode.worker_model` | `GraphNode.verifier_model` |
| Reasoning effort | `GraphNode.worker_reasoning_effort` | (if applicable) |
| Input tokens | `GraphNode.worker_tokens.input` | `GraphNode.verifier_tokens.input` |
| Output tokens | `GraphNode.worker_tokens.output` | `GraphNode.verifier_tokens.output` |
| Reasoning tokens | `GraphNode.worker_tokens.reasoning` | `GraphNode.verifier_tokens.reasoning` |
| Cost | `GraphNode.worker_tokens.cost_usd` | `GraphNode.verifier_tokens.cost_usd` |
| Total cost | Sum of worker + verifier cost | -- |

**Usage link**: "View in Usage" button/link that navigates to the Usage page with a filter applied to show only events for this node (filter by `tier_id`). If the Usage page supports per-node breakdown, this link focuses on that node's row.

Data source: Token usage fields populated from `UsageRecord` entries (Plans/usage-feature.md) correlated by `tier_id`.

ContractRef: ContractName:Plans/usage-feature.md

### C6. HITL Controls

When the selected node has a pending HITL request (`hitl_pending == true`):

| Element | Behavior |
|---------|----------|
| Request description | Shows the HITL request message (from `UserInteractionRequired.message`) |
| Policy mode | Displays current policy mode: "auto", "ask", or "deny" |
| Escalation rationale | If escalated, shows why the system escalated to HITL approval |
| **Approve** button | Green button; click approves the request. Updates node state immediately. |
| **Deny** button | Red button; click denies the request. |
| Rationale text field | Optional text input for the user to explain their decision |
| Status after action | Shows "Approved at {time}" or "Denied at {time}" with rationale |

When no HITL request is pending: section shows "No pending approvals for this node."

Actions wire to the existing HITL approval pathway (Plans/human-in-the-loop.md). After approval/denial:
- Node state updates immediately in the graph and table.
- Orchestrator scheduler re-evaluates runnable nodes (non-blocked continuation).

ContractRef: ContractName:Plans/human-in-the-loop.md

### C7. Dependencies

Two sub-sections:

**Upstream (dependencies this node waits on):**
| Node ID | Title | State | Action |
|---------|-------|-------|--------|
| Listed from `deps_up` | Title text | Color-coded badge | Click to select (navigates graph + table) |

**Downstream (nodes waiting on this node):**
| Node ID | Title | State | Action |
|---------|-------|-------|--------|
| Listed from `deps_down` | Title text | Color-coded badge | Click to select (navigates graph + table) |

### C8. Logs & Events

| Element | Content | Behavior |
|---------|---------|----------|
| Event IDs | List of `event_refs` for this node | Each: event type, timestamp, sequence number |
| Correlation IDs | `run_id`, `tier_id` | Copyable |
| Raw log pointer | Link to raw log file/artifact | Click to open in File Editor or external viewer |
| Event timeline | Expandable chronological list of all events for this node | Filterable by event type |

Data source: seglog events filtered by `tier_id` and `run_id`.

---

<a id="7-data-model"></a>
