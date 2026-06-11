# Shard 012: PlanUnits

Source: `Plans/Skills_System.md`

Source lines: L415-L549

Source SHA256: `000669515ae4da149f6179882db634954d230601e52e8b94108ea35216c9d3f2`

---

## PlanUnits

### SS-001 - Skills System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: SS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: Plans/Skills_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Skills_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Skills_System-S0030
preserved_exact_tokens:
- Skills System (Canonical SSOT)
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 1. Definitions
- 1.1 Skill
- 1.2 Skill ID
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
- 2. On-disk format (SKILL.md)
- 2.1 File layout
- 2.2 YAML frontmatter
- 2.3 Body
- 'ContractRef: ContractName:Plans/Tools.md'
- 3. Storage layout and discovery
- 3.1 Canonical discovery roots
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/MiscPlan.md'
- 3.2 Search order and deduplication (shadowing)
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/FinalGUISpec.md'
- 3.3 Validation during discovery
- 'ContractRef: ContractName:Plans/MiscPlan.md'
- 4. Runtime surface
- 4.1 Skill registry
- 4.2 Persona `default_skill_refs`
- 4.3 skill tool
negative_constraints:
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata i'
- Invalid skills MUST NOT be loadable by ID, but MUST be listed in the GUI with their validation errors.
- '- Skill-driven file tree, evidence root, restore, and `/revert` flows MUST NOT assume a single `active-worktree`; they carry active project/worktree identity in context and degrade when the target worktree is absent, archived, or no longer current.'
- '### 4.5 Non-goal for MVP'
- '- a child must not gain skill-powered capability that exceeds the parent ceiling.'
- '- Remote skill discovery (URLs) is out of scope for v1; remote distribution should flow through the Catalog system (§7.4.3 in `Plans/FinalGUISpec.md`) rather than ad-hoc URL pulls.'
compatibility_only_notes:
- Additional frontmatter fields MAY be present (e.g., `license`, `compatibility`, `metadata`, `tags`) but are not required for core discovery and loading.
- '- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gatin'
- '- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visibl'
- '- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.'
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or '
- 'Compatibility projection/export policy is explicit and target-based: the default posture is `import/discover yes` and `export/project no`; any projection row records a target such as `.claude/skills` or `.agents/skills`, not an implicit provider-wide install into per-account sandboxes. OpenCode repo'
- Agent Config > Skills is the page-level GUI management surface for agent-management skills. It is not a `settings-only` tab. Legacy `Settings > Skills` copy is a redirect/focus entry into Agent Config > Skills, while Settings remains owner for Authentication, Models/Permissions, permission profiles,
- The Skills tab is the loaded-skills catalog for discovered, imported, and catalog-installed entries; legacy `/imported/catalog-installed` copy is an alias for those source rows, not a separate source type. It must support browse/search/filter (`/search/filter`), source/readiness (`source-readiness`)
stale_retired_dispositions: []
owner_boundary_notes:
- '# Skills System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- 'This document is the **single canonical SSOT** for the Puppet Master **Skills** subsystem: skill identity, on-disk format (`SKILL.md`), discovery roots and ordering, search order, deduplication/shadowing rules, permissions integration (`skill` key), how skills are surfaced to runs (Persona `default_'
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- 'A Skill is identified by a stable **Skill ID** string. In Puppet Master, the Skill ID is the YAML frontmatter `name` field and MUST follow the canonical skill name regex from the OpenCode baseline:'
- 'Tool dependency metadata belongs in `SKILL.md` frontmatter when present: `required_tool_refs` and `optional_tool_refs` name canonical PM tool refs and keep the skill self-describing for import, `default_skill_refs` resolution, and `/export/interoperability`. PM MUST NOT move required tool metadata i'
- '### 3.1 Canonical discovery roots'
- 'Discovery MUST walk roots in this canonical order (first match wins for a given Skill ID):'
- 'Rule: When two discovered skills share the same Skill ID, the first discovered skill is the canonical one and later duplicates are treated as **shadowed**.'
- The MVP runtime surface for skills is canonical and provider-agnostic.
- '`default_skill_refs` are resolved against the canonical registry during prompt/context assembly. They do not imply provider-native skill file installation at runtime.'
- This section defines the canonical contract for this surface.
- '- The canonical invocation key is `skill_id`. Legacy or provider-style inputs such as `path_or_name` and `path_or_name -> content, name` MAY be normalized only as compatibility aliases; they do not bypass Skill ID validation, permission checks by exact skill name, registry lookup, or readiness gatin'
- '- The `skill` result is a structured `skill-content` envelope: `skill_id`, `title`, `content`, `source_type`, `resource_base_dir?`, `resource_entries_sample?`, and `metadata?`; `name` is a compatibility display alias for `title`. Resource guidance is relative-resource guidance only: assistant-visibl'
- '- Skill-triggered runtime actions normalize legacy `allowed_actions[]` displays to canonical `allowed_action_ids[]`; `allowed_actions` is a compatibility label, while `allowed_action_ids` is the stable ordered action vocabulary used by runtime blocked/recovery contracts.'
- '### 4.4 Canonical MVP delivery path'
- '- a skill package resolves to one canonical `SKILL.md`'
- '- External Swift-Agent-Skills / agent-skills patterns are design evidence for the adopted portable folder-based `SKILL.md` package shape with optional resources. PM may import/discover them through canonical roots, but the runtime remains the PM registry/discovery/runtime contract.'
- '- A portable folder-based skill package may include bounded package-resource directories such as `resources/`, `scripts/`, and `templates/`; these entries are FileSafe-limited package resources and never replace the single canonical `SKILL.md` manifest/instruction entrypoint, create extra manifests,'
- MVP does not require a per-provider native runtime skill-loading matrix. If provider-native loading is added later, it is an optimization or interoperability layer above the canonical registry + bundling + tool path.
- 'PM-compatible provider posture: always use the PM registry/bundling/`skill` tool path at runtime; always import/discover from PM''s canonical roots, including shared `.claude` / `.agents` compatibility roots; and only export/project to external/provider-native conventions when the user enables it or '
owner_hints:
- Plans/Skills_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

