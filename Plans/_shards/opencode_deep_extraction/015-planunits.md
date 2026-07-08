# Shard 015: PlanUnits

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L786-L4595

Source SHA256: `1ee201b0044097959cea937dc12a7a2a5d2918f1fd12c8bdf1eeb424e046fe7f`

---

## PlanUnits

### ODE-001 - OpenCode Deep Extraction Retired Source-Preserving Bridge

```yaml
plan_unit_id: ODE-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  ODE-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 110 because OpenCode_Deep_Extraction-S0001 through S0070 are covered by ODE-002 through ODE-074 or explicit structural dispositions. ODE-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained OpenCode Deep Extraction PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- 'ODE-002'
- 'ODE-003'
- 'ODE-004'
- 'ODE-005'
- 'ODE-006'
- 'ODE-007'
- 'ODE-008'
- 'ODE-009'
- 'ODE-010'
- 'ODE-011'
- 'ODE-012'
- 'ODE-013'
- 'ODE-014'
- 'ODE-015'
- 'ODE-016'
- 'ODE-017'
- 'ODE-018'
- 'ODE-019'
- 'ODE-020'
- 'ODE-021'
- 'ODE-022'
- 'ODE-023'
- 'ODE-024'
- 'ODE-025'
- 'ODE-026'
- 'ODE-027'
- 'ODE-028'
- 'ODE-029'
- 'ODE-030'
- 'ODE-031'
- 'ODE-032'
- 'ODE-033'
- 'ODE-034'
- 'ODE-035'
- 'ODE-036'
- 'ODE-037'
- 'ODE-038'
- 'ODE-039'
- 'ODE-040'
- 'ODE-041'
- 'ODE-042'
- 'ODE-043'
- 'ODE-044'
- 'ODE-045'
- 'ODE-046'
- 'ODE-047'
- 'ODE-048'
- 'ODE-049'
- 'ODE-050'
- 'ODE-051'
- 'ODE-052'
- 'ODE-053'
- 'ODE-054'
- 'ODE-055'
- 'ODE-056'
- 'ODE-057'
- 'ODE-058'
- 'ODE-059'
- 'ODE-060'
- 'ODE-061'
- 'ODE-062'
- 'ODE-063'
- 'ODE-064'
- 'ODE-065'
- 'ODE-066'
- 'ODE-067'
- 'ODE-068'
- 'ODE-069'
- 'ODE-070'
- 'ODE-071'
- 'ODE-072'
- 'ODE-073'
- 'ODE-074'
unblocks: []
acceptance_criteria:
- 'ODE-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 110.'
- 'OpenCode_Deep_Extraction-S0001 through S0070 product/source coverage is owned by ODE-002 through ODE-074 or explicit structural dispositions.'
- 'ODE-001 remains only to preserve migration lineage for the former source-preserving bridge.'
- 'The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0035'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0036'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0037'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0038'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0039'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0040'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0041'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0042'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0043'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0044'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0045'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0046'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0047'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0048'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0049'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0051'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0052'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0054'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0056'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0058'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0059'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0060'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0061'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0062'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0063'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0064'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0065'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0066'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0067'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0068'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0069'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0070'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0073'
preserved_exact_tokens:
- 'ODE-001'
- 'OpenCode Deep Extraction Residual Source-Preserving Bridge'
- 'source_preserving_planunit'
- 'source_preserving_bridge_retired'
- '7E.2 Built-in selection'
- '10.7 Usage pipeline and normalization mapping'
- 'PlanUnits'
- 'Migration Coverage'
negative_constraints:
- 'ODE-001 must not re-own OpenCode_Deep_Extraction-S0001 through OpenCode_Deep_Extraction-S0070 after Phase 2B batch 110.'
- 'ODE-001 must not use node_compile_hint.mode=source_preserving_planunit.'
compatibility_only_notes:
- 'Retired bridge is migration-lineage compatibility only.'
stale_retired_dispositions:
- source_preserving_bridge_retired
owner_boundary_notes:
- 'Fine-grained ODE PlanUnits and coverage_map proof now carry product/source coverage.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-002 - Document Purpose And Naming Guard

```yaml
plan_unit_id: ODE-002
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The document preserves Puppet Master naming, compliance with Plans/DRY_Rules.md and Plans/Contracts_V0.md, and deterministic defaults while stating that older names are only referenced as legacy naming.
gui_related: false
gui_classification_reason: The unit records document governance and naming, not a GUI surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_purpose_and_naming_guard
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: document_purpose_and_naming_guard
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0001'
preserved_exact_tokens:
- 'Puppet Master'
- 'legacy naming'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
negative_constraints:
- 'Platform name is Puppet Master only.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'This extraction document is reference lineage and not a design fork.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-003 - Baseline Reference

```yaml
plan_unit_id: ODE-003
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The OpenCode baseline is the upstream repository https://github.com/anomalyco/opencode at Reference date 2026-02-27 UTC, with a version policy that requires no local clone.
gui_related: false
gui_classification_reason: The unit records external reference metadata, not UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: baseline_reference
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: baseline_reference
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0002'
preserved_exact_tokens:
- 'https://github.com/anomalyco/opencode'
- 'Reference date'
- '2026-02-27 UTC'
- 'no local clone required'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'OpenCode remains baseline reference lineage.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-004 - Extraction Goal

```yaml
plan_unit_id: ODE-004
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The extraction goal is to map reusable OpenCode guidance for run modes, agents, permissions, commands, formatters, skills, plugins, models, provider streams, UI command patterns, storage, and event envelopes into Puppet Master SSOT plans without importing drift-prone details.
gui_related: true
gui_classification_reason: The covered goal explicitly includes UI command patterns alongside backend/runtime surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
- 'Mixed GUI/backend scope is explicit and remains split_recommended for downstream owner adoption.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_goal
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_goal
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0003'
preserved_exact_tokens:
- 'run modes'
- 'agents'
- 'permissions'
- 'UI command patterns'
- 'without importing drift-prone details'
negative_constraints:
- 'Do not import drift-prone details.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Puppet Master SSOT plans remain the destination for adopted guidance.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-005 - Hard Constraints And Owner Boundaries

```yaml
plan_unit_id: ODE-005
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master locked stack decisions win; extraction is autonomous and deterministic; findings map to one existing owner or are discarded; generated adapter config remains derived and /no-secrets; OpenCode is baseline-only lineage; permission-preset deltas must not narrow /question/skill/LSP/todo/subagent assistance.
gui_related: false
gui_classification_reason: The unit records governance and owner boundaries, not a GUI surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hard_constraints_and_owner_boundaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: hard_constraints_and_owner_boundaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0004'
preserved_exact_tokens:
- '/no-secrets'
- 'baseline-only reference lineage'
- '/question/skill/LSP/todo/subagent'
- 'Puppet Master locked stack decisions'
negative_constraints:
- 'Permission-preset deltas must not narrow PM planning/research defaults below the product tool surface.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Live PM runtime and permission canon stay in Plans/Permissions_System.md, Plans/Run_Modes.md, Plans/Tools.md, and Plans/Contracts_V0.md.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-006 - Transfer Token Fidelity

```yaml
plan_unit_id: ODE-006
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Hook and formatter extraction must preserve exact lineage tokens including hook-name, HTE, DAE, /DAE, format.*, /rotated, /tool, shell.env, file.edited, permission.ask, and mutation_capable for the owning Skills, Plugins, Formatters, Tools, and permission docs.
gui_related: false
gui_classification_reason: The unit preserves lineage tokens for non-GUI owner docs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: transfer_token_fidelity
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: transfer_token_fidelity
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'hook-name'
- 'HTE'
- 'DAE'
- '/DAE'
- 'format.*'
- '/tool'
- 'shell.env'
- 'file.edited'
- 'permission.ask'
- 'mutation_capable'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills, Plugins, Formatters, Tools, and permission docs own the adopted behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-007 - Runtime Usage Prompt Owner Boundaries

```yaml
plan_unit_id: ODE-007
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Runtime agent state, usage linkage, prompt/HITL/permission references, persona compatibility, and run graph/artifact references stay as lineage for their owning docs rather than becoming local ownership in this extraction doc.
gui_related: false
gui_classification_reason: The unit routes runtime and usage evidence, not visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_usage_prompt_owner_boundaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: runtime_usage_prompt_owner_boundaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'active-agents'
- 'active-agents.json'
- 'usage.event'
- 'UsageRecord'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/human-in-the-loop.md'
- '_persona_id'
- 'Plans/Run_Graph_View.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Runtime, usage, prompt, HITL, persona, and artifact owner docs remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-008 - Coverage And Feature Handoff Hazards

```yaml
plan_unit_id: ODE-008
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Coverage extraction hazards preserve /examples, filename-shaped strings, cmd.*, and /false as evidence only, while coverage matrix, skills/plugins, and MVP promoted-feature handoff references remain audit lineage for their owner docs.
gui_related: false
gui_classification_reason: The unit records extraction hazards and handoff lineage, not GUI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coverage_and_feature_handoff_hazards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: coverage_and_feature_handoff_hazards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/examples'
- 'filename-shaped strings'
- 'cmd.*'
- '/false'
- 'OpenCode_Coverage_Matrix.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
negative_constraints:
- 'Extraction verifiers must not treat hazards as product commands without an owning command or coverage record.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Coverage matrix, Skills_System, Plugins_System, and promoted-feature docs own adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-009 - Historical Projection And Ghost Evidence

```yaml
plan_unit_id: ODE-009
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Historical run lineage, projection references, and ghost wiring hazards remain extraction evidence using tokens such as /successor, /package/node, /projection, storage-plan.md, /ghost, and Wiring_Matrix.md.
gui_related: false
gui_classification_reason: The unit preserves audit lineage, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: historical_projection_and_ghost_evidence
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: historical_projection_and_ghost_evidence
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/successor'
- '/package/node'
- '/projection'
- 'storage-plan.md'
- '/ghost'
- 'Wiring_Matrix.md'
negative_constraints: []
compatibility_only_notes:
- 'Older extraction labels remain evidence until owner docs model them explicitly.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Storage and wiring owners retain canonical ownership.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-010 - Remediation And Lane Evidence

```yaml
plan_unit_id: ODE-010
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Long-running remediation, provider-key, node attempt lane, and executor package/seam/lane evidence preserve tokens such as /reviewer/remediation, super-agent, control-plane, GPT, /key, /node/attempt/lane, and /package/seam/lane for downstream owners.
gui_related: false
gui_classification_reason: The unit records orchestration evidence, not GUI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remediation_and_lane_evidence
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: remediation_and_lane_evidence
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/reviewer/remediation'
- 'super-agent'
- 'control-plane'
- 'GPT'
- '/key'
- '/node/attempt/lane'
- '/package/seam/lane'
- 'Executor_Protocol.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Orchestration, provider, executor, and integration owner docs retain adoption authority.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-011 - Owner And Legacy Tier Hazards

```yaml
plan_unit_id: ODE-011
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Owner-of-owners, runtime owner-level, run relationship labels, and legacy tier-construction snippets including CrewCreator::Orchestrator, to_tier_id, tier-era, thread_id, and interview-phase are preserved as extraction hazards rather than current package/lane owners.
gui_related: false
gui_classification_reason: The unit records legacy terminology hazards, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_and_legacy_tier_hazards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: owner_and_legacy_tier_hazards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'owner-of-owners'
- 'tier-era'
- 'CrewCreator::Orchestrator'
- 'to_tier_id'
- 'thread_id'
- 'interview-phase'
- 'shares feature seam with run'
negative_constraints:
- 'Legacy tier-era snippets are extraction hazards rather than current package/lane owners.'
compatibility_only_notes:
- 'Runtime owner-level and tier labels are compatibility labels when compared with current owner docs.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Current package/lane ownership is resolved by owner docs, not this extraction baseline.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-012 - Routing Risk And Multi-Model Continuation

```yaml
plan_unit_id: ODE-012
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Run graph handoff, /Crosswalk and /routing dispute risk, Sonnet-confirmed downstream cohort drift, high-signal multi-model continuation posture, and later-model continuation evidence remain audit lineage.
gui_related: false
gui_classification_reason: The unit records audit/routing evidence, not user-visible GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: routing_risk_and_multi_model_continuation
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: routing_risk_and_multi_model_continuation
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'Run_Graph_View.md'
- '/Crosswalk'
- '/routing'
- 'Sonnet-confirmed downstream cohort drift'
- 'multi-model'
- 'later-model continuation'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Glossary/Crosswalk reconciliation remains downstream owner work.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-013 - Extraction Inputs

```yaml
plan_unit_id: ODE-013
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The deterministic extraction inputs are the OpenCode repository and the Puppet Master Plans directory as SSOT.
gui_related: false
gui_classification_reason: The unit records input scope, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_inputs
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_inputs
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0006'
preserved_exact_tokens:
- 'OpenCode repository'
- 'https://github.com/anomalyco/opencode'
- 'Puppet Master Plans directory'
- 'SSOT'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plans directory remains the canonical SSOT.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-014 - Deterministic Extraction Procedure

```yaml
plan_unit_id: ODE-014
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The procedure references upstream via web/API without cloning, inventories tools/provider/UI/storage surfaces, extracts ordered artifacts, normalizes OpenCode names into Puppet Master terms, maps each concept to exactly one SSOT target, and avoids local clone cleanup.
gui_related: true
gui_classification_reason: The covered procedure includes UI command catalog extraction alongside backend/runtime surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
- 'Mixed UI/backend extraction scope remains split_recommended for owner adoption.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_extraction_procedure
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: deterministic_extraction_procedure
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0007'
preserved_exact_tokens:
- 'Provider'
- 'EventRecord'
- 'UICommand'
- 'tool.invoked/tool.denied'
- 'Never duplicate'
- 'No local clone cleanup required'
negative_constraints:
- 'Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Each extracted concept chooses exactly one target plan doc section or is discarded.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-015 - Downstream Output Record Shape

```yaml
plan_unit_id: ODE-015
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Each extracted item emits source, category, puppet_master_target, decision, rationale, and acceptance_impact so downstream agents can route adopted, adapted, or discarded findings deterministically.
gui_related: false
gui_classification_reason: The unit records data shape, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: downstream_output_record_shape
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: downstream_output_record_shape
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0008'
preserved_exact_tokens:
- 'source'
- 'category'
- 'puppet_master_target'
- 'decision'
- 'adopt | adapt | discard'
- 'acceptance_impact'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Downstream agents consume the record shape; owner docs remain canonical.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-016 - Extraction Acceptance Criteria

```yaml
plan_unit_id: ODE-016
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Extraction must run end-to-end without prompts, map every adopted/adapted item to a single Puppet Master SSOT section, and avoid overwriting locked Puppet Master decisions.
gui_related: false
gui_classification_reason: The unit records acceptance criteria, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_acceptance_criteria
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_acceptance_criteria
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0009'
preserved_exact_tokens:
- 'end-to-end without prompts'
- 'single Puppet Master SSOT doc section'
- 'No Puppet Master locked decisions are overwritten'
negative_constraints:
- 'No Puppet Master locked decisions are overwritten by OpenCode-derived content.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Accepted/adapted findings route to one SSOT section.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-017 - Plan Mode Baseline

```yaml
plan_unit_id: ODE-017
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode plan mode injects a system-reminder, forbids file edits and system changes except plan files, uses a multi-phase plan prompt, exits through PlanExitTool, and may use an experimental plan mode flag for richer switching.
gui_related: false
gui_classification_reason: The unit records run-mode baseline behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_mode_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plan_mode_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0012'
preserved_exact_tokens:
- 'plan'
- '<system-reminder>'
- 'STRICTLY FORBIDDEN'
- 'PlanExitTool'
- 'Flag.OPENCODE_EXPERIMENTAL_PLAN_MODE'
negative_constraints:
- 'Plan mode forbids file edits, modifications, or system changes outside the allowed plan scope.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Run_Modes and Permissions owner docs decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-018 - Agent Mode Switching Baseline

```yaml
plan_unit_id: ODE-018
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode mode switching creates synthetic MessageV2.User messages with an agent field, @agent syntax creates AgentPart, bypassAgentCheck affects tool resolution, and BUILD_SWITCH reminds build agents to execute the plan.
gui_related: false
gui_classification_reason: The unit records agent switching mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_mode_switching_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: agent_mode_switching_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0013'
preserved_exact_tokens:
- 'MessageV2.User'
- 'agent'
- '@agent'
- 'AgentPart'
- 'bypassAgentCheck'
- 'BUILD_SWITCH'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Run mode and agent owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-019 - Ask Approval Semantics Baseline

```yaml
plan_unit_id: ODE-019
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Question.ask() presents structured questions and blocks tool execution until response; permission ask() emits permission.asked and resolves or rejects with RejectedError, CorrectedError, or DeniedError.
gui_related: false
gui_classification_reason: The unit records approval semantics, not visual UI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ask_approval_semantics_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ask_approval_semantics_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0014'
preserved_exact_tokens:
- 'Question.ask()'
- 'permission.asked'
- 'RejectedError'
- 'CorrectedError'
- 'DeniedError'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'HITL and Permissions owner docs remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-020 - Agent Info Schema Fields

```yaml
plan_unit_id: ODE-020
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The Agent.Info schema preserves agent fields name, description, mode, native, hidden, topP, temperature, color, permission, model, variant, prompt, options, and steps.
gui_related: true
gui_classification_reason: The field list includes UI color and user-visible agent metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_info_schema_fields
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: agent_info_schema_fields
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0016'
preserved_exact_tokens:
- 'Agent.Info'
- 'name'
- 'mode'
- 'native'
- 'hidden'
- 'color'
- 'permission'
- 'model'
- 'variant'
- 'prompt'
- 'steps'
- 'options'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Personas/agent runtime owner docs decide adopted schema.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-021 - Built In User Agent Definitions

```yaml
plan_unit_id: ODE-021
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode built-in agents include build, plan, general, explore, compaction, title, and summary; user-defined agents can override model, variant, prompt, description, sampling, mode, color, hidden, name, steps, options, permission, or disable an agent.
gui_related: true
gui_classification_reason: The unit includes user-visible agent names and color metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_user_agent_definitions
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: built_in_user_agent_definitions
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0016'
preserved_exact_tokens:
- 'build'
- 'plan'
- 'general'
- 'explore'
- 'compaction'
- 'title'
- 'summary'
- 'disable: true'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Agent/runtime owner docs decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-022 - Subagent Invocation Mechanism

```yaml
plan_unit_id: ODE-022
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Subagents are invoked through task({ prompt, description, subagent_type, command }); the loop executes SubtaskPart entries, writes running ToolPart state, triggers tool.execute plugin hooks, and inherits merged permissions.
gui_related: false
gui_classification_reason: The unit records runtime mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: subagent_invocation_mechanism
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: subagent_invocation_mechanism
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0017'
preserved_exact_tokens:
- 'task({ prompt, description, subagent_type, command })'
- 'SubtaskPart'
- 'ToolPart'
- 'tool.execute.before'
- 'tool.execute.after'
- 'merged permissions'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Subagent and plugin owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-023 - Explore Agent Baseline

```yaml
plan_unit_id: ODE-023
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The explore agent is a read-only file search specialist whose permissions allow grep, glob, list, bash, webfetch, websearch, codesearch, read, external_directory for whitelisted roots, and no state modification.
gui_related: false
gui_classification_reason: The unit records read-only agent capability, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: explore_agent_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: explore_agent_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0018'
preserved_exact_tokens:
- 'explore'
- 'read-only subagent'
- 'grep'
- 'glob'
- 'list'
- 'bash'
- 'webfetch'
- 'websearch'
- 'codesearch'
- 'read'
negative_constraints:
- 'Explore agent must not create files or modify system state.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions and subagent owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-024 - Prompt Assembly Pipeline

```yaml
plan_unit_id: ODE-024
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The prompt assembly pipeline builds environment system prompt, instruction prompts, optional structured output prompt, plugin system/messages transforms, reminder injection, and MessageV2.toModelMessages() per loop.
gui_related: false
gui_classification_reason: The unit records prompt pipeline behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prompt_assembly_pipeline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: prompt_assembly_pipeline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0019'
preserved_exact_tokens:
- 'SystemPrompt.environment(model)'
- 'InstructionPrompt.system()'
- 'experimental.chat.system.transform'
- 'experimental.chat.messages.transform'
- 'insertReminders()'
- 'MessageV2.toModelMessages()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Prompt_Pipeline remains the owning doc for adopted behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-025 - Compaction And Summaries

```yaml
plan_unit_id: ODE-025
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  SessionCompaction detects overflow from token counts, inserts CompactionPart, prunes old completed tool outputs beyond a 40,000-token protection window, preserves protected tools, and uses hidden compaction/summary agents.
gui_related: false
gui_classification_reason: The unit records session continuation mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compaction_and_summaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: compaction_and_summaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0020'
preserved_exact_tokens:
- 'SessionCompaction.isOverflow()'
- 'CompactionPart'
- '40,000-token protection window'
- 'protected tools'
- 'compaction'
- 'summary'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Session/runtime owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-026 - Permission Resolution Algorithm

```yaml
plan_unit_id: ODE-026
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  PermissionNext.evaluate merges flat rulesets and uses findLast so last match wins; default action is ask, deny short-circuits, and ask emits a bus request before blocking for reply.
gui_related: false
gui_classification_reason: The unit records permission algorithm behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_resolution_algorithm
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_resolution_algorithm
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0022'
preserved_exact_tokens:
- 'PermissionNext.evaluate'
- 'findLast'
- 'Last match wins'
- 'default is { action: "ask" }'
- 'deny'
- 'ask'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted PM permission rules.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-027 - Permission Object Syntax

```yaml
plan_unit_id: ODE-027
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission config supports simple string actions and object syntax where outer keys are permissions and inner keys are patterns, producing {permission, pattern, action} rules.
gui_related: false
gui_classification_reason: The unit records config syntax, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_object_syntax
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_object_syntax
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0023'
preserved_exact_tokens:
- 'fromConfig()'
- 'simple strings'
- 'object syntax'
- '{permission, pattern, action}'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted config syntax.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-028 - Wildcard Matching

```yaml
plan_unit_id: ODE-028
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Wildcard matching preserves * and ? semantics, the trailing space-star optional portion, home expansion through PermissionNext.expand(), and Windows case-insensitive matching.
gui_related: false
gui_classification_reason: The unit records matching semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wildcard_matching
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: wildcard_matching
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0024'
preserved_exact_tokens:
- '*'
- '?'
- 'trailing ` *`'
- '~'
- '$HOME'
- 'PermissionNext.expand()'
- 'case-insensitive'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted matching behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-029 - Special Permission Guards

```yaml
plan_unit_id: ODE-029
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode special guards external_directory and doom_loop default to ask, while question, plan_enter, and plan_exit default to deny globally and are enabled selectively per agent.
gui_related: false
gui_classification_reason: The unit records guard defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: special_permission_guards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: special_permission_guards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0025'
preserved_exact_tokens:
- 'external_directory'
- 'doom_loop'
- 'question'
- 'plan_enter'
- 'plan_exit'
- 'ask'
- 'deny'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions and run-mode owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-030 - Ask UI Reply Semantics

```yaml
plan_unit_id: ODE-030
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission replies once, always, and reject control one-time approval, session-scoped allow rules, auto-resolution of pending requests, CorrectedError feedback, and rejection of same-session pending requests.
gui_related: true
gui_classification_reason: The unit describes user-facing ask/approval UI reply semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ask_ui_reply_semantics
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ask_ui_reply_semantics
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0026'
preserved_exact_tokens:
- 'once'
- 'always'
- 'reject'
- 'session-scoped approved ruleset'
- 'CorrectedError'
- 'RejectedError'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'HITL and Permissions owner docs decide adopted UI behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-031 - Default Env Deny Rules

```yaml
plan_unit_id: ODE-031
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Default read permissions allow general reads, ask for .env and .env.* files, and allow .env.example as a Node.gitignore-mirrored pattern.
gui_related: false
gui_classification_reason: The unit records permission defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_env_deny_rules
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: default_env_deny_rules
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0027'
preserved_exact_tokens:
- 'read: { "*": "allow", "*.env": "ask", "*.env.*": "ask", "*.env.example": "allow" }'
- '.env'
- '.env.*'
- '.env.example'
- 'Node.gitignore'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted secret-file policy.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-032 - Command Discovery Paths

```yaml
plan_unit_id: ODE-032
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Commands load in order from built-ins, config commands, MCP prompts, and skills, with project commands at .opencode/commands/<name>.md and global commands at ~/.config/opencode/commands/<name>.md.
gui_related: false
gui_classification_reason: The unit records command discovery behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_discovery_paths
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_discovery_paths
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0029'
preserved_exact_tokens:
- 'init'
- 'review'
- 'config.command'
- 'MCP.prompts()'
- 'skills'
- '.opencode/commands/<name>.md'
- '~/.config/opencode/commands/<name>.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System and Skills_System decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-033 - Command Frontmatter Fields

```yaml
plan_unit_id: ODE-033
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Command.Info preserves command metadata fields name, description, agent, model, source, template, subtask, and hints, including source values command, mcp, and skill.
gui_related: false
gui_classification_reason: The unit records command schema metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_frontmatter_fields
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_frontmatter_fields
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0030'
preserved_exact_tokens:
- 'Command.Info'
- 'name'
- 'description'
- 'agent'
- 'model'
- 'source'
- 'template'
- 'subtask'
- 'hints'
- 'command | mcp | skill'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System decides adopted PM command schema.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-034 - Command Template Features

```yaml
plan_unit_id: ODE-034
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Command templates preserve positional args $1 and $2, $ARGUMENTS, shell output injection with !`command`, @file inclusion via FILE_REGEX, and resolvePromptParts() conversion to FilePart or AgentPart.
gui_related: false
gui_classification_reason: The unit records command template syntax, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_template_features
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_template_features
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0031'
preserved_exact_tokens:
- '$1'
- '$2'
- '$ARGUMENTS'
- '!`command`'
- '@file'
- 'FILE_REGEX'
- 'resolvePromptParts()'
- 'FilePart'
- 'AgentPart'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System decides adopted PM template syntax.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-035 - Command Subtask And Model Override

```yaml
plan_unit_id: ODE-035
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  When subtask: true, commands run as subagent tasks; model overrides use provider_id/model_id parsed by Provider.parseModel(); config commands can override built-ins by name.
gui_related: false
gui_classification_reason: The unit records command execution routing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_subtask_and_model_override
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_subtask_and_model_override
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0032'
preserved_exact_tokens:
- 'subtask: true'
- 'provider_id/model_id'
- 'Provider.parseModel()'
- 'override built-in commands'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands and provider owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-036 - Formatter Edit Event Trigger

```yaml
plan_unit_id: ODE-036
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Formatters run automatically after File.Event.Edited bus events by detecting the extension, finding matching enabled formatters, and running them sequentially.
gui_related: false
gui_classification_reason: The unit records formatter runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_edit_event_trigger
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_edit_event_trigger
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0034'
preserved_exact_tokens:
- 'Format.init()'
- 'File.Event.Edited'
- 'extension'
- 'enabled formatters'
- 'sequentially'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Formatters_System decides adopted PM formatter behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-037 - Built-In Formatter Selection Baseline

```yaml
plan_unit_id: ODE-037
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The OpenCode formatter baseline preserves the built-in formatter catalog and detection table, including prettier, biome, rustfmt, gofmt, ruff, shfmt, clang-format, dart, mix, zig, ktlint, rubocop, standardrb, pint, ocamlformat, nixfmt, ormolu, terraform, latexindent, gleam, cljfmt, oxfmt, uv, air, htmlbeautifier, and dfmt.
gui_related: false
gui_classification_reason: The unit records formatter tooling metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_formatter_selection_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: built_in_formatter_selection_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0035'
preserved_exact_tokens:
- 'prettier'
- 'biome'
- 'rustfmt'
- 'uv'
- 'air'
- 'htmlbeautifier'
- 'dfmt'
- 'oxfmt'
- 'Experimental flag + `oxfmt` in deps'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-038 - Formatter Config Schema And File Placeholder

```yaml
plan_unit_id: ODE-038
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Formatter config preserves formatter: false global disablement, per-formatter disabled/command/environment/extensions fields, $FILE replacement at execution time, command.length === 0 skip behavior, and config-defined custom formatter enabled() override behavior.
gui_related: false
gui_classification_reason: The unit records formatter configuration semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_config_schema_and_file_placeholder
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_config_schema_and_file_placeholder
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0036'
preserved_exact_tokens:
- 'formatter: false'
- 'disabled'
- 'command'
- 'environment'
- 'extensions'
- '$FILE'
- 'command.length === 0'
- 'enabled()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-039 - Skill Discovery Paths Baseline

```yaml
plan_unit_id: ODE-039
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill discovery preserves the OpenCode load order across external global roots, external project roots, .opencode skill roots, config.skills.paths[], and config.skills.urls[] with Discovery.pull() cache download behavior and later-source overwrite semantics.
gui_related: false
gui_classification_reason: The unit records skill discovery metadata, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_discovery_paths_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_discovery_paths_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0038'
preserved_exact_tokens:
- '~/.claude/skills/**/SKILL.md'
- '~/.agents/skills/**/SKILL.md'
- 'OPENCODE_DISABLE_EXTERNAL_SKILLS'
- '.opencode/{skill,skills}/**/SKILL.md'
- 'config.skills.paths[]'
- 'config.skills.urls[]'
- 'Discovery.pull()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-040 - Skill Frontmatter Validation Baseline

```yaml
plan_unit_id: ODE-040
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill frontmatter preserves required name and description fields, auto-set location and content fields, the name regex and length constraints, duplicate overwrite warning behavior, and the compatibility-only fact that license, compatibility, and metadata may appear without core validation.
gui_related: false
gui_classification_reason: The unit records skill schema behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_frontmatter_validation_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_frontmatter_validation_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0039'
preserved_exact_tokens:
- 'name'
- 'description'
- 'location'
- 'content'
- '^[a-z0-9]+(-[a-z0-9]+)*$'
- 'SkillNameMismatchError'
- 'license'
- 'compatibility'
- 'metadata'
negative_constraints: []
compatibility_only_notes:
- 'Additional skill frontmatter fields may appear but are not used by core OpenCode loading logic.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-041 - Skill Agent Surface Baseline

```yaml
plan_unit_id: ODE-041
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill agent surface preserves available skill listing through <available_skills> XML blocks, invocation through skill({ name }), and registration as invokable /skillname commands from the command palette.
gui_related: false
gui_classification_reason: The unit records command/agent integration behavior rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_agent_surface_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_agent_surface_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0040'
preserved_exact_tokens:
- '<available_skills>'
- 'skill({ name })'
- '/skillname'
- 'command palette'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and Commands_System decide adopted PM behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-042 - Skill Permission Integration Baseline

```yaml
plan_unit_id: ODE-042
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill permission integration preserves the skill permission key with patterns, skill-directory external_directory whitelisting, and compaction protection through PRUNE_PROTECTED_TOOLS = ["skill"].
gui_related: false
gui_classification_reason: The unit records permission/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_permission_integration_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_permission_integration_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0041'
preserved_exact_tokens:
- 'skill'
- 'external_directory'
- 'PRUNE_PROTECTED_TOOLS = ["skill"]'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and Permissions_System decide adopted PM behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-043 - Plugin Discovery And Load Order Baseline

```yaml
plan_unit_id: ODE-043
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin discovery preserves internal auth plugins, the built-in opencode-anthropic-auth@0.0.13 package, config.plugin[] package or file:// entries, BunProc.install(), import(plugin), and Set<PluginInstance> deduplication.
gui_related: false
gui_classification_reason: The unit records plugin loading behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_discovery_and_load_order_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_discovery_and_load_order_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0043'
preserved_exact_tokens:
- 'CodexAuthPlugin'
- 'CopilotAuthPlugin'
- 'GitlabAuthPlugin'
- 'opencode-anthropic-auth@0.0.13'
- 'OPENCODE_DISABLE_DEFAULT_PLUGINS'
- 'config.plugin[]'
- 'file://'
- 'BunProc.install(pkg, version)'
- 'import(plugin)'
- 'Set<PluginInstance>'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-044 - Plugin Context And Signature Baseline

```yaml
plan_unit_id: ODE-044
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin context preserves the async PluginInput signature with client, project, worktree, directory, serverUrl, and $ fields, where $ is the Bun shell for subprocess execution and the plugin returns a Hooks object.
gui_related: false
gui_classification_reason: The unit records plugin API shape, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_context_and_signature_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_context_and_signature_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0044'
preserved_exact_tokens:
- 'PluginInput'
- 'client'
- 'project'
- 'worktree'
- 'directory'
- 'serverUrl'
- '$'
- 'Hooks'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plugins_System decides adopted PM plugin API behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-045 - Plugin Hook Events Baseline

```yaml
plan_unit_id: ODE-045
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin hook events preserve event, config, tool, auth, chat.message, chat.params, chat.headers, permission.ask, command.execute.before, tool.execute.before, tool.execute.after, shell.env, experimental.chat.messages.transform, experimental.chat.system.transform, experimental.session.compacting, and experimental.text.complete.
gui_related: false
gui_classification_reason: The unit records plugin hook behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_hook_events_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_hook_events_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0045'
preserved_exact_tokens:
- 'event'
- 'config'
- 'tool'
- 'auth'
- 'chat.message'
- 'chat.params'
- 'chat.headers'
- 'permission.ask'
- 'command.execute.before'
- 'tool.execute.before'
- 'tool.execute.after'
- 'shell.env'
- 'experimental.chat.messages.transform'
- 'experimental.chat.system.transform'
- 'experimental.session.compacting'
- 'experimental.text.complete'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-046 - Plugin Custom Tool Precedence Baseline

```yaml
plan_unit_id: ODE-046
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode plugin custom tools are defined through the tool hook property, loaded into ToolRegistry beside built-ins, and override built-in tools on name collision as the baseline extensibility behavior.
gui_related: false
gui_classification_reason: The unit records plugin/tool registry behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_custom_tool_precedence_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_custom_tool_precedence_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0046'
preserved_exact_tokens:
- 'tool'
- 'Record<string, ToolDefinition>'
- 'ToolRegistry'
- 'plugin tools override built-in tools'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plugins_System and Tools.md decide whether PM adopts or diverges from this baseline.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-047 - Provider Model ID Parsing Baseline

```yaml
plan_unit_id: ODE-047
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider model ID parsing preserves provider_id/model_id format and parseModel() split-on-first-slash behavior, with everything before the first slash as providerID and the joined remainder as modelID.
gui_related: false
gui_classification_reason: The unit records provider identifier parsing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_id_parsing_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_model_id_parsing_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0048'
preserved_exact_tokens:
- 'provider_id/model_id'
- 'anthropic/claude-sonnet-4'
- 'parseModel()'
- 'providerID'
- 'modelID'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-048 - Default Model Selection Priority Baseline

```yaml
plan_unit_id: ODE-048
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Default model selection preserves config.model priority, model.json last-used lookup, internal priority list gpt-5, claude-sonnet-4, big-pickle, gemini-3-pro, latest suffix sorting, model ID sorting, and the note that CLI flag override occurs upstream.
gui_related: false
gui_classification_reason: The unit records model selection behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_model_selection_priority_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: default_model_selection_priority_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0049'
preserved_exact_tokens:
- 'config.model'
- 'model.json'
- 'gpt-5'
- 'claude-sonnet-4'
- 'big-pickle'
- 'gemini-3-pro'
- 'latest'
- 'CLI flag override'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-049 - Provider Specific Model Options Baseline

```yaml
plan_unit_id: ODE-049
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider-specific model options preserve config.provider.<provider>.options, Anthropic beta headers, OpenAI .responses() API use, Bedrock region/profile/credentials, and per-agent model overrides through agent.<name>.model.
gui_related: false
gui_classification_reason: This split unit covers backend/provider configuration behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_specific_model_options_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_specific_model_options_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
preserved_exact_tokens:
- 'config.provider.<provider>.options'
- 'anthropic-beta'
- 'OpenAI uses `.responses()` API'
- 'Bedrock'
- 'agent.<name>.model'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-050 - Model Variant UI And Per-Agent Variant Baseline

```yaml
plan_unit_id: ODE-050
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Model variants preserve built-in and custom variants, UI keybind cycling, and per-agent variant overrides through agent.<name>.variant.
gui_related: true
gui_classification_reason: The unit covers user-visible model variant selection behavior through UI keybind cycling.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_variant_ui_and_per_agent_variant_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: model_variant_ui_and_per_agent_variant_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
preserved_exact_tokens:
- 'Variants'
- 'Built-in + custom variants'
- 'cycling via keybind in UI'
- 'agent.<name>.variant'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-051 - Provider Transform Layer Baseline

```yaml
plan_unit_id: ODE-051
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider transform baseline preserves normalizeMessages(), providerOptions(), schema() compatibility transforms, maxOutputTokens(), OUTPUT_TOKEN_MAX, and OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX.
gui_related: false
gui_classification_reason: The unit records provider transform/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_layer_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_transform_layer_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0051'
preserved_exact_tokens:
- 'normalizeMessages()'
- 'providerOptions()'
- 'schema()'
- 'maxOutputTokens()'
- 'OUTPUT_TOKEN_MAX'
- 'OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX'
negative_constraints: []
compatibility_only_notes:
- 'Provider compatibility lives in transform behavior rather than a one-to-one provider API mapping.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-052 - Provider Error Handling Baseline

```yaml
plan_unit_id: ODE-052
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider error handling preserves isOverflow() regex detection across provider error messages, isRetryable() provider-specific retryability including OpenAI 404 handling, and nested responseBody JSON error extraction.
gui_related: false
gui_classification_reason: The unit records provider error behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_error_handling_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_error_handling_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0052'
preserved_exact_tokens:
- 'isOverflow()'
- 'isRetryable()'
- 'OpenAI 404s'
- 'responseBody'
- 'Anthropic'
- 'Bedrock'
- 'Google'
- 'xAI'
- 'Groq'
- 'DeepSeek'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-053 - Run Agent Permission Command SSOT Map

```yaml
plan_unit_id: ODE-053
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes run modes, agent switching, approval semantics, agent definitions, subagent invocation, explore agent, prompt assembly, compaction, permissions, and commands to their owning Puppet Master SSOT docs rather than duplicating definitions here.
gui_related: true
gui_classification_reason: The mapped topics include user-visible run modes, approval, command, and orchestration surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: run_agent_permission_command_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: run_agent_permission_command_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'A1'
- 'A2'
- 'A3'
- 'B1'
- 'B2'
- 'B3'
- 'B4'
- 'B5'
- 'C1'
- 'C2'
- 'C3'
- 'C4'
- 'C5'
- 'C6'
- 'D1'
- 'D2'
- 'D3'
- 'D4'
- 'Run_Modes.md'
- 'Orchestrator_Page.md'
- 'human-in-the-loop.md'
- 'Prompt_Pipeline.md'
- 'Permissions_System.md'
- 'Commands_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'This extraction doc records mapping; the named SSOT docs own canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-054 - Formatter Skill Plugin Model SSOT Map

```yaml
plan_unit_id: ODE-054
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes formatter, skill, plugin, and model extraction topics to Formatters_System, Skills_System, Plugins_System, and Models_System owner docs.
gui_related: false
gui_classification_reason: The unit records backend/tooling owner routing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_skill_plugin_model_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_skill_plugin_model_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'E1'
- 'E2'
- 'E3'
- 'F1'
- 'F2'
- 'F3'
- 'F4'
- 'G1'
- 'G2'
- 'G3'
- 'G4'
- 'H1'
- 'H2'
- 'H3'
- 'H4'
- 'Formatters_System.md'
- 'Skills_System.md'
- 'Plugins_System.md'
- 'Models_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'The named owner docs retain canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-055 - Tool Provider Storage Message SSOT Map

```yaml
plan_unit_id: ODE-055
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes Tools plus ToolContext, normalized provider stream, storage event types, and message/part taxonomy to Tools.md, Contracts_V0.md, CLI_Bridged_Providers.md, storage-plan.md, and related owners.
gui_related: false
gui_classification_reason: The unit records backend/runtime owner routing, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_provider_storage_message_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: tool_provider_storage_message_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'Tools + ToolContext'
- 'Provider stream'
- 'Storage'
- 'Message/part taxonomy'
- 'Plans/Tools.md'
- 'Plans/Contracts_V0.md'
- 'Plans/CLI_Bridged_Providers.md'
- 'Plans/storage-plan.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'The named owner docs retain canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-056 - UI Command SSOT Map And ContractRefs

```yaml
plan_unit_id: ODE-056
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes UI commands to Plans/UI_Command_Catalog.md and preserves the ContractRef set for EventRecord, UICommand, bridged providers, Provider_OpenCode, Tools, UI_Command_Catalog, and storage-plan.
gui_related: true
gui_classification_reason: The unit explicitly maps UI command behavior to the UI command catalog owner.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_ssot_map_and_contractrefs
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ui_command_ssot_map_and_contractrefs
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'UI commands'
- 'Plans/UI_Command_Catalog.md'
- 'S2 (stable IDs)'
- 'Contracts_V0.md#EventRecord'
- 'Contracts_V0.md#7-uicommand'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'UI_Command_Catalog.md owns adopted UI command IDs and behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
```

### ODE-057 - Rust Plan Mode And Plan Storage Delta

```yaml
plan_unit_id: ODE-057
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master plan-mode deltas preserve Rust-native plan mode, Rust prompt-builder reminder injection, and plan file locations at global ~/.config/puppet-master/plans/ and project .puppet-master/plans/ paths.
gui_related: false
gui_classification_reason: This split unit covers backend prompt/runtime and storage behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rust_plan_mode_and_plan_storage_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: rust_plan_mode_and_plan_storage_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
preserved_exact_tokens:
- 'Rust-native plan mode'
- 'system-reminder injection'
- 'Rust prompt builder'
- '~/.config/puppet-master/plans/'
- '.puppet-master/plans/'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-058 - Approval Flow Slint GUI CLI Delta

```yaml
plan_unit_id: ODE-058
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master approval-flow delta preserves removal of Bun dependency and routes PlanExitTool-like approval through the Slint GUI as primary surface with CLI fallback per Plans/Permissions_System.md.
gui_related: true
gui_classification_reason: The unit covers the user-visible Slint GUI approval surface and CLI fallback.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: approval_flow_slint_gui_cli_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: approval_flow_slint_gui_cli_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
preserved_exact_tokens:
- 'No Bun dependency'
- 'PlanExitTool'
- 'Question.ask()'
- 'Slint GUI'
- 'CLI fallback'
- 'Plans/Permissions_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System owns adopted PM approval behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-059 - Subagent Context Injection Delta

```yaml
plan_unit_id: ODE-059
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master subagent/context deltas preserve subprocess or thread-based agent execution, Rust prompt assembly, configurable 20,000-token reserve and 40,000-token prune-protect values, and plugin prompt transform aliases for experimental.chat.system.transform and experimental.chat.messages.transform.
gui_related: false
gui_classification_reason: The unit records runtime/prompt behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: subagent_context_injection_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: subagent_context_injection_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0056'
preserved_exact_tokens:
- 'subprocess-based or thread-based'
- 'Prompt assembly in Rust'
- '20,000-token reserve'
- '40,000-token prune-protect'
- 'experimental.chat.system.transform'
- 'experimental.chat.messages.transform'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-060 - Permission Persistence Wildcard Reject Cascade Delta

```yaml
plan_unit_id: ODE-060
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master permission deltas preserve session-scoped always approvals as default, no cross-session persistence, a Rust wildcard engine or library, and reject-all cascade behavior for pending permissions.
gui_related: false
gui_classification_reason: This split unit covers backend permission storage and matching behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_persistence_wildcard_reject_cascade_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_persistence_wildcard_reject_cascade_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
preserved_exact_tokens:
- 'session-scoped approvals'
- 'not persisted to disk'
- 'Rust wildcard engine'
- 'Reject-all cascade'
negative_constraints:
- 'Persistence across sessions is not supported.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-061 - Permission Approval GUI CLI Delta

```yaml
plan_unit_id: ODE-061
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master approval-flow delta preserves the requirement to wire adopted OpenCode ask/reply semantics through PM-native Slint approval surfaces or CLI fallback, while older Tauri GUI wording is retired source-lineage only.
gui_related: true
gui_classification_reason: The unit covers user-visible GUI/CLI approval interaction.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_approval_gui_cli_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_approval_gui_cli_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
preserved_exact_tokens:
- 'GUI approval flow'
- 'Slint approval surfaces'
- 'CLI interface'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Older Tauri GUI wording is source-lineage only; current GUI owner docs use Rust + Slint.'
owner_boundary_notes:
- 'Permissions_System and human-in-the-loop own adopted PM approval behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-062 - Commands Discovery Template MCP Delta

```yaml
plan_unit_id: ODE-062
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master command deltas preserve .puppet-master/commands discovery paths, global config commands, Rust reimplementation of $ARGUMENTS, $1/$2, shell injection, @file syntax, and the caveat that MCP prompt integration may differ.
gui_related: false
gui_classification_reason: The unit records command runtime/template behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: commands_discovery_template_mcp_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: commands_discovery_template_mcp_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0058'
preserved_exact_tokens:
- '.puppet-master/commands/'
- '~/.config/puppet-master/commands/'
- '$ARGUMENTS'
- '$1'
- '$2'
- 'shell injection'
- '@file'
- 'MCP prompt integration'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-063 - Formatter Event Detection Invocation Delta

```yaml
plan_unit_id: ODE-063
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master formatter deltas preserve file.edited event triggering, Rust or delegated formatter auto-detection, and substitution of BunProc.which() with system which-based detection and direct process invocation.
gui_related: false
gui_classification_reason: The unit records formatter runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_event_detection_invocation_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_event_detection_invocation_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0059'
preserved_exact_tokens:
- 'file.edited'
- 'Rust event system'
- 'Formatter auto-detection'
- 'BunProc.which()'
- 'which'
- 'direct process invocation'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-064 - Skills Compatibility And PM Runtime Boundary

```yaml
plan_unit_id: ODE-064
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master skill deltas preserve OpenCode as architecture pattern only, PM-native skills as canonical runtime path, compatibility roots .claude/skills and .agents/skills, optional provider/tool-native projection, and PM registry/readiness/context bundling/skill tool authority.
gui_related: false
gui_classification_reason: The unit records skill runtime and compatibility boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_compatibility_and_pm_runtime_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skills_compatibility_and_pm_runtime_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0060'
preserved_exact_tokens:
- 'Architecture pattern, not ownership transfer'
- '.claude/skills'
- '.agents/skills'
- 'Projection posture'
- 'Discovery vs runtime'
- 'skill tool'
negative_constraints: []
compatibility_only_notes:
- 'Compatibility import does not make external roots canonical.'
- 'Provider-native or tool-native skill projection is optional compatibility only.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and PM runtime registry remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/Provider_OpenCode.md'
```

### ODE-065 - Plugins Runtime Hooks Auth Tool Override Delta

```yaml
plan_unit_id: ODE-065
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master plugin deltas preserve the OpenCode JavaScript/TypeScript plugin baseline as reference, require a PM Rust plugin API choice, support the hook subset defined in Plugins_System, implement auth providers natively, and require override_builtin: true for plugin tool overrides.
gui_related: false
gui_classification_reason: The unit records plugin/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_runtime_hooks_auth_tool_override_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugins_runtime_hooks_auth_tool_override_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0061'
preserved_exact_tokens:
- 'JavaScript/TypeScript'
- 'WASM'
- 'dynamic libraries'
- 'subprocess-based'
- 'scripting language bindings'
- 'Plans/Plugins_System.md §4'
- 'auth providers natively'
- 'override_builtin: true'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-066 - Models Provider Transform Priority Overflow Boundary

```yaml
plan_unit_id: ODE-066
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master model deltas preserve Vercel AI SDK as external baseline only, Rust-native provider abstraction, provider transform replication, configurable model priority list, maintained overflow regex patterns, and model/memory owner-boundary verification against Models_System and assistant-memory-subsystem.
gui_related: false
gui_classification_reason: The unit records model/provider runtime boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_provider_transform_priority_overflow_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: models_provider_transform_priority_overflow_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0062'
preserved_exact_tokens:
- 'Vercel AI SDK'
- 'Plans/Models_System.md'
- 'hardcoded priority list'
- 'regex-based overflow detection'
- 'Plans/assistant-memory-subsystem.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Models_System and assistant-memory-subsystem own adopted model and memory behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-067 - Upstream Notes Anti Equivalence Guard

```yaml
plan_unit_id: ODE-067
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Upstream notes exist to prevent downstream agents from assuming Puppet Master equals OpenCode by recording where key upstream models live and which deltas commonly cause mis-mapping.
gui_related: false
gui_classification_reason: The unit records audit guidance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: upstream_notes_anti_equivalence_guard
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: upstream_notes_anti_equivalence_guard
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0063'
preserved_exact_tokens:
- 'assuming Puppet Master == OpenCode'
- 'where'
- 'deltas'
- 'mis-mapping'
negative_constraints:
- 'Do not assume Puppet Master == OpenCode.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-068 - ToolContext And Tool Lifecycle Pointers

```yaml
plan_unit_id: ODE-068
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Tool upstream notes preserve plugin and internal tool contracts, tool loading/registry paths, model-gated tool availability, and lifecycle hooks tool.execute.before and tool.execute.after as plugin triggers rather than Bus events.
gui_related: false
gui_classification_reason: The unit records tool/runtime pointers, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: toolcontext_and_tool_lifecycle_pointers
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: toolcontext_and_tool_lifecycle_pointers
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0064'
preserved_exact_tokens:
- 'ToolContext'
- 'ask()'
- '{title, metadata, output, attachments?}'
- 'ToolRegistry'
- 'model-gated tool availability'
- 'tool.execute.before'
- 'tool.execute.after'
- 'not Bus events'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-069 - Permissions Upstream Pointers And Next Preference

```yaml
plan_unit_id: ODE-069
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission upstream notes preserve next.ts and permission route pointers, once/always/reject replies, CorrectedError versus RejectedError behavior, wildcard patterns ending in space-star, and preference for permission/next.ts over the older implementation.
gui_related: false
gui_classification_reason: The unit records permission upstream pointers, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permissions_upstream_pointers_and_next_preference
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permissions_upstream_pointers_and_next_preference
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0065'
preserved_exact_tokens:
- 'permission/next.ts'
- 'routes/permission.ts'
- 'once | always | reject'
- 'CorrectedError'
- 'RejectedError'
- '" *"'
- 'Prefer `next.ts`'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-070 - Provider Transform Compatibility Boundary

```yaml
plan_unit_id: ODE-070
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider upstream notes preserve provider/model registry pointers, transform/error layer pointers, and the compatibility warning that upstream tool/message parts must not be assumed to map one-to-one to any single provider API.
gui_related: false
gui_classification_reason: The unit records provider compatibility boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_compatibility_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_transform_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0066'
preserved_exact_tokens:
- 'providerID'
- 'modelID'
- 'provider/transform.ts'
- 'provider/error.ts'
- 'provider compatibility'
- 'not in the core session stream'
- '1:1'
negative_constraints: []
compatibility_only_notes:
- 'Do not assume upstream tool/message parts map one-to-one to any single provider API.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-071 - Message Part Taxonomy Compatibility Boundary

```yaml
plan_unit_id: ODE-071
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Session message notes preserve legacy and current message schemas, part taxonomy, ToolState pending/running/completed/error, and the warning that upstream injects synthetic messages or parts to satisfy provider constraints.
gui_related: false
gui_classification_reason: The unit records session/message compatibility behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: message_part_taxonomy_compatibility_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: message_part_taxonomy_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0067'
preserved_exact_tokens:
- 'message.ts'
- 'message-v2.ts'
- 'text|reasoning|file|tool|step-start|step-finish|snapshot|patch|subtask|retry|compaction|agent'
- 'pending|running|completed|error'
- 'tool_use'
- 'tool_result'
negative_constraints: []
compatibility_only_notes:
- 'Synthetic upstream messages and parts are provider-constraint compatibility behavior.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-072 - Server Routes Rust Mapping Boundary

```yaml
plan_unit_id: ODE-072
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Server route notes preserve OpenCode Hono HTTP server, SSE, CORS, basic auth, WebSocket support, route modules, and the exact delta that Puppet Master maps adopted API surface to internal Rust function calls, UICommand dispatch, and permission routes under the current owner docs.
gui_related: false
gui_classification_reason: The unit records backend API mapping, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: server_routes_rust_mapping_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: server_routes_rust_mapping_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0068'
preserved_exact_tokens:
- 'Hono-based HTTP server'
- 'SSE streaming'
- 'CORS'
- 'basic auth'
- 'WebSocket'
- 'routes/session.ts'
- 'routes/permission.ts'
- 'internal Rust function calls'
- 'UICommand dispatch'
- 'permission routes'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Tauri commands wording is source-lineage only; active routing maps through Rust services, UICommand dispatch, and permission routes.'
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-073 - UI Blocker Orchestrator Pattern Pointer

```yaml
plan_unit_id: ODE-073
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The UI blocker/orchestrator upstream note preserves the session composer blocker pattern where question and permission blocks prevent prompt input.
gui_related: true
gui_classification_reason: The unit covers user-visible prompt input blocking and session composer behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_blocker_orchestrator_pattern_pointer
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ui_blocker_orchestrator_pattern_pointer
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0069'
preserved_exact_tokens:
- 'UI blocker/orchestrator pattern'
- 'question/permission blocks prompt input'
- 'specs/session-composer-refactor-plan.md'
- 'packages/app/src/pages/session/composer/*'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-074 - Usage Pipeline Mapping Boundary

```yaml
plan_unit_id: ODE-074
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Usage pipeline notes preserve Session.getUsage, processor finish-step normalization lineage, and the rule that extracted usage terminology, persistence semantics, and UI linkage MUST map into Plans/usage-feature.md and Plans/storage-plan.md instead of creating an OpenCode-shaped usage vocabulary.
gui_related: true
gui_classification_reason: The unit includes UI linkage for usage records as well as persistence semantics.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_pipeline_mapping_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: usage_pipeline_mapping_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0070'
preserved_exact_tokens:
- 'Session.getUsage'
- 'processor finish-step'
- 'usage terminology'
- 'persistence semantics'
- 'UI linkage'
- 'MUST map'
- 'Plans/usage-feature.md'
- 'Plans/storage-plan.md'
negative_constraints:
- 'Do not create a parallel OpenCode-shaped usage vocabulary in this document or downstream packets.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'usage-feature.md and storage-plan.md own adopted usage and storage behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```
