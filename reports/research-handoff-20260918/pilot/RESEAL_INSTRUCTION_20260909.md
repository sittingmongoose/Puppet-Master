# Governance reseal instruction (authorized by Jared, 2026-09-09)

For the Plans agent. Jared has authorized a full governance reseal of `Plans/` after the September 8 and 9 landings: DL-035 through DL-038, the terminal research repairs, and about forty new PlanUnits across eleven owner documents. This is the verified procedure that converges in one pass. Order matters; each step is there because skipping it caused a rework wave before.

## Model and mindset

This is a mechanical procedure. A medium-effort model is sufficient. The only judgment call is step 7, and the tolerated failures are enumerated there. Every other surprise is handled the same way: stop, report the exact error, change nothing. Do not improvise repairs.

## Before you start

- The research agent must not be mid-landing. Check `git status` shows no uncommitted `Plans/*.md` changes that are not yours. If there are, stop and ask.
- Do not touch canonical prose. This is a mechanical reseal, not an edit pass.
- Do not prune, restore, or sweep anything under `Concepts/` or elsewhere. The seal commit touches only governance artifacts.
- Expect slow git while the planning-pipeline campaign runs. Run this when that track is idle.

## Procedure

1. **Shards.** `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `--check`. Must pass.

2. **Plan index.** `python3 scripts/pm-plan-index.py generate`, then `validate`. Must pass with zero errors. Unit count is about 6,430.

3. **Migration refresh, before any evidence work.** For the current run directory named in `Plans/.plan_migration/current_run.json`: `python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir <dir>`, then `refresh-final-summary --run-dir <dir>`, then `validate --run-dir <dir>`. Evidence bundles pin the migration summary, so refreshing migration after the evidence waves re-stales them.

4. **New evidence bundle and decision row.** Create `Plans/.evidence/governance-reseal-2026-09-09/evidence.json` by copying the shapes from an existing bundle exactly. The schema is strict: `node` is an object, `events` is an object with `event_refs`, `commands_run`, `files_changed` and `tool_calls` are lists of objects, check results are only PASS or FAIL, and `reproducibility.snapshot_ref` is `git:<current sha>`. Append one row to `Plans/auto_decisions.jsonl` describing the reseal scope: DL-035 to DL-038, terminal research repairs, and the new PlanUnits.

5. **Seal once with Spec Lock.** `python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json --evidence Plans/.evidence/governance-reseal-2026-09-09/evidence.json`. This is the only call that passes `--spec-lock`. Passing it again later rewrites Spec Lock and re-stales every other bundle.

6. **Transitive evidence waves, without Spec Lock.** Loop over every stale bundle with `python3 scripts/pm-governance-seal.py refresh --evidence <bundle>/evidence.json` until both `python3 scripts/pm-plans-verify.py validate-evidence` and `validate-plan-graph` pass. Drive the loop from a Python script, not a shell loop. Typical convergence is two or three waves across about twenty bundles. If any document's headings changed and the plan-sharding bundle reports a missing reference, run `pm-governance-seal.py sync-plan-sharding-evidence --evidence Plans/.evidence/plan-sharding-2026-06-09/evidence.json --report <shard report>`.

7. **Gates.** `python3 scripts/pm-plans-verify.py run-gates > gates.log 2>&1`. It takes several minutes and prints progress lines before the JSON, so parse the `done <gate> status=` lines rather than piping to a JSON parser. The healthy baseline is 24 of 26 passing. The two tolerated baseline failures are `validate_implementation_readiness` (stale PNC-019 receipts and the open event-authority items) and `validate_audit_closure`. Anything else failing is reported by name with its exact error text. Do not edit canonical `Plans/*.md` text, skip a gate, pass `--spec-lock` a second time, or use `--no-verify` to make a gate pass. Stop and report instead.

8. **Commit and push, one commit.** It should touch only `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, `Plans/.evidence/**`, `Plans/.plan_migration/**` reports, `Plans/_shards/**` and `Plans/.plan_index/**`. Message: `Reseal governance after DL-035..038 and the terminal research landings`. Push immediately.

## Known problems that are not reseal work

- **Five current fixtures report as unreadable** to the gate runner: `shared_integration_runtime_expansion_fixtures.json`, `protected_auth_browser_contract_fixtures.json`, `remote_access_system_contract_fixtures.json`, `shared_runtime_command_contract_fixtures.json`, `shared_integration_runtime_fixtures.json`, all under `Plans/`. They are owned by uid 3000, mode rw-rw-rw-, and the reviewer's account (uid 1000) reads them without error, so the denial is specific to the uid the gate runner ran under on the NFS mount. Run the gates as an account that can read them, or fix the mapping from the owning account. Do not skip the gate.
- **`json_syntax` times out at 180 seconds** under load. Rerun it alone when the host is quiet before calling it a failure.
- **`validate_pm7_gui_fixtures` raised a traceback** in the last run. That is a validator bug to report, not a Plans defect.
- **`Plans/.audits/event-authority-2026-08-13-currentness/adjudication/**`** contains files that git cannot stat from this account and spams every git command with permission errors. Cosmetic for the reseal, but fix it from the owning account when convenient.

## Report

Three lines: gate pass count out of 26 with the names of any failures beyond the two tolerated ones, the commit hash, and whether the five fixtures were readable. Then tell Jared the research agent may land again.

A second, smaller reseal will be needed after the research agent lands DL-039 and its PlanUnits. Same procedure; one new bundle; the waves converge faster.

## Afterwards, optional

Everything above except the bundle text is deterministic. A follow-up task worth doing at any model tier: fold steps 1 to 7 into one `scripts/pm-reseal.py` that takes a bundle name and a scope sentence, so the next reseal is one command and model choice stops mattering.
