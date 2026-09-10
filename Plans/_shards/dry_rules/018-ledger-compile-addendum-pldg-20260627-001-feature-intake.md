# Shard 018: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/DRY_Rules.md`

Source lines: L1983-L2044

Source SHA256: `595e587a48b45dbe60cfa50b0191bdfd70d86f1f7943227f32d39c85dd8ed3ec`

---

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
