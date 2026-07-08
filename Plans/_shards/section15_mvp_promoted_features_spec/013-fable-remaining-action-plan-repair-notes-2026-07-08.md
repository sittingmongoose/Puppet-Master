# Shard 013: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L9215-L9229

Source SHA256: `46df2540088076542f93f48d3f2e59932d097185a55261e4d591f01b270d3443`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 164` (repaired; source line 665; `sfk-756cb4154b9e486d8a6d74db`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L6614-6694 (SMPFS-100): canonical browser action table (action_id/bucket/tier/output fields) is referenced but never actually shown anywhere in range.
- `registry_line 165` (repaired; source line 666; `sfk-0a996093252d3d35aa59e6f2`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L6621-6674: three conflicting timeout constants (5000ms/30000ms/30s) with no disambiguation of which applies to which action.
- `registry_line 166` (repaired; source line 667; `sfk-2fe1c569e11d92dd4dbc7c76`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L6274-6335 (SMPFS-095): tab-cap policy names four outcomes (prompt/block/close/detached) but never states the actual numeric threshold or dialog copy.
- `registry_line 167` (repaired; source line 668; `sfk-7a6ddaeaa377096558537bb1`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L6818-6981 (SMPFS-103/104/105): restore-identity behavior described with no algorithm, ordering, or conflict-resolution rule when two tabs claim the same project_id.
- `registry_line 168` (repaired; source line 669; `sfk-72b2ee82fedf09de17854db0`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L672-673: browser runtime (CEF via wef/cargo-wef) remains conditional with no packaging/install strategy defined.
- `registry_line 169` (repaired; source line 670; `sfk-d8a758adf1c768de6e1410a9`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L3452-3512 (SMPFS-048): streaming usage payload fields named with no JSON schema or event name.
- `registry_line 170` (repaired; source line 671; `sfk-ed92df2325332306b2463b50`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5866-5994,6070-6137: `cmd.browser.share_with_agent`, `browser_run_code`, `browser_evaluate` referenced as exact command tokens but not found anywhere in Tools.md via grep.
- `registry_line 171` (repaired; source line 672; `sfk-47f354a1222d2abb62b4a9a9`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L6139-6335 (SMPFS-093/094/095): DevTools boundary, artifact manifest, and session persistence all described in prose with zero concrete schema (no manifest fields, no retention numbers, no naming template).
- `registry_line 172` (repaired; source line 673; `sfk-821a87baaf08f064a2b71c15`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L188: pane layout family transform algorithm ("nearest valid family") has no geometry spec or transform table.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
