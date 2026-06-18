# audit-20260617-014-plans-to-code-handoff-post-repair-clean-fidelity

Status: PASS_WITH_GOVERNANCE_STALE
Ledger: pldg-20260617-001-plans-to-code-handoff
Commit: 4bc466bf84

## Summary

Audit-only pass checked 64 source atoms, 38 compiled PlanUnits, 8 owner/doc-impact groups, 8 implementation-readiness areas, forbidden artifacts, validators, and 43 reused closure-registry rows. No semantic risks were emitted.

All target ledger closure rows are `previously_closed_reused`; the prior `impl-004` finding is closed by the repair artifacts in `audit-20260617-013-plans-to-code-handoff-post-repair-fidelity` and current OP-023/F3-397 PlanUnit evidence.

No repair, seal, WorkNodes, NodeSeeds, PlanCompile enablement, executable queues, runtime dispatch, implementation files, or production build tasks were created.

## Results

- atom fidelity: {'equivalent_with_evidence': 64}
- PlanUnit source claims: {'valid_source_claim': 38}
- owner routing: {'pass': 8}
- doc-impact refs: {'pass': 8}
- implementation readiness: {'pass': 8}
- closure reuse: 43 previously closed rows reused
- forbidden artifacts: pass (0)
- validators: pass_with_governance_stale / governance=stale_not_sealed

## Governance

Governance remains stale/not sealed. `run-gates`, shard check, Spec Lock, evidence, and plan graph validators are expected failures until an explicit governance seal refreshes generated artifacts.

## Next Safe Action

Commit the audit artifacts, or run an explicit governance seal phase if stale generated governance artifacts should be refreshed.
