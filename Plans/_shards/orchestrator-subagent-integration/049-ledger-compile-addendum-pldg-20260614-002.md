# Shard 049: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31350-L31396

Source SHA256: `50af792e5959fb426e219283275a2d943bb4307c7a9537cade2fb0d06978da1a`

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
  target for this continuity path. Application continuity carries null Project plus real
  Server/thread/run/account/Computer scope with the same
  extraction/provenance/redaction/currentness/retention obligations. App storage is canonical Server-owned
  custody, not a Project path.
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
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0100"
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0101"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens: ["Cross-run knowledge continuity", "orchestrator-subagent-integration §4", "no schema, no event family, no storage keys", ".puppet-master/memory"]
negative_constraints:
  - Do not use `.puppet-master/memory` as active continuity storage.
  - Do not treat extraction alternatives as canonical behavior without the shared continuity schema.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```
