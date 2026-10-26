# Shard 055: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31621-L31630

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 59` (repaired; source line 400; `sfk-bc9d5c8eee9325198b2b1907`): Post-handoff retry exhaustion canon repaired: after retry exhaustion the user-facing path surfaces Retry, Skip, and View raw output; auto-continue with partial output is valid only after explicit Skip/operator acceptance. Source summary: - [HIGH] L15508-15510 vs L11764,11779,15629-15630 (OSI-093/094/156/157): post-handoff-retry-exhaustion outcome is simultaneously "auto-continue with partial output" and "surface error with Retry/Skip/View-raw," with the compat note acknowledging but not resolving which path the c
- `registry_line 63` (repaired; source line 404; `sfk-0e84474c4e3a4fccf457ffb3`): Stale-agent expiry repaired: no runtime failure is inferred before waiting_until or the governing timer expires; absent explicit timer means no expiry; debug mirror staleness is not runtime failure evidence. Source summary: - [HIGH] L17047-17098 (OSI-179): the old 2h-inactivity stale-agent heuristic is demoted to lineage but the "canonical status and expiry logic" replacing it is never defined anywhere in Plans FIX: cite the owner section and specify thresholds/state machine.
- `registry_line 66` (repaired; source line 407; `sfk-0354c60633edc8eb68aa0bb8`): Architecture confirmation repaired: require_architecture_confirmation is a phase gate before leaving architecture or tech-stack phases and completes only after explicit user or accepted agent confirmation. Source summary: - [HIGH] L12052: architecture-confirmation mechanism is left as three undecided alternatives ("phase gate, dedicated phase, or prompt line") FIX: choose one and specify trigger/completion condition.
- `registry_line 67` (repaired; source line 408; `sfk-b1341ed138dc2692d0b50560`): Fail-open lock timeout repaired: lock timeout/mirror failure is fail-closed coordination_conflict; stale lock cleanup snippets are source-lineage examples, not scheduling authority. Source summary: - [HIGH] L25343-25357 (OSI-323): fail-open 5s lock-timeout policy explicitly parked as "requires owner adjudication" with no adjudicating doc named FIX: name the owner anchor and record the decision.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
