# Shard 012: PlanUnits

Source: `Plans/Skills_System.md`

Source lines: L441-L2496

Source SHA256: `c556120cfe2b34b0692622237915e06e188c430a48073ebcd559d74ec2cd83b3`

---

## PlanUnits

### SS-002 - Skills SSOT Authority And DRY References

```yaml
plan_unit_id: SS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skills_System.md is the single canonical SSOT for Puppet Master Skills, preserving compliance, deterministic defaults, anchor-reference rule, and adjacent SSOT references without redefining owner documents.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-002 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_ssot_authority_dry_references
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0003
preserved_exact_tokens:
- Skills System (Canonical SSOT)
- Puppet Master
- single canonical SSOT
- SKILL.md
- default_skill_refs
- skill tool
- GUI ownership/requirements
- Plans/Skills_System.md#DISCOVERY
- Plans/Spec_Lock.json
- Plans/Contracts_V0.md
- Plans/DRY_Rules.md
- Plans/Glossary.md
- Plans/Decision_Policy.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Contracts_V0.md
- Plans/DRY_Rules.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/FinalGUISpec.md
```

### SS-003 - Skill Definition And Skill ID Schema

```yaml
plan_unit_id: SS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: A Skill is a user-authored SKILL.md context module, and Skill ID is the stable YAML frontmatter name field matching the OpenCode baseline regex and 1-64 character length.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
unblocks: []
acceptance_criteria:
- SS-003 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_definition_id_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0006
preserved_exact_tokens:
- Skill
- Skill ID
- SKILL.md
- YAML frontmatter
- name
- ^[a-z0-9]+(-[a-z0-9]+)*$
- 1–64 characters
- OpenCode baseline
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/OpenCode_Deep_Extraction.md
```

### SS-004 - SKILL.md Layout And Frontmatter Contract

```yaml
plan_unit_id: SS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Each skill uses one required <skill_root>/<skill_id>/SKILL.md with YAML frontmatter requiring name and description, allowing optional metadata, and keeping required_tool_refs and optional_tool_refs in the skill frontmatter as the single source for tool dependency metadata.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-004 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_md_layout_frontmatter_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0009
preserved_exact_tokens:
- SKILL.md
- <skill_root>/<skill_id>/SKILL.md
- name
- description
- license
- compatibility
- metadata
- tags
- required_tool_refs
- optional_tool_refs
- default_skill_refs
- /export/interoperability
negative_constraints:
- PM MUST NOT move required tool metadata into a PM-only /overlay or sidecar-only MCP schema.
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata into a PM-only `/overlay` or sidecar-only MCP schema that would create a second source of truth outside the skill''s `name` and `description`.'
preserved_contractrefs: []
compatibility_only_notes:
- Additional frontmatter fields MAY be present (e.g., `license`, `compatibility`, `metadata`, `tags`) but are not required for core discovery and loading.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-005 - SKILL.md Body Preservation

```yaml
plan_unit_id: SS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The SKILL.md Markdown body is skill content preserved verbatim by the loader with no templating in v1.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-005 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_md_body_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0010
preserved_exact_tokens:
- Markdown body
- Skill content
- verbatim
- no templating in v1
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-006 - Discovery Roots And Project Global Resolution

```yaml
plan_unit_id: SS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill discovery uses deterministic project-local and global roots and resolves project-local roots relative to the active project root or git worktree root.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-006 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: discovery_roots_project_global_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0012
preserved_exact_tokens:
- .puppet-master/skills/**/SKILL.md
- .claude/skills/**/SKILL.md
- .agents/skills/**/SKILL.md
- ~/.config/puppet-master/skills/**/SKILL.md
- ~/.claude/skills/**/SKILL.md
- ~/.agents/skills/**/SKILL.md
- active project root
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
- Plans/storage-plan.md
```

### SS-007 - Search Order And First Wins Shadowing

```yaml
plan_unit_id: SS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Discovery walks roots in canonical order and resolves duplicate Skill IDs by first match wins, treating later duplicates as shadowed.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-007 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: search_order_first_wins_shadowing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0013
preserved_exact_tokens:
- SEARCH-ORDER
- first match wins
- Project .puppet-master/skills
- Project .claude/skills
- Project .agents/skills
- Global ~/.config/puppet-master/skills
- shadowed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
```

### SS-008 - Shadowed And Invalid Skill GUI Visibility

```yaml
plan_unit_id: SS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The GUI exposes shadowed duplicates and invalid skills with validation errors even though invalid skills are not loadable by ID.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-008 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: shadowed_invalid_skill_gui_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0014
preserved_exact_tokens:
- shadowed duplicates
- GUI
- warning indicator
- invalid
- validation errors
- loadable by ID
negative_constraints:
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-009 - Discovery Validation Loader Rules

```yaml
plan_unit_id: SS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: During discovery the loader parses YAML frontmatter, validates name and description, enforces directory-name equals Skill ID, marks invalid skills, and prevents invalid lookup by ID.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-009 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: discovery_validation_loader_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0014
preserved_exact_tokens:
- Parse YAML frontmatter
- invalid
- name
- description
- directory-name match
- enclosing folder name
- Skill ID
negative_constraints:
- Invalid skills MUST NOT be loadable by ID.
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/MiscPlan.md
- Plans/Tools.md
```

### SS-010 - Runtime Registry And Persona Skill Refs

```yaml
plan_unit_id: SS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill registry is the provider-agnostic discovery and validation source, and Persona default_skill_refs resolve against it during prompt/context assembly without implying provider-native runtime installation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-010 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: runtime_registry_persona_skill_refs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0017
preserved_exact_tokens:
- MVP runtime surface
- provider-agnostic
- skill registry
- default_skill_refs
- context assembly
- provider-native skill file installation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Personas.md
```

### SS-011 - Skill Invocation Payload Contract

```yaml
plan_unit_id: SS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The canonical skill invocation payload uses skill_id with input, optional context, optional timeout, active project/thread context, and manifest-defined input schema validation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SS-011 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_invocation_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- skill_id
- invoke_skill
- input
- context
- timeout
- project_root
- active_file
- selection
- conversation_id
- input schema
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SS-012 - Skill Result Envelope And Resource Safety

```yaml
plan_unit_id: SS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill result is a structured skill-content envelope with source_type, resource_base_dir?, resource_entries_sample?, metadata?, compatibility display aliases, and FileSafe-constrained relative resource guidance.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-012 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_result_envelope_resource_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- skill-content
- title
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- name
- built-in
- /built-in
- bundled
- resource-root
- FileSafe-permitted skill resources
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-013 - Runtime Readiness And Auto-Invoke Gating

```yaml
plan_unit_id: SS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Assistant auto-invocation is limited to runtime-ready, eligible, permission-allowed, auto_invokable skills; warning, invalid, disabled, shadowed, and blocked entries require explicit selection while the tool description exposes the live runtime-ready roster.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-013 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: runtime_readiness_auto_invoke_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- assistant-awareness
- runtime-ready
- auto_invokable
- runtime-ready-with-warnings
- ready_with_warnings
- imported-with-warnings
- invalid
- disabled
- shadowed
- warning-blocked
- dynamic tool-description
- ready
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-014 - Skill Triggered Execution Boundaries

```yaml
plan_unit_id: SS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill tool does not create hidden nested-task work or own shell/PTX execution; skill-triggered tool work remains under tool permission, Terminal, audit, route-target, project/worktree context, and blocked/recovery contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-014 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_triggered_execution_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
preserved_exact_tokens:
- nested-task
- shell
- PTY
- /expandable
- allowed_actions[]
- allowed_action_ids[]
- route-target
- active-worktree
- /artifact/search/attention
- /revert
negative_constraints:
- Skill-triggered runtime actions must not assume a single active-worktree.
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs: []
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SS-015 - User Invocation Surfaces And MVP Grammar

```yaml
plan_unit_id: SS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill discovery and invocation converge through GUI panel, /skill, and natural language on the same invoke_skill runtime contract without an MVP subcommand family.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-015 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: user_invocation_surfaces_mvp_grammar
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- GUI panel
- /skill
- Natural language
- /natural-language
- Skills panel
- No subcommand family for MVP
- invoke_skill
- /skill <skill_name> [args]
- /skill with no args lists available skills
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SS-016 - Canonical MVP Delivery Package Path

```yaml
plan_unit_id: SS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: MVP skill delivery uses one canonical SKILL.md per skill package; optional resources remain FileSafe-limited package resources and external examples are design evidence only rather than runtime owners.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-016 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: canonical_mvp_delivery_package_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0019
preserved_exact_tokens:
- one canonical SKILL.md
- skill package
- External Swift-Agent-Skills
- agent-skills
- resources/
- scripts/
- templates/
- FileSafe-limited package resources
- websearch
- webfetch
- /webfetch
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-017 - Provider Native Loading Non Goal

```yaml
plan_unit_id: SS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: MVP does not require a per-provider native runtime skill-loading matrix; PM uses registry, bundling, and the skill tool at runtime, with provider-native loading only as optimization or interoperability above the canonical path.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SS-017 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: provider_native_loading_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
preserved_exact_tokens:
- per-provider native runtime skill-loading matrix
- PM registry/bundling/skill tool path
- provider-native
- /directories
- /provider-native
- /discover
- /bundling/
- /project
negative_constraints:
- Provider-native files/directories and /directories cannot become the canonical runtime contract.
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
```

### SS-018 - Projection Export Compatibility Policy

```yaml
plan_unit_id: SS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Projection/export policy defaults to import/discover yes and export/project no, records explicit targets, accepts compatibility roots through the canonical registry, and uses copy by default with symlink only as validated explicit behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-018 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: projection_export_compatibility_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
preserved_exact_tokens:
- import/discover yes
- export/project no
- .claude/skills
- .agents/skills
- claude/skills/*/SKILL.md
- agents/skills/*/SKILL.md
- not_projected
- projected_in_sync
- projection_failed
- drifted
- copy
- symlink
- Windows/macOS/Linux
negative_constraints:
- PM must never hand-roll slash assumptions for interoperability paths.
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SS-019 - Projection Provenance GUI Visibility

```yaml
plan_unit_id: SS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The GUI surfaces projection results, drift, override behavior, provider/runtime blockers, source/provenance labels, source links, exported status, and source/location distinctions for skills.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-019 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: projection_provenance_gui_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- projection state
- drift
- blockers
- PM bundled
- Imported
- Catalog
- source/provenance
- /exported
- Bundled with PM
- Imported from disk
- Installed from catalog
- Installed from GitHub
- source_url
- location_path
negative_constraints:
- '### 4.5 Non-goal for MVP'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or when a specific provider integration proves it materially useful. PM may project instructions, skills, and target-specific `mcp_definitions`, but provider-native files/directories and `/directories` cannot become the canonical runtime contract. Internal trace labels may include `/provider-native`, `/discover`, `/bundling/`, and `/project`, but those labels do not replace the canonical skill registry or readiness model.'
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo `/docs` compatibility import/discovery accepts the exact provider-native path forms `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, `claude/skills/*/SKILL.md`, and `agents/skills/*/SKILL.md` as external compatibility roots, while PM still resolves them through the canonical registry. Projection state values are `not_projected`, `projected_in_sync`, `projection_failed`, and `drifted`; methods may include `copy` by default and `symlink` only where platform/filesystem support is proven.'
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-020 - Skill Permission Key And Skill ID Grants

```yaml
plan_unit_id: SS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The skill permission key governs skill loading and supports granular permission rules over canonical Skill IDs.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-020 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_permission_key_skill_id_grants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0022
preserved_exact_tokens:
- Permissions integration
- skill
- Plans/Permissions_System.md#5-tool-permission-keys
- Skill IDs
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
```

### SS-021 - External Directory FileSafe Guard

```yaml
plan_unit_id: SS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill permission grants operate over canonical Skill IDs rather than raw filesystem paths, and skill resource disclosure or file operations remain FileSafe and external-directory guarded.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-021 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: external_directory_filesafe_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0023
preserved_exact_tokens:
- canonical skill IDs
- raw filesystem paths
- FileSafe allowlist
- external-directory policy
- blocked-action recovery
- Underlying file operations
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
```

### SS-022 - Child Run Inheritance And Allowed Roots

```yaml
plan_unit_id: SS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Child runs receive only the effective compatible subset of parent-allowed skills, cannot exceed the parent ceiling, and discovered global roots are canonicalized allowed roots while symlink escapes are rejected.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
- PLUG-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-022 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: child_run_inheritance_allowed_roots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0024
preserved_exact_tokens:
- child-run inheritance
- parent-allowed skill universe
- parent ceiling
- Plugins_System.md
- Models_System.md
- global roots
- canonicalizes
- symlinked roots
negative_constraints:
- A child must not gain skill-powered capability that exceeds the parent ceiling.
- a child must not gain skill-powered capability that exceeds the parent ceiling.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Plugins_System.md
- Plans/storage-plan.md
```

### SS-023 - Agent Config Skills Ownership

```yaml
plan_unit_id: SS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Agent Config > Skills owns skill management while Settings keeps system-level dependencies; legacy Settings > Skills redirects/focuses to Agent Config and dependencies deep-link back to Settings where appropriate.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-023 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: agent_config_skills_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- Agent Config > Skills
- Settings > Skills
- Settings
- Authentication
- Models/Permissions
- permission profiles
- rules/commands
- runtime controls
- health
- Agent Config > Personas
- management-surface
negative_constraints:
- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gating.
- 'The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visible paths must be relative to `resource_base_dir` and remain within FileSafe-permitted skill resources. `source_type` uses the canonical source vocabulary below; legacy `built-in` or `/built-in` wording normalizes to `bundled` / PM-bundled, `resource-root` normalizes to `resource_base_dir?`, and provider-private skill injection is not a canonical runtime path.'
- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
- Plans/Personas.md
```

### SS-024 - Skills Catalog Filters Badges Actions

```yaml
plan_unit_id: SS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The Skills tab is the loaded-skills catalog with search/filter, source/readiness filters, preview/body inspection, validation/warning details, source/readiness badges, store-vs-management split, and import/manage actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-024 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_catalog_filters_badges_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- loaded-skills catalog
- /search/filter
- source-readiness
- /global/bundled/catalog
- preview/body inspection
- referenced_by_persona
- auto_invokable
- assistant-auto-usable
- requires_missing_capability
- catalog_update_available
- imported-with-warnings
- warning-blocked
- Skill Store
- /install-only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-025 - GUI Provenance And Remediation States

```yaml
plan_unit_id: SS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Skill rows/cards distinguish source from location, preserve origin labels and URLs, and show plain-language primary states with remediation text and matched action buttons.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-025 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: gui_provenance_remediation_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- /source
- /location
- Bundled with PM
- Imported from disk
- Installed from catalog
- Installed from GitHub
- GitHub URL
- Ready
- Needs setup
- Needs permission
- Has problems
- Warning
- Set up Context7
- Review permissions
- Edit skill
- Review tool setup
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-026 - Validation Readiness GUI Taxonomy

```yaml
plan_unit_id: SS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: GUI readiness distinguishes schema invalid, unknown tool ref, and known-but-unavailable tool refs, mapping them to Invalid, Missing Requirement, or Permission Blocked style outcomes without hiding exact reasons.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SS-026 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: validation_readiness_gui_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- schema invalid
- unknown tool ref
- known tool ref but unavailable
- Missing Requirement
- Permission Blocked
- invalid
- valid but not currently runnable
- required_tool_refs
- optional_tool_refs
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-027 - Skill Readiness Record Schemas

```yaml
plan_unit_id: SS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Canonical readiness records split skill_record from skill_runtime_readiness and resolve required_tool_refs and optional_tool_refs against the canonical PM tool registry.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SS-027 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_readiness_record_schemas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
preserved_exact_tokens:
- skill_record
- skill_runtime_readiness
- source_kind = pm_bundled | imported_disk | catalog | github
- source_url?
- location_path
- validation_state = valid | invalid
- projection_state = not_projected | projected | projection_failed | drifted
- readiness_state = ready | needs_setup | needs_permission | has_problems | warning
- reason_codes[]
- missing_required_tool_refs[]
- missing_optional_tool_refs[]
- last_evaluated_at
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
compatibility_only_notes:
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SS-028 - Import Install GUI And Package Flows

```yaml
plan_unit_id: SS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Import and install flows preserve one SKILL.md per skill while supporting file-browser import, drag-and-drop folders/files, single SKILL.md, zip/tar packages, generated enclosing folders, catalog/store install, validation, and auto-populated catalog metadata.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-028 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: import_install_gui_package_flows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
preserved_exact_tokens:
- file-browser import
- drag-and-drop skill folders/files
- single SKILL.md
- zip/tar
- /tar
- .zip
- .tar.gz
- generated enclosing folder
- /catalog/install
- auto-populating catalog entry
- name
- description
- source/provenance
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
```

### SS-029 - Import Runtime Warning And NL Routing Rules

```yaml
plan_unit_id: SS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Imported packages default to portable, warning states remain discoverable but not auto-invoked, imported resources stay FileSafe-constrained, and natural-language skill examples route through registry-backed invoke_skill.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-029 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: import_runtime_warning_nl_routing_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0027
preserved_exact_tokens:
- portable
- imported-with-warnings
- ready_with_warnings
- runtime-ready-with-warnings
- unsupported
- auto-invoked
- use the doc-lookup skill
- load the swiftui-pro skill
- what skills do I have available?
- invoke_skill
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/assistant-chat-design.md
```

### SS-030 - Slash And Runtime Invocation Boundary

```yaml
plan_unit_id: SS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: The /skill affordance, Skills panel, and natural language invocation land on the shared invoke_skill runtime contract, with bare /skill listing available skills and no /skills command family for MVP.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SS-030 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: slash_runtime_invocation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0028
preserved_exact_tokens:
- /skill
- Skills panel
- Natural language
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- /natural-language
- skill_id
- arguments?
- context?
- No subcommand family for MVP
- /skills
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Commands_System.md#7. Reserved built-in slash commands, Plans/assistant-chat-design.md#5.2 `/web` and `/skill`'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Commands_System.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
```

### SS-031 - OpenCode Baseline Reference Only Constraints

```yaml
plan_unit_id: SS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: OpenCode skill tests and baseline notes are reference inputs only; Puppet Master rejects .opencode/skills roots, uses first-wins discovery with shadowing visibility, and keeps remote URL discovery out of v1 in favor of Catalog distribution.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SS-031 remains addressable as a fine-grained Skills System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_system_drift
reasoning_tier: standard
context_scope: skills_system
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: opencode_baseline_reference_only_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0029
preserved_exact_tokens:
- OpenCode product tests
- packages/opencode/test/tool/skill.test.ts
- /opencode/test/tool/skill.test.ts
- OpenCode_Deep_Extraction.md §7F
- .opencode/skills
- first-wins
- Remote skill discovery (URLs)
- Catalog system
- §7.4.3
negative_constraints:
- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system rather than ad-hoc URL pulls.
- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system (§7.4.3 in `Plans/FinalGUISpec.md`) rather than ad-hoc URL pulls.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Personas.md'
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2'
compatibility_only_notes:
- OpenCode tests and external skill examples are implementation/design references only.
- 'Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles, rules/commands, runtime controls, and health. Agent Config may cross-link to Settings when a persona or skill depends on those system resources; for example, a blocked provider/account capability may deep-link to Authentication, Health, or `/Models/Permissions` without moving that dependency into Agent Config. Source tokens `/catalog/runtime`, `/discoverability`, and `management-surface` normalize here: Agent Config > Skills is the Skills `/catalog/runtime` and `/discoverability` management-surface for Skill IDs, while runtime readiness remains owned by `skill_runtime_readiness`.'
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`) filters including `/global/bundled/catalog`, preview/body inspection, validation details, warning details, and source/readiness badges. Rows preserve `referenced_by_persona`, `auto_invokable`, `assistant-auto-usable`, `requires_missing_capability`, `catalog_update_available`, `imported-with-warnings`, and `warning-blocked` badges/flags where applicable.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
```

### SS-032 - Skills Discovery Order Acceptance

```yaml
plan_unit_id: SS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK01 requires Skills to be discovered from the canonical roots and in the canonical order defined in Skills_System §3.2.
gui_related: false
gui_classification_reason: This unit preserves backend discovery ordering and registry behavior rather than visual presentation.
split_recommended: false
depends_on:
- SS-006
- SS-007
- SS-008
unblocks: []
acceptance_criteria:
- AC-SK01 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- Skills MUST be discovered from the canonical roots and in the canonical order defined in §3.2.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skills_discovery_order_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- 8. Acceptance criteria
- AC-SK01
- Skills MUST be discovered
- canonical roots
- canonical order
- §3.2
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
```

### SS-033 - Duplicate Skill Shadowing GUI Acceptance

```yaml
plan_unit_id: SS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK02 requires duplicate Skill IDs to resolve first-wins while shadowed duplicates remain visible in the GUI.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI visibility for duplicate or shadowed skills.
split_recommended: false
depends_on:
- SS-008
- SS-023
- SS-024
unblocks: []
acceptance_criteria:
- AC-SK02 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- Duplicate Skill IDs MUST be resolved first-wins, and shadowed duplicates MUST be visible in the GUI.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: duplicate_skill_shadowing_gui_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- AC-SK02
- Duplicate Skill IDs
- first-wins
- shadowed duplicates
- visible in the GUI
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md#SEARCH-ORDER, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- Shadowed duplicate GUI visibility is owned here as Skills behavior and consumed by FinalGUISpec surfaces through the ContractRef.
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/FinalGUISpec.md
```

### SS-034 - Skill Tool Allowed Roots Acceptance

```yaml
plan_unit_id: SS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: AC-SK03 requires the skill tool to enforce that explicit file paths are under allowed discovery roots.
gui_related: false
gui_classification_reason: This unit preserves backend tool and permission enforcement rather than visual presentation.
split_recommended: false
depends_on:
- SS-020
- SS-021
- SS-022
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- AC-SK03 remains preserved and addressable as a fine-grained acceptance PlanUnit.
- The `skill` tool MUST enforce that explicit file paths are under allowed discovery roots.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from Skills_System-S0030 remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_acceptance_drift
reasoning_tier: standard
context_scope: skills_acceptance
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: skill_tool_allowed_roots_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- AC-SK03
- skill tool
- "`skill` tool"
- explicit file paths
- allowed discovery roots
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SS-001 - Skills System Retired Source-Preserving Bridge

```yaml
plan_unit_id: SS-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Skills_System.md
canonical_text: SS-001 is retired after Phase 2B batch 172. Skills_System-S0001 through S0030 are covered by fine-grained SS-002 through SS-034 or explicit split coverage; Skills_System-S0031, S0032, and S0034 are generated structural migration metadata; and Skills_System-S0033 is retained only as retired bridge lineage. SS-001 must not provide product implementation coverage or override SS-002 through SS-034.
gui_related: false
gui_classification_reason: This retired compatibility disposition records generated migration-lineage metadata rather than active GUI behavior.
split_recommended: false
depends_on:
- SS-002
- SS-003
- SS-004
- SS-005
- SS-006
- SS-007
- SS-008
- SS-009
- SS-010
- SS-011
- SS-012
- SS-013
- SS-014
- SS-015
- SS-016
- SS-017
- SS-018
- SS-019
- SS-020
- SS-021
- SS-022
- SS-023
- SS-024
- SS-025
- SS-026
- SS-027
- SS-028
- SS-029
- SS-030
- SS-031
- SS-032
- SS-033
- SS-034
unblocks: []
acceptance_criteria:
- Skills_System-S0001 through S0030 remain mapped to fine-grained Skills System PlanUnits rather than SS-001.
- Skills_System-S0031, S0032, and S0034 remain structurally dispositioned generated migration metadata.
- Skills_System-S0033 remains retired bridge lineage only and does not provide product implementation coverage.
- SS-001 no longer uses source_preserving_planunit as a node_compile_hint mode.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_bridge_overreach
reasoning_tier: standard
context_scope: skills_generated_tail_disposition
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: retired_migration_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Skills_System-S0034
preserved_exact_tokens:
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- source_preserving_planunit
negative_constraints:
- SS-001 must not provide product implementation coverage for Skills_System-S0001 through S0030 after Phase 2B batch 172.
- SS-001 must not override SS-002 through SS-034 or structural dispositions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes:
- The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint mode.
stale_retired_dispositions:
- SS-001 retired the original source-preserving bridge after fine-grained and structural coverage was established.
owner_hints:
- Plans/Skills_System.md
- Plans/Plan_Document_System.md
- Plans/Bootstrap_Planning_Migration.md
```
