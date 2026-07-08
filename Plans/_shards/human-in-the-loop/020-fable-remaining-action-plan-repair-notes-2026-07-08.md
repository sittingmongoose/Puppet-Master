# Shard 020: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/human-in-the-loop.md`

Source lines: L2558-L2566

Source SHA256: `547b28001f8297b26cbd57823d00c6037b7066f68f51a032662200e08904801c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 295` (explicitly_deferred; source line 1022; `sfk-ea3ced32a2d07a9cb2ebcf07`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] L4-16,37-91: "Provider-native correlation" and "Canonical HITL request contract" headings are either empty or list fields with no types/wire format/enum enumeration.
- `registry_line 296` (repaired; source line 1023; `sfk-e480989a4656856d249b9ed8`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1449/1493: Skip/Cancel Run map to `skip_node`/`abort_run` with no `cmd.*` IPC names, unlike Approve/Decline which do get `cmd.runtime.approve/decline`.
- `registry_line 297` (repaired; source line 1024; `sfk-f32c8b50bd2bc2bc30b350ed`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L296-343: `approval_wait`/`long_governance_wait` have no numeric timeout/expiry-mapping values.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
