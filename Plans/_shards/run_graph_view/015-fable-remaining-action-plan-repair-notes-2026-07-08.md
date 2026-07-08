# Shard 015: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Run_Graph_View.md`

Source lines: L1070-L1077

Source SHA256: `425251624cd5f16edfc3482ac684337870bb6eea6a690b13da3b544a9ab4b2b9`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 311` (repaired; source line 1067; `sfk-e5a01d02406de64b890b00e4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] Node Graph/DAG view: named as one of seven tabs but no node-detail-panel content, click/select wiring, or command IDs in this doc (deferred to Run_Graph_View.md, which per BUNDLE-8 also does NOT close this gap).
- `registry_line 365` (explicitly_deferred; source line 1227; `sfk-e9a741e787bc73207fc9b89a`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: core DAG interactions (pan, zoom, drag, minimap click, right-click, keyboard nav, multi-select) are narrative "should" statements only zero command IDs or enabled/disabled logic anywhere; confirms Orchestrator_Page.md does not close this gap either (chec

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
