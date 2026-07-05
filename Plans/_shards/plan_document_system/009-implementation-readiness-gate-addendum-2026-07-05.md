# Shard 009: Implementation Readiness Gate Addendum - 2026-07-05

Source: `Plans/Plan_Document_System.md`

Source lines: L1012-L1101

Source SHA256: `76236e846d59d279a5900cceb4c34d981657ad19e5f2cd1552b28ef6c6ff1b46`

---

## Implementation Readiness Gate Addendum - 2026-07-05

This addendum owns the implementation-readiness blocker registry shape. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance seal artifacts, or production build tasks.

### PDS-019 - Implementation Readiness Blocker Registry

```yaml
plan_unit_id: PDS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  Plans/.implementation_readiness/readiness_blockers.jsonl is the file-backed implementation-readiness blocker
  registry. Each row uses schema_id `pm.implementation_readiness.blocker.v1` and records blocker_id,
  blocker_family, status, severity, summary, exact owner_docs, blocked_surfaces, blocked_false_proofs,
  required_evidence, acceptance_to_close, source_refs, and notes. The required blocker families are
  contract_materialization, persistence_materialization, gui_wiring, security_boundary, runtime_lifecycle,
  provider_stream, behavioral_acceptance, structural_integrity, owner_routing, currentness, and
  clean_room_harness. Plans/.implementation_readiness/readiness_matrix.json owns the blocker schema,
  false-proof guardrails, proof dimensions, and Wizard gate contract; buildability_gate_report.json is the
  generated consumer report. Open blocker rows disable Approve And Build; closed or accepted_risk rows remain
  historical closure evidence and do not require disabled reasons. readiness_blockers.jsonl and readiness_matrix.json
  are governed readiness inputs, buildability_gate_report.json is a generated governed report, and
  scripts/pm-implementation-readiness.py is the governed validator/generator registered through Spec Lock during
  governance seal. Passing plan validators, source-preservation acceptance, existing schemas, wiring JSON existence,
  and semantic closure are explicitly insufficient to close a blocker without concrete behavioral, command-wiring,
  security, persistence, currentness, provider, structural, owner-routing, and clean-room lifecycle evidence. Partial
  PNC-019 bootstrap-authority evidence may be recorded while runtime_lifecycle and clean_room_harness blockers remain
  open; it must not be counted as blocker closure or ordinary product buildability.
gui_related: false
gui_classification_reason: Defines registry schema and governance artifacts rather than visual presentation.
depends_on: [PDS-016, PNC-019, PNC-022]
unblocks: [PWIZ-018, PG-060]
acceptance_criteria:
  - The registry contains all required blocker families and exact owner_docs for each open blocker.
  - The readiness matrix records the blocker schema and false-proof guardrails.
  - The buildability gate report is generated from the registry and matrix rather than hand-authored as product truth.
  - Closed and accepted_risk rows remain allowed historical evidence and are excluded from open disabled-reason projection.
  - The readiness script, registry, matrix, and generated report have documented governance status and Spec Lock registration policy.
  - Preservation-only acceptance criteria and validator success cannot close implementation-readiness blockers.
  - PNC-019 bootstrap-authority evidence can be partial/blocked evidence only; it does not close runtime_lifecycle or clean_room_harness without executable lifecycle proof.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-implementation-readiness.py self-test
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-index.py validate
risk_class: false_implementation_readiness_registry
reasoning_tier: high
context_scope: implementation_readiness_registry
implementation_surfaces:
  - Plans/Plan_Document_System.md
  - Plans/.implementation_readiness/readiness_blockers.jsonl
  - Plans/.implementation_readiness/readiness_matrix.json
  - Plans/.implementation_readiness/buildability_gate_report.json
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: implementation_readiness_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_ref:chat:2026-07-05-implementation-readiness-buildability-gate
  - Plans/Planning_Wizard.md#PWIZ-018
  - Plans/Plan_To_Node_Compilation.md#PNC-019
  - Plans/Plan_To_Node_Compilation.md#PNC-022
preserved_exact_tokens:
  - "readiness_blockers.jsonl"
  - "readiness_matrix.json"
  - "buildability_gate_report.json"
  - "contract_materialization"
  - "persistence_materialization"
  - "gui_wiring"
  - "security_boundary"
  - "runtime_lifecycle"
  - "provider_stream"
  - "behavioral_acceptance"
  - "structural_integrity"
  - "owner_routing"
  - "currentness"
  - "clean_room_harness"
negative_constraints:
  - Do not treat existing JSON schema presence as enough.
  - Do not treat validators passing as enough.
  - Do not treat preservation-only acceptance criteria as behavioral acceptance.
  - Do not create product WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from the registry.
owner_hints:
  - Plans/Plan_Document_System.md
  - Plans/Planning_Wizard.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Progression_Gates.md
```
