# Shard 028: PlanUnits

Source: `Plans/Progression_Gates.md`

Source lines: L648-L3366

Source SHA256: `ee317f3f4b90686b4b5f04cda15081d9510deb47832c773857b52334b4bdda34`

---

## PlanUnits

### PG-002 - Document Owner-Section Authority

```yaml
plan_unit_id: PG-002
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md is the canonical owner text for deterministic progression gates and preserves product, runtime, storage, UI, and governance requirements.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Document Owner-Section Authority remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0002
preserved_exact_tokens:
  - "Progression Gates (Canonical)"
  - "Canonical owner-section requirements"
  - "UI"
  - "governance"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-003 - Naming And Compliance Constraint

```yaml
plan_unit_id: PG-003
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md follows DRY, Contracts, and Decision Policy references and uses only the Puppet Master name, with older names referenced only as legacy naming.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-002"
unblocks: []
acceptance_criteria:
  - "Naming And Compliance Constraint remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0003
preserved_exact_tokens:
  - "Puppet Master"
  - "legacy naming"
  - "DRY_Rules.md"
  - "Contracts_V0.md"
  - "Decision_Policy.md"
negative_constraints:
  - "Do not quote older product naming; refer to it only as legacy naming."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-004 - Deterministic Gate Scope

```yaml
plan_unit_id: PG-004
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md defines deterministic gates for validating plan quality and implementation evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-002"
unblocks: []
acceptance_criteria:
  - "Deterministic Gate Scope remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0004
preserved_exact_tokens:
  - "deterministic gates"
  - "plan quality"
  - "implementation evidence"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-005 - P5 Gate Evidence Inventory

```yaml
plan_unit_id: PG-005
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression evidence must include supporting docs, graph and evidence schemas, gate status evidence, and numbered gate mappings when they affect gate status.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "P5 Gate Evidence Inventory remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "run-gates"
  - "pm.evidence.schema.v1"
  - "/status"
  - "/evidence"
  - "tri-state"
  - "blocked"
negative_constraints:
  - "True blocked state must not collapse into attention-only evidence."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-006 - ContractRef Taxonomy And Owner Seams

```yaml
plan_unit_id: PG-006
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Gate evidence must keep ContractRef taxonomy and cross-owner seam docs visible when evaluating progression status.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "ContractRef Taxonomy And Owner Seams remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "ContractName taxonomy"
  - "SSOT"
  - "/term"
  - "Plans/Wiring_Matrix.schema.json"
  - "Plans/UI_Command_Catalog.md"
  - "Plans/Contracts_V0.md"
negative_constraints:
  - "ContractRef syntax must use the accepted ContractName taxonomy."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-007 - Command And Wiring Gate Normalization

```yaml
plan_unit_id: PG-007
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Command and wiring gates verify wrappers, aliases, command IDs, route primitives, normalization metadata, and evidence targets without inventing broad schema expansion.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-006"
unblocks: []
acceptance_criteria:
  - "Command And Wiring Gate Normalization remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "GATE-010"
  - "/wrapper"
  - "command-definition metadata"
  - "deprecated aliases"
  - "canonical primitive family"
  - "inspector_target = evidence"
negative_constraints:
  - "Do not over-expand wiring schema more than necessary."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-008 - Orchestrator Widget GUI Gate Visibility

```yaml
plan_unit_id: PG-008
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Orchestrator-facing gate expectations must keep run graph, widget, package, seam, lane, contamination, promotion, and projection-trust visibility in scope.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Orchestrator Widget GUI Gate Visibility remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "FinalGUISpec.md"
  - "Run_Graph_View.md"
  - "Widget_System.md"
  - "widget.tier_tree"
  - "package"
  - "seam"
  - "lane"
negative_constraints:
  - "Stale upstream PASS conditions cannot create false confidence in progression gates."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-009 - Runtime HITL Approval State Semantics

```yaml
plan_unit_id: PG-009
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime approval, HITL route, blocked identity, automation defaults, and shared progression states must align before gates depend on them.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Runtime HITL Approval State Semantics remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "blocked_reason_code = waiting_approval"
  - "blocked_sequence"
  - "/runtime"
  - "allowed_actions"
  - "safe-point"
  - "restore provenance"
  - "attention_required"
  - "system_notification"
negative_constraints:
  - "allowed_actions in canonical-looking HITL storage shapes remains a gate risk until reflected in owner docs."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-010 - Gate Risk Gap And Stale Addenda Treatment

```yaml
plan_unit_id: PG-010
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Gate risk inventory must preserve transfer coverage blockers, stale addenda signals, and deprecated alias retirement as gate-risk inputs.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Gate Risk Gap And Stale Addenda Treatment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "cov-034"
  - "cov-511"
  - "cov-526"
  - "transfer-coverage"
  - "owner-definition"
  - "append-only addenda"
negative_constraints:
  - "Owner-definition gaps are not merely missing evidence-collection gaps."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-011 - Route-Aware Progression Owner Boundary

```yaml
plan_unit_id: PG-011
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression gates own promotion evidence, route/open packet verification, and compatibility checks before run sealing and archival.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "Route-Aware Progression Owner Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0006
preserved_exact_tokens:
  - "promotion evidence"
  - "route/open packet verification"
  - "compatibility checks"
  - "run sealing"
  - "archival"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-012 - Promotion Classes And Evidence Fields

```yaml
plan_unit_id: PG-012
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Promotions use READY, STAGED, HELD, and REJECTED classes with required machine-readable evidence fields per class.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Promotion Classes And Evidence Fields remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0007
preserved_exact_tokens:
  - "READY"
  - "STAGED"
  - "HELD"
  - "REJECTED"
  - "concern_summary"
  - "blockers"
  - "gate_waiver_rule"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-013 - Route-Aware Wiring Evidence

```yaml
plan_unit_id: PG-013
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Route awareness requires target reachability, valid OpenSubject resolution, run-command reflection, and linked route side effects.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Route-Aware Wiring Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0008
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "route_completion_refs[]"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-014 - Packet Route/Open Checks

```yaml
plan_unit_id: PG-014
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet gates verify route targets, OpenSubject confirmations or waivers, and sealed cross-run artifact dependencies.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Packet Route/Open Checks remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0009
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "cross-packet route/open references"
  - "sealed"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-015 - Compatibility Fallback And Contradiction Rules

```yaml
plan_unit_id: PG-015
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Unreachable route targets enter HELD state, contradictory subject state emits REJECTION, and waivers require durable project config.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Compatibility Fallback And Contradiction Rules remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0010
preserved_exact_tokens:
  - "HELD"
  - "REJECTION"
  - "subject_state_contradiction"
  - "gate_waiver_rule"
negative_constraints:
  - "Route target loss or OpenSubject contradiction must not fail silently."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-016 - Verifier Role And Run-Gates Coverage

```yaml
plan_unit_id: PG-016
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The AI Verifier runs gates exactly as written, blocks on any failure, relies only on machine-checkable artifacts, and exposes current run-gates coverage.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "Verifier Role And Run-Gates Coverage remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0011
preserved_exact_tokens:
  - "AI-only"
  - "MUST"
  - "MUST NOT"
  - "python3 scripts/pm-plans-verify.py run-gates"
  - "GATE-001"
  - "GATE-014"
negative_constraints:
  - "The Verifier MUST NOT require a human to read logs or approve decisions."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
  - "ContractRef: PolicyRule:Decision_Policy.md§4"
  - "ContractRef: SchemaID:plan_graph.schema.json"
  - "ContractRef: Gate:GATE-001, Gate:GATE-002, Gate:GATE-004, Gate:GATE-005, Gate:GATE-006, Gate:GATE-009, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-017 - Verifier Scope Boundary

```yaml
plan_unit_id: PG-017
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Repo-local run-gates governs build-governing Puppet Master repository artifacts; generated user-project artifacts must satisfy relevant contracts but need explicit validator coverage.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Verifier Scope Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0012
preserved_exact_tokens:
  - ".puppet-master/project/**"
  - "build-governing Puppet Master repository artifacts"
  - "run-gates"
negative_constraints:
  - "Generated user-project artifacts are not implied to be fully covered by the current repo-local run-gates script unless a validator explicitly targets them."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-018 - Top-Level Result Normalization

```yaml
plan_unit_id: PG-018
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Top-level progression treats any non-PASS as blocking while preserving gate-specific states, raw model IDs, recovery pointers, and review outcomes.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Top-Level Result Normalization remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0014
preserved_exact_tokens:
  - "PASS"
  - "FAIL"
  - "blocking non-pass outcome"
  - "raw IDs exact"
  - "r-20260312-203855-07"
  - "packetized"
  - "quorum result"
negative_constraints:
  - "Any gate state other than PASS is a blocking non-pass top-level outcome."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, Gate:GATE-012, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-019 - Route Result And FileManager UI Boundary

```yaml
plan_unit_id: PG-019
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Route evidence owns normalized route identity; FileManager UI may consume open/copy behavior but must not re-own route identity.
gui_related: true
gui_classification_reason: >-
  This unit explicitly separates route identity from FileManager UI open/copy presentation behavior.
split_recommended: false
depends_on:
  - "PG-018"
unblocks: []
acceptance_criteria:
  - "Route Result And FileManager UI Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0014
preserved_exact_tokens:
  - "routing/deep-link normalization"
  - "FileManager UI conveniences"
  - "open/copy"
  - "normalized route identity"
negative_constraints:
  - "FileManager UI conveniences are not the owner of normalized route identity."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, Gate:GATE-012, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-020 - Node-Model Gate Replacement

```yaml
plan_unit_id: PG-020
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Package, seam, and lane gates replace legacy tier-level gates while inheriting existing blocking, approval, timeout, and remediation behavior.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Node-Model Gate Replacement remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0015
preserved_exact_tokens:
  - "Legacy tier-level gate definitions are replaced"
  - "package-"
  - "seam-"
  - "lane-scoped progression gates"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-021 - Package Complete Gate

```yaml
plan_unit_id: PG-021
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  A package cannot report completion until all constituent nodes are resolved to completed, skipped, or failed with remediation recorded.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Package Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0016
preserved_exact_tokens:
  - "package_complete_gate"
  - "completed"
  - "skipped"
  - "failed"
  - "remediation recorded"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-022 - Seam Complete Gate

```yaml
plan_unit_id: PG-022
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Seam completion requires source package completion, target prerequisites, transition readiness, contract compatibility, and feature-seam overseer coherence evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Seam Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0017
preserved_exact_tokens:
  - "seam_complete_gate"
  - "source package"
  - "target package prerequisites"
  - "feature-seam overseer evidence"
  - "authority to withhold"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-023 - Lane Complete Gate

```yaml
plan_unit_id: PG-023
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  A lane cannot report done until every assigned package satisfies package_complete_gate.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Lane Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0018
preserved_exact_tokens:
  - "lane_complete_gate"
  - "package_complete_gate"
  - "done"
  - "GATE-001"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-024 - GATE-001 Schema Validation

```yaml
plan_unit_id: PG-024
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-001 validates schema-governed plan graph, evidence, change-budget, and auto-decision artifacts.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-001 Schema Validation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0019
preserved_exact_tokens:
  - "GATE-001"
  - "Plans/plan_graph.json"
  - "evidence.json"
  - "checks[]"
  - "GATE-002"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:plan_graph.schema.json, SchemaID:evidence.schema.json, SchemaID:change_budget.schema.json, SchemaID:auto_decisions.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-025 - GATE-002 Spec Lock Integrity

```yaml
plan_unit_id: PG-025
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-002 verifies Spec Lock versions, locked decisions, and SSOT hashes with empty mismatch evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-002 Spec Lock Integrity remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0020
preserved_exact_tokens:
  - "GATE-002"
  - "Plans/Spec_Lock.json"
  - "canonical_ssot_hashes.files[*].sha256"
  - "GATE-003"
negative_constraints:
  - "Spec Lock hash verification evidence must be empty of mismatches."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-026 - GATE-003 Architecture Invariants

```yaml
plan_unit_id: PG-026
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-003 requires invariant evidence for no secrets and naming compliance, currently via dedicated implementation verifiers rather than run-gates.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-003 Architecture Invariants remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0021
preserved_exact_tokens:
  - "GATE-003"
  - "INV-002"
  - "INV-010"
  - "no secrets"
  - "token-like strings"
  - "not currently enforced by run-gates"
negative_constraints:
  - "Secrets and token-like strings must not be persisted in logs, state, events, or evidence."
preserved_contractrefs:
  - "ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-027 - GATE-004 Forbidden Deps And Drift Phrases

```yaml
plan_unit_id: PG-027
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-004 blocks forbidden dependencies and drift phrases; current run-gates enforces the drift-phrase half.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-004 Forbidden Deps And Drift Phrases remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0022
preserved_exact_tokens:
  - "GATE-004"
  - "TBD"
  - "Open Questions"
  - "ask later"
  - "forbidden deps"
negative_constraints:
  - "No build-governing doc may introduce forbidden dependencies or drift phrases."
preserved_contractrefs:
  - "ContractRef: SchemaID:Spec_Lock.json#forbidden_deps, ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-028 - GATE-005 Completion Evidence

```yaml
plan_unit_id: PG-028
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-005 prevents node completion unless its evidence bundle exists and validates.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-005 Completion Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0023
preserved_exact_tokens:
  - "GATE-005"
  - "node cannot be marked complete"
  - "evidence bundle"
  - "non-example nodes"
negative_constraints:
  - "A node cannot be marked complete unless its evidence bundle exists and validates."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, SchemaID:plan_graph.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-029 - GATE-006 Change Budget

```yaml
plan_unit_id: PG-029
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-006 requires actual changes to stay within declared node change budgets.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-006 Change Budget remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0024
preserved_exact_tokens:
  - "GATE-006"
  - "max files"
  - "LOC delta"
  - "allowed/forbidden paths/files"
  - "bounded change fields"
negative_constraints:
  - "Actual changes must stay within the node declared change budget."
preserved_contractrefs:
  - "ContractRef: SchemaID:change_budget.schema.json, SchemaID:plan_graph.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-030 - GATE-009 ContractRef Coverage

```yaml
plan_unit_id: PG-030
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-009 requires operational requirement lines to carry ContractRef coverage and emits an empty missing-line report on pass.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-009 ContractRef Coverage remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0025
preserved_exact_tokens:
  - "GATE-009"
  - "ContractRef:"
  - "MUST"
  - "MUST NOT"
  - "SHALL"
  - "REQUIRED"
  - "NEVER"
negative_constraints:
  - "The missing ContractRef report must be empty on pass."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/DRY_Rules.md#9"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-031 - GATE-010 Route Command Failure Rules

```yaml
plan_unit_id: PG-031
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-010 fails invalid wrapper, alias, routed-command, owner-defect, layout/runtime mismatch, stale identity, and reserved namespace cases.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-007"
  - "PG-013"
unblocks: []
acceptance_criteria:
  - "GATE-010 Route Command Failure Rules remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0026
preserved_exact_tokens:
  - "GATE-010"
  - "public wrapper command"
  - "deprecated alias"
  - "route_target"
  - "OpenSubject"
  - "request_id"
  - "tier_id"
  - "git*"
  - "actions*"
negative_constraints:
  - "Deprecated aliases must not be treated as independent canonical commands."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-032 - GATE-010 Evidence Payload

```yaml
plan_unit_id: PG-032
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-010 evidence captures command identity, kind, metadata, binding, emitted contract or action family, and invalid-row reason.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-031"
unblocks: []
acceptance_criteria:
  - "GATE-010 Evidence Payload remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0026
preserved_exact_tokens:
  - "command ID"
  - "command kind"
  - "normalization metadata"
  - "handler binding"
  - "failure reason"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/evidence.schema.json, ContractName:Plans/Wiring_Matrix.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-033 - GATE-011 Traceability Pass/Fail Conditions

```yaml
plan_unit_id: PG-033
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-011 requires requirements coverage JSON/Markdown sync, schema validity, zero uncovered or orphaned coverage, and per-requirement node plus acceptance mappings.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-011 Traceability Pass/Fail Conditions remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
preserved_exact_tokens:
  - "GATE-011"
  - "requirements_coverage.json"
  - "requirements_coverage.md"
  - "uncovered_requirements[]"
  - "orphaned_node_requirement_refs[]"
  - "uncovered_acceptance[]"
negative_constraints:
  - "All uncovered, orphaned, and missing mapping lists must be empty."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md§11.4, Gate:GATE-011"
  - "ContractRef: Gate:GATE-011"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-034 - GATE-011 Evidence And Enforcement Status

```yaml
plan_unit_id: PG-034
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-011 evidence must include machine-readable check entries and failure-detail arrays; script enforcement remains future traceability-tooling work.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-033"
unblocks: []
acceptance_criteria:
  - "GATE-011 Evidence And Enforcement Status remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
preserved_exact_tokens:
  - "requirements_coverage_json_validates"
  - "requirements_coverage_md_sync"
  - "per_requirement_minimum_mappings"
  - "integrity_checks_pass"
  - "missing_in_md_ids[]"
negative_constraints:
  - "All failure-detail arrays must be empty on PASS."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:evidence.schema.json, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-035 - GATE-012 Requirements Quality Boundary

```yaml
plan_unit_id: PG-035
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-012 evaluates the latest requirements quality report and blocks executable plan-node progression unless the report exists, validates, passes, and has no clarification items.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
  - "PG-018"
unblocks: []
acceptance_criteria:
  - "GATE-012 Requirements Quality Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "GATE-012"
  - "requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "verdict == \"PASS\""
  - "needs_user_clarification[]"
  - "BLOCKED"
  - "FAIL"
negative_constraints:
  - "Puppet Master MUST NOT start or resume executable plan-node progression while GATE-012 is BLOCKED or FAIL."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-012, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md#6.4-requirements-quality-report-boundary-severity-and-persistence"
  - "ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-036 - GATE-012 Clarification Escalation

```yaml
plan_unit_id: PG-036
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Non-empty needs_user_clarification[] puts GATE-012 in BLOCKED and must surface every clarification item through the UI escalation path until explicit user input resolves it.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible blocked clarification escalation through thread and dashboard UI surfaces.
split_recommended: false
depends_on:
  - "PG-035"
unblocks: []
acceptance_criteria:
  - "GATE-012 Clarification Escalation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "thread badge"
  - "in-thread clarification message"
  - "dashboard CtA"
  - "attention_required"
  - "requirements.clarification_requested"
  - "wizard_id"
  - "thread_id"
  - "question_id"
negative_constraints:
  - "Puppet Master MUST NOT advance while clarification items are unresolved."
  - "Puppet Master MUST NOT auto-resolve clarification items."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-037 - GATE-012 Evidence And Re-Run

```yaml
plan_unit_id: PG-037
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-012 evidence must classify state from verdict plus needs_user_clarification[], include blocked escalation and redaction evidence, and require a later PASS report before progression resumes.
gui_related: true
gui_classification_reason: >-
  This unit includes UI escalation evidence and blocked-state presentation validation.
split_recommended: false
depends_on:
  - "PG-035"
  - "PG-036"
unblocks: []
acceptance_criteria:
  - "GATE-012 Evidence And Re-Run remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "checks[]"
  - "PASS"
  - "BLOCKED"
  - "FAIL"
  - "description"
  - "before"
  - "after"
  - "context"
  - "question"
  - "run-gates"
negative_constraints:
  - "Redaction evidence must prove stored report fields contain no secret-like values."
  - "Progression resumes only after a subsequent report shows needs_user_clarification[] empty and verdict PASS."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, Gate:GATE-012, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§6"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Gate:GATE-012, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-038 - GATE-013 Ambiguity Marker Resolution

```yaml
plan_unit_id: PG-038
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-013 requires every active ambiguity marker to have a schema-valid auto-decision row whose applied_to[] contains that marker ID.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-013 Ambiguity Marker Resolution remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0030
preserved_exact_tokens:
  - "<!-- AMBIGUOUS: <id> <description> -->"
  - "AMB-001"
  - ".puppet-master/project/requirements.md"
  - ".puppet-master/project/plan.md"
  - ".puppet-master/project/contracts/"
  - "auto_decisions.jsonl"
  - "applied_to[]"
negative_constraints:
  - "Duplicate active ambiguity IDs in the current artifact set are a gate failure."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-013, ContractName:Plans/Decision_Policy.md"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, ContractName:Plans/Decision_Policy.md"
  - "ContractRef: Gate:GATE-013, SchemaID:pm.auto_decisions.schema.v1"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-039 - GATE-013 Detection And Evidence

```yaml
plan_unit_id: PG-039
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-013 detection scans project artifacts, extracts marker IDs, validates matching decisions, and records grep plus decision evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-038"
unblocks: []
acceptance_criteria:
  - "GATE-013 Detection And Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0030
preserved_exact_tokens:
  - "grep -rn '<!-- AMBIGUOUS:'"
  - "decision_id"
  - "checks[]"
  - "pm.auto_decisions.schema.v1"
negative_constraints:
  - "A marker ID with no corresponding auto_decisions.jsonl entry matching applied_to[] is a FAIL."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, SchemaID:evidence.schema.json, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-040 - GATE-014 Packet Fail Conditions

```yaml
plan_unit_id: PG-040
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-014 fails packets that omit required docs, use append-only placement where replacement is required, target containers indirectly, or preserve stale gate models as peers.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "GATE-014 Packet Fail Conditions remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0031
preserved_exact_tokens:
  - "MUST CHANGE"
  - "MUST RECONCILE"
  - "append-only"
  - "structured container"
  - "package_complete_gate"
  - "seam_complete_gate"
  - "lane_complete_gate"
  - "Debug Mode"
  - "Investigation Context"
negative_constraints:
  - "Packets must not preserve stale tier-era, request-era, or legacy tier-level gate text as peer options."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-041 - Packet Document Set Rule

```yaml
plan_unit_id: PG-041
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-014 packet scope is MUST CHANGE plus MUST RECONCILE; MUST VERIFY docs are pre-emit checks and derived-only regen outputs stay out of packet intent.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
unblocks: []
acceptance_criteria:
  - "Packet Document Set Rule remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0032
preserved_exact_tokens:
  - "MUST VERIFY"
  - "protocol/checklist/reference"
  - "Plans/_shards/**"
  - "Architecture_Invariants.md"
  - "BinaryLocator_Spec.md"
  - "usage-feature.md"
negative_constraints:
  - "Verification-only docs may be absent from the packet only when reconciliation confirms they require no edits."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/feature-list.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-042 - Runtime Integrity Addendum Boundary

```yaml
plan_unit_id: PG-042
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The runtime integrity addendum introduces additional gate expectations for graph integrity, safe points, blocked semantics, wakeups, wizard blocked state, and acceptance criteria.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
unblocks: []
acceptance_criteria:
  - "Runtime Integrity Addendum Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0034
preserved_exact_tokens:
  - "Runtime Integrity and Recovery Gates Addendum (2026-03-08)"
  - "Add the following gate expectations"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-043 - Canonical Graph Integrity Gate

```yaml
plan_unit_id: PG-043
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runs must not enter canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Canonical Graph Integrity Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0035
preserved_exact_tokens:
  - "canonical sharded graph"
  - "graph_integrity"
  - "stop execution"
  - "do not silently degrade to flat canonical execution"
negative_constraints:
  - "A run MUST NOT proceed into canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-044 - Safe-Point Before Risk Gate

```yaml
plan_unit_id: PG-044
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Mutation-capable attempts require a valid runtime safe point before dispatch.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Safe-Point Before Risk Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0036
preserved_exact_tokens:
  - "mutation-capable attempt"
  - "valid runtime safe point"
  - "risky attempt"
negative_constraints:
  - "Missing safe point for a risky attempt is a gate failure."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-045 - Blocked Outcome Correctness Gate

```yaml
plan_unit_id: PG-045
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  UI and projections must not collapse blocked outcomes into failures for policy, FileSafe, side-effect confirmation, or auth-refresh blocks.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible UI/projection state separation for blocked outcomes.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Blocked Outcome Correctness Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0037
preserved_exact_tokens:
  - "UI/projections"
  - "blocked outcomes"
  - "policy denial"
  - "FileSafe blocks"
  - "external side-effect confirmation blocks"
  - "auth refresh blocks"
negative_constraints:
  - "Blocked outcomes must stay distinct from failures."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-046 - Event-Driven Wakeup Gate

```yaml
plan_unit_id: PG-046
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler correctness must use event-driven authoritative wakeups rather than timer polling.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Event-Driven Wakeup Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0038
preserved_exact_tokens:
  - "Scheduler correctness"
  - "timer polling"
  - "Authoritative wakeups"
  - "event-driven"
negative_constraints:
  - "Scheduler correctness must not depend on timer polling."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-047 - Wizard Blocked State Gate

```yaml
plan_unit_id: PG-047
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Wizard flows must persist blocked as a canonical state distinct from attention_required.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Wizard Blocked State Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0039
preserved_exact_tokens:
  - "blocked"
  - "canonical persisted state"
  - "attention_required"
negative_constraints:
  - "Wizard blocked state must not collapse into attention_required."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-048 - Runtime Integrity Acceptance Criteria

```yaml
plan_unit_id: PG-048
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime integrity acceptance requires graph stop, safe-point enforcement, blocked/failed UI separation, event-driven scheduling, and real wizard blocked handling.
gui_related: true
gui_classification_reason: >-
  This unit includes acceptance for blocked/failed UI state separation.
split_recommended: false
depends_on:
  - "PG-043"
  - "PG-044"
  - "PG-045"
  - "PG-046"
  - "PG-047"
unblocks: []
acceptance_criteria:
  - "Runtime Integrity Acceptance Criteria remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0040
preserved_exact_tokens:
  - "Invalid canonical graphs stop execution"
  - "Risky execution"
  - "Blocked/failed semantics"
  - "UI state"
  - "Scheduler correctness"
  - "Wizard blocked"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-049 - Backend Runtime Verification Sweep

```yaml
plan_unit_id: PG-049
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The post-edit sweep must verify backend, runtime, storage, and provider docs align on scheduler, blocked, remediation, and recovery vocabulary.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-043"
  - "PG-044"
  - "PG-045"
  - "PG-046"
  - "PG-047"
  - "PG-048"
unblocks: []
acceptance_criteria:
  - "Backend Runtime Verification Sweep remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0041
preserved_exact_tokens:
  - "Executor_Protocol.md"
  - "wizard_status"
  - "Contracts_V0.md"
  - "storage-plan.md"
  - "Run_Graph_View.md"
  - "Orchestrator_Page.md"
  - "safe point"
  - "restore point"
  - "rollback"
  - "runtime lineage metadata"
negative_constraints:
  - "This verification sweep is mandatory work, not an optional reminder."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-050 - GUI Blocked-State Verification Sweep

```yaml
plan_unit_id: PG-050
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The post-edit sweep must verify chat, dashboard, Final GUI, wizard, and scheduler/remediation GUI surfaces model blocked state consistently.
gui_related: true
gui_classification_reason: >-
  This unit validates GUI/chat/FinalGUI blocked-state surfaces.
split_recommended: false
depends_on:
  - "PG-045"
  - "PG-049"
unblocks: []
acceptance_criteria:
  - "GUI Blocked-State Verification Sweep remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0041
preserved_exact_tokens:
  - "assistant-chat-design.md"
  - "blocked thread state"
  - "FinalGUISpec.md"
  - "wizard_blocked"
  - "GUI surfaces"
  - "event-driven/no-polling"
negative_constraints:
  - "blocked thread state must not be punted out of scope."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-051 - Runtime Packet Terminology Gate

```yaml
plan_unit_id: PG-051
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime packet verification must align terminology across executor, contracts, storage, UI, and providers, forbid lexical dispatch, preserve blocked semantics, and expose queue analysis in a canonical UI surface.
gui_related: true
gui_classification_reason: >-
  This unit includes canonical UI surface visibility for queue-analysis and blocked semantics.
split_recommended: false
depends_on:
  - "PG-049"
  - "PG-050"
unblocks: []
acceptance_criteria:
  - "Runtime Packet Terminology Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0042
preserved_exact_tokens:
  - "attempt / blocked / safe-point / remediation"
  - "pure lexical dispatch"
  - "generic failures"
  - "pre-lock stages"
  - "queue-analysis visibility"
  - "canonical UI surface"
negative_constraints:
  - "Blocked outcomes must not be mislabeled as generic failures."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-052 - Packet Structural Repair Gate

```yaml
plan_unit_id: PG-052
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet verification must reject incomplete recovery or unsafe section targeting, including trailing-subsection replace_section plans without a later same-level anchor.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
  - "PG-051"
unblocks: []
acceptance_criteria:
  - "Packet Structural Repair Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0042
preserved_exact_tokens:
  - "append"
  - "verify_only"
  - "replace_section"
  - "Plans/Media_Generation_and_Capabilities.md"
  - "### 5.2 Disabled-reason messages"
  - "## 5. UI copy strings"
  - "## 6. Acceptance criteria"
  - "/Progression"
negative_constraints:
  - "A recovery-plan cannot leave active blockers unresolved by choosing append or verify_only when replace_section is required."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-053 - Scheduler Canonical Alignment

```yaml
plan_unit_id: PG-053
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler packet alignment must preserve canonical event-name precedence, forbid post-lock graph degradation, remove lexical dispatch, and honor wake/restore overrides.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-051"
unblocks: []
acceptance_criteria:
  - "Scheduler Canonical Alignment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0043
preserved_exact_tokens:
  - "scheduler.pass"
  - "legacy aliases"
  - "run.graph_canonical_locked"
  - "same-cycle prerequisite wake"
  - "FileSafe restore-before-rerun"
negative_constraints:
  - "Graph degradation fallback is forbidden after run.graph_canonical_locked."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-054 - Scheduler UI Projection Alignment

```yaml
plan_unit_id: PG-054
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler alignment must keep blocked outcomes distinct from failures in UI/projections.
gui_related: true
gui_classification_reason: >-
  This unit validates UI/projection state alignment.
split_recommended: false
depends_on:
  - "PG-045"
  - "PG-053"
unblocks: []
acceptance_criteria:
  - "Scheduler UI Projection Alignment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0043
preserved_exact_tokens:
  - "blocked outcomes"
  - "failures"
  - "UI/projections"
negative_constraints:
  - "Blocked outcomes must remain distinct from failures in UI/projections."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-055 - Runtime Packet Contradiction-Fail Consolidation

```yaml
plan_unit_id: PG-055
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet verification must fail if primary or summary docs retain runtime contradictions in dispatch, blocked payloads, identity, clarification state, command IDs, or hidden retries.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-051"
  - "PG-053"
unblocks: []
acceptance_criteria:
  - "Runtime Packet Contradiction-Fail Consolidation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0044
preserved_exact_tokens:
  - "lexical ready-node selection"
  - "recovery_options[]"
  - "allowed_actions[]"
  - "failure_class"
  - "analysis_id"
  - "scheduler_pass_id"
  - "attention_required"
  - "exact canonical command ids"
negative_constraints:
  - "Provider/auth/tool docs must not authorize hidden local retry loops after runtime classification exists."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-056 - Canonical Blocked Payload Field Name

```yaml
plan_unit_id: PG-056
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The sole canonical blocked payload field is allowed_action_ids[]; deprecated names are defects outside deprecation, migration, or gate-detection text.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-055"
unblocks: []
acceptance_criteria:
  - "Canonical Blocked Payload Field Name remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0046
preserved_exact_tokens:
  - "recovery_options[]"
  - "allowed_actions[]"
  - "allowed_action_ids[]"
  - "payload definition"
  - "schema"
  - "storage shape"
  - "contract"
  - "HITL"
  - "FileSafe"
  - "container publishing"
negative_constraints:
  - "Accept recovery_options[] or allowed_actions[] only in deprecation notices, migration notes, or gate rules that detect them as defects."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-057 - Runtime Recovery Canonicalization Gate

```yaml
plan_unit_id: PG-057
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime recovery sweeps must fail deprecated blocked payload fields, stale append-only contradictions, analysis_id queue identity, and blocked-reason-as-failure-class modeling.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-056"
unblocks: []
acceptance_criteria:
  - "Runtime Recovery Canonicalization Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0047
preserved_exact_tokens:
  - "allowed_actions[]"
  - "recovery_options[]"
  - "analysis_id"
  - "scheduler_pass_id"
  - "failure_class"
  - "stale canonical text"
negative_constraints:
  - "Deprecated names are accepted only inside deprecation notices, migration notes, or gate rules that detect them as defects."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-001 - Progression Gates Retired Source-Preserving Bridge

```yaml
plan_unit_id: PG-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  PG-001 is a retired source-preserving bridge for generated PDS Owner / Consumer Map, PlanUnits, and Migration Coverage audit material. Product prose from Progression_Gates-S0001 through Progression_Gates-S0047 is covered by fine-grained PG-002 through PG-057; Progression_Gates-S0048, Progression_Gates-S0049, and Progression_Gates-S0051 are generated structural/audit metadata, and Progression_Gates-S0050 is retired bridge lineage. No residual source_preserving_planunit product coverage remains for Plans/Progression_Gates.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related source tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - PG-002
  - PG-003
  - PG-004
  - PG-005
  - PG-006
  - PG-007
  - PG-008
  - PG-009
  - PG-010
  - PG-011
  - PG-012
  - PG-013
  - PG-014
  - PG-015
  - PG-016
  - PG-017
  - PG-018
  - PG-019
  - PG-020
  - PG-021
  - PG-022
  - PG-023
  - PG-024
  - PG-025
  - PG-026
  - PG-027
  - PG-028
  - PG-029
  - PG-030
  - PG-031
  - PG-032
  - PG-033
  - PG-034
  - PG-035
  - PG-036
  - PG-037
  - PG-038
  - PG-039
  - PG-040
  - PG-041
  - PG-042
  - PG-043
  - PG-044
  - PG-045
  - PG-046
  - PG-047
  - PG-048
  - PG-049
  - PG-050
  - PG-051
  - PG-052
  - PG-053
  - PG-054
  - PG-055
  - PG-056
  - PG-057
unblocks: []
acceptance_criteria:
  - PG-001 does not override PG-002 through PG-057 for Progression_Gates-S0001 through Progression_Gates-S0047.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Progression_Gates.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: progression_gates_residual_bridge
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0049
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0051
preserved_exact_tokens:
  - "PG-001"
  - "Progression Gates (Canonical) Source-Preserving PlanUnit"
  - "Progression Gates Residual Source-Preserving Bridge"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "PG-002"
  - "PG-057"
  - "Progression_Gates-S0048"
  - "Progression_Gates-S0049"
  - "Progression_Gates-S0050"
  - "Progression_Gates-S0051"
negative_constraints:
  - "PG-001 must not be used as implementation-ready product coverage for spans now mapped to PG-002 through PG-057."
  - "Do not remap Progression_Gates-S0001 through Progression_Gates-S0047 product coverage back to PG-001."
  - "PG-001 must not re-enter source_preserving_planunit mode after phase2b-149."
owner_hints:
  - Plans/Progression_Gates.md
```
