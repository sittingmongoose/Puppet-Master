# Shard 023: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/LSPSupport.md`

Source lines: L7042-L7051

Source SHA256: `8f543f72b66af1c049a4d514a8d102b647667d9dd4634ec2005afc35987f5b3f`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 209` (repaired; source line 766; `sfk-5db5df835f867a5d96bf0b74`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L109-144,1411-1468: 3.2 table lists rust-analyzer as self-managed/PM-detects-on-PATH, but 3.2 prose later calls it part of the "PM-managed/default first-class set" contradicts whether PM auto-installs it FIX: state one behavior explicitly.
- `registry_line 210` (repaired; source line 767; `sfk-c158d84b7bc8d4d4bcaf2d96`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L107-144: server catalog table has no `default_enabled`/`support_classification`/install-behavior columns populated for any of the 30+ rows, though those fields exist abstractly elsewhere (14.9).
- `registry_line 211` (repaired; source line 768; `sfk-5e96353b2b86e879e26f845a`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L920-923: gate `scope: "project"` offers two different bounding strategies (under project root vs. only open-document files) with no decision on which applies.
- `registry_line 212` (repaired; source line 769; `sfk-8290829cf3f3df11f6f5e87f`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5172-5173 (LSPS-075): Phase 1 prerequisite still lists two candidate crates ("lsp-client"/"async_lsp_client") with no canonical decision blocks Phase 1 start without a spike.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
