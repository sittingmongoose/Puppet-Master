# Shard 016: PlanUnits

Source: `Plans/Personas.md`

Source lines: L688-L3173

Source SHA256: `b2054f3383740d4dd35e57f916980e3e2e6094b106ca66272d98bb732b5d4919`

---

## PlanUnits

### P-002 - Doc Compliance And SSOT References

```yaml
plan_unit_id: P-002
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Personas.md preserves the canonical title, compliance block, and DRY reference map for Persona-system consumers.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The canonical title and compliance block remain addressable.
  - The SSOT reference list preserves exact Plan paths and DRY lineage.
  - The subagent registry canonical-name reference remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_doc_reference_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0003
preserved_exact_tokens:
  - "Personas (Canonical SSOT)"
  - "Puppet Master"
  - "SSOT references (DRY)"
  - "DRY:DATA:subagent_registry"
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-003 - Persona SSOT Scope

```yaml
plan_unit_id: P-003
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Plans/Personas.md is the single canonical source for Persona definitions, storage layout, schema, and selection rules; other documents must reference Personas anchors instead of restating those rules.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona definitions, storage layout, schema, and selection rules remain owned by Personas.md.
  - Consumer docs reference Personas anchors rather than restating Persona rules.
  - The DRY ContractRef remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_ssot_restated_in_consumers
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0002
preserved_exact_tokens:
  - "single canonical source of truth"
  - "Plans/Personas.md#PERSONA-SCHEMA"
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
negative_constraints:
  - "Consumer plans must not restate Persona definitions, storage layout, schema, or selection rules."
preserved_contractrefs:
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Personas.md
```

### P-004 - Agent Runtime Definition

```yaml
plan_unit_id: P-004
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  An Agent is a concrete ephemeral AI execution unit spawned by the Orchestrator for a node in the run graph, receiving compiled context and producing a response stream.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Agent remains a running AI execution unit, not a persistent Persona artifact.
  - Agent lifetime remains one run.
  - Contracts_V0 and Executor Protocol ownership references are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_persona_identity_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0005
preserved_exact_tokens:
  - "DEF-AGENT"
  - "Agent"
  - "running AI execution unit"
  - "compiled context"
  - "ContractName:Plans/Contracts_V0.md"
  - "ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - Plans/Personas.md
```

### P-005 - Subagent Child Run Definition

```yaml
plan_unit_id: P-005
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  A subagent is a child run that resolves a Persona for the child task; it does not auto-inherit the parent Persona and is not defined by provider-native agent-file syntax.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Child Persona may differ materially from parent Persona.
  - Provider-native agent files may seed or export Persona content but PM Persona storage remains canonical.
  - Crew mode may share Persona while varying model or provider selection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_persona_inheritance_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0006
preserved_exact_tokens:
  - "Subagent"
  - "child run"
  - "PM Persona storage remains canonical"
  - "crew mode"
  - "session.parentID"
negative_constraints:
  - "A subagent is not merely the parent Persona, but smaller."
  - "The child Persona does not auto-inherit from the parent."
  - "OpenCode force-marking is adapter classification evidence only."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-006 - Persona Artifact Contract

```yaml
plan_unit_id: P-006
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  A Persona is a persistent YAML-frontmatter Markdown behavior-and-runtime contract that shapes Agent or Subagent behavior and feeds compiled context plus effective runtime resolution.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: true
split_recommendation_reason: >-
  The source definition combines runtime contract content and UI-facing metadata; this unit keeps the canonical definition intact.
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona remains persistent and user-editable until deletion.
  - Persona metadata may include identity, instructions, permissions, skills, provider/model preferences, runtime control preferences, aliases, and UI-facing metadata.
  - The Agent/Subagent/Persona distinction table remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_artifact_contract_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0007
preserved_exact_tokens:
  - "Persona"
  - "YAML-frontmatter Markdown file"
  - "behavior-and-runtime contract"
  - "default_skill_refs"
  - "UI-facing metadata"
  - "Agent"
  - "Subagent"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md"
owner_hints:
  - Plans/Personas.md
```

### P-007 - Provider Native Separation

```yaml
plan_unit_id: P-007
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Personas are Puppet Master abstractions above provider-native agents, provider-native skills, and plugins; provider-native configs stay transport-layer concerns consumed by the Provider facade.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Provider-native agent configs remain transport concerns.
  - Skills remain invocable context-injection units.
  - Plugins remain hook-based extension modules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_native_persona_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0008
preserved_exact_tokens:
  - "provider-native agent"
  - "Agent.Info"
  - ".cursor/agents/"
  - "Provider facade"
  - "default_skill_refs"
negative_constraints:
  - "Persona is not a provider-native agent, skill, or plugin."
  - "Persona does not contain skill logic itself."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/OpenCode_Deep_Extraction.md"
owner_hints:
  - Plans/Personas.md
```

### P-008 - Storage Layout Anchor

```yaml
plan_unit_id: P-008
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona files use a deterministic two-tier layout where project-local Personas override global Personas by persona_id.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The STORAGE-LAYOUT anchor remains preserved.
  - Project-local and global storage roots remain deterministic.
  - Decision Policy ContractRef remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_storage_layout_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0009
preserved_exact_tokens:
  - "STORAGE-LAYOUT"
  - "persona_id"
  - "Project-local Personas override global Personas"
  - "ContractRef: PolicyRule:Decision_Policy.md§2"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Personas.md
```

### P-009 - Storage Roots Resolution And Built In Scope

```yaml
plan_unit_id: P-009
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Project and global PERSONA.md roots, Persona resolution order, folder-name invariant, protected built-in scope, bundled specialty scope, and imported provider-native seed-source rules are canonical in Personas.md.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Project-local Personas are scoped to the active project.
  - Global Personas are available across projects and can be overridden by project-local Personas.
  - Protected built-ins resolve from PM-owned bundled definitions first and cannot be shadowed by user files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_storage_resolution_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0013
preserved_exact_tokens:
  - ".puppet-master/personas/<persona_id>/PERSONA.md"
  - "~/.config/puppet-master/personas/<persona_id>/PERSONA.md"
  - "Folder-name invariant"
  - "protected built-in ID"
  - "bundled first-party specialty Personas"
negative_constraints:
  - "User-created project or global files may not shadow protected built-ins."
  - "Imported provider-native agent files are seed/import sources only and never become the runtime source of truth."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION"
  - "ContractRef: ContractName:Plans/Personas.md#RESERVED-PERSONAS, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Personas.md
```

### P-010 - Persona File Schema And Fields

```yaml
plan_unit_id: P-010
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  PERSONA.md consists of YAML frontmatter followed by Markdown body, with frontmatter fields and enum/value meanings defined by the Personas schema.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The PERSONA-SCHEMA anchor remains preserved.
  - The YAML frontmatter example remains normative for field names.
  - Field definitions preserve required, recommended, optional, and enum semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_schema_field_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0016
preserved_exact_tokens:
  - "PERSONA-SCHEMA"
  - "PERSONA.md"
  - "default_mode"
  - "default_platform"
  - "default_permissions_profile"
  - "default_model"
  - "default_variant"
  - "talkativeness"
  - "aliases"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Personas.md
```

### P-011 - Validation And Runtime Identity Names

```yaml
plan_unit_id: P-011
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona validation enforces ID format, uniqueness, protected-ID, enum, registry-ref, and runtime-control rules; Persona runtime identity fields align to requested_persona and effective_persona.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Validation rejects invalid IDs, protected-ID shadowing, invalid enums, and unavailable references as specified.
  - Provider/model/runtime controls are validated at resolution time.
  - requested_persona and effective_persona are the canonical runtime identity field names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_validation_runtime_identity_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0018
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "_id variants are retired"
  - "lower-case kebab-case"
  - "protected core built-ins"
negative_constraints:
  - "`_id` variants are retired from canonical runtime payload examples."
  - "Unsupported controls are recorded as skipped or clamped, not silently applied."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Personas.md
```

### P-012 - Markdown Body Instructions

```yaml
plan_unit_id: P-012
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The Markdown body after Persona frontmatter contains Persona system instructions, is injected into compiled Agent context, and has no structural constraints beyond valid Markdown.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona system instructions come from the Markdown body.
  - The body is injected into compiled context when a Persona is assigned.
  - Recommended sections remain guidance rather than required structure.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_body_injection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0019
preserved_exact_tokens:
  - "Markdown body"
  - "system instructions"
  - "compiled context"
  - "expertise areas"
  - "behavioral guidelines"
  - "output format preferences"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-013 - Agent Config Personas GUI

```yaml
plan_unit_id: P-013
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Agent Config > Personas is the primary Persona management surface and provides library, create, prompt visibility, edit, disable/restore, delete, and schema-validation workflows.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Settings remains a routing/help surface, not the main Persona prompt browser or editor.
  - The library groups resolved Personas by source/status and shows required columns.
  - Create/edit/delete/disable/restore flows preserve protected core built-in restrictions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_gui_workflow_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0021
preserved_exact_tokens:
  - "Agent Config > Personas"
  - "Library view"
  - "New Persona"
  - "Prompt visibility"
  - "Save as project override"
  - "Protected core built-ins"
  - "Schema validation on save"
negative_constraints:
  - "Settings is not the main Persona prompt browser or editor."
  - "Protected core built-ins cannot be modified, disabled, deleted, or shadowed."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md"
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/Personas.md#PERSONA-VALIDATION"
owner_hints:
  - Plans/Personas.md
```

### P-014 - Permission Profile Editor Reference

```yaml
plan_unit_id: P-014
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona editing references named permission profiles from the Permissions system; the Personas GUI does not define permission profiles itself.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - default_permissions_profile is selected from the Permissions registry.
  - The dropdown may include null/inherited state.
  - Permissions profile ownership remains in Plans/Permissions_System.md.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_permission_profile_boundary
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0022
preserved_exact_tokens:
  - "default_permissions_profile"
  - "named permission profiles"
  - "Permissions system"
  - "dropdown"
negative_constraints:
  - "The Personas GUI does not define permission profiles itself."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#GUI-PERSONAS"
owner_hints:
  - Plans/Personas.md
```

### P-015 - Skill And Plugin Reference Fields

```yaml
plan_unit_id: P-015
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  default_skill_refs is populated from the skill registry, and unavailable skills display as not installed with Catalog linkage.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Skill references come from the Skills registry.
  - Not-yet-installed skills display as not installed.
  - Catalog linkage remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_skill_reference_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0023
preserved_exact_tokens:
  - "default_skill_refs"
  - "multi-select"
  - "skill registry"
  - "(not installed)"
  - "Catalog"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-016 - External Agent File Isolation

```yaml
plan_unit_id: P-016
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona GUI edits are isolated to Puppet Master Persona storage and must not mutate provider-native agent directories.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona edits write only to PM Persona storage layout.
  - Provider-native agent files may be read only as one-time seed sources.
  - Subsequent edits remain isolated to Puppet Master storage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: external_agent_file_mutation_risk
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0024
preserved_exact_tokens:
  - ".claude/"
  - ".github/"
  - ".cursor/"
  - "provider-native agent directory"
  - "Puppet Master Persona storage layout"
negative_constraints:
  - "Editing Personas in the Puppet Master GUI MUST NOT mutate files under `.claude/`, `.github/`, `.cursor/`, or any other provider-native agent directory."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Personas.md#STORAGE-LAYOUT"
owner_hints:
  - Plans/Personas.md
```

### P-017 - Interaction Mode Copy

```yaml
plan_unit_id: P-017
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona management UI follows the app-level Expert/ELI5 Interaction Mode toggle and provides both Expert and ELI5 tooltip variants under tooltip.personas.* keys.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Expert and ELI5 variants are required.
  - Tooltip keys use the tooltip.personas.* prefix.
  - Interaction Mode behavior follows FinalGUISpec.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_copy_mode_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0025
preserved_exact_tokens:
  - "Expert/ELI5"
  - "tooltip.personas.*"
  - "Interaction Mode"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-018 - Child Persona Selection

```yaml
plan_unit_id: P-018
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child Persona selection is deterministic: explicit requested child Persona, child subagent type or task-type mapping, weak compatible parent hint, then safe general-purpose fallback.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Explicit child Persona request has highest priority.
  - Weak parent hint is only used when compatible and still ambiguous.
  - Crew members normally share task framing and often share Persona while model/provider diversity defines crew mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_persona_selection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0027
preserved_exact_tokens:
  - "PERSONA-INJECTION"
  - "Canonical child Persona resolution order"
  - "explicitly requested child Persona"
  - "weak parent Persona hint"
  - "safe general-purpose fallback"
  - "Crew default"
negative_constraints:
  - "Persona selection must not silently collapse child roles into the parent Persona."
  - "The weak parent hint cannot override the requested child task, runtime/provider restrictions, permissions, or mode."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-019 - Child Context And Run Mode Resolution

```yaml
plan_unit_id: P-019
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child Persona injection uses a reconstructed handoff bundle, and Persona default_mode applies below explicit run-envelope mode and above the system default.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Child runs inject effective child Persona content resolved from PM storage.
  - Child handoff includes current task, working context, required constraints, requested/effective runtime state, and effective context-shaping state.
  - Run-envelope mode overrides Persona default_mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_context_run_mode_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0029
preserved_exact_tokens:
  - "reconstructed handoff bundle"
  - "do not forward Assistant memory"
  - "default_mode"
  - "Explicit run-envelope `mode`"
  - "System default (`regular`)"
negative_constraints:
  - "Do not forward Assistant memory to child runs."
  - "Do not make a lossy child copy the only truth."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Permissions_System.md"
  - "ContractRef: ContractName:Plans/Run_Modes.md"
owner_hints:
  - Plans/Personas.md
```

### P-020 - Cross Subsystem Owner Boundaries

```yaml
plan_unit_id: P-020
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona integrations with permissions, skills, plugins, models/runtime controls, behavior controls, prompt observability, and tool guidance are owned by their subsystem SSOTs rather than restated in Personas.md.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Permission profile behavior routes to Permissions_System.
  - Skills, Plugins, Models/runtime controls, Prompt Pipeline, and tool enforcement remain under their owner docs.
  - Persona tool preference fields remain guidance while hard enforcement stays in Permissions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_subsystem_owner_boundary_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0030
preserved_exact_tokens:
  - "Permissions"
  - "Skills"
  - "Plugins"
  - "Models/runtime controls"
  - "Behavior controls"
  - "Prompt/runtime observability"
  - "Tool guidance"
negative_constraints:
  - "The listed subsystem integrations MUST NOT be restated here."
owner_hints:
  - Plans/Personas.md
```

### P-021 - Reserved Personas And Display Normalization

```yaml
plan_unit_id: P-021
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Protected core Persona IDs, eligibility, mutability, enforcement, collision handling, display normalization, and stale runtime alias dispositions are canonical in the Reserved Personas section.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Protected Persona IDs remain reserved and cannot be used or shadowed by user-created Personas.
  - Eligibility and mutability table values remain preserved.
  - Natural-language display forms normalize to canonical IDs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_persona_collision_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0031
preserved_exact_tokens:
  - "assistant"
  - "general-purpose"
  - "overseer"
  - "bash"
  - "teacher"
  - "collaborator"
  - "researcher"
  - "deep-researcher"
  - "explorer"
  - "Document Writer"
  - "requested_persona"
  - "effective_persona"
negative_constraints:
  - "User Personas MUST NOT use or shadow protected IDs."
  - "Document Writer is legacy/source-lineage wording unless a later owner decision reopens it."
  - "`_id` runtime field names remain stale aliases."
preserved_contractrefs:
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#PERSONA-VALIDATION"
  - "ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
  - Plans/Personas.md
```

### P-022 - Persona Registry Boundary

```yaml
plan_unit_id: P-022
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The split between persona_registry and subagent_registry is mandatory, and persona_registry owns runtime Persona definitions and Persona IDs used for selection, storage, GUI management, and prompt injection.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - persona_registry and subagent_registry remain distinct.
  - persona_registry owns runtime Persona definitions and IDs.
  - Persona IDs are used for selection, storage, GUI management, and prompt injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_registry_boundary_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0033
preserved_exact_tokens:
  - "persona_registry"
  - "subagent_registry"
  - "runtime Persona definitions"
  - "GUI management"
  - "prompt injection"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Tools.md"
owner_hints:
  - Plans/Personas.md
```

### P-023 - Subagent Registry And Relationship Rules

```yaml
plan_unit_id: P-023
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  subagent_registry owns launchable delegated child-run types and the relationship rules that allow launchable subagent types to resolve to Personas without merging the registries.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - subagent_registry owns launchable child-run types.
  - Launchable subagent type may resolve to a Persona while preserving separate structures.
  - Interview stage fields use canonical Persona-oriented field names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_registry_persona_registry_conflation
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0035
preserved_exact_tokens:
  - "subagent_registry"
  - "phase_subagents"
  - "phase_secondary_subagents"
  - "/subagent"
  - "/agent"
  - "/fleet"
  - "/delegate"
  - "/replace"
  - "*_persona_id"
negative_constraints:
  - "Provider-native command names are not registry IDs."
  - "Legacy phase_subagents and phase_secondary_subagents are migration aliases only."
  - "Stale *_persona_id drift should be normalized during reconciliation."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Personas.md
```

### P-024 - OpenCode Baseline

```yaml
plan_unit_id: P-024
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The OpenCode baseline for comparison is Agent.Info schema/config override behavior, task-tool subagent invocation, and read-only explore-agent evidence.
gui_related: false
gui_classification_reason: This unit defines Persona runtime, storage, schema, governance, or owner-boundary behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - OpenCode Agent.Info fields remain preserved as baseline evidence.
  - User-defined agents override via config in the baseline.
  - The explore agent remains read-only baseline evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_loss
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0037
preserved_exact_tokens:
  - "OpenCode baseline"
  - "Agent.Info"
  - "name"
  - "description"
  - "mode"
  - "prompt"
  - "permission"
  - "model"
  - "steps"
  - "task tool"
  - "explore agent"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-025 - Puppet Master Deltas From OpenCode

```yaml
plan_unit_id: P-025
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Puppet Master Personas are disk-backed PERSONA.md files, provider-agnostic, not hardcoded in source, reserved-ID enforced, and may project to native reusable-agent paths where applicable.
gui_related: true
gui_classification_reason: This unit defines GUI-visible Persona management behavior or UI-facing metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Persona content lives in PERSONA.md files resolved at runtime.
  - Personas remain provider-agnostic and translated by the Provider facade.
  - Native reusable-agent support is treated as a projection path when applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_persona_delta_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0038
preserved_exact_tokens:
  - "PERSONA.md"
  - "provider-agnostic"
  - "reserved-ID enforcement"
  - "Claude Code CLI"
  - "--agent"
  - "--agents"
  - "agents command"
  - "native-specialized-agent projection path"
negative_constraints:
  - "Provider-native reusable agents are not plain prompt stuffing and not the same primitive as the PM Persona registry."
  - "Puppet Master does not hardcode Persona descriptions/prompts in source code."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
owner_hints:
  - Plans/Personas.md
```
### P-026 - Persona Validation Acceptance Criteria

```yaml
plan_unit_id: P-026
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona validation acceptance criteria require every loaded PERSONA.md file to pass schema validation, skip invalid files with a warning log entry, reject Reserved Persona IDs, and treat folder-name/id mismatches as validation errors.
gui_related: false
gui_classification_reason: This unit defines schema/runtime validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-010
  - P-011
  - P-021
unblocks: []
acceptance_criteria:
  - AC-P01, AC-P03, and AC-P06 remain testable validation requirements.
  - Invalid Persona files are not loaded as active runtime Personas.
  - Reserved IDs and folder/frontmatter mismatches fail validation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_validation_acceptance_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P01"
  - "AC-P03"
  - "AC-P06"
  - "PERSONA.md"
  - "frontmatter"
  - "Reserved Persona IDs"
negative_constraints:
  - "Invalid or mismatched Personas are not loaded as valid runtime Personas."
owner_hints:
  - Plans/Personas.md
```

### P-027 - Persona Resolution And Instruction Injection Criteria

```yaml
plan_unit_id: P-027
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona resolution acceptance criteria require project-local Personas to deterministically override global Personas with the same id, and require the context compiler to inject the resolved Persona Markdown body into the Instruction Bundle for every assigned Agent run.
gui_related: false
gui_classification_reason: This unit defines runtime resolution and prompt compilation behavior rather than visual presentation.
split_recommended: false
depends_on:
  - P-008
  - P-012
  - P-018
unblocks: []
acceptance_criteria:
  - AC-P02 and AC-P05 remain testable runtime requirements.
  - Project-local override behavior is deterministic.
  - Persona Markdown body injection occurs whenever a Persona is assigned.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_resolution_injection_drift
reasoning_tier: standard
context_scope: personas
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P02"
  - "AC-P05"
  - "Project-local Personas"
  - "global Personas"
  - "Instruction Bundle"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-028 - GUI Persona Save Isolation Criteria

```yaml
plan_unit_id: P-028
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  GUI Persona edits must never create, modify, or delete provider-native agent files, and the GUI Personas management card must validate the schema on save and block saves with validation errors.
gui_related: true
gui_classification_reason: This unit defines GUI save behavior and user-visible validation handling.
split_recommended: false
depends_on:
  - P-013
  - P-016
  - P-026
unblocks: []
acceptance_criteria:
  - AC-P04 and AC-P07 remain testable GUI requirements.
  - GUI saves are isolated to Puppet Master Persona storage.
  - Save actions with validation errors are blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_persona_save_isolation_drift
reasoning_tier: standard
context_scope: personas_gui
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0039
preserved_exact_tokens:
  - "AC-P04"
  - "AC-P07"
  - "GUI"
  - "Personas management card"
  - ".claude/"
  - ".github/"
  - ".cursor/"
negative_constraints:
  - "Editing a Persona in the GUI MUST NOT create, modify, or delete files under `.claude/`, `.github/`, `.cursor/`, or any provider-native agent directory."
owner_hints:
  - Plans/Personas.md
```

### P-029 - Requested Effective Persona Runtime Identity

```yaml
plan_unit_id: P-029
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona runtime identity uses requested_persona, effective_persona, persona_selection_source, selection_reason, persona_override_scope, persona_override_owner_id, and shared applied/skipped controls; requested_persona_id and effective_persona_id are stale aliases only, and persona_override_owner_id must not use tier_id as canonical owner scope.
gui_related: false
gui_classification_reason: This unit defines runtime identity field names and stale-alias handling rather than GUI presentation.
split_recommended: false
depends_on:
  - P-011
  - P-018
unblocks: []
acceptance_criteria:
  - Runtime-facing consumers converge on requested_persona and effective_persona.
  - requested_persona_id and effective_persona_id are not revived as parallel canonical fields.
  - Historical views use frozen captured runtime identity rather than recomputing from current settings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_identity_alias_drift
reasoning_tier: high
context_scope: personas_runtime_identity
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0040
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "persona_selection_source"
  - "selection_reason"
  - "persona_override_scope"
  - "persona_override_owner_id"
  - "requested_persona_id"
  - "effective_persona_id"
  - "package-overseer"
  - "seam-overseer"
negative_constraints:
  - "requested_persona_id and effective_persona_id are not canonical persisted field names."
  - "persona_override_owner_id must not use tier_id as canonical owner scope."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Personas.md
```

### P-030 - Persona Auto Resolution And Crew Role Mapping

```yaml
plan_unit_id: P-030
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Persona auto-resolution uses explicit manual/run override, scoped natural-language override, surface-specific explicit mapping, surface auto resolver candidate, config default, then canonical fallback; actor and operation type outrank stack hints, governance/review/corroboration Personas do not collapse into implementation Personas, and exact crew.roles tag mappings either resolve or return capability_unavailable without silent tuple fallback.
gui_related: false
gui_classification_reason: This unit defines runtime resolution and crew-role routing behavior rather than visual presentation.
split_recommended: false
depends_on:
  - P-018
  - P-029
unblocks: []
acceptance_criteria:
  - Auto-resolution precedence remains ordered and deterministic.
  - owner_hint is advisory until resolved by the crew-role map.
  - Missing exact tag mappings fall back to the current session provider/model with requested Persona behavior, while unavailable mapped provider/model returns capability_unavailable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_auto_resolution_drift
reasoning_tier: high
context_scope: personas_runtime_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0040
preserved_exact_tokens:
  - "owner_hint"
  - "crew.roles"
  - "code-review"
  - "test-writer"
  - "researcher"
  - "capability_unavailable"
  - '{ "code-review": { provider, model, persona } }'
negative_constraints:
  - "Partial matches are not supported in MVP."
  - "PM does not silently fall back to a different provider/model/persona tuple when a mapped provider or model is unavailable."
  - "Governance/review/corroboration personas do not collapse into implementation personas merely because repo language hints are strong."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Personas.md
```

### P-031 - Core Persona Catalog Scope

```yaml
plan_unit_id: P-031
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Core Personas are protected Puppet Master-owned behavior contracts that define the highest-level user-visible and runtime-selected Persona family, while specialty Personas refine domain, stack, tool, or workflow fit beneath this layer.
gui_related: false
gui_classification_reason: This unit defines catalog hierarchy and ownership rather than GUI presentation.
split_recommended: false
depends_on:
  - P-021
unblocks: []
acceptance_criteria:
  - The CORE-PERSONA-CATALOG anchor remains preserved.
  - Core Personas remain protected PM-owned behavior contracts.
  - Specialty Personas remain a refinement layer below core Personas.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: core_persona_catalog_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0041
preserved_exact_tokens:
  - "CORE-PERSONA-CATALOG"
  - "Core Personas"
  - "protected PM-owned behavior contracts"
  - "specialty Personas"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-032 - Core Persona Visibility And Mutability Rules

```yaml
plan_unit_id: P-032
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Core Persona default model/provider/runtime controls appear as Auto in the UI and are stored as inherited/null fields unless a PM-owned definition sets a value; core definitions are user-immutable, explorer and bash are subagent-only, assistant and teacher are direct user-facing Personas, and other protected core Personas are chat-selectable unless a narrower owner rule forbids the surface.
gui_related: true
gui_classification_reason: This unit defines user-visible Persona picker and UI default-control behavior.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - Auto defaults inherit according to Models_System.
  - Core definitions are user-immutable and not deletable.
  - Manual Persona picker eligibility preserves subagent-only and user-facing distinctions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: core_persona_visibility_mutability_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0042
preserved_exact_tokens:
  - "Auto"
  - "UI"
  - "user-immutable"
  - "explorer"
  - "bash"
  - "assistant"
  - "teacher"
negative_constraints:
  - "explorer and bash are subagent-only and are not available in the chat manual Persona picker."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - Plans/Personas.md
```

### P-033 - Child Run Core Persona Selection Rules

```yaml
plan_unit_id: P-033
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Child runs must record requested/effective Persona and selection reason, child Persona selection does not auto-inherit the parent Persona, and Plan/deep-plan Auto may switch Persona across phase boundaries once planning turns into execution.
gui_related: false
gui_classification_reason: This unit defines runtime child-run resolution behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-018
  - P-029
  - P-032
unblocks: []
acceptance_criteria:
  - Child requested/effective Persona and selection reason are recorded.
  - Parent Persona is not automatically inherited by child runs.
  - Auto phase switches may select general-purpose, assistant, or a specialty Persona after plan acceptance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_core_persona_selection_drift
reasoning_tier: standard
context_scope: personas_child_runs
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0042
preserved_exact_tokens:
  - "requested/effective Persona"
  - "selection reason"
  - "child Persona selection does not auto-inherit"
  - "Plan/deep-plan"
  - "general-purpose"
negative_constraints:
  - "Child Persona selection does not auto-inherit the parent Persona."
owner_hints:
  - Plans/Personas.md
```

### P-034 - Assistant Core Persona

```yaml
plan_unit_id: P-034
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  assistant is the default chat Persona with broad capability similar to general-purpose, a warmer and more collaborative style, permission to do real work when warranted, and boundaries against becoming a hidden worker Persona or passive help-bot.
gui_related: false
gui_classification_reason: This unit defines Persona behavior contract and routing fit rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - assistant remains the default chat Persona.
  - assistant can do real work when action is warranted.
  - general-purpose, teacher, researcher, deep-researcher, explorer, bash, and specialty Personas remain alternative fits when materially better.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_persona_behavior_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0043
preserved_exact_tokens:
  - "assistant"
  - "default chat Persona"
  - "warmer"
  - "general-purpose"
  - "teacher"
negative_constraints:
  - "assistant must not become a hidden worker Persona or a passive help-bot."
owner_hints:
  - Plans/Personas.md
```

### P-035 - General Purpose Core Persona

```yaml
plan_unit_id: P-035
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  general-purpose displays as General and is the broad core execution Persona for complex multi-step work requiring reading, reasoning, editing, command execution, verification, and follow-through, with boundaries against replacing read-only explorer, terminal-first bash, research Personas, or narrower specialty fits.
gui_related: false
gui_classification_reason: This unit defines Persona behavior contract and routing fit rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - general-purpose remains the fallback broad worker when no narrower fit is clearly better.
  - explorer remains read-only and bash remains terminal-first.
  - research and specialty handoffs are used when materially better.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: general_purpose_persona_behavior_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0044
preserved_exact_tokens:
  - "general-purpose"
  - "General"
  - "complex multi-step work"
  - "explorer"
  - "bash"
negative_constraints:
  - "general-purpose should not over-delegate when it can complete a coherent task itself."
owner_hints:
  - Plans/Personas.md
```

### P-036 - Explorer Core Persona

```yaml
plan_unit_id: P-036
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  explorer is a fast, read-only, subagent-only core Persona for codebase-local investigation that searches files, symbols, configs, tests, docs, and call sites, returns concise evidence-backed synthesis, and does not edit, refactor, implement, or use web research by default.
gui_related: false
gui_classification_reason: This unit defines a read-only codebase investigation Persona contract rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - explorer remains subagent-only and read-only.
  - explorer returns synthesis, supporting file references, uncertainties, and handoff recommendations when relevant.
  - explorer hands off to researcher when current external information is needed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: explorer_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0045
preserved_exact_tokens:
  - "explorer"
  - "read-only"
  - "subagent-only"
  - "codebase-local investigation"
  - "do not use web research by default"
negative_constraints:
  - "explorer must stay read-only and must not edit, refactor, or implement."
owner_hints:
  - Plans/Personas.md
```

### P-037 - Bash Core Persona

```yaml
plan_unit_id: P-037
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  bash is a subagent-only terminal-execution Persona that runs useful command sequences in an isolated context, inspects stdout, stderr, exit status, and side effects, and reports the smallest actionable result without becoming a general planner or coding Persona.
gui_related: false
gui_classification_reason: This unit defines terminal execution behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - bash remains subagent-only and terminal-first.
  - bash distinguishes command failure, successful command with problematic output, and intended success.
  - bash hands off to implementation, exploration, or research Personas as appropriate.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bash_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0046
preserved_exact_tokens:
  - "bash"
  - "terminal-execution Persona"
  - "stdout/stderr/exit status/side effects"
  - "minimum useful command sequence"
negative_constraints:
  - "bash must not become a general planner or coding Persona because a command exposed an issue."
owner_hints:
  - Plans/Personas.md
```

### P-038 - Researcher Core Persona

```yaml
plan_unit_id: P-038
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  researcher is a read-only Persona that combines local codebase inspection with current external sources when those sources materially improve the answer, stays grounded in project context, compares evidence, and returns citations plus handoff guidance without taking over implementation.
gui_related: false
gui_classification_reason: This unit defines research behavior and evidence handling rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
unblocks: []
acceptance_criteria:
  - researcher stays read-only.
  - external research is grounded in local project context.
  - outputs include citations, local findings, external findings, implications, uncertainty, and handoff guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: researcher_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0047
preserved_exact_tokens:
  - "researcher"
  - "read-only"
  - "current external sources"
  - "citations"
  - "handoff guidance"
negative_constraints:
  - "researcher must stay read-only and must not take over implementation."
owner_hints:
  - Plans/Personas.md
```

### P-039 - Deep Researcher Core Persona

```yaml
plan_unit_id: P-039
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  deep-researcher is the read-only high-effort counterpart to researcher for broader source coverage, deeper comparison, strategic debugging, architecture or solution evaluation, plan/deep-plan support, and higher-stakes decision support.
gui_related: false
gui_classification_reason: This unit defines research depth and decision-support behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-038
unblocks: []
acceptance_criteria:
  - deep-researcher decomposes complex research into sub-questions.
  - local context and multiple external source classes are compared.
  - outputs include recommendation, comparison, evidence, risks, caveats, and next steps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: deep_researcher_persona_scope_drift
reasoning_tier: high
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0048
preserved_exact_tokens:
  - "deep-researcher"
  - "high-effort"
  - "broader source coverage"
  - "strategic debugging"
  - "plan/deep-plan"
negative_constraints:
  - "deep-researcher must hand off to an execution-capable Persona when the user wants implementation or file changes."
owner_hints:
  - Plans/Personas.md
```

### P-040 - Teacher Core Persona

```yaml
plan_unit_id: P-040
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  teacher is a warm, highly explanatory, user-facing help Persona for teaching Puppet Master usage, settings, workflows, modes, Personas, Orchestrator behavior, adjacent developer tooling, and concrete steps, while surfacing missing product documentation instead of guessing.
gui_related: true
gui_classification_reason: This unit defines user-facing help behavior tied to Puppet Master's UI, settings, and workflows.
split_recommended: false
depends_on:
  - P-031
  - P-032
unblocks: []
acceptance_criteria:
  - teacher remains user-facing and not a subagent Persona.
  - teaching anchors in Puppet Master's actual UI, settings, flows, capabilities, and terminology.
  - missing feature/help coverage is surfaced rather than guessed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: teacher_persona_doc_guessing_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0049
preserved_exact_tokens:
  - "teacher"
  - "PM usage"
  - "settings"
  - "workflows"
  - "Orchestrator behavior"
  - "PM documentation coverage"
negative_constraints:
  - "teacher must surface missing feature/help coverage instead of guessing."
owner_hints:
  - Plans/Personas.md
```

### P-041 - Overseer Governance Boundary

```yaml
plan_unit_id: P-041
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  overseer is a governance/conductor Persona, not the scheduler personified and not a normal node-worker implementation Persona; scheduler and executor owners retain dispatchability, readiness, transitions, blocked-state lifecycle, retries, wakeups, attempt identity, and hard Orchestrator mechanics.
gui_related: false
gui_classification_reason: This unit defines governance/runtime ownership boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - P-031
  - P-030
unblocks: []
acceptance_criteria:
  - overseer does not claim canonical ownership of scheduler/executor mechanics.
  - Package Overseer and Seam Overseer remain graph/runtime governance roles.
  - actor type outranks stack hints for overseer, reviewer, corroborator, recovery, graph-patch, and node-worker roles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: overseer_scheduler_ownership_drift
reasoning_tier: high
context_scope: personas_overseer
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0050
preserved_exact_tokens:
  - "overseer"
  - "governance/conductor Persona"
  - "not the scheduler personified"
  - "Package Overseer"
  - "Seam Overseer"
negative_constraints:
  - "overseer must not claim canonical ownership of dispatch, readiness, blocked state, retry budgets, wakeups, or hard Orchestrator mechanics."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md"
owner_hints:
  - Plans/Personas.md
```

### P-042 - Overseer Package And Seam Review Fit

```yaml
plan_unit_id: P-042
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  overseer expresses delegation-first, verification-first, wiring/completeness-sensitive, integration-aware, audit-minded behavior; package-overseer mode governs package-local readiness and remediation evidence, while seam-overseer mode judges cross-package integration, wiring, architecture consistency, GUI/runtime fit, workflow completeness, weak integration, and coherent feature formation.
gui_related: true
gui_classification_reason: This unit includes GUI/runtime fit as a user-visible integration-review concern.
split_recommended: false
depends_on:
  - P-041
unblocks: []
acceptance_criteria:
  - Package-overseer mode stays package-local unless explicitly authorized at higher scope.
  - Seam-overseer mode judges integration and feature coherence across packages.
  - Concerns, critical or major findings, corroboration gaps, and graph-patch needs remain visible and routed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: overseer_review_fit_drift
reasoning_tier: high
context_scope: personas_overseer
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0050
preserved_exact_tokens:
  - "delegation-first"
  - "verification-first"
  - "package-overseer"
  - "seam-overseer"
  - "GUI/runtime fit"
  - "weak integration"
negative_constraints:
  - "Substantial feature work should hand off to general-purpose or a suitable specialty/node-worker Persona."
owner_hints:
  - Plans/Personas.md
```

### P-043 - Document Generation Boundary

```yaml
plan_unit_id: P-043
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  There is no protected core document-writer Persona; durable document creation is workflow behavior handled by the owning surface and resolved stage Persona, and generated requirements, summaries, plans, reports, and durable artifacts remain draft workflow outputs until accepted by the relevant user or validation gate.
gui_related: false
gui_classification_reason: This unit defines workflow ownership and Persona catalog boundaries rather than GUI presentation.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - No dedicated core Document Writer handoff is created or required.
  - Document drafting may use collaborator, assistant, general-purpose, or an authorized narrow specialty according to stage fit.
  - Source fidelity, cross-references, terminology, and owner boundaries are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_writer_core_revival_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0051
preserved_exact_tokens:
  - "document-writer"
  - "Document Writer"
  - "collaborator"
  - "assistant"
  - "general-purpose"
  - "draft workflow outputs"
negative_constraints:
  - "Do not create or require a dedicated core Document Writer handoff."
  - "Do not invent product facts when the supporting canon is incomplete."
owner_hints:
  - Plans/Personas.md
```

### P-044 - Collaborator Core Persona

```yaml
plan_unit_id: P-044
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  collaborator is the user-facing planning, clarification, ideation, interview, scope-probe, specification-discovery, and co-shaping Persona for turning rough ideas into clear, complete, testable project intent before document generation, plan handoff, or build handoff.
gui_related: false
gui_classification_reason: This unit defines planning Persona behavior and workflow handoff policy rather than GUI presentation.
split_recommended: false
depends_on:
  - P-031
  - P-043
unblocks: []
acceptance_criteria:
  - collaborator asks targeted questions in digestible batches and keeps asking follow-ups over the flow.
  - collaborator challenges weak, risky, contradictory, or underspecified ideas directly but constructively.
  - explicit user or workflow confirmation is required before document generation, plan handoff, or build handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: collaborator_persona_scope_drift
reasoning_tier: standard
context_scope: personas_core_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0052
preserved_exact_tokens:
  - "collaborator"
  - "Chain Wizard"
  - "Requirements Doc Builder"
  - "section/thread ledger"
  - "document generation"
negative_constraints:
  - "Requirements drafting and section summaries are workflow outputs, not a handoff to a separate core Document Writer."
owner_hints:
  - Plans/Personas.md
```

### P-045 - Specialty Persona Catalog Scope

```yaml
plan_unit_id: P-045
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Specialty Personas are the configurable layer and may be first-party bundled Personas, project-local Personas, global user Personas, imported seed Personas, or future optional template/catalog entries, but they are not protected core built-ins unless listed in the Reserved Personas section.
gui_related: false
gui_classification_reason: This unit defines catalog layering and mutability scope rather than visual presentation.
split_recommended: false
depends_on:
  - P-021
  - P-031
unblocks: []
acceptance_criteria:
  - The SPECIALTY-PERSONAS anchor remains preserved.
  - Specialty Personas remain configurable rather than protected core built-ins by default.
  - Protected core status is limited to entries listed in the Reserved Personas section.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_catalog_scope_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0053
preserved_exact_tokens:
  - "SPECIALTY-PERSONAS"
  - "Specialty Personas"
  - "first-party bundled Personas"
  - "project-local Personas"
  - "global user Personas"
negative_constraints:
  - "Specialty Personas are not protected core built-ins unless listed in section 6."
owner_hints:
  - Plans/Personas.md
```

### P-046 - Specialty Mutability And Provider-Native Source Rules

```yaml
plan_unit_id: P-046
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  First-party bundled specialty Personas may be modified, disabled, and restored to default; user-created and imported specialty Personas may be edited or deleted; provider-native files are seed/import material only, and provider-native tools lists, WebFetch, WebSearch, protocol JSON examples, context-manager steps, KPI/SLA guarantees, polished completion claims, and benchmark model recommendations are migration inputs rather than literal PM built-in guarantees.
gui_related: false
gui_classification_reason: This unit defines catalog mutability, import, provider-source, permissions, and model-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on:
  - P-007
  - P-045
unblocks: []
acceptance_criteria:
  - Provider-native files under .claude/agents, .cursor/agents, .github, or other provider-native directories are seed/import material only.
  - PM adaptation translates provider-native tools lists into PM permission/tool-preference metadata.
  - Specialty model behavior defaults to Auto/inherit unless a PM-owned definition explicitly sets a provider/model preference.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_native_specialty_source_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0054
preserved_exact_tokens:
  - ".claude/agents"
  - ".cursor/agents"
  - ".github"
  - "WebFetch"
  - "WebSearch"
  - "context-manager"
  - "Auto"
negative_constraints:
  - "Provider-native guarantees and external benchmark model recommendations are not literal PM built-in guarantees."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - Plans/Personas.md
```

### P-047 - First-Party Specialty Browser Groups

```yaml
plan_unit_id: P-047
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The first-party specialty browser groups Personas before individual stack/tool refinements, using Review/audit/verification, Design/research/documentation, Implementation generalists, Data/platform/operations/reliability, Language/framework specialists, and Prompt/LLM systems groups with the listed typical role IDs.
gui_related: true
gui_classification_reason: This unit defines the user-visible specialty browser grouping presentation.
split_recommended: false
depends_on:
  - P-045
unblocks: []
acceptance_criteria:
  - First-party specialty groups appear before individual stack/tool refinements.
  - Typical role IDs remain associated with their groups.
  - Prompt and LLM systems includes prompt-engineer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_browser_grouping_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0055
preserved_exact_tokens:
  - "Review, audit, and verification"
  - "Design, research, and documentation"
  - "Implementation generalists"
  - "Data, platform, operations, and reliability"
  - "Language and framework specialists"
  - "Prompt and LLM systems"
  - "prompt-engineer"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-048 - Specialty Entry Exclusions And Document Writer Guard

```yaml
plan_unit_id: P-048
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  technical-writer is a specialty/template candidate only and must not recreate document-writer by another name, while project-manager, product-manager, and context-manager are not PM Persona catalog entries because delivery sequencing, product framing, and context/memory behavior belong to orchestration, interview, prompt pipeline, and memory systems.
gui_related: false
gui_classification_reason: This unit defines catalog exclusions and ownership boundaries rather than GUI presentation.
split_recommended: false
depends_on:
  - P-043
  - P-045
  - P-047
unblocks: []
acceptance_criteria:
  - technical-writer remains specialty/template candidate only.
  - document-writer is not recreated by another name.
  - project-manager, product-manager, and context-manager remain outside PM Persona catalog entries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_exclusion_boundary_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0055
preserved_exact_tokens:
  - "technical-writer"
  - "document-writer"
  - "project-manager"
  - "product-manager"
  - "context-manager"
negative_constraints:
  - "technical-writer MUST NOT be used to recreate document-writer by another name."
  - "project-manager, product-manager, and context-manager are not PM Persona catalog entries."
owner_hints:
  - Plans/Personas.md
```

### P-049 - First-Wave Specialty Additions And Future Candidates

```yaml
plan_unit_id: P-049
unit_type: decision
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  docker-expert, github-actions-expert, graphql-expert, openapi-expert, and postgres-expert are approved first-wave additions to the first-party specialty catalog, while benchmark-derived candidates such as design-system-architect, observability-engineer, threat-modeling-expert, error-detective, incident-responder, dx-optimizer, api-documenter, monorepo-architect, playwright-expert, kubernetes-expert, terraform-expert, prisma-expert, oauth-oidc-expert, jwt-expert, and rest-expert remain future catalog/template candidates until promoted by owner-doc changes.
gui_related: false
gui_classification_reason: This unit records catalog curation decisions rather than GUI presentation.
split_recommended: false
depends_on:
  - P-045
unblocks: []
acceptance_criteria:
  - Approved first-wave additions remain listed exactly.
  - Future candidates are not treated as approved first-party specialties until promoted by owner-doc changes.
  - First-wave additions map to common IDE tasks and clear stack/tool seams.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_catalog_promotion_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: decision
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0056
preserved_exact_tokens:
  - "docker-expert"
  - "github-actions-expert"
  - "graphql-expert"
  - "openapi-expert"
  - "postgres-expert"
  - "playwright-expert"
  - "oauth-oidc-expert"
negative_constraints:
  - "Future catalog/template candidates are not approved first-wave additions until separately promoted by owner-doc changes."
owner_hints:
  - Plans/Personas.md
```

### P-050 - Specialty Prompt Shape Normalization

```yaml
plan_unit_id: P-050
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  PM-native bundled specialty prompts should be small and sharp, with most specialties around 250-500 words, complex cross-stack or strategy specialties around 450-700 words, internal/helper or narrow stack specialties around 180-350 words, and bodies focused on mission, when to use, when not to use, operating posture, response approach, useful heuristics, boundaries, and handoff expectations.
gui_related: false
gui_classification_reason: This unit defines prompt content shape and metadata boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - P-045
  - P-046
unblocks: []
acceptance_criteria:
  - Permission/tool posture belongs mostly in metadata.
  - Hard numeric goals, fake benchmark claims, vendor/version encyclopedias, generic tool lists, and raw JSON communication examples are avoided unless the role truly requires them.
  - Prompt bodies preserve mission, usage, posture, heuristics, boundaries, and handoff expectations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_prompt_bloat_drift
reasoning_tier: standard
context_scope: personas_specialty_catalog
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0057
preserved_exact_tokens:
  - "250-500 words"
  - "450-700 words"
  - "180-350 words"
  - "permission/tool posture"
  - "raw JSON communication examples"
negative_constraints:
  - "Do not copy long provider-native source files as PM-native bundled specialty prompts."
  - "Avoid fake benchmark claims and generic tool lists unless the role truly requires them."
owner_hints:
  - Plans/Personas.md
```

### P-051 - Specialty Auto-Resolution Collision Rules

```yaml
plan_unit_id: P-051
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Specialty auto-resolution must be predictable: role/function axis outranks stack axis, operation type outranks repository language hints, review/audit roles outrank implementation roles for validation/governance/review tasks, implementation roles outrank review roles for build/change tasks, framework/tool specialists refine broader roles, fullstack-developer loses to narrower backend/frontend or stack-specific matches when justified, and governance/review/corroboration Personas do not collapse into implementation Personas because repository language hints are strong.
gui_related: false
gui_classification_reason: This unit defines resolver and collision logic rather than GUI presentation.
split_recommended: false
depends_on:
  - P-030
  - P-045
unblocks: []
acceptance_criteria:
  - Role/function and operation axes outrank stack/language hints where specified.
  - Review, audit, validation, governance, build, and change tasks route predictably.
  - Framework/tool specialists refine broader roles and normally replace them only when explicitly requested or strongly matched.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_auto_resolution_collision_drift
reasoning_tier: high
context_scope: personas_specialty_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0058
preserved_exact_tokens:
  - "role/function axis"
  - "stack axis"
  - "operation type"
  - "fullstack-developer"
  - "governance/review/corroboration Personas"
negative_constraints:
  - "Governance/review/corroboration Personas do not collapse into implementation Personas merely because repository language hints are strong."
owner_hints:
  - Plans/Personas.md
```

### P-052 - Specialty Browser Resolution Presentation

```yaml
plan_unit_id: P-052
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The specialty browser uses grouping and auto-resolution together: top-level group, specialty within group, optional stack/framework refinement, then project/global override.
gui_related: true
gui_classification_reason: This unit defines user-visible specialty browser ordering and presentation.
split_recommended: false
depends_on:
  - P-047
  - P-051
unblocks: []
acceptance_criteria:
  - Browser presentation starts at the top-level group.
  - Specialty within group and optional stack/framework refinement are represented before project/global override.
  - Browser grouping remains aligned with auto-resolution behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: specialty_browser_resolution_drift
reasoning_tier: standard
context_scope: personas_specialty_resolution
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0058
preserved_exact_tokens:
  - "top-level group"
  - "specialty within group"
  - "optional stack/framework refinement"
  - "project/global override"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Personas.md
```

### P-001 - Personas Retired Source-Preserving Bridge

```yaml
plan_unit_id: P-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Personas.md
canonical_text: >-
  P-001 is a retired source-preserving bridge for generated PDS Owner / Consumer Map, PlanUnits, and Migration Coverage audit material. Product prose from Personas-S0001 through Personas-S0058 is covered by fine-grained P-002 through P-052; Personas-S0059, Personas-S0060, and Personas-S0062 are generated structural/audit metadata, and Personas-S0061 is retired bridge lineage. No residual source_preserving_planunit product coverage remains for Plans/Personas.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related source tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - P-002
  - P-003
  - P-004
  - P-005
  - P-006
  - P-007
  - P-008
  - P-009
  - P-010
  - P-011
  - P-012
  - P-013
  - P-014
  - P-015
  - P-016
  - P-017
  - P-018
  - P-019
  - P-020
  - P-021
  - P-022
  - P-023
  - P-024
  - P-025
  - P-026
  - P-027
  - P-028
  - P-029
  - P-030
  - P-031
  - P-032
  - P-033
  - P-034
  - P-035
  - P-036
  - P-037
  - P-038
  - P-039
  - P-040
  - P-041
  - P-042
  - P-043
  - P-044
  - P-045
  - P-046
  - P-047
  - P-048
  - P-049
  - P-050
  - P-051
  - P-052
unblocks: []
acceptance_criteria:
  - P-001 does not override P-002 through P-052 for Personas-S0001 through Personas-S0058.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Personas.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: personas_residual_bridge
implementation_surfaces:
  - Plans/Personas.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Personas-S0062
preserved_exact_tokens:
  - "P-001"
  - "Personas (Canonical SSOT) Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "source-preserving"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "P-002"
  - "P-052"
negative_constraints:
  - "P-001 must not be used as implementation-ready product coverage for spans now mapped to P-002 through P-052."
  - "Do not remap Personas-S0001 through Personas-S0058 back to P-001."
owner_hints:
  - Plans/Personas.md
```
