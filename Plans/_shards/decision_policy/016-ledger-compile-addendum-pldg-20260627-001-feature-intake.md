# Shard 016: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Decision_Policy.md`

Source lines: L3307-L3366

Source SHA256: `72a2faae8bec90e7e64eb6d845451a37b9f491de47e4bcb8e00339ff5bf4861d`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Decision Policy owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### DP-063 - DRY Clarification And Mutation Gate Policy

```yaml
plan_unit_id: DP-063
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  DRY Method decision policy allows exploratory chat to proceed with a visible unresolved-owner caveat when source/owner
  routing is unclear, but canonical or implementation-changing mutation must block, ask for clarification, or record a
  bounded open item before proceeding. Disabled DRY removes only the default DRY-specific guard behavior and does not
  authorize bypassing explicit user instructions, safety, secrets, source authority, governance phase boundaries,
  permissions, or source-control hygiene.
gui_related: false
gui_classification_reason: Defines clarification and mutation policy rather than visual presentation.
depends_on: [DR-036, CV-299]
unblocks: [ATS-018]
acceptance_criteria:
  - Exploratory responses identify unresolved owner/source caveats when the DRY Method would otherwise affect trust.
  - Canonical or implementation-changing mutations do not proceed silently with unresolved owner/source routes.
  - User-disabled DRY state cannot be treated as broad policy bypass.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY decision policy fixtures
risk_class: dry_method_mutation_policy_gap
reasoning_tier: high
context_scope: dry_method_decision_policy
implementation_surfaces:
  - Plans/Decision_Policy.md
  - future decision policy checks
node_compile_hint:
  mode: dry_method_clarification_mutation_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-fallback-disabled-boundary
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-005
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0077, atom-0083]
preserved_exact_tokens:
  - "exploratory chat"
  - "canonical"
  - "implementation-changing mutation"
  - "block"
  - "ask"
  - "bounded open item"
  - "disabled_by_user"
negative_constraints:
  - Do not allow canonical or implementation-changing mutation to proceed silently with unresolved owner/source routes.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/DRY_Rules.md
  - Plans/Permissions_System.md
```
