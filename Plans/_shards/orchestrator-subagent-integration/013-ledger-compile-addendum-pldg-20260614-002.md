# Shard 013: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31035-L31075

Source SHA256: `f3d48e18324a62c3bb3589925d92cc06651b368d686cea36757e9d9cc56c9084`

---

## Ledger Compile Addendum - pldg-20260614-002

### OSI-427 - Cross Run Knowledge Continuity Contract

```yaml
plan_unit_id: OSI-427
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator/subagent integration consumes the shared runtime continuity contract for cross-run
  knowledge continuity. Subagent extraction and handoff flows must emit continuity records with
  actor/runtime_identity, project/run/account scope, extraction source, trigger reason, provenance,
  redaction/retention policy, replay/reconnect behavior, conflict/staleness handling, and storage refs
  owned by the canonical runtime storage path. `.puppet-master/memory` is rejected as an active storage
  target for this continuity path.
gui_related: false
gui_classification_reason: Cross-run continuity extraction, storage, and handoff records are orchestration/runtime contracts, not visual presentation.
depends_on: [CV-282, OSI-426]
unblocks: []
acceptance_criteria:
  - Subagent handoffs and extraction records use the shared continuity schema and storage keys.
  - Continuity provenance, redaction, retention, replay, reconnect, conflict, and staleness handling are explicit.
  - "`.puppet-master/memory` is not used as active runtime continuity storage."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: cross_run_continuity_gap
reasoning_tier: high
context_scope: orchestrator_subagent_cross_run_continuity
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: orchestrator_cross_run_continuity, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0100
  - pldg-20260614-002-part-3-fable-cleanup:atom-0101
preserved_exact_tokens: ["Cross-run knowledge continuity", "orchestrator-subagent-integration §4", "no schema, no event family, no storage keys", ".puppet-master/memory"]
negative_constraints:
  - Do not use `.puppet-master/memory` as active continuity storage.
  - Do not treat extraction alternatives as canonical behavior without the shared continuity schema.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```
