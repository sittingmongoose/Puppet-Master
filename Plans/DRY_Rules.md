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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/DRY_Rules.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### DR-002 - DRY Rules Authority And Naming Guard

```yaml
plan_unit_id: DR-002
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: DRY_Rules.md is the canonical DRY/SSOT rule owner; platform naming is "Puppet Master" only, and older names may be referenced only as "legacy naming" without quoting them.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: dry_rules_authority_and_naming_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0001
preserved_exact_tokens:
- DRY Rules (Canonical)
- PUPPET MASTER -- DRY / SSOT RULES
- ABSOLUTE NAMING RULE
- Puppet Master
- legacy naming
negative_constraints:
- Do not quote older platform names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-003 - Anti-Drift Scope And ContractRefs

```yaml
plan_unit_id: DR-003
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: DRY rules define how plan documents reference SSOT sources instead of duplicating them, and how ContractRef annotations make requirements executable and gateable.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: anti_drift_scope_and_contractrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0002
preserved_exact_tokens:
- SSOT sources
- 'ContractRef:'
- executable and gateable
- 'ContractRef: Primitive:DRYRules'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-004 - Global SSOT Precedence

```yaml
plan_unit_id: DR-004
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: When documents conflict, resolution order is Spec_Lock.json, Crosswalk.md, DRY_Rules.md, Glossary.md, then Decision_Policy.md.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: global_ssot_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0003
preserved_exact_tokens:
- Plans/Spec_Lock.json
- Plans/Crosswalk.md
- Plans/Glossary.md
- Plans/Decision_Policy.md
- 'ContractRef: SchemaID:Spec_Lock.json, Primitive:Crosswalk, PolicyRule:Decision_Policy.md§2'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-005 - Owner Contract Consumption

```yaml
plan_unit_id: DR-005
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Consumer docs for orchestration, routing, runtime identity, approval, or worktree/lane behavior consume owning contracts instead of restating feature-local canon.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0004
preserved_exact_tokens:
- orchestration
- routing
- runtime identity
- approval
- worktree/lane behavior
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md'
negative_constraints:
- Consumers must not restate feature-local canon as peer ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-006 - Owner-First Reconciliation

```yaml
plan_unit_id: DR-006
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Owner docs update before consumers; stale canonical text is replaced or retired; older models cannot remain peer options once replacement canon exists.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_first_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0004
preserved_exact_tokens:
- owner docs are updated before consumer docs
- stale canonical text must be replaced or retired
- append-only clarification is not sufficient
- older model as a peer option
negative_constraints:
- Append-only clarification is not sufficient when old text remains misleading.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale canonical text must be replaced or retired rather than preserved as live peer canon.
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-007 - Consumer Mirror And Origin Alignment

```yaml
plan_unit_id: DR-007
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Summary, checklist, feature-list, newtools, newfeatures, MCP origin, Firecrawl/lost-spec, reference, promoted-feature, approval ladder, and HITL material remain consumer alignment only and must reconcile after owner changes.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: consumer_mirror_and_origin_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0004
preserved_exact_tokens:
- summary, checklist, and feature-list mirrors
- Plans/newtools.md
- /newtools.md
- /web-tooling
- Plans/newfeatures.md
- /newfeatures.md
- /origin
- Firecrawl/lost-spec
- /reference
- /human-in-the-loop.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-008 - Owner-Routed Concept Families

```yaml
plan_unit_id: DR-008
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Blocked-episode approval identity, requested/effective runtime identity, account binding, retry/account-switch, route_target, OpenSubject, route/open-by-identity, lane/worktree, thread-worktree, concern, and graph-generation/patch concepts are owner-routed and must not be re-owned by consumers.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_routed_concept_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0004
preserved_exact_tokens:
- blocked-episode approval identity
- requested/effective runtime identity
- account-binding semantics
- blocked `/retry/account-switch` semantics
- route_target
- OpenSubject
- route/deep-link/open-by-identity contracts
- lane/worktree lifecycle semantics
- thread-worktree binding semantics
- concern lifecycle and lineage
- graph-generation lineage and graph-patch semantics
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
negative_constraints:
- The listed owner-routed concepts must not be re-owned by consumers.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-009 - Runtime Scheduling Owner Route

```yaml
plan_unit_id: DR-009
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Executor owns ready-set/backoff/remediation scheduling, Contracts owns runtime event and payload vocabulary, chain-wizard-flexibility owns wizard_status, and legacy NEEDS/RECONCILIATION are transfer-state dispositions, not live enum values.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: runtime_scheduling_owner_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0005
preserved_exact_tokens:
- Plans/Executor_Protocol.md
- /backoff
- remediation
- scheduler.pass
- node.blocked
- node.unblocked
- run.node_backoff_started
- run.node_backoff_expired
- run.node_retry_scheduled
- remediation.spawned
- remediation.resolved
- blocked_reason_code
- allowed_action_id
- allowed_action_ids[]
- dirty_worktree
- worktree_conflict
- wizard_status
- NEEDS
- RECONCILIATION
negative_constraints: []
compatibility_only_notes:
- Legacy NEEDS / RECONCILIATION audit flags are transfer-state dispositions, not live enum values.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-010 - Graph Record Storage Owner Route

```yaml
plan_unit_id: DR-010
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Run_Graph_View owns graph inspector and /full-record presentation, Contracts owns concern/promotion/graph-patch/recovery contracts, storage owns investigation/storage wire formats, and UI_Command_Catalog owns wrapper-command normalization.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: graph_record_storage_owner_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0005
preserved_exact_tokens:
- Plans/Run_Graph_View.md
- /full-record
- Plans/Contracts_V0.md
- graph-patch
- Plans/storage-plan.md
- key-shape
- Plans/UI_Command_Catalog.md
- normalizes_to_contract
- low-priority
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-011 - Compare Review SCM Boundaries

```yaml
plan_unit_id: DR-011
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Compare/open identity, hunk controls, diff-local search, cross-surface receipts, Orchestrator run-to-repo lineage, Health read-only posture, and Source Control live-worktree truth stay with their owner docs.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: compare_review_scm_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0005
preserved_exact_tokens:
- Requested/effective runtime identity
- same `repo_relative_path`
- Plans/WorktreeGitImprovement.md
- Plans/FileManager.md
- Hunk expand/collapse
- grouped hunk actions
- diff-local search
- cross-surface receipt schema
- Plans/Orchestrator_Page.md
- Health remains read-only
- Source Control owns live-worktree truth
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-012 - Worktree Owner-Node Compatibility

```yaml
plan_unit_id: DR-012
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: owner_node_id is canonical for worktree orchestration-node lineage, while owner_tier_id may remain only as documented compatibility, migration, or source-lineage evidence beside owner_node_id.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: worktree_owner_node_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0005
preserved_exact_tokens:
- owner_node_id
- owner_tier_id
- canonical orchestration-node lineage field
- compatibility, migration, or source-lineage evidence
negative_constraints: []
compatibility_only_notes:
- owner_tier_id may remain only as documented compatibility, migration, or source-lineage evidence.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-013 - Permission Snapshot Split

```yaml
plan_unit_id: DR-013
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Permissions_System owns permission snapshot schema, enums, approval-surface expectations, and blocked-action semantics; storage owns only durable binding keys and cannot redefine nested permission snapshot schema.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: permission_snapshot_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0005
preserved_exact_tokens:
- Plans/Permissions_System.md
- permission snapshot schema
- permission_snapshot_record.v1:{project_id}:{snapshot_id}
- attempt_record.permission_snapshot_id
- nested permission snapshot schema
negative_constraints:
- Storage consumers may cache index fields but may not redefine the nested permission snapshot schema.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-014 - Special Recovery Routing Evidence

```yaml
plan_unit_id: DR-014
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Special recovery contradiction checks are DRY-routing evidence, not new ownership assignments, and adjacent contradiction review stays routed through the named owner docs.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: special_recovery_routing_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- Special recovery contradiction checks
- DRY-routing evidence
- not new ownership assignments
- Plans/chain-wizard-flexibility.md
- Plans/WorktreeGitImprovement.md
- Contracts_V0.md
- Prompt_Pipeline.md
- storage-plan.md
- Multi-Account.md
- Orchestrator_Page.md
- Run_Graph_View.md
- UI_Wiring_Rules.md
- Wiring_Matrix.md
- Commands_System.md
- Widget_System.md
- Project_Output_Artifacts.md
- GitHub_Integration.md
- Permissions_System.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-015 - Tooling Memory Consumer Checks

```yaml
plan_unit_id: DR-015
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Tooling and memory consumer checks keep named docs as contradiction-review inputs only and do not let consumer summaries re-own schema, command, runtime, permission, or storage canon.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: tooling_memory_consumer_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- Plans/newtools.md
- Plans/assistant-memory-subsystem.md
- /assistant-memory-subsystem.md
- UI_Command_Catalog.md
- assistant-chat-design.md
- Tools.md
- contradiction-review inputs only
negative_constraints:
- Consumer summaries do not re-own schema, command, runtime, permission, or storage canon.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-016 - Audit And Contract Check Ordering

```yaml
plan_unit_id: DR-016
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Audit-overlap and contract checks reconcile owner docs before consumer docs, preserve stricter ContractRef taxonomy in gate text, and treat duplicate/stale text as DRY reconciliation risk.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: audit_and_contract_check_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- Crosswalk.md
- Contracts_V0.md
- storage-plan.md
- Decision_Log.md
- FinalGUISpec.md
- UI_Command_Catalog.md
- Widget_System.md
- FileSafe.md
- MiscPlan.md
- Executor_Protocol.md
- ContractRef taxonomy stricter in the gate text
- cost_usage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Duplicated cost_usage text is a DRY reconciliation risk because one copy can drift while another stays stale.
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-017 - Projection-Backed Trust State

```yaml
plan_unit_id: DR-017
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: projection-backed operational surfaces expose trust state, last updated time, degraded or /stale reason when not current, and whether actions are partially gated.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: projection_backed_trust_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- projection-backed
- trust state
- last updated time
- degraded
- /stale
- partially gated
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-018 - Stale Event And Crosswalk Integrity

```yaml
plan_unit_id: DR-018
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Early event-source tables that already consume newer runtime-lineage concepts are internally stale and duplicated Crosswalk numbering is a DRY failure undermining ContractRef stability and traceability.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: stale_event_and_crosswalk_integrity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- event-source
- runtime-lineage
- Duplicated `Crosswalk.md` numbering
- ContractRef stability
- gateable traceability
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Early event-source tables are internally stale and must be reconciled at the owner route, not patched as isolated table gaps.
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-019 - Corroboration Dispatch Boundary

```yaml
plan_unit_id: DR-019
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Corroboration routing keeps corroboration_request input and corroboration_result output evidence distinct, while dispatch contracts separate mandatory executor-facing fields from optional disclosure or /overlay fields.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: corroboration_dispatch_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- corroboration_request
- corroboration_result
- executor-facing
- mandatory for correctness
- optional disclosure
- /overlay
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-020 - UI Behavior And Route Reconciliation

```yaml
plan_unit_id: DR-020
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: UI /behavior docs need owner-defined operational policy before consumer summaries can be canonical, and route reconciliation updates owner docs before consumers consume the canonical route/object model.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: ui_behavior_and_route_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0006
preserved_exact_tokens:
- UI `/behavior` docs
- owner-defined operational policy layer
- blocked-episode `gap-005` cleanup
- Tools
- /chat/usage
- Route reconciliation
- /object
- page-local identity rules
negative_constraints:
- Consumer pages must not invent /object or page-local identity rules as peer canon.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-021 - Assistant Worktree Owner Routes

```yaml
plan_unit_id: DR-021
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: assistant-chat-design owns assistant worktree binding, seglog events, commands, settings, merge-back flow, and pre-merge test gate, while GitHub_Integration and storage-plan own SC accordion and owner_thread_id boundaries.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: assistant_worktree_owner_routes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0008
preserved_exact_tokens:
- Thread worktree binding model (1:1)
- 11 seglog events
- chat.thread_worktree_*
- 6 commands
- cmd.chat.worktree.*
- 10 settings keys
- Merge-back flow (4 paths)
- Pre-merge test gate
- SC accordion layout
- owner_thread_id
- worktree_record.v1
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-022 - Assistant Worktree Consumer Cross-Refs

```yaml
plan_unit_id: DR-022
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Consumer docs must cross-reference assistant worktree owners rather than redefining canonical tables, enums, field lists, or behavioral rules.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: assistant_worktree_consumer_cross_refs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0008
preserved_exact_tokens:
- Consumer docs MUST cross-reference
- rather than redefining canonical details
- Tables, enums, field lists, and behavioral rules live in the owner doc only
negative_constraints:
- Consumer docs must not redefine canonical assistant worktree details.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-023 - Assistant Chat Dispatcher Owner Route

```yaml
plan_unit_id: DR-023
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: assistant-chat-design owns chat/runtime/question/dispatcher behavior and consumer carry-through points for web, permissions, runtime identity, blocked payloads, and TODO persistence.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: assistant_chat_dispatcher_owner_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0009
preserved_exact_tokens:
- Plans/assistant-chat-design.md
- /runtime/question/dispatcher
- web
- permissions
- runtime identity
- blocked payloads
- TODO persistence
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/assistant-chat-design.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-024 - Assistant Chat Traceability Anchors

```yaml
plan_unit_id: DR-024
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Assistant chat traceability preserves named carry-through anchors, /runtime/question/dispatcher owner seam, /section metadata, and the listed obligation IDs.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: assistant_chat_traceability_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0009
preserved_exact_tokens:
- '## 4'
- '### 7.4'
- '### 8.6'
- '### 13.2'
- '### 27.2'
- /runtime/question/dispatcher
- /section
- obl-036
- obl-037
- obl-042
- obl-048
- obl-008
- obl-040
- obl-041
- obl-043
- obl-059
- obl-060
- obl-061
- obl-062
- obl-064
- obl-068
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-025 - Index-Only ID Lists

```yaml
plan_unit_id: DR-025
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Plans may include index/list material for event kinds, UI command IDs, or tool IDs, but must not redefine schemas owned elsewhere.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: index_only_id_lists
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0009
preserved_exact_tokens:
- event kinds
- UI command IDs
- tool IDs
- MUST NOT redefine schemas owned elsewhere
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2'
negative_constraints:
- Index-only lists must not redefine schemas owned elsewhere.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-026 - Forbidden Drift Patterns

```yaml
plan_unit_id: DR-026
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Plan requirements forbid TBD, Open question, ask later, vague unmeasurable adjectives, and duplicated provider CLI details outside Provider SSOT.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: forbidden_drift_patterns
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0010
preserved_exact_tokens:
- TBD
- Open question
- ask later
- robust
- graceful
- secure
- Duplicating provider CLI details
- Provider SSOT
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
negative_constraints:
- Vague requirements without measurable behavior are forbidden.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-027 - ContractRef Required Keywords

```yaml
plan_unit_id: DR-027
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Any statement using MUST, SHALL, REQUIRED, or NEVER must include at least one ContractRef line.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: contractref_required_keywords
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0011
preserved_exact_tokens:
- MUST / SHALL / REQUIRED / NEVER
- ContractRef:` line.
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-028 - ContractRef Taxonomy

```yaml
plan_unit_id: DR-028
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Allowed ContractRef categories are SchemaID, ContractName, Primitive, ToolID, EventType, ConfigKey, PolicyRule, UICommand, Invariant, and Gate.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: contractref_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0012
preserved_exact_tokens:
- SchemaID:<id>
- ContractName:<path>#<anchor>
- Primitive:<name>
- ToolID:<id>
- EventType:<type>
- ConfigKey:<key>
- PolicyRule:<id>
- UICommand:<id>
- Invariant:<id>
- Gate:<id>
- 'ContractRef: Primitive:DRYRules'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-029 - Operational Requirement Annotation Rule

```yaml
plan_unit_id: DR-029
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Every operational requirement must have at least one ContractRef, detected deterministically by MUST, MUST NOT, SHALL, REQUIRED, or NEVER, while preserving the path-plus-anchor example format.
gui_related: true
gui_classification_reason: This unit governs user-visible routing, display, command, or UI documentation boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: operational_requirement_annotation_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0013
preserved_exact_tokens:
- <a id="7"></a>
- Every operational requirement MUST have at least one `ContractRef:`
- MUST
- MUST NOT
- SHALL
- REQUIRED
- NEVER
- ContractName:<path>#<anchor>
- 'ContractRef: ContractName:Plans/Progression_Gates.md#GATE-009'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/Contracts_V0.md#AuthState'
- 'ContractRef: Gate:GATE-009, ContractName:Plans/Progression_Gates.md#GATE-009'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-030 - Packet-Fidelity Semantic Matching

```yaml
plan_unit_id: DR-030
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: VERIFIER packet preflight and SCRIBE self-check strip standalone ContractRef lines, normalize CRLF/LF, whitespace, and blank lines, and must not weaken ContractRef enforcement in run-gates or other plan-quality gates.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: packet_fidelity_semantic_matching
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0014
preserved_exact_tokens:
- VERIFIER packet preflight
- SCRIBE self-check
- ContractRef:` on both the packet-text side and the file-text side
- CRLF to LF
- Collapse 3+ blank lines to 2 blank lines
- MUST NOT weaken ContractRef enforcement
- 'ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2'
negative_constraints:
- Packet-fidelity matching must not weaken ContractRef enforcement in run-gates or any other plan-quality gate.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-031 - Reference Style

```yaml
plan_unit_id: DR-031
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: References should prefer canonical files/anchors and stable anchors over inline duplication or unstable heading slug references.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: reference_style
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0015
preserved_exact_tokens:
- Prefer referencing canonical files/anchors
- Prefer stable anchors
- <a id="..."></a>
- 'ContractRef: Primitive:DRYRules'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-032 - No Unreferenced Operational Text

```yaml
plan_unit_id: DR-032
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Operational requirements without ContractRef are non-canonical and must fail the plan-quality gate.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: no_unreferenced_operational_text
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0016
preserved_exact_tokens:
- Operational requirements without `ContractRef:`
- non-canonical
- MUST fail the plan-quality gate
- 'ContractRef: Gate:GATE-009'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-033 - Inline Requirement Tags Are Non-Authoritative

```yaml
plan_unit_id: DR-033
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Inline requirement tags such as Req:FR-001, Req:NFR-001, and Req:REQ-001 are readability-only and do not constitute traceability evidence.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: inline_requirement_tags_are_non_authoritative
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0017
preserved_exact_tokens:
- readability-only and non-authoritative
- Req:FR-001
- Req:NFR-001
- Req:REQ-001
- does NOT constitute traceability evidence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-034 - Authoritative Requirement Coverage

```yaml
plan_unit_id: DR-034
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Authoritative requirement coverage lives only in node shard requirement_refs fields and derived .puppet-master/project/traceability/requirements_coverage.json.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: authoritative_requirement_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0017
preserved_exact_tokens:
- Node shard `requirement_refs` fields
- 'schema: `pm.project-plan-node.v1`'
- .puppet-master/project/traceability/requirements_coverage.json
- SchemaID:pm.requirements_coverage.schema.v1
- Gate:GATE-011
- ContractName:Plans/DRY_Rules.md#10
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-035 - Inline Tag Conflict Rule

```yaml
plan_unit_id: DR-035
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Inline tags must not be the sole traceability mechanism, and when an inline tag conflicts with a node requirement_refs value, requirement_refs is authoritative.
gui_related: false
gui_classification_reason: This unit defines backend/governance DRY behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of DR-001.
- ContractRefs, anchors, examples, negative constraints, compatibility notes, stale/retired dispositions, and owner boundaries from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_rule_drift
reasoning_tier: standard
context_scope: dry_rules_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: inline_tag_conflict_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0017
preserved_exact_tokens:
- Inline tags MUST NOT be used as the sole traceability mechanism
- requirement_refs
- MUST be treated as authoritative
- 'ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10'
negative_constraints:
- Inline tags must not be used as the sole traceability mechanism.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/DRY_Rules.md
```

### DR-001 - DRY Rules Source-Preserving Bridge Retired

```yaml
plan_unit_id: DR-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: The former DRY Rules source-preserving bridge is retired in place after Phase 2B atomized or structurally dispositioned DRY_Rules-S0001 through DRY_Rules-S0022 into DR-002 through DR-035, explicit structural coverage, and retired bridge lineage. DR-001 remains only as migration lineage for the retired bridge span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map still preserves S0021 gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DR-001 no longer uses the source-preserving PlanUnit compile hint.
- DR-002 through DR-035 own product coverage for DRY_Rules-S0001 through DRY_Rules-S0017.
- DRY_Rules-S0018, S0019, S0020, and S0022 are structural/reference/migration scaffolding dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:DRY_Rules-S0021
preserved_exact_tokens:
- DR-001
- source_preserving_planunit
- source_preserving_bridge_retired
- DR-002
- DR-035
- DRY_Rules-S0001
- DRY_Rules-S0022
- References
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- Do not remap atomized DRY_Rules spans back to DR-001.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit.
compatibility_only_notes:
- The old source-preserving bridge is retained only so migration lineage and historical references to DR-001 remain auditable.
stale_retired_dispositions: []
owner_boundary_notes:
- DR-002 through DR-035 own product coverage for S0001-S0017.
- S0018, S0019, S0020, and S0022 are structural/reference/migration scaffolding dispositions.
owner_hints:
- Plans/DRY_Rules.md
```
## Migration Coverage

Original hash: `756549fc8dc63007cc2c872f862437c90b33d06d34a1d2cd9df5f0686d977232`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`

Phase 2B batch 049 atomized `DRY_Rules-S0001` through `DRY_Rules-S0017` into `DR-002` through `DR-035`, structurally dispositioned `DRY_Rules-S0018`, `S0019`, `S0020`, and `S0022`, and retired `DR-001` as migration-lineage compatibility coverage for `DRY_Rules-S0021`. `Plans/DRY_Rules.md` now has no residual source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
