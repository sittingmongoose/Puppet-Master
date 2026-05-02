### Mandatory shared anchors
- `run_id`
- `attempt_id?`
- `thread_id?`
- `node_id?`
- `artifact_id?`
- `usage_event_ref?`
- `provider_attempt_ref?`

### Strongly recommended execution/runtime fields
- `execution_role?`
- requested/effective provider/model/auth/account disclosure fields by ref or normalized snapshot
- `effective_account_id?`
- `effective_auth_mode?`
- `effective_project_id?`
- `operational_identity?`

### Context-specific optional anchors
- workspace/source-control:
  - `repo_id?`
  - `worktree_id?`
  - `branch_ref?`
  - `commit_range?`
- external operational targets:
  - `workflow_refs?`
  - `docker_refs?`
  - `kubernetes_refs?`
- artifact lineage:
  - `linked_artifact_id?`
  - `logical_artifact_id?`

### Practical packet rule
- every side-effect-bearing or evidence-bearing runtime object should be able to answer:
  - which run/attempt produced this
  - which node/thread it belonged to
  - which provider attempt and effective account/runtime identity it used
  - which receipt/usage event/artifact it is linked to
  - which external operational target it touched, if any

### Recommended document split
- `Contracts_V0.md`
  - own the shared cross-family attribution packet shape for runtime events
- `storage-plan.md`
  - own persistence/projection of that packet across:
    - `attempt_record`
    - `usage_record`
    - receipt records
    - artifact index records
- `Tools.md`
  - stop at tool-specific semantics and reference the shared runtime attribution packet instead of keeping tool events analytics-only
- `Runtime_Artifacts_Panel.md`
  - keep artifact-family distinctions, but consume the shared attribution packet instead of relying on artifact-local identity alone
- `usage-feature.md`
  - keep canonical Usage routing on shared usage identity, not feature-local cost or receipt notions

### Impacted docs
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Tools.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- likely surface consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/FileManager.md`

### Contradictions / gaps surfaced
- `tool.invoked` remains under-attributed compared with `tool.denied`; it is still documented mainly as analytics exhaust rather than as a first-class runtime trace record.
- runtime artifacts still have no normalized place for `attempt_id`, `node_id`, `execution_role`, `provider_attempt_ref`, or `operational_identity`, even though cross-surface receipt linkage already depends on that level of identity.
- `usage_record` is closer to canonical runtime identity than several artifact and tool docs are, but it still keeps old `tier_id` joins alive.
- `Orchestrator_Page.md` still describes worker identity and per-node usage in terms that lag the stronger runtime/account/attempt model.

### Candidate fixes to carry forward
- Define one shared runtime attribution packet and make tool events, artifact envelopes, receipts, and usage records reference it.
- Expand `tool.invoked` so it can carry runtime attribution on parity with side-effect-relevant `tool.denied`.
- Add attempt/native runtime anchors to the runtime-artifact envelope and artifact index projection.
- Keep `cost_usage` and receipt views strictly canonical:
  - they deep-link into Usage/Ledger by shared identity
  - they do not invent artifact-local cost or receipt models

### Do-not-forget details
- The storage layer is already closest to the right answer; tool and artifact docs are the ones still lagging.
- `provider_attempt_ref` now looks like a key bridge field, not a niche detail.
- If this packet is not normalized, each surface will keep rebuilding partial joins between tools, artifacts, receipts, and usage.

## Research Progress - 2026-03-16 - Bridge-field behavior for `provider_attempt_ref`, `usage_event_ref`, and receipts

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The bridge fields now want a precedence rule, not just a field inventory.
- `provider_attempt_ref` appears on `attempt_record` and is the closest thing to a provider/runtime execution trace handle.
- `usage_event_ref` appears on receipts and Usage/docs as the canonical bridge into Ledger/Usage history.
- receipt records already carry the external-operation lineage:
  - Source Control / repo/worktree/branch
  - GitHub workflow/job/step
  - Docker context/image/publish/template
  - Kubernetes context/namespace/workload/rollout
- Those three are not substitutes for one another. They are bridges to different layers of the same attempt.

### Recommended bridge-field rule
- `attempt_id` remains the canonical local runtime execution anchor.
- `provider_attempt_ref` is the canonical bridge to provider/runtime execution details for that attempt.
- `usage_event_ref` is the canonical bridge to cost/usage history for that attempt or artifact.
- receipt records are the canonical bridge to external side-effect lineage for that attempt.

### Practical join model
- start from `attempt_id`
- from there:
  - follow `provider_attempt_ref` to provider/runtime trace and low-level execution evidence
  - follow `usage_event_ref` to canonical Usage/Ledger identity
  - follow receipt refs to Git/Actions/Docker/Kubernetes lineage
  - follow `artifact_id` / `linked_artifact_id` for renderable outputs and evidence objects

### Important non-rule
- none of these bridge fields should become a replacement primary key:
  - `provider_attempt_ref` does not replace `attempt_id`
  - `usage_event_ref` does not replace runtime identity
  - receipt refs do not replace artifact identity

### Recommended envelope behavior
- runtime artifacts that are derived from or emitted during an attempt should carry:
  - `attempt_id`
  - `provider_attempt_ref?`
  - `usage_event_ref?`
  - receipt linkage when they summarize external operations
- cost-bearing receipt-like artifacts should always prefer `usage_event_ref` for Usage/Ledger routing, not timestamp heuristics
- tool traces that originate from a provider-backed attempt should carry `provider_attempt_ref?` whenever that provider/runtime handle exists

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- `Plans/Orchestrator_Page.md`
- likely owner doc for formal field precedence:
  - `Plans/Contracts_V0.md`

### Contradictions / gaps surfaced
- `usage-feature.md` correctly treats `usage_event_ref` as canonical when present, but still allows timestamp/run/thread fallback behavior that should probably be treated as degraded compatibility, not the preferred routing path.
- `Runtime_Artifacts_Panel.md` insists receipt-like artifacts preserve canonical linkage, but it still does not spell out the precedence between `attempt_id`, `provider_attempt_ref`, and `usage_event_ref`.
- `storage-plan.md` puts `provider_attempt_ref` on the attempt record and `usage_event_ref` on the receipt record, but does not yet explain how downstream surfaces should join them coherently.
- `Orchestrator_Page.md` wants to pivot Evidence into workflow/Docker/Kubernetes detail, but still does not name the receipt/attempt join path explicitly enough.

### Candidate fixes to carry forward
- Add a bridge-field precedence note to the canonical runtime/storage owner docs:
  - local runtime anchor = `attempt_id`
  - provider/runtime bridge = `provider_attempt_ref`
  - usage bridge = `usage_event_ref`
  - external side-effect bridge = receipt refs
- Treat timestamp/run/thread fallback routing as compatibility behavior only when canonical bridge refs are absent.
- Require runtime-artifact envelope support for `attempt_id` plus bridge refs where applicable.
- Make cross-surface open actions resolve through these bridge fields instead of ad hoc feature-local joins.

### Do-not-forget details
- The big risk here is accidental “primary key drift,” where bridge refs start being treated like canonical local identity.
- `usage_event_ref` should be the preferred route for cost-bearing pivots whenever present.
- `provider_attempt_ref` now looks like the missing link between runtime traces and renderable artifacts.

## Research Progress - 2026-03-16 - Runtime-artifact envelope minimum contract

### Targeted docs read
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/FileManager.md`
- `Plans/Project_Output_Artifacts.md`
- spot-checks against `Plans/storage-plan.md` and `Plans/Contracts_V0.md`

### Key findings
- The runtime-artifact docs now name an envelope file, but they still do not define the common envelope field family strongly enough in prose.
- `Runtime_Artifacts_Panel.md` currently treats the envelope mostly as an implementation hook:
  - one event type per artifact family
  - `EventRecord` wrapper
  - per-type schemas
  - artifact-local IDs
- The strongest current rule is actually negative:
  - do not invent feature-local receipt IDs
  - do not create artifact-local cost models
  - do not conflate runtime artifacts with Project Plan Package artifacts
- `FileManager.md` adds pressure on the envelope because it now needs open-by-identity behavior for:
  - generated/transient artifacts
  - attempt-scoped evidence
  - stable runtime identities
- `Project_Output_Artifacts.md` already carries the right anti-drift rule for runtime-analysis exports:
  - when materialized, they must use canonical runtime identities like `attempt_id`, `safe_point_id`, and `remediation_root_id`
  - they must not invent separate artifact-local identity

### Recommended runtime-artifact envelope minimum fields
- canonical artifact identity:
  - `artifact_id`
  - `artifact_kind`
  - `logical_artifact_id?`
  - `linked_artifact_id?`
- runtime attribution:
  - `run_id`
  - `thread_id?`
  - `node_id?`
  - `attempt_id?`
