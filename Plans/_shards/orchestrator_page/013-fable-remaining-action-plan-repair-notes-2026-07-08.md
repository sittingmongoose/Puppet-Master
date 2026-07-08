# Shard 013: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2318-L2328

Source SHA256: `e156cff93ba6d74387fda5646dcdf3e350a82393ef1a456fb8533454318316c9`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 309` (repaired; source line 1065; `sfk-50555feddb3c4bf05d318788`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L1497/1577/1670 (OP-020): fixes "seven canonical tabs" but its own preserved_exact_tokens includes stray "six-tab behavior" string with no reconciling compatibility-alias note (unlike other tier-label aliases elsewhere in the same doc).
- `registry_line 310` (repaired; source line 1066; `sfk-4ac2b9911ffce6c6ae062b08`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] safe-point retry UI: "safe points" appears only as a token; no retry button, command ID, or confirmation flow anywhere in range an implementer has zero mechanism.
- `registry_line 311` (repaired; source line 1067; `sfk-e5a01d02406de64b890b00e4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] Node Graph/DAG view: named as one of seven tabs but no node-detail-panel content, click/select wiring, or command IDs in this doc (deferred to Run_Graph_View.md, which per BUNDLE-8 also does NOT close this gap).
- `registry_line 312` (repaired; source line 1068; `sfk-20d70c6eed1de1a86055e838`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L46-56: Plan Compile launch repair paragraph has no timeout/expiry rule if `PlanApproved` publication never arrives.
- `registry_line 365` (explicitly_deferred; source line 1227; `sfk-e9a741e787bc73207fc9b89a`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: core DAG interactions (pan, zoom, drag, minimap click, right-click, keyboard nav, multi-select) are narrative "should" statements only zero command IDs or enabled/disabled logic anywhere; confirms Orchestrator_Page.md does not close this gap either (chec

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
