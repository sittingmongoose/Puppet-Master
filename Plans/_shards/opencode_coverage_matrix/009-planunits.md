# Shard 009: PlanUnits

Source: `Plans/OpenCode_Coverage_Matrix.md`

Source lines: L264-L1192

Source SHA256: `ef41c8912e244286a61906a651b70fee14c39a342a5bda1095c1081c4fed56c3`

---

## PlanUnits

### OCM-002 - Audit Authority Scope And Currentness Rules

```yaml
plan_unit_id: OCM-002
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: OpenCode_Coverage_Matrix.md audits OpenCode-derived capability coverage from Plans/OpenCode_Deep_Extraction.md sections 7A-7H, 8, 9, and 10. It preserves Covered, Partial, Missing, provider-matrix confidence, /notes, supersedes_prior, doc-discovery, owner-definition, json.next_required_stage, open_gaps, Audit Mode, zero-finding, and stale tier-era lineage as audit metadata rather than product-owner vocabulary.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: audit_authority_scope_currentness
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: audit_authority_scope_currentness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0002
preserved_exact_tokens:
- OpenCode Coverage Matrix (Audit)
- Plans/OpenCode_Deep_Extraction.md
- Covered
- Partial
- Missing
- provider-matrix confidence
- /notes
- supersedes_prior
- doc-discovery
- owner-definition
- json.next_required_stage
- open_gaps
- Audit Mode
- zero-finding
- Stale tier-era
negative_constraints:
- Stale tier-era, Phase/Task/Subtask/Iteration, or legacy boundary notes are audit lineage only and are not product-owner vocabulary unless a named SSOT owner doc adopts a replacement.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-003 - External Reference Landing Owner Categories

```yaml
plan_unit_id: OCM-003
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'External reference adoption uses owner categories before wording lands in canon: tool/runtime contracts land in Tools.md and Contracts_V0.md; UI/UX patterns in FinalGUISpec.md; permission/auth in Permissions_System.md; provider/integration in CLI_Bridged_Providers.md and Provider_OpenCode.md; storage/persistence in storage-plan.md; identity/persona in Personas.md and Multi-Account.md. Non-PM constraints remain external-only unless an owner doc explicitly adopts them.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: external_reference_landing_owner_categories
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: external_reference_landing_owner_categories
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0003
preserved_exact_tokens:
- External Reference Landing Guidance
- Tools.md
- Contracts_V0.md
- FinalGUISpec.md
- Permissions_System.md
- CLI_Bridged_Providers.md
- Provider_OpenCode.md
- storage-plan.md
- Personas.md
- Multi-Account.md
- Non-PM constraints remain external-only
negative_constraints:
- Non-PM constraints remain external-only unless an owner doc explicitly adopts them.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### OCM-004 - Core Coverage Matrix Rows Modes Permissions Commands Formatters

```yaml
plan_unit_id: OCM-004
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Core OpenCode coverage rows 1-14 preserve coverage facts for run modes, permissions, commands, and formatters, including plan/ask/regular/yolo, allow/ask/deny, doom_loop, external_directory, .env deny defaults, $ARGUMENTS, @path, shell injection, $FILE, HTE-only formatter enforcement, and the built-in 21 formatter set.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: core_coverage_rows_modes_permissions_commands_formatters
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: core_coverage_rows_modes_permissions_commands_formatters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- plan/ask/regular/yolo
- allow/ask/deny
- doom_loop
- external_directory
- .env
- $ARGUMENTS
- '@path'
- '!`cmd`'
- $FILE
- HTE-only
- 21 formatters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are audit coverage facts and do not move ownership out of the named SSOT docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-005 - Skills And Plugins Coverage Rows

```yaml
plan_unit_id: OCM-005
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'OpenCode coverage rows 15-23 preserve Skills and Plugins coverage facts, including Skills_System.md #DISCOVERY and #SEARCH-ORDER, the skill tool surface, row 17 Partial for skill-as-command dual registration not required for v1, default_skill_refs, plugin hooks, InjectContext, ReplacePrompt, and custom-tool collision policy.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_plugins_coverage_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: skills_plugins_coverage_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- Skills_System.md
- '#DISCOVERY'
- '#SEARCH-ORDER'
- skill tool
- Partial
- skill-as-command
- default_skill_refs
- InjectContext
- ReplacePrompt
- TOOL-COLLISION
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Row 17 remains Partial because skill-as-command dual registration is not required for v1 and remains unspecified.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-006 - Models Provider Runtime MCP GitHub Prompt Coverage Rows

```yaml
plan_unit_id: OCM-006
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Coverage amendment rows 28, 29, 32, and 34 remain Covered. Rows covering models, providers, runtime context, MCP, GitHub, and prompt assembly preserve provider_id/model_id, FinishReason handling, provider transform and error classification, synthetic-continue loop prevention, compaction-immune overflow handling, MCP lifecycle, safe $ref cycle truncation, GitHub auth, and Prompt_Pipeline.md ownership.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_provider_runtime_mcp_github_prompt_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: models_provider_runtime_mcp_github_prompt_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- Rows 28, 29, 32, and 34 are `Covered`
- provider_id/model_id
- FinishReason
- synthetic-continue loop prevention
- compaction-immune overflow handling
- MCP lifecycle
- safe `$ref`-cycle truncation
- GitHub auth
- Prompt_Pipeline.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt_Pipeline.md owns context-compilation behavior; FileSafe remains a consumer.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OCM-007 - GUI Config Coverage Matrix Rows

```yaml
plan_unit_id: OCM-007
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Coverage rows 36-41 remain Covered for GUI/config wiring for Permissions, Commands, Skills, Plugins, Models, and Formatters, including FinalGUISpec.md, section 7.4A Agent Config Skills tab, Settings > Models, and dedicated tab cross-references to SSOT owner docs.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_coverage_matrix_rows
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_coverage_matrix_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0004
preserved_exact_tokens:
- GUI config wiring
- Permissions
- Commands
- Skills
- Plugins
- Models
- Formatters
- §7.4A Agent Config Skills tab
- Settings > Models
- FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These rows audit GUI wiring coverage without owning the GUI surfaces.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-008 - DRY Duplication Audit Findings

```yaml
plan_unit_id: OCM-008
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The DRY authority audit preserves acceptable summary/defer posture for Tools.md section 2, mapping-table targets for Skills F1-F4 and Models H1-H4, Plugins_System.md plural correction, Skills_System.md no longer missing/future, FinalGUISpec.md Skills row source, and Run_Modes baseline acceptability.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_duplication_audit_findings
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: dry_duplication_audit_findings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0006
preserved_exact_tokens:
- 3. DRY Authority Audit
- Documents duplicating canonical definitions
- Tools.md §2
- Skills (F1–F4)
- Models rows (H1–H4)
- Plugins_System.md
- Skills_System.md
- not MiscPlan.md
- Run_Modes.md §8
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Personas.md stale qualifiers were corrected; Skills_System.md is no longer missing/future.
owner_boundary_notes:
- S0005 is a structural DRY Authority Audit section container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-009 - Stable Anchor Gap Audit Findings

```yaml
plan_unit_id: OCM-009
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'The stable-anchor audit preserves missing-anchor findings for CLI_Bridged_Providers.md #PROVIDER-TRANSFORM and #ERROR-CLASSIFICATION, Models_System.md #OVERFLOW-DETECTION and #RETRY-POLICY, Prompt_Pipeline.md context-assembly/cache-preservation and compaction-threshold anchors, Tools.md #MCP-INTEGRATION, and optional future FinalGUISpec.md #SKILLS-TAB.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: stable_anchor_gap_audit_findings
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: stable_anchor_gap_audit_findings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0007
preserved_exact_tokens:
- '#PROVIDER-TRANSFORM'
- '#ERROR-CLASSIFICATION'
- '#MODEL-ERRORS'
- '#OVERFLOW-DETECTION'
- '#RETRY-POLICY'
- context-assembly/cache-preservation
- compaction-threshold rules
- '#MCP-INTEGRATION'
- '#SKILLS-TAB'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Anchor gaps are audit findings, not local implementation tasks.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-010 - GUI Config Wiring Audit Permissions Commands Skills

```yaml
plan_unit_id: OCM-010
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The GUI/config wiring audit preserves Permissions, Commands, and Skills findings for GUI surfaces, config/state storage, no-secrets posture, and Doctor gaps, including ~/.config/puppet-master/permissions.toml, <project>/.puppet-master/permissions.toml, .puppet-master/commands/, ~/.config/puppet-master/commands/, .puppet-master/skills/, ~/.config/puppet-master/skills/, legacy discovery roots, doctor.permissions.valid, and skill validation gaps.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_wiring_permissions_commands_skills
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_wiring_permissions_commands_skills
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0011
preserved_exact_tokens:
- 4. GUI + Config Wiring Audit
- 4.1 Permissions
- 4.2 Commands
- 4.3 Skills
- ~/.config/puppet-master/permissions.toml
- <project>/.puppet-master/permissions.toml
- .puppet-master/commands/
- ~/.config/puppet-master/commands/
- .puppet-master/skills/
- ~/.config/puppet-master/skills/
- legacy discovery roots
- doctor.permissions.valid
- skill validation
negative_constraints: []
compatibility_only_notes:
- Legacy discovery roots for skills remain compatibility-only.
stale_retired_dispositions: []
owner_boundary_notes:
- S0008 is a structural GUI/config wiring audit section container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-011 - GUI Config Wiring Audit Plugins Models Formatters

```yaml
plan_unit_id: OCM-011
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The GUI/config wiring audit preserves Plugins, Models, and Formatters findings for GUI surfaces, config/state storage, no-secrets posture, and Doctor gaps, including .puppet-master/plugins/, ~/.config/puppet-master/plugins/, [plugins], [provider.*], model.json, config:v1, [formatter], plugin.load_failed, provider auth Doctor gap, and doctor.formatters.available.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_config_wiring_plugins_models_formatters
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: gui_config_wiring_plugins_models_formatters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0014
preserved_exact_tokens:
- 4.4 Plugins
- 4.5 Models
- 4.6 Formatters
- .puppet-master/plugins/
- ~/.config/puppet-master/plugins/
- '[plugins]'
- '[provider.*]'
- model.json
- config:v1
- '[formatter]'
- plugin.load_failed
- provider auth status
- doctor.formatters.available
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Doctor gaps remain audit findings.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-012 - Fix List Boundary And Completed SSOT Cross References

```yaml
plan_unit_id: OCM-012
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The mandatory fix list is documentation-only and NOT implementation tasks. Completed items preserve Skills_System.md as canonical SSOT, Prompt_Pipeline.md as prompt assembly/compaction owner, OpenCode_Deep_Extraction.md mapping corrections, Personas.md Plugins_System.md plural correction and Skills_System.md no-longer-missing status, and FinalGUISpec.md Skills tab source correction.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: fix_list_boundary_completed_ssot_crossrefs
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: fix_list_boundary_completed_ssot_crossrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0018
preserved_exact_tokens:
- These are documentation-only edits required to close coverage gaps. They are NOT implementation tasks.
- Plans/Skills_System.md created
- Plans/Prompt_Pipeline.md created
- OpenCode_Deep_Extraction.md
- Personas.md
- Plugins_System.md
- FinalGUISpec.md
negative_constraints:
- Mandatory fix list entries are documentation-only audit findings and are not implementation tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- S0015 is a structural mandatory-fix-list container.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-013 - Open Anchor Addition Fixes

```yaml
plan_unit_id: OCM-013
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'Open anchor-addition audit findings preserve CLI_Bridged_Providers.md anchors #PROVIDER-TRANSFORM and #ERROR-CLASSIFICATION, Prompt_Pipeline.md context-assembly/cache-preservation and compaction-threshold anchors, Tools.md #MCP-INTEGRATION, and optional future #SKILLS-TAB if cross-reference tooling requires it.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: open_anchor_addition_fixes
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: open_anchor_addition_fixes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0017
preserved_exact_tokens:
- Anchor Additions
- '#PROVIDER-TRANSFORM'
- '#ERROR-CLASSIFICATION'
- context-assembly/cache-preservation
- compaction-threshold rules
- '#MCP-INTEGRATION'
- '#SKILLS-TAB'
- future work
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Open anchor additions are audit findings for owner docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-014 - DRY Tightening And Provider Account Model Linkage

```yaml
plan_unit_id: OCM-014
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'DRY tightening preserves Models_System.md anchor needs #OVERFLOW-DETECTION and #RETRY-POLICY, provider/account/model reconciliation through Plans/CLI_Bridged_Providers.md, /CLI_Bridged_Providers.md, Plans/Multi-Account.md, /Multi-Account.md, Plans/Models_System.md, /Models_System.md, and the disabled_plugins inconsistency between Plugins_System.md section 7.3 and Personas.md section 3.2.'
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_tightening_provider_account_model_linkage
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: dry_tightening_provider_account_model_linkage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0019
preserved_exact_tokens:
- '#OVERFLOW-DETECTION'
- '#RETRY-POLICY'
- Plans/CLI_Bridged_Providers.md
- /CLI_Bridged_Providers.md
- Plans/Multi-Account.md
- /Multi-Account.md
- Plans/Models_System.md
- /Models_System.md
- disabled_plugins
- Plugins_System.md §7.3
- Personas.md §3.2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/account/model reconciliation remains linked to owner docs and does not drift into local matrix rules.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-015 - Doctor Preflight Audit Gap Recommendations

```yaml
plan_unit_id: OCM-015
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: 'Doctor/preflight gaps remain audit findings only: invalid permission configs, invalid command schemas, skill validation errors, formatter binary availability, plugin manifest validation, and model/provider availability. Specific Doctor additions should be tracked in FinalGUISpec.md Health tab or a dedicated Doctor spec.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible audit surfaces, settings, tabs, or Doctor/currentness findings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: doctor_preflight_audit_gap_recommendations
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: doctor_preflight_audit_gap_recommendations
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0020
preserved_exact_tokens:
- Doctor/Preflight Gaps
- invalid permission configs
- invalid command schemas
- skill validation errors
- formatter binary availability
- plugin manifest validation
- model/provider availability
- FinalGUISpec.md Health tab
- dedicated Doctor spec
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are recommendations/audit findings, not executable tasks.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs: []
```

### OCM-016 - Coverage Summary Counts And ContractRefs

```yaml
plan_unit_id: OCM-016
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: The OpenCode coverage summary preserves counts Covered 36, Partial 2, Missing 0, examples for run modes, permissions, provider transform/error classification, context handling/compaction, MCP lifecycle, GitHub auth, models, subagents, and LSP, plus the ContractRef to CLI_Bridged_Providers.md and Prompt_Pipeline.md.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coverage_summary_counts_contractrefs
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: coverage_summary_counts_contractrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0021
preserved_exact_tokens:
- Covered
- '36'
- Partial
- '2'
- Missing
- '0'
- Run modes
- permissions
- provider transform/error classification
- context handling/compaction
- MCP lifecycle
- GitHub auth
- models
- subagents
- LSP
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OCM-017 - Matrix Owner Consumer Boundary

```yaml
plan_unit_id: OCM-017
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: Plans/OpenCode_Coverage_Matrix.md owns audit/currentness behavior for its preserved sections while cross-doc ownership follows ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: The unit covers audit metadata, backend policy, owner-boundary, or coverage facts rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered audit fact remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- Audit findings remain audit/currentness metadata and are not converted into implementation tasks by this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: matrix_owner_consumer_boundary
reasoning_tier: standard
context_scope: opencode_coverage_matrix_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: matrix_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0022
preserved_exact_tokens:
- Owner / Consumer Map
- Plans/OpenCode_Coverage_Matrix.md
- owner doc
- cross-doc ownership
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The matrix remains an audit/currentness surface, not a product-feature owner for referenced SSOT docs.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### OCM-001 - OpenCode Coverage Matrix Retired Source-Preserving Bridge

```yaml
plan_unit_id: OCM-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/OpenCode_Coverage_Matrix.md
canonical_text: OCM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 108 because OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 are covered by OCM-002 through OCM-017 or explicit structural, retired, and migration-coverage dispositions. OCM-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained OpenCode Coverage Matrix PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- OCM-002
- OCM-003
- OCM-004
- OCM-005
- OCM-006
- OCM-007
- OCM-008
- OCM-009
- OCM-010
- OCM-011
- OCM-012
- OCM-013
- OCM-014
- OCM-015
- OCM-016
- OCM-017
unblocks: []
acceptance_criteria:
- OCM-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 108.
- OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 coverage is owned by OCM-002 through OCM-017 or explicit structural, retired, and migration-coverage dispositions.
- OCM-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Coverage_Matrix-S0024
preserved_exact_tokens:
- OCM-001
- OpenCode Coverage Matrix (Audit) Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
negative_constraints:
- OCM-001 must not re-own OpenCode_Coverage_Matrix-S0001 through OpenCode_Coverage_Matrix-S0025 after Phase 2B batch 108.
- OCM-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- OCM-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former OCM-001 residual source-preserving bridge is retired by Phase 2B batch 108.
owner_boundary_notes:
- OCM-002 through OCM-017 and explicit coverage dispositions own OpenCode Coverage Matrix audit/currentness coverage after bridge retirement.
- OpenCode_Coverage_Matrix-S0023 is a structural PlanUnits heading.
- OpenCode_Coverage_Matrix-S0025 is migration-coverage metadata.
owner_hints:
- Plans/OpenCode_Coverage_Matrix.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally dispositioned and is now retired.
```
