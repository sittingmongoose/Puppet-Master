# audit-20260617-008-semantic-closure-registry-repair-fidelity

Status: BLOCKED

## Ids And Range
- audit_id: audit-20260617-008-semantic-closure-registry-repair-fidelity
- ledger_id: pldg-20260616-002-orchestrator-goal-runtime-flow
- current_ref: 41a2914f686d1df5ec8ae41f6da94a208044fc4f
- baseline_ref: 683af326677451434948f4807b8175d2d99ee1ee
- audited_range: 683af326677451434948f4807b8175d2d99ee1ee..41a2914f686d1df5ec8ae41f6da94a208044fc4f
- range basis: HEAD is the committed audit-007 repair; HEAD~1 is its parent. The contiguous HEAD-ending group touches the semantic closure registry/support surface, not live target-ledger Plan docs.

## Changed Files
Committed range files:
- Plans/.audits/_semantic_closure_registry.jsonl
- Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/REPAIR_REPORT.md
- Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/repair_closure_matrix.jsonl
- Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/repair_report.json
- scripts/pm-audit-closure.py

Changed live Plans docs: none.
PlanUnit deltas in audited range: none added, changed, or deleted.

## Exact-Detail Fidelity
Active risk: SR-008-001 / sfk-aa922281d6b28fe19734767f

`atom-0088` claims compiled targets `OP-022`, `OSI-428`, `0PI-056`, and `PLS-011`, but those target PlanUnits do not include `pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088` in `source_lineage`. `OSI-428` contains partial canonical/provenance support for old tier-era wording as noncanonical and preserves `compatibility/search aliases`, but this audit contract does not allow preserved tokens alone to prove the atom detail.

Previously closed reuse: 14 rows reused from audit-007 repair evidence with matching hashes; none reopened.

## Reciprocal Lineage
- `PLS-012`, `PDS-014`, and `0PI-057` closure-process source refs remain source-lineage/process support, not target-ledger compile outputs.
- New finding: `atom-0088` has missing reciprocal lineage in claimed target PlanUnits. See `planunit_source_claims.jsonl` row `PUC-008-005`.

## Owner Routing
No active owner-routing warnings remain. The current owner split is `PLS-012` for closure registry/reopen semantics and `PDS-014` for finding-key/matrix validation, with bootstrap prompts/workflow as consumers.

## Ledger And Governance
- Ledger status: sealed.
- Governance status: sealed.
- Compile queue: sealed/source-lineage compiled; active candidate compile plan is false.
- Open follow-up questions `q-0007` through `q-0009` are post-seal followups, not ready compile candidates.
- `.plan_index`: 5,068 PlanUnits, 18,096 acceptance units, zero unresolved dependency refs, node readiness `blocked_compiler_contract_incomplete`, and no WorkNodes created.

## Validators
Final validator suite status: pass.

YAML-dependent validators required the known local `PYTHONPATH=/tmp/pm_pyyaml` path after initial local environment failures for missing `yaml`. Definitive runs passed:
- `pm-audit-closure.py validate`
- `pm-audit-closure.py validate --audit-dir audit-20260617-007... --require-closure-matrix`
- `pm-bootstrap-ledger-validate.py`
- `pm-plan-index.py validate`
- `pm-plan-migration.py validate`
- `pm-plans-verify.py run-gates`
- `pm-shard-plans.py --check`
- `validate-auto-decisions`
- `verify-spec-lock`
- `validate-evidence`
- `git diff --check`

Tracked-file side effects from validators: none.

## Forbidden Artifacts
Pass. The audited range did not create WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, production build tasks, or implementation files. Audit-only output was written under this audit directory.

## Subagent Summary
- Hilbert / owner adjudication: no active owner-routing warnings; audit-007 repair evidence is authoritative.
- Locke / fidelity audit: found `atom-0088` reciprocal lineage gap and possible alias-detail body-proof loss, now recorded as SR-008-001.

## Next Safe Action
Bounded repair for SR-008-001 only. Do not redo compile or redesign the feature. Reconcile `atom-0088` by adding exact canonical body evidence and reciprocal `source_lineage` to true owner PlanUnits, or correct the ledger compile target/disposition if the claimed targets were not actually compiled from the atom. Regenerate `.plan_index` after Plans stabilize, and seal governance only if live Plans/index/governance artifacts change.

## Compact Repair Prompt
Repair audit `audit-20260617-008-semantic-closure-registry-repair-fidelity` for ledger `pldg-20260616-002-orchestrator-goal-runtime-flow`. Scope only SR-008-001 / `sfk-aa922281d6b28fe19734767f`: reconcile `atom-0088` reciprocal lineage and compatibility/search-alias body proof across `OP-022`, `OSI-428`, `0PI-056`, and `PLS-011`, or correct the ledger compile target/disposition if any target is false. Do not redo compile, redesign, create WorkNodes/NodeSeeds/queues/manifests/build tasks, or touch implementation files. Update repair_closure_matrix, registry closure row, repair_report, and validators; regenerate `.plan_index` and seal governance only if live Plans change.
