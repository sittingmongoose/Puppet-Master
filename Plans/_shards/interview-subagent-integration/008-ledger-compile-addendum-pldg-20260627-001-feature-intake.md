# Shard 008: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/interview-subagent-integration.md`

Source lines: L997-L1055

Source SHA256: `7a64ee5aecf82e446dae6d376e41bf173e17acc356727b5add666147cee6d64e`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Interview Subagent Integration owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ISI-019 - Interview Prompt Route DRY Consumer

```yaml
plan_unit_id: ISI-019
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: >-
  Interview prompt routes consume the shared DRY Method Instruction Bundle route from Prompt Pipeline and Agent Rules
  Context. Interview does not define a separate DRY prompt model, local DRY prose, or route-local effective-state enum.
  Interview clarification, handoff, and question flows preserve DRY receipt fields through the shared CV-299 contract
  when DRY applies, degrades, is disabled, blocks, or caveats the route.
gui_related: false
gui_classification_reason: Defines Interview prompt-route behavior and receipt fields rather than visual presentation.
depends_on: [ARC-036, PP-057, CV-299, DR-036, DP-063]
unblocks: [ATS-018]
acceptance_criteria:
  - Interview consumes the shared DRY Instruction Bundle route.
  - Interview does not fork DRY prose or effective-state enums.
  - DRY receipt state remains available across Interview clarification, question, and handoff paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Interview DRY route conformance fixtures
risk_class: interview_dry_shadow_route
reasoning_tier: high
context_scope: interview_dry_method_consumer
implementation_surfaces:
  - Plans/interview-subagent-integration.md
  - future Interview prompt routes
node_compile_hint:
  mode: interview_dry_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0076, atom-0083]
preserved_exact_tokens:
  - "Interview"
  - "Instruction Bundle"
  - "DRY Method"
  - "question flows"
  - "handoff"
  - "dry_method_effective_state"
negative_constraints:
  - Do not define a separate Interview DRY prompt model.
  - Do not create route-local DRY enums that diverge from CV-299.
owner_hints:
  - Plans/interview-subagent-integration.md
  - Plans/Prompt_Pipeline.md
  - Plans/agent-rules-context.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
