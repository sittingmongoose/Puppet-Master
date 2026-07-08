# Shard 026: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/FileManager.md`

Source lines: L4485-L4494

Source SHA256: `85d2c7083340ba95430846ebbbd565b9db1263a335a735485b94ceda37c0b85c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 261` (repaired; source line 919; `sfk-dfd13953288650afdc87e4ad`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L500,169: 11.1 promises canonical `cmd.file.*` IDs but zero (`cmd.file.delete/rename/create/move`) are ever defined anywhere in the doc.
- `registry_line 262` (repaired; source line 920; `sfk-727204593d5dec2cd6e647bc`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L235,370: "10.7" (file watcher/LRU eviction) referenced twice; heading doesn't exist (TOC jumps 10.411).
- `registry_line 263` (repaired; source line 921; `sfk-5d6a5537857b5a5be3432001`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [CRITICAL] L4227-4265 (F-067): self-admits 5-8 and 13-14 were/are structurally absent/stub; the "recovery" is only a pointer to consume other docs, not actual content.
- `registry_line 264` (repaired; source line 922; `sfk-def5ee8b66e138410b66ee36`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [HIGH] Peer-claimed 10.10.5-8 (LSP) reference does NOT exist confirmed via grep, 10 only has 10.1-10.4. This peer flag stands as-is.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
