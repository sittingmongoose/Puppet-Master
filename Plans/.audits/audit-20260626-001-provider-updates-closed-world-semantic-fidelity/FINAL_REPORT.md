# Closed-World Semantic Audit: Provider Updates Ledger To Plans

Audit ID: `audit-20260626-001-provider-updates-closed-world-semantic-fidelity`
Ledger ID: `pldg-20260624-001-provider-updates`
Observation ref: `HEAD`
Subject ref: `d640e0278b15cf906df3cfc8ccf484d71aeecbab`
Baseline ref: `7b18d32554c37da6f694ec5851f202186219c2b7`

## Terminal Status

`BLOCKED`

The audit is terminally blocked because repair-required semantic findings exist and validators fail. No repairs were performed. Writes were limited to this audit directory.

## Scope Coverage

- Scope manifest rows: `1516`
- Classified rows: `1516`
- Coverage: `100.0%`
- Semantic source rows: `8`
- Semantic repair-required findings: `5`
- Validator repair-required rows: `3`
- Total `repair_required_count`: `8`
- Repair impact rows: `8`
- Closure reuse rows: `0`

## Repair-Required Findings

1. `stale_lineage_active_usage_copy`
   - Finding key: `sfk-2e1b920cfabc04dc0be69949`
   - PlanUnits: `0PI-061`, `CBP-019`, `MA-035`, `MA-062`
   - Evidence: `Plans/Multi-Account.md:529` still says `show one shared Gemini-family usage surface rather than separate top-level Gemini Direct vs Gemini CLI pages`, while `Plans/CLI_Bridged_Providers.md:1081` and `Plans/.plan_index/plan_units.jsonl:61` retire Gemini CLI to source-lineage/compatibility only.

2. `stale_provider_schema_residue`
   - Finding key: `sfk-d1a2ecb4b7d39660d5d9f5a8`
   - PlanUnits: `CV-293`, `F3-401`, `MGAC-026`, `MGAC-094`, `MS-113`, `PP-054`
   - Evidence: `Plans/Media_Generation_and_Capabilities.md:534` still constrains `engine.backend` to `gemini_api | cursor_native`, while `MGAC-094` requires route-specific `generated_media_routes[]` and `PP-054` / `CV-293` require `provider_entry_id` and `media_route_id` requested/effective identity.

3. `ledger_projection_count_drift`
   - Finding key: `sfk-2558838ab5b35d7ceef3db16`
   - Evidence: `current.json` and `ledger_health.json` report `126` compiled atoms, while `handoff.json` reports `"compiled_atoms_count": 123`; `current.json` also keeps `governance seal remains pending` wording despite sealed status.

4. `ledger_validator_projection_stale`
   - Finding key: `sfk-61185c1dea495f4aaa303ecf`
   - Evidence: compact validation fields still say `pending_final_rerun_after_seal_projection_update`, while `ledger_health.json` reports `pass_governance_sealed`.

5. `closure_registry_currentness`
   - Finding key: `sfk-929f4dfbd5cc1201eff2a369`
   - Evidence: `python3 scripts/pm-audit-closure.py validate` fails on stale `owner_evidence_hashes` / `closure_evidence_hashes`; dry-run refresh reports `touched_rows=214`, `owner_evidence_hash_updates=201`, and `closure_evidence_hash_updates=297`.

## Validator Results

- Passed: `17`
- Failed: `3`
- Validator side effects: `0`
- Non-audit side effects: `[]`

Failed validators:

- `closure-global`: global closure registry hashes are stale.
- `closure-audit`: audit-dir source/impact coverage is structurally complete, but global closure registry validation still fails.
- `git-diff-check-subject-range`: `Plans/ledgers/v2/pldg-20260624-001-provider-updates/source_shards/opencode_coding_plan_config_refresh_20260626.md:168` has a new blank line at EOF in the baseline-to-subject range.

The worktree-only `git diff --check` passed.

## Artifacts

- `audit_scope_manifest.jsonl`
- `audit_report.json`
- `atom_fidelity_matrix.jsonl`
- `planunit_source_claims.jsonl`
- `owner_routing_findings.jsonl`
- `ledger_consistency.json`
- `validator_results.json`
- `semantic_risks.jsonl`
- `closure_reuse.jsonl`
- `repair_impact_matrix.jsonl`

## Next Action

Run a bounded repair. Required surfaces are the active Gemini CLI usage copy, the media response backend schema, sealed ledger projections/validator-state fields, semantic closure registry hash refresh through `pm-audit-closure.py refresh-hashes`, and the subject-range EOF whitespace issue. Then rerun the closed-world semantic audit and validators.
