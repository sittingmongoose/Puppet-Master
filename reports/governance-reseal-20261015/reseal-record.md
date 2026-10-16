# Governance reseal Phase 2

Frozen main: `3d37380471304a2b8c328256b89e748d0de86536`. Previous seal: `f2f61a803a92b76878e94c23cf9c04668390f27f`. Approved plan: `7e0f9077b3`. Agent: `pm7-reseal-p2`.

Coordinator GO: `1016205704-8710`. Shared currentness remains unchanged until the first checked main push under the landing lock.

The scope is existing Spec Lock hashes, the sole live evidence bundle, buildability/node readiness, exactly one auto-decision row through `upsert_auto_decision`, the run002 refresh pair in preseal state, and externally generated currentness. Historical evidence, all shard bodies/paths, canonical owner prose, the PNC-019 receipt, registry/schema registrations and frozen custody remain unchanged.

The frozen base includes MA-073 warn-hold, Plans pass 2 through `5b43e73891`, the final PM7 Plans top-up `4c5b905030`, and its snapshot/baseline follow-up `3d37380471`. The GO correction `1016205708-9607` confirms aggregate-default run002. The 16 final top-up paths were re-inventoried:

- `Plans/00-plans-index.md`
- `Plans/Automated_Testing_System.md`
- `Plans/DRY_Rules.md`
- `Plans/Decision_Log.md`
- `Plans/FinalGUISpec.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/Settings_System.md`
- `Plans/Test_Capture_and_Motion_Evidence.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/appearance_quick_sets.json`
- `Plans/assistant-chat-design.md`
- `Plans/pm7_canon.fixtures.json`
- `Plans/pm7_control_bindings.json`
- `Plans/settings_inventory.json`
- `Plans/terminal_appearance_presets.schema.json`


| Check | Before | After |
|---|---:|---:|
| `json_syntax` | 17 | 17 |
| `validate_audit_closure` | 201 | 201 |
| `validate_evidence` | 1470 | 0 |
| `validate_implementation_readiness` | 52 | 23 |
| `validate_plan_graph` | 1470 | 0 |
| `validate_plan_migration` | 60 | 2 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1240 | 1240 |
| `verify_spec_lock` | 17 | 0 |

Final standalone readiness has 23 inherited findings: `{"buildability_gate_report_stale_or_not_canonical": 1, "event_denominator_unresolved": 2, "event_family_contract_depth_unresolved": 2, "event_legacy_fixture_root_mismatch": 1, "implementation_readiness_self_tests_failed": 1, "pnc019_source_hash_stale": 16}`. No currentness source/registry/artifact drift remains. The first buildability generation stays pinned; its node-readiness input remains one generation behind, as the approved plan requires. No runtime, denominator, contract-depth, certification or buildability authority is granted.

Currentness remains `UNKNOWN_OPEN`, with all four authority flags false. Eight frozen files and the quarantine ledger/group manifest are byte-identical. Both DL-188 pins match and the certification receipt is unchanged.

Of the seven companion files named by Phase 1, 7 remain unsealed and an open owner question; this reseal adds no registration:

- `Plans/appearance_quick_sets.json`
- `Plans/appearance_quick_sets.schema.json`
- `Plans/editor_appearance.schema.json`
- `Plans/glyph_catalog.json`
- `Plans/pm7_canon.fixtures.json`
- `Plans/pm7_control_bindings.schema.json`
- `Plans/wallpaper_catalog.json`

Current pointer run: `pds-20261016-002-current-planunit-snapshot`. It is distinct from aggregate-default run002. Historical run002 retains only its two structural findings after the refresh pair; no postseal claim is made.

Exact commands, durations, outputs and hashes are in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261016/phase2/commands.jsonl`; the executable command helpers are in `/mnt/Cursor/share/puppet-master/2026-10-16-reseal-phase2`. Attestation history ends at frozen main. First landing and follow-up results will be appended separately.

Final currentness inventory delta: `{"added": ["Plans/pm7_control_bindings.json", "Plans/terminal_appearance_presets.schema.json", "Plans/terminal_background_catalog.json"], "counts_after": {"all_sources": 258, "direct_plans_markdown": 96, "registered_machine_inputs": 162}, "counts_before": {"all_sources": 255, "direct_plans_markdown": 96, "registered_machine_inputs": 159}, "removed": []}`.
