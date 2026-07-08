# Shard 010: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Widget_System.md`

Source lines: L1030-L1039

Source SHA256: `a4643bdeaaee90bee9f376e50446d3b0d6d518b2d14056049905f0e557a23c58`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 242` (repaired; source line 868; `sfk-243d9819162bc839409ce15b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L788-864: cites `Widget_System.md` 2/3/4/7 but that file's real headings are 1-4 only renumber cross-refs.
- `registry_line 370` (repaired; source line 1241; `sfk-27612d81432b8c866dbb6e76`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] confirmed via grep: `widget-custom-metrics` does not appear anywhere in this file, despite the doc claiming to be the cross-cutting hostability owner for Dashboard/Usage widgets where such a widget would need classification.
- `registry_line 371` (repaired; source line 1242; `sfk-7d2d295617efe72e4e966b52`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L100-116: internal section numbering (1/2/3/4) doesn't match external "7" cross-references from other docs (e.g. usage-feature.md) this file has no 7 at all.
- `registry_line 372` (repaired; source line 1243; `sfk-cdbe4e263b71df9ea3cb1655`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L102-115: the "full 13-widget Progress catalog" names 13 IDs but never instantiates a full example widget-shell JSON payload for any of them, despite claiming a typed data contract exists.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
