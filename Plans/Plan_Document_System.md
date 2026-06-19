# Plan Document System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns the Plan document layout, PlanUnit standard, lossless conversion protocol, and generated PlanUnit index boundary.

## 0. Scope

This document is the canonical owner for stable PlanUnits, the standard Plan doc layout family, owner/consumer discipline, lossless conversion rules, generated PlanUnit indexes, authoring profiles for new owner docs, and the `gui_related: true|false` field carried by every PlanUnit.

The system is intentionally standard but not rigid for existing migrated docs. Newly created owner docs have a stricter authoring profile so fresh Plans canon starts in a predictable shape instead of inheriting source-preserving migration scaffolding.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Planning_Ledger_System.md

## 1. Profiles And Standard Document Shape

Plan docs use one of two profile families.

### 1.1 Legacy Converted Plan Profile

The Legacy Converted Plan Profile applies to existing migrated docs and controlled lossless conversion batches. These docs may preserve historical layout, source-preserving sections, migration coverage tables, and doc-type-specific structure when PlanUnits, PlanUnit index coverage, and migration coverage are valid.

Legacy converted docs are not required to adopt the New Plan Authoring Profile heading sequence retroactively. A later cleanup may move a legacy doc to the new profile only through a lossless conversion proof or explicit profile migration.

### 1.2 New Plan Authoring Profile

The New Plan Authoring Profile applies to newly created top-level owner docs under `Plans/*.md` unless an explicit exemption is recorded in the new doc authority note and supported by a PlanUnit or owner-map governance note.

New owner docs must not use `source_preserving_planunit` for new feature content. That mode is reserved for lossless legacy conversion of existing Plans docs and is not an authoring shortcut for fresh canon.

A new owner doc using this profile declares it in the authority preamble with:

```text
> **PlanProfile:** New Plan Authoring Profile
```

An exempted new owner doc must instead record a specific profile exemption in its authority preamble and explain why the standard base layout cannot safely apply.

### 1.3 Required New Plan Base Layout

New Plan Authoring Profile docs use this exact base section order:

1. Compliance / authority note
2. `## 0. Scope`
3. `## 1. Ownership And Consumers`
4. `## 2. Canonical PlanUnits`
5. `## 3. Contracts, Schemas, Events, Or Data Shapes`
6. `## 4. Integration Surfaces`
7. `## 5. Validation And Acceptance`
8. `## 6. Plan-To-Node Readiness`
9. `## 7. Deferred, Retired, Compatibility, And Non-Goals`
10. `## 8. Source Lineage And Governance`

Doc-type modules and appendices may be nested under the required base sections. Non-applicable required sections remain present and state `not_applicable` rather than disappearing, so indexers and future agents can distinguish "not applicable" from "missing."

### 1.4 Shared Standard Shape

A standardized Plan doc uses:

- scope and authority summary;
- owner/consumer map when cross-doc boundaries exist;
- PlanUnits for canonical requirements, constraints, decisions, validation rules, deferred items, compatibility-only notes, and node-relevant hints;
- coverage/disposition tables for migrated material;
- ContractRef annotations for operational requirements under `Plans/DRY_Rules.md`.

Doc-type modules may add UI sections, storage schemas, command tables, event tables, validation matrices, migration notes, or appendices. Non-applicable modules are recorded as `not_applicable` when the omission matters for lossless conversion.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Plan_Document_System.md

## 2. PlanUnits

### PDS-001 - Plan Document System Ownership

```yaml
plan_unit_id: PDS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Plans/Plan_Document_System.md owns plan-doc layout, the PlanUnit standard, governance-facing validators, lossless conversion rules, generated indexes, and node-readiness metadata.
gui_related: false
gui_classification_reason: Plan document structure and validators are docs/governance behavior, not GUI work.
depends_on: [PLS-001]
unblocks: [PDS-002, PDS-004, PDS-011, BPM-004]
acceptance_criteria:
  - The doc defines stable PlanUnit fields and layout expectations.
  - Future conversion work can cite this doc as the owner for PlanUnit shape.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
risk_class: governance_standard
reasoning_tier: standard
context_scope: all_plans
implementation_surfaces: [Plans/*.md, Plans/.plan_index]
node_compile_hint: {mode: index_owner, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0015
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Plans/Plan_Document_System.md", "PlanUnit"]
negative_constraints: []
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md

### PDS-002 - Standard But Not Rigid Layout

```yaml
plan_unit_id: PDS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Existing migrated Plan docs use a base required layout plus doc-type modules. Existing Plans are not forced into one rigid identical skeleton in a single unsafe pass; newly created owner docs use the stricter New Plan Authoring Profile unless explicitly exempted.
gui_related: false
gui_classification_reason: Documentation structure is not GUI implementation work.
depends_on: [PDS-001]
unblocks: [BPM-004, PDS-011]
acceptance_criteria:
  - Conversion inventories distinguish base sections from doc-type modules.
  - Non-applicable modules use not_applicable where needed for proof.
validation_surfaces:
  - Migration inventory coverage map.
  - Pilot conversion validation.
risk_class: migration_safety
reasoning_tier: standard
context_scope: all_plans
implementation_surfaces: [Plans/*.md]
node_compile_hint: {mode: doc_layout_metadata, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0019
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["base required layout", "doc-type modules", "not_applicable", "New Plan Authoring Profile"]
negative_constraints:
  - Do not force all existing Plans into a rigid identical layout in one unsafe pass.
  - Do not let the legacy-conversion profile weaken the required layout for newly created owner docs.
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PDS-003 - PlanUnit Required Fields

```yaml
plan_unit_id: PDS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Every PlanUnit is a canonical addressable unit with plan_unit_id, unit_type, status, owner_doc, canonical_text, gui_related true/false, source_lineage, depends_on, unblocks, acceptance_criteria, validation_surfaces, risk_class, reasoning_tier, context_scope, implementation_surfaces, and node_compile_hint.
gui_related: false
gui_classification_reason: The field contract is metadata/governance behavior, not GUI implementation work.
depends_on: [PDS-001, PLS-005]
unblocks: [PDS-006, PNC-002, PNC-004]
acceptance_criteria:
  - Every PlanUnit includes gui_related true/false.
  - Every PlanUnit preserves source_lineage and owner_doc.
  - PlanUnit fields expose enough metadata for generated indexes and future node-readiness.
validation_surfaces:
  - PlanUnit index generator.
  - Node-readiness report generator.
  - Manual coverage audit during migration.
risk_class: indexability
reasoning_tier: standard
context_scope: all_planunits
implementation_surfaces: [Plans/*.md, Plans/.plan_index/plan_units.jsonl]
node_compile_hint: {mode: planunit_schema, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0021
  - pldg-20260610-001-ledger-plan-system:atom-0022
  - pldg-20260610-001-ledger-plan-system:atom-0032
  - pldg-20260610-001-ledger-plan-system:dec-0004
  - pldg-20260610-001-ledger-plan-system:dec-0009
  - source_ref:chat:design-discussion
  - source_ref:chat:user-gui-classification-correction
preserved_exact_tokens: ["PlanUnit", "plan_unit_id", "canonical_text", "gui_related", "depends_on", "unblocks", "risk_class", "reasoning_tier", "context_scope", "node_compile_hint", "GUI", "UI", "icons", "SVGs", "images", "true", "false"]
negative_constraints:
  - Do not require the user to declare whether an item is GUI-related.
  - Do not use a granular surface taxonomy for the bootstrap standard; use a simple boolean.
owner_hints: [Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

### PDS-004 - Lossless Plan Conversion Protocol

```yaml
plan_unit_id: PDS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Existing Plans convert losslessly by hashing originals, inventorying heading/body spans, mapping every span to a standardized section, PlanUnit, preserved appendix/source block, or explicit disposition, and preserving ContractRef annotations plus anchors or aliases.
gui_related: false
gui_classification_reason: Conversion proof mechanics are not GUI implementation work.
depends_on: [PDS-001, PDS-002]
unblocks: [BPM-004]
acceptance_criteria:
  - Original file hashes are recorded before conversion.
  - Every original heading/body span has a coverage-map disposition.
  - ContractRef annotations, anchors, aliases, exact tokens, negative constraints, compatibility-only notes, and stale/retired dispositions survive conversion.
validation_surfaces:
  - Pre-hash inventory.
  - Coverage map.
  - Post-conversion validators.
risk_class: content_loss
reasoning_tier: high
context_scope: all_plans
implementation_surfaces: [Plans/*.md, future migration inventory]
node_compile_hint: {mode: migration_proof, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0020
  - pldg-20260610-001-ledger-plan-system:q-0002
  - source_ref:chat:design-discussion
  - source_ref:chat:lossless-conversion
preserved_exact_tokens: ["hash originals", "heading/body spans", "coverage map", "ContractRef", "anchors"]
negative_constraints: []
owner_hints: [Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PDS-005 - Owner Adjudication In PlanUnits

```yaml
plan_unit_id: PDS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: PlanUnits preserve owner_doc, owner_hints, candidate owners when relevant, consumer docs, and adjudication evidence. Ordinary row-level owner ambiguity is resolved during compilation; only true product decisions are returned to Jared.
gui_related: false
gui_classification_reason: Owner routing metadata is not GUI implementation work.
depends_on: [PLS-007]
unblocks: [PDS-006, BPM-004]
acceptance_criteria:
  - PlanUnits expose owner_doc and source_lineage.
  - Ambiguous migrated spans record candidate owners and adjudication evidence before conversion proceeds.
validation_surfaces:
  - Owner map review.
  - DRY Rules lint and ContractRef lint.
risk_class: owner_drift
reasoning_tier: standard
context_scope: cross_doc
implementation_surfaces: [Plans/*.md, Plans/00-plans-index.md]
node_compile_hint: {mode: owner_route_metadata, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0010
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["candidate owners", "consumer docs", "owner adjudication"]
negative_constraints:
  - Do not blindly trust queued owner hints as authority.
  - Do not block on ordinary row-level owner ambiguity.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/DRY_Rules.md

### PDS-006 - Generated PlanUnit Index Boundary

```yaml
plan_unit_id: PDS-006
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Standardized Plans may generate plan_units.jsonl, doc_cards.json, dependencies.json, acceptance_units.jsonl, coverage_report.json, and node_readiness_report.json under Plans/.plan_index/. This indexing phase catalogs PlanUnits, gui_related metadata, dependencies, validation status, blockers, readiness, receipt/ref availability, and compiler contract state for Plan/PlanUnit consumers such as Node Graph and Run Graph; it assesses readiness only and does not create WorkNodes or executable build tasks.
gui_related: false
gui_classification_reason: Index generation and readiness reporting are backend/governance behavior.
depends_on: [PDS-003, PDS-004]
unblocks: [PNC-004]
acceptance_criteria:
  - Generated indexes include gui_related true/false for every indexed PlanUnit.
  - Plan/PlanUnit readiness projections preserve blockers, validation status, gui_related inheritance, receipt status or receipt/ref availability, and compiler contract state for consumer surfaces.
  - node_readiness_report analyzes future conversion readiness only.
  - No WorkNodes or executable build queues are produced by the index phase.
validation_surfaces:
  - Future PlanUnit index generator checks.
  - Future node-readiness report checks.
risk_class: execution_boundary
reasoning_tier: standard
context_scope: plan_index
implementation_surfaces: [Plans/.plan_index/plan_units.jsonl, Plans/.plan_index/doc_cards.json, Plans/.plan_index/dependencies.json, Plans/.plan_index/acceptance_units.jsonl, Plans/.plan_index/coverage_report.json, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: readiness_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0026
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - pldg-20260610-001-ledger-plan-system:corr-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
preserved_exact_tokens: ["Plans/.plan_index/plan_units.jsonl", "doc_cards.json", "dependencies.json", "node_readiness_report.json", "PlanUnit index", "node-readiness report", "PlanUnit", "Node Graph", "Run Graph", "readiness", "blockers", "gui_related", "receipt status", "compiler contract", "Do not create WorkNodes"]
negative_constraints:
  - Do not create WorkNodes from the PlanUnit index phase.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
  - Do not generate NodeSeed candidates unless the Plan_To_Node_Compilation contract explicitly defines that candidate artifact.
owner_hints: [Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

### PDS-007 - GUI Classification Field And Native Setting Surface

```yaml
plan_unit_id: PDS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Every PlanUnit carries a simple agent-inferred gui_related boolean. Native Puppet Master should expose a simple setting such as "use different model for GUI elements?" so gui_related work can route to a configured GUI model when enabled.
gui_related: true
gui_classification_reason: This PlanUnit includes the user-visible native setting/control surface.
depends_on: [PDS-003]
unblocks: [PNC-005]
acceptance_criteria:
  - PlanUnits use only gui_related true/false for GUI routing metadata.
  - Product UI exposes a simple setting rather than a granular GUI/UI/icon/image taxonomy.
validation_surfaces:
  - Future settings UI review.
  - PlanUnit index field coverage.
risk_class: user_visible_settings
reasoning_tier: standard
context_scope: planunit_metadata_and_settings
implementation_surfaces: [Plans/*.md, future Settings UI]
node_compile_hint: {mode: route_metadata_for_future_runtime, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0032
  - pldg-20260610-001-ledger-plan-system:atom-0033
  - pldg-20260610-001-ledger-plan-system:dec-0009
  - pldg-20260610-001-ledger-plan-system:corr-0003
  - source_ref:chat:user-gui-classification-correction
  - source_ref:chat:user-gui-routing-native-setting
preserved_exact_tokens: ["gui_related", "use different model for GUI elements?", "GUI model", "user won't know what is gui or ui or icons", "llm should just determine", "tagging it as GUI is enough"]
negative_constraints:
  - Do not require the user to declare whether an item is GUI-related.
  - Do not expose a highly granular GUI/UI/icon/image routing taxonomy in the product UI.
owner_hints: [Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md


### PDS-008 - PlanUnit Block Grammar And Field Semantics

```yaml
plan_unit_id: PDS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: A PlanUnit block is a fenced YAML block containing exactly one mapping with unique keys. Each PlanUnit is extracted from live non-pipeline Plans docs into generated indexes. Required fields keep stable identity, lifecycle status, owner_doc, canonical_text, gui_related, source_lineage, dependency edges, acceptance criteria, validation surfaces, risk_class, reasoning_tier, context_scope, implementation_surfaces, and node_compile_hint machine-readable.
gui_related: false
gui_classification_reason: PlanUnit grammar and extraction rules are metadata/governance behavior, not GUI implementation work.
depends_on: [PDS-003, PLS-010]
unblocks: [PDS-006, PNC-002, PNC-004]
acceptance_criteria:
  - PlanUnit YAML parse errors and duplicate keys fail validation.
  - Generated indexes preserve every required PlanUnit field without rewriting canonical_text.
  - Existing explanatory prose can remain outside PlanUnits, but canonical requirements/decisions/constraints must become PlanUnits during conversion.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/<ledger_id>
  - Future PlanUnit index generator validation.
risk_class: indexability
reasoning_tier: standard
context_scope: all_planunits
implementation_surfaces: [Plans/*.md, Plans/ledgers/v2/schemas/plan_unit.schema.json, Plans/.plan_index/plan_units.jsonl]
node_compile_hint: {mode: planunit_block_grammar, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0037
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["```yaml", "plan_unit_id", "unit_type", "status", "owner_doc", "canonical_text", "gui_related", "source_lineage", "depends_on", "unblocks", "acceptance_criteria", "validation_surfaces", "risk_class", "reasoning_tier", "context_scope", "implementation_surfaces", "node_compile_hint"]
negative_constraints:
  - Do not allow duplicate YAML keys that silently overwrite fields.
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md

### PDS-009 - Standard Plan Document Layout Contract

```yaml
plan_unit_id: PDS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Standardized Plan docs use a base layout with compliance/authority, scope, architecture or standard summary, PlanUnits, applicable doc-type modules, migration or compilation coverage, and governance/validation notes. Doc-type modules may be marked not_applicable when a section would otherwise imply missing content. Existing docs convert to this layout only through a lossless inventory and pilot/batch workflow.
gui_related: false
gui_classification_reason: Plan document layout is not GUI implementation work.
depends_on: [PDS-002, PDS-004, PDS-011]
unblocks: [BPM-004, PDS-012]
acceptance_criteria:
  - The converter can identify where each original span lands in the standardized layout.
  - Required layout sections are present or have explicit not_applicable disposition when relevant.
  - Doc-type modules do not force unnatural content into unrelated owner docs.
validation_surfaces:
  - Migration inventory coverage map.
  - Pilot conversion report.
  - Post-conversion plan validators.
risk_class: migration_safety
reasoning_tier: standard
context_scope: all_plans
implementation_surfaces: [Plans/*.md, Plans/.plan_migration]
node_compile_hint: {mode: standardized_doc_layout, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0038
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["compliance", "scope", "PlanUnits", "doc-type modules", "not_applicable", "migration coverage", "governance/validation"]
negative_constraints:
  - Do not rewrite all Plans into one rigid skeleton without doc-type modules.
owner_hints: [Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PDS-010 - Lossless Migration Artifact Contract

```yaml
plan_unit_id: PDS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  Lossless conversion of existing Plans must produce migration artifacts before
  broad edits: inventory.json, original_hashes.json, span_map.jsonl,
  coverage_map.jsonl, anchor_aliases.json, pilot_report.json,
  batch_report.jsonl, and validation_report.json under a run-scoped migration
  directory. These artifacts prove every original heading/body span is preserved,
  moved, converted to a PlanUnit, placed in an appendix/source block, or
  explicitly dispositioned.
gui_related: false
gui_classification_reason: Migration proof artifacts are not GUI implementation work.
depends_on: [PDS-004, PDS-009]
unblocks: [BPM-004]
acceptance_criteria:
  - No broad conversion starts until original hashes, span map, and coverage map exist.
  - Every original span has exactly one final disposition or an explicit split disposition.
  - A pilot report passes before batch conversion continues.
validation_surfaces:
  - Plans/.plan_migration/<run_id>/coverage_map.jsonl
  - Plans/.plan_migration/<run_id>/validation_report.json
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: content_loss
reasoning_tier: high
context_scope: all_plans
implementation_surfaces: [Plans/.plan_migration, Plans/*.md]
node_compile_hint: {mode: migration_artifact_contract, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0038
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["inventory.json", "original_hashes.json", "span_map.jsonl", "coverage_map.jsonl", "anchor_aliases.json", "pilot_report.json", "batch_report.jsonl", "validation_report.json"]
negative_constraints:
  - Do not delete or semantically change original content without coverage-map proof.
owner_hints: [Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PDS-011 - Plan Authoring Profiles

```yaml
plan_unit_id: PDS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Plan_Document_System.md defines two Plan document profiles. Legacy Converted Plan Profile docs may preserve historical migrated layout when PlanUnits, indexes, and coverage are valid. New Plan Authoring Profile docs are newly created Plans/*.md owner docs and must use the standard base layout unless explicitly exempted.
gui_related: false
gui_classification_reason: Plan authoring profiles are documentation/governance behavior, not GUI implementation work.
depends_on: [PDS-001, PDS-002]
unblocks: [PDS-012, PDS-013, BPM-002]
acceptance_criteria:
  - Existing migrated docs can retain historical layout under the Legacy Converted Plan Profile when PlanUnit and coverage validation pass.
  - Newly created top-level owner docs under Plans/*.md use the New Plan Authoring Profile unless an explicit exemption is recorded.
  - The two profiles do not create a peer alternative for new docs to use source-preserving migration scaffolding.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Manual plan review for profile declarations and exemptions.
risk_class: authoring_drift
reasoning_tier: standard
context_scope: all_plans
implementation_surfaces: [Plans/*.md, Plans/Plan_Document_System.md, Plans/bootstrap/Codex_Prompts.md]
node_compile_hint: {mode: plan_profile_contract, create_worknodes: false}
source_lineage:
  - source_ref:chat:2026-06-13-new-plan-authoring-profile-goal
preserved_exact_tokens: ["Legacy Converted Plan Profile", "New Plan Authoring Profile", "Plans/*.md", "standard base layout"]
negative_constraints:
  - Do not re-convert existing Plans solely to satisfy the New Plan Authoring Profile.
  - Do not treat legacy converted layout compatibility as permission for newly created owner docs to skip the standard base layout.
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md

### PDS-012 - New Plan Authoring Base Layout

```yaml
plan_unit_id: PDS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  New Plan Authoring Profile docs use this required base layout in order:
  Compliance / authority note, 0. Scope, 1. Ownership And Consumers,
  2. Canonical PlanUnits, 3. Contracts, Schemas, Events, Or Data Shapes,
  4. Integration Surfaces, 5. Validation And Acceptance, 6. Plan-To-Node
  Readiness, 7. Deferred, Retired, Compatibility, And Non-Goals, and
  8. Source Lineage And Governance.
gui_related: false
gui_classification_reason: Required Plan doc headings are documentation/governance behavior, not GUI implementation work.
depends_on: [PDS-011, PDS-009]
unblocks: [PDS-013]
acceptance_criteria:
  - A newly created owner doc declares the New Plan Authoring Profile in its compliance/authority preamble.
  - Required base sections appear in the canonical order with the specified headings.
  - Non-applicable sections remain present and state not_applicable rather than disappearing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Manual review during ledger-to-Plans compilation.
risk_class: layout_drift
reasoning_tier: standard
context_scope: new_owner_docs
implementation_surfaces: [Plans/*.md, Plans/bootstrap/Codex_Prompts.md]
node_compile_hint: {mode: new_plan_authoring_layout, create_worknodes: false}
source_lineage:
  - source_ref:chat:2026-06-13-new-plan-authoring-profile-goal
preserved_exact_tokens: ["Compliance / authority note", "0. Scope", "1. Ownership And Consumers", "2. Canonical PlanUnits", "3. Contracts, Schemas, Events, Or Data Shapes", "4. Integration Surfaces", "5. Validation And Acceptance", "6. Plan-To-Node Readiness", "7. Deferred, Retired, Compatibility, And Non-Goals", "8. Source Lineage And Governance", "not_applicable"]
negative_constraints:
  - Do not omit a required New Plan base section merely because the section has no applicable content.
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md

### PDS-013 - New Plan Layout Validation Boundary

```yaml
plan_unit_id: PDS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: Plan layout validation applies strictly to docs that explicitly declare the New Plan Authoring Profile. Legacy converted docs are not failed for historical layout. New profile docs must not contain source_preserving_planunit mode for new feature content.
gui_related: false
gui_classification_reason: Layout validation is governance/tooling behavior, not GUI implementation work.
depends_on: [PDS-012, PDS-006]
unblocks: []
acceptance_criteria:
  - The validator can identify New Plan Authoring Profile docs by an explicit authority-preamble marker.
  - The validator checks required base heading order only for New Plan Authoring Profile docs.
  - Legacy converted docs are not failed for preserving historical layout.
  - New profile docs fail validation if they use source_preserving_planunit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: false_layout_failure
reasoning_tier: standard
context_scope: plan_index_validation
implementation_surfaces: [scripts/pm-plan-index.py, Plans/*.md]
node_compile_hint: {mode: new_profile_layout_validator, create_worknodes: false}
source_lineage:
  - source_ref:chat:2026-06-13-new-plan-authoring-profile-goal
preserved_exact_tokens: ["New Plan Authoring Profile", "source_preserving_planunit", "Legacy Converted Plan Profile"]
negative_constraints:
  - Do not fail existing legacy-converted docs for historical layout.
  - Do not use source_preserving_planunit for new feature content.
owner_hints: [Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md

### PDS-014 - Semantic Finding Key And Closure Matrix Validator

```yaml
plan_unit_id: PDS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  Semantic audit findings use a stable deterministic finding_key derived from
  finding_family, ledger_id, source_atom_ids, plan_unit_ids, owner_docs,
  detail_keys, and exact_tokens. Each new audit finding records
  repair_required:boolean and finding_level:blocker|warning|observation. Repair
  cycles write repair_closure_matrix.jsonl only when at least one source row has
  repair_required=true, and close only those actionable rows as repaired,
  false_positive, explicitly_deferred, source_lineage_only, not_for_plan,
  stale_retired, or blocked_requires_user_decision; reopened is reserved for a
  previously closed finding whose source atom, PlanUnit, owner evidence, or
  closure evidence changed. Repair must refuse/no-op when the latest audit has
  zero repair_required rows, and must not revalidate previously_closed rows or
  create registry rows for repair_required=false observations. The
  scripts/pm-audit-closure.py validator checks the global registry JSONL,
  required fields, duplicate
  open finding_keys, invalid closure_status values, missing evidence refs,
  reopened rows, matrix source_artifact/source_row coverage for actionable
  rows, closure evidence, closure reasons, registry_closure_id linkage, and
  per-audit closure matrix completeness across semantic_risks.jsonl,
  atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl,
  owner_routing_findings.jsonl, ledger_consistency.json, and
  validator_results.json by default.
gui_related: false
gui_classification_reason: Finding identity, closure matrices, and validators are docs/governance behavior, not GUI implementation work.
depends_on:
  - PDS-003
  - PLS-012
unblocks: []
acceptance_criteria:
  - The finding_key algorithm is deterministic and excludes volatile audit prose.
  - New audit finding rows include repair_required:boolean and finding_level:blocker|warning|observation.
  - repair_closure_matrix.jsonl is mandatory only when repair_required=true rows exist and covers every actionable source row selected for repair.
  - Warning-only audits with repair_required=false are terminal PASS_WITH_WARNINGS and do not require repair closure rows.
  - previously_closed, exact_present, equivalent_with_evidence, ordinary validator warnings, and audit-artifact wording rows do not require closure rows.
  - Repairs with zero actionable rows no-op without creating registry rows or modifying repo state.
  - Registry rows fail validation when required fields, evidence refs, allowed statuses, or hash-backed reopen rules are missing.
  - Repair closure matrix rows fail validation when source_artifact, source_row, finding_key, closure_status, closure_evidence, closure_reason, or registry_closure_id linkage is missing.
  - Reopened registry rows fail validation unless they reference a prior closed finding_key and prove changed source/PlanUnit/owner/closure hashes.
  - Duplicate open finding_keys fail validation while historical closed rows can remain durable evidence.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py validate
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
  - python3 -m unittest tests/test_pm_audit_closure.py
risk_class: false_repair_completion
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - scripts/pm-audit-closure.py
  - tests/test_pm_audit_closure.py
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
  - Plans/bootstrap/Codex_Prompts.md
node_compile_hint:
  mode: audit_closure_validator
  create_worknodes: false
source_lineage:
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "finding_key"
  - "finding_family"
  - "source_atom_ids"
  - "plan_unit_ids"
  - "owner_docs"
  - "detail_keys"
  - "exact_tokens"
  - "repair_closure_matrix.jsonl"
  - "source_artifact"
  - "source_row"
  - "registry_closure_id"
  - "repair_required"
  - "finding_level"
  - "blocker"
  - "warning"
  - "observation"
  - "ledger_consistency.json"
  - "validator_results.json"
  - "duplicate open finding_keys"
  - "closure_status"
  - "reopen_hash_changes"
  - "reopened"
  - "previously_closed"
  - "PASS_WITH_WARNINGS"
negative_constraints:
  - Do not use audit_id, row number, or prose order as the finding identity.
  - Do not claim repair completion with green validators alone when repair_required=true rows lack closure rows.
  - Do not require or generate closure rows for repair_required=false rows.
  - Do not revalidate previously_closed rows as fresh repair work.
  - Do not reopen a finding without changed source/canonical/evidence hashes or a blocked/reopened status.
  - Do not validate only semantic_risks.jsonl when atom, PlanUnit, owner-routing, ledger-consistency, or validator audit artifacts contain repair_required=true rows.
owner_hints:
  - Plans/Plan_Document_System.md
  - Plans/Planning_Ledger_System.md
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Planning_Ledger_System.md

## 3. Compilation Coverage

| Ledger atom | Disposition |
| --- | --- |
| atom-0015 | PDS-001 |
| atom-0019 | PDS-002 |
| atom-0020 | PDS-004; BPM-004 owns migration sequencing. |
| atom-0021 | PDS-003 |
| atom-0022 | PDS-003; PNC-002 consumes compiler-facing fields. |
| atom-0026 | PDS-006 |
| atom-0031 | PDS-006 |
| atom-0032 | PDS-003, PDS-007 |
| atom-0033 | PDS-007; PNC-005 owns runtime inheritance. |
| q-0002 | Captured in PDS-004/BPM-004 as a non-blocking future migration choice: "Which representative pilot Plan doc should be converted first?" Disposition remains "Codex should choose after inventory; likely a substantial owner/consumer doc rather than a tiny addendum." |
| source_ref:chat:2026-06-13-new-plan-authoring-profile-goal | PDS-011, PDS-012, PDS-013 |
| source_ref:chat:2026-06-17-semantic-closure-registry-support | PDS-014; PLS-012 owns the durable registry/reopen policy. |

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PDS-015 - Owner Consumer Reference Scan Gate

```yaml
plan_unit_id: PDS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  Ledger-to-Plans compiles that change owner contracts must account for direct owner docs, consumer docs, and reference/index/UI/wiring docs. The compile records touched concepts, reference scan terms, updated docs, no-update evidence, and deferred evidence. The former broad Plan Wizard rename deferral is superseded by the 2026-06-18 PRD Builder and Planning Wizard owner map; new active content uses Planning Wizard terminology, while retained Plan Wizard and Chain Wizard tokens require explicit historical/source-lineage or compatibility disposition. Completion claims for such compiles must include a reference/backlink scan result or an audit artifact that proves every direct reference was updated, intentionally unchanged, or explicitly deferred. Post-compile audit/index closure validates the updated Plans, repairs exact-detail drift before indexing, regenerates only Plans/.plan_index after Plans are stable, reports governance_status, and runs governance seal only when explicitly asked.
  Post-compile repair must validate the PlanUnit index inputs, do not run PlanCompile, preserve backlinks, index docs, UI command docs, wiring, and crosswalks, and honor: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs. It also preserves: Do not do an uncontrolled whole-repo rename as part of this compile; do not leave direct contradictions in touched sections.
gui_related: false
gui_classification_reason: Reference scan gates and compile closure evidence are plan-document governance behavior.
depends_on: [PDS-014, PLS-013]
unblocks: []
acceptance_criteria:
  - Owner, consumer, reference/index/UI, and wiring docs are accounted for after owner contract edits.
  - Direct references are updated, intentionally unchanged with evidence, or explicitly deferred.
  - Active owner and consumer prose uses Planning Wizard after the 2026-06-18 owner map; retained Plan Wizard or Chain Wizard tokens are historical/source-lineage or compatibility-only.
  - Post-compile closure validates Plans first, repairs exact-detail drift before index generation, regenerates only Plans/.plan_index, and does not seal governance without an explicit request.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future owner_routing_findings.jsonl audit
risk_class: stale_reference_drift
reasoning_tier: high
context_scope: ledger_to_plans_reference_scan
implementation_surfaces: [Plans/Plan_Document_System.md, Plans/Planning_Ledger_System.md, Plans/00-plans-index.md]
node_compile_hint: {mode: owner_consumer_reference_scan_gate, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0059
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:atom-0063
  - pldg-20260617-001-plans-to-code-handoff:atom-0064
  - pldg-20260617-001-plans-to-code-handoff:dec-0027
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
  - pldg-20260617-001-plans-to-code-handoff:corr-0010
preserved_exact_tokens:
  - "reference/backlink scan"
  - "touched concepts"
  - "direct references"
  - "backlinks"
  - "index docs"
  - "UI command docs"
  - "wiring"
  - "crosswalks"
  - "no-update evidence"
  - "deferred rename"
  - "owner prose"
  - "consumer docs"
  - "reference/index/UI docs"
  - "directly reference"
  - "broad Plan Wizard rename remains deferred"
  - "Planning Wizard"
  - "post-compile audit/index"
  - "repairs exact-detail drift"
  - "Plans/.plan_index"
  - "governance_status"
negative_constraints:
  - Do not claim ledger-to-Plans compile complete until reference scan results are recorded.
  - Do not do an uncontrolled whole-repo rename as part of this compile.
  - Do not leave direct contradictions in touched sections.
  - Do not run governance seal unless explicitly asked.
compatibility_only_notes:
  - Pre-rename Plan Wizard and Chain Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - The old Plan Wizard redesign deferred framing is superseded by the 2026-06-18 PRD Builder and Planning Wizard owner map.
owner_hints:
  - Plans/Plan_Document_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/00-plans-index.md
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/00-plans-index.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PDS-016 - Planning Implementation Readiness And Claim Traceability

```yaml
plan_unit_id: PDS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: 'The primary PRD contains Summary, Problem or Opportunity, Goals, Users or Actors, Scope, Non-Goals, Functional Requirements, Non-Functional Requirements, UX Expectations, Data or Integration or Environment Constraints, Acceptance Criteria, Assumptions, Risks and Dependencies, Open Questions, and Source Notes. At topic closure, a separate Overseer conversion agent transforms accepted topic ledger records into a versioned Topic Plan Draft or PlanUnit candidates with exact source lineage, assumptions, open non-blocking items, and cross-topic impacts. After required topics are Ready, a fresh Overseer agent reconciles topic drafts into a coherent Final Plan Pack, resolves duplicates and owner boundaries, and computes cross-topic dependencies, consistency, and compile readiness. Images are supporting references; any requirement, decision, constraint, flow, or acceptance implication introduced by an image must also be written into the
  planning ledger and canonical Plan text. Final Plan Pack audit covers PRD and ledger fidelity, exact details, unsupported inventions, owner and consumer placement, cross-topic conflicts, implementation readiness, testing readiness, security/data/permissions consistency, repository currentness, source lineage, schemas, mechanics, and future compile readiness. Implementation readiness requires behavior, actors and identity, data and state transitions, edge and failure cases, permissions, currentness and idempotency, UI commands and states where applicable, adapters and side effects, validation surfaces, acceptance evidence, dependencies, and handoff contracts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Create Plans/PRD_Builder.md and
  Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_Document_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0024
- pldg-20260618-001-prd-planning-wizard:atom-0058
- pldg-20260618-001-prd-planning-wizard:atom-0063
- pldg-20260618-001-prd-planning-wizard:atom-0066
- pldg-20260618-001-prd-planning-wizard:atom-0132
- pldg-20260618-001-prd-planning-wizard:atom-0141
- pldg-20260618-001-prd-planning-wizard:atom-0142
- pldg-20260618-001-prd-planning-wizard:atom-0158
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0024
- atom-0058
- atom-0063
- atom-0066
- atom-0132
- atom-0141
- atom-0142
- atom-0158
- atom-0160
decision_refs:
- dec-0008
- dec-0012
- dec-0028
- dec-0029
correction_refs:
- corr-0008
preserved_exact_tokens:
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Open Questions
- Source Notes
- Topic Plan Draft
- topic closure
- Overseer
- Final Plan Pack
- cross-topic integration
- supporting reference
- text remains canonical
- semantic fidelity
- implementation readiness
- source lineage
- behavior
- state transitions
- failure cases
- idempotency
- acceptance evidence
- traceability
- unsupported claim
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- PlanProfile
- doc-impact pass
negative_constraints:
- Do not leave a material requirement only inside an image.
- Do not certify invented planning details with no source or explicit assumption.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Plan_Document_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```
