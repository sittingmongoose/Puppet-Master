# Repair Report: audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity

Status: repair_validated

Closed all 6 repair_required source rows from audit-010: 6 repaired, 0 deferred, 0 false-positive, 0 blocked. No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, runtime dispatch, or production build tasks were created.

## Closed Rows

- semantic_risks.jsonl:1 / sfk-1910931b0479694928e65489 - repaired schema_id/native_runtime branch identity.
- semantic_risks.jsonl:2 / sfk-561a390845f15d53324dca5a - repaired compact ledger projection currentness.
- semantic_risks.jsonl:3 / sfk-4356fd7d65b55921ebce4ab3 - repaired local/global ledger registry timestamp currentness.
- planunit_source_claims.jsonl:63 / sfk-ab7ce9e456b92496f3f8d0b7 - repaired CV-289 reciprocal PRD ledger lineage.
- planunit_source_claims.jsonl:64 / sfk-bf4c90f3fe4730bb280541df - repaired CW-008, CWF-151, and GRS-002 reciprocal PRD ledger lineage.
- owner_routing_findings.jsonl:1 / sfk-6001c68ef171b85b6d6471c3 - repaired runtime branch dependency metadata edges.

## Closed-World Artifacts

- `audit_scope_manifest.jsonl` has 371 classified rows across all required scope families.
- `repair_impact_matrix.jsonl` has 6 rows, each post-repair audited with zero drift.
- `post_repair_audit_report.json` reports `repair_required_count=0`.
- `_semantic_closure_registry.jsonl` has audit-010 rows `closure-audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity-repair-001` through `-006`.

## Validators

Passed:
- `python3 -m unittest tests/test_pm_audit_closure.py`
- `python3 scripts/pm-audit-closure.py validate --registry Plans/.audits/_semantic_closure_registry.jsonl --audit-dir Plans/.audits/audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity --require-closure-matrix`
- `PYTHONPATH=/tmp/pm_pyyaml python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard`
- `PYTHONPATH=/tmp/pm_pyyaml python3 scripts/pm-plan-index.py validate`
- `PYTHONPATH=/tmp/pm_pyyaml python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`
- `python3 scripts/pm-plans-verify.py run-gates`
- `python3 scripts/pm-shard-plans.py --check`
- `python3 scripts/pm-plans-verify.py verify-spec-lock`
- `python3 scripts/pm-plans-verify.py validate-evidence`
- `python3 scripts/pm-plans-verify.py validate-plan-graph`
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`
- `python3 scripts/pm-plans-verify.py audit-governance`
- `python3 scripts/pm-plans-verify.py json-syntax`
- `python3 scripts/pm-plans-verify.py lint-contractrefs`
- `python3 scripts/pm-plans-verify.py lint-banned-phrases`
- `python3 scripts/pm-plans-verify.py check-project-artifacts`
- `python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema`
- `git diff --check`

Node readiness remains `blocked_compiler_contract_incomplete` by design.
