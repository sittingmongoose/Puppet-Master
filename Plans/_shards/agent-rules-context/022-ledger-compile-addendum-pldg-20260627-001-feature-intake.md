# Shard 022: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/agent-rules-context.md`

Source lines: L2301-L2365

Source SHA256: `973cc1c959ccca05ed7bb6a3a3be1c4c8b7d537342c2897621b42cf489e5671b`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Agent Rules Context owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ARC-036 - Application-Level Default DRY Guard

```yaml
plan_unit_id: ARC-036
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: >-
  PM applies the DRY Method as an application-level default guard through the shared rules pipeline and Instruction
  Bundle. The setting key is `app.agent_rules.dry_method_default_guard`, stored as enabled or disabled_by_user, with
  enabled as the default. Disabling it turns off only the default DRY guard and DRY-specific caveat/block behavior;
  explicit user/project instructions, safety, secrets, source authority, governance phase boundaries, permissions,
  and source-control hygiene remain active.
gui_related: false
gui_classification_reason: Defines application rules behavior and default guard semantics rather than visual presentation.
depends_on: []
unblocks: [PP-057, DR-036, DP-063, CV-299, F3-406, ATS-018]
acceptance_criteria:
  - DRY Method is default-on unless the user explicitly disables the default guard.
  - The disable path cannot bypass non-DRY authority boundaries.
  - The rule is injected through the shared Instruction Bundle route, not copied into local prompt builders.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method rules-context fixtures
risk_class: dry_method_default_guard_drift
reasoning_tier: high
context_scope: dry_method_agent_rules_context
implementation_surfaces:
  - Plans/agent-rules-context.md
  - future application rules pipeline
node_compile_hint:
  mode: dry_method_application_default_guard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-004
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0054, atom-0073, atom-0083]
decision_refs: [dec-0016]
preserved_exact_tokens:
  - "DRY Method"
  - "default"
  - "the user can turn it off"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "Instruction Bundle"
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not make DRY impossible to disable.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not create shadow instruction sources.
owner_hints:
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
```
