# Executor Protocol (Canonical)

## 0. Purpose and scope
This document defines deterministic execution ordering for `plan_graph` nodes and completion semantics for Builder, Verifier, and Executor roles.

It applies to:
- Self-build plan graph artifacts in `Plans/plan_graph.json`
- User-project sharded plan graph artifacts under `.puppet-master/project/plan_graph/`

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md

---

## 1. Role definitions

### 1.1 Builder
Builder implements the node objective, produces declared outputs, and transitions node status:
`queued -> in_progress -> verify_pending`.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/plan_graph.schema.json

### 1.2 Verifier
Verifier runs node acceptance checks, writes evidence at `evidence_pointer`, and writes `verifier_result`.

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/evidence.schema.json

### 1.3 Executor
Executor selects the next ready node, dispatches Builder/Verifier, and applies automatic completion status transitions after verification output is available.

ContractRef: ContractName:Plans/Executor_Protocol.md, PolicyRule:Decision_Policy.md§2

---

## 2. Deterministic readiness

Executor MUST read node execution state from the canonical node document:
- Self-build graph: `Plans/plan_graph.json.nodes[]`
- User-project sharded graph: `.puppet-master/project/plan_graph/nodes/<node_id>.json`

Executor MUST NOT infer execution state from index metadata alone.
ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json

A node is ready if and only if all conditions are true:
1. `status == "queued"`
2. every node ID in `blockers[]` currently has `status == "done"`
3. `spec_lock_requirements.schema_versions` exactly matches `Plans/Spec_Lock.json.schema_versions` for every referenced key

If multiple nodes are ready simultaneously, Executor MUST choose the lexicographically smallest `node_id`.
ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json

If any referenced Spec Lock version key is missing or mismatched, Executor MUST treat that node as not ready.
ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Executor_Protocol.md

---

## 3. Canonical status lifecycle

Success lifecycle:
`queued -> in_progress -> verify_pending -> verified -> done`

Failure lifecycle:
`verify_pending -> failed`

`done` and `failed` are terminal states for this protocol revision.

Executor MUST enforce lifecycle ordering and reject out-of-order transitions.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md

---

## 4. Auto-marking rule

Verifier writes evidence to `evidence_pointer` and returns `verifier_result`.

When `verifier_result.outcome == "pass"` and the evidence bundle exists and validates, Executor MUST first set node `status = "verified"`, then immediately transition to `status = "done"`.
ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json

The `verified` state is a schema-enforced transitional state (requiring `outcome == "pass"` and `timestamp_utc` per both `plan_graph.schema.json` and `project_plan_node.schema.json`); Executor SHALL NOT skip it.
ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json

Manual mark-complete action MUST NOT be required for verified nodes.
ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Executor_Protocol.md

When `verifier_result.outcome == "fail"`, Executor sets node `status = "failed"`.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Executor_Protocol.md

---

## 5. Node execution fields

- `status`
  - lifecycle state enum: `queued | in_progress | verify_pending | verified | done | failed`
- `evidence_pointer`
  - object: `{ "kind": "filesystem_path" | "seglog_ref", "ref": "<string>" }`
- `verifier_result`
  - object containing `outcome` (`pending | pass | fail`), optional `timestamp_utc`, optional `message`
- `decision_refs`
  - array of decision IDs/references; empty array is valid
- `spec_lock_requirements`
  - object containing schema-version keys that must match Spec Lock before readiness can evaluate true

ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json, ContractName:Plans/Spec_Lock.json

---

## 6. Executor dispatch algorithm (deterministic)

1. Evaluate readiness predicate over all queued nodes.
2. Select smallest lexical `node_id` among ready set.
3. Dispatch Builder for selected node.
4. On Builder completion, set `verify_pending` and dispatch Verifier.
5. Apply auto-marking rule from Section 4 (`verified` → `done` on pass; `failed` on fail).
6. Repeat until no ready nodes remain.

Executor MUST produce deterministic ordering for identical graph state and Spec Lock inputs.
ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3
