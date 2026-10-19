# Governance reseal — 2026-10-19

Frozen main: `dfe02ab1e809a3843d7e3a158d2fd7797f280184`. Previous seal: `8552129defaa6cbbf50016438c8c05c6a1f763ba`. Approved plan commit: `d3f1519aebf86f85f4cc2e7fc506c03d78932b2c`. Agent: `codex-reseal`.

Jared assigned this reseal on 2026-10-19. Lead `pm7-purge-lead` authorized Phase 2 in mail `1019075733-82d5` after both capped reviews and F-plans main/follow-up `46256f42bd` / `dfe02ab1e8`. Mail `1019051652-b067` additionally authorizes the bounded DL-188 two-source-pin refresh. The preserved GO and preparation inventory are bound in execution evidence.

This execution refreshes existing Spec Lock hashes, the sole live-current evidence bundle, buildability/node readiness, the two approved receipt source hashes, exactly one auto-decision through `upsert_auto_decision`, and the historical run002 batch hashes and preseal summary. Shared currentness remains unchanged through the first checked main push. Owner prose, registrations, shard bodies/paths, plan graph and historical evidence stay byte-identical.

The receipt helper recomputed both allowed pins. Only the workspace-layout v2 payload pin changed; the registry pin already matched. Every other receipt field and source hash, including historical results and timestamps, equals the fresh backup. The certification harness was not run. The committed checkpoint record binds the actual main, GO, helper, active checkpoint and checkpoint module.

| Check | Before | After |
|---|---:|---:|
| `json_syntax` | 17 | 17 |
| `validate_audit_closure` | 201 | 201 |
| `validate_evidence` | 1730 | 0 |
| `validate_implementation_readiness` | 70 | 23 |
| `validate_plan_graph` | 1730 | 0 |
| `validate_plan_migration` | 79 | 2 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1240 | 1240 |
| `verify_spec_lock` | 20 | 0 |

Standalone readiness retains 23 findings: `{"buildability_gate_report_stale_or_not_canonical": 1, "event_denominator_unresolved": 2, "event_family_contract_depth_unresolved": 2, "event_legacy_fixture_root_mismatch": 1, "implementation_readiness_self_tests_failed": 1, "pnc019_source_hash_stale": 16}`. The retained first buildability generation differs from its read-only canonical probe only at the final node-readiness input hash. Runtime remains disabled. Currentness is `UNKNOWN_OPEN`; `closed`, `complete_denominator_known`, `contract_depth_complete` and `build_or_pnc019_authority` are false. All eight frozen files and the quarantine/group bytes are unchanged.

Currentness inventory: `{"added": ["Plans/touch_closure_action_sources.json"], "counts_after": {"all_sources": 259, "direct_plans_markdown": 96, "registered_machine_inputs": 163}, "counts_before": {"all_sources": 258, "direct_plans_markdown": 96, "registered_machine_inputs": 162}, "removed": []}`. The new Touch closure input contributes zero event-like rows. Seven companions remain an open owner-registration question; this seal registers none: `Plans/appearance_quick_sets.json`, `Plans/appearance_quick_sets.schema.json`, `Plans/editor_appearance.schema.json`, `Plans/glyph_catalog.json`, `Plans/pm7_canon.fixtures.json`, `Plans/pm7_control_bindings.schema.json`, `Plans/wallpaper_catalog.json`.

Aggregate-default run `pds-20260611-002-atomize-planunits` retains exactly `doc_count_mismatch` and `inventory_doc_set_mismatch` (72 versus 96 documents). The separate current pointer run is `pds-20261019-002-current-planunit-snapshot` and validates before the post-push snapshot. Inherited PRD, audit-closure, PM7 GUI, raw-capture and historical certification findings remain reported. Complete before/after outputs, command metadata and SHA-256 references are in `execution-evidence.json`. No runtime, buildability, denominator, contract-depth or certification authority is granted.


## Completed first landing and snapshot recording

The first checked main push was verified at `984f605c0759ee57f5468a36413cb9e96c4bd955` on both push destinations before the shared writer ran. The first verdict has zero blockers and zero infrastructure results; its 6 new rows are expected staleness against the old edition. All 15 old inputs remained baseline-bound through the check and first push. The non-test writer check reported `old_baseline_bound` before the seven-file write.

Installed shared currentness validates. Its 15 hashes stayed stable through standalone readiness, snapshot and both baseline recordings. Readiness retains 23 inherited findings and no currentness drift. All frozen/quarantine/group custody is unchanged; authority flags remain false.

Snapshot `pds-20261019-003-current-planunit-snapshot` supersedes `pds-20261019-002-current-planunit-snapshot` with 96 direct Markdown documents. It was generated before the baseline, in the same provisioned full worktree at the already-pushed main with no local currentness copy. Baseline totals are `{"audit-governance": 1469, "plan-migration-validate": 0, "run-gates": 1486}`. The export bucket count is 14; the reduced export coverage is explained by complete resolved/fully printed rows and verified by a complete recording rerun. No incomplete validator or phantom audit/support-input row is accepted.

Exact first-push, shared validation, writer, installed-manifest, recording, export reconciliation and free-space references are in `execution-evidence.json` under `post_push_followup`. The second landing comparison is preserved externally and bound in the final share completion receipt after this follow-up is committed.
