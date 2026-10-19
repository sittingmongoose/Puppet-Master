# Governance reseal — 2026-10-19

Frozen main: `e79239d3107f89b591c84755320eae28f4e1c2dc`. Previous seal: `984f605c0759ee57f5468a36413cb9e96c4bd955`. Approved plan commit: `0758b870c62725420a98a7b7870f3048df95613c`. Agent: `codex-reseal2`.

Jared assigned this reseal on 2026-10-19. Lead `pm7-purge-lead` authorized Phase 2 in mail `1019203718-54f1` after both capped cycle-2 reviews and G-register main/follow-up `5ce8b1b0f9` / `f4d1daa2f7`. The three Opus r2 LOWs are applied as the lead-directed GO amendment. Mail `1019051652-b067` additionally authorizes the bounded DL-188 two-source-pin refresh. The preserved GO and preparation inventory are bound in execution evidence.

This execution refreshes existing Spec Lock hashes, the sole live-current evidence bundle, buildability/node readiness, the two approved receipt source hashes, exactly one auto-decision through `upsert_auto_decision`, and the historical run002 batch hashes and preseal summary. Shared currentness remains unchanged through the first checked main push. Exactly seven new Spec Lock registrations bind the unchanged companion bodies. Owner prose, shard bodies/paths, plan graph and historical evidence stay byte-identical.

The receipt helper recomputed both allowed pins. Both pins already matched; the receipt is byte-identical to the fresh backup. Every other receipt field and source hash, including historical results and timestamps, equals the fresh backup. The certification harness was not run. The committed checkpoint record binds the actual main, GO, helper, active checkpoint and checkpoint module.

| Check | Before | After |
|---|---:|---:|
| `json_syntax` | 17 | 17 |
| `validate_audit_closure` | 201 | 201 |
| `validate_evidence` | 34 | 0 |
| `validate_implementation_readiness` | 24 | 23 |
| `validate_plan_graph` | 34 | 0 |
| `validate_plan_migration` | 4 | 2 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1240 | 1240 |
| `verify_spec_lock` | 1 | 0 |

Standalone readiness retains 23 findings: `{"buildability_gate_report_stale_or_not_canonical": 1, "event_denominator_unresolved": 2, "event_family_contract_depth_unresolved": 2, "event_legacy_fixture_root_mismatch": 1, "implementation_readiness_self_tests_failed": 1, "pnc019_source_hash_stale": 16}`. The retained first buildability generation differs from its read-only canonical probe only at the final node-readiness input hash. Runtime remains disabled. Currentness is `UNKNOWN_OPEN`; `closed`, `complete_denominator_known`, `contract_depth_complete` and `build_or_pnc019_authority` are false. All eight frozen files and the quarantine/group bytes are unchanged.

Currentness inventory: `{"added": ["Plans/appearance_quick_sets.json", "Plans/appearance_quick_sets.schema.json", "Plans/editor_appearance.schema.json", "Plans/glyph_catalog.json", "Plans/pm7_canon.fixtures.json", "Plans/pm7_control_bindings.schema.json", "Plans/wallpaper_catalog.json"], "counts_after": {"all_sources": 266, "direct_plans_markdown": 96, "registered_machine_inputs": 170}, "counts_before": {"all_sources": 259, "direct_plans_markdown": 96, "registered_machine_inputs": 163}, "removed": []}`. Each of the seven newly inventoried companions contributes zero event-like rows. All seven are bound in installed currentness and native Spec Lock (94 to 101), deliberately not live evidence: sync-plan-sharding-evidence reconstructs its configured shard inputs and would silently erase external additions. Registered companions: `Plans/appearance_quick_sets.json`, `Plans/appearance_quick_sets.schema.json`, `Plans/editor_appearance.schema.json`, `Plans/glyph_catalog.json`, `Plans/pm7_canon.fixtures.json`, `Plans/pm7_control_bindings.schema.json`, `Plans/wallpaper_catalog.json`.

Aggregate-default run `pds-20260611-002-atomize-planunits` retains exactly `doc_count_mismatch` and `inventory_doc_set_mismatch` (72 versus 96 documents). The separate current pointer run is `pds-20261019-004-current-planunit-snapshot` and validates before the post-push snapshot. Inherited PRD, audit-closure, PM7 GUI, raw-capture and historical certification findings remain reported. Complete before/after outputs, command metadata and SHA-256 references are in `execution-evidence.json`. No runtime, buildability, denominator, contract-depth or certification authority is granted.
