# Shard 016: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Decision_Policy.md`

Source lines: L3634-L3754

Source SHA256: `79c1701509e6333d3470add092021dbf424a6992e9cae2ce874abfc7a555a58a`

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

### DP-064 - Planning Wizard Clarification-Round Limits

```yaml
plan_unit_id: DP-064
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy owns the clarification-round limits for the Planning Wizard. A clarification cycle is one
  requirements_quality_report with non-empty needs_user_clarification[], the user's answer submission, and the
  automatic re-run of the requirements-quality Auditor loop of section 6.4 with those answers injected. One Planning
  Wizard instance allows at most 3 clarification cycles, counted in clarification_round_count. In cycles 1-2 the
  wizard stays in attention_required while follow-up questions remain; when cycle 3 still leaves
  needs_user_clarification[] non-empty, the Planning Wizard moves to blocked as Plans/Planning_Wizard.md#PWIZ-038
  defines, and reopening the same blocked wizard does not reset clarification_round_count. After the cap the latest
  canonical quality report is preserved and requirements are not auto-rewritten without new explicit user input. An
  explicit user override to continue with a manual decision is offered only when the user acknowledges the remaining
  risk and the downstream gate permits override for that category, and the override is recorded as evidence.
gui_related: true
gui_classification_reason: Defines when the user-visible override to continue past the clarification cap is offered.
split_recommended: false
depends_on: [DP-033, DP-034]
unblocks: [PWIZ-038]
acceptance_criteria:
  - No fourth clarification cycle starts automatically; when the third leaves questions open, the Planning Wizard is blocked as PWIZ-038 defines.
  - Reopening a blocked wizard does not reset clarification_round_count.
  - An override past the cap requires risk acknowledgement, gate permission for the category, and recorded evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_round_limit_drift
reasoning_tier: high
context_scope: clarification_round_limits
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: clarification_round_limits
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-330
  - Plans/chain-wizard-flexibility.md#CWF-107 (retired source lineage, section 15.5 clarification round cap)
  - Plans/chain-wizard-flexibility.md#CWF-108 (retired source lineage, blocked clarification override evidence)
  - Plans/chain-wizard-flexibility.md#CWF-136 (retired source lineage, block escalation thresholds)
preserved_exact_tokens:
  - "clarification cycle"
  - "at most 3 clarification cycles"
  - "clarification_round_count"
  - "needs_user_clarification[]"
  - "attention_required"
  - "blocked"
  - "DL-330"
negative_constraints:
  - Do not start a fourth automatic clarification cycle.
  - Do not auto-rewrite requirements after the cap without new explicit user input.
  - Do not offer the override without risk acknowledgement, gate permission for the category, and recorded evidence.
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Planning_Wizard.md
```
