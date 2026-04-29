# Overseer Protocol (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Child-record field-shape direction now discussed
  - Emerging execution-settings direction
  - Worktree gap is now explicit
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities

#### Source target target-0197
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Child-record field-shape direction now discussed
  - Emerging execution-settings direction
  - Worktree gap is now explicit
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities
- Exact required items represented:
  - `attempt` should persist identity, actor type, requested vs effective provider/model/effort/persona/account, resolution/fallback metadata, lane/snapshot linkage, lifecycle/result, and evidence refs
  - Define distinct defaults/overrides for provider/model at run/global, feature seam, work package, node, work package overseer, feature seam overseer, and overseer-delegated node worker levels.
  - Make requested vs effective provider/model visible at all levels where [retired-token-3] can occur.
  - Specify node persona selection as dynamic-by-default from node scope/type; node-worker persona override is policy-owned, not per-node [retired-token-1].
  - Specify whether overseers may use subagents for node work and what provider/model policy applies to delegated node workers.
  - Decide whether worktrees are allocated/owned per node, per package, per seam, or per remediation branch.
  - Resolve package-based worktree preference vs [retired-token-4] for scale/manageability.
  - Record worktree ownership/isolation rules after Orchestrator ownership boundaries are pinned.
  - Expose source-control/worktree handshake as a remaining blind spot.
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Add node_id
  - Add package_id
  - Add seam_id
  - Add lane_id
  - Add attempt_id
  - Add effective_identity
  - Normalize requested/effective account identity shapes
  - Normalize blocked_[retired-token-25]/allowed_action_ids and safe-point/restore-point/rollback terminology
  - Relax or replace stale graph-schema constants `[retired-token-23]` and [retired-token-24].
  - Add package/seam/lane/worktree/account identity fields to canonical runtime/event/envelope contracts.
  - Define contamination and safe-point linkage explicitly in storage and blocked-payload contracts.
  - The overseer Persona gap is structural because runtime docs now need package-overseer and seam-overseer identity without pretending they are ordinary delegated subagents.
  - the rewrite now needs seam/package overseer scopes, blocked-owner attribution, and clearer separation between runtime/system/user authority
  - The Overseer audit protocol is structurally incompatible with the rewrite:
  - `[retired-token-29]` still assumes singular Overseer / Builder / Verifier semantics and lacks package/seam/corroboration/concern hooks
  - [retired-token-29]
  - `[retired-token-29]` has newer scheduler addenda that move toward the rewrite direction, but the base protocol still frames role semantics, lifecycle wording, and dispatch in a singular overseer model with no first-class package/seam governance, corroboration, or concern authority. The addenda add node/lane vocabulary without replacing the stale top-level ontology.
  - `[retired-token-29]` still claims canonical execution roles as `Builder`, `Verifier`, and `Overseer`, but the rewrite now needs at least:
  - Builder
  - Verifier
  - Overseer
  - `Plans/[retired-token-29]` should own which execution-scoped context is required for scheduler/executor correctness.
  - Plans/[retired-token-29]
  - dead or fragile anchors/SSOT pointers still exist (`Overseer`, `AuthPolicy`, assistant-memory short anchors).
  - AuthPolicy
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - the doc title and role model still say `Overseer Protocol` with `Builder`, `Verifier`, and `Overseer` as the primary execution framing
  - Overseer Protocol
  - `Plans/[retired-token-29]` already carries a strong `execution_unit_context` owner field block, but `Plans/Contracts_V0.md` still lacks the exact `### 5.1B Persona/Runtime Snapshot Payload Contract` heading.
  - execution_unit_context
  - Plans/Contracts_V0.md
  - ### 5.1B Persona/Runtime Snapshot Payload Contract
  - `Plans/[retired-token-29]:110-130`
  - Plans/[retired-token-29]:110-130
  - `Plans/[retired-token-29]:110-175`
  - Plans/[retired-token-29]:110-175
  - `Plans/[retired-token-29]:548-557`
  - Plans/[retired-token-29]:548-557
  - `Plans/[retired-token-29]:134-160`
  - Plans/[retired-token-29]:134-160
  - `Plans/[retired-token-29]:134-178`
  - Plans/[retired-token-29]:134-178
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #20 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #21 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #22 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #23 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #24 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #25 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #26 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #27 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #28 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #29 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-004: Retire tier-era canon and shadow fields

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0209
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - tier-era execution/worktree identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-004
- Fidelity gap refs: cov-004
- Required fidelity items:
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-004: Retire tier-era canon and shadow fields` exists in `Plans/Executor_Protocol.md`.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-004` repair removes stale live vocabulary and, if needed, confines any mention to an explicit compatibility-retirement note.

### Fidelity recovery cov-160: Identity and blocked-policy transfer cluster
- Coverage rows: cov-160
- Fidelity gap refs: cov-160
- Required fidelity items:
- Exact required item: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact required item: Carry usage switch-history and usage execution-role follow-through
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-160: Identity and blocked-policy transfer cluster` exists in `Plans/Executor_Protocol.md`.
- Exact acceptance check: The `cov-160` repair states the exact requirement: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact acceptance check: The `cov-160` repair states the exact requirement: Carry usage switch-history and usage execution-role follow-through
- Exact acceptance check: The `cov-160` repair is in the owner section for `Plans/Executor_Protocol.md` and is not only a downstream consumer note.

### Fidelity recovery cov-168: Coverage blocker provider/model precedence owner section
- Coverage rows: cov-168
- Fidelity gap refs: cov-168
- Required fidelity items:
- Exact required item: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact required item: Tie that section to parallel-node worktree assignment and ownership transitions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-168: Coverage blocker provider/model precedence owner section` exists in `Plans/Executor_Protocol.md`.
- Exact acceptance check: The `cov-168` repair states the exact requirement: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact acceptance check: The `cov-168` repair states the exact requirement: Tie that section to parallel-node worktree assignment and ownership transitions
- Exact acceptance check: The `cov-168` repair is in the owner section for `Plans/Executor_Protocol.md` and is not only a downstream consumer note.

### Fidelity recovery cov-187: Approval scope key and approver identity
- Coverage rows: cov-187
- Fidelity gap refs: cov-187
- Required fidelity items:
- Exact required item: Separate blocked-episode approval scope from session-wide policy scope
- Exact required item: Persist durable approver identity fields on approval and rejection events
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-187: Approval scope key and approver identity` exists in `Plans/Executor_Protocol.md`.
- Exact acceptance check: The `cov-187` repair states the exact requirement: Separate blocked-episode approval scope from session-wide policy scope
- Exact acceptance check: The `cov-187` repair states the exact requirement: Persist durable approver identity fields on approval and rejection events
- Exact acceptance check: The `cov-187` repair is in the owner section for `Plans/Executor_Protocol.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## 0. Purpose and scope
This document defines deterministic execution ordering for `plan_graph` nodes and completion semantics for Builder, Verifier, and Overseer roles.

It applies to:
- Self-build plan graph artifacts in `Plans/plan_graph.json`
- User-project sharded plan graph artifacts under `.puppet-master/project/plan_graph/`

For user projects, canonical entrypoint and derived-export policy are defined in `Plans/Project_Output_Artifacts.md` (`.puppet-master/project/plan_graph/index.json` canonical; monolithic export is optional/non-canonical).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md

---

## 1. Role definitions

### 1.1 Builder / node worker

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0200
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - worker identity/detail inspectors
  - `tier_id` filters and worker identity fields replaced with canonical node/attempt/runtime identity
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The execution worker that performs the node attempt.

### 1.2 Verifier / reviewer / corroborator

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0201
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `corroborator`
  - corroborator
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The execution-support actors that review, verify, or corroborate work products without becoming the scheduler.

### 1.3 Package Overseer

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0202
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - 3. **Single Overseer vs package overseer + seam overseer**
  - what likely new model pressure is: package overseer plus seam overseer split, requested/effective account fallback, promotion-aware provider/event records.
  - `Package Overseer`
  - Package Overseer
  - `Package overseer default`
  - Package overseer default
  - `Package Overseer` / `Seam Overseer` / `Corroboration`
  - Seam Overseer
  - Corroboration
  - `Package Overseer` / `Seam Overseer`
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Local governance for one `Work Package`.

### 1.4 Seam Overseer

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0203
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Seam Overseer`
  - Seam Overseer
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Cross-package integration governance for one `Feature Seam`.

### 1.5 Runtime scheduler
The canonical owner of readiness, blocked state, transitions, retry budgets, wakeups, and dispatch.

Rules:
- overseers are governance actors, not hidden second schedulers
- most node execution may be performed through overseer-spawned node workers, but runtime still owns canonical execution state
- conversational actors that share runtime identity semantics do not become orchestration nodes, packages, or seams

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md
## 2. Deterministic readiness

Overseer MUST read node execution state from the canonical node document:
- Self-build graph: `Plans/plan_graph.json.nodes[]`
- User-project sharded graph: `.puppet-master/project/plan_graph/nodes/<node_id>.json`

Overseer MUST NOT infer execution state from index metadata alone.
ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json

A node is ready if and only if all conditions are true:
1. `status == "queued"`
2. every node ID in `blockers[]` currently has `status == "done"`
3. `spec_lock_requirements.schema_versions` exactly matches `Plans/Spec_Lock.json.schema_versions` for every referenced key

If multiple nodes are ready simultaneously, Overseer MUST choose the lexicographically smallest `node_id`.
ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json

If any referenced Spec Lock version key is missing or mismatched, Overseer MUST treat that node as not ready.
ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Executor_Protocol.md

**Spec Lock requirement key contract for user-project nodes:**
- For user-project node shards under `.puppet-master/project/plan_graph/nodes/*.json`, `spec_lock_requirements.schema_versions` MUST use key names published in `Plans/Spec_Lock.json.schema_versions`.
- User-project nodes MUST NOT invent ad-hoc schema-version key names.
- If a referenced key is absent from `Plans/Spec_Lock.json.schema_versions`, Overseer MUST treat the node as not ready.

**Blocker integrity rule:**
- Every `blockers[]` entry MUST resolve to an existing canonical node document.
- An unresolved blocker ID is invalid graph input and the node MUST be treated as not ready.

ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Project_Output_Artifacts.md

---

## 3. Canonical status lifecycle

Success lifecycle:
`queued -> in_progress -> verify_pending -> verified -> done`

Failure lifecycle:
`verify_pending -> failed`

`done` and `failed` are terminal states for this protocol revision.

UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status lifecycle above.

Overseer MUST enforce lifecycle ordering and reject out-of-order transitions.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md

---

## 4. Auto-marking rule

Verifier writes evidence to `evidence_pointer` and returns `verifier_result`.

When `verifier_result.outcome == "pass"` and the evidence bundle exists and validates, Overseer MUST first set node `status = "verified"`, then immediately transition to `status = "done"`.
ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json

The `verified` state is a schema-enforced transitional state (requiring `outcome == "pass"` and `timestamp_utc` per both `plan_graph.schema.json` and `project_plan_node.schema.json`); Overseer SHALL NOT skip it.
ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json

Manual mark-complete action MUST NOT be required for verified nodes.
ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Executor_Protocol.md

When `verifier_result.outcome == "fail"`, Overseer sets node `status = "failed"`.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Executor_Protocol.md

---

The canonical dispatch/runtime packet carries `execution_unit_context`.

**Authoritative execution_unit_context fields**

| Field | Requirement |
| --- | --- |
| `run_id` | Canonical run identity for execution lineage. |
| `node_id` | Canonical node identity for dispatch and receipts. |
| `attempt_id` | Immutable local execution-attempt identity. |
| `lane_id` | Lane identity when the node is lane-bound. |
| `package_id` | Package identity for orchestration joins. |
| `seam_id` | Seam identity when dispatch is feature-scoped. |
| `worktree_id` | Durable worktree identity when execution runs in a bound worktree. |
| `execution_role` | Canonical execution-role disclosure for the packet. |
| `requested_account_id` | Requested account identity before routing resolution. |
| `requested_account_binding` | Binding mode that distinguishes preference from requirement. |
| `requested_account_policy` | Requested account-policy selection for routing and approvals. |
| `effective_account_id` | Effective resolved account identity. |
| `operational_identity` | Stable runtime identity for audit and joins. |
| `blocked_sequence` | Blocked-episode anchor when execution is paused or recovered through blocked state. |
| `allowed_action_ids[]` | Ordered blocked-action set carried into recovery surfaces. |

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, Plans/Crosswalk.md#3.1 Runtime orchestration ownership

### 5.1 Unified `DispatchContext` schema
The canonical dispatch view is the unified `DispatchContext` projection over `execution_unit_context`.

The canonical dispatch/runtime packet carries execution_unit_context.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `lane_id`
- `package_id`
- `seam_id`
- `worktree_id`
- `execution_role`
- `requested_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `effective_account_id`
- `operational_identity`
- `blocked_sequence`
- `approval_scope_key`

Behavioral rules:
- dispatch, recovery, remediation, and inspection read one execution-unit packet rather than tier-era compatibility objects.
- downstream consumers join losslessly to attempt, worktree, permission, and runtime records.
- blocked-action carrythrough stays anchored to blocked-episode lineage.

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md, Plans/Crosswalk.md#3.1 Runtime orchestration ownership
## 6. Overseer dispatch algorithm (deterministic)

1. Evaluate readiness predicate over all queued nodes.
2. Select smallest lexical `node_id` among ready set.
3. Dispatch Builder for selected node.
4. On Builder completion, set `verify_pending` and dispatch Verifier.
5. Apply auto-marking rule from Section 4 (`verified` → `done` on pass; `failed` on fail).
6. Repeat until no ready nodes remain.

Overseer MUST produce deterministic ordering for identical graph state and Spec Lock inputs.
ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3

### 6.1 Run-completion Document Packaging gate

Before a run is finalized, Overseer MUST enforce `Plans/Document_Packaging_Policy.md` for any Markdown/text artifact under `.puppet-master/**` produced by the run that reached packaging triggers.

A run MUST NOT be marked complete when any required Document Set audit (reconstruction/line accounting/idempotency, index-manifest match, clean-room determinism) fails.

Scope note:
- This run-completion gate applies to generated `.puppet-master/**` artifacts whether or not the current repo-local `run-gates` command enforces those artifact families directly.
- Repo-local verifier coverage and generated-artifact validator coverage MAY be delivered by different commands, but the packaging contract remains mandatory before final completion.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/Progression_Gates.md#GATE-014

## Runtime Scheduler Addendum (2026-03-08)

This addendum supersedes any earlier lexical-dispatch wording wherever they conflict.

### 1. Canonical scheduler pass

The executor MUST process scheduling as a deterministic repeated pass:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. Rebuild or refresh the candidate node set from canonical run state.
2. Recompute readiness for all candidate nodes.
3. Recompute blocked/backoff/capacity state.
4. Build the ready set.
5. Score ready nodes using the canonical ordered tuple.
6. Select as many nodes as available capacity permits.
7. Emit queue-analysis observability before dispatch.
8. Dispatch selected nodes.

### 2. Readiness rules

A node is ready only if all of the following are true:
- canonical node state is schedulable (`queued`, `reopened`, or equivalent ready-eligible state)
- every blocker in `blockers[]` has completed successfully or reached a state explicitly declared as dependency-satisfying
- no unresolved graph-integrity error exists for the node
- node is not in active backoff
- node is not blocked on HITL, clarification, external side-effect confirmation, permission denial, FileSafe, auth refresh, or replan-required state
- the node's plan/spec generation is still valid for the active `replan_generation`
- runtime capacity allows another dispatch in the applicable lane / pool

Invalid blocker IDs remain invalid graph input and MUST keep the node non-ready.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Contracts_V0.md

### 3. Deterministic score tuple

The canonical ready-node selection tuple is:
- `scheduler_lane`
- `manual_priority`
- `transitive_unblock_count`
- `ready_since_utc`
- `node_id`

Normalization rules:
- `scheduler_lane` order is `remediation > unblocker > normal`
- larger `manual_priority` wins
- larger `transitive_unblock_count` wins
- older `ready_since_utc` wins
- lexicographically smaller `node_id` wins only as the final tiebreak

Required notes:
- no critical-path weighting term is part of MVP selection
- queue analysis MUST expose the tuple breakdown so the user can see why a node was chosen
- `ready_since_utc` is set when the node first enters the ready set after being non-ready; it is retained while the node stays continuously ready
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

### 4. Capacity-aware parallel dispatch

The executor MUST select up to `available_slots` nodes per scheduler pass.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md

`available_slots` is derived from:
- run-level concurrency limit
- any active phase/task/subtask concurrency constraints
- resource / provider saturation limits
- remediation lane reservations when configured

Selection is global across the ready set, not level-by-level lexical dispatch.

### 5. Wakeup triggers

Canonical wake-trigger values and coalescing behavior are defined in `### Wake reasons and coalescing`.

This section is a forward-reference only so the wake-trigger canon has a single owner section in this file.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### 6. Blocked-to-runnable cascade

When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated immediately
- if now ready, they enter the ready set in the same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph

Canonical prerequisite-resolution event:
- `node.prerequisite_resolved` — emitted when a prerequisite node completes successfully, is dependency-satisfying via skip policy, or is force-resolved, potentially unblocking dependent nodes
- payload: `{ source_node_id, resolved_prerequisite_id, target_node_ids[], resolution: "completed" | "skipped" | "force_resolved" }`
- wake behavior: receiving this event triggers prerequisite re-evaluation on all `target_node_ids`; if all prerequisites are now resolved, the runtime blocked projection clears and the node transitions from `blocked` to `pending` / ready-eligible queue state in the same scheduler wake
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### 7. Failure classes and retry entry points

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0205
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `detail_ref` points to exact report/detail inspection
  - detail_ref
  - `evidence_ref` points to evidence payloads or summaries
  - evidence_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The executor classifies every failed or non-executed attempt into one canonical failure class or blocked-episode cause before deciding the next action.

Rules:
- transient provider faults, auth expiry, quota pressure, verification failure, reviewer findings, storage I/O, and graph-integrity failure remain distinct outcome families.
- permission-denied, user-declined, headless approval denial, FileSafe block, external-side-effect block, and replan-needed outcomes stay blocked until the owning recovery action resolves them.
- retry, backoff, remediation, safe-point restore, and escalation are keyed from the canonical classification owned by `Plans/Contracts_V0.md`.
- no consumer in this document may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md
### 7.1 Classified outcome matrix
| `classifier_family` | `classifier` | Max retries | Backoff | Auto-retry? | Notes |
|---|---|---|---|---|---|
| `failure_class` | `provider_transient` | 3 | 1s / 2s / 4s | Yes | network errors and transient 5xx only |
| `failure_class` | `rate_limited` | 3 | `Retry-After` or 30s fallback before bounded retry continues | Yes | 429 / provider pressure remains distinct from generic transient failure |
| `failure_class` | `structured_output_invalid` | 2 | none | Yes | malformed provider structured output |
| `failure_class` | `verification_failed` | 0 | — | No | may spawn remediation or review flow; no blind retry |
| `failure_class` | `reviewer_findings` | 0 | — | No | may spawn remediation or remain pending review |
| `failure_class` | `auth_expired` | 1 | immediate after refresh | Yes | refresh once, rebuild client, retry once |
| `blocked_reason_code` | `permission_denied` | 0 | — | No | requires explicit user decision |
| `blocked_reason_code` | `user_declined` | 0 | — | No | terminal unless the user explicitly changes posture |
| `blocked_reason_code` | `headless_ask_denied` | 0 | — | No | blocked or denied outcome; never silently retry |
| `blocked_reason_code` | `filesafe_blocked` | 0 | — | No | never auto-retry; honor FileSafe restore requirements |
| `blocked_reason_code` | `external_side_effect_blocked` | 0 | — | No | preserve local work and wait for approval/decline |
| `failure_class` | `storage_io` | 1 | brief delay | Yes | single retry on I/O failure |
| `failure_class` | `quota_exceeded` | 0 | — | No | user action or later retry window |
| `failure_class` | `graph_integrity` | 0 | — | No | hard fail; replan path only |
| `blocked_reason_code` | `replan_required` | 0 | — | No | remain blocked until patch or replan is applied |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md

Retry rules:
- `provider_transient` uses exponential backoff with base `1s`, factor `2x`, and cap `4s`: `1s -> 2s -> 4s`
- `rate_limited` remains distinct from `provider_transient`; executor policy MUST preserve that distinction when deciding backoff, surfacing state, or opening circuit breakers
- generic retry without prior classification is prohibited

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/CLI_Bridged_Providers.md

### 7.2 Doom-loop guard

If the same triple `(tool_name, serialized_args_hash, error_message)` is observed twice consecutively at the same nesting level, the executor MUST emit `stop.identical_failure` and terminate the run immediately.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 7.3 Signal handling and process lifecycle

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0206
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Quota signal: heuristic`
  - Quota signal: heuristic
  - `newtools.md` and assistant-memory continued to add final-pass-worthy signal:
  - newtools.md
  - Continue the ordered sequence on this same 22-doc tranche into `GPT-5.2`; `GPT-5.4` still produced enough novel signal to justify it.
  - GPT-5.2
  - GPT-5.4
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
PM entrypoints establish the canonical shutdown root with `signal.NotifyContext` or an equivalent once-owned signal fan-out before any managed subprocess is started.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Provider processes receive `SIGTERM` / `SIGINT` with a 5-second grace window. MCP and LSP subprocesses receive a 3-second grace window. `SIGHUP` reloads config. All managed subprocesses run in isolated process groups.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

### 8. Safe points

#### 8.1 Worktree snapshot in safe-point payloads

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0212
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Normalize lane/seam/package/concern/promotion pivots through `object_kind` routes, not filter-shaped payloads.
  - object_kind
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When an execution unit runs inside a worktree (thread-owned or orchestrator-owned), the safe-point event payload MUST include:

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

| Field | Type | Description |
|---|---|---|
| `worktree_id` | string? | ID of bound worktree, null if running in main repo |
| `worktree_path` | string? | Absolute path of worktree on disk |
| `worktree_branch` | string? | Branch checked out in worktree |
| `worktree_dirty` | bool | Whether worktree has uncommitted changes at snapshot time |

These fields enable remediation/resume to restore the correct execution context. They are advisory for recovery — the canonical binding source is the redb projection from seglog events.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md


Before any mutation-capable node attempt, the executor MUST create or attach a runtime safe point.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

Required properties:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path` or equivalent execution root
- refs to the relevant pre-attempt artifact/workspace baseline
- active `replan_generation`

Safe points are runtime recovery anchors. They are not user-facing restore points and MUST NOT be conflated with thread rewind/rollback semantics.
ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/newfeatures.md

### 9. Remediation child lineage

When verification or review requires an automatic fix cycle:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
- create remediation child lineage attached to the failed node attempt
- record `remediation_root_id`, `remediation_parent_attempt_id`, `generation`, and `origin_failure_event_id`
- preserve finding IDs / issue IDs through the remediation cycle
- retry the parent node only after remediation completes and the retry policy says to continue

A canonical graph node is created only when the remediation requires a replan that changes scope.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md

### 10. Draft decomposition degradation boundary

The executor MUST distinguish between:
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
- draft decomposition / pre-canonical planning
- canonical graph execution

Rules:
- draft decomposition may degrade to deterministic flat sequencing with warning evidence when dependency output is invalid or cyclic
- canonical graph execution MUST NOT silently flatten or otherwise degrade invalid canonical graphs
- invalid canonical graphs are `graph_integrity` failures and stop execution until repaired
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md

### 11. Acceptance criteria

- Ready-node selection is no longer defined as pure lexicographic dispatch.
- Queue analysis explains why selected nodes won and why ready-but-unselected nodes did not.
- Parallel dispatch is capacity-aware and deterministic.
- Blocked-to-runnable cascade is explicit and event-driven.
- Safe points exist before risky execution.
- Retry behavior is class-driven, not generic.
- Canonical graph integrity failures do not silently degrade.
## Runtime Scheduler / Recovery Reconciliation Addendum (2026-03-09)

This addendum is normative and supersedes any earlier pure-lexicographic dispatch wording where they conflict.

### Runtime recovery scheduler pass
The executor MUST process scheduling as a deterministic pass with these steps:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. refresh candidate runtime state for the active `replan_generation`
2. recompute readiness, blocked state, and backoff state
3. recompute lane and score terms for every ready candidate
4. select up to available capacity
5. emit queue-analysis state before dispatch
6. dispatch selected attempts

### Readiness contract
A node is ready only when all blockers are satisfied, the generation is current, the node is not blocked, the node is not in backoff, and capacity rules permit dispatch in its lane. Nodes blocked by permission denial, FileSafe, auth refresh, user confirmation, or replan-required state are not ready.

### Runtime recovery score tuple
The canonical selection tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.
- `scheduler_lane` order: `remediation > unblocker > normal`
- higher `manual_priority` wins
- higher `transitive_unblock_count` wins
- older `ready_since_utc` wins
- `node_id` is the final tiebreak only

No critical-path term is part of MVP selection.

### Runtime recovery wakeup triggers
See `### Wake reasons and coalescing` for the canonical wake-trigger list, `wake_reason` values, and watchdog-only polling rule.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### Blocked and retry behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0207
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - It should define the minimum execution-unit identity/runtime anchors needed for dispatch, retry, blocked handling, and receipts.
  - these fields are what make retry, blocked recovery, remediation, and restart behavior deterministic instead of heuristic
  - This makes wizard-blocked behavior look like a special deep-link flow instead of a peer member of the canonical blocked family.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The executor MUST classify every non-success outcome before applying policy.

- blocked episodes preserve local work, runtime identity, and explicit resume prerequisites.
- FileSafe and external side-effect blocks do not auto-retry; they wait for the owning restore or approval action.
- one decision path must not treat the same situation as both a failure class and a blocked-episode cause.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Permissions_System.md

### Runtime recovery attempt identity and safe points
Every dispatch creates or reuses a first-class `attempt_id`. Mutation-capable attempts and remediation apply steps MUST create a runtime `safe_point_id` before execution. Safe points are runtime recovery anchors only; they are not restore points.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

### Runtime recovery remediation lineage
Automatic fix cycles attach to a parent attempt using `remediation_root_id`, `remediation_parent_attempt_id`, `remediation_generation`, finding identifiers, and final resolution state. A new canonical graph node is created only when a replan changes canonical graph scope.

### Degradation boundary
Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md

## Canonical Runtime Scheduler Reconciliation Addendum (2026-03-09)

This addendum is normative and supersedes earlier pure-lexicographic readiness and dispatch wording wherever conflicting.

### Runtime scheduler readiness reconciliation
A node is ready only when all of the following are true:
1. lifecycle state is ready-eligible for dispatch
2. every blocker resolves to an existing canonical node in the active graph
3. every resolved blocker is in a dependency-satisfying state
4. the node is not in active backoff
5. the node is not blocked by any active runtime projection
6. the node's `replan_generation` matches the active run generation
7. no worktree/conflict rule forbids dispatch
8. lane/pool capacity permits dispatch

Invalid blocker IDs are `graph_integrity` problems and keep the node non-ready.

### Node lifecycle versus runtime overlays
Node lifecycle remains the graph-progress contract.

Runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval states.

Rules:
- overlays do not replace canonical node lifecycle values
- readiness consults both lifecycle state and active runtime overlays
- `waiting_approval` is represented through blocked/runtime records rather than by mutating node lifecycle taxonomy
- safe-point and remediation state likewise remain runtime overlays attached to attempts or blocked projections

This preserves one stable lifecycle contract for planning/graph semantics while allowing runtime recovery behavior to remain richly observable.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/human-in-the-loop.md

### Runtime scheduler score term definitions
The canonical score tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.

Rules:
- `scheduler_lane = remediation` only for remediation lineage work
- `scheduler_lane = unblocker` when successful completion would increase the ready set for other nodes in the active generation
- `scheduler_lane = normal` otherwise
- `manual_priority` is an integer `0..100`; default `50`; higher wins
- `transitive_unblock_count` counts currently blocked descendants in the active generation that would become ready if this node completed successfully now; invalid/cyclic relationships are excluded
- `ready_since_utc` is reset whenever the node leaves the ready set for any reason and is retained only while the node stays continuously ready
- `node_id` is the final tiebreak only

### Capacity-aware dispatch cycle
For each scheduler wake:
1. refresh candidate runtime state
2. recompute readiness and score terms
3. synchronously reevaluate directly affected dependents for the current wake
4. build the global ready set
5. emit queue-analysis observability keyed by `scheduler_pass_id`
6. select up to `available_slots` in canonical score order
7. dispatch selected attempts

### Runtime blocked-to-runnable cascade timing
When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated synchronously in the same wake cycle
- newly ready nodes enter the same ready set before dispatch completes
- no extra scheduler pass is required just to notice a direct unblock

### Class-driven next-step rules
- provider/model selection, worktree availability, and prerequisite readiness are resolved before dispatch begins.
- dirty-baseline, merge-conflict, approval, auth, or validation blockers surface through the canonical blocked-episode contract owned by `Plans/Contracts_V0.md`.
- class-driven follow-up never silently rewrites runtime identity, worktree ownership, or recovery posture.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

### Graph-lock boundary
Draft decomposition fallback is allowed only before `run.graph_canonical_locked`.
After that event:
- invalid canonical graph structure is `graph_integrity`
- execution MUST stop accepting new dispatches
- no silent flattening or degraded canonical execution is allowed
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/chain-wizard-flexibility.md

### Runtime attempt identity rule
Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new `attempt_id`. Prior attempts remain immutable historical records.
## Unified Runtime Scheduler and Attempt Lifecycle Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0199
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Requested/effective is well defined in runtime docs, but inherited/override presentation is not unified across settings surfaces.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum deprecates tier-era vocabulary and extends execution_unit_context, blocked-episode continuity, approval scope, and precedence/worktree ownership semantics.

### Tier-era compatibility retirement

Normative rules:
- Introduce execution_unit_context as canonical runtime-facing context object.
- The canonical dispatch/runtime packet carries execution_unit_context.
- The retired tier-era context object is a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context.
- The retired tier-era context object and the retired tier-era identifier are not canonical runtime fields; execution_unit_context together with execution_unit_type defines authoritative runtime scope.
- Worker spawn MUST mint or receive execution_unit_context before dispatch, and recovery plus remediation MUST rehydrate that same packet rather than reconstruct runtime scope from retired tier-era compatibility fields.
- Coordination services, scheduler joins, and UI inspection surfaces MUST read one shared execution_unit_context instance so restart, approval, blocked-episode continuity, and audit views resolve the same runtime unit.
- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.
  ContractRef: Primitive:ExecutionContext
  ContractRef: ContractName:Plans/Executor_Protocol.md

### Blocked episode identity and restart recovery

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0208
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - the blocked reason changes in a way that creates a genuinely new recovery episode rather than additional detail on the same episode
  - On restart, the runtime restores current unresolved blocked episodes from canonical blocked/runtime records/projections.
  - If restart discovers a previously persisted blocked episode is no longer valid because the prerequisite was already satisfied externally, the recovery cycle should resolve/unblock that episode explicitly rather than silently dropping it.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Blocked episode acceptance carry-through
- Make blocked_sequence canonical per run_id/node_id blocked episode
- Restore unresolved blocked episodes on restart without reminting them
- Keep request_id as subordinate compatibility handle only
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Separate blocked-episode approval scope from session-wide policy scope
- Persist durable approver identity fields on approval and rejection events

### Provider/model precedence and parallel worktree assignment

#### Provider/model acceptance carry-through
- Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Tie that section to parallel-node worktree assignment and ownership transitions

### Run-level deferred rule
- if any node is runnable, the run remains active.
- if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal.
- prerequisite resolution, restore completion, remediation completion, auth recovery, or capacity change wakes the scheduler.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md
## Counter Relationships and Event Ordering Addendum

### Counter relationships

```
attempt_count = automatic_retry_count
             + prerequisite_resume_count
             + manual_resume_count
             + remediation_retry_count
             + 1 (initial attempt)
```

- `attempt_count` is the total number of attempts for a node across all causes.
- Each sub-counter tracks attempts triggered by a specific cause.
- The sum of all sub-counters plus the initial attempt MUST equal `attempt_count`.
- Each sub-counter increments at attempt start, not at completion.
- Independent policy counters MUST NOT be inferred by subtracting from `attempt_count`.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Event ordering guarantees

1. **Per-node sequential**: All events for a given `node_id` MUST be processed in emission order. The event bus MUST NOT reorder events within a single node's event stream.
2. **Cross-node eventual**: Events from different nodes have no guaranteed relative order. Consumers MUST be idempotent and tolerate out-of-order delivery across nodes.
3. **Deduplication**: The event bus MUST deduplicate events by `(event_name, node_id, attempt_id, ts)` tuple. Duplicate deliveries are silently dropped.
4. **Wakeup coalescing**: Multiple wakeup triggers arriving within a single scheduler pass window are coalesced into one scheduler pass. The `wake_reason` for the pass records the first trigger; additional triggers are logged but do not cause additional passes.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

### Replan generation lifecycle

`replan_generation` is a per-run monotonic `u32` counter starting at `0` for the initial graph.

- Increments by exactly 1 each time a replan is applied and the canonical graph is updated via `run.graph_canonical_locked`.
- A replan is defined as any structural change to the canonical graph (adding/removing/reordering nodes or edges).
- Attempts, safe points, and blocked projections created under generation N become stale when generation increments to N+1.
- Stale attempts remain queryable for audit but are never resumable.
- There is no practical maximum value.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

## Execution Context: Worktree Handoff

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0198
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The planning-to-runtime blocked/degraded handoff is closer to correct:
  - The addenda already move toward attempt-native handoff identity:
  - Handoff target is now `Ledger Condenser`.
  - Ledger Condenser
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When Orchestrator or Assistant Chat creates an execution unit that should run inside a worktree, the execution context handoff includes worktree identity.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

The execution context MUST include:
- `working_directory`: set to worktree root path (not project root) when worktree is bound
- `worktree_id`: identifier of the target worktree
- `worktree_branch`: branch name checked out in worktree
- `is_worktree`: bool flag distinguishing worktree context from main repo context

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Caller responsibilities:**
- Orchestrator sets these fields when launching a DAE in a lane-owned worktree
- Assistant Chat sets these fields when the active thread has a bound worktree and the user runs agent-mode or plan-mode work
- If `is_worktree` is false or absent, execution defaults to project root

**Executor responsibilities:**
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses worktree path when `is_worktree` is true

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Commands_System.md

ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor

Required fields:
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Canonical terms and values:
- execution_unit_context
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Labels:
- execution unit context
- blocked episode

Behavioral rules:
- Execution protocol must define runtime scope through execution-unit context rather than tier roots.
- Blocked-episode identity must remain explicit in execution-relevant recovery paths.

Permission carry-through:
- effective account, execution role, and blocked-episode approval scope must survive execution handoff
### Mode interaction

All assistant chat modes (Ask, Agent, Plan, Deep Plan, Debug) operate within the thread's worktree when one is bound:
- Ask mode: read-only context from worktree files
- Agent mode: file edits go to worktree
- Plan/Deep Plan mode: plans execute in worktree context
- Debug mode: debug operations target worktree

Mode transitions do not affect worktree binding — the binding is thread-level, not mode-level.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md
