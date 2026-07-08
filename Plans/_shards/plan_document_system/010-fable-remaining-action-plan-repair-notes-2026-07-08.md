# Shard 010: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Plan_Document_System.md`

Source lines: L1186-L1194

Source SHA256: `f6da11d13d7f763fd41236e49a03a271c180073bd1b84298263ac458d4642e7c`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 19` (repaired; source line None; `sfk-7fa2fb61bfa5e1303b9781fd`): PlanUnit quality boundary repaired: behavioral acceptance is required for P0, implementation-readiness, GUI/runtime/user-visible, security, persistence, provider, and build-order-critical PlanUnits; preservation-only acceptance is allowed only for legacy/source-lineage coverage and cannot count as buildability proof; empty unblocks is valid when no downstream dependency is known. Source summary: FABLE P1 #13: replace boilerplate acceptance criteria with behavioral ACs for gui_related/P0 units, populate depends_on/unblocks, execute split_recommended cleanup, and repair corrupted tokens.
- `registry_line 357` (repaired; source line 1197; `sfk-81012510e15c7194687bb33c`): Plan index runtime consumption repaired: Plans/.plan_index/* is authoring/governance/readiness input, not raw shipped runtime authority; shipped Rust/Slint may consume packaged/imported metadata only through an explicit product contract. Source summary: - [HIGH] whole doc: never states whether `Plans/.plan_index/*` artifacts are consumed by the shipped Rust/Slint app at runtime, or are purely authoring-time tooling discarded before build the single biggest ambiguity in this bundle.
- `registry_line 358` (repaired; source line 1198; `sfk-d062076ff34ca358d84be28b`): GUI model routing setting repaired: default is gui_related_model_routing.enabled=false with gui_model_id unset; Settings > Models/Agent Config owns the visible control. Source summary: - [HIGH] L299-337 (PDS-007): the one unambiguously runtime-facing setting ("use different model for GUI elements?") has no UI location, default, or model list hedges with "such as."

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
