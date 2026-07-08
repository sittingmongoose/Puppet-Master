# Shard 022: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L5978-L5986

Source SHA256: `a3d69979cdde387e0015474600dc77158482aaf61bc24982ee811be902a708d8`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 239` (repaired; source line 860; `sfk-7b9d615ae9afdde05c7a903e`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1885 vs L196: CRAU-017 reason-code enum (`container_unreachable, port_unbound, auth_expired...`) doesn't match the canonical L196 list (`runtime_context_missing, compose_invalid...`) reconcile into one enum.
- `registry_line 240` (explicitly_deferred; source line 861; `sfk-cf0cd10a899404f5be291961`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L4319-4373: 9-state template-repo enum is "normative" but no transition table is inline; CRAU-070 UI labels ("dirty/committed/ready-to-push") don't map onto the canonical enum values add mapping.
- `registry_line 241` (repaired; source line 862; `sfk-30416f5cbd6db8016051db19`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L142-236: dense Docker Manager cockpit contracts define dozens of controls with no enabled/disabled trigger conditions or exact labels (systemic across L142-244).

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
