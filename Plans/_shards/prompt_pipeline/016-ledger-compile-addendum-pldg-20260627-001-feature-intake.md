# Shard 016: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Prompt_Pipeline.md`

Source lines: L3896-L3962

Source SHA256: `de24373d811638dc1fbdb8d49294a1654a39a2c03d2eda2c35693abdabe53e9a`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Prompt Pipeline owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PP-057 - Shared DRY Instruction Bundle Conformance

```yaml
plan_unit_id: PP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Assistant, Interview, Orchestrator, delegated child-run, document-builder, and code-generation prompt routes consume
  one shared Instruction Bundle route for the DRY Method. Prompt builders must not carry prompt-builder-local DRY prose,
  shadow instruction sources, or route-specific DRY behavior. The Instruction Bundle records
  `instruction_bundle_ref`, `rules_application_sha256`, `rules_project_sha256`, `dry_method_effective_state`, and
  `dry_method_reason` as run-start minimum fields when the DRY Method applies, degrades, is disabled, blocks, or
  caveats a route.
gui_related: false
gui_classification_reason: Defines prompt assembly and shared route conformance rather than visual presentation.
depends_on: [ARC-036, CV-299]
unblocks: [OSI-430, ISI-019, ATS-018]
acceptance_criteria:
  - Every listed prompt route consumes the same DRY Method Instruction Bundle path.
  - Local prompt templates do not duplicate or fork DRY Method prose.
  - Run-start minimum fields are present when DRY has a material route effect.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method prompt route conformance fixtures
risk_class: dry_method_prompt_route_drift
reasoning_tier: high
context_scope: dry_method_prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
  - future prompt assembly
node_compile_hint:
  mode: dry_method_shared_instruction_bundle
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-003
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-004
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0076, atom-0083]
preserved_exact_tokens:
  - "Assistant"
  - "Interview"
  - "Orchestrator"
  - "delegated child-run"
  - "document-builder"
  - "code-generation"
  - "Instruction Bundle"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
negative_constraints:
  - Do not create shadow instruction sources.
  - Do not duplicate DRY prose into prompt builders.
  - Do not let route-local prompt templates override the shared DRY owner.
owner_hints:
  - Plans/Prompt_Pipeline.md
  - Plans/agent-rules-context.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
```
