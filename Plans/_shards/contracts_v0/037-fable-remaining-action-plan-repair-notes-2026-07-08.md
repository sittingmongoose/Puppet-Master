# Shard 037: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Contracts_V0.md`

Source lines: L20005-L20015

Source SHA256: `7de676af614e3f50fee6043fb352d24c95fce1b794da5f4e7a51fb6b44f11503`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 103` (repaired; source line 508; `sfk-7ec50090ea0b8781484ed25b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1608-1631: 5's four promised mechanisms (instruction scoping, attempt journaling, parent summary, AGENTS.md enforcement) are not specified; InvestigationContextAttachment is one sentence with zero fields FIX: specify fields/mechanics or point explicitly to the true o
- `registry_line 106` (repaired; source line 511; `sfk-987077b2d8d09e719846688d`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L13399-14402 (CV-216 vs CV-237): `scheduler.pass`'s non-selected-nodes array is named `non_selected_nodes[]` in one unit and `non_selected[]` in another FIX: pin one name.
- `registry_line 108` (repaired; source line 513; `sfk-9e981aa42224e876d0371772`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L12826-12883 (CV-205/206): usage/cost "adjustment or clamp events" are required by contract but have no event name, payload fields, or persistence shape given anywhere FIX: define e.g. `usage.cost_adjusted{delta_microdollars, reason_code, source_ref, ts}`.
- `registry_line 109` (repaired; source line 514; `sfk-80c0f018eaeeef152d592c97`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L14467-14751 (CV-239,244): "effective permission snapshot identifier" and "requested/effective model snapshot" appear in persisted payloads (attempt.started, tool.denied) with no pinned field name, directly violating the doc's own CV-195 rule requiring pinned names for p
- `registry_line 111` (repaired; source line 516; `sfk-ca66bb490466433a5eb1986b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L17064-17109 (CV-282/283): the mandated runtime-continuity contract (schema, event family, storage keys) and the shared route-object model are both required but nowhere defined CV-282's own preserved token admits "no schema, no event family, no storage keys" FIX: reg

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
