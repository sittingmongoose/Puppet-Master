# FINAL REPORT — audit-20260629-001-free-models-closed-world-semantic-fidelity

Status: BLOCKED
Ledger: `pldg-20260629-001-feature-name`
Baseline ref: `d6da6b229ff6e675b3be717c2fb92e42baab19b2`
Subject ref: `55e344021b89e8d81c04acf914fc8e68a4ba6efa`
Observation ref: `HEAD`
Generated at: `2026-06-29T19:27:06Z`

## Scope And Coverage

- Scope rows: 10428
- Classified rows: 10428
- Coverage: 100.0%
- Compiled atoms audited: 277
- Non-compiled ledger dispositions covered: 21
- Compiled PlanUnits audited: 23
- Subject changed paths: 505
- Changed live Plan docs: 12

## Actionable Findings

### 1. closure_registry_currentness_failure

- finding_key: `sfk-f6f7b1a8d1ba5658b04fb84f`
- repair_required: `true`
- finding_level: `error`
- atom_ids: `none`
- plan_unit_ids: `PDS-014, PLS-012`
- owner_docs: `Plans/.audits/_semantic_closure_registry.jsonl, scripts/pm-audit-closure.py`
- detail_keys: `pm-audit-closure.py validate, owner_evidence_hashes, closure_evidence_hashes, stale_hash_error_count`
- exact_tokens: `529 stale closure-registry hash errors; owner_evidence_hashes is stale; closure_evidence_hashes is stale; Plans/.plan_index/plan_units.jsonl stored 410aca2ec953f299473a22a07bac2b8f76bff28a3eabe3c459214e15b8c2556f current 46024ea193a57c13cb3e2026e00f95f9326c6124bb664b1c6d21f6578903b107; Plans/ledgers/v2/ledger_registry.json stored e66a06672bd2a60a4d46c4b70ad409497b9c7f4b575fa94f4cca7ee1e26ba103 current 3927ecc6b451d050fde4e2ba7c0e52911d682016e6f11c3f8446cca3923e94a0`
- evidence: `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/validator_results.json, Plans/.audits/_semantic_closure_registry.jsonl`
- summary: Semantic closure registry validation fails with 529 stale owner_evidence_hashes/closure_evidence_hashes after the Free Models governed files changed; closure rows must be refreshed before this audit can pass.

### 2. compile_queue_governance_note_stale

- finding_key: `sfk-efd04bdd70b5ae8d16202105`
- repair_required: `true`
- finding_level: `error`
- atom_ids: `none`
- plan_unit_ids: `none`
- owner_docs: `none`
- detail_keys: `notes`
- exact_tokens: `Free Models compile complete. Bootstrap ledger validator, PlanUnit index validate, and git diff --check passed; migration validation failed on stale migration artifacts outside compile scope. Governance seal remains pending.`
- evidence: `Plans/ledgers/v2/pldg-20260629-001-feature-name/state/compile_queue.json`
- summary: compile_queue.status/governance_status/validation_state say sealed, but compile_queue.notes still says governance seal remains pending.

### 3. ledger_registry_top_level_timestamp_stale

- finding_key: `sfk-c69d7fbf0d257ba89b1d2d67`
- repair_required: `true`
- finding_level: `error`
- atom_ids: `none`
- plan_unit_ids: `none`
- owner_docs: `Plans/ledgers/v2/ledger_registry.json`
- detail_keys: `updated_at_utc`
- exact_tokens: `2026-06-29T16:16:41Z`
- evidence: `Plans/ledgers/v2/ledger_registry.json`
- summary: ledger_registry top-level updated_at_utc 2026-06-29T16:16:41Z predates target ledger entry last_updated_at_utc 2026-06-29T18:56:04Z.

## Validator Results

- Validators run: 13
- Passed: 11
- Failed: 2 (`closure_registry_validate, closure_audit_dir_validate`)
- Closure registry stale-hash errors: 529
- Mutated outside audit dir: `false`
- Non-audit side effects: `none`

All non-closure validators passed: target ledger, PlanUnit index, migration, governance audit, run-gates, shard check, auto-decisions, plan graph, Spec Lock, evidence, and diff hygiene.

## Non-Actionable Warnings / Observations

- Node readiness remains intentionally `blocked_compiler_contract_incomplete` / `runtime_disabled`; no executable node artifacts are authorized.
- Legacy compile_queue scalar `target_doc` is weak evidence; authoritative `target_docs` and compiled owner docs route correctly.
- Earlier atom owner hints mention `Provider_OpenCode` or `CLI_Bridged_Providers`, but `atom-0297`, `atom-0298`, `PP-058`, and `0PI-064` keep Provider_OpenCode adjacent/reference-only.
- Generated shard filenames contain historical words such as queue/dispatch, but no actual WorkNodes, NodeSeeds, implementation paths, executable queues, GoalRuns, runtime/build surfaces, or production build artifacts changed.
- The audit bundle itself is intentionally outside `subject_ref` and recorded at `observation_ref=HEAD`.

## Subagent Results

- Erdos: source-lineage/fidelity slice passed with no repair-required findings.
- Beauvoir: owner-routing and Provider_OpenCode boundary passed with no repair-required findings.
- Herschel: governance/forbidden-artifact slice confirmed the stale compile_queue projection blocker and no forbidden artifacts.

## Artifacts Written

- `audit_scope_manifest.jsonl`
- `audit_report.json`
- `atom_fidelity_matrix.jsonl`
- `planunit_source_claims.jsonl`
- `owner_routing_findings.jsonl`
- `ledger_consistency.json`
- `validator_results.json`
- `semantic_risks.jsonl`
- `closure_reuse.jsonl`
- `FINAL_REPORT.md`

## Next Action

Do not repair in this audit-only pass. Next action is a separate bounded repair for stale ledger projections and semantic closure-registry hashes, followed by closure and standard validator rerun.
