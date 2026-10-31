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

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into DRY Rules owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### DR-036 - DRY Owner Route Fallback And Disabled Boundary

```yaml
plan_unit_id: DR-036
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  When the DRY Method cannot resolve an owner/source route, exploratory chat may continue only with a visible caveat
  and receipt state caveated_owner_unresolved. Canonical or implementation-changing mutation must block, ask, or record
  a bounded open item with blocked_owner_unresolved rather than silently proceeding. When the user sets
  `app.agent_rules.dry_method_default_guard` to disabled_by_user, PM disables only the default DRY guard and
  DRY-specific caveat/block behavior; explicit instructions, safety, secrets, source authority, governance phase
  boundaries, permissions, and source-control hygiene remain binding.
gui_related: false
gui_classification_reason: Defines DRY rule fallback and disabled-state semantics rather than visual presentation.
depends_on: [ARC-036, CV-299]
unblocks: [DP-063, ATS-018]
acceptance_criteria:
  - Exploratory unresolved-owner/source routes are caveated and receipted, not represented as confirmed owner reuse.
  - Canonical or implementation-changing unresolved-owner/source mutation blocks, asks, or records a bounded open item.
  - disabled_by_user state does not weaken non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY fallback and disabled-state fixtures
risk_class: dry_method_fallback_boundary_drift
reasoning_tier: high
context_scope: dry_method_rules_fallback
implementation_surfaces:
  - Plans/DRY_Rules.md
  - future rules application
node_compile_hint:
  mode: dry_method_fallback_disabled_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-fallback-disabled-boundary
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-004
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0077, atom-0083]
preserved_exact_tokens:
  - "owner/source route"
  - "exploratory chat"
  - "visible caveat"
  - "caveated_owner_unresolved"
  - "canonical"
  - "implementation-changing mutation"
  - "blocked_owner_unresolved"
  - "disabled_by_user"
negative_constraints:
  - Do not silently proceed with canonical or implementation-changing mutation when owner/source route is unresolved.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
  - Plans/agent-rules-context.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime DRY rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f265ed0e6287bed7e8ddb7cc`: the reference implementation path for text-normalization checks is `scripts/pm-plans-verify.py lint-contractrefs` for owner/ContractRef integrity and the DRY normalization algorithm embedded in `Plans/DRY_Rules.md` Section 7.1. CI/local enforcement is through `python3 scripts/pm-plans-verify.py run-gates`; future extraction to a dedicated script must preserve the same six-step algorithm.

## PMConcept7 Home Workspace owner boundary — 2026-08-04

Amended 2026-10-09 (DL-180, DL-181): Home is now one universal panel system and the
terminal one session per tab, so the owners below are restated for panels and tabs.
The per-surface owners of 2026-08-04 (four editor panels, the Dashboard surface,
terminal sections and workgroups, the movable chat) retire with that model. The
2026-08-04 sentence "U10 interaction behavior is a reusable interaction vocabulary
only" is replaced by DR-066: the panels and the Usage widget board share one gesture
kit. The panel and tab grammar is DR-065's, the overlay root DR-067's and the opening
module DR-071's. The ban on a second Home state machine and the one-change-set rule
stand.

Amended 2026-10-10 (DL-186): every dashboard tab's board is a board of the one Usage
board engine, kept per project under `widget_layout:v1:<project_id>:<board_id>`
(WS-030), so the widget board the panels share their gesture kit with is the same
engine on the Usage page and in every dashboard tab, with one settlement (WS-019).

`Plans/FinalGUISpec.md` owns Home shell composition, the panel model and its tab
kinds (F3-630 to F3-639, the terminal tab F3-640 to F3-646), visible movement and
resize behavior, and web/native capability disclosure.
`Plans/home_workspace_layout_v2.schema.json` and `Plans/storage-plan.md` (SP-330) own
the layout record, persistence scope, revisions, migration, validation, and
off-screen recovery; the v1 schema `Plans/home_workspace_layout.schema.json` is a
read-only migration input. `Plans/UI_Command_Catalog.md`,
`Plans/Contracts_V0.md`, `Plans/event_family_registry.json`,
`Plans/UI_Wiring_Rules.md`, and `Plans/Wiring_Matrix.production.json` own command,
event, and wiring contracts. `Plans/FileManager.md` owns file-path realization and
the file tree's opens (F-090), which go through the one opening module (F3-634,
DR-071); `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the terminal session,
its identity and its life, one session per terminal tab (SMPFS-180), while a
terminal tab's place among the panels and every panel limit belong to the panel
model (F3-630, F3-635); `Plans/Widget_System.md` owns Dashboard widget hostability
and widget layout, each dashboard tab's board in its own namespace (WS-030).
Consumers cite these owners and do not re-declare the layout field shape or create
a second Home state machine.

U10 interaction behavior is shared, not only borrowed: since DL-180 the panels and
the Usage widget board move with one gesture kit, owned by DR-066. The kit carries no
layout model. It does not transfer widget commands, widget hostability, the widget
grid's order or geometry, or Dashboard widget state into the Home workspace, and the
snapping widget grid lays out widgets only, inside dashboard tabs in the home centre.
A Home command/contract change must update the owner, its consumer references, the
production wiring row, and the traceability artifact in one change set.

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/DRY_Rules.md#DR-066, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Widget_System.md#WS-030

<a id="shared-runtime-service-registry"></a>
## Shared Integration Runtime DRY service registry — 2026-08-13

`Plans/Shared_Integration_Runtime.md` owns the shared mechanics behind the following
service names. Consumers reuse these exact names and delegate domain policy to the
listed owner; they do not create feature-local peers, convenience facades, or
compatibility services for the same responsibility.

| Canonical shared service | Shared-runtime responsibility | Delegated owner boundary | Prohibited peer names or roles |
|---|---|---|---|
| `InstallationResolver` | Exact-target discovery resolution and proof classification | BinaryLocator owns discovery evidence; Release Supply Chain owns provenance; provider owners own the provider-CLI first-acquisition rule | `ProviderInstallationResolver`, feature-local installation resolver |
| `InstallationLifecycleManager` | Consented install/update/repair/rollback mechanics and recovery | Provider owners retain acquisition policy; Multi-Account retains authentication; Storage retains migration | Feature-local lifecycle manager or updater |
| `CapabilityProvisioner` | Non-provider `Off`/`Auto`/`On` provisioning execution | Tools owns capability policy and registries; Permissions and Release Supply Chain independently authorize | `ProgressiveCapabilityRegistry` as a runtime service, provider-CLI auto-installer |
| `EnvironmentConnectionSupervisor` | One fenced transport supervisor per exact Environment | Domain owners retain domain data and synchronization truth; Multi-Account retains auth policy | `DomainSyncCoordinator`, global connection singleton, feature-local reconnect manager |
| `ThreadCommandOutbox` | Durable ordered logical commands, idempotency, retry, and acknowledgement refs | Assistant Chat and Goal owners retain command semantics; Storage owns persistence | Per-surface outbox, `ThreadProjectionStore` as a command owner |
| `ProjectionReplayCoordinator` | Cursor replay/snapshot selection, live-before-replay buffering, and fenced convergence | Storage owns retained history and snapshots; each domain owns its projection | `ReplaySnapshotCoordinator`, per-page replay coordinator |
| `StreamCoalescer` | Adaptive presentation batching without dropping canonical events | Event and domain owners retain canonical ordering and durability | Feature-local token/progress coalescer that changes canonical history |
| `RuntimeResourceGovernor` | Shared policy/admission with enforcement on the exact Execution Host | Run Modes and domain owners provide policy inputs; the host enforces effective limits | `ResourceGovernor`, per-feature scheduler/admission governor |
| `ObservableWork` | Shared truthful phase, wait, progress, cancellation, and outcome projection | Domain owners retain operation semantics and terminal evidence | Feature-local work/progress state machine or spinner-as-truth |
| `LeaseCoordinator` | CAS, generation, expiry, fencing, and reconciliation for shared lease types | Worktree, testing/debug, MCP, Browser, and resource owners retain domain cleanup and authority | `WorktreeProvisioner` as lease owner, per-domain generic lease coordinator |
| `OperationalAwarenessService` | Bounded freshness-labeled correlation of owner projections | Every source domain retains truth and mutation authority | Operational-awareness store that becomes a domain authority |
| `DebugSessionBroker` | Durable DebugSession identity, topology binding, lease, generation, and recovery | Testing/Debug owns DAP protocol and `cmd.run_debug.*` semantics | Generic `DebugSession` command owner, feature-local DAP lifecycle broker |
| `EvalSessionBroker` | Persistent sandboxed EvalSession lifecycle, topology binding, lease, and recovery | Tools owns Eval policy and supported adapters; security owners retain filesystem, network, and permission policy | Hidden global kernel, feature-local Eval lifecycle broker |
| `ProviderDispatchAdmissionService` | Single-use pre-network admission over immutable final provider request bytes | Prompt Pipeline, Permissions, FileSafe, Multi-Account, readiness, and budget owners remain independent decision authorities | Adapter-issued permit, `PacketAdmissionReceipt`, `ImmutableDispatchIntent`, or second provider-permit family |
| `ConditionalRuleEngine` | Versioned conditional-rule matching, bounded intervention, and suppression mechanics | Prompt Pipeline owns prompt/context policy; Permissions retains authority | `TimeTravelRuleEngine`, thread-rewind or restore-point engine |
| `BackSeatDriverService` | Isolated, non-blocking, read-only BSD assignment and evaluation lifecycle | Goal, Chat, Usage, Settings, and provider owners retain their respective policy and presentation | Per-surface BSD service or mutation-capable advisor |

Packet candidate roles that are absent from the table remain with their existing
domain owners: stable-prefix planning belongs to Prompt Pipeline;
progressive capability registries and typed recovery envelopes belong to Tools;
LSP write coordination belongs to LSP Support; MCP lifecycle belongs to MCP
Integration; Browser sessions belong to the PM-native Browser owner; worktree
provisioning belongs to Worktree/Git; and authentication belongs to Multi-Account
and provider owners. A value type such as `ToolRecoveryEnvelope` is not a service.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#15.2, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Multi-Account.md

### Shared-runtime command-name normalization boundary

DRY normalization does not register commands or aliases. Packet candidate names
resolve only through the command owner as follows:

| Packet candidate or generic role | Canonical normalization/disposition |
|---|---|
| `cmd.lsp.server.restart` | Rejected candidate; use `cmd.lsp.restart_server`. |
| `cmd.lsp.server.diagnose` | Compatibility intent; use `cmd.lsp.open_problems`. |
| `cmd.debug.session.start` | Normalize to `cmd.run_debug.start`. |
| `cmd.debug.session.stop` | Normalize to `cmd.run_debug.stop`. |
| `cmd.debug.session.action` | Rejected generic action; select the exact existing `cmd.run_debug.*` verb. |
| `cmd.worktree.provision` | Normalize to `cmd.git.worktree.create`; a thread-scoped caller may use only the existing thread wrapper. |
| `cmd.worktree.release` | Normalize to `cmd.git.worktree.release`. |
| `cmd.context.receipt.open` | Normalize to `cmd.nav.open_subject` for a document/artifact subject, or to `cmd.nav.open_usage_subject` only for event-backed Usage/Ledger identity carrying stable `usage_event_ref`; current PMConcept7 aggregate provider/account/panel cards stay local. |
| `cmd.remote.reconnect` | Retained exact-`ExecutionEnvironmentId` compatibility wrapper over canonical `cmd.environment.reconnect`; it owns no peer lifecycle. |

The 26 generalized Environment, outbox, installation, Eval, MCP, resource, BSD,
and related commands are registered only by `Plans/Commands_System.md` and
`Plans/UI_Command_Catalog.md`. This DRY registry does not create or alias them.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#15.1, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md

### Unresolved schema and Event Authority boundary

`Plans/shared_runtime_contracts.schema.json` currently materializes only its closed
root definitions. Its `x-puppet-master-blocked-definitions` entries remain
non-implementation-ready identity skeletons until their owning lifecycle enums are
adjudicated. This DRY registry neither fills those enums nor creates a peer schema.

The Event Authority denominator remains `UNKNOWN_OPEN`. No event family is inferred,
registered, or declared emitted from a service name in this registry. Producers use
receipts/projections that already have owner-approved contracts, or remain
non-emitting until individual Event Authority adjudication.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/shared_runtime_contracts.schema.json, ContractName:Plans/event_family_registry.json, ContractName:Plans/storage-plan.md

### DR-037 - Shared Runtime Service Name And Delegation Registry

```yaml
plan_unit_id: DR-037
unit_type: owner_boundary
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: The sixteen Shared Integration Runtime service names are the sole reusable shared-runtime roles; consumers delegate domain policy to existing owners, reject feature-local peers, and normalize packet command candidates through canonical command owners without creating commands or events.
gui_related: false
gui_classification_reason: This unit governs backend service reuse, ownership delegation, and command-name normalization rather than visual presentation.
split_recommended: false
depends_on: [SIR-001]
unblocks: [SIR-012]
acceptance_criteria:
  - Every service in Shared Integration Runtime section 15.2 appears exactly once with its retained domain-owner boundary.
  - Packet candidate peer roles are either normalized to a canonical service or returned to a named domain owner.
  - LSP, DAP, worktree, context, and remote-wrapper candidates normalize exactly as the command-owner canon specifies.
  - The registry creates no command, alias, event family, schema peer, WorkNode, NodeSeed, or executable queue.
  - Blocked shared-runtime schema definitions and the UNKNOWN_OPEN Event Authority denominator remain explicit gaps rather than inferred closure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py lint-path-refs
risk_class: shared_runtime_parallel_owner_drift
reasoning_tier: high
context_scope: shared_runtime_dry_registry
implementation_surfaces:
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: shared_runtime_service_name_and_delegation_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Shared_Integration_Runtime.md#15.2
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/08_GUI_PLAN_COMMAND_WIRING_DRY_SCHEMA_EVENTS.md#DRY-services
preserved_exact_tokens:
  - RuntimeResourceGovernor
  - ObservableWork
  - ProviderDispatchAdmissionService
  - cmd.lsp.restart_server
  - cmd.run_debug.*
  - cmd.git.worktree.create
  - cmd.remote.reconnect
  - UNKNOWN_OPEN
negative_constraints:
  - Do not create feature-local peers for a canonical shared-runtime service.
  - Do not treat service naming as command, event, schema, permission, or domain-policy ownership.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/Shared_Integration_Runtime.md
```

<a id="usage-candidate-role-dispositions"></a>
## u11 Prism II Usage candidate-role dispositions - 2026-08-18

The u11 Prism II Usage concept proposed eighteen candidate roles. The shared-runtime service registry above
is a sixteen-row table whose closing paragraph already decides the general case: candidate roles absent from
the table remain with their existing domain owners, and a value type is not a service. None of the eighteen
appears in the table, so none is admitted; the registry is not extended and DR-037 remains the registry unit.

Dispositions are `value type` (a field or projection belonging to a domain owner), `already owned` (an
existing owner unit covers it), or `rejected` (the artifact itself must not exist).

| # | Candidate role | Disposition | Stays with |
|---|---|---|---|
| 1 | `UsageEventStore` | already owned | `Plans/usage-feature.md` accounting-record identity and dedupe, plus `Plans/storage-plan.md` persistence |
| 2 | `UsageNormalizer` | already owned | `Plans/usage-feature.md` provider parser and fixture contract, plus `Plans/Contracts_V0.md` adapter contracts |
| 3 | `SettlementResolver` | value type | `Plans/usage-feature.md` settlement field and `Plans/Contracts_V0.md` |
| 4 | `UsageDataQuality` | value type | `Plans/usage-feature.md` GUI projection fields and `Plans/Contracts_V0.md` |
| 5 | `UsageForecast` | value type | `Plans/usage-feature.md` UF-092 |
| 6 | `CapacityProjection` | already owned | `Plans/Goal_Runtime_System.md`; the shared peer for admission is `RuntimeResourceGovernor`, whose prohibited-peer column already names a per-feature admission governor |
| 7 | `RouteReceipt` | already owned | `Plans/Shared_Integration_Runtime.md` `ProviderDispatchAdmissionService`, whose prohibited-peer column already names a second provider-permit family |
| 8 | `CacheReceipt` | value type | `Plans/usage-feature.md` cache envelope and `Plans/Contracts_V0.md` bucket contracts |
| 9 | `TimeBreakdown` | already owned | `Plans/usage-feature.md` UF-091 partitions and `ObservableWork` |
| 10 | `ProviderFamilyUsage` | value type | `Plans/usage-feature.md` rollups and the `Plans/Contracts_V0.md` attribution tuple |
| 11 | `AccountConnectionUsage` | already owned | `Plans/Multi-Account.md` projection display rules |
| 12 | `HelperPurposeGroup` | value type | `Plans/usage-feature.md` UF-090 purpose taxonomy |
| 13 | `GoalCrewUsage` | already owned | `Plans/Goal_Runtime_System.md` and `Plans/orchestrator-subagent-integration.md`; Usage joins by lineage refs |
| 14 | `MaintenanceActivity` | already owned | `Plans/usage-feature.md` UF-091 and the already-registered operational attribution storage family; it is not new |
| 15 | `ContextUsageDetail` | already owned | `Plans/assistant-chat-design.md` context status module and `Plans/Contracts_V0.md` thread usage detail contracts |
| 16 | `UsageWidgetHost` | already owned | `Plans/Widget_System.md`; see below |
| 17 | `RunOutProjection` | rejected | no owner, and the artifact must not exist; see below |
| 18 | `SourceFreshness` | value type | `Plans/usage-feature.md` freshness and health fields, with freshness labelling by `OperationalAwarenessService` |

Net: zero admissions to the shared-runtime service registry.

### `UsageWidgetHost` collides with an existing owner

`Plans/Widget_System.md` already grants Usage widget hostability by name and already owns widget
hostability, layout, and projection inheritance for Dashboard, Usage, and Orchestrator Progress. The DRY
Home boundary above says the same thing for Dashboard: consumers cite that owner and do not re-declare the
layout field shape. A `UsageWidgetHost` service would therefore be a feature-local peer of an existing
owner. What the Usage concept actually needs is a Widget_System unit, and it has one: WS-016 binds the
disclosure mount filter, the empty-room contract, the Usage layout namespace under the WS-009 rule, and the
WS-015 value-state inheritance.

### `RunOutProjection` is rejected outright

There is no canonical run-out, depletion, or exhaustion-date concept anywhere in `Plans/**`, and the Usage
owner's negative constraints already forbid fabricating reset countdowns or remaining quota, requiring
missing reset signals to render unknown rather than a guessed countdown. A run-out date derived from a
month-end cost forecast is exactly such a guess. The role is rejected and the artifact is not created. If a
depletion signal is ever wanted, it must be a provider-evidenced value type under the Usage owner, keyed to
a real reset boundary with its own source class and confidence, rendering unknown in the absence of that
evidence, and never derived from a cost forecast.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md

### DR-038 - Usage Candidate Role Dispositions

```yaml
plan_unit_id: DR-038
unit_type: owner_boundary
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The eighteen u11 Prism II Usage candidate roles produce zero admissions to the sixteen-row shared-runtime
  service registry. Eleven are value types or projections that stay with an existing domain owner, six are
  already owned by a named owner unit, and one, RunOutProjection, is rejected outright because no canonical
  run-out concept exists and the Usage owner's negative constraints forbid the guessed countdown it would
  require. UsageWidgetHost in particular is not admitted because Widget_System already owns widget
  hostability, layout, and projection inheritance for Usage; the Usage need is met by a Widget_System unit,
  not a feature-local host service. This unit records dispositions only: it extends no registry row, creates
  no command, alias, event family, or schema peer, and leaves DR-037 as the registry unit.
gui_related: false
gui_classification_reason: This unit governs backend role ownership and delegation rather than visual presentation.
depends_on: [DR-037, UF-092, WS-016]
unblocks: []
acceptance_criteria:
  - Each of the eighteen candidate roles carries exactly one disposition and names the owner it stays with.
  - No candidate role is added to the shared-runtime service registry table and DR-037 remains the registry unit.
  - UsageWidgetHost is dispositioned to the existing widget owner rather than admitted as a service.
  - RunOutProjection is recorded as rejected, with the artifact itself forbidden rather than reassigned to a new owner.
  - The unit creates no command, alias, event family, schema peer, WorkNode, NodeSeed, or executable queue.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py lint-path-refs
risk_class: usage_role_parallel_owner_drift
reasoning_tier: high
context_scope: usage_candidate_role_dispositions
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: usage_candidate_role_dispositions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - UsageWidgetHost
  - RunOutProjection
  - RuntimeResourceGovernor
  - ProviderDispatchAdmissionService
  - OperationalAwarenessService
  - ObservableWork
negative_constraints:
  - Do not extend the sixteen-row shared-runtime service registry with a Usage candidate role.
  - Do not create a Usage-local widget host, capacity, freshness, or admission service beside an existing owner.
  - Do not create a run-out, depletion, or exhaustion-date projection.
  - Do not treat a value type as a shared service because a concept named it like one.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/Shared_Integration_Runtime.md
```

## PMConcept7 Usage, command, and shared Assistant SSOT addendum - 2026-08-27

The recovered PMConcept7 surfaces remain consumers of existing owners. They do not become a second
architecture layer merely because the concept contains self-contained fixture adapters.

| Concern | Sole current authority | Forbidden parallel authority |
|---|---|---|
| Usage data semantics and view state | `Plans/usage-feature.md` | PM7-local Usage service, provider-management service, or second Usage store |
| Usage/Ledger drill-through | `Plans/Contracts_V0.md` plus `Plans/usage-feature.md`; event-primary callers use `usage_event`/`usage_event_ref`, while a PMConcept7 Ledger attempt row uses `usage_attempt`/`attempt_id`, retains `usage_event_ref` as correlation, and carries no `OpenSubject` | correlation or presentation identity substituted for the selected object id, current PMConcept7 aggregate-card route command, or unregistered object kind |
| Usage/Dashboard widget layout | `Plans/Widget_System.md` plus `Plans/storage-plan.md` namespaces | PM7-local widget store, `dashboard_layout:v1` peer writes, per-frame preview persistence |
| Home shell surface layout | `Plans/home_workspace_layout_v2.schema.json` and `Plans/storage-plan.md` (SP-330); the v1 `Plans/home_workspace_layout.schema.json` is a read-only migration input | Dashboard widget layout inside the Home record (several dashboard tabs are allowed, each board's widget layout in its own per-project `widget_layout:v1:<project_id>:<board_id>` key, WS-030, amended 2026-10-10 by DL-186), concept-only size command/store |
| Command language | `Plans/Commands_System.md` and `Plans/UI_Command_Catalog.md` | PM7 command family, popup/hover commands, duplicate `size_surface` primary command |
| Production wiring | `Plans/Wiring_Matrix.md` and `Plans/Wiring_Matrix.production.json` | concept report or demo event log as production wiring authority |
| Shared Assistant/context | `Plans/assistant-chat-design.md` | second Assistant node, controller, transcript store, context store, or page-local clone |
| UI transaction rules | `Plans/UI_Wiring_Rules.md` | pointer-preview command/event stream or component-local persistence authority |
| Events | existing Event Authority registry and payload owners | fabricated pointer-preview or `context.compaction.*` event family without registry admission |

The PM7 prototype keys and concept events are source-lineage fixtures only. Production adapters must
normalize them into the owner contracts above, and one shared Assistant node must be re-seated rather than
recreated.

Amended 2026-10-09 (DL-180): the Home shell surface layout row now names the v2 Home layout record
(`home_workspace_layout.v2`, SP-330). Its ban stands: no dashboard's widget layout lives in the Home record.
Several dashboard tabs are allowed, each showing one board whose widget layout lives in its own
`widget_layout:v1:dashboard:<board_id>` namespace under WS-030; the Home record holds only the dashboard tab
and its board reference.

Amended 2026-10-10 (DL-186): a board's widget layout lives per project under
`widget_layout:v1:<project_id>:<board_id>` (WS-030), as the table's row now says; the 2026-10-09 per-board key
above was never written. The
person's saved board presets live in the one per-user family `widget_presets:v1`. Dashboards run the one Usage
board engine, so they add no widget-layout authority, store or settlement of their own, and the Home record still
holds only the dashboard tab and its board id.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Widget_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/assistant-chat-design.md

### DR-039 - PMConcept7 One Usage One Command Language And One Shared Assistant Boundary

```yaml
plan_unit_id: DR-039
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'PMConcept7 is a consumer of one Usage authority, one widget-layout authority per canonical host namespace,
  one Home layout schema, one command language, one production wiring matrix, one Event Authority registry, and one shared
  Assistant node/controller/ transcript/context store. Concept adapters, keys, logs, and the size_surface token are source-lineage
  or compatibility inputs only. They cannot become peer stores, services, commands, events, Assistant clones, or production
  wiring authorities; preview state and current PMConcept7 aggregate provider/account/panel inspectors are local. Event-primary
  Usage callers cross the route-command boundary with usage_event/usage_event_ref; a PMConcept7 Ledger attempt row crosses
  it with usage_attempt/attempt_id, retains usage_event_ref plus provider/account/runtime refs as correlation, and carries
  no OpenSubject. Only settled owner commands cross the command/persistence boundary. Since DL-180 the dashboard host
  has one namespace per board: each dashboard tab shows one board whose widget layout lives in widget_layout:v1:dashboard:<board_id>
  (WS-030), which replaces the single widget_layout:v1:dashboard namespace (WS-030 says how the existing layout carries
  over), and no board''s widget layout enters the Home record. The one Home layout schema is pm.home_workspace_layout.v2,
  its record home_workspace_layout.v2 (SP-330); the home_workspace_layout.v1 record is a read-only migration input, converted
  on first read and never reset. Amended 2026-10-10 (DL-186): each board''s widget layout lives per project in widget_layout:v1:<project_id>:<board_id>
  (WS-030), and the 2026-10-09 widget_layout:v1:dashboard:<board_id> was never written; widget_layout:v1:dashboard is
  converted into no board. Every dashboard board runs the one Usage board engine, so dashboards add no widget-layout
  authority, store or settlement, and a person''s saved board presets live in the one per-user family widget_presets:v1.
  QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:'
gui_related: true
gui_classification_reason: The DRY boundary prevents visible state divergence across Usage, Home, Dashboard, and the shared Assistant on different pages.
split_recommended: false
depends_on: [DR-037, DR-038, CS-068, UCC-147, WM-045, UIW-012, DL-180, DL-186]
unblocks: [ACD-448]
acceptance_criteria:
- Usage semantics, widget layout, Home layout, commands, wiring, events, and Assistant state each name one current owner
  and no peer PM7 authority; event-primary callers use usage_event/usage_event_ref and a PMConcept7 Ledger attempt row
  uses usage_attempt/attempt_id with usage_event_ref correlation, while current aggregate inspectors dispatch no command,
  receipt, or domain event.
- Production never writes PM7 fixture keys as a peer to widget_layout:v1:usage, widget_layout:v1:dashboard, or home_workspace_layout.v1.
- Production never writes PM7 fixture keys as a peer to a board's widget_layout:v1:dashboard:<board_id> namespace or
  to home_workspace_layout.v2, and no dashboard board's widget layout is written into the Home layout record.
- 'Amended 2026-10-10 (DL-186): production never writes PM7 fixture keys as a peer to a board''s widget_layout:v1:<project_id>:<board_id>
  or to widget_presets:v1, and every dashboard board runs the one Usage board engine with no store or settlement of its
  own.'
- No primary cmd.workspace_layout.size_surface or PM7 command family is registered.
- No pointer-preview or unregistered context-compaction event family is admitted.
- Every page reuses the same Assistant node/controller/transcript/context store and re-seats it instead of cloning it.
- No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are
  created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_parallel_owner_or_shared_assistant_clone_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_ssot_owner_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (retired PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py (retired PM7 builder; source-lineage-only)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - home_workspace_layout.v1
  - cmd.workspace_layout.size_surface
  - chatPanel
  - chatResizer
  - widget_layout:v1:dashboard:<board_id>
  - home_workspace_layout.v2
  - widget_layout:v1:<project_id>:<board_id>
  - widget_presets:v1
negative_constraints:
  - Do not create a second Usage store, widget-layout store, Home layout store, command language, Event Authority, or production wiring matrix.
  - Do not create a second Assistant node, controller, transcript store, context store, or page-local clone.
  - Do not treat concept fixture logs, keys, or events as production authority.
  - Do not attach OpenSubject to either typed cmd.nav.open_usage_subject selector branch, substitute correlation or presentation identity for the selected object_id, or invent a route kind for aggregate Usage cards; pre-existing artifact route/open source realization remains separately owned.
  - Do not store a dashboard board's widget layout inside the Home layout record or share one widget namespace between two boards.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): one widget namespace per dashboard board (widget_layout:v1:dashboard:<board_id>, WS-030) replaces the single widget_layout:v1:dashboard namespace, and the one Home layout schema is now the v2 record of SP-330 with v1 a read-only migration input."
  - "Amended 2026-10-10 (DL-186): board keys are per project (widget_layout:v1:<project_id>:<board_id>), presets are one per-user family, and dashboards run the one Usage board engine."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
```

## Universal touch-closure and projection-owner addendum - 2026-08-31

Every capability touched by the Settings, Product Onboarding, Guided Tour, Doctor, Server/WAN/Backup, Browser/Capture, SCM/Forge/Origin, plugin, and full-thread-performance wave must have one machine-readable row in `Plans/touch_closure.json`. A row is complete only when it routes one requirement to one canonical owner and PlanUnit, one DRY schema or typed local UI-action contract, one command/handler path where a domain operation exists, all intended GUI consumers in reverse, and named test/evidence and residual-risk boundaries. Paint, typography, animation tokens, hover-overlay presentation, and local disclosure state remain Final GUI/UI-action concerns and must not be promoted into false domain commands.

Settings, Onboarding, Guided Tour, Doctor, and PMConcept7 remain consumers. They may cache and render owner projections, open exact owner routes, and observe `ObservableWork` and receipts, but they cannot duplicate Server, route, backup, Browser, capture, SCM, forge, plugin, Project, Named Plan, installation, authentication, update, storage, or repair state machines. `AuthBrowserSession` is outside agent, adapter, capture, inspection, replay, export, and restore authority. A concept simulation is not a native handler, production wiring receipt, runtime result, or Slint certification.

Amended 2026-10-09 (DL-180): the layout owner's snapshot is now the v2 Home layout record (SP-330), which the tour's workspace chapter captures and restores (PWIZ-035); the dashboard is a tab, so the placement the tour never copies is a dashboard tab's, and the chat is a fixed column the tour never asks the learner to move.

Amended 2026-10-10 (DL-186): the tour's widget step changes the Home dashboard's board, whose widgets live in that board's own per-project key, not in the v2 record (WS-030). The restoration basis therefore also holds the Home board's widgets, taken through the board owner's own snapshot and restored by it; the tour still keeps no copy of its own (PWIZ-035).

The Guided Tour's restoration basis is the layout owner's snapshot, reached only through the bounded checkpoint's snapshot ref (PWIZ-023, PWIZ-035); the tour keeps no second copy of layout, dashboard tab placement, or Chat state, and never composer text. Settings' Run Onboarding Again, Resume Guided Tour, and Replay Guided Tour entries are the route-only consumers `settings.onboarding.run_again`, `settings.guided_tour.resume`, and `settings.guided_tour.replay` (SSYS-019), each with its own touch-closure row; the reset, resume, and replay semantics stay with the Onboarding and Guided Tour owners.

The September 27 packet repairs use the same rule at semantic joins: Named Plan owns child-parent resolution consumed by PRD/Wizard/Compile/Orchestrator; Azure owns the optional team-project official-route context consumed by Onboarding and Auth; Backup owns verification depth and immutable recovery-point selection; Release owns durable app-check scheduling; Testing owns actual-versus-required execution assurance. Reference-only GUI caches, return acknowledgements, matching command names, and opaque preview IDs cannot replace those owner validations. Concept fixtures model the same decisions without claiming production effects. A new exact Git adapter command must register its single owner/request/result/permission/currentness/receipt path and reverse GUI consumers; hunk routes cannot silently stand in for whole-file untracked or binary operations.

The closure validator fails on duplicate command/action IDs, competing owners, orphan controls, command-without-handler, handler-without-command, missing GUI reverse coverage, stale PlanRefs, undocumented local-action exemptions, or incomplete closure dimensions. A row may remain `partial`, `blocked`, or `missing`; it must not be relabeled `implemented` merely because canon, schema, fixtures, PMConcept7 behavior, or browser evidence exists.

ContractRef: ContractName:Plans/touch_closure.json, SchemaID:touch_closure.schema.json, ContractName:Plans/Settings_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

### DR-040 - Universal touch closure and sole-owner projection law

```yaml
plan_unit_id: DR-040
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Every touched system, command, typed local UI action, route, control, setting, and migration has exactly one Touch Closure row connecting requirement evidence, canonical owner and PlanUnit, one DRY contract, one sole handler route, GUI and reverse coverage, availability and disabled reason, events or receipts, ObservableWork, persistence or migration, tests, evidence class, disposition, and residual risk. Consumer GUIs render or route owner state and never create parallel runtimes. Presentation-only behavior remains a typed local UI action or theme/motion token rather than a false domain command, and concept/browser/static evidence never becomes native runtime or Slint certification.
gui_related: true
gui_classification_reason: Governs every visible control's owner route, action type, disabled state, and evidence boundary.
split_recommended: false
depends_on: [DR-039, UIW-012, WM-045]
unblocks: [UIW-013, WM-046]
acceptance_criteria:
  - Plans/touch_closure.json has one unique complete row for every touched command and typed local UI action.
  - Duplicate owners or IDs, orphan controls, missing handler/command direction, missing GUI reverse coverage, stale PlanRefs, and incomplete dimensions fail verification.
  - Paint, typography, motion, hover-overlay, and local disclosure state are not assigned fake domain commands.
  - Static canon, schemas, fixtures, browser concepts, and browser tests retain distinct evidence classes and cannot imply native runtime or Slint certification.
  - Partial, blocked, and missing dispositions retain named residual risk rather than being promoted to implemented.
validation_surfaces:
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_owner_or_false_touch_closure
reasoning_tier: high
context_scope: universal_touch_closure
implementation_surfaces: [Plans/DRY_Rules.md, Plans/touch_closure.json, Plans/touch_closure.schema.json, scripts/pm-touch-closure-verify.py]
node_compile_hint: {mode: touch_closure_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13
  - PM_Onboarding_Doctor_Dependency_and_Work_Correction_2026-08-13
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [ObservableWork, AuthBrowserSession, implemented, already_current_with_evidence, superseded, retired_bakeoff_process_only, partial, blocked, missing]
negative_constraints:
  - Do not infer a native handler or production receipt from a concept simulation.
  - Do not create parallel GUI-owned runtime state machines.
  - Do not invent a command for ephemeral presentation behavior.
  - Do not hide incomplete closure behind an aggregate pass.
owner_hints: [Plans/DRY_Rules.md, Plans/Wiring_Matrix.md, Plans/UI_Wiring_Rules.md]
```

## Touch Closure Exact-Key Addendum - 2026-09-01

### DR-041 - Touch Closure Exact-Key And No-Peer DRY Rule

```yaml
plan_unit_id: DR-041
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Touch Closure extends DR-040 through exact command_id, profile_id, sole_handler,
  schema_ref, and reverse-consumer keys. Each actionable primary command has one
  canonical identity, one typed owner contract, and exactly one sole future-handler
  identity. A compatibility alias normalizes before dispatch to its exact primary
  target and must not receive a peer production row, peer handler, peer schema, or
  peer state machine. Typed local UI actions remain local, blocked tokens remain
  excluded from production wiring, and reverse coverage must use real GUI consumers
  rather than synthetic controls. Both dedicated validators fail closed on drift.
gui_related: true
gui_classification_reason: The invariant prevents duplicate GUI actions, fabricated controls, and divergent command behavior across PMConcept7 consumers.
split_recommended: false
depends_on: [DR-040, C-051, CS-074, UCC-152, WM-051, UIW-017]
unblocks: [CV-326, 0PI-068]
acceptance_criteria:
  - "Every actionable primary command has exactly one canonical command_id, one schema_ref pair, one sole future-handler identity, and at least one intended reverse consumer where GUI-required."
  - "Every alias normalizes to its exact primary target before permission, availability, dispatch, receipt, event, or persistence handling and has no peer production row."
  - "Typed local UI actions use typed owner-local controllers and cannot contain a handlers:: domain identity."
  - "Blocked or rejected tokens have explicit dispositions and no production wiring; synthetic GUI controls cannot satisfy missing reverse coverage."
  - "The server-gap and Touch Closure validators run independently and reject duplicate keys, peer handlers, unresolved schema refs, missing reverse routes, and denominator drift."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_command_handler_schema_or_gui_authority
reasoning_tier: high
context_scope: touch_closure_exact_key_no_peer_rule
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/server_command_gap_adjudication.json
  - Plans/server_command_gap_adjudication.schema.json
  - Plans/touch_closure.json
  - Plans/touch_closure.schema.json
  - Plans/Wiring_Matrix.production.json
  - scripts/pm-server-command-gap-verify.py
  - scripts/pm-touch-closure-verify.py
node_compile_hint: {mode: exact_key_static_dry_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/DRY_Rules.md#dr-040---universal-touch-closure-and-sole-owner-projection-law
  - Plans/Crosswalk.md#c-051---touch-closure-authority-and-consumer-routing
preserved_exact_tokens: [command_id, profile_id, sole_handler, schema_ref, reverse_consumers, no-peer, typed local UI action]
negative_constraints:
  - "Do not register an alias as a second primary command or give it a peer handler or production row."
  - "Do not turn a typed local presentation action into a false domain command."
  - "Do not fabricate controls, handlers, schemas, events, receipts, persistence, or runtime evidence to close a row."
owner_hints: [Plans/DRY_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```

## Project recovery and Forge delete/CI central companion boundary — 2026-09-26

Under DR-040 and DR-041, the seven UCC-165 primaries keep exact keys: one `command_id`, one owner contract set, one `sole_handler`, one `schema_ref` pair, and real `reverse_consumers`. `Plans/Project_System.md#PJCT-007` owns resume semantics, the `creation_recovery_resume_binding` join, and recovery availability; `Plans/Forge_Integrations.md#FGI-021` owns delete/CI semantics, the `official_destination_kind` destinations, and the protected-broker rule. Central companions own row identity only: `Plans/UI_Command_Catalog.md#UCC-165` carries the admission table, `Plans/Wiring_Matrix.md#WM-058` carries production intent, and `Plans/touch_closure.json` carries `TOUCH-PJCT-011` plus `TOUCH-FGI-047` through `TOUCH-FGI-052` under the existing `TCP-PROJECT` and `TCP-FORGE` profiles with `partial` disposition. No new profile, alias, peer row, peer handler, peer schema, EventRecord, or native proof is created here.

Reverse wiring reuses owner routes: Continue Setup dispatches `cmd.project.resume_creation`; Open Repository dispatches the existing `cmd.forge.repository.open_in_browser`; Delete Repository dispatches `cmd.forge.repository.delete`. Neither open nor delete is Project-local mutation, and no synthetic control satisfies reverse coverage. All rows stay `handler_unavailable` with `expected_event_types=[]`; the visible-behavior flags live on the companion units (`gui_related: true` on UCC-165 and WM-058), not on a duplicated product specification. The Commands & Shortcuts local action census remains unadmitted.

ContractRef: ContractName:Plans/DRY_Rules.md#DR-040, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/UI_Command_Catalog.md#UCC-165, ContractName:Plans/Wiring_Matrix.md#WM-058

## Commands Shortcuts local-action namespace ownership — 2026-09-26

`commands.*` is a Commands-owned typed local-action namespace (CS-081: `commands.create`, `commands.update`, `commands.delete`, `commands.preview`, `commands.import_preview`, `commands.import_commit`, `commands.export`, `commands.reset_all`). Only `Plans/Commands_System.md` may add or retire IDs under it; no other doc, catalog, wiring row, or User Command may mint, alias, or rebind them; no `cmd.*` spelling may shadow them; and the retired `commands.save_new`/`commands.save_override`/`commands.save_existing` spellings MUST NOT be reused.

Classification: DR-041's "typed local UI actions use typed owner-local controllers and cannot contain a handlers:: domain identity" governs reversible-presentation local UI actions (the `settings.*` presentation set). The `commands.*` file actions are owner-local actions with persistent filesystem effects and exact DR-040 keys — one action ID, one owner contract, one sole native owner handler (`handlers::commands::apply_local_action`), availability with the closed disabled-reason set, and real reverse consumers — so they name their handler without becoming `cmd.*` primaries and without gaining catalog or production rows. Preview stays inert with no read, shell, ask-flow, permission evaluation, or dispatch.

This section supersedes the UCC-165-batch note that the census remains unadmitted: central companions now admit it as `TOUCH-CMDSC-001` through `TOUCH-CMDSC-016` under profile `TCP-CMDSC` (`partial`), the `commands-shortcuts` descriptor's `owner_local_action_refs`, and the UCC-166/WM-059 reference companions. No EventRecord, native handler, or runtime is claimed.

### DR-042 - Commands Local-Action Namespace Ownership

```yaml
plan_unit_id: DR-042
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  commands.* is a Commands-owned typed local-action namespace (CS-081: commands.create,
  commands.update, commands.delete, commands.preview, commands.import_preview,
  commands.import_commit, commands.export, commands.reset_all). Only
  Plans/Commands_System.md may add or retire IDs under it; no other doc, catalog,
  wiring row, or User Command may mint, alias, or rebind them; no cmd.* spelling
  may shadow them; and the retired commands.save_new, commands.save_override, and
  commands.save_existing spellings MUST NOT be reused. These owner-local file actions
  carry exact DR-040 keys with sole native owner handler
  handlers::commands::apply_local_action, gain no catalog or production row, and keep
  preview inert.
gui_related: true
gui_classification_reason: The invariant fixes every Commands and Shortcuts manager control to its owning local action, Settings route, or view-only classification with no duplicate command identity.
split_recommended: false
depends_on: [DR-040, DR-041, CS-081, UCC-166, WM-059]
unblocks: []
acceptance_criteria:
  - "The namespace admits exactly the eight CS-081 commands.* IDs; no ninth action and no cmd.* shadow spelling exists."
  - "Only Plans/Commands_System.md adds or retires IDs under commands.*; retired commands.save_* spellings are never reused."
  - "Owner-local file actions name sole handler handlers::commands::apply_local_action with persistent filesystem effects; reversible-presentation local UI actions carry no handlers:: identity."
  - "No commands.* action has a catalog row or production wiring row; rejected cmd.commands.custom.*, cmd.shortcuts.*, cmd.user_command.*, and cmd.keybinding.* spellings stay rejected."
  - "Preview substitutes sample arguments only with inert placeholders and no read, shell, ask-flow, permission evaluation, or dispatch."
validation_surfaces:
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_command_handler_schema_or_gui_authority
reasoning_tier: high
context_scope: commands_local_action_namespace_ownership
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/touch_closure.json
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/settings_system_contract_fixtures.json
node_compile_hint: {mode: exact_key_static_dry_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-081
  - Plans/commands_shortcuts_contracts.schema.json
  - reports/packet-integration-completion-20260926/commands-shortcuts.md
preserved_exact_tokens: [commands.create, commands.update, commands.delete, commands.preview, commands.import_preview, commands.import_commit, commands.export, commands.reset_all, handlers::commands::apply_local_action, commands.save_new, commands.save_override, commands.save_existing, TOUCH-CMDSC-001, TOUCH-CMDSC-016, TCP-CMDSC, owner_local_action_refs]
negative_constraints:
  - "Do not mint, alias, or rebind a commands.* ID outside Plans/Commands_System.md."
  - "Do not give a commands.* action a catalog row, production row, or cmd.* primary spelling."
  - "Do not present preview as reading, executing, asking, or dispatching."
  - "Do not fabricate controls, handlers, schemas, events, receipts, persistence, or runtime evidence to close a row."
owner_hints: [Plans/DRY_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-040, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/Commands_System.md#CS-081, ContractName:Plans/UI_Command_Catalog.md#UCC-166, ContractName:Plans/Wiring_Matrix.md#WM-059

## Chat transcript presentation single owners — 2026-09-27

The rebuilt chat transcript (DL-104 through DL-108) adds rules that must live in one place each.

### DR-043 - Chat Transcript Presentation Single Owners

```yaml
plan_unit_id: DR-043
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'The map from message type and runtime card kind to transcript family has exactly one owner, ACD-469;
  the chat, its projections and any port consume it and never restate it. The accent budget is a theme-token role rule
  owned with the theme tokens (ACD-469, FinalGUISpec section 6); surfaces pick token roles and never hard-code an accent
  choice. Motion voices are per theme family tokens (ACD-475) with no per-view or per-theme override setting. Chat sound
  cues, the onboarding and Guided Tour cues and the NieR Mode parts'' menu sounds use the Notifications & Sounds owner''s
  mapping, switch, assets and one player (UCC-103, F3-564, F3-599); the chat, onboarding, the Tour and the NieR Mode
  parts have no local sound registry, volume, setting or second player. The busy-send default is read from general.interaction.queue-behavior
  only. The assistant-turn presentation vocabulary (segment roles, subject statuses, terminal states) is defined once
  in EP-128; other owners, including collaboration runs, reference it and do not redefine it. Amended 2026-10-29 (O3–O6,
  S3/S4; PM7): Pip setup voice/music and app chirps are parts, not separate sound keys/players. Live synthesis recipes
  register with the one Notifications & Sounds player/library and master switch. Retro has distinct Light/Dark kits;
  no approved music re-key. Loader periods are family-owned (F3-662), not per-view overrides. DL-259, Jared 2026-10-31:
  ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode through the Settings owner,
  with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars reflect the same effective
  state. Every opened onboarding question tip and prose help section has useful Plain English and technical versions,
  including FileSafe, service differences, storage, remote access and AI/auth choices, assuming no coding experience.
  Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy is limited to tips/help
  (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. Q1 B, Jared 2026-10-31: the shared
  Pip voice, say and vocals everywhere Pip speaks, sends 0.35 after trim and pan into its look’s room; Glass uses 0.30
  and NieR 0.16. Each look uses its one per-look kit room, registered before the first shared voice in every host, with
  no stacked rooms. These restore the old voice’s own sends. Loudness remains within approximately 0.4 dB. The existing
  preference, gesture and sound owner still gates playback.'
gui_related: true
gui_classification_reason: "Fixes single owners for chat presentation rules."
split_recommended: false
depends_on: [ACD-469, ACD-475, EP-128, UCC-103]
unblocks: []
acceptance_criteria:
- No second family map, accent rule, voice setting, chat, onboarding, tour or NieR sound registry, sound player or queue
  default exists.
- Other owners reference EP-128's vocabulary instead of redefining it.
- 'DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars
  reflect the same effective state. Every opened onboarding question tip and prose help section has useful Plain English
  and technical versions, including FileSafe, service differences, storage, remote access and AI/auth choices, assuming
  no coding experience. Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy
  is limited to tips/help (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. Q1 B, Jared 2026-10-31: the shared
  Pip voice, say and vocals everywhere Pip speaks, sends 0.35 after trim and pan into its look’s room; Glass uses 0.30
  and NieR 0.16. Each look uses its one per-look kit room, registered before the first shared voice in every host, with
  no stacked rooms. These restore the old voice’s own sends. Loudness remains within approximately 0.4 dB. The existing
  preference, gesture and sound owner still gates playback.'
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: chat_presentation_owners
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-104"
  - "Plans/Decision_Log.md#DL-107"
preserved_exact_tokens:
  - "ACD-469"
  - "EP-128"
  - "general.interaction.queue-behavior"
negative_constraints:
  - "Do not restate the family map outside ACD-469."
  - "Do not add a chat-, onboarding-, tour- or NieR-local sound or motion registry, or a second sound player."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/Executor_Protocol.md#EP-128

## Wand module presentation grammar single owner — 2026-09-27

The redesigned wand popups and their in-chat presence add a presentation grammar that must live in one place, beside the chat transcript owners of DR-043.

### DR-044 - Wand Module Presentation Grammar Single Owner

```yaml
plan_unit_id: DR-044
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The wand modules' presentation grammar has exactly one GUI owner, FinalGUISpec F3-566 with F3-567 through
  F3-577, F3-592, F3-594, F3-595, F3-601 and F3-602: the configuration sheet anatomy, sizes and yield rules, the
  plate and the cast plate (its floor and wrap, with the shared parts DR-045 names), kind marks and the agent
  puppets (one puppet primitive draws every agent everywhere, DL-149), run card budgets and width tiers, the
  one-line receipt, the dock, the one-line reply traces and the run view as a run tab in a home panel (ACD-480,
  F3-635). Every implementation builds these from one shared set of primitives; a module owner supplies content
  only and never forks or restyles a primitive. Every module's finished trace uses the one receipt grammar, and
  time, cost and token phrases each come from one shared formatter (there is no stand-in phrase, DL-121), with
  one time-zone implementation for the app. Behaviour stays with the module owners (Collaborative_Workflows,
  Back_Seat_Driver, Scheduling_and_Quota_Resume, assistant-memory-subsystem, assistant-chat-design). DR-043's
  owners stand: the transcript family map is ACD-469's and the accent budget is a theme-token role rule, and the
  assistant-turn vocabulary is EP-128's. The wand grammar consumes them and never restates them, and DR-043's
  owners do not restate this grammar. Amended 2026-10-29 (X1, PC1–PC5; PM7): Pip redraws the one agent primitive
  (F3-594), no second legacy puppet or Classic preset. Small robot denotes the agent category only, never an
  alternate figure. Sheet hosts and empty marks use this kit rather than layered replacements. QA round 2, Jared
  2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming starts only from an actual control inside its
  affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words,
  empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same
  feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner
  on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no
  per-sheet hover engine.
gui_related: true
gui_classification_reason: "Fixes one owner for the wand modules' presentation grammar."
split_recommended: false
depends_on: [DR-043, F3-566, DL-109, DL-180]
unblocks: []
acceptance_criteria:
  - "No second sheet grammar, receipt grammar, dock or time formatter exists for a wand module."
  - "No wand-module owner restates the family map, the accent rule or EP-128's vocabulary."
  - "The run view opens as a run tab in a home panel through the one opening module (F3-635, DR-071), with the grammar above unchanged."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming starts only from an actual control inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.0, 4.3 (A2-14), 7.14"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/COORDINATION.md (SHA-256 0bbcd8a1649f0e90dd93a5a18966c7a344442a8a99d1bb714afe91f8d168f076)"
  - "CANON-PLAN coordination item DR-044"
preserved_exact_tokens:
  - "F3-566"
  - "DR-043"
  - "ACD-469"
  - "EP-128"
  - "one receipt grammar"
negative_constraints:
  - "Do not restate the wand modules' grammar in a module owner."
  - "Do not restate the family map, the accent rule or EP-128's vocabulary in the wand grammar."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the run view is a run tab in a home panel (F3-635), no longer an editor document; the wand grammar is unchanged."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/Executor_Protocol.md#EP-128, ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/DRY_Rules.md#DR-071

## Concept web fonts share one set of files — 2026-10-09

PMConcept7 and the 5.6 Pro chat concept embed the same theme web fonts; this rule keeps them from forking the files.

### DR-050 - Concept Web Fonts Share One Set Of Files

```yaml
plan_unit_id: DR-050
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The concepts' embedded copies of the theme web fonts are one set of files. Every face the 5.6 Pro
  chat concept embeds (Inter, Poppins, IBM Plex Mono and JetBrains Mono, each with its unicode-range
  script slices, in Concepts/chat-assistant-concepts/5.6 Pro/styles.css and pmx-system.css) is
  carried byte for byte by PMConcept7's Concepts/onboarding/opus-5.5/src/fonts or, for JetBrains
  Mono, src/settings/nier/fonts, where the same files are NieR Mode's PM NieR Mono;
  src/fonts/SOURCE.md lists each file's source and SHA-256, and 5.6 Pro's NieR faces use those
  same shared files (amended 2026-10-09, DL-161). A concept that adds or changes a shared face
  changes it for both; a missing or changed shared face fails acceptance unless the following
  explicit exception applies. The one dated exception is the full-axis
  Latin upright admitted by F3-644 on 2026-10-16: PMConcept7's JetBrains Mono uses the new 100–800
  file, while PM NieR Mono and the existing 5.6 Pro face retain their old Latin bytes; shared
  non-Latin slices stay identical. F3-644 owns that file choice and its source hash. Which faces
  each theme family uses stays F3-430's; this rule fixes shared-file custody without undoing that
  explicit exception.
gui_related: true
gui_classification_reason: "Keeps the concepts' theme faces identical so both concepts draw the same letters."
split_recommended: false
depends_on: [F3-430, DL-161]
unblocks: []
acceptance_criteria:
  - "Each face 5.6 Pro embeds decodes to a file in Concepts/onboarding/opus-5.5/src/fonts or src/settings/nier/fonts with the same SHA-256, subject only to F3-644's explicit Latin-upright exception."
  - "A missing or changed shared face fails acceptance, subject only to F3-644's explicit Latin-upright exception."
validation_surfaces:
  - "Verify byte-for-byte equality of shared font faces and script slices, allowing only F3-644's explicit Latin-upright exception."
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: standard
context_scope: concept_web_fonts
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/README.md, SHA-256 51df0972bff7f0f909d1cf3438aa1389eaa9e76c3b12b5ac8363814fbded11e4
- Plans/Decision_Log.md#DL-161
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--onboarding--opus-5.5--src--fonts--SOURCE.md,
  SHA-256 76985bc806939e214326c3bfd498e377cb868bfda68ed4b641b24599e57cf97b (source lineage; not native
  certification)
preserved_exact_tokens:
  - "F3-430"
  - "SOURCE.md"
  - "byte for byte"
negative_constraints:
  - "Do not give one concept its own version of a face the other already embeds."
  - "Do not restate which theme family uses which face here; F3-430 owns that."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): The universal same-Latin-bytes statement is qualified by F3-644’s
  full-axis JetBrains Mono delivery; no duplicate terminal embedding is introduced.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-430, ContractName:Plans/Decision_Log.md#DL-161

### DR-045 - One Plate Fit Rule, One Cast Grammar With Its Wrap, One Track

```yaml
plan_unit_id: DR-045
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  How a drawing keeps its place as the rows beside it grow is one shared mechanism, not a fix per sheet (DL-154).
  Every plate slot in a wand-module sheet (the four collaboration kinds' cast plates, Scheduling's plates, Back Seat
  Driver's cue plate) is fitted by one rule: the richest mode that fits at scale 1, never past the slot's floor, the
  leanest drawing that fits the slot's width, with the caption only for a slot no drawing fits (F3-601). Every
  collaboration graph, in a setup sheet and at the head of a run view, is drawn by the one cast grammar of F3-595,
  whose wrap mode is the only way a team too wide for one row is drawn; a kind describes its cast and its mode list and
  never draws its own wrapped or scrolling variant. Every run card's and preview's stop track is the one track
  primitive, whose wrapping of eight or more stops (F3-602) serves every kind; a kind supplies its stops and never caps
  or restyles the track itself. The roster's own overflow (its lean steps, then its scroll with the fade) stays the
  one roster rule of F3-566. DR-044's single owner of the wand grammar stands; this rule names the shared parts the
  owner's growth behaviour lives in.
gui_related: true
gui_classification_reason: "Fixes one shared mechanism for plates, cast graphs and tracks that must stay in view as rows grow."
split_recommended: false
depends_on: [DR-044, DL-154, F3-566, F3-595]
unblocks: [F3-601, F3-602]
acceptance_criteria:
  - "No sheet, kind or run view carries its own plate fitting, wrapped cast drawing or track wrapping."
  - "No kind caps the number of stops on its track below its own limit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-154"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md, SHA-256 46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2"
  - "Concepts/chat-assistant-concepts/5.6 Pro/module-shell.js pmxPlateFit, pmxCastFit and pmxTrack and pmx-system.js fitPlates (concept lineage only)"
preserved_exact_tokens:
  - "DR-044"
  - "F3-595"
  - "one track primitive"
negative_constraints:
  - "Do not give a sheet or a kind its own plate fitting, wrapped graph or track wrapping."
  - "Do not cap a track's stops in a kind below that kind's own limit."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/Decision_Log.md#DL-154, ContractName:Plans/FinalGUISpec.md#F3-601, ContractName:Plans/FinalGUISpec.md#F3-602, ContractName:Plans/FinalGUISpec.md#F3-595

## Plan action row single shared row — 2026-10-09

The Plan card's footer had drifted from the other cards' actions: its Build control was shorter, with smaller type, than the buttons beside it, and the footer drew a tinted band of its own. DL-156 fixes the layout; this rule keeps every Plan surface on the one shared row.

### DR-047 - Plan Actions Use The One Shared Action Row

```yaml
plan_unit_id: DR-047
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Every Plan surface that shows actions draws them with the one action row the wand modules use (F3-566 J-2): the
  transcript Plan card, the plan tab's sticky footer and its More row (F3-635), the compact Completed or Canceled card, a
  Building plan's attention actions, the schedule line's decision and the Build-started receipt. The Build control is
  a boxed primary inside that row, not a control with sizes of its own, and the row's spacing rule treats it as one
  (F3-606). A Plan surface supplies its controls and their order only; it never restates the row's height, type,
  padding or gaps, and it never adds a band, inset or one-off button style. A wait or attention line beside the
  actions uses the same mark column as the schedule line (F3-607). The labels, statuses and eligibility stay with
  Assistant_Plan_Runtime and the schedule line's words with SQR-015.
gui_related: true
gui_classification_reason: "Keeps one action-row grammar for every Plan surface."
split_recommended: false
depends_on: [DR-044, F3-566, DL-156, DL-180]
unblocks: [F3-606]
acceptance_criteria:
  - "No Plan surface defines its own button height, type size, padding or gap for its actions."
  - "The Build control's size comes from the shared row, and the row's spacing treats it as a boxed primary."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: medium
context_scope: chat_plan_card_actions_20261009
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-156"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md, SHA-256 4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d"
preserved_exact_tokens:
  - "F3-566"
  - "F3-606"
  - "action row"
negative_constraints:
  - "Do not give a Plan surface its own action sizes or a tinted footer band."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the plan viewer is the plan tab kind in a home panel (F3-635), so the editor's sticky footer is now the plan tab's; the action row rule is unchanged."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-606, ContractName:Plans/FinalGUISpec.md#F3-607, ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-635

## 5.6 Pro chat round single owners — 2026-10-09

The 5.6 Pro chat round (DL-140 to DL-151) introduced shared presentation pieces that must live in one place each: the neon icon registry, the status set, and the transcript renderer that the subagent live transcript reuses. DR-044 already covers the agent puppets and the cast plate.

### DR-051 - One Icon Registry And One Status Set For The Assistant Chat

```yaml
plan_unit_id: DR-051
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Every icon in the assistant chat is drawn from one icon registry with one drawing per concept (FinalGUISpec
  F3-584, DL-140), and every status is drawn from one set of 22 status keys (F3-658; the chat run-state subset
  is 13, F3-585). The transcript, the composer, thread history, the chat header, the activity bar and Activity
  Detail, the working activity, menus, wand sheets and module cards draw through them; no surface keeps its own
  icon table or status glyphs, and a module mark primitive draws the registry's glyphs rather than its own.
  Roles (control, status, concept), acts, tones and the per-family motion voices are the registry's, not a
  surface's. Theme families and NieR Mode restyle the registry's drawings and never fork them; the capabilities
  wand's colours (F3-588) are the registry's one recorded exception. Provider marks, agent puppets (DR-044,
  F3-594), charts and illustrations are not icons and have their own owners. The composer's Send and Stop is one
  control with one owner (F3-587), never a per-surface variant. Amended 2026-10-17 (DL-228): the chat's 13
  status marks are its run-state subset of the one Puppet Master glyph registry and 22-mark vocabulary that D44
  approved (17 states and 5 file-change marks), owned by F3-658 and Plans/glyph_catalog.json. No surface
  anywhere keeps its own icon table or status glyphs; the Planning Wizard and the Orchestrator may consume the
  registry without adopting it in full; DR-057, DR-065 and DR-069 read through this rule. Amended 2026-10-29
  (A5, X1, G5; PM7): The shared status vocabulary has 22 keys; the chat’s 13 are a subset. Pip faces map to
  these keys; no stopping/mood key. robot and processes are category glyphs, each individual agent is Pip. Typed
  status wins over decorative expression. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q16: You is the
  person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette
  cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You
  express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew
  diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their
  existing meaning. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink
  roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific
  colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon.
gui_related: true
gui_classification_reason: "Fixes one owner each for the chat's icons and its status marks."
split_recommended: false
depends_on: [DR-043, DR-044, F3-584, F3-585, F3-587]
unblocks: []
acceptance_criteria:
  - "No chat surface or module defines an icon table or a status glyph of its own."
  - "A theme family or NieR Mode changes how a registry glyph is drawn, never which drawing names a concept."
  - "Status marks in thread rows, the chat header, the activity bar, To-Dos, plan steps and module cards come from the one set."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-140"
  - "Plans/Decision_Log.md#DL-141"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md, Neon icon family (concept lineage only)"
preserved_exact_tokens:
  - "F3-584"
  - "F3-585"
  - "one drawing per concept"
negative_constraints:
  - "Do not add a surface-local icon table or status glyph."
  - "Do not fork a registry drawing per theme family or for NieR Mode."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-584, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/FinalGUISpec.md#F3-587, ContractName:Plans/DRY_Rules.md#DR-044

### DR-052 - One Transcript Renderer For The Chat And Its Read-Only Child Transcripts

```yaml
plan_unit_id: DR-052
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The subagent live transcript (assistant-chat-design ACD-485, FinalGUISpec F3-593) is drawn by the chat's one
  transcript renderer: the turn mark, the spine, the eight families of ACD-469 and the theme's motion voice (ACD-475)
  are the chat's, not a copy. The live transcript differs only by what the renderer is given: a read-only mount with
  no composer and no mutation control, its own root and view resources (UIW-031), and the child run's records. Its
  stretch rows reuse the working activity's Step Rail (ACD-473) rather than a second rail, and its status words come
  from the child-run status projection (ACD-485). Neither the chat nor the live transcript restates the family map, the
  accent budget or EP-128's vocabulary (DR-043).
gui_related: true
gui_classification_reason: "Keeps the subagent live transcript on the chat's renderer instead of a forked transcript."
split_recommended: false
depends_on: [DR-043, ACD-469, ACD-473, ACD-485]
unblocks: []
acceptance_criteria:
  - "No second transcript renderer, family map or Step Rail exists for the subagent live transcript."
  - "The live transcript's mount has its own root and binds none of the chat's view resources."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-147"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md, Transcript turns: Subagent live transcripts (concept lineage only)"
preserved_exact_tokens:
  - "ACD-485"
  - "Step Rail"
negative_constraints:
  - "Do not fork the transcript renderer or the Step Rail for a child transcript."
owner_hints:
  - Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-485, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/assistant-chat-design.md#ACD-473, ContractName:Plans/DRY_Rules.md#DR-043

## NieR Mode editor, reboot plate, look store and onboarding hero moments single owners — 2026-10-09

DL-152 reaches NieR Mode from four places and DL-153 gives onboarding's hero moments five styles and the first paint the stored look. Each of these must exist once, so the four places and the five styles never grow copies of their own.

### DR-056 - One NieR Adjust Editor, One Reboot Plate, One Look Store And One Set Of Hero Moments

```yaml
plan_unit_id: DR-056
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic,
  Friendly, Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A
  NieR family pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then
  cmd.settings.transaction.apply; no independent NieR switch or command remains. Exactly one NieR row editor
  serves Settings, the title bar, the Guided Tour and onboarding. Preset, part and background lists have one
  owner. Live edits use the existing Project Settings preview/apply pair; onboarding uses its existing
  non-persistent ui.onboarding.choose_look preview and exact commit boundary. The retained local actions
  ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay add no command
  or store. Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it
  uses the standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover.
  Reduced Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local
  rehearsal that changes no setting. One Project look store and one first-paint reader serve all five theme
  families. No app-global or cross-Project copy, independent NieR boolean writer, local-storage hint, second
  Reboot plate or per-surface family selector exists. Hero moments share one trigger, end state, snap and sound
  path through DR-043; five family styles differ in presentation only. Pip keeps the SSYS-056 row editor, shared
  parts/preset registry and Settings owner. Onboarding reads factory/Project Pip parts and has no Pip editor.
  Legacy NieR Mode and Customize NieR Mode labels are source lineage, superseded by Q22.
gui_related: true
gui_classification_reason: "Fixes single owners for the NieR Mode editor, the reboot plate, the look store and onboarding's hero moments."
split_recommended: false
depends_on: [SSYS-043, SSYS-010, F3-468, F3-598, F3-600, DL-152, DL-153, DR-043]
unblocks: []
acceptance_criteria:
  - "One editor, part/preset/background registry, look store and first-paint reader serve all five families."
  - "Live writes use the existing Settings pair and onboarding uses its existing preview/commit boundary."
  - "Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal that changes no setting."
  - "No independent NieR boolean, separate family command, per-surface selector list or second sound player exists."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-touch-closure-verify.py
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-152"
  - "Plans/Decision_Log.md#DL-153"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-next-20261009/JARED-REQUEST-20261009.md, SHA-256 5d4f5b2aa55364c55fb022e4624657b5185e5ea5b316b6108b880dde51a98e48"
preserved_exact_tokens:
  - "NieR Mode"
  - "Customize NieR Mode"
  - "ui.settings.nier_editor.open"
  - "ui.settings.nier_editor.close"
  - "ui.settings.nier_editor.replay"
  - "ui.onboarding.choose_look"
negative_constraints:
  - "Do not build a second NieR Mode editor, preset list, part list or background list for any surface."
  - "Do not draw a reboot plate or transition of a surface's own."
  - "Do not keep a theme copy or paint hint outside the current Project's Settings."
  - "Do not give one family's hero moments a trigger, end state, snap or sound path of their own."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-600, ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/DRY_Rules.md#DR-043

## First paint single reader per page — 2026-10-09

The assistant chat concept gained a first-paint reader of its own (DL-159, F3-612) on the pattern of PMConcept7's boot paint (F3-468, DL-153). DR-056 already keeps one look store that the first paint only reads; a page with two readers would still let the first frame and the rendered page disagree, so one rule covers both pages and the chat's later port.

### DR-054 - One First-Paint Reader Per Page, Reading The Look Owner's Store

```yaml
plan_unit_id: DR-054
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  A page paints its stored look before its first frame through exactly one first-paint reader (F3-468). The look's
  one store and the reader's read-only access are DR-056's; this rule adds only the count. The reader writes nothing
  but the attributes the look owner's first render writes, so the owner rewrites the same values, and no surface on
  the page adds a reader of its own. The assistant chat keeps its reader (F3-612) only while it is a page of its own;
  when it is ported into PMConcept7, PMConcept7's head boot script is the page's one reader and the chat's reader is
  removed rather than kept beside it.
gui_related: true
gui_classification_reason: "Keeps one first-paint reader per page, reading the look owner's store."
split_recommended: false
depends_on: [DL-159, F3-468, F3-612, DR-056]
unblocks: []
acceptance_criteria:
  - "A page has one first-paint reader, and it writes no look setting and no copy of the theme."
  - "The chat ported into PMConcept7 carries no first-paint reader of its own."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: standard
context_scope: chat_fixes_20261009
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-159"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md, First paint: the stored look from the first frame (concept lineage only)"
preserved_exact_tokens:
  - "F3-468"
  - "F3-612"
negative_constraints:
  - "Do not add a second first-paint reader to a page, or a stored or global copy of the theme for one."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/FinalGUISpec.md#F3-612, ContractName:Plans/Decision_Log.md#DL-159, ContractName:Plans/DRY_Rules.md#DR-056

## Left rail presentation single owner — 2026-10-09

The left rail's Polish design (DL-162) is a presentation grammar shared by nine panels with nine different owner documents, so it must live in one place.

### DR-057 - Left Rail Presentation Single Owner

```yaml
plan_unit_id: DR-057
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The left rail's presentation grammar has exactly one GUI owner, FinalGUISpec F3-618 to F3-622 and F3-625 with
  F3-472, F3-473 and F3-480, and F3-623's fit rule for the two Source Control strips: the geometry and radii,
  the shelf tints, the type ladder, the status glyphs and words, plain counts, fitting by layout, the rail
  dropdown style and the motion of each theme family (DL-162). The panel owner documents (FileManager,
  Source_Control_System, Jujutsu_Integration, WorktreeGitImprovement, GitHub_Integration and the Forge owners,
  Containers_Registry_and_Unraid, Automated_Testing_System, Runtime_Artifacts_Panel, and the Run & Debug and
  Agents units of FinalGUISpec) supply content, state vocabularies and behaviour only, and never restate, fork
  or restyle that grammar; a chip, pill or badge named by a panel owner is a status or a count drawn through
  F3-619, the rail's instance of the shell-wide rule against side stripes, emoji and pills (DR-069). Every rail
  dropdown is the one chat picker primitive with ACD-439's sprout, with no second dropdown style and no native
  select. F3-658 now owns the shared glyph vocabulary and fitted inks (D44, DL-201); F3-619 and F3-585 consume
  it while their domain meanings remain with their owners. DL-162's earlier unification question is settled.
  L8 B, PM7 Step4, 2026-10-30: rail menus and filter resizing delegate to DR-079’s PM6_SPROUT lifecycle,
  keeping placement, rows, focus and routes with the rail; no private height/bounce/cleanup implementation
  remains.
gui_related: true
gui_classification_reason: "Fixes one owner for the left rail's presentation grammar."
split_recommended: false
depends_on: [DL-162, F3-618, F3-619, F3-620, F3-621, F3-622, F3-625, DL-184]
unblocks: []
acceptance_criteria:
- No panel owner document defines its own rail geometry, type size, status capsule, abbreviation rule, dropdown style
  or motion voice.
- Every rail dropdown is the chat picker primitive.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-162
- /mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "F3-618"
  - "F3-619"
  - "F3-585"
  - "chat picker primitive"
negative_constraints:
- Do not restate the rail grammar in a panel owner document.
- Do not add a second dropdown style or a native select to the rail.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-184): the rail's rule that a chip, pill or badge is drawn as a status or a count is now an instance of the shell-wide DR-069; the rail grammar is unchanged."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-618, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-620, ContractName:Plans/FinalGUISpec.md#F3-621, ContractName:Plans/FinalGUISpec.md#F3-622, ContractName:Plans/assistant-chat-design.md#ACD-439, ContractName:Plans/Decision_Log.md#DL-184, ContractName:Plans/DRY_Rules.md#DR-069

## Usage presentation grammar single owner — 2026-10-09

The redesigned Usage page (DL-173 to DL-179) adds a presentation grammar that must live in one place, beside the chat transcript owners of DR-043 and the wand grammar of DR-044, and it reuses several of their owners rather than copying them.

### DR-058 - Usage Presentation Grammar Single Owner

```yaml
plan_unit_id: DR-058
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The Usage page's presentation grammar has exactly one GUI owner, FinalGUISpec F3-628 with F3-514:
  the chart family (area, line, columns, budget and stacked, with the crosshair readout card, draw-on
  and morph), meters with the calm spectrum, the threshold tones and the switch-point notch, the hero
  plate with its key light and roll, folded facts behind N more, the provider mark rule, the Accounts
  plates and per-account rows, the Live / Paused control, and the look of move and resize previews.
  Every Usage widget builds these from one shared set of primitives; a room or a widget supplies
  content only and never forks or restyles a primitive. Numbers, times, costs and percentages come
  from the app's one shared formatter and one time-zone implementation (DR-044), never a Usage
  formatter. The grammar reuses its neighbours' owners and never restates them: menus are the chat
  assistant's menu family (F3-531, portaled per F3-424, opening with F3-461's corner sprout); hover is
  the shell's one hover system, F3-465 driven through F3-446's single pointer handler; motion voices
  are ACD-475's per theme family with no per-view override (DR-043), so Usage has no voice of its own;
  any Usage sound would use the Notifications & Sounds owner's mapping and one player (F3-564, F3-599,
  DR-043); NieR Mode is SSYS-043's parts with the grammar of F3-589 and F3-598; and fonts are the app's one embedded font set, under its own owner's rules, never a Usage font list.
  Behaviour stays with its owners: what the page shows and does with usage-feature (UF-107 and the
  units it amends), auto-switch values and rules with Multi-Account MA-073 through the Settings
  owner's transaction (SSYS-009, SSYS-018), and the board transaction with Widget_System WS-019.
  DR-038 and DR-039 stand: Usage admits no shared-runtime role, creates no run-out projection, and
  keeps one Usage authority, one widget-layout authority and one command language. L8 B, PM7 Step4,
  2026-10-30: Usage PMU.menu delegates open/close/resize/keep to DR-079’s one sprout owner; it does not keep a
  Usage-specific spring, close or NieR motion copy.
gui_related: true
gui_classification_reason: "Fixes one owner for the Usage page's presentation grammar and points it at the owners it reuses."
split_recommended: false
depends_on: [DR-038, DR-039, DR-043, DR-044, F3-628, F3-514, DL-173, DL-179]
unblocks: []
acceptance_criteria:
  - "No second chart family, meter, hero, mark rule, folded-facts control or formatter exists for a Usage room or widget."
  - "No Usage-only menu style, hover engine, motion voice, sound registry, NieR grammar or font exists."
  - "No Usage presentation unit restates the menu, hover, motion-voice, sound, NieR or font owners' rules; each cites its owner."
  - "No Usage unit keeps a copy of an auto-switch value or of the board transaction."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: usage_redesign_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-173"
  - "Plans/Decision_Log.md#DL-179"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md (SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/R4-plans-20261009.md section 2 (SHA-256 e485c9b971d498774b7bd9b27e85f7f007790235e323dd8a989c51d44b5edad0)"
preserved_exact_tokens:
  - "F3-628"
  - "DR-043"
  - "DR-044"
  - "ACD-475"
  - "F3-465"
  - "N more"
negative_constraints:
  - "Do not restate the Usage presentation grammar outside F3-628."
  - "Do not fork the chat menu family, the shell hover system, the motion voices, the sound player, NieR's grammar or the font set for Usage."
  - "Do not keep a Usage copy of a Settings-owned value or a Usage formatter."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-514, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/FinalGUISpec.md#F3-531, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-446, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Widget_System.md#WS-019

## PMConcept7 hover grammar single owner — 2026-10-10

DL-171 merges PMConcept7's two hover systems into one, so the hover grammar must live in one place and every surface must take it rather than restate it.

### DR-072 - One Hover Grammar For PMConcept7

```yaml
plan_unit_id: DR-072
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  PMConcept7's hover grammar has exactly one owner, FinalGUISpec F3-465: the magnet, the pointer light, the
  emitted glow, the continuous field with its neighbours, the Retro form Raise, the NieR form Lock-on, the
  Reduced Motion and software-rendered forms, and the boundary. It has one engine, the PMH engine (18-hover.js
  in the concept), riding the one merged document pointer-move handler F3-446 owns, and one token set
  (22-hover.css in the concept), with family, kind and family-by-kind rows. There are card, row, tile, icon and
  small-control kinds; the control marker is the same grammar's bounded extension. A surface opts in, with its
  class in the engine's lists or `data-pmh` naming a kind on its markup, and opts out with `data-pmh="off"` or
  by sitting inside `[data-pm-hover-exempt]`; it never restates the effect: no surface keeps its own hover lift,
  glow, pointer sheen, magnet, pointer-move listener or animation loop, and a page's own `:hover` lift or ring
  on a target is cancelled rather than layered under the grammar. A surface that needs a different strength sets
  a token for its kind and never forks a layer. The boundary is part of the grammar: editor and terminal text
  surfaces never receive card effects; small controls use F3-465's shared marker without card magnet, Glass uses
  F3-652's optical marker, and dividers use F3-657's one resize grammar. Tab silhouettes stay with their tab
  owners (F3-505, F3-466), and parallax stays with F3-446. Amended 2026-10-29 (O2, PC1; PM7): Pip gaze/watch
  dwell subscribe to the shared pointer/hover owner, with one bounded kit rig clock for illustration, not a
  per-surface pointer listener or hover effect. It pauses hidden/offscreen/during drags and keeps the last
  pointer position. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q20: Glass has only the F3-465/PMH
  shared hover light on registered edge-glow objects, including Usage/Home widgets, cards, tiles and rows.
  Remove the independent sheet-wide lg-shine/light, pointer listener and stale data-lg-lit. Its central sheen is
  at Basic’s level (Glass Dark white 4.5 percent, Glass Light accent 4.5 percent); edge glow is unchanged. Plain
  panels, bars and dialog ground do not light merely because the pointer crosses them. Retro and NieR retain
  their non-soft-light forms and existing Reduced Motion, software and gesture holds.
gui_related: true
gui_classification_reason: "Fixes one owner for PMConcept7's hover grammar."
split_recommended: false
depends_on: [F3-465, F3-446, DL-171]
unblocks: []
acceptance_criteria:
  - "Exactly one hover engine and one hover token set exist in PMConcept7; no surface keeps a second engine, its own pointer-move listener or its own hover animation loop."
  - "Every hover target is a card, row, tile, icon or small control, opted in by class or `data-pmh` and opted out by `data-pmh=\"off\"` or `[data-pm-hover-exempt]`."
  - "No surface owner restates the hover lift, glow, pointer light or magnet; a different strength is a kind token, not a forked layer."
  - "Tab/header controls use F3-465's small-control marker; editor/terminal text never gets a card magnet, and resize bars consume F3-657."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q20: Glass has only the F3-465/PMH shared hover light on registered edge-glow objects, including Usage/Home widgets, cards, tiles and rows. Remove the independent sheet-wide lg-shine/light, pointer listener and stale data-lg-lit. Its central sheen is at Basic’s level (Glass Dark white 4.5 percent, Glass Light accent 4.5 percent); edge glow is unchanged. Plain panels, bars and dialog ground do not light merely because the pointer crosses them. Retro and NieR retain their non-soft-light forms and existing Reduced Motion, software and gesture holds."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: pm7_hover_grammar
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-171
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/ENGINE.md, SHA-256 bd3480ac65c053210ebc6d9193480acc3c04c6592276607332817615fd76de5e
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "F3-465"
  - "data-pmh"
  - "data-pm-hover-exempt"
  - "card, row, tile and icon"
negative_constraints:
- Do not restate the hover effect in a surface owner or give a surface its own hover lift, glow, pointer sheen, magnet
  or animation loop.
- Do not apply card magnet effects to editor/terminal text or resize bars; controls and dividers use their shared
  owner grammar.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-446, ContractName:Plans/Decision_Log.md#DL-171, ContractName:Plans/FinalGUISpec.md#F3-505, ContractName:Plans/FinalGUISpec.md#F3-466


## DL-180 to DL-185 — One Panel System, One Gesture Kit, One Overlay Root, One Terminal Appearance Model, Shell-Wide Bans And One Opening Module (2026-10-09)

Jared's home redesign of 2026-10-09 (DL-180 to DL-185) replaces Home's four fixed editor panels, singleton dashboard, bottom terminal zone and movable chat with one universal panel system, rebuilds the terminal as one session per tab, and makes the bans on side stripes, emoji and pills one rule for the whole app. Each piece the redesign shares across surfaces lives in one place, and these seven rules say where. They supersede the per-surface owners of the 2026-08-04 Home owner boundary and its U10 sentence (both amended in place above), and they amend the PMConcept7 SSOT table's Home row and DR-039 for several dashboard tabs, the Guided Tour paragraph of the touch-closure addendum, DR-044's run view, DR-047's Plan footer and DR-057's pill clause, which now reads as the left rail's instance of DR-069. The concept builds are lineage only: no concept class, storage key or script global is a product name here.

### DR-065 - One Panel And Tab Grammar For Every Panel In The Home Centre

```yaml
plan_unit_id: DR-065
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Every panel in the home centre is drawn from one grammar, whatever tab kinds it holds (DL-180, D5, D6,
  D12). There is one tab strip (FinalGUISpec F3-631, its active tab the seated chip of DL-214, which replaced F3-505's
  contact-aware silhouette; amended 2026-10-17, DL-228) with
  one tab menu, one "+" button and its menu (F3-632), one empty-panel launcher showing that menu's rows
  (F3-632), one "+N" list of the tabs that do not fit (F3-633), one shared header row for every kind that
  needs controls above its content (F3-635), and one keyboard table with one web-client mapping rule
  (F3-635). No tab kind draws its own strip, tab overflow, "+" or menu button, panel menu or header row; a
  kind draws a row of its own only when nothing in the shared header row fits, and that kind's owner unit
  records why. The panel keys are F3-635's alone and no kind redefines one: a kind's own keys work only
  inside its body, and a terminal keeps the shell's keys and gives back the host keys F3-640 lists. A kind
  supplies its content, its registration (label, group, icon, id prefixes, content minimum, its "+" row,
  mount, saved state, close check; F3-635) and its marks through the host; every tab mark that names a
  state comes from the one status set (F3-658, consumed by F3-585), and every kind icon is a bundled SVG
  icon_id (FinalGUISpec section 2.6, F3-417), never an emoji. The dashboard, the terminal and the browser
  are tab kinds of the one panel model (F3-630); none keeps a second panel model, strip, layout record or
  placement rule, so the dashboard's own strip, the terminal's sections, workgroups, sub-tabs and in-tab
  splits, and the editor-only strip and overflow rules are gone (F3-631, F3-633, SMPFS-180). A tab is a
  view of its owner's object, and the panel adds no session, store or service of its own: a browser tab
  shows a session of the Browser owner (DR-037), a terminal tab one terminal session (SMPFS-180), and a
  dashboard tab one widget board hosted through Widget_System (WS-030), never through a new host service
  (DR-038). The chat column is outside this grammar: never a panel and never a tab (F3-637). Hover on
  strip/header controls consumes F3-465's shared small-control marker without card magnet; resize bars
  consume F3-657. DR-072 keeps one owner for each grammar. This rule supersedes the per-surface Home
  owners of the 2026-08-04 Home owner boundary for panel and tab presentation. Amended 2026-10-10
  (DL-187): the Debug Console is one tab whose debug sessions are switched inside it by session sub-tabs
  (D33), the way Output switches its channel inside its one tab: which session shows is view state, never
  a panel tab, never in the strip and never a second tab model, and the row that switches it is the kind's
  own row, recorded by its owner units (F3-635, F3-490). The terminal's sub-tabs stay retired. Terminal
  tabs carry no colour or icon of the person's choosing on the strip (D34): the neon glyph system's redesign is
  F3-658's terminal family, an uncoloured kind glyph lit on hover with state only through the shared mark slot
  (amended 2026-10-17, DL-228; it read: until the neon glyph system redesigns them); every tab keeps its kind's
  bundled icon.
gui_related: true
gui_classification_reason: "Fixes one grammar for every panel and tab in the home centre."
split_recommended: false
depends_on: [DL-180, DL-187, F3-630, F3-631, F3-632, F3-633, F3-635]
unblocks: []
acceptance_criteria:
  - "No tab kind or panel owner defines its own tab strip, tab overflow, \"+\" button, menu button, panel menu or header row, and every kind-specific row is justified in its owner unit."
  - "The dashboard, the terminal and the browser are tab kinds of F3-630's one panel model, with no second panel model, layout record, strip or placement rule."
  - "Every tab state mark comes from the one status set of F3-658 and every kind icon is a bundled SVG icon_id."
  - "One keyboard table and one web-client mapping rule serve every panel; no kind redefines a panel key."
  - "Amended 2026-10-10 (DL-187): the Debug Console's session sub-tabs switch a view inside its one tab and never act as panel tabs; no terminal tab shows a colour or icon of the person's choosing on the strip."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D1, D5, D6, D9, D12, D24)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, sections 3, 4, 5 and 9 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8,
  section 6.3, part 1.7 (worklist)
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "+N"
  - "header row"
  - "web-client mapping rule"
  - "F3-631"
  - "F3-635"
negative_constraints:
  - "Do not give a tab kind its own strip, overflow, \"+\" or menu button, panel menu or header row."
  - "Do not build a second panel model, layout store or placement rule for the dashboard, the terminal or the browser."
  - "Do not add a tab status glyph outside the one status set or a kind icon outside the bundled icon registry."
  - "Do not make a debug session its own panel tab or draw its sub-tabs as a second tab strip."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187): the Debug Console's session sub-tabs (D33) are view state inside its one tab, and terminal tab colours and icons stay off the strip (D34)."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-632, ContractName:Plans/FinalGUISpec.md#F3-633, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/DRY_Rules.md#DR-072, ContractName:Plans/Decision_Log.md#DL-141

### DR-066 - One Gesture Kit For Panels And The Usage Board

```yaml
plan_unit_id: DR-066
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Panels and the Usage widget board move with one gesture kit (DL-180, D1; Jared, in the question form: "Split tree +
  Usage gestures (Recommended)"). The kit is the interaction layer only: pick-up after a small travel threshold, the
  held item following the pointer one to one, the landing preview, target hysteresis and dwell, edge auto-scroll, the
  settle on drop and the glide back on cancel, a keyboard path for every pointer move, and polite announcements of
  where the item would land and where it landed. Its transaction is one rule for both layouts: the preview is local and dispatches nothing, writes nothing
  and emits no event; a changed release commits exactly one owner command; an unchanged or invalid release, Escape, a pointer cancel, a lost pointer capture or the window losing focus commits nothing and restores the exact earlier picture; and a failed
  commit rolls back (UIW-012, CS-068). The pointer rules are F3-HOME-002's and F3-503's, which F3-630 applies to
  panels and tabs; the Usage board uses the same kit under WS-019. Each layout supplies only its own target model, its
  keys and its numbers: the split tree resolves strips, panel edges and the "+N" list with F3-630's
  thresholds, and the board resolves grid cells with its own. The kit carries no layout model. The board's snapping
  widget grid, its tracks, its push-down resolver and its gravity lay out widgets only: on the Usage page and, in the
  home centre, only inside dashboard tabs (WS-030); they never lay out panels, and the split tree never lays out
  widgets. No widget command, widget hostability, widget order or geometry, or Dashboard widget state enters the Home
  layout record, and no panel or tab command reaches a widget board. How the board's previews look stays F3-628's
  (DR-058) and how panel previews look stays F3-630's and F3-647's. Under Reduced Motion every part of the kit is
  instant and every close path still works. This replaces the 2026-08-04 Home owner boundary's sentence that U10's
  interaction behaviour is "a reusable interaction vocabulary only".
  Amended 2026-10-10 (DL-186): every dashboard tab's board is a board of the one Usage board engine (WS-030), so the
  board's resolver, gravity, Tidy and previews are one and the same on the Usage page and on every dashboard
  (WS-019): no dashboard keeps a settlement, gravity or resize rule of its own, and one widget gesture at a time
  holds across every board on the page, a gesture started on one board ending any still running on another.
gui_related: true
gui_classification_reason: "Fixes one gesture kit for moving panels, tabs and Usage widgets."
split_recommended: false
depends_on: [DL-180, DL-186, F3-630, F3-503, WS-019]
unblocks: []
acceptance_criteria:
  - "The panel split tree and the Usage widget board run one gesture kit; neither keeps its own pointer controller, preview transaction, keyboard move path or announcement scheme."
  - "No preview dispatches a command, writes storage or emits an event; a changed release commits one owner command and a cancel restores the exact earlier picture."
  - "The snapping widget grid lays out widgets only, and in the home centre only inside dashboard tabs; no panel is placed on widget tracks."
  - "The Home layout record holds no widget command, widget order, widget geometry or Dashboard widget state."
  - "Amended 2026-10-10 (DL-186): gravity, Tidy and the move and resize previews are the same on every dashboard board as on the Usage page, no dashboard keeps its own settlement, and at most one widget gesture runs on the page at a time."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D2)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/widgets-and-coordination.md, SHA-256 631c28a9198c9f550514c856ade138627410b94c48fe5f96a67450b14f407a90, part A, A4 and A6 (research lineage)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 8 (concept lineage only)"
preserved_exact_tokens:
  - "Split tree + Usage gestures (Recommended)"
  - "a reusable interaction vocabulary only"
  - "F3-630"
  - "WS-019"
  - "WS-030"
  - "UIW-012"
negative_constraints:
  - "Do not build a second gesture controller, preview transaction or keyboard move path for panels or for widgets."
  - "Do not lay out panels on the widget grid or widgets in the split tree."
  - "Do not write widget layout into the Home record or panel layout into a widget board."
  - "Do not keep a second board engine, or a dashboard-only settlement, gravity or resize rule."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L13): Lost pointer capture cancels a gesture and restores the earlier picture without a commit."
  - "Amended 2026-10-10 (DL-186): dashboards run the one Usage board engine, so its gravity, Tidy and previews are the same on every board."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-503, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/UI_Wiring_Rules.md#UIW-012, ContractName:Plans/Commands_System.md#CS-068, ContractName:Plans/DRY_Rules.md#DR-058

### DR-067 - One Overlay Root And One Stacking Order

```yaml
plan_unit_id: DR-067
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'Everything that floats over the home centre opens in one overlay root with one stacking order (DL-180,
  DL-185, D27), except the folded rail''s side panel, which opens over the centre from the rail''s own slot, drawn and
  fitted by the rail (F3-636, F3-621), above the panels'' strips and dividers and below the overlay root. The "+" menu,
  the "+N" list, tab menus, panel menus, every menu a tab kind opens through the host, drag ghosts and landing previews
  open in that root, and no tab kind appends an overlay layer of its own to the page or the window. The order is fixed,
  bottom to top: panel content, then tab strips and dividers, then the overlay root, which sits above the status bar
  and below the hover tags and the Guided Tour (F3-635). Hover tags belong to the shell''s one hover tag controller (FinalGUISpec
  F3-523) and the Guided Tour to its own owner; neither joins the overlay root and neither keeps a second stacking order.
  When the 5.6 Pro chat is ported (ACD-501, D27), its body-portaled popouts (F3-424) and its menus open in the same root
  and order; the chat keeps no overlay layer and no stacking order of its own. A tab body never draws past its own box
  except through this root, and Escape closes only the innermost open thing (F3-568). Amended 2026-10-17 (DL-228): above
  the overlay root the whole window has one order, bottom to top: the notification stage and its inbox (F3-447), the
  setup resume prompt, the Guided Tour and its page note, the onboarding window with its scrim and the NieR editor panel
  inside it, then the look cover and the NieR reboot plate and calm cover (F3-077, F3-598), which cover everything. Escape
  closes only the innermost open thing; the numbers are the rebuild''s. Amended 2026-10-29 (PC1, D6/D10, G9; PM7): Work
  panel/quit dialog/pop-out view and sheet Pip lift-off use this overlay owner; teardown releases copies/timers. All
  floating Glass Activity/History/attachment surfaces use the persona/model menu plate token, not new plates. QA round
  2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H5: the onboarding owner holds one original inert-state basis for the
  entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots
  nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds,
  preserves pre-existing inert nodes and restores focus/input. Amended DL-260, Jared 2026-10-31: only real product behavior
  remains an implementation requirement.'
gui_related: true
gui_classification_reason: "Fixes one overlay root and one stacking order for the home centre and the ported chat."
split_recommended: false
depends_on: [DL-180, DL-185, F3-635]
unblocks: [F3-640, ACD-501]
acceptance_criteria:
- Every menu, list, drag ghost and landing preview over the home centre opens in the one overlay root.
- No tab kind and, after the port, no part of the 5.6 Pro chat appends its own overlay layer or keeps its own stacking
  order.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H5: the onboarding owner holds one original inert-state basis
  for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it
  never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only
  the modal’s own holds, preserves pre-existing inert nodes and restores focus/input.'
- The order is panel content, strips/dividers, the overlay root above the status bar, then shared hover tags and Guided
  Tour above it.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 14 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162, the z ladder (concept lineage only)"
preserved_exact_tokens:
  - "overlay root"
  - "F3-424"
  - "F3-635"
  - "F3-568"
negative_constraints:
  - "Do not open a tab kind's or the ported chat's overlay outside the one overlay root."
  - "Do not introduce a second stacking order for menus, ghosts or previews."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-424, ContractName:Plans/FinalGUISpec.md#F3-568, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/FinalGUISpec.md#F3-523

### DR-068 - One Terminal Appearance Model

```yaml
plan_unit_id: DR-068
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The terminal has one appearance model (DL-183, D15). Four layers resolve field by field, an unset
  field falling through: the look's defaults ("Follow look": the current look's scheme, face and
  effects), then the app default (Settings > Terminal), then the project default, then the per-tab
  override, each later layer winning (F3-642). The Customize screen (F3-650) in the terminal's More
  menu, Settings > Terminal and the per-look defaults read and write this one model: the Customize
  screen writes This terminal (the tab's override) or All terminals (the project default, written
  through the same Settings transaction Settings uses over SSYS-051's rows, F3-642), no surface
  writes an app-wide value until q-035 admits an app-wide store (SSYS-002), and the look layer reads
  the current look from its one store (SSYS-010, DR-056) and keeps no copy. The fields are F3-642's,
  the storage SP-331's (the app default in Settings rows, the project default in the Project's
  Settings, the override inside the terminal tab's saved state) and the Settings rows SSYS-051's;
  the existing terminal appearance rows, code.terminal.theme and code.terminal.font-family among
  them, bind the Project layer under SSYS-002. The app-default layer is reserved
  compatibility/default lineage, not an admitted writable app store. There is no fifth layer (a
  shell profile carries no appearance of its own), and no second terminal theme, scheme, font,
  background or effects store or terminal-local settings key outside the model. Every field applies
  live, and no terminal appearance setting carries a restart badge. The faces are F3-644's and their
  files DR-050's one set. The effects (F3-643) are paint on the terminal's own screen inside this
  model, not motion voices: DR-043's per-family motion voices and its accent rule stand, so the
  scheme colours the screen and the terminal's chrome takes the theme's token roles. One code
  colour-scheme catalog and the shared Customize presentation serve the editor and terminal (F3-642,
  F3-650, F3-651). Each curated scheme carries the terminal palette and editor syntax colours. Each
  surface has its own scheme choice, defaulting to "Follow look"; neither surface keeps its own
  scheme list or duplicate Customize implementation. F3-650 alone owns scope entry and preview
  docking for both screens; F3-438 owns the shared selector layout. F3-651 owns editor field
  behavior; SSYS-052 and SSYS-051 own their Project rows. Compatibility concept keys never authorize
  a no-Project write. Each kind’s quick sets resolve from Plans/appearance_quick_sets.json; This and
  All adapt the same exact patch to their existing writers, never maintain their own patch copies.
  Separate editor/terminal field identities remain intact. Plans/terminal_background_catalog.json
  owns design ids/categories/names and compatibility mapping; Customize, Settings and the renderer
  consume it. F3-650's saved preset library is a reusable set of sparse field values, never a fifth
  appearance layer; SP-331 owns its computer-local custody and the existing scope writers alone
  apply it. The extended bezel/background fields use the existing one model and shared
  reset/quick-set registry.
  Amended 2026-10-17 (DL-228): each field's choice words and help text have one owner, its inventory row
  (F3-441), which Settings and the Customize screens both read. The concept's Customize words that differ
  (Fill, Fit, Tile, Centre for Picture Fit; Still for Off in Background Motion; the materials' "plastic";
  "Less colour"; "Grain"; "Text drawing") were adopted in F3-441's wording pass (2026-10-17, DL-230, Jared) as
  those rows' labels and option_labels, and its Bell help's "flash" is stale: Bell is Follow look or Off
  (DL-213, DL-216).
gui_related: true
gui_classification_reason: "Fixes one layered appearance model for every terminal."
split_recommended: false
depends_on: [DL-183]
unblocks: [F3-642, SSYS-051, SP-331]
acceptance_criteria:
- Customize, Settings > Terminal and the per-look defaults resolve through one four-layer model field by field,
  and the Customize screen writes only This terminal or All terminals.
- No terminal theme, font, background or effects value is stored outside SP-331's places, and no shell profile
  carries an appearance of its own.
- Every terminal appearance field applies live and no terminal setting shows a restart badge.
- Terminal effects stay paint on the terminal's screen; no terminal setting overrides DR-043's motion voices
  or hard-codes the accent role.
- The editor and terminal read one catalog and use one Customize component (F3-650); neither has its own scheme
  list or Customize implementation.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D15, D16)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 6 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256
  12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3, Appendix 7, E.3.4 and E.5 (worklist)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
preserved_exact_tokens:
  - "Follow look"
  - "This terminal"
  - "All terminals"
  - "Settings > Terminal"
  - "code.terminal.theme"
  - "code.terminal.font-family"
negative_constraints:
- Do not keep a second terminal theme, scheme, font, background or effects store.
- Do not mark a terminal appearance setting as needing a restart.
- Do not let the Customize screen or any other surface write an app-wide terminal appearance value until q-035
  admits an app-wide store.
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance defaults."
  - "Amended 2026-10-10 (lead ruling L16): The popover's All terminals writes the project default through the Settings transaction (F3-642, SSYS-051), replacing the app default and the rule that only Settings writes the project default; no surface writes an app-wide value until q-035."
  - "Amended 2026-10-10 (D30, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/Settings_System.md#SSYS-051, ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/DRY_Rules.md#DR-050, ContractName:Plans/DRY_Rules.md#DR-056

### DR-069 - No Side Stripes, No Emoji And No Pills Anywhere In Puppet Master

```yaml
plan_unit_id: DR-069
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Puppet Master has one rule against side stripes, emoji and pills, for every surface (DL-184, D22; Jared:
  "Remember, no boxes with side colors, no emojis, no pills are to be used."). No box carries a coloured border
  or stripe on one side, and no inset accent border, inset shadow or pseudo-element stripe stands in for one. No
  emoji appears in Puppet Master's chrome; a program's own output in the terminal may contain emoji. No
  pill-shaped label: status chips, tags, suggestion chips and state badges cannot be fully rounded capsules.
  Pill-shaped action buttons, including Install, Sign in and the rounded Friendly and Glass actions, are
  allowed; keyboard key caps and non-label progress marks are not labels. Joined selectors and tabs retain their
  own specified geometry. Selection is shown by the surface itself: the seated tab chip (F3-631, DL-214; amended 2026-10-17, DL-228, it
  read: the fused tab silhouette), a filled or tinted row, the NieR square cursor, Retro reverse video, never an edge stripe. A status is a mark and a word from the
  shared F3-658 set consumed by F3-585 and F3-619 through DR-057, and a count is a plain number. How the rule
  looks, and the list of retired defaults it replaces, are F3-648's: section 3.5's 3 px left-edge accent stripe
  and F3-039's token, Appendix C's and F3-276's accent left border, F3-469's inset left accent bar, the
  workgroup pill of section 5.1, and the pill skins of F3-422, F3-463, F3-464 and F3-467. The surface statements
  that came first stay as instances of this one rule and do not narrow it: the chat's and Settings' stripe ban
  (APR-034, F3-534), Settings' status tokens (Settings_System section 22), the left rail's rules (DL-162,
  F3-618, F3-619, DR-057), the decision cards' text statuses (DL-036) and the production icon contract with no
  emoji (FinalGUISpec section 2.6, F3-417); where one of them names only the chat, Settings or the rail, this
  rule covers every other surface as well. A new surface cites this rule instead of restating it. The checks are
  F3-648's and the home certification's (ATS-075). A chosen option is filled on its own box, never underlined.
  Debug Console sub-tabs and every segmented toggle use each look's neutral selection fill in Friendly, Glass
  and Basic, never an accent; Glass adds its 1 px rim on the top edge of the filled box, Retro keeps reverse
  video and NieR its ink block (F3-490).
gui_related: true
gui_classification_reason: "Fixes one shell-wide rule against side stripes, emoji and pills."
split_recommended: false
depends_on: [DL-184, F3-648, DR-057]
unblocks: []
acceptance_criteria:
- The label-pill detector and side-border detector follow F3-648, with its explicit action-button, key-cap, switch-key,
  non-label-mark and structural-rail exemptions; no emoji appears in chrome.
- Selection is shown by the selected element's own surface, never by an edge stripe.
- The earlier surface statements (APR-034, F3-534, Settings section 22, DL-162, F3-618, F3-619, DR-057, DL-036, F3-417)
  stay as instances of this rule, and none of them narrows it.
- New surfaces cite this rule instead of restating it.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-184
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D22 and Jared's brief)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8,
  sections 2.12 and 7.1 (A11, A12) (worklist)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "Remember, no boxes with side colors, no emojis, no pills are to be used."
  - "APR-034"
  - "F3-648"
  - "key caps"
negative_constraints:
- Do not draw a coloured border or stripe on one side of a box, a pill-shaped label, tag, suggestion chip or state
  badge, or an emoji in Puppet Master's chrome.
- Do not restate this rule per surface or carve a surface out of it.
stale_retired_dispositions:
- 'Amended 2026-10-11 (lead ruling 2026-10-11, D29): A chosen option uses its own filled box and never an underline.'
- 'Amended 2026-10-14: Jared''s 2026-10-11 clarification limits the capsule ban to labels and explicitly allows pill
  action buttons; it is not a blanket ban on rounded controls.'
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-184, ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/FinalGUISpec.md#F3-417, ContractName:Plans/FinalGUISpec.md#F3-534, ContractName:Plans/Settings_System.md, ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/DRY_Rules.md#DR-057, ContractName:Plans/Automated_Testing_System.md#ATS-075, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/Decision_Log.md#DL-141

### DR-070 - Retired historical identifier

```yaml
plan_unit_id: DR-070
unit_type: retirement_record
status: retired
owner_doc: Plans/DRY_Rules.md
canonical_text: DR-070 is retired by DL-260, Jared 2026-10-31. The ID remains only for unchanged historical decision
  references. It defines no active product feature, control, command, setting, schema, wiring, stored state, test obligation
  or implementation debt.
gui_related: false
gui_classification_reason: Historical identifier only; no product UI requirement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No product work or acceptance obligation is compiled from this retired identifier.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
risk_class: historical_reference_reactivation
reasoning_tier: low
context_scope: retired_identifier
implementation_surfaces: []
node_compile_hint:
  mode: retired_no_product_work
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-260
preserved_exact_tokens:
- DR-070
- DL-260
negative_constraints:
- Do not reactivate this historical identifier as a product requirement.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/DRY_Rules.md#DR-067

### DR-071 - One Opening Module For Everything That Opens In A Panel

```yaml
plan_unit_id: DR-071
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Everything that opens in the home centre goes through one opening module with one placement rule and one placement
  field set (DL-180, D7, D8; Jared: "Files referenced in chat or in the diff panel(or anywhere else in the chat wizards
  stuff) open the same way as the rules you stated for the file tree."). The callers are all of them: the left rail's
  file tree (F-090); file references, diff views, Changes rows and transcript file records in the chat (ACD-500);
  search results; Ctrl+P; the "+" menu and the empty-panel launcher (F3-632); agents; and the terminal's path:line:col
  links and command marks (F3-641). Each passes its request with CV-360's placement fields (where, mode, by and
  background) and gets back the tab it opened or revealed; which panel, the preview tab, kind affinity,
  reveal-if-open and agents' background opens are F3-634's alone. No caller keeps its own routing, target panel,
  dedupe, preview rule or focus rule, and no caller places a tab into a panel by itself. The open commands that
  already exist keep their ids and resolve through the module: cmd.file.open, cmd.nav.open_subject,
  cmd.browser.open_workspace_preview and cmd.terminal.open carry the same placement fields, and cmd.panel_tab.open is
  the module's own (UCC-200); a new tab and a new panel are values of where, never two commands or aliases (DR-041).
  One id is one tab: an open of an id already open anywhere reveals that tab, never opens a second one and never moves
  it, and a kind maps alias ids to one canonical tab id. The module invents no identity: a tab id comes from its
  kind's id rule over the owner's identity (FileManager's file open identity, DR-011; OpenSubject and route_target,
  owned by Contracts_V0, DR-008; terminal_session_id), and the 5.6 Pro chat's way of opening editor documents maps
  onto the module (ACD-500). Placement fields that named a fixed editor panel or group are lineage only (CV-360).
gui_related: true
gui_classification_reason: "Fixes one opening module, one placement rule and one placement field set for every caller."
split_recommended: false
depends_on: [DL-180, F3-634]
unblocks: [UCC-200, F-090, ACD-500]
acceptance_criteria:
  - "Every caller named here opens through the one opening module with CV-360's placement fields; none keeps its own routing, target panel, dedupe, preview or focus rule."
  - "A new tab and a new panel are values of the placement field where, never two commands or aliases."
  - "An open of an id that is already open reveals that tab and opens no second one."
  - "Tab ids come from the kind's id rule over the owner's identity; the module invents no file, subject or session identity."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D8)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 6 (concept lineage only)"
preserved_exact_tokens:
  - "cmd.file.open"
  - "cmd.nav.open_subject"
  - "cmd.browser.open_workspace_preview"
  - "cmd.terminal.open"
  - "cmd.panel_tab.open"
  - "path:line:col"
  - "CV-360"
  - "F3-634"
negative_constraints:
  - "Do not give any caller its own placement, dedupe, preview or focus rule."
  - "Do not register a second open command or alias for a new tab or a new panel."
  - "Do not open a second tab for an id that is already open."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/FileManager.md#F-090, ContractName:Plans/assistant-chat-design.md#ACD-500, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/DRY_Rules.md#DR-011, ContractName:Plans/DRY_Rules.md#DR-008

### DR-073 - One Wallpaper Catalog And One Writer

```yaml
plan_unit_id: DR-073
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  One wallpaper registry supplies stable ids, family/order, names, dark/light assets, thumbnails and
  defaults to every wallpaper consumer. Plans/wallpaper_catalog.json is that registry; F3-653 owns
  presentation, SSYS-054 owns the single Project choice and SP-333 owns storage. No theme, Settings
  gallery, onboarding or native renderer keeps a competing list or default. Picking through any
  surface uses the Settings transaction, never a wallpaper-specific settings store or duplicate
  command. The terminal Lens consumes the same selected print and catalog as Glass; it never derives
  another wallpaper from computed page styling or stores a second choice. The six NieR prints derive
  from the original scene drawings, while their native packaged assets are registered here.
  Amended 2026-10-16 (DL-217, the motion lanes): every consumer of the selected print, the terminal Lens
  and Glass's optics included, asks the one wallpaper owner for it through a synchronous, cache-only query
  by print id and mode. The query answers the print's prepared source, not cached yet, or no image, and it
  reads no page style. A consumer told not cached yet keeps its fallback until the owner announces the
  print, and a watch on the selected print never forces a style recalculation. In the concept this is
  PM_WALLPAPERS.sourceUrl(id, mode), returning a URL, undefined or null.
  Amended 2026-10-16 (DL-217, the Settings and Glass lanes): the owner prepares a print and its frost
  before the choice is published, and fills the source query's cache first. Preparing nearby and visible choices ahead of a pick runs at idle, one job at a time, pauses for input,
  Settings navigation and the shared busy signal, and never delays a pick; hover or keyboard focus
  prepares the intended tile after a short quiet pause, and a press requests it at once, still behind
  those guards. A cancelled or stale preparation changes nothing on screen and only the newest pick
  commits; a pick whose preparation fails still commits through the ordinary print and frost fallback, so
  no pick is lost. Glass alone keeps the decoded prints, the visible gallery choices among them within a
  bounded budget, and a byte-bounded frost cache; the gallery keeps no image cache of its own.
  Amended 2026-10-17 (DL-222, DL-223): preparing prints at idle follows ACD-475 and does not restate
  that rule. The owner prepares a print and its frost before the choice commits. The print may start
  fading before the frost is ready (F3-653); the setting still writes at the pick. An intent, hover or
  keyboard focus after a short quiet pause, or a press, never waits behind background preparation of
  another print. A pick or intent for a print runs whatever preparation is left at once (review r1).
  This unit still owns the cache-only query and the rule
  that a failed preparation still commits.
  Amended 2026-10-17 (DL-228): the requirement is one synchronous, cache-only print query; the concept's
  page API for it is lineage, not an interface the rebuild keeps. A wallpaper joins the
  catalog only with a Dark and a Light print, each composed with a quiet middle and its detail toward the
  edges (opaque looks cover the middle with panels and Glass frosts what sits behind a sheet) and drawn at the
  contrast its mode's text needs; its thumbnails are made from the same print, and the gallery never decodes a
  full print. Byte and pixel budgets are the packager's.
gui_related: true
gui_classification_reason: One wallpaper catalog and one writer.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every wallpaper id/default/asset resolves from the registry and every committed choice uses the same Project transaction.
- A consumer references the owner and cannot silently add a private wallpaper or background mode.
- The selected print reaches every consumer through the owner's one synchronous, cache-only query (its
  source, not cached yet, or no image); no consumer or wallpaper watch reads page styles to find it.
- Preparing a print at idle follows ACD-475. An intent never waits behind another print's background
  preparation, a pick runs the remaining bake at once, and the print may fade before its frost commits
  (F3-653).
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: one_wallpaper_catalog_and_one_writer
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-653
- Plans/Settings_System.md#SSYS-054
- Plans/storage-plan.md#SP-333
- Plans/FinalGUISpec.md#F3-650
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--CANON-PROPOSALS.md,
  SHA-256 4a4b91f257467e76ec6d43e37a04a81cf5f9dee515242177f0d08db04483700d (source lineage; not native
  certification)
- '/mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--44-grounds-glass.js,
  SHA-256 029716017b916a8c93c6817a458ba7d17c56dae295462655c31bb69dfe2c2392 (main 89d1a6c057, the terminal
  lane: the consumer of the wallpaper source query; source lineage; not native certification)'
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--LANDING-REVIEW.md,
  SHA-256 b1ca802f406fa585b3be8d1096e8aefada4bac0c94ef81a3ee93f3be3611918e (cross-lane contract check;
  source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/d02f2ac26b--Concepts--wallpapers--opus-5.5--CONTRACT.md, SHA-256
  1687dac3d7dc7905598780595e7df743255edaf6619f038c97d5bfcaa043d544 (Settings lane head d02f2ac26b, landed unchanged on main
  a0f844455c (L1), wallpaper preparation and source cache; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (idle preparation is one rule;
  decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-motion-fixes/pm7-liquid-glass/F6-NOTES.md,
  SHA-256 86b0f12a17d3eab6becf2410e1c5950a6c619066c8a6d683ba57328a9fef7899 (fade-first, option (c);
  decision lineage)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-223): the print may fade before the frost is ready, and the choice commits
  when the frost follows. It read: the owner prepares a print and its frost before the choice is
  published.'
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/FinalGUISpec.md#F3-650

### DR-074 - One Owner For The Board Commit Shape And For Hosted Settings Controls

```yaml
plan_unit_id: DR-074
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Added 2026-10-17 (DL-228). Two rules are restated in many owners and have drifted. Widget_System WS-019
  alone owns how a board commits: gravity inside the one move, resize, add or remove that caused it, and Tidy as
  one cmd.widget.move with its arrange field, one receipt, the repack computed by the owner. Settings_System
  SSYS-044 owns which surface may host which row, the bound value and the preview-then-apply transaction;
  Multi-Account MA-073 owns the switch and warning hold rules, and SSYS-044 consumes them (review r1).
  usage-feature UF-092, UF-093 and UF-107, UI_Command_Catalog UCC-147, UI_Wiring_Rules UIW-012, Wiring_Matrix
  WM-043 and WM-045, Commands_System CS-067 and FinalGUISpec F3-514, F3-515 and F3-628 consume them; where a consumer's wording differs from its owner, the
  owner wins, and a later edit cites the owner by id instead of restating it.
gui_related: true
gui_classification_reason: One owner for the board commit shape and for hosted Settings controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A board commit or a hosted Settings control is judged by WS-019 or SSYS-044, and a switch or warning hold by MA-073; a differing consumer sentence does not create a second rule.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: board_commit_and_hosted_controls_owners
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Widget_System.md#WS-019
- Plans/Settings_System.md#SSYS-044
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-OPUS-B.md, SHA-256
  a74054b4fea13526b56a1e0a395b6ad434d62828bb407cd1a79b228e8f2ef144 (OB-47, OB-48, OB-30; source lineage)
preserved_exact_tokens: []
negative_constraints:
- "Do not restate the board commit shape or the hosted-control rule in a consumer; cite WS-019 or SSYS-044."
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Settings_System.md#SSYS-044


### DR-075 - The Hosted Chat Reuses The Host And The Settings Writer

```yaml
plan_unit_id: DR-075
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'The hosted chat uses one owner for each shared behavior (DL-232). Opening, placement, deduplication,
  preview, focus and tab chrome are the universal panels'' F3-634 and F3-635, never a second chat opener. Look, fonts,
  NieR parts, first-paint appearance, hover tags and overlay stacking are the app''s existing owners (DR-050, DR-054,
  DR-056, DR-067, DR-072); the hosted chat neither loads its standalone first-paint theme reader nor owns a theme, scene,
  ground layer or reboot moment. A chat settings sheet and the Settings page edit the same admitted setting through the
  same Settings transaction; renderers consume the owner projection without another writer. The application/project ELI5
  default and the active chat''s override remain separate. The History default is a starting value only; History pin,
  chat width and Keep open remain layout view state, and Activity Detail opens full size until closed (G1/G2). One shared
  conversation implementation serves the column, pop-out and hosted views. Each measures its own container and uses the
  shared overlay root; mount wrappers grant no second layout, theme or persistence owner. Amended 2026-10-29 (G1–G3,
  S1–S9; PM7): Jared G1 B (2026-10-30) restores the view-local Pin/unpin lifetime contract: pinned detail stays open
  and follows the new thread across switches, while unpinned detail closes on a switch; only the small view is retired.
  History pin remains local layout state. Pip parts read the same Project row/transaction in every host, never a second
  preference or option registry. Amended DL-260, Jared 2026-10-31: only real product behavior remains an implementation
  requirement.'
gui_related: true
gui_classification_reason: Keeps shared host presentation and Settings control ownership single.
split_recommended: false
depends_on:
- DL-232
- DR-050
- DR-054
- DR-056
- DR-067
- DR-072
- SSYS-050
unblocks: []
acceptance_criteria:
- Changing an admitted preference through either visible surface updates one Settings value and both consumers without
  a feedback loop.
- No hosted theme store, second placement rule, second hover system, conversation owner or persistence writer is introduced.
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/DRY_Rules.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept source; not native or final visual verification)"
preserved_exact_tokens:
- Keep open
negative_constraints:
  - "Do not promote localStorage keys or bridge globals into product contracts."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/DRY_Rules.md"
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-055, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/assistant-chat-design.md#ACD-501


### DR-076 - One Brand Mark And One Pip Kit

```yaml
plan_unit_id: DR-076
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  X1/X3, A1–A5, O1/O8, PC1–PC5, S1/S9: one kit owns Pip geometry, string solver, faces, role props, token
  colours and shared styles for static brand/release assets/tray/notifications, loader, onboarding and the
  single chat-agent primitive. Robot is only category art. No per-surface renderer/palette, legacy puppet
  fallback, random drawing IDs or switchable brand/loader. Pip parts is one registry/editor/Settings row,
  not a shadow store. Declarative static base remains meaningful without animation. NieR Pip shows eyes
  through the band on live and static marks, including title bar, app icon and tray, at every size (X3 B,
  Jared 2026-10-30).
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-235
- DR-044
- DR-051
unblocks: []
acceptance_criteria:
- A drawing-source audit finds one Pip kit/solver/palette owner and no legacy puppet/monogram fallback.
- Brand, tray, release assets, onboarding and agents share tokens/geometry/static base at consistent logical
  tiers across DPR.
- Pip parts exclude brand/loader/notifications and every individual agent remains the same primitive.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-235, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/DRY_Rules.md#DR-051




### DR-077 - One Loading Indicator

```yaml
plan_unit_id: DR-077
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  L1–L8, X2: one F3-662 loader owner/opt-in/class contract and clock supplies every indeterminate wait with
  contextual Swing/Think/Hop, per-family timing, size/accessibility and pause gates. Preserve layout skeletons
  and determinate bars; working status remains st-working. NieR routes to its Diamond owner/fallback. No surface
  spinner, loader-setting or duplicate thinking/Orbit Pip. L8 B (Jared 2026-10-30): this build removes
  menu-sprout duplication. DR-079 is the one sprout owner for every menu; chat menus.js, Usage PMU.menu and Home
  PMW.menu delegate to it with no private animation implementation. Q11 B, Jared 2026-10-30: only live Work rows
  animate, capped to rows on screen. Working, checking and retrying agents use the shared Think loader; running
  process marks move on the shared document clock. Waiting, waiting-dep, blocked, finished/done, stopped and
  scheduled rows stay still. Offscreen rows, drags, hidden tabs and effective Reduced Motion hold recognizable
  rest poses. The panel, Agents rail and Home board consume the same row renderer and eligibility policy. Lead
  clarification 1030183348-18bd permits no NieR exemption: a working NieR agent uses its existing Diamond loader
  owner and L7 part/fallback rules, never animated Pip; running NieR process marks move in their existing
  material language. The 2200 ms category-head breath remains distinct and below needs-you priority. No polling
  loop, command, event, setting, state or extra loader owner is added.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-237
- DR-043
- SSYS-010
unblocks: []
acceptance_criteria:
  - "Every loader consumer opts into one owner/class/clock rather than implementing a spinner."
  - "Skeletons, measured bars and status marks retain their own contracts, including NieR routing."
  - "Family periods, size gate, accessibility and hidden/drag/Reduced Motion behavior agree across all consumers."
  - "Q11: working/checking/retrying rows animate in all ten looks; waiting/dependency/blocked/finished/stopped/scheduled rows stay still; offscreen, drag, hidden-tab and Reduced Motion gates hold."
  - "Q11: the working-agent loader uses the one Think owner, with NieR Diamond/fallback rather than animated Pip; process marks reuse their own status rhythm/clock."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-237, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/Settings_System.md#SSYS-010




### DR-078 - One Work Projection And Resource Owner

```yaml
plan_unit_id: DR-078
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'D2/D5–D14, G4/G7: thread Processes, status items/panel, Agents rail, Home Agents board, tray/project
  badge and composer attention are filtered OperationalAwareness over ObservableWork and registry lineage. No consumer
  owns a separate list/count/status/needs-you set. Executor/terminal owns subordinate ProcessFacts; host monitor owns
  server/environment resource samples while Resources is open only. Actions route to one owner command/handler; services
  are read-only and stop lists are generation-bound. D7, PM7 Step4 final-source alignment, 2026-10-30 (integration e9b15abc64):
  PM7_WORK_UI.list(host, options), agentGroup and agentSummary in src/js/48-work.js are the shared row/filter/summary
  adapters. The rail #panel-agents [data-work-rail] keeps its four shelves (Needs you, Active with lineage, Queued, Recently
  completed); Home dashboard:agents in 30-dashboard.js keeps its frame/filter. Both read PM_WORK and the same needs-you
  set; the live owner projection and shared clock remain the sole inputs. list refreshes on change, patchTicks updates
  times/progress/output, hidden lists catch up on show, and destroy removes subscriptions/observers. Rail uses spelled-out
  ages; Home keeps its short time form. These source adapters demonstrate the projection boundary without certifying
  native runtime. Q11 B, Jared 2026-10-30: only live Work rows animate, capped to rows on screen. Working, checking and
  retrying agents use the shared Think loader; running process marks move on the shared document clock. Waiting, waiting-dep,
  blocked, finished/done, stopped and scheduled rows stay still. Offscreen rows, drags, hidden tabs and effective Reduced
  Motion hold recognizable rest poses. The panel, Agents rail and Home board consume the same row renderer and eligibility
  policy. Lead clarification 1030183348-18bd permits no NieR exemption: a working NieR agent uses its existing Diamond
  loader owner and L7 part/fallback rules, never animated Pip; running NieR process marks move in their existing material
  language. The 2200 ms category-head breath remains distinct and below needs-you priority. No polling loop, command,
  event, setting, state or extra loader owner is added. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q12 amends
  G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong
  to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project
  is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines
  show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2
  s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared
  read scope creates no Stop/Restart/Stop all or service-control authority. Q13/CC5: the PM_WORK dock provider gives
  a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s
  dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the
  same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs
  line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry
  timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work.
  Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through
  Activity and the panel.'
gui_related: false
gui_classification_reason: Defines owner authority, record semantics or lifecycle.
split_recommended: false
depends_on:
- DL-246
- SIR-054
unblocks: []
acceptance_criteria:
  - "Counts, rows, freshness and attention agree across thread/status/panel/rail/board/tray/composer filters."
  - "ProcessFacts and resource samples resolve their sole Executor/terminal/host owner with stable identity."
  - "No surface-private runtime list/stop handler or system-service mutation is introduced."
  - "Q11: working/checking/retrying rows animate in all ten looks; waiting/dependency/blocked/finished/stopped/scheduled rows stay still; offscreen, drag, hidden-tab and Reduced Motion gates hold."
  - "Q11: the working-agent loader uses the one Think owner, with NieR Diamond/fallback rather than animated Pip; process marks reuse their own status rhythm/clock."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority. Q13/CC5: the PM_WORK dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-246, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054

### DR-079 - One Menu Sprout Owner

```yaml
plan_unit_id: DR-079
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  L8 B, Jared 2026-10-30: one shared menu sprout owner supplies every menu’s origin, open/close
  lifecycle, family motion tokens, Reduced Motion settle, drag/hidden pause and teardown. Chat menus.js,
  Usage PMU.menu and Home PMW.menu delegate to that owner instead of carrying duplicate sprout
  implementations. This build closes the former L8 DRY debt. Menus retain their existing items, routing,
  focus and availability contracts; sharing motion dispatches no command or runtime write. L8 B, PM7 Step4,
  2026-10-30: the shared implementation is window.PM6_SPROUT in base/script/pm7-sprout.js with
  base/style/pm7-sprout.css, registered as pm7-sprout-js/css. Its contract is open(el, afterOpen, anchor,
  opts), close(el, done, opts), isOpen, aim, resize, morph, bounce, keep and reduced; pm-sprout/pm-sprout-edge opt in and
  the owner writes is-open/is-closing/is-size-bounce and six --pm6-sprout-* values. Legacy selector adapters
  may keep their names only while using that same lifecycle. Title, chat/worktree/sidecar, Settings, rail
  PMR.menu/filterMenu, Usage PMU.menu, Home PMW.menu, PMMenu/File Manager and live notification inbox
  #pmnPanel all consume it; there is no inbox exemption. The standalone chat reads the same owner files.
  Preserve each trigger’s opening origin/fade, one speed-scaled close timeline, last-relevant-transition
  completion with cancellation/reopen guards and bounded fallback, and drag hold even for motion already in
  flight. L8 B, joined review fixes at 4c49e10567: opts.origin accepts corner (default), trigger, or
  {ox,oy,tx,ty,sx,sy}; opts.shown waits for timely painted entrance frames, and close opts.instant settles
  immediately. The shared --pm6-sprout-fade-in/--pm6-sprout-fade-ease inputs preserve the consumers' fades
  (160 ms for Home/Usage/chat, 140 ms default). morph(el, from, to, opts) moves the same box between
  {left,top,width,height} geometries: height-only changes use the shared height spring/size bounce;
  a level's width/place change uses its opts.shape duration/easing, with the same motion gates.
  Shared presentation APIs create no new product command or saved key. L8 B, PM7 Step4 final-source alignment,
  2026-10-30 (integration e9b15abc64): the owner also supplies --pm6-sprout-height-ease. A growing resize may
  overshoot; a shrinking resize or height-only morph settles without passing below its content. A drag
  catching an in-flight morph settles it at the end. All editor overflow menus (.pm-ed-overflow-menu) use the
  same open/close owner, and superseded local styles/lifecycles are retired.
gui_related: true
gui_classification_reason: Defines one visible menu motion and lifecycle owner.
split_recommended: false
depends_on:
- DL-237
- DR-043
- ACD-439
unblocks: []
acceptance_criteria:
- All menu consumers use one sprout implementation; chat menus.js, Usage PMU.menu and Home PMW.menu have no
  private copies.
- Every consumer preserves its family tokens, origin, focus return, Reduced Motion and teardown behavior.
- The shared sprout is presentation only and creates no command, Settings row, event or runtime write.
validation_surfaces:
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- GUI source audit and 60 fps menu recordings across all ten looks and Reduced Motion
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)
- reports/pm7-build-20261029/IDS.md
preserved_exact_tokens:
- menus.js
- PMU.menu
- PMW.menu
negative_constraints:
- Do not keep a per-surface sprout implementation or mark the L8 duplication deferred.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-237, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/assistant-chat-design.md#ACD-439


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.




### DR-080 - One Joined-Choice Tray And Option Hint Owner

```yaml
plan_unit_id: DR-080
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q7/H2/H8: a selected choice’s follow-up belongs
  immediately in a tray joined to that card, before sibling alternatives. One C.cards under slot owns the join,
  indentation and line from the parent mark across all twelve affected screens. The parent opens into the tray in
  every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts put the parent question
  note first inside the tray. Arrow keys stay in their own choice list, and the option, its radio and question control
  never overlap. Apply to backup places/Kit, existing-work origins, work computer checks, sign-up links, Settings
  copy, remote routes/hosting/certificate fields, online service kind/address, device notes and connection routes.
  Naming and Review display the same selected mounted/network source, rather than an empty local-location field.
  Q3/Q8/Q9: question controls answer pointer hover and keyboard focus in the current look. Remove duplicate explanation-only
  disclosures (What is a Server?, the Connect proxy explanation, and What does Puppet Master read? on Choose a key);
  put their information in the shared option tips. Keep functional sections: More about keeping versions contains
  FileSafe, Which proxy contains the Caddy/NGINX/Traefik selector; identity fingerprints and Creating/restore receipts
  are data and remain. H3: SMB sign-in uses the operating system’s shared-folder keychain; Puppet Master stores
  no password. The SSH add-key password remains a separate one-use protected flow; never reuse its never-saved hint
  for SMB. One component renders the option question affordance, its expanded note and joined tray in every family;
  no screen appends a second tray, disclosure grammar, pointer engine or sibling-level follow-up. Source API C.cards
  accepts under; source classes o55-under/o55-card-parent are presentation only.'
gui_related: true
gui_classification_reason: Fixes shared joined-choice tray and option hint grammar across onboarding screens.
split_recommended: false
depends_on:
- PWIZ-022
- F3-520
- F3-663
- DL-258
unblocks: []
acceptance_criteria:
- All twelve joined-tray screens use one C.cards under owner; parent edges join with no gap, lower ring or corner
  overlap in all ten looks.
- A narrow parent note is the first line of the tray; keyboard arrows stay in their own list and question controls
  do not overlap inputs.
- Functional sections and data remain; explanation-only duplicates use the shared tips.
- No new setting, command, local action, persisted field or permission is created.
validation_surfaces:
- python3 scripts/pm7-qa2-alignment-check.py
- python3 scripts/pm-shard-plans.py --check
risk_class: duplicate_choice_presentation
reasoning_tier: high
context_scope: qa2_joined_choices
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Concepts/onboarding/opus-5.5/src/js/61-components.js
node_compile_hint:
  mode: static_presentation_contract
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/QA-ROUND2.md Q7
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md QA round 2
- Concepts/onboarding/opus-5.5/src/js/61-components.js at 7d586bad18
preserved_exact_tokens:
- C.cards
- under
- o55-under
- o55-card-parent
negative_constraints:
- Do not draw follow-up choices below a different parent or duplicate the joined tray per screen.
- Do not remove FileSafe/proxy selectors or identity/receipt data as if they were explanation-only tips.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
```

### DR-081 - One Free Models Catalog And Advanced Disclosure

```yaml
plan_unit_id: DR-081
unit_type: ssot_rule
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'DL-259 D5, Jared 2026-10-31: one Models-owned Free Models catalog supplies onboarding and Settings.
  Both show OpenRouter, Groq and NVIDIA up front and place all other currently eligible free providers behind one advanced
  control, closed by default. The remainder is catalog-driven, with no fixed list/count or second provider registry.
  Underlying provider/account/auth/billing/readiness identity remains with MS-118/MS-119 and MA-012. Disclosure is local
  view state, adds no setting, command, effect or permission, and never authenticates every revealed route automatically.'
gui_related: true
gui_classification_reason: Shared provider ordering and advanced disclosure across onboarding and Settings.
depends_on:
- MS-118
- MS-119
- MA-012
- PWIZ-021
- SSYS-016
unblocks: []
acceptance_criteria:
- Both surfaces consume the same current eligible catalog and show the same three front providers.
- One initially closed advanced control reveals the catalog-driven remainder without a fixed provider list/count.
- Disclosure writes no Settings row and creates no provider account or native command.
validation_surfaces:
- python3 scripts/pm7-onboarding-rulings-check.py
- Plans/product_onboarding_contracts.schema.json
- Plans/pm7_control_bindings.json
risk_class: free_catalog_fork
reasoning_tier: high
context_scope: shared_free_provider_disclosure
implementation_surfaces:
- Plans/Models_System.md
- Plans/Planning_Wizard.md
- Plans/Settings_System.md
- Plans/pm7_control_bindings.json
node_compile_hint:
  mode: shared_provider_catalog_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-259
- user-ruling:2026-10-31-three-front-free-providers-advanced-catalog-remainder
preserved_exact_tokens:
- OpenRouter
- Groq
- NVIDIA
- Free Models
negative_constraints:
- Do not pin the advanced provider list or its count.
- Do not infer usable_now from catalog presence.
owner_hints:
- Plans/Models_System.md
- Plans/Settings_System.md
- Plans/Planning_Wizard.md
```
