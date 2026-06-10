# DRY Rules (Canonical)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DRY / SSOT RULES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document defines the anti-drift rules for plan documents:
- how SSOT sources are referenced (instead of duplicated)
- how `ContractRef:` annotations make requirements executable and gateable

ContractRef: Primitive:DRYRules

---

## 1. SSOT precedence (global)
If documents conflict, resolve with:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. This file
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: SchemaID:Spec_Lock.json, Primitive:Crosswalk, PolicyRule:Decision_Policy.md§2

---

## 2. Don't duplicate canonical contracts

A doc that consumes orchestration, routing, runtime identity, approval, or worktree/lane behavior must consume the owning contract rather than restating feature-local canon.

Rules:
- owner docs are updated before consumer docs when canon changes
- stale canonical text must be replaced or retired; append-only clarification is not sufficient when old text would remain misleading
- a consumer doc must not preserve an older model as a peer option once a replacement canon exists
- summary, checklist, and feature-list mirrors do not re-own canon and must be reconciled after owner docs change
- `Plans/newtools.md` (`/newtools.md`) and its MCP `/web-tooling` origin text are consumer alignment only; verify them against canonical owners before treating older tooling prose as live canon. `Plans/newfeatures.md` (`/newfeatures.md`) is promoted-feature `/origin` summary material and must be reconciled whenever owner docs change so origin text does not remain misleading.
- Firecrawl/lost-spec packet impact checks keep `Plans/MCP_Integration.md` (`/MCP_Integration.md`), `Plans/feature-list.md` (`/feature-list.md`), `Plans/newfeatures.md` (`/newfeatures.md`), and `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) in scope when MCP availability, summary `/reference` surfaces, promoted-feature summaries, or approval ladder / HITL semantics would otherwise remain misleading.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

The following concepts are owner-routed and must not be re-owned by consumers:
- blocked-episode approval identity
- requested/effective runtime identity
- account-binding semantics and switch history
- blocked `/retry/account-switch` semantics
- `route_target` and `OpenSubject`
- route/deep-link/open-by-identity contracts
- lane/worktree lifecycle semantics
- thread-worktree binding semantics and lifecycle
- concern lifecycle and lineage
- graph-generation lineage and graph-patch semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

### 2.1 Cross-file owner-routing boundaries

The following cross-file concepts are DRY owner routes. Consumer docs may index them, display them, or carry refs to them, but they do not re-own their field lists, enum families, event names, storage key shapes, or compatibility aliases.

| Concept boundary | Owner route |
|---|---|
| Runtime ready-set, `/backoff`, remediation, and blocked scheduling | `Plans/Executor_Protocol.md` owns ready-set scoring, scheduler lane order, retry/backoff policy, remediation flow, wake reasons, and blocked-to-runnable behavior. `Plans/Contracts_V0.md` owns runtime event and payload vocabulary, including `scheduler.pass`, `node.blocked`, `node.unblocked`, `run.node_backoff_started`, `run.node_backoff_expired`, `run.node_retry_scheduled`, `remediation.spawned`, `remediation.resolved`, `blocked_reason_code`, `allowed_action_id`, `allowed_action_ids[]`, `dirty_worktree`, and `worktree_conflict`. `Plans/chain-wizard-flexibility.md` owns `wizard_status`; `chain-wizard` consumers do not redefine blocked runtime fields. Legacy `NEEDS` / `RECONCILIATION` audit flags are transfer-state dispositions, not live enum values, once the owner docs carry the reconciled canon. |
| Orchestrator graph, record, and storage-schema clusters | `Plans/Run_Graph_View.md` owns graph inspector and `/full-record` presentation. `Plans/Contracts_V0.md` owns concern, promotion, graph-patch, recovery record, and recovery event contracts. `Plans/storage-plan.md` owns investigation storage, receipt extensions, web-operation child payload persistence refs, seglog wire format, and storage `key-shape` rules. `Plans/UI_Command_Catalog.md` owns wrapper-completeness through stable wrapper command normalization, command IDs, and `normalizes_to_contract`; `low-priority` audit labels do not change the owner route. |
| Compare, review, and SCM anti-dup boundaries | Requested/effective runtime identity stays in `Plans/Contracts_V0.md`. Compare-session and same-path-across-worktrees source wording maps to explicit same-file or same `repo_relative_path` compare/open identity in `Plans/WorktreeGitImprovement.md`, `Plans/FileManager.md`, and `Plans/storage-plan.md`. Hunk expand/collapse, grouped hunk actions, and diff-local search stay with `Plans/FileManager.md` and `Plans/UI_Command_Catalog.md`. Cross-surface receipt schema stays with `Plans/storage-plan.md`; Orchestrator run-to-repo lineage stays a consumer route through `Plans/Orchestrator_Page.md` plus storage receipts; Health remains read-only and Source Control owns live-worktree truth per `Plans/WorktreeGitImprovement.md`. |
| Worktree owner-node rename and compatibility | `owner_node_id` is the canonical orchestration-node lineage field for worktree ownership. `owner_tier_id` may remain only as documented compatibility, migration, or source-lineage evidence; consumer docs that still expose worktree owner lineage must carry `owner_node_id` beside any compatibility `owner_tier_id` alias. |
| Permission snapshot split | `Plans/Permissions_System.md` owns permission snapshot schema, enums, approval-surface expectations, and blocked-action semantics. `Plans/storage-plan.md` owns only the durable storage binding, including `permission_snapshot_record.v1:{project_id}:{snapshot_id}` and `attempt_record.permission_snapshot_id`; storage consumers may cache index fields but may not redefine the nested permission snapshot schema. |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Glossary.md

### 2.2 Special recovery contradiction-check routing

Special recovery contradiction checks are DRY-routing evidence, not new ownership assignments. When chain-wizard and worktree checks name `Plans/chain-wizard-flexibility.md` and `Plans/WorktreeGitImprovement.md`, adjacent contradiction review stays routed through the owning docs: `Contracts_V0.md`, `Prompt_Pipeline.md`, `storage-plan.md`, `Multi-Account.md`, `Orchestrator_Page.md`, `Run_Graph_View.md`, `UI_Wiring_Rules.md`, `Wiring_Matrix.md`, `Wiring_Matrix.schema.json`, `Commands_System.md`, `Widget_System.md`, `Project_Output_Artifacts`, `Project_Output_Artifacts.md`, `GitHub_Integration.md`, `GitHub_API_Auth_and_Flows`, `GitHub_API_Auth_and_Flows.md`, and `Permissions_System.md`.

Tooling and memory consumer checks keep `Plans/newtools.md`, `Plans/assistant-memory-subsystem.md`, `/assistant-memory-subsystem.md`, `UI_Command_Catalog.md`, `assistant-chat-design.md`, `Contracts_V0.md`, `storage-plan.md`, `Orchestrator_Page.md`, `WorktreeGitImprovement.md`, `Project_Output_Artifacts`, `Project_Output_Artifacts.md`, `Permissions_System.md`, and `Tools.md` as contradiction-review inputs only; they do not let consumer summaries re-own schema, command, runtime, permission, or storage canon.

Audit-overlap routing treats `Crosswalk.md` and `Contracts_V0.md` owner-routing integrity as the primary owner check, `storage-plan.md` same-file mixed canon as a storage-owner reconciliation, `Decision_Log.md` and rewrite-root routing gaps as decision-history cleanup, `FinalGUISpec.md`, `UI_Command_Catalog.md`, `Widget_System.md`, and promoted-shell docs as drift-amplifier consumers, and `FileSafe.md`, `MiscPlan.md`, and `Executor_Protocol.md` as adjacent runtime-lineage enforcement owners.

`resume_url` discrepancies are a required-versus-carried contradiction between `Contracts_V0.md` and `storage-plan.md`. `projection-backed` operational surfaces must expose trust state, last updated time, degraded or `/stale` reason when not current, and whether actions are partially gated.

Contract checks must keep `ContractRef` taxonomy stricter in the gate text than in consumer summaries: reconcile owner docs in this order, `Contracts_V0.md`, `Crosswalk.md`, `UI_Command_Catalog.md`, `FinalGUISpec.md`, then consumer docs. Duplicated `cost_usage` text is a DRY reconciliation risk because one copy can drift while another stays stale, and `storage-plan.md` mismatches are same-file reconciliation problems before they are cross-doc mismatches.

Early `event-source` tables that already consume newer runtime-lineage concepts later in the same consumer docs are internally stale and must be reconciled at the owner route, not patched as isolated table gaps. Duplicated `Crosswalk.md` numbering is a DRY failure because it undermines `ContractRef` stability and gateable traceability.

Corroboration routing must keep at least two layers distinct: `corroboration_request` packet input and `corroboration_result` output evidence. Dispatch contracts must state which fields are executor-facing and mandatory for correctness at dispatch time, while optional disclosure or `/overlay` fields stay consumer-facing and do not become required dispatch schema.

UI `/behavior` docs may carry a top-level statement, but implementation agents need the owner-defined operational policy layer before consumer summaries can be canonical. Blocked-episode `gap-005` cleanup must distinguish globally missing canon from owner-defined canon that is only absent from Tools and `/chat/usage` consumers.

Route reconciliation updates owner docs first, then consumer docs consume the canonical route/object model; consumer pages must not invent `/object` or page-local identity rules as peer canon.

ContractRef: Primitive:DRYRules, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

## 3. "Index-only" guidance

### 3.1 Assistant worktree DRY routing

Thread-to-worktree binding follows the standard owner-routed DRY pattern:

| Concept | Owner doc | Consumers cross-ref, do not redefine |
|---|---|---|
| Thread worktree binding model (1:1) | `Plans/assistant-chat-design.md` | storage-plan.md, Contracts_V0.md, Crosswalk.md |
| 11 seglog events (`chat.thread_worktree_*`) | `Plans/assistant-chat-design.md` | storage-plan.md, Contracts_V0.md, Wiring_Matrix.md |
| 6 commands (`cmd.chat.worktree.*`) | `Plans/assistant-chat-design.md` | UI_Command_Catalog.md, Commands_System.md, Contracts_V0.md |
| 10 settings keys | `Plans/assistant-chat-design.md` | storage-plan.md, FinalGUISpec.md |
| Merge-back flow (4 paths) | `Plans/assistant-chat-design.md` | GitHub_Integration.md, Executor_Protocol.md |
| Pre-merge test gate | `Plans/assistant-chat-design.md` | storage-plan.md, Executor_Protocol.md |
| SC accordion layout | `Plans/GitHub_Integration.md` | storage-plan.md, FinalGUISpec.md |
| `owner_thread_id` on worktree_record.v1 | `Plans/storage-plan.md` | WorktreeGitImprovement.md, Orchestrator_Page.md |

Consumer docs MUST cross-reference the owner doc rather than redefining canonical details. Tables, enums, field lists, and behavioral rules live in the owner doc only.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/assistant-chat-design.md

### 3.2 Assistant chat/runtime/question/dispatcher DRY routing

`Plans/assistant-chat-design.md` is the owner for chat/runtime/question/dispatcher behavior and the consumer carry-through points for web, permissions, runtime identity, blocked payloads, and TODO persistence. Repaired owner docs MUST index their assistant-chat consumers coherently rather than duplicating or drifting the owner rules.

Named carry-through anchors are `## 4`, `### 7.4`, `### 8.6`, `### 13.2`, and `### 27.2`; the `/runtime/question/dispatcher` owner seam and `/section` carry-through metadata must remain traceable in packet/state evidence. Obligation IDs `obl-036`, `obl-037`, `obl-042`, `obl-048`, `obl-008`, `obl-040`, `obl-041`, `obl-043`, `obl-059`, `obl-060`, `obl-061`, `obl-062`, `obl-064`, and `obl-068` must survive as traceability inputs for the owner rewrite plus consumer reconciliation.

ContractRef: Primitive:DRYRules, ContractName:Plans/assistant-chat-design.md

A plan MAY include an index/list of IDs (event kinds, UI command IDs, tool IDs) but MUST NOT redefine schemas owned elsewhere.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 4. Forbidden patterns (drift accelerators)
- `TBD`, `Open question`, `ask later` in plan requirements.
- Vague requirements like "robust", "graceful", "secure" without measurable behavior.
- Duplicating provider CLI details outside Provider SSOT.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 5. MUST/SHALL/REQUIRED implies ContractRef
Any statement using **MUST / SHALL / REQUIRED / NEVER** MUST include at least one `ContractRef:` line.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 6. ContractRef taxonomy (allowed categories)


ContractRef entries are comma-separated.

Allowed categories (minimum):
- `SchemaID:<id>`
- `ContractName:<path>#<anchor>`
- `Primitive:<name>`
- `ToolID:<id>`
- `EventType:<type>`
- `ConfigKey:<key>`
- `PolicyRule:<id>`
- `UICommand:<id>`
- `Invariant:<id>`
- `Gate:<id>`

ContractRef: Primitive:DRYRules

---

<a id="7"></a>
## 7. ContractRef annotation rule (canonical)
**Rule:** Every operational requirement MUST have at least one `ContractRef:`.

Operational requirement detection (deterministic):
- Any line containing: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

ContractRef: ContractName:Plans/Progression_Gates.md#GATE-009

ContractRef format:
```text
... requirement text ...
ContractRef: Primitive:DRYRules, ContractName:Plans/Contracts_V0.md#AuthState
```

The allowed `ContractName:<path>#<anchor>` category is a path-plus-anchor form; this traceability-format example deliberately uses a file-path plus anchor, so owner-routing examples do not depend on path-only or self-referential `ContractName` forms.

ContractRef: Gate:GATE-009, ContractName:Plans/Progression_Gates.md#GATE-009

---

## 7.1 Packet-fidelity semantic matching
Packet-fidelity checks used by VERIFIER packet preflight and SCRIBE self-check MUST ignore standalone lines whose trimmed text starts with `ContractRef:` on both the packet-text side and the file-text side before substring matching.

Required matching order:
1. Strip standalone `ContractRef:` lines from both texts.
2. Convert CRLF to LF.
3. Trim trailing whitespace per line.
4. Collapse runs of spaces/tabs to a single space.
5. Collapse 3+ blank lines to 2 blank lines.
6. Perform substring matching on the normalized texts.

This semantic matching rule exists only for packet-fidelity/self-check comparisons and MUST NOT weaken ContractRef enforcement in run-gates or any other plan-quality gate.

ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2

---

## 8. Reference style
- Prefer referencing canonical files/anchors over inline duplication.
- Prefer stable anchors (`<a id="..."></a>`) for cross-doc links when heading slugging could change.

ContractRef: Primitive:DRYRules

---

<a id="9"></a>
## 9. No unreferenced operational text


Operational requirements without `ContractRef:` are non-canonical and MUST fail the plan-quality gate.

ContractRef: Gate:GATE-009

---

<a id="10"></a>
## 10. Inline requirement tag convention (readability only)

This convention is **readability-only and non-authoritative**. It provides a lightweight way to annotate requirement references inline in prose — it does NOT constitute traceability evidence.

**Tag format:**
- `Req:FR-001` — functional requirement reference
- `Req:NFR-001` — non-functional requirement reference
- `Req:REQ-001` — generic requirement reference

Authoritative requirement coverage lives ONLY in:
1. Node shard `requirement_refs` fields (schema: `pm.project-plan-node.v1`)
2. Derived coverage JSON at `.puppet-master/project/traceability/requirements_coverage.json`

ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

Inline tags MUST NOT be used as the sole traceability mechanism.  
ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

If an inline tag and a node's `requirement_refs` conflict, `requirement_refs` MUST be treated as authoritative.  
ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

---

## References
- `Plans/Progression_Gates.md#GATE-009`
- `Plans/Progression_Gates.md#GATE-011`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
- `Plans/requirements_coverage.schema.json`
